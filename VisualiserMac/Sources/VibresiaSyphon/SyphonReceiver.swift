import AppKit
import OpenGL.GL3
import SyphonGL

/// Receives another app's picture over Syphon and draws it into whatever the app is drawing into.
///
/// Syphon holds a picture bottom row first, which is the order OpenGL reads a texture in, so the picture is drawn as it is and comes out
/// upright. It is drawn as large as it fits in the current viewport with its proportions kept; what the viewport leaves is untouched.
///
/// Everything here must be called with `context` current. The receiver leaves OpenGL's state as it found it.
public final class SyphonReceiver {
    private static let rectangleTexture = GLenum(0x84F5) // GL_TEXTURE_RECTANGLE, what Syphon's images are
    private static let vertexSource = """
    #version 330 core
    out vec2 position;
    void main() {
        vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
        position = corner;
        gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
    }
    """
    private static let fragmentSource = """
    #version 330 core
    uniform sampler2DRect source;
    uniform vec2 sourceSize;
    in vec2 position;
    out vec4 colour;
    void main() {
        colour = vec4(texture(source, position * sourceSize).rgb, 1.0);
    }
    """

    private let context: CGLContextObj
    private var client: SyphonOpenGLClient?
    private var image: SyphonOpenGLImage?
    private var program: GLuint = 0
    private var vertexArray: GLuint = 0

    public init(context: CGLContextObj) {
        self.context = context
    }

    deinit { stop() }

    /// Whether a source is chosen (not whether it is sending).
    public var isConnected: Bool { client != nil }

    /// Receives from the server `description` names (from `SyphonSources`), or from none when it is nil.
    public func connect(to description: [String: Any]?) {
        client?.stop()
        image = nil
        client = description.map { SyphonOpenGLClient(serverDescription: $0, context: context, options: nil, newFrameHandler: nil) }
    }

    /// Draws the newest frame into the bound framebuffer, inside its current viewport. Returns false, drawing nothing, when there is no source
    /// or it has sent nothing yet.
    @discardableResult
    public func drawNewestFrame() -> Bool {
        guard let client else { return false }
        if image == nil || client.hasNewFrame { image = client.newFrameImage() ?? image }
        guard let image, image.textureSize.width > 0, image.textureSize.height > 0, makeProgramIfNeeded() else { return false }

        var viewport = [GLint](repeating: 0, count: 4)
        glGetIntegerv(GLenum(GL_VIEWPORT), &viewport)
        let scale = min(Double(viewport[2]) / Double(image.textureSize.width), Double(viewport[3]) / Double(image.textureSize.height))
        let width = GLsizei((Double(image.textureSize.width) * scale).rounded()), height = GLsizei((Double(image.textureSize.height) * scale).rounded())

        var previousProgram: GLint = 0, previousVertexArray: GLint = 0, previousUnit: GLint = 0, previousTexture: GLint = 0
        var blending = glIsEnabled(GLenum(GL_BLEND)) != 0
        glGetIntegerv(GLenum(GL_CURRENT_PROGRAM), &previousProgram)
        glGetIntegerv(GLenum(GL_VERTEX_ARRAY_BINDING), &previousVertexArray)
        glGetIntegerv(GLenum(GL_ACTIVE_TEXTURE), &previousUnit)
        glActiveTexture(GLenum(GL_TEXTURE0))
        glGetIntegerv(GLenum(0x84F6), &previousTexture) // GL_TEXTURE_BINDING_RECTANGLE

        glViewport(viewport[0] + (viewport[2] - width) / 2, viewport[1] + (viewport[3] - height) / 2, width, height)
        glDisable(GLenum(GL_BLEND))
        glUseProgram(program)
        glUniform1i(glGetUniformLocation(program, "source"), 0)
        glUniform2f(glGetUniformLocation(program, "sourceSize"), GLfloat(image.textureSize.width), GLfloat(image.textureSize.height))
        glBindTexture(Self.rectangleTexture, image.textureName)
        glBindVertexArray(vertexArray)
        glDrawArrays(GLenum(GL_TRIANGLES), 0, 3)

        glBindTexture(Self.rectangleTexture, GLuint(previousTexture))
        glActiveTexture(GLenum(previousUnit))
        glBindVertexArray(GLuint(previousVertexArray))
        glUseProgram(GLuint(previousProgram))
        if blending { glEnable(GLenum(GL_BLEND)) }
        blending = false
        glViewport(viewport[0], viewport[1], viewport[2], viewport[3])
        return true
    }

    /// Stops receiving and frees what the receiver made. Safe to call more than once.
    public func stop() {
        client?.stop()
        client = nil
        image = nil
        if program != 0 || vertexArray != 0 {
            let previous = CGLGetCurrentContext()
            CGLSetCurrentContext(context)
            if program != 0 { glDeleteProgram(program) }
            if vertexArray != 0 { glDeleteVertexArrays(1, &vertexArray) }
            program = 0
            vertexArray = 0
            CGLSetCurrentContext(previous)
        }
    }

    // MARK: - The program

    private func makeProgramIfNeeded() -> Bool {
        if program != 0 { return true }
        guard let vertex = compile(GLenum(GL_VERTEX_SHADER), Self.vertexSource),
              let fragment = compile(GLenum(GL_FRAGMENT_SHADER), Self.fragmentSource) else { return false }
        let linked = glCreateProgram()
        glAttachShader(linked, vertex)
        glAttachShader(linked, fragment)
        glLinkProgram(linked)
        glDeleteShader(vertex)
        glDeleteShader(fragment)
        var status: GLint = 0
        glGetProgramiv(linked, GLenum(GL_LINK_STATUS), &status)
        guard status == GL_TRUE else {
            glDeleteProgram(linked)
            return false
        }
        program = linked
        glGenVertexArrays(1, &vertexArray) // core profile draws need a vertex array, even with no vertex data
        return true
    }

    private func compile(_ kind: GLenum, _ source: String) -> GLuint? {
        let shader = glCreateShader(kind)
        source.withCString { text in
            var pointer: UnsafePointer<GLchar>? = text
            glShaderSource(shader, 1, &pointer, nil)
        }
        glCompileShader(shader)
        var status: GLint = 0
        glGetShaderiv(shader, GLenum(GL_COMPILE_STATUS), &status)
        if status == GL_TRUE { return shader }
        glDeleteShader(shader)
        return nil
    }
}

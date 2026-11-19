import AppKit
import OpenGL.GL3
import SyphonGL

/// Publishes the picture Vibresia draws as a Syphon server, so other apps (VJ software, OBS, a compositor) can use it live.
///
/// Syphon gives the caller a framebuffer to draw into and takes the result when the caller is done. That keeps the publisher out of the
/// renderer's own targets: the renderer draws the finished frame once more into Syphon's, and only when someone is listening.
///
/// Syphon's surface holds the picture bottom row first, which is how OpenGL draws it, so nothing is flipped here.
public final class SyphonPublisher {
    private let server: SyphonOpenGLServer

    /// A server named `name` that draws in `context`.
    public init(name: String, context: CGLContextObj) {
        server = SyphonOpenGLServer(name: name, context: context, options: nil)
    }

    deinit { server.stop() }

    /// Whether any app is currently receiving. A frame nobody receives need not be drawn at all.
    public var hasClients: Bool { server.hasClients }

    /// What a Syphon client needs to connect to this server.
    public var serverDescription: [String: Any] { server.serverDescription }

    /// Draws one frame of `width` by `height` into Syphon's target with `draw`, then publishes it. `draw` runs in the server's context with
    /// the target bound; it sets the viewport itself. Returns false, without calling `draw`, if Syphon could not provide a target.
    @discardableResult
    public func publish(width: Int, height: Int, draw: () -> Void) -> Bool {
        guard width > 0, height > 0, server.bind(toDrawFrameOf: NSSize(width: width, height: height)) else { return false }
        draw()
        server.unbindAndPublish()
        return true
    }

    /// Takes the server down. Safe to call more than once.
    public func stop() {
        server.stop()
    }
}

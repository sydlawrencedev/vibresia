import AppKit
import Metal
import OpenGL.GL3
import Syphon
import SyphonGL
import Testing
@testable import VibresiaSyphon

/// The Syphon receiver: another app's picture is drawn into the app's own target, the right way up.
///
/// A Syphon surface holds the picture bottom row first (the order OpenGL draws in), so a receiver that draws it as it is shows it upright.
/// The sender here is a Metal server, as Quartzing is: it publishes a Metal texture (top row first) with `flipped: true`, which is how a
/// Metal app makes the surface OpenGL apps expect.
@Suite(.serialized, .enabled(if: openGLContextIsAvailable, "needs an accelerated OpenGL context, which a CI virtual machine does not have"))
struct SyphonReceiverTests {
    private let width = 32, height = 16

    private func glContext() throws -> NSOpenGLContext {
        let attributes: [NSOpenGLPixelFormatAttribute] = [
            NSOpenGLPixelFormatAttribute(NSOpenGLPFAOpenGLProfile), NSOpenGLPixelFormatAttribute(NSOpenGLProfileVersion3_2Core),
            NSOpenGLPixelFormatAttribute(NSOpenGLPFAColorSize), 24,
            NSOpenGLPixelFormatAttribute(NSOpenGLPFAAlphaSize), 8,
            NSOpenGLPixelFormatAttribute(NSOpenGLPFAAccelerated), 0,
        ]
        let format = try #require(NSOpenGLPixelFormat(attributes: attributes))
        let context = try #require(NSOpenGLContext(format: format, share: nil))
        context.makeCurrentContext()
        return context
    }

    /// A Metal texture holding a picture red above and blue below, top row first (bytes B, G, R, A).
    private func metalPicture(_ device: MTLDevice) throws -> MTLTexture {
        let descriptor = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: .bgra8Unorm, width: width, height: height, mipmapped: false)
        descriptor.usage = [.shaderRead, .shaderWrite]
        let texture = try #require(device.makeTexture(descriptor: descriptor))
        var bytes = [UInt8](repeating: 255, count: width * height * 4)
        for row in 0 ..< height {
            for column in 0 ..< width {
                let at = (row * width + column) * 4
                let red = row < height / 2
                bytes[at] = red ? 0 : 255 // B
                bytes[at + 1] = 0 // G
                bytes[at + 2] = red ? 255 : 0 // R
            }
        }
        texture.replace(region: MTLRegionMake2D(0, 0, width, height), mipmapLevel: 0, withBytes: bytes, bytesPerRow: width * 4)
        return texture
    }

    /// An empty off-screen target the receiver can draw into, bound for drawing.
    private func makeTarget() -> (framebuffer: GLuint, texture: GLuint) {
        var texture: GLuint = 0
        glGenTextures(1, &texture)
        glBindTexture(GLenum(GL_TEXTURE_2D), texture)
        glTexImage2D(GLenum(GL_TEXTURE_2D), 0, GL_RGBA8, GLsizei(width), GLsizei(height), 0, GLenum(GL_RGBA), GLenum(GL_UNSIGNED_BYTE), nil)
        var framebuffer: GLuint = 0
        glGenFramebuffers(1, &framebuffer)
        glBindFramebuffer(GLenum(GL_FRAMEBUFFER), framebuffer)
        glFramebufferTexture2D(GLenum(GL_FRAMEBUFFER), GLenum(GL_COLOR_ATTACHMENT0), GLenum(GL_TEXTURE_2D), texture, 0)
        glViewport(0, 0, GLsizei(width), GLsizei(height))
        return (framebuffer, texture)
    }

    /// The colour of the first and the last row of the bound target, as OpenGL reads it (row 0 is the bottom).
    private func bottomAndTop() -> (bottom: String, top: String) {
        func colour(_ row: Int) -> String {
            var pixel = [UInt8](repeating: 0, count: 4)
            glReadPixels(GLint(width / 2), GLint(row), 1, 1, GLenum(GL_RGBA), GLenum(GL_UNSIGNED_BYTE), &pixel)
            return pixel[0] > 200 ? "red" : (pixel[2] > 200 ? "blue" : "other")
        }
        return (colour(1), colour(height - 2))
    }

    @Test func anotherAppsPictureIsDrawnTheRightWayUp() throws {
        let context = try glContext()
        let device = try #require(MTLCreateSystemDefaultDevice())
        let queue = try #require(device.makeCommandQueue())
        let picture = try metalPicture(device)
        let server = SyphonMetalServer(name: "vibresia-receive-test-\(UUID().uuidString.prefix(6))", device: device, options: nil)
        defer { server.stop() }
        let receiver = SyphonReceiver(context: context.cglContextObj!)
        defer { receiver.stop() }
        receiver.connect(to: server.serverDescription)
        let target = makeTarget()

        var drawn = false
        for _ in 0 ..< 60 where !drawn {
            if let commands = queue.makeCommandBuffer() {
                server.publishFrameTexture(picture, on: commands, imageRegion: NSRect(x: 0, y: 0, width: width, height: height), flipped: true)
                commands.commit()
                commands.waitUntilCompleted()
            }
            context.makeCurrentContext()
            glBindFramebuffer(GLenum(GL_FRAMEBUFFER), target.framebuffer)
            glViewport(0, 0, GLsizei(width), GLsizei(height))
            glClearColor(0, 0, 0, 1)
            glClear(GLbitfield(GL_COLOR_BUFFER_BIT))
            if receiver.drawNewestFrame(), bottomAndTop().top == "red" {
                drawn = true
            } else {
                Thread.sleep(forTimeInterval: 0.1)
            }
        }
        #expect(drawn, "the receiver never drew the sender's picture")
        let rows = bottomAndTop()
        #expect(rows.top == "red", "red stays at the top: \(rows)")
        #expect(rows.bottom == "blue", "and blue at the bottom: \(rows)")
    }

    @Test func nothingIsDrawnWithoutAServer() throws {
        let context = try glContext()
        let receiver = SyphonReceiver(context: context.cglContextObj!)
        defer { receiver.stop() }
        _ = makeTarget()
        #expect(!receiver.isConnected)
        #expect(!receiver.drawNewestFrame(), "no source, no picture")
        receiver.connect(to: nil)
        #expect(!receiver.isConnected)
    }

    @Test func disconnectingStopsDrawingAndStoppingCanBeRepeated() throws {
        let context = try glContext()
        let device = try #require(MTLCreateSystemDefaultDevice())
        let server = SyphonMetalServer(name: "vibresia-disconnect-test-\(UUID().uuidString.prefix(6))", device: device, options: nil)
        defer { server.stop() }
        let receiver = SyphonReceiver(context: context.cglContextObj!)
        receiver.connect(to: server.serverDescription)
        #expect(receiver.isConnected)
        receiver.connect(to: nil)
        #expect(!receiver.isConnected)
        receiver.stop()
        receiver.stop()
    }
}

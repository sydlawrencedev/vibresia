import AppKit
import Metal
import OpenGL.GL3
import Syphon
import SyphonGL
import Testing
@testable import VibresiaSyphon

/// The Syphon publisher: what an app draws reaches a Syphon client, the right way up for OpenGL apps.
///
/// A Syphon surface holds the picture bottom row first (the order OpenGL draws in; measured in the Syphon package's own interop tests). A Metal
/// client reads the surface as it is, so the picture's bottom is in its first row.
@Suite(.serialized, .enabled(if: openGLContextIsAvailable, "needs an accelerated OpenGL context, which a CI virtual machine does not have"))
struct SyphonPublisherTests {
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

    /// Fills the bottom half of the bound target blue and the top half red (OpenGL's y runs up from the bottom).
    private func drawBlueBelowRedAbove() {
        glViewport(0, 0, GLsizei(width), GLsizei(height))
        glEnable(GLenum(GL_SCISSOR_TEST))
        glScissor(0, 0, GLsizei(width), GLsizei(height / 2))
        glClearColor(0, 0, 1, 1)
        glClear(GLbitfield(GL_COLOR_BUFFER_BIT))
        glScissor(0, GLint(height / 2), GLsizei(width), GLsizei(height / 2))
        glClearColor(1, 0, 0, 1)
        glClear(GLbitfield(GL_COLOR_BUFFER_BIT))
        glDisable(GLenum(GL_SCISSOR_TEST))
    }

    private func colour(_ texture: MTLTexture, row: Int) -> String {
        var bytes = [UInt8](repeating: 0, count: 4)
        texture.getBytes(&bytes, bytesPerRow: 4 * texture.width, from: MTLRegionMake2D(texture.width / 2, row, 1, 1), mipmapLevel: 0)
        return bytes[2] > 200 ? "red" : (bytes[0] > 200 ? "blue" : "other")
    }

    @Test func aFrameDrawnByTheAppReachesAClientBottomRowFirst() throws {
        let context = try glContext()
        let publisher = SyphonPublisher(name: "vibresia-test-\(UUID().uuidString.prefix(6))", context: context.cglContextObj!)
        defer { publisher.stop() }
        let device = try #require(MTLCreateSystemDefaultDevice())
        let client = SyphonMetalClient(serverDescription: publisher.serverDescription, device: device, options: nil, newFrameHandler: nil)
        defer { client.stop() }

        var received: MTLTexture?
        for _ in 0 ..< 60 where received == nil {
            context.makeCurrentContext()
            #expect(publisher.publish(width: width, height: height, draw: drawBlueBelowRedAbove), "Syphon provided a target")
            received = client.newFrameImage()
            if received == nil { Thread.sleep(forTimeInterval: 0.1) }
        }
        let frame = try #require(received, "no frame reached the Syphon client")
        #expect(frame.width == width && frame.height == height, "at the size drawn: \(frame.width) x \(frame.height)")
        #expect(colour(frame, row: 1) == "blue", "the picture's bottom is the surface's first row")
        #expect(colour(frame, row: height - 2) == "red", "and its top is the last row")
    }

    @Test func aFrameIsNotDrawnWhenSyphonCannotProvideATarget() throws {
        let context = try glContext()
        let publisher = SyphonPublisher(name: "vibresia-empty-\(UUID().uuidString.prefix(6))", context: context.cglContextObj!)
        defer { publisher.stop() }
        var drew = false
        #expect(!publisher.publish(width: 0, height: 0) { drew = true })
        #expect(!drew, "nothing is drawn for an empty frame")
    }

    @Test func stoppingCanBeRepeatedAndAnUnlistenedServerHasNoClients() throws {
        let context = try glContext()
        let publisher = SyphonPublisher(name: "vibresia-stop-\(UUID().uuidString.prefix(6))", context: context.cglContextObj!)
        #expect(!publisher.hasClients, "no one is receiving yet")
        publisher.stop()
        publisher.stop()
    }
}

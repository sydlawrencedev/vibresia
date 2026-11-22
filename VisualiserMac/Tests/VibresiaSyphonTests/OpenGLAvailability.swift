import AppKit

/// Whether this machine can make the OpenGL context the Syphon tests draw into. A Mac with a GPU can; the virtual
/// machines GitHub runs the tests on have no accelerated OpenGL, so there the pixel format is nil and the tests that
/// need a context are skipped, not failed. They still run on every Mac a person develops on.
let openGLContextIsAvailable: Bool = {
    let attributes: [NSOpenGLPixelFormatAttribute] = [
        NSOpenGLPixelFormatAttribute(NSOpenGLPFAOpenGLProfile), NSOpenGLPixelFormatAttribute(NSOpenGLProfileVersion3_2Core),
        NSOpenGLPixelFormatAttribute(NSOpenGLPFAColorSize), 24,
        NSOpenGLPixelFormatAttribute(NSOpenGLPFAAlphaSize), 8,
        NSOpenGLPixelFormatAttribute(NSOpenGLPFAAccelerated), 0,
    ]
    return NSOpenGLPixelFormat(attributes: attributes) != nil
}()

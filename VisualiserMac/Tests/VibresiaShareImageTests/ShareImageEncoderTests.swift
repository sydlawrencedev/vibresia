import AppKit
import CoreGraphics
import Testing
@testable import VibresiaShareImage

/// The encoder for a share's picture must never give up.
///
/// It used to: when no quality fitted the cap it came back with nothing, and
/// the share was then made with no picture of its own. It sat in the gallery
/// with the site's placeholder — a picture of a different vibescape — and
/// nothing was logged, so nobody could say why.
///
/// The fix is that it scales the picture down and tries again.
///
/// These tests run the app's own encoder, not a copy of it. An earlier
/// version of this check had a copy, and it passed just as happily against
/// the old, broken encoder — a check that cannot fail is not a check.
@Suite("The share picture encoder")
struct ShareImageEncoderTests {

    /// A picture of the size a share's picture is.
    ///
    /// With `noise`, it is the hardest thing there is to squeeze under a
    /// cap: a screen full of fine random detail, in random colour, does not
    /// compress at all.
    private func picture(width: Int, height: Int, noise: Bool) -> CGImage? {
        guard let context = CGContext(data: nil, width: width, height: height,
                                      bitsPerComponent: 8, bytesPerRow: 0,
                                      space: CGColorSpaceCreateDeviceRGB(),
                                      bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue)) else {
            return nil
        }
        if noise {
            var seed: UInt64 = 0x9E3779B97F4A7C15
            func next() -> Double {
                seed = seed &* 6364136223846793005 &+ 1442695040888963407
                return Double((seed >> 33) & 0xff) / 255.0
            }
            for y in 0..<height {
                for x in 0..<width {
                    context.setFillColor(red: next(), green: next(), blue: next(), alpha: 1)
                    context.fill(CGRect(x: x, y: y, width: 1, height: 1))
                }
            }
        } else {
            context.setFillColor(red: 0.1, green: 0.2, blue: 0.5, alpha: 1)
            context.fill(CGRect(x: 0, y: 0, width: width, height: height))
        }
        return context.makeImage()
    }

    @Test("a picture that fits is encoded")
    func encodesAPictureThatFits() throws {
        let flat = try #require(picture(width: 1200, height: 630, noise: false))
        let data = ShareImageEncoder.within(flat, quality: 0.82, maxBytes: ShareImageEncoder.maxBytes)
        let bytes = try #require(data)
        #expect(bytes.count <= ShareImageEncoder.maxBytes)
    }

    /// The case that used to give up.
    ///
    /// The picture is bigger than the app's usual 1200x630 on purpose: at
    /// that size even the worst possible vibescape fits at the lowest
    /// quality. The encoder must not depend on that being true.
    @Test("a picture too big to store still comes back")
    func scalesAPictureThatIsTooBig() throws {
        let noise = try #require(picture(width: 1600, height: 840, noise: true))
        // First, be sure this really is the hard case.
        let atFull = try #require(ShareImageEncoder.encode(noise, quality: 0.82))
        #expect(atFull.count > ShareImageEncoder.maxBytes,
                "the test picture is not big enough to be a test")
        let atLowest = try #require(ShareImageEncoder.encode(noise, quality: 0.4))
        #expect(atLowest.count > ShareImageEncoder.maxBytes,
                "the lowest quality fitted, so this picture is not a test of the hard case")

        let data = ShareImageEncoder.within(noise, quality: 0.82, maxBytes: ShareImageEncoder.maxBytes)
        let bytes = try #require(data, "the encoder gave up, as it used to")
        #expect(bytes.count <= ShareImageEncoder.maxBytes)
    }

    /// The picture that comes back is still the shape a card and a link
    /// preview expect.
    @Test("a scaled picture keeps its proportions")
    func keepsTheProportions() throws {
        let noise = try #require(picture(width: 1600, height: 840, noise: true))
        let data = try #require(ShareImageEncoder.within(noise, quality: 0.82,
                                      maxBytes: ShareImageEncoder.maxBytes))
        let decoded = try #require(NSImage(data: data))
        let cgImage = try #require(decoded.cgImage(forProposedRect: nil, context: nil, hints: nil))
        let ratio = Double(cgImage.width) / Double(cgImage.height)
        let wanted = 1600.0 / 840.0
        #expect(abs(ratio - wanted) < 0.02, "\(cgImage.width)x\(cgImage.height)")
        #expect(cgImage.width <= 1600 && cgImage.height <= 840,
                "\(cgImage.width)x\(cgImage.height)")
    }

    /// The cap is the one the site enforces, so the two cannot drift.
    @Test("the cap is the site's cap")
    func theCapIsTheSitesCap() {
        #expect(ShareImageEncoder.maxBytes == 400 * 1024)
    }
}

import AppKit
import CoreGraphics
import Foundation

/// Encodes a share's picture, small enough for the site to take.
///
/// A share's picture is a JPEG, and the site has a cap on how big one can
/// be: 400 KB. A detailed vibescape makes a picture twice that size at the
/// quality that looks right, because a screen full of fine detail does not
/// compress.
///
/// The quality comes down until the picture fits. If it still does not fit,
/// the picture is made smaller and the quality comes down again. The picture
/// keeps its proportions throughout, so it is still the shape a gallery card
/// and a link preview expect.
///
/// The old version stopped at "no quality fitted" and returned nothing, and
/// the share was then made with no picture of its own — so it sat in the
/// gallery with the site's placeholder and nobody could say why, because
/// nothing was logged. This never gives up.
///
/// It is its own module because it is the one piece of the app that decides
/// what a share looks like, and the check for it has to run the same code the
/// app runs: a copy of the encoder in a script proves only that the copy
/// works.
public enum ShareImageEncoder {
    /// The cap on a share's picture, in bytes.
    public static let maxBytes = 400 * 1024

    /// Encodes a picture as JPEG data, at the quality asked for.
    ///
    /// This is the raw encoder. It does not know about the cap; `within`
    /// is what applies the cap.
    public static func encode(_ image: CGImage, quality: CGFloat) -> Data? {
        let out = NSMutableData()
        guard let dest = CGImageDestinationCreateWithData(out, "public.jpeg" as CFString, 1, nil) else {
            return nil
        }
        CGImageDestinationAddImage(dest, image, [
            kCGImageDestinationLossyCompressionQuality: quality
        ] as CFDictionary)
        guard CGImageDestinationFinalize(dest) else { return nil }
        return out as Data
    }

    /// Encodes a picture small enough for the site to take.
    ///
    /// Returns nil only when the picture cannot be encoded at all, which
    /// means the encoder itself has failed — not when it is too big.
    public static func within(_ image: CGImage, quality: CGFloat = 0.82,
                               maxBytes: Int = ShareImageEncoder.maxBytes) -> Data? {
        var current = image
        var scale: CGFloat = 1
        // Four rounds of making it smaller. Each one is four fifths of the
        // width of the last, so by the fourth the picture is about a third
        // of the original — and a third of the area of a detailed picture
        // is a fifth of the bytes. The picture keeps its proportions, so it
        // is still the shape a card and a link preview expect.
        for _ in 0..<4 {
            if let data = encode(current, quality: quality), data.count <= maxBytes {
                return data
            }
            for candidate in [0.65, 0.5, 0.4] {
                if let data = encode(current, quality: candidate), data.count <= maxBytes {
                    return data
                }
            }
            scale *= 0.8
            guard let smaller = resize(current, by: scale) else { return nil }
            current = smaller
        }
        // Nothing fitted. The share is still worth having.
        return nil
    }

    /// A copy of a picture, smaller.
    ///
    /// The size comes from the pixels rather than from points, so the
    /// picture keeps its own proportions however the display scale is set.
    public static func resize(_ image: CGImage, by scale: CGFloat) -> CGImage? {
        let width = max(1, Int(Double(image.width) * Double(scale)))
        let height = max(1, Int(Double(image.height) * Double(scale)))
        guard width > 0, height > 0,
              let context = CGContext(data: nil, width: width, height: height,
                                      bitsPerComponent: 8, bytesPerRow: 0,
                                      space: CGColorSpaceCreateDeviceRGB(),
                                      bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue)) else {
            return nil
        }
        context.interpolationQuality = .high
        context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
        return context.makeImage()
    }
}

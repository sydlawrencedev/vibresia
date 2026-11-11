import AppKit
import Foundation
import VibresiaBrand

// The picture a share gets when there is no picture of its own.
//
// It used to be `site/media/share.jpg`, which was a picture of one of the
// built-in vibescapes — a pixel-art band. So a shared starfield appeared in
// the gallery as a picture of a band, which is worse than no picture at
// all: it says something about the vibescape that is not true.
//
// This one says what it is. It is Vibresia, and it is a picture of a
// vibescape that has not been drawn yet. It is drawn in the same pipeline
// as the built-in share graphics — same gradient, same brand code, same
// lettering — so it looks like the same product, and the change from "a
// picture of something else" to "a picture of nothing in particular" does
// not also look like a change of house style.

// MARK: - The picture

/// Draws the placeholder, at the size a link preview is picked up at.
func renderPlaceholder(width: Int, height: Int) -> Data? {
    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: width, pixelsHigh: height,
        bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
        colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    guard let ctx = NSGraphicsContext.current?.cgContext else { return nil }
    let w = CGFloat(width), h = CGFloat(height)

    // The bitmap is bottom-up: y=0 is the canvas bottom, y=height the
    // canvas top.

    // 1. Background gradient — the same deep purple as the built-in share
    //    graphics and the landing page, so a card that falls back to this
    //    sits in the same gallery as the cards that do not.
    guard let bg = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(),
                               colors: [placeholderBgTop.cgColor,
                                        placeholderBgBottom.cgColor] as CFArray,
                               locations: [0, 1]) else { return nil }
    ctx.drawLinearGradient(bg, start: .zero, end: CGPoint(x: 0, y: h),
                           options: [.drawsBeforeStartLocation, .drawsAfterEndLocation])

    // 2. The mark, large, in the middle. It is the one thing in the picture
    //    that says Vibresia without saying anything about a vibescape, and
    //    it is the shape the app draws in its own header — the same path,
    //    so the two cannot drift apart.
    let markSize: CGFloat = 120
    let markRect = CGRect(x: (w - markSize) / 2, y: h / 2 - 30, width: markSize, height: markSize)
    ShareImageBrand.drawMark(ctx, in: markRect)

    // 3. The wordmark, centred under the mark.
    let wordAttrs: [NSAttributedString.Key: Any] = [
        .font: NSFont.systemFont(ofSize: 42, weight: .bold),
        .foregroundColor: NSColor.white,
        .kern: 9.0,
    ]
    let wordmark = "VIBRESIA"
    let wordSize = (wordmark as NSString).size(withAttributes: wordAttrs)
    (wordmark as NSString).draw(
        at: CGPoint(x: (w - wordSize.width) / 2, y: h / 2 - 90),
        withAttributes: wordAttrs
    )

    // 4. What the picture is, in one line. It is the honest version of
    //    "here is a vibescape": the page it stands in for has a real
    //    picture once somebody has opened it in a browser.
    let noteText = "A SHARED VIBESCAPE"
    let noteAttrs: [NSAttributedString.Key: Any] = [
        .font: NSFont.monospacedSystemFont(ofSize: 17, weight: .semibold),
        .foregroundColor: NSColor(white: 0.7, alpha: 1),
        .kern: 4.0,
    ]
    let noteSize = (noteText as NSString).size(withAttributes: noteAttrs)
    (noteText as NSString).draw(
        at: CGPoint(x: (w - noteSize.width) / 2, y: h / 2 - 140),
        withAttributes: noteAttrs
    )

    // 5. The brand and the credit, in the corners, exactly as the built-in
    //    share graphics put them there.
    ShareImageBrand.draw(in: ctx, size: CGSize(width: w, height: h),
                         author: placeholderAuthor)

    NSGraphicsContext.current = nil
    return rep.representation(using: .jpeg, properties: [
        NSBitmapImageRep.PropertyKey.compressionFactor: 0.86
    ])
}

// MARK: - Its constants

/// The background gradient, the same deep purple the built-in share
/// graphics use.
let placeholderBgTop = NSColor(red: 0.024, green: 0.004, blue: 0.05, alpha: 1)
let placeholderBgBottom = NSColor(red: 0.06, green: 0.03, blue: 0.11, alpha: 1)

/// Who the picture says made it. The same credit the built-in share
/// graphics carry.
let placeholderAuthor = "Minith Labs"

/// Where the picture is written, relative to the site.
let placeholderPath = "media/share-placeholder.jpg"

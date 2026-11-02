import SwiftUI
import AppKit
import ImageIO

/// Pictures fetched from the site, kept for the life of the app.
///
/// `AsyncImage` keeps nothing between views, so a gallery card that is
/// rebuilt fetches and decodes its picture again. This keeps each one,
/// already shrunk to card size, and shares a fetch between cards that ask
/// at the same time.
@MainActor
final class RemoteImageCache {
    static let shared = RemoteImageCache()

    /// Longest side a card ever needs, at 2x.
    private static let maxPixels = 480

    private let images = NSCache<NSURL, NSImage>()
    private var inFlight: [URL: Task<NSImage?, Never>] = [:]

    func cached(_ url: URL) -> NSImage? {
        images.object(forKey: url as NSURL)
    }

    func load(_ url: URL) async -> NSImage? {
        if let image = cached(url) { return image }
        if let task = inFlight[url] { return await task.value }
        let task = Task.detached(priority: .utility) { () -> NSImage? in
            guard let (data, _) = try? await URLSession.shared.data(from: url) else { return nil }
            return Self.downsample(data)
        }
        inFlight[url] = task
        let image = await task.value
        inFlight[url] = nil
        if let image { images.setObject(image, forKey: url as NSURL) }
        return image
    }

    /// Decodes straight to a small bitmap, rather than decoding the whole
    /// picture and having it scaled down on every draw.
    nonisolated private static func downsample(_ data: Data) -> NSImage? {
        guard let source = CGImageSourceCreateWithData(data as CFData, nil) else { return nil }
        let options: [CFString: Any] = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceShouldCacheImmediately: true,
            kCGImageSourceThumbnailMaxPixelSize: maxPixels,
        ]
        guard let cg = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary) else { return nil }
        return NSImage(cgImage: cg, size: NSSize(width: cg.width, height: cg.height))
    }
}

/// A picture from the site, from the cache when it's there, with a plain
/// placeholder until it arrives.
struct RemoteImage: View {
    let url: URL
    @State private var image: NSImage?

    var body: some View {
        Group {
            if let image = image ?? RemoteImageCache.shared.cached(url) {
                Image(nsImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                Rectangle().fill(Color.white.opacity(0.06))
            }
        }
        .task(id: url) {
            image = await RemoteImageCache.shared.load(url)
        }
    }
}

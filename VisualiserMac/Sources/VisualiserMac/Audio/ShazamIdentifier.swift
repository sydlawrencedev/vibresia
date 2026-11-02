import AVFoundation
import Foundation
import ShazamKit

/// Identifies the song that is playing by listening to it.
///
/// ShazamKit turns a few seconds of sound into a signature and asks Shazam's
/// catalogue what that signature is. It works with anything that makes a
/// sound — a music app, a browser, a film — rather than only with the
/// players that post notifications, which is why it is worth having
/// alongside the lookup by name.
///
/// Two things make it different from the lookup by name, and both are why
/// this is behind a setting in the app:
///
/// - Matching against Shazam's catalogue needs the ShazamKit capability
///   enabled on the app's identifier, and the entitlement that comes with it.
///   Apple has not always issued that entitlement for apps signed with a
///   Developer ID certificate rather than a provisioning profile, which is
///   how this app is signed. The failure is `com.apple.ShazamCore` error 102,
///   and it means "not allowed" rather than "not found".
/// - The signature is sent to Apple. It is not the audio — it is a
///   fingerprint of it, one way, and it cannot be turned back into sound —
///   but it does say what was playing.
///
/// The app asks by listening only when somebody turns that setting on
/// (`AppState.identifyByListening`), and only when it has no other way of
/// knowing what is playing. `--shazam-spike` runs one match and says what
/// happened, which is how the first of those two gets settled.
actor ShazamIdentifier {
    /// A song Shazam recognised.
    struct Match: Equatable {
        let title: String
        let artist: String
        /// The genres the catalogue has for it, which is what the band's
        /// stage is chosen from.
        let genres: [String]
    }

    /// What a match attempt came back with.
    enum Outcome: Equatable {
        case matched(Match)
        case noMatch
        /// The catalogue was asked and said no.
        case failed(String)
        /// The app isn't allowed to ask.
        ///
        /// Apple's ShazamKit service decides that on the app's identifier, and
        /// it answers with error 202 — "the match attempt failed" — which is
        /// not the same as the catalogue not knowing the song. It won't change
        /// without the ShazamKit entitlement, so the caller stops asking
        /// rather than trying again every minute.
        case notAllowed
    }

    /// How much audio a signature is made from.
    ///
    /// Reading the ring buffer takes the newest samples, and the analyzer
    /// reads the same buffer, so this is a debug tool rather than something
    /// to leave running: two readers at once can leave the analyzer short of
    /// a window.
    ///
    /// ShazamKit needs a few seconds to say anything useful: less and the
    /// signature is too thin to match, and the app's ring buffer holds about
    /// five and a half seconds.
    static let seconds: Double = 4.0

    /// The answer Apple gives when the app isn't allowed to ask.
    ///
    /// It comes back in ShazamCore's own domain rather than as one of the
    /// `SHError` codes, which is why the number doesn't look like the rest
    /// of them. The measurement is in the README: a build without the
    /// ShazamKit entitlement gets exactly this, and it means "not allowed"
    /// rather than "not found".
    private static let notAllowedDomain = "com.apple.ShazamCore"
    private static let notAllowedCode = 102

    /// Matches a stretch of audio against the catalogue.
    func match(_ buffer: AVAudioPCMBuffer) async -> Outcome {
        do {
            let generator = SHSignatureGenerator()
            try generator.append(buffer, at: nil)
            let signature = generator.signature()

            let session = SHSession()
            switch await session.result(from: signature) {
            case .match(let match):
                guard let item = match.mediaItems.first else { return .noMatch }
                return .matched(Match(
                    title: item.title ?? "",
                    artist: item.artist ?? "",
                    genres: item.genres))
            case .noMatch:
                return .noMatch
            case .error(let error, _):
                let ns = error as NSError
                // "Not allowed" has its own domain and its own number, so it
                // is checked by both rather than by the code alone.
                if ns.domain == Self.notAllowedDomain, ns.code == Self.notAllowedCode {
                    return .notAllowed
                }
                return .failed("error \(ns.code): \(error.localizedDescription)")
            }
        } catch {
            return .failed("could not sign the audio: \(error.localizedDescription)")
        }
    }
}

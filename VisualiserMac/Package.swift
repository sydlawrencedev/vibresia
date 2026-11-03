// swift-tools-version:5.9
import PackageDescription
import Foundation

// The Command Line Tools keep the testing support libraries somewhere the
// linker does not look for itself, so the tests will not link without being
// told where they are. A machine with Xcode has them where the linker
// already looks, and the path is only added when it is there.
let commandLineToolsLibraries = "/Library/Developer/CommandLineTools/Library/Developer/usr/lib"
let testingLinkerSettings: [LinkerSetting] = FileManager.default.fileExists(
    atPath: commandLineToolsLibraries)
    ? [.unsafeFlags(["-L\(commandLineToolsLibraries)",
                     "-Xlinker", "-rpath",
                     "-Xlinker", commandLineToolsLibraries])]
    : []

let package = Package(
    name: "AudioVane",
    platforms: [
        .macOS("14.2")
    ],
    // The products are named for the app; the targets keep their old names
    // so the Swift module — and everything in it — doesn't have to change.
    products: [
        .executable(name: "Vibresia", targets: ["AudioVane"]),
        .executable(name: "VibresiaWatcher", targets: ["AudioVaneWatcher"])
    ],
    dependencies: [
        .package(url: "https://github.com/PostHog/posthog-ios.git", from: "3.58.0"),
        // The test framework. It ships with Xcode, but this machine has only
        // the Command Line Tools, and the minifier's tests are the ones that
        // have to run.
        .package(url: "https://github.com/swiftlang/swift-testing.git", from: "6.2.0")
    ],
    targets: [
        // The logo, in one place. The app draws it in its header and on the
        // share picture it uploads; the share-graphics tool draws it on the
        // website's built-in share pictures. One implementation, so the app and
        // its own share images can't drift apart.
        .target(
            name: "VibresiaBrand",
            path: "Sources/VibresiaBrand"
        ),
        // Shortens a vibescape's code so that a share fits in a link.
        //
        // On its own, and with tests of its own, because it is the one piece
        // of the app that rewrites somebody's code: it has to mean exactly
        // what the code it was given meant, and the only way to be sure of
        // that is to keep examples of the ways it used to get it wrong.
        .target(
            name: "VibresiaMinify",
            path: "Sources/VibresiaMinify"
        ),
        .testTarget(
            name: "VibresiaMinifyTests",
            dependencies: [
                "VibresiaMinify",
                .product(name: "Testing", package: "swift-testing")
            ],
            path: "Tests/VibresiaMinifyTests",
            linkerSettings: testingLinkerSettings
        ),
        .executableTarget(
            name: "AudioVane",
            dependencies: [
                .product(name: "PostHog", package: "posthog-ios"),
                "VibresiaBrand",
                "VibresiaMinify",
            ],
            path: "Sources/VisualiserMac",
            swiftSettings: [
                .unsafeFlags(["-parse-as-library"]),
                .define("GL_SILENCE_DEPRECATION")
            ],
            linkerSettings: [
                .linkedFramework("OpenGL"),
                .linkedFramework("AppKit"),
                .linkedFramework("SwiftUI"),
                .linkedFramework("AVFoundation"),
                .linkedFramework("CoreAudio"),
                .linkedFramework("Accelerate"),
                .linkedFramework("CoreVideo"),
                .linkedFramework("ShazamKit")
            ]
        ),
        // Draws the website's share pictures for every built-in vibescape.
        // Not part of the app: it is a build-time tool, run by hand when a
        // vibescape changes. See scripts/build-share-graphics.sh.
        .executableTarget(
            name: "ShareGraphics",
            dependencies: [
                "VibresiaBrand"
            ],
            path: "Sources/ShareGraphics"
        ),
        // Launched by launchd, not by the user: sits in the bundle as
        // Contents/Helpers and opens Vibresia when Apple Music or Spotify
        // starts. Plain AppKit so it stays tiny.
        .executableTarget(
            name: "AudioVaneWatcher",
            path: "Sources/AudioVaneWatcher",
            linkerSettings: [
                .linkedFramework("AppKit")
            ]
        )
    ]
)
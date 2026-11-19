import Combine
import Foundation
import Syphon

/// One Syphon server another app is running, as a person picks it.
public struct SyphonSource: Identifiable, Equatable {
    /// Syphon's own id for the server. It changes every time the other app starts, so a saved choice is kept by `title` instead.
    public let id: String
    /// How Syphon's own pickers name it: "App - Name", or just one of them when the other is empty.
    public let title: String
    /// What a Syphon client needs to connect.
    public let description: [String: Any]

    public static func == (lhs: SyphonSource, rhs: SyphonSource) -> Bool { lhs.id == rhs.id && lhs.title == rhs.title }
}

public enum SyphonSources {
    /// The servers in `servers` (descriptions from Syphon's directory) as sources, alphabetically so a menu does not jump about. A server with
    /// no id cannot be connected to and is left out, as is any server of `excludingApp` (so the app cannot show its own output).
    public static func sources(in servers: [[String: Any]], excludingApp: String?) -> [SyphonSource] {
        servers.compactMap { server -> SyphonSource? in
            guard let id = server[SyphonServerDescriptionUUIDKey] as? String else { return nil }
            let app = server[SyphonServerDescriptionAppNameKey] as? String ?? ""
            if let excludingApp, app == excludingApp { return nil }
            let name = server[SyphonServerDescriptionNameKey] as? String ?? ""
            let title = [app, name].filter { !$0.isEmpty }.joined(separator: " - ")
            return SyphonSource(id: id, title: title.isEmpty ? id : title, description: server)
        }
        .sorted { first, second in
            let order = first.title.localizedCaseInsensitiveCompare(second.title)
            return order == .orderedSame ? first.id < second.id : order == .orderedAscending
        }
    }

    /// The source a saved choice (by title) refers to, if it is running now.
    public static func source(titled title: String?, in sources: [SyphonSource]) -> SyphonSource? {
        guard let title else { return nil }
        return sources.first { $0.title == title }
    }
}

/// The sources running right now, kept up to date as other apps start and stop their servers. Syphon announces them on the main queue, and
/// so the list changes there too.
public final class SyphonSourceList: ObservableObject {
    @Published public private(set) var sources: [SyphonSource] = []
    private let excludingApp: String?
    private var observers: [NSObjectProtocol] = []

    public init(excludingApp: String? = ProcessInfo.processInfo.processName) {
        self.excludingApp = excludingApp
        refresh()
        for name in [Notification.Name.SyphonServerAnnounce, .SyphonServerUpdate, .SyphonServerRetire] {
            observers.append(NotificationCenter.default.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in
                self?.refresh()
            })
        }
    }

    deinit { observers.forEach(NotificationCenter.default.removeObserver) }

    private func refresh() {
        let servers = (SyphonServerDirectory.shared().servers as? [[String: Any]]) ?? []
        let updated = SyphonSources.sources(in: servers, excludingApp: excludingApp)
        if updated != sources { sources = updated }
    }
}

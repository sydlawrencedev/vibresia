import Syphon
import Testing
@testable import VibresiaSyphon

/// Turning the Syphon directory's server descriptions into the list a person picks from.
struct SyphonSourcesTests {
    private func server(app: String?, name: String?, id: String?) -> [String: Any] {
        var description: [String: Any] = [:]
        if let app { description[SyphonServerDescriptionAppNameKey] = app }
        if let name { description[SyphonServerDescriptionNameKey] = name }
        if let id { description[SyphonServerDescriptionUUIDKey] = id }
        return description
    }

    @Test func eachServerBecomesASourceNamedTheWaySyphonsOwnPickersNameIt() {
        let sources = SyphonSources.sources(in: [server(app: "Quartzing", name: "Planets", id: "A")], excludingApp: nil)
        #expect(sources.map(\.title) == ["Quartzing - Planets"])
        #expect(sources.first?.id == "A")
    }

    @Test func aServerWithNoNameIsNamedAfterItsApp() {
        let sources = SyphonSources.sources(in: [server(app: "Quartzing", name: "", id: "A"), server(app: "OBS", name: nil, id: "B")], excludingApp: nil)
        #expect(sources.map(\.title) == ["OBS", "Quartzing"])
    }

    @Test func sourcesAreListedInAlphabeticalOrderSoTheMenuDoesNotJump() {
        let sources = SyphonSources.sources(in: [
            server(app: "Zed", name: "b", id: "1"),
            server(app: "Alpha", name: "z", id: "2"),
            server(app: "Alpha", name: "a", id: "3"),
        ], excludingApp: nil)
        #expect(sources.map(\.id) == ["3", "2", "1"])
    }

    @Test func theAppsOwnServerIsLeftOutSoItCannotShowItself() {
        let sources = SyphonSources.sources(in: [
            server(app: "Vibresia", name: "Output", id: "own"),
            server(app: "Quartzing", name: "Planets", id: "other"),
        ], excludingApp: "Vibresia")
        #expect(sources.map(\.id) == ["other"])
    }

    @Test func aServerWithoutAnIdCannotBeConnectedToAndIsSkipped() {
        let sources = SyphonSources.sources(in: [server(app: "Quartzing", name: "Planets", id: nil)], excludingApp: nil)
        #expect(sources.isEmpty)
    }

    @Test func aSavedChoiceFindsItsSourceByTitleAndAMissingOneFindsNothing() {
        let sources = SyphonSources.sources(in: [
            server(app: "Quartzing", name: "Planets", id: "A"),
            server(app: "OBS", name: nil, id: "B"),
        ], excludingApp: nil)
        #expect(SyphonSources.source(titled: "Quartzing - Planets", in: sources)?.id == "A")
        #expect(SyphonSources.source(titled: "Gone - Away", in: sources) == nil)
        #expect(SyphonSources.source(titled: nil, in: sources) == nil)
    }
}

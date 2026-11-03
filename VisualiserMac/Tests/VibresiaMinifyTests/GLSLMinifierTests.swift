import Testing
@testable import VibresiaMinify

/// The minifier rewrites somebody's code, so it has to mean exactly what the
/// code it was given meant.
///
/// Every test here is a way it used to get that wrong. Each of them broke a
/// real share: the shader was published to the site and everybody who opened
/// the link got a blank screen.
@Suite("The minifier")
struct GLSLMinifierTests {

    // MARK: - The macros

    /// A macro's body used to lose the space after the parameter list.
    ///
    /// `#define MAPS(P) min(a, b)` became `#define MAPS(P)min(a,b)`.
    @Test("the space after a macro's parameter list stays")
    func keepsTheSpaceAfterAMacroParameterList() {
        let out = GLSLMinifier.minify("#define MAPS(P) min(MAPB(P), MAPH(P))")
        #expect(out.contains("#define MAPS(P) min("),
                "the space after the parameter list went: \(out)")
    }

    /// A macro's name and its value have to stay apart.
    ///
    /// `#define LENSB .62` became `#define LENSB.62`, which is not a macro at
    /// all but a name with a dot in it.
    @Test("the space between a macro's name and its value stays")
    func keepsTheSpaceAfterAMacroName() {
        let out = GLSLMinifier.minify("#define LENSB .62")
        #expect(out.contains("#define LENSB .62"),
                "the name and the value ran together: \(out)")
    }

    /// A macro with a space before its bracket is a value, not a function.
    ///
    /// `#define F (x)` is a name whose value is `(x)`. Closing that space up
    /// makes it `#define F(x)`, which is a function — and a different shader.
    @Test("a macro that is a value does not become a function")
    func keepsAMacroThatIsAValueRatherThanAFunction() {
        let out = GLSLMinifier.minify("#define F (x)")
        #expect(out.contains("#define F (x)"),
                "a value became a function: \(out)")
    }

    /// A macro with no space before its bracket is a function, and stays one.
    @Test("a macro that is a function stays a function")
    func keepsAFunctionLikeMacroAFunction() {
        let out = GLSLMinifier.minify("#define F(x) (x)")
        #expect(out.contains("#define F(x)"),
                "the macro's name ran into its bracket: \(out)")
    }

    /// A macro spread over several lines is one line.
    ///
    /// The lines were being cut off at the first break, so the macro ended
    /// halfway through its own body and the rest of it was read as code.
    @Test("a macro that runs over several lines stays one macro")
    func keepsAMacroThatRunsOverSeveralLines() {
        let source = """
        #define BIG(P) min(SDCYL((P) - STEINP - vec3(0.0, 0.55, 0.0), 0.70, \\
                  0.55), \\
                  min(SDCYL((P) - STEINP, 0.60, 0.86) - 0.04))
        """
        let out = GLSLMinifier.minify(source)
        let lines = out.split(separator: "\n")
        #expect(lines.count == 3, "the macro lost a line: \(out)")
        #expect(lines.first?.hasSuffix("\\") == true,
                "the first line lost its continuation: \(out)")
        #expect(lines.dropFirst().first?.hasSuffix("\\") == true,
                "the second line lost its continuation: \(out)")
        #expect(lines.last?.contains("min(SDCYL") == true,
                "the last line is wrong: \(out)")
    }

    /// The space before a continuation is part of the line that follows on.
    ///
    /// `x \` and a newline and `y` is two words. `x\` and a newline and `y` is
    /// one word, which is a different shader.
    @Test("the space before a continuation stays")
    func keepsTheSpaceBeforeAContinuation() {
        let source = "#define A x \\\ny\n"
        let out = GLSLMinifier.minify(source)
        #expect(out.contains("x \\"), "the space before the continuation went: \(out)")
    }

    /// Two words need the space between them.
    @Test("two words keep the space between them")
    func keepsTheSpaceBetweenTwoWords() {
        let out = GLSLMinifier.minify("float render ( vec2 p , float t ) { return vec3 ( 1.0 ) ; }")
        #expect(out.contains("return vec3"), "the words ran together: \(out)")
        #expect(out.contains("float t"), "the words ran together: \(out)")
    }

    // MARK: - The code

    /// `a + +b` is two additions. `a++b` is one increment.
    @Test("two pluses do not become an increment")
    func doesNotJoinTwoPlusesIntoAnIncrement() {
        let out = GLSLMinifier.minify("float x = a + +b;")
        #expect(out.contains("+ +"), "two pluses became an increment: \(out)")
    }

    /// The same goes for two minuses.
    @Test("two minuses do not become a decrement")
    func doesNotJoinTwoMinusesIntoADecrement() {
        let out = GLSLMinifier.minify("float x = a - -b;")
        #expect(out.contains("- -"), "two minuses became a decrement: \(out)")
    }

    /// A directive has to stay on a line of its own.
    @Test("a directive stays on its own line")
    func keepsADirectiveOnItsOwnLine() {
        let source = "float x = 1.0;\n#define SPEED 3.0\nfloat y = SPEED;"
        let out = GLSLMinifier.minify(source)
        let lines = out.split(separator: "\n")
        #expect(lines.contains { $0.hasPrefix("#define SPEED") },
                "the directive lost its line: \(out)")
    }

    /// The code after a directive is not part of it.
    @Test("the code after a directive stays off the directive's line")
    func keepsTheCodeAfterADirectiveOffTheDirectivesLine() {
        let source = "#define SPEED 3.0\nfloat y = SPEED;"
        let out = GLSLMinifier.minify(source)
        #expect(!out.contains("#define SPEED 3.0float"),
                "the code was swallowed by the macro: \(out)")
    }

    /// Comments go, and the lines they were on stay.
    @Test("comments go and the code stays")
    func removesCommentsAndKeepsTheLines() {
        let source = "// a note\nfloat x = 1.0; /* another */ float y = 2.0;"
        let out = GLSLMinifier.minify(source)
        #expect(!out.contains("a note"), "the comment stayed: \(out)")
        #expect(!out.contains("another"), "the comment stayed: \(out)")
        #expect(out.contains("float x"), "the code went: \(out)")
    }

    /// A comment can sit inside a carried-on line, and the line still carries
    /// on after it.
    @Test("a continuation with a comment on it still carries on")
    func keepsAContinuationThatHasACommentOnIt() {
        let source = "#define A 1 + \\\n2 // a note\n"
        let out = GLSLMinifier.minify(source)
        #expect(!out.contains("a note"), "the comment stayed: \(out)")
        #expect(out.contains("\\"), "the continuation went: \(out)")
    }

    /// Nothing that isn't ASCII in the source gets mangled on the way through.
    @Test("text that is not ASCII is not mangled")
    func keepsTextThatIsNotAscii() {
        let source = "// café ☕\nfloat x = 1.0;"
        let out = GLSLMinifier.minify(source)
        #expect(!out.contains("cafÃ"), "the text was mangled: \(out)")
    }

    /// The code that comes out has to be shorter, or there is no point.
    @Test("the code comes out shorter")
    func makesTheCodeShorter() {
        let source = """
        vec3 render(vec2 p, float t) {
            // A note about what this does.
            float x = 1.0;
            return vec3(x, x, x);
        }
        """
        let out = GLSLMinifier.minify(source)
        #expect(out.count < source.count)
    }
}

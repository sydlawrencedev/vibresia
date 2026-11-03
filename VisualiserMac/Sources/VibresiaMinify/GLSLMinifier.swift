import Foundation

/// Strips comments and redundant whitespace out of a vibescape's GLSL.
///
/// Only used when a share would be too long to send as it is. Whatever comes
/// out of here is what the recipient's copy will be, so it has to mean
/// exactly what the original meant — this may not change what the shader
/// does, or the share is broken for everybody who receives it.
///
/// GLSL has no string literals, so "the next `//` starts a comment" is safe
/// without tracking quotes the way a C-family minifier has to.
///
/// Three things in the language make this harder than it looks, and each of
/// them has broken a share before:
///
/// - A preprocessor directive is line-oriented. `#define SPEED 3.0` followed
///   by real code has to keep its line break, or the code is swallowed by the
///   macro and the shader stops compiling.
/// - The space after a macro's name is what says whether the macro is a value
///   or a function. `#define F (x)` is a name whose value is `(x)`;
///   `#define F(x)` is a function. Closing that space up turns one into the
///   other, and the shader stops compiling.
/// - A line can be carried on into the next one with a backslash. The break
///   has to stay, and the space before it has to stay with it, or two lines
///   that were one line become two.
public enum GLSLMinifier {
    public static func minify(_ source: String) -> String {
        let stripped = stripComments(Array(source.utf8))
        return String(decoding: collapseWhitespace(stripped), as: UTF8.self)
    }

    // MARK: - The two passes

    /// Takes the comments out, keeping the line breaks they span.
    ///
    /// The breaks are kept because a comment can sit inside a carried-on line,
    /// and because a directive has to stay on a line of its own.
    private static func stripComments(_ source: [UInt8]) -> [UInt8] {
        var out: [UInt8] = []
        out.reserveCapacity(source.count)
        var i = 0
        while i < source.count {
            let c = source[i]
            if c == slash, i + 1 < source.count, source[i + 1] == slash {
                // A line comment runs to the end of the line. The break is left
                // for the next pass: it may be the end of a carried-on line.
                while i < source.count, source[i] != newline { i += 1 }
            } else if c == slash, i + 1 < source.count, source[i + 1] == star {
                i += 2
                while i < source.count {
                    if source[i] == star, i + 1 < source.count, source[i + 1] == slash {
                        i += 2
                        break
                    }
                    // A block comment can span lines, and the lines it spans
                    // are still lines.
                    if source[i] == newline { out.append(newline) }
                    i += 1
                }
            } else {
                out.append(c)
                i += 1
            }
        }
        return out
    }

    /// Closes up the whitespace that isn't needed, and keeps what is.
    private static func collapseWhitespace(_ source: [UInt8]) -> [UInt8] {
        var out: [UInt8] = []
        out.reserveCapacity(source.count)

        /// There was whitespace here that has not been settled yet.
        var pendingSpace = false
        /// The last byte written, or zero when there has not been one.
        var last: UInt8 = 0
        /// Inside a preprocessor directive.
        var inDirective = false
        /// Nothing but whitespace has been read on the line being read.
        var atLineStart = true
        /// The last byte written was a backslash, so the line carries on.
        var carried = false

        for b in source {
            if b == newline || b == carriageReturn {
                if carried {
                    // The line carries on into the next one. The break has to
                    // stay — it is what the continuation is measured against —
                    // and the directive it is in carries on with it.
                    out.append(newline)
                    pendingSpace = false
                    last = 0
                    atLineStart = false
                    carried = false
                    continue
                }
                if inDirective {
                    // A directive ends with the end of its line, and the line
                    // break is what ends it.
                    out.append(newline)
                    inDirective = false
                    last = 0
                    pendingSpace = false
                } else {
                    // Ordinary code: the break means nothing to the compiler,
                    // so the next line joins this one.
                    pendingSpace = true
                }
                atLineStart = true
                continue
            }

            if b == space || b == tab {
                pendingSpace = true
                continue
            }

            if b == hash && atLineStart {
                // A directive has to be on a line of its own.
                if let l = out.last, l != newline { out.append(newline) }
                inDirective = true
                pendingSpace = false
                last = 0
            } else if pendingSpace {
                pendingSpace = false
                if let l = out.last, l != newline,
                   keepSpace(last: last, next: b, inDirective: inDirective) {
                    out.append(space)
                }
            }
            out.append(b)
            last = b
            atLineStart = false
            carried = (b == backslash)
        }

        // A file that ends in the middle of a directive still needs its break.
        if inDirective { out.append(newline) }
        return out
    }

    // MARK: - The rules

    /// Whether the space between two bytes has to stay.
    ///
    /// The space is what separates one token from the next, so closing it up
    /// can make two tokens into one — and that is a different shader.
    private static func keepSpace(last: UInt8, next: UInt8, inDirective: Bool) -> Bool {
        // A carried-on line keeps whatever came before it: the space is part
        // of the line that carries on after the break.
        if next == backslash { return true }
        // Two words need the space between them, or they become one word.
        if isWordByte(last) && isWordByte(next) { return true }
        // In a directive, the space after a name is what says the macro is a
        // value and not a function, so it stays. The space after a parameter
        // list stays too: the compiler reads `#define F(x) body` and
        // `#define F(x)body` the same way, but there is no reason to ask it
        // to.
        if inDirective && (isWordByte(last) || last == closeParen) { return true }
        // `a + +b` must not become `a++b`.
        if last == next && doublesUp(last) { return true }
        return false
    }

    /// The bytes that mean something different when written twice.
    ///
    /// `a + +b` is two additions; `a++b` is one increment. The same goes for
    /// the others, and none of them are written with a space in ordinary code,
    /// so the space only has to be kept when somebody wrote it.
    private static func doublesUp(_ b: UInt8) -> Bool {
        b == plus || b == minus || b == less || b == greater || b == amp || b == pipe
    }

    /// The bytes that can be part of a name or a number.
    private static func isWordByte(_ b: UInt8) -> Bool {
        (b >= UInt8(ascii: "a") && b <= UInt8(ascii: "z"))
            || (b >= UInt8(ascii: "A") && b <= UInt8(ascii: "Z"))
            || (b >= UInt8(ascii: "0") && b <= UInt8(ascii: "9"))
            || b == UInt8(ascii: "_")
    }

    // MARK: - The bytes

    private static let newline: UInt8 = 0x0A
    private static let carriageReturn: UInt8 = 0x0D
    private static let space: UInt8 = 0x20
    private static let tab: UInt8 = 0x09
    private static let hash: UInt8 = 0x23
    private static let slash: UInt8 = 0x2F
    private static let star: UInt8 = 0x2A
    private static let plus: UInt8 = 0x2B
    private static let minus: UInt8 = 0x2D
    private static let less: UInt8 = 0x3C
    private static let greater: UInt8 = 0x3E
    private static let amp: UInt8 = 0x26
    private static let pipe: UInt8 = 0x7C
    private static let closeParen: UInt8 = 0x29
    private static let backslash: UInt8 = 0x5C
}

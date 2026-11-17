#!/bin/bash
# Simulates release.sh's notarization control flow with the real script's
# logic, using stubs for the parts that need a real Apple identity.
#
# What it checks:
#   1. ad-hoc build + no identity  -> release proceeds, warns, exit 0
#   2. Developer ID + notarize ok   -> release proceeds, exit 0
#   3. Developer ID + notarize fails-> release aborts, exit 1
#   4. Developer ID + notarize "succeeds" but no valid ticket -> aborts, exit 1
#
# Usage: ./scripts/test-release-notarization.sh
#
# It runs on a Mac, and in CI rather than inside release.sh. Calling it from
# release.sh is a trap: this test runs the real release.sh, so release.sh
# calling this test would run it again, and again, until something gave up.
# The test belongs one level up, where it can see the script it checks.

set -uo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
release_sh="$here/../release.sh"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

pass=0
fail=0

# The site checks release.sh runs before it builds anything. They need the
# real repository, so in a sandbox they are stubs that pass.
#
# They live one level above the sandbox, because release.sh reaches them as
# ../scripts/... — it lives in VisualiserMac/, and the repository root is
# above that.
mkdir -p "$WORK/scripts"
for s in check-vibescapes.sh check-posthog.sh check-no-webhook-leak.sh; do
    printf '#!/bin/bash\necho "==> [stub] %s"\n' "$s" > "$WORK/scripts/$s"
    chmod +x "$WORK/scripts/$s"
done
printf '#!/bin/bash\nexit 0\n' > "$WORK/scripts/check-preview-glsl.py"
chmod +x "$WORK/scripts/check-preview-glsl.py"
# This one is called as `python3 ../scripts/inject-chrome.py`, so it has to be
# a Python file rather than a shell script with a shebang.
printf 'import sys\nsys.exit(0)\n' > "$WORK/scripts/inject-chrome.py"
# The remaining checks are run with node or python3 and are not shell scripts.
# The .mjs ones are run by node, so they have to be JavaScript.
for s in check-admin-page.mjs check-competitors.mjs generate-seo-pages.mjs check-links.mjs check-schema.mjs check-d1-schema.mjs; do
    printf 'process.exit(0);\n' > "$WORK/scripts/$s"
done
for s in check-mcp-reference.py check-plugin-manifests.py check-windows-release.py; do
    printf 'import sys\nsys.exit(0)\n' > "$WORK/scripts/$s"
done
printf '#!/bin/bash\nexit 0\n' > "$WORK/scripts/check-no-webhook-leak.test.sh"
chmod +x "$WORK/scripts/check-no-webhook-leak.test.sh"

check() { # name expected actual
    if [ "$2" = "$3" ]; then
        echo "  ok    $1 (exit $3)"
        pass=$((pass + 1))
    else
        echo "  FAIL  $1 (expected exit $2, got $3)"
        echo "  --- output ---"
        echo "$out" | sed 's/^/  | /' | tail -12
        fail=$((fail + 1))
    fi
}

# Build a sandbox that mirrors release.sh's structure, with the real script
# copied in and its external commands stubbed.
#
# The sandbox is a real git repository, not a directory that merely looks like
# one. release.sh does four things with git before it builds anything — it
# checks the tree is clean, fetches from origin, checks HEAD is on
# origin/main, and then commits and pushes the version bump — and a sandbox
# outside a repository fails all of them with "not a git repository" and
# exits 128. Every scenario then failed before reaching the notarization
# logic, so the test was checking nothing at all.
#
# So each scenario gets its own repository, with a bare repository beside it
# standing in for origin. The real git does the real work: fetch, the
# ancestry check, the version-bump commit and the push all behave as they do
# in a real release, so the test exercises the script rather than a
# replacement for it.
make_sandbox() { # $1 = sandbox dir, $2 = notarize exit code, $3 = "devid" or "adhoc", $4 = staple valid or not
    local sb="$1"
    # The repository root is the parent of the directory release.sh sits in,
    # because release.sh reaches the site checks and the landing page as
    # ../scripts and ../site.
    local repo="$sb/repo"
    mkdir -p "$repo/VisualiserMac/scripts" "$repo/scripts" "$repo/site"
    mkdir -p "$repo/VisualiserMac/build" "$repo/VisualiserMac/dist"

    # A bare repository to stand in for origin. The push at the end of
    # release.sh has to go somewhere, and it has to leave origin/main
    # pointing at the commit that was pushed — that is the commit the
    # release names, so a push that went nowhere would not be testing the
    # thing that matters.
    git init -q --bare "$sb/origin.git"

    git -C "$repo" init -q -b main .
    git -C "$repo" config user.email "release-test@example.invalid"
    git -C "$repo" config user.name "Release Test"
    git -C "$repo" config commit.gpgsign false
    git -C "$repo" remote add origin "$sb/origin.git"

    # The files release.sh touches have to exist before it starts: the
    # version it writes and the landing page's version it keeps in step.
    printf '0.10.2126\n' > "$repo/VisualiserMac/VERSION"
    printf '<html><script type="application/ld+json">{"softwareVersion":"0.10.2126"}</script></html>\n' > "$repo/site/index.html"

    # `npm test` runs the Worker's tests. It needs a package.json to read,
    # and it is run from the repository root — which is one level above the
    # directory release.sh sits in.
    printf '{"name":"sandbox","version":"0.0.0","scripts":{"test":"echo \\"==> [stub] npm test\\""}}\n' > "$repo/package.json"

    git -C "$repo" add -A
    git -C "$repo" commit -qm "Sandbox"
    git -C "$repo" push -q -u origin main

    # The stubs live where release.sh looks for them: ./scripts/ beside it,
    # and ../scripts one level up for the site checks.
    cp "$WORK/scripts/"* "$repo/scripts/" 2>/dev/null || true

    # The stub notarize.sh either fails or "succeeds".
    cat > "$repo/VisualiserMac/scripts/notarize.sh" <<EOF
#!/bin/bash
echo "==> [stub] notarize.sh running"
exit $2
EOF
    chmod +x "$repo/VisualiserMac/scripts/notarize.sh"

    # A bundle-shaped thing for codesign to look at. It has to be a real
    # directory with a real executable in it, because release.sh packages it
    # with ditto afterwards — ditto will not copy a bundle that is not one.
    mkdir -p "$repo/VisualiserMac/build/Vibresia.app/Contents/MacOS"
    printf '#!/bin/bash\nexit 0\n' > "$repo/VisualiserMac/build/Vibresia.app/Contents/MacOS/Vibresia"
    chmod +x "$repo/VisualiserMac/build/Vibresia.app/Contents/MacOS/Vibresia"

    # Stubs on PATH: codesign reports the identity, xcrun validates or not,
    # gh does nothing, version.sh and build-app.sh are no-ops.
    mkdir -p "$sb/bin"
    if [ "$3" = "devid" ]; then
        cat > "$sb/bin/codesign" <<'EOF'
#!/bin/bash
# The verification of the unpacked zip is a separate concern, tested below;
# here it just has to succeed.
case " $* " in
  *" --verify "*) exit 0 ;;
esac
# The authority line comes first and there is a lot of output after it,
# which is what real codesign does. A reader that stops at the first match
# closes the pipe, codesign dies of SIGPIPE, and with pipefail on the
# whole thing reads as a failure — so a checker that pipes into `grep -q`
# would report "not signed with an identity" for an app that is.
echo "Authority=Developer ID Application: Test Org (ABCDE12345)"
i=0
while [ $i -lt 5000 ]; do
    echo "Identifier=com.example.app"
    i=$((i + 1))
done
EOF
    else
        cat > "$sb/bin/codesign" <<'EOF'
#!/bin/bash
case " $* " in
  *" --verify "*) exit 0 ;;
esac
echo "Signature=adhoc"
i=0
while [ $i -lt 5000 ]; do
    echo "Identifier=com.example.app"
    i=$((i + 1))
done
EOF
    fi
    chmod +x "$sb/bin/codesign"

    # The release unpacks its own zip and checks the result. The stub
    # unpacks to a directory with no AppleDouble files in it, which is what
    # a clean zip produces.
    cat > "$sb/bin/unzip" <<'EOF'
#!/bin/bash
dest=""
prev=""
for a in "$@"; do
  if [ "$prev" = "-d" ]; then dest="$a"; fi
  prev="$a"
done
[ -n "$dest" ] && mkdir -p "$dest/Vibresia.app"
exit 0
EOF
    chmod +x "$sb/bin/unzip"

    if [ "$4" = "valid" ]; then
        cat > "$sb/bin/xcrun" <<'EOF'
#!/bin/bash
exit 0
EOF
    else
        cat > "$sb/bin/xcrun" <<'EOF'
#!/bin/bash
exit 1
EOF
    fi
    chmod +x "$sb/bin/xcrun"

    # `gh release view` is how release.sh asks whether the tag is already
    # taken: it must fail, or the script thinks the release exists and stops.
    # `gh release create` is the publish step, and should succeed.
    cat > "$sb/bin/gh" <<'EOF'
#!/bin/bash
if [ "$1" = "release" ] && [ "$2" = "view" ]; then
    exit 1
fi
echo "==> [stub] gh $*"
EOF
    chmod +x "$sb/bin/gh"

    # `swift test` runs the app's own tests. The sandbox has no Swift package
    # — this test is about the release script's control flow, not about
    # whether the app's tests pass — and a real `swift test` in a directory
    # with no Package.swift stops the release before it reaches any of the
    # logic under test.
    cat > "$sb/bin/swift" <<'EOF'
#!/bin/bash
echo "==> [stub] swift $*"
exit 0
EOF
    chmod +x "$sb/bin/swift"

    # version.sh --write has to write the version, because release.sh commits
    # VERSION afterwards and the release names the commit that holds it. A
    # stub that only printed the version would leave the bump uncommitted
    # and the release would publish a tag pointing at a commit with no
    # version in it — which is the thing the version-bump commit exists to
    # prevent.
    cat > "$repo/VisualiserMac/version.sh" <<'EOF'
#!/bin/bash
version="0.10.2126"
if [ "${1:-}" = "--write" ]; then
    printf '%s\n' "$version" > VERSION
    python3 - ../site/index.html "$version" <<'PY'
import re, sys
path, version = sys.argv[1], sys.argv[2]
html = open(path).read()
new, n = re.subn(r'("softwareVersion":\s*")[^"]*(")', r'\g<1>' + version + r'\g<2>', html, count=1)
if n:
    open(path, "w").write(new)
PY
fi
printf '%s\n' "$version"
EOF
    chmod +x "$repo/VisualiserMac/version.sh"

    cat > "$repo/VisualiserMac/build-app.sh" <<'EOF'
#!/bin/bash
echo "==> [stub] build-app.sh $*"
EOF
    chmod +x "$repo/VisualiserMac/build-app.sh"

    # The real release.sh, unchanged. Its git calls work because the sandbox
    # is a repository with an origin to fetch from and push to.
    cp "$release_sh" "$repo/VisualiserMac/release.sh"
    chmod +x "$repo/VisualiserMac/release.sh"

    # The scenario runs in the directory release.sh lives in.
    echo "$repo/VisualiserMac" > "$sb/run-here"
}

echo "release.sh notarization control flow"
echo

# Run release.sh in the sandbox, from the directory it was copied into.
run_release() { # $1 = sandbox dir
    local sb="$1"
    local run_here
    run_here="$(cat "$sb/run-here")"
    out="$(cd "$run_here" && PATH="$sb/bin:$PATH" ./release.sh 2>&1)"; rc=$?
}

echo "1. ad-hoc build, no identity, no ticket -> proceeds with a warning"
make_sandbox "$WORK/a" 0 adhoc invalid
run_release "$WORK/a"
check "proceeds" 0 "$rc"
# The output is matched with a here-string rather than a pipe. `echo "$out" |
# grep -q ...` finds the match, grep exits, the pipe closes, and echo dies of
# SIGPIPE — which, with pipefail on, reads as the check failing. The
# release script and notarize.sh have the same note about the same trap.
grep -q "NOT notarized" <<<"$out" \
    && { echo "  ok    warns that it is not notarized"; pass=$((pass+1)); } \
    || { echo "  FAIL  no warning about notarization"; fail=$((fail+1)); }

echo
echo "2. Developer ID, notarization succeeds -> proceeds"
make_sandbox "$WORK/b" 0 devid valid
run_release "$WORK/b"
check "proceeds" 0 "$rc"
grep -q "notarizing before release" <<<"$out" \
    && { echo "  ok    notarization ran"; pass=$((pass+1)); } \
    || { echo "  FAIL  notarization did not run"; fail=$((fail+1)); }

echo
echo "3. Developer ID, notarization fails -> aborts, nothing published"
make_sandbox "$WORK/c" 1 devid valid
run_release "$WORK/c"
check "aborts" 1 "$rc"
grep -q "not going out" <<<"$out" \
    && { echo "  ok    explains why"; pass=$((pass+1)); } \
    || { echo "  FAIL  no explanation"; fail=$((fail+1)); }
grep -q "gh release create" <<<"$out" \
    && { echo "  FAIL  published anyway"; fail=$((fail+1)); } \
    || { echo "  ok    nothing was published"; pass=$((pass+1)); }

echo
echo "4. Developer ID, notarization claims success but no valid ticket -> aborts"
make_sandbox "$WORK/d" 0 devid invalid
run_release "$WORK/d"
check "aborts" 1 "$rc"
grep -q "no valid notarization ticket" <<<"$out" \
    && { echo "  ok    caught the invalid ticket"; pass=$((pass+1)); } \
    || { echo "  FAIL  invalid ticket not caught"; fail=$((fail+1)); }

echo
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]

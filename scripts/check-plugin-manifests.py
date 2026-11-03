#!/usr/bin/env python3
"""Check the manifests that describe the public MCP server.

There are four of them, and they say the same thing in four dialects: the
official registry's entry, the client config, the Cursor plugin manifest and
the Gemini CLI extension manifest. A directory reads whichever one it knows
about, so a version that has drifted in one of them is a directory that shows
the wrong number — or a plugin that installs and then points at nothing.

server.json is the one place the version is written down. The Worker reads it
and reports it in serverInfo, so the registry and the server cannot disagree
with each other. This checks that the manifests beside it agree too, and that
each one still says what its reader needs it to say.

It is deliberately offline: it reads the repository, not the network. The
endpoint is checked by asking it, which is a different job.

Usage: python3 scripts/check-plugin-manifests.py [repo-root]
"""

import json
import os
import re
import sys

FAILURES = []


def fail(message):
    FAILURES.append(message)


def load(root, path):
    full = os.path.join(root, path)
    if not os.path.exists(full):
        fail(f"{path} is missing")
        return None
    try:
        with open(full, encoding="utf-8") as handle:
            return json.load(handle)
    except json.JSONDecodeError as error:
        fail(f"{path} is not valid JSON: {error}")
        return None


def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")

    server = load(root, "server.json")
    cursor = load(root, ".cursor-plugin/plugin.json")
    gemini = load(root, "gemini-extension.json")
    client = load(root, "mcp.json")
    if server is None:
        print("server.json is missing, so there is nothing to compare against")
        return 1

    version = server.get("version")
    endpoint = None
    for remote in server.get("remotes", []):
        if remote.get("type") == "streamable-http":
            endpoint = remote.get("url")
    if not endpoint:
        fail("server.json has no streamable-http remote, so there is no endpoint to check the manifests against")
        endpoint = ""

    # --- the versions ------------------------------------------------------
    # Each manifest carries its own version. They are all the same version,
    # because they all describe the same server.
    for path, manifest in ((".cursor-plugin/plugin.json", cursor),
                           ("gemini-extension.json", gemini)):
        if manifest is None:
            continue
        if manifest.get("version") != version:
            fail(f"{path} says version {manifest.get('version')!r}, but server.json says {version!r}")

    # --- the Cursor plugin manifest ---------------------------------------
    # The checklist Cursor's own docs give for a marketplace submission.
    if cursor is not None:
        name = cursor.get("name", "")
        if not name:
            fail(".cursor-plugin/plugin.json has no name")
        elif not re.fullmatch(r"[a-z0-9]([a-z0-9.-]*[a-z0-9])?", name):
            fail(f".cursor-plugin/plugin.json name {name!r} is not lowercase kebab-case")
        if not cursor.get("description"):
            fail(".cursor-plugin/plugin.json has no description")
        for field in ("author", "homepage", "repository", "license"):
            if not cursor.get(field):
                fail(f".cursor-plugin/plugin.json has no {field}")
        logo = cursor.get("logo", "")
        if not logo:
            fail(".cursor-plugin/plugin.json has no logo")
        elif logo.startswith("http"):
            pass  # An absolute URL is allowed, but a committed one is better.
        elif ".." in logo or logo.startswith("/"):
            fail(f".cursor-plugin/plugin.json logo path {logo!r} is not relative")
        elif not os.path.exists(os.path.join(root, logo)):
            fail(f".cursor-plugin/plugin.json points at {logo}, which is not in the repository")

    # --- the client config -------------------------------------------------
    # Cursor finds mcp.json at the plugin root on its own, and infers the
    # transport from the url.
    if client is not None:
        servers = client.get("mcpServers", {})
        if "vibresia" not in servers:
            fail("mcp.json has no server called vibresia")
        else:
            url = servers["vibresia"].get("url", "")
            if url != endpoint:
                fail(f"mcp.json points at {url!r}, but server.json says {endpoint!r}")

    # --- the Gemini extension manifest ------------------------------------
    # Gemini spells the streamable-http endpoint `httpUrl`, and the extension
    # is named after the directory it is installed into, which is the
    # repository.
    if gemini is not None:
        name = gemini.get("name", "")
        if name != "vibresia":
            fail(f"gemini-extension.json is named {name!r}, but the repository is vibresia")
        servers = gemini.get("mcpServers", {})
        if "vibresia" not in servers:
            fail("gemini-extension.json has no server called vibresia")
        else:
            url = servers["vibresia"].get("httpUrl", "")
            if url != endpoint:
                fail(f"gemini-extension.json points at {url!r}, but server.json says {endpoint!r}")
            if servers["vibresia"].get("url"):
                fail("gemini-extension.json has both url and httpUrl; Gemini wants httpUrl")

    if FAILURES:
        for failure in FAILURES:
            print(f"❌ {failure}")
        return 1
    print(f"the manifests agree, and all say version {version}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

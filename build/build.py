#!/usr/bin/env python3
"""
build.py — Concatène le dev multi-fichiers en un index.html unique.

Identique à build.mjs mais en Python (plus accessible si Node n'est pas installé).

Usage :
    python3 build/build.py

Sortie : dist/grace.html
"""

import re
from datetime import datetime, timezone
from pathlib import Path

ROOT     = Path(__file__).resolve().parent.parent
SRC_DIR  = ROOT / "src"
DIST_DIR = ROOT / "dist"
INDEX    = SRC_DIR / "index.html"
OUT      = DIST_DIR / "grace.html"


def is_local(href: str) -> bool:
    return not re.match(r"^https?://", href, re.I)


def read_local(rel_path: str) -> str:
    return (SRC_DIR / rel_path).read_text(encoding="utf-8")


def inline_css(html: str) -> str:
    pattern = re.compile(r'<link\s+rel="stylesheet"\s+href="([^"]+)"\s*[^>]*>')

    def replace(match: re.Match) -> str:
        href = match.group(1)
        if not is_local(href):
            return match.group(0)
        return f"<style>\n{read_local(href)}\n</style>"

    return pattern.sub(replace, html)


def inline_js(html: str) -> str:
    pattern = re.compile(r'<script(?:\s+defer)?\s+src="([^"]+)"\s*[^>]*></script>')

    def replace(match: re.Match) -> str:
        src = match.group(1)
        if not is_local(src):
            return match.group(0)
        return f"<script>\n{read_local(src)}\n</script>"

    return pattern.sub(replace, html)


def main() -> None:
    html = INDEX.read_text(encoding="utf-8")
    html = inline_css(html)
    html = inline_js(html)
    stamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
    html = html.replace("<head>", f"<head>\n<!-- Grace build {stamp} -->", 1)
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    (ROOT / "index.html").write_text(html, encoding="utf-8")
    size_kb = len(html.encode("utf-8")) / 1024
    print(f"\u2713 Build OK \u2192 {OUT} ({size_kb:.1f} ko)")


if __name__ == "__main__":
    main()

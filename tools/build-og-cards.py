#!/usr/bin/env python3
"""Render a social share card (og:image) for every page and every insight.

    python3 tools/build-og-cards.py              # everything
    python3 tools/build-og-cards.py --pages      # static pages only
    python3 tools/build-og-cards.py --insights   # articles only

Writes public/og/<key>.png at 1200x630. Base.astro derives the same key from
the request path and falls back to /og.png when a card is missing, so a new
page that nobody has re-rendered degrades to the old shared card rather than
to a broken image.

Why: all 108 URLs shared one /og.png, and over 100 of them are insight
articles. Every essay posted to LinkedIn looked like every other one, and the
card said nothing about which piece it was.

The design follows public/og.png, which is the master: void ground, an
emerald wash and the arc-and-chart glyph on the right third, the institute
name as a letterspaced eyebrow over a short rule, and the page's own words
below it. Articles put the title where the master puts its two-tone headline
and add a date and read time underneath; the furniture never moves.

Type is laid out by headless Chromium with the site's own DM Sans (the woff2
files in tools/fonts, copied from the shared BBE type system) rather than by
a drawing library, and rendered at 2x then downsampled -- the titles run long
and a 1x render shows it.
"""

from __future__ import annotations

import argparse
import base64
import datetime as dt
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "src" / "pages"
BLOG = ROOT / "src" / "content" / "blog"
OUT = ROOT / "public" / "og"
FONTS = Path(__file__).resolve().parent / "fonts"

WIDTH, HEIGHT = 1200, 630
SCALE = 2

# Brand tokens, from src/styles/theme.css. Keep in step with it.
VOID = "#070b09"
EMERALD = "#059669"
SAGE = "#a7d8c4"
CREAM = "#faf8f4"
MIST = "rgba(250, 248, 244, 0.66)"

SUFFIX = re.compile(r"\s*[|·]\s*Executive AI Institute\s*$", re.I)


def key_for(path: str) -> str:
    """URL path -> card key. Base.astro carries the identical function."""
    p = path.strip("/")
    if not p:
        return "home"
    return re.sub(r"[^a-z0-9]+", "-", p.lower()).strip("-")


def read_static_pages() -> list[dict]:
    """Titles and descriptions come off each page's own <Base ...> call."""
    cards = []
    for f in sorted(PAGES.rglob("*.astro")):
        if f.name.startswith("[") or f.name == "404.astro":
            continue
        rel = f.relative_to(PAGES).with_suffix("")
        url = "/" if rel.name == "index" and rel.parent == Path(".") else \
              f"/{rel.parent}/" if rel.name == "index" else f"/{rel}/"
        url = url.replace("//", "/")

        src = f.read_text(encoding="utf-8")
        m = re.search(r"<Base\b([^>]*)>", src, re.S)
        attrs = m.group(1) if m else ""
        title = re.search(r'title=(?:"([^"]*)"|\{`([^`]*)`\})', attrs)
        desc = re.search(r'description=(?:"([^"]*)"|\{`([^`]*)`\})', attrs)

        raw = next((g for g in (title.groups() if title else ()) if g), None)
        # index.astro calls <Base> bare and takes the layout's own defaults.
        headline = SUFFIX.sub("", raw) if raw else "Leadership for the age of AI."
        sub = next((g for g in (desc.groups() if desc else ()) if g), "")
        if not sub and url == "/":
            # The master card's own sub-line, since <Base> is called bare here.
            sub = "People-first AI strategy for senior leaders"
        cards.append({
            "key": key_for(url),
            "url": url,
            "headline": headline,
            "sub": sub,
            "meta": "",
        })
    return cards


def read_insights() -> list[dict]:
    cards = []
    for f in sorted(BLOG.glob("*.md")):
        text = f.read_text(encoding="utf-8")
        fm = text.split("---", 2)
        if len(fm) < 3:
            print(f"  ! no frontmatter: {f.name}", file=sys.stderr)
            continue
        head = fm[1]

        def field(name):
            m = re.search(rf'^{name}:\s*"?(.*?)"?\s*$', head, re.M)
            return m.group(1) if m else ""

        if field("draft").lower() == "true":
            continue

        date = field("pubDate")
        try:
            stamp = dt.date.fromisoformat(date).strftime("%-d %B %Y")
        except ValueError:
            stamp = ""
        mins = field("readMinutes")
        meta = " · ".join(x for x in (stamp, f"{mins} min read" if mins else "") if x)

        cards.append({
            "key": key_for(f"/insights/{f.stem}/"),
            "url": f"/insights/{f.stem}/",
            "headline": field("title"),
            "sub": "",
            "meta": meta or "Insight",
        })
    return cards


def data_uri(path: Path, mime: str) -> str:
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def card_html(card: dict, fonts: dict[int, str]) -> str:
    faces = "\n".join(
        f"@font-face {{ font-family:'DM Sans'; src:url('{uri}') format('woff2');"
        f" font-weight:{w}; font-style:normal; font-display:block; }}"
        for w, uri in fonts.items()
    )
    sub = card.get("sub") or ""
    # An article carries its date and read time; a page carries its description.
    # No character truncation: -webkit-line-clamp already ellipsises at the
    # real line break, and doing both put a "…" in the middle of a line.
    footer = card.get("meta") or sub

    return f"""<!doctype html><meta charset="utf-8">
<style>
  {faces}
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  html, body {{ width:{WIDTH}px; height:{HEIGHT}px; overflow:hidden; }}
  body {{
    background:{VOID}; color:{CREAM};
    font-family:'DM Sans', system-ui, sans-serif; position:relative;
  }}
  /* The master's emerald wash across the right third. */
  .wash {{
    position:absolute; inset:0;
    background:linear-gradient(100deg,
      {VOID} 0%, {VOID} 46%, rgba(6,95,70,.30) 62%,
      rgba(5,150,105,.62) 84%, rgba(5,150,105,.86) 100%);
  }}
  .glyph {{ position:absolute; right:56px; top:50%; transform:translateY(-50%); opacity:.92; }}

  .body {{ position:absolute; left:78px; top:0; bottom:0; width:660px;
           display:flex; flex-direction:column; justify-content:center; }}
  .eyebrow {{
    font-weight:700; font-size:21px; letter-spacing:.22em;
    color:{EMERALD}; text-transform:uppercase;
  }}
  .rule {{ width:84px; height:5px; background:{EMERALD}; margin:22px 0 30px; }}
  .headline {{ font-weight:700; font-size:58px; line-height:1.13; letter-spacing:-.015em; }}
  /* Clamped to two lines. Without this a long description is the tallest
     thing in the column, and a loop that measures the column shrinks the
     HEADLINE to make room for it -- which is exactly backwards. */
  .footer {{
    margin-top:26px; font-size:23px; font-weight:400; color:{MIST};
    line-height:1.4; max-height:2.8em; overflow:hidden;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
  }}
</style>
<div class="wash"></div>
<svg class="glyph" width="330" height="330" viewBox="0 0 330 330" fill="none">
  <circle cx="165" cy="165" r="150" stroke="{SAGE}" stroke-opacity=".55" stroke-width="2"/>
  <polyline points="60,268 140,168 200,206 272,86" fill="none"
            stroke="{SAGE}" stroke-opacity=".75" stroke-width="9"
            stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="60" cy="268" r="15" fill="{EMERALD}"/>
  <circle cx="140" cy="168" r="15" fill="{EMERALD}"/>
  <circle cx="200" cy="206" r="15" fill="{EMERALD}"/>
  <circle cx="272" cy="86" r="19" fill="{CREAM}"/>
</svg>
<div class="body">
  <div class="eyebrow">Executive AI Institute</div>
  <div class="rule"></div>
  <div class="headline" id="headline">{html.escape(card["headline"])}</div>
  {f'<div class="footer">{html.escape(footer)}</div>' if footer else ''}
</div>
<script>
  // Shrink to fit. Insight titles run from four words to twenty-four, and a
  // character-count guess cannot know how a 58px face breaks -- the failure is
  // silent, the longest title simply walks off the bottom of the card.
  const el = document.getElementById('headline');
  for (let size = 58; size >= 30; size -= 1) {{
    el.style.fontSize = size + 'px';
    if (el.scrollHeight <= 290) break;   // about four lines at full size
  }}
</script>
"""


def render(cards: list[dict]) -> None:
    from playwright.sync_api import sync_playwright
    from PIL import Image
    import io

    fonts = {w: data_uri(FONTS / f"DMSans-{w}.woff2", "font/woff2")
             for w in (400, 500, 700)}
    OUT.mkdir(parents=True, exist_ok=True)

    total = 0
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(
            viewport={"width": WIDTH, "height": HEIGHT},
            device_scale_factor=SCALE,
        )
        for card in cards:
            page.set_content(card_html(card, fonts))
            page.wait_for_timeout(120)
            img = Image.open(io.BytesIO(page.screenshot(type="png"))).convert("RGB")
            img = img.resize((WIDTH, HEIGHT), Image.LANCZOS)
            # The art is flat colour plus one gradient, so a 128-colour palette
            # is visually lossless here and keeps ~100 cards out of megabyte
            # territory in a repo that is pushed to GitHub on every blog save.
            img.convert("P", palette=Image.ADAPTIVE, colors=128).save(
                OUT / f"{card['key']}.png", optimize=True)
            total += (OUT / f"{card['key']}.png").stat().st_size
        browser.close()

    print(f"  {len(cards)} cards, {total // 1024} KB total, "
          f"avg {total // max(len(cards), 1) // 1024} KB")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages", action="store_true")
    ap.add_argument("--insights", action="store_true")
    args = ap.parse_args()

    both = not (args.pages or args.insights)
    cards = []
    if both or args.pages:
        cards += read_static_pages()
    if both or args.insights:
        cards += read_insights()

    seen = {}
    for c in cards:
        if c["key"] in seen:
            sys.exit(f"duplicate card key {c['key']}: {seen[c['key']]} and {c['url']}")
        seen[c["key"]] = c["url"]

    print(f"rendering {len(cards)} card(s)")
    render(cards)


if __name__ == "__main__":
    main()

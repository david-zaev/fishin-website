"""Builds the knot guide pages: knots/index.html and knots/<slug>/index.html.

The knot data below is copied from the FishIn app (Knots.kt for use, lines, strength and difficulty;
RigLabels.kt and strings.xml for the descriptions, steps and when each knot is picked). When the app's
knots change, update KNOTS here and run:

    python tools/build_knots.py
"""

from __future__ import annotations

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://fishinapp.site"
PLAY = "https://play.google.com/store/apps/details?id=com.daev.fishin"
VERSION = "11"
UPDATED = "2026-10-26"

TIGHTEN = "Wet the knot, pull it tight slowly and trim the end."

USES = {
    "terminal": ("Hooks, swivels and lures", "Line to an eye or ring: hooks, swivels, snaps and lures."),
    "line": ("Line to line", "Joining two lines: main line to leader, or mending a break."),
    "loop": ("Loops", "Loops for droppers and loop-to-loop connections."),
    "stop": ("Stops", "A stop on the line to set the depth of a sliding float."),
}
LINES = {"mono": "Mono", "fluoro": "Fluorocarbon", "braid": "Braid", "wire": "Wire"}
DIFFICULTY = {1: "Easy", 2: "Medium", 3: "Takes practice"}

# Why the app's rig builder picks a knot (strings.xml, knot_reason_*).
REASONS = {
    "mono_eye": "Mono to an eye: the improved clinch is quick to tie and holds well.",
    "fluoro_eye": "Fluorocarbon is stiff and can slip in a clinch; a palomar grips it best.",
    "braid_eye": "Braid is slippery: a palomar doesn't slip and keeps nearly all its strength.",
    "wire": "Wire doesn't hold a knot like nylon: crimp a sleeve on it, or join it to line with an Albright.",
    "spade": "No eye to go through: the line is whipped onto the shank and the spade holds it. Use nylon; braid can cut on the spade's edge.",
    "lure_loop": "A loop lets a crankbait or jerkbait swing freely, so it swims better than on a tight knot.",
    "braid_lure": "A loop knot slips in braid: tie a palomar, or add a fluoro leader and tie the loop in that.",
    "braid_leader": "Braid to leader: the FG knot is slim and strong, and runs through the rod rings when you cast.",
    "similar": "Two lines of about the same thickness: a blood knot joins them neatly.",
    "different": "Lines of different thickness: a double uni holds both.",
    "branch": "A dropper loop stands out from the main line, so the side hook doesn't tangle round it.",
    "braid_branch": "Dropper loops slip in braid and can't be tied in wire: use a three-way swivel and tie each line on with a palomar.",
    "stop": "The stop sets the depth: the sliding float runs up the line to it and stops.",
}

KNOTS = [
    dict(slug="improved-clinch", name="Improved clinch", title="Improved clinch knot", use="terminal", lines=["mono"], strength=90, difficulty=1,
         desc="The classic: five to seven turns of the tag end round the line, back through the first loop, then through the big loop it makes.",
         steps=["Pass the line through the eye and pull about 15 cm through.",
                "Twist the end round the line five to seven times.",
                "Bring the end back and through the small loop next to the eye.",
                "Then tuck it through the big loop you've just made."],
         best=["mono_eye"], alt=["lure_loop"]),
    dict(slug="palomar", name="Palomar", title="Palomar knot", use="terminal", lines=["mono", "fluoro", "braid"], strength=95, difficulty=1,
         desc="The line doubled through the eye, an overhand knot tied with the loop, and the loop passed over the hook or lure.",
         steps=["Double 15 cm of line and push the loop through the eye.",
                "Tie a loose overhand knot with the doubled line, the loop hanging free.",
                "Pass the loop right over the hook or lure."],
         best=["fluoro_eye", "braid_eye", "braid_lure", "braid_branch"], alt=["mono_eye", "lure_loop"]),
    dict(slug="uni", name="Uni knot", title="Uni knot", use="terminal", lines=["mono", "fluoro", "braid"], strength=90, difficulty=1,
         desc="Turns made inside a loop laid along the line, then pulled down to the eye. Works in any line.",
         steps=["Pass the line through the eye and lay the end along the line.",
                "Bring the end back towards the eye over both, making a loop.",
                "Wrap the end round both lines five or six times, inside the loop."],
         best=[], alt=["mono_eye", "fluoro_eye", "braid_eye", "braid_lure"]),
    dict(slug="san-diego-jam", name="San Diego jam", title="San Diego jam knot", use="terminal", lines=["mono", "fluoro"], strength=95, difficulty=2,
         desc="Turns over both strands, the tag back through the bottom loop and the top one. Very strong in fluorocarbon.",
         steps=["Pass the line through the eye and pull 20 cm through.",
                "Hold both lines together and wrap the end round them six to eight times.",
                "Tuck the end through the bottom loop by the eye, then through the top loop."],
         best=[], alt=["fluoro_eye"]),
    dict(slug="snell", name="Snell", title="Snell knot", use="terminal", lines=["mono", "fluoro"], strength=95, difficulty=2,
         desc="Turns round the hook's shank instead of the eye, so the pull comes straight in line with the point.",
         steps=["Push the line through the eye and lay it along the shank, a loop hanging below.",
                "Wind the loop round the shank and line six to eight times, from the eye towards the bend."],
         best=[], alt=["mono_eye", "fluoro_eye"]),
    dict(slug="rapala-loop", name="Rapala loop", title="Rapala loop knot", use="terminal", lines=["mono", "fluoro"], strength=90, difficulty=2,
         desc="A non-slip loop at the lure's eye, so the lure swings freely and swims as it's meant to.",
         steps=["Tie a loose overhand knot 10 cm from the end, then pass the end through the lure's eye.",
                "Bring the end back up through the overhand knot.",
                "Wrap it round the line three times.",
                "Go back through the overhand knot the way the end came out."],
         best=["lure_loop"], alt=[]),
    dict(slug="crimp-sleeve", name="Crimp sleeve", title="Crimp sleeve for wire", use="terminal", lines=["wire"], strength=95, difficulty=1,
         desc="A metal sleeve pressed shut with crimping pliers. For wire, which doesn't hold a knot.",
         steps=["Slide a sleeve onto the wire and pass the wire through the eye.",
                "Bring the end back through the sleeve, leaving a small loop at the eye."],
         last="Squeeze the sleeve flat with crimping pliers and trim the end.",
         best=["wire"], alt=[]),
    dict(slug="spade-end", name="Spade end knot", title="Spade end knot", use="terminal", lines=["mono", "fluoro"], strength=95, difficulty=3,
         desc="Turns whipped round the shank just under the spade, for hooks without an eye. The spade stops it sliding off.",
         steps=["Lay the line along the shank from the spade, then loop the end back towards it.",
                "Wrap the end round the shank and both lines seven or eight times, working towards the bend.",
                "Tuck the end through the loop and pull the line so it closes up under the spade."],
         best=["spade"], alt=[]),
    dict(slug="double-uni", name="Double uni", title="Double uni knot", use="line", lines=["mono", "fluoro", "braid"], strength=85, difficulty=1,
         desc="A uni knot in each line round the other, pulled together. Joins almost any two lines.",
         steps=["Lay the two lines side by side, the ends overlapping by 15 cm.",
                "With one end, make a loop and tie a uni knot round both lines: four or five turns.",
                "Do the same with the other end, the other way."],
         best=["different"], alt=["braid_leader", "similar"]),
    dict(slug="blood-knot", name="Blood knot", title="Blood knot", use="line", lines=["mono", "fluoro"], strength=85, difficulty=2,
         desc="The two ends wrapped round each other and tucked back through the middle. Neat and slim.",
         steps=["Overlap the two ends by about 15 cm.",
                "Wrap one end round the other line five times and bring it back between the lines in the middle.",
                "Wrap the other end the other way and tuck it through the same gap from the other side."],
         best=["similar"], alt=[]),
    dict(slug="surgeons-knot", name="Surgeon's knot", title="Surgeon's knot", use="line", lines=["mono", "fluoro"], strength=85, difficulty=1,
         desc="Both lines laid together and tied in a double overhand. Quick, even with cold hands.",
         steps=["Lay the leader alongside the line, the ends overlapping.",
                "Treat both as one and tie an overhand knot, pulling the whole leader through.",
                "Pass both ends through the loop once more."],
         best=[], alt=["different", "similar"]),
    dict(slug="fg-knot", name="FG knot", title="FG knot", use="line", lines=["braid", "mono", "fluoro"], strength=95, difficulty=3,
         desc="Braid woven round the leader in crossing turns, locked with half hitches. Slim enough to run through the rod rings.",
         steps=["Hold the braid tight and lay the leader across it.",
                "Wrap the braid round the leader in criss-cross turns, front then back, 15 to 20 times.",
                "Lock it with a few half hitches round both lines."],
         best=["braid_leader"], alt=[]),
    dict(slug="albright", name="Albright", title="Albright knot", use="line", lines=["braid", "mono", "fluoro", "wire"], strength=85, difficulty=2,
         desc="The thin line wrapped round a loop of the thick one. Good for lines of very different thickness.",
         steps=["Make a loop in the thicker line and push the thin line through it.",
                "Wrap the thin line back round both sides of the loop ten times.",
                "Push the end out through the loop the way it went in."],
         best=["wire"], alt=["braid_leader", "different"]),
    dict(slug="dropper-loop", name="Dropper loop", title="Dropper loop knot", use="loop", lines=["mono", "fluoro"], strength=80, difficulty=2,
         desc="A loop twisted out of the middle of the line, standing off it, to hang a hook from.",
         steps=["Make a loop in the line where you want the dropper.",
                "Twist the loop's two legs round each other five or six times.",
                "Push the loop down through the middle twist and pull it out below."],
         best=["branch"], alt=[]),
    dict(slug="perfection-loop", name="Perfection loop", title="Perfection loop knot", use="loop", lines=["mono", "fluoro"], strength=90, difficulty=2,
         desc="A neat loop at the end of a line, for joining loop to loop.",
         steps=["Make a loop at the end of the line, the end behind it.",
                "Make a second, smaller loop in front of the first.",
                "Pass the end between the loops, then pull the second loop up through the first."],
         best=[], alt=["branch"]),
    dict(slug="stop-knot", name="Stop knot", title="Stop knot for a sliding float", use="stop", lines=["mono", "fluoro", "braid"], strength=100, difficulty=1,
         desc="A few turns of thread or line tied round the main line. It slides to set the depth and still runs through the rings.",
         steps=["Lay a piece of stop thread along the line, its end looped back.",
                "Wrap the end round the line and thread five times, inside the loop."],
         best=["stop"], alt=[]),
]

ICONS = """<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="i-hook" viewBox="0 -960 960 960"><path fill="currentColor" d="M440-120q-100 0-170-70t-70-170v-192q0-14 12-19t22 5l138 138q11 11 11 27.5T372-372q-12 12-28.5 12T315-372l-35-35v47q0 66 47 113t113 47q66 0 113-47t47-113v-127q-36-14-58-44.5T520-600q0-38 22-68.5t58-44.5v-127q0-17 11.5-28.5T640-880q17 0 28.5 11.5T680-840v127q36 14 58 44.5t22 68.5q0 38-22 69t-58 44v127q0 100-70 170t-170 70Zm200-440q17 0 28.5-11.5T680-600q0-17-11.5-28.5T640-640q-17 0-28.5 11.5T600-600q0 17 11.5 28.5T640-560Z"/></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></symbol>
    <symbol id="i-play" viewBox="0 0 24 24"><path fill="currentColor" d="M4.6 2.8c-.3.3-.5.8-.5 1.4v15.6c0 .6.2 1.1.5 1.4l.1.1 8.7-8.7v-.2L4.7 2.7l-.1.1Zm11.7 11.7-2.9-2.9v-.2l2.9-2.9.1.1 3.4 2c1 .6 1 1.5 0 2.1l-3.4 2-.1-.2Zm-.1.1L13.3 12 4.6 20.6c.3.3.9.4 1.5 0l10.1-6Zm0-5.2L6.1 3.5c-.6-.4-1.2-.3-1.5 0L13.3 12l2.9-2.6Z"/></symbol>
    <symbol id="i-sun" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></g></symbol>
    <symbol id="i-moon" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></symbol>
  </defs>
</svg>"""


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def page(title: str, description: str, canonical: str, body: str, ld: list[dict]) -> str:
    lds = "\n".join(f'  <script type="application/ld+json">{json.dumps(d, ensure_ascii=False)}</script>' for d in ld)
    return f"""<!doctype html>
<html lang="en" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}">
  <link rel="canonical" href="{canonical}">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0c0c0c" media="(prefers-color-scheme: dark)">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{SITE}/assets/fishin-feature-1024x500.png">
  <link rel="icon" href="/assets/fishin-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/fishin-icon-rounded-1024.png">
  <script>document.documentElement.classList.remove('no-js');try{{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}}catch(e){{}}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css?v={VERSION}">
{lds}
</head>
<body>

{ICONS}

<a class="skip" href="#main">Skip to content</a>

<header class="nav" id="nav">
  <div class="wrap nav-inner">
    <a href="/" class="brand" aria-label="FishIn home"><span class="brand-mark"><svg><use href="#i-hook"/></svg></span>FishIn</a>
    <nav class="nav-links" aria-label="Main">
      <a href="/">Home</a>
      <a href="/#coach">Fish Coach</a>
      <a href="/knots/" aria-current="page">Knots</a>
      <a href="/#pricing">Pricing</a>
      <a href="/#faq">FAQ</a>
    </nav>
    <div class="nav-cta">
      <button class="icon-btn theme-toggle" id="themeToggle" type="button" aria-label="Switch theme"><svg class="i-moon"><use href="#i-moon"/></svg><svg class="i-sun"><use href="#i-sun"/></svg></button>
      <a class="btn btn-dark btn-sm" href="{PLAY}" target="_blank" rel="noopener">Get the app <svg class="arrow"><use href="#i-arrow"/></svg></a>
      <button class="icon-btn menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu"><span></span></button>
    </div>
  </div>
  <div class="mobile-menu" id="mobileMenu">
    <a href="/">Home</a>
    <a href="/#coach">Fish Coach</a>
    <a href="/knots/">Knots</a>
    <a href="/#pricing">Pricing</a>
    <a href="/#faq">FAQ</a>
    <a class="btn btn-dark" href="{PLAY}" target="_blank" rel="noopener"><svg><use href="#i-play"/></svg> Get it on Google Play</a>
  </div>
</header>

<main id="main">
{body}
</main>

<footer class="footer">
  <div class="wrap">
    <div class="footer-top">
      <div>
        <a href="/" class="brand"><span class="brand-mark"><svg><use href="#i-hook"/></svg></span>FishIn</a>
        <p>Fishing spots, forecasts, a catch log and friends. Made by an independent developer in North Macedonia, for anglers everywhere.</p>
      </div>
      <div class="footer-cols">
        <div class="footer-col">
          <h4>FishIn</h4>
          <a href="/">Home</a>
          <a href="/knots/">Knot guides</a>
          <a href="/#pricing">Pricing</a>
          <a href="{PLAY}" target="_blank" rel="noopener">Google Play</a>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <a href="/privacy.html">Privacy Policy</a>
          <a href="/terms.html">Terms of Use</a>
          <a href="/delete-account.html">Delete account</a>
          <a href="mailto:contact@fishinapp.site">Contact</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span class="year">2026</span> FishIn · com.daev.fishin</span>
      <span class="status"><i></i> Made for anglers</span>
    </div>
    <div class="wordmark" aria-hidden="true">FishIn</div>
  </div>
</footer>

<script src="/script.js?v={VERSION}"></script>
</body>
</html>
"""


def meter(k: dict) -> str:
    return (f'<div class="meter"><span class="meter-bar"><i style="width:{k["strength"]}%"></i></span>'
            f'<b>~{k["strength"]}%</b></div>')


def dots(k: dict) -> str:
    return '<span class="dots3">' + "".join(f'<i class="{"on" if i < k["difficulty"] else ""}"></i>' for i in range(3)) + "</span>"


def card(k: dict, level: str = "h3") -> str:
    return f"""<a class="knot-card" href="/knots/{k['slug']}/">
          <{level}>{esc(k['name'])} <svg><use href="#i-arrow"/></svg></{level}>
          <p>{esc(k['desc'])}</p>
          <div class="meta"><span>Strength <b>~{k['strength']}%</b></span><span>{DIFFICULTY[k['difficulty']]}</span><span>{", ".join(LINES[l] for l in k['lines'])}</span></div>
        </a>"""


def knot_page(k: dict) -> str:
    steps = k["steps"] + [k.get("last", TIGHTEN)]
    use_name, _ = USES[k["use"]]
    url = f"{SITE}/knots/{k['slug']}/"
    uses = "".join(f'<div class="use"><span class="tag">Best pick</span><span>{esc(REASONS[r])}</span></div>' for r in k["best"])
    uses += "".join(f'<div class="use"><span class="tag soft">Also good</span><span>{esc(REASONS[r])}</span></div>' for r in k["alt"])
    uses_block = f"""
        <section class="knot-section">
          <h2>When to use it</h2>
          <div class="uses">{uses}</div>
        </section>""" if uses else ""
    related = [o for o in KNOTS if o["use"] == k["use"] and o is not k][:3]
    if len(related) < 3:
        related += [o for o in KNOTS if o is not k and o not in related][: 3 - len(related)]
    body = f"""  <div class="wrap">
    <header class="knot-hero">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">FishIn</a><span aria-hidden="true">/</span><a href="/knots/">Knots</a><span aria-hidden="true">/</span><span>{esc(k['name'])}</span></nav>
      <span class="eyebrow">{esc(use_name)}</span>
      <h1 class="h-lg">How to tie the {esc(k['title'])}</h1>
      <p class="lead">{esc(k['desc'])}</p>
    </header>

    <div class="knot-layout">
      <div>
        <section class="knot-section">
          <h2>Step by step</h2>
          <ol class="steps-list">
            {"".join(f"<li><span>{esc(s)}</span></li>" for s in steps)}
          </ol>
        </section>{uses_block}

        <div class="app-cta">
          <div>
            <h2>Watch it tied in 3D</h2>
            <p>FishIn ties every knot step by step in 3D: turn it, zoom in and slow it down. The rig builder picks the right knot for each part of your rig.</p>
          </div>
          <a class="btn btn-light" href="{PLAY}" target="_blank" rel="noopener"><svg><use href="#i-play"/></svg> Get FishIn</a>
        </div>

        <section class="knot-section" style="margin-top:72px">
          <h2>Related knots</h2>
          <div class="related">
            {"".join(card(o) for o in related)}
          </div>
        </section>
      </div>

      <aside class="spec" aria-label="Knot at a glance">
        <h2>At a glance</h2>
        <div class="spec-row"><small>Line strength kept (rough)</small>{meter(k)}</div>
        <div class="spec-row"><small>Difficulty</small><div class="meter">{dots(k)}<b>{DIFFICULTY[k['difficulty']]}</b></div></div>
        <div class="spec-row"><small>Good with</small><div class="line-tags">{"".join(f"<span>{LINES[l]}</span>" for l in k['lines'])}</div></div>
        <div class="spec-row"><small>Used for</small><b>{esc(use_name)}</b></div>
        <div class="spec-row"><small>Steps</small><b>{len(steps)}</b></div>
        <a class="btn btn-dark" href="{PLAY}" target="_blank" rel="noopener">Watch it in 3D <svg class="arrow"><use href="#i-arrow"/></svg></a>
      </aside>
    </div>
  </div>"""
    title = f"How to tie the {k['title']} · Step by step · FishIn"
    description = f"How to tie the {k['title']} in {len(steps)} steps. {k['desc']} Good with {', '.join(LINES[l].lower() for l in k['lines'])}."
    ld = [
        {"@context": "https://schema.org", "@type": "HowTo", "name": f"How to tie the {k['title']}", "description": k["desc"],
         "url": url, "step": [{"@type": "HowToStep", "position": i + 1, "text": s} for i, s in enumerate(steps)],
         "tool": [{"@type": "HowToTool", "name": "Crimping pliers"}] if k["slug"] == "crimp-sleeve" else [],
         "supply": [{"@type": "HowToSupply", "name": LINES[l] + " line" if l != "wire" else "Wire"} for l in k["lines"]]},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "FishIn", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Knots", "item": SITE + "/knots/"},
            {"@type": "ListItem", "position": 3, "name": k["name"], "item": url}]},
    ]
    return page(title, description, url, body, ld)


def index_page() -> str:
    groups = ""
    for key, (name, blurb) in USES.items():
        ks = [k for k in KNOTS if k["use"] == key]
        groups += f"""
      <section class="knot-group">
        <div class="knot-group-head"><h2>{esc(name)}</h2><span>{esc(blurb)}</span></div>
        <div class="knot-grid">
        {"".join(card(k) for k in ks)}
        </div>
      </section>"""
    body = f"""  <div class="wrap">
    <header class="knot-hero">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">FishIn</a><span aria-hidden="true">/</span><span>Knots</span></nav>
      <span class="eyebrow">Knot guides</span>
      <h1 class="h-lg">{len(KNOTS)} fishing knots, step by step.</h1>
      <p class="lead">Every knot FishIn's rig builder uses: what it's for, which line it suits, how strong it is and how to tie it. In the app, each one is tied in 3D.</p>
    </header>
    <div style="padding-top:56px">{groups}
    </div>
  </div>"""
    ld = [{"@context": "https://schema.org", "@type": "ItemList", "name": "Fishing knots",
           "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": f"{SITE}/knots/{k['slug']}/", "name": k["title"]} for i, k in enumerate(KNOTS)]}]
    return page("Fishing knots: how to tie 16 knots step by step · FishIn",
                f"Step-by-step guides to {len(KNOTS)} fishing knots: palomar, FG, improved clinch, uni, blood knot, dropper loop and more, with which line each suits.",
                f"{SITE}/knots/", body, ld)


def main() -> None:
    out = ROOT / "knots"
    out.mkdir(exist_ok=True)
    (out / "index.html").write_text(index_page(), encoding="utf-8", newline="\n")
    for k in KNOTS:
        d = out / k["slug"]
        d.mkdir(exist_ok=True)
        (d / "index.html").write_text(knot_page(k), encoding="utf-8", newline="\n")
    print(f"built {len(KNOTS)} knot pages")


if __name__ == "__main__":
    main()

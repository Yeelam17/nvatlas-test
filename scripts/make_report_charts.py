#!/usr/bin/env python3
"""Generate static SVG figures for the learning report."""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "data" / "corpus.json").read_text(encoding="utf-8"))["entries"]
OUT = ROOT / "assets"


def svg_document(width: int, height: int, body: str) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'role="img" aria-labelledby="title desc">'
        f'<title id="title">NV Atlas report figure</title>'
        f'<desc id="desc">Static summary chart generated from data/corpus.json</desc>'
        f'<rect width="{width}" height="{height}" fill="#fbfaf5"/>'
        f'<g font-family="Manrope, Arial, sans-serif">{body}</g></svg>\n'
    )


def patterns() -> None:
    counts = Counter(entry["category"] for entry in DATA)
    labels = {
        "conventional_rendering": "Conventional",
        "alternative_rendering": "Alternative",
        "single_instance": "Single instance",
    }
    colors = {
        "conventional_rendering": "#8eaa5b",
        "alternative_rendering": "#f3a36b",
        "single_instance": "#b6a5d4",
    }
    width, height = 760, 330
    body = [
        '<text x="24" y="31" font-size="17" font-weight="700" fill="#18221d">Rendering-pattern distribution</text>',
        '<text x="24" y="51" font-size="10" fill="#66736b" font-family="DM Mono, monospace">500 supplied pairs · 2026-11-05</text>',
    ]
    max_count = max(counts.values())
    for i, key in enumerate(labels):
        y = 96 + i * 68
        count = counts[key]
        bar_width = 450 * count / max_count
        body += [
            f'<text x="24" y="{y + 13}" font-size="11" fill="#18221d">{labels[key]}</text>',
            f'<rect x="170" y="{y}" width="450" height="23" rx="1" fill="#ebe9df"/>',
            f'<rect x="170" y="{y}" width="{bar_width:.1f}" height="23" rx="1" fill="{colors[key]}"/>',
            f'<text x="632" y="{y + 16}" font-size="11" fill="#66736b" font-family="DM Mono, monospace">{count}</text>',
        ]
    body.append('<text x="24" y="307" font-size="9" fill="#66736b" font-family="DM Mono, monospace">Frequency-based consistency codebook; not a human quality judgment.</text>')
    (OUT / "report-patterns.svg").write_text(svg_document(width, height, "".join(body)), encoding="utf-8")


def attention() -> None:
    counts = Counter(e["target_term"] for e in DATA if e["key_term_normalized"] == "attention")
    width, height = 760, 330
    body = [
        '<text x="24" y="31" font-size="17" font-weight="700" fill="#18221d">attention: four renderings, one dominant form</text>',
        '<text x="24" y="51" font-size="10" fill="#66736b" font-family="DM Mono, monospace">45 pairs; Chinese target verbs</text>',
        '<line x1="24" y1="276" x2="706" y2="276" stroke="#d9d7cc"/>',
    ]
    items = counts.most_common()
    max_count = max(counts.values())
    bar_space = 72
    for i, (term, count) in enumerate(items):
        x = 72 + i * 165
        bar_height = 190 * count / max_count
        y = 260 - bar_height
        body += [
            f'<rect x="{x}" y="{y:.1f}" width="{bar_space}" height="{bar_height:.1f}" rx="2" fill="#8eaa5b"/>',
            f'<text x="{x + bar_space / 2}" y="{y - 9:.1f}" text-anchor="middle" font-size="12" font-weight="700" fill="#18221d">{count}</text>',
            f'<text x="{x + bar_space / 2}" y="299" text-anchor="middle" font-size="15" font-weight="600" fill="#18221d" font-family="Noto Sans TC, Arial, sans-serif">{term}</text>',
        ]
    body.append('<text x="24" y="319" font-size="9" fill="#66736b" font-family="DM Mono, monospace">The modal rendering is a corpus tendency, not a universal rule.</text>')
    (OUT / "report-attention.svg").write_text(svg_document(width, height, "".join(body)), encoding="utf-8")


def main() -> None:
    patterns()
    attention()
    print("Wrote report-patterns.svg and report-attention.svg")


if __name__ == "__main__":
    main()

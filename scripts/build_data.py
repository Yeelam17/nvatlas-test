#!/usr/bin/env python3
"""Build the reproducible NV Atlas corpus from the supplied raw CSV.

The source CSV does not contain sentence-level provenance. This script therefore
records the dataset file and row number, and marks human_checked as "no"
rather than making a claim that cannot be supported.
"""
from __future__ import annotations

import csv
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "NVAtlas-AI-Agent.raw.csv"
OUT = ROOT / "data" / "corpus.json"
REPORT = ROOT / "data" / "build_report.json"

# Categories describe consistency across repeated English key terms. This is an
# observable corpus pattern, not a claim about a translator's intention.
CATEGORY_RULES = {
    "conventional_rendering": "The English key term occurs at least twice and this Chinese verb is its modal (>=50%) rendering.",
    "alternative_rendering": "The English key term occurs at least twice, but this Chinese verb is a non-modal alternative.",
    "single_instance": "The English key term occurs only once in the supplied corpus, so stability cannot be assessed.",
}

def normalise(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def script_profile(text: str) -> str:
    simplified = set("这为个们说时会后里还问过对发没说吗么让给没这么那来国现开动实书语")
    traditional = set("這為個們說時會後裡還問過對發沒說嗎麼讓給沒這麼那來國現開動實書語")
    has_s = any(c in simplified for c in text)
    has_t = any(c in traditional for c in text)
    if has_s and not has_t:
        return "mostly_simplified"
    if has_t and not has_s:
        return "mostly_traditional"
    if has_s and has_t:
        return "mixed_script"
    return "no_marker"


def main() -> None:
    raw_bytes = RAW.read_bytes()
    with RAW.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        raw_rows = list(reader)

    required = ["id", "English", "Chinese", "English_Nominal", "Chinese_Verb"]
    if reader.fieldnames != required:
        raise ValueError(f"Unexpected columns: {reader.fieldnames}")

    seen_pairs = set()
    seen_ids = set()
    entries = []
    rejected = Counter()

    for row_number, row in enumerate(raw_rows, start=2):
        values = {key: normalise(row.get(key, "")) for key in required}
        if any(not value for value in values.values()):
            rejected["empty_required_field"] += 1
            continue
        if values["id"] in seen_ids:
            rejected["duplicate_id"] += 1
            continue
        pair = (values["English"], values["Chinese"])
        duplicate_pair = pair in seen_pairs
        if values["id"] in seen_ids:
            rejected["duplicate_id"] += 1
            continue
        if duplicate_pair:
            rejected["duplicate_pair"] += 1
        seen_ids.add(values["id"])
        seen_pairs.add(pair)
        entries.append({
            "id": values["id"],
            "source_text": values["English"],
            "target_text": values["Chinese"],
            "source": f"NVAtlas-AI-Agent.csv, row {row_number}; supplied dataset; sampled 2026-11-05; source corpus/version not stated",
            "category": "",
            "human_checked": "no",
            "duplicate_pair": duplicate_pair,
            "unit": "sentence_pair",
            "key_term": values["English_Nominal"],
            "key_term_normalized": values["English_Nominal"].lower(),
            "target_term": values["Chinese_Verb"],
            "script_profile": script_profile(values["Chinese"]),
            "source_row": row_number,
            "source_length": len(values["English"]),
            "target_length": len(values["Chinese"]),
        })

    # Deterministic, transparent rule assignment for the exploratory
    # consistency categories. All counts are calculated after cleaning.
    nominal_counts = Counter(entry["key_term_normalized"] for entry in entries)
    pair_counts = Counter(
        (entry["key_term_normalized"], entry["target_term"]) for entry in entries
    )
    modal_pairs = {}
    for nominal in nominal_counts:
        candidates = {
            pair: count
            for pair, count in pair_counts.items()
            if pair[0] == nominal
        }
        modal_pairs[nominal] = max(candidates, key=candidates.get) if candidates else None

    for entry in entries:
        nominal = entry["key_term_normalized"]
        pair = (nominal, entry["target_term"])
        if nominal_counts[nominal] == 1:
            category = "single_instance"
        elif pair == modal_pairs[nominal] and pair_counts[pair] >= 2:
            category = "conventional_rendering"
        else:
            category = "alternative_rendering"
        entry["category"] = category
        entry["nominal_frequency"] = nominal_counts[nominal]
        entry["pair_frequency"] = pair_counts[pair]

    # A conservative quality flag is evidence for review, not a verdict.
    for entry in entries:
        flags = []
        if re.search(r"[A-Za-z]{4,}", entry["target_text"]):
            flags.append("untranslated_latin")
        if entry["script_profile"] in ("mostly_traditional", "mixed_script"):
            flags.append("script_inconsistency")
        if entry["duplicate_pair"]:
            flags.append("duplicate_pair")
        if len(entry["source_text"]) > 180:
            flags.append("long_source")
        entry["quality_flags"] = flags

    payload = {
        "title": "NV Atlas AI Agent Corpus",
        "generated_from": RAW.name,
        "source_sha256": hashlib.sha256(raw_bytes).hexdigest(),
        "collection_date": "2026-11-05",
        "source_note": "The supplied CSV contains numeric sentence IDs but does not state the corpus name/version, sampling seed, or retrieval URL. Provenance remains partial and must be verified by the project owner.",
        "manifest": {
            "raw_file": RAW.name,
            "required_fields": required,
            "optional_fields": ["unit", "key_term", "target_term", "script_profile", "quality_flags", "duplicate_pair"],
            "category_method": "frequency-based modal rendering for repeated English key terms",
            "human_check_status": "not claimed; all entries are no",
        },
        "fields": required,
        "entries": entries,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = {
        "raw_rows": len(raw_rows),
        "kept_rows": len(entries),
        "rejected": dict(rejected),
        "category_counts": dict(Counter(e["category"] for e in entries)),
        "human_checked_counts": dict(Counter(e["human_checked"] for e in entries)),
        "duplicate_pairs_retained": sum(e["duplicate_pair"] for e in entries),
        "quality_flag_counts": dict(Counter(flag for e in entries for flag in e["quality_flags"])),
        "script_profiles": dict(Counter(e["script_profile"] for e in entries)),
        "source_sha256": hashlib.sha256(raw_bytes).hexdigest(),
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

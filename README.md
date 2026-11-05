# NV Atlas · Translation Corpus Explorer

A static, bilingual corpus explorer for 500 English–Chinese sentence pairs from the supplied `NVAtlas-AI-Agent.csv` dataset. The project follows the 2026R1 Translation Technology final-project brief.

## Live site

After GitHub Pages is enabled: <https://Yeelam17.github.io/nvatlas-test/>

## What is included

- Keyword search with shareable URL state
- Filters for rendering pattern and human-check status
- Four linked views: rendering network, pattern distribution, term-by-rendering heatmap, and bilingual KWIC
- Sortable, paginated data grid with filtered CSV export
- English / Traditional Chinese interface switch
- Learning report, codebook, and AI-use declaration
- Reproducible data-cleaning scripts and source checksum

## Repository layout

```text
index.html                         Corpus explorer
report.html                        Learning report
codebook.html                      Codebook and change log
ai-use.html                        AI-use declaration
assets/                            CSS, JavaScript, and report figures
data/NVAtlas-AI-Agent.raw.csv      Preserved source data
data/corpus.json                   Cleaned, web-ready corpus
data/build_report.json             Build counts and quality flags
scripts/build_data.py              Reproducible data pipeline
scripts/make_report_charts.py      Static report figures
```

## Rebuild

```bash
python3 scripts/build_data.py
python3 scripts/make_report_charts.py
python3 -m http.server 8765
```

Then open <http://127.0.0.1:8765/>.

## Data status and required human work

The supplied CSV does not identify its corpus version, sampling seed, or retrieval URL. All 500 website records therefore retain `human_checked = "no"`. Before final submission, the project owner must:

1. Recover and document the exact source corpus and sampling method.
2. Randomly verify at least 50 entries against the original source.
3. Correct errors and update `human_checked` for verified entries.
4. Review and rewrite the codebook definitions in their own words.
5. Confirm copyright and privacy suitability for public display.

The site intentionally does not fabricate provenance or manual verification. See the learning report and AI-use declaration for the full discussion.

## Source checksum

`NVAtlas-AI-Agent.raw.csv` SHA-256:

```text
8df6e60e767bc411c180860dab290272f2210db5711a702b39f2ad88057f00a3
```

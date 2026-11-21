# news-image-20261120

[![make.fun · news-image-20261120](https://make.fun/badge/news-image-20261120.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![rank](https://make.fun/badge/news-image-20261120/chap7labs/news-image-20261120/rank.svg)](https://make.fun/bounty/news-image-20261120/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![reward](https://make.fun/badge/news-image-20261120/chap7labs/news-image-20261120/reward.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)

Print-editorial one-page world news front page summing up **Friday 20 November 2026** in a crisp, deterministic, 2× Hi-DPI supersampled (`2048×2048` → `1024×1024`) lossless PNG (`entry.png`) with **35** live-verified stories strictly dated Friday 20 November 2026 across all 7 global regions (`Asia 8 | Europe 7 | M. East 5 | Americas 5 | Africa 4 | Global 4 | Oceania 2`):

- **Broadsheet Masthead & Day-in-Numbers:** Edge-to-edge Georgia serif masthead on an open `#FAF6EE` warm newsprint hairline grid, 6 uniform black tabular KPI callouts aligned on a single baseline with crimson vertical rules, and a proportional 7-region coverage bar.
- **3 Wide Lead Stories:** Pure vector editorial drawings (zero SVG micro-text) paired with high-contrast dual-layer headline stamps and source pills covering Kyiv's 3-bridge missile barrage, Cyclone Akvan's Gopalpur landfall, and Asia's AI/chip sell-off.
- **10 Secondary Feature Cards (2×5):** Pure vector editorial drawings (zero SVG micro-text) with bold headline stamps and cleanly separated source pills covering the UK–EU post-Brexit reset deal, COP31 overtime, SE Poland `Kh-101` crash, Jurf al-Sakhar joint HQ, Japan October consumer inflation (`2.3%`), Kenya `Amosing-1` first oil well, Italy 24h general strike, oral pancreatic cancer pill `daraxonrasib` (`60.7%` tumour shrinkage), South Korea's ruling-party move to impeach a top judge, and Glenn Phillips' historic `118` vs India.
- **6-Continent Dark-Navy World Map & 22 Single-Line Borderless Briefs:** Full-height `#13293D` 6-continent World Map with cream-sand continents and 21 de-clustered numbered geographic story pins paired with 22 single-line city-first borderless briefs (`14`–`35`).
- **Contest-Date Anchor (`DATE CHECK`):** Clean crimson-bordered footer rail anchoring the Friday 20 November 2026 contest date while explicitly excluding Thursday 19 Nov items and Saturday 21 Nov scheduled events.

## Architecture

- **Entrypoint:** `main.ts` (Node.js 22 standard library only — zero external dependencies, zero network access). Validates PNG/JPEG integrity, dimensions (`<= 1024×1024`), and size ceiling (`<= 1 MiB`), then writes byte-identical output to `/output/entry.png` (or `$MAKEFUN_OUTPUT_DIR/entry.png`).
- **Generator:** `build_infographic.mjs` — deterministic HTML/CSS + 100% original inline SVG renderer using a 2-pass 2× Hi-DPI supersampled (`2048×2048` → `1024×1024`) headless Chromium pipeline to produce `entry.png` and optional `300×300` thumbnail QA previews (`--qa-thumb`).

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=wwyrgg08&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120) · AI agents build software for cash rewards</sub>

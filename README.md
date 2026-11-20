# news-image-20261120

[![make.fun · news-image-20261120](https://make.fun/badge/news-image-20261120.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![rank](https://make.fun/badge/news-image-20261120/chap7labs/news-image-20261120/rank.svg)](https://make.fun/bounty/news-image-20261120/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![reward](https://make.fun/badge/news-image-20261120/chap7labs/news-image-20261120/reward.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)

Print-editorial one-page world news front page summing up **Friday 20 November 2026** in a crisp, deterministic `1024×1024` lossless PNG (`entry.png`) with **35** live-verified stories strictly dated Friday 20 November 2026 across all 7 global regions (`Asia 8 | Europe 7 | M. East 5 | Americas 5 | Africa 4 | Global 4 | Oceania 2`):

- **Broadsheet Masthead & Day-in-Numbers:** Edge-to-edge Georgia serif masthead on an open `#FAF6EE` warm newsprint hairline grid, 6 uniform black tabular KPI callouts separated by crimson vertical rules, and a proportional 7-region coverage bar.
- **3 Wide Lead Stories:** Custom inline SVG graphics, epistemic status badges, and attributed summaries for Kyiv's 3-bridge missile barrage, Cyclone Akvan's Gopalpur landfall (bright cerulean print map), and Asia's AI/chip sell-off.
- **10 Bright Print-Editorial Secondary Cards (2×5):** Bright warm-print inline SVG illustrations covering UK–EU Brexit reset, COP31 overtime, SE Poland `Kh-101` crash, Jurf al-Sakhar joint HQ, Japan Oct CPI (`2.3%`), Kenya `Amosing-1` first oil well, Italy CGIL 24h general strike (`SCIOPERO`), oral pancreatic cancer pill `daraxonrasib` (`>60%` tumor shrinkage), White House cyber chief ouster, and Glenn Phillips' historic `118` at Basin Reserve.
- **Light Editorial World Map & 22 Single-Line Briefs:** Numbered leader-line pins (`1`–`13`) and regional brief dots (`14`–`33`) paired with 22 single-line city-first dispatches (`14`–`35`).
- **Date Integrity Rail (`DATE CHECK - EXCLUDED`):** Explicit crimson-bordered footer rail auditing and excluding pre-20 Nov (`14–19 Nov`) and post-20 Nov (`>20 Nov`) events.

## Architecture

- **Entrypoint:** `main.ts` (Node.js 22 standard library only — zero external dependencies, zero network access). Validates PNG/JPEG integrity, dimensions (`<= 1024×1024`), and size ceiling (`<= 1 MiB`), then writes byte-identical output to `/output/entry.png` (or `$MAKEFUN_OUTPUT_DIR/entry.png`).
- **Generator:** `build_infographic.mjs` — deterministic HTML/CSS + 100% original inline SVG renderer used to produce `entry.png` and optional `300×300` thumbnail QA previews (`--qa-thumb`).

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=wwyrgg08&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120) · AI agents build software for cash rewards</sub>

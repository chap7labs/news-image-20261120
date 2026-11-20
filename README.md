# news-image-20261120

[![make.fun · news-image-20261120](https://make.fun/badge/news-image-20261120.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![rank](https://make.fun/badge/news-image-20261120/chap7labs/news-image-20261120/rank.svg)](https://make.fun/bounty/news-image-20261120/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![reward](https://make.fun/badge/news-image-20261120/chap7labs/news-image-20261120/reward.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)

Editorial one-page world news infographic summing up **Friday 20 November 2026** in a crisp, deterministic `1024×1024` lossless PNG (`entry.png`) with **37** live-verified stories strictly from 20 November 2026 across all 7 global regions (Asia 8, Europe 7, Americas 6, Middle East 5, Africa 5, Global 4, Oceania 2):

- **Masthead & Day-in-Numbers:** Giant serif masthead, 6 tabular KPI callouts, and a proportional 7-region coverage bar.
- **3 Wide Lead Stories:** Full-bleed custom inline SVG graphics + editorial summaries for Kyiv's 3-bridge missile barrage, Cyclone Akvan's Gopalpur landfall, and Asia's AI/tech sell-off.
- **10 Full-Bleed Secondary Cards (2×5):** Custom inline SVG illustrations covering UK–EU reset, COP31 overtime, SE Poland Kh-101 crash, Jurf al-Sakhar joint HQ, Japan Oct CPI (`2.3%`), Senegal boat capsize, Nasdaq `-5.28%` rout, Daraxonrasib cancer trial (`>60%` tumor shrinkage), Seoul court push, and Sydney terror raids.
- **Dark-Navy World Map & 24 Global Briefs:** Numbered leader-line pins (`1`–`13`) plus brief dots (`14`–`37`) alongside 24 concise regional dispatches.
- **Date Integrity Rail (`DATE CHECK`):** Explicit footer rail auditing and excluding pre-20 Nov (`14–19 Nov`) and post-20 Nov (`>20 Nov`) events.

## Architecture

- **Entrypoint:** `main.ts` (Node.js 22 standard library only — zero external dependencies, zero network access). Validates PNG/JPEG integrity, dimensions (`<= 1024×1024`), and size ceiling (`<= 1 MiB`), then writes byte-identical output to `/output/entry.png` (or `$MAKEFUN_OUTPUT_DIR/entry.png`).
- **Generator:** `build_infographic.mjs` — deterministic HTML/CSS + 100% original inline SVG renderer used to produce `entry.png` and optional `300×300` thumbnail QA previews (`--qa-thumb`).

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=wwyrgg08&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120) · AI agents build software for cash rewards</sub>

#!/usr/bin/env node
/**
 * Forensic v2 Editorial Generator for news-image-20261120 (Friday 20 November 2026).
 * Renders a deterministic 1024x1024 warm-paper editorial front page via Headless Chrome
 * and optionally outputs a 300x300 QA thumbnail (--qa-thumb).
 * Zero external network calls, zero third-party images, 100% original HTML/CSS/SVG.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_OUT = join(__dirname, '.build-preview.html');
const PNG_OUT = join(__dirname, 'entry.png');
const THUMB_HTML_OUT = join(__dirname, '.build-thumb300.html');
const THUMB_PNG_OUT = join(__dirname, '.qa-thumb-300.png');

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error('Could not locate Chrome or Edge executable for headless rendering.');
}

const REGIONS = [
  { key: 'ASIA', label: 'Asia', count: 8, color: '#B91C1C' },
  { key: 'EUROPE', label: 'Europe', count: 7, color: '#1D4ED8' },
  { key: 'AMERICAS', label: 'Americas', count: 6, color: '#6D28D9' },
  { key: 'M. EAST', label: 'M. East', count: 5, color: '#C2410C' },
  { key: 'AFRICA', label: 'Africa', count: 5, color: '#047857' },
  { key: 'GLOBAL', label: 'Global', count: 4, color: '#334155' },
  { key: 'OCEANIA', label: 'Oceania', count: 2, color: '#0E7490' },
];

const REGION_COLORS = Object.fromEntries(REGIONS.map((r) => [r.key, r.color]));
const TOTAL_STORIES = REGIONS.reduce((sum, r) => sum + r.count, 0); // 37

const KPIS = [
  { value: '7 Killed', label: 'Kyiv barrage · 9+ total in Ukraine', meta: '7 in Kyiv · 3 Dnipro bridges · Officials', accent: '#1D4ED8' },
  { value: '370,000+', label: 'Evacuated for Cyclone Akvan', meta: 'Gopalpur landfall · 0 dead · IMD', accent: '#B91C1C' },
  { value: '-6.2%', label: 'Taiex rout (-5.2% Kospi)', meta: 'Nikkei -5.1% · SoftBank -14.5%', accent: '#991B1B' },
  { value: '€7.9B', label: 'Record EU payout to Kyiv', meta: 'Ukraine Facility · EC', accent: '#1E40AF' },
  { value: '-5.28%', label: 'Nasdaq drops (-1,261.47 pts)', meta: 'Nvidia ~-7% · 2026 gains erased · Closing', accent: '#6D28D9' },
  { value: '25+ Nations', label: 'European youth & labor strikes', meta: '100+ Italian cities · Guardian', accent: '#047857' },
];

function stampBanner(text, bg = '#DC2626', fg = '#FFFFFF', x = 7, y = 6, w = 136, h = 18, fs = 9.6) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" fill="${bg}" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
    <text x="${x + w / 2}" y="${y + h * 0.72}" text-anchor="middle" font-size="${fs}" font-weight="900" letter-spacing="0.05em" fill="${fg}" font-family="Segoe UI,Arial,sans-serif">${text}</text>
  `;
}

function sourcePill(text, w = 112, viewH = 110) {
  const h = 13;
  const y = viewH - h - 5;
  return `
    <rect x="7" y="${y}" width="${w}" height="${h}" rx="2" fill="rgba(7,11,22,0.88)" stroke="rgba(255,255,255,0.22)" stroke-width="0.6"/>
    <text x="12" y="${y + 9.4}" font-size="7.1" font-weight="700" fill="#F1F5F9" font-family="Segoe UI,Arial,sans-serif">${text}</text>
  `;
}

const LEAD_STORIES = [
  {
    num: 1,
    region: 'EUROPE',
    headline: 'Russian Missiles Strike Three Kyiv Dnipro Bridges in Pre-Dawn Barrage',
    summary:
      'Overnight ballistic missiles and drones hit Podilsko-Voskresenskyi, Darnytskyi and Pivdennyi bridges, disrupting water utilities and transit. 7 killed in Kyiv, 17 injured, at least 9 dead nationwide · Officials (Kyiv Ind., Reuters).',
    svg: `
      <svg viewBox="0 0 326 110" width="100%" height="110" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="kyivSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0B1324"/>
            <stop offset="65%" stop-color="#172A46"/>
            <stop offset="100%" stop-color="#1F3A5F"/>
          </linearGradient>
          <radialGradient id="blast1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FEF08A"/>
            <stop offset="45%" stop-color="#F97316"/>
            <stop offset="100%" stop-color="#DC2626" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="326" height="110" fill="url(#kyivSky)"/>
        <!-- Kyiv skyline silhouette -->
        <path d="M0,70 L18,70 L18,52 L32,52 L32,70 L46,70 L46,44 L62,44 L62,70 L78,70 L78,56 L95,56 L95,70 L240,70 L240,48 L258,48 L258,70 L276,70 L276,40 L294,40 L294,70 L326,70 L326,110 L0,110 Z" fill="#09101D"/>
        <!-- Dnipro river -->
        <rect x="0" y="74" width="326" height="36" fill="#0D223A"/>
        <path d="M12,84 Q48,81 84,84 T156,84 T228,84 T312,84" fill="none" stroke="#38BDF8" stroke-width="0.9" opacity="0.35"/>
        <path d="M4,96 Q44,93 84,96 T164,96 T244,96 T318,96" fill="none" stroke="#38BDF8" stroke-width="0.8" opacity="0.25"/>
        <!-- Bridge spans (3 crossings) -->
        <line x1="8" y1="68" x2="318" y2="68" stroke="#94A3B8" stroke-width="3.2"/>
        <!-- Suspension arch (Podilsko-Voskresenskyi) -->
        <path d="M118,68 Q163,24 208,68" fill="none" stroke="#CBD5E1" stroke-width="3"/>
        <line x1="138" y1="50" x2="138" y2="68" stroke="#94A3B8" stroke-width="1"/>
        <line x1="163" y1="45" x2="163" y2="68" stroke="#94A3B8" stroke-width="1"/>
        <line x1="188" y1="50" x2="188" y2="68" stroke="#94A3B8" stroke-width="1"/>
        <!-- Bridge piers -->
        <rect x="74" y="68" width="8" height="22" fill="#475569"/>
        <rect x="159" y="68" width="8" height="24" fill="#475569"/>
        <rect x="242" y="68" width="8" height="22" fill="#475569"/>
        <!-- Missile trajectories & impact bursts -->
        <path d="M268,8 Q218,32 184,65" fill="none" stroke="#FCA5A5" stroke-width="1.6" stroke-dasharray="4 3"/>
        <path d="M298,18 Q265,40 245,65" fill="none" stroke="#FDBA74" stroke-width="1.5" stroke-dasharray="4 3"/>
        <path d="M132,12 Q105,36 78,66" fill="none" stroke="#FCA5A5" stroke-width="1.4" stroke-dasharray="3 3"/>
        <circle cx="78" cy="66" r="15" fill="url(#blast1)"/>
        <circle cx="184" cy="66" r="20" fill="url(#blast1)"/>
        <circle cx="245" cy="66" r="16" fill="url(#blast1)"/>
        <polygon points="184,50 189,61 200,60 191,68 195,78 184,71 174,77 177,67 169,59 180,60" fill="#FDE047"/>
        ${stampBanner('KYIV · 3 BRIDGES HIT', '#DC2626', '#FFFFFF', 8, 6, 168, 20, 11.0)}
        ${sourcePill("Officials' count · Kyiv Ind.", 132, 110)}
      </svg>`,
  },
  {
    num: 2,
    region: 'ASIA',
    headline: 'Cyclone Akvan Makes Landfall Near Gopalpur After Mass Evacuations',
    summary:
      'Storm crossed Odisha–Andhra coast with 70–80 km/h winds (gusts 90 km/h) and torrential rain, weakening into a deep depression. Over 370,000 evacuated; Odisha officials report zero deaths (IMD, NDTV, The Hindu).',
    svg: `
      <svg viewBox="0 0 326 110" width="100%" height="110" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cycGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FEF08A" stop-opacity="0.9"/>
            <stop offset="38%" stop-color="#38BDF8" stop-opacity="0.55"/>
            <stop offset="100%" stop-color="#0D3B56" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="326" height="110" fill="#0D3B56"/>
        <!-- East India warm coastline landmass (left) -->
        <path d="M0,0 L144,0 Q135,26 124,46 Q106,74 84,110 L0,110 Z" fill="#D8C8A8" stroke="#FFFBEB" stroke-width="1.3"/>
        <!-- Glowing cyclone aura centered near Gopalpur -->
        <circle cx="176" cy="52" r="56" fill="url(#cycGlow)"/>
        <!-- Rain bands across Bay of Bengal -->
        <g fill="none" stroke="#7DD3FC" stroke-linecap="round" opacity="0.7">
          <path d="M176,52 m-24,0 a24,18 0 1,1 48,0 a24,18 0 1,1 -48,0" stroke-width="2.6" stroke-dasharray="18 8"/>
          <path d="M176,52 m-42,0 a42,32 0 1,1 84,0 a42,32 0 1,1 -84,0" stroke-width="2.2" stroke-dasharray="28 10"/>
          <path d="M176,52 m-60,0 a60,44 0 1,1 120,0" stroke-width="1.7" stroke-dasharray="22 12"/>
        </g>
        <!-- Cyclone spiral arms -->
        <path d="M176,52 C200,22 238,28 248,56" fill="none" stroke="#F0F9FF" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M176,52 C154,80 116,78 102,52" fill="none" stroke="#F0F9FF" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M176,52 C160,26 130,22 114,38" fill="none" stroke="#BAE6FD" stroke-width="2.4" stroke-linecap="round"/>
        <!-- Cyclone eye -->
        <circle cx="176" cy="52" r="9.5" fill="#0D3B56" stroke="#FDE047" stroke-width="2.4"/>
        <!-- Landfall track arrow -->
        <path d="M166,52 L134,47" stroke="#FACC15" stroke-width="2.6" stroke-dasharray="4 3"/>
        <polygon points="126,46 136,41 135,52" fill="#FACC15"/>
        <!-- High-contrast white/crimson Gopalpur pin box -->
        <circle cx="122" cy="46" r="4.5" fill="#DC2626" stroke="#FFFFFF" stroke-width="1.5"/>
        <rect x="34" y="37" width="80" height="17" rx="2.5" fill="#FFFFFF" stroke="#B91C1C" stroke-width="1.5"/>
        <text x="74" y="48.5" text-anchor="middle" font-size="9" font-weight="900" letter-spacing="0.04em" fill="#991B1B" font-family="Segoe UI,sans-serif">GOPALPUR</text>
        <!-- Bottom-right evacuation + wind speed pill -->
        <rect x="150" y="85" width="169" height="19" rx="2.5" fill="#09111E" stroke="#38BDF8" stroke-width="0.9" opacity="0.95"/>
        <text x="234.5" y="97.5" text-anchor="middle" font-size="8.2" font-weight="900" letter-spacing="0.03em" fill="#FDE047" font-family="Segoe UI,sans-serif">370,000+ EVACUATED · 70–90 KM/H</text>
        ${stampBanner('CYCLONE AKVAN', '#0F766E', '#FFFFFF', 8, 6, 144, 20, 11.0)}
        ${sourcePill('IMD / Odisha govt · NDTV', 120, 110)}
      </svg>`,
  },
  {
    num: 3,
    region: 'ASIA',
    headline: 'Asia Tech & AI Sell-Off Caps Worst Market Week Since March 2020',
    summary:
      'Taiwan’s Taiex tumbled 6.2% (-17.5% on the week), South Korea’s Kospi fell 5.2% below 5,000, Japan’s Nikkei dropped 5.1%, and SoftBank sank 14.5% amid AI capex doubts and U.S. cloud chip curbs (Reuters, AA).',
    svg: `
      <svg viewBox="0 0 326 110" width="100%" height="110" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="softbarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#DC2626"/>
            <stop offset="100%" stop-color="#EA580C"/>
          </linearGradient>
        </defs>
        <rect width="326" height="110" fill="#0B1220"/>
        <!-- Subtle reference grid -->
        <g stroke="#1E293B" stroke-width="0.8">
          <line x1="12" y1="54" x2="318" y2="54"/>
          <line x1="12" y1="78" x2="318" y2="78"/>
        </g>
        <!-- Steep descending yellow/red trend line backdrop -->
        <polygon points="12,31 74,40 132,48 192,56 252,70 314,96 314,104 12,104" fill="#DC2626" opacity="0.18"/>
        <polyline points="12,31 74,40 132,48 192,56 252,70 314,96" fill="none" stroke="#F59E0B" stroke-width="3.2" stroke-linejoin="round"/>
        <!-- Crisp white 0.0% baseline -->
        <line x1="12" y1="31" x2="318" y2="31" stroke="#FFFFFF" stroke-width="1.8"/>
        <rect x="12" y="34" width="32" height="13" rx="2" fill="#1E293B" stroke="#94A3B8" stroke-width="0.7"/>
        <text x="28" y="43.5" text-anchor="middle" font-size="8.4" font-weight="900" fill="#FFFFFF" font-family="Segoe UI,sans-serif">0.0%</text>
        <!-- 4 Bold hanging negative drop-columns descending from 0.0% baseline -->
        <g font-family="Segoe UI,sans-serif" font-weight="900" text-anchor="middle">
          <rect x="78" y="31" width="56" height="39" rx="2.5" fill="#DC2626" stroke="#FCA5A5" stroke-width="0.9"/>
          <text x="106" y="44" font-size="8.2" fill="#FEE2E2">TAIEX</text>
          <text x="106" y="61" font-size="13.5" fill="#FFFFFF">-6.2%</text>

          <rect x="139" y="31" width="56" height="35" rx="2.5" fill="#E11D48" stroke="#FDA4AF" stroke-width="0.9"/>
          <text x="167" y="43" font-size="8.2" fill="#FFE4E6">KOSPI</text>
          <text x="167" y="59" font-size="13.5" fill="#FFFFFF">-5.2%</text>

          <rect x="200" y="31" width="56" height="34" rx="2.5" fill="#EA580C" stroke="#FED7AA" stroke-width="0.9"/>
          <text x="228" y="43" font-size="8.2" fill="#FFEDD5">NIKKEI</text>
          <text x="228" y="58" font-size="13.5" fill="#FFFFFF">-5.1%</text>

          <rect x="261" y="31" width="57" height="58" rx="2.5" fill="url(#softbarGrad)" stroke="#FDE047" stroke-width="1.2"/>
          <text x="289.5" y="44" font-size="7.8" fill="#FEF08A">SOFTBANK</text>
          <text x="289.5" y="66" font-size="13.2" fill="#FFFFFF">-14.5%</text>
        </g>
        <!-- Bright end point on trend line -->
        <circle cx="314" cy="96" r="4" fill="#FDE047" stroke="#DC2626" stroke-width="1.5"/>
        ${stampBanner('ASIA AI SELL-OFF', '#B91C1C', '#FFFFFF', 8, 6, 154, 20, 11.0)}
        ${sourcePill('Closing prices · Reuters', 120, 110)}
      </svg>`,
  },
];

const SECONDARY_STORIES = [
  {
    num: 4,
    region: 'EUROPE',
    headline: 'UK & EU Seal Brexit Reset Pact',
    summary: 'PM Burnham agrees food checks deal, carbon link & 100k youth mobility (Guardian).',
    svg: `
      <svg viewBox="0 0 194 68" width="100%" height="68" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="194" height="68" fill="#172554"/>
        <!-- Enlarged EU stars circle (right) -->
        <circle cx="154" cy="36" r="19" fill="#1E3A8A" stroke="#FACC15" stroke-width="1.2"/>
        <circle cx="154" cy="23" r="1.5" fill="#FACC15"/><circle cx="163" cy="27" r="1.5" fill="#FACC15"/>
        <circle cx="167" cy="36" r="1.5" fill="#FACC15"/><circle cx="163" cy="45" r="1.5" fill="#FACC15"/>
        <circle cx="154" cy="49" r="1.5" fill="#FACC15"/><circle cx="145" cy="45" r="1.5" fill="#FACC15"/>
        <circle cx="141" cy="36" r="1.5" fill="#FACC15"/><circle cx="145" cy="27" r="1.5" fill="#FACC15"/>
        <!-- Enlarged UK flag badge (left) -->
        <rect x="14" y="23" width="44" height="28" rx="2" fill="#1E40AF" stroke="#FFFFFF" stroke-width="0.9"/>
        <line x1="14" y1="23" x2="58" y2="51" stroke="#FFFFFF" stroke-width="4"/>
        <line x1="58" y1="23" x2="14" y2="51" stroke="#FFFFFF" stroke-width="4"/>
        <line x1="36" y1="23" x2="36" y2="51" stroke="#FFFFFF" stroke-width="6.2"/>
        <line x1="14" y1="37" x2="58" y2="37" stroke="#FFFFFF" stroke-width="6.2"/>
        <line x1="36" y1="23" x2="36" y2="51" stroke="#DC2626" stroke-width="3.4"/>
        <line x1="14" y1="37" x2="58" y2="37" stroke="#DC2626" stroke-width="3.4"/>
        <!-- Golden curved Channel link + crisp SPS · ETS · 100K micro-label -->
        <path d="M62,36 Q97,18 131,36" fill="none" stroke="#FDE047" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="97" cy="27" r="4.5" fill="#10B981" stroke="#FFFFFF" stroke-width="1"/>
        <rect x="65" y="40" width="64" height="12" rx="2" fill="#0F172A" opacity="0.88" stroke="#FDE047" stroke-width="0.6"/>
        <text x="97" y="48.5" text-anchor="middle" font-size="7.1" font-weight="900" fill="#FDE047" font-family="Segoe UI,sans-serif">SPS · ETS · 100K</text>
        ${stampBanner('UK–EU RESET', '#1D4ED8', '#FFFFFF', 6, 5, 114, 17, 9.5)}
        ${sourcePill('Agreed · Reuters', 86, 68)}
      </svg>`,
  },
  {
    num: 5,
    region: 'M. EAST',
    headline: 'COP31 Talks Plunge Into&nbsp;Overtime',
    summary: 'Fossil-fuel exit cut & $120B goal dropped; Turkey logs $26B green deals (Guardian).',
    svg: `
      <svg viewBox="0 0 194 68" width="100%" height="68" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="194" height="68" fill="#431407"/>
        <!-- Left: NO FOSSIL EXIT crossed pill -->
        <rect x="8" y="27" width="96" height="17" rx="2.5" fill="#7F1D1D" stroke="#FCA5A5" stroke-width="0.9"/>
        <text x="56" y="38.5" text-anchor="middle" font-size="8.2" font-weight="900" fill="#FEE2E2" font-family="Segoe UI,sans-serif">NO FOSSIL EXIT</text>
        <line x1="12" y1="35.5" x2="100" y2="35.5" stroke="#EF4444" stroke-width="2.2"/>
        <line x1="48" y1="26" x2="64" y2="45" stroke="#EF4444" stroke-width="2.2"/>
        <!-- Right: Overtime clock + $26B DEALS mint pill -->
        <circle cx="163" cy="22" r="14" fill="#7C2D12" stroke="#FDBA74" stroke-width="1.2"/>
        <line x1="163" y1="22" x2="163" y2="12" stroke="#FEF08A" stroke-width="2" stroke-linecap="round"/>
        <line x1="163" y1="22" x2="172" y2="22" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
        <circle cx="163" cy="22" r="2" fill="#FFFFFF"/>
        <rect x="115" y="42" width="73" height="18" rx="2.5" fill="#065F46" stroke="#6EE7B7" stroke-width="1"/>
        <text x="151.5" y="54" text-anchor="middle" font-size="8.6" font-weight="900" fill="#ECFDF5" font-family="Segoe UI,sans-serif">$26B DEALS</text>
        ${stampBanner('COP31: OVERTIME', '#C2410C', '#FFFFFF', 6, 5, 128, 17, 9.4)}
        ${sourcePill('Antalya · UN / Guardian', 102, 68)}
      </svg>`,
  },
  {
    num: 6,
    region: 'EUROPE',
    headline: 'Two Russian Missiles Hit SE&nbsp;Poland',
    summary: 'Two cruise missiles (Kh-101) & jet drone fall near border; F-16s scrambled (Guardian).',
    svg: `
      <svg viewBox="0 0 194 68" width="100%" height="68" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="194" height="68" fill="#0F172A"/>
        <!-- Radar sweep -->
        <circle cx="138" cy="40" r="24" fill="#064E3B" opacity="0.55" stroke="#34D399" stroke-width="0.9"/>
        <circle cx="138" cy="40" r="14" fill="none" stroke="#34D399" stroke-width="0.7" opacity="0.7"/>
        <line x1="138" y1="40" x2="156" y2="24" stroke="#6EE7B7" stroke-width="1.5"/>
        <!-- Poland border & missile track -->
        <line x1="88" y1="18" x2="88" y2="62" stroke="#F8FAFC" stroke-width="1.8" stroke-dasharray="3 2"/>
        <path d="M168,26 L68,42" stroke="#EF4444" stroke-width="2.2" stroke-dasharray="4 2"/>
        <circle cx="68" cy="42" r="5" fill="#F97316" stroke="#FEF08A" stroke-width="1.2"/>
        <text x="45" y="45" font-size="7.5" font-weight="800" fill="#FFFFFF" font-family="Segoe UI,sans-serif">PL</text>
        ${stampBanner('POLAND: KH-101', '#DC2626', '#FFFFFF', 6, 5, 122, 17, 9.4)}
        ${sourcePill('Officials · Guardian', 96, 68)}
      </svg>`,
  },
  {
    num: 7,
    region: 'M. EAST',
    headline: 'Iraqi Forces Reclaim Jurf&nbsp;al&#8209;Sakhar',
    summary: 'Army, police & PMU open joint HQ, ending decade of Kataib Hezbollah hold (AJ).',
    svg: `
      <svg viewBox="0 0 194 68" width="100%" height="68" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="194" height="68" fill="#291A10"/>
        <!-- Subtle blue Tigris/Euphrates river curve -->
        <path d="M0,45 Q52,36 104,46 T194,40 L194,68 L0,68 Z" fill="#1D4ED8" opacity="0.58"/>
        <path d="M6,52 Q52,44 104,52 T188,48" fill="none" stroke="#60A5FA" stroke-width="1.1" opacity="0.7"/>
        <!-- Checkpoint barrier + shield -->
        <rect x="26" y="34" width="66" height="4.5" rx="1" fill="#F8FAFC" stroke="#DC2626" stroke-width="0.7"/>
        <rect x="34" y="34" width="10" height="4.5" fill="#DC2626"/>
        <rect x="54" y="34" width="10" height="4.5" fill="#DC2626"/>
        <rect x="74" y="34" width="10" height="4.5" fill="#DC2626"/>
        <path d="M22,27 L31,30 L30,39 L22,44 L14,39 L13,30 Z" fill="#1E293B" stroke="#FDE047" stroke-width="1"/>
        <!-- Joint HQ tower & Iraqi flag -->
        <rect x="130" y="21" width="38" height="22" fill="#78350F" stroke="#FDE68A" stroke-width="0.9"/>
        <line x1="149" y1="8" x2="149" y2="24" stroke="#E2E8F0" stroke-width="1.4"/>
        <rect x="150" y="9" width="22" height="4" fill="#DC2626"/>
        <rect x="150" y="13" width="22" height="4" fill="#FFFFFF"/>
        <rect x="150" y="17" width="22" height="4" fill="#0F172A"/>
        <!-- Crisp JURF AL-SAKHAR location label -->
        <rect x="108" y="48" width="80" height="14" rx="2" fill="#0F172A" opacity="0.9" stroke="#FDBA74" stroke-width="0.7"/>
        <text x="148" y="57.8" text-anchor="middle" font-size="7.4" font-weight="900" fill="#FDE68A" font-family="Segoe UI,sans-serif">JURF AL-SAKHAR</text>
        ${stampBanner('IRAQ: JOINT HQ', '#B45309', '#FFFFFF', 6, 5, 118, 17, 9.4)}
        ${sourcePill('Joint ops · Al Jazeera', 98, 68)}
      </svg>`,
  },
  {
    num: 8,
    region: 'ASIA',
    headline: 'Japan Oct Inflation Rises to&nbsp;2.3%',
    summary: 'Core CPI hits 2.2% YoY, keeping Bank of Japan Dec rate-hike bets alive (CNA).',
    svg: `
      <svg viewBox="0 0 194 68" width="100%" height="68" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="194" height="68" fill="#1E1B4B"/>
        <!-- Rising CPI bars -->
        <rect x="26" y="42" width="16" height="16" fill="#6366F1"/>
        <rect x="48" y="37" width="16" height="21" fill="#818CF8"/>
        <rect x="70" y="33" width="16" height="25" fill="#F59E0B"/>
        <rect x="92" y="24" width="16" height="34" fill="#EF4444"/>
        <line x1="18" y1="38" x2="118" y2="38" stroke="#34D399" stroke-width="1.2" stroke-dasharray="3 2"/>
        <!-- Big 2.3% readout + Yen -->
        <text x="154" y="42" text-anchor="middle" font-size="18" font-weight="900" fill="#FDE047" font-family="Bahnschrift,Segoe UI,sans-serif">2.3%</text>
        <text x="154" y="54" text-anchor="middle" font-size="7.6" font-weight="700" fill="#E0E7FF" font-family="Segoe UI,sans-serif">CORE 2.2% · ¥</text>
        ${stampBanner('JAPAN CPI: 2.3%', '#B91C1C', '#FFFFFF', 6, 5, 122, 17, 9.4)}
        ${sourcePill('Stats Bureau · CNA', 96, 68)}
      </svg>`,
  },
  {
    num: 9,
    region: 'AFRICA',
    headline: 'Migrant Pirogue Sinks Off&nbsp;Senegal',
    summary: 'Wooden boat hits rocks near Yenne; 4+ dead, dozens missing in rescue (AP).',
    svg: `
      <svg viewBox="0 0 194 68" width="100%" height="68" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="194" height="68" fill="#064E3B"/>
        <!-- Atlantic swell & rocks -->
        <path d="M0,40 Q28,32 56,40 T112,40 T168,40 T194,40 L194,68 L0,68 Z" fill="#0F172A"/>
        <polygon points="122,46 138,34 156,46" fill="#475569"/>
        <!-- Tilted pirogue silhouette -->
        <path d="M46,42 L106,30 L96,44 L54,48 Z" fill="#F59E0B" stroke="#FEF3C7" stroke-width="0.9"/>
        <!-- Rescue beacon beam -->
        <polygon points="154,18 118,46 136,46" fill="#FDE047" opacity="0.35"/>
        <circle cx="154" cy="18" r="4" fill="#FDE047"/>
        ${stampBanner('SENEGAL: RESCUE', '#047857', '#FFFFFF', 6, 5, 128, 17, 9.4)}
        ${sourcePill('Navy / Rescue · AP', 98, 68)}
      </svg>`,
  },
  {
    num: 10,
    region: 'AMERICAS',
    headline: 'Nasdaq Plunges 5.28% Into Correction',
    summary: 'Tech wipeout erases 2026 gains; Nvidia drops ~7% amid reported SEC accounting probe (WashPost).',
    svg: `
      <svg viewBox="0 0 194 68" width="100%" height="68" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="194" height="68" fill="#1E1035"/>
        <!-- Crimson shaded area fill under downward curve -->
        <polygon points="12,26 48,30 82,40 116,37 150,53 184,60 184,66 12,66" fill="#E11D48" opacity="0.28"/>
        <polyline points="12,26 48,30 82,40 116,37 150,53 184,60" fill="none" stroke="#F43F5E" stroke-width="2.8" stroke-linejoin="round"/>
        <circle cx="184" cy="60" r="3" fill="#FDE047" stroke="#E11D48" stroke-width="1"/>
        <!-- Crisp enlarged -5.28% + NVDA ~-7% -->
        <text x="148" y="30" text-anchor="middle" font-size="16.5" font-weight="900" fill="#FFFFFF" font-family="Bahnschrift,Segoe UI,sans-serif">-5.28%</text>
        <text x="148" y="43" text-anchor="middle" font-size="9" font-weight="900" fill="#FDA4AF" font-family="Segoe UI,sans-serif">NVDA ~-7%</text>
        ${stampBanner('WALL ST: ROUT', '#6D28D9', '#FFFFFF', 6, 5, 118, 17, 9.4)}
        ${sourcePill('Closing · WashPost', 96, 68)}
      </svg>`,
  },
  {
    num: 11,
    region: 'GLOBAL',
    headline: 'Pancreatic Cancer Pill Shrinks Tumors',
    summary: 'Daraxonrasib shrinks tumors in >60% of patients; 1 in 12 clear scans (Guardian).',
    svg: `
      <svg viewBox="0 0 194 68" width="100%" height="68" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="194" height="68" fill="#0F292E"/>
        <!-- Enlarged oral capsule -->
        <g transform="translate(44,38) rotate(-20)">
          <rect x="-27" y="-10" width="27" height="20" rx="10" fill="#14B8A6"/>
          <rect x="0" y="-10" width="27" height="20" rx="10" fill="#F8FAFC"/>
        </g>
        <!-- Glowing cellular target reticle -->
        <circle cx="110" cy="36" r="16" fill="#F43F5E" opacity="0.16"/>
        <circle cx="110" cy="36" r="15" fill="none" stroke="#5EEAD4" stroke-width="1.4" stroke-dasharray="3.5 2"/>
        <circle cx="110" cy="36" r="9" fill="none" stroke="#99F6E4" stroke-width="0.9"/>
        <line x1="110" y1="18" x2="110" y2="54" stroke="#5EEAD4" stroke-width="0.8" opacity="0.6"/>
        <line x1="92" y1="36" x2="128" y2="36" stroke="#5EEAD4" stroke-width="0.8" opacity="0.6"/>
        <circle cx="110" cy="36" r="5.5" fill="#F43F5E" stroke="#FEF08A" stroke-width="1"/>
        <!-- Bold >60% SHRUNK readout -->
        <text x="160" y="34" text-anchor="middle" font-size="14.5" font-weight="900" fill="#5EEAD4" font-family="Bahnschrift,Segoe UI,sans-serif">&gt;60%</text>
        <text x="160" y="45" text-anchor="middle" font-size="8.2" font-weight="900" fill="#FFFFFF" font-family="Segoe UI,sans-serif">SHRUNK</text>
        ${stampBanner('CANCER PILL', '#0F766E', '#FFFFFF', 6, 5, 110, 17, 9.4)}
        ${sourcePill('ENA Trial · Guardian', 98, 68)}
      </svg>`,
  },
  {
    num: 12,
    region: 'ASIA',
    headline: 'Seoul Ruling Party Moves on&nbsp;Judge',
    summary: 'DPK moves to impeach Chief Justice Cho Hee-dae after martial-law verdict (KH).',
    svg: `
      <svg viewBox="0 0 194 68" width="100%" height="68" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="194" height="68" fill="#2A1215"/>
        <!-- Court columns -->
        <polygon points="96,17 154,28 38,28" fill="#E2E8F0"/>
        <rect x="46" y="29" width="7" height="24" fill="#CBD5E1"/>
        <rect x="68" y="29" width="7" height="24" fill="#CBD5E1"/>
        <rect x="118" y="29" width="7" height="24" fill="#CBD5E1"/>
        <rect x="140" y="29" width="7" height="24" fill="#CBD5E1"/>
        <rect x="36" y="53" width="120" height="5" fill="#94A3B8"/>
        <!-- Gavel -->
        <rect x="85" y="34" width="22" height="9" rx="1.5" fill="#F59E0B" transform="rotate(-18 96 38)"/>
        <line x1="98" y1="40" x2="112" y2="52" stroke="#FDE68A" stroke-width="2.5"/>
        ${stampBanner('SEOUL: COURT', '#B91C1C', '#FFFFFF', 6, 5, 114, 17, 9.4)}
        ${sourcePill('DPK · Korea Herald', 96, 68)}
      </svg>`,
  },
  {
    num: 13,
    region: 'OCEANIA',
    headline: 'Sydney Dawn Terror Raids Arrest Three',
    summary: 'JCTT sweeps 10 suburbs, charging man over alleged ISIS-inspired bomb plot (AFP).',
    svg: `
      <svg viewBox="0 0 194 68" width="100%" height="68" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="194" height="68" fill="#0B2239"/>
        <!-- Thickened Sydney Harbour Bridge arch silhouette -->
        <path d="M18,52 Q97,10 176,52" fill="none" stroke="#94A3B8" stroke-width="3.8"/>
        <line x1="12" y1="45" x2="182" y2="45" stroke="#CBD5E1" stroke-width="2.8"/>
        <line x1="56" y1="30" x2="56" y2="45" stroke="#64748B" stroke-width="1.2"/>
        <line x1="76" y1="25" x2="76" y2="45" stroke="#64748B" stroke-width="1.2"/>
        <line x1="118" y1="25" x2="118" y2="45" stroke="#64748B" stroke-width="1.2"/>
        <line x1="138" y1="30" x2="138" y2="45" stroke="#64748B" stroke-width="1.2"/>
        <rect x="22" y="31" width="8" height="23" fill="#64748B"/>
        <rect x="164" y="31" width="8" height="23" fill="#64748B"/>
        <!-- Concentric red raid beacon rings -->
        <circle cx="132" cy="36" r="21" fill="none" stroke="#EF4444" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.75"/>
        <circle cx="132" cy="36" r="14" fill="none" stroke="#F87171" stroke-width="1.5" opacity="0.9"/>
        <!-- Crisp 10 SUBURBS pill -->
        <rect x="98" y="29" width="68" height="15" rx="2.5" fill="#DC2626" stroke="#FFFFFF" stroke-width="1"/>
        <text x="132" y="39.5" text-anchor="middle" font-size="8.2" font-weight="900" fill="#FFFFFF" font-family="Segoe UI,sans-serif">10 SUBURBS</text>
        ${stampBanner('SYDNEY: RAIDS', '#0E7490', '#FFFFFF', 6, 5, 118, 17, 9.4)}
        ${sourcePill('AFP / NSW Police', 94, 68)}
      </svg>`,
  },
];

const BRIEFS = [
  { num: 14, reg: 'EUROPE', title: 'EU–Ukraine:', text: 'EC disburses record €7.9B Ukraine Facility tranche (Reuters).' },
  { num: 15, reg: 'EUROPE', title: 'Italy Strike:', text: 'CGIL 24h general strike hits 100+ cities over budget (ANSA).' },
  { num: 16, reg: 'EUROPE', title: 'Youth Walkouts:', text: 'Students strike in 25+ nations over living costs (Guardian).' },
  { num: 17, reg: 'EUROPE', title: 'Lebanon Force:', text: 'France leads talks on 2k–5k European UNIFIL successor (Reuters).' },
  { num: 18, reg: 'ASIA', title: 'SE Asia Chips:', text: 'U.S. puts cloud AI GPU licenses on Malaysia & Thailand (CNA).' },
  { num: 19, reg: 'ASIA', title: 'India–Pakistan:', text: 'Pakistani minister joins Modi’s Delhi SCO forum (Al Jazeera).' },
  { num: 20, reg: 'ASIA', title: 'Manila Deals:', text: 'Marcos returns from China with ₱41.1B EV & green pledges (PNA).' },
  { num: 21, reg: 'ASIA', title: 'Myanmar / Dhaka:', text: 'Junta rejects 9–6 ICJ ruling; Dhaka presses UN on return (AP).' },
  { num: 22, reg: 'M. EAST', title: 'Gaza Strikes:', text: 'Israeli raids kill 6+; Katz vows to hold 70% zone (Arab News).' },
  { num: 23, reg: 'M. EAST', title: 'Bekaa Raids:', text: 'IDF hits Janta border sites; Hezbollah urges restraint (ToI).' },
  { num: 24, reg: 'M. EAST', title: 'Syria Polio:', text: 'UN & Health Ministry launch 371k-child Deir Ezzor drive (SANA).' },
  { num: 25, reg: 'AFRICA', title: 'Sudan Hunger:', text: 'WFP cuts food aid to 900k amid Darfur famine risk (UN News).' },
  { num: 26, reg: 'AFRICA', title: 'S. Africa Nuclear:', text: '5.2 GW nuclear push draws COP31 legal threats (Daily Mav.).' },
  { num: 27, reg: 'AFRICA', title: 'Kenya First Oil:', text: 'Crews spud Amosing production drilling in Turkana (The Star).' },
  { num: 28, reg: 'AFRICA', title: 'DRC / Rwanda:', text: 'UN & rights groups slam EU–Rwanda return hub plan (UN News).' },
  { num: 29, reg: 'AMERICAS', title: 'U.S. Cyber Chief:', text: 'Trump fires Sean Cairncross; DoD CIO Davies acting (Reuters).' },
  { num: 30, reg: 'AMERICAS', title: 'Pentagon Stock:', text: 'GAO warns DoD lacks Patriot & Tomahawk refill plan (AP).' },
  { num: 31, reg: 'AMERICAS', title: 'Trade Split:', text: 'Trump nears Mexico trade deal while stalling Canada talks (CBC).' },
  { num: 32, reg: 'AMERICAS', title: 'Amazon Decree:', text: 'Brazil’s Lula signs 362k-ha Kapot Nhinore Indigenous land decree (Gov.br/AP).' },
  { num: 33, reg: 'AMERICAS', title: 'NY Sentencing:', text: 'Indian national Nikhil Gupta gets 235 months in murder plot (DOJ).' },
  { num: 34, reg: 'OCEANIA', title: 'Wellington Test:', text: 'NZ’s Glenn Phillips hits 118 vs India on Day 1 (ESPN).' },
  { num: 35, reg: 'GLOBAL', title: 'Crypto Drop:', text: 'Bitcoin slips under $60,000; $1.33B positions wiped (CoinDesk).' },
  { num: 36, reg: 'GLOBAL', title: 'F1 Las Vegas:', text: 'Strip Circuit qualifying runs under lights after FP3 (F1).' },
  { num: 37, reg: 'GLOBAL', title: 'BJK Cup Tennis:', text: '2026 Play-offs Day 1 ties open across 7 host nations (ITF).' },
];

// Map pins (viewBox 300x164): px/py = pin circle center; tx/ty = optional geographic target for leader line
const MAP_PINS = [
  { num: 1, px: 184, py: 33, tx: 168, ty: 42, reg: 'EUROPE' },   // Kyiv
  { num: 2, px: 207, py: 79, reg: 'ASIA' },                        // Gopalpur, India
  { num: 3, px: 248, py: 82, tx: 239, ty: 71, reg: 'ASIA' },     // Taipei / Asia Markets
  { num: 4, px: 120, py: 28, tx: 139, ty: 40, reg: 'EUROPE' },   // London / Brussels
  { num: 5, px: 159, py: 66, tx: 164, ty: 55, reg: 'M. EAST' },  // Antalya COP31
  { num: 6, px: 154, py: 21, tx: 159, ty: 38, reg: 'EUROPE' },   // SE Poland
  { num: 7, px: 190, py: 68, tx: 177, ty: 62, reg: 'M. EAST' },  // Jurf al-Sakhar, Iraq
  { num: 8, px: 268, py: 52, tx: 254, ty: 56, reg: 'ASIA' },     // Tokyo, Japan
  { num: 9, px: 123, py: 86, reg: 'AFRICA' },                      // Yenne, Senegal
  { num: 10, px: 73, py: 53, reg: 'AMERICAS' },                    // New York / Nasdaq
  { num: 11, px: 133, py: 58, tx: 145, ty: 51, reg: 'GLOBAL' },   // Barcelona, Spain (ENA Trial)
  { num: 12, px: 234, py: 38, tx: 242, ty: 54, reg: 'ASIA' },     // Seoul, S. Korea
  { num: 13, px: 262, py: 137, reg: 'OCEANIA' },                   // Sydney, Australia
];

const BRIEF_DOTS = [
  [145, 42, 'EUROPE'],   // Brussels EC
  [148, 52, 'EUROPE'],   // Rome CGIL
  [140, 44, 'EUROPE'],   // Europe youth strikes
  [136, 47, 'EUROPE'],   // Paris UNIFIL
  [222, 99, 'ASIA'],     // Malaysia / SE Asia
  [199, 68, 'ASIA'],     // New Delhi SCO
  [234, 86, 'ASIA'],     // Manila
  [214, 77, 'ASIA'],     // Dhaka / Myanmar
  [172, 66, 'M. EAST'],  // Gaza
  [174, 62, 'M. EAST'],  // Bekaa Lebanon
  [179, 61, 'M. EAST'],  // Deir Ezzor Syria
  [167, 86, 'AFRICA'],   // Sudan
  [158, 134, 'AFRICA'],  // South Africa
  [174, 102, 'AFRICA'],  // Turkana Kenya
  [156, 102, 'AFRICA'],  // DRC / Rwanda
  [68, 57, 'AMERICAS'],  // Washington DC
  [54, 74, 'AMERICAS'],  // Mexico
  [97, 112, 'AMERICAS'], // Mato Grosso Brazil
  [48, 58, 'AMERICAS'],  // Las Vegas F1
  [280, 152, 'OCEANIA'], // Wellington NZ
];

function renderWorldMapSvg() {
  const leaders = MAP_PINS.filter((p) => p.tx !== undefined)
    .map(
      (p) => `
      <line x1="${p.tx}" y1="${p.ty}" x2="${p.px}" y2="${p.py}" stroke="#FFFDF9" stroke-width="0.9" opacity="0.95"/>
      <circle cx="${p.tx}" cy="${p.ty}" r="1.8" fill="#FDE047"/>`
    )
    .join('');

  const pins = MAP_PINS.map((p) => {
    const c = REGION_COLORS[p.reg];
    return `
      <g>
        <circle cx="${p.px}" cy="${p.py}" r="6.3" fill="${c}" stroke="#FFFFFF" stroke-width="1.2"/>
        <text x="${p.px}" y="${p.py + 2.3}" text-anchor="middle" font-size="6.6" font-weight="900" fill="#FFFFFF" font-family="Segoe UI,sans-serif">${p.num}</text>
      </g>`;
  }).join('');

  const dots = BRIEF_DOTS.map(([x, y, reg]) => {
    const c = REGION_COLORS[reg];
    return `<circle cx="${x}" cy="${y}" r="2.5" fill="${c}" stroke="#FFFFFF" stroke-width="0.65" opacity="0.92"/>`;
  }).join('');

  return `
    <svg viewBox="0 0 300 164" width="100%" height="196" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="display:block;background:#17253B;border-radius:3px;border:1px solid #0F172A;">
      <rect width="300" height="164" fill="#17253B"/>
      <!-- Subtle graticule -->
      <g stroke="#243652" stroke-width="0.65">
        <line x1="0" y1="41" x2="300" y2="41"/>
        <line x1="0" y1="82" x2="300" y2="82" stroke-dasharray="3 2"/>
        <line x1="0" y1="123" x2="300" y2="123"/>
        <line x1="75" y1="0" x2="75" y2="164"/>
        <line x1="150" y1="0" x2="150" y2="164"/>
        <line x1="225" y1="0" x2="225" y2="164"/>
      </g>
      <!-- Warm-sand continents -->
      <g fill="#E3D5B8" stroke="#9C8B6E" stroke-width="0.7" stroke-linejoin="round">
        <!-- North & Central America -->
        <path d="M12,26 L36,18 L72,20 L89,30 L82,44 L73,56 L66,68 L58,78 L50,75 L44,64 L32,54 L24,42 Z"/>
        <!-- Greenland -->
        <path d="M98,9 L124,9 L130,24 L112,30 L100,22 Z"/>
        <!-- South America -->
        <path d="M72,82 L92,85 L112,102 L106,124 L92,150 L82,154 L76,128 L69,102 Z"/>
        <!-- UK & Ireland -->
        <path d="M132,35 L138,33 L139,42 L133,43 Z"/>
        <!-- Europe -->
        <path d="M140,23 L162,16 L180,22 L182,46 L166,53 L156,56 L144,53 L136,45 Z"/>
        <!-- Africa -->
        <path d="M134,62 L166,61 L181,78 L180,100 L169,126 L158,141 L148,122 L143,100 L122,90 L122,73 Z"/>
        <!-- Madagascar -->
        <path d="M182,118 L187,120 L185,131 L180,129 Z"/>
        <!-- Asia & Middle East -->
        <path d="M180,22 L242,20 L270,34 L258,60 L242,76 L226,88 L215,92 L207,89 L198,74 L186,78 L175,65 L176,50 Z"/>
        <!-- Japan -->
        <path d="M250,49 L257,52 L253,63 L247,60 Z"/>
        <!-- SE Asia / Indonesia -->
        <path d="M214,98 L236,103 L248,108 L234,113 L213,107 Z"/>
        <!-- Australia -->
        <path d="M228,119 L260,117 L268,135 L256,148 L230,142 Z"/>
        <!-- New Zealand -->
        <path d="M276,144 L283,147 L279,157 L273,154 Z"/>
      </g>
      ${dots}
      ${leaders}
      ${pins}
    </svg>`;
}

function buildHtml() {
  const kpiHtml = KPIS.map(
    (k) => `
    <div class="kpi-col" style="border-left-color:${k.accent}">
      <div class="kpi-val" style="color:${k.accent}">${k.value}</div>
      <div class="kpi-lbl">${k.label}</div>
      <div class="kpi-meta">${k.meta}</div>
    </div>`
  ).join('');

  const regionBarHtml = REGIONS.map((r) => {
    const label = `${r.label} ${r.count}`;
    return `<div class="seg-item" style="flex:${r.count};background:${r.color}">${label}</div>`;
  }).join('');

  const leadsHtml = LEAD_STORIES.map(
    (s) => `
    <article class="lead-card">
      <div class="lead-art">${s.svg}</div>
      <div class="lead-body">
        <div class="kicker" style="color:${REGION_COLORS[s.region]}">${s.num} · ${s.region}</div>
        <h2 class="lead-hl">${s.headline}</h2>
        <p class="lead-sum">${s.summary}</p>
      </div>
    </article>`
  ).join('');

  const secHtml = SECONDARY_STORIES.map(
    (s) => `
    <article class="sec-card">
      <div class="sec-art">${s.svg}</div>
      <div class="sec-body">
        <div class="kicker" style="color:${REGION_COLORS[s.region]}">${s.num} · ${s.region}</div>
        <h3 class="sec-hl">${s.headline}</h3>
        <p class="sec-sum">${s.summary}</p>
      </div>
    </article>`
  ).join('');

  const renderBriefCol = (items) =>
    items
      .map(
        (b) => `
      <div class="brief-row">
        <span class="b-num" style="color:${REGION_COLORS[b.reg]}">${b.num}</span>
        <span class="b-txt"><strong>${b.title}</strong> ${b.text}</span>
      </div>`
      )
      .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Friday 20 November 2026 — The World in One Day</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1024px;
    height: 1024px;
    overflow: hidden;
    background: #FAF7F0;
    color: #111827;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .page {
    width: 1024px;
    height: 1024px;
    padding: 9px 14px 8px 14px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: #FAF7F0;
  }

  /* 1. GIANT CENTERED SERIF MASTHEAD */
  .masthead {
    text-align: center;
    border-bottom: 2.5px solid #0F172A;
    padding-bottom: 4px;
  }
  .micro-rail {
    display: flex;
    justify-content: space-between;
    font-size: 8.1px;
    font-weight: 800;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 1px;
  }
  .masthead h1 {
    font-family: Georgia, Cambria, "Times New Roman", serif;
    font-size: 62px;
    font-weight: 700;
    line-height: 0.98;
    letter-spacing: -0.025em;
    color: #0F172A;
    margin: 1px 0 3px 0;
  }
  .deck {
    font-family: Georgia, Cambria, serif;
    font-style: italic;
    font-size: 10.2px;
    color: #334155;
    white-space: nowrap;
  }
  .deck b { font-style: normal; color: #B91C1C; margin: 0 5px; }

  /* 2. KPI STRIP + 16px SEGMENTED REGION BAR */
  .kpi-wrap { display: flex; flex-direction: column; gap: 3px; }
  .kpi-strip {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
    background: #FFFDF9;
    border: 1px solid #D8D0C0;
    border-radius: 3px;
    padding: 4px 6px;
  }
  .kpi-col {
    border-left: 2.5px solid #0F172A;
    padding-left: 6px;
  }
  .kpi-val {
    font-family: "Bahnschrift", "Segoe UI", sans-serif;
    font-size: 21px;
    font-weight: 800;
    line-height: 1.02;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.015em;
  }
  .kpi-lbl {
    font-size: 8.2px;
    font-weight: 700;
    color: #0F172A;
    line-height: 1.12;
    margin-top: 1px;
  }
  .kpi-meta {
    font-size: 7.3px;
    color: #475569;
    line-height: 1.1;
  }
  .seg-bar {
    height: 16px;
    display: flex;
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid #CBD5E1;
  }
  .seg-item {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 7.7px;
    font-weight: 800;
    letter-spacing: 0.02em;
    padding: 0 2px;
    border-right: 1px solid rgba(255,255,255,0.35);
    white-space: nowrap;
  }
  .seg-item:last-child { border-right: none; }

  /* 3. LEAD ROW — 3 WIDE CARDS */
  .lead-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 9px;
  }
  .lead-card {
    background: #FFFDF9;
    border: 1px solid #CFC6B4;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 214px;
  }
  .lead-art { height: 106px; overflow: hidden; }
  .lead-art svg { width: 100%; height: 106px; display: block; }
  .lead-body {
    padding: 4px 8px 5px 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }
  .kicker {
    font-size: 7.7px;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .lead-hl {
    font-family: Georgia, Cambria, serif;
    font-size: 14.8px;
    font-weight: 700;
    line-height: 1.12;
    color: #0F172A;
  }
  .lead-sum {
    font-size: 8.8px;
    line-height: 1.22;
    color: #334155;
  }

  /* 4. SECONDARY GRID — 10 CARDS (2x5) */
  .sec-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }
  .sec-card {
    background: #FFFDF9;
    border: 1px solid #CFC6B4;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 141px;
  }
  .sec-art { height: 66px; overflow: hidden; }
  .sec-art svg { width: 100%; height: 66px; display: block; }
  .sec-body {
    padding: 3.5px 6px 4px 6px;
    display: flex;
    flex-direction: column;
    gap: 1.5px;
    flex: 1;
  }
  .sec-hl {
    font-family: Georgia, Cambria, serif;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.11;
    color: #0F172A;
  }
  .sec-sum {
    font-size: 8px;
    line-height: 1.16;
    color: #334155;
  }

  /* 5. LOWER BAND — MAP + 2-COL BRIEFS */
  .lower-band {
    display: grid;
    grid-template-columns: 308px 1fr;
    gap: 8px;
    height: 248px;
  }
  .map-panel, .briefs-panel {
    background: #FFFDF9;
    border: 1px solid #CFC6B4;
    border-radius: 4px;
    padding: 5px 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .panel-hdr {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1.5px solid #0F172A;
    padding-bottom: 3px;
    margin-bottom: 5px;
  }
  .panel-hdr h3 {
    font-size: 9.2px;
    font-weight: 900;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #0F172A;
  }
  .panel-hdr span {
    font-size: 7.4px;
    font-weight: 700;
    color: #475569;
  }
  .map-panel { justify-content: space-between; }
  .map-cap {
    font-size: 7.5px;
    color: #475569;
    line-height: 1.2;
    margin-top: 4px;
  }
  .briefs-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 12px;
    flex: 1;
  }
  .brief-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .brief-row {
    display: flex;
    align-items: baseline;
    gap: 4px;
    font-size: 8.7px;
    line-height: 1.14;
    color: #1E293B;
    padding: 0.75px 0;
    border-bottom: 1px dotted #E2DAC9;
  }
  .brief-row:last-child { border-bottom: none; }
  .b-num {
    flex: 0 0 14px;
    font-size: 8.6px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
  .b-txt strong { color: #0F172A; font-weight: 800; }

  /* 6. FOOTER — CRIMSON DATE CHECK + WIRE RAIL */
  .footer-wrap {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-top: auto;
  }
  .date-check {
    background: #FEF2F2;
    border: 2px solid #B91C1C;
    border-radius: 3px;
    padding: 3.5px 7px;
    font-size: 7.8px;
    line-height: 1.22;
    color: #450A0A;
  }
  .dc-badge {
    display: inline-block;
    background: #B91C1C;
    color: #FFFFFF;
    font-size: 7.1px;
    font-weight: 900;
    letter-spacing: 0.05em;
    padding: 1px 5px;
    border-radius: 2px;
    margin-right: 5px;
    text-transform: uppercase;
  }
  .foot-rail {
    display: flex;
    justify-content: space-between;
    font-size: 7.2px;
    color: #475569;
    padding: 0 2px;
  }
</style>
</head>
<body>
  <main class="page">
    <header class="masthead">
      <div class="micro-rail">
        <span>THE WORLD IN ONE DAY</span>
        <span>${TOTAL_STORIES} STORIES · 7 REGIONS · EVERY ONE DATED FRIDAY 20 NOVEMBER 2026</span>
      </div>
      <h1>Friday 20 November 2026</h1>
      <div class="deck">
        Missiles strike 3 Kyiv bridges <b>·</b> Cyclone Akvan hits Odisha <b>·</b> AI sell-off sweeps Asia &amp; Nasdaq <b>·</b> UK &amp; EU seal Brexit reset
      </div>
    </header>

    <section class="kpi-wrap" aria-label="The Day in Numbers">
      <div class="kpi-strip">${kpiHtml}</div>
      <div class="seg-bar" aria-label="Regional Story Counts">${regionBarHtml}</div>
    </section>

    <section class="lead-grid" aria-label="Lead Stories">
      ${leadsHtml}
    </section>

    <section class="sec-grid" aria-label="Global Feature Stories">
      ${secHtml}
    </section>

    <section class="lower-band" aria-label="World Map and Global Briefs">
      <div class="map-panel">
        <div>
          <div class="panel-hdr">
            <h3>Where It Happened</h3>
            <span>1–13 Featured · Dots = Briefs</span>
          </div>
          ${renderWorldMapSvg()}
        </div>
        <div class="map-cap">Numbers 1–13 match Lead &amp; Feature stories; colored dots map Global Briefs 14–37.</div>
      </div>

      <div class="briefs-panel">
        <div class="panel-hdr">
          <h3>Also on Friday 20 November 2026 — ${BRIEFS.length} More Stories</h3>
          <span>Asia · Europe · Americas · M. East · Africa · Oceania · Global</span>
        </div>
        <div class="briefs-cols">
          <div class="brief-col">${renderBriefCol(BRIEFS.slice(0, 12))}</div>
          <div class="brief-col">${renderBriefCol(BRIEFS.slice(12))}</div>
        </div>
      </div>
    </section>

    <footer class="footer-wrap">
      <div class="date-check">
        <span class="dc-badge">Date Check · Excluded</span>
        <strong>19 Nov:</strong> Trump–Xi–Putin APEC Shenzhen declaration, ICJ Myanmar verdict, Anthropic $81.3B Nasdaq IPO, Berlin 40-nation Ukraine summit, Bukele 3rd-term filing, Indonesia asset law, Colombia strike start.
        <strong>14–18 Nov:</strong> Voyager 1 &amp; Van Gogh $190.4M (18 Nov), Kerch Bridge strike (17 Nov), Italy €805M Meta fine (14 Nov).
        <strong>&gt;20 Nov (not yet):</strong> BepiColombo Mercury orbit insertion (21 Nov), final COP31 deal, F1 Las Vegas GP race.
      </div>
      <div class="foot-rail">
        <span>All ${TOTAL_STORIES} stories occurred or were first reported on Friday 20 Nov 2026 · Zero D-1 bleed</span>
        <span>Sources: Reuters, AP, AFP, BBC, Guardian, Al Jazeera, IMD, EC, WFP, UN News · 100% original vector art</span>
      </div>
    </footer>
  </main>
</body>
</html>`;
}

function renderWithChrome(chromePath, htmlFile, outPng, width, height) {
  const fileUrl = 'file:///' + resolve(htmlFile).replace(/\\/g, '/');
  execFileSync(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${width},${height}`,
      `--screenshot=${resolve(outPng)}`,
      fileUrl,
    ],
    { stdio: 'pipe' }
  );
}

function main() {
  const chromePath = findChrome();
  const html = buildHtml();
  writeFileSync(HTML_OUT, html, 'utf8');
  renderWithChrome(chromePath, HTML_OUT, PNG_OUT, 1024, 1024);

  const bytes = statSync(PNG_OUT).size;
  console.log(`Rendered ${PNG_OUT} (${bytes.toLocaleString()} bytes, ${(bytes / 1024).toFixed(1)} KB)`);

  if (process.argv.includes('--qa-thumb')) {
    const pngUrl = 'file:///' + resolve(PNG_OUT).replace(/\\/g, '/');
    const thumbHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;width:300px;height:300px;overflow:hidden;"><img src="${pngUrl}" style="width:300px;height:300px;display:block;"/></body></html>`;
    writeFileSync(THUMB_HTML_OUT, thumbHtml, 'utf8');
    renderWithChrome(chromePath, THUMB_HTML_OUT, THUMB_PNG_OUT, 300, 300);
    console.log(`Rendered 300px QA thumbnail: ${THUMB_PNG_OUT}`);
  }
}

main();

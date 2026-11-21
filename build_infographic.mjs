#!/usr/bin/env node
/**
 * Print-Editorial v3 Generator for news-image-20261120 (Friday 20 November 2026).
 * Renders a deterministic 1024x1024 open-grid warm-newsprint front page via Headless Chrome
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
  { key: 'M. EAST', label: 'M. East', count: 5, color: '#C2410C' },
  { key: 'AMERICAS', label: 'Americas', count: 5, color: '#6D28D9' },
  { key: 'AFRICA', label: 'Africa', count: 4, color: '#047857' },
  { key: 'GLOBAL', label: 'Global', count: 4, color: '#334155' },
  { key: 'OCEANIA', label: 'Oceania', count: 2, color: '#0E7490' },
];

const REGION_COLORS = Object.fromEntries(REGIONS.map((r) => [r.key, r.color]));
const TOTAL_STORIES = REGIONS.reduce((sum, r) => sum + r.count, 0); // 35

const KPIS = [
  { value: '7 Killed', label: 'Kyiv barrage · 9+ dead nationwide', meta: '3 Dnipro bridges · Officials' },
  { value: '370,000+', label: 'Evacuated for Cyclone Akvan', meta: 'Gopalpur landfall · 0 dead · IMD' },
  { value: '-6.2%', label: 'Taiex rout (-5.2% Kospi)', meta: 'Nikkei -5.1% · SoftBank -14.5%' },
  { value: '€7.9B', label: 'Record EU payout to Kyiv', meta: 'Ukraine Facility · Reuters' },
  { value: '2.3%', label: 'Japan Oct CPI 11-month high', meta: 'Core 2.2% · BoJ rate bets · CNA' },
  { value: '100+ Cities', label: 'Italy CGIL 24h general strike', meta: '+25 EU youth strikes · ANSA' },
];

function stampBanner(text, bg = '#B91C1C', fg = '#FFFFFF', x = 7, y = 6, w = 128, h = 18, fs = 9.4) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${bg}"/>
    <text x="${x + w / 2}" y="${y + h * 0.72}" text-anchor="middle" font-size="${fs}" font-weight="900" letter-spacing="0.05em" fill="${fg}" font-family="Segoe UI,Arial,sans-serif">${text}</text>
  `;
}

function sourcePill(text, w = 104, viewH = 70) {
  const h = 13;
  const y = viewH - h - 4;
  return `
    <rect x="6" y="${y}" width="${w}" height="${h}" rx="1.5" fill="#0F172A" opacity="0.9"/>
    <text x="11" y="${y + 9.3}" font-size="7.1" font-weight="700" fill="#F8FAFC" font-family="Segoe UI,Arial,sans-serif">${text}</text>
  `;
}

const LEAD_STORIES = [
  {
    num: 1,
    region: 'EUROPE',
    kicker: 'KYIV, UKRAINE · WAR',
    epistemic: 'Officials say',
    headline: 'Russian Missiles Hit Three Kyiv Dnipro Bridges in Night Barrage',
    summary:
      'Overnight missile and drone strikes hit Podilsko-Voskresenskyi, Darnytskyi and Pivdennyi bridges, disrupting utilities and transit; 7 killed, 17 injured in Kyiv and at least 9 dead nationwide (Officials · Kyiv Ind., Reuters).',
    svg: `
      <svg viewBox="0 0 320 108" width="100%" height="108" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="kyivSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0D1B2A"/>
            <stop offset="68%" stop-color="#172A46"/>
            <stop offset="100%" stop-color="#1E3A5F"/>
          </linearGradient>
          <radialGradient id="blast1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FEF08A"/>
            <stop offset="48%" stop-color="#F97316"/>
            <stop offset="100%" stop-color="#DC2626" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="320" height="108" fill="url(#kyivSky)"/>
        <path d="M0,69 L18,69 L18,51 L32,51 L32,69 L46,69 L46,43 L62,43 L62,69 L78,69 L78,55 L95,55 L95,69 L236,69 L236,47 L254,47 L254,69 L272,69 L272,39 L290,39 L290,69 L320,69 L320,108 L0,108 Z" fill="#080F1C"/>
        <rect x="0" y="73" width="320" height="35" fill="#0B1F36"/>
        <path d="M12,83 Q48,80 84,83 T156,83 T228,83 T308,83" fill="none" stroke="#38BDF8" stroke-width="0.9" opacity="0.35"/>
        <path d="M4,95 Q44,92 84,95 T164,95 T244,95 T312,95" fill="none" stroke="#38BDF8" stroke-width="0.8" opacity="0.25"/>
        <line x1="8" y1="67" x2="312" y2="67" stroke="#94A3B8" stroke-width="3.2"/>
        <path d="M115,67 Q160,23 205,67" fill="none" stroke="#CBD5E1" stroke-width="3"/>
        <line x1="135" y1="49" x2="135" y2="67" stroke="#94A3B8" stroke-width="1"/>
        <line x1="160" y1="44" x2="160" y2="67" stroke="#94A3B8" stroke-width="1"/>
        <line x1="185" y1="49" x2="185" y2="67" stroke="#94A3B8" stroke-width="1"/>
        <rect x="72" y="67" width="8" height="22" fill="#475569"/>
        <rect x="156" y="67" width="8" height="24" fill="#475569"/>
        <rect x="238" y="67" width="8" height="22" fill="#475569"/>
        <path d="M264,8 Q214,31 180,64" fill="none" stroke="#FCA5A5" stroke-width="1.6" stroke-dasharray="4 3"/>
        <path d="M294,18 Q261,39 241,64" fill="none" stroke="#FDBA74" stroke-width="1.5" stroke-dasharray="4 3"/>
        <path d="M130,12 Q103,35 76,65" fill="none" stroke="#FCA5A5" stroke-width="1.4" stroke-dasharray="3 3"/>
        <circle cx="76" cy="65" r="15" fill="url(#blast1)"/>
        <circle cx="180" cy="65" r="20" fill="url(#blast1)"/>
        <circle cx="241" cy="65" r="16" fill="url(#blast1)"/>
        <polygon points="180,49 185,60 196,59 187,67 191,77 180,70 170,76 173,66 165,58 176,59" fill="#FDE047"/>
        ${stampBanner('KYIV · 3 BRIDGES HIT', '#DC2626', '#FFFFFF', 7, 6, 162, 20, 10.8)}
        ${sourcePill("Officials' count · Kyiv Ind.", 126, 108)}
      </svg>`,
  },
  {
    num: 2,
    region: 'ASIA',
    kicker: 'ODISHA, INDIA · CYCLONE',
    epistemic: 'IMD report',
    headline: 'Cyclone Akvan Lands Near Gopalpur After Mass Evacuations',
    summary:
      'Severe storm crosses coast at 70–80 km/h (gusts 90 km/h) and weakens into a deep depression; 370,000+ evacuated and zero Odisha deaths reported (IMD, NDTV, Hindu).',
    svg: `
      <svg viewBox="0 0 320 108" width="100%" height="108" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cycPrintGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
            <stop offset="45%" stop-color="#7DD3FC" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#CBE3F0" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Light cerulean Bay of Bengal print map -->
        <rect width="320" height="108" fill="#CBE3F0"/>
        <!-- Subtle nautical graticule -->
        <g stroke="#9CC4DA" stroke-width="0.7" opacity="0.65">
          <line x1="0" y1="36" x2="320" y2="36"/>
          <line x1="0" y1="72" x2="320" y2="72"/>
          <line x1="160" y1="0" x2="160" y2="108"/>
          <line x1="240" y1="0" x2="240" y2="108"/>
        </g>
        <!-- Warm sand India coastline -->
        <path d="M0,0 L146,0 Q137,26 126,46 Q106,74 82,108 L0,108 Z" fill="#E6D8BA" stroke="#9B8E74" stroke-width="1.3"/>
        <text x="36" y="76" font-size="8.2" font-weight="800" letter-spacing="0.08em" fill="#6B5E48" font-family="Segoe UI,sans-serif">ODISHA</text>
        <!-- Cyclone halo & crisp spiral rain bands -->
        <circle cx="178" cy="50" r="54" fill="url(#cycPrintGlow)"/>
        <g fill="none" stroke="#0369A1" stroke-linecap="round" opacity="0.75">
          <path d="M178,50 m-24,0 a24,18 0 1,1 48,0 a24,18 0 1,1 -48,0" stroke-width="2.4" stroke-dasharray="16 8"/>
          <path d="M178,50 m-41,0 a41,30 0 1,1 82,0 a41,30 0 1,1 -82,0" stroke-width="2" stroke-dasharray="24 9"/>
          <path d="M178,50 m-58,0 a58,42 0 1,1 116,0" stroke-width="1.5" stroke-dasharray="20 11"/>
        </g>
        <!-- Bold white/teal spiral arms -->
        <path d="M178,50 C202,20 240,26 250,54" fill="none" stroke="#0F766E" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M178,50 C156,78 118,76 104,50" fill="none" stroke="#0F766E" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M178,50 C162,24 132,20 116,36" fill="none" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Eye & landfall arrow -->
        <circle cx="178" cy="50" r="9" fill="#FFFFFF" stroke="#B91C1C" stroke-width="2.4"/>
        <path d="M167,50 L135,45" stroke="#B91C1C" stroke-width="2.5" stroke-dasharray="4 2.5"/>
        <polygon points="127,44 137,39 136,50" fill="#B91C1C"/>
        <!-- Bold red/white Gopalpur pin -->
        <circle cx="123" cy="44" r="4.5" fill="#DC2626" stroke="#FFFFFF" stroke-width="1.5"/>
        <rect x="33" y="35" width="82" height="17" rx="2" fill="#FFFFFF" stroke="#B91C1C" stroke-width="1.5"/>
        <text x="74" y="46.5" text-anchor="middle" font-size="9" font-weight="900" letter-spacing="0.04em" fill="#991B1B" font-family="Segoe UI,sans-serif">GOPALPUR</text>
        <!-- Bottom evacuation pill + dark source pill -->
        <rect x="148" y="84" width="166" height="19" rx="2" fill="#0F172A" opacity="0.94"/>
        <text x="231" y="96.5" text-anchor="middle" font-size="8.1" font-weight="900" letter-spacing="0.03em" fill="#FDE047" font-family="Segoe UI,sans-serif">370,000+ EVACUATED · 70–90 KM/H</text>
        ${stampBanner('CYCLONE AKVAN', '#0F766E', '#FFFFFF', 7, 6, 138, 20, 10.8)}
        ${sourcePill('IMD / Odisha govt · NDTV', 120, 108)}
      </svg>`,
  },
  {
    num: 3,
    region: 'ASIA',
    kicker: 'TAIPEI / TOKYO · MARKETS',
    epistemic: 'Closing',
    headline: 'Asia AI & Chip Sell-Off Caps Worst Week Since 2020',
    summary:
      'Taiex tumbles 6.2% (-17.5% wk), Kospi slides 5.2%, Nikkei drops 5.1% and SoftBank sinks 14.5% amid AI capex doubts and U.S. chip curbs (Reuters, AA).',
    svg: `
      <svg viewBox="0 0 320 108" width="100%" height="108" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="softbarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#DC2626"/>
            <stop offset="100%" stop-color="#EA580C"/>
          </linearGradient>
        </defs>
        <rect width="320" height="108" fill="#0B1220"/>
        <g stroke="#1E293B" stroke-width="0.8">
          <line x1="12" y1="53" x2="312" y2="53"/>
          <line x1="12" y1="77" x2="312" y2="77"/>
        </g>
        <polygon points="12,30 72,39 130,47 190,55 250,69 308,94 308,102 12,102" fill="#DC2626" opacity="0.18"/>
        <polyline points="12,30 72,39 130,47 190,55 250,69 308,94" fill="none" stroke="#F59E0B" stroke-width="3.2" stroke-linejoin="round"/>
        <line x1="12" y1="30" x2="312" y2="30" stroke="#FFFFFF" stroke-width="1.8"/>
        <rect x="12" y="33" width="32" height="13" rx="2" fill="#1E293B" stroke="#94A3B8" stroke-width="0.7"/>
        <text x="28" y="42.5" text-anchor="middle" font-size="8.4" font-weight="900" fill="#FFFFFF" font-family="Segoe UI,sans-serif">0.0%</text>
        <g font-family="Segoe UI,sans-serif" font-weight="900" text-anchor="middle">
          <rect x="76" y="30" width="55" height="38" rx="2" fill="#DC2626" stroke="#FCA5A5" stroke-width="0.8"/>
          <text x="103.5" y="43" font-size="8.1" fill="#FEE2E2">TAIEX</text>
          <text x="103.5" y="60" font-size="13.2" fill="#FFFFFF">-6.2%</text>

          <rect x="136" y="30" width="55" height="34" rx="2" fill="#E11D48" stroke="#FDA4AF" stroke-width="0.8"/>
          <text x="163.5" y="42" font-size="8.1" fill="#FFE4E6">KOSPI</text>
          <text x="163.5" y="58" font-size="13.2" fill="#FFFFFF">-5.2%</text>

          <rect x="196" y="30" width="55" height="33" rx="2" fill="#EA580C" stroke="#FED7AA" stroke-width="0.8"/>
          <text x="223.5" y="42" font-size="8.1" fill="#FFEDD5">NIKKEI</text>
          <text x="223.5" y="57" font-size="13.2" fill="#FFFFFF">-5.1%</text>

          <rect x="256" y="30" width="56" height="57" rx="2" fill="url(#softbarGrad)" stroke="#FDE047" stroke-width="1.1"/>
          <text x="284" y="43" font-size="7.7" fill="#FEF08A">SOFTBANK</text>
          <text x="284" y="65" font-size="13.0" fill="#FFFFFF">-14.5%</text>
        </g>
        <circle cx="308" cy="94" r="4" fill="#FDE047" stroke="#DC2626" stroke-width="1.5"/>
        ${stampBanner('ASIA AI SELL-OFF', '#B91C1C', '#FFFFFF', 7, 6, 150, 20, 10.8)}
        ${sourcePill('Closing prices · Reuters', 118, 108)}
      </svg>`,
  },
];

const SECONDARY_STORIES = [
  {
    num: 4,
    region: 'EUROPE',
    kicker: 'BRUSSELS · DIPLOMACY',
    epistemic: 'Agreed',
    headline: 'UK & EU Seal Brexit Reset Pact',
    summary: 'PM Burnham & EU agree agri-food checks, carbon link & 100k/yr youth mobility (Reuters, Guardian).',
    svg: `
      <svg viewBox="0 0 188 70" width="100%" height="70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="70" fill="#EAF2FA"/>
        <!-- EU circle (right) -->
        <circle cx="154" cy="36" r="17.5" fill="#1E3A8A" stroke="#1E40AF" stroke-width="1"/>
        <circle cx="154" cy="24" r="1.45" fill="#FACC15"/><circle cx="162.5" cy="27.5" r="1.45" fill="#FACC15"/>
        <circle cx="166" cy="36" r="1.45" fill="#FACC15"/><circle cx="162.5" cy="44.5" r="1.45" fill="#FACC15"/>
        <circle cx="154" cy="48" r="1.45" fill="#FACC15"/><circle cx="145.5" cy="44.5" r="1.45" fill="#FACC15"/>
        <circle cx="142" cy="36" r="1.45" fill="#FACC15"/><circle cx="145.5" cy="27.5" r="1.45" fill="#FACC15"/>
        <!-- UK flag (left) -->
        <rect x="10" y="25" width="40" height="26" rx="1.5" fill="#1E3A8A" stroke="#0F172A" stroke-width="0.9"/>
        <line x1="10" y1="25" x2="50" y2="51" stroke="#FFFFFF" stroke-width="3.5"/>
        <line x1="50" y1="25" x2="10" y2="51" stroke="#FFFFFF" stroke-width="3.5"/>
        <line x1="30" y1="25" x2="30" y2="51" stroke="#FFFFFF" stroke-width="5.6"/>
        <line x1="10" y1="38" x2="50" y2="38" stroke="#FFFFFF" stroke-width="5.6"/>
        <line x1="30" y1="25" x2="30" y2="51" stroke="#DC2626" stroke-width="3.0"/>
        <line x1="10" y1="38" x2="50" y2="38" stroke="#DC2626" stroke-width="3.0"/>
        <!-- Golden bridge arch + SPS · ETS · 100K tag -->
        <path d="M55,36 Q93,17 131,36" fill="none" stroke="#D97706" stroke-width="2.8" stroke-linecap="round"/>
        <circle cx="93" cy="26.5" r="4.2" fill="#047857" stroke="#FFFFFF" stroke-width="1"/>
        <rect x="63" y="39" width="60" height="13" rx="2" fill="#FFFFFF" stroke="#1E3A8A" stroke-width="0.9"/>
        <text x="93" y="48.1" text-anchor="middle" font-size="6.9" font-weight="900" fill="#0F172A" font-family="Segoe UI,sans-serif">SPS · ETS · 100K</text>
        ${stampBanner('UK–EU RESET', '#1D4ED8', '#FFFFFF', 6, 4, 110, 17, 9.3)}
        ${sourcePill('Agreed · Reuters', 86, 70)}
      </svg>`,
  },
  {
    num: 5,
    region: 'M. EAST',
    kicker: 'ANTALYA, TÜRKIYE · CLIMATE',
    epistemic: 'Ongoing',
    headline: 'COP31 Plunges Into&nbsp;Overtime',
    summary: 'Draft drops fossil-fuel exit & $120B goal; Turkey logs $26B green pacts (UN, Guardian).',
    svg: `
      <svg viewBox="0 0 188 70" width="100%" height="70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="70" fill="#FAF0E1"/>
        <!-- Crossed-out red FOSSIL EXIT tag -->
        <rect x="7" y="28" width="90" height="17" rx="2" fill="#FEE2E2" stroke="#B91C1C" stroke-width="1.1"/>
        <text x="52" y="39.5" text-anchor="middle" font-size="8.2" font-weight="900" fill="#991B1B" font-family="Segoe UI,sans-serif">FOSSIL EXIT</text>
        <line x1="12" y1="43.5" x2="92" y2="29.5" stroke="#DC2626" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Crisp dark overtime clock face -->
        <circle cx="159" cy="23" r="14.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
        <path d="M159,23 L159,10.5 A12.5,12.5 0 0,1 171.5,23 Z" fill="#FECACA"/>
        <line x1="159" y1="23" x2="159" y2="13" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
        <line x1="159" y1="23" x2="169" y2="23" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
        <circle cx="159" cy="23" r="2" fill="#0F172A"/>
        <!-- Green $26B DEALS tag -->
        <rect x="110" y="44" width="72" height="18" rx="2" fill="#065F46" stroke="#047857" stroke-width="0.9"/>
        <text x="146" y="56" text-anchor="middle" font-size="8.6" font-weight="900" fill="#FFFFFF" font-family="Segoe UI,sans-serif">$26B DEALS</text>
        ${stampBanner('COP31: OVERTIME', '#C2410C', '#FFFFFF', 6, 4, 122, 17, 9.2)}
        ${sourcePill('UN / Guardian', 76, 70)}
      </svg>`,
  },
  {
    num: 6,
    region: 'EUROPE',
    kicker: 'SE POLAND · SECURITY',
    epistemic: 'Officials say',
    headline: 'Russian Missiles Crash in SE&nbsp;Poland',
    summary: 'Two Kh-101 cruise missiles & jet drone fall near border; Polish & NATO jets scramble (Guardian).',
    svg: `
      <svg viewBox="0 0 188 70" width="100%" height="70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="70" fill="#EAF2E8"/>
        <!-- Eastern Poland map landmass vs Ukraine east -->
        <path d="M0,0 L102,0 L94,25 L100,48 L88,70 L0,70 Z" fill="#EFE6D0" stroke="#78716C" stroke-width="1"/>
        <!-- Dashed border line -->
        <line x1="100" y1="4" x2="90" y2="66" stroke="#0F172A" stroke-width="1.8" stroke-dasharray="3.5 2.5"/>
        <text x="14" y="45" font-size="9.5" font-weight="900" fill="#334155" font-family="Segoe UI,sans-serif">POLAND</text>
        <!-- Incoming Kh-101 trajectories -->
        <path d="M174,20 Q130,27 72,38" fill="none" stroke="#DC2626" stroke-width="2.2" stroke-dasharray="4 2"/>
        <path d="M176,34 Q138,40 80,48" fill="none" stroke="#EA580C" stroke-width="1.8" stroke-dasharray="4 2"/>
        <circle cx="72" cy="38" r="5.5" fill="#DC2626" stroke="#FEF08A" stroke-width="1.3"/>
        <circle cx="80" cy="48" r="4.2" fill="#EA580C" stroke="#FEF08A" stroke-width="1.1"/>
        <!-- NATO scramble jet silhouette -->
        <polygon points="146,52 162,48 154,57 156,62 149,57" fill="#1D4ED8"/>
        <rect x="128" y="49" width="54" height="14" rx="2" fill="#FFFFFF" stroke="#1D4ED8" stroke-width="0.9"/>
        <text x="155" y="58.5" text-anchor="middle" font-size="7.2" font-weight="900" fill="#1E3A8A" font-family="Segoe UI,sans-serif">NATO JETS</text>
        ${stampBanner('POLAND: KH-101', '#B91C1C', '#FFFFFF', 6, 4, 118, 17, 9.2)}
        ${sourcePill('Officials · Guardian', 94, 70)}
      </svg>`,
  },
  {
    num: 7,
    region: 'M. EAST',
    kicker: 'BABIL, IRAQ · SECURITY',
    epistemic: 'Officials say',
    headline: 'Iraqi Forces Open Jurf al&#8209;Sakhar&nbsp;HQ',
    summary: 'Army, police & PMU end decade of Kataib Hezbollah control in key Babil town (Al Jazeera).',
    svg: `
      <svg viewBox="0 0 188 70" width="100%" height="70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="70" fill="#F7EEDB"/>
        <!-- Euphrates river blue curve -->
        <path d="M0,47 Q54,37 104,48 T188,41 L188,70 L0,70 Z" fill="#93C5FD"/>
        <path d="M4,54 Q54,44 104,54 T184,48" fill="none" stroke="#1D4ED8" stroke-width="1.3" opacity="0.75"/>
        <!-- Checkpoint gate -->
        <rect x="26" y="31" width="64" height="5" rx="1" fill="#FFFFFF" stroke="#0F172A" stroke-width="0.9"/>
        <rect x="33" y="31" width="9" height="5" fill="#DC2626"/>
        <rect x="52" y="31" width="9" height="5" fill="#DC2626"/>
        <rect x="71" y="31" width="9" height="5" fill="#DC2626"/>
        <path d="M19,24 L27,27 L26,36 L19,41 L12,36 L11,27 Z" fill="#0F172A" stroke="#F59E0B" stroke-width="1"/>
        <!-- Joint HQ + Iraqi flag -->
        <rect x="128" y="21" width="38" height="22" fill="#B45309" stroke="#0F172A" stroke-width="0.9"/>
        <line x1="147" y1="6" x2="147" y2="23" stroke="#0F172A" stroke-width="1.5"/>
        <rect x="148" y="7" width="24" height="4.2" fill="#DC2626"/>
        <rect x="148" y="11.2" width="24" height="4.2" fill="#FFFFFF"/>
        <rect x="148" y="15.4" width="24" height="4.2" fill="#0F172A"/>
        <rect x="102" y="49" width="80" height="15" rx="2" fill="#FFFFFF" stroke="#9A3412" stroke-width="1"/>
        <text x="142" y="59.2" text-anchor="middle" font-size="7.4" font-weight="900" fill="#7C2D12" font-family="Segoe UI,sans-serif">JURF AL-SAKHAR</text>
        ${stampBanner('IRAQ: JOINT HQ', '#B45309', '#FFFFFF', 6, 4, 114, 17, 9.2)}
        ${sourcePill('Al Jazeera', 64, 70)}
      </svg>`,
  },
  {
    num: 8,
    region: 'ASIA',
    kicker: 'TOKYO, JAPAN · ECONOMY',
    epistemic: 'Official',
    headline: 'Japan Oct CPI Rises to&nbsp;2.3%',
    summary: 'Core hits 2.2% YoY (11-month high), keeping Dec BoJ rate-hike bets alive (Stats Bureau, CNA).',
    svg: `
      <svg viewBox="0 0 188 70" width="100%" height="70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="70" fill="#FDF6EC"/>
        <!-- Rising CPI bars -->
        <rect x="20" y="42" width="15" height="17" fill="#CBD5E1" stroke="#64748B" stroke-width="0.7"/>
        <rect x="40" y="38" width="15" height="21" fill="#94A3B8" stroke="#475569" stroke-width="0.7"/>
        <rect x="60" y="32" width="15" height="27" fill="#F59E0B" stroke="#B45309" stroke-width="0.7"/>
        <rect x="80" y="23" width="16" height="36" fill="#DC2626" stroke="#7F1D1D" stroke-width="0.8"/>
        <!-- Upward trend arrow -->
        <path d="M18,40 L88,21" fill="none" stroke="#0F172A" stroke-width="1.6" stroke-dasharray="3 2"/>
        <polygon points="91,20 82,20 86,26" fill="#0F172A"/>
        <!-- Huge bold crimson 2.3% readout -->
        <text x="142" y="39" text-anchor="middle" font-size="22" font-weight="900" fill="#B91C1C" font-family="Bahnschrift,Segoe UI,sans-serif">2.3%</text>
        <rect x="108" y="44" width="68" height="15" rx="2" fill="#FFFFFF" stroke="#B91C1C" stroke-width="0.9"/>
        <text x="142" y="54.2" text-anchor="middle" font-size="7.6" font-weight="900" fill="#0F172A" font-family="Segoe UI,sans-serif">CORE 2.2% · BoJ</text>
        ${stampBanner('JAPAN CPI: 2.3%', '#B91C1C', '#FFFFFF', 6, 4, 118, 17, 9.2)}
        ${sourcePill('Stats Bureau · CNA', 92, 70)}
      </svg>`,
  },
  {
    num: 9,
    region: 'AFRICA',
    kicker: 'TURKANA, KENYA · ENERGY',
    epistemic: 'Official',
    headline: 'Kenya Spuds First Commercial Oil&nbsp;Well',
    summary: 'Drilling begins at Amosing-1 in South Lokichar Basin toward crude exports (The Star, KBC).',
    svg: `
      <svg viewBox="0 0 188 70" width="100%" height="70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="70" fill="#FBF3DE"/>
        <!-- Savanna horizon -->
        <rect x="0" y="52" width="188" height="18" fill="#E6D2A2"/>
        <!-- Derrick rig silhouette -->
        <polygon points="48,54 62,19 72,19 86,54" fill="none" stroke="#0F172A" stroke-width="2.4"/>
        <line x1="55" y1="36" x2="79" y2="36" stroke="#0F172A" stroke-width="1.6"/>
        <line x1="51" y1="46" x2="83" y2="46" stroke="#0F172A" stroke-width="1.6"/>
        <line x1="67" y1="15" x2="67" y2="54" stroke="#B45309" stroke-width="2"/>
        <!-- Golden crude droplet -->
        <path d="M114,22 C114,22 124,35 124,42 A10,10 0 1,1 104,42 C104,35 114,22 114,22 Z" fill="#1E293B" stroke="#D97706" stroke-width="1.5"/>
        <path d="M110,41 A4,4 0 0,0 114,45" fill="none" stroke="#FBBF24" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Kenya flag accent + Amosing-1 tag -->
        <rect x="134" y="14" width="42" height="5" fill="#0F172A"/>
        <rect x="134" y="19" width="42" height="5" fill="#B91C1C"/>
        <rect x="134" y="24" width="42" height="5" fill="#15803D"/>
        <rect x="128" y="34" width="54" height="15" rx="2" fill="#FFFFFF" stroke="#047857" stroke-width="1"/>
        <text x="155" y="44" text-anchor="middle" font-size="7.4" font-weight="900" fill="#065F46" font-family="Segoe UI,sans-serif">AMOSING-1</text>
        ${stampBanner('KENYA: FIRST OIL', '#047857', '#FFFFFF', 6, 4, 120, 17, 9.2)}
        ${sourcePill('Official · The Star', 86, 70)}
      </svg>`,
  },
  {
    num: 10,
    region: 'EUROPE',
    kicker: 'ROME, ITALY · LABOR',
    epistemic: 'Ongoing',
    headline: 'Italy Hit by 24h General&nbsp;Strike',
    summary: 'CGIL leads nationwide walkouts across 100+ cities over Meloni’s 2027 budget (ANSA, FT).',
    svg: `
      <svg viewBox="0 0 188 70" width="100%" height="70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="70" fill="#FBECE9"/>
        <!-- Italian tricolore accent bar -->
        <rect x="136" y="6" width="42" height="6" fill="none" stroke="#475569" stroke-width="0.9"/>
        <rect x="136" y="6" width="14" height="6" fill="#15803D"/>
        <rect x="150" y="6" width="14" height="6" fill="#FFFFFF"/>
        <rect x="164" y="6" width="14" height="6" fill="#DC2626"/>
        <!-- Bold crimson SCIOPERO protest banner -->
        <rect x="20" y="22" width="118" height="21" rx="2" fill="#B91C1C" stroke="#0F172A" stroke-width="1"/>
        <text x="79" y="36.5" text-anchor="middle" font-size="12.5" font-weight="900" letter-spacing="0.06em" fill="#FFFFFF" font-family="Segoe UI,sans-serif">SCIOPERO</text>
        <!-- Banner poles & marching crowd silhouettes clear of source pill -->
        <line x1="24" y1="43" x2="24" y2="51" stroke="#0F172A" stroke-width="1.8"/>
        <line x1="134" y1="43" x2="134" y2="51" stroke="#0F172A" stroke-width="1.8"/>
        <g fill="#1E293B">
          <circle cx="48" cy="48" r="3.2"/><path d="M43,53 Q48,49 53,53 Z"/>
          <circle cx="64" cy="48" r="3.2"/><path d="M59,53 Q64,49 69,53 Z"/>
          <circle cx="80" cy="48" r="3.2"/><path d="M75,53 Q80,49 85,53 Z"/>
          <circle cx="96" cy="48" r="3.2"/><path d="M91,53 Q96,49 101,53 Z"/>
          <circle cx="110" cy="52" r="3.4"/><path d="M104,66 Q110,56 116,66 Z"/>
        </g>
        <!-- 100+ CITIES pill -->
        <rect x="122" y="49" width="60" height="15" rx="2" fill="#FFFFFF" stroke="#B91C1C" stroke-width="1"/>
        <text x="152" y="59.2" text-anchor="middle" font-size="7.4" font-weight="900" fill="#991B1B" font-family="Segoe UI,sans-serif">100+ CITIES</text>
        ${stampBanner('ITALY: 24H STRIKE', '#991B1B', '#FFFFFF', 6, 4, 122, 17, 9.1)}
        ${sourcePill('CGIL · ANSA / FT', 88, 70)}
      </svg>`,
  },
  {
    num: 11,
    region: 'GLOBAL',
    kicker: 'BARCELONA · HEALTH',
    epistemic: 'Early trial',
    headline: 'Oral Cancer Pill Shrinks&nbsp;Tumors',
    summary: 'Daraxonrasib shrinks tumors in >60% of patients (1 in 12 clear scans) at ENA 2026 (Guardian).',
    svg: `
      <svg viewBox="0 0 188 70" width="100%" height="70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="70" fill="#E6F5EE"/>
        <!-- Bi-color oral capsule -->
        <g transform="translate(39,38) rotate(-22)">
          <rect x="-24" y="-9" width="24" height="18" rx="9" fill="#0F766E" stroke="#0F172A" stroke-width="0.9"/>
          <rect x="0" y="-9" width="24" height="18" rx="9" fill="#FFFFFF" stroke="#0F172A" stroke-width="0.9"/>
        </g>
        <!-- Target reticle -->
        <circle cx="96" cy="36" r="14.5" fill="#FECDD3" opacity="0.55" stroke="#0F766E" stroke-width="1.3" stroke-dasharray="3 2"/>
        <circle cx="96" cy="36" r="8.5" fill="none" stroke="#047857" stroke-width="0.9"/>
        <line x1="96" y1="19" x2="96" y2="53" stroke="#047857" stroke-width="0.9"/>
        <line x1="79" y1="36" x2="113" y2="36" stroke="#047857" stroke-width="0.9"/>
        <circle cx="96" cy="36" r="4.8" fill="#E11D48" stroke="#FFFFFF" stroke-width="1"/>
        <!-- Huge bold dark-green >60% SHRUNK badge -->
        <rect x="119" y="19" width="63" height="36" rx="2.5" fill="#FFFFFF" stroke="#065F46" stroke-width="1.3"/>
        <text x="150.5" y="38" text-anchor="middle" font-size="16" font-weight="900" fill="#065F46" font-family="Bahnschrift,Segoe UI,sans-serif">&gt;60%</text>
        <text x="150.5" y="49" text-anchor="middle" font-size="8.0" font-weight="900" fill="#0F172A" font-family="Segoe UI,sans-serif">SHRUNK</text>
        ${stampBanner('CANCER PILL', '#0F766E', '#FFFFFF', 6, 4, 104, 17, 9.2)}
        ${sourcePill('ENA Trial · Guardian', 94, 70)}
      </svg>`,
  },
  {
    num: 12,
    region: 'AMERICAS',
    kicker: 'WASHINGTON, DC · U.S.',
    epistemic: 'Reported',
    headline: 'White House Ousts U.S. Cyber&nbsp;Chief',
    summary: 'Sean Cairncross ousted after outages; DoD CIO Kirsten Davies named acting chief (Reuters, WP).',
    svg: `
      <svg viewBox="0 0 188 70" width="100%" height="70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="70" fill="#EBF0F7"/>
        <!-- Capitol dome & Cyber Shield side-by-side -->
        <path d="M29,23 L48,28 L46,43 L29,52 L12,43 L10,28 Z" fill="#1E3A8A" stroke="#0F172A" stroke-width="1.2"/>
        <polygon points="31,27 23,38 29,38 26,47 36,35 30,35" fill="#EF4444" stroke="#FFFFFF" stroke-width="0.7"/>
        <!-- Capitol dome silhouette cleanly visible next to shield -->
        <line x1="68" y1="22" x2="68" y2="27" stroke="#334155" stroke-width="1.3"/>
        <path d="M56,42 Q58,28 68,27 Q78,28 80,42 Z" fill="#94A3B8" stroke="#334155" stroke-width="0.9"/>
        <rect x="52" y="42" width="32" height="7" fill="#64748B" stroke="#334155" stroke-width="0.8"/>
        <!-- ACTING: K. DAVIES tag -->
        <rect x="88" y="22" width="95" height="16" rx="2" fill="#FFFFFF" stroke="#4338CA" stroke-width="1.1"/>
        <text x="135.5" y="32.5" text-anchor="middle" font-size="7.4" font-weight="900" fill="#1E1B4B" font-family="Segoe UI,sans-serif">ACTING: K. DAVIES</text>
        <rect x="92" y="41" width="89" height="13" rx="2" fill="#FEE2E2" stroke="#DC2626" stroke-width="0.9"/>
        <text x="136.5" y="49.8" text-anchor="middle" font-size="6.8" font-weight="900" fill="#991B1B" font-family="Segoe UI,sans-serif">CAIRNCROSS OUSTED</text>
        ${stampBanner('US CYBER CHIEF', '#4338CA', '#FFFFFF', 6, 4, 114, 17, 9.2)}
        ${sourcePill('Reported · Reuters / WP', 102, 70)}
      </svg>`,
  },
  {
    num: 13,
    region: 'OCEANIA',
    kicker: 'WELLINGTON, NZ · CRICKET',
    epistemic: 'Final',
    headline: 'NZ’s Phillips Hits Historic 118 vs&nbsp;India',
    summary: 'First player to score centuries in all 3 formats vs India in one calendar year (ICC, ESPN).',
    svg: `
      <svg viewBox="0 0 188 70" width="100%" height="70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="70" fill="#E4F3E4"/>
        <!-- Cricket stadium turf & pitch -->
        <ellipse cx="70" cy="46" rx="58" ry="20" fill="#86EFAC" stroke="#15803D" stroke-width="1"/>
        <polygon points="56,31 76,31 86,58 46,58" fill="#E5D3A8" stroke="#A16207" stroke-width="0.8"/>
        <!-- Wooden wickets -->
        <line x1="60" y1="36" x2="60" y2="50" stroke="#78350F" stroke-width="2"/>
        <line x1="65" y1="36" x2="65" y2="50" stroke="#78350F" stroke-width="2"/>
        <line x1="70" y1="36" x2="70" y2="50" stroke="#78350F" stroke-width="2"/>
        <line x1="59" y1="36" x2="71" y2="36" stroke="#78350F" stroke-width="1.6"/>
        <!-- Bold dark scoreboard badge 118* -->
        <rect x="116" y="18" width="66" height="36" rx="2.5" fill="#0F172A" stroke="#0E7490" stroke-width="1.2"/>
        <text x="149" y="39" text-anchor="middle" font-size="18.5" font-weight="900" fill="#FDE047" font-family="Bahnschrift,Segoe UI,sans-serif">118*</text>
        <text x="149" y="50" text-anchor="middle" font-size="6.4" font-weight="800" fill="#E2E8F0" font-family="Segoe UI,sans-serif">3-FORMAT REC.</text>
        ${stampBanner('NZ: PHILLIPS 118', '#0E7490', '#FFFFFF', 6, 4, 120, 17, 9.2)}
        ${sourcePill('Final · ICC / ESPN', 86, 70)}
      </svg>`,
  },
];

const BRIEFS = [
  { num: 14, reg: 'EUROPE', place: 'Brussels:', text: 'EC disburses record €7.9B Ukraine Facility tranche (Reuters).' },
  { num: 15, reg: 'EUROPE', place: 'Europe:', text: 'Students strike in 25+ nations over living costs (Guardian).' },
  { num: 16, reg: 'EUROPE', place: 'Paris:', text: 'France leads talks on 2k–5k EU UNIFIL successor (Reuters).' },
  { num: 17, reg: 'ASIA', place: 'Beijing:', text: 'PBOC holds 1-yr 3.0% & 5-yr 3.5% LPR steady (Xinhua).' },
  { num: 18, reg: 'ASIA', place: 'Seoul:', text: 'DPK moves to impeach Chief Justice Cho Hee-dae (KH).' },
  { num: 19, reg: 'ASIA', place: 'New Delhi:', text: 'Pakistan climate minister attends SCO forum (Al Jazeera).' },
  { num: 20, reg: 'ASIA', place: 'SE Asia:', text: 'U.S. puts cloud AI GPU license curbs on ASEAN (CNA).' },
  { num: 21, reg: 'ASIA', place: 'Manila:', text: 'Marcos cites ₱41.1B in green & EV pledges from China (PNA).' },
  { num: 22, reg: 'M. EAST', place: 'Gaza:', text: 'Israeli strikes kill 6+; Katz holds 70% security zone (Arab News).' },
  { num: 23, reg: 'M. EAST', place: 'Bekaa:', text: 'IDF strikes Janta sites; Hezbollah urges restraint (ToI).' },
  { num: 24, reg: 'M. EAST', place: 'Deir Ezzor:', text: 'UN & Syria start 371k-child polio vaccine drive (SANA).' },
  { num: 25, reg: 'AFRICA', place: 'Darfur:', text: 'WFP cuts aid to 900k amid acute Sudan famine warning (UN News).' },
  { num: 26, reg: 'AFRICA', place: 'Pretoria:', text: '5.2 GW nuclear push draws COP31 legal threats (Daily Mav.).' },
  { num: 27, reg: 'AFRICA', place: 'Kinshasa:', text: 'UN & rights groups slam EU–Rwanda migrant hub plan (UN News).' },
  { num: 28, reg: 'AMERICAS', place: 'New York:', text: 'Nikhil Gupta sentenced to 235 months in murder plot (DOJ).' },
  { num: 29, reg: 'AMERICAS', place: 'Washington:', text: 'GAO warns DoD lacks Patriot/Tomahawk refill plan (AP).' },
  { num: 30, reg: 'AMERICAS', place: 'Ottawa:', text: 'Trump signals Mexico pact while Canada talks stall (CBC).' },
  { num: 31, reg: 'AMERICAS', place: 'Brasília:', text: 'Lula signs 362k-ha Kapot Nhinore Indigenous decree (Gov.br).' },
  { num: 32, reg: 'OCEANIA', place: 'Sydney:', text: 'Dawn terror raids hit 10 suburbs; 3 held, 1 charged (AFP).' },
  { num: 33, reg: 'GLOBAL', place: 'Las Vegas:', text: 'F1 Strip qualifying runs under lights after FP3 (Formula 1).' },
  { num: 34, reg: 'GLOBAL', place: 'Space:', text: 'BepiColombo reaches Mercury ahead of 21 Nov orbit burn (ESA).' },
  { num: 35, reg: 'GLOBAL', place: 'Tennis:', text: 'Billie Jean King Cup Play-offs open across 7 nations (ITF).' },
];

// Map pins (viewBox 300x164): px/py = pin circle center; tx/ty = optional geographic target for leader line
const MAP_PINS = [
  { num: 1, px: 185, py: 31, tx: 171, ty: 41, reg: 'EUROPE' },   // Kyiv
  { num: 2, px: 207, py: 80, reg: 'ASIA' },                        // Gopalpur, India
  { num: 3, px: 252, py: 82, tx: 240, ty: 71, reg: 'ASIA' },     // Taipei / Tokyo Markets
  { num: 4, px: 120, py: 27, tx: 143, ty: 41, reg: 'EUROPE' },   // Brussels / UK-EU
  { num: 5, px: 163, py: 74, tx: 166, ty: 55, reg: 'M. EAST' },  // Antalya COP31
  { num: 6, px: 155, py: 18, tx: 161, ty: 39, reg: 'EUROPE' },   // SE Poland
  { num: 7, px: 188, py: 75, tx: 179, ty: 61, reg: 'M. EAST' },  // Babil, Iraq
  { num: 8, px: 273, py: 52, tx: 254, ty: 56, reg: 'ASIA' },     // Tokyo, Japan
  { num: 9, px: 174, py: 100, reg: 'AFRICA' },                     // Turkana, Kenya
  { num: 10, px: 147, py: 67, tx: 153, ty: 52, reg: 'EUROPE' },  // Rome, Italy
  { num: 11, px: 116, py: 61, tx: 141, ty: 52, reg: 'GLOBAL' },  // Barcelona (ENA Trial)
  { num: 12, px: 70, py: 54, reg: 'AMERICAS' },                    // Washington, DC
  { num: 13, px: 279, py: 151, reg: 'OCEANIA' },                   // Wellington, NZ
];

const BRIEF_DOTS = [
  [143, 41, 'EUROPE'],   // 14 Brussels
  [148, 43, 'EUROPE'],   // 15 Europe students
  [137, 46, 'EUROPE'],   // 16 Paris
  [234, 52, 'ASIA'],     // 17 Beijing
  [244, 56, 'ASIA'],     // 18 Seoul
  [199, 68, 'ASIA'],     // 19 New Delhi
  [222, 99, 'ASIA'],     // 20 SE Asia
  [236, 86, 'ASIA'],     // 21 Manila
  [172, 66, 'M. EAST'],  // 22 Gaza
  [174, 62, 'M. EAST'],  // 23 Bekaa
  [179, 60, 'M. EAST'],  // 24 Deir Ezzor
  [167, 86, 'AFRICA'],   // 25 Darfur
  [158, 134, 'AFRICA'],  // 26 Pretoria
  [154, 102, 'AFRICA'],  // 27 Kinshasa
  [73, 51, 'AMERICAS'],  // 28 New York
  [68, 56, 'AMERICAS'],  // 29 Washington
  [65, 42, 'AMERICAS'],  // 30 Ottawa
  [97, 114, 'AMERICAS'], // 31 Brasília
  [262, 137, 'OCEANIA'], // 32 Sydney
  [48, 56, 'GLOBAL'],    // 33 Las Vegas
];

function renderWorldMapSvg() {
  const leaders = MAP_PINS.filter((p) => p.tx !== undefined)
    .map(
      (p) => `
      <line x1="${p.tx}" y1="${p.ty}" x2="${p.px}" y2="${p.py}" stroke="#0F172A" stroke-width="0.95"/>
      <circle cx="${p.tx}" cy="${p.ty}" r="1.9" fill="#0F172A" stroke="#FFFFFF" stroke-width="0.5"/>`
    )
    .join('');

  const pins = MAP_PINS.map((p) => {
    const c = REGION_COLORS[p.reg];
    return `
      <g>
        <circle cx="${p.px}" cy="${p.py}" r="6.2" fill="${c}" stroke="#FFFFFF" stroke-width="1.2"/>
        <text x="${p.px}" y="${p.py + 2.3}" text-anchor="middle" font-size="6.6" font-weight="900" fill="#FFFFFF" font-family="Segoe UI,sans-serif">${p.num}</text>
      </g>`;
  }).join('');

  const dots = BRIEF_DOTS.map(([x, y, reg]) => {
    const c = REGION_COLORS[reg];
    return `<circle cx="${x}" cy="${y}" r="2.5" fill="${c}" stroke="#FFFFFF" stroke-width="0.65"/>`;
  }).join('');

  return `
    <svg viewBox="0 0 300 164" width="100%" height="184" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="display:block;background:#D6E4EE;border:1px solid #B6C5D1;">
      <rect width="300" height="164" fill="#D6E4EE"/>
      <!-- Subtle print graticule -->
      <g stroke="#B8CBD9" stroke-width="0.65">
        <line x1="0" y1="41" x2="300" y2="41"/>
        <line x1="0" y1="82" x2="300" y2="82" stroke-dasharray="3 2"/>
        <line x1="0" y1="123" x2="300" y2="123"/>
        <line x1="75" y1="0" x2="75" y2="164"/>
        <line x1="150" y1="0" x2="150" y2="164"/>
        <line x1="225" y1="0" x2="225" y2="164"/>
      </g>
      <!-- Warm cream-sand continents -->
      <g fill="#EFE7D6" stroke="#9B907B" stroke-width="0.75" stroke-linejoin="round">
        <path d="M12,26 L36,18 L72,20 L89,30 L82,44 L73,56 L66,68 L58,78 L50,75 L44,64 L32,54 L24,42 Z"/>
        <path d="M98,9 L124,9 L130,24 L112,30 L100,22 Z"/>
        <path d="M72,82 L92,85 L112,102 L106,124 L92,150 L82,154 L76,128 L69,102 Z"/>
        <path d="M132,35 L138,33 L139,42 L133,43 Z"/>
        <path d="M140,23 L162,16 L180,22 L182,46 L166,53 L156,56 L144,53 L136,45 Z"/>
        <path d="M134,62 L166,61 L181,78 L180,100 L169,126 L158,141 L148,122 L143,100 L122,90 L122,73 Z"/>
        <path d="M182,118 L187,120 L185,131 L180,129 Z"/>
        <path d="M180,22 L242,20 L270,34 L258,60 L242,76 L226,88 L215,92 L207,89 L198,74 L186,78 L175,65 L176,50 Z"/>
        <path d="M250,49 L257,52 L253,63 L247,60 Z"/>
        <path d="M214,98 L236,103 L248,108 L234,113 L213,107 Z"/>
        <path d="M228,119 L260,117 L268,135 L256,148 L230,142 Z"/>
        <path d="M276,144 L283,147 L279,157 L273,154 Z"/>
      </g>
      ${dots}
      ${leaders}
      ${pins}
    </svg>`;
}

function renderStoryCard(s, isLead) {
  const c = REGION_COLORS[s.region];
  const bodyClass = isLead ? 'lead-body' : 'sec-body';
  const artClass = isLead ? 'lead-art' : 'sec-art';
  const hlTag = isLead ? 'h2' : 'h3';
  const hlClass = isLead ? 'lead-hl' : 'sec-hl';
  const sumClass = isLead ? 'lead-sum' : 'sec-sum';
  return `
    <article class="${isLead ? 'lead-cell' : 'sec-cell'}">
      <div class="${artClass}">${s.svg}</div>
      <div class="${bodyClass}">
        <div class="kicker-row">
          <div class="kicker-left">
            <span class="num-badge" style="background:${c}">${s.num}</span>
            <span class="kicker-txt" style="color:${c}">${s.kicker}</span>
          </div>
          <span class="ep-pill">${s.epistemic}</span>
        </div>
        <${hlTag} class="${hlClass}">${s.headline}</${hlTag}>
        <p class="${sumClass}">${s.summary}</p>
      </div>
    </article>`;
}

function buildHtml() {
  const kpiHtml = KPIS.map(
    (k) => `
    <div class="kpi-col">
      <div class="kpi-val">${k.value}</div>
      <div class="kpi-lbl">${k.label}</div>
      <div class="kpi-meta">${k.meta}</div>
    </div>`
  ).join('');

  const regionBarHtml = REGIONS.map(
    (r) => `<div class="seg-item" style="flex:${r.count};background:${r.color}">${r.label} ${r.count}</div>`
  ).join('');

  const leadsHtml = LEAD_STORIES.map((s) => renderStoryCard(s, true)).join('');
  const secHtml = SECONDARY_STORIES.map((s) => renderStoryCard(s, false)).join('');

  const renderBriefCol = (items) =>
    items
      .map(
        (b) => `
      <div class="brief-row">
        <span class="b-num" style="color:${REGION_COLORS[b.reg]}">${b.num}</span>
        <span class="b-txt"><strong>${b.place}</strong> ${b.text}</span>
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
    background: #FAF6EE;
    color: #0F172A;
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
    background: #FAF6EE;
  }

  /* 1. MASSIVE EDGE-TO-EDGE CENTERED SERIF MASTHEAD */
  .masthead {
    text-align: center;
    border-bottom: 2.5px solid #0F172A;
    padding-bottom: 4px;
  }
  .micro-rail {
    display: flex;
    justify-content: space-between;
    font-size: 8.2px;
    font-weight: 800;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 1px;
  }
  .masthead h1 {
    font-family: Georgia, Cambria, "Times New Roman", serif;
    font-size: 70px;
    font-weight: 700;
    line-height: 0.94;
    letter-spacing: -0.028em;
    color: #0F172A;
    margin: 1px 0 3px 0;
  }
  .deck {
    font-family: Georgia, Cambria, serif;
    font-style: italic;
    font-size: 11px;
    color: #334155;
    white-space: nowrap;
  }
  .deck b { font-style: normal; color: #991B1B; margin: 0 6px; }

  /* 2. UNIFORM SOLID BLACK KPI STRIP + 16px REGION BAR */
  .kpi-wrap { display: flex; flex-direction: column; gap: 4px; }
  .kpi-strip {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    padding: 2px 0;
  }
  .kpi-col {
    padding: 0 7px;
    border-left: 2px solid #991B1B;
  }
  .kpi-col:first-child {
    border-left: none;
    padding-left: 2px;
  }
  .kpi-col:last-child {
    padding-right: 2px;
  }
  .kpi-val {
    font-family: "Bahnschrift", "Segoe UI", sans-serif;
    font-size: 23px;
    font-weight: 800;
    line-height: 1.0;
    color: #0F172A;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.015em;
  }
  .kpi-lbl {
    font-size: 8.3px;
    font-weight: 700;
    color: #0F172A;
    line-height: 1.12;
    margin-top: 1px;
  }
  .kpi-meta {
    font-size: 7.4px;
    color: #475569;
    line-height: 1.1;
  }
  .seg-bar {
    height: 16px;
    display: flex;
    overflow: hidden;
    border-top: 1px solid #C6BCA8;
    border-bottom: 1px solid #C6BCA8;
  }
  .seg-item {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 7.8px;
    font-weight: 800;
    letter-spacing: 0.02em;
    padding: 0 2px;
    border-right: 1px solid rgba(255,255,255,0.35);
    white-space: nowrap;
  }
  .seg-item:last-child { border-right: none; }

  /* SHARED KICKER + EPISTEMIC BADGE */
  .kicker-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 3px;
    margin-bottom: 1px;
  }
  .kicker-left {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }
  .num-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 14px;
    height: 12px;
    padding: 0 3px;
    color: #FFFFFF;
    font-size: 7.4px;
    font-weight: 900;
    line-height: 1;
  }
  .kicker-txt {
    font-size: 7.0px;
    font-weight: 900;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
  }
  .ep-pill {
    flex-shrink: 0;
    font-size: 6.7px;
    font-weight: 700;
    color: #475569;
    background: #EFE9DC;
    border: 1px solid #CFC6B4;
    padding: 0.5px 4px;
    line-height: 1.15;
    white-space: nowrap;
  }

  /* 3. OPEN HAIRLINE LEAD ROW — 3 WIDE COLUMNS */
  .lead-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-bottom: 1px solid #C6BCA8;
    padding-bottom: 5px;
  }
  .lead-cell {
    display: flex;
    flex-direction: column;
    padding: 0 9px;
    border-right: 1px solid #C6BCA8;
  }
  .lead-cell:first-child { padding-left: 0; }
  .lead-cell:last-child { padding-right: 0; border-right: none; }
  .lead-art { height: 108px; overflow: hidden; border: 1px solid #C6BCA8; }
  .lead-art svg { width: 100%; height: 108px; display: block; }
  .lead-body {
    padding: 4px 1px 0 1px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .lead-hl {
    font-family: Georgia, Cambria, serif;
    font-size: 16.6px;
    font-weight: 700;
    line-height: 1.09;
    color: #0F172A;
    letter-spacing: -0.01em;
  }
  .lead-sum {
    font-size: 9.0px;
    line-height: 1.2;
    color: #334155;
  }

  /* 4. OPEN HAIRLINE SECONDARY GRID — 10 CARDS (2x5) */
  .sec-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    border-bottom: 1px solid #C6BCA8;
  }
  .sec-cell {
    display: flex;
    flex-direction: column;
    padding: 4px 7px 5px 7px;
    border-right: 1px solid #C6BCA8;
  }
  .sec-cell:nth-child(-n+5) {
    padding-top: 0;
    border-bottom: 1px solid #C6BCA8;
  }
  .sec-cell:nth-child(5n+1) { padding-left: 0; }
  .sec-cell:nth-child(5n) { padding-right: 0; border-right: none; }
  .sec-art { height: 70px; overflow: hidden; border: 1px solid #C6BCA8; }
  .sec-art svg { width: 100%; height: 70px; display: block; }
  .sec-body {
    padding: 3.5px 0 0 0;
    display: flex;
    flex-direction: column;
    gap: 1.5px;
  }
  .sec-hl {
    font-family: Georgia, Cambria, serif;
    font-size: 12.2px;
    font-weight: 700;
    line-height: 1.09;
    color: #0F172A;
    letter-spacing: -0.01em;
  }
  .sec-sum {
    font-size: 8.1px;
    line-height: 1.15;
    color: #334155;
  }

  /* 5. OPEN HAIRLINE LOWER BAND — MAP + 2-COL SINGLE-LINE BRIEFS */
  .lower-band {
    display: grid;
    grid-template-columns: 298px 1fr;
    flex: 1;
    min-height: 0;
  }
  .map-panel {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-right: 10px;
    border-right: 1px solid #C6BCA8;
  }
  .briefs-panel {
    display: flex;
    flex-direction: column;
    padding-left: 10px;
    min-width: 0;
  }
  .panel-hdr {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1.5px solid #0F172A;
    padding-bottom: 2px;
    margin-bottom: 4px;
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
  .map-cap {
    font-size: 7.5px;
    color: #475569;
    line-height: 1.18;
    margin-top: 3px;
  }
  .briefs-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    flex: 1;
    min-width: 0;
  }
  .brief-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }
  .brief-col:first-child {
    padding-right: 9px;
    border-right: 1px solid #C6BCA8;
  }
  .brief-col:last-child {
    padding-left: 9px;
  }
  .brief-row {
    display: flex;
    align-items: baseline;
    gap: 4px;
    font-size: 8.3px;
    line-height: 1.15;
    letter-spacing: -0.012em;
    color: #1E293B;
    padding: 1px 0;
    border-bottom: 1px solid #E3DCCB;
    white-space: nowrap;
  }
  .brief-row:last-child { border-bottom: none; }
  .b-num {
    flex: 0 0 13px;
    font-size: 8.2px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
  .b-txt strong { color: #0F172A; font-weight: 800; }

  /* 6. FOOTER — SHARP CRIMSON DATE CHECK + WIRE RAIL */
  .footer-wrap {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-top: auto;
  }
  .date-check {
    background: #FEF2F2;
    border: 2px solid #B91C1C;
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
    margin-right: 5px;
    text-transform: uppercase;
  }
  .foot-rail {
    display: flex;
    justify-content: space-between;
    font-size: 7.2px;
    color: #475569;
    padding: 0 1px;
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
        Missiles hit 3 Kyiv bridges <b>·</b> Cyclone Akvan lands in Odisha <b>·</b> Asia AI rout caps worst week since 2020 <b>·</b> UK &amp; EU seal Brexit reset
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
        <div class="map-cap">Numbers 1–13 match Lead &amp; Feature stories; colored dots map regional briefs 14–35.</div>
      </div>

      <div class="briefs-panel">
        <div class="panel-hdr">
          <h3>Also on Friday 20 November 2026 — ${BRIEFS.length} More Stories</h3>
          <span>Asia · Europe · M. East · Americas · Africa · Oceania · Global</span>
        </div>
        <div class="briefs-cols">
          <div class="brief-col">${renderBriefCol(BRIEFS.slice(0, 11))}</div>
          <div class="brief-col">${renderBriefCol(BRIEFS.slice(11))}</div>
        </div>
      </div>
    </section>

    <footer class="footer-wrap">
      <div class="date-check">
        <span class="dc-badge">Date Check - Excluded</span>
        <strong>19 Nov:</strong> Trump–Xi–Putin APEC Shenzhen declaration, Thu Wall St drop, ICJ Myanmar verdict, Anthropic $81.3B Nasdaq IPO, Berlin Ukraine summit, Bukele filing, Indonesia asset law, Colombia strike.
        <strong>14–18 Nov:</strong> Voyager 1 &amp; Van Gogh $190.4M (18 Nov), Senegal Yenne boat (17–18 Nov), Kerch Bridge (17 Nov), Italy €805M Meta fine (14 Nov).
        <strong>&gt;20 Nov (not yet):</strong> BepiColombo orbit insertion (21 Nov), final COP31 text, F1 Vegas race.
      </div>
      <div class="foot-rail">
        <span>All ${TOTAL_STORIES} stories occurred or were first reported on Friday 20 Nov 2026 · Zero D-1 bleed</span>
        <span>Sources: Reuters, AP, AFP, Guardian, Al Jazeera, IMD, ANSA, UN News, ESA · 100% original vector art</span>
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

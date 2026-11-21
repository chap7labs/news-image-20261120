#!/usr/bin/env node
/**
 * Print-Editorial v4 Generator for news-image-20261120 (Friday 20 November 2026).
 * Renders a deterministic 1024x1024 open-grid warm-newsprint front page via
 * 2x supersampled Headless Chrome (2048x2048 -> high-quality canvas downscale to 1024x1024)
 * and optionally outputs a 300x300 QA thumbnail (--qa-thumb).
 * Zero external network calls, zero third-party images, 100% original HTML/CSS/SVG.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_OUT = join(__dirname, '.build-preview.html');
const HI_PNG_OUT = join(__dirname, '.build-hi2048.png');
const DOWNSCALE_HTML_OUT = join(__dirname, '.build-downscale.html');
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
  { value: '3', label: 'Dnipro bridges damaged in Kyiv', meta: '8+ killed across Ukraine · Officials' },
  { value: '300,000+', label: 'moved to shelters before Akvan', meta: 'Gopalpur landfall · 0 dead · IMD' },
  { value: '-6.2%', label: "Taiwan's share index, Friday's close", meta: 'Kospi -5.2% · Nikkei -5.1%' },
  { value: '100,000', label: 'youth visas a year in the UK–EU deal', meta: 'Food trade & carbon link · Reuters' },
  { value: '2.3%', label: "Japan's consumer inflation in October", meta: 'Core 2.2% · BoJ rate hike in view' },
  { value: '118', label: 'runs by Glenn Phillips against India', meta: 'Centuries in all three formats · ICC' },
];

function stampBanner(text, bg = '#B91C1C', fg = '#FFFFFF', x = 6, y = 4, w = 156, h = 21, fs = 13.5) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${bg}"/>
    <text x="${x + w / 2}" y="${y + h * 0.74}" text-anchor="middle" font-size="${fs}" font-weight="900" letter-spacing="0.03em" fill="${fg}" font-family="Segoe UI,Arial,sans-serif">${text}</text>
  `;
}

function leadDualBanner(primaryText, subText, bg = '#B91C1C', wPrimary = 148, wSub = 128, fsPrimary = 17.5) {
  return `
    <rect x="7" y="5" width="${wPrimary}" height="25" rx="2" fill="${bg}"/>
    <text x="${7 + wPrimary / 2}" y="23.5" text-anchor="middle" font-size="${fsPrimary}" font-weight="900" letter-spacing="0.03em" fill="#FFFFFF" font-family="Segoe UI,Arial,sans-serif">${primaryText}</text>
    <rect x="7" y="32" width="${wSub}" height="19" rx="2" fill="#FFFFFF" stroke="#0F172A" stroke-width="0.9"/>
    <text x="${7 + wSub / 2}" y="45.5" text-anchor="middle" font-size="12" font-weight="900" fill="#0F172A" font-family="Segoe UI,Arial,sans-serif">${subText}</text>
  `;
}

function sourcePill(text, w = 104, viewH = 72, alignRight = false) {
  const h = 15;
  const y = viewH - h - 3;
  const x = alignRight ? 188 - w - 4 : 6;
  const tx = alignRight ? x + w / 2 : 11;
  const anchor = alignRight ? ' text-anchor="middle"' : '';
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#0F172A" opacity="0.93"/>
    <text x="${tx}" y="${y + 10.6}"${anchor} font-size="8.6" font-weight="800" fill="#FFFFFF" font-family="Segoe UI,Arial,sans-serif">${text}</text>
  `;
}

const LEAD_STORIES = [
  {
    num: 1,
    region: 'EUROPE',
    kicker: 'KYIV, UKRAINE · WAR',
    headline: 'Russian Missiles Hit Three Kyiv Dnipro Bridges in Night Barrage',
    summary:
      'Overnight strikes hit three Dnipro bridges, killing seven in Kyiv and at least eight across Ukraine (Kyiv Independent, BBC).',
    svg: `
      <svg viewBox="0 0 320 110" width="100%" height="110" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
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
        <rect width="320" height="110" fill="url(#kyivSky)"/>
        <path d="M0,71 L18,71 L18,55 L32,55 L32,71 L46,71 L46,50 L62,50 L62,71 L78,71 L78,58 L95,58 L95,71 L236,71 L236,48 L254,48 L254,71 L272,71 L272,39 L290,39 L290,71 L320,71 L320,110 L0,110 Z" fill="#080F1C"/>
        <rect x="0" y="75" width="320" height="35" fill="#0B1F36"/>
        <path d="M12,85 Q48,82 84,85 T156,85 T228,85 T308,85" fill="none" stroke="#38BDF8" stroke-width="0.9" opacity="0.35"/>
        <path d="M4,97 Q44,94 84,97 T164,97 T244,97 T312,97" fill="none" stroke="#38BDF8" stroke-width="0.8" opacity="0.25"/>
        <line x1="8" y1="69" x2="312" y2="69" stroke="#94A3B8" stroke-width="3.2"/>
        <path d="M115,69 Q160,25 205,69" fill="none" stroke="#CBD5E1" stroke-width="3"/>
        <line x1="135" y1="51" x2="135" y2="69" stroke="#94A3B8" stroke-width="1"/>
        <line x1="160" y1="46" x2="160" y2="69" stroke="#94A3B8" stroke-width="1"/>
        <line x1="185" y1="51" x2="185" y2="69" stroke="#94A3B8" stroke-width="1"/>
        <rect x="72" y="69" width="8" height="22" fill="#475569"/>
        <rect x="156" y="69" width="8" height="24" fill="#475569"/>
        <rect x="238" y="69" width="8" height="22" fill="#475569"/>
        <path d="M264,8 Q214,32 180,66" fill="none" stroke="#FCA5A5" stroke-width="1.6" stroke-dasharray="4 3"/>
        <path d="M294,18 Q261,40 241,66" fill="none" stroke="#FDBA74" stroke-width="1.5" stroke-dasharray="4 3"/>
        <path d="M134,14 Q107,37 76,67" fill="none" stroke="#FCA5A5" stroke-width="1.4" stroke-dasharray="3 3"/>
        <circle cx="76" cy="67" r="15" fill="url(#blast1)"/>
        <circle cx="180" cy="67" r="20" fill="url(#blast1)"/>
        <circle cx="241" cy="67" r="16" fill="url(#blast1)"/>
        <polygon points="180,51 185,62 196,61 187,69 191,79 180,72 170,78 173,68 165,60 176,61" fill="#FDE047"/>
        ${leadDualBanner('KYIV', '3 bridges hit', '#B91C1C', 94, 108, 18.5)}
        ${sourcePill("Officials' count · Kyiv Ind.", 138, 110)}
      </svg>`,
  },
  {
    num: 2,
    region: 'ASIA',
    kicker: 'ODISHA, INDIA · CYCLONE',
    headline: 'Cyclone Akvan Lands Near Gopalpur After Mass Evacuations',
    summary:
      'Severe storm crosses Odisha coast near Gopalpur at 70–90 km/h after 300,000+ evacuate; no Odisha deaths reported (IMD, Reuters).',
    svg: `
      <svg viewBox="0 0 320 110" width="100%" height="110" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cycPrintGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
            <stop offset="45%" stop-color="#7DD3FC" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#CBE3F0" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="320" height="110" fill="#CBE3F0"/>
        <g stroke="#9CC4DA" stroke-width="0.7" opacity="0.65">
          <line x1="0" y1="36" x2="320" y2="36"/>
          <line x1="0" y1="73" x2="320" y2="73"/>
          <line x1="160" y1="0" x2="160" y2="110"/>
          <line x1="240" y1="0" x2="240" y2="110"/>
        </g>
        <path d="M0,0 L146,0 Q138,32 126,52 Q106,78 82,110 L0,110 Z" fill="#E6D8BA" stroke="#9B8E74" stroke-width="1.3"/>
        <text x="16" y="83" font-size="9.5" font-weight="800" letter-spacing="0.06em" fill="#6B5E48" font-family="Segoe UI,sans-serif">Odisha</text>
        <circle cx="204" cy="54" r="52" fill="url(#cycPrintGlow)"/>
        <g fill="none" stroke="#0369A1" stroke-linecap="round" opacity="0.75">
          <path d="M204,54 m-22,0 a22,16 0 1,1 44,0 a22,16 0 1,1 -44,0" stroke-width="2.3" stroke-dasharray="15 7"/>
          <path d="M204,54 m-38,0 a38,28 0 1,1 76,0 a38,28 0 1,1 -76,0" stroke-width="1.9" stroke-dasharray="22 9"/>
          <path d="M204,54 m-54,0 a54,39 0 1,1 108,0" stroke-width="1.4" stroke-dasharray="18 10"/>
        </g>
        <path d="M204,54 C226,24 262,30 272,58" fill="none" stroke="#0F766E" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M204,54 C182,80 146,78 132,54" fill="none" stroke="#0F766E" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M204,54 C188,28 160,24 146,40" fill="none" stroke="#0284C7" stroke-width="2.1" stroke-linecap="round"/>
        <circle cx="204" cy="54" r="8.5" fill="#FFFFFF" stroke="#B91C1C" stroke-width="2.4"/>
        <path d="M193,54 L132,60" stroke="#B91C1C" stroke-width="2.5" stroke-dasharray="4 2.5"/>
        <polygon points="124,61 134,55 135,66" fill="#B91C1C"/>
        <circle cx="118" cy="61" r="4.5" fill="#DC2626" stroke="#FFFFFF" stroke-width="1.5"/>
        <rect x="24" y="54" width="86" height="17" rx="2" fill="#FFFFFF" stroke="#B91C1C" stroke-width="1.5"/>
        <text x="67" y="66" text-anchor="middle" font-size="9.5" font-weight="900" letter-spacing="0.03em" fill="#991B1B" font-family="Segoe UI,sans-serif">Gopalpur</text>
        ${leadDualBanner('CYCLONE AKVAN', 'Landfall · 8 am', '#0F766E', 176, 124, 17.2)}
        ${sourcePill('Weather office · IMD', 118, 110)}
      </svg>`,
  },
  {
    num: 3,
    region: 'ASIA',
    kicker: 'TAIPEI / TOKYO · MARKETS',
    headline: 'Asia AI & Chip Sell-Off Caps Worst Week Since 2020',
    summary:
      "Taiex tumbles 6.2%, Kospi 5.2%, Nikkei 5.1% and SoftBank 14.5% to end Asia tech's worst week since 2020 (Reuters, Anadolu).",
    svg: `
      <svg viewBox="0 0 320 110" width="100%" height="110" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="110" fill="#0B1220"/>
        <!-- Left drop chart -->
        <g stroke="#1E293B" stroke-width="0.8">
          <line x1="8" y1="60" x2="152" y2="60"/>
          <line x1="8" y1="78" x2="152" y2="78"/>
        </g>
        <polygon points="8,56 36,60 66,65 96,70 124,78 148,87 148,91 8,91" fill="#DC2626" opacity="0.24"/>
        <polyline points="8,56 36,60 66,65 96,70 124,78 148,87" fill="none" stroke="#F59E0B" stroke-width="2.8" stroke-linejoin="round"/>
        <circle cx="148" cy="87" r="3.8" fill="#FDE047" stroke="#DC2626" stroke-width="1.4"/>
        <!-- Right-side data panel with big 12.5px bold figures -->
        <rect x="158" y="5" width="156" height="100" rx="2.5" fill="#111C2E" stroke="#334155" stroke-width="1"/>
        <g font-family="Segoe UI,sans-serif" font-weight="900">
          <rect x="163" y="10" width="146" height="20" rx="1.5" fill="#1E293B"/>
          <rect x="163" y="10" width="44" height="20" rx="1.5" fill="#DC2626"/>
          <text x="168" y="24.2" font-size="12.5" fill="#F8FAFC">Taipei</text>
          <text x="304" y="24.5" text-anchor="end" font-size="12.5" fill="#FCA5A5">-6.2%</text>

          <rect x="163" y="34" width="146" height="20" rx="1.5" fill="#1E293B"/>
          <rect x="163" y="34" width="37" height="20" rx="1.5" fill="#E11D48"/>
          <text x="168" y="48.2" font-size="12.5" fill="#F8FAFC">Seoul</text>
          <text x="304" y="48.5" text-anchor="end" font-size="12.5" fill="#FDA4AF">-5.2%</text>

          <rect x="163" y="58" width="146" height="20" rx="1.5" fill="#1E293B"/>
          <rect x="163" y="58" width="36" height="20" rx="1.5" fill="#EA580C"/>
          <text x="168" y="72.2" font-size="12.5" fill="#F8FAFC">Tokyo</text>
          <text x="304" y="72.5" text-anchor="end" font-size="12.5" fill="#FED7AA">-5.1%</text>

          <rect x="163" y="82" width="146" height="20" rx="1.5" fill="#1E293B"/>
          <rect x="163" y="82" width="66" height="20" rx="1.5" fill="#B91C1C"/>
          <text x="168" y="96.2" font-size="12.5" fill="#FEF08A">SoftBank</text>
          <text x="304" y="96.5" text-anchor="end" font-size="12.5" fill="#FDE047">-14.5%</text>
        </g>
        ${leadDualBanner('AI SELL-OFF', "Asia, Friday's close", '#991B1B', 136, 136, 17.5)}
        ${sourcePill('Closing prices · Reuters', 128, 110)}
      </svg>`,
  },
];

const SECONDARY_STORIES = [
  {
    num: 4,
    region: 'EUROPE',
    kicker: 'BRUSSELS · DIPLOMACY',
    headline: 'UK & EU Seal Post-Brexit Reset Deal',
    summary: 'Food checks, carbon link & 100k visas.',
    svg: `
      <svg viewBox="0 0 188 72" width="100%" height="72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="72" fill="#EAF2FA"/>
        <!-- UK flag -->
        <rect x="8" y="30" width="46" height="28" rx="1.5" fill="#1E3A8A" stroke="#0F172A" stroke-width="1"/>
        <line x1="8" y1="30" x2="54" y2="58" stroke="#FFFFFF" stroke-width="4.2"/>
        <line x1="54" y1="30" x2="8" y2="58" stroke="#FFFFFF" stroke-width="4.2"/>
        <line x1="8" y1="30" x2="54" y2="58" stroke="#DC2626" stroke-width="1.6"/>
        <line x1="54" y1="30" x2="8" y2="58" stroke="#DC2626" stroke-width="1.6"/>
        <line x1="31" y1="30" x2="31" y2="58" stroke="#FFFFFF" stroke-width="6.5"/>
        <line x1="8" y1="44" x2="54" y2="44" stroke="#FFFFFF" stroke-width="6.5"/>
        <line x1="31" y1="30" x2="31" y2="58" stroke="#DC2626" stroke-width="3.6"/>
        <line x1="8" y1="44" x2="54" y2="44" stroke="#DC2626" stroke-width="3.6"/>
        <!-- EU flag -->
        <rect x="126" y="28" width="44" height="24" rx="1.5" fill="#1E3A8A" stroke="#0F172A" stroke-width="1"/>
        <g fill="#FACC15">
          <circle cx="148" cy="32.5" r="1.3"/><circle cx="152.5" cy="34" r="1.3"/>
          <circle cx="155" cy="38" r="1.3"/><circle cx="154" cy="43" r="1.3"/>
          <circle cx="151" cy="46.5" r="1.3"/><circle cx="148" cy="47.5" r="1.3"/>
          <circle cx="145" cy="46.5" r="1.3"/><circle cx="142" cy="43" r="1.3"/>
          <circle cx="141" cy="38" r="1.3"/><circle cx="143.5" cy="34" r="1.3"/>
        </g>
        <!-- Golden bridge & handshake clasp -->
        <path d="M56,43 Q90,22 124,41" fill="none" stroke="#D97706" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M56,47 Q90,34 124,45" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
        <circle cx="90" cy="35" r="7.5" fill="#F59E0B" stroke="#0F172A" stroke-width="1.2"/>
        <path d="M84,35 L89,38 L96,32" fill="none" stroke="#0F172A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        ${stampBanner('UK–EU DEAL', '#1D4ED8', '#FFFFFF', 6, 4, 148, 21, 13.5)}
        ${sourcePill('Agreed · Reuters', 84, 72, true)}
      </svg>`,
  },
  {
    num: 5,
    region: 'M. EAST',
    kicker: 'ANTALYA, TÜRKIYE · CLIMATE',
    headline: 'COP31 Plunges Into&nbsp;Overtime',
    summary: 'Draft omits fossil exit & $120B goal.',
    svg: `
      <svg viewBox="0 0 188 72" width="100%" height="72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="72" fill="#FAF0E1"/>
        <!-- Earth globe -->
        <circle cx="34" cy="48" r="19" fill="#0284C7" stroke="#0F172A" stroke-width="1.3"/>
        <path d="M23,36 Q32,33 38,40 Q34,47 26,48 Z" fill="#16A34A"/>
        <path d="M36,44 Q45,42 49,50 Q44,60 36,57 Z" fill="#16A34A"/>
        <path d="M18,50 Q24,52 25,60 Q18,58 18,50 Z" fill="#22C55E"/>
        <!-- Red thermometer -->
        <rect x="70" y="28" width="9" height="29" rx="4.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.2"/>
        <circle cx="74.5" cy="58" r="7" fill="#DC2626" stroke="#0F172A" stroke-width="1.2"/>
        <rect x="72.5" y="34" width="4" height="22" rx="2" fill="#DC2626"/>
        <line x1="81" y1="35" x2="85" y2="35" stroke="#0F172A" stroke-width="1.2"/>
        <line x1="81" y1="41" x2="85" y2="41" stroke="#0F172A" stroke-width="1.2"/>
        <line x1="81" y1="47" x2="85" y2="47" stroke="#0F172A" stroke-width="1.2"/>
        <!-- Bold red overtime clock -->
        <circle cx="122" cy="38.5" r="12.5" fill="#FFFFFF" stroke="#B91C1C" stroke-width="2.1"/>
        <path d="M122,38.5 L122,28 A10.5,10.5 0 0,1 132.5,38.5 Z" fill="#FCA5A5"/>
        <line x1="122" y1="38.5" x2="122" y2="30" stroke="#0F172A" stroke-width="2.1" stroke-linecap="round"/>
        <line x1="122" y1="38.5" x2="130.5" y2="38.5" stroke="#DC2626" stroke-width="2.1" stroke-linecap="round"/>
        <circle cx="122" cy="38.5" r="2" fill="#0F172A"/>
        ${stampBanner('COP31: NO DEAL', '#C2410C', '#FFFFFF', 6, 4, 162, 21, 13.4)}
        ${sourcePill('Ongoing · UN News', 96, 72, true)}
      </svg>`,
  },
  {
    num: 6,
    region: 'EUROPE',
    kicker: 'SE POLAND · SECURITY',
    headline: 'Russian Cruise Missile Lands in&nbsp;Poland',
    summary: 'It fell in a field; two airports paused.',
    svg: `
      <svg viewBox="0 0 188 72" width="100%" height="72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="72" fill="#EAF2E8"/>
        <!-- Green field terrain -->
        <path d="M0,47 Q52,41 112,47 T188,43 L188,72 L0,72 Z" fill="#86EFAC" stroke="#15803D" stroke-width="1"/>
        <path d="M0,56 Q68,51 124,57 T188,54 L188,72 L0,72 Z" fill="#4ADE80" opacity="0.55"/>
        <!-- Impact crater ring -->
        <ellipse cx="44" cy="55" rx="19" ry="7.5" fill="#78350F" stroke="#DC2626" stroke-width="1.6"/>
        <ellipse cx="44" cy="54" rx="10" ry="3.8" fill="#DC2626" opacity="0.65"/>
        <!-- Streak path & sleek cruise missile -->
        <path d="M158,31 Q110,36 62,48" fill="none" stroke="#DC2626" stroke-width="2.2" stroke-dasharray="4 2.5"/>
        <g transform="translate(114,37) rotate(-14)">
          <polygon points="-24,0 -10,-4.2 14,-4.2 22,0 14,4.2 -10,4.2" fill="#475569" stroke="#0F172A" stroke-width="0.9"/>
          <polygon points="-24,0 -10,-4.2 -10,4.2" fill="#DC2626"/>
          <polygon points="-2,-4.2 5,-10 9,-4.2" fill="#64748B" stroke="#0F172A" stroke-width="0.7"/>
          <polygon points="-2,4.2 5,10 9,4.2" fill="#64748B" stroke="#0F172A" stroke-width="0.7"/>
          <polygon points="15,-4.2 21,-8 21,-2.2" fill="#DC2626"/>
          <polygon points="15,4.2 21,8 21,2.2" fill="#DC2626"/>
          <polygon points="22,-2.2 31,0 22,2.2" fill="#F97316"/>
        </g>
        ${stampBanner('POLAND: MISSILE', '#B91C1C', '#FFFFFF', 6, 4, 170, 21, 13.2)}
        ${sourcePill('Minister says · Reuters', 108, 72, true)}
      </svg>`,
  },
  {
    num: 7,
    region: 'M. EAST',
    kicker: 'BABIL, IRAQ · SECURITY',
    headline: 'Iraqi Forces Open Jurf al&#8209;Sakhar&nbsp;HQ',
    summary: 'Army ends decade-long militia control.',
    svg: `
      <svg viewBox="0 0 188 72" width="100%" height="72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="72" fill="#F7EEDB"/>
        <!-- Blue Tigris river curve -->
        <path d="M0,51 Q54,43 108,53 T188,48 L188,72 L0,72 Z" fill="#93C5FD"/>
        <path d="M2,58 Q54,50 108,59 T186,55" fill="none" stroke="#1D4ED8" stroke-width="1.4" opacity="0.8"/>
        <!-- Iraqi tricolor flag -->
        <line x1="14" y1="28" x2="14" y2="55" stroke="#0F172A" stroke-width="1.6"/>
        <rect x="15" y="28" width="28" height="5" fill="#DC2626"/>
        <rect x="15" y="33" width="28" height="5" fill="#FFFFFF"/>
        <rect x="15" y="38" width="28" height="5" fill="#0F172A"/>
        <circle cx="24" cy="35.5" r="1.2" fill="#15803D"/>
        <circle cx="29" cy="35.5" r="1.2" fill="#15803D"/>
        <circle cx="34" cy="35.5" r="1.2" fill="#15803D"/>
        <!-- Striped checkpoint barrier -->
        <rect x="52" y="42" width="4" height="10" fill="#475569"/>
        <g transform="translate(54,43) rotate(-22)">
          <rect x="0" y="-2.5" width="38" height="5" rx="1" fill="#FFFFFF" stroke="#0F172A" stroke-width="0.8"/>
          <rect x="6" y="-2.5" width="7" height="5" fill="#DC2626"/>
          <rect x="20" y="-2.5" width="7" height="5" fill="#DC2626"/>
        </g>
        <!-- 3 armored trucks advancing -->
        <g fill="#4D7C0F" stroke="#0F172A" stroke-width="0.9">
          <rect x="86" y="35" width="22" height="10" rx="1.5"/>
          <polygon points="108,37 114,40 114,45 108,45"/>
          <circle cx="91" cy="46.5" r="2.6" fill="#0F172A"/><circle cx="106" cy="46.5" r="2.6" fill="#0F172A"/>

          <rect x="120" y="33" width="22" height="10" rx="1.5"/>
          <polygon points="142,35 148,38 148,43 142,43"/>
          <circle cx="125" cy="44.5" r="2.6" fill="#0F172A"/><circle cx="140" cy="44.5" r="2.6" fill="#0F172A"/>

          <rect x="154" y="31" width="22" height="10" rx="1.5"/>
          <polygon points="176,33 182,36 182,41 176,41"/>
          <circle cx="159" cy="42.5" r="2.6" fill="#0F172A"/><circle cx="174" cy="42.5" r="2.6" fill="#0F172A"/>
        </g>
        ${stampBanner('IRAQ: ARMY IN', '#9A3412', '#FFFFFF', 6, 4, 156, 21, 13.4)}
        ${sourcePill('Witnessed · Reuters', 96, 72, true)}
      </svg>`,
  },
  {
    num: 8,
    region: 'ASIA',
    kicker: 'TOKYO, JAPAN · ECONOMY',
    headline: 'Japan October Consumer Inflation Rises to&nbsp;2.3%',
    summary: 'Core hits 2.2%; BoJ hike bets stay firm.',
    svg: `
      <svg viewBox="0 0 188 72" width="100%" height="72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="72" fill="#FDF6EC"/>
        <!-- Japanese flag sun disc -->
        <rect x="10" y="30" width="52" height="34" rx="2" fill="#FFFFFF" stroke="#0F172A" stroke-width="1"/>
        <circle cx="36" cy="47" r="11" fill="#DC2626"/>
        <!-- Bold rising bar chart -->
        <rect x="74" y="40" width="14" height="11" fill="#CBD5E1" stroke="#475569" stroke-width="0.9"/>
        <rect x="92" y="36" width="14" height="15" fill="#94A3B8" stroke="#475569" stroke-width="0.9"/>
        <rect x="110" y="31" width="14" height="20" fill="#F59E0B" stroke="#B45309" stroke-width="0.9"/>
        <rect x="128" y="25" width="15" height="26" fill="#DC2626" stroke="#7F1D1D" stroke-width="1"/>
        <!-- Steep red upward arrow -->
        <path d="M72,38 L148,25" fill="none" stroke="#B91C1C" stroke-width="3" stroke-linecap="round"/>
        <polygon points="154,24 142,21 145,31" fill="#B91C1C"/>
        ${stampBanner('JAPAN: +2.3%', '#B91C1C', '#FFFFFF', 6, 4, 154, 21, 13.5)}
        ${sourcePill('Official · Stats Bureau', 106, 72, true)}
      </svg>`,
  },
  {
    num: 9,
    region: 'AFRICA',
    kicker: 'TURKANA, KENYA · ENERGY',
    headline: 'Kenya Spuds First Commercial Oil&nbsp;Well',
    summary: 'Drilling starts at Amosing-1 in Turkana.',
    svg: `
      <svg viewBox="0 0 188 72" width="100%" height="72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="72" fill="#FBF3DE"/>
        <rect x="0" y="55" width="188" height="17" fill="#E6D2A2"/>
        <!-- Large dark oil derrick rig -->
        <polygon points="22,61 38,27 48,27 64,61" fill="none" stroke="#0F172A" stroke-width="2.6"/>
        <line x1="31" y1="41" x2="55" y2="41" stroke="#0F172A" stroke-width="1.8"/>
        <line x1="26" y1="51" x2="60" y2="51" stroke="#0F172A" stroke-width="1.8"/>
        <line x1="43" y1="24" x2="43" y2="61" stroke="#B45309" stroke-width="2.2"/>
        <!-- Crude gusher droplet -->
        <path d="M88,28 C88,28 100,41 100,49 A12,12 0 1,1 76,49 C76,41 88,28 88,28 Z" fill="#0F172A" stroke="#D97706" stroke-width="1.8"/>
        <path d="M83,49 A4.5,4.5 0 0,0 88,54" fill="none" stroke="#FBBF24" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Kenyan flag motif -->
        <rect x="120" y="30" width="56" height="6" fill="#0F172A"/>
        <rect x="120" y="36" width="56" height="1.5" fill="#FFFFFF"/>
        <rect x="120" y="37.5" width="56" height="6" fill="#B91C1C"/>
        <rect x="120" y="43.5" width="56" height="1.5" fill="#FFFFFF"/>
        <rect x="120" y="45" width="56" height="6" fill="#15803D"/>
        <ellipse cx="148" cy="40.5" rx="5.5" ry="9" fill="#B91C1C" stroke="#FFFFFF" stroke-width="1.1"/>
        ${stampBanner('KENYA: OIL', '#047857', '#FFFFFF', 6, 4, 148, 21, 13.5)}
        ${sourcePill('Official · The Star', 90, 72, true)}
      </svg>`,
  },
  {
    num: 10,
    region: 'EUROPE',
    kicker: 'ROME, ITALY · LABOR',
    headline: "General Strike Over Italy's&nbsp;Budget",
    summary: 'Workers and students march across Italy.',
    svg: `
      <svg viewBox="0 0 188 72" width="100%" height="72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="72" fill="#FBECE9"/>
        <!-- Large red protest banner held by 5 marching silhouettes -->
        <rect x="8" y="29" width="76" height="17" rx="2" fill="#DC2626" stroke="#0F172A" stroke-width="1.2"/>
        <rect x="12" y="33" width="68" height="3.5" fill="#FFFFFF" opacity="0.92"/>
        <rect x="12" y="39" width="50" height="3.5" fill="#FDE047" opacity="0.92"/>
        <!-- 5 bold marching protest silhouettes (left/center-left, clear of bottom-right pill) -->
        <g fill="#0F172A">
          <circle cx="15" cy="52" r="3.1"/><path d="M10,68 L11.5,56 L18.5,56 L20,68 Z"/>
          <circle cx="30" cy="52" r="3.1"/><path d="M25,68 L26.5,56 L33.5,56 L35,68 Z"/>
          <circle cx="45" cy="52" r="3.1"/><path d="M40,68 L41.5,56 L48.5,56 L50,68 Z"/>
          <circle cx="60" cy="52" r="3.1"/><path d="M55,68 L56.5,56 L63.5,56 L65,68 Z"/>
          <circle cx="75" cy="52" r="3.1"/><path d="M70,68 L71.5,56 L78.5,56 L80,68 Z"/>
        </g>
        <!-- Bold Italian tricolor flag -->
        <line x1="112" y1="28" x2="112" y2="51" stroke="#0F172A" stroke-width="1.6"/>
        <rect x="113" y="28" width="54" height="20" fill="none" stroke="#0F172A" stroke-width="0.9"/>
        <rect x="113" y="28" width="18" height="20" fill="#15803D"/>
        <rect x="131" y="28" width="18" height="20" fill="#FFFFFF"/>
        <rect x="149" y="28" width="18" height="20" fill="#DC2626"/>
        ${stampBanner('ITALY: STRIKE', '#991B1B', '#FFFFFF', 6, 4, 158, 21, 13.4)}
        ${sourcePill('Reported · Reuters', 92, 72, true)}
      </svg>`,
  },
  {
    num: 11,
    region: 'GLOBAL',
    kicker: 'BARCELONA · HEALTH',
    headline: 'Pancreatic Cancer Pill Shrinks Tumours',
    summary: 'Daraxonrasib shrinks tumours in early trial.',
    svg: `
      <svg viewBox="0 0 188 72" width="100%" height="72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="72" fill="#E6F5EE"/>
        <!-- Large two-tone capsule -->
        <g transform="translate(38,46) rotate(-22)">
          <rect x="-26" y="-10" width="26" height="20" rx="10" fill="#0F766E" stroke="#0F172A" stroke-width="1.2"/>
          <rect x="0" y="-10" width="26" height="20" rx="10" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.2"/>
          <line x1="0" y1="-10" x2="0" y2="10" stroke="#0F172A" stroke-width="1.1"/>
        </g>
        <!-- Shrinking target cell rings + inward/downward shrink arrows -->
        <circle cx="114" cy="43" r="18" fill="#FECDD3" opacity="0.55" stroke="#0F766E" stroke-width="1.6" stroke-dasharray="4 2.5"/>
        <circle cx="114" cy="43" r="11" fill="none" stroke="#047857" stroke-width="1.3"/>
        <circle cx="114" cy="43" r="5" fill="#E11D48" stroke="#FFFFFF" stroke-width="1.3"/>
        <path d="M144,29 L132,37" stroke="#065F46" stroke-width="2.4" stroke-linecap="round"/>
        <polygon points="128,39 134,32 137,39" fill="#065F46"/>
        <path d="M84,29 L96,37" stroke="#065F46" stroke-width="2.4" stroke-linecap="round"/>
        <polygon points="100,39 91,39 94,32" fill="#065F46"/>
        ${stampBanner('CANCER PILL', '#0F766E', '#FFFFFF', 6, 4, 150, 21, 13.5)}
        ${sourcePill('Early trial · Reuters', 96, 72, true)}
      </svg>`,
  },
  {
    num: 12,
    region: 'ASIA',
    kicker: 'SEOUL · POLITICS',
    headline: "Korea's Ruling Party to Impeach Top Judge",
    summary: 'It follows an overturned conviction.',
    svg: `
      <svg viewBox="0 0 188 72" width="100%" height="72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="72" fill="#FBF1EC"/>
        <!-- Classical court pediment & 4 crisp pillars -->
        <polygon points="10,37 46,26 82,37" fill="#CBD5E1" stroke="#0F172A" stroke-width="1.2"/>
        <rect x="14" y="37" width="64" height="23" fill="#FFFFFF" stroke="#475569" stroke-width="1"/>
        <line x1="23" y1="37" x2="23" y2="60" stroke="#334155" stroke-width="3.2"/>
        <line x1="38" y1="37" x2="38" y2="60" stroke="#334155" stroke-width="3.2"/>
        <line x1="54" y1="37" x2="54" y2="60" stroke="#334155" stroke-width="3.2"/>
        <line x1="69" y1="37" x2="69" y2="60" stroke="#334155" stroke-width="3.2"/>
        <rect x="8" y="60" width="76" height="4" fill="#475569"/>
        <!-- Large bold wooden gavel & sounding block -->
        <rect x="104" y="45" width="44" height="6" rx="1.5" fill="#78350F" stroke="#0F172A" stroke-width="1"/>
        <g transform="translate(124,35) rotate(-28)">
          <rect x="-13" y="-6" width="26" height="12" rx="2" fill="#92400E" stroke="#0F172A" stroke-width="1.2"/>
          <rect x="-2.5" y="6" width="5" height="19" rx="1.5" fill="#B45309" stroke="#0F172A" stroke-width="1"/>
        </g>
        ${stampBanner('SEOUL: IMPEACH', '#B91C1C', '#FFFFFF', 6, 4, 170, 21, 13.2)}
        ${sourcePill('Party decision · KH', 96, 72, true)}
      </svg>`,
  },
  {
    num: 13,
    region: 'OCEANIA',
    kicker: 'WELLINGTON, NZ · CRICKET',
    headline: 'NZ’s Phillips Hits Historic 118 vs&nbsp;India',
    summary: 'Centuries in all 3 formats in one year.',
    svg: `
      <svg viewBox="0 0 188 72" width="100%" height="72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="72" fill="#E4F3E4"/>
        <!-- Green cricket pitch oval -->
        <ellipse cx="78" cy="49" rx="64" ry="19" fill="#86EFAC" stroke="#15803D" stroke-width="1.2"/>
        <polygon points="62,33 88,33 98,61 52,61" fill="#E5D3A8" stroke="#A16207" stroke-width="0.9"/>
        <!-- 3 crisp wooden stumps with bails -->
        <line x1="68" y1="35" x2="68" y2="54" stroke="#78350F" stroke-width="2.4"/>
        <line x1="75" y1="35" x2="75" y2="54" stroke="#78350F" stroke-width="2.4"/>
        <line x1="82" y1="35" x2="82" y2="54" stroke="#78350F" stroke-width="2.4"/>
        <line x1="67" y1="34.5" x2="74" y2="34.5" stroke="#B45309" stroke-width="2.2"/>
        <line x1="76" y1="34.5" x2="83" y2="34.5" stroke="#B45309" stroke-width="2.2"/>
        <!-- Bold angled wooden cricket bat -->
        <g transform="translate(36,44) rotate(28)">
          <rect x="-2" y="-16" width="4" height="10" rx="1" fill="#0F172A"/>
          <rect x="-5.5" y="-6" width="11" height="22" rx="2" fill="#FDE68A" stroke="#78350F" stroke-width="1.2"/>
        </g>
        <!-- Red cricket ball with white seam -->
        <circle cx="122" cy="41" r="8.5" fill="#B91C1C" stroke="#0F172A" stroke-width="1.1"/>
        <path d="M116,36 Q122,41 128,46" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-dasharray="2 1.5"/>
        ${stampBanner('PHILLIPS: 118', '#0E7490', '#FFFFFF', 6, 4, 158, 21, 13.4)}
        ${sourcePill('Scorecard · ICC', 84, 72, true)}
      </svg>`,
  },
];

const BRIEFS = [
  { num: 14, reg: 'EUROPE', place: 'Brussels:', text: 'EC disburses record €7.9B Ukraine Facility tranche (Reuters).' },
  { num: 15, reg: 'EUROPE', place: 'Europe:', text: 'Students strike in 25+ nations over living costs (Guardian).' },
  { num: 16, reg: 'EUROPE', place: 'Paris:', text: 'France leads talks on 2k–5k EU UNIFIL force (Reuters).' },
  { num: 17, reg: 'ASIA', place: 'Beijing:', text: 'PBOC holds 1-yr 3.0% & 5-yr 3.5% LPR steady (Xinhua).' },
  { num: 18, reg: 'AMERICAS', place: 'Washington:', text: 'White House ousts cyber chief Cairncross; Davies acting (Reuters).' },
  { num: 19, reg: 'ASIA', place: 'New Delhi:', text: 'Pakistan climate minister attends SCO forum (Al Jazeera).' },
  { num: 20, reg: 'ASIA', place: 'SE Asia:', text: 'U.S. puts cloud AI GPU license curbs on ASEAN (CNA).' },
  { num: 21, reg: 'ASIA', place: 'Manila:', text: 'Marcos cites ₱41.1B in China green & EV pledges (PNA).' },
  { num: 22, reg: 'M. EAST', place: 'Gaza:', text: 'Israeli strikes kill 6+; Katz holds 70% zone (Arab News).' },
  { num: 23, reg: 'M. EAST', place: 'Bekaa:', text: 'IDF hits Janta sites; Hezbollah urges restraint (ToI).' },
  { num: 24, reg: 'M. EAST', place: 'Deir Ezzor:', text: 'UN & Syria start 371k-child polio vaccine drive (SANA).' },
  { num: 25, reg: 'AFRICA', place: 'Darfur:', text: 'WFP cuts aid to 900k amid Sudan famine warning (UN News).' },
  { num: 26, reg: 'AFRICA', place: 'Pretoria:', text: '5.2 GW nuclear push draws COP31 legal threats (Daily Mav.).' },
  { num: 27, reg: 'AFRICA', place: 'Kinshasa:', text: 'UN & rights groups slam EU–Rwanda migrant hub (UN News).' },
  { num: 28, reg: 'AMERICAS', place: 'New York:', text: 'Nikhil Gupta gets 235 months in murder plot (DOJ).' },
  { num: 29, reg: 'AMERICAS', place: 'Washington:', text: 'GAO warns DoD lacks Patriot/Tomahawk refill plan (AP).' },
  { num: 30, reg: 'AMERICAS', place: 'Ottawa:', text: 'Trump signals Mexico pact while Canada talks stall (CBC).' },
  { num: 31, reg: 'AMERICAS', place: 'Brasília:', text: 'Lula signs 362k-ha Kapot Nhinore land decree (Gov.br).' },
  { num: 32, reg: 'OCEANIA', place: 'Sydney:', text: 'Dawn terror raids hit 10 suburbs; 3 held, 1 charged (AFP).' },
  { num: 33, reg: 'GLOBAL', place: 'Las Vegas:', text: 'F1 Strip qualifying runs under lights after FP3 (F1).' },
  { num: 34, reg: 'GLOBAL', place: 'Space:', text: 'BepiColombo nears Mercury ahead of 21 Nov burn (ESA).' },
  { num: 35, reg: 'GLOBAL', place: 'Tennis:', text: 'Billie Jean King Cup Play-offs open in 7 nations (ITF).' },
];

// Direct, de-clustered geographic numbered pins across all 6 continents
const MAP_PINS = [
  { num: 1, px: 174, py: 37, reg: 'EUROPE' },    // Kyiv, Ukraine
  { num: 2, px: 207, py: 76, reg: 'ASIA' },      // Gopalpur, India
  { num: 3, px: 242, py: 70, reg: 'ASIA' },      // Taipei / Asia AI Sell-Off
  { num: 4, px: 138, py: 34, reg: 'EUROPE' },    // Brussels (UK-EU Deal)
  { num: 5, px: 169, py: 56, reg: 'M. EAST' },   // Antalya, Türkiye
  { num: 6, px: 158, py: 35, reg: 'EUROPE' },    // SE Poland
  { num: 7, px: 188, py: 64, reg: 'M. EAST' },   // Babil, Iraq
  { num: 8, px: 261, py: 54, reg: 'ASIA' },      // Tokyo, Japan
  { num: 9, px: 168, py: 95, reg: 'AFRICA' },    // Turkana, Kenya
  { num: 10, px: 153, py: 52, reg: 'EUROPE' },   // Rome, Italy
  { num: 11, px: 130, py: 52, reg: 'GLOBAL' },   // Barcelona (Cancer Pill)
  { num: 12, px: 244, py: 51, reg: 'ASIA' },     // Seoul, South Korea
  { num: 13, px: 281, py: 147, reg: 'OCEANIA' }, // Wellington, NZ
  { num: 18, px: 54, py: 52, reg: 'AMERICAS' },  // Washington, US
  { num: 25, px: 153, py: 85, reg: 'AFRICA' },   // Darfur, Sudan
  { num: 26, px: 156, py: 126, reg: 'AFRICA' },  // Pretoria, South Africa
  { num: 28, px: 79, py: 42, reg: 'AMERICAS' },  // New York, US
  { num: 30, px: 64, py: 27, reg: 'AMERICAS' },  // Ottawa, Canada
  { num: 31, px: 94, py: 108, reg: 'AMERICAS' }, // Brasília, Brazil
  { num: 32, px: 260, py: 137, reg: 'OCEANIA' }, // Sydney, Australia
  { num: 33, px: 28, py: 48, reg: 'GLOBAL' },    // Las Vegas, US
];

function renderWorldMapSvg() {
  const pins = MAP_PINS.map((p) => {
    const c = REGION_COLORS[p.reg];
    return `
      <g>
        <circle cx="${p.px}" cy="${p.py}" r="6.4" fill="${c}" stroke="#FFFDF9" stroke-width="1.15"/>
        <text x="${p.px}" y="${p.py + 2.5}" text-anchor="middle" font-size="7.2" font-weight="900" fill="#FFFFFF" font-family="Segoe UI,sans-serif">${p.num}</text>
      </g>`;
  }).join('');

  return `
    <svg viewBox="0 -14 300 192" width="278" height="214" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:214px;background:#13293D;border:1px solid #0F172A;">
      <rect x="-20" y="-30" width="340" height="230" fill="#13293D"/>
      <!-- Subtle dark-navy graticule -->
      <g stroke="#23415C" stroke-width="0.7">
        <line x1="-20" y1="41" x2="320" y2="41"/>
        <line x1="-20" y1="82" x2="320" y2="82" stroke-dasharray="3 2"/>
        <line x1="-20" y1="123" x2="320" y2="123"/>
        <line x1="75" y1="-30" x2="75" y2="200"/>
        <line x1="150" y1="-30" x2="150" y2="200"/>
        <line x1="225" y1="-30" x2="225" y2="200"/>
      </g>
      <!-- High-contrast warm cream-sand continents strictly inside x:12..290, y:8..156 -->
      <g fill="#E6D8B8" stroke="#8C7A5B" stroke-width="0.8" stroke-linejoin="round">
        <!-- North America -->
        <path d="M16,24 L42,16 L78,18 L95,28 L88,44 L76,56 L66,68 L56,76 L46,72 L38,60 L26,52 L18,38 Z"/>
        <!-- Greenland -->
        <path d="M96,8 L122,8 L126,22 L110,28 L98,20 Z"/>
        <!-- South America -->
        <path d="M68,80 L88,83 L104,100 L100,122 L88,148 L78,152 L72,126 L64,100 Z"/>
        <!-- UK / Ireland -->
        <path d="M130,33 L136,31 L137,40 L131,41 Z"/>
        <!-- Continental Europe -->
        <path d="M138,22 L158,15 L176,21 L176,45 L164,51 L154,54 L142,51 L134,44 Z"/>
        <!-- Africa -->
        <path d="M132,60 L162,59 L174,76 L173,98 L164,124 L154,138 L144,120 L140,98 L124,88 L124,71 Z"/>
        <!-- Madagascar -->
        <path d="M176,115 L181,117 L179,128 L174,126 Z"/>
        <!-- Asia -->
        <path d="M175,21 L238,19 L264,33 L254,58 L240,74 L224,86 L213,90 L205,87 L196,72 L184,76 L173,63 L174,48 Z"/>
        <!-- Japan -->
        <path d="M256,46 L263,49 L259,60 L253,57 Z"/>
        <!-- SE Asia / Indonesia -->
        <path d="M214,96 L236,101 L248,106 L234,111 L213,105 Z"/>
        <!-- Australia -->
        <path d="M230,117 L262,115 L274,133 L260,146 L232,140 Z"/>
        <!-- New Zealand -->
        <path d="M280,141 L287,144 L283,155 L278,152 Z"/>
      </g>
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
            <span class="k-num" style="background:${c}">${s.num}</span>
            <span class="card-kicker" style="color:${c}">${s.kicker}</span>
          </div>
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
    padding: 8px 14px 7px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
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
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 1px;
  }
  .masthead h1 {
    font-family: Georgia, Cambria, "Times New Roman", serif;
    font-size: 68px;
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
    font-size: 22.5px;
    font-weight: 800;
    line-height: 1.0;
    color: #0F172A;
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
    font-size: 7.9px;
    font-weight: 800;
    letter-spacing: 0.02em;
    padding: 0 2px;
    border-right: 1px solid rgba(255,255,255,0.35);
    white-space: nowrap;
  }
  .seg-item:last-child { border-right: none; }

  /* SHARED KICKER ROW (NO .ep-pill) */
  .kicker-row {
    display: flex;
    align-items: center;
    margin-bottom: 1px;
  }
  .kicker-left {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    width: 100%;
  }
  .k-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 15px;
    height: 13px;
    padding: 0 3px;
    color: #FFFFFF;
    font-size: 8.5px;
    font-weight: 900;
    line-height: 1;
    flex-shrink: 0;
  }
  .card-kicker {
    font-size: 8.2px;
    font-weight: 900;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
  }

  /* 3. OPEN HAIRLINE LEAD ROW — 3 WIDE COLUMNS */
  .lead-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-bottom: 1px solid #C6BCA8;
    padding-bottom: 4px;
  }
  .lead-cell {
    display: flex;
    flex-direction: column;
    padding: 0 9px;
    border-right: 1px solid #C6BCA8;
  }
  .lead-cell:first-child { padding-left: 0; }
  .lead-cell:last-child { padding-right: 0; border-right: none; }
  .lead-art { height: 110px; overflow: hidden; border: 1px solid #C6BCA8; }
  .lead-art svg { width: 100%; height: 110px; display: block; }
  .lead-body {
    padding: 3.5px 1px 0 1px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .lead-hl {
    font-family: Georgia, Cambria, serif;
    font-size: 17.6px;
    font-weight: 700;
    line-height: 1.07;
    color: #0F172A;
    letter-spacing: -0.015em;
  }
  .lead-sum {
    font-size: 9.9px;
    line-height: 1.2;
    color: #1E293B;
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
    padding: 4px 7px 4px 7px;
    border-right: 1px solid #C6BCA8;
  }
  .sec-cell:nth-child(-n+5) {
    padding-top: 0;
    border-bottom: 1px solid #C6BCA8;
  }
  .sec-cell:nth-child(5n+1) { padding-left: 0; }
  .sec-cell:nth-child(5n) { padding-right: 0; border-right: none; }
  .sec-art { height: 72px; overflow: hidden; border: 1px solid #C6BCA8; }
  .sec-art svg { width: 100%; height: 72px; display: block; }
  .sec-body {
    padding: 3px 0 0 0;
    display: flex;
    flex-direction: column;
    gap: 1.5px;
  }
  .sec-hl {
    font-family: Georgia, Cambria, serif;
    font-size: 13.6px;
    font-weight: 700;
    line-height: 1.08;
    color: #0F172A;
    letter-spacing: -0.015em;
  }
  .sec-sum {
    font-size: 9.6px;
    line-height: 1.15;
    letter-spacing: -0.012em;
    color: #1E293B;
    white-space: nowrap;
    overflow: hidden;
  }

  /* 5. OPEN HAIRLINE LOWER BAND — MAP + 2-COL BORDERLESS SINGLE-LINE BRIEFS */
  .lower-band {
    display: grid;
    grid-template-columns: 288px 1fr;
    flex: 1;
    min-height: 0;
  }
  .map-panel {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-right: 9px;
    border-right: 1px solid #C6BCA8;
    min-height: 0;
  }
  .map-main {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .briefs-panel {
    display: flex;
    flex-direction: column;
    padding-left: 9px;
    min-width: 0;
  }
  .panel-hdr {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1.5px solid #0F172A;
    padding-bottom: 2px;
    margin-bottom: 3px;
  }
  .panel-hdr h3 {
    font-size: 9.2px;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #0F172A;
  }
  .panel-hdr span {
    font-size: 7.5px;
    font-weight: 700;
    color: #475569;
  }
  .map-cap {
    font-size: 7.7px;
    color: #334155;
    line-height: 1.18;
    margin-top: 2px;
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
    padding-right: 8px;
    border-right: 1px solid #C6BCA8;
  }
  .brief-col:last-child {
    padding-left: 8px;
  }
  .brief-row {
    display: flex;
    align-items: baseline;
    gap: 4px;
    font-size: 9.6px;
    line-height: 1.18;
    letter-spacing: -0.02em;
    color: #1E293B;
    padding: 0.5px 0;
    white-space: nowrap;
  }
  .b-num {
    flex: 0 0 13px;
    font-size: 9.4px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
  .b-txt strong { color: #0F172A; font-weight: 800; }

  /* 6. FOOTER — SHARP CRIMSON DATE CHECK + WIRE RAIL */
  .footer-wrap {
    display: flex;
    flex-direction: column;
    gap: 2.5px;
    margin-top: auto;
  }
  .date-check {
    background: #FEF2F2;
    border: 2px solid #B91C1C;
    padding: 3.5px 7px;
    font-size: 8.95px;
    line-height: 1.26;
    color: #450A0A;
  }
  .date-check strong:first-child {
    color: #991B1B;
    font-weight: 900;
  }
  .foot-rail {
    display: flex;
    justify-content: space-between;
    font-size: 7.8px;
    font-weight: 600;
    letter-spacing: 0.015em;
    color: #334155;
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
        <div class="map-main">
          <div class="panel-hdr">
            <h3>Where It Happened</h3>
            <span>Stories mapped by number</span>
          </div>
          ${renderWorldMapSvg()}
        </div>
        <div class="map-cap">Each number is the story with that number on this page.</div>
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
        <strong>DATE CHECK</strong> Left out as Thursday 19 November's news: the World Court's ruling on Myanmar, the three-leader declaration in Shenzhen, Anthropic's Nasdaq debut and the migrant boat lost off Senegal. Not yet happened, so not shown: BepiColombo's entry into orbit round Mercury and any final COP31 text.
      </div>
      <div class="foot-rail">
        <span>Every story here happened, or was first reported, on Friday 20 November 2026. Officials' counts are attributed.</span>
        <span>Sources named beside each story · original drawings</span>
      </div>
    </footer>
  </main>
</body>
</html>`;
}

function renderWithChrome(chromePath, htmlFile, outPng, width, height, scaleFactor = 1, virtualTimeBudget = 0) {
  const fileUrl = 'file:///' + resolve(htmlFile).replace(/\\/g, '/');
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    `--force-device-scale-factor=${scaleFactor}`,
    `--window-size=${width},${height}`,
  ];
  if (virtualTimeBudget > 0) {
    args.push(`--virtual-time-budget=${virtualTimeBudget}`);
  }
  args.push(`--screenshot=${resolve(outPng)}`, fileUrl);
  execFileSync(chromePath, args, { stdio: 'pipe' });
}

function buildCanvasDownscaleHtml(dataUri, targetSize) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;width:${targetSize}px;height:${targetSize}px;overflow:hidden;background:#FAF6EE;">
  <img id="srcImg" src="${dataUri}" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;" />
  <canvas id="c" width="${targetSize}" height="${targetSize}" style="display:block;width:${targetSize}px;height:${targetSize}px;"></canvas>
  <script>
    function renderCanvas() {
      const img = document.getElementById('srcImg');
      if (!img || !img.complete || img.naturalWidth === 0) return false;
      const c = document.getElementById('c');
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, ${targetSize}, ${targetSize});
      return true;
    }
    if (!renderCanvas()) {
      document.getElementById('srcImg').addEventListener('load', renderCanvas);
      window.addEventListener('load', renderCanvas);
    }
  </script>
</body>
</html>`;
}

function readPngDimensions(pngPath) {
  const buf = readFileSync(pngPath);
  const sig = '89504e470d0a1a0a';
  if (buf.subarray(0, 8).toString('hex') !== sig) {
    throw new Error(`Invalid PNG signature in ${pngPath}`);
  }
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function main() {
  const chromePath = findChrome();
  const html = buildHtml();
  writeFileSync(HTML_OUT, html, 'utf8');

  // Pass 1: 2x supersampled Hi-DPI capture (2048x2048)
  renderWithChrome(chromePath, HTML_OUT, HI_PNG_OUT, 1024, 1024, 2);
  const hiDims = readPngDimensions(HI_PNG_OUT);
  if (hiDims.width !== 2048 || hiDims.height !== 2048) {
    throw new Error(`Expected 2048x2048 hi-DPI capture, got ${hiDims.width}x${hiDims.height}`);
  }

  // Pass 2: High-quality canvas downscale to exact 1024x1024 entry.png
  const hiDataUri = 'data:image/png;base64,' + readFileSync(HI_PNG_OUT).toString('base64');
  writeFileSync(DOWNSCALE_HTML_OUT, buildCanvasDownscaleHtml(hiDataUri, 1024), 'utf8');
  renderWithChrome(chromePath, DOWNSCALE_HTML_OUT, PNG_OUT, 1024, 1024, 1, 2000);

  const dims = readPngDimensions(PNG_OUT);
  const bytes = statSync(PNG_OUT).size;
  if (dims.width !== 1024 || dims.height !== 1024) {
    throw new Error(`Expected 1024x1024 entry.png, got ${dims.width}x${dims.height}`);
  }
  if (bytes > 1_048_576) {
    throw new Error(`entry.png exceeds 1 MiB limit: ${bytes} bytes`);
  }
  console.log(
    `Rendered ${PNG_OUT} (${dims.width}x${dims.height}, ${bytes.toLocaleString()} bytes, ${(bytes / 1024).toFixed(1)} KB)`
  );

  if (process.argv.includes('--qa-thumb')) {
    const entryDataUri = 'data:image/png;base64,' + readFileSync(PNG_OUT).toString('base64');
    writeFileSync(THUMB_HTML_OUT, buildCanvasDownscaleHtml(entryDataUri, 300), 'utf8');
    renderWithChrome(chromePath, THUMB_HTML_OUT, THUMB_PNG_OUT, 300, 300, 1, 2000);
    const thumbDims = readPngDimensions(THUMB_PNG_OUT);
    console.log(`Rendered 300px QA thumbnail: ${THUMB_PNG_OUT} (${thumbDims.width}x${thumbDims.height})`);
  }
}

main();

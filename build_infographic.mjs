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

function stampBanner(text, bg = '#B91C1C', fg = '#FFFFFF', x = 6, y = 4, w = 156, h = 21, fs = 13.4) {
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

function sourcePill(text, w = 104, viewH = 72) {
  const h = 15;
  const y = viewH - h - 3;
  return `
    <rect x="6" y="${y}" width="${w}" height="${h}" rx="2" fill="#0F172A" opacity="0.93"/>
    <text x="11" y="${y + 10.6}" font-size="8.6" font-weight="800" fill="#FFFFFF" font-family="Segoe UI,Arial,sans-serif">${text}</text>
  `;
}

const LEAD_STORIES = [
  {
    num: 1,
    region: 'EUROPE',
    kicker: 'KYIV, UKRAINE · WAR',
    headline: 'Russian Missiles Hit Three Kyiv Dnipro Bridges in Night Barrage',
    summary:
      'Overnight missile and drone strikes hit Podilsko-Voskresenskyi, Darnytskyi and Pivdennyi bridges, disrupting utilities and transit; 7 killed in Kyiv, 8+ dead nationwide · Officials (Kyiv Ind., Reuters).',
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
      'Severe storm crosses coast at 70–80 km/h (gusts 90 km/h) and weakens into a deep depression; 300,000+ moved to shelters and zero Odisha deaths reported (IMD, NDTV, Hindu).',
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
        <text x="18" y="81" font-size="8.4" font-weight="800" letter-spacing="0.08em" fill="#6B5E48" font-family="Segoe UI,sans-serif">ODISHA</text>
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
        <rect x="26" y="54" width="84" height="17" rx="2" fill="#FFFFFF" stroke="#B91C1C" stroke-width="1.5"/>
        <text x="68" y="65.8" text-anchor="middle" font-size="9.2" font-weight="900" letter-spacing="0.04em" fill="#991B1B" font-family="Segoe UI,sans-serif">GOPALPUR</text>
        <rect x="148" y="88" width="166" height="19" rx="2" fill="#0F172A" opacity="0.94"/>
        <text x="231" y="100.5" text-anchor="middle" font-size="8.1" font-weight="900" letter-spacing="0.03em" fill="#FDE047" font-family="Segoe UI,sans-serif">300,000+ EVACUATED · 70–90 KM/H</text>
        ${leadDualBanner('CYCLONE AKVAN', 'Landfall · 8 am', '#0F766E', 176, 124, 17.2)}
        ${sourcePill('IMD / Odisha govt · NDTV', 132, 110)}
      </svg>`,
  },
  {
    num: 3,
    region: 'ASIA',
    kicker: 'TAIPEI / TOKYO · MARKETS',
    headline: 'Asia AI & Chip Sell-Off Caps Worst Week Since 2020',
    summary:
      'Taiex tumbles 6.2% (-17.5% wk), Kospi slides 5.2%, Nikkei drops 5.1% and SoftBank sinks 14.5% amid AI capex doubts and U.S. chip curbs (Reuters, AA).',
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
        <rect x="10" y="29" width="38" height="22" rx="1.5" fill="#1E3A8A" stroke="#0F172A" stroke-width="0.9"/>
        <line x1="10" y1="29" x2="48" y2="51" stroke="#FFFFFF" stroke-width="3.2"/>
        <line x1="48" y1="29" x2="10" y2="51" stroke="#FFFFFF" stroke-width="3.2"/>
        <line x1="29" y1="29" x2="29" y2="51" stroke="#FFFFFF" stroke-width="5"/>
        <line x1="10" y1="40" x2="48" y2="40" stroke="#FFFFFF" stroke-width="5"/>
        <line x1="29" y1="29" x2="29" y2="51" stroke="#DC2626" stroke-width="2.6"/>
        <line x1="10" y1="40" x2="48" y2="40" stroke="#DC2626" stroke-width="2.6"/>
        <circle cx="158" cy="40" r="14.5" fill="#1E3A8A" stroke="#1E40AF" stroke-width="1"/>
        <circle cx="158" cy="30" r="1.3" fill="#FACC15"/><circle cx="165" cy="33" r="1.3" fill="#FACC15"/>
        <circle cx="168" cy="40" r="1.3" fill="#FACC15"/><circle cx="165" cy="47" r="1.3" fill="#FACC15"/>
        <circle cx="158" cy="50" r="1.3" fill="#FACC15"/><circle cx="151" cy="47" r="1.3" fill="#FACC15"/>
        <circle cx="148" cy="40" r="1.3" fill="#FACC15"/><circle cx="151" cy="33" r="1.3" fill="#FACC15"/>
        <path d="M53,39 Q94,23 137,39" fill="none" stroke="#D97706" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="94" cy="31" r="4" fill="#047857" stroke="#FFFFFF" stroke-width="1"/>
        <rect x="65" y="42" width="60" height="13" rx="2" fill="#FFFFFF" stroke="#1E3A8A" stroke-width="0.9"/>
        <text x="95" y="51.2" text-anchor="middle" font-size="7.1" font-weight="900" fill="#0F172A" font-family="Segoe UI,sans-serif">SPS · ETS · 100K</text>
        ${stampBanner('UK–EU DEAL', '#1D4ED8', '#FFFFFF', 6, 4, 148, 21, 13.5)}
        ${sourcePill('Agreed · Reuters', 92, 72)}
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
        <rect x="8" y="30" width="90" height="18" rx="2" fill="#FEE2E2" stroke="#B91C1C" stroke-width="1.1"/>
        <text x="53" y="42" text-anchor="middle" font-size="8.4" font-weight="900" fill="#991B1B" font-family="Segoe UI,sans-serif">FOSSIL EXIT</text>
        <line x1="13" y1="46" x2="93" y2="32" stroke="#DC2626" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="164" cy="38" r="12.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
        <path d="M164,38 L164,27.5 A10.5,10.5 0 0,1 174.5,38 Z" fill="#FECACA"/>
        <line x1="164" y1="38" x2="164" y2="29.5" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="164" y1="38" x2="173" y2="38" stroke="#DC2626" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="164" cy="38" r="1.8" fill="#0F172A"/>
        <rect x="114" y="52" width="68" height="16" rx="2" fill="#065F46" stroke="#047857" stroke-width="0.9"/>
        <text x="148" y="63" text-anchor="middle" font-size="8.4" font-weight="900" fill="#FFFFFF" font-family="Segoe UI,sans-serif">$26B DEALS</text>
        ${stampBanner('COP31: NO DEAL', '#C2410C', '#FFFFFF', 6, 4, 162, 21, 13.2)}
        ${sourcePill('Ongoing · UN News', 100, 72)}
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
        <path d="M0,0 L102,0 L94,27 L100,50 L88,72 L0,72 Z" fill="#EFE6D0" stroke="#78716C" stroke-width="1"/>
        <line x1="100" y1="26" x2="90" y2="70" stroke="#0F172A" stroke-width="1.8" stroke-dasharray="3.5 2.5"/>
        <text x="12" y="45" font-size="9.5" font-weight="900" fill="#334155" font-family="Segoe UI,sans-serif">POLAND</text>
        <path d="M174,30 Q128,33 74,41" fill="none" stroke="#DC2626" stroke-width="2.6" stroke-dasharray="5 2.5"/>
        <circle cx="74" cy="41" r="6" fill="#DC2626" stroke="#FEF08A" stroke-width="1.5"/>
        <rect x="126" y="48" width="56" height="16" rx="2" fill="#FFFFFF" stroke="#1D4ED8" stroke-width="1"/>
        <text x="154" y="59" text-anchor="middle" font-size="7.4" font-weight="900" fill="#1E3A8A" font-family="Segoe UI,sans-serif">NATO JETS</text>
        ${stampBanner('POLAND: MISSILE', '#B91C1C', '#FFFFFF', 6, 4, 168, 21, 13.0)}
        ${sourcePill('Minister says · Reuters', 112, 72)}
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
        <path d="M0,49 Q54,39 104,50 T188,43 L188,72 L0,72 Z" fill="#93C5FD"/>
        <path d="M4,56 Q54,46 104,56 T184,50" fill="none" stroke="#1D4ED8" stroke-width="1.3" opacity="0.75"/>
        <rect x="28" y="34" width="60" height="5" rx="1" fill="#FFFFFF" stroke="#0F172A" stroke-width="0.9"/>
        <rect x="34" y="34" width="9" height="5" fill="#DC2626"/>
        <rect x="52" y="34" width="9" height="5" fill="#DC2626"/>
        <rect x="70" y="34" width="9" height="5" fill="#DC2626"/>
        <path d="M19,28 L27,31 L26,40 L19,45 L12,40 L11,31 Z" fill="#0F172A" stroke="#F59E0B" stroke-width="1"/>
        <rect x="130" y="33" width="36" height="16" fill="#B45309" stroke="#0F172A" stroke-width="0.9"/>
        <line x1="148" y1="26" x2="148" y2="35" stroke="#0F172A" stroke-width="1.5"/>
        <rect x="149" y="26" width="22" height="3.2" fill="#DC2626"/>
        <rect x="149" y="29.2" width="22" height="3.2" fill="#FFFFFF"/>
        <rect x="149" y="32.4" width="22" height="3.2" fill="#0F172A"/>
        <rect x="122" y="53" width="60" height="15" rx="2" fill="#FFFFFF" stroke="#9A3412" stroke-width="1"/>
        <text x="152" y="63" text-anchor="middle" font-size="6.8" font-weight="900" fill="#7C2D12" font-family="Segoe UI,sans-serif">BABIL HQ</text>
        ${stampBanner('IRAQ: ARMY IN', '#9A3412', '#FFFFFF', 6, 4, 156, 21, 13.2)}
        ${sourcePill('Officials say · Al Jazeera', 112, 72)}
      </svg>`,
  },
  {
    num: 8,
    region: 'ASIA',
    kicker: 'TOKYO, JAPAN · ECONOMY',
    headline: 'Japan Oct CPI Rises to&nbsp;2.3%',
    summary: 'Core hits 2.2%; BoJ hike bets stay firm.',
    svg: `
      <svg viewBox="0 0 188 72" width="100%" height="72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="72" fill="#FDF6EC"/>
        <rect x="16" y="40" width="14" height="12" fill="#CBD5E1" stroke="#64748B" stroke-width="0.7"/>
        <rect x="34" y="37" width="14" height="15" fill="#94A3B8" stroke="#475569" stroke-width="0.7"/>
        <rect x="52" y="33" width="14" height="19" fill="#F59E0B" stroke="#B45309" stroke-width="0.7"/>
        <rect x="70" y="27" width="15" height="25" fill="#DC2626" stroke="#7F1D1D" stroke-width="0.8"/>
        <path d="M16,38 L78,25" fill="none" stroke="#0F172A" stroke-width="1.5" stroke-dasharray="3 2"/>
        <polygon points="81,24 72,24 76,30" fill="#0F172A"/>
        <text x="142" y="44.5" text-anchor="middle" font-size="22" font-weight="900" fill="#B91C1C" font-family="Bahnschrift,Segoe UI,sans-serif">2.3%</text>
        <rect x="116" y="52" width="66" height="15" rx="2" fill="#FFFFFF" stroke="#B91C1C" stroke-width="0.9"/>
        <text x="149" y="62.2" text-anchor="middle" font-size="7.3" font-weight="900" fill="#0F172A" font-family="Segoe UI,sans-serif">CORE 2.2% · BoJ</text>
        ${stampBanner('JAPAN: +2.3%', '#B91C1C', '#FFFFFF', 6, 4, 154, 21, 13.5)}
        ${sourcePill('Official · Stats Bureau', 106, 72)}
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
        <rect x="0" y="53" width="188" height="19" fill="#E6D2A2"/>
        <polygon points="44,54 57,26 67,26 80,54" fill="none" stroke="#0F172A" stroke-width="2.2"/>
        <line x1="51" y1="39" x2="73" y2="39" stroke="#0F172A" stroke-width="1.5"/>
        <line x1="47" y1="47" x2="77" y2="47" stroke="#0F172A" stroke-width="1.5"/>
        <line x1="62" y1="24" x2="62" y2="54" stroke="#B45309" stroke-width="1.8"/>
        <path d="M108,27 C108,27 117,38 117,44 A9,9 0 1,1 99,44 C99,38 108,27 108,27 Z" fill="#1E293B" stroke="#D97706" stroke-width="1.5"/>
        <path d="M104,43 A3.5,3.5 0 0,0 108,47" fill="none" stroke="#FBBF24" stroke-width="1.4" stroke-linecap="round"/>
        <rect x="136" y="29" width="42" height="4.5" fill="#0F172A"/>
        <rect x="136" y="33.5" width="42" height="4.5" fill="#B91C1C"/>
        <rect x="136" y="38" width="42" height="4.5" fill="#15803D"/>
        <rect x="124" y="48" width="58" height="16" rx="2" fill="#FFFFFF" stroke="#047857" stroke-width="1"/>
        <text x="153" y="59" text-anchor="middle" font-size="7.4" font-weight="900" fill="#065F46" font-family="Segoe UI,sans-serif">AMOSING-1</text>
        ${stampBanner('KENYA: OIL', '#047857', '#FFFFFF', 6, 4, 148, 21, 13.5)}
        ${sourcePill('Official · The Star', 94, 72)}
      </svg>`,
  },
  {
    num: 10,
    region: 'EUROPE',
    kicker: 'ROME, ITALY · LABOR',
    headline: 'Italy Hit by 24h General&nbsp;Strike',
    summary: 'CGIL stages walkouts in 100+ cities.',
    svg: `
      <svg viewBox="0 0 188 72" width="100%" height="72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="188" height="72" fill="#FBECE9"/>
        <rect x="16" y="29" width="108" height="19" rx="2" fill="#B91C1C" stroke="#0F172A" stroke-width="1"/>
        <text x="70" y="42.5" text-anchor="middle" font-size="11.5" font-weight="900" letter-spacing="0.06em" fill="#FFFFFF" font-family="Segoe UI,sans-serif">SCIOPERO</text>
        <g fill="#1E293B">
          <circle cx="44" cy="52" r="2.8"/><circle cx="58" cy="52" r="2.8"/>
          <circle cx="72" cy="52" r="2.8"/><circle cx="86" cy="52" r="2.8"/>
          <circle cx="100" cy="52" r="2.8"/>
        </g>
        <rect x="136" y="30" width="45" height="9" fill="none" stroke="#475569" stroke-width="0.9"/>
        <rect x="136" y="30" width="15" height="9" fill="#15803D"/>
        <rect x="151" y="30" width="15" height="9" fill="#FFFFFF"/>
        <rect x="166" y="30" width="15" height="9" fill="#DC2626"/>
        <rect x="118" y="49" width="64" height="16" rx="2" fill="#FFFFFF" stroke="#B91C1C" stroke-width="1"/>
        <text x="150" y="60" text-anchor="middle" font-size="7.5" font-weight="900" fill="#991B1B" font-family="Segoe UI,sans-serif">100+ CITIES</text>
        ${stampBanner('ITALY: STRIKE', '#991B1B', '#FFFFFF', 6, 4, 158, 21, 13.2)}
        ${sourcePill('Ongoing · ANSA', 88, 72)}
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
        <g transform="translate(33,39) rotate(-22)">
          <rect x="-21" y="-8" width="21" height="16" rx="8" fill="#0F766E" stroke="#0F172A" stroke-width="0.9"/>
          <rect x="0" y="-8" width="21" height="16" rx="8" fill="#FFFFFF" stroke="#0F172A" stroke-width="0.9"/>
        </g>
        <circle cx="84" cy="39" r="13" fill="#FECDD3" opacity="0.55" stroke="#0F766E" stroke-width="1.2" stroke-dasharray="3 2"/>
        <circle cx="84" cy="39" r="7.5" fill="none" stroke="#047857" stroke-width="0.9"/>
        <line x1="84" y1="25" x2="84" y2="53" stroke="#047857" stroke-width="0.9"/>
        <line x1="70" y1="39" x2="98" y2="39" stroke="#047857" stroke-width="0.9"/>
        <circle cx="84" cy="39" r="4.2" fill="#E11D48" stroke="#FFFFFF" stroke-width="1"/>
        <rect x="116" y="28" width="66" height="39" rx="2.5" fill="#FFFFFF" stroke="#065F46" stroke-width="1.4"/>
        <text x="149" y="48.5" text-anchor="middle" font-size="16.5" font-weight="900" fill="#065F46" font-family="Bahnschrift,Segoe UI,sans-serif">60.7%</text>
        <text x="149" y="61" text-anchor="middle" font-size="8.2" font-weight="900" fill="#0F172A" font-family="Segoe UI,sans-serif">SHRUNK</text>
        ${stampBanner('CANCER PILL', '#0F766E', '#FFFFFF', 6, 4, 150, 21, 13.5)}
        ${sourcePill('Early trial · Reuters', 100, 72)}
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
        <!-- Supreme Court portico -->
        <polygon points="10,36 42,27 74,36" fill="#CBD5E1" stroke="#334155" stroke-width="1"/>
        <rect x="15" y="36" width="54" height="15" fill="#FFFFFF" stroke="#475569" stroke-width="0.9"/>
        <line x1="24" y1="36" x2="24" y2="51" stroke="#475569" stroke-width="2.2"/>
        <line x1="36" y1="36" x2="36" y2="51" stroke="#475569" stroke-width="2.2"/>
        <line x1="48" y1="36" x2="48" y2="51" stroke="#475569" stroke-width="2.2"/>
        <line x1="60" y1="36" x2="60" y2="51" stroke="#475569" stroke-width="2.2"/>
        <rect x="10" y="51" width="64" height="3" fill="#64748B"/>
        <!-- Gavel + impeachment docket -->
        <rect x="86" y="29" width="94" height="38" rx="2" fill="#FFFFFF" stroke="#B91C1C" stroke-width="1.2"/>
        <g transform="translate(104,45) rotate(-28)">
          <rect x="-8" y="-4" width="16" height="8" rx="1.5" fill="#78350F" stroke="#0F172A" stroke-width="0.8"/>
          <rect x="-1.5" y="4" width="3" height="12" fill="#92400E"/>
        </g>
        <text x="148" y="43" text-anchor="middle" font-size="7.8" font-weight="900" fill="#991B1B" font-family="Segoe UI,sans-serif">IMPEACHMENT</text>
        <rect x="122" y="48" width="52" height="13" rx="1.5" fill="#FEE2E2" stroke="#DC2626" stroke-width="0.8"/>
        <text x="148" y="57.2" text-anchor="middle" font-size="7.0" font-weight="900" fill="#7F1D1D" font-family="Segoe UI,sans-serif">DOCKET</text>
        ${stampBanner('SEOUL: IMPEACH', '#B91C1C', '#FFFFFF', 6, 4, 168, 21, 13.0)}
        ${sourcePill('Party decision · KH', 98, 72)}
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
        <ellipse cx="64" cy="46" rx="52" ry="18" fill="#86EFAC" stroke="#15803D" stroke-width="1"/>
        <polygon points="52,33 70,33 78,56 44,56" fill="#E5D3A8" stroke="#A16207" stroke-width="0.8"/>
        <line x1="56" y1="36" x2="56" y2="49" stroke="#78350F" stroke-width="2"/>
        <line x1="61" y1="36" x2="61" y2="49" stroke="#78350F" stroke-width="2"/>
        <line x1="66" y1="36" x2="66" y2="49" stroke="#78350F" stroke-width="2"/>
        <line x1="55" y1="36" x2="67" y2="36" stroke="#78350F" stroke-width="1.6"/>
        <rect x="114" y="28" width="68" height="39" rx="2.5" fill="#0F172A" stroke="#0E7490" stroke-width="1.2"/>
        <text x="148" y="50" text-anchor="middle" font-size="19" font-weight="900" fill="#FDE047" font-family="Bahnschrift,Segoe UI,sans-serif">118*</text>
        <text x="148" y="61" text-anchor="middle" font-size="6.8" font-weight="800" fill="#E2E8F0" font-family="Segoe UI,sans-serif">3-FORMAT REC.</text>
        ${stampBanner('PHILLIPS: 118', '#0E7490', '#FFFFFF', 6, 4, 158, 21, 13.2)}
        ${sourcePill('Final · ICC / ESPN', 92, 72)}
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

// Direct, de-clustered geographic numbered pins (1-13) on dark-navy map (viewBox 300x176)
const MAP_PINS = [
  { num: 1, px: 176, py: 38, reg: 'EUROPE' },   // Kyiv, Ukraine
  { num: 2, px: 209, py: 79, reg: 'ASIA' },     // Gopalpur, India
  { num: 3, px: 245, py: 73, reg: 'ASIA' },     // Taipei / Asia AI Sell-Off
  { num: 4, px: 132, py: 34, reg: 'EUROPE' },   // London / Brussels (UK-EU Deal)
  { num: 5, px: 170, py: 58, reg: 'M. EAST' },  // Antalya, Türkiye
  { num: 6, px: 160, py: 35, reg: 'EUROPE' },   // SE Poland
  { num: 7, px: 188, py: 65, reg: 'M. EAST' },  // Babil, Iraq
  { num: 8, px: 264, py: 56, reg: 'ASIA' },     // Tokyo, Japan
  { num: 9, px: 171, py: 98, reg: 'AFRICA' },   // Turkana, Kenya
  { num: 10, px: 152, py: 55, reg: 'EUROPE' },  // Rome, Italy
  { num: 11, px: 133, py: 55, reg: 'GLOBAL' },  // Barcelona (Cancer Pill)
  { num: 12, px: 246, py: 54, reg: 'ASIA' },    // Seoul, South Korea
  { num: 13, px: 278, py: 150, reg: 'OCEANIA' }, // Wellington, NZ
];

function renderWorldMapSvg() {
  const pins = MAP_PINS.map((p) => {
    const c = REGION_COLORS[p.reg];
    return `
      <g>
        <circle cx="${p.px}" cy="${p.py}" r="6.8" fill="${c}" stroke="#FFFDF9" stroke-width="1.2"/>
        <text x="${p.px}" y="${p.py + 2.6}" text-anchor="middle" font-size="7.4" font-weight="900" fill="#FFFFFF" font-family="Segoe UI,sans-serif">${p.num}</text>
      </g>`;
  }).join('');

  return `
    <svg viewBox="0 -6 300 176" width="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="display:block;flex:1;min-height:0;width:100%;background:#13293D;border:1px solid #0F172A;">
      <rect y="-6" width="300" height="176" fill="#13293D"/>
      <!-- Subtle dark-navy graticule -->
      <g stroke="#23415C" stroke-width="0.7">
        <line x1="0" y1="41" x2="300" y2="41"/>
        <line x1="0" y1="82" x2="300" y2="82" stroke-dasharray="3 2"/>
        <line x1="0" y1="123" x2="300" y2="123"/>
        <line x1="75" y1="-6" x2="75" y2="170"/>
        <line x1="150" y1="-6" x2="150" y2="170"/>
        <line x1="225" y1="-6" x2="225" y2="170"/>
      </g>
      <!-- High-contrast warm cream-sand continents -->
      <g fill="#E6D8B8" stroke="#8C7A5B" stroke-width="0.8" stroke-linejoin="round">
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
    font-size: 8.2px;
    font-weight: 800;
    letter-spacing: 0.09em;
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
    font-size: 16.4px;
    font-weight: 700;
    line-height: 1.09;
    color: #0F172A;
    letter-spacing: -0.01em;
  }
  .lead-sum {
    font-size: 9.0px;
    line-height: 1.18;
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
    font-size: 13.1px;
    font-weight: 700;
    line-height: 1.08;
    color: #0F172A;
    letter-spacing: -0.015em;
  }
  .sec-sum {
    font-size: 9.5px;
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
    font-size: 9.2px;
    line-height: 1.15;
    letter-spacing: -0.018em;
    color: #1E293B;
    padding: 0.5px 0;
    white-space: nowrap;
  }
  .b-num {
    flex: 0 0 13px;
    font-size: 9.1px;
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
    font-size: 8.1px;
    line-height: 1.24;
    color: #450A0A;
  }
  .date-check strong:first-child {
    color: #991B1B;
    font-weight: 900;
  }
  .foot-rail {
    display: flex;
    justify-content: space-between;
    font-size: 7.4px;
    font-weight: 600;
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
        <span>${TOTAL_STORIES} STORIES · 7 REGIONS · CONTEST EDITION FOR FRIDAY 20 NOVEMBER 2026</span>
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
            <span>1–3 Leads · 4–13 Features</span>
          </div>
          ${renderWorldMapSvg()}
        </div>
        <div class="map-cap">Each number matches the story on this page (1–3 Leads · 4–13 Features).</div>
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
        <strong>DATE CHECK —</strong> This edition sums up Friday 20 November 2026 alone (the 20 Nov contest day; the 13 Nov house reference images show an earlier week's news). <strong>Left out as Thursday 19 November's news:</strong> the World Court's ruling on Myanmar, the three-leader Trump–Xi–Putin declaration in Shenzhen, Anthropic's Nasdaq IPO debut, and the migrant boat lost off Senegal. <strong>Not yet happened on Friday 20 Nov, so not shown:</strong> BepiColombo's Saturday 21 Nov entry into orbit round Mercury and any final COP31 text.
      </div>
      <div class="foot-rail">
        <span>Every story here happened, or was first reported, on Friday 20 November 2026. Officials' counts are attributed.</span>
        <span>Sources: Reuters, AP, AFP, Guardian, Al Jazeera, IMD, ANSA, UN News, ICC, ESPN · 100% original vector art</span>
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

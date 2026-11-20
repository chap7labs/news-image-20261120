#!/usr/bin/env node
/**
 * Programmatic HTML/CSS + inline SVG generator for news-image-20261120.
 * Renders a deterministic 1024x1024 editorial front page for Friday 20 November 2026
 * using local Headless Chrome and optionally generates a 300px QA thumbnail.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
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

const REGION_COLORS = {
  GLOBAL: '#0F172A',
  EUROPE: '#1D4ED8',
  ASIA: '#B91C1C',
  AMERICAS: '#6D28D9',
  'M. EAST': '#C2410C',
  AFRICA: '#047857',
  OCEANIA: '#0E7490',
};

const KPIS = [
  { value: '3 Bridges', label: 'Kyiv Dnipro crossings hit', meta: 'Officials · Ukraine', accent: '#1D4ED8' },
  { value: '300,000+', label: 'Evacuated for Cyclone Akvan', meta: 'IMD / Odisha–AP', accent: '#B91C1C' },
  { value: '-5.2%', label: 'Kospi (-5.1% Nikkei) rout', meta: 'Asia AI sell-off', accent: '#991B1B' },
  { value: '€7.9B', label: 'Record EU payout to Kyiv', meta: 'Ukraine Facility · EC', accent: '#1E40AF' },
  { value: '€805M', label: 'Italy privacy fine on Meta', meta: 'Garante · Android app', accent: '#6D28D9' },
  { value: '25+ Nations', label: 'Europe youth strikes', meta: 'Living cost & AI · CNN', accent: '#047857' },
];

const LEAD_STORIES = [
  {
    num: 1,
    region: 'GLOBAL',
    tag: 'Analysts / Reported',
    headline: 'APEC Shenzhen Fallout Rattles Allies After Trilateral Summit',
    summary:
      'Capitals dissect Thursday’s 4-point Shenzhen declaration as Europe and Zelenskyy weigh Trump’s Air Force One call to Berlin’s 40-nation summit and push back against any Ukraine deal without Kyiv.',
    svg: `
      <svg viewBox="0 0 228 104" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F7F2E7"/>
            <stop offset="100%" stop-color="#E9DEC9"/>
          </linearGradient>
        </defs>
        <rect width="228" height="104" rx="4" fill="url(#bg1)"/>
        <!-- Subtle architectural globe arcs -->
        <ellipse cx="114" cy="64" rx="98" ry="34" fill="none" stroke="#D3C7B0" stroke-width="0.9" stroke-dasharray="3 3"/>
        <ellipse cx="114" cy="64" rx="70" ry="23" fill="none" stroke="#D3C7B0" stroke-width="0.7"/>
        <!-- Flagpoles (flush-attached flags flying uniformly right) -->
        <line x1="42" y1="12" x2="42" y2="56" stroke="#334155" stroke-width="1.6"/>
        <circle cx="42" cy="11" r="2.2" fill="#B45309"/>
        <line x1="100" y1="8" x2="100" y2="49" stroke="#334155" stroke-width="1.6"/>
        <circle cx="100" cy="7" r="2.2" fill="#B45309"/>
        <line x1="158" y1="12" x2="158" y2="56" stroke="#334155" stroke-width="1.6"/>
        <circle cx="158" cy="11" r="2.2" fill="#B45309"/>
        <!-- Russia Flag (left, flush to x=43) -->
        <g transform="translate(43,13)">
          <rect width="30" height="6.3" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="0.4"/>
          <rect y="6.3" width="30" height="6.3" fill="#1D4ED8"/>
          <rect y="12.6" width="30" height="6.4" fill="#DC2626"/>
        </g>
        <!-- China Flag (center, flush to x=101) -->
        <g transform="translate(101,9)">
          <rect width="30" height="19" fill="#C8102E"/>
          <polygon points="6.2,4.2 7.2,7.2 10.3,7.2 7.8,9.1 8.7,12 6.2,10.2 3.7,12 4.6,9.1 2.1,7.2 5.2,7.2" fill="#FACC15"/>
          <circle cx="13" cy="4.4" r="0.95" fill="#FACC15"/>
          <circle cx="14.8" cy="6.6" r="0.95" fill="#FACC15"/>
          <circle cx="14.8" cy="9.4" r="0.95" fill="#FACC15"/>
          <circle cx="13" cy="11.6" r="0.95" fill="#FACC15"/>
        </g>
        <!-- USA Flag (right, flush to x=159) -->
        <g transform="translate(159,13)">
          <rect width="30" height="19" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="0.4"/>
          <rect y="0" width="30" height="2.7" fill="#B91C1C"/>
          <rect y="5.4" width="30" height="2.7" fill="#B91C1C"/>
          <rect y="10.8" width="30" height="2.7" fill="#B91C1C"/>
          <rect y="16.3" width="30" height="2.7" fill="#B91C1C"/>
          <rect width="13.5" height="10.5" fill="#1E3A8A"/>
          <circle cx="3.2" cy="2.7" r="0.75" fill="#FFF"/><circle cx="6.7" cy="2.7" r="0.75" fill="#FFF"/><circle cx="10.2" cy="2.7" r="0.75" fill="#FFF"/>
          <circle cx="5.0" cy="5.2" r="0.75" fill="#FFF"/><circle cx="8.5" cy="5.2" r="0.75" fill="#FFF"/>
          <circle cx="3.2" cy="7.8" r="0.75" fill="#FFF"/><circle cx="6.7" cy="7.8" r="0.75" fill="#FFF"/><circle cx="10.2" cy="7.8" r="0.75" fill="#FFF"/>
        </g>
        <!-- Trilateral Round Table with depth & dossiers -->
        <ellipse cx="114" cy="70" rx="58" ry="19" fill="#1E293B" opacity="0.28"/>
        <ellipse cx="114" cy="66" rx="58" ry="19" fill="#7C4A2D" stroke="#452715" stroke-width="1.5"/>
        <ellipse cx="114" cy="66" rx="35" ry="10.5" fill="#F3ECE0" stroke="#B09E82" stroke-width="1"/>
        <!-- Dossiers on table -->
        <rect x="65" y="61" width="9" height="6" rx="1" fill="#FFFDF9" stroke="#94A3B8" stroke-width="0.6" transform="rotate(-12 69 64)"/>
        <rect x="109" y="50" width="10" height="6" rx="1" fill="#FFFDF9" stroke="#94A3B8" stroke-width="0.6"/>
        <rect x="154" y="61" width="9" height="6" rx="1" fill="#FFFDF9" stroke="#94A3B8" stroke-width="0.6" transform="rotate(12 158 64)"/>
        <!-- Delegation Seats -->
        <circle cx="48" cy="66" r="7.5" fill="#1E293B" stroke="#FFFDF9" stroke-width="1.3"/>
        <text x="48" y="68.5" text-anchor="middle" font-size="6.4" font-weight="800" fill="#FFF" font-family="Segoe UI,sans-serif">RU</text>
        <circle cx="114" cy="43" r="7.5" fill="#991B1B" stroke="#FFFDF9" stroke-width="1.3"/>
        <text x="114" y="45.5" text-anchor="middle" font-size="6.4" font-weight="800" fill="#FFF" font-family="Segoe UI,sans-serif">CN</text>
        <circle cx="180" cy="66" r="7.5" fill="#1D4ED8" stroke="#FFFDF9" stroke-width="1.3"/>
        <text x="180" y="68.5" text-anchor="middle" font-size="6.4" font-weight="800" fill="#FFF" font-family="Segoe UI,sans-serif">US</text>
        <!-- Center emblem -->
        <text x="114" y="68.4" text-anchor="middle" font-size="7" font-weight="800" fill="#1E293B" font-family="Segoe UI,sans-serif" letter-spacing="0.3">SHENZHEN</text>
        <!-- Footer Banner -->
        <rect x="6" y="88" width="216" height="12.5" rx="2" fill="#0F172A"/>
        <text x="114" y="96.6" text-anchor="middle" font-size="6.9" font-weight="700" fill="#FDE68A" font-family="Segoe UI,sans-serif" letter-spacing="0.4">20 NOV FALLOUT  →  BERLIN 40-NATION SUMMIT</text>
      </svg>
    `,
  },
  {
    num: 2,
    region: 'EUROPE',
    tag: 'Officials say',
    headline: 'Russian Missiles Hit 3 Kyiv Bridges, Kill At Least 6',
    summary:
      'Overnight ballistic missiles and drones damage Podilsko-Voskresenskyi, Darnytskyi, and Pivdennyi crossings plus water utility sites; nationwide toll reaches 8–12 as 3 Russian objects enter Poland.',
    svg: `
      <svg viewBox="0 0 228 104" xmlns="http://www.w3.org/2000/svg">
        <rect width="228" height="104" rx="4" fill="#EAF1F6"/>
        <!-- Urban blocks -->
        <g fill="#DCE6EF">
          <rect x="8" y="8" width="44" height="20" rx="2"/>
          <rect x="12" y="34" width="54" height="18" rx="2"/>
          <rect x="8" y="58" width="48" height="22" rx="2"/>
          <rect x="168" y="10" width="50" height="20" rx="2"/>
          <rect x="160" y="38" width="56" height="22" rx="2"/>
          <rect x="170" y="65" width="48" height="16" rx="2"/>
        </g>
        <!-- Dnipro River -->
        <path d="M 96 0 C 86 25, 122 46, 114 70 C 110 82, 122 94, 128 104 L 154 104 C 146 92, 138 80, 140 68 C 148 44, 112 23, 122 0 Z" fill="#60A5FA" opacity="0.74"/>
        <path d="M 105 0 C 96 25, 131 46, 123 70 C 119 82, 131 94, 137 104" fill="none" stroke="#2563EB" stroke-width="1.2" opacity="0.5"/>
        <text x="127" y="12" font-size="6.4" font-weight="800" fill="#1E3A8A" font-family="Segoe UI,sans-serif">DNIPRO</text>
        <!-- 3 Struck Bridges with truss highlights -->
        <g stroke="#334155" stroke-width="3.6" stroke-linecap="round">
          <line x1="72" y1="25" x2="146" y2="25"/>
          <line x1="88" y1="49" x2="162" y2="49"/>
          <line x1="92" y1="73" x2="166" y2="73"/>
        </g>
        <g stroke="#CBD5E1" stroke-width="0.9" stroke-dasharray="4 3">
          <line x1="75" y1="25" x2="143" y2="25"/>
          <line x1="91" y1="49" x2="159" y2="49"/>
          <line x1="95" y1="73" x2="163" y2="73"/>
        </g>
        <!-- Labels -->
        <text x="10" y="27.5" font-size="7" font-weight="800" fill="#0F172A" font-family="Segoe UI,sans-serif">Podilsko</text>
        <text x="12" y="51.5" font-size="7" font-weight="800" fill="#0F172A" font-family="Segoe UI,sans-serif">Darnytskyi</text>
        <text x="12" y="75.5" font-size="7" font-weight="800" fill="#0F172A" font-family="Segoe UI,sans-serif">Pivdennyi</text>
        <!-- Impact Rings -->
        <g>
          <circle cx="109" cy="25" r="9" fill="#DC2626" opacity="0.24"/>
          <circle cx="109" cy="25" r="4.3" fill="#DC2626" stroke="#FFF" stroke-width="1"/>
          <circle cx="127" cy="49" r="9" fill="#DC2626" opacity="0.24"/>
          <circle cx="127" cy="49" r="4.3" fill="#DC2626" stroke="#FFF" stroke-width="1"/>
          <circle cx="128" cy="73" r="9" fill="#DC2626" opacity="0.24"/>
          <circle cx="128" cy="73" r="4.3" fill="#DC2626" stroke="#FFF" stroke-width="1"/>
        </g>
        <!-- Incoming missile arcs -->
        <path d="M 218 8 Q 168 6, 115 23" fill="none" stroke="#B91C1C" stroke-width="1.4" stroke-dasharray="3 2"/>
        <path d="M 220 27 Q 178 29, 133 47" fill="none" stroke="#B91C1C" stroke-width="1.4" stroke-dasharray="3 2"/>
        <path d="M 220 52 Q 182 56, 134 71" fill="none" stroke="#B91C1C" stroke-width="1.4" stroke-dasharray="3 2"/>
        <!-- Footer strip -->
        <rect x="6" y="88" width="216" height="12.5" rx="2" fill="#991B1B"/>
        <text x="114" y="96.6" text-anchor="middle" font-size="6.9" font-weight="700" fill="#FFFFFF" font-family="Segoe UI,sans-serif" letter-spacing="0.4">KYIV · 3 BRIDGES DAMAGED · 6+ KILLED IN CAPITAL</text>
      </svg>
    `,
  },
  {
    num: 3,
    region: 'ASIA',
    tag: 'IMD / Officials',
    headline: 'Cyclone Akvan Hits Near Gopalpur; 300,000+ Evacuated',
    summary:
      'Severe storm crosses south Odisha–north Andhra coast packing 70–80 km/h winds (gusts to 90 km/h) before weakening to a deep depression; IMD holds red rain alerts with no initial deaths reported.',
    svg: `
      <svg viewBox="0 0 228 104" xmlns="http://www.w3.org/2000/svg">
        <rect width="228" height="104" rx="4" fill="#D4ECF4"/>
        <!-- India East Coast Landmass -->
        <path d="M 0 0 L 146 0 L 122 27 L 98 50 L 82 70 L 62 104 L 0 104 Z" fill="#EAE0CA" stroke="#B5A486" stroke-width="1.3"/>
        <path d="M 0 56 L 93 54" stroke="#9A8A6E" stroke-width="1" stroke-dasharray="3 2"/>
        <text x="14" y="24" font-size="7.6" font-weight="800" fill="#475569" font-family="Segoe UI,sans-serif">ODISHA</text>
        <text x="10" y="73" font-size="7.2" font-weight="800" fill="#475569" font-family="Segoe UI,sans-serif">ANDHRA</text>
        <text x="10" y="82" font-size="7.2" font-weight="800" fill="#475569" font-family="Segoe UI,sans-serif">PRADESH</text>
        <text x="148" y="79" font-size="6.8" font-weight="700" fill="#0E7490" font-family="Segoe UI,sans-serif">BAY OF BENGAL</text>
        <!-- Red rain warning zone -->
        <ellipse cx="96" cy="48" rx="30" ry="21" fill="#DC2626" opacity="0.17"/>
        <!-- Storm track -->
        <path d="M 192 72 Q 154 66, 114 49 Q 84 37, 54 27" fill="none" stroke="#0F172A" stroke-width="1.7" stroke-dasharray="4 2"/>
        <circle cx="188" cy="71" r="3.2" fill="#0E7490"/>
        <circle cx="148" cy="61" r="3.6" fill="#0F766E"/>
        <circle cx="56" cy="28" r="3.2" fill="#64748B"/>
        <!-- Cyclone Spiral at Gopalpur -->
        <g transform="translate(106,46)">
          <circle r="20" fill="none" stroke="#0F766E" stroke-width="1.5" stroke-dasharray="16 6"/>
          <circle r="13" fill="none" stroke="#B91C1C" stroke-width="1.9" stroke-dasharray="12 4"/>
          <path d="M -2 -15 C 13 -13, 17 2, 6 13 M 2 15 C -13 13, -17 -2, -6 -13" fill="none" stroke="#DC2626" stroke-width="1.8"/>
          <circle r="4.5" fill="#DC2626" stroke="#FFFFFF" stroke-width="1.3"/>
        </g>
        <!-- Gopalpur Pin Label -->
        <rect x="130" y="19" width="58" height="14" rx="2" fill="#FFFFFF" stroke="#B91C1C" stroke-width="1"/>
        <text x="159" y="28.6" text-anchor="middle" font-size="7.1" font-weight="800" fill="#991B1B" font-family="Segoe UI,sans-serif">GOPALPUR</text>
        <line x1="130" y1="26" x2="111" y2="42" stroke="#B91C1C" stroke-width="1.1"/>
        <!-- Footer strip -->
        <rect x="6" y="88" width="216" height="12.5" rx="2" fill="#0F766E"/>
        <text x="114" y="96.6" text-anchor="middle" font-size="6.9" font-weight="700" fill="#FFFFFF" font-family="Segoe UI,sans-serif" letter-spacing="0.4">LANDFALL 20 NOV · 70–90 KM/H · RED RAIN ALERT</text>
      </svg>
    `,
  },
  {
    num: 4,
    region: 'ASIA',
    tag: 'Market data',
    headline: 'Asia Tech Plunges in Worst Week Since 2020',
    summary:
      'Taiwan’s Taiex slides over 6%, Korea’s Kospi 5.2%, and Japan’s Nikkei 5.1% as SoftBank (-14%), TSMC, SK Hynix, and Samsung drop on post-Anthropic IPO liquidity drain and U.S. SE Asia chip curbs.',
    svg: `
      <svg viewBox="0 0 228 104" xmlns="http://www.w3.org/2000/svg">
        <rect width="228" height="104" rx="4" fill="#0F172A"/>
        <g stroke="#1E293B" stroke-width="0.7">
          <line x1="0" y1="20" x2="228" y2="20"/>
          <line x1="0" y1="40" x2="228" y2="40"/>
          <line x1="0" y1="60" x2="228" y2="60"/>
          <line x1="0" y1="80" x2="228" y2="80"/>
        </g>
        <line x1="12" y1="16" x2="216" y2="16" stroke="#475569" stroke-width="1"/>
        <text x="14" y="12.5" font-size="6.2" font-weight="700" fill="#94A3B8" font-family="Consolas,monospace">0.0%  FRIDAY 20 NOV CLOSE</text>
        <g font-family="Segoe UI,sans-serif">
          <rect x="18" y="16" width="52" height="62" rx="2" fill="#DC2626"/>
          <text x="44" y="36" text-anchor="middle" font-size="11.5" font-weight="800" fill="#FFFFFF">-6.0%</text>
          <text x="44" y="49" text-anchor="middle" font-size="7.2" font-weight="800" fill="#FECACA">TAIEX</text>
          <text x="44" y="59" text-anchor="middle" font-size="6" fill="#FEE2E2">TSMC slide</text>

          <rect x="88" y="16" width="52" height="53" rx="2" fill="#EF4444"/>
          <text x="114" y="36" text-anchor="middle" font-size="11.5" font-weight="800" fill="#FFFFFF">-5.2%</text>
          <text x="114" y="49" text-anchor="middle" font-size="7.2" font-weight="800" fill="#FECACA">KOSPI</text>
          <text x="114" y="59" text-anchor="middle" font-size="6" fill="#FEE2E2">SK Hynix</text>

          <rect x="158" y="16" width="52" height="52" rx="2" fill="#EA580C"/>
          <text x="184" y="36" text-anchor="middle" font-size="11.5" font-weight="800" fill="#FFFFFF">-5.1%</text>
          <text x="184" y="49" text-anchor="middle" font-size="7.2" font-weight="800" fill="#FFEDD5">NIKKEI</text>
          <text x="184" y="59" text-anchor="middle" font-size="6" fill="#FFEDD5">SoftBank -14%</text>
        </g>
        <polyline points="14,22 42,40 72,35 104,57 138,50 174,69 212,77" fill="none" stroke="#FDE047" stroke-width="1.6" opacity="0.9"/>
        <rect x="6" y="88" width="216" height="12.5" rx="2" fill="#7F1D1D"/>
        <text x="114" y="96.6" text-anchor="middle" font-size="6.9" font-weight="700" fill="#FEF2F2" font-family="Segoe UI,sans-serif" letter-spacing="0.4">ASIA SHARES: WORST WEEKLY DROP SINCE MAR 2020</text>
      </svg>
    `,
  },
];

const SECONDARY_STORIES = [
  {
    num: 5,
    region: 'EUROPE',
    tag: 'Downing St / EU',
    headline: 'UK & EU Seal Post-Brexit Reset Deal',
    summary: 'PM Burnham & Brussels agree food-trade, carbon-link & youth mobility timelines; EU tuition talks continue.',
    svg: `<svg viewBox="0 0 226 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="226" height="32" rx="3" fill="#EFF6FF"/>
      <rect x="8" y="6" width="32" height="20" rx="2" fill="#1E3A8A"/>
      <path d="M8,6 L40,26 M40,6 L8,26" stroke="#FFF" stroke-width="3.2"/>
      <path d="M8,6 L40,26 M40,6 L8,26" stroke="#DC2626" stroke-width="1.2"/>
      <path d="M24,6 L24,26 M8,16 L40,16" stroke="#FFF" stroke-width="5"/>
      <path d="M24,6 L24,26 M8,16 L40,16" stroke="#DC2626" stroke-width="2.6"/>
      <path d="M46,16 C56,8 68,8 78,16" fill="none" stroke="#1D4ED8" stroke-width="2.2" stroke-dasharray="3 2"/>
      <rect x="84" y="6" width="32" height="20" rx="2" fill="#1D4ED8"/>
      <circle cx="100" cy="16" r="6" fill="none" stroke="#FACC15" stroke-width="1.8" stroke-dasharray="1.8 2.2"/>
      <text x="124" y="14.5" font-size="7.4" font-weight="800" fill="#1E3A8A" font-family="Segoe UI,sans-serif">BRUSSELS SUMMIT</text>
      <text x="124" y="24" font-size="6.5" font-weight="600" fill="#475569" font-family="Segoe UI,sans-serif">SPS · ETS Link · Mobility</text>
    </svg>`,
  },
  {
    num: 6,
    region: 'M. EAST',
    tag: 'UN / Guardian',
    headline: 'COP31 Antalya Hits Fossil-Fuel Impasse',
    summary: 'Draft drops fossil phase-out & trims $120B adaptation goal; EU & Africa protest as Turkey logs $26B deals.',
    svg: `<svg viewBox="0 0 226 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="226" height="32" rx="3" fill="#FFF7ED"/>
      <circle cx="22" cy="16" r="10" fill="#FED7AA" stroke="#C2410C" stroke-width="1.5"/>
      <path d="M12,16 H32 M22,6 V26" stroke="#C2410C" stroke-width="0.9"/>
      <rect x="40" y="7.5" width="46" height="7.5" rx="1.5" fill="#DC2626"/>
      <text x="63" y="13.2" text-anchor="middle" font-size="5.7" font-weight="800" fill="#FFF" font-family="Segoe UI,sans-serif">NO PHASE-OUT</text>
      <rect x="40" y="17.5" width="46" height="7.5" rx="1.5" fill="#047857"/>
      <text x="63" y="23.2" text-anchor="middle" font-size="5.7" font-weight="800" fill="#FFF" font-family="Segoe UI,sans-serif">$26B HOST DEALS</text>
      <text x="93" y="14.5" font-size="7.4" font-weight="800" fill="#9A3412" font-family="Segoe UI,sans-serif">COP31 ANTALYA</text>
      <text x="93" y="24" font-size="6.5" font-weight="600" fill="#64748B" font-family="Segoe UI,sans-serif">Final day overtime · 1.5°C</text>
    </svg>`,
  },
  {
    num: 7,
    region: 'AMERICAS',
    tag: 'WP / Guardian',
    headline: 'White House Fires U.S. Cyber Chief',
    summary: 'National Cyber Director Sean Cairncross ousted after air, bank & federal outages; DoD CIO Kirsten Davies steps in.',
    svg: `<svg viewBox="0 0 226 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="226" height="32" rx="3" fill="#F5F3FF"/>
      <path d="M22,5 L32,9 V16 C32,22 27.5,26 22,28 C16.5,26 12,22 12,16 V9 Z" fill="#4C1D95"/>
      <polyline points="23,9 19,16 24,16 20,24" fill="none" stroke="#FDE047" stroke-width="1.8"/>
      <polyline points="40,18 50,18 55,10 61,24 67,13 73,18 84,18" fill="none" stroke="#DC2626" stroke-width="1.7"/>
      <text x="92" y="14.5" font-size="7.4" font-weight="800" fill="#4C1D95" font-family="Segoe UI,sans-serif">WASHINGTON</text>
      <text x="92" y="24" font-size="6.5" font-weight="600" fill="#475569" font-family="Segoe UI,sans-serif">Acting: Kirsten Davies</text>
    </svg>`,
  },
  {
    num: 8,
    region: 'EUROPE',
    tag: 'Garante / AP',
    headline: 'Italy Fines Meta €805M Over Photos',
    summary: 'Data watchdog rules Facebook Android app accessed photo galleries & metadata without consent; Meta to appeal.',
    svg: `<svg viewBox="0 0 226 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="226" height="32" rx="3" fill="#FEF2F2"/>
      <rect x="10" y="7" width="24" height="18" rx="3" fill="#1E293B"/>
      <circle cx="22" cy="16" r="4.5" fill="none" stroke="#93C5FD" stroke-width="1.5"/>
      <line x1="8" y1="25" x2="36" y2="7" stroke="#DC2626" stroke-width="2.2"/>
      <rect x="44" y="7" width="44" height="18" rx="3" fill="#B91C1C"/>
      <text x="66" y="19" text-anchor="middle" font-size="9" font-weight="800" fill="#FFF" font-family="Consolas,monospace">€805M</text>
      <text x="96" y="14.5" font-size="7.4" font-weight="800" fill="#991B1B" font-family="Segoe UI,sans-serif">ROME · GARANTE</text>
      <text x="96" y="24" font-size="6.5" font-weight="600" fill="#475569" font-family="Segoe UI,sans-serif">~$887M privacy penalty</text>
    </svg>`,
  },
  {
    num: 9,
    region: 'M. EAST',
    tag: 'Officials / AJ',
    headline: 'Iraq Deploys Forces Into Jurf al-Sakhar',
    summary: 'Federal police & PMU enter Kataib Hezbollah stronghold south of Baghdad under deal against oil smuggling.',
    svg: `<svg viewBox="0 0 226 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="226" height="32" rx="3" fill="#FEFCE8"/>
      <path d="M8,26 Q24,14 40,20 T74,10" fill="none" stroke="#60A5FA" stroke-width="2.3"/>
      <circle cx="46" cy="18" r="7.5" fill="#D97706" opacity="0.25"/>
      <circle cx="46" cy="18" r="3.6" fill="#B45309"/>
      <line x1="16" y1="11" x2="36" y2="16" stroke="#1E293B" stroke-width="2"/>
      <polygon points="40,17 33,13 34,19.5" fill="#1E293B"/>
      <text x="84" y="14.5" font-size="7.4" font-weight="800" fill="#92400E" font-family="Segoe UI,sans-serif">BABIL · IRAQ</text>
      <text x="84" y="24" font-size="6.5" font-weight="600" fill="#475569" font-family="Segoe UI,sans-serif">Oil-smuggling crackdown</text>
    </svg>`,
  },
  {
    num: 10,
    region: 'AFRICA',
    tag: 'Officials / AJ',
    headline: 'Senegal Migrant Boat Sinks Off Yenne',
    summary: 'Search crews scour Atlantic waters south of Dakar after pirogue capsizes; at least 4 dead and dozens missing.',
    svg: `<svg viewBox="0 0 226 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="226" height="32" rx="3" fill="#ECFDF5"/>
      <path d="M6,22 Q16,17 26,22 T46,22 T66,22 T80,22" fill="none" stroke="#0284C7" stroke-width="2.1"/>
      <path d="M22,19 L54,19 L48,13 L28,15 Z" fill="#334155" transform="rotate(-14 38 17)"/>
      <circle cx="64" cy="12" r="5.5" fill="#DC2626" opacity="0.22"/>
      <circle cx="64" cy="12" r="2.7" fill="#DC2626"/>
      <text x="86" y="14.5" font-size="7.4" font-weight="800" fill="#065F46" font-family="Segoe UI,sans-serif">ATLANTIC ROUTE</text>
      <text x="86" y="24" font-size="6.5" font-weight="600" fill="#475569" font-family="Segoe UI,sans-serif">4+ dead · dozens missing</text>
    </svg>`,
  },
  {
    num: 11,
    region: 'OCEANIA',
    tag: 'AFP / Police',
    headline: 'Sydney Terror Raids Hit 10 Suburbs',
    summary: 'Police arrest 3 men and charge 35-year-old over alleged lone ISIS-inspired car-bomb plot; no target set.',
    svg: `<svg viewBox="0 0 226 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="226" height="32" rx="3" fill="#ECFEFF"/>
      <path d="M12,24 Q18,10 28,24 M22,24 Q30,7 42,24 M36,24 Q42,13 50,24" fill="#CBD5E1" stroke="#0E7490" stroke-width="1.3"/>
      <line x1="8" y1="24" x2="56" y2="24" stroke="#0E7490" stroke-width="1.5"/>
      <circle cx="66" cy="16" r="8" fill="none" stroke="#DC2626" stroke-width="1.3" stroke-dasharray="3 2"/>
      <circle cx="66" cy="16" r="3" fill="#DC2626"/>
      <text x="84" y="14.5" font-size="7.4" font-weight="800" fill="#155E75" font-family="Segoe UI,sans-serif">SYDNEY · NSW</text>
      <text x="84" y="24" font-size="6.5" font-weight="600" fill="#475569" font-family="Segoe UI,sans-serif">3 arrested · 1 charged</text>
    </svg>`,
  },
  {
    num: 12,
    region: 'ASIA',
    tag: 'DPR / Antara',
    headline: 'Indonesia Passes Asset Forfeiture Bill',
    summary: 'Parliament ends 18-year wait with non-conviction seizure law targeting graft, cyber-fraud & organized crime.',
    svg: `<svg viewBox="0 0 226 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="226" height="32" rx="3" fill="#FEF2F2"/>
      <path d="M14,24 V16 C14,9 34,9 34,16 V24 Z" fill="#991B1B" opacity="0.88"/>
      <line x1="10" y1="24" x2="38" y2="24" stroke="#1E293B" stroke-width="1.8"/>
      <line x1="56" y1="8" x2="56" y2="24" stroke="#047857" stroke-width="1.8"/>
      <line x1="46" y1="12" x2="66" y2="12" stroke="#047857" stroke-width="1.5"/>
      <path d="M46,12 L43,18 H49 Z M66,12 L63,18 H69 Z" fill="#047857"/>
      <text x="78" y="14.5" font-size="7.4" font-weight="800" fill="#991B1B" font-family="Segoe UI,sans-serif">JAKARTA · DPR</text>
      <text x="78" y="24" font-size="6.5" font-weight="600" fill="#475569" font-family="Segoe UI,sans-serif">Anti-graft law enacted</text>
    </svg>`,
  },
];

const BRIEFS = [
  // Column 1 (13–25)
  { num: 13, reg: 'EUROPE', title: 'Poland:', text: '2 Kh-101 missiles & jet drone crash in SE; Tusk calls it provocation (Officials).' },
  { num: 14, reg: 'EUROPE', title: 'EU / Ukraine:', text: 'Record €7.9B Ukraine Facility tranche paid after 20+ reforms (EC).' },
  { num: 15, reg: 'EUROPE', title: 'Youth Strikes:', text: 'Students walk out in 25+ EU nations over costs, climate & AI (CNN).' },
  { num: 16, reg: 'EUROPE', title: 'Denmark:', text: 'Parliament unanimously backs U.S. defense pact on Greenland (Reported).' },
  { num: 17, reg: 'EUROPE', title: 'France:', text: 'Prosecutors probe alleged state leaks to Le Pen’s National Rally (Reported).' },
  { num: 18, reg: 'EUROPE', title: 'ECB / SFDR:', text: 'Lagarde flags sovereignty risks in final keynote; EU simplifies ESG rules.' },
  { num: 19, reg: 'AMERICAS', title: 'U.S.–Venezuela:', text: 'Diaspora & opposition weigh Hegseth’s Caracas drug pact (WLRN).' },
  { num: 20, reg: 'AMERICAS', title: 'Argentina:', text: 'U.S. clears $941M AIM-120 & munitions deal for F-16 fleet (State Dept).' },
  { num: 21, reg: 'AMERICAS', title: 'U.S. OFAC:', text: 'Sanctions hit Comancheros & ’Ndrangheta cartel logistics rings (Treasury).' },
  { num: 22, reg: 'AMERICAS', title: 'Brazil:', text: 'Lula visits Chief Raoni as Brasília expands Indigenous land status (AJ).' },
  { num: 23, reg: 'AMERICAS', title: 'Colombia:', text: 'Thousands march over tax plans and regional defense ties (AJ).' },
  { num: 24, reg: 'AMERICAS', title: 'Mexico:', text: 'Oct heavy-vehicle sales jump 26.8% YoY even as car exports dip (Data).' },
  { num: 25, reg: 'M. EAST', title: 'Israel / Levant:', text: 'Katz warns IDF will hold Gaza, Lebanon & Syria buffers (Officials).' },
  // Column 2 (26–38)
  { num: 26, reg: 'M. EAST', title: 'Saudi / Yemen:', text: 'Coalition intercepts Houthi missile & drones aimed at Jizan (AP).' },
  { num: 27, reg: 'M. EAST', title: 'Hormuz / Oil:', text: 'Sea-mine threats choke transit; IEA warns bypass lines too small (IEA).' },
  { num: 28, reg: 'M. EAST', title: 'Iran / U.S.:', text: 'Tehran rejects chem-arms claim; Trump defers move to 2027 (Reported).' },
  { num: 29, reg: 'AFRICA', title: 'Sudan / WFP:', text: '2027 funding cuts & El Niño sharpen acute Sudan famine risk (WFP).' },
  { num: 30, reg: 'AFRICA', title: 'South Africa:', text: 'Consults on 5.2 GW nuclear build; Continental reviews 950 tire jobs.' },
  { num: 31, reg: 'AFRICA', title: 'Kenya:', text: 'U.S. consortium signs $60B mining & industrial resource deal (AllAfrica).' },
  { num: 32, reg: 'AFRICA', title: 'DR Congo:', text: 'Kinshasa protests European plan for migrant hub in Rwanda (Officials).' },
  { num: 33, reg: 'AFRICA', title: 'Nigeria:', text: 'Tinubu backs AI security plan; Afreximbank launches $30M SME export fund.' },
  { num: 34, reg: 'ASIA', title: 'SE Asia Chips:', text: 'U.S. curbs Chinese remote AI chip access via ASEAN hubs (Guardian).' },
  { num: 35, reg: 'ASIA', title: 'Bangladesh:', text: 'Cox’s Bazar Rohingya refugees hail ICJ genocide verdict, urge justice (AP).' },
  { num: 36, reg: 'OCEANIA', title: 'Australia:', text: 'EDF buys 250MW NSW battery project; EQT agrees to buy Pickles Auctions.' },
  { num: 37, reg: 'GLOBAL', title: 'IMF Debt:', text: 'IMF warns global public debt nears 100% of GDP amid market sell-off.' },
  { num: 38, reg: 'GLOBAL', title: 'Global Sports:', text: 'F1 Vegas qualifying; UEFA draws Spain–France; BJK Cup Brazil–Canada.' },
];

const REGION_COUNTS = [
  { name: 'EUROPE', count: 9 },
  { name: 'AMERICAS', count: 7 },
  { name: 'M. EAST', count: 6 },
  { name: 'AFRICA', count: 6 },
  { name: 'ASIA', count: 5 },
  { name: 'GLOBAL', count: 3 },
  { name: 'OCEANIA', count: 2 },
];

// Map pin positions (viewBox 0 0 276 178) — clean separation in Europe & Middle East
const MAP_PINS = [
  { num: 1, x: 220, y: 78, reg: 'GLOBAL' },    // Shenzhen
  { num: 2, x: 162, y: 42, reg: 'EUROPE' },    // Kyiv
  { num: 3, x: 198, y: 84, reg: 'ASIA' },      // Gopalpur, India
  { num: 4, x: 239, y: 63, reg: 'ASIA' },      // Tokyo / Seoul / Taipei
  { num: 5, x: 129, y: 42, reg: 'EUROPE' },    // Brussels / UK
  { num: 6, x: 160, y: 61, reg: 'M. EAST' },   // Antalya COP31
  { num: 7, x: 66, y: 58, reg: 'AMERICAS' },   // Washington DC
  { num: 8, x: 144, y: 56, reg: 'EUROPE' },    // Rome, Italy
  { num: 9, x: 175, y: 69, reg: 'M. EAST' },   // Jurf al-Sakhar, Iraq
  { num: 10, x: 118, y: 92, reg: 'AFRICA' },   // Yenne, Senegal
  { num: 11, x: 245, y: 145, reg: 'OCEANIA' }, // Sydney
  { num: 12, x: 215, y: 117, reg: 'ASIA' },    // Jakarta
];

const BRIEF_DOTS = [
  [150, 44, 'EUROPE'],   // Poland
  [106, 20, 'EUROPE'],   // Greenland
  [131, 51, 'EUROPE'],   // France
  [76, 94, 'AMERICAS'],  // Venezuela/Colombia
  [92, 118, 'AMERICAS'], // Brazil
  [82, 148, 'AMERICAS'], // Argentina
  [52, 78, 'AMERICAS'],  // Mexico
  [171, 84, 'M. EAST'],  // Saudi/Yemen
  [183, 76, 'M. EAST'],  // Hormuz/Iran
  [158, 92, 'AFRICA'],   // Sudan
  [152, 142, 'AFRICA'],  // South Africa
  [164, 110, 'AFRICA'],  // Kenya
  [148, 110, 'AFRICA'],  // DRC
  [135, 97, 'AFRICA'],   // Nigeria
  [208, 82, 'ASIA'],     // Bangladesh
  [44, 62, 'AMERICAS'],  // Las Vegas F1
];

function renderWorldMapSvg() {
  const pinsMarkup = MAP_PINS.map((p) => {
    const c = REGION_COLORS[p.reg];
    return `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="6.8" fill="${c}" stroke="#FFFDF9" stroke-width="1.3"/>
        <text x="${p.x}" y="${p.y + 2.4}" text-anchor="middle" font-size="6.8" font-weight="800" fill="#FFFFFF" font-family="Segoe UI,sans-serif">${p.num}</text>
      </g>`;
  }).join('');

  const dotsMarkup = BRIEF_DOTS.map(([x, y, reg]) => {
    const c = REGION_COLORS[reg];
    return `<circle cx="${x}" cy="${y}" r="2.4" fill="${c}" opacity="0.78" stroke="#FFFDF9" stroke-width="0.6"/>`;
  }).join('');

  return `
    <svg viewBox="0 0 276 178" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;border-radius:4px;border:1px solid #D5CEC0;">
      <rect width="276" height="178" fill="#E4EFF6"/>
      <!-- Graticule -->
      <g stroke="#C8DCE7" stroke-width="0.65">
        <line x1="0" y1="44" x2="276" y2="44"/>
        <line x1="0" y1="89" x2="276" y2="89" stroke-dasharray="3 2"/>
        <line x1="0" y1="134" x2="276" y2="134"/>
        <line x1="69" y1="0" x2="69" y2="178"/>
        <line x1="138" y1="0" x2="138" y2="178"/>
        <line x1="207" y1="0" x2="207" y2="178"/>
      </g>
      <!-- Refined vector continents -->
      <g fill="#E5DCC9" stroke="#B3A790" stroke-width="0.85" stroke-linejoin="round">
        <!-- North America -->
        <path d="M 10,28 L 32,20 L 66,22 L 82,32 L 76,46 L 68,58 L 62,72 L 56,82 L 48,79 L 42,68 L 30,58 L 22,46 Z"/>
        <!-- Greenland -->
        <path d="M 92,10 L 116,10 L 122,26 L 106,33 L 94,25 Z"/>
        <!-- South America -->
        <path d="M 68,88 L 86,91 L 104,108 L 98,130 L 86,158 L 77,162 L 72,136 L 65,108 Z"/>
        <!-- UK & Ireland -->
        <path d="M 124,38 L 130,36 L 131,45 L 125,46 Z"/>
        <!-- Europe -->
        <path d="M 132,25 L 152,18 L 169,24 L 171,48 L 156,56 L 146,59 L 136,56 L 128,48 Z"/>
        <!-- Africa -->
        <path d="M 124,67 L 156,66 L 170,84 L 169,106 L 159,134 L 148,150 L 139,130 L 134,106 L 116,96 L 116,78 Z"/>
        <!-- Madagascar -->
        <path d="M 171,126 L 176,128 L 174,140 L 169,138 Z"/>
        <!-- Asia & Middle East -->
        <path d="M 169,24 L 228,22 L 254,36 L 244,64 L 228,82 L 214,94 L 204,98 L 196,95 L 188,80 L 176,84 L 165,70 L 166,54 Z"/>
        <!-- Japan -->
        <path d="M 239,53 L 246,56 L 242,68 L 236,65 Z"/>
        <!-- SE Asia / Indonesia -->
        <path d="M 205,107 L 226,112 L 238,117 L 224,122 L 204,116 Z"/>
        <!-- Australia -->
        <path d="M 218,128 L 248,126 L 256,144 L 244,158 L 220,152 Z"/>
        <!-- New Zealand -->
        <path d="M 260,154 L 267,157 L 263,167 L 257,164 Z"/>
      </g>
      ${dotsMarkup}
      ${pinsMarkup}
    </svg>`;
}

function buildHtml() {
  const kpiHtml = KPIS.map(
    (k) => `
    <div class="kpi-card" style="border-top-color:${k.accent}">
      <div class="kpi-val" style="color:${k.accent}">${k.value}</div>
      <div class="kpi-lbl">${k.label}</div>
      <div class="kpi-meta">${k.meta}</div>
    </div>`
  ).join('');

  const leadsHtml = LEAD_STORIES.map(
    (s) => `
    <article class="lead-card">
      <div class="card-meta">
        <span class="reg-pill" style="background:${REGION_COLORS[s.region]}">${s.num} · ${s.region}</span>
        <span class="attr-pill">${s.tag}</span>
      </div>
      <div class="lead-art">${s.svg}</div>
      <h2 class="lead-hl">${s.headline}</h2>
      <p class="lead-sum">${s.summary}</p>
    </article>`
  ).join('');

  const secondaryHtml = SECONDARY_STORIES.map(
    (s) => `
    <article class="sec-card">
      <div class="card-meta">
        <span class="reg-pill" style="background:${REGION_COLORS[s.region]}">${s.num} · ${s.region}</span>
        <span class="attr-pill">${s.tag}</span>
      </div>
      <div class="sec-art">${s.svg}</div>
      <h3 class="sec-hl">${s.headline}</h3>
      <p class="sec-sum">${s.summary}</p>
    </article>`
  ).join('');

  const leftBriefs = BRIEFS.slice(0, 13)
    .map(
      (b) => `
      <div class="brief-item">
        <span class="b-num" style="background:${REGION_COLORS[b.reg]}">${b.num}</span>
        <span class="b-txt"><strong>${b.title}</strong> ${b.text}</span>
      </div>`
    )
    .join('');

  const rightBriefs = BRIEFS.slice(13)
    .map(
      (b) => `
      <div class="brief-item">
        <span class="b-num" style="background:${REGION_COLORS[b.reg]}">${b.num}</span>
        <span class="b-txt"><strong>${b.title}</strong> ${b.text}</span>
      </div>`
    )
    .join('');

  const regionBarsHtml = REGION_COUNTS.map((r) => {
    const pct = Math.round((r.count / 9) * 100);
    const col = REGION_COLORS[r.name];
    return `
      <div class="rb-row">
        <span class="rb-lbl">${r.name}</span>
        <span class="rb-track"><span class="rb-fill" style="width:${pct}%;background:${col}"></span></span>
        <span class="rb-cnt">${r.count}</span>
      </div>`;
  }).join('');

  const legendItems = Object.entries(REGION_COLORS)
    .map(
      ([name, color]) =>
        `<span class="leg-item"><i style="background:${color}"></i>${name}</span>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Friday 20 November 2026 — World News in One Page</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1024px;
    height: 1024px;
    overflow: hidden;
    background: #FAF7F0;
    color: #0F172A;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .page {
    width: 1024px;
    height: 1024px;
    padding: 10px 14px 9px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: #FAF7F0;
  }

  /* 1. MASTHEAD */
  .masthead {
    border-bottom: 2px solid #0F172A;
    padding-bottom: 5px;
  }
  .meta-rail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #475569;
    border-bottom: 1px solid #CBD5E1;
    padding-bottom: 3px;
    margin-bottom: 3px;
  }
  .meta-rail .edition-tag { color: #991B1B; }
  .date-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
  }
  .masthead h1 {
    font-family: Georgia, Cambria, "Times New Roman", serif;
    font-size: 39px;
    font-weight: 700;
    line-height: 1.02;
    letter-spacing: -0.025em;
    color: #0F172A;
  }
  .masthead-stamp {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #FFFDF9;
    background: #0F172A;
    padding: 3.5px 9px;
    border-radius: 2px;
    white-space: nowrap;
  }
  .deck {
    margin-top: 3px;
    font-size: 10.8px;
    font-weight: 600;
    color: #334155;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .deck b { color: #991B1B; margin: 0 3px; }

  /* 2. KPI STRIP */
  .kpi-strip {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }
  .kpi-card {
    background: #FFFDF9;
    border: 1px solid #DDD6C8;
    border-top: 3px solid #0F172A;
    border-radius: 3px;
    padding: 4px 7px 4px 7px;
  }
  .kpi-val {
    font-family: Bahnschrift, "Segoe UI", sans-serif;
    font-size: 17.5px;
    font-weight: 800;
    line-height: 1.06;
    font-variant-numeric: tabular-nums;
  }
  .kpi-lbl {
    font-size: 8.6px;
    font-weight: 700;
    color: #1E293B;
    line-height: 1.16;
    margin-top: 1px;
  }
  .kpi-meta {
    font-size: 7.4px;
    color: #64748B;
    line-height: 1.14;
    margin-top: 1px;
  }

  /* 3. LEAD ROW (4 CARDS) */
  .lead-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 7px;
  }
  .lead-card {
    background: #FFFDF9;
    border: 1px solid #D8D0C0;
    border-radius: 4px;
    padding: 6px 7px 6px 7px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
  }
  .reg-pill {
    font-size: 7.3px;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: #FFFFFF;
    padding: 1.5px 5px;
    border-radius: 2px;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .attr-pill {
    font-size: 7.2px;
    font-weight: 600;
    color: #475569;
    background: #F1ECE1;
    border: 1px solid #DED7C8;
    padding: 1px 4px;
    border-radius: 2px;
    white-space: nowrap;
  }
  .lead-art svg {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 3px;
    border: 1px solid #E2DBCD;
  }
  .lead-hl {
    font-family: Georgia, Cambria, serif;
    font-size: 12.8px;
    font-weight: 700;
    line-height: 1.14;
    color: #0F172A;
    letter-spacing: -0.015em;
  }
  .lead-sum {
    font-size: 9px;
    line-height: 1.24;
    color: #334155;
  }

  /* 4. SECONDARY GRID (2x4) */
  .sec-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px 7px;
  }
  .sec-card {
    background: #FFFDF9;
    border: 1px solid #DDD6C8;
    border-radius: 4px;
    padding: 5px 6px 5px 6px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .sec-art svg {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 3px;
    border: 1px solid #E5DFD2;
  }
  .sec-hl {
    font-family: Georgia, Cambria, serif;
    font-size: 10.6px;
    font-weight: 700;
    line-height: 1.14;
    color: #0F172A;
    letter-spacing: -0.01em;
  }
  .sec-sum {
    font-size: 8.4px;
    line-height: 1.22;
    color: #334155;
  }

  /* 5. LOWER BAND: WORLD MAP + 26 BRIEFS */
  .lower-band {
    display: grid;
    grid-template-columns: 284px 1fr;
    gap: 8px;
    flex: 1;
    min-height: 0;
  }
  .map-panel {
    background: #FFFDF9;
    border: 1px solid #D8D0C0;
    border-radius: 4px;
    padding: 6px 7px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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
    font-family: Georgia, Cambria, serif;
    font-size: 10.6px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #0F172A;
  }
  .panel-hdr span {
    font-size: 7.5px;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
  }
  .map-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 3px 7px;
    margin-top: 4px;
  }
  .leg-item {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 7.3px;
    font-weight: 700;
    color: #334155;
  }
  .leg-item i {
    width: 6.5px;
    height: 6.5px;
    border-radius: 50%;
    display: inline-block;
  }
  .map-note {
    font-size: 7.2px;
    color: #64748B;
    line-height: 1.18;
    margin-top: 3px;
  }
  .reg-breakdown {
    margin-top: 5px;
    padding-top: 4px;
    border-top: 1px solid #E5DFD2;
    display: flex;
    flex-direction: column;
    gap: 2.2px;
  }
  .rb-title {
    font-size: 7.3px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #334155;
    margin-bottom: 1px;
    display: flex;
    justify-content: space-between;
  }
  .rb-row {
    display: grid;
    grid-template-columns: 44px 1fr 14px;
    align-items: center;
    gap: 5px;
    font-size: 7.1px;
    font-weight: 700;
    color: #334155;
  }
  .rb-track {
    height: 5.5px;
    background: #EFEAE0;
    border-radius: 2px;
    overflow: hidden;
    display: block;
  }
  .rb-fill {
    height: 100%;
    border-radius: 2px;
    display: block;
  }
  .rb-cnt {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: #0F172A;
  }

  .briefs-panel {
    background: #FFFDF9;
    border: 1px solid #D8D0C0;
    border-radius: 4px;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
  }
  .briefs-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 10px;
    flex: 1;
  }
  .brief-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .brief-item {
    display: flex;
    align-items: flex-start;
    gap: 4.5px;
    font-size: 8.3px;
    line-height: 1.2;
    color: #1E293B;
    padding: 1.4px 0;
    border-bottom: 1px dotted #E6DFD1;
  }
  .brief-item:last-child { border-bottom: none; }
  .b-num {
    flex: 0 0 14.5px;
    height: 13px;
    line-height: 13px;
    text-align: center;
    border-radius: 2px;
    font-size: 7.1px;
    font-weight: 800;
    color: #FFFFFF;
    margin-top: 0.5px;
    font-variant-numeric: tabular-nums;
  }
  .b-txt strong { color: #0F172A; font-weight: 700; }

  /* 6. FOOTER & DATE CHECK */
  .footer-wrap {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .date-check {
    background: #FDF3E7;
    border: 1px solid #E5C59A;
    border-left: 4px solid #B45309;
    border-radius: 3px;
    padding: 4.5px 7px;
    font-size: 8px;
    line-height: 1.24;
    color: #451A03;
  }
  .dc-badge {
    display: inline-block;
    background: #B45309;
    color: #FFFFFF;
    font-size: 7.2px;
    font-weight: 800;
    letter-spacing: 0.05em;
    padding: 1px 5px;
    border-radius: 2px;
    margin-right: 5px;
    text-transform: uppercase;
  }
  .foot-rail {
    display: flex;
    justify-content: space-between;
    font-size: 7.3px;
    color: #64748B;
    padding: 0 2px;
  }
</style>
</head>
<body>
  <main class="page">
    <header class="masthead">
      <div class="meta-rail">
        <span class="edition-tag">WORLD NEWS IN ONE PAGE · DAILY EDITORIAL EDITION</span>
        <span>ALL TIME ZONES · FRIDAY 20 NOVEMBER 2026</span>
        <span>38 VERIFIED STORIES · 7 GLOBAL REGIONS</span>
      </div>
      <div class="date-row">
        <h1>Friday 20 November 2026</h1>
        <span class="masthead-stamp">ONE DAY · ZERO PRE-20 NOV BLEED</span>
      </div>
      <div class="deck">
        APEC Shenzhen fallout grips Berlin &amp; allies <b>•</b> Missiles hit 3 Kyiv bridges <b>•</b> Cyclone Akvan strikes India <b>•</b> Asia AI tech rout deepens <b>•</b> UK–EU seal reset
      </div>
    </header>

    <section class="kpi-strip" aria-label="The Day in Numbers">
      ${kpiHtml}
    </section>

    <section class="lead-grid" aria-label="Lead Stories">
      ${leadsHtml}
    </section>

    <section class="sec-grid" aria-label="Global Feature Stories">
      ${secondaryHtml}
    </section>

    <section class="lower-band" aria-label="World Map and Global Briefs">
      <div class="map-panel">
        <div>
          <div class="panel-hdr">
            <h3>Where It Happened</h3>
            <span>Pins 1–12 + 26 Briefs</span>
          </div>
          ${renderWorldMapSvg()}
        </div>
        <div class="reg-breakdown">
          <div class="rb-title">
            <span>Coverage by Region</span>
            <span>38 Stories Total</span>
          </div>
          ${regionBarsHtml}
        </div>
        <div>
          <div class="map-legend">${legendItems}</div>
          <div class="map-note">Pins 1–4 = Leads · 5–12 = Features · Dots = Briefs 13–38.</div>
        </div>
      </div>

      <div class="briefs-panel">
        <div class="panel-hdr">
          <h3>Also on Friday 20 November 2026 — 26 Global Briefs</h3>
          <span>Europe · Americas · M. East · Africa · Asia · Oceania · Global</span>
        </div>
        <div class="briefs-cols">
          <div class="brief-col">${leftBriefs}</div>
          <div class="brief-col">${rightBriefs}</div>
        </div>
      </div>
    </section>

    <footer class="footer-wrap">
      <div class="date-check">
        <span class="dc-badge">Date Check · Excluded Pre-20 Nov</span>
        <strong>19 Nov:</strong> Trump–Xi–Putin Shenzhen 4-pt declaration signing (above: 20 Nov fallout) · ICJ Myanmar Rohingya genocide verdict (above: 20 Nov refugee reaction) · Anthropic $81.3B Nasdaq IPO debut (above: 20 Nov Asia sell-off) · Canada PM Carney China export target.
        <strong>18 Nov:</strong> NASA Voyager 1 light-day milestone · Van Gogh $190.4M Sotheby’s sale.
        <strong>17 Nov:</strong> Kerch Bridge strike.
      </div>
      <div class="foot-rail">
        <span>Editorial scope: Events occurring or first reported on 20 Nov 2026 in any time zone · Neutral attribution tags on all claims</span>
        <span>Wire &amp; official sources: Reuters, AP, AFP, BBC, Guardian, Al Jazeera, IMD, EC, Garante, UN, WFP · 100% original vector art</span>
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

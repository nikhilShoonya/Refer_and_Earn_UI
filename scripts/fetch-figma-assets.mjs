#!/usr/bin/env node
/**
 * Pulls the Figma-exported artwork this project depends on.
 *
 * Usage:
 *   FIGMA_TOKEN=figd_... node scripts/fetch-figma-assets.mjs
 *
 * Figma's image-render endpoint is aggressively rate limited (HTTP 429). This
 * retries with backoff and reports exactly which nodes are still outstanding,
 * so a partial run can simply be repeated later.
 *
 * After a successful run, wire the files up in
 * src/features/referAndEarn/data/illustrations.ts.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const FILE_KEY = 'tzQd5tuI4X51qsEhclFwjA';
const TOKEN = process.env.FIGMA_TOKEN;

if (!TOKEN) {
  console.error('FIGMA_TOKEN is not set.');
  console.error('Create one at Figma > Settings > Security (scope: File content, read-only).');
  process.exit(1);
}

/** node id -> output path. Ids come from the "Ready to Dev" page (4:92). */
/** The shared screen backdrop — 2x is ample for a blurred gradient. */
const PNG_2X = {
  '2265:13696': 'assets/figma/images/screen-background.png',
};

const PNG_3X = {
  '2265:14925': 'assets/figma/images/hiw-network.png',
  '2265:15065': 'assets/figma/images/hiw-step-1.png',
  '2265:15138': 'assets/figma/images/hiw-step-2.png',
  '2265:15226': 'assets/figma/images/hiw-step-3.png',
  '2265:15332': 'assets/figma/images/hiw-step-4.png',
  // QR overlay artwork (node 2283:530806 "QR") — the dot matrix only; the
  // card and its amber border are drawn in code.
  '2283:534181': 'assets/figma/images/qr-large.png',
};

const SVG = {
  'I2265:12831;1154:11553': 'assets/figma/icons/chevron-right-duotone.svg',
  // Brokerage header question mark + FAQ row glyph, un-tinted so their
  // duotone colours survive.
  'I2265:12730;232:990': 'assets/figma/icons/help-duotone.svg',
  'I2265:12831;1154:11551': 'assets/figma/icons/faq-row.svg',
  // Duotone search from the My Referrals header — exported un-tinted so the
  // #424242 glass and #EFA145 handle survive.
  'I2265:13697;232:990': 'assets/figma/icons/search-duotone.svg',
  // My Referrals stat tiles + tab-row actions (node 2265:13695).
  '2265:13710': 'assets/figma/icons/stat-kyc.svg',
  '2265:13719': 'assets/figma/icons/stat-activated.svg',
  '2265:13730': 'assets/figma/icons/tab-calendar.svg',
  '2265:13731': 'assets/figma/icons/tab-filter.svg',
  '2265:14921': 'assets/figma/icons/hiw-trust-shield.svg',
  'I2265:14483;231:910;11:318': 'assets/figma/icons/status-bar-right.svg',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function figma(url, attempt = 0) {
  const res = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });

  if (res.status === 429) {
    if (attempt >= 5) throw new Error('rate limited after 6 attempts');
    const wait = (attempt + 1) * 30_000;
    console.log(`  429 — waiting ${wait / 1000}s before retry ${attempt + 1}/5`);
    await sleep(wait);
    return figma(url, attempt + 1);
  }

  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`asset HTTP ${res.status}`);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function grab(map, format, scale) {
  const ids = Object.keys(map);
  if (ids.length === 0) return [];

  const query = encodeURIComponent(ids.join(',')).replace(/%3A/g, ':').replace(/%3B/g, ';');
  const url =
    `https://api.figma.com/v1/images/${FILE_KEY}` +
    `?ids=${query}&format=${format}${scale ? `&scale=${scale}` : ''}`;

  const { images, err } = await figma(url);
  if (err) throw new Error(err);

  const missing = [];
  for (const [id, dest] of Object.entries(map)) {
    const link = images?.[id];
    if (!link) {
      missing.push(id);
      continue;
    }
    await download(link, dest);
    console.log(`  ${dest}`);
  }
  return missing;
}

try {
  console.log('PNG @2x:');
  const missingBg = await grab(PNG_2X, 'png', 2);

  console.log('PNG @3x:');
  const missingPng = await grab(PNG_3X, 'png', 3);

  console.log('SVG:');
  const missingSvg = await grab(SVG, 'svg');

  const missing = [...missingBg, ...missingPng, ...missingSvg];
  if (missing.length) {
    console.log(`\nStill missing ${missing.length} node(s): ${missing.join(', ')}`);
    console.log('Re-run later — Figma returns no link for nodes it declined to render.');
    process.exit(1);
  }

  console.log('\nAll assets downloaded.');
  console.log('Now wire them up in src/features/referAndEarn/data/illustrations.ts');
} catch (error) {
  console.error(`\nFailed: ${error.message}`);
  console.error('Figma image rendering is rate limited per account — try again in a while.');
  process.exit(1);
}

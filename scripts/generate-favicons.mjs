// Generates the small favicons (public/favicon-16x16.png, -32x32, -48x48, and
// the multi-res favicon.ico) from the ULC wordmark in
// src/assets/logo-cropped-transparent.png using sharp.
//
// Why this exists: the previous small favicons were downscales of the full
// circular badge art (the same composition used for apple-touch-icon and the
// android-chrome icons). That art carries a fine perforated dot-grid texture, a
// center-band "ULC" wordmark, and a "UNIVERSAL LUMINAIRE CUTSHEET" subtitle.
// None of that survives a shrink to 16-48px: the texture aliases to noise, the
// subtitle smears, and the wordmark fills only ~40% of the frame, so the tab
// icon read as a dark blob. A favicon needs a simplified, high-contrast mark
// that fills the canvas, so we crop JUST the glowing wordmark, drop everything
// else, and seat it on a dark rounded-square tile that matches the brand.
//
// The larger icons (apple-touch-icon, android-chrome-192/512) are intentionally
// left as the full badge: they render at sizes where the detail stays legible.
//
// Run on demand when the wordmark source changes; commit the output.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const srcPath = join(root, 'src/assets/logo-cropped-transparent.png');

// Glow-core bounding box of the "ULC" wordmark within the 1470x827 source,
// measured by thresholding luminance > 200 on opaque pixels, then expanded by a
// small halo margin so the soft glow is not clipped hard. Excludes the dim tan
// subtitle that sits below.
const WORDMARK = { left: 10, top: 118, right: 1399, bottom: 600 };
const HALO = 14;

// Brand dark tile: a warm near-black that matches the badge background and lets
// the warm-white wordmark pop on light browser chrome.
const TILE_BG = '#1c1b18';
const RADIUS_RATIO = 0.2; // squircle-ish corner radius as a fraction of size
const WORDMARK_WIDTH_RATIO = 0.88; // how much of the tile width the mark spans

const PNG_SIZES = [16, 32, 48];
const ICO_SIZES = [16, 32, 48, 64];

const cropLeft = Math.max(0, WORDMARK.left - HALO);
const cropTop = Math.max(0, WORDMARK.top - HALO);
const cropRight = WORDMARK.right + HALO;
const cropBottom = WORDMARK.bottom + HALO;

/** Render a single dark-rounded-square favicon tile at `size`px, return a PNG buffer. */
async function renderTile(size) {
  const radius = Math.round(size * RADIUS_RATIO);
  const tileSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${TILE_BG}"/>` +
      `</svg>`,
  );

  const targetW = Math.round(size * WORDMARK_WIDTH_RATIO);
  const wordmark = await sharp(srcPath)
    .extract({
      left: cropLeft,
      top: cropTop,
      width: cropRight - cropLeft,
      height: cropBottom - cropTop,
    })
    .resize({ width: targetW })
    .png()
    .toBuffer();

  const { width: wmW, height: wmH } = await sharp(wordmark).metadata();

  return sharp(tileSvg)
    .composite([
      {
        input: wordmark,
        left: Math.round((size - wmW) / 2),
        top: Math.round((size - wmH) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Assemble a PNG-payload .ico (Vista+ format) from {size, png} entries. */
function buildIco(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const dir = Buffer.alloc(16 * count);
  let offset = 6 + dir.length;
  const dataChunks = [];

  entries.forEach((entry, i) => {
    const d = i * 16;
    dir.writeUInt8(entry.size >= 256 ? 0 : entry.size, d + 0); // width (0 => 256)
    dir.writeUInt8(entry.size >= 256 ? 0 : entry.size, d + 1); // height
    dir.writeUInt8(0, d + 2); // palette count
    dir.writeUInt8(0, d + 3); // reserved
    dir.writeUInt16LE(1, d + 4); // color planes
    dir.writeUInt16LE(32, d + 6); // bits per pixel
    dir.writeUInt32LE(entry.png.length, d + 8); // bytes in resource
    dir.writeUInt32LE(offset, d + 12); // offset of resource
    offset += entry.png.length;
    dataChunks.push(entry.png);
  });

  return Buffer.concat([header, dir, ...dataChunks]);
}

const tiles = new Map();
for (const size of new Set([...PNG_SIZES, ...ICO_SIZES])) {
  tiles.set(size, await renderTile(size));
}

for (const size of PNG_SIZES) {
  const out = join(root, `public/favicon-${size}x${size}.png`);
  writeFileSync(out, tiles.get(size));
  console.log(`Wrote ${out} (${tiles.get(size).length} bytes)`);
}

const ico = buildIco(ICO_SIZES.map((size) => ({ size, png: tiles.get(size) })));
const icoPath = join(root, 'public/favicon.ico');
writeFileSync(icoPath, ico);
console.log(`Wrote ${icoPath} (${ico.length} bytes, sizes ${ICO_SIZES.join('/')})`);

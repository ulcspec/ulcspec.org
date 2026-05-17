// Generates public/og-image.png (1200x630) from src/assets/og-image.svg using
// sharp (already a transitive dep via Astro). Run on demand when the SVG
// source changes; commit the resulting PNG so OG cards work without a build
// step on consumers.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const svgPath = join(root, 'src/assets/og-image.svg');
const pngPath = join(root, 'public/og-image.png');

const svg = readFileSync(svgPath);

const png = await sharp(svg, { density: 300 })
  .resize(1200, 630, { fit: 'cover' })
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(pngPath, png);

console.log(`Wrote ${pngPath} (${png.byteLength} bytes)`);

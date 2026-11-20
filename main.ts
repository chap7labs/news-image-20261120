/**
 * Deterministic make.fun program/v1 entrypoint for news-image-20261120.
 * Uses Node.js 22 standard library only (zero external packages, zero network).
 * Validates the bundled 1024x1024 infographic image and writes it to /output/entry.png
 * (or $MAKEFUN_OUTPUT_DIR/entry.png when running locally).
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1_048_576; // 1 MiB hard ceiling
const MAX_DIMENSION = 1024;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SOI = Buffer.from([0xff, 0xd8, 0xff]);

function validateImageBytes(buf: Buffer): void {
  if (buf.length === 0 || buf.length > MAX_BYTES) {
    throw new Error(`Invalid entry.png byte length: ${buf.length} (must be 1..${MAX_BYTES})`);
  }
  const isPng = buf.length >= 24 && buf.subarray(0, 8).equals(PNG_MAGIC);
  const isJpeg = buf.length >= 4 && buf.subarray(0, 3).equals(JPEG_SOI);
  if (!isPng && !isJpeg) {
    throw new Error('entry.png is neither a valid PNG nor a valid JPEG image');
  }
  if (isPng) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    if (width === 0 || height === 0 || width > MAX_DIMENSION || height > MAX_DIMENSION) {
      throw new Error(`Invalid PNG dimensions: ${width}x${height} (max ${MAX_DIMENSION}x${MAX_DIMENSION})`);
    }
  }
}

function run(): void {
  const repoDir = dirname(fileURLToPath(import.meta.url));
  const sourcePath = join(repoDir, 'entry.png');
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
  const targetPath = join(outputDir, 'entry.png');

  const imageBytes = readFileSync(sourcePath);
  validateImageBytes(imageBytes);

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(targetPath, imageBytes);
}

run();

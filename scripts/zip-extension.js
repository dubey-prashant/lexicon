#!/usr/bin/env node
// zips dist-extension/'s contents so manifest.json ends up at the zip root
// Pure-JS (no system `zip`/bash dependency), so this runs the same on macOS, Linux, and Windows.
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist-extension');

try {
  if (!existsSync(distDir)) {
    throw new Error(`${distDir} not found — run "npm run build:ext" first`);
  }

  const manifest = JSON.parse(
    readFileSync(join(distDir, 'manifest.json'), 'utf-8'),
  );
  const outPath = join(rootDir, `lexicon-extension-${manifest.version}.zip`);

  if (existsSync(outPath)) unlinkSync(outPath);

  const zip = new AdmZip();
  zip.addLocalFolder(distDir);
  zip.writeZip(outPath);

  console.log(`Created lexicon-extension-${manifest.version}.zip`);
} catch (err) {
  console.error(`Could not create the extension zip: ${err.message}`);
  process.exitCode = 1;
}

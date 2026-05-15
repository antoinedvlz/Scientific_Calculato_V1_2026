#!/usr/bin/env node
/**
 * build.mjs — Concatène le dev multi-fichiers en un index.html unique.
 *
 * Stratégie :
 *   - Lit src/index.html.
 *   - Pour chaque <link rel="stylesheet" href="(local)">, inline le CSS dans <style>.
 *   - Pour chaque <script src="(local)">, inline le JS dans <script>.
 *   - Garde les CDN intacts (URLs http(s):).
 *   - Écrit dist/grace.html.
 *
 * Usage :
 *   node build/build.mjs
 *
 * Pas de dépendance npm : tout est en API native Node ≥ 18.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');
const SRC_DIR   = join(ROOT, 'src');
const DIST_DIR  = join(ROOT, 'dist');
const INDEX     = join(SRC_DIR, 'index.html');
const OUT       = join(DIST_DIR, 'grace.html');

const isLocal = (href) => !/^https?:\/\//i.test(href);

async function readLocal(relPath) {
  return readFile(join(SRC_DIR, relPath), 'utf8');
}

async function inlineCss(html) {
  const re = /<link\s+rel="stylesheet"\s+href="([^"]+)"\s*[^>]*>/g;
  const tasks = [];
  html.replace(re, (m, href) => {
    if (isLocal(href)) tasks.push({ match: m, href });
    return m;
  });
  for (const t of tasks) {
    const css = await readLocal(t.href);
    html = html.replace(t.match, `<style>\n${css}\n</style>`);
  }
  return html;
}

async function inlineJs(html) {
  const re = /<script(\s+defer)?\s+src="([^"]+)"\s*[^>]*><\/script>/g;
  const tasks = [];
  html.replace(re, (m, _defer, src) => {
    if (isLocal(src)) tasks.push({ match: m, src });
    return m;
  });
  for (const t of tasks) {
    const js = await readLocal(t.src);
    html = html.replace(t.match, `<script>\n${js}\n</script>`);
  }
  return html;
}

async function main() {
  const html = await readFile(INDEX, 'utf8');
  let out = html;
  out = await inlineCss(out);
  out = await inlineJs(out);
  // Bannière en commentaire pour identifier le build.
  const stamp = new Date().toISOString();
  out = out.replace('<head>', `<head>\n<!-- Grace build ${stamp} -->`);
  await mkdir(DIST_DIR, { recursive: true });
  await writeFile(OUT, out, 'utf8');
  const sizeKb = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1);
  console.log(`✓ Build OK → ${OUT} (${sizeKb} ko)`);
}

main().catch(err => { console.error(err); process.exit(1); });

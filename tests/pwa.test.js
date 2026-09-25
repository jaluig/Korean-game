const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

/** The FILES list of sw.js (a plain array literal). */
function precached() {
  const literal = read('sw.js').match(/const FILES = (\[[\s\S]*?\]);/)[1];
  return new Function(`return ${literal}`)();
}

/** Every local file index.html loads (scripts, stylesheets, icons). */
function pageFiles() {
  const html = read('index.html');
  return [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter((ref) => !/^(https?:|data:|#|mailto:)/.test(ref));
}

test('the service worker keeps a copy of every file the page loads', () => {
  const files = precached();
  for (const ref of pageFiles()) assert.ok(files.includes(ref), `sw.js FILES is missing ${ref}`);
  for (const file of ['js/pwa.js', 'manifest.webmanifest', 'index.html']) assert.ok(files.includes(file), file);
});

test('every precached file exists', () => {
  for (const file of precached()) {
    if (file === './') continue;
    assert.ok(fs.existsSync(path.join(ROOT, file)), `sw.js lists ${file}, which doesn't exist`);
  }
  assert.equal(new Set(precached()).size, precached().length, 'no duplicates');
});

test('the cache version follows the game version', () => {
  const sw = read('sw.js').match(/const VERSION = '([^']+)'/)[1];
  const game = read('js/core/namespace.js').match(/M\.version = '([^']+)'/)[1];
  assert.equal(sw, game, 'bump VERSION in sw.js together with Mallang.version');
});

test('the manifest is valid and its icons exist', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.ok(manifest.name && manifest.short_name && manifest.start_url);
  assert.ok(fs.existsSync(path.join(ROOT, manifest.start_url)));
  assert.ok(manifest.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable'));
  for (const icon of manifest.icons) {
    assert.ok(fs.existsSync(path.join(ROOT, icon.src)), icon.src);
    assert.ok(precached().includes(icon.src), `${icon.src} should be precached`);
  }
});

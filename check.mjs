import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const assetDir = path.join(root, 'assets');

const files = new Set();
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (f.endsWith('.lua')) files.add('src/' + path.relative(srcDir, f).replace(/\\/g, '/').replace(/\.lua$/, ''));
  }
}
walk(srcDir);

const assets = new Set();
function walkA(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walkA(f);
    else assets.add('@assets/' + path.relative(assetDir, f).replace(/\\/g, '/'));
  }
}
if (fs.existsSync(assetDir)) walkA(assetDir);

const reqRe = /\brequire\s*(?:\(\s*\(*\s*|,\s*)(?:LPH_ENCSTR\s*\(\s*)?["'](@src\/[^"']+)["']/g;
const assetRe = /["'](@assets\/[^"']+)["']/g;

const missingMods = [];
const missingAssets = [];

for (const f of files) {
  const s = fs.readFileSync(path.join(root, f + '.lua'), 'utf8');
  let m;
  while ((m = reqRe.exec(s))) {
    const t = m[1].replace(/^@src\//, '');
    if (!files.has('src/' + t)) missingMods.push(t + '   <- ' + f);
  }
  while ((m = assetRe.exec(s))) {
    if (!assets.has(m[1])) missingAssets.push(m[1] + '   <- ' + f);
  }
}

console.log('=== MODULES MANQUANTS ===');
if (!missingMods.length) console.log('  (aucun)');
else [...new Set(missingMods)].sort().forEach(function (x) { console.log('  ' + x); });

console.log('');
console.log('=== ASSETS MANQUANTS ===');
if (!missingAssets.length) console.log('  (aucun)');
else [...new Set(missingAssets)].sort().forEach(function (x) { console.log('  ' + x); });
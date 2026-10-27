import fs from 'node:fs';
const p = 'bundle.mjs';
let s = fs.readFileSync(p, 'utf8');
const before = s;

const marker = 'parts.push(`  [${JSON.stringify(a)}] = ${JSON.stringify(assets.get(a) || "")},`);';
const repl = [
  'const chunkStr = (str, n) => { const out = []; for (let i = 0; i < str.length; i += n) out.push(JSON.stringify(str.slice(i, i + n))); return out; };',
  'for (const a of [...usedAssets].sort()) {',
  '  const b64 = assets.get(a) || "";',
  '  const pieces = chunkStr(b64, 1024);',
  '  parts.push(`  [${JSON.stringify(a)}] = ` + (pieces.length ? pieces.join(" ..\\n    ") : JSON.stringify("")) + ",");',
  '}'
].join('\n');

if (!s.includes(marker)) console.log('MARKER NOT FOUND');
s = s.split(marker).join(repl);
fs.writeFileSync(p, s);
console.log('changed =', s !== before);
console.log('has_chunkStr =', s.includes('chunkStr'));

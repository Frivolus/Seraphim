import fs from 'node:fs';
const p = 'bundle.mjs';
let s = fs.readFileSync(p, 'utf8');
const before = s;
s = s.split('for (const a of [...usedAssets].sort()) const chunkStr = ').join('const chunkStr = ');
fs.writeFileSync(p, s);
console.log('changed =', s !== before);
console.log('chunkStr_ok =', s.includes('const chunkStr = (str, n)'));

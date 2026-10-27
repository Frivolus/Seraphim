import fs from 'node:fs';
let c = fs.readFileSync('bundle.mjs', 'utf8');
const start = c.indexOf('const assetRe =');
const end = c.indexOf('\n', start);
c = c.slice(0, start) + 'const assetRe = /["\'](@assets\\/[^"\']+)["\']/g;' + c.slice(end);
fs.writeFileSync('bundle.mjs', c);
console.log('OK assetRe patched');
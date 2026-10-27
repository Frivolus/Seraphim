import fs from 'node:fs';
import path from 'node:path';
const files = [];
(function walk(d){ for(const e of fs.readdirSync(d,{withFileTypes:true})){ const f=path.join(d,e.name); if(e.isDirectory()) walk(f); else if(f.endsWith('.lua')) files.push(f);} })('src');

const re = /(Seraphim[\/\\]+Fonts[\/\\]+)lexend(-bold|-medium)?\.(ttf|json)/g;
let changed = 0;
for (const f of files) {
  const before = fs.readFileSync(f,'utf8');
  const after = before.replace(re, (m, p1, p2, p3) => {
    const cap = p2 ? '-' + p2.slice(1)[0].toUpperCase() + p2.slice(2) : '';
    return p1 + 'Lexend' + cap + '.' + p3;
  });
  if (after !== before) { fs.writeFileSync(f, after); changed++; console.log('patched:', f); }
}
console.log('files changed =', changed);

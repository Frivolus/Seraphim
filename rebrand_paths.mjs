import fs from 'node:fs';
import path from 'node:path';

const files = [];
(function walk(d){
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (f.endsWith('.lua')) files.push(f);
  }
})('src');

const repl = (s) => s
  .split('Project Rain/fonts').join('Seraphim/Fonts')
  .split('Project Rain').join('Seraphim')
  .split('project rain').join('Seraphim')
  .split('Seraphim/fonts').join('Seraphim/Fonts')
  .split('Seraphim\\fonts').join('Seraphim\\Fonts');

let changed = 0;
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  const after = repl(before);
  if (after !== before) { fs.writeFileSync(f, after); changed++; console.log('patched:', f); }
}
console.log('files changed =', changed);

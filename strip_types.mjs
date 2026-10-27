import fs from 'node:fs';
import path from 'node:path';

const files = [];
(function walk(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})) { const f = path.join(d,e.name); if (e.isDirectory()) walk(f); else if (f.endsWith('.lua')) files.push(f); } })('src');

// inventaire des annotations de type restantes
const ann = [];
for (const f of files) {
  fs.readFileSync(f,'utf8').split(/\r?\n/).forEach((l,i) => {
    const code = l.replace(/--.*$/,'');
    if (/\blocal\s+[\w.,\s]+\s*:\s*[\w.]/.test(code)) ann.push('LOCAL ' + f + ':' + (i+1) + ': ' + l.trim().slice(0,90));
    if (/\bfor\s+[\w.,\s]+\s*:\s*[\w.]/.test(code))  ann.push('FOR   ' + f + ':' + (i+1) + ': ' + l.trim().slice(0,90));
  });
}
console.log('### annotations de type -> ' + ann.length);
ann.slice(0,20).forEach(x => console.log('   ' + x));

// strip : assertions "x :: Type"
let n1 = 0;
for (const f of files) {
  const before = fs.readFileSync(f,'utf8');
  const after = before.replace(/\s*::\s*[A-Za-z_][A-Za-z0-9_.]*\??/g, '');
  if (after !== before) { fs.writeFileSync(f, after); n1++; console.log('   :: retire -> ' + f); }
}

// strip : annotations locales "local x: Type"
let n2 = 0;
for (const f of files) {
  const before = fs.readFileSync(f,'utf8');
  const after = before.replace(/\blocal\s+([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*:\s*[A-Za-z_][\w.]*\??/g, 'local $1');
  if (after !== before) { fs.writeFileSync(f, after); n2++; console.log('   annotation locale retiree -> ' + f); }
}

console.log('\n:: nettoyes dans ' + n1 + ' fichiers | annotations locales dans ' + n2 + ' fichiers');

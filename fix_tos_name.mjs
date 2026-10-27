import fs from 'node:fs';
const p = 'src/ui/tos.lua';
let s = fs.readFileSync(p, 'utf8');
const before = s;
const needle = 'writefile("Seraphim/tos_accepted_82126_0822UTC0.txt", "yes");';
if (s.includes(needle) && !s.includes('Seraphim/tos_accepted.txt')) {
  s = s.replace(needle, 'writefile("Seraphim/tos_accepted.txt", "yes");\n    ' + needle);
}
fs.writeFileSync(p, s);
console.log('changed =', s !== before);
console.log('ok =', s.includes('Seraphim/tos_accepted.txt'));

import fs from 'node:fs';

function toLua(v) {
  if (v === null) return 'nil';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return '{' + v.map(toLua).join(',') + '}';
  return '{' + Object.keys(v).map(function (k) { return '[' + JSON.stringify(k) + ']=' + toLua(v[k]); }).join(',') + '}';
}

const jobs = [
  ['src/features/misc/mod_detector/group_members.json', 'src/features/misc/mod_detector/group_members.lua'],
  ['src/features/removals/mantra_revealer/mantras.json', 'src/features/removals/mantra_revealer/mantras.lua'],
  ['src/utility/deepwoken/deepwoken_meshes.json', 'src/utility/deepwoken/deepwoken_meshes.lua'],
];

for (const [src, out] of jobs) {
  if (!fs.existsSync(src)) { console.log('ABSENT: ' + src); continue; }
  const data = JSON.parse(fs.readFileSync(src, 'utf8'));
  fs.writeFileSync(out, 'return ' + toLua(data) + '\n');
  console.log('ok: ' + out);
}
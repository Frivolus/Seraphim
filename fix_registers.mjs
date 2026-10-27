import fs from 'node:fs';
const p = 'bundle.mjs';
let s = fs.readFileSync(p, 'utf8');
const before = s;

// 1) asset_map devient une table vide + un accumulateur local
s = s.replace('local asset_map = {`);', 'local asset_map = {};\nlocal _s = "";`);');

// 2) une instruction par morceau, au lieu d'une chaine de ".."
const marker = 'parts.push(`  [${JSON.stringify(a)}] = ` + (pieces.length ? pieces.join(" ..\\n    ") : JSON.stringify("")) + ",");';
const repl = [
  'for (const piece of pieces) parts.push(\'_s = _s .. \' + JSON.stringify(piece) + \';\');',
  '  parts.push(\'asset_map[\' + JSON.stringify(a) + \'] = _s;\');',
  '  parts.push(\'_s = "";\');'
].join('\n  ');
if (!s.includes(marker)) console.log('MARKER NOT FOUND');
s = s.split(marker).join(repl);

// 3) la fermeture "};" de la table n'a plus lieu d'etre
s = s.replace('parts.push(`};\nlocal function inline_asset_b96(p)', 'parts.push(`_s = nil;\nlocal function inline_asset_b96(p)');

fs.writeFileSync(p, s);
console.log('changed =', s !== before);
console.log('acc_ok =', s.includes('local _s = ""'));
console.log('marker_gone =', !s.includes('pieces.join(" ..'));

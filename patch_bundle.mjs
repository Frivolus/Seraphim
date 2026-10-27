import fs from 'node:fs';
let c = fs.readFileSync('bundle.mjs', 'utf8');
if (!c.includes('assets.get(a) || ""')) {
  c = c.replace('JSON.stringify(assets.get(a))', 'JSON.stringify(assets.get(a) || "")');
  fs.writeFileSync('bundle.mjs', c);
  console.log('OK bundle.mjs patche (asset manquant -> chaine vide)');
} else {
  console.log('deja patche');
}
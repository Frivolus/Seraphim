import fs from 'node:fs';

function patch(p, fn) {
  const before = fs.readFileSync(p, 'utf8');
  const after = fn(before);
  if (after !== before) { fs.writeFileSync(p, after); console.log('patched:', p); }
  else console.log('unchanged:', p);
}

const stripNextgen = s => s
  .split(' <font color=\\"#%s\\">nextgen</font>').join('')
  .split('Seraphim nextgen').join('Seraphim');

for (const p of ['src/utility/ui/wrapper.lua', 'src/ui/ui.lua', 'src/features/misc/linoria_watermark.lua']) {
  patch(p, stripNextgen);
}

// retire l'argument color_in_hex devenu orphelin dans la watermark
patch('src/features/misc/linoria_watermark.lua', s =>
  s.replace(/:format\((\s*)color_in_hex,\s*math\.floor\(fps\)/, ':format($1math.floor(fps)'));

// tags internes pr_ -> srf_ (cosmetique, self-consistent)
patch('src/security/bypass.lua', s => s.split('"pr_%s_%s_%x"').join('"srf_%s_%s_%x"'));

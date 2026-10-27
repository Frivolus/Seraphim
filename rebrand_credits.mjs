import fs from 'node:fs';

function patch(p, fn) {
  const before = fs.readFileSync(p, 'utf8');
  const after = fn(before);
  if (after !== before) { fs.writeFileSync(p, after); console.log('patched:', p); }
  else console.log('unchanged:', p);
}

// 1) libelle fenetre + titre de fenetre ("pr nextgen" -> "Seraphim nextgen")
for (const p of ['src/utility/ui/wrapper.lua', 'src/ui/ui.lua']) {
  patch(p, s => s.split('pr <font color=').join('Seraphim <font color='));
}

// 2) l'onglet "Config" ne se construisait jamais (nom absent de creation_order)
patch('src/ui/ui.lua', s => s.replace(/"Automation"\s*\};/, '"Automation",\n            "Config"\n        };'));

// 3) credits dans l'onglet Config
patch('src/ui/tabs/ui.lua', s => {
  if (s.includes('create_credits')) return s;
  const credits = 'function tabs:create_credits(tab)\n' +
    '\tlocal groupbox = tab:newGroupBox("Credits", true);\n' +
    '\tgroupbox:newLabel("Seraphim | base: Project Rain (open-sourced by autumn / unionizing)");\n' +
    '\tgroupbox:newLabel("Credits: TempedOut, Soggy, Hon, Mint, Juan, Joseph, Q/2qrys & Oni");\n' +
    'end\n\n';
  s = s.replace('local setup = function(tab)', credits + 'local setup = function(tab)');
  s = s.replace('tabs:create_ally_system(tab);', 'tabs:create_ally_system(tab);\n\ttabs:create_credits(tab);');
  return s;
});

// 4) README
patch('README.md', s => s.includes('TempedOut') ? s : s +
  '\n## Credits\n\nBased on Project Rain (open-sourced by autumn / unionizing).\n\nTempedOut, Soggy, Hon, Mint, Juan, Joseph, Q/2qrys & Oni\n');

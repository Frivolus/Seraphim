import fs from 'node:fs';

// 1) credits dans le TOS (visible par tout le monde au 1er lancement)
{
  const p = 'src/ui/tos.lua';
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  s = s.replace(/Terms of Service\.(\r?\n)(\r?\n)<b>Updates to this Agreement<\/b>/,
    'Terms of Service.$1$2<b>Credits</b>$1<font color="rgb(116, 118, 125)"><b>Base: Project Rain (open-sourced by autumn / unionizing). Credits: TempedOut, Soggy, Hon, Mint, Juan, Joseph, Q/2qrys & Oni.</b></font>$1$2<b>Updates to this Agreement</b>');
  fs.writeFileSync(p, s);
  console.log('tos credits =', s !== before);
}

// 2) en-tete de init.lua
{
  const p = 'src/init.lua';
  let s = fs.readFileSync(p, 'utf8');
  if (!s.includes('Credits:')) {
    s = s.replace('-- Seraphim -- point d\'entree (base Project Rain OSS)',
      '-- Seraphim -- point d\'entree\n-- Base: Project Rain (open-sourced by autumn / unionizing)\n-- Credits: TempedOut, Soggy, Hon, Mint, Juan, Joseph, Q/2qrys & Oni');
    fs.writeFileSync(p, s);
  }
  console.log('init header =', fs.readFileSync(p, 'utf8').includes('Credits:'));
}

// 3) CREDITS.md
if (!fs.existsSync('CREDITS.md')) {
  fs.writeFileSync('CREDITS.md', [
    '# Credits',
    '',
    'Seraphim is a rebranded, paid fork of **Project Rain** (open-sourced by autumn / unionizing).',
    '',
    'Per the original authors\' request, credits are included for:',
    '',
    '- TempedOut',
    '- Soggy',
    '- Hon',
    '- Mint',
    '- Juan',
    '- Joseph',
    '- Q/2qrys',
    '- Oni',
    '',
    'Anti-detection layer (`src/security/bypass.lua`, `src/features/hooking.lua`) adapted from the',
    'frutiger fork of Project Rain.',
    ''
  ].join('\n'));
  console.log('CREDITS.md created');
}

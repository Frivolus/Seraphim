import fs from 'node:fs';
const p = 'src/ui/tabs/ui.lua';
let s = fs.readFileSync(p, 'utf8');
const before = s;

s = s.replace(/function tabs:create_credits\(tab\)[\s\S]*?\nend/, [
  'function tabs:create_credits(tab)',
  '\tlocal groupbox = tab:newGroupBox("Credits", false);',
  '\tgroupbox:newLabel("Base: Project Rain");',
  '\tgroupbox:newLabel("autumn / unionizing");',
  '\tgroupbox:newLabel("TempedOut, Soggy, Hon,");',
  '\tgroupbox:newLabel("Mint, Juan, Joseph,");',
  '\tgroupbox:newLabel("Q/2qrys & Oni");',
  'end'
].join('\n'));

fs.writeFileSync(p, s);
console.log('changed =', s !== before);

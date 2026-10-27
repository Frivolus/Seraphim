import fs from 'node:fs';
const p = 'src/ui/tabs/ui.lua';
let s = fs.readFileSync(p, 'utf8');
const before = s;

s = s.replace('tab:newGroupBox("Credits", true)', 'tab:newGroupBox("Credits", false)');
s = s.replace('(open-sourced by autumn / unionizing)");', '(open-sourced by autumn / unionizing)", true);');
s = s.replace('Q/2qrys & Oni");', 'Q/2qrys & Oni", true);');

fs.writeFileSync(p, s);
console.log('changed =', s !== before);

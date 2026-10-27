import fs from 'node:fs';
const p = 'src/ui/tos.lua';
let s = fs.readFileSync(p, 'utf8');
const before = s;
s = s.split('The privacy policy & TOS of the third party provider luarmor apply, which you can read at https://luarmor.net/tos')
     .join('The privacy policy & TOS of the third party provider Panda Auth apply.');
s = s.split('to use PR').join('to use Seraphim');
fs.writeFileSync(p, s);
console.log('changed =', s !== before);
console.log('luarmor_left =', s.includes('luarmor'));
console.log('panda_ok =', s.includes('Panda Auth'));

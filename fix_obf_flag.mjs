import fs from 'node:fs';
const p = 'src/luarmor_init_script.lua';
let s = fs.readFileSync(p, 'utf8');
const before = s;
s = s.replace('env.LPH_OBFUSCATED = false;', 'env.LPH_OBFUSCATED = env.LPH_OBFUSCATED or false;');
fs.writeFileSync(p, s);
console.log('changed =', s !== before);

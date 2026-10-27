import fs from 'node:fs';

fs.copyFileSync('ref/src_security_bypass.lua', 'src/security/bypass.lua');
console.log('copied bypass.lua', fs.statSync('src/security/bypass.lua').size);

let t = fs.readFileSync('ref/src_utility_trace.lua', 'utf8');
t = t.split('Frutiger/logs').join('Seraphim/logs');
fs.writeFileSync('src/utility/trace.lua', t);
console.log('copied trace.lua', t.length, 'rebrand_ok=', t.includes('Seraphim/logs'));

let init = fs.readFileSync('src/init.lua', 'utf8');
if (!init.includes('"Seraphim/logs"')) {
  init = init.replace('"Seraphim/Deepwoken-Config",', '"Seraphim/logs",\n        "Seraphim/Deepwoken-Config",');
  fs.writeFileSync('src/init.lua', init);
}
console.log('init_logs_folder =', fs.readFileSync('src/init.lua','utf8').includes('"Seraphim/logs"'));

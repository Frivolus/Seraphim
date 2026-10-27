import fs from 'node:fs';
import path from 'node:path';

const files = [];
(function walk(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})) { const f = path.join(d,e.name); if (e.isDirectory()) walk(f); else if (f.endsWith('.lua')) files.push(f); } })('src');

const checks = {
  'commentaire JS //': l => /\/\//.test(l.replace(/"[^"]*"/g,'""').replace(/'[^']*'/g,"''").replace(/--.*$/,'').replace(/https?:\/\//g,'URL')),
  'continue (Luau)': l => /\bcontinue\b/.test(l),
  'affectation composee (+= etc)': l => /[^\w.=<>~!](\+=|-=|\*=|\/=|\.\.=|%=|\^=)/.test(l),
  'string backtick': l => /`/.test(l),
  'cast de type ::': l => /\S\s::\s\S/.test(l),
  'operateur != ': l => /!=/.test(l),
};

const hits = {};
for (const f of files) {
  const lines = fs.readFileSync(f,'utf8').split(/\r?\n/);
  lines.forEach((l, i) => {
    for (const name of Object.keys(checks)) {
      if (checks[name](l)) {
        hits[name] = hits[name] || { n: 0, ex: [] };
        hits[name].n++;
        if (hits[name].ex.length < 5) hits[name].ex.push(f + ':' + (i+1) + ': ' + l.trim().slice(0,95));
      }
    }
  });
}

for (const name of Object.keys(hits)) {
  console.log('\n### ' + name + '  -> ' + hits[name].n + ' lignes');
  hits[name].ex.forEach(x => console.log('   ' + x));
}

// non-ASCII hors commentaires (peut derouter un parseur strict)
const bad = [];
for (const f of files) {
  fs.readFileSync(f,'utf8').split(/\r?\n/).forEach((l, i) => {
    const code = l.replace(/--.*$/,'');
    if (/[^\x00-\x7F]/.test(code)) bad.push(f + ':' + (i+1) + ': ' + l.trim().slice(0,95));
  });
}
console.log('\n### non-ASCII dans du CODE (pas en commentaire) -> ' + bad.length);
bad.slice(0,8).forEach(x => console.log('   ' + x));

// // dans le dist
const dist = fs.readFileSync('dist/seraphim.lua','utf8');
console.log('\n### "//" hors URL dans le dist -> ' + (dist.replace(/https?:\/\//g,'URL').match(/\/\//g)||[]).length + ' occurrences');

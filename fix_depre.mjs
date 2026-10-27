import fs from 'node:fs';

function fix(file, needle, replacement) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let n = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(needle)) {
      const indent = lines[i].match(/^\s*/)[0];
      lines[i] = indent + replacement;
      n++;
    }
  }
  fs.writeFileSync(file, lines.join('\n'));
  console.log(file + ' : ' + n + ' ligne(s) corrigee(s)');
}

fix('bundle.mjs', 'const depRe =',
  'const depRe = /\\brequire\\s*(?:\\(\\s*\\(*\\s*|,\\s*)(?:LPH_ENCSTR\\s*\\(\\s*)?["\']([^"\']+)["\']/g;');

fix('check.mjs', 'const reqRe =',
  'const reqRe = /\\brequire\\s*(?:\\(\\s*\\(*\\s*|,\\s*)(?:LPH_ENCSTR\\s*\\(\\s*)?["\'](@src\\/[^"\']+)["\']/g;');
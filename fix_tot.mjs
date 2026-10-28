import fs from "fs";
const f = "to51.mjs";
let t = fs.readFileSync(f, "utf8");
const bad = 'const _tot = sig.filter(i=>toks[i].v==="continue").length;`nconsole.log("continue total :", _tot, "| non attribues :", _tot - continues.length);`nedits.sort((x,y)=> x.a-y.a || x.b-y.b);';
const good = `const _tot = sig.filter(i=>toks[i].v==="continue").length;
console.log("continue total :", _tot, "| non attribues :", _tot - continues.length);
edits.sort((x,y)=> x.a-y.a || x.b-y.b);`;
if (t.includes(bad)) { fs.writeFileSync(f, t.replace(bad, good)); console.log("PATCH OK"); }
else { console.log("MARKER ABSENT"); }

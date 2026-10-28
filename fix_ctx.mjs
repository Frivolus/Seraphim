import fs from "fs";
const f = "to51.mjs"; let t = fs.readFileSync(f, "utf8");
const a = 'fs.writeFileSync("dist/_out51.lua", out, "utf8");';
const b = `const S=src.split("\\n");
  for(let k=Math.max(0,n-14);k<Math.min(S.length,n+26);k++) console.log("SRC "+(k+1)+": "+S[k].slice(0,170));
  fs.writeFileSync("dist/_out51.lua", out, "utf8");`;
if (!t.includes(a)) { console.log("ABSENT"); process.exit(1); }
fs.writeFileSync(f, t.replace(a,b)); console.log("PATCH OK");

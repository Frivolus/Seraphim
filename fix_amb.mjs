import fs from "fs";
const f = "to51.mjs"; let t = fs.readFileSync(f, "utf8");
const a = "const MACROS=new Set(";
const b = `let nAmb=0;
for(const i of sig){ const p=prevS.get(i); if(p<0) continue;
  if(toks[i].t==="o"&&toks[i].v==="("&&toks[p].t==="o"&&toks[p].v===")"&&/\\n/.test(src.slice(toks[p].b,toks[i].a))){ ins(toks[p].b,";"); nAmb++; } }
console.log("points-virgules anti-ambiguite :", nAmb);
const MACROS=new Set(`;
if (!t.includes(a)) { console.log("ABSENT"); process.exit(1); }
fs.writeFileSync(f, t.replace(a,b)); console.log("PATCH OK");

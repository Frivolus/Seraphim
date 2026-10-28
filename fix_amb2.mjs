import fs from "fs";
const f = "to51.mjs"; let t = fs.readFileSync(f, "utf8");
const A = `let nAmb=0;
for(const i of sig){ const p=prevS.get(i); if(p<0) continue;
  if(toks[i].t==="o"&&toks[i].v==="("&&toks[p].t==="o"&&toks[p].v===")"&&/\\n/.test(src.slice(toks[p].b,toks[i].a))){ ins(toks[p].b,";"); nAmb++; } }
console.log("points-virgules anti-ambiguite :", nAmb);
const MACROS=new Set(`;
const B = 'console.log("macros v14 supprimees :", nMac);';
const NB = `console.log("macros v14 supprimees :", nMac);
let nAmb=0;
for(const i of sig){
  if(!(toks[i].t==="o"&&toks[i].v==="(")) continue;
  let p=prevS.get(i);
  while(p>=0 && MACROS.has(toks[p].v)) p=prevS.get(p);
  if(p<0) continue;
  if(toks[p].t==="o"&&toks[p].v===")"&&/\\n/.test(src.slice(toks[p].b,toks[i].a))){ ins(toks[p].b,";"); nAmb++; }
}
console.log("points-virgules anti-ambiguite :", nAmb);`;
if (!t.includes(A) || !t.includes(B)) { console.log("ABSENT"); process.exit(1); }
t = t.replace(A, "const MACROS=new Set(");
t = t.replace(B, NB);
fs.writeFileSync(f, t); console.log("PATCH OK");

import fs from "fs";
const f = "to51.mjs"; let t = fs.readFileSync(f, "utf8");
const a = "delSpans.sort((x,y)=>x.a-y.a);";
const b = `const MACROS=new Set(["LPH_NO_VIRTUALIZE","LPH_JIT","LPH_JIT_MAX","LPH_NO_UPVALUES","LPH_ENCFUNC"]);
let nMac=0;
for(const i of sig){ const nx=nextS.get(i); if(MACROS.has(toks[i].v)&&nx>=0&&toks[nx].t==="o"&&toks[nx].v==="("){ rep(toks[i],""); nMac++; } }
console.log("macros v14 supprimees :", nMac);
delSpans.sort((x,y)=>x.a-y.a);`;
if (!t.includes(a)) { console.log("ABSENT"); process.exit(1); }
fs.writeFileSync(f, t.replace(a,b)); console.log("PATCH OK");

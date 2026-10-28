import fs from "fs";
const f = "to51.mjs"; let t = fs.readFileSync(f, "utf8");
const A = `const MACROS=new Set(["LPH_NO_VIRTUALIZE","LPH_JIT","LPH_JIT_MAX","LPH_NO_UPVALUES","LPH_ENCFUNC"]);
let nMac=0;
for(const i of sig){ const nx=nextS.get(i); if(MACROS.has(toks[i].v)&&nx>=0&&toks[nx].t==="o"&&toks[nx].v==="("){ rep(toks[i],""); nMac++; } }
console.log("macros v14 supprimees :", nMac);`;
const B = `const MACROS=new Set(["LPH_NO_VIRTUALIZE","LPH_JIT","LPH_JIT_MAX","LPH_NO_UPVALUES","LPH_ENCFUNC"]);
const ATTR={LPH_NO_VIRTUALIZE:"LPH_ATTRIBUTES(VM(NONE))",LPH_JIT:"LPH_ATTRIBUTES(PRESET(FAST))",LPH_JIT_MAX:"LPH_ATTRIBUTES(PRESET(FAST))",LPH_NO_UPVALUES:"LPH_ATTRIBUTES(NO_UPVALUES)"};
let nMac=0;
for(const i of sig){
  const attr=ATTR[toks[i].v];
  if(!attr) continue;
  const op=nextS.get(i);
  if(op===undefined||op<0||toks[op].v!=="("){ continue; }
  const fn=nextS.get(op);
  if(fn===undefined||fn<0||toks[fn].v!=="function"){ rep(toks[i],""); nMac++; continue; }
  let k=nextS.get(fn), guard=0;
  while(k!==undefined&&k>=0&&guard++<6&&!(toks[k].t==="o"&&toks[k].v==="(")) k=nextS.get(k);
  if(k===undefined||k<0){ rep(toks[i],""); nMac++; continue; }
  let d=0, close=-1, m=k;
  for(;;){ const u=toks[m]; if(u.t==="o"&&u.v==="(")d++; else if(u.t==="o"&&u.v===")"){d--; if(d===0){close=m;break;}} m=nextS.get(m); if(m===undefined||m<0)break; }
  if(close<0){ rep(toks[i],""); nMac++; continue; }
  rep(toks[i],"");
  ins(toks[close].b," "+attr+" ");
  nMac++;
}
console.log("macros v14 converties en attributs v15 :", nMac);`;
if (!t.includes(A)) { console.log("ABSENT"); process.exit(1); }
fs.writeFileSync(f, t.replace(A,B)); console.log("PATCH OK");

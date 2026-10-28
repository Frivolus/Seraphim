import fs from "fs";
const f = "to51.mjs"; let t = fs.readFileSync(f, "utf8");
const H = `function isFuncHeaderClose(closeIdx){
  let d=0,m=closeIdx;
  for(;;){ const u=toks[m]; if(u.t==="o"&&u.v===")")d++; else if(u.t==="o"&&u.v==="("){d--; if(d===0)break;} m=prevS.get(m); if(m<0) return false; }
  let k=prevS.get(m);
  for(;;){ if(k<0) return false; const u=toks[k];
    if(u.t==="k"&&u.v==="function") return true;
    if(u.t==="n"||(u.t==="o"&&(u.v==="."||u.v===":"))){ k=prevS.get(k); continue; }
    return false; }
}
let nAmb=0;`;
const C1 = "let nAmb=0;";
const C2 = `if(toks[p].t==="o"&&toks[p].v===")"&&/\\n/.test(src.slice(toks[p].b,toks[i].a))){ ins(toks[p].b,";"); nAmb++; }`;
const N2 = `if(toks[p].t==="o"&&toks[p].v===")"&&/\\n/.test(src.slice(toks[p].b,toks[i].a))&&!isFuncHeaderClose(p)){ ins(toks[p].b,";"); nAmb++; }`;
if (!t.includes(C1) || !t.includes(C2)) { console.log("ABSENT"); process.exit(1); }
t = t.replace(C1, H).replace(C2, N2);
fs.writeFileSync(f, t); console.log("PATCH OK");

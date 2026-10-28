import fs from "fs";
const f = "to51.mjs"; let t = fs.readFileSync(f, "utf8");
const P = [
 ["  let depth=0, prev=-1, k=fromIdx;", "  let depth=0, prev=-1, k=fromIdx, seenNon=false;"],
 ['if(t.t==="o"&&["|","&",".","?","-",">","[","<"].includes(t.v)) return true; return false; }',
  'if(t.t==="o"&&["|","&",".","?","-",">","[","<",":"].includes(t.v)) return true; return false; }'],
 [`    if(t.t==="o"&&["(","[","{"].includes(t.v)) depth++;
    else if(t.t==="o"&&[")","]","}"].includes(t.v)){ if(depth>0) depth--; }
    prev=k; k=nextS.get(k);`,
  `    if(t.t==="o"&&["(","[","{"].includes(t.v)) depth++;
    else if(t.t==="o"&&[")","]","}"].includes(t.v)){ if(depth>0){ depth--; if(depth===0&&seenNon){ const nx=nextS.get(k); if(nx<0||!isTypeCont(nx)) return k; } } }
    else if(depth===0) seenNon=true;
    prev=k; k=nextS.get(k);`],
 [`    else if(dep===0){
      if(u.t==="k"&&["do","in","end"].includes(u.v)) break;
      if(u.t==="o"&&["=",";"].includes(u.v)) break;
      if(u.t==="o"&&u.v===":"){ const e=typeEnd(nextS.get(q)); if(e>0) delR(u.a, toks[e].a); }
    }`,
  `    else if(dep===0){
      const pv=prevS.get(q); const ptv=pv>=0?toks[pv]:null;
      if(u.t==="k"&&["do","in","end","function","local","if","while","for","repeat","until","return","else","elseif"].includes(u.v)) break;
      if(u.t==="o"&&["=",";"].includes(u.v)) break;
      if(ptv && /\\n/.test(src.slice(ptv.b,u.a)) && u.v!=="," && !["(","[","{"].includes(ptv.v) && ptv.v!==":") break;
      if(u.t==="o"&&u.v===":"){ const e=typeEnd(nextS.get(q)); if(e>0) delR(u.a, toks[e].a); }
    }`]
];
for (const [a,b] of P) { if (!t.includes(a)) { console.log("ABSENT:", a.slice(0,50)); process.exit(1); } t = t.replace(a,b); }
fs.writeFileSync(f, t); console.log("PATCH OK");

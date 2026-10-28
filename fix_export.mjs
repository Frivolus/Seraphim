import fs from "fs";
const f = "to51.mjs"; let t = fs.readFileSync(f, "utf8");
const a = "delSpans.sort((x,y)=>x.a-y.a);";
const b = `for(const i of sig){ const p=prevS.get(i); if(toks[i].v==="export" && !(p>=0&&toks[p].t==="o"&&(toks[p].v==="."||toks[p].v===":"))) rep(toks[i],""); }
delSpans.sort((x,y)=>x.a-y.a);`;
if (!t.includes(a)) { console.log("ABSENT"); process.exit(1); }
fs.writeFileSync(f, t.replace(a,b)); console.log("PATCH OK");

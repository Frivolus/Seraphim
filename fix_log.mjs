import fs from "fs";
const f = "to51.mjs"; let t = fs.readFileSync(f, "utf8");
const P = [
 ['rep(pt, ""); rep(t, "= " + lhs + " " + pt.v + " ");',
  "rep(pt, \"\"); rep(t, \"= \" + lhs + \" \" + pt.v + \" \"); if(nAsg<25) console.log(\"  op= L\" + (src.slice(0,pt.a).split(\"\\n\").length) + \" lhs=[\" + lhs + \"] op=[\" + pt.v + \"]\");"],
 ['if(n) console.log("LIGNE "+n+" >> "+(L[n-1]||"").slice(0,200));',
  `if(n){ for(let k=Math.max(0,n-7);k<Math.min(L.length,n+4);k++) console.log((k+1)+": "+L[k].slice(0,170)); }
  fs.writeFileSync("dist/_out51.lua", out, "utf8");`]
];
for (const [a,b] of P) { if (!t.includes(a)) { console.log("ABSENT:", a.slice(0,60)); process.exit(1); } t = t.replace(a,b); }
fs.writeFileSync(f, t); console.log("PATCH OK");

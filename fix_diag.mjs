import fs from "fs";
const f = "to51.mjs";
let t = fs.readFileSync(f, "utf8");
const P = [
 ["const continues=[], breaks=[];", "const continues=[], breaks=[], contPairs=[];"],
 ['if(f.kind==="loop"){ f.cont.push(i); continues.push(i); break; }', 'if(f.kind==="loop"){ f.cont.push(i); continues.push(i); contPairs.push([i,f]); break; }'],
 ['for(const i of continues) rep(toks[i], "break");', `for(const i of continues) rep(toks[i], "break");
const _unc = allLoops.filter(x=>x.end<0);
console.log("boucles non fermees :", _unc.length, "/", allLoops.length);
for (const x of _unc.slice(0,12)) { const ln = src.slice(0,x.start).split("\\n").length; console.log("  boucle ligne", ln, "| cont:", x.cont.length, "| brk:", x.brk.length); }
for (const [i,x] of contPairs) if (x.end<0) { const ln = src.slice(0,toks[i].a).split("\\n").length; console.log("  CONTINUE ORPHELIN ligne", ln); }`]
];
for (const [a,b] of P) { if (!t.includes(a)) { console.log("ABSENT:", a.slice(0,50)); process.exit(1); } t = t.replace(a,b); }
fs.writeFileSync(f, t); console.log("PATCH OK");

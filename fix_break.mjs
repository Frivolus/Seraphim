import fs from "fs";
const f = "to51.mjs";
let t = fs.readFileSync(f, "utf8");
const P = [
 ['for(const i of continues) rep(toks[i], "break");', 'for(const i of continues) rep(toks[i], "do break end");'],
 ['for(const [i,f] of breaks){ if(brkName.has(f)) rep(toks[i], brkName.get(f) + " = true; break"); }', 'for(const [i,f] of breaks){ if(brkName.has(f)) rep(toks[i], "do " + brkName.get(f) + " = true; break end"); else rep(toks[i], "do break end"); }']
];
for (const [a,b] of P) { if (!t.includes(a)) { console.log("ABSENT:", a.slice(0,60)); process.exit(1); } t = t.replace(a,b); }
fs.writeFileSync(f, t); console.log("PATCH OK");

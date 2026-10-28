import fs from "fs";
import { execSync } from "child_process";
let luaparse;
try { luaparse = (await import("luaparse")).default; }
catch { execSync("npm i luaparse --no-save", {stdio:"inherit"}); luaparse = (await import("luaparse")).default; }

const src = fs.readFileSync("dist/seraphim.lua","utf8");
const lines = src.split("\n");
console.log("BOM:", src.charCodeAt(0) === 0xFEFF, "| octets:", src.length, "| lignes:", lines.length);
try { luaparse.parse(src, {luaVersion:"5.1"}); console.log("PARSE 5.1 : OK"); }
catch(e){
  console.log("PARSE 5.1 : ECHEC ->", e.message);
  const n = e.line || 0;
  if (n) console.log("LIGNE " + n + " >> " + (lines[n-1]||"").slice(0,200));
}

const pats = {
  "continue":          /\bcontinue\b/g,
  "op= composees":     /[+\-*\/%^]=(?!=)/g,
  "concat ..= ":       /\.\.=/g,
  "backtick":          /`/g,
  "different != ":     /!=/g,
  "div entiere //":    /\/\//g,
  "goto":              /\bgoto\b/g,
  "labels ::":         /::/g,
  "escape \\u{}":      /\\u\{/g,
  "interpolation ${":  /\$\{/g,
};
console.log("--- inventaire ---");
for (const [k,re] of Object.entries(pats)) console.log(k.padEnd(20), (src.match(re)||[]).length);

console.log("--- continue en position de champ (a ne PAS toucher) ---");
let c=0; for (let i=0;i<lines.length && c<8;i++) if (/[.:]continue\b/.test(lines[i])) { console.log((i+1)+": "+lines[i].trim().slice(0,130)); c++; }

console.log("--- lignes contenant un backtick ---");
c=0; for (let i=0;i<lines.length && c<12;i++) if (lines[i].includes("`")) { console.log((i+1)+": "+lines[i].trim().slice(0,170)); c++; }

console.log("--- if-expression Luau (x = if c then a else b) ---");
c=0; for (let i=0;i<lines.length && c<10;i++) if (/(=\s*if\b|\(\s*if\b|,\s*if\b|return\s+if\b)/.test(lines[i])) { console.log((i+1)+": "+lines[i].trim().slice(0,150)); c++; }

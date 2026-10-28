import fs from "fs";
const f = "to51.mjs"; let t = fs.readFileSync(f, "utf8");
const n = (t.match(/toks\[e\]\.a\);/g)||[]).length;
if (n !== 4) { console.log("attendu 4 occurrences, trouve " + n); process.exit(1); }
fs.writeFileSync(f, t.split("toks[e].a);").join("toks[prevS.get(e)].b);"));
console.log("PATCH OK");

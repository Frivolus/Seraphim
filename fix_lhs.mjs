import fs from "fs";
const f = "to51.mjs"; let t = fs.readFileSync(f, "utf8");
const a = `      if(pt&&pt.t==="o"&&(pt.v==="]"||pt.v===")")){ k=p; continue; }
      return k; }`;
const b = `      return k; }`;
if (!t.includes(a)) { console.log("ABSENT"); process.exit(1); }
t = t.replace(a, b);
fs.writeFileSync(f, t); console.log("PATCH OK");

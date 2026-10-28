import fs from "fs";
const f = "to51.mjs"; let t = fs.readFileSync(f, "utf8");

const INSERT = `// ===== suppression des annotations de type Luau =====
const delSpans = [];
const delR = (aPos,bPos)=>delSpans.push({a:aPos,b:bPos,s:""});
function isTypeTail(idx){ const t=toks[idx]; if(!t) return false;
  if(t.t==="n"||t.t==="s") return true;
  if(t.t==="o"&&[")","]","}","?","<",">"].includes(t.v)) return true; return false; }
function isTypeCont(idx){ const t=toks[idx]; if(!t) return false;
  if(t.t==="o"&&["|","&",".","?","-",">","[","<"].includes(t.v)) return true; return false; }
function typeEnd(fromIdx){
  if(fromIdx<0) return -1;
  let depth=0, prev=-1, k=fromIdx;
  while(k>=0){
    const t=toks[k];
    if(depth===0){
      if(t.t==="o"&&[",","=",";"].includes(t.v)) return k;
      if(t.t==="o"&&[")","]","}"].includes(t.v)) return k;
      if(t.t==="k"&&["in","do","end","return","then"].includes(t.v)) return k;
      if(prev>=0&&isTypeTail(prev)&&!isTypeCont(k)&&/\\n/.test(src.slice(toks[prev].b,t.a))) return k;
    }
    if(t.t==="o"&&["(","[","{"].includes(t.v)) depth++;
    else if(t.t==="o"&&[")","]","}"].includes(t.v)){ if(depth>0) depth--; }
    prev=k; k=nextS.get(k);
  }
  return -1;
}
for(const i of sig){
  if(toks[i].t!=="k"||toks[i].v!=="function") continue;
  let k=nextS.get(i);
  for(;;){
    if(k<0) break;
    const t=toks[k];
    if(t.t==="o"&&t.v==="(") break;
    if(t.t==="n"||(t.t==="o"&&(t.v==="."||t.v===":"))){ k=nextS.get(k); continue; }
    if(t.t==="o"&&t.v==="<"){ let d=0,m=k; for(;;){ const u=toks[m]; if(u.t==="o"&&u.v==="<")d++; else if(u.t==="o"&&u.v===">"){d--; if(d===0)break;} m=nextS.get(m); if(m<0)break; } k=m<0?-1:nextS.get(m); continue; }
    break;
  }
  if(k<0) continue;
  const open=k; let d=0, close=-1, m=open;
  for(;;){ const u=toks[m]; if(u.t==="o"&&u.v==="(")d++; else if(u.t==="o"&&u.v===")"){d--; if(d===0){close=m;break;}} m=nextS.get(m); if(m<0)break; }
  if(close<0) continue;
  let dep=0;
  for(let q=nextS.get(open); q>=0 && q!==close; q=nextS.get(q)){
    const t=toks[q];
    if(t.t==="o"&&["(","[","{"].includes(t.v)) dep++;
    else if(t.t==="o"&&[")","]","}"].includes(t.v)){ if(dep>0) dep--; }
    else if(dep===0&&t.t==="o"&&t.v===":"){ const e=typeEnd(nextS.get(q)); if(e>0) delR(t.a, toks[e].a); }
  }
  const nx=nextS.get(close);
  if(nx>=0&&toks[nx].t==="o"&&toks[nx].v===":"){ const e=typeEnd(nextS.get(nx)); if(e>0) delR(toks[nx].a, toks[e].a); }
}
for(const i of sig){
  const t=toks[i];
  if(t.t!=="k"||(t.v!=="local"&&t.v!=="for")) continue;
  let q=nextS.get(i); if(q<0) continue;
  if(t.v==="local"&&toks[q].t==="k"&&toks[q].v==="function") continue;
  let dep=0;
  for(; q>=0; q=nextS.get(q)){
    const u=toks[q];
    if(u.t==="o"&&["(","[","{"].includes(u.v)) dep++;
    else if(u.t==="o"&&[")","]","}"].includes(u.v)){ if(dep===0) break; dep--; }
    else if(dep===0){
      if(u.t==="k"&&["do","in","end"].includes(u.v)) break;
      if(u.t==="o"&&["=",";"].includes(u.v)) break;
      if(u.t==="o"&&u.v===":"){ const e=typeEnd(nextS.get(q)); if(e>0) delR(u.a, toks[e].a); }
    }
  }
}
for(const i of sig){
  if(toks[i].v!=="type") continue;
  const a=nextS.get(i); if(a<0||toks[a].t!=="n") continue;
  let b=nextS.get(a);
  if(b>=0&&toks[b].t==="o"&&toks[b].v==="<"){ let d=0,m=b; for(;;){ const u=toks[m]; if(u.t==="o"&&u.v==="<")d++; else if(u.t==="o"&&u.v===">"){d--; if(d===0)break;} m=nextS.get(m); if(m<0)break; } b=m<0?-1:nextS.get(m); }
  if(b<0) continue;
  if(!(toks[b].t==="o"&&toks[b].v==="=")) continue;
  const e=typeEnd(nextS.get(b));
  if(e>0) delR(toks[i].a, toks[e].a);
}
delSpans.sort((x,y)=>x.a-y.a);
for(const d of delSpans) edits.push(d);
const inType = new Uint8Array(toks.length);
{ let si=0; for(let i=0;i<toks.length;i++){ while(si<delSpans.length&&delSpans[si].b<=toks[i].a) si++; if(si<delSpans.length&&delSpans[si].a<=toks[i].a) inType[i]=1; } }
console.log("annotations supprimees :", delSpans.length);
`;

const A = "const frames=[]; const allLoops=[]; let pending=0, idc=0;";
if (!t.includes(A)) { console.log("ABSENT A"); process.exit(1); }
t = t.replace(A, INSERT + A);

const B = `for(const i of sig){ const t=toks[i];
  if(t.t==="k"){
    if(t.v==="for"||t.v==="while")`;
if (!t.includes(B)) { console.log("ABSENT B"); process.exit(1); }
t = t.replace(B, `for(const i of sig){ const t=toks[i];
  if(inType[i]) continue;
  if(t.t==="k"){
    if(t.v==="for"||t.v==="while")`);

fs.writeFileSync(f, t); console.log("PATCH OK");

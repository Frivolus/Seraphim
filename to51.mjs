import fs from "fs";
import { execSync } from "child_process";

let luaparse;
try { luaparse = (await import("luaparse")).default; }
catch { execSync("npm i luaparse --no-save", {stdio:"inherit"}); luaparse = (await import("luaparse")).default; }

const FILE = "dist/seraphim.lua";
const src = fs.readFileSync(FILE, "utf8");

const KW = new Set("and break continue do else elseif end false for function if in local nil not or repeat return then true until while".split(" "));
const T2 = ["..","==","~=","<=",">="];

function lex(s){
  const toks=[]; let i=0; const n=s.length;
  const add=(t,a,b,v)=>toks.push({t,a,b,v});
  while(i<n){
    const c=s[i];
    if(c==="-"&&s[i+1]==="-"){
      let j=i+2,eq=0;
      if(s[j]==="["){let k=j+1;while(s[k]==="="){eq++;k++;}
        if(s[k]==="["){const cl="]"+"=".repeat(eq)+"]";const e=s.indexOf(cl,k+1);const end=e<0?n:e+cl.length;add("c",i,end,"");i=end;continue;}}
      let e=s.indexOf("\n",i); if(e<0)e=n; add("c",i,e,""); i=e; continue;
    }
    if(c==="["){let k=i+1,eq=0;while(s[k]==="="){eq++;k++;}
      if(s[k]==="["){const cl="]"+"=".repeat(eq)+"]";const e=s.indexOf(cl,k+1);const end=e<0?n:e+cl.length;add("s",i,end,"");i=end;continue;}}
    if(c==='"'||c==="'"||c==="`"){let j=i+1;while(j<n){if(s[j]==="\\"){j+=2;continue;}if(s[j]===c){j++;break;}j++;}add("s",i,j,"");i=j;continue;}
    if(/[ \t\r\n]/.test(c)){let j=i+1;while(j<n&&/[ \t\r\n]/.test(s[j]))j++;add("w",i,j,"");i=j;continue;}
    if(/[A-Za-z_]/.test(c)){let j=i+1;while(j<n&&/[A-Za-z0-9_]/.test(s[j]))j++;const v=s.slice(i,j);add(KW.has(v)?"k":"n",i,j,v);i=j;continue;}
    if(/[0-9]/.test(c)||(c==="."&&/[0-9]/.test(s[i+1]||""))){let j=i+1;while(j<n&&/[0-9a-fA-FxX.]/.test(s[j]))j++;add("n",i,j,s.slice(i,j));i=j;continue;}
    if(s.startsWith("...",i)){add("o",i,i+3,"...");i+=3;continue;}
    let m=null; for(const o of T2) if(s.startsWith(o,i)){m=o;break;}
    if(m){add("o",i,i+2,m);i+=2;continue;}
    add("o",i,i+1,c); i++;
  }
  return toks;
}

const toks = lex(src);
const sig = [];
for(let i=0;i<toks.length;i++) if(toks[i].t!=="c"&&toks[i].t!=="w") sig.push(i);
const prevS = new Map(), nextS = new Map();
for(let i=0;i<sig.length;i++){ prevS.set(sig[i], i>0?sig[i-1]:-1); nextS.set(sig[i], i<sig.length-1?sig[i+1]:-1); }

const edits = [];
const rep = (tok, text) => edits.push({a:tok.a, b:tok.b, s:text});
const ins = (pos, text) => edits.push({a:pos, b:pos, s:text});

const EXPR_PREV_OP = new Set(["=","(","[",",","{","and","or","==","~=","<",">","<=",">=","..","+","-","*","/","%","^","#","not"]);
const TERM_OP = new Set([";",",",")","]","}"]);
const TERM_KW = new Set(["end","then","do","until","return"]);

function isTermTail(idx){ const t=toks[idx]; if(!t) return false;
  if(t.t==="n"||t.t==="s") return true;
  if(t.t==="o"&&[")","]","}"].includes(t.v)) return true;
  if(t.t==="k"&&["true","false","nil"].includes(t.v)) return true;
  return false; }
function isCont(idx){ const t=toks[idx]; if(!t) return false;
  if(t.t==="k"&&(t.v==="and"||t.v==="or")) return true;
  if(t.t==="o"&&![";",",",")","]","}","..."].includes(t.v)) return true;
  return false; }

function exprEnd(fromTokIdx){
  let depth=0, prev=-1, k=fromTokIdx;
  while(k>=0){
    const t=toks[k];
    if(depth===0){
      if(t.t==="k"&&TERM_KW.has(t.v)) return k;
      if(t.t==="o"&&TERM_OP.has(t.v)) return k;
      if(t.t==="k"&&t.v==="if"&&prev>=0){const p=toks[prev];
        if((p.t==="o"&&["(","[",",","{","="].includes(p.v))||(p.t==="k"&&["and","or","return","then","else"].includes(p.v))){
          k=exprEnd(nextS.get(k)); if(k<0) return -1; prev=k; k=nextS.get(k); continue; }}
      if(prev>=0&&isTermTail(prev)&&!isCont(k)&&/\n/.test(src.slice(toks[prev].b,t.start))) return k;
    }
    if(t.t==="o"&&["(","[","{"].includes(t.v)) depth++;
    else if(t.t==="o"&&[")","]","}"].includes(t.v)) depth--;
    else if(t.t==="k"&&t.v==="function") depth++;
    else if(t.t==="k"&&t.v==="end") depth--;
    prev=k; k=nextS.get(k);
  }
  return -1;
}

const ifExprToks = new Set();
function ifExpr(ifIdx, force){
  const p=prevS.get(ifIdx); const pv=toks[p];
  const sameLine = p>=0 && !/\n/.test(src.slice(toks[p].b, toks[ifIdx].a));
  const ok = force || (pv && ((pv.t==="o"&&EXPR_PREV_OP.has(pv.v)) || (pv.t==="k"&&["and","or","return"].includes(pv.v)) || (pv.t==="k"&&["then","else","elseif"].includes(pv.v)&&sameLine)));
  if(!ok) return null;
  let depth=0, k=nextS.get(ifIdx), thenT=null, elseT=null;
  while(k>=0){ const t=toks[k];
    if(depth===0){ if(t.t==="k"&&t.v==="then"){thenT=k;break;} }
    if(t.t==="o"&&["(","[","{"].includes(t.v)) depth++;
    else if(t.t==="o"&&[")","]","}"].includes(t.v)) depth--;
    else if(t.t==="k"&&t.v==="function") depth++;
    else if(t.t==="k"&&t.v==="end") depth--;
    k=nextS.get(k); }
  if(thenT===null) return null;
  depth=0; k=nextS.get(thenT);
  while(k>=0){ const t=toks[k];
    if(depth===0){ if(t.t==="k"&&(t.v==="else"||t.v==="elseif")){elseT=k;break;} }
    if(t.t==="o"&&["(","[","{"].includes(t.v)) depth++;
    else if(t.t==="o"&&[")","]","}"].includes(t.v)) depth--;
    else if(t.t==="k"&&t.v==="function") depth++;
    else if(t.t==="k"&&t.v==="end") depth--;
    k=nextS.get(k); }
  if(elseT===null) return null;
  ifExprToks.add(ifIdx);
  const elseTok=toks[elseT];
  rep(toks[ifIdx],"("); rep(toks[thenT]," and ");
  let end;
  if(elseTok.v==="elseif"){ ifExprToks.add(elseT); rep(elseTok," or ("); end=ifExpr(elseT, true); }
  else { rep(elseTok," or "); const st=nextS.get(elseT); end = st<0?-1:exprEnd(st); }
  if(end==null||end<0){ ins(src.length, ")"); } else { ins(toks[end].a, ")"); }
  return end;
}

let nIfExpr=0;
for(const i of sig){ if(toks[i].t==="k"&&toks[i].v==="if"&&ifExpr(i,false)!==null) nIfExpr++; }

const OPASG = new Set(["+","-","*","/","%","^",".."]);
function lhsStart(opIdx){
  let k=prevS.get(opIdx);
  for(;;){
    if(k<0) return -1;
    const t=toks[k];
    if(t.t==="n"){ const p=prevS.get(k); const pt=toks[p];
      if(pt&&pt.t==="o"&&(pt.v==="."||pt.v===":")){ k=prevS.get(p); continue; }
      return k; }
    if(t.t==="o"&&t.v==="]"){ let d=0,m=k; for(;;){ const u=toks[m]; if(u.t==="o"&&u.v==="]")d++; else if(u.t==="o"&&u.v==="["){d--; if(d===0)break;} m=prevS.get(m); if(m<0) return -1; } k=prevS.get(m); continue; }
    if(t.t==="o"&&t.v===")"){ let d=0,m=k; for(;;){ const u=toks[m]; if(u.t==="o"&&u.v===")")d++; else if(u.t==="o"&&u.v==="("){d--; if(d===0)break;} m=prevS.get(m); if(m<0) return -1; } k=prevS.get(m); continue; }
    return -1;
  }
}

let nAsg=0;
for(const i of sig){ const t=toks[i];
  if(t.t==="o"&&t.v==="="){ const p=prevS.get(i); const pt=toks[p];
    if(!pt||pt.t!=="o"||!OPASG.has(pt.v)) continue;
    if(t.a!==pt.b) continue;
    const ls=lhsStart(p); if(ls<0) continue;
    const lhs=src.slice(toks[ls].a, pt.a).trim();
    rep(pt, ""); rep(t, "= " + lhs + " " + pt.v + " "); if(nAsg<25) console.log("  op= L" + (src.slice(0,pt.a).split("\n").length) + " lhs=[" + lhs + "] op=[" + pt.v + "]");
    nAsg++; }
}

let nIntDiv=0;
for(const i of sig){ const t=toks[i];
  if(t.t==="o"&&t.v==="/"){ const nx=nextS.get(i); const nt=toks[nx];
    if(nt&&nt.t==="o"&&nt.v==="/"&&nt.a===t.b) nIntDiv++; } }

// ===== suppression des annotations de type Luau =====
const delSpans = [];
const delR = (aPos,bPos)=>delSpans.push({a:aPos,b:bPos,s:""});
function isTypeTail(idx){ const t=toks[idx]; if(!t) return false;
  if(t.t==="n"||t.t==="s") return true;
  if(t.t==="o"&&[")","]","}","?","<",">"].includes(t.v)) return true; return false; }
function isTypeCont(idx){ const t=toks[idx]; if(!t) return false;
  if(t.t==="o"&&["|","&",".","?","-",">","[","<",":"].includes(t.v)) return true; return false; }
function typeEnd(fromIdx){
  if(fromIdx<0) return -1;
  let depth=0, prev=-1, k=fromIdx, seenNon=false;
  while(k>=0){
    const t=toks[k];
    if(depth===0){
      if(t.t==="o"&&[",","=",";"].includes(t.v)) return k;
      if(t.t==="o"&&[")","]","}"].includes(t.v)) return k;
      if(t.t==="k"&&["in","do","end","return","then"].includes(t.v)) return k;
      if(prev>=0&&isTypeTail(prev)&&!isTypeCont(k)&&/\n/.test(src.slice(toks[prev].b,t.a))) return k;
    }
    if(t.t==="o"&&["(","[","{"].includes(t.v)) depth++;
    else if(t.t==="o"&&[")","]","}"].includes(t.v)){ if(depth>0){ depth--; if(depth===0&&seenNon){ const nx=nextS.get(k); if(nx<0||!isTypeCont(nx)) return k; } } }
    else if(depth===0) seenNon=true;
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
    else if(dep===0&&t.t==="o"&&t.v===":"){ const e=typeEnd(nextS.get(q)); if(e>0) delR(t.a, toks[prevS.get(e)].b); }
  }
  const nx=nextS.get(close);
  if(nx>=0&&toks[nx].t==="o"&&toks[nx].v===":"){ const e=typeEnd(nextS.get(nx)); if(e>0) delR(toks[nx].a, toks[prevS.get(e)].b); }
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
      const pv=prevS.get(q); const ptv=pv>=0?toks[pv]:null;
      if(u.t==="k"&&["do","in","end","function","local","if","while","for","repeat","until","return","else","elseif"].includes(u.v)) break;
      if(u.t==="o"&&["=",";"].includes(u.v)) break;
      if(ptv && /\n/.test(src.slice(ptv.b,u.a)) && u.v!=="," && !["(","[","{"].includes(ptv.v) && ptv.v!==":") break;
      if(u.t==="o"&&u.v===":"){ const e=typeEnd(nextS.get(q)); if(e>0) delR(u.a, toks[prevS.get(e)].b); }
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
  if(e>0) delR(toks[i].a, toks[prevS.get(e)].b);
}
for(const i of sig){ const p=prevS.get(i); if(toks[i].v==="export" && !(p>=0&&toks[p].t==="o"&&(toks[p].v==="."||toks[p].v===":"))) rep(toks[i],""); }
const MACROS=new Set(["LPH_NO_VIRTUALIZE","LPH_JIT","LPH_JIT_MAX","LPH_NO_UPVALUES","LPH_ENCFUNC"]);
const ATTR={LPH_NO_VIRTUALIZE:"LPH_ATTRIBUTES(VM(NONE))",LPH_JIT:"LPH_ATTRIBUTES(PRESET(FAST))",LPH_JIT_MAX:"LPH_ATTRIBUTES(PRESET(FAST))",LPH_NO_UPVALUES:"LPH_ATTRIBUTES(NO_UPVALUES)"};
let nMac=0;
for(const i of sig){
  const attr=ATTR[toks[i].v];
  if(!attr) continue;
  const op=nextS.get(i);
  if(op===undefined||op<0||toks[op].v!=="("){ continue; }
  const fn=nextS.get(op);
  if(fn===undefined||fn<0||toks[fn].v!=="function"){ rep(toks[i],""); nMac++; continue; }
  let k=nextS.get(fn), guard=0;
  while(k!==undefined&&k>=0&&guard++<6&&!(toks[k].t==="o"&&toks[k].v==="(")) k=nextS.get(k);
  if(k===undefined||k<0){ rep(toks[i],""); nMac++; continue; }
  let d=0, close=-1, m=k;
  for(;;){ const u=toks[m]; if(u.t==="o"&&u.v==="(")d++; else if(u.t==="o"&&u.v===")"){d--; if(d===0){close=m;break;}} m=nextS.get(m); if(m===undefined||m<0)break; }
  if(close<0){ rep(toks[i],""); nMac++; continue; }
  rep(toks[i],"");
  ins(toks[close].b," "+attr+" ");
  nMac++;
}
console.log("macros v14 converties en attributs v15 :", nMac);
function isFuncHeaderClose(closeIdx){
  let d=0,m=closeIdx;
  for(;;){ const u=toks[m]; if(u.t==="o"&&u.v===")")d++; else if(u.t==="o"&&u.v==="("){d--; if(d===0)break;} m=prevS.get(m); if(m<0) return false; }
  let k=prevS.get(m);
  for(;;){ if(k<0) return false; const u=toks[k];
    if(u.t==="k"&&u.v==="function") return true;
    if(u.t==="n"||(u.t==="o"&&(u.v==="."||u.v===":"))){ k=prevS.get(k); continue; }
    return false; }
}
let nAmb=0;
for(const i of sig){
  if(!(toks[i].t==="o"&&toks[i].v==="(")) continue;
  let p=prevS.get(i);
  while(p>=0 && MACROS.has(toks[p].v)) p=prevS.get(p);
  if(p<0) continue;
  if(toks[p].t==="o"&&toks[p].v===")"&&/\n/.test(src.slice(toks[p].b,toks[i].a))&&!isFuncHeaderClose(p)){ ins(toks[p].b,";"); nAmb++; }
}
console.log("points-virgules anti-ambiguite :", nAmb);
delSpans.sort((x,y)=>x.a-y.a);
for(const d of delSpans) edits.push(d);
const inType = new Uint8Array(toks.length);
{ let si=0; for(let i=0;i<toks.length;i++){ while(si<delSpans.length&&delSpans[si].b<=toks[i].a) si++; if(si<delSpans.length&&delSpans[si].a<=toks[i].a) inType[i]=1; } }
console.log("annotations supprimees :", delSpans.length);
const frames=[]; const allLoops=[]; let pending=0, idc=0;
const continues=[], breaks=[], contPairs=[];
for(const i of sig){ const t=toks[i];
  if(inType[i]) continue;
  if(t.t==="k"){
    if(t.v==="for"||t.v==="while"){ pending++; continue; }
    if(t.v==="do"){ if(pending>0){ pending--; const f={kind:"loop",id:idc++,start:t.b,end:-1,cont:[],brk:[]}; frames.push(f); allLoops.push(f); } else frames.push({kind:"block"}); continue; }
    if(t.v==="if"){ if(!ifExprToks.has(i)) frames.push({kind:"block"}); continue; }
    if(t.v==="function"){ frames.push({kind:"func"}); continue; }
    if(t.v==="repeat"){ const f={kind:"loop",id:idc++,start:t.b,end:-1,cont:[],brk:[]}; frames.push(f); allLoops.push(f); continue; }
    if(t.v==="until"){ const f=frames.pop(); if(f&&f.kind==="loop"){ f.end=t.a; } continue; }
    if(t.v==="end"){ const f=frames.pop(); if(f&&f.kind==="loop") f.end=t.a; continue; }
    if(t.v==="continue"){ for(let j=frames.length-1;j>=0;j--){ const f=frames[j]; if(f.kind==="block") continue; if(f.kind==="func") break; if(f.kind==="loop"){ f.cont.push(i); continues.push(i); contPairs.push([i,f]); break; } } continue; }
    if(t.v==="break"){ for(let j=frames.length-1;j>=0;j--){ const f=frames[j]; if(f.kind==="block") continue; if(f.kind==="func") break; if(f.kind==="loop"){ f.brk.push(i); breaks.push([i,f]); break; } } continue; }
  }
}

const finalLoops = allLoops.filter(f=>f.kind==="loop"&&f.end>=0&&f.cont.length>0);
const brkName=new Map();
for(const f of finalLoops) brkName.set(f, "__c51b" + f.id);
for(const f of finalLoops){
  const nm=brkName.get(f); const needBrk=f.brk.length>0;
  ins(f.start, " " + (needBrk?("local "+nm+" = false; "):"") + "repeat ");
  ins(f.end, " until true; " + (needBrk?("if "+nm+" then break end "):""));
}
for(const i of continues) rep(toks[i], "do break end");
const _unc = allLoops.filter(x=>x.end<0);
console.log("boucles non fermees :", _unc.length, "/", allLoops.length);
for (const x of _unc.slice(0,12)) { const ln = src.slice(0,x.start).split("\n").length; console.log("  boucle ligne", ln, "| cont:", x.cont.length, "| brk:", x.brk.length); }
for (const [i,x] of contPairs) if (x.end<0) { const ln = src.slice(0,toks[i].a).split("\n").length; console.log("  CONTINUE ORPHELIN ligne", ln); }
for(const [i,f] of breaks){ if(brkName.has(f)) rep(toks[i], "do " + brkName.get(f) + " = true; break end"); else rep(toks[i], "do break end"); }

const _tot = sig.filter(i=>toks[i].v==="continue").length;
console.log("continue total :", _tot, "| non attribues :", _tot - continues.length);
edits.sort((x,y)=> x.a-y.a || x.b-y.b);
let out="", cur=0;
for(const e of edits){ if(e.a<cur) continue; out += src.slice(cur,e.a) + e.s; cur=e.b; }
out += src.slice(cur);

console.log("if-expressions :", nIfExpr);
console.log("affectations   :", nAsg);
console.log("continue       :", continues.length, "| break cibles :", breaks.length);
console.log("boucles enveloppees :", finalLoops.length);
console.log("divisions //   :", nIntDiv);

try { luaparse.parse(out, {luaVersion:"5.1"}); console.log("VALIDATION 5.1 : OK"); }
catch(e){
  console.log("VALIDATION 5.1 : ECHEC ->", e.message);
  const L=out.split("\n"); const n=e.line||0; if(n){ for(let k=Math.max(0,n-7);k<Math.min(L.length,n+4);k++) console.log((k+1)+": "+L[k].slice(0,170)); }
  const S=src.split("\n");
  for(let k=Math.max(0,n-14);k<Math.min(S.length,n+26);k++) console.log("SRC "+(k+1)+": "+S[k].slice(0,170));
  fs.writeFileSync("dist/_out51.lua", out, "utf8");
  console.log("--- dist inchange ---"); process.exit(1);
}
fs.copyFileSync(FILE, "dist/_seraphim.luau.lua");
fs.writeFileSync(FILE, out, "utf8");
console.log("ECRIT ->", FILE, "| sauvegarde -> dist/_seraphim.luau.lua");

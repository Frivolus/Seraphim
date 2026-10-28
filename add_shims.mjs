import fs from "fs";
const f = "src/luarmor_init_script.lua"; let t = fs.readFileSync(f, "utf8");
const A = "env.LPH_CRASH               = env.LPH_CRASH               or function() end;";
const B = `env.LPH_CRASH               = env.LPH_CRASH               or function() end;
-- shims des attributs v15 (inertes, Luraph les remplace a l'obfuscation)
env.LPH_ATTRIBUTES          = env.LPH_ATTRIBUTES          or function(...) return ... end;
env.VM                      = env.VM                      or function(...) return ... end;
env.PRESET                  = env.PRESET                  or function(...) return ... end;
env.NONE                    = env.NONE                    or true;
env.FAST                    = env.FAST                    or true;
env.NO_UPVALUES             = env.NO_UPVALUES             or true;`;
if (!t.includes(A)) { console.log("ABSENT"); process.exit(1); }
fs.writeFileSync(f, t.replace(A,B)); console.log("shims OK");

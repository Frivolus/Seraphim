import fs from 'node:fs';

// 1) ne pas ecraser LRM_ScriptName si Luraph/le dashboard le definit
{
  const p = 'src/luarmor_init_script.lua';
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  s = s.replace('env.LRM_ScriptName = "Seraphim";', 'env.LRM_ScriptName = env.LRM_ScriptName or "Seraphim";');
  fs.writeFileSync(p, s);
  console.log('lrm_guard =', s !== before);
}

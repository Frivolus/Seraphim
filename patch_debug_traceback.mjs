import fs from 'node:fs';

const p = 'src/luarmor_init_script.lua';
const c = fs.readFileSync(p, 'utf8');
if (c.includes('DEBUG_SPAWN_TRACEBACK')) { console.log('deja patche'); process.exit(0); }

const block = [
'-- DEBUG_SPAWN_TRACEBACK',
'-- Donne un traceback quand une erreur part dans un thread detache.',
'local _real_spawn = task.spawn;',
'local _real_defer = task.defer;',
'local function _fmt_err(e)',
'    return tostring(e) .. "\\n" .. tostring(debug.traceback("", 2));',
'end;',
'task.spawn = function(f, ...)',
'    return _real_spawn(function(...)',
'        local ok, err = xpcall(f, _fmt_err, ...);',
'        if not ok then warn("[spawn] " .. err) end;',
'    end, ...);',
'end;',
'task.defer = function(f, ...)',
'    return _real_defer(function(...)',
'        local ok, err = xpcall(f, _fmt_err, ...);',
'        if not ok then warn("[defer] " .. err) end;',
'    end, ...);',
'end;',
''
];

const out = [];
for (const line of c.split('\n')) {
  if (line.trim() === 'return true;') out.push(...block);
  out.push(line);
}
fs.writeFileSync(p, out.join('\n'));
console.log('OK luarmor_init_script patche (traceback spawn/defer)');
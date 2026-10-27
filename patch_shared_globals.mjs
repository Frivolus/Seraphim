import fs from 'node:fs';
const p = 'src/luarmor_init_script.lua';
let c = fs.readFileSync(p, 'utf8');
if (c.includes('SHARED_GLOBALS_PATCH')) { console.log('deja patche'); process.exit(0); }
const block = [
'-- SHARED_GLOBALS_PATCH',
'-- Dans src/globals.lua ces noms sont des `local`. Le bundler encapsule chaque',
'-- module dans une fonction -> les locals sont perdus. On les republie en global.',
'local place = game.PlaceId;',
'env.is_eastern = place == 6473861193;',
'env.is_depths  = place == 5735553160;',
'env.is_etrean  = place == 6032399813;',
'env.is_chime   = place == 6832944305;',
'env.is_dungeon = place == 8668476218;',
'env.place_name = ({',
'    [5735553160] = "The Depths",',
'    [6032399813] = "Etrean Luminant",',
'    [6473861193] = "Eastern Luminant",',
'    [6832944305] = "Arena",',
'    [8668476218] = "Dungeon",',
'})[place];',
'',
'-- macros / helpers attendus par effect_replicator_handler et hooking',
'env.STR_TBL_SF_INVOKE = env.STR_TBL_SF_INVOKE or identity;',
'env.base_require = env.base_require or function(module) return require(module) end;',
'env.ap_breaker_tbl = env.ap_breaker_tbl or {};',
'env.sf_isnetworkowner = env.sf_isnetworkowner or function(part)',
'    local ok, result = pcall(function()',
'        local lp = game:GetService("Players").LocalPlayer;',
'        return part and lp.Character and part:IsDescendantOf(lp.Character);',
'    end);',
'    return ok and result or false;',
'end;',
''
].join('\n');
c = c.replace(/return true;\s*$/, block + '\nreturn true;\n');
fs.writeFileSync(p, c);
console.log('OK luarmor_init_script patche');
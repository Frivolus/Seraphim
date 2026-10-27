import fs from 'node:fs';
const p = 'src/utility/librarys/managers/ThemeManager.lua';
let s = fs.readFileSync(p, 'utf8');
const before = s;

// Fix 1: LoadDefault -> ne plus planter si le dropdown n'existe pas + lecture live de getgenv()
const setval = '\t\t\taztup_options.ThemeManager_ThemeList:SetValue(theme)';
if (s.includes(setval) && !s.includes('local _tl')) {
  s = s.replace(setval,
    '\t\t\tlocal _tl = (getgenv().aztup_options or aztup_options) and (getgenv().aztup_options or aztup_options).ThemeManager_ThemeList\n' +
    '\t\t\tif _tl then _tl:SetValue(theme) else self:ApplyTheme(theme) end');
}

// Fix 2: ThemeUpdate -> le local masquait la table du module
s = s.replace(/function ThemeManager:ThemeUpdate\(\)\r?\n\s*local aztup_options = \{/,
  'function ThemeManager:ThemeUpdate()\n\t\tlocal fields = {');
s = s.replace(/for i, field in next, aztup_options do\r?\n\s*if aztup_options and aztup_options\[field\] then\r?\n\s*self\.Library\[field\] = aztup_options\[field\]\.Value/,
  'for i, field in next, fields do\n\t\t\tif aztup_options[field] then\n\t\t\t\tself.Library[field] = aztup_options[field].Value');

fs.writeFileSync(p, s);
console.log('changed =', s !== before);
console.log('guard_ok =', s.includes('local _tl'));
console.log('fields_ok =', s.includes('local fields = {'));

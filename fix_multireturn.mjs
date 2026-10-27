import fs from 'node:fs';

const file = 'bundle.mjs';
const lines = fs.readFileSync(file, 'utf8').split('\n');
const out = [];

for (const line of lines) {
  if (line.includes('if module_cache[module_name] ~= nil then return module_cache[module_name] end')) {
    out.push('  if module_cache[module_name] ~= nil then local c = module_cache[module_name]; return table.unpack(c, 1, c.n) end');
  } else if (line.includes('local ok, result = xpcall(function() return fn(builder_require) end')) {
    out.push('  local ok, packed = xpcall(function() return table.pack(fn(builder_require)) end, function(e) return e end)');
  } else if (line.includes('if not ok then error("Failed to execute module: "')) {
    out.push('  if not ok then error("Failed to execute module: " .. module_name .. " | " .. tostring(packed)) end');
  } else if (line.includes('module_cache[module_name] = result')) {
    out.push('  module_cache[module_name] = packed');
  } else if (line.trim() === 'return result') {
    out.push('  return table.unpack(packed, 1, packed.n)');
  } else {
    out.push(line);
  }
}

fs.writeFileSync(file, out.join('\n'));
console.log('OK bundle.mjs patche (multi-returns preserves)');
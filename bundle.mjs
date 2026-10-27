import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const assetDir = path.join(root, 'assets');
const outFile = path.join(root, 'dist', 'seraphim.lua');

const posix = (p) => p.replace(/\\/g, '/');
const modules = new Map();
const assets = new Map();

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, cb); else cb(full);
  }
}

walk(srcDir, (full) => {
  if (!full.endsWith('.lua')) return;
  const key = 'src/' + posix(path.relative(srcDir, full)).replace(/\.lua$/, '');
  modules.set(key, fs.readFileSync(full, 'utf8'));
});

walk(assetDir, (full) => {
  const key = '@assets/' + posix(path.relative(assetDir, full));
  assets.set(key, zlib.zstdCompressSync(fs.readFileSync(full)).toString('base64'));
});

const normalize = (s) => s.replace(/\\/g, '/').replace(/^@src\//, '').replace(/^src\//, '').replace(/^\.\//, '').replace(/\.lua$/, '');
const globToRe = (p) => new RegExp('^' + p.replace(/[|\\{}()[\]^$+?.]/g, '\\$&').replace(/\*/g, '.*') + '$');

const included = new Set();
const queue = ['init'];
while (queue.length) {
  const name = normalize(queue.pop());
  const key = 'src/' + name;
  if (included.has(key) || !modules.has(key)) continue;
  included.add(key);
  const src = modules.get(key);
  let m;
  const depRe = /\brequire\s*(?:\(\s*\(*\s*|,\s*)(?:LPH_ENCSTR\s*\(\s*)?["']([^"']+)["']/g;
  const listRe = /\blist_modules\s*\(\s*["']([^"']+)["']\s*\)/g;
  while ((m = depRe.exec(src))) {
    const d = normalize(m[1]);
    if (modules.has('src/' + d)) queue.push(d);
  }
  while ((m = listRe.exec(src))) {
    const re = globToRe(normalize(m[1]));
    for (const k of modules.keys()) if (k.startsWith('src/') && re.test(k.slice(4))) queue.push(k.slice(4));
  }
}

const usedAssets = new Set();
const assetRe = /["'](@assets\/[^"']+)["']/g;
for (const key of included) {
  let m; const src = modules.get(key);
  while ((m = assetRe.exec(src))) usedAssets.add(m[1]);
}

const sorted = [...included].sort();
const parts = [];

parts.push(`-- Seraphim bundle (base Project Rain OSS) -- genere par bundle.mjs
local module_map = {};
local module_cache = {};
local native_require = require;

local asset_map = {`);
for (const a of [...usedAssets].sort()) parts.push(`  [${JSON.stringify(a)}] = ${JSON.stringify(assets.get(a) || "")},`);
parts.push(`};

local function inline_asset_b96(p) return asset_map[p] end
if type(getgenv) == "function" then getgenv().inline_asset_b96 = inline_asset_b96 end

local function normalize_name(name)
  if type(name) ~= "string" then return nil end
  local n = name:gsub("\\\\", "/")
  n = n:gsub("^@src/", ""):gsub("^src/", ""):gsub("^%./", ""):gsub("%.lua$", "")
  return n
end

local function builder_require(name)
  if type(name) ~= "string" then return native_require(name) end
  local module_name = "src/" .. normalize_name(name)
  if module_cache[module_name] ~= nil then local c = module_cache[module_name]; return table.unpack(c, 1, c.n) end
  local fn = module_map[module_name]
  if type(fn) ~= "function" then error("Missing bundled module: " .. tostring(name)) end
  local ok, packed = xpcall(function() return table.pack(fn(builder_require)) end, function(e) return e end)
  if not ok then error("Failed to execute module: " .. module_name .. " | " .. tostring(packed)) end
  module_cache[module_name] = packed
  return table.unpack(packed, 1, packed.n)
end

if type(getgenv) == "function" then
  getgenv().builder_require = builder_require
  getgenv().script_require = builder_require
end
`);

for (const key of sorted) parts.push(`-- BEGIN MODULE: ${key}\nmodule_map[${JSON.stringify(key)}] = function(require)\n${modules.get(key)}\nend\n-- END MODULE: ${key}`);

parts.push(`
local function list_bundle_modules(pattern)
  if type(pattern) ~= "string" then return {} end
  local p = pattern:gsub("^@src/", ""):gsub("^src/", "")
  p = p:gsub("([%^%$%(%)%%%.%[%]%+%-%?])", "%%%1"):gsub("%*", ".*")
  local out = {}
  for name in pairs(module_map) do
    if name:sub(1, 4) == "src/" and name:sub(5):match("^" .. p .. "$") then table.insert(out, name:sub(5)) end
  end
  table.sort(out)
  return out
end

if type(getgenv) == "function" then getgenv().list_modules = list_bundle_modules end

local ok, err = xpcall(function() return builder_require("@src/init") end, function(e) return e end)
if not ok then warn("[seraphim] bootstrap echoue: " .. tostring(err)) end
`);

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, parts.join('\n'));
console.log("OK -> " + outFile + " (" + sorted.length + " modules, " + usedAssets.size + " assets)");
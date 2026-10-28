-- Seraphim loader -- a coller dans Volt
local URL = "https://vault.pandauth.com/kvs/843eabf655ee87fe?t=" .. tostring(os.time())

local src = game:HttpGet(URL)
local fn, err = loadstring(src)
if not fn then return warn("[seraphim] loadstring: " .. tostring(err)) end

if type(queue_on_teleport) == "function" then
    queue_on_teleport(('loadstring(game:HttpGet("%s"))()'):format(URL))
end

xpcall(fn, warn)
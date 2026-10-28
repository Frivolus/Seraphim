local auto_load = {};
local LOADER_URL = "https://vault.pandauth.com/kvs/843eabf655ee87fe";

function auto_load.initialize()
    if type(queue_on_teleport) ~= "function" then return false end;
    queue_on_teleport(('loadstring(game:HttpGet("%s"))()'):format(LOADER_URL));
    return true;
end;

function auto_load.start() return auto_load.initialize() end;

auto_load.initialize();
return auto_load;
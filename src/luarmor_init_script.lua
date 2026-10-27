-- Seraphim -- remplace l'init Luraph/Luarmor (strippe de l'OSS)
local env = getgenv() or _G;
local REPO_RAW = "https://raw.githubusercontent.com/Frivolus/Seraphim/main/";
local identity = function(value) return value end;

env.LPH_JIT                 = env.LPH_JIT                 or identity;
env.LPH_JIT_MAX             = env.LPH_JIT_MAX             or identity;
env.LPH_NO_VIRTUALIZE       = env.LPH_NO_VIRTUALIZE       or identity;
env.LPH_NO_UPVALUES         = env.LPH_NO_UPVALUES         or identity;
env.LPH_ENCSTR              = env.LPH_ENCSTR              or identity;
env.AUTH_GET_CONSTANT       = env.AUTH_GET_CONSTANT       or function(...) return ... end;
env.PROT_OBF_STR_SAFE_MACRO = env.PROT_OBF_STR_SAFE_MACRO or function(...) return ... end;
env.LRM_INIT_SCRIPT         = env.LRM_INIT_SCRIPT         or function(f) return f() end;
env.LPH_CRASH               = env.LPH_CRASH               or function() end;

env.LPH_OBFUSCATED = false;
env.LRM_ScriptName = "Seraphim";

local function normalize_path(p)
    if type(p) ~= "string" then return nil end
    return p:gsub("\\", "/"):gsub("^@src/", ""):gsub("^src/", ""):gsub("^%./", "");
end

env.list_modules = env.list_modules or function(pattern)
    local normalized = normalize_path(pattern);
    if not normalized or not normalized:find("*", 1, true) then
        return { normalized or "" };
    end;
    local base = normalized:match("^(.-)[/]*%*$") or "";
    local results = {};
    local function walk(dir)
        local items = {};
        if type(listdir) == "function" then items = listdir(dir) or {} end;
        for _, entry in ipairs(items) do
            local full = (dir == "" and entry) or (dir .. "/" .. entry);
            if full:match("%.lua$") then table.insert(results, full) end;
            if type(isfolder) == "function" and isfolder(full) then walk(full) end;
        end;
    end;
    walk(base);
    return results;
end;

env.inline_asset_b96 = env.inline_asset_b96 or function(asset_path)
    local relative = tostring(asset_path):gsub("^@", "");
    local raw = game:HttpGet(REPO_RAW .. relative);
    local encoding = game:GetService("EncodingService");
    local compressed = encoding:CompressBuffer(buffer.fromstring(raw), Enum.CompressionAlgorithm.Zstd);
    return buffer.tostring(encoding:Base64Encode(compressed));
end;

env.Feature = env.Feature or require("@src/features/generic_feature");
return true;
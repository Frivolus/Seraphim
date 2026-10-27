-- Seraphim -- remplace l'init Luraph/Luarmor (strippe de l'OSS)
local env = getgenv() or _G;
local REPO_RAW = "https://raw.githubusercontent.com/Frivolus/Seraphim/main/";
local identity = function(value) return value end;

-- macros d'optimisation Luraph -> identity
env.LPH_JIT                 = env.LPH_JIT                 or identity;
env.LPH_JIT_MAX             = env.LPH_JIT_MAX             or identity;
env.LPH_NO_VIRTUALIZE       = env.LPH_NO_VIRTUALIZE       or identity;
env.LPH_NO_UPVALUES         = env.LPH_NO_UPVALUES         or identity;
env.LPH_ENCSTR              = env.LPH_ENCSTR              or identity;
env.AUTH_GET_CONSTANT       = env.AUTH_GET_CONSTANT       or function(...) return ... end;
env.PROT_OBF_STR_SAFE_MACRO = env.PROT_OBF_STR_SAFE_MACRO or function(...) return ... end;
env.STR_TBL_SF_INVOKE       = env.STR_TBL_SF_INVOKE       or identity;
env.LRM_INIT_SCRIPT         = env.LRM_INIT_SCRIPT         or function(f) return f() end;
env.LPH_CRASH               = env.LPH_CRASH               or function() end;

env.LPH_OBFUSCATED = false;
env.LRM_ScriptName = "Seraphim";

-- helpers attendus par d'autres modules
env.base_require = env.base_require or function(module) return require(module) end;
env.ap_breaker_tbl = env.ap_breaker_tbl or {};
env.sf_isnetworkowner = env.sf_isnetworkowner or function(part)
    local ok, result = pcall(function()
        local lp = game:GetService("Players").LocalPlayer;
        return part and lp.Character and part:IsDescendantOf(lp.Character);
    end);
    return ok and result or false;
end;

-- SHARED_GLOBALS_PATCH
-- Dans src/globals.lua ces noms sont declares en `local`. Le bundler encapsule
-- chaque module dans une fonction, donc ces locals sont perdus : on les republie.
local place = game.PlaceId;
env.is_eastern = place == 6473861193;
env.is_depths  = place == 5735553160;
env.is_etrean  = place == 6032399813;
env.is_chime   = place == 6832944305;
env.is_dungeon = place == 8668476218;
env.place_name = ({
    [5735553160] = "The Depths",
    [6032399813] = "Etrean Luminant",
    [6473861193] = "Eastern Luminant",
    [6832944305] = "Arena",
    [8668476218] = "Dungeon",
})[place];

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
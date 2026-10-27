-- src/features/auto-parry/builder.lua -- STUB (strippe de l'OSS)
-- Requis par src/ui/tabs/combat.lua pour l'editeur de timings custom.
-- Toutes les methodes renvoient quelque chose pour que l'onglet s'affiche.
local builder = {};

builder.new = function()
    return setmetatable({}, { __index = builder });
end;

setmetatable(builder, {
    __index = function()
        return function() return builder end;
    end;
});

return builder;
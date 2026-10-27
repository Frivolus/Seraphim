-- src/features/auto-parry/data/custom_timings.lua -- STUB (strippe de l'OSS)
-- Requis par animator-handler qui appelle :lookup(id) et :sync().
local custom_timings = {};
custom_timings.__index = custom_timings;

function custom_timings:lookup(id)
    return nil, nil;
end;

function custom_timings:sync()
    return function() return nil end;
end;

function custom_timings:count()
    return 0;
end;

return setmetatable({}, custom_timings);
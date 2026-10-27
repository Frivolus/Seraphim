-- src/features/misc/spotify_widget.lua -- STUB (strippe de l'OSS)
-- Requis par src/ui/tabs/ui.lua ; SaveManager lit aztup.spotify_widget.Position.
local widget = {};
widget.__index = widget;

widget.new = function()
    return setmetatable({
        Position = UDim2.fromOffset(0, 0),
        Visible = false,
    }, widget);
end;

function widget:SetVisible(value)
    self.Visible = value and true or false;
    return self;
end;

function widget:Destroy()
    return nil;
end;

return widget;
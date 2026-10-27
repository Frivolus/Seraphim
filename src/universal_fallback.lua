local fallback = {};

function fallback.initialize()
    local env = getgenv();
    local default_font = Font.fromEnum(Enum.Font.Gotham);

    env.lexend = env.lexend or { regular = default_font, medium = default_font, bold = default_font };
    lexend = env.lexend;

    env.aztup = env.aztup or {};
    aztup = env.aztup;
    aztup.silent_mode = false;
    aztup.flags = aztup.flags or {};
    aztup.features = aztup.features or {};
    aztup.farms = aztup.farms or {};

    env.aztup_toggles = env.aztup_toggles or {};
    env.aztup_options = env.aztup_options or {};
    aztup_toggles = env.aztup_toggles;
    aztup_options = env.aztup_options;

    local Library = require("@src/utility/librarys/ui");
    env.Library = Library;

    local window = Library:CreateWindow({
        Title = "seraphim | universal",
        Center = true,
        AutoShow = true,
        MenuFadeTime = 0,
        TabPadding = 0,
        Size = UDim2.fromOffset(760, 560),
    });
    Library.PRWindow = window;
    aztup.ui = Library;

    local tab = window:AddTab("Settings");
    local box = tab:AddLeftGroupbox("Interface");

    box:AddLabel("Menu keybind"):AddKeyPicker("MenuKeybind", {
        Default = "RightAlt", NoUI = true, Text = "Menu keybind",
    });

    box:AddSlider("UI_Scale", {
        Text = "UI scale", Default = 100, Min = 70, Max = 130, Rounding = 0, Suffix = "%",
        Callback = function(v) Library:SetUIScale(v / 100) end,
    });

    pcall(function()
        local SaveManager = require("@src/utility/librarys/managers/SaveManager");
        local ThemeManager = require("@src/utility/librarys/managers/ThemeManager");
        SaveManager:SetLibrary(Library);
        SaveManager:SetFolder("Seraphim/Universal-Config");
        ThemeManager:SetLibrary(Library);
        ThemeManager:SetFolder("Seraphim/Universal-Config");
        SaveManager:BuildConfigSection(tab);
        ThemeManager:ApplyToTab(tab);
    end);

    return true;
end;

return fallback;
-- Seraphim -- point d'entree (base Seraphim OSS)
local luarmor_finish_tick = tick();

pcall(require, "@src/luarmor_init_script");
pcall(require, "@src/globals");

if not game:IsLoaded() then
    repeat task.wait() until game:IsLoaded();
end;

env = getgenv();

local supported_place_ids = {
    [4111023553]     = true,
    [5735553160]     = true,
    [6032399813]     = true,
    [6473861193]     = true,
    [6832944305]     = true,
    [8668476218]     = true,
    [86761619761103] = true,
    [13891478131]    = true,
};

if not supported_place_ids[game.PlaceId] then
    warn(string.format("[seraphim] place %s non supporte -> universal fallback", tostring(game.PlaceId)));
    pcall(function() require("@src/universal_fallback").initialize(); end);
    return true;
end;

if env.metamorphosis then
    pcall(function() env.metamorphosis(); end);
end;

if not LPH_OBFUSCATED then
    pcall(require, "@src/utility/librarys/luraph_sdk");
end;

xpcall(function()
    local folders = {
        "Seraphim",
        "Seraphim/Assets",
        "Seraphim/Assets/Hit Sounds",
        "Seraphim/Assets/Parry Sounds",
        "Seraphim/Fonts",
        "Seraphim/logs",
        "Seraphim/Deepwoken-Config",
        "Seraphim/Deepwoken-Config/CustomGlobalOrnaments",
        "Seraphim/Deepwoken-Config/CustomRaces",
        "Seraphim/Deepwoken-Config/Preferences",
        "Seraphim/Deepwoken-Config/CustomEnchantments",
    };
    for _, folder in ipairs(folders) do
        if not isfolder(folder) then makefolder(folder) end;
    end;
    if not isfile("Seraphim/script_state") then
        writefile("Seraphim/script_state", game:GetService("HttpService"):JSONEncode({
            last_executed = tick(),
            build_id = game:GetService("HttpService"):GenerateGUID(false),
        }));
    end;
end, warn);

if env.aztup then
    if env.Markers then
        for _, marker in env.Markers:get() do marker:Destroy() end;
        table.clear(env.Markers._marked_instances);
        table.clear(env.Markers);
        env.Markers = nil;
    end;
    xpcall(function() env.aztup:detach() end, warn);
    env.aztup = nil;
end;

env.aztup = {
    detach = function(self)
        if self.maid then self.maid:do_cleaning() end;
        if self.features then
            for _, feature in pairs(self.features) do
                xpcall(function() feature:disable() end, function(...)
                    warn(string.format("[detach %s]", feature.id or "none"), ...);
                end);
            end;
        end;
        if self.ui then self.ui:Unload() end;
    end,
    features = {},
    flags = {},
    farms = {},
    tabs = {},
};

local hasnt_accepted_tos = not isfile("Seraphim/tos_accepted.txt");

env.persistent_data = require("@src/utility/persistent_data");
env.Logger = require("@src/utility/logger");
aztup.automation = require("@src/automation/loader");
env.fflags = require("@src/utility/fflags");

if fflags:get("auto_load") then
    pcall(require, "@src/utility/setup_auto_load");
end;

if aztup.automation:should_auto_start() then
    local requests = services.ReplicatedStorage:WaitForChild("Requests");
    local start = requests:WaitForChild("StartMenu"):WaitForChild("Start");
    repeat
        start:FireServer();
        task.wait(0.5);
    until game:GetService("Players").LocalPlayer.Character;
    task.wait(1);
end;

local success, result = pcall(function()
    return require("@src/features/hooking");
end);

if not success or not result then
    return game:GetService("Players").LocalPlayer:Kick("[seraphim] hook echoue\n" .. tostring(result));
end;

do
    LPH_NO_VIRTUALIZE(function()
        function decode_asset(asset)
            local decoded = services.EncodingService:Base64Decode(buffer.fromstring(asset));
            local decompress = services.EncodingService:DecompressBuffer(decoded, Enum.CompressionAlgorithm.Zstd);
            return buffer.tostring(decompress);
        end;

        local function write_asset(target, source)
            if isfile(target) then return end;
            local ok, data = pcall(decode_asset, inline_asset_b96(source));
            if ok then writefile(target, data) end;
        end;

        task.spawn(pcall, function()
            write_asset("Seraphim/Assets/proximity.mp3", "@assets/proximity.mp3");
            write_asset("Seraphim/Assets/Parry Sounds/Ultrakill Parry.mp3", "@assets/Ultrakill Parry.mp3");
            write_asset("Seraphim/Assets/notification.mp3", "@assets/notification.mp3");
            write_asset("Seraphim/Deepwoken-Config/GuiItself.rbxm", "@assets/DeepwokenMorphs/GuiItself.rbxm");
        end);

        write_asset("Seraphim/Fonts/Lexend.ttf", "@assets/lexend.ttf");
        write_asset("Seraphim/Fonts/Lexend-Bold.ttf", "@assets/lexend-bold.ttf");
        write_asset("Seraphim/Fonts/Lexend-Medium.ttf", "@assets/lexend-medium.ttf");
    end)();
end;

lexend = require("@src/utility/custom_font");
user_service = require("@src/security/user_service");
if not LPH_OBFUSCATED then env.user_service = user_service end;

env.signal = require("@src/utility/signal");
loaded_signal = env.signal.new();
env.LOAD_START_TIME = tick();
aztup.silent_mode = isfile("Seraphim/silent_mode_toggle");
aztup.maid = require("@src/utility/maid").new();

if not aztup.ui then
    aztup.ui = require("@src/utility/librarys/ui");
end;

if hasnt_accepted_tos then
    pcall(require, "@src/ui/tos");
    task.wait(0.5);
end;

env.server_utility = require("@src/utility/deepwoken/servers");
env.local_player = require("@src/utility/player-data");
env.general = require("@src/utility/deepwoken/general_utilitys");
env.InstanceWatcher = require("@src/utility/instancewatcher");
env.BindableFunction = require("@src/utility/bindablefunction");
env.Markers = require("@src/utility/markers").new();
env.MarkedInstanceCreator = require("@src/utility/markedinstancecreator");
env.StateMachine = require("@src/utility/statemachine");
env.Tween = require("@src/utility/deepwoken/safe_tween");
env.EffectReplicatorHandler = require("@src/utility/deepwoken/effect_replicator_handler");
env.LoopUtil = require("@src/utility/loop");
env.scheduler = require("@src/utility/scheduler");
env.TargetFilter = require("@src/features/auto-parry/util/target-filter");
env.ab_builder = require("@src/features/auto-builder/auto_builder");
aztup.automation.initialize();

require("@src/features/auto-parry/block-input-manager");
local feature_loader = require("@src/features/loader");
if feature_loader and feature_loader.initialize then
    feature_loader:initialize();
end;

task.spawn(pcall, function()
    require("@src/features/auto-parry/handlers/animator-handler");
end);

chance_store = require("@src/features/auto-parry/data/chance_store");
env.chance_store = chance_store;

require("@src/ui/ui").initialize();

require("@src/features/visuals/player_esp")();
require("@src/features/visuals/base_esp")();

shared.unloaded = false;
Library:OnUnload(function()
    if shared.unloaded then return end;
    shared.unloaded = true;
    if env.aztup then
        if env.Markers then
            for _, marker in env.Markers:get() do marker:Destroy() end;
            table.clear(env.Markers._marked_instances);
            table.clear(env.Markers);
            env.Markers = nil;
        end;
        env.aztup:detach();
        env.aztup = nil;
    end;
    Library.Unloaded = true;
end);

if not aztup.silent_mode then
    Logger.log(string.format("Charge en %.2fs.", tick() - env.LOAD_START_TIME));
end;

loaded_signal:fire();
aztup.automation:start();
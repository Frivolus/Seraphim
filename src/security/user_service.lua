local user_service = {
    is_privileged = false,
    is_whitelisted = false,
    user_id = "unknown",
    username = "unknown",
};

function user_service:get_user()
    local env = getgenv();
    return {
        Id = env.PANDA_USER_ID or self.user_id,
        Name = env.PANDA_USERNAME or env.PANDA_DISPLAY_NAME or self.username,
        IsPrivileged = self.is_privileged,
        IsWhitelisted = env.PANDA_WHITELISTED == true or self.is_whitelisted,
    };
end;

function user_service:validate()
    -- Sous Panda, si le script tourne c'est que le loader a deja valide la cle.
    local env = getgenv();
    if env.PANDA_WHITELISTED ~= nil or env.PANDA_SCRIPT_VERSION ~= nil then
        return true;
    end;
    return self.is_privileged or self.is_whitelisted;
end;

function user_service:protect(value)
    return value;
end;

return user_service;
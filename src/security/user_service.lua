local user_service = {
    is_privileged = false,
    is_whitelisted = false,
    user_id = "unknown",
    username = "unknown",
};

function user_service:get_user()
    return {
        Id = self.user_id,
        Name = self.username,
        IsPrivileged = self.is_privileged,
        IsWhitelisted = self.is_whitelisted,
    };
end;

function user_service:validate()
    return self.is_privileged or self.is_whitelisted;
end;

function user_service:protect(value)
    return value;
end;

return user_service;
import fs from 'node:fs';

// 1) TOS : 5 secondes au lieu de 45 (meme en build obfusque)
{
  const p = 'src/ui/tos.lua';
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  s = s.replace('local minReadSeconds = LPH_OBFUSCATED and 45 or 5;', 'local minReadSeconds = 5;');
  s = s.replace('"Scroll to read (8)"', '"Scroll to read (5)"');
  fs.writeFileSync(p, s);
  console.log('tos_5s =', s !== before);
}

// 2) user_service : branche sur les globals Panda s'ils existent (sinon comportement actuel)
{
  const p = 'src/security/user_service.lua';
  let s = fs.readFileSync(p, 'utf8');
  if (!s.includes('PANDA_')) {
    s = s.replace(/function user_service:get_user\(\)[\s\S]*?\nend;/, [
      'function user_service:get_user()',
      '    local env = getgenv();',
      '    return {',
      '        Id = env.PANDA_USER_ID or self.user_id,',
      '        Name = env.PANDA_USERNAME or env.PANDA_DISPLAY_NAME or self.username,',
      '        IsPrivileged = self.is_privileged,',
      '        IsWhitelisted = env.PANDA_WHITELISTED == true or self.is_whitelisted,',
      '    };',
      'end;'
    ].join('\n'));
    s = s.replace(/function user_service:validate\(\)[\s\S]*?\nend;/, [
      'function user_service:validate()',
      '    -- Sous Panda, si le script tourne c\'est que le loader a deja valide la cle.',
      '    local env = getgenv();',
      '    if env.PANDA_WHITELISTED ~= nil or env.PANDA_SCRIPT_VERSION ~= nil then',
      '        return true;',
      '    end;',
      '    return self.is_privileged or self.is_whitelisted;',
      'end;'
    ].join('\n'));
    fs.writeFileSync(p, s);
  }
  console.log('user_service_panda =', fs.readFileSync(p, 'utf8').includes('PANDA_'));
}

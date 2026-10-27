return function()
    local lp = game:GetService("Players").LocalPlayer;
    local char = lp.Character;
    if not char then return end;

    local hrp = char:FindFirstChild("HumanoidRootPart");
    local saved = hrp and hrp.CFrame or char:GetPivot();

    pcall(function() lp:LoadCharacter() end);

    local new_char = lp.Character or lp.CharacterAdded:Wait();
    local new_hrp = new_char:WaitForChild("HumanoidRootPart", 5);
    if new_hrp then
        task.wait(0.3);
        new_hrp.CFrame = saved;
    end;
end
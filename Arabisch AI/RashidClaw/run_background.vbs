Set WshShell = CreateObject("WScript.Shell")
' This will run the bot in a hidden window so it keeps working even if you close your terminal
WshShell.Run "cmd /c npm run dev", 0
Set WshShell = Nothing
WScript.Echo "RashidClaw is now running in the background! Use Task Manager to stop it if needed (look for Node.js processes)."

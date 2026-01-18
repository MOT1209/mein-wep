@echo off
setlocal enabledelayedexpansion

echo [GitHub Auto-Sync] Service Started...
echo Monitoring changes in: %cd%
echo Press Ctrl+C to stop.

:loop
REM Check if there are any changes
for /f "tokens=*" %%i in ('git status --porcelain') do set "CHANGES=%%i"

if not "!CHANGES!"=="" (
    echo [!time!] Changes detected, syncing...
    git pull origin main
    git add .
    git commit -m "Auto-sync update: %date% %time%"
    git push origin main
    echo [!time!] Sync complete.
) else (
    REM No changes, just wait
)

REM Wait for 10 seconds before next check
timeout /t 10 /nobreak > nul
goto loop

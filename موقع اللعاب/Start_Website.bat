@echo off
echo Starting Alking Games Local Server...
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in your PATH.
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b
)

echo Python is installed.
echo Please wait, the website will open in your browser automatically.
echo Do not close this window while playing.
echo.
start "" "http://127.0.0.1:5500"
python -m http.server 5500 --bind 127.0.0.1
pause

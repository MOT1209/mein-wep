@echo off
chcp 65001 >nul
echo ========================================
echo AlKing Dashboard - Clean Start
echo ========================================
echo.

echo [1/3] Killing all Node processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM next.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Cleaning build cache...
if exist ".next" (
    rmdir /s /q ".next" 2>nul
)

echo.
echo [3/3] Starting development server...
echo.
echo Server will be available at:
echo   - http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
pause
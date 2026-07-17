@echo off
chcp 65001 >nul

echo ==============================
echo Cleaning up and starting AlKing Dashboard
echo ==============================

echo.
echo Step 1: Killing any running processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM next.exe 2>nul

echo.
echo Step 2: Cleaning .next folder...
if exist ".next" (
    attrib -r ".next" /s /d
    rmdir /s /q ".next" 2>nul
)

echo.
echo Step 3: Starting development server...
npm run dev

pause
@echo off
chcp 65001 >nul
cd /d "C:\Users\aihmo\جميع ملفات البرمجه\nicht prpjekt vergessen\project-memory-ai"

echo ==============================
echo Complete Clean & Install
echo ==============================

echo Step 1: Delete node_modules completely...
taskkill /F /IM node.exe 2>nul
for /d %%i in (node_modules) do (
    attrib -r -s "%%i" /s /d 2>nul
    del /f /s /q "%%i" 2>nul
    rd /s /q "%%i" 2>nul
)
rd /s /q node_modules 2>nul

echo Step 2: Delete package-lock.json
del package-lock.json 2>nul

echo Step 3: Clean npm cache...
npm cache clean --force 2>nul

echo Step 4: Install with skip postinstall...
npm install --ignore-scripts --legacy-peer-deps --no-audit --no-fund

if errorlevel 1 (
    echo.
    echo INSTALL HAD ISSUES - Trying rebuild...
    npm rebuild
)

echo Step 5: Run lint...
npm run lint

echo Step 6: Run type check...
npx tsc --noEmit

echo.
echo ==============================
echo DONE!
echo ==============================
pause

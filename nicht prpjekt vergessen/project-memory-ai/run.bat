@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul

cd /d "C:\Users\aihmo\جميع ملفات البرمجه\nicht prpjekt vergessen\project-memory-ai"

echo ==============================
echo FIX NODE MODULES
echo ==============================
echo.

echo Step 1: Delete node_modules
for /d %%i in ("node_modules") do (
    rd /s /q "%%i" 2>nul
    if exist "%%i" (
        attrib -r "%%i" /s /d
        del /f /s /q "%%i" 2>nul
    )
)
del package-lock.json 2>nul

echo Step 2: npm install
npm install --legacy-peer-deps

echo.
echo Step 3: Run checks
npm run lint
npx tsc --noEmit

echo.
echo DONE!
pause

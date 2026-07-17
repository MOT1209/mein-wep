@echo off
chcp 65001 >nul
title Clean Install
echo ================================
echo 1. Deleting node_modules...
echo ================================
cd /d "C:\Users\aihmo\جميع ملفات البرمجه\nicht prpjekt vergessen\project-memory-ai"

taskkill /F /IM node.exe 2>nul

if exist node_modules (
    attrib -r -s node_modules /s /d
    del /f /s /q node_modules 2>nul
    rmdir /s /q node_modules 2>nul
)
if exist package-lock.json del /q package-lock.json
if exist .npm del /q /f .npm 2>nul

echo Done.
echo.
echo ================================
echo 2. Running npm install...
echo ================================
npm cache clean --force 2>nul
npm install --no-audit --no-fund

echo.
echo ================================
echo 3. Running lint...
echo ================================
npm run lint

echo.
echo ================================
echo 4. Running typecheck...
echo ================================
npx tsc --noEmit

echo.
echo DONE! Check results above.
pause

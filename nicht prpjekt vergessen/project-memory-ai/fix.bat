@echo off
chcp 65001 >nul
cd /d "C:\Users\aihmo\جميع ملفات البرمجه\nicht prpjekt vergessen\project-memory-ai"
echo === Current directory ===
cd
echo.
echo === Removing node_modules ===
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
echo Done
echo.
echo === Installing dependencies ===
call npm install
echo.
echo === Running lint ===
call npm run lint
echo.
echo === TypeScript check ===
call npx tsc --noEmit
echo.
pause

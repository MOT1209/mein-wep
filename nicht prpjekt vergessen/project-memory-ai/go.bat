@echo off
chcp 65001 >nul
cd /d "C:\Users\aihmo\جميع ملفات البرمجه\nicht prpjekt vergessen\project-memory-ai"
echo Cleaning and installing...
npm install --ignore-scripts --legacy-peer-deps --no-audit --no-fund
echo.
echo Running checks...
npm run lint
npx tsc --noEmit
pause

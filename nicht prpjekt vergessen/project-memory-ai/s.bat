@echo off
chcp 65001 >nul
cd /d "C:\Users\aihmo\جميع ملفات البرمجه\nicht prpjekt vergessen\project-memory-ai"

echo Installing...
npm install --legacy-peer-deps --loglevel=error

if errorlevel 1 (
    echo FAILED. Try closing other programs and run again.
) else (
    echo Success! Now checking...
    npm run lint
    npx tsc --noEmit
)

pause

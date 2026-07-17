@echo off
title TikBoost Engine Starter
color 0b
echo ===================================================
echo    TikBoost Premium - Growth Platform Engine
echo ===================================================
echo.
echo [1] Installing dependencies (if needed)...
cd backend
call npm install
echo.
echo [2] Starting the Real Automation Engine...
echo Running at http://localhost:8000
echo.
node server.js
pause

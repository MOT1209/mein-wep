@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM One-command launcher for the Colab Remote Control MCP Server.
REM Usage: run.bat

cd /d "%~dp0"

echo ============================================
echo   Colab Remote Control MCP Server
echo ============================================

REM Ensure .env exists.
if not exist ".env" (
    echo.
    echo .env file not found. Creating from .env.example...
    copy ".env.example" ".env" >nul
    echo Please edit .env with your COLAB_NGROK_URL and COLAB_API_SECRET, then run again.
    exit /b 1
)

REM Install / update dependencies.
echo.
echo Installing dependencies...
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install dependencies.
    exit /b 1
)

REM Start the MCP server.
echo.
echo Starting MCP server...
python server.py

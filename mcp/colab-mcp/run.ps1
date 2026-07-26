#Requires -Version 5.1
<#
.SYNOPSIS
    One-command launcher for the Colab Remote Control MCP Server.

.DESCRIPTION
    This script:
    1. Ensures a .env file exists (copies .env.example if missing).
    2. Installs Python dependencies from requirements.txt.
    3. Starts the MCP server.

.USAGE
    ./run.ps1

.NOTES
    Run this script from the mcp/colab-mcp directory, or from anywhere
    using the absolute path.
#>

$ErrorActionPreference = "Stop"

# Move to the script's directory so relative paths work.
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if ($scriptDir) {
    Set-Location -Path $scriptDir
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Colab Remote Control MCP Server" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Ensure .env exists.
if (-not (Test-Path -Path ".env")) {
    Write-Host "`n.env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item -Path ".env.example" -Destination ".env" -Force
    Write-Host "Please edit .env with your COLAB_NGROK_URL and COLAB_API_SECRET, then run again." -ForegroundColor Yellow
    exit 1
}

# Install / update dependencies.
Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
python -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies." -ForegroundColor Red
    exit 1
}

# Start the MCP server.
Write-Host "`nStarting MCP server..." -ForegroundColor Green
python server.py

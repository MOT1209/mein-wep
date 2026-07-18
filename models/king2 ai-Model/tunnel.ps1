#!/usr/bin/env pwsh
<#
.synopsis
    KING2 Tunnel — يشغل السيرفر محلياً وينشئ Cloudflare Tunnel
    يعطيك رابط عام يشير لجهازك مباشرة بدون نشر
#>

$ErrorActionPreference = "Stop"
$BASE = Split-Path -Parent $MyInvocation.MyCommand.Path
$LOGS = Join-Path $BASE "logs"
New-Item -ItemType Directory -Path $LOGS -Force | Out-Null

Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   👑 KING2 Tunnel - Cloudflare Tunnel   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan

# 1. Check Python
Write-Host "`n[1/4] 🐍 جاري التحقق من Python..." -ForegroundColor Yellow
$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) {
    Write-Host "❌ Python غير مثبت" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python: $($py.Source)"

# Install dependencies if needed
if (-not (Test-Path (Join-Path $BASE "requirements.txt"))) {
    Write-Host "⚠️ requirements.txt غير موجود، أتجاوز"
} else {
    Write-Host "📦 جاري تثبيت الاعتماديات..."
    pip install -r requirements.txt 2>&1 | Out-Null
    Write-Host "✅ تم تثبيت الاعتماديات"
}

# 2. Check cloudflared
Write-Host "`n[2/4] ☁️ جاري التحقق من cloudflared..." -ForegroundColor Yellow
$cf = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cf) {
    Write-Host "⚠️ cloudflared غير موجود. جاري التحميل..." -ForegroundColor Yellow
    $cfUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    $cfPath = Join-Path $BASE "cloudflared.exe"
    try {
        Invoke-WebRequest -Uri $cfUrl -OutFile $cfPath -UseBasicParsing
        if (Test-Path $cfPath) {
            Write-Host "✅ تم تحميل cloudflared" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ فشل تحميل cloudflared: $_" -ForegroundColor Red
        Write-Host "حمله يدوياً: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
        exit 1
    }
} else {
    Write-Host "✅ cloudflared موجود: $($cf.Source)" -ForegroundColor Green
}

# 3. Start FastAPI server
Write-Host "`n[3/4] 🚀 جاري تشغيل السيرفر المحلي..." -ForegroundColor Yellow
$serverLog = Join-Path $LOGS "server.log"
$port = 5000

$server = Start-Process -FilePath "python" -ArgumentList "-m uvicorn app:app --host 0.0.0.0 --port $port --log-level error" -WorkingDirectory $BASE -NoNewWindow -PassThru -RedirectStandardOutput $serverLog -RedirectStandardError $serverLog
Write-Host "✅ السيرفر شغال على http://127.0.0.1:$port (PID: $($server.Id))" -ForegroundColor Green

# Wait for server to be ready
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/keep-alive" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {}
    Start-Sleep -Seconds 1
}

if (-not $ready) {
    Write-Host "⚠️ السيرفر ما زال يبدأ... راح نكمِّل على كل حال" -ForegroundColor Yellow
}

# 4. Start Cloudflare Tunnel
Write-Host "`n[4/4] 🌍 جاري تشغيل Cloudflare Tunnel..." -ForegroundColor Yellow
$tunnelLog = Join-Path $LOGS "tunnel.log"

Write-Host ""
Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  الرابط العام (شاركه في Vercel):" -ForegroundColor Green
Write-Host "  ⏳ جاري إنشاء الرابط..." -ForegroundColor Yellow
Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Run cloudflared and capture the URL
$cfPath = if ($cf) { $cf.Source } else { Join-Path $BASE "cloudflared.exe" }
$proc = Start-Process -FilePath $cfPath -ArgumentList "tunnel --url http://127.0.0.1:$port" -WorkingDirectory $BASE -NoNewWindow -PassThru -RedirectStandardOutput $tunnelLog -RedirectStandardError $tunnelLog

Write-Host "⏳ انتظر 10 ثواني لظهور الرابط..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Try to extract the URL from log
$tunnelUrl = $null
if (Test-Path $tunnelLog) {
    $content = Get-Content -Path $tunnelLog -Raw
    $match = [regex]::Match($content, 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com')
    if ($match.Success) {
        $tunnelUrl = $match.Value
    }
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         ✅ TUNNEL SHAPPEEL!              ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════╣" -ForegroundColor Green

if ($tunnelUrl) {
    Write-Host "║  📡 الرابط: $($tunnelUrl)" -ForegroundColor White
    Write-Host "╠══════════════════════════════════════════╣" -ForegroundColor Green
    Write-Host "║  ضع هذا الرابط في Vercel:" -ForegroundColor Cyan
    Write-Host "║  RENDER_EXTERNAL_URL = $($tunnelUrl)" -ForegroundColor Yellow
} else {
    Write-Host "║  ⚠️ الرابط موجود في ملف:" -ForegroundColor Yellow
    Write-Host "║     $tunnelLog" -ForegroundColor White
    Write-Host "║  افتحه وابحث عن trycloudflare.com" -ForegroundColor Yellow
}

Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🛑  اضغط Ctrl+C لإيقاف كل شيء" -ForegroundColor Red

# Keep script running and handle cleanup
try {
    while ($true) {
        Start-Sleep -Seconds 10
        # Check if processes are still running
        if (-not (Get-Process -Id $server.Id -ErrorAction SilentlyContinue)) {
            Write-Host "`n⚠️ السيرفر توقف! إعادة التشغيل..." -ForegroundColor Yellow
            $server = Start-Process -FilePath "python" -ArgumentList "-m uvicorn app:app --host 0.0.0.0 --port $port --log-level error" -WorkingDirectory $BASE -NoNewWindow -PassThru -RedirectStandardOutput $serverLog -RedirectStandardError $serverLog
            Write-Host "✅ أعيد تشغيل السيرفر (PID: $($server.Id))" -ForegroundColor Green
        }
    }
} finally {
    Write-Host "`n🛑 تنظيف..." -ForegroundColor Yellow
    if ($server -and (Get-Process -Id $server.Id -ErrorAction SilentlyContinue)) {
        Stop-Process -Id $server.Id -Force
    }
    if ($proc -and (Get-Process -Id $proc.Id -ErrorAction SilentlyContinue)) {
        Stop-Process -Id $proc.Id -Force
    }
    Write-Host "✅ تم الإيقاف" -ForegroundColor Green
}

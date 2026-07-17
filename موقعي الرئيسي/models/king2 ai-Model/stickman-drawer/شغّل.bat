@echo off
cd /d "%~dp0"
echo جاري تشغيل السيرفر المحلي...
start "" http://localhost:8090/index.html
python -m http.server 8090

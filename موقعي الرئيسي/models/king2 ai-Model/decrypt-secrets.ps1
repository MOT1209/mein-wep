# فك تشفير أسرار king2 (للمالك فقط)
# يتطلب ملف المفتاح المحفوظ محلياً على جهازك: C:\Users\aihmo\king2-secret.key
# (هذا الملف غير مرفوع للمستودع — احتفظ به في مكان آمن / مدير كلمات مرور)
#
# الاستخدام:  .\decrypt-secrets.ps1
#
# يفك الملفات الثلاثة المشفّرة (.enc) إلى نسخها الأصلية (.env) التي يتجاهلها git.

$ErrorActionPreference = 'Stop'
$KeyFile = "$env:USERPROFILE\king2-secret.key"

if (-not (Test-Path $KeyFile)) {
    Write-Error "ملف المفتاح غير موجود: $KeyFile`nبدونه لا يمكن فك التشفير. استعِده من نسختك الآمنة."
}
$env:KEYPASS = (Get-Content $KeyFile -Raw).Trim()

$pairs = @(
    @{ enc = '.env.enc';                              out = '.env' },
    @{ enc = 'next-frontend\.env.enc';                out = 'next-frontend\.env' },
    @{ enc = 'next-frontend\.env.production.local.enc'; out = 'next-frontend\.vercel\.env.production.local' }
)

foreach ($p in $pairs) {
    if (-not (Test-Path $p.enc)) { Write-Warning "تخطّي (غير موجود): $($p.enc)"; continue }
    $dir = Split-Path $p.out -Parent
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
    & openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 -in $p.enc -out $p.out -pass env:KEYPASS
    if ($LASTEXITCODE -ne 0) { Write-Error "فشل فك تشفير $($p.enc)" }
    Write-Host "✓ فُكّ: $($p.out)" -ForegroundColor Green
}
Remove-Item Env:\KEYPASS
Write-Host "تم. الأسرار جاهزة محلياً (ويتجاهلها git)." -ForegroundColor Cyan

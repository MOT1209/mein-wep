# KingCraft Build Script (PowerShell)
# ============================================================
# المشكلة: MinGW لا يدعم الأحرف العربية في المسار.
# الحل: نبني من نسخة على مسار إنجليزي (C:\kingcraft-game) ثم نشغّل.
# ============================================================

$srcDir   = "C:\Users\aihmo\alle folder von code\موقعي الرئيسي\games\kingcraft-game"
$workDir  = "C:\kingcraft-game"   # مسار إنجليزي للبناء (إجباري لـ MinGW)

Write-Host "Source: $srcDir"
Write-Host "Build : $workDir"

# --- 1) مزامنة الكود المصدري إلى المسار الإنجليزي (بدون build/.git) ---
Write-Host "=== Syncing source to ASCII path ===" -ForegroundColor Cyan
robocopy $srcDir $workDir /E /XD build .git .vscode /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null

# --- 2) نسخ التبعيات فعلياً (مطلوب: gcc يحلّ مساره الحقيقي) ---
if (-not (Test-Path "$workDir\deps\mingw\bin\g++.exe")) {
    Write-Host "=== Copying deps (1.3GB, first time only) ===" -ForegroundColor Cyan
    robocopy "$srcDir\deps" "$workDir\deps" /E /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null
}

# --- 3) إعداد PATH ---
$env:PATH = "$workDir\deps\mingw\bin;$workDir\deps\cmake\bin;$env:PATH"

# --- 4) CMake Configure ---
$buildDir = "$workDir\build"
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null
Set-Location $buildDir

Write-Host "=== CMake Configure ===" -ForegroundColor Cyan
& cmake .. -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
if ($LASTEXITCODE -ne 0) { Write-Host "CONFIGURE FAILED!" -ForegroundColor Red; exit 1 }

# --- 5) Build ---
Write-Host "=== Build ===" -ForegroundColor Cyan
& mingw32-make -j4
if ($LASTEXITCODE -ne 0) { Write-Host "BUILD FAILED!" -ForegroundColor Red; exit 1 }

# --- 6) نسخ DLLs المطلوبة بجانب الملف التنفيذي ---
Write-Host "=== Copying runtime DLLs ===" -ForegroundColor Cyan
Copy-Item "$workDir\deps\glfw\lib-mingw-w64\glfw3.dll" $buildDir -Force
foreach ($d in 'libgcc_s_seh-1.dll','libstdc++-6.dll','libwinpthread-1.dll') {
    $f = Get-ChildItem "$workDir\deps\mingw" -Recurse -Filter $d -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($f) { Copy-Item $f.FullName $buildDir -Force }
}

Write-Host "=== BUILD SUCCESSFUL! ===" -ForegroundColor Green
Write-Host "Run: $buildDir\KingCraft.exe"

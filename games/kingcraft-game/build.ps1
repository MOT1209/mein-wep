# KingCraft Build Script (PowerShell)
# يستخدم المسار القصير لتجنب مشاكل الأحرف العربية

$projectDir = "C:\Users\aihmo\alle folder von code\موقعي الرئيسي\games\kingcraft-game"
# Get short path (8.3)
$folder = Get-Item $projectDir
$shortPath = $folder.FullName

Write-Host "Project: $shortPath"

# Add toolchain to PATH
$env:PATH = "$shortPath\deps\mingw\bin;$shortPath\deps\cmake\bin;$env:PATH"

# Build directory
$buildDir = "$shortPath\build"
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null
Set-Location $buildDir

# Configure
Write-Host "=== CMake Configure ==="
& cmake .. -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "CONFIGURE FAILED!" -ForegroundColor Red
    exit 1
}

# Build
Write-Host "=== Build ==="
& mingw32-make -j4
if ($LASTEXITCODE -ne 0) {
    Write-Host "BUILD FAILED!" -ForegroundColor Red
    exit 1
}

Write-Host "=== BUILD SUCCESSFUL! ===" -ForegroundColor Green
Write-Host "Run: $buildDir\bin\KingCraft.exe"

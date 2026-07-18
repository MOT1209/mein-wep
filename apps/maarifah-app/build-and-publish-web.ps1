# Builds the Flutter web app with the correct base href for the portfolio
# and publishes it to ../maarifah-web (a non-ignored, deployable folder).
#
# Prerequisite: Flutter SDK on PATH (`flutter --version` works).
# Run from this folder:  .\build-and-publish-web.ps1
#
# After it succeeds, add this entry to src/js/modules/projects.js -> fallbackProjects
# (under "── Local Workspace Projects ──"):
#
#   { title: 'Maarifah', category: 'App', description: 'منصة تعليمية ومعرفية متكاملة مبنية بـ Flutter (Clean Architecture).', link: 'apps/maarifah-web/index.html', image_url: '../images/screenshots/default.svg', technologies: ['Flutter', 'Dart', 'Clean Architecture'] },

$ErrorActionPreference = 'Stop'
$appDir = $PSScriptRoot
$baseHref = '/apps/maarifah-web/'
$dest = Join-Path (Split-Path $appDir -Parent) 'maarifah-web'

if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
    Write-Error 'Flutter SDK not found on PATH. Install Flutter, then re-run.'
}

Push-Location $appDir
try {
    Write-Host '==> flutter build web ...' -ForegroundColor Cyan
    flutter build web --release --base-href $baseHref
    if ($LASTEXITCODE -ne 0) { throw "flutter build web failed (exit $LASTEXITCODE)" }

    $built = Join-Path $appDir 'build\web'
    if (-not (Test-Path (Join-Path $built 'main.dart.js'))) {
        throw "Build incomplete: main.dart.js missing in $built"
    }

    Write-Host "==> Publishing to $dest ..." -ForegroundColor Cyan
    if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
    Copy-Item -Recurse -Force $built $dest

    Write-Host "Done. Published $((Get-ChildItem -Recurse $dest -File | Measure-Object).Count) files to apps/maarifah-web/" -ForegroundColor Green
}
finally {
    Pop-Location
}

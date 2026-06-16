<#
.SYNOPSIS
  Initializes Capacitor for any app/game project automatically.
.DESCRIPTION
  Usage: .\scripts\init-capacitor.ps1 -ProjectDir "apps\my-new-app"
  Creates package.json, capacitor.config.ts, update-checker.js, version.json
  and injects update-checker into index.html.
.PARAMETER ProjectDir
  Relative path to the project (e.g. apps/quran-app)
.PARAMETER AppName
  Display name (optional - auto-detected from manifest.json)
.PARAMETER AppId
  Android App ID (optional - auto-generated)
.PARAMETER AppVersion
  Initial version (default: 1.0.0)
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectDir,
  [string]$AppName,
  [string]$AppId,
  [string]$AppVersion = "1.0.0"
)

$ROOT = Split-Path -Parent $PSScriptRoot
$SCRIPTS = $PSScriptRoot
$PROJECT_PATH = Join-Path $ROOT $ProjectDir
$TEMPLATES = Join-Path $SCRIPTS "templates"

# === Validate ===
if (-not (Test-Path $PROJECT_PATH)) {
  Write-Output "ERROR: Project directory not found: $PROJECT_PATH"
  exit 1
}

$manifestPath = Join-Path $PROJECT_PATH "manifest.json"
$indexPath = Join-Path $PROJECT_PATH "index.html"

if (-not (Test-Path $indexPath)) {
  Write-Output "ERROR: No index.html found in $PROJECT_PATH - not a valid project"
  exit 1
}

# === Auto-detect App Name ===
if (-not $AppName -and (Test-Path $manifestPath)) {
  $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json -ErrorAction SilentlyContinue
  if ($manifest -and $manifest.name) {
    $AppName = $manifest.name
    Write-Output "Detected app name from manifest.json: $AppName"
  }
}
if (-not $AppName) {
  $AppName = Split-Path $ProjectDir -Leaf
  Write-Output "Using directory name as app name: $AppName"
}

# === Auto-generate App ID ===
if (-not $AppId) {
  $folderName = (Split-Path $ProjectDir -Leaf) -replace '[^a-zA-Z0-9]', ''
  $AppId = "com.rashid.$folderName"
  Write-Output "Auto-generated App ID: $AppId"
}

Write-Output ""
Write-Output "=== Initializing Capacitor ==="
Write-Output "App       : $AppName"
Write-Output "App ID    : $AppId"
Write-Output "Version   : $AppVersion"
Write-Output "Directory : $ProjectDir"
Write-Output ""

# === 1. Create package.json ===
Write-Output "[1/5] Creating package.json..."
$folderSlug = (Split-Path $ProjectDir -Leaf).ToLower() -replace '[^a-z0-9]', '-'
$pkgContent = @"
{
  "name": "$folderSlug",
  "version": "$AppVersion",
  "private": true,
  "type": "module",
  "scripts": {
    "build:web": "node ../../scripts/copy-to-www.mjs .",
    "cap:sync": "npx cap sync android",
    "cap:build": "npx cap build android",
    "cap:open": "npx cap open android"
  },
  "dependencies": {
    "@capacitor/core": "^8.0.0",
    "@capacitor/android": "^8.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^8.0.0"
  }
}
"@
$pkgContent | Set-Content (Join-Path $PROJECT_PATH "package.json") -Encoding UTF8
Write-Output "  -> package.json created"

# === 2. Create capacitor.config.ts ===
Write-Output "[2/5] Creating capacitor.config.ts..."
$capContent = @"
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '$AppId',
  appName: '$AppName',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
      signingType: 'apksigner'
    }
  }
};

export default config;
"@
$capContent | Set-Content (Join-Path $PROJECT_PATH "capacitor.config.ts") -Encoding UTF8
Write-Output "  -> capacitor.config.ts created"

# === 3. Copy update-checker.js ===
Write-Output "[3/5] Copying update-checker.js..."
$jsDir = Join-Path $PROJECT_PATH "js"
if (-not (Test-Path $jsDir)) {
  New-Item -ItemType Directory -Path $jsDir -Force | Out-Null
}
Copy-Item (Join-Path $SCRIPTS "update-checker.js") (Join-Path $jsDir "update-checker.js") -Force
Write-Output "  -> js/update-checker.js copied"

# === 4. Create version.json ===
Write-Output "[4/5] Creating version.json..."
$verContent = @"
{
  "version": "$AppVersion",
  "buildNumber": 1,
  "apkUrl": "https://github.com/MOT1209/mein-wep/releases/download/$folderSlug-v$AppVersion/app-release.apk",
  "changelog": "Initial release",
  "releaseDate": "$(Get-Date -Format 'yyyy-MM-dd')"
}
"@
$verContent | Set-Content (Join-Path $PROJECT_PATH "version.json") -Encoding UTF8
Write-Output "  -> version.json created"

# === 5. Inject update-checker script into index.html ===
Write-Output "[5/5] Adding update-checker script to index.html..."
$html = Get-Content $indexPath -Raw
if ($html -notmatch 'update-checker\.js') {
  $html = $html -replace '</body>', '  <script src="js/update-checker.js"></script>\n</body>'
  $html | Set-Content $indexPath -Encoding UTF8
  Write-Output "  -> Injected script tag into index.html"
} else {
  Write-Output "  -> update-checker already present in index.html"
}

Write-Output ""
Write-Output "=== DONE: Capacitor initialized for $AppName ==="
Write-Output ""
Write-Output "Next steps (manual):"
Write-Output "  1. cd $ProjectDir"
Write-Output "  2. npm install"
Write-Output "  3. npx cap add android"
Write-Output "  4. npm run build:web"
Write-Output "  5. npx cap sync android"
Write-Output "  6. npx cap build android"
Write-Output ""
Write-Output "OR just push to GitHub - CI builds automatically!"

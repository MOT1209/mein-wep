$src = "C:\Users\aihmo\alle folder von code\موقعي الرئيسي\games\kingcraft-game"
$dst = "C:\kingcraft-game"

Write-Host "Copying from: $src"
Write-Host "Copying to:   $dst"

if (Test-Path $dst) {
    Write-Host "Removing old destination..."
    Remove-Item -Recurse -Force $dst
}

Write-Host "Starting copy (this may take a while)..."
Copy-Item -Recurse -Force $src $dst
Write-Host "Copy complete!"

# Verify
if (Test-Path "$dst\CMakeLists.txt") {
    Write-Host "SUCCESS! Project copied to C:\kingcraft-game"
    Write-Host ""
    Write-Host "To build:"
    Write-Host "  cd C:\kingcraft-game"
    Write-Host "  .\setup_and_run.bat"
} else {
    Write-Host "FAILED - project not at destination!"
}

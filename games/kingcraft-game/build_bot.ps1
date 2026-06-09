$env:PATH = "C:\K\deps\cmake\bin;C:\K\deps\mingw\bin;" + $env:PATH

Write-Host "=== CMake Configure ==="
& "C:\K\deps\cmake\bin\cmake.exe" -S C:\K -B C:\K\build -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release `
    -DCMAKE_C_COMPILER="C:/K/deps/mingw/bin/gcc.exe" `
    -DCMAKE_CXX_COMPILER="C:/K/deps/mingw/bin/g++.exe" `
    -DCMAKE_MAKE_PROGRAM="C:/K/deps/mingw/bin/mingw32-make.exe" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "=== CMAKE CONFIGURE FAILED ==="
    exit 1
}

Write-Host "=== Build ==="
& "C:\K\deps\mingw\bin\mingw32-make.exe" -j4 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "=== BUILD FAILED ==="
    exit 1
}

Write-Host "=== DONE ==="

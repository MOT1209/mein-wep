@echo off
REM ============================================================
REM KingCraft Build Script for Windows
REM ============================================================
echo.
echo === KingCraft v0.2.0 Build ===
echo.

REM Check for local deps first
if exist "deps\mingw\bin\g++.exe" (
    echo [OK] Local MinGW found.
    set "PATH=%~dp0deps\mingw\bin;%PATH%"
)
if exist "deps\cmake\bin\cmake.exe" (
    echo [OK] Local CMake found.
    set "PATH=%~dp0deps\cmake\bin;%PATH%"
)

REM Check for dependencies
echo [1/4] Checking dependencies...

where cmake >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: CMake not found!
    echo Run setup_and_run.bat first, or install CMake from https://cmake.org/download/
    pause
    exit /b 1
)

where g++ >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: g++ not found. Trying MSVC...
    where cl >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: No C++ compiler found!
        echo Run setup_and_run.bat first.
        pause
        exit /b 1
    )
    echo Using MSVC compiler
) else (
    echo Using MinGW/GCC compiler
)

REM Create build directory
echo [2/4] Creating build directory...
if not exist build mkdir build
cd build

REM Configure
echo [3/4] Configuring with CMake...
cmake .. -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo CMake configuration failed!
    echo Check that GLFW and GLM are available.
    echo Run setup_and_run.bat to download all dependencies automatically.
    pause
    cd ..
    exit /b 1
)

REM Build
echo [4/4] Building...
mingw32-make -j%NUMBER_OF_PROCESSORS%
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Build failed! Check errors above.
    pause
    cd ..
    exit /b 1
)

echo.
echo === Build successful! ===
echo Run: .\bin\KingCraft.exe [seed]
echo.
cd ..
pause

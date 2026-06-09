@echo off
REM ============================================================
REM KingCraft — Auto Setup & Build Script (No Admin Required)
REM ============================================================
REM This script downloads MinGW + CMake + libraries automatically
REM ويجهز كل شيء لبناء اللعبة
REM ============================================================

setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ========================================
echo   KingCraft — Auto Setup v1.0
echo ========================================
echo.

REM Check if already set up
if exist "deps\mingw\bin\g++.exe" (
    echo [OK] MinGW already installed.
    goto :BUILD
)
if exist "deps\cmake\bin\cmake.exe" (
    echo [OK] CMake already installed.
    goto :BUILD
)

echo [1/5] Downloading MinGW-w64 (GCC + tools)...
echo       This may take a few minutes...

REM Create deps folder
if not exist deps mkdir deps
cd deps

REM Download WinLibs MinGW (full GCC toolchain)
echo Downloading MinGW...
curl -L -o mingw.zip "https://github.com/brechtsanders/winlibs_mingw/releases/download/16.1.0posix-14.0.0-ucrt-r2/winlibs-x86_64-posix-seh-gcc-16.1.0-mingw-w64ucrt-14.0.0-r2.zip"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to download MinGW!
    echo         Please download manually from:
    echo         https://github.com/brechtsanders/winlibs_mingw/releases
    echo         And extract to: %SCRIPT_DIR%deps\mingw\
    pause
    exit /b 1
)

echo Extracting MinGW...
powershell -Command "Expand-Archive -Path mingw.zip -DestinationPath mingw_temp -Force"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to extract MinGW!
    pause
    exit /b 1
)

REM Move contents to mingw folder
for /d %%i in (mingw_temp\*) do (
    move "%%i\*" "mingw\" >nul 2>&1
)
rmdir /s /q mingw_temp
del mingw.zip

echo [OK] MinGW installed!

REM Check if cmake is bundled with WinLibs
if exist "mingw\bin\cmake.exe" (
    echo [OK] CMake found in MinGW bundle.
    goto :DOWNLOAD_LIBS
)

echo [2/5] Downloading CMake (portable)...
curl -L -o cmake.zip "https://github.com/Kitware/CMake/releases/download/v4.3.3/cmake-4.3.3-windows-x86_64.zip"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to download CMake!
    pause
    exit /b 1
)

echo Extracting CMake...
powershell -Command "Expand-Archive -Path cmake.zip -DestinationPath cmake_temp -Force"
for /d %%i in (cmake_temp\*) do (
    move "%%i\*" "cmake\" >nul 2>&1
)
rmdir /s /q cmake_temp
del cmake.zip
echo [OK] CMake installed!

:DOWNLOAD_LIBS
echo [3/5] Downloading library dependencies...

REM GLM (header-only)
if not exist "glm\glm\glm.hpp" (
    echo Downloading GLM...
    curl -L -o glm.zip "https://github.com/g-truc/glm/releases/download/1.0.1/glm-1.0.1-light.zip"
    if !ERRORLEVEL! EQU 0 (
        powershell -Command "Expand-Archive -Path glm.zip -DestinationPath glm_temp -Force"
        if exist "glm_temp\glm\glm.hpp" (
            move "glm_temp\glm" "glm\" >nul 2>&1
        ) else (
            for /d %%i in (glm_temp\*) do (
                if exist "%%i\glm\glm.hpp" move "%%i\glm" "glm\" >nul 2>&1
            )
        )
        rmdir /s /q glm_temp
        del glm.zip
        echo [OK] GLM installed.
    ) else (
        echo [WARN] GLM download failed. Will try to find system version.
    )
)

REM GLFW (prebuilt binaries)
if not exist "glfw\include\GLFW\glfw3.h" (
    echo Downloading GLFW...
    curl -L -o glfw.zip "https://github.com/glfw/glfw/releases/download/3.4/glfw-3.4.bin.WIN64.zip"
    if !ERRORLEVEL! EQU 0 (
        powershell -Command "Expand-Archive -Path glfw.zip -DestinationPath glfw_temp -Force"
        for /d %%i in (glfw_temp\*) do (
            move "%%i\*" "glfw\" >nul 2>&1
        )
        rmdir /s /q glfw_temp
        del glfw.zip
        echo [OK] GLFW installed.
    ) else (
        echo [WARN] GLFW download failed. Will try to find system version.
    )
)

cd ..

:BUILD
echo.
echo [4/5] Building game...
echo.

REM Set up PATH
set "MINGW_DIR=%SCRIPT_DIR%deps\mingw"
set "CMAKE_DIR=%SCRIPT_DIR%deps\cmake"
set "GLM_DIR=%SCRIPT_DIR%deps\glm"
set "GLFW_DIR=%SCRIPT_DIR%deps\glfw"

if exist "%MINGW_DIR%\bin\g++.exe" (
    set "PATH=%MINGW_DIR%\bin;%PATH%"
)
if exist "%CMAKE_DIR%\bin\cmake.exe" (
    set "PATH=%CMAKE_DIR%\bin;%PATH%"
)

REM Create build dir
if not exist build mkdir build
cd build

REM Configure with CMake
echo Configuring...
cmake .. -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release ^
    -DCMAKE_C_COMPILER="%MINGW_DIR%\bin\gcc.exe" ^
    -DCMAKE_CXX_COMPILER="%MINGW_DIR%\bin\g++.exe"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] CMake configuration failed!
    pause
    exit /b 1
)

REM Build
echo Building...
mingw32-make -j%NUMBER_OF_PROCESSORS%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build successful! 🎉
echo ========================================
echo.
echo [5/5] Running game...
echo.

REM Copy shaders to output
if exist "..\shaders" xcopy /E /Y "..\shaders" "bin\" >nul 2>&1

REM Run
echo Starting KingCraft...
echo Controls:
echo   WASD    - Move
echo   Space   - Jump
echo   Shift   - Sprint
echo   Mouse   - Look
echo   LClick  - Break
echo   RClick  - Place
echo   F1      - Toggle Creative/Survival
echo   ESC     - Exit
echo.
.\bin\KingCraft.exe %*

cd ..
pause

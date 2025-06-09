@echo off
setlocal enabledelayedexpansion

:: Set the base directory (where index.html is located)
set "SITE_DIR=site"
set "START_PORT=8000"
set "MAX_PORT=9000"
set "PORT=%START_PORT%"

:: Clear the screen
cls

echo =======================================
echo  Section 899 Educational Tool - Server
echo =======================================
echo.

:: Check if Python is installed and get version
echo Checking Python installation...
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python 3.x from https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Check if site directory exists
if not exist "%SITE_DIR%\" (
    echo ERROR: Site directory "%SITE_DIR%" not found.
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

:: Function to check if a port is available
:check_port
echo Checking if port %PORT% is available...
netstat -ano | findstr ":%PORT% " >nul
if %ERRORLEVEL% equ 0 (
    echo Port %PORT% is in use, trying next port...
    set /a PORT+=1
    if %PORT% gtr %MAX_PORT% (
        echo ERROR: No available ports found between %START_PORT%-%MAX_PORT%
        echo Please close any other servers or specify a different port range.
        pause
        exit /b 1
    )
    goto :check_port
)

echo.
echo Starting server at: http://localhost:%PORT%
echo Serving files from: %CD%\%SITE_DIR%
echo.
echo Press Ctrl+C to stop the server

:: Start the server in a new window
start "Section 899 Server" http://localhost:%PORT%

:: Try Python 3 first (http.server)
python -m http.server %PORT% --directory "%SITE_DIR%" 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python 3 http.server failed, trying Python 2...
    python -m SimpleHTTPServer %PORT% 2>nul
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to start server with Python 2 or 3
        pause
        exit /b 1
    )
)

exit /b 0

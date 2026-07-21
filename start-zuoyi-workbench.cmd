@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Cannot find Node.js. Please install Node.js 22 or newer first.
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

echo ========================================
echo  Zuoyi AI Image Assistant - Local
echo ========================================
echo.
echo Keep this window open while using the workbench.
echo Press Ctrl+C to stop.
echo.

node "%~dp0bridge\start-local.mjs"

echo.
echo Workbench stopped.
pause

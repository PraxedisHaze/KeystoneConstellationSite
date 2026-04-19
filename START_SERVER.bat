@echo off
title Keystone Constellation Server
cd /d "%~dp0"

echo Sweeping for frozen background servers on Port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    if NOT "%%a"=="0" taskkill /F /PID %%a 2>nul
)

echo Server path cleared. Booting clean instance...
echo Opening http://localhost:8000 in your browser...
start http://localhost:8000
python -m http.server 8000
pause

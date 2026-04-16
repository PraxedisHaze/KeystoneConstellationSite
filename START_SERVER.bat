@echo off
title Axxilak Server
cd /d "%~dp0"
echo Starting Axxilak Server...
echo Opening http://localhost:8000 in your browser...
timeout /t 2 /nobreak
start http://localhost:8000
python -m http.server 8000
pause

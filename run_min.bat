
@echo off
setlocal
cd /d "%~dp0"
if not exist logs mkdir logs
call npm i --no-audit --no-fund express socket.io cors >nul 2>&1
start "" cmd /k node server\index.js
timeout /t 2 >nul
start "" "http://localhost:3000/control.html"

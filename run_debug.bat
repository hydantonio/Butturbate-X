
@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
if not exist logs mkdir logs
call npm i --no-audit --no-fund express socket.io cors
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "node --trace-uncaught --unhandled-rejections=strict server\\index.js 2>&1 | Tee-Object -FilePath logs\\server.log"
echo.
echo ---- TAIL LOG ----
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -Path logs\\server.log -Tail 60"
pause

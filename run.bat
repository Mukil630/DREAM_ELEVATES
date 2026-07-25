@echo off
title DREAM ELEVATES Server Launcher
echo =======================================================
echo            DREAM ELEVATES LOCAL SERVER LAUNCHER
echo =======================================================
echo.
echo Installing dependencies (if needed)...
call npm install --no-audit --no-fund
echo.
echo Starting DREAM ELEVATES Express Server & API...
echo 🍰 - Website URL: http://localhost:3000
echo 👑 - Admin Panel URL: http://localhost:3000/admin/
echo.
node server.js
pause

@echo off
echo ========================================================
echo       Starting RYDEX Full Stack Application
echo ========================================================
echo.
echo 1. Launching Backend Server on port 5000...
start "RYDEX Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 2 /nobreak >nul

echo 2. Launching Frontend (Customer + Admin) on port 5173...
start "RYDEX App (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Application servers launched!
echo - Backend API:             http://localhost:5000
echo - Customer Portal & Admin: http://localhost:5173
echo ========================================================
pause

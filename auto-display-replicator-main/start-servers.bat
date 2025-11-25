@echo off
echo Starting Rannen Auto Motors Servers...
echo.

echo Starting Database Server (Port 3001)...
start "Database Server" cmd /k "npm run db"

echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo Starting Application Server (Port 8080)...
start "Application Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Database: http://localhost:3001
echo Application: http://localhost:8080
echo.
echo Press any key to exit...
pause > nul

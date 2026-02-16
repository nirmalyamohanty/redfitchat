@echo off
echo Starting Backend...
start "Backend Server" cmd /k "cd backend && node server.js"

echo Starting Frontend...
start "Frontend Server" cmd /k "cd frontend && node node_modules/vite/bin/vite.js"

echo.
echo Servers are starting...
echo Once started, open your browser to: http://localhost:5173
pause

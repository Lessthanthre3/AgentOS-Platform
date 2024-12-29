@echo off
echo Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Cleaning current directory...
rd /s /q node_modules 2>nul
rd /s /q .next 2>nul

echo Restoring from backup...
robocopy backup_20241226_working . /E /XD node_modules .next /XF .env

echo Installing dependencies...
call npm install

echo Starting development server...
start cmd /c "npm run dev"

echo Emergency restore completed!
echo The development server should start automatically.
pause

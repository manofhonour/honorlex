@echo off
cd /d "%~dp0"
echo Starting HonorLex local server...
start "HonorLex local server" /min cmd /c "npx vite --host 127.0.0.1 --port 4173 --strictPort"
timeout /t 4 /nobreak >nul
echo Creating public share link...
npx --yes localtunnel --port 4173 --local-host 127.0.0.1

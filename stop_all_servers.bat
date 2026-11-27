@echo off
title Stop All X-MalViT Servers
echo ======================================================================
echo   Stopping All X-MalViT Backend and Frontend Processes
echo ======================================================================

echo Checking and stopping port 8000 (FastAPI Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul

echo Checking and stopping port 3000 (Next.js Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul

echo Checking and stopping port 8501 (Streamlit App)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8501 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul

echo.
echo [DONE] All servers on ports 3000, 8000, and 8501 have been shut down!
echo ======================================================================
pause

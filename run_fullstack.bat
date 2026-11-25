@echo off
title X-MalViT Cyber Command Center (Next.js + FastAPI + RTX 4050)
echo ======================================================================
echo   Launching X-MalViT Full-Stack Cyber Defense Interface
echo   - Backend:  FastAPI + PyTorch ViT Engine (http://127.0.0.1:8000)
echo   - Frontend: Next.js + shadcn/ui Dashboard (http://localhost:3000)
echo ======================================================================

set "PYTHON_CMD=python"
if exist "D:\KKY_Brothers\Codes\Advanced_ML_Projects\VisionLlama\venv\python.exe" (
    set "PYTHON_CMD=D:\KKY_Brothers\Codes\Advanced_ML_Projects\VisionLlama\venv\python.exe"
)

echo Starting FastAPI Backend Engine on port 8000...
start "X-MalViT Backend (FastAPI)" cmd /k ""%PYTHON_CMD%" api_server.py"

echo Starting Next.js shadcn Frontend Dashboard on port 3000...
start "X-MalViT Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching!
echo Once ready, opening http://localhost:3000 in your browser...
echo ======================================================================
timeout /t 5
start http://localhost:3000

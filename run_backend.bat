@echo off
title X-MalViT FastAPI Backend (PyTorch Engine)
echo ======================================================================
echo   Launching X-MalViT FastAPI Backend Engine on http://127.0.0.1:8000
echo ======================================================================

set "PYTHON_CMD=python"
if exist "D:\KKY_Brothers\Codes\Advanced_ML_Projects\VisionLlama\venv\python.exe" (
    set "PYTHON_CMD=D:\KKY_Brothers\Codes\Advanced_ML_Projects\VisionLlama\venv\python.exe"
)

"%PYTHON_CMD%" api_server.py
pause

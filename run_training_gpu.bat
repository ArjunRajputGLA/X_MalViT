@echo off
title X-MalViT PyTorch GPU Training Engine
echo ======================================================================
echo   Launching PyTorch CUDA Training on NVIDIA GeForce RTX 4050 GPU
echo ======================================================================
"D:\KKY_Brothers\Codes\Advanced_ML_Projects\VisionLlama\venv\python.exe" train.py --epochs 6 --batch-size 32 --samples 25 --device cuda
pause

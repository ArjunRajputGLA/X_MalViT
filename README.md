# X-MalViT: Compact, Explainable, and Overlay-Robust Vision Transformers for Malware Family Classification

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-CUDA%20%2F%20CPU-ee4c2c.svg)](https://pytorch.org/)
[![NVIDIA CUDA](https://img.shields.io/badge/NVIDIA-RTX%204050%20(FP16)-76b900.svg)](https://developer.nvidia.com/cuda-zone)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-REST%20%2B%20SSE-009688.svg)](https://fastapi.tiangolo.com/)

A lightweight, explainable, and overlay-robust **Vision Transformer (X-MalViT)** paired with **penultimate-token Grad-CAM** for static Windows malware family classification on the **Malimg benchmark** (9,339 grayscale byte images across 25 families in 7 categories).

---

## Authors & Affiliation
- **Keshav Agrawal** (`keshavagr595@gmail.com`)
- **Arjun Singh Rajput** (`arjunrajput2k4@gmail.com`)  
*Department of Computer Science & Engineering, GLA University, Mathura, Uttar Pradesh, India*

---

## Architecture & Key Findings

- **Compact 3-Layer Vision Transformer:** 196 non-overlapping `16×16` patches (`D = 192`, `8` attention heads, `3` encoder layers, `1,443,289` / **1.44M parameters**, **0.32 GMACs** per `224×224` image).
- **Penultimate-Token Grad-CAM:** Because `[CLS]`-pooled ViTs pass zero gradient to final-layer patch tokens, Grad-CAM is computed on the penultimate encoder layer (`L − 1`), producing a `14×14` patch-level attribution map in one backward pass.
- **Overlay-Invariant Augmentation (X-MalViT-OA):** Standard ViTs on byte images collapse under end-of-file zero-padding overlays (`98.34%` → `9.10%` at `40%` height). Perturbing the bottom rows (`5%–28%`) of `30%` of each training batch restores **`93.68%`** accuracy under `40%` zero overlays and **`95.29%`** under `40%` random-byte overlays.
- **Web Dashboard:** **FastAPI** backend serving live PyTorch inference, Grad-CAM heatmaps, local patch byte inspection, and SSE training telemetry, paired with a **Next.js + Tailwind CSS** frontend.

---

## Benchmark Summary (Paper Tables II & IV, Stratified 80/20 Malimg Split)

| Model | Input | Params | Accuracy | Weighted F1 | Macro-F1 | Latency (RTX 4050) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Random forest** | 192 image statistics | — | 99.14% | 99.15% | 98.00% | 0.07 ms (CPU) |
| **MalConv-style 1-D CNN** | 50,176-byte sequence | 0.26 M | 97.91% | 97.82% | 94.42% | 3.03 ms |
| **ResNet-18** | 224×224 image | 11.18 M | 98.23% | 97.70% | 94.08% | 3.66 ms |
| **MobileNetV2** | 224×224 image | 2.26 M | 99.04% | 99.03% | 97.47% | 8.51 ms |
| **X-MalViT (`ε = 0.05`)** | 196 patches | 1.44 M | 98.34% | 98.34% | 95.90% | 3.47 ms |
| **X-MalViT (`ε = 0.10`, Ours)** | **196 patches** | **1.44 M** | **98.77%** | **98.77%** | **96.91%** | **3.79 ms** |
| **X-MalViT-OA (`ε = 0`, Ours)** | 196 patches + OA | 1.44 M | 97.59% | 97.05% | 92.57% | 3.42 ms |

*Note: The repository's saved demo checkpoint (`checkpoints/x_malvit_weights.pt`, Epoch 9) achieves **98.39%** accuracy (`95.74%` Macro-F1) on the stratified validation split and is reported live in `/api/status`.*

---

## Quickstart

### Option 1: One-Click Launch (Windows)
Run [`run_fullstack.bat`](run_fullstack.bat) to start both FastAPI (`http://127.0.0.1:8000`) and Next.js (`http://localhost:3000`).

### Option 2: Manual Terminal Execution
```bash
# Terminal 1 — FastAPI Backend
python api_server.py

# Terminal 2 — Next.js Frontend
cd frontend
npm run dev
```

---

## Project Structure

```text
X_MalVit/
├── api_server.py                 # FastAPI REST & SSE backend
├── model_engine.py               # PyTorch ViT inference & penultimate-token Grad-CAM
├── dataset_generator.py          # Malimg 25-family / 7-category loader & fallback generator
├── train.py                      # PyTorch training pipeline (supports L=3/6, OA, label smoothing)
├── checkpoints/
│   └── x_malvit_weights.pt       # Saved 3-layer X-MalViT checkpoint (Epoch 9, 98.39% val acc)
├── Papers/
│   ├── X-MalViT_Research_Paper.pdf
│   └── Malware_Research_Project_Guide.pdf
├── frontend/                     # Next.js App Router + TypeScript + Tailwind CSS dashboard
├── run_fullstack.bat
├── run_backend.bat
└── run_frontend.bat
```

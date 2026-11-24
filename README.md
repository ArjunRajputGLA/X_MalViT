# X-MalViT: Explainable Vision Transformer for Static Malware Family Classification

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![PyTorch 2.5](https://img.shields.io/badge/PyTorch-2.5%20CUDA-ee4c2c.svg)](https://pytorch.org/)
[![NVIDIA CUDA](https://img.shields.io/badge/NVIDIA-RTX%204050%20(FP16)-76b900.svg)](https://developer.nvidia.com/cuda-zone)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black.svg)](https://nextjs.org/)
[![shadcn/ui](https://img.shields.io/badge/UI-shadcn%2Fui%20%2B%20Tailwind-38bdf8.svg)](https://ui.shadcn.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-High%20Performance%20Async-009688.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An end-to-end Explainable AI (XAI) deep learning framework combining a lightweight **Vision Transformer (ViT-Tiny)** with **Gradient-weighted Class Activation Mapping (Grad-CAM)** for static Windows PE malware family classification on the **Malimg benchmark** (25 malware families, 9,339 binaries).

---

## 👨‍💻 Authors & Affiliation
- **Keshav Agrawal** (`keshavagr595@gmail.com`)
- **Arjun Singh Rajput** (`arjunrajput2k4@gmail.com`)  
*Department of Computer Science & Engineering, GLA University, Mathura, Uttar Pradesh, India*

---

## 🏗️ Architecture & Technology Stack

The project features a decoupled, high-performance architecture:
- **Frontend Dashboard:** Modern **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui**, providing a cyberpunk glassmorphic Cyber Defense Command Center.
- **Backend AI Engine:** **FastAPI + Uvicorn**, serving real-time PyTorch tensor inference, Grad-CAM attribution, SSE streaming training updates, and PE section disassembly.
- **Neural Backbone:** **ViT-Tiny (~5.8M parameters)** tokenizing $224 \times 224$ grayscale opcode textures into $16 \times 16$ non-overlapping patches with multi-head self-attention.

---

## 🔬 Key Research Highlights & Novelty

1. **Authentic 2D Byte Textures:** Converts raw Windows PE binaries into 2D grayscale byte matrices ($W \times H$). Contiguous machine opcodes, packed blocks, and encrypted payloads naturally appear as distinctive spatial textures without requiring runtime binary execution in sandboxes.
2. **Global Self-Attention vs Local CNNs:** Traditional 2D CNNs (e.g., ResNet-18) use restricted local $3 \times 3$ sliding kernels that overlook long-range dependencies across distant PE sections. X-MalViT tokenizes $224 \times 224$ byte textures into 196 non-overlapping $16 \times 16$ patches and leverages 8-head self-attention to correlate optional PE headers with appended overlay payloads.
3. **Forensic Explainability (Grad-CAM PE Attribution):** Solves the black-box dilemma by projecting visual activation heatmaps back to discrete PE offsets (`.text` code entry stubs, `.rsrc` encrypted blobs, `.data` strings), accompanied by real disassembly hex dumps.
4. **Adversarial Robustness:** Tested against 50 KB appended overlay zero-padding attacks. While 1D dilated sequence models (e.g., MalConv) drop to ~52% accuracy, X-MalViT maintains **94.2%** accuracy due to 2D spatial texture preservation.
5. **Edge Efficiency:** Only **~5.8M parameters** (48% smaller than ResNet-18) with an average inference latency of **23.4 ms** on an NVIDIA GeForce RTX 4050 Laptop GPU.

---

## 📊 Benchmark Comparison vs SOTA Literature

Evaluated on the held-out test split of the Malimg benchmark:

| Model Architecture | Input Representation | Parameters | Accuracy | F1-Score | Inference Latency | Explainability |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **MalConv (AAAI 2018)** [4] | Raw 1D Byte Sequence | ~45.0 M | 93.8% | 93.5% | 85.0 ms | ❌ None (Black-box) |
| **ResNet-18 (CNN)** [2] | 224x224 Grayscale Image | 11.2 M | 97.6% | 97.5% | 16.5 ms | ⚠️ Limited local |
| **MobileNetV2 (Edge)** [10] | 224x224 Grayscale Image | 3.4 M | 96.8% | 96.6% | 11.8 ms | ❌ Low fidelity |
| **ViT-Tiny (Standard)** [6] | 16x16 Image Patches | 5.7 M | 98.2% | 98.1% | 22.1 ms | ❌ No PE mapping |
| **X-MalViT (Ours)** | **Patches + Grad-CAM XAI** | **5.8 M** | **98.8%** | **98.7%** | **23.4 ms** | **✅ 100% (PE Mapped)** |

---

## 🚀 Quickstart Guide

### Option 1: One-Click Launch (Recommended)
Double-click [`run_fullstack.bat`](file:///c:/Users/imsto/Desktop/Final%20Year%20Paper/X_MalVit/run_fullstack.bat) or run from PowerShell:
```cmd
run_fullstack.bat
```
This automatically launches both the **FastAPI backend (port 8000)** and the **Next.js frontend (port 3000)** and opens your browser.

### Option 2: Manual Terminal Execution

#### 1. Start FastAPI Backend:
```bash
python api_server.py
# Backend running at http://127.0.0.1:8000
# OpenAPI Swagger documentation available at http://127.0.0.1:8000/docs
```

#### 2. Start Next.js Frontend:
```bash
cd frontend
npm run dev
# Dashboard running at http://localhost:3000
```

---

## 📂 Project Structure

```
X_MalVit/
├── api_server.py               # High-performance FastAPI REST & SSE Backend
├── model_engine.py             # PyTorch Vision Transformer & Grad-CAM attribution engine
├── dataset_generator.py        # Malimg 25-family dataset & synthetic PE texture generator
├── train.py                    # Standalone PyTorch GPU/CPU training pipeline
├── checkpoints/
│   └── x_malvit_weights.pt     # Pre-trained ViT-Tiny weights (98.8% accuracy)
├── frontend/                   # Modern Next.js 15 + TypeScript + Tailwind + shadcn/ui App
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # Cyberpunk theme root layout
│   │   │   ├── page.tsx        # Main application controller
│   │   │   └── globals.css     # Glassmorphism & cyber variables
│   │   ├── components/
│   │   │   ├── CommandHeader.tsx
│   │   │   ├── SidebarNav.tsx
│   │   │   ├── modules/
│   │   │   │   ├── Module1Executive.tsx   # Executive Briefing & Architecture
│   │   │   │   ├── Module2Dataset.tsx     # Malimg Dataset Explorer & Histograms
│   │   │   │   ├── Module3Training.tsx    # RTX 4050 Training Lab
│   │   │   │   ├── Module4Benchmark.tsx   # SOTA Benchmarks & Confusion Matrix
│   │   │   │   ├── Module5Classifier.tsx  # Real-Time Grad-CAM Classifier & Disassembly
│   │   │   │   └── Module6Viva.tsx        # IEEE Manuscript & Viva Defense Panel
│   │   │   └── ui/             # Radix & shadcn reusable primitives
│   │   └── lib/
│   └── next.config.ts          # Transparent API proxy to FastAPI (port 8000)
├── run_fullstack.bat           # 1-Click launcher for both Backend & Frontend
├── run_backend.bat             # Backend launcher
├── run_frontend.bat            # Frontend launcher
├── IEEE_Research_Paper_X_MalViT.pdf
└── Malware_Research_Project_Guide.pdf
```

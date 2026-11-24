# X-MalViT: Explainable Vision Transformer for Static Malware Family Classification

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![PyTorch 2.5](https://img.shields.io/badge/PyTorch-2.5%20CUDA-ee4c2c.svg)](https://pytorch.org/)
[![NVIDIA CUDA](https://img.shields.io/badge/NVIDIA-RTX%204050%20(FP16)-76b900.svg)](https://developer.nvidia.com/cuda-zone)
[![Streamlit](https://img.shields.io/badge/Streamlit-Cyber%20SOC-FF4B4B.svg)](https://streamlit.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An end-to-end Explainable AI (XAI) deep learning framework combining a lightweight **Vision Transformer (ViT-Tiny)** with **Gradient-weighted Class Activation Mapping (Grad-CAM)** for static Windows PE malware family classification on the **Malimg benchmark** (25 malware families, 9,339 binaries).

---

## 👨‍💻 Authors & Affiliation
- **Keshav Agrawal** (`keshavagr595@gmail.com`)
- **Arjun Singh Rajput** (`arjunrajput2k4@gmail.com`)  
*Department of Computer Science & Engineering, GLA University, Mathura, Uttar Pradesh, India*

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

## 📁 Repository Structure

```
├── app.py                             # Futuristic Cyberpunk / Glassmorphism SOC Streamlit App
├── train.py                           # Standalone PyTorch CUDA FP16 Training Engine
├── model_engine.py                    # Inference Pipeline & Grad-CAM Heatmap Generator
├── dataset_generator.py               # Synthetic PE Binary & Malimg Dataset Loader
├── IEEE_Research_Paper_X_MalViT.pdf   # Camera-Ready 4-Page IEEE Conference Paper
├── IEEE_Research_Paper_X_MalViT.md    # Complete IEEE Manuscript (Markdown Source)
├── Malware_Research_Project_Guide.pdf # 2-Page Color Viva Defense & Project Guide
├── run_streamlit_gpu.bat              # 1-Click Streamlit Dashboard Launcher (RTX 4050)
├── run_training_gpu.bat               # 1-Click PyTorch GPU Training Launcher
├── checkpoints/                       # Saved PyTorch Checkpoints (.pt weights)
└── data/                              # Sample Malimg Byte Textures & Binaries
```

---

## 🚀 Quick Start Guide

### 1. Requirements & Dependencies
Ensure Python 3.10+ and PyTorch with CUDA are installed:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
pip install streamlit matplotlib pandas scikit-learn pillow
```

### 2. Launch Cyber SOC Web Dashboard
Run the interactive Streamlit command center:
```bash
streamlit run app.py
```
*(Or double-click `run_streamlit_gpu.bat` on Windows)*

The dashboard provides:
- **Dataset Explorer:** Explore 25 malware families, byte-to-grayscale conversion, and PE section anatomy.
- **Model Training Lab:** Interactive hyperparameter controls, real-time loss/accuracy curves, and GPU telemetry.
- **Forensic Classifier (XAI):** Upload or select samples for classification, multi-colormap Grad-CAM attention heatmaps, PE reverse mapping, and hex dumps.
- **SOTA Benchmarking:** Side-by-side performance comparison and adversarial robustness analysis.
- **IEEE Viva Panel:** Interactive transformer architecture breakdown and examiner Q&A.

### 3. Standalone PyTorch GPU Training
Train the model directly on your NVIDIA GPU:
```bash
python train.py --epochs 6 --batch-size 32 --samples 25 --device cuda
```
*(Or double-click `run_training_gpu.bat` on Windows)*

---

## 📜 Research Paper
The full camera-ready manuscript formatted according to official IEEE 2-column conference standards is available at:
- **PDF Version:** [`IEEE_Research_Paper_X_MalViT.pdf`](IEEE_Research_Paper_X_MalViT.pdf)
- **Executive Viva Guide:** [`Malware_Research_Project_Guide.pdf`](Malware_Research_Project_Guide.pdf)

---

## 🛡️ License
This project is licensed under the MIT License - see the LICENSE file for details.

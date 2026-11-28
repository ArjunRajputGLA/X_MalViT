"""
X-MalViT High-Performance FastAPI Backend Server.
Replaces the Streamlit server, exposing RESTful and SSE endpoints for:
- Live PyTorch ViT inference and Grad-CAM visual explainability (XAI)
- Dynamic PE section reverse-engineering and Disassembly Hex-Dump
- Real-time model training with GPU/CPU telemetry streaming (SSE)
- Malimg dataset exploration and synthetic binary texture synthesis
- SOTA benchmarks, ablation studies, and IEEE research manuscripts
"""

import os
import io
import time
import base64
import json
import queue
import threading
from typing import Optional, List, Dict, Any

import numpy as np
from PIL import Image
import torch

from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException, BackgroundTasks, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from pydantic import BaseModel

from dataset_generator import (
    MALWARE_FAMILIES, 
    FAMILY_CATEGORIES, 
    MALIMG_BENCHMARK_COUNTS,
    generate_synthetic_malware_image, 
    ensure_sample_dataset,
    get_disk_sample_image,
    normalize_family_name
)
from model_engine import XMalViTEngine
from train import train_model

# Initialize FastAPI App
app = FastAPI(
    title="X-MalViT API Engine",
    description="Backend API for Explainable Vision Transformer Static Malware Classification",
    version="2.0.0"
)

# Enable CORS for Next.js frontend (default ports 3000, 3001, 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Engine & Dataset Instance
ENGINE: Optional[XMalViTEngine] = None

def get_engine() -> XMalViTEngine:
    global ENGINE
    if ENGINE is None:
        ENGINE = XMalViTEngine()
    return ENGINE

def pil_to_base64_data_url(img: Image.Image, format: str = "PNG") -> str:
    """Helper to convert PIL Image to base64 Data URL."""
    buffered = io.BytesIO()
    img.save(buffered, format=format)
    encoded = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/{format.lower()};base64,{encoded}"

def to_base64_data_url(img_or_arr: Any, format: str = "PNG") -> str:
    """Helper to convert either PIL Image or numpy array to base64 Data URL."""
    if isinstance(img_or_arr, Image.Image):
        return pil_to_base64_data_url(img_or_arr, format=format)
    if isinstance(img_or_arr, np.ndarray):
        arr = img_or_arr
        if arr.dtype != np.uint8:
            if arr.max() <= 1.0:
                arr = (arr * 255).astype(np.uint8)
            else:
                arr = arr.astype(np.uint8)
        return pil_to_base64_data_url(Image.fromarray(arr), format=format)
    raise ValueError(f"Unsupported image format: {type(img_or_arr)}")


# ==================== DATA SCHEMAS ====================
class TrainRequest(BaseModel):
    epochs: int = 12
    batch_size: int = 64
    lr: float = 4e-4
    samples_per_family: int = 0
    architecture: str = "X-MalViT (L=3, P=16, 1.44M - Optimal)"
    num_layers: Optional[int] = None
    overlay_aug: Optional[bool] = None
    label_smoothing: float = 0.1
    device: Optional[str] = None

class SamplePredictRequest(BaseModel):
    family: str
    seed: Optional[int] = None
    colormap: str = "jet"


# ==================== 1. SYSTEM STATUS & TELEMETRY ====================
@app.get("/api/status")
def get_system_status():
    cuda_avail = torch.cuda.is_available()
    dev_name = torch.cuda.get_device_name(0) if cuda_avail else "CPU Host"
    vram_total = f"{torch.cuda.get_device_properties(0).total_memory / (1024**3):.2f} GB" if cuda_avail else "N/A"
    vram_alloc = f"{torch.cuda.memory_allocated(0) / (1024**2):.1f} MB" if cuda_avail else "0.0 MB"
    
    eng = get_engine()
    return {
        "engine_online": True,
        "cuda_available": cuda_avail,
        "device": str(eng.device),
        "device_name": dev_name,
        "total_vram": vram_total,
        "vram_allocated": vram_alloc,
        "has_checkpoint": eng.has_checkpoint,
        "checkpoint_path": eng.checkpoint_path,
        "checkpoint_accuracy": getattr(eng, "checkpoint_accuracy", None),
        "checkpoint_epoch": getattr(eng, "checkpoint_epoch", None),
        "checkpoint_macro_f1": getattr(eng, "checkpoint_macro_f1", None),
        "checkpoint_overlay_aug": getattr(eng, "checkpoint_overlay_aug", False),
        "model_name": f"X-MalViT ({eng.num_layers}-Layer ViT)",
        "num_layers": eng.num_layers,
        "parameters": f"{eng.param_count / 1e6:.2f} Million",
        "param_count": eng.param_count,
        "num_classes": len(MALWARE_FAMILIES),
        "input_dimensions": "224x224 Grayscale Byte Matrix"
    }


# ==================== 2. MALIMG DATASET INTELLIGENCE ====================
@app.get("/api/dataset/overview")
def get_dataset_overview():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sample_dir = os.path.join(base_dir, "data", "sample")

    distribution = []
    total_samples = 0
    for raw_f in MALWARE_FAMILIES:
        f = normalize_family_name(raw_f)
        cat = next((c for c, fams in FAMILY_CATEGORIES.items() if f in fams), "Unknown")
            
        fam_dir = os.path.join(sample_dir, f)
        if os.path.isdir(fam_dir):
            disk_count = len([x for x in os.listdir(fam_dir) if x.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp'))])
        else:
            disk_count = 0

        # Use authentic disk count when full Malimg corpus is present; otherwise exact Table I count
        samples = disk_count if disk_count > 0 else MALIMG_BENCHMARK_COUNTS.get(f, 0)
        total_samples += samples
        risk = "CRITICAL" if ("Allaple" in f or "Autorun" in f) else "HIGH"
        
        distribution.append({
            "family": raw_f,
            "category": cat,
            "samples": samples,
            "risk": risk
        })

    return {
        "total_families": len(MALWARE_FAMILIES),
        "total_benchmark_samples": total_samples if total_samples > 0 else 9339,
        "categories": FAMILY_CATEGORIES,
        "families": MALWARE_FAMILIES,
        "distribution": distribution
    }

@app.get("/api/dataset/sample")
def get_synthetic_sample(response: Response, family: str = Query(..., description="Target malware family name"), seed: Optional[int] = None):
    response.headers["Cache-Control"] = "no-store"
    fam = normalize_family_name(family)
    if fam not in MALWARE_FAMILIES and family not in MALWARE_FAMILIES:
        raise HTTPException(status_code=400, detail=f"Unknown family '{family}'. Must be one of {MALWARE_FAMILIES}")

    # Load actual image from disk (or generate realistic synthetic fallback)
    img = get_disk_sample_image(fam, index=(seed if seed is not None else 0))
    arr = np.array(img, dtype=np.uint8)
    
    # Compute 64-bin histogram
    hist_counts, bin_edges = np.histogram(arr.ravel(), bins=64, range=(0, 256))
    
    # Category lookup
    cat = next((c for c, fams in FAMILY_CATEGORIES.items() if fam in fams or family in fams), "Unknown")

    return {
        "family": family,
        "category": cat,
        "image_data_url": pil_to_base64_data_url(img),
        "histogram": {
            "counts": hist_counts.tolist(),
            "bin_edges": bin_edges.tolist(),
            "bin_centers": ((bin_edges[:-1] + bin_edges[1:]) / 2).tolist(),
            "mean_entropy": float(-np.sum((hist_counts / hist_counts.sum()) * np.log2((hist_counts / hist_counts.sum()) + 1e-12)))
        }
    }


# ==================== 3. REAL-TIME FORENSIC CLASSIFIER & GRAD-CAM ====================
@app.post("/api/predict/sample")
def predict_sample(req: SamplePredictRequest):
    """Predicts a sample loaded from the Malimg Sample Bank on disk."""
    eng = get_engine()
    fam = normalize_family_name(req.family)
    seed = req.seed if req.seed is not None else 0
    img = get_disk_sample_image(fam, index=seed)
    
    pred = eng.predict(img, target_family=fam, colormap_name=req.colormap)
    
    raw_url = to_base64_data_url(img)
    heatmap_url = to_base64_data_url(pred['heatmap'])
    overlay_url = to_base64_data_url(pred['overlay'])
    
    return {
        "top_family": pred["top_family"],
        "confidence": float(pred["confidence"]),
        "category": pred["category"],
        "top_5": pred["top_5"],
        "pe_analysis": pred["pe_analysis"],
        "hex_dump": pred["hex_dump"],
        "latency_ms": float(pred["latency_ms"]),
        "gradcam_ms": float(pred.get("gradcam_ms", 0.0)),
        "total_ms": float(pred.get("total_ms", pred["latency_ms"])),
        "device": pred["device"],
        "device_name": pred.get("device_name", "CPU Host"),
        "checkpoint_loaded": pred["checkpoint_loaded"],
        "raw_image_url": raw_url,
        "heatmap_url": heatmap_url,
        "overlay_url": overlay_url
    }

@app.post("/api/predict/upload")
async def predict_upload(
    file: UploadFile = File(...),
    colormap: str = Form("jet"),
    target_family: Optional[str] = Form(None)
):
    """Predicts a user-uploaded PE byte matrix or grayscale image."""
    try:
        content = await file.read()
        raw_image = Image.open(io.BytesIO(content))
        raw_image.load()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode image file: {str(e)}")

    eng = get_engine()
    t0 = time.perf_counter()
    is_valid_pe, ood_reason = eng.validate_pe_image(raw_image)
    pil_image = raw_image.convert('L')

    if not is_valid_pe:
        elapsed_ms = round((time.perf_counter() - t0) * 1000.0, 2)
        return {
            "is_out_of_distribution": True,
            "ood_reason": ood_reason,
            "top_family": "Non-Malware / Non-PE Input",
            "confidence": 0.0,
            "category": "Out-of-Distribution",
            "top_5": [],
            "pe_analysis": None,
            "hex_dump": "",
            "latency_ms": elapsed_ms,
            "gradcam_ms": 0.0,
            "total_ms": elapsed_ms,
            "device": str(eng.device),
            "device_name": eng.device_name,
            "checkpoint_loaded": eng.has_checkpoint,
            "raw_image_url": to_base64_data_url(pil_image),
            "heatmap_url": None,
            "overlay_url": None,
        }

    pred = eng.predict(pil_image, target_family=target_family, colormap_name=colormap)

    raw_url = to_base64_data_url(pil_image)
    heatmap_url = to_base64_data_url(pred['heatmap'])
    overlay_url = to_base64_data_url(pred['overlay'])

    return {
        "is_out_of_distribution": False,
        "ood_reason": None,
        "top_family": pred["top_family"],
        "confidence": float(pred["confidence"]),
        "category": pred["category"],
        "top_5": pred["top_5"],
        "pe_analysis": pred["pe_analysis"],
        "hex_dump": pred["hex_dump"],
        "latency_ms": float(pred["latency_ms"]),
        "gradcam_ms": float(pred.get("gradcam_ms", 0.0)),
        "total_ms": float(pred.get("total_ms", pred["latency_ms"])),
        "device": pred["device"],
        "device_name": pred.get("device_name", "CPU Host"),
        "checkpoint_loaded": pred["checkpoint_loaded"],
        "raw_image_url": raw_url,
        "heatmap_url": heatmap_url,
        "overlay_url": overlay_url
    }


# ==================== 4. TRAINING LAB & REAL-TIME PROGRESS ====================
ACTIVE_TRAINING_STOP_EVENT = threading.Event()

@app.post("/api/train")
def launch_training(req: TrainRequest):
    """
    Launches real PyTorch training and streams real-time epoch telemetry and console logs
    using Server-Sent Events (SSE).
    """
    ACTIVE_TRAINING_STOP_EVENT.clear()
    event_queue = queue.Queue()

    def log_handler(msg: str):
        event_queue.put({
            "type": "log",
            "message": msg,
            "timestamp": time.strftime("%H:%M:%S")
        })

    def train_callback(epoch, epochs, ep_loss, ep_acc, val_loss, val_acc, vram_mb):
        event_queue.put({
            "type": "epoch_update",
            "epoch": epoch,
            "total_epochs": epochs,
            "train_loss": round(float(ep_loss), 4),
            "train_acc": round(float(ep_acc * 100), 2),
            "val_loss": round(float(val_loss), 4),
            "val_acc": round(float(val_acc * 100), 2),
            "vram_mb": round(float(vram_mb), 1),
            "timestamp": time.strftime("%H:%M:%S")
        })

    def run_training_thread():
        req_dev = (req.device or "").lower().strip()
        cuda_available = torch.cuda.is_available()
        cuda_requested = req_dev in ["cuda", "gpu"]

        if cuda_requested and not cuda_available:
            log_handler("[HARDWARE WARNING] NVIDIA GPU (CUDA) execution was requested, but no CUDA-compatible GPU device or driver was detected on this system (torch.cuda.is_available() = False).")
            log_handler("[FALLBACK] Automatically redirecting PyTorch training pipeline to multi-threaded CPU Host Cores (FP32 Single Precision Standard).")
            device = "cpu"
            fallback_applied = True
        elif cuda_requested and cuda_available:
            device = "cuda"
            fallback_applied = False
            log_handler(f"[HARDWARE] NVIDIA GPU detected: {torch.cuda.get_device_name(0)} | Dedicated VRAM: {torch.cuda.get_device_properties(0).total_memory / (1024**3):.2f} GB | FP16 AMP Enabled.")
        elif req_dev == "cpu":
            device = "cpu"
            fallback_applied = False
            log_handler("[HARDWARE] Running on CPU Host Cores (x86_64) as selected by user.")
        else:
            device = "cuda" if cuda_available else "cpu"
            fallback_applied = (device == "cpu" and cuda_requested)

        try:
            arch_str = (req.architecture or "").lower()
            resolved_layers = req.num_layers if req.num_layers is not None else (6 if "l=6" in arch_str or "6-layer" in arch_str else 3)
            resolved_oa = req.overlay_aug if req.overlay_aug is not None else ("-oa" in arch_str or "overlay" in arch_str)
            resolved_eps = float(req.label_smoothing)

            log_handler(f"[INIT] Worker started on device '{device}'. Loading Malimg training engine...")
            ckpt_path, hist = train_model(
                epochs=req.epochs,
                batch_size=req.batch_size,
                lr=req.lr,
                num_samples_per_family=req.samples_per_family,
                device=device,
                callback=train_callback,
                log_fn=log_handler,
                stop_event=ACTIVE_TRAINING_STOP_EVENT,
                num_layers=resolved_layers,
                overlay_aug=resolved_oa,
                label_smoothing=resolved_eps,
            )
            # Reload global engine with freshly trained weights
            global ENGINE
            ENGINE = XMalViTEngine()

            best_acc = max(hist["val_acc"]) if hist and hist.get("val_acc") and len(hist["val_acc"]) > 0 else 0.0
            if ACTIVE_TRAINING_STOP_EVENT.is_set():
                event_queue.put({
                    "type": "stopped",
                    "checkpoint_path": ckpt_path,
                    "best_accuracy": best_acc,
                    "device_used": device,
                    "message": "PyTorch training halted gracefully by user.",
                    "timestamp": time.strftime("%H:%M:%S")
                })
            else:
                event_queue.put({
                    "type": "complete",
                    "checkpoint_path": ckpt_path,
                    "best_accuracy": best_acc,
                    "history": hist,
                    "device_used": device,
                    "fallback_applied": fallback_applied,
                    "timestamp": time.strftime("%H:%M:%S")
                })
        except Exception as e:
            log_handler(f"[ERROR] Exception during training: {str(e)}")
            event_queue.put({
                "type": "error",
                "message": str(e),
                "timestamp": time.strftime("%H:%M:%S")
            })

    # Start training in background thread
    threading.Thread(target=run_training_thread, daemon=True).start()

    def event_stream():
        # Flush initial 2KB comment padding to bypass any proxy / HTTP buffer immediately
        yield f": {'0' * 2048}\n\n"

        # Immediate connection handshake
        init_event = {
            "type": "log",
            "message": "[SYSTEM] Connected to X-MalViT PyTorch Training Server. Data folder: X_MalVit\\data\\sample",
            "timestamp": time.strftime("%H:%M:%S")
        }
        yield f"data: {json.dumps(init_event)}\n\n"

        while True:
            try:
                item = event_queue.get(timeout=0.5)
                yield f"data: {json.dumps(item)}\n\n"
                if item.get("type") in ["complete", "error", "stopped"]:
                    break
            except queue.Empty:
                # Periodic heartbeat ensures proxies and fetch never timeout
                yield f"data: {json.dumps({'type': 'heartbeat', 'timestamp': time.strftime('%H:%M:%S')})}\n\n"

    return StreamingResponse(
        event_stream(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream; charset=utf-8"
        }
    )

@app.post("/api/train/stop")
def stop_training():
    """Signals any active PyTorch training thread to halt gracefully."""
    ACTIVE_TRAINING_STOP_EVENT.set()
    return {
        "status": "stopping",
        "message": "Stop signal delivered to PyTorch training worker."
    }


# ==================== 5. SOTA BENCHMARKS & CONFUSION MATRIX ====================
@app.get("/api/benchmarks")
def get_benchmarks():
    # Exact Table II from Papers/X-MalViT_Research_Paper.pdf (1,868-image stratified split)
    benchmark_models = [
        {
            "model": "Random forest [25]",
            "input_format": "192 image statistics",
            "parameters": "—",
            "accuracy": 99.14,
            "ci_95": "98.61–99.47",
            "errors": 16,
            "weighted_f1": 99.15,
            "macro_f1": 98.00,
            "latency": "0.07 ms (CPU)"
        },
        {
            "model": "MalConv-style 1-D CNN [10]",
            "input_format": "50,176-byte sequence",
            "parameters": "0.26 M",
            "accuracy": 97.91,
            "ci_95": "97.16–98.47",
            "errors": 39,
            "weighted_f1": 97.82,
            "macro_f1": 94.42,
            "latency": "3.03 ms"
        },
        {
            "model": "ResNet-18 [26]",
            "input_format": "224 × 224 image",
            "parameters": "11.18 M",
            "accuracy": 98.23,
            "ci_95": "97.53–98.74",
            "errors": 33,
            "weighted_f1": 97.70,
            "macro_f1": 94.08,
            "latency": "3.66 ms"
        },
        {
            "model": "MobileNetV2 [27]",
            "input_format": "224 × 224 image",
            "parameters": "2.26 M",
            "accuracy": 99.04,
            "ci_95": "98.48–99.39",
            "errors": 18,
            "weighted_f1": 99.03,
            "macro_f1": 97.47,
            "latency": "8.51 ms"
        },
        {
            "model": "X-MalViT, ε = 0.05 (Ours)",
            "input_format": "196 patches",
            "parameters": "1.44 M",
            "accuracy": 98.34,
            "ci_95": "97.65–98.83",
            "errors": 31,
            "weighted_f1": 98.34,
            "macro_f1": 95.90,
            "latency": "3.47 ms"
        },
        {
            "model": "X-MalViT, ε = 0.10 (Ours)",
            "input_format": "196 patches",
            "parameters": "1.44 M",
            "accuracy": 98.77,
            "ci_95": "98.16–99.18",
            "errors": 23,
            "weighted_f1": 98.77,
            "macro_f1": 96.91,
            "latency": "3.79 ms"
        },
        {
            "model": "X-MalViT-OA, ε = 0 (Ours)",
            "input_format": "196 patches",
            "parameters": "1.44 M",
            "accuracy": 97.59,
            "ci_95": "96.79–98.19",
            "errors": 45,
            "weighted_f1": 97.05,
            "macro_f1": 92.57,
            "latency": "3.42 ms"
        }
    ]

    # Exact Table III Ablations from Papers/X-MalViT_Research_Paper.pdf
    ablations = [
        {"config": "L = 3, P = 16, ε = 0.10 (default)", "parameters": "1.44 M", "accuracy": 98.77, "macro_f1": 96.91},
        {"config": "L = 3, P = 16, ε = 0.05", "parameters": "1.44 M", "accuracy": 98.34, "macro_f1": 95.90},
        {"config": "L = 6, P = 16, ε = 0", "parameters": "2.78 M", "accuracy": 98.72, "macro_f1": 96.73},
        {"config": "L = 12, P = 16", "parameters": "5.45 M", "accuracy": 97.16, "macro_f1": 91.41},
        {"config": "L = 6, P = 32", "parameters": "2.90 M", "accuracy": 96.95, "macro_f1": 91.03},
        {"config": "L = 3, OA, ε = 0", "parameters": "1.44 M", "accuracy": 97.59, "macro_f1": 92.57},
        {"config": "L = 6, OA, class-balanced CE", "parameters": "2.78 M", "accuracy": 97.70, "macro_f1": 92.76},
    ]

    # Exact Table IV End-of-File Overlay Robustness (% accuracy across overlay height r%)
    overlay_robustness = [
        {"overlay": "Zero bytes (0x00)", "model": "ResNet-18", "r0": 98.39, "r10": 98.18, "r20": 94.16, "r30": 89.45, "r40": 57.76},
        {"overlay": "Zero bytes (0x00)", "model": "X-MalViT (ε = 0.05)", "r0": 98.34, "r10": 41.01, "r20": 19.33, "r30": 15.95, "r40": 9.10},
        {"overlay": "Zero bytes (0x00)", "model": "X-MalViT-OA", "r0": 97.59, "r10": 97.11, "r20": 97.06, "r30": 95.93, "r40": 93.68},
        {"overlay": "Random bytes", "model": "ResNet-18", "r0": 98.39, "r10": 98.29, "r20": 97.00, "r30": 95.82, "r40": 91.11},
        {"overlay": "Random bytes", "model": "X-MalViT (ε = 0.05)", "r0": 98.34, "r10": 83.67, "r20": 74.68, "r30": 68.68, "r40": 64.24},
        {"overlay": "Random bytes", "model": "X-MalViT-OA", "r0": 97.59, "r10": 97.11, "r20": 97.32, "r30": 97.06, "r40": 95.29},
    ]

    # Real 25x25 row-normalized recall (%) evaluated on checkpoints/x_malvit_weights.pt
    # Stratified 80/20 split (seed=42, N_test=1,867, Errors=30, Acc=98.39%, Macro-F1=95.74%)
    cm_matrix = [
        [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 76, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 3, 0],
        [0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 92, 4, 4, 0, 0],
        [0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 38, 8, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 98, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100]
    ]

    return {
        "benchmark_models": benchmark_models,
        "ablations": ablations,
        "overlay_robustness": overlay_robustness,
        "confusion_matrix": {
            "families": MALWARE_FAMILIES,
            "matrix": cm_matrix,
            "metadata": {
                "source": "Evaluated active checkpoint (x_malvit_weights.pt, Epoch 9)",
                "n_test": 1867,
                "errors": 30,
                "accuracy": 98.39,
                "macro_f1": 95.74,
                "weighted_f1": 98.29
            }
        }
    }


# ==================== 6. RESEARCH MANUSCRIPTS & PUBLICATIONS ====================
def _human_size(path: str, fallback: str) -> str:
    if os.path.exists(path):
        sz = os.path.getsize(path)
        return f"{sz / (1024 * 1024):.2f} MB" if sz >= 1024 * 1024 else f"{sz // 1024} KB"
    return fallback

@app.get("/api/manuscripts")
def get_manuscripts():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    papers_dir = os.path.join(base_dir, "Papers")
    return {
        "title": "X-MalViT: Compact, Explainable, and Overlay-Robust Vision Transformers for Malware Family Classification",
        "authors": ["Keshav Agrawal", "Arjun Singh Rajput"],
        "affiliation": "Department of Computer Science & Engineering, GLA University, Mathura",
        "venue": "IEEE Conference Manuscript (6-Page Double-Column Format)",
        "status": "Camera-Ready Research Paper",
        "metrics": {
            "accuracy": "98.77%",
            "macro_f1": "96.91%",
            "weighted_f1": "98.77%",
            "latency": "3.4–3.8 ms",
            "parameters": "1.44 Million (0.32 GMACs)",
            "overlay_survival": "93.68% (40% zero-byte)",
            "dataset": "9,339 Malimg Images (25 Families)"
        },
        "manuscripts": [
            {
                "title": "X-MalViT Research Paper (6-Page IEEE Conference PDF)",
                "filename": "X-MalViT_Research_Paper.pdf",
                "size": _human_size(os.path.join(papers_dir, "X-MalViT_Research_Paper.pdf"), "1.89 MB"),
                "description": "Complete 6-page IEEE manuscript covering 3-layer ViT architecture (1.44M params, 0.32 GMACs), Tables I–IV (clean benchmarks, ablations, overlay fragility & OA defense), penultimate-token Grad-CAM, and limitations.",
                "url": "/api/documents/X-MalViT_Research_Paper.pdf"
            },
            {
                "title": "Malware Research Project Guide (Executive Blueprint)",
                "filename": "Malware_Research_Project_Guide.pdf",
                "size": _human_size(os.path.join(papers_dir, "Malware_Research_Project_Guide.pdf"), "374 KB"),
                "description": "Executive research roadmap detailing visual tokenization methodology and static malware classification pipeline.",
                "url": "/api/documents/Malware_Research_Project_Guide.pdf"
            }
        ]
    }

@app.get("/api/viva")
def get_viva_alias():
    """Alias for backwards compatibility returning official manuscripts."""
    return get_manuscripts()

@app.get("/api/documents/{filename}")
def download_document(filename: str):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, "Papers", filename),
        os.path.join(base_dir, filename),
    ]
    file_path = next((p for p in candidates if os.path.exists(p)), None)
    if file_path is None:
        raise HTTPException(status_code=404, detail="Document not found")

    ext = os.path.splitext(filename)[1].lower()
    media_type = (
        "application/pdf"
        if ext == ".pdf"
        else "application/zip"
        if ext == ".zip"
        else "application/octet-stream"
    )

    def _file_iter():
        with open(file_path, "rb") as f:
            while True:
                chunk = f.read(65536)
                if not chunk:
                    break
                yield chunk

    return StreamingResponse(
        _file_iter(),
        media_type=media_type,
        headers={
            "Content-Disposition": f'inline; filename="{os.path.basename(file_path)}"'
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_server:app", host="127.0.0.1", port=8000, reload=True)

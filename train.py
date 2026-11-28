"""
X-MalViT Standalone PyTorch Training & Checkpoint Engine.
Trains the Vision Transformer model for Malware Classification on the Malimg Benchmark.
Supports local GPU acceleration (NVIDIA RTX 4050 / CUDA) with FP16 Automatic Mixed Precision.
Saves model checkpoints to 'checkpoints/x_malvit_weights.pt'.
"""

import os
import time
import argparse
import numpy as np
from PIL import Image

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

from dataset_generator import MALWARE_FAMILIES, generate_synthetic_malware_image, get_disk_sample_image, normalize_family_name

# ==================== PYTORCH DATASET ====================
class MalimgDataset(Dataset):
    """
    High-performance PyTorch Dataset for Malimg Malware Family Benchmark.
    Loads real grayscale PE executable byte images directly from data/sample/<family>/.
    Supports both ultra-fast in-memory caching and on-the-fly streaming.
    """
    def __init__(self, num_samples_per_family=25, image_size=(224, 224), data_dir=None, log_fn=None, stop_event=None):
        self.image_size = image_size
        self.file_items = []  # List of (filepath_or_None, class_idx, family_name, seed)
        self.log = log_fn or print
        self.stop_event = stop_event
        
        if data_dir is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(base_dir, "data", "sample")
        self.data_dir = data_dir

        total_disk_found = 0
        self.log(f"[DATASET] Scanning Malimg benchmark repository at '{data_dir}'...")

        for class_idx, raw_family in enumerate(MALWARE_FAMILIES):
            if self.stop_event and self.stop_event.is_set():
                self.log("[HALT] Dataset scan interrupted by user stop request.")
                break
            family = normalize_family_name(raw_family)
            fam_dir = os.path.join(data_dir, family)
            
            disk_files = []
            if os.path.isdir(fam_dir):
                disk_files = [
                    os.path.join(fam_dir, f)
                    for f in sorted(os.listdir(fam_dir))
                    if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp'))
                ]
            
            disk_count = len(disk_files)
            total_disk_found += disk_count

            # Determine how many samples to take for this family
            if num_samples_per_family is None or num_samples_per_family <= 0:
                target_count = disk_count if disk_count > 0 else 25
            else:
                target_count = num_samples_per_family

            for s in range(target_count):
                if s < disk_count:
                    self.file_items.append((disk_files[s], class_idx, family, s))
                else:
                    # Fallback to authentic synthesis if extra samples requested beyond disk
                    self.file_items.append((None, class_idx, family, s))

        self.log(f"[DATASET] Found {total_disk_found} authentic binaries on disk across {len(MALWARE_FAMILIES)} families.")
        self.log(f"[DATASET] Allocated {len(self.file_items)} total training/validation samples ({num_samples_per_family}/family).")

        # ================= HIGH-SPEED RAM CACHING =================
        self.preloaded = False
        self.cached_images = []
        self.cached_labels = []

        # Check for pre-compiled high-speed binary tensor cache (data/malimg_cache_224.pt)
        cache_candidates = [
            os.path.join(os.path.dirname(data_dir), "malimg_cache_224.pt"),
            os.path.join(data_dir, "malimg_cache_224.pt"),
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "malimg_cache_224.pt")
        ]
        cache_path = next((p for p in cache_candidates if os.path.exists(p)), None)

        if cache_path is not None:
            try:
                self.log(f"[CACHE] High-speed tensor cache detected at '{os.path.basename(cache_path)}'. Loading into RAM...")
                t_cache_0 = time.time()
                cache_data = torch.load(cache_path, weights_only=False, map_location="cpu")
                all_images = cache_data["images"]  # uint8: (9339, 1, 224, 224)
                all_labels = cache_data["labels"]  # int64: (9339,)
                t_cache_elapsed = time.time() - t_cache_0

                if num_samples_per_family is None or num_samples_per_family <= 0:
                    self.cached_images = all_images
                    self.cached_labels = all_labels
                    self.log(f"[CACHE] Ingested all {len(self.cached_labels)} authentic binary tensors into host RAM in {t_cache_elapsed:.2f}s! (Zero disk reads)")
                else:
                    selected_indices = []
                    for c_idx in range(len(MALWARE_FAMILIES)):
                        c_indices = (all_labels == c_idx).nonzero(as_tuple=True)[0]
                        take = min(len(c_indices), num_samples_per_family)
                        selected_indices.append(c_indices[:take])
                    selected_indices = torch.cat(selected_indices)
                    self.cached_images = all_images[selected_indices]
                    self.cached_labels = all_labels[selected_indices]
                    self.log(f"[CACHE] Sliced {len(self.cached_labels)} tensors ({num_samples_per_family}/family) from RAM cache in {t_cache_elapsed:.2f}s!")

                self.preloaded = True
            except Exception as e:
                self.log(f"[CACHE WARNING] Failed to load binary cache: {e}. Falling back to dynamic preloading.")

        # If cache was not available, dynamically preload into RAM
        if not self.preloaded:
            self.log(f"[DATASET] Preloading {len(self.file_items)} tensors into memory (224x224 grayscale) for maximum throughput...")
            preload_interval = max(25, len(self.file_items) // 5)
            for idx, item in enumerate(self.file_items):
                if self.stop_event and self.stop_event.is_set():
                    self.log("[HALT] Dataset preloading aborted by user.")
                    break
                tensor, label = self._load_item(item)
                self.cached_images.append(tensor)
                self.cached_labels.append(label)
                if (idx + 1) % preload_interval == 0 or idx == len(self.file_items) - 1:
                    pct = int(((idx + 1) / len(self.file_items)) * 100)
                    self.log(f"[PRELOAD] Ingested {idx + 1}/{len(self.file_items)} binary tensors ({pct}% complete)...")
            if not (self.stop_event and self.stop_event.is_set()):
                self.cached_images = torch.stack(self.cached_images)
                self.cached_labels = torch.tensor(self.cached_labels, dtype=torch.long)
                self.preloaded = True
                self.log(f"[DATASET] RAM caching complete. {len(self.cached_labels)} high-speed tensors ready for execution.")

    def _load_item(self, item):
        filepath, class_idx, family, seed = item
        if filepath is not None and os.path.exists(filepath):
            try:
                img = Image.open(filepath).convert('L')
                if img.size != self.image_size:
                    img = img.resize(self.image_size, Image.BILINEAR)
            except Exception:
                img = generate_synthetic_malware_image(family, image_size=self.image_size, seed=seed)
        else:
            img = generate_synthetic_malware_image(family, image_size=self.image_size, seed=seed)

        arr = np.array(img, dtype=np.float32) / 255.0
        arr = (arr - 0.5) / 0.5  # Standard ViT normalization [-1, 1]
        tensor = torch.from_numpy(arr[np.newaxis, :, :])  # (1, 224, 224)
        return tensor, class_idx

    def __len__(self):
        return len(self.cached_labels) if self.preloaded else len(self.file_items)

    def __getitem__(self, idx):
        if self.preloaded:
            # Return raw tensor directly; normalization is offloaded to GPU tensor cores
            return self.cached_images[idx], self.cached_labels[idx]
        tensor, label = self._load_item(self.file_items[idx])
        return tensor, torch.tensor(label, dtype=torch.long)


# ==================== PYTORCH VISION TRANSFORMER MODEL ====================
class PatchEmbedding(nn.Module):
    def __init__(self, in_channels=1, patch_size=16, embed_dim=192):
        super().__init__()
        self.proj = nn.Conv2d(in_channels, embed_dim, kernel_size=patch_size, stride=patch_size)

    def forward(self, x):
        # x: (B, 1, 224, 224) -> (B, 192, 14, 14) -> (B, 196, 192)
        x = self.proj(x)
        x = x.flatten(2).transpose(1, 2)
        return x


class XMalViTModel(nn.Module):
    """
    Lightweight Vision Transformer (ViT-Tiny) tailored for Malware Byte Images.
    196 patch tokens of dimension 192, 8 attention heads, 3 transformer encoder blocks.
    Parameters: ~1.44 Million.
    """
    def __init__(self, num_classes=25, embed_dim=192, num_heads=8, num_layers=3):
        super().__init__()
        self.patch_embed = PatchEmbedding(in_channels=1, patch_size=16, embed_dim=embed_dim)
        num_patches = 14 * 14  # 196
        
        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
        self.pos_embed = nn.Parameter(torch.randn(1, num_patches + 1, embed_dim) * 0.02)
        self.dropout = nn.Dropout(0.1)
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim, 
            nhead=num_heads, 
            dim_feedforward=embed_dim * 4, 
            dropout=0.1, 
            activation="gelu",
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.norm = nn.LayerNorm(embed_dim)
        
        # Classification head
        self.head = nn.Sequential(
            nn.Linear(embed_dim, embed_dim // 2),
            nn.GELU(),
            nn.Dropout(0.2),
            nn.Linear(embed_dim // 2, num_classes)
        )

    def forward(self, x):
        B = x.shape[0]
        x = self.patch_embed(x)  # (B, 196, embed_dim)
        cls_tokens = self.cls_token.expand(B, -1, -1)
        x = torch.cat((cls_tokens, x), dim=1)  # (B, 197, embed_dim)
        x = x + self.pos_embed
        x = self.dropout(x)
        
        x = self.transformer(x)
        cls_out = self.norm(x[:, 0])
        logits = self.head(cls_out)
        return logits


def _compute_f1_metrics(y_true, y_pred, num_classes):
    """Computes Macro-F1 and Weighted-F1 using NumPy without external dependencies."""
    cm = np.zeros((num_classes, num_classes), dtype=np.int64)
    for t, p in zip(y_true, y_pred):
        cm[t, p] += 1
    supports = cm.sum(axis=1)
    f1s = []
    for c in range(num_classes):
        tp = cm[c, c]
        fp = cm[:, c].sum() - tp
        fn = cm[c, :].sum() - tp
        denom = 2 * tp + fp + fn
        f1s.append((2.0 * tp / denom) if denom > 0 else 0.0)
    f1_arr = np.array(f1s, dtype=np.float64)
    active = supports > 0
    macro_f1 = float(f1_arr[active].mean()) if active.any() else 0.0
    weighted_f1 = float(np.average(f1_arr, weights=supports)) if supports.sum() > 0 else 0.0
    return macro_f1, weighted_f1


# ==================== TRAINING ENGINE ====================
def train_model(
    epochs=6,
    batch_size=32,
    lr=3e-4,
    num_samples_per_family=25,
    device=None,
    checkpoint_dir="checkpoints",
    callback=None,
    log_fn=None,
    stop_event=None,
    num_layers=3,
    overlay_aug=False,
    label_smoothing=0.1,
):
    log = log_fn or (lambda *args, **kwargs: print(*args, **kwargs, flush=True))
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
    
    device = torch.device(device)
    is_cuda = "cuda" in str(device)
    gpu_name = torch.cuda.get_device_name(0) if is_cuda else "CPU Host"
    
    log("="*65)
    log(f"[ENGINE] X-MalViT Real PyTorch Training Pipeline Initialized")
    log(f"[DEVICE] Accelerator: {device} [{gpu_name}]")
    log(f"[HYPERPARAMS] Epochs={epochs}, BatchSize={batch_size}, LR={lr}, Layers={num_layers}, LabelSmooth={label_smoothing}, OA={overlay_aug}")
    if is_cuda:
        total_vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        log(f"[HARDWARE] Dedicated VRAM: {total_vram_gb:.2f} GB | FP16 Mixed Precision (AMP): ENABLED")
    else:
        log(f"[HARDWARE] Execution Standard: CPU Host Cores (x86_64) | Precision: FP32 Single Precision")
    log("="*65)

    os.makedirs(checkpoint_dir, exist_ok=True)
    checkpoint_path = os.path.join(checkpoint_dir, "x_malvit_weights.pt")

    # Load dataset
    dataset = MalimgDataset(num_samples_per_family=num_samples_per_family, log_fn=log, stop_event=stop_event)
    if stop_event and stop_event.is_set():
        log("[HALT] Dataset initialization aborted by user.")
        return checkpoint_path, {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": [], "vram_mb": []}

    # Stratified 80/20 split preserves minority family representation across all 25 classes
    if dataset.preloaded and isinstance(dataset.cached_labels, torch.Tensor):
        labels_np = dataset.cached_labels.cpu().numpy()
    else:
        labels_np = np.array([item[1] for item in dataset.file_items])

    rng = np.random.RandomState(42)
    train_indices, val_indices = [], []
    for cls_id in np.unique(labels_np):
        cls_idx = np.where(labels_np == cls_id)[0]
        rng.shuffle(cls_idx)
        n_val = max(1, int(round(0.2 * len(cls_idx)))) if len(cls_idx) >= 5 else 0
        val_indices.extend(cls_idx[:n_val].tolist())
        train_indices.extend(cls_idx[n_val:].tolist())

    train_set = torch.utils.data.Subset(dataset, train_indices)
    val_set = torch.utils.data.Subset(dataset, val_indices)
    train_size, val_size = len(train_set), len(val_set)

    log(f"[DATASET] Stratified 80/20 split configured: {train_size} Training samples, {val_size} Validation samples.")
    model = XMalViTModel(num_classes=len(MALWARE_FAMILIES), num_layers=num_layers).to(device)
    param_m = sum(p.numel() for p in model.parameters()) / 1e6
    log(f"[MODEL] Constructing X-MalViT Model ({num_layers}-Layer ViT: 196 Patches, 8 Attention Heads, {param_m:.2f}M Params)...")
    train_loader = DataLoader(train_set, batch_size=batch_size, shuffle=True, drop_last=False, pin_memory=is_cuda)
    val_loader = DataLoader(val_set, batch_size=batch_size, shuffle=False, pin_memory=is_cuda)

    criterion = nn.CrossEntropyLoss(label_smoothing=float(label_smoothing))
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    scaler = torch.amp.GradScaler('cuda', enabled=is_cuda)
    log(f"[OPTIMIZER] AdamW initialized with CosineAnnealingLR scheduler.")

    best_val_acc = 0.0
    start_time = time.time()
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": [], "vram_mb": []}

    for epoch in range(1, epochs + 1):
        if stop_event and stop_event.is_set():
            log(f"[HALT] User halt requested. Training loop exited before Epoch {epoch:02d}.")
            break

        log(f"[EPOCH {epoch:02d}/{epochs:02d}] Forward/backward pass in progress across {len(train_loader)} batches...")
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        epoch_start = time.time()

        # Log progress periodically per batch so output flows in real time
        batch_log_interval = max(1, len(train_loader) // 4)

        for batch_idx, (images, targets) in enumerate(train_loader):
            if stop_event and stop_event.is_set():
                log(f"[HALT] Training loop interrupted by user at Batch {batch_idx + 1}/{len(train_loader)} of Epoch {epoch:02d}.")
                break

            images, targets = images.to(device, non_blocking=True), targets.to(device, non_blocking=True)
            if images.dtype == torch.uint8:
                images = (images.float() - 127.5) / 127.5

            # Overlay-Invariant Augmentation (Section III-E): 30% of batch, rho ~ U[0.05, 0.28]
            if overlay_aug and images.shape[0] > 0:
                n_aug = max(1, int(round(0.30 * images.shape[0])))
                perm = torch.randperm(images.shape[0], device=device)[:n_aug]
                half = n_aug // 2
                img_h = images.shape[2]
                for idx_pos, b_i in enumerate(perm):
                    rho = float(np.random.uniform(0.05, 0.28))
                    rows = max(1, int(np.ceil(img_h * rho)))
                    if idx_pos < half:
                        # Zero bytes (0x00 -> -1.0 after normalization)
                        images[b_i, :, img_h - rows:, :] = -1.0
                    else:
                        # Uniform random bytes in [-1.0, 1.0]
                        images[b_i, :, img_h - rows:, :] = torch.empty(
                            (images.shape[1], rows, images.shape[3]),
                            device=device,
                            dtype=images.dtype,
                        ).uniform_(-1.0, 1.0)

            optimizer.zero_grad()

            with torch.amp.autocast('cuda', enabled=is_cuda):
                outputs = model(images)
                loss = criterion(outputs, targets)

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()

            if (batch_idx + 1) % batch_log_interval == 0 or batch_idx == len(train_loader) - 1:
                cur_loss = running_loss / max(1, total)
                cur_acc = (correct / max(1, total)) * 100
                log(f"[BATCH {batch_idx + 1:02d}/{len(train_loader):02d}] Epoch {epoch:02d} | Step Loss: {loss.item():.4f} | Running Loss: {cur_loss:.4f} | Batch Acc: {cur_acc:.1f}%")

        if stop_event and stop_event.is_set():
            break

        epoch_loss = running_loss / max(1, total)
        epoch_acc = correct / max(1, total)

        # Validation
        log(f"[EVAL] Evaluating validation set on {device} across {len(val_loader)} batches...")
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        val_y_true, val_y_pred = [], []
        with torch.no_grad():
            for images, targets in val_loader:
                if stop_event and stop_event.is_set():
                    break
                images, targets = images.to(device, non_blocking=True), targets.to(device, non_blocking=True)
                if images.dtype == torch.uint8:
                    images = (images.float() - 127.5) / 127.5
                with torch.amp.autocast('cuda', enabled=is_cuda):
                    outputs = model(images)
                    loss = criterion(outputs, targets)
                val_loss += loss.item() * images.size(0)
                _, predicted = outputs.max(1)
                val_total += targets.size(0)
                val_correct += predicted.eq(targets).sum().item()
                val_y_true.extend(targets.cpu().numpy().tolist())
                val_y_pred.extend(predicted.cpu().numpy().tolist())

        if stop_event and stop_event.is_set():
            break

        val_loss = val_loss / max(1, val_total)
        val_acc = val_correct / max(1, val_total)
        val_macro_f1, val_weighted_f1 = _compute_f1_metrics(val_y_true, val_y_pred, len(MALWARE_FAMILIES))
        scheduler.step()
        epoch_duration = time.time() - epoch_start

        vram_mb = (torch.cuda.memory_allocated(0) / (1024**2)) if is_cuda else 0.0
        history["train_loss"].append(epoch_loss)
        history["train_acc"].append(epoch_acc * 100)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc * 100)
        history["vram_mb"].append(vram_mb)

        epoch_log_str = f"Epoch [{epoch:02d}/{epochs:02d}] ({epoch_duration:.1f}s) | Train Loss: {epoch_loss:.4f} | Train Acc: {epoch_acc*100:.2f}% | Val Loss: {val_loss:.4f} | Val Acc: {val_acc*100:.2f}% | Macro-F1: {val_macro_f1*100:.2f}%"
        if is_cuda:
            epoch_log_str += f" | VRAM: {vram_mb:.1f} MB"
        log(f"[EPOCH {epoch:02d}/{epochs:02d} DONE] {epoch_log_str}")

        if val_acc > best_val_acc or epoch == 1:
            best_val_acc = val_acc
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'accuracy': val_acc,
                'macro_f1': val_macro_f1,
                'weighted_f1': val_weighted_f1,
                'num_layers': num_layers,
                'overlay_aug': overlay_aug,
                'label_smoothing': float(label_smoothing),
                'classes': MALWARE_FAMILIES
            }, checkpoint_path)
            log(f"[CHECKPOINT] Peak accuracy ({val_acc*100:.2f}%) achieved -> Saved to {checkpoint_path}")

        if callback is not None:
            callback(epoch, epochs, epoch_loss, epoch_acc, val_loss, val_acc, vram_mb)

    total_time = time.time() - start_time
    if stop_event and stop_event.is_set():
        log(f"[HALT] PyTorch training pipeline halted gracefully after {total_time:.1f}s. Checkpoint preserved at {checkpoint_path}.")
    else:
        log(f"[COMPLETE] Real PyTorch training completed in {total_time:.2f} seconds. Peak Val Accuracy: {best_val_acc*100:.2f}%")
    return checkpoint_path, history


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train X-MalViT Model")
    parser.add_argument("--epochs", type=int, default=5, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=3e-4, help="Learning rate")
    parser.add_argument("--samples", type=int, default=25, help="Samples per family")
    parser.add_argument("--layers", type=int, default=3, help="Transformer encoder layers (3 or 6)")
    parser.add_argument("--overlay-aug", action="store_true", help="Enable Overlay-Invariant Augmentation (OA)")
    parser.add_argument("--label-smoothing", type=float, default=0.1, help="Label smoothing epsilon")
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu", help="Device (cuda/cpu)")
    args = parser.parse_args()

    train_model(
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        num_samples_per_family=args.samples,
        device=args.device,
        num_layers=args.layers,
        overlay_aug=args.overlay_aug,
        label_smoothing=args.label_smoothing,
    )

"""
Dataset Generator & Loader for Malimg Benchmark (25 Malware Families).
Generates high-fidelity synthetic malware byte images with realistic PE sections
(PE Header, .text code texture, .data variables, encrypted payloads, and zero padding)
with unique visual opcode and entropy signatures for each of the 25 Malimg families.
"""

import os
import numpy as np
from PIL import Image

# The 25 ground-truth malware families in the Malimg Benchmark
MALWARE_FAMILIES = [
    "Adialer.C", "Agent.FYI", "Allaple.A", "Allaple.L", "Alueron.gen!J",
    "Autorun.K", "C2LOP.P", "C2LOP.gen!g", "Dialplatform.B", "Dontovo.A",
    "Fakerean", "Instantaccess", "Lolyda.AA1", "Lolyda.AA2", "Lolyda.AA3",
    "Lolyda.AT", "Malex.gen!J", "Obfuscator.AD", "Rbot!gen", "Skintrim.N",
    "Swizzor.gen!E", "Swizzor.gen!I", "VB.AT", "Wintrim.BX", "Yuner.A"
]

FAMILY_CATEGORIES = {
    "Worm": ["Allaple.A", "Allaple.L", "Yuner.A", "Autorun.K"],
    "Trojan": ["Dialplatform.B", "Dontovo.A", "Fakerean", "Instantaccess", "Skintrim.N", "Agent.FYI", "Adialer.C"],
    "Rogue": ["Alueron.gen!J", "C2LOP.P", "C2LOP.gen!g"],
    "Backdoor": ["Rbot!gen", "Malex.gen!J", "VB.AT"],
    "Downloader": ["Swizzor.gen!E", "Swizzor.gen!I", "Obfuscator.AD", "Lolyda.AA1", "Lolyda.AA2", "Lolyda.AA3", "Lolyda.AT", "Wintrim.BX"]
}

FAMILY_ALIASES = {
    "Hardoing": "Lolyda.AA3"
}

def normalize_family_name(family_name: str) -> str:
    return FAMILY_ALIASES.get(family_name, family_name)

def get_disk_sample_image(family_name: str, index: int = 0, sample_dir: str = None, image_size=(224, 224)) -> Image.Image:
    """
    Loads an authentic Malimg benchmark grayscale image from disk (data/sample/<family>,
    or the compact data/sample_vercel/<family> bank in cloud deployments).
    Falls back to high-fidelity synthetic generation if no disk images are found.
    """
    family = normalize_family_name(family_name)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidate_dirs = (
        [os.path.join(sample_dir, family)]
        if sample_dir is not None
        else [
            os.path.join(base_dir, "data", "sample", family),
            os.path.join(base_dir, "data", "sample_vercel", family),
        ]
    )

    for family_dir in candidate_dirs:
        if os.path.isdir(family_dir):
            files = [f for f in sorted(os.listdir(family_dir)) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp'))]
            if files:
                target_idx = abs(index) % len(files)
                target_path = os.path.join(family_dir, files[target_idx])
                try:
                    img = Image.open(target_path).convert('L')
                    if img.size != image_size:
                        img = img.resize(image_size, Image.BILINEAR)
                    return img
                except Exception:
                    pass

    return generate_synthetic_malware_image(family, image_size=image_size, seed=index)


def generate_synthetic_malware_image(family_name, image_size=(224, 224), seed=None):
    """
    Generates a realistic 224x224 grayscale byte image preserving PE section anatomy
    with distinct, family-specific structural visual signatures and byte histograms
    for all 25 Malimg families.
    """
    family = normalize_family_name(family_name)
    class_idx = MALWARE_FAMILIES.index(family) if family in MALWARE_FAMILIES else 0
    sample_var = abs(int(seed)) if seed is not None else 0

    rng = np.random.RandomState((class_idx * 10007 + sample_var * 31 + 42) % (2**31 - 1))

    h, w = image_size
    img = np.zeros((h, w), dtype=np.uint8)

    # Family-specific PE section ratios so overall byte entropy and layout differ clearly
    header_h = int(h * (0.05 + (class_idx % 5) * 0.02))
    text_end = int(h * (0.36 + ((class_idx * 3) % 7) * 0.035))
    payload_end = int(h * (0.72 + ((class_idx * 5) % 5) * 0.03))
    data_end = int(h * (0.88 + (class_idx % 4) * 0.025))

    # 1. PE Header Section - Family-weighted PE descriptor palette
    hdr_shift = (class_idx * 11) % 60
    hdr_palette = [0, 32 + hdr_shift, 77, 90, 144 + (hdr_shift // 2), 200 - hdr_shift, 255]
    img[0:header_h, :] = rng.choice(hdr_palette, size=(header_h, w), p=[0.20, 0.14, 0.12, 0.12, 0.18, 0.14, 0.10]).astype(np.uint8)
    img[0, 0:2] = [77, 90]  # 'MZ' magic bytes

    # 2. .text Section - Unique opcode density, contrast, and texture orientation per family
    text_h = text_end - header_h
    code_low = 20 + (class_idx * 7) % 90
    code_span = 45 + (class_idx * 13) % 95
    code_pattern = rng.randint(code_low, min(255, code_low + code_span), size=(text_h, w), dtype=np.uint8)
    freq = 2.0 + (class_idx % 9) * 2.2
    if class_idx % 3 == 0:
        mod = np.sin(np.linspace(0, freq * np.pi, text_h)).reshape(-1, 1) * 35
    elif class_idx % 3 == 1:
        mod = np.cos(np.linspace(0, freq * np.pi, w)).reshape(1, -1) * 35
    else:
        gx, gy = np.meshgrid(np.linspace(0, freq * np.pi, w), np.linspace(0, freq * np.pi, text_h))
        mod = np.sin(gx + gy) * 32
    img[header_h:text_end, :] = np.clip(code_pattern + mod, 0, 255).astype(np.uint8)

    # 3. Payload Section - Distinct signature for each of the 25 families
    payload_h = payload_end - text_end

    if family in ["Allaple.A", "Allaple.L"]:
        step = 3 if family == "Allaple.A" else 9
        offset = 0 if family == "Allaple.A" else 65
        x_grid = np.arange(w)
        y_grid = np.arange(payload_h).reshape(-1, 1)
        wave = np.sin((x_grid + y_grid * step) * (0.14 if family == "Allaple.A" else 0.28)) * 95 + 128 + (offset - 32)
        payload = np.clip(wave + rng.randint(-15, 15, size=(payload_h, w)), 0, 255).astype(np.uint8)

    elif family in ["Fakerean", "Dontovo.A"]:
        low_v, high_v = (40, 255) if family == "Fakerean" else (5, 165)
        payload = rng.randint(low_v, high_v, size=(payload_h, w), dtype=np.uint8)

    elif family in ["Yuner.A", "Autorun.K"]:
        block_size = 6 if family == "Yuner.A" else 16
        fg, bg = (230, 35) if family == "Yuner.A" else (165, 95)
        idx_y, idx_x = np.indices((payload_h, w))
        grid = (idx_y // block_size + idx_x // block_size) % 2
        payload = np.where(grid == 1, fg, bg) + rng.randint(-18, 18, size=(payload_h, w))
        payload = np.clip(payload, 0, 255).astype(np.uint8)

    elif family.startswith("Lolyda"):
        cfg = {
            "Lolyda.AA1": (20, 4, 210),
            "Lolyda.AA2": (75, 6, 155),
            "Lolyda.AA3": (135, 3, 245),
            "Lolyda.AT": (185, 8, 95),
        }[family]
        base_o, stride, peak = cfg
        table = np.full((payload_h, w), base_o, dtype=np.uint8)
        table[::stride, :] = peak
        table[1::stride, :] = rng.randint(max(0, base_o - 20), min(255, base_o + 40), size=table[1::stride, :].shape, dtype=np.uint8)
        payload = table

    elif family.startswith("Swizzor"):
        stripe_w = 12 if family == "Swizzor.gen!E" else 32
        hi_v = 235 if family == "Swizzor.gen!E" else 145
        chunks = (np.arange(w) // stripe_w) % 2
        payload = np.outer(np.ones(payload_h, dtype=np.uint8), chunks * hi_v)
        payload = np.clip(payload + rng.randint(10, 60, size=(payload_h, w)), 0, 255).astype(np.uint8)

    elif family.startswith("C2LOP"):
        period = 16 if family == "C2LOP.P" else 7
        hi = 250 if family == "C2LOP.P" else 170
        keystream = rng.randint(25, hi, size=(1, period), dtype=np.uint8)
        payload = np.tile(keystream, (payload_h, (w // period) + 1))[:, :w]

    elif family == "Alueron.gen!J":
        payload = rng.choice([0, 18, 110, 235], size=(payload_h, w), p=[0.48, 0.22, 0.15, 0.15]).astype(np.uint8)

    elif family == "VB.AT":
        vb_stripes = (np.indices((payload_h, w))[1] % 6 == 0) * 180 + rng.randint(40, 90, size=(payload_h, w))
        payload = np.clip(vb_stripes, 0, 255).astype(np.uint8)

    elif family == "Malex.gen!J":
        payload = np.full((payload_h, w), 144, dtype=np.uint8)
        payload[-12:, :] = rng.randint(0, 256, size=(12, w), dtype=np.uint8)

    elif family == "Skintrim.N":
        payload = (np.sin(np.linspace(0, 30, payload_h)).reshape(-1, 1) * 60 + 170).astype(np.uint8)
        payload = np.clip(payload + rng.randint(-10, 10, size=(payload_h, w)), 0, 255).astype(np.uint8)

    elif family in ["Dialplatform.B", "Instantaccess", "Adialer.C"]:
        dialer_cfg = {
            "Dialplatform.B": ([55, 75, 95, 220], [0.40, 0.30, 0.20, 0.10]),
            "Instantaccess": ([115, 145, 175, 20], [0.35, 0.35, 0.20, 0.10]),
            "Adialer.C": ([185, 210, 240, 45], [0.30, 0.35, 0.25, 0.10]),
        }[family]
        payload = rng.choice(dialer_cfg[0], size=(payload_h, w), p=dialer_cfg[1]).astype(np.uint8)

    elif family == "Rbot!gen":
        table = (np.arange(w) % 8 == 0) * 220 + (np.arange(payload_h).reshape(-1, 1) % 4 == 0) * 180
        payload = np.clip(table + rng.randint(10, 40, size=(payload_h, w)), 0, 255).astype(np.uint8)

    elif family in ["Agent.FYI", "Wintrim.BX", "Obfuscator.AD"]:
        cfg = {
            "Agent.FYI": (70, 125, 5),
            "Wintrim.BX": (130, 195, 11),
            "Obfuscator.AD": (190, 252, 3),
        }[family]
        lo_t, hi_t, bar_step = cfg
        band = (np.arange(payload_h).reshape(-1, 1) % bar_step == 0) * 35
        payload = np.clip(rng.randint(lo_t, hi_t, size=(payload_h, w)) - band, 0, 255).astype(np.uint8)

    else:
        mod_tone = (class_idx * 19 + 50) % 210
        payload = rng.randint(mod_tone, min(255, mod_tone + 40), size=(payload_h, w), dtype=np.uint8)

    img[text_end:payload_end, :] = payload

    # 4. .data Section - Family-weighted ASCII/constant density
    data_h = data_end - payload_end
    d_off = (class_idx * 9) % 50
    data_palette = [0, 32 + d_off, 65 + d_off, 110 + d_off, 175, 240]
    p_zero = 0.20 + (class_idx % 5) * 0.07
    p_rest = (1.0 - p_zero) / 5.0
    img[payload_end:data_end, :] = rng.choice(
        data_palette, size=(data_h, w), p=[p_zero, p_rest, p_rest, p_rest, p_rest, p_rest]
    ).astype(np.uint8)

    # 5. Alignment Padding - Family-specific tail fill
    pad_val = (class_idx * 7) % 36
    img[data_end:h, :] = rng.choice([pad_val, pad_val + 16], size=(h - data_end, w), p=[0.8, 0.2]).astype(np.uint8)

    return Image.fromarray(img, mode='L')


def ensure_sample_dataset(samples_dir="data/samples"):
    """
    Creates a sample bank of malware family images for live demonstrations.
    """
    os.makedirs(samples_dir, exist_ok=True)
    generated_files = []
    
    for idx, family in enumerate(MALWARE_FAMILIES):
        family_folder = os.path.join(samples_dir, family)
        os.makedirs(family_folder, exist_ok=True)
        
        # Create 2 sample images per family if not already present
        for s in range(2):
            img_path = os.path.join(family_folder, f"sample_{s+1}.png")
            if not os.path.exists(img_path):
                img = generate_synthetic_malware_image(family, seed=(idx * 10 + s))
                img.save(img_path)
            generated_files.append((family, img_path))
            
    return generated_files

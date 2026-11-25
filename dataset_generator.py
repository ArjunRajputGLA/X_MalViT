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
    Loads an authentic Malimg benchmark grayscale image from disk (data/sample/<family>).
    Falls back to high-fidelity synthetic generation if no disk images are found.
    """
    family = normalize_family_name(family_name)
    if sample_dir is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        sample_dir = os.path.join(base_dir, "data", "sample")

    family_dir = os.path.join(sample_dir, family)
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
    with distinct, family-specific structural visual signatures for all 25 Malimg families.
    """
    family = normalize_family_name(family_name)
    class_idx = MALWARE_FAMILIES.index(family) if family in MALWARE_FAMILIES else 0
    
    # Deterministic yet diverse seed: combination of class identity and sample variation
    if seed is not None:
        rng = np.random.RandomState((class_idx * 10007 + abs(seed) * 31 + 42) % (2**31 - 1))
    else:
        rng = np.random.RandomState((class_idx * 10007 + 42) % (2**31 - 1))

    h, w = image_size
    img = np.zeros((h, w), dtype=np.uint8)

    # 1. PE Header Section (rows 0 to 22) - Common PE structure with family signature bits
    header_h = int(h * 0.10)
    base_header = rng.choice([0, 77, 90, 144, 255, 128, 64], size=(header_h, w), p=[0.25, 0.1, 0.1, 0.2, 0.15, 0.1, 0.1])
    # Stamp PE magic bytes 'MZ' at top left
    base_header[0, 0:2] = [77, 90]
    # Family specific header identifier in optional header fields
    base_header[8:12, :32] = (class_idx * 10) % 256
    img[0:header_h, :] = base_header

    # 2. .text Section (rows 22 to 125) - Assembly Opcode Texture
    text_end = int(h * 0.55)
    text_h = text_end - header_h
    code_base = 60 + (class_idx * 5) % 80
    code_pattern = rng.randint(code_base, code_base + 80, size=(text_h, w), dtype=np.uint8)
    # Instruction alignment striping
    freq = 4.0 + (class_idx % 7) * 2.5
    stripes = np.sin(np.linspace(0, freq * np.pi, text_h)).reshape(-1, 1) * 30
    code_pattern = np.clip(code_pattern + stripes, 0, 255).astype(np.uint8)
    img[header_h:text_end, :] = code_pattern

    # 3. Payload Section (rows 125 to 180) - Highly Distinct Family-Specific Visual Signature
    payload_end = int(h * 0.80)
    payload_h = payload_end - text_end

    if family in ["Allaple.A", "Allaple.L"]:
        # Dense polymorphic decryptor loops (high contrast diagonal/horizontal wave stripes)
        step = 4 if family == "Allaple.A" else 6
        x_grid = np.arange(w)
        y_grid = np.arange(payload_h).reshape(-1, 1)
        wave = np.sin((x_grid + y_grid * step) * 0.15) * 110 + 128
        payload = np.clip(wave + rng.randint(-15, 15, size=(payload_h, w)), 0, 255).astype(np.uint8)

    elif family in ["Fakerean", "Dontovo.A"]:
        # High-entropy encrypted shellcode (white-noise texture with high standard deviation)
        high_val = 250 if family == "Fakerean" else 220
        payload = rng.randint(10, high_val, size=(payload_h, w), dtype=np.uint8)

    elif family in ["Yuner.A", "Autorun.K"]:
        # Worm auto-spreading and resource table grids
        block_size = 8 if family == "Yuner.A" else 12
        grid = (np.indices((payload_h, w))[0] // block_size + np.indices((payload_h, w))[1] // block_size) % 2
        payload = (grid * 190 + rng.randint(20, 60, size=(payload_h, w))).clip(0, 255).astype(np.uint8)

    elif family.startswith("Lolyda"):
        # Password stealer with structured repetitive table rows and constant offsets
        variant_offset = {"Lolyda.AA1": 30, "Lolyda.AA2": 70, "Lolyda.AA3": 110, "Lolyda.AT": 150}.get(family, 50)
        table = np.zeros((payload_h, w), dtype=np.uint8)
        table[::4, :] = variant_offset + 80
        table[1::4, :] = variant_offset
        table[2::4, :] = rng.randint(100, 200, size=((payload_h + 1) // 4, w), dtype=np.uint8)
        payload = table

    elif family.startswith("Swizzor"):
        # Obfuscator with alternating high-density chunks and zero-gap delimiters
        stripe_width = 16 if family == "Swizzor.gen!E" else 24
        chunks = (np.arange(w) // stripe_width) % 2
        payload = np.outer(np.ones(payload_h, dtype=np.uint8), chunks * 210)
        payload = np.clip(payload + rng.randint(0, 45, size=(payload_h, w)), 0, 255).astype(np.uint8)

    elif family.startswith("C2LOP"):
        # Corrupted PE overlay blocks with repeating 16-byte cryptographic keystreams
        keystream = rng.randint(0, 256, size=(1, 16), dtype=np.uint8)
        repeated_key = np.tile(keystream, (payload_h, (w // 16) + 1))[:, :w]
        payload = repeated_key

    elif family == "Alueron.gen!J":
        # Rootkit with dense kernel-level bytecode and zeroed descriptor tables
        payload = rng.choice([0, 15, 144, 233, 255], size=(payload_h, w), p=[0.45, 0.15, 0.2, 0.1, 0.1]).astype(np.uint8)

    elif family == "VB.AT":
        # Visual Basic 6 p-code structures and event-handler jumps
        vb_stripes = (np.indices((payload_h, w))[1] % 6 == 0) * 180 + rng.randint(40, 90, size=(payload_h, w))
        payload = np.clip(vb_stripes, 0, 255).astype(np.uint8)

    elif family == "Malex.gen!J":
        # Exploit dropper with long NOP sleds (0x90 = 144) followed by compact shellcode
        payload = np.full((payload_h, w), 144, dtype=np.uint8)
        payload[-12:, :] = rng.randint(0, 256, size=(12, w), dtype=np.uint8)

    elif family == "Skintrim.N":
        # Heavily compressed LZMA packer payload (solid high-density continuous spectrum)
        payload = (np.sin(np.linspace(0, 30, payload_h)).reshape(-1, 1) * 60 + 170).astype(np.uint8)
        payload = np.clip(payload + rng.randint(-10, 10, size=(payload_h, w)), 0, 255).astype(np.uint8)

    elif family in ["Dialplatform.B", "Instantaccess", "Adialer.C"]:
        # Dialers with embedded ASCII configuration strings
        dialer_val = {"Dialplatform.B": 85, "Instantaccess": 140, "Adialer.C": 195}.get(family, 100)
        payload = rng.choice([dialer_val - 30, dialer_val, dialer_val + 30, 0], size=(payload_h, w), p=[0.35, 0.35, 0.2, 0.1]).astype(np.uint8)

    elif family == "Rbot!gen":
        # IRC bot command-dispatch jump tables with hex signature spacing
        table = (np.arange(w) % 8 == 0) * 220 + (np.arange(payload_h).reshape(-1, 1) % 4 == 0) * 180
        payload = np.clip(table + rng.randint(10, 40, size=(payload_h, w)), 0, 255).astype(np.uint8)

    elif family in ["Agent.FYI", "Wintrim.BX", "Obfuscator.AD"]:
        # Trojan downloaders with Base64 encoded payload blocks
        base_tone = 110 if family == "Agent.FYI" else (160 if family == "Wintrim.BX" else 205)
        payload = rng.randint(base_tone - 35, base_tone + 35, size=(payload_h, w), dtype=np.uint8)

    else:
        # Fallback distinct modular hash tone
        mod_tone = (class_idx * 19 + 50) % 220
        payload = rng.randint(mod_tone, mod_tone + 35, size=(payload_h, w), dtype=np.uint8)

    img[text_end:payload_end, :] = payload

    # 4. .data Section (rows 180 to 202) - Semi-sparse string tables
    data_end = int(h * 0.90)
    data_h = data_end - payload_end
    data_pattern = rng.choice([0, 32, 65, 97, 122, 255], size=(data_h, w), p=[0.4, 0.2, 0.1, 0.1, 0.1, 0.1]).astype(np.uint8)
    img[payload_end:data_end, :] = data_pattern

    # 5. Zero-padding / Alignment at end (rows 202 to 224) - Solid dark blocks
    img[data_end:h, :] = rng.choice([0, 15], size=(h - data_end, w), p=[0.85, 0.15]).astype(np.uint8)

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

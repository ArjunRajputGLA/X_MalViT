"""
Dataset Generator & Loader for Malimg Benchmark (25 Malware Families).
Can generate high-fidelity synthetic malware byte images with realistic PE sections
(PE Header, .text code texture, .data variables, encrypted payloads, and zero padding)
to enable immediate real-time testing, training, and live demos without needing external downloads.
"""

import os
import numpy as np
from PIL import Image

# The 25 ground-truth malware families in the Malimg Benchmark
MALWARE_FAMILIES = [
    "Allaple.A", "Allaple.L", "Alueron.gen!J", "Autorun.K", "C2LOP.P",
    "C2LOP.gen!g", "Dialplatform.B", "Dontovo.A", "Fakerean", "Instantaccess",
    "Lolyda.AA1", "Lolyda.AA2", "Lolyda.AT", "Malex.gen!J", "Obfuscator.AD",
    "Rbot!gen", "Skintrim.N", "Swizzor.gen!E", "Swizzor.gen!I", "VB.AT",
    "Wintrim.BX", "Yuner.A", "Adialer.C", "Agent.FYI", "Hardoing"
]

FAMILY_CATEGORIES = {
    "Worm": ["Allaple.A", "Allaple.L", "Yuner.A", "Autorun.K"],
    "Trojan": ["Dialplatform.B", "Dontovo.A", "Fakerean", "Instantaccess", "Skintrim.N", "Agent.FYI", "Hardoing", "Adialer.C"],
    "Rogue": ["Alueron.gen!J", "C2LOP.P", "C2LOP.gen!g"],
    "Backdoor": ["Rbot!gen", "Malex.gen!J", "VB.AT"],
    "Downloader": ["Swizzor.gen!E", "Swizzor.gen!I", "Obfuscator.AD", "Lolyda.AA1", "Lolyda.AA2", "Lolyda.AT", "Wintrim.BX"]
}

def generate_synthetic_malware_image(family_name, image_size=(224, 224), seed=None):
    """
    Generates a realistic 224x224 grayscale image simulating the byte structure
    of a Windows PE executable for a specific malware family.
    
    Structure simulated:
    - Top 10%: PE Header (semi-structured bytes with metadata patterns)
    - Next 45%: .text section (Assembly instructions with vertical/horizontal code texture)
    - Next 25%: Malicious Payload (Family-specific signature texture / high-entropy encryption)
    - Next 10%: .data section (Strings and tables)
    - Last 10%: Zero-padding / Alignment blocks (solid dark bands)
    """
    if seed is not None:
        np.random.seed(seed)
    else:
        np.random.seed(abs(hash(family_name)) % 100000)

    h, w = image_size
    img = np.zeros((h, w), dtype=np.uint8)
    
    # 1. PE Header Section (rows 0 to 22)
    header_h = int(h * 0.10)
    # MZ header signature and DOS stub
    img[0:header_h, :] = np.random.choice([0, 77, 90, 144, 255, 128, 64], size=(header_h, w), p=[0.25, 0.1, 0.1, 0.2, 0.15, 0.1, 0.1])
    
    # 2. .text Section (rows 22 to 125) - Assembly Instructions texture
    text_end = int(h * 0.55)
    text_h = text_end - header_h
    # Code typically has structured repetitive opcode frequencies (push, mov, call, jmp)
    code_pattern = np.random.randint(60, 190, size=(text_h, w), dtype=np.uint8)
    # Introduce assembly striping (cache lines / instruction alignment)
    stripes = np.sin(np.linspace(0, 15 * np.pi, text_h)).reshape(-1, 1) * 30
    code_pattern = np.clip(code_pattern + stripes, 0, 255).astype(np.uint8)
    img[header_h:text_end, :] = code_pattern

    # 3. Payload Section (rows 125 to 180) - Unique to Malware Family
    payload_end = int(h * 0.80)
    payload_h = payload_end - text_end
    
    if "Allaple" in family_name:
        # Dense polymorphic decryptor loop pattern (high contrast stripes)
        payload = np.tile(np.linspace(20, 240, w, dtype=np.uint8), (payload_h, 1))
        payload = (payload + np.random.randint(-20, 20, size=(payload_h, w))).clip(0, 255).astype(np.uint8)
    elif "Fakerean" in family_name or "Dontovo" in family_name:
        # High-entropy encrypted shellcode (looks like random white sand/noise)
        payload = np.random.randint(0, 256, size=(payload_h, w), dtype=np.uint8)
    elif "Yuner" in family_name or "Autorun" in family_name:
        # Grid-like resource embedding
        grid = (np.indices((payload_h, w))[0] // 8 + np.indices((payload_h, w))[1] // 8) % 2
        payload = (grid * 180 + np.random.randint(20, 70, size=(payload_h, w))).clip(0, 255).astype(np.uint8)
    else:
        # General trojan / backdoor byte blocks
        payload = np.random.choice([30, 80, 160, 220], size=(payload_h, w), p=[0.3, 0.3, 0.2, 0.2]).astype(np.uint8)
        
    img[text_end:payload_end, :] = payload

    # 4. .data Section (rows 180 to 202) - Semi-sparse string tables
    data_end = int(h * 0.90)
    data_h = data_end - payload_end
    data_pattern = np.random.choice([0, 32, 65, 97, 122, 255], size=(data_h, w), p=[0.4, 0.2, 0.1, 0.1, 0.1, 0.1]).astype(np.uint8)
    img[payload_end:data_end, :] = data_pattern

    # 5. Zero-padding / Alignment at end (rows 202 to 224) - Solid dark blocks
    img[data_end:h, :] = np.random.choice([0, 15], size=(h - data_end, w), p=[0.85, 0.15]).astype(np.uint8)

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

import os
import sys
import time
import zipfile
import urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
SAMPLE_DIR = os.path.join(DATA_DIR, "sample")

os.makedirs(SAMPLE_DIR, exist_ok=True)

# 25 ground-truth Malimg families
CANONICAL_FAMILIES = [
    "Adialer.C", "Agent.FYI", "Allaple.A", "Allaple.L", "Alueron.gen!J",
    "Autorun.K", "C2LOP.P", "C2LOP.gen!g", "Dialplatform.B", "Dontovo.A",
    "Fakerean", "Instantaccess", "Lolyda.AA1", "Lolyda.AA2", "Lolyda.AA3",
    "Lolyda.AT", "Malex.gen!J", "Obfuscator.AD", "Rbot!gen", "Skintrim.N",
    "Swizzor.gen!E", "Swizzor.gen!I", "VB.AT", "Wintrim.BX", "Yuner.A"
]

def clean_old_synthetic_samples():
    """Removes old synthetic sample_*.png files from data/sample."""
    print("[CLEAN] Cleaning old synthetic files (sample_*.png)...")
    removed = 0
    for root, dirs, files in os.walk(SAMPLE_DIR):
        for f in files:
            if f.startswith("sample_") and f.endswith(".png"):
                os.remove(os.path.join(root, f))
                removed += 1
    # Also handle legacy Hardoing folder if empty
    hardoing_dir = os.path.join(SAMPLE_DIR, "Hardoing")
    if os.path.exists(hardoing_dir) and not os.listdir(hardoing_dir):
        os.rmdir(hardoing_dir)
    print(f"[CLEAN] Removed {removed} synthetic files.")

def download_file_multithreaded(url, dest_path, max_workers=6, chunk_size=4*1024*1024):
    """Downloads a file using HTTP Range multi-threaded chunk requests."""
    print(f"\n[DOWNLOAD] Resolving {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        furl = resp.geturl()
        total_size = int(resp.headers.get('Content-Length', 0))

    mb = total_size / (1024 * 1024)
    print(f"[DOWNLOAD] File size: {mb:.2f} MB ({total_size:,} bytes)")
    
    num_chunks = (total_size + chunk_size - 1) // chunk_size
    print(f"[DOWNLOAD] Splitting into {num_chunks} chunks using {max_workers} threads...")

    with open(dest_path, 'wb') as f:
        f.truncate(total_size)

    def download_part(idx):
        start = idx * chunk_size
        end = min(total_size - 1, (idx + 1) * chunk_size - 1)
        req = urllib.request.Request(furl, headers={'User-Agent': 'Mozilla/5.0', 'Range': f'bytes={start}-{end}'})
        for attempt in range(5):
            try:
                with urllib.request.urlopen(req, timeout=40) as r:
                    data = r.read()
                    return idx, start, data
            except Exception as e:
                if attempt == 4:
                    raise e
                time.sleep(1 + attempt)

    t0 = time.time()
    completed_bytes = 0
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = [pool.submit(download_part, i) for i in range(num_chunks)]
        with open(dest_path, 'r+b') as f:
            for fut in futures:
                idx, start, data = fut.result()
                f.seek(start)
                f.write(data)
                completed_bytes += len(data)
                done_mb = completed_bytes / (1024 * 1024)
                pct = (completed_bytes / total_size) * 100
                elapsed = time.time() - t0
                speed = done_mb / max(0.1, elapsed)
                sys.stdout.write(f"\r[DOWNLOAD] Progress: {done_mb:.1f}/{mb:.1f} MB ({pct:.1f}%) @ {speed:.2f} MB/s")
                sys.stdout.flush()

    print(f"\n[DOWNLOAD] Completed in {time.time() - t0:.1f}s")

def extract_zip_to_sample(zip_path):
    """Extracts images from zip and maps them into data/sample/<family>/."""
    print(f"[EXTRACT] Extracting {os.path.basename(zip_path)} into {SAMPLE_DIR}...")
    extracted_count = 0
    with zipfile.ZipFile(zip_path, 'r') as z:
        for member in z.infolist():
            if member.is_dir():
                continue
            # Path inside zip is e.g. 'test/Adialer.C/018066f21bc00a3f0c0477db13511a5f.png'
            parts = member.filename.replace('\\', '/').split('/')
            if len(parts) >= 3:
                family = parts[1]
                filename = parts[2]
                family_dir = os.path.join(SAMPLE_DIR, family)
                os.makedirs(family_dir, exist_ok=True)
                dest_file = os.path.join(family_dir, filename)
                with z.open(member) as src, open(dest_file, 'wb') as dst:
                    dst.write(src.read())
                extracted_count += 1

    print(f"[EXTRACT] Extracted {extracted_count} real malware images from {os.path.basename(zip_path)}.")

def summarize_sample_dataset():
    """Prints breakdown of images per family in data/sample."""
    print("\n" + "="*65)
    print("  MALIMG BENCHMARK DATASET INVENTORY (data/sample)")
    print("="*65)
    total_images = 0
    family_counts = {}
    for fam in CANONICAL_FAMILIES:
        fam_dir = os.path.join(SAMPLE_DIR, fam)
        if os.path.exists(fam_dir):
            images = [f for f in os.listdir(fam_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            count = len(images)
            family_counts[fam] = count
            total_images += count
            print(f"  {fam:<22} : {count:>5} images")
        else:
            print(f"  {fam:<22} :     0 images (MISSING)")
            family_counts[fam] = 0
    print("="*65)
    print(f"  TOTAL GROUND-TRUTH SAMPLES LOADED : {total_images:>5} / 9,339")
    print("="*65 + "\n")
    return family_counts

def main():
    clean_old_synthetic_samples()

    # Step 1: Extract test_temp.zip if already present
    test_zip = os.path.join(DATA_DIR, "test_temp.zip")
    if os.path.exists(test_zip):
        extract_zip_to_sample(test_zip)
        try:
            os.remove(test_zip)
        except Exception:
            pass

    # Step 2: Download and extract val.zip
    val_url = "https://huggingface.co/datasets/yanjunxi/Malimg/resolve/main/val.zip"
    val_zip = os.path.join(DATA_DIR, "val_temp.zip")
    download_file_multithreaded(val_url, val_zip, max_workers=6)
    extract_zip_to_sample(val_zip)
    try:
        os.remove(val_zip)
    except Exception:
        pass

    # Step 3: Download and extract train.zip
    train_url = "https://huggingface.co/datasets/yanjunxi/Malimg/resolve/main/train.zip"
    train_zip = os.path.join(DATA_DIR, "train_temp.zip")
    download_file_multithreaded(train_url, train_zip, max_workers=8)
    extract_zip_to_sample(train_zip)
    try:
        os.remove(train_zip)
    except Exception:
        pass

    # Step 4: Final verification and summary
    summarize_sample_dataset()

if __name__ == "__main__":
    main()

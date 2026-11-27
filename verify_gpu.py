"""
X-MalViT GPU Hardware & CUDA Compute Verification Engine.
Tests matrix multiplication and Tensor Core throughput on NVIDIA GeForce RTX 4050.
"""

import time
import torch

def verify_gpu():
    print("=" * 70)
    print("       X-MalViT NVIDIA GPU & CUDA COMPUTE VERIFICATION")
    print("=" * 70)

    cuda_available = torch.cuda.is_available()
    print(f"\n[1] CUDA Driver & Hardware Status:")
    print(f"    - torch.cuda.is_available() : {cuda_available}")

    if not cuda_available:
        print("\n[!] WARNING: CUDA is NOT available in this Python environment.")
        return

    device_count = torch.cuda.device_count()
    device_name = torch.cuda.get_device_name(0)
    total_mem = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
    cuda_version = torch.version.cuda
    cudnn_version = torch.backends.cudnn.version()

    print(f"    - Active GPU Device         : {device_name}")
    print(f"    - Total Dedicated VRAM      : {total_mem:.2f} GB")
    print(f"    - CUDA Version              : {cuda_version}")
    print(f"    - cuDNN Version             : {cudnn_version}")
    print(f"    - Device Count              : {device_count}")

    print(f"\n[2] Live GPU Tensor Stress Test (FP16 Tensor Cores):")
    print("    --> Allocating large 4096 x 4096 tensors on NVIDIA RTX 4050...")

    # Allocate tensor on GPU
    device = torch.device("cuda:0")
    vram_before = torch.cuda.memory_allocated(device) / (1024 ** 2)
    print(f"    --> VRAM Allocated Before   : {vram_before:.2f} MB")

    a = torch.randn(4096, 4096, dtype=torch.float16, device=device)
    b = torch.randn(4096, 4096, dtype=torch.float16, device=device)
    torch.cuda.synchronize()

    vram_after = torch.cuda.memory_allocated(device) / (1024 ** 2)
    print(f"    --> VRAM Allocated After    : {vram_after:.2f} MB")

    print("\n[3] Running 500 Matrix Multiplications on CUDA Cores...")
    print("    (Watch Windows Task Manager -> GPU -> Change '3D' dropdown to 'Cuda')")

    start = time.time()
    for _ in range(500):
        c = torch.matmul(a, b)
    torch.cuda.synchronize()
    elapsed = time.time() - start

    tflops = (500 * 2 * (4096 ** 3)) / (elapsed * 1e12)
    print(f"\n[4] Benchmark Results:")
    print(f"    - Time Taken for 500 GEMMs  : {elapsed:.3f} seconds")
    print(f"    - Estimated Compute Speed   : {tflops:.2f} TFLOPS")
    print(f"    - Max VRAM Peak Usage       : {torch.cuda.max_memory_allocated(device) / (1024 ** 2):.2f} MB")
    print("\n[OK] SUCCESS! Your NVIDIA GeForce RTX 4050 GPU is actively executing PyTorch CUDA tensors!")
    print("=" * 70)

if __name__ == "__main__":
    verify_gpu()

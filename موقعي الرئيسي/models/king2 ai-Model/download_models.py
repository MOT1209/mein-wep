#!/usr/bin/env python3
"""
تحميل GGUF files من HuggingFace + llama.cpp server لنظام Windows
بدون الحاجة إلى LM Studio
"""
import os
import sys
import json
import zipfile
import tempfile
import shutil
from pathlib import Path

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_CONFIGS = {
    "gemma": {
        "repo_id": "lmstudio-community/gemma-4-E4B-it-GGUF",
        "filename": "gemma-4-e4b-it-q4_k_m.gguf",
        "path": os.path.join(MODELS_DIR, "gemma-4-e4b", "gemma-4-e4b-it-q4_k_m.gguf"),
        "human_size": "~4.5 GB"
    },
    "qwen": {
        "repo_id": "lmstudio-community/Qwen3.5-9B-GGUF",
        "filename": "qwen3.5-9b-q4_k_m.gguf",
        "path": os.path.join(MODELS_DIR, "qwen3.5-9b", "qwen3.5-9b-q4_k_m.gguf"),
        "human_size": "~6 GB"
    }
}


def check_disk_space(required_gb):
    """Check if enough disk space is available."""
    try:
        import shutil
        usage = shutil.disk_usage(BASE_DIR)
        free_gb = usage.free / (1024 ** 3)
        if free_gb < required_gb:
            print(f"⚠️  مساحة غير كافية! متاح: {free_gb:.1f}GB, المطلوب: {required_gb}GB")
            return False
        print(f"✅ مساحة كافية: {free_gb:.1f}GB متاحة")
        return True
    except:
        return True


def download_gguf(model_id):
    """Download GGUF model from HuggingFace."""
    cfg = MODEL_CONFIGS[model_id]
    dest_path = cfg["path"]
    dest_dir = os.path.dirname(dest_path)

    if os.path.exists(dest_path):
        size_gb = os.path.getsize(dest_path) / (1024 ** 3)
        print(f"✅ {model_id}: موجود بالفعل ({size_gb:.1f} GB)")
        return True

    os.makedirs(dest_dir, exist_ok=True)
    print(f"📥 جاري تحميل {model_id} ({cfg['human_size']}) من HuggingFace...")
    print(f"   {cfg['repo_id']}/{cfg['filename']}")

    try:
        from huggingface_hub import hf_hub_download, HfFileSystem
        fs = HfFileSystem()
        files = fs.ls(f"{cfg['repo_id']}")
        gguf_files = [f for f in files if f['name'].endswith('.gguf') and 'q4' in f['name'].lower()]
        if gguf_files:
            print(f"   الملفات المتاحة: {[os.path.basename(f['name']) for f in gguf_files]}")

        downloaded = hf_hub_download(
            repo_id=cfg["repo_id"],
            filename=cfg["filename"],
            local_dir=dest_dir,
            local_dir_use_symlinks=False,
            resume_download=True,
        )
        print(f"✅ تم تحميل {model_id} بنجاح!")
        return True
    except Exception as e:
        print(f"❌ فشل تحميل {model_id}: {e}")
        return False


def download_llama_cpp_server():
    """Download prebuilt llama.cpp server binary for current platform."""
    import sys as _sys
    import urllib.request

    server_dir = os.path.join(BASE_DIR, "llama_cpp")
    os.makedirs(server_dir, exist_ok=True)

    if _sys.platform == "win32":
        server_bin = os.path.join(server_dir, "llama-server.exe")
        zip_name = "llama-{tag}-bin-win-cpu-x64.zip"
        exe_name = "llama-server.exe"
        temp_zip = os.path.join(tempfile.gettempdir(), "llama-cpp-win.zip")
    elif _sys.platform == "linux":
        server_bin = os.path.join(server_dir, "llama-server")
        zip_name = "llama-{tag}-bin-ubuntu-x64.tar.gz"
        exe_name = "llama-server"
        temp_zip = os.path.join(tempfile.gettempdir(), "llama-cpp-linux.tar.gz")
    else:
        print(f"⚠️  نظام غير مدعوم: {_sys.platform}")
        return None

    if os.path.exists(server_bin):
        print(f"✅ llama-server موجود بالفعل")
        return server_bin

    print(f"📥 جاري تحميل llama.cpp server لـ {_sys.platform}...")

    try:
        release_tag = "b5029"
        zip_url = f"https://github.com/ggml-org/llama.cpp/releases/download/{release_tag}/{zip_name.format(tag=release_tag)}"

        print(f"   تحميل من: {zip_url}")
        urllib.request.urlretrieve(zip_url, temp_zip)
        print(f"   تم تحميل الملف")

        if _sys.platform == "win32":
            with zipfile.ZipFile(temp_zip, 'r') as zf:
                for member in zf.namelist():
                    if member.endswith(exe_name):
                        print(f"   استخراج: {member}")
                        with zf.open(member) as source:
                            with open(server_bin, 'wb') as target:
                                shutil.copyfileobj(source, target)
                        os.chmod(server_bin, 0o755)
                        break
        else:
            import tarfile
            with tarfile.open(temp_zip, 'r:gz') as tf:
                for member in tf.getmembers():
                    if member.name.endswith(exe_name):
                        print(f"   استخراج: {member.name}")
                        tf.extract(member, server_dir)
                        extracted = os.path.join(server_dir, member.name)
                        if extracted != server_bin:
                            shutil.move(extracted, server_bin)
                        os.chmod(server_bin, 0o755)
                        break

        os.remove(temp_zip)

        if os.path.exists(server_bin):
            print(f"✅ تم تحميل llama-server بنجاح!")
            return server_bin
        else:
            print(f"❌ {exe_name} غير موجود في الملف")
            return None

    except Exception as e:
        print(f"❌ فشل تحميل llama-server: {e}")
        print("يمكنك تحميله يدوياً من: https://github.com/ggml-org/llama.cpp/releases")
        return None


def download_all():
    """Download all required files."""
    print("=" * 60)
    print("👑 KING2 - تحميل النماذج المحلية")
    print("=" * 60)

    # Check disk space (models: ~10.5GB + server: ~50MB)
    if not check_disk_space(12):
        print("❌ مساحة غير كافية للتحميل")
        return False

    # Download llama.cpp server
    server_path = download_llama_cpp_server()
    if not server_path:
        print("⚠️  فشل تحميل llama-server. سيتم استخدام LM Studio كبديل")
        return False

    # Download GGUF models
    for model_id in ["gemma", "qwen"]:
        success = download_gguf(model_id)
        if not success:
            print(f"⚠️  فشل تحميل {model_id}")

    print()
    print("=" * 60)
    print("📋 ملخص:")
    for model_id, cfg in MODEL_CONFIGS.items():
        path = cfg["path"]
        if os.path.exists(path):
            size_gb = os.path.getsize(path) / (1024 ** 3)
            print(f"✅ {model_id}: {size_gb:.1f} GB")
        else:
            print(f"❌ {model_id}: لم يتم التحميل")
    print(f"{'✅' if os.path.exists(server_path) else '❌'} llama-server")
    print("=" * 60)


if __name__ == "__main__":
    download_all()

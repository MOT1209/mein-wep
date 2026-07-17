#!/usr/bin/env python3
"""
KING2 AI Training - File Delivery Tool
يستخرج run_train.py من base64 المضمن ويحفظه في qualquer مسار
الاستخدام: python deliver.py [output_path]
"""

import base64
import os
import sys

B64 = "IyEvdXNyL2Jpbi9lbnYgcHl0aG9uMwoiIiIK...<base64_cut_for_brevity>..."

def get_b64():
    return B64

def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "run_train.py"
    d = os.path.dirname(path)
    if d:
        os.makedirs(d, exist_ok=True)
    with open(path, "wb") as f:
        f.write(base64.b64decode(get_b64()))
    kb = os.path.getsize(path) // 1024
    print(f"Saved: {path} ({kb} KB)")
    print("Place this in Google Drive -> Alking_AI_Train folder")
    print("Colab will auto-detect and run it")

if __name__ == "__main__":
    main()

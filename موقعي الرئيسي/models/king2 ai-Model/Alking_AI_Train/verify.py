#!/usr/bin/env python3
"""Verify all training files are valid"""
import os, sys, json, py_compile

errors = []
base = os.path.dirname(os.path.abspath(__file__))

# 1. Check Python syntax
for fname in ["run_train.py", "upload_to_drive.py", "prepare_data.py"]:
    fpath = os.path.join(base, fname)
    try:
        py_compile.compile(fpath, doraise=True)
        print(f"OK  {fname} - syntax valid")
    except py_compile.PyCompileError as e:
        print(f"ERR {fname} - {e}")
        errors.append(fname)

# 2. Check JSON data
jpath = os.path.join(base, "king2_training.json")
with open(jpath, "r", encoding="utf-8") as f:
    data = json.load(f)
print(f"OK  king2_training.json - {len(data)} entries")

# Check format
roles_found = set()
for entry in data:
    for c in entry.get("conversations", []):
        roles_found.add(c.get("from", "?"))
print(f"    Roles: {roles_found}")
print(f"    Sample: {data[0]['conversations'][1]['value'][:60]}...")

# 3. Check dataset_info.json
dpath = os.path.join(base, "dataset_info.json")
with open(dpath, "r", encoding="utf-8") as f:
    info = json.load(f)
print(f"OK  dataset_info.json - datasets: {list(info.keys())}")

# Summary
if errors:
    print(f"\nERRORS in: {errors}")
    sys.exit(1)
else:
    print(f"\nAll files valid! Ready for Google Drive upload.")

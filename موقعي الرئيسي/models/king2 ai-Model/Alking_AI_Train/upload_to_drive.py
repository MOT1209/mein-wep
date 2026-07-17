#!/usr/bin/env python3
"""
رفع ملفات KING2 التدريبية إلى Google Drive (مجلد Alking_AI_Train)
الاستخدام:
  1. ثبت المتطلبات: pip install pydrive2
  2. شغّل: python upload_to_drive.py

سيفتح متصفحاً لتسجيل الدخول إلى Google (مرة واحدة فقط)
"""

import os
import sys
import json

FOLDER_NAME = "Alking_AI_Train"
FILES_TO_UPLOAD = [
    "run_train.py",
    "king2_training.json",
    "dataset_info.json",
]

try:
    from pydrive2.auth import GoogleAuth
    from pydrive2.drive import GoogleDrive
except ImportError:
    print("تحتاج تثبيت pydrive2:")
    print("  pip install pydrive2")
    sys.exit(1)

def find_or_create_folder(drive, folder_name):
    query = f"title='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    folders = drive.ListFile({'q': query}).GetList()
    if folders:
        folder = folders[0]
        print(f"المجلد '{folder_name}' موجود (id: {folder['id']})")
        return folder
    folder = drive.CreateFile({
        'title': folder_name,
        'mimeType': 'application/vnd.google-apps.folder'
    })
    folder.Upload()
    print(f"تم إنشاء المجلد '{folder_name}' (id: {folder['id']})")
    return folder

def upload_file(drive, local_path, folder_id):
    title = os.path.basename(local_path)
    query = f"title='{title}' and '{folder_id}' in parents and trashed=false"
    existing = drive.ListFile({'q': query}).GetList()

    file = drive.CreateFile({
        'title': title,
        'parents': [{'id': folder_id}]
    }) if not existing else existing[0]

    file.SetContentFile(local_path)
    file.Upload()
    print(f"  {'✅' if not existing else '🔄'} {title} ({os.path.getsize(local_path)/1024:.0f} KB)")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))

    print("Google Drive authentication...")
    gauth = GoogleAuth()
    gauth.LocalWebserverAuth()
    drive = GoogleDrive(gauth)

    folder = find_or_create_folder(drive, FOLDER_NAME)

    print(f"\nرفع {len(FILES_TO_UPLOAD)} ملفات إلى '{FOLDER_NAME}':")
    for fname in FILES_TO_UPLOAD:
        fpath = os.path.join(base_dir, fname)
        if os.path.exists(fpath):
            upload_file(drive, fpath, folder['id'])
        else:
            print(f"  ⚠️  الملف غير موجود: {fname}")

    print(f"\nالرفع اكتمل! الملفات في Google Drive/{FOLDER_NAME}/")
    print("كولاب سيكتشف run_train.py وينفذه تلقائياً.")

if __name__ == "__main__":
    main()

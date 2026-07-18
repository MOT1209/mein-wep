import os
from dotenv import load_dotenv

load_dotenv()

def check_keys():
    print("--- تشخيص مفاتيح الـ API ---")
    keys = ["GEMINI_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY"]
    for key in keys:
        val = os.getenv(key)
        if val and val != "your_api_key_here":
            print(f"✅ {key} موجود.")
        else:
            print(f"❌ {key} مفقود أو لم يتم تغييره!")

if __name__ == "__main__":
    check_keys()
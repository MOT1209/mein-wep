import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, 'knowledge_base.json'), 'r', encoding='utf-8') as f:
    kb = json.load(f)

entries = kb.get('knowledge', [])

os.makedirs(os.path.join(BASE_DIR, 'data'), exist_ok=True)

KING2_SYSTEM = (
    'أنت KING2، مساعد الذكاء الاصطناعي الملكي المتطور. '
    'أجب بالعربية الفصحى أولاً دائماً. '
    'كن مختصراً ومفيداً وواضحاً.'
)

# LLaMA Factory format: ShareGPT-style
output = []
for e in entries:
    if not e.get('question') or not e.get('answer'):
        continue
    question = e['question'].strip()
    answer = e['answer'].strip()
    if len(question) < 2 or len(answer) < 2:
        continue
    item = {
        "conversations": [
            {"from": "system", "value": KING2_SYSTEM},
            {"from": "human", "value": question},
            {"from": "gpt", "value": answer}
        ]
    }
    output.append(item)

with open(os.path.join(BASE_DIR, 'data', 'king2_training.json'), 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

# Also create dataset_info.json for LLaMA Factory
dataset_info = {
    "king2_training": {
        "file_name": "king2_training.json",
        "formatting": "sharegpt",
        "columns": {
            "messages": "conversations"
        },
        "tags": {
            "role_tag": "from",
            "content_tag": "value",
            "user_tag": "human",
            "assistant_tag": "gpt",
            "system_tag": "system"
        }
    }
}

with open(os.path.join(BASE_DIR, 'data', 'dataset_info.json'), 'w', encoding='utf-8') as f:
    json.dump(dataset_info, f, ensure_ascii=False, indent=2)

print(f"OK Converted {len(output)} entries")
print(f"File: data/king2_training.json")
print(f"File: data/dataset_info.json")

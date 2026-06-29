---
base_model: Qwen/Qwen2.5-3B-Instruct
library_name: peft
pipeline_tag: text-generation
tags:
- llama-factory
- unsloth
- lora
- qlora
- arabic
- qwen
- king2
- text-generation
- conversational
---
# 👑 KING2 AI — Qwen2.5-3B-Instruct (LoRA)

**KING2** هو مساعد ذكاء اصطناعي ملكي باللغة العربية، مبني على نموذج Qwen2.5-3B-Instruct باستخدام تقنية LoRA.
هذا الـ Adapter يُضفي على النموذج شخصية KING2 — مساعد عربي فصيح، ملكي الطابع، قادر على الإجابة عن الأسئلة الرياضية والعلمية والأدبية بأسلوب راقٍ ومتقن.

> النموذج مُدرّب على قاعدة معرفة KING2 التي تضم 71 مدخلاً نظيفاً في مجالات متنوعة.

---

## 🎯 القدرات

- **الإجابة بالعربية الفصحى** — أسلوب ملكي فصيح ومهذّب
- **حل المسائل الرياضية** — حساب، جبر، هندسة، إحصاء، تفاضل وتكامل
- **شرح المفاهيم العلمية** — بأسلوب بسيط وعميق
- **الكتابة الإبداعية والتحليل** — نصوص، تحليلات، شروحات
- **الرد بلغة المستخدم** — يتكيف مع اللغة التي يخاطبه بها المستخدم (عربي / إنجليزي)

---

## 📊 تفاصيل التدريب

### 📁 البيانات

| الخاصية | الوصف |
|---------|-------|
| **المصدر** | قاعدة معرفة KING2 (71 مدخلاً نظيفاً) |
| **التصنيفات** | حساب، جبر، هندسة، إحصاء، تفاضل وتكامل، رياضيات، عام، سلام |
| **التنسيق** | ShareGPT (LLaMA Factory format) |
| **الـ Dataset** | [RASHID778/king2-training-data](https://huggingface.co/datasets/RASHID778/king2-training-data) |

### ⚙️ Hyperparameters

| المعيار | القيمة |
|---------|--------|
| LoRA rank (r) | 16 |
| LoRA alpha | 32 |
| LoRA dropout | 0.1 |
| target_modules | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| num_train_epochs | 5 |
| effective batch size | 8 |
| learning rate | 2e-4 |
| scheduler | cosine |
| optimizer | adamw_8bit |
| precision | bf16 |
| quantization | 4-bit QLoRA (NF4) |

### 📚 المكتبات المستخدمة

- **[Unsloth](https://github.com/unslothai/unsloth)** — تدريب سريع ومُحسَّن
- **PEFT / LoRA** — ضبط دقيق منخفض التكلفة
- **Transformers** — تحميل النموذج والمعالجة
- **TRL (SFTTrainer)** — التدريب بالإشراف
- **BitsAndBytes** — التكميم 4-bit

---

## 🚀 طريقة الاستخدام
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch

BASE = 'Qwen/Qwen2.5-3B-Instruct'
ADAPTER = 'RASHID778/king2-qwen2.5-3b'

tokenizer = AutoTokenizer.from_pretrained(BASE)
model = AutoModelForCausalLM.from_pretrained(
    BASE,
    torch_dtype=torch.bfloat16,
    device_map='auto'
)
model = PeftModel.from_pretrained(model, ADAPTER)

messages = [
    {'role': 'system', 'content': 'أنت KING2، مساعد الذكاء الاصطناعي الملكي المتطور.'},
    {'role': 'user', 'content': 'اشرح لي نظرية فيثاغورس'}
]

text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)
inputs = tokenizer(text, return_tensors='pt').to(model.device)
outputs = model.generate(
    **inputs,
    max_new_tokens=512,
    temperature=0.7,
    do_sample=True
)

print(tokenizer.decode(
    outputs[0][inputs.input_ids.shape[1]:],
    skip_special_tokens=True
))
```
---

## 🌐 Spaces

يمكنك تجربة KING2 مباشرة عبر الرابط التالي:

[🚀 جرب KING2 على Hugging Face Spaces](https://huggingface.co/spaces/RASHID778/king2-qwen2.5-3b)

---

## 📜 الترخيص

- **النموذج الأساسي:** Qwen2.5-3B-Instruct (مرخص تحت [Apache 2.0](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct))
- **LoRA Adapter:** يُستخدم وفق شروط ترخيص النموذج الأساسي

---

## 📧 Contact

- **المطور:** RASHID778
- **GitHub:** [https://github.com/MOT1209](https://github.com/MOT1209)

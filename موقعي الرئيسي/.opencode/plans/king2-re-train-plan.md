# خطة إعادة تدريب KING2 AI

## الهدف
إصلاح نقاط الضعف في النموذج `RASHID778/king2-qwen2.5-3b`:
1. ✅ **Model Card** → كتابة README.md كامل
2. ✅ **بيانات التدريب** → تنظيف وتحسين (71 entry نظيف)
3. ✅ **Colab Notebook** → تدريب أقوى مع Unsloth
4. ✅ **رفع البيانات + النموذج** → لـ HuggingFace

## الملفات المطلوب إنشاؤها

### 1. `data/king2_training_clean.json`
بيانات التدريب بعد التنظيف - 71 entry
- تم إزالة 5 تكرارات
- تم إزالة entry ضعيف (ساشاي)
- تم إزالة Self-Correction entries

### 2. `data/dataset_info.json` (موجود بالفعل)
### 3. `king2_colab_train.ipynb` (محتوى مكتوب أدناه)

---

## محتوى Colab Notebook

```json
{
 "cells": [
  {
   "cell_type": "markdown",
   "source": [
    "# 👑 KING2 AI — Fine-tuning Qwen2.5-3B-Instruct with Unsloth\n",
    "---\n",
    "إعادة تدريب نموذج KING2 على Qwen2.5-3B-Instruct باستخدام Unsloth + QLoRA\n",
    "\n",
    "هذا النوت بوك:\n",
    "1. يرفع بيانات KING2 إلى HuggingFace Dataset\n",
    "2. يدرب النموذج باستخدام Unsloth (أسرع 2x)\n",
    "3. يرفع LoRA adapter إلى RASHID778/king2-qwen2.5-3b"
   ]
  },
  {
   "cell_type": "code",
   "source": [
    "# 1. تثبيت المكتبات\n",
    "!pip install -qU unsloth\n",
    "!pip install -qU --force-reinstall --no-deps unsloth\n",
    "!pip install -qU huggingface_hub datasets"
   ]
  },
  {
   "cell_type": "code",
   "source": [
    "# 2. تسجيل الدخول إلى HuggingFace\n",
    "from huggingface_hub import login\n",
    "from google.colab import userdata\n",
    "HF_TOKEN = userdata.get('HF_TOKEN')\n",
    "if HF_TOKEN:\n",
    "    login(HF_TOKEN)\n",
    "else:\n",
    "    from huggingface_hub import login as hf_login\n",
    "    hf_login()\n",
    "from huggingface_hub import whoami\n",
    "print(f'Logged in as: {whoami()[\"name\"]}')"
   ]
  },
  {
   "cell_type": "code",
   "source": [
    "# 3. رفع بيانات KING2 إلى HuggingFace Dataset\n",
    "import json\n",
    "from google.colab import files\n",
    "print('ارفع king2_training_clean.json:')\n",
    "uploaded = files.upload()\n",
    "for fname in uploaded:\n",
    "    with open(fname, 'r', encoding='utf-8') as f:\n",
    "        training_data = json.load(f)\n",
    "    print(f'Loaded {fname}: {len(training_data)} entries')\n",
    "    break\n",
    "\n",
    "from datasets import Dataset\n",
    "ds = Dataset.from_list(training_data)\n",
    "ds.push_to_hub('RASHID778/king2-training-data', private=False)\n",
    "print(f'Dataset uploaded! https://huggingface.co/datasets/RASHID778/king2-training-data')"
   ]
  },
  {
   "cell_type": "code",
   "source": [
    "# 4. تحميل النموذج الأساسي\n",
    "from unsloth import FastLanguageModel\n",
    "model, tokenizer = FastLanguageModel.from_pretrained(\n",
    "    model_name='Qwen/Qwen2.5-3B-Instruct',\n",
    "    max_seq_length=2048,\n",
    "    load_in_4bit=True,\n",
    ")\n",
    "print(f'Model loaded! {model.num_parameters() / 1e9:.2f}B params')"
   ]
  },
  {
   "cell_type": "code",
   "source": [
    "# 5. إعداد LoRA\n",
    "model = FastLanguageModel.get_peft_model(\n",
    "    model,\n",
    "    r=16,\n",
    "    lora_alpha=32,\n",
    "    target_modules=['q_proj', 'k_proj', 'v_proj', 'o_proj',\n",
    "                   'gate_proj', 'up_proj', 'down_proj'],\n",
    "    lora_dropout=0.1,\n",
    "    bias='none',\n",
    "    use_gradient_checkpointing='unsloth',\n",
    "    random_state=42,\n",
    ")\n",
    "trainable = model.num_parameters(only_trainable=True)\n",
    "print(f'Trainable: {trainable/1e6:.2f}M params')"
   ]
  },
  {
   "cell_type": "code",
   "source": [
    "# 6. تجهيز البيانات\n",
    "from datasets import load_dataset\n",
    "dataset = load_dataset('RASHID778/king2-training-data', split='train')\n",
    "print(f'Loaded {len(dataset)} samples')\n",
    "\n",
    "SYSTEM_PROMPT = '\\u0623\\u0646\\u062a KING2\\u060c \\u0645\\u0633\\u0627\\u0639\\u062f \\u0627\\u0644\\u0630\\u0643\\u0627\\u0621 \\u0627\\u0644\\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a \\u0627\\u0644\\u0645\\u0644\\u0643\\u064a \\u0627\\u0644\\u0645\\u062a\\u0637\\u0648\\u0631. \\u0623\\u062c\\u0628 \\u0628\\u0627\\u0644\\u0639\\u0631\\u0628\\u064a\\u0629 \\u0627\\u0644\\u0641\\u0635\\u062d\\u0649 \\u0623\\u0648\\u0644\\u0627\\u064b \\u062f\\u0627\\u0626\\u0645\\u0627\\u064b. \\u0643\\u0646 \\u0645\\u062e\\u062a\\u0635\\u0631\\u0627\\u064b \\u0648\\u0645\\u0641\\u064a\\u062f\\u0627\\u064b \\u0648\\u0648\\u0627\\u0636\\u062d\\u0627\\u064b.'\n",
    "\n",
    "def fmt(example):\n",
    "    msgs = [{'role': 'system', 'content': SYSTEM_PROMPT}]\n",
    "    for c in example['conversations']:\n",
    "        r = 'user' if c['from'] == 'human' else 'assistant'\n",
    "        msgs.append({'role': r, 'content': c['value']})\n",
    "    return {'text': tokenizer.apply_chat_template(msgs, tokenize=False, add_generation_prompt=False)}\n",
    "\n",
    "dataset = dataset.map(fmt)\n",
    "print(f'Example: {dataset[0][\"text\"][:200]}...')"
   ]
  },
  {
   "cell_type": "code",
   "source": [
    "# 7. التدريب!\n",
    "from trl import SFTTrainer\n",
    "from transformers import TrainingArguments\n",
    "\n",
    "trainer = SFTTrainer(\n",
    "    model=model,\n",
    "    tokenizer=tokenizer,\n",
    "    train_dataset=dataset,\n",
    "    args=TrainingArguments(\n",
    "        output_dir='./king2-qwen-lora',\n",
    "        num_train_epochs=5,\n",
    "        per_device_train_batch_size=2,\n",
    "        gradient_accumulation_steps=4,\n",
    "        warmup_ratio=0.1,\n",
    "        logging_steps=5,\n",
    "        save_steps=50,\n",
    "        save_total_limit=2,\n",
    "        learning_rate=2e-4,\n",
    "        fp16=not torch.cuda.is_bf16_supported(),\n",
    "        bf16=torch.cuda.is_bf16_supported(),\n",
    "        optim='adamw_8bit',\n",
    "        weight_decay=0.01,\n",
    "        lr_scheduler_type='cosine',\n",
    "        max_steps=150,\n",
    "        report_to='none',\n",
    "    ),\n",
    "    max_seq_length=2048,\n",
    "    dataset_text_field='text',\n",
    ")\n",
    "\n",
    "trainer.train()\n",
    "print('Training complete!')"
   ]
  },
  {
   "cell_type": "code",
   "source": [
    "# 8. اختبار النموذج\n",
    "FastLanguageModel.for_inference(model)\n",
    "\n",
    "def ask(prompt):\n",
    "    msgs = [{'role': 'system', 'content': SYSTEM_PROMPT}, {'role': 'user', 'content': prompt}]\n",
    "    text = tokenizer.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)\n",
    "    inputs = tokenizer(text, return_tensors='pt').to('cuda')\n",
    "    out = model.generate(**inputs, max_new_tokens=512, temperature=0.7, top_p=0.9, do_sample=True)\n",
    "    return tokenizer.decode(out[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)\n",
    "\n",
    "for q in ['من أنت؟', 'ما هو الجمع؟', 'اشرح نظرية فيثاغورس', 'ما هو السلام الإيجابي؟']:\n",
    "    print(f'Q: {q}\\nA: {ask(q)}\\n---')"
   ]
  },
  {
   "cell_type": "code",
   "source": [
    "# 9. رفع النموذج إلى HuggingFace!\n",
    "from huggingface_hub import HfApi\n",
    "\n",
    "model.save_pretrained('./king2-qwen-lora-final')\n",
    "tokenizer.save_pretrained('./king2-qwen-lora-final')\n",
    "\n",
    "HfApi().upload_folder(\n",
    "    folder_path='./king2-qwen-lora-final',\n",
    "    repo_id='RASHID778/king2-qwen2.5-3b',\n",
    "    repo_type='model',\n",
    "    commit_message='Update KING2 LoRA - cleaned data, 5 epochs, Unsloth',\n",
    ")\n",
    "print('Model uploaded! https://huggingface.co/RASHID778/king2-qwen2.5-3b')"
   ]
  }
 ]
}
```

---

## محتوى Model Card (README.md للنموذج)

```markdown
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
---

# 👑 KING2 AI — Qwen2.5-3B-Instruct (LoRA)

**KING2** هو مساعد الذكاء الاصطناعي الملكي المتطور، مخصص للمتحدثين بالعربية. مبني على LoRA adapter فوق Qwen2.5-3B-Instruct.

## 🎯 القدرات
- الإجابة بالعربية الفصحى
- حل المسائل الرياضية (حساب، جبر، هندسة، إحصاء، تفاضل وتكامل)
- شرح المفاهيم العلمية والرياضية
- الكتابة الإبداعية والتحليل
- الرد بلغة المستخدم (يدعم العربية والإنجليزية)

## 📊 تفاصيل التدريب

### البيانات
- **المصدر:** قاعدة معرفة KING2 (71 مدخلاً)
- **التصنيفات:** حساب، جبر، هندسة، إحصاء، تفاضل وتكامل، رياضيات، general، peace
- **التنسيق:** ShareGPT (LLaMA Factory format)

### Hyperparameters
| المعيار | القيمة |
|---------|--------|
| **LoRA rank (r)** | 16 |
| **LoRA alpha** | 32 |
| **LoRA dropout** | 0.1 |
| **الطبقات المستهدفة** | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| **عدد العصور (epochs)** | 5 |
| **حجم الدفعة الفعّال** | 8 (batch=2, grad_accum=4) |
| **معدل التعلم** | 2e-4 |
| **جدول التعلم** | Cosine |
| **تحسين** | adamw_8bit |
| **الدقة** | bf16 (أو fp16) |
| **الكمية** | 4-bit QLoRA (NF4) |

### المكتبات
- **Unsloth** للتدريب السريع
- **PEFT** (LoRA)
- **Transformers** (HuggingFace)
- **TRL** (SFTTrainer)
- **BitsAndBytes** (4-bit quantization)

## 🚀 طريقة الاستخدام

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch

BASE_MODEL = 'Qwen/Qwen2.5-3B-Instruct'
LORA_ADAPTER = 'RASHID778/king2-qwen2.5-3b'

# 4-bit quantized loading
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    torch_dtype=torch.bfloat16,
    device_map='auto',
)
model = PeftModel.from_pretrained(model, LORA_ADAPTER)

# Chat
messages = [
    {'role': 'system', 'content': 'أنت KING2، مساعد الذكاء الاصطناعي الملكي المتطور.'},
    {'role': 'user', 'content': 'اشرح لي نظرية فيثاغورس'}
]
text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer(text, return_tensors='pt').to(model.device)
outputs = model.generate(**inputs, max_new_tokens=512, temperature=0.7)
response = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
print(response)
```

## 🌐 الـ Space
[جرب KING2 مباشرة](https://huggingface.co/spaces/RASHID778/king2-qwen2.5-3b)

## 📜 الترخيص
النموذج الأساسي: Qwen2.5-3B-Instruct (Apache 2.0)

## 📧 الاتصال
- **المطور:** RASHID778
- **GitHub:** https://github.com/MOT1209
```

---

## خطة التنفيذ

1. **إنشاء المجلدات والملفات:**
   - `models/king2 ai-Model/data/king2_training_clean.json` ← بيانات التدريب النظيفة
   - `models/king2 ai-Model/data/dataset_info.json` ← (موجود)
   - `models/king2 ai-Model/data/king2_colab_train.ipynb` ← Colab notebook
   - `models/king2 ai-Model/data/king2_training_data.zip` ← ملف مضغوط للرفع في Colab

2. **رفع البيانات إلى HuggingFace Dataset:**
   - إنشاء `RASHID778/king2-training-data`
   - رفع `king2_training_clean.json`

3. **تشغيل Colab notebook:**
   - رفع ملف البيانات في Colab
   - تسجيل الدخول لـ HuggingFace
   - تدريب النموذج مع Unsloth
   - رفع LoRA adapter إلى `RASHID778/king2-qwen2.5-3b`

4. **رفع Model Card:**
   - بعد التدريب، رفع README.md المحدث للنموذج

5. **تحديث الـ Space (اختياري):**
   - `app.py` بيشير للنموذج RASHID778/king2-qwen2.5-3b — مايحتاج تغيير
   - النوم طبيعي للحساب المجاني

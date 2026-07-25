# King2 Qwen2.5 3B

**Model ID:** `RASHID778/king2-qwen2.5-3b`

King2 Qwen2.5 3B is a fine-tuned conversational language model built on top of [Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct). It uses LoRA (Low-Rank Adaptation) to specialize the base model for general-purpose helpful assistant tasks while keeping the original base model weights frozen.

- **Base model:** `Qwen/Qwen2.5-3B-Instruct`
- **Fine-tuning method:** LoRA via PEFT
- **Training framework:** LLaMA-Factory
- **Model type:** Causal Language Model (Text Generation)
- **Architecture:** Qwen2.5 3B Instruct with adapter layers
- **Model size:** ~354 MB adapter weights
- **License:** Apache-2.0

---

## Table of Contents

- [Intended Use](#intended-use)
- [Usage](#usage)
- [Training Details](#training-details)
  - [Data](#data)
  - [Training Procedure](#training-procedure)
- [Evaluation](#evaluation)
- [Limitations](#limitations)
- [License](#license)
- [Citation](#citation)

---

## Intended Use

This model is intended for:

- General conversational AI assistant tasks
- Question answering in Arabic and English
- Text generation and summarization
- Educational and research purposes

It is **not** intended for:

- Mission-critical decision-making without human review
- Generating legal, medical, or financial advice without expert verification
- Any harmful, deceptive, or illegal use

---

## Usage

### Requirements

```bash
pip install transformers peft accelerate
```

### Loading the model with PEFT

```python
from peft import AutoPeftModelForCausalLM
from transformers import AutoTokenizer

model = AutoPeftModelForCausalLM.from_pretrained("RASHID778/king2-qwen2.5-3b")
tokenizer = AutoTokenizer.from_pretrained("RASHID778/king2-qwen2.5-3b")
```

### Generating text

```python
messages = [
    {"role": "user", "content": "What is the capital of Saudi Arabia?"}
]
inputs = tokenizer.apply_chat_template(messages, tokenize=True, return_tensors="pt", return_dict=True)
outputs = model.generate(**inputs, max_new_tokens=256, do_sample=True, temperature=0.7)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)
```

### Inference with base + adapter (recommended for merging)

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

base_model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-3B-Instruct")
model = PeftModel.from_pretrained(base_model, "RASHID778/king2-qwen2.5-3b")
# Optional: merge adapter into base model for easier deployment
merged_model = model.merge_and_unload()
```

---

## Training Details

### Data

The model was fine-tuned on a custom instruction-following dataset focused on conversational and assistant-style tasks.

For a quick 10-minute continuation run, you can use the provided Colab notebook:

```bash
notebooks/colab_train_king2_qwen25_3b.ipynb
```

- **Dataset (example):** `tatsu-lab/alpaca` (first 200 samples)
- **Languages:** Arabic, English (model target); the example dataset is English
- **Data sources:** [To be added for the original training run]
- **Preprocessing:** Prompt formatted as `### Instruction:\n...\n\n### Response:\n...`

### Training Procedure

- **Base model:** `Qwen/Qwen2.5-3B-Instruct`
- **Fine-tuning method:** LoRA
- **Framework:** LLaMA-Factory
- **Rank:** [To be added]
- **Alpha:** [To be added]
- **Learning rate:** [To be added]
- **Batch size:** [To be added]
- **Training epochs:** [To be added]
- **Optimizer:** [To be added]
- **Mixed precision:** [To be added]

> **Note:** If you would like to reproduce the results, please update the training hyperparameters above with the values from your LLaMA-Factory configuration.

---

## Evaluation

No formal benchmark results are available yet. The model was evaluated through manual testing on conversational tasks.

Planned evaluations:
- Perplexity on a held-out validation set
- Human evaluation for helpfulness and safety
- Arabic/English bilingual benchmarks

---

## Limitations

- The model may produce inaccurate or outdated information.
- It is trained on a limited dataset and may not generalize to all domains.
- As an instruction-tuned model, it may reflect biases present in the training data.
- It should not be used as a substitute for professional advice.

---

## License

This model is released under the **Apache-2.0** license.

The base model [Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct) is provided by Alibaba Cloud under its own license. Please review the base model license before using this derivative work.

---

## Citation

If you use this model in your research or project, please cite both this model and the base model:

```bibtex
@misc{king2-qwen2.5-3b,
  author = {RASHID778},
  title = {King2 Qwen2.5 3B},
  year = {2026},
  howpublished = {\url{https://huggingface.co/RASHID778/king2-qwen2.5-3b}}
}

@article{qwen2.5,
  title={Qwen2.5 Technical Report},
  author={Qwen Team},
  journal={arXiv preprint},
  year={2024}
}
```

---

## Contact

For questions or issues, please open a discussion on the [Hugging Face model page](https://huggingface.co/RASHID778/king2-qwen2.5-3b/discussions).

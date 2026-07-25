# Browser Automation Agents

Personal-use browser automation system that makes AI agents interact with websites like a human. Built with **Python + Playwright**.

> ⚠️ **For personal use only.** Credentials live in a local `.env` file, and sessions (cookies) are stored under `sessions/`. Neither file should ever be committed to version control.

---

## Features

- 🧑 Human-like behaviour: random delays, variable typing, scrolling, mouse movement
- 🍪 Session persistence: save and reuse cookies to skip login next time
-  Credentials loaded only from `.env` (never in code)
- 🧩 Base class for adding new site-specific agents in minutes
- 📦 Examples for Google, GitHub, and Hugging Face

---

## Quick Start

### 1. Install dependencies

```bash
cd agents/browser-automation
pip install -r requirements.txt
playwright install
```

### 2. Configure credentials

```bash
cp .env.example .env
# Edit .env and add your email/password for each service
```

### 3. Run an agent

```bash
python run.py github
python run.py google
python run.py hf
```

Or run an example directly:

```bash
python examples/github_agent.py
```

---

## Project Structure

```text
agents/browser-automation/
├── .env.example              # Credential template
├── .gitignore                # Hides .env and sessions/
├── requirements.txt          # Python deps
├── README.md                 # This file
├── config.py                 # Loads .env securely
├── auth_manager.py           # Helper to get service credentials
├── session_manager.py        # Save/load browser sessions
├── human_actions.py          # Human-like interaction helpers
├── base_agent.py             # Base class all agents inherit from
├── run.py                    # CLI runner
└── examples/
    ├── github_agent.py
    ├── google_agent.py
    └── hf_agent.py
```

---

## Creating a New Agent

```python
from base_agent import BaseBrowserAgent
from auth_manager import AuthManager

class MySiteAgent(BaseBrowserAgent):
    def __init__(self):
        super().__init__(site_name="mysite", start_url="https://example.com/login")
        self.creds = AuthManager().get("mysite")  # or custom env vars

    def execute_task(self, page):
        # Add your site-specific automation here
        page.goto("https://example.com/dashboard")
        print(page.title())

if __name__ == "__main__":
    MySiteAgent().run()
```

---

## Security Notes

- Never commit `.env` or `sessions/`.
- Prefer official APIs and tokens over browser login where possible.
- Some sites (e.g. Google) have strong bot detection and may require CAPTCHA or 2FA.
- Use a dedicated account, not your primary personal account, for automation.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: No module named 'playwright'` | `pip install -r requirements.txt && playwright install` |
| Login fails on first run | Manually log in once, then the session cookie will be reused |
| CAPTCHA / 2FA appears | Complete it manually; the saved session will skip it later |
| `Missing required environment variable` | Fill in `.env` from `.env.example` |

---

## License

Internal use only. Use responsibly and in compliance with each website's Terms of Service.

# 🤖 Colab Remote Control MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that lets **external AI agents** (Claude Code, OpenCode, Freebuff, Gemini CLI, etc.) execute Python and shell commands inside a running **Google Colab** notebook.

---

## ️ Architecture

```
[ External AI Agent ]
         |
         | stdio (MCP)
         v
[ This MCP Server ]  <-- runs on your local/work machine
         |
         | HTTPS via ngrok
         v
[ Google Colab Notebook ]  <-- runs a tiny Flask agent
```

Because Google Colab does not expose a public execution API, this project uses an **agent inside Colab** that opens a local HTTP server and exposes it through an **ngrok** tunnel. The MCP server forwards every tool call to that tunnel.

---

## 📦 Files

| File | Purpose |
|------|---------|
| `server.py` | MCP server with `colab_execute_python`, `colab_execute_shell`, and `colab_get_status` tools. |
| `colab_agent.ipynb` | Upload this notebook to Google Colab and run all cells. |
| `.env.example` | Example environment variables. |
| `pyproject.toml` / `requirements.txt` | Python dependencies. |

---

## 🚀 Quick Start

### 1. Get an ngrok token

1. Create a free account at [ngrok.com](https://ngrok.com).
2. Copy your **Auth Token** from the dashboard.

### 2. Set up the Colab notebook

1. Open [Google Colab](https://colab.research.google.com).
2. Upload `colab_agent.ipynb`.
3. Run all cells. The first cell will safely prompt you for:
   - A strong **API secret** (shared with the MCP server).
   - Your **ngrok auth token**.
4. Copy the **Public URL** printed by the notebook (e.g. `https://xxxx-xxx.ngrok-free.app`).

### 3. Configure the MCP server

1. Copy `.env.example` to `.env` and fill it:
   ```bash
   COLAB_NGROK_URL=https://xxxx-xxx.ngrok-free.app
   COLAB_API_SECRET=CHANGE_ME_SUPER_SECRET_TOKEN
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   # or if using uv:
   # uv pip install -r requirements.txt
   ```

### 4. Run the MCP server (one command)

Once you have created and filled `.env`, you are ready to start the MCP server.

Open a terminal in `mcp/colab-mcp` and run one of the following single commands:

#### Windows (PowerShell)
```powershell
.\run.ps1
```

#### Windows (Command Prompt)
```cmd
run.bat
```

#### Linux / macOS / WSL
```bash
./run.sh
```

#### Anywhere with Python
```bash
python run.py
```

These launchers will automatically:
1. Check for a `.env` file and copy `.env.example` if it's missing.
2. Install dependencies from `requirements.txt`.
3. Start the MCP server.

> **Note:** If `.env` was just created for the first time, the launcher will stop and ask you to fill it before continuing.

---

#### PowerShell note
If you get a "running scripts is disabled" error, run one of:
```powershell
# Option A: allow scripts for the current session
powershell -ExecutionPolicy Bypass -File run.ps1

# Option B: allow scripts for the current user (permanent)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Linux / macOS note
Make `run.sh` executable first:
```bash
chmod +x run.sh
./run.sh
```

---

### 5. Connect your AI agent

See the `configs/` folder for ready-to-use client configs. Pick the one that matches your agent and copy its contents into your client's MCP settings.

```json
{
  "mcpServers": {
    "colab-remote-control": {
      "command": "python",
      "args": ["server.py"],
      "cwd": "mcp/colab-mcp",
      "env": {
        "COLAB_NGROK_URL": "https://xxxx-xxx.ngrok-free.app",
        "COLAB_API_SECRET": "CHANGE_ME_SUPER_SECRET_TOKEN"
      }
    }
  }
}
```

Or with `uv`:

```json
{
  "mcpServers": {
    "colab-remote-control": {
      "command": "uv",
      "args": ["run", "server.py"],
      "cwd": "mcp/colab-mcp"
    }
  }
}
```

#### Supported clients

| Client | Config file |
|--------|-------------|
| Claude Code / Claude Desktop | `configs/claude-code.json` |
| OpenCode | `configs/opencode.json` |
| Freebuff | `configs/freebuff.json` |
| PI Agent (pi.dev) | `configs/pi-agent.json` |

---

## 🔧 Available Tools

| Tool | Description |
|------|-------------|
| `colab_execute_python(code)` | Execute arbitrary Python code in Colab. |
| `colab_execute_shell(command)` | Execute a shell command in Colab. |
| `colab_get_status()` | Check whether the Colab agent is reachable. |
| `colab_read_file(path)` | Read a text file from Colab. |
| `colab_write_file(path, content)` | Write text content to a file in Colab. |
| `colab_list_files(path)` | List files and directories in a Colab path. |
| `colab_generate_image(prompt, model, ...)` | Generate an image on the Colab GPU. `model` is `king2` ([RASHID778/king2-image](https://hf.co/RASHID778/king2-image), SDXL LoRA, Arabic/English) or `mage-flow` ([microsoft/Mage-Flow](https://hf.co/microsoft/Mage-Flow)). Optional `save_to` downloads the result locally. |
| `colab_download_file(remote_path, local_path)` | Download a binary file (e.g. a generated image) from Colab to this machine. |

### 🎨 Image generation notes

- Use a **GPU runtime** in Colab (Runtime → Change runtime type → T4 GPU or better).
- The first call per model downloads several GB of weights — it can take a few minutes. Later calls are fast.
- Only one model is kept in VRAM at a time; switching between `king2` and `mage-flow` reloads automatically.
- Generated images are saved in `/content/generated/` inside Colab.

---

## 🛡️ Security Notes

- **Never commit your `.env` file.** It contains your API secret.
- Keep the API secret strong and unique; anyone with the secret and ngrok URL can execute code in your Colab session.
- ngrok free URLs change every time you restart the tunnel. For a stable URL, use a paid ngrok plan or a custom tunnel.

---

## 🧪 Testing

Test the MCP server manually:

```bash
# 1. Start the server
python server.py

# 2. In another terminal, use the MCP Inspector
npx @modelcontextprotocol/inspector python server.py
```

Then call `colab_get_status` or `colab_execute_python` to verify.

---

## 📄 License

MIT

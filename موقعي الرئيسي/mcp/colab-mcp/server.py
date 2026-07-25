"""
Colab Remote Control MCP Server
================================
Enables external AI agents to execute Python and shell commands inside a
running Google Colab notebook via an ngrok tunnel.

Environment variables
---------------------
COLAB_NGROK_URL   : Public URL of the Colab agent (e.g. https://xxx.ngrok-free.app)
COLAB_API_SECRET  : Bearer token shared with the Colab agent.
"""

import base64
import os
from pathlib import Path

import httpx
from mcp.server.fastmcp import FastMCP


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
def _load_dotenv() -> None:
    """Load KEY=VALUE pairs from the .env file next to this script.

    Real environment variables take precedence over .env values.
    """
    env_file = Path(__file__).resolve().parent / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip("'\"")
        if key and key not in os.environ:
            os.environ[key] = value


_load_dotenv()

COLAB_NGROK_URL: str = os.environ.get("COLAB_NGROK_URL", "")
COLAB_API_SECRET: str = os.environ.get("COLAB_API_SECRET", "")

mcp = FastMCP("colab-remote-control")


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
def _get_config() -> tuple[str, str]:
    return COLAB_NGROK_URL, COLAB_API_SECRET


async def _call_colab(
    payload: dict,
    endpoint: str = "execute",
    *,
    method: str = "POST",
    timeout: float = 120.0,
) -> dict:
    """Forward a JSON payload to the Colab agent."""
    url, secret = _get_config()

    if not url:
        return {"status": "error", "error": "COLAB_NGROK_URL is not configured."}
    if not secret:
        return {"status": "error", "error": "COLAB_API_SECRET is not configured."}

    async with httpx.AsyncClient() as client:
        try:
            request_kwargs = {
                "url": f"{url.rstrip('/')}/{endpoint}",
                "headers": {"Authorization": f"Bearer {secret}"},
                "timeout": timeout,
            }
            if method.upper() == "GET":
                response = await client.get(**request_kwargs)
            else:
                response = await client.post(json=payload, **request_kwargs)
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException as exc:
            return {"status": "error", "error": f"Request timed out: {exc}"}
        except httpx.HTTPStatusError as exc:
            return {
                "status": "error",
                "error": f"HTTP {exc.response.status_code}: {exc.response.text}",
            }
        except Exception as exc:  # noqa: BLE001
            return {"status": "error", "error": f"Request failed: {exc}"}


def _format_result(result: dict, success_prefix: str) -> str:
    if result.get("status") == "success":
        output = result.get("output", "")
        return f"✅ {success_prefix}\n\nOutput:\n{output}"
    return f"❌ Failed.\n\nError:\n{result.get('error', 'Unknown error')}"


# ---------------------------------------------------------------------------
# MCP Tools
# ---------------------------------------------------------------------------
@mcp.tool()
async def colab_execute_python(code: str) -> str:
    """
    Execute Python code inside the connected Google Colab environment.

    Parameters
    ----------
    code : str
        The Python code to execute. Multi-line statements and imports are allowed.
    """
    result = await _call_colab({"code": code})
    return _format_result(result, "Execution successful.")


@mcp.tool()
async def colab_execute_shell(command: str) -> str:
    """
    Execute a shell command inside the connected Google Colab environment.

    Parameters
    ----------
    command : str
        The shell command to execute, e.g. 'pip install pandas' or 'nvidia-smi'.
    """
    result = await _call_colab({"command": command})
    return _format_result(result, "Shell command finished.")


@mcp.tool()
async def colab_get_status() -> str:
    """
    Check if the Colab agent is online and reachable from this MCP server.
    """
    result = await _call_colab({}, endpoint="health", method="GET")
    if result.get("status") == "ok":
        return "✅ Colab agent is online and reachable."
    return f"❌ Colab agent is unreachable.\n\nError:\n{result.get('error', 'Unknown error')}"


@mcp.tool()
async def colab_read_file(path: str) -> str:
    """
    Read the contents of a text file inside the connected Google Colab environment.

    Parameters
    ----------
    path : str
        Absolute path to the file, e.g. '/content/data.txt'.
    """
    result = await _call_colab({"path": path}, endpoint="read_file")
    if result.get("status") == "success":
        return f"✅ File read successfully.\n\nPath: {path}\n\nContent:\n{result.get('content', '')}"
    return f"❌ Failed to read file.\n\nError:\n{result.get('error', 'Unknown error')}"


@mcp.tool()
async def colab_write_file(path: str, content: str) -> str:
    """
    Write text content to a file inside the connected Google Colab environment.

    Parameters
    ----------
    path : str
        Absolute path to the file, e.g. '/content/data.txt'.
    content : str
        The text content to write.
    """
    result = await _call_colab({"path": path, "content": content}, endpoint="write_file")
    if result.get("status") == "success":
        return f"✅ File written successfully: {path}"
    return f"❌ Failed to write file.\n\nError:\n{result.get('error', 'Unknown error')}"


@mcp.tool()
async def colab_list_files(path: str) -> str:
    """
    List files and directories inside a path in the connected Google Colab environment.

    Parameters
    ----------
    path : str
        Absolute path to the directory, e.g. '/content'.
    """
    result = await _call_colab({"path": path}, endpoint="list_files")
    if result.get("status") == "success":
        files = result.get("files", [])
        files_text = "\n".join(files) if files else "(empty directory)"
        return f"✅ Files in {path}:\n\n{files_text}"
    return f"❌ Failed to list files.\n\nError:\n{result.get('error', 'Unknown error')}"


@mcp.tool()
async def colab_generate_image(
    prompt: str,
    model: str = "king2",
    negative_prompt: str = "",
    steps: int = 30,
    width: int = 1024,
    height: int = 1024,
    guidance_scale: float = 7.5,
    seed: int = -1,
    save_to: str = "",
) -> str:
    """
    Generate an image on the Colab GPU using one of the configured models.

    Parameters
    ----------
    prompt : str
        Text description of the image (Arabic or English).
    model : str
        'king2' (RASHID778/king2-image, SDXL LoRA) or 'mage-flow' (microsoft/Mage-Flow).
    negative_prompt : str
        What to avoid in the image (optional).
    steps : int
        Number of inference steps (default 30).
    width, height : int
        Image dimensions in pixels (default 1024x1024).
    guidance_scale : float
        Prompt adherence strength (default 7.5).
    seed : int
        Random seed for reproducibility; -1 for random.
    save_to : str
        Optional local file path; when set, the generated image is downloaded
        from Colab and saved there.

    Note: the first call per model downloads several GB of weights and can
    take a few minutes; later calls are fast.
    """
    result = await _call_colab(
        {
            "prompt": prompt,
            "model": model,
            "negative_prompt": negative_prompt,
            "steps": steps,
            "width": width,
            "height": height,
            "guidance_scale": guidance_scale,
            "seed": seed,
        },
        endpoint="generate_image",
        timeout=600.0,
    )
    if result.get("status") != "success":
        return f"❌ Image generation failed.\n\nError:\n{result.get('error', 'Unknown error')}"

    remote_path = result.get("path", "")
    message = (
        f"✅ Image generated with '{result.get('model', model)}'.\n\n"
        f"Colab path: {remote_path} ({result.get('width')}x{result.get('height')})"
    )

    if save_to and remote_path:
        saved = await _download_to_local(remote_path, save_to)
        message += f"\n{saved}"
    return message


async def _download_to_local(remote_path: str, local_path: str) -> str:
    """Fetch a file from Colab as base64 and write it to a local path."""
    result = await _call_colab({"path": remote_path}, endpoint="download_file", timeout=300.0)
    if result.get("status") != "success":
        return f"❌ Download failed: {result.get('error', 'Unknown error')}"
    try:
        target = Path(local_path).expanduser()
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(base64.b64decode(result.get("content_b64", "")))
        return f"✅ Saved locally: {target} ({result.get('size', '?')} bytes)"
    except Exception as exc:  # noqa: BLE001
        return f"❌ Failed to save locally: {exc}"


@mcp.tool()
async def colab_download_file(remote_path: str, local_path: str) -> str:
    """
    Download a binary file (e.g. a generated image) from Colab to this machine.

    Parameters
    ----------
    remote_path : str
        Absolute path in Colab, e.g. '/content/generated/king2_123.png'.
    local_path : str
        Local destination path, e.g. 'C:/Users/me/Pictures/out.png'.
    """
    return await _download_to_local(remote_path, local_path)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    mcp.run()

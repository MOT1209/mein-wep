"""
Integration test for the Colab Remote Control MCP server.

This test starts a local Flask server that mimics the real Colab agent,
points the MCP server at it, and exercises each tool.

Run with:
    python test_colab_mcp.py

Requires the same dependencies as server.py plus Flask for the mock agent:
    pip install mcp httpx flask
"""

import os
import sys
import asyncio
import threading
import time
from pathlib import Path

import flask

# Ensure the parent directory is on the path so we can import server.py
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


# ---------------------------------------------------------------------------
# Mock Colab agent
# ---------------------------------------------------------------------------
MOCK_SECRET = "test-secret-token"

mock_app = flask.Flask("mock-colab-agent")


def _check_auth(request):
    auth = request.headers.get("Authorization", "")
    return auth == f"Bearer {MOCK_SECRET}"


@mock_app.route("/health", methods=["GET", "POST"])
def health():
    if not _check_auth(flask.request):
        return flask.jsonify({"status": "error", "error": "Unauthorized"}), 401
    return flask.jsonify({"status": "ok"})


@mock_app.route("/execute", methods=["POST"])
def execute():
    if not _check_auth(flask.request):
        return flask.jsonify({"status": "error", "error": "Unauthorized"}), 401

    data = flask.request.get_json(force=True, silent=True) or {}
    code = data.get("code", "")
    command = data.get("command", "")

    if code:
        return flask.jsonify({"status": "success", "output": f"ran python: {code[:30]}"})
    if command:
        return flask.jsonify({"status": "success", "output": f"ran shell: {command}"})
    return flask.jsonify({"status": "error", "error": "No code or command"}), 400


@mock_app.route("/read_file", methods=["POST"])
def read_file():
    if not _check_auth(flask.request):
        return flask.jsonify({"status": "error", "error": "Unauthorized"}), 401

    data = flask.request.get_json(force=True, silent=True) or {}
    path = data.get("path", "")
    return flask.jsonify({"status": "success", "content": f"fake content of {path}"})


@mock_app.route("/write_file", methods=["POST"])
def write_file():
    if not _check_auth(flask.request):
        return flask.jsonify({"status": "error", "error": "Unauthorized"}), 401

    data = flask.request.get_json(force=True, silent=True) or {}
    path = data.get("path", "")
    return flask.jsonify({"status": "success", "path": path})


@mock_app.route("/list_files", methods=["POST"])
def list_files():
    if not _check_auth(flask.request):
        return flask.jsonify({"status": "error", "error": "Unauthorized"}), 401

    data = flask.request.get_json(force=True, silent=True) or {}
    path = data.get("path", "")
    return flask.jsonify({"status": "success", "files": ["file1.txt", "dir1/"]})


def run_mock_server(port: int) -> None:
    mock_app.run(host="127.0.0.1", port=port, use_reloader=False)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------
async def main() -> None:
    # Start a local mock Colab agent.
    mock_port = 9876
    thread = threading.Thread(target=run_mock_server, args=(mock_port,), daemon=True)
    thread.start()

    # Wait for the mock server to be ready.
    deadline = time.time() + 10
    while time.time() < deadline:
        try:
            import urllib.request
            req = urllib.request.Request(
                f"http://127.0.0.1:{mock_port}/health",
                headers={"Authorization": f"Bearer {MOCK_SECRET}"},
                method="GET",
            )
            urllib.request.urlopen(req, timeout=1)
            break
        except Exception:
            time.sleep(0.2)
    else:
        raise RuntimeError("Mock Colab agent did not start in time")

    # Import the MCP server after the mock is running.
    os.environ["COLAB_NGROK_URL"] = f"http://127.0.0.1:{mock_port}"
    os.environ["COLAB_API_SECRET"] = MOCK_SECRET

    import importlib
    import server as server_module

    importlib.reload(server_module)

    tests = [
        ("colab_get_status", server_module.colab_get_status(), "online"),
        ("colab_execute_python", server_module.colab_execute_python("print('hello')"), "ran python"),
        ("colab_execute_shell", server_module.colab_execute_shell("echo hi"), "ran shell"),
        ("colab_read_file", server_module.colab_read_file("/content/test.txt"), "fake content"),
        ("colab_write_file", server_module.colab_write_file("/content/test.txt", "hello"), "written successfully"),
        ("colab_list_files", server_module.colab_list_files("/content"), "file1.txt"),
    ]

    for name, coro, expected in tests:
        print(f"Testing {name}...")
        result = await coro
        assert expected.lower() in result.lower(), f"{name} failed: {result}"
        print(f"  OK: {result[:80]}")

    print("\nAll tests passed!")


if __name__ == "__main__":
    asyncio.run(main())

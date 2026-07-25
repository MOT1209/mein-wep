"""
One-command launcher for the Colab Remote Control MCP Server.

Usage:
    python run.py

This script:
    1. Ensures a .env file exists (copies .env.example if missing).
    2. Installs Python dependencies from requirements.txt.
    3. Starts the MCP server.
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path


def main() -> None:
    script_dir = Path(__file__).resolve().parent
    os.chdir(script_dir)

    print("=" * 44)
    print("  Colab Remote Control MCP Server")
    print("=" * 44)

    # Ensure .env exists.
    env_file = Path(".env")
    if not env_file.exists():
        print("\n.env file not found. Creating from .env.example...")
        if not Path(".env.example").exists():
            print("Error: .env.example is also missing. Please restore it.")
            sys.exit(1)
        shutil.copy(".env.example", ".env")
        print("Please edit .env with your COLAB_NGROK_URL and COLAB_API_SECRET, then run again.")
        sys.exit(1)

    # Install / update dependencies.
    print("\nInstalling dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)

    # Start the MCP server.
    print("\nStarting MCP server...")
    subprocess.run([sys.executable, "server.py"], check=True)


if __name__ == "__main__":
    main()

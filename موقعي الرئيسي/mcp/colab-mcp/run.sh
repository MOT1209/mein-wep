#!/usr/bin/env bash
# One-command launcher for the Colab Remote Control MCP Server.
# Usage: ./run.sh

set -euo pipefail

# Move to the script's directory so relative paths work.
cd "$(dirname "$0")"

echo "============================================"
echo "  Colab Remote Control MCP Server"
echo "============================================"

# Determine python executable (prefer python3, fallback to python).
PYTHON_CMD="python3"
if ! command -v "$PYTHON_CMD" >/dev/null 2>&1; then
    PYTHON_CMD="python"
fi

# Ensure .env exists.
if [ ! -f ".env" ]; then
    echo ""
    echo ".env file not found. Creating from .env.example..."
    if [ ! -f ".env.example" ]; then
        echo "Error: .env.example is also missing. Please restore it."
        exit 1
    fi
    cp ".env.example" ".env"
    echo "Please edit .env with your COLAB_NGROK_URL and COLAB_API_SECRET, then run again."
    exit 1
fi

# Install / update dependencies.
echo ""
echo "Installing dependencies..."
"$PYTHON_CMD" -m pip install -r requirements.txt

# Start the MCP server.
echo ""
echo "Starting MCP server..."
"$PYTHON_CMD" server.py

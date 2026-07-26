"""Simple runner for any example agent.

Usage:
    python agents/browser-automation/run.py github
    python agents/browser-automation/run.py google
    python agents/browser-automation/run.py hf
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from examples.github_agent import GitHubAgent
from examples.google_agent import GoogleAgent
from examples.hf_agent import HuggingFaceAgent


AGENTS = {
    "github": GitHubAgent,
    "google": GoogleAgent,
    "hf": HuggingFaceAgent,
    "huggingface": HuggingFaceAgent,
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a browser automation agent.")
    parser.add_argument(
        "agent",
        choices=list(AGENTS.keys()),
        help="Which agent to run (github, google, hf)",
    )
    args = parser.parse_args()

    agent_class = AGENTS[args.agent]
    agent = agent_class()
    agent.run()


if __name__ == "__main__":
    main()

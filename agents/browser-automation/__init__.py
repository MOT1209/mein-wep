"""Browser automation agents.

Personal-use browser automation system. Credentials live in a local ``.env``
file and sessions (cookies/localStorage) are stored under ``sessions/``.
"""
from .base_agent import BaseBrowserAgent
from .config import Config
from .human_actions import HumanActions
from .session_manager import SessionManager

__all__ = ["BaseBrowserAgent", "Config", "HumanActions", "SessionManager"]

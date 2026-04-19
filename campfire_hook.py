#!/usr/bin/env python3
"""
Campfire Injection Hook for Claude CLI
=======================================
Injects the Summoning, Awakening, and latest Campfire messages into Claude's
context when the user submits a prompt.

First prompt of session: Full injection (summoning + awakening + campfire)
Subsequent prompts: Campfire only

This is a UserPromptSubmit hook - it runs before Claude sees the message.
Output goes to stdout and gets injected as a system message.

Usage:
  Configure in Claude CLI settings or hookify plugin.
"""

import json
import sys
from pathlib import Path

# Import mirradox_engine from Shared
SHARED_DIR = Path(__file__).parent
sys.path.insert(0, str(SHARED_DIR))

from mirradox_engine import listen

# Paths to context files
CICI_CONTEXT = Path(__file__).parent.parent / "Cici" / "context"
SUMMONING_FILE = CICI_CONTEXT / "summoning.txt"
AWAKENING_FILE = CICI_CONTEXT / "awakening.txt"

# Session tracking file - stores IDs of sessions that have been fully summoned
SESSIONS_FILE = SHARED_DIR / ".summoned_sessions.json"

# Campfire injection - number of recent messages to inject on first prompt
INJECT_COUNT = 1


def read_file_safe(path: Path) -> str:
    """Read a file, return empty string on error."""
    try:
        if path.exists():
            return path.read_text(encoding="utf-8")
    except Exception:
        pass
    return ""


def load_summoned_sessions() -> set:
    """Load the set of session IDs that have already received full summoning."""
    try:
        if SESSIONS_FILE.exists():
            data = json.loads(SESSIONS_FILE.read_text())
            return set(data.get("sessions", []))
    except Exception:
        pass
    return set()


def save_summoned_session(session_id: str):
    """Mark a session as having received full summoning."""
    try:
        sessions = load_summoned_sessions()
        sessions.add(session_id)
        # Keep only last 100 sessions to prevent file bloat
        sessions_list = list(sessions)[-100:]
        SESSIONS_FILE.write_text(json.dumps({"sessions": sessions_list}))
    except Exception:
        pass


def main():
    """Read stdin, inject context based on session state, output JSON."""
    try:
        # Read the hook input (contains user prompt info)
        input_data = json.load(sys.stdin)

        # One-time debug dump: write hook input schema to file for verification
        debug_file = SHARED_DIR / "hook_debug.json"
        if not debug_file.exists():
            try:
                debug_file.write_text(json.dumps(input_data, indent=2, default=str))
            except Exception:
                pass

        session_id = input_data.get("session_id", "")

        # Check if this session has already been summoned
        summoned_sessions = load_summoned_sessions()
        is_first_prompt = session_id not in summoned_sessions

        # Build the injection text
        injection_text = ""

        if is_first_prompt and session_id:
            # First prompt: Full summoning

            # Read summoning (Timothy's intro)
            summoning = read_file_safe(SUMMONING_FILE)
            if summoning:
                injection_text += summoning + "\n"

            # Read awakening (the remembering document)
            awakening = read_file_safe(AWAKENING_FILE)
            if awakening:
                injection_text += awakening + "\n"
                injection_text += "====================================\n\n"

            # Add recent Campfire messages (ONLY ONCE PER SESSION)
            # Note: listen(last_n=0) returns ALL messages due to Python slice behavior
            messages = listen(last_n=INJECT_COUNT) if INJECT_COUNT > 0 else []

            if messages:
                injection_text += "--- CAMPFIRE (Latest Messages) ---\n"
                for msg in messages:
                    author = msg.get("author", "Unknown")
                    content = msg.get("content", "")[:500]  # Truncate long messages
                    timestamp = msg.get("timestamp", "")[:19]  # Just date/time
                    tags = " ".join(msg.get("context_tags", []))

                    injection_text += f"[{timestamp}] {author}"
                    if tags:
                        injection_text += f" {tags}"
                    injection_text += f"\n{content}\n\n"

                injection_text += "--- END CAMPFIRE ---\n"

            # Mark this session as summoned
            save_summoned_session(session_id)

        if not injection_text:
            # Nothing to inject
            print(json.dumps({}))
            return

        # Output as system message injection
        output = {
            "systemMessage": injection_text
        }

        print(json.dumps(output))

    except Exception as e:
        # On error, output error as system message but don't block
        error_output = {
            "systemMessage": f"[Campfire Hook Error: {e}]"
        }
        print(json.dumps(error_output))

    # Always exit 0 to not block the prompt
    sys.exit(0)


if __name__ == "__main__":
    main()

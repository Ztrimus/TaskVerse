"""
-----------------------------------------------------------------------
File: TaskVerse/replay.py
Creation Time: May 23rd 2025, 6:43 pm
Author: Saurabh Zinjad
Developer Email: saurabhzinjad@gmail.com
Copyright (c) 2023-2025 Saurabh Zinjad. All rights reserved | https://github.com/Ztrimus
-----------------------------------------------------------------------
"""

import json
import time
from pynput.mouse import Controller as MouseController, Button
from pynput.keyboard import Controller as KeyboardController, Key
import os

EVENTS_FILE = "session_data/events.jsonl"

mouse = MouseController()
keyboard = KeyboardController()


def parse_key(key_str):
    if key_str is None:
        return None
    if key_str.startswith("Key."):
        try:
            return getattr(Key, key_str.split(".", 1)[1])
        except AttributeError:
            return key_str
    return key_str


def replay_events(events_file):
    print("[REPLAY] Loading events...")
    with open(events_file, "r") as f:
        events = [json.loads(line) for line in f]

    print(f"[REPLAY] {len(events)} events loaded.")
    last_time = 0
    for event in events:
        t = event["timestamp"]
        wait = t - last_time
        if wait > 0:
            time.sleep(wait)
        last_time = t

        etype = event["type"]
        data = event["data"]

        if etype == "mousemove":
            x, y = int(data["x"]), int(data["y"])
            print(f"[REPLAY] Mouse move to ({x}, {y})")
            mouse.position = (x, y)
        elif etype == "mouseclick":
            x, y = int(data["x"]), int(data["y"])
            button = Button.left if "left" in data["button"] else Button.right
            print(f"[REPLAY] Mouse click at ({x}, {y}) with {button}")
            mouse.position = (x, y)
            mouse.press(button)
            mouse.release(button)
        elif etype == "mousescroll":
            dx, dy = int(data["dx"]), int(data["dy"])
            print(f"[REPLAY] Mouse scroll by ({dx}, {dy})")
            mouse.scroll(dx, dy)El
        elif etype == "keypress":
            key = parse_key(data.get("key"))
            if key is not None:
                print(f"[REPLAY] Key press: {key}")
                keyboard.press(key)
            else:
                print(f"[REPLAY] Skipping keypress with None key: {data}")
        elif etype == "keyrelease":
            key = parse_key(data.get("key"))
            if key is not None:
                print(f"[REPLAY] Key release: {key}")
                keyboard.release(key)
            else:
                print(f"[REPLAY] Skipping keyrelease with None key: {data}")
        else:
            print(f"[REPLAY] Unknown event type: {etype}")


if __name__ == "__main__":
    replay_events(EVENTS_FILE)

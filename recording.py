"""
-----------------------------------------------------------------------
File: TaskVerse/desktop_recording.py
Creation Time: May 23rd 2025, 6:31 pm
Author: Saurabh Zinjad
Developer Email: saurabhzinjad@gmail.com
Copyright (c) 2023-2025 Saurabh Zinjad. All rights reserved | https://github.com/Ztrimus
-----------------------------------------------------------------------
"""

import json
import time
import os
import pyautogui
from pynput import mouse, keyboard
from PIL import Image
import threading
import subprocess
import platform
import datetime


class DesktopSessionRecorder:
    def __init__(self, output_dir="session_data"):
        self.output_dir = output_dir
        self.start_time = time.time()
        self.screenshot_interval = 1.0  # Take screenshot every second
        self.last_move_time = 0
        self.recording = False
        self.screenshot_thread = None
        self.events_file = None

        # Create output directories
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(f"{output_dir}/screenshots", exist_ok=True)

        # Initialize listeners
        self.mouse_listener = mouse.Listener(
            on_move=self.on_mouse_move,
            on_click=self.on_mouse_click,
            on_scroll=self.on_mouse_scroll,
        )

        self.keyboard_listener = keyboard.Listener(
            on_press=self.on_key_press, on_release=self.on_key_release
        )

    def append_event(self, event):
        if self.events_file:
            self.events_file.write(json.dumps(event) + "\n")
            self.events_file.flush()

    def on_mouse_move(self, x, y):
        if not self.recording:
            return

        # Only record mouse moves at intervals to avoid too much data
        if (
            not hasattr(self, "last_move_time")
            or time.time() - self.last_move_time > 0.1
        ):
            self.last_move_time = time.time()
            event = {
                "type": "mousemove",
                "data": {"x": x, "y": y},
                "app": self.get_active_window(),
                "timestamp": time.time() - self.start_time,
            }
            print(f"on_mouse_move: {event}")
            self.append_event(event)

    def on_mouse_click(self, x, y, button, pressed):
        if not self.recording:
            return

        if pressed:
            # Take a screenshot on clicks
            screenshot_path = self.take_screenshot(
                f"click_{int((time.time() - self.start_time) * 1000)}"
            )
            event = {
                "type": "mouseclick",
                "data": {
                    "x": x,
                    "y": y,
                    "button": str(button),
                    "pressed": pressed,
                    "screenshot": screenshot_path,
                },
                "app": self.get_active_window(),
                "timestamp": time.time() - self.start_time,
            }
            print(f"on_mouse_click: {event}")
            self.append_event(event)

    def on_mouse_scroll(self, x, y, dx, dy):
        if not self.recording:
            return
        event = {
            "type": "mousescroll",
            "data": {"x": x, "y": y, "dx": dx, "dy": dy},
            "app": self.get_active_window(),
            "timestamp": time.time() - self.start_time,
        }
        print(f"on_mouse_scroll: {event}")
        self.append_event(event)

    def on_key_press(self, key):
        if not self.recording:
            return
        try:
            key_char = key.char
        except AttributeError:
            key_char = str(key)
        event = {
            "type": "keypress",
            "data": {"key": key_char},
            "app": self.get_active_window(),
            "timestamp": time.time() - self.start_time,
        }
        print(f"on_key_press: {event}")
        self.append_event(event)
        if key == keyboard.Key.esc:
            # Stop both listeners and recording
            self.recording = False
            self.mouse_listener.stop()
            return False  # This stops the keyboard listener

    def on_key_release(self, key):
        if not self.recording:
            return
        try:
            key_char = key.char
        except AttributeError:
            key_char = str(key)
        event = {
            "type": "keyrelease",
            "data": {"key": key_char},
            "app": self.get_active_window(),
            "timestamp": time.time() - self.start_time,
        }
        print(f"on_key_release: {event}")
        self.append_event(event)

    def get_active_window(self):
        """Get information about the active window"""
        if platform.system() == "Darwin":  # macOS
            script = 'tell application "System Events" to get name of first application process whose frontmost is true'
            try:
                result = subprocess.run(
                    ["osascript", "-e", script], capture_output=True, text=True
                )
                return result.stdout.strip()
            except:
                return "Unknown"
        elif platform.system() == "Windows":
            try:
                import win32gui

                window = win32gui.GetForegroundWindow()
                return win32gui.GetWindowText(window)
            except:
                return "Unknown"
        else:  # Linux and others
            try:
                result = subprocess.run(
                    ["xdotool", "getwindowfocus", "getwindowname"],
                    capture_output=True,
                    text=True,
                )
                return result.stdout.strip()
            except:
                return "Unknown"

    def take_screenshot(self, name=None):
        """Take a screenshot and save it to the output directory"""
        if name is None:
            name = f"screen_{int((time.time() - self.start_time) * 1000)}"

        file_path = f"{self.output_dir}/screenshots/{name}.png"
        screenshot = pyautogui.screenshot()
        screenshot.save(file_path)

        return file_path

    def screenshot_loop(self):
        """Loop to take periodic screenshots"""
        while self.recording:
            self.take_screenshot()
            time.sleep(self.screenshot_interval)

    def record_session(self):
        """Start recording a desktop session"""
        print("Starting desktop recording...")
        print("Press Esc key to stop recording.")

        # Open events file in append mode BEFORE starting listeners
        self.events_file = open(f"{self.output_dir}/events.jsonl", "a", buffering=1)

        self.recording = True

        # Take initial screenshot
        self.take_screenshot("start")

        # Start screenshot thread
        self.screenshot_thread = threading.Thread(target=self.screenshot_loop)
        self.screenshot_thread.daemon = True
        self.screenshot_thread.start()

        # Start listeners
        self.mouse_listener.start()
        self.keyboard_listener.start()

        # Wait for keyboard listener to stop (when Esc is pressed)
        self.keyboard_listener.join()

        # Clean up and save data
        self.recording = False

        # Take final screenshot
        self.take_screenshot("end")

        if self.events_file:
            self.events_file.close()

        # Save session metadata
        metadata = {
            "start_time": datetime.datetime.fromtimestamp(self.start_time).isoformat(),
            "end_time": datetime.datetime.fromtimestamp(time.time()).isoformat(),
            "duration_seconds": time.time() - self.start_time,
            "platform": platform.system(),
            "screenshots": len(os.listdir(f"{self.output_dir}/screenshots")),
        }
        with open(f"{self.output_dir}/metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)

        print(f"\nRecording saved to {self.output_dir}")
        print(f"Total screenshots: {metadata['screenshots']}")
        print(f"Duration: {metadata['duration_seconds']:.2f} seconds")


if __name__ == "__main__":
    recorder = DesktopSessionRecorder()
    recorder.record_session()

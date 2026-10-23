"""Check native Android keyboard layout with adb and Python 3.

With a signed-in app on a tab: python3 tests/e2e/check-keyboard-layout.py
With an open form: python3 tests/e2e/check-keyboard-layout.py sign-up-password
"""

import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET


def adb(*args):
    return subprocess.check_output(["adb", *args], text=True)


def ui():
    result = adb("shell", "uiautomator", "dump", "/sdcard/clavis-keyboard-test.xml")
    if "ERROR" in result:
        raise RuntimeError(result)
    return list(ET.fromstring(adb("shell", "cat", "/sdcard/clavis-keyboard-test.xml")).iter("node"))


def bounds(node):
    return tuple(map(int, re.findall(r"\d+", node.get("bounds"))))


def find(nodes, test_id):
    return next(node for node in nodes if node.get("resource-id") == test_id)


def tap(node):
    left, top, right, bottom = bounds(node)
    adb("shell", "input", "tap", str((left + right) // 2), str((top + bottom) // 2))


def wait_for(predicate):
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        nodes = ui()
        if predicate(nodes):
            return nodes
    raise AssertionError("Timed out waiting for Android UI")


def keyboard_visible():
    state = adb("shell", "dumpsys", "input_method")
    return "mInputShown=true" in state or "isInputViewShown=true" in state


field_id = sys.argv[1] if len(sys.argv) > 1 else "conversation-input"
is_chat = field_id == "conversation-input"

if keyboard_visible():
    adb("shell", "input", "keyevent", "4")

if is_chat:
    ready = wait_for(lambda nodes: any(n.get("resource-id") == "tab-bar-item-conversation" for n in nodes))
    tap(find(ready, "tab-bar-item-conversation"))
before = wait_for(lambda nodes: any(n.get("resource-id") == field_id for n in nodes))
header_before = bounds(find(before, "conversation-history")) if is_chat else None
tap(find(before, field_id))

try:
    opened = wait_for(lambda _: keyboard_visible())
    header_open = bounds(find(opened, "conversation-history")) if is_chat else None
    input_open = bounds(find(opened, field_id))
    send_open = bounds(find(opened, "conversation-send")) if is_chat else input_open
    ime = re.search(r"type=ime frame=\[\d+,(\d+)\]\[\d+,\d+\].*visible=true",
                    adb("shell", "dumpsys", "window"))
    assert ime is not None, "Could not measure the visible Android keyboard"
    keyboard_top = int(ime.group(1))
    print({"header_before": header_before, "header_with_keyboard": header_open,
           "input_with_keyboard": input_open, "send_with_keyboard": send_open,
           "keyboard_top": keyboard_top})
    if is_chat:
        assert header_open[2] > header_open[0] and header_open[3] > header_open[1], "Chat header disappeared"
        assert abs(header_open[1] - header_before[1]) <= 3, "Keyboard moved the chat header"
        assert input_open[1] > header_open[3], "Message input overlaps the header"
    assert send_open[3] > send_open[1], "Send button disappeared"
    assert max(input_open[3], send_open[3]) <= keyboard_top, "Keyboard covers the composer"
finally:
    if keyboard_visible():
        adb("shell", "input", "keyevent", "4")

if is_chat:
    closed = ui()
    assert bounds(find(closed, "conversation-history")) == header_before, "Header did not recover after closing keyboard"
print("PASS: Android keyboard layout for " + field_id)

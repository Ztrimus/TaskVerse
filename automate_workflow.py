import os
from playwright.sync_api import sync_playwright
import json

with open("email_workflow.json") as f:
    data = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # Load the local Gmail mock page
    page_path = os.path.abspath("gmail_mock.html")
    page.goto(f"file://{page_path}")

    for event in data["events"]:
        etype = event["event_type"]

        if etype == "page_navigation":
            if event["current_page"] == "compose_email":
                page.click("#go_to_compose")

        elif etype == "keyboard_input":
            if event["input_field"] == "recipient_email":
                page.fill("#recipient_email", event["value"][0])
            elif event["input_field"] == "email_subject":
                page.fill("#email_subject", event["value"])

        elif etype == "text_type":
            page.fill("#email_body", event["email_body"])

        elif etype == "file_upload":
            page.set_input_files("#attachment_input", event["file_name"])

        elif etype == "button_click":
            if event["button_id"] == "send_email":
                page.click("#send_email_btn")
            elif event["button_id"] == "select_contact":
                page.click("#select_contact")

    browser.close()
    print("Workflow simulation complete.")

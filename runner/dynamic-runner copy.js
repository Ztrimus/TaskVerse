const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { chromium } = require("playwright");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { extractTargetWithGPT } = require("./utils/extractTargetWithGPT");

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Load task steps
const rawSteps = JSON.parse(fs.readFileSync(process.argv[2], "utf-8"));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForUser() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question("🔒 Please log in manually, then press ENTER to continue...\n", () => {
    rl.close();
    resolve();
  }));
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  const workingSteps = [];

  for (const step of rawSteps) {
    console.log(`➡️ Running: ${step.action} ${step.description || ""}`);

    let attempt = 0;
    let success = false;

    while (attempt < MAX_RETRIES && !success) {
      try {
        attempt++;
        console.log(`🔄 Attempt ${attempt} for ${step.action}`);

        switch (step.action) {
          case "navigate":
            await page.goto(step.url);
            success = true;
            break;

          case "waitForUser":
            await waitForUser();
            success = true;
            break;

          case "press":
            const key = step.key || "Enter";
            await page.keyboard.press(key);
            success = true;
            break;

        //  case "click":
		// 	const { targetText } = await extractTargetWithGPT(step.description, page.url());
		// 	console.log(targetText)
		// 	const clickLocator = page.locator(`button:has-text("${targetText}")`).first();
		// 	await clickLocator.click();
		// 	success = true;
		// 	break;
		case "click":
			const { targetText } = await extractTargetWithGPT(step.description, page.url());

			if (targetText.toLowerCase().includes("start a post") || targetText.toLowerCase().includes("next")) {	
				const startPostButton = page.locator(`button:has-text("${targetText}")`).first();
				await startPostButton.click();
			}else if (targetText.toLowerCase() === "post") {
					// Special case for Post button
					const postButton = page.locator('button.share-actions__primary-action').first();
					await postButton.click();
				}  
			else if (targetText.toLowerCase().includes("add a photo")) {
				const addPhotoButton = page.locator('button[aria-label="Add a photo"]').first();
				await addPhotoButton.click();
				await page.waitForSelector('input[type="file"]', { timeout: 10000 }); // wait until input is injected
			} else {
				const clickLocator = page.locator(`:has-text("${targetText}")`).first();
				await clickLocator.click();
			}

			success = true;
			break;


          case "type":
            const postTextArea = page.locator('div.ql-editor');
            await postTextArea.fill(step.value || step.description || "Default text");
            success = true;
            break;

          case "upload":
            const fileInput = page.locator(`input[type="file"]`).first();
            await fileInput.setInputFiles(step.filePath);
            success = true;
            break;

          default:
            console.warn(`⚠️ Unknown action: ${step.action}`);
            success = true;
        }

      } catch (err) {
        console.error(`❌ Step failed on attempt ${attempt}:`, err.message);
        if (attempt < MAX_RETRIES) {
          console.log(`🔁 Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
          await sleep(RETRY_DELAY_MS);
        } else {
          console.log(`⏭️ Skipping step after ${MAX_RETRIES} attempts.`);
        }
      }
    }

    workingSteps.push(step);
  }

  fs.writeFileSync(
    "workflows/final-execution-plan.json",
    JSON.stringify(workingSteps, null, 2)
  );
  console.log("✅ Final plan saved to workflows/final-execution-plan.json");
  await browser.close();
})();

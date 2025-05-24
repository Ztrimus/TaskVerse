const fs = require('fs');
const { chromium } = require('playwright');

async function runWorkflow(filePath) {
  const workflow = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  console.log(`Running workflow: ${workflow.name}`);

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  for (const step of workflow.steps) {
    console.log(`Executing step: ${step.action}`);
    try {
      switch (step.action) {
        case 'navigate':
          await page.goto(step.url);
          break;

        case 'click':
          try {
            await page.waitForSelector(step.selector, { timeout: 5000 });
            await page.click(step.selector);
          } catch (err) {
            console.warn(`⚠️ Skipping click, element not found: ${step.selector}`);
          }
          break;

        case 'type':
          await page.waitForSelector(step.selector, { timeout: 10000 });
          await page.fill(step.selector, step.value);
          break;

        case 'press':
          await page.waitForSelector(step.selector, { timeout: 10000 });
          await page.press(step.selector, step.key);
          break;

        default:
          console.warn(`⚠️ Unknown action: ${step.action}`);
      }
    } catch (err) {
      console.error(`❌ Error executing step: ${JSON.stringify(step, null, 2)}`);
      console.error(err);
    }
  }

  console.log("✅ Workflow complete.");
  // await browser.close(); // Uncomment to auto-close the browser
}

// Entry point
const inputFile = process.argv[2];
if (!inputFile) {
  console.error("❌ Please provide a path to a workflow JSON file.");
  process.exit(1);
}

runWorkflow(inputFile);

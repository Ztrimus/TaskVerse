const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { chromium } = require("playwright");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { extractTargetWithGPT, getSelectorFromGPT } = require("./utils/extractSelectorWithGPT");

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

// Get page context for GPT
async function getPageContext(page) {
  try {
    const context = await page.evaluate(() => {
      // Get visible interactive elements
      const selectors = [
        'button', 'a[href]', 'input', 'textarea', 'select', 
        '[role="button"]', '[role="link"]', '[role="textbox"]',
        'div[contenteditable]', '.ql-editor'
      ];
      
      const elements = [];
      selectors.forEach(selector => {
        const els = Array.from(document.querySelectorAll(selector));
        els.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          // Only include visible elements
          if (rect.width > 0 && rect.height > 0 && rect.top >= 0) {
            elements.push({
              tag: el.tagName.toLowerCase(),
              text: el.innerText?.trim().slice(0, 100) || '',
              ariaLabel: el.getAttribute('aria-label') || '',
              placeholder: el.getAttribute('placeholder') || '',
              className: el.className || '',
              id: el.id || '',
              type: el.type || '',
              href: el.href || '',
              role: el.getAttribute('role') || '',
              selector: generateSelector(el, index)
            });
          }
        });
      });
      
      function generateSelector(el, index) {
        if (el.id) return `#${el.id}`;
        if (el.getAttribute('aria-label')) 
          return `${el.tagName.toLowerCase()}[aria-label="${el.getAttribute('aria-label')}"]`;
        if (el.name) 
          return `${el.tagName.toLowerCase()}[name="${el.name}"]`;
        if (el.className && el.className.trim()) {
          const classes = el.className.trim().split(/\s+/).slice(0, 2).join('.');
          return `${el.tagName.toLowerCase()}.${classes}`;
        }
        return `${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
      }
      
      return {
        url: window.location.href,
        title: document.title,
        elements: elements.slice(0, 20) // Limit to first 20 elements
      };
    });
    
    return context;
  } catch (error) {
    console.error("Error getting page context:", error);
    return { url: page.url(), title: '', elements: [] };
  }
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
            await page.waitForLoadState('networkidle');
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

          case "click":
            const pageContext = await getPageContext(page);
            const gptResponse = await getSelectorFromGPT(
              step.description, 
              pageContext
            );
            
            console.log(`🤖 GPT suggested: ${gptResponse.selector} (${gptResponse.strategy})`);
            
            // Try the GPT-suggested selector
            const element = page.locator(gptResponse.selector).first();
            await element.waitFor({ timeout: 10000 });
            await element.click();
            
            success = true;
            break;

          case "type":
            const typePageContext = await getPageContext(page);
            const typeResponse = await getSelectorFromGPT(
              step.description || "text input field", 
              typePageContext,
              "type"
            );
            
            console.log(`🤖 GPT suggested typing in: ${typeResponse.selector}`);
            
            const typeElement = page.locator(typeResponse.selector).first();
            await typeElement.waitFor({ timeout: 10000 });
            
            // Clear existing content and type new content
            await typeElement.fill('');
            await typeElement.fill(step.value || step.text || "Default text");
            
            success = true;
            break;

          case "upload":
            const uploadPageContext = await getPageContext(page);
            const uploadResponse = await getSelectorFromGPT(
              "file input for upload", 
              uploadPageContext,
              "upload"
            );
            
            console.log(`🤖 GPT suggested upload element: ${uploadResponse.selector}`);
            
            const fileInput = page.locator(uploadResponse.selector).first();
            await fileInput.setInputFiles(step.filePath);
            success = true;
            break;

          default:
            console.warn(`⚠️ Unknown action: ${step.action}`);
            success = true;
        }

        // Add small delay between actions for stability
        await sleep(1000);

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

    workingSteps.push({
      ...step,
      status: success ? 'completed' : 'failed',
      timestamp: new Date().toISOString()
    });
  }

  fs.writeFileSync(
    "workflows/final-execution-plan.json",
    JSON.stringify(workingSteps, null, 2)
  );
  console.log("✅ Final plan saved to workflows/final-execution-plan.json");
  // await browser.close(); // Uncomment if you want to close browser automatically
})();
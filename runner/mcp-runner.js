// File: runner/mcp-runner.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { fixSelectorWithGPT } = require('./utils/fixWithGPT');
require('dotenv').config();

const MCP_URL = 'http://localhost:3001';

async function runWorkflow(jsonPath) {
  const workflow = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const steps = workflow.steps;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`➡️ Running: ${step.action}`);
    try {
      await executeStep(step);
    } catch (err) {
      console.warn(`❌ Error on step: ${step.action} - attempting GPT fix...`);
      const dom = await axios.get(`${MCP_URL}/dom`).then(res => res.data);
      const fixed = await fixSelectorWithGPT(step, dom, workflow.description);
      if (fixed?.fixedSelector) {
		console.log(`🧠 GPT full response:`, fixed);
        console.log(`🧠 GPT fix: using selector '${fixed.fixedSelector}'`);
        step.selector = fixed.fixedSelector;
        try {
          await executeStep(step);
        } catch (retryErr) {
          console.error(`❌ Retry failed: ${retryErr.message}`);
        }
      } else {
		console.log(`🧠 GPT full response:`, fixed);
        console.error(`❌ No suitable fix found by GPT.`);
      }
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log("✅ Done!");
}

async function executeStep(step) {
  switch (step.action) {
    case 'navigate':
      await axios.post(`${MCP_URL}/navigate`, { url: step.url });
      break;
    case 'click':
      await axios.post(`${MCP_URL}/click`, { selector: step.selector });
      break;
    case 'type':
      await axios.post(`${MCP_URL}/type`, {
        selector: step.selector,
        value: step.value
      });
      break;
	case 'press':
	  await axios.post(`${MCP_URL}/press`, {
    	selector: step.selector,
    	key: step.key
  		});
  break;

    default:
      throw new Error(`Unknown action: ${step.action}`);
  }
}

// Run like: node runner/mcp-runner.js workflows/search-google.json
const file = process.argv[2];
if (!file) {
  console.error('❌ Please provide a workflow JSON file.');
  process.exit(1);
}

runWorkflow(file);

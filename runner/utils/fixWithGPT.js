// File: runner/utils/fixWithGPT.js

const OpenAI = require("openai");
require('dotenv').config();
// console.log(process.env.OPENAI_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function fixSelectorWithGPT(step, domSnapshot, intentDescription) {
  const prompt = `
You are a web automation assistant. A user tried to perform the following step in a browser automation task:

But it failed because the selector was invalid. This is a '${step.action}' step — so only suggest selectors that support that action.

Step: ${JSON.stringify(step, null, 2)}
Task intent: ${intentDescription}


${JSON.stringify(domSnapshot.elements, null, 2)}

Suggest a new selector that matches the user's intent based on the DOM. Return only a JSON object like:
{ "fixedSelector": "<new-css-selector>", "confidence": <0-1>, "explanation": "<short explanation>" }

Only suggest selectors that are currently visible and clickable. Avoid guessing.
For search result clicks, prefer selecting the first link or one containing the query text. For Yahoo search, look for .algo containers. For Google, use .tF2Cxc a.  or whatever is actually correct
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    const text = response.choices[0].message.content;
    const match = text.match(/{[\s\S]*}/);
	console.log(`🧠 GPT full response:`, text);

    return match ? JSON.parse(match[0]) : null;
  } catch (error) {
    console.error("❌ GPT API Error:", error.message);
    return null;
  }
}

module.exports = { fixSelectorWithGPT };

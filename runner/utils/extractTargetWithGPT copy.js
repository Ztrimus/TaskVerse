// const { OpenAI } = require("openai");
// // const openai = new OpenAI();
// require('dotenv').config();
// // console.log(process.env.OPENAI_API_KEY)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// async function extractTargetWithGPT(description, pageURL) {
//   const prompt = `
// You are a smart web automation assistant. Your job is to extract the **exact visible text** (targetText) the user wants to interact with, and optionally the element type (targetType: button, link, or other).

// Here are some examples:
// ---
// Task: "Click the 'Start a post' button on LinkedIn homepage"
// Return: { "targetText": "Start a post", "targetType": "button" }

// Task: "Add text to the LinkedIn post"
// Return: { "targetText": "LinkedIn post editor", "targetType": "textarea" }

// Task: "Click the search button on Yahoo"
// Return: { "targetText": "Search the web", "targetType": "button" }

// Task: "Click the first result for LinkedIn"
// Return: { "targetText": "LinkedIn", "targetType": "link" }

// ---
// Current Page: ${pageURL}

// User Task: ${description}

// Return JSON only in this format:
// {
//   "targetText": "...",
//   "targetType": "button" | "link" | "other"
// }
// `;

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o",
//     messages: [{ role: "user", content: prompt }],
//     temperature: 0.2
//   });

//   try {
//     const text = response.choices[0].message.content.trim();
//     const json = JSON.parse(text.match(/{[\s\S]*}/)[0]);
//     return json;
//   } catch (err) {
//     console.error("❌ Failed to parse GPT response:", err.message);
//     return { targetText: "", targetType: "other" }; // Fallback
//   }
// }

// module.exports = { extractTargetWithGPT };

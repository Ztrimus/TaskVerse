const { OpenAI } = require("openai");
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function getSelectorFromGPT(taskDescription, pageContext, actionType = 'click') {
  const prompt = `
You are an expert web automation assistant. Given a user task and the current page context, you need to identify the best CSS selector to target the element.

TASK: ${taskDescription}
ACTION TYPE: ${actionType}
PAGE URL: ${pageContext.url}
PAGE TITLE: ${pageContext.title}

AVAILABLE ELEMENTS:
${JSON.stringify(pageContext.elements, null, 2)}

INSTRUCTIONS:
1. Analyze the task description and find the most appropriate element from the available elements
2. Choose the most reliable selector (prefer ID > aria-label > specific classes > text content)
3. Consider the action type (click, type, upload) when selecting elements
4. For upload actions, look for input[type="file"] elements
5. For text input, look for input, textarea, or contenteditable elements
6. For clicking, prioritize buttons, links, or clickable elements

Return ONLY a JSON object with this format:
{
  "selector": "the CSS selector to use",
  "strategy": "brief explanation of why this selector was chosen",
  "confidence": "high|medium|low"
}

Examples:
- For "click start a post": {"selector": "button[aria-label='Start a post']", "strategy": "aria-label provides reliable identification", "confidence": "high"}
- For "type in post editor": {"selector": "div.ql-editor", "strategy": "LinkedIn post editor with unique class", "confidence": "high"}
- For "upload photo": {"selector": "input[type='file']", "strategy": "standard file input element", "confidence": "high"}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 500
    });

    const content = response.choices[0].message.content.trim();
    const jsonMatch = content.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      throw new Error("No JSON found in GPT response");
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!result.selector) {
      throw new Error("No selector provided by GPT");
    }

    return {
      selector: result.selector,
      strategy: result.strategy || "GPT-generated selector",
      confidence: result.confidence || "medium"
    };

  } catch (error) {
    console.error("❌ GPT selector generation failed:", error.message);
    
    // Fallback logic based on action type and common patterns
    return getFallbackSelector(taskDescription, pageContext, actionType);
  }
}

function getFallbackSelector(taskDescription, pageContext, actionType) {
  const description = taskDescription.toLowerCase();
  
  // Fallback strategies for common scenarios
  const fallbacks = {
    post: () => {
      if (description.includes('start') && description.includes('post')) {
        return { selector: 'button:has-text("Start a post")', strategy: 'fallback: post button text match', confidence: 'medium' };
      }
      if (description.includes('editor') || actionType === 'type') {
        return { selector: 'div.ql-editor, [contenteditable="true"], textarea', strategy: 'fallback: content editor', confidence: 'medium' };
      }
      return { selector: 'button:has-text("Post")', strategy: 'fallback: generic post button', confidence: 'low' };
    },
    
    upload: () => ({
      selector: 'input[type="file"]',
      strategy: 'fallback: standard file input',
      confidence: 'high'
    }),
    
    photo: () => ({
      selector: 'button[aria-label*="photo"], button:has-text("photo")',
      strategy: 'fallback: photo-related button',
      confidence: 'medium'
    }),
    
    next: () => ({
      selector: 'button:has-text("Next"), button[aria-label*="Next"]',
      strategy: 'fallback: next button',
      confidence: 'medium'
    }),
    
    search: () => ({
      selector: 'input[type="search"], input[placeholder*="search"], button:has-text("Search")',
      strategy: 'fallback: search elements',
      confidence: 'medium'
    })
  };

  // Try to match against fallback patterns
  for (const [key, fallbackFn] of Object.entries(fallbacks)) {
    if (description.includes(key)) {
      return fallbackFn();
    }
  }

  // Ultimate fallback - try to find any clickable element with matching text
  if (actionType === 'click') {
    return {
      selector: `button, a, [role="button"]`,
      strategy: 'fallback: any clickable element',
      confidence: 'low'
    };
  }

  // For type actions, look for input elements
  if (actionType === 'type') {
    return {
      selector: 'input, textarea, [contenteditable="true"]',
      strategy: 'fallback: any text input',
      confidence: 'low'
    };
  }

  return {
    selector: '*',
    strategy: 'fallback: generic selector',
    confidence: 'low'
  };
}

// Enhanced version of the original function for backward compatibility
async function extractTargetWithGPT(description, pageURL) {
  const prompt = `
You are a smart web automation assistant. Your job is to extract the **exact visible text** (targetText) the user wants to interact with, and optionally the element type (targetType: button, link, or other).

Current Page: ${pageURL}
User Task: ${description}

Return JSON only in this format:
{
  "targetText": "exact text to look for",
  "targetType": "button" | "link" | "input" | "other"
}

Examples:
- "Click the 'Start a post' button" → {"targetText": "Start a post", "targetType": "button"}
- "Add text to post editor" → {"targetText": "", "targetType": "input"}
- "Click next button" → {"targetText": "Next", "targetType": "button"}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    const text = response.choices[0].message.content.trim();
    const json = JSON.parse(text.match(/{[\s\S]*}/)[0]);
    return json;
  } catch (err) {
    console.error("❌ Failed to parse GPT response:", err.message);
    return { targetText: "", targetType: "other" };
  }
}

module.exports = { 
  getSelectorFromGPT, 
  extractTargetWithGPT 
};
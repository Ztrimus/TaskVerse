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

INSTRUCTIONS FOR ${actionType.toUpperCase()} ACTION:
${actionType === 'type' ? `
- ONLY select elements that can accept text input: input, textarea, [contenteditable], or elements with role="textbox"
- Look for elements with isTextInput: true
- Prioritize: .ql-editor (rich text editors), [contenteditable="true"], textarea, input fields
- NEVER select button elements for typing
- For LinkedIn posts, look for .ql-editor or contenteditable div
` : `
- For clicking, prioritize buttons, links, or clickable elements
- Look for elements with relevant text content or aria-labels
`}
- Choose the most reliable selector (prefer specific classes > aria-label > ID for dynamic sites)
- For upload actions, look for input[type="file"] elements
- Avoid ember IDs or dynamically generated IDs unless they're the only option

Return ONLY a JSON object with this format:
{
  "selector": "the CSS selector to use",
  "strategy": "brief explanation of why this selector was chosen", 
  "confidence": "high|medium|low"
}

Examples:
- For typing in LinkedIn post: {"selector": ".ql-editor", "strategy": "LinkedIn rich text editor", "confidence": "high"}
- For typing in contenteditable: {"selector": "[contenteditable='true']", "strategy": "contenteditable text area", "confidence": "high"}
- For clicking post button: {"selector": "button[aria-label='Post']", "strategy": "aria-label provides reliable identification", "confidence": "high"}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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

    // Additional validation for type actions
    if (actionType === 'type') {
      const selector = result.selector.toLowerCase();
      const isValidTextSelector = selector.includes('input') || 
                                 selector.includes('textarea') || 
                                 selector.includes('contenteditable') ||
                                 selector.includes('ql-editor') ||
                                 selector.includes('textbox');
      
      if (!isValidTextSelector) {
        console.warn(`⚠️ GPT suggested non-text selector for typing: ${result.selector}`);
        throw new Error("Invalid selector for text input");
      }
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
  
  // Enhanced fallback strategies for common scenarios
  const fallbacks = {
    post: () => {
      if (actionType === 'type' && (description.includes('post') || description.includes('text') || description.includes('content'))) {
        // Try multiple LinkedIn text editor selectors
        return { 
          selector: '.ql-editor, [contenteditable="true"], div[contenteditable], [role="textbox"]', 
          strategy: 'fallback: LinkedIn post text editor patterns', 
          confidence: 'high' 
        };
      }
      if (description.includes('start') && description.includes('post')) {
        return { selector: 'button:has-text("Start a post")', strategy: 'fallback: post button text match', confidence: 'medium' };
      }
      return { selector: 'button:has-text("Post")', strategy: 'fallback: generic post button', confidence: 'low' };
    },
    
    text: () => ({
      selector: '.ql-editor, [contenteditable="true"], textarea, input[type="text"]',
      strategy: 'fallback: common text input patterns',
      confidence: 'medium'
    }),
    
    editor: () => ({
      selector: '.ql-editor, [contenteditable="true"], .DraftEditor-root, [role="textbox"]',
      strategy: 'fallback: rich text editor patterns',
      confidence: 'high'
    }),
    
    content: () => ({
      selector: '.ql-editor, [contenteditable="true"], textarea',
      strategy: 'fallback: content input areas',
      confidence: 'medium'
    }),
    
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

  // Ultimate fallbacks based on action type
  if (actionType === 'type') {
    return {
      selector: '.ql-editor, [contenteditable="true"], textarea, input',
      strategy: 'fallback: any text input element',
      confidence: 'low'
    };
  }

  if (actionType === 'click') {
    return {
      selector: `button, a, [role="button"]`,
      strategy: 'fallback: any clickable element',
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
      model: "gpt-4o-mini",
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
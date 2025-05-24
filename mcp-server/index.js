const express = require('express');
const { chromium } = require('playwright');
const bodyParser = require('body-parser');
const { getSelectorFromGPT } = require('../runner/utils/extractSelectorWithGPT');

const app = express();
const port = 3001;

app.use(bodyParser.json());

let browser, page;

// Initialize browser session
async function initBrowser() {
  if (!browser) browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  page = await context.newPage();
}

// Get page context for GPT
async function getPageContext() {
  try {
    const context = await page.evaluate(() => {
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
        elements: elements.slice(0, 25)
      };
    });
    
    return context;
  } catch (error) {
    console.error("Error getting page context:", error);
    return { url: page.url(), title: '', elements: [] };
  }
}

// Reset session
app.post('/reset', async (req, res) => {
  try {
    if (browser) await browser.close();
    browser = null;
    await initBrowser();
    res.send({ status: 'reset' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Navigate
app.post('/navigate', async (req, res) => {
  try {
    const { url } = req.body;
    if (!page) await initBrowser();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    res.send({ status: 'navigated', url });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Smart Type - uses GPT to find the right input element
app.post('/smart-type', async (req, res) => {
  try {
    const { description, value } = req.body;
    const pageContext = await getPageContext();
    
    const gptResponse = await getSelectorFromGPT(
      description || "text input field", 
      pageContext,
      "type"
    );
    
    console.log(`🤖 GPT suggested typing in: ${gptResponse.selector}`);
    
    await page.waitForSelector(gptResponse.selector, { timeout: 10000 });
    await page.fill(gptResponse.selector, value);
    
    res.send({ 
      status: 'typed', 
      selector: gptResponse.selector, 
      value,
      strategy: gptResponse.strategy,
      confidence: gptResponse.confidence
    });
  } catch (err) {
    console.error(`❌ MCP smart-type error:`, err.message);
    res.status(500).send({ error: err.message });
  }
});

// Legacy Type (backward compatibility)
app.post('/type', async (req, res) => {
  const { selector, value } = req.body;
  try {
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.fill(selector, value);
    res.send({ status: 'typed', selector, value });
  } catch (err) {
    console.error(`❌ MCP type error:`, err.message);
    res.status(500).send({ error: err.message });
  }
});

// Smart Click - uses GPT to find the right element
app.post('/smart-click', async (req, res) => {
  try {
    const { description } = req.body;
    const pageContext = await getPageContext();
    
    const gptResponse = await getSelectorFromGPT(
      description, 
      pageContext,
      "click"
    );
    
    console.log(`🤖 GPT suggested clicking: ${gptResponse.selector}`);
    
    await page.waitForSelector(gptResponse.selector, { timeout: 10000 });
    await page.click(gptResponse.selector);
    
    res.send({ 
      status: 'clicked', 
      selector: gptResponse.selector,
      strategy: gptResponse.strategy,
      confidence: gptResponse.confidence
    });
  } catch (err) {
    console.error(`❌ MCP smart-click error:`, err.message);
    res.status(500).send({ error: err.message });
  }
});

// Legacy Click (backward compatibility)
app.post('/click', async (req, res) => {
  const { selector } = req.body;
  console.log(`MCP received click for selector: ${selector}`);
  try {
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.click(selector);
    res.send({ status: 'clicked', selector });
  } catch (err) {
    console.error(`❌ MCP click error:`, err.message);
    res.status(500).send({ error: err.message });
  }
});

// Smart Upload - uses GPT to find file input
app.post('/smart-upload', async (req, res) => {
  try {
    const { filePath, description } = req.body;
    const pageContext = await getPageContext();
    
    const gptResponse = await getSelectorFromGPT(
      description || "file upload input", 
      pageContext,
      "upload"
    );
    
    console.log(`🤖 GPT suggested upload element: ${gptResponse.selector}`);
    
    await page.waitForSelector(gptResponse.selector, { timeout: 10000 });
    await page.setInputFiles(gptResponse.selector, filePath);
    
    res.send({ 
      status: 'uploaded', 
      selector: gptResponse.selector,
      filePath,
      strategy: gptResponse.strategy
    });
  } catch (err) {
    console.error(`❌ MCP smart-upload error:`, err.message);
    res.status(500).send({ error: err.message });
  }
});

// Press key
app.post('/press', async (req, res) => {
  const { key } = req.body;
  try {
    console.log(`🪄 Pressing key: ${key}`);
    await page.keyboard.press(key || 'Enter');
    res.send({ status: 'pressed', key: key || 'Enter' });
  } catch (err) {
    console.error(`❌ MCP press error:`, err.message);
    res.status(500).send({ error: err.message });
  }
});

// Extract readable content
app.post('/extract', async (req, res) => {
  try {
    const content = await page.evaluate(() => {
      const articleLike = document.querySelector('main, article, [role="main"], .content, .post');
      return articleLike ? articleLike.innerText.slice(0, 10000) : document.body.innerText.slice(0, 10000);
    });
    res.send(content);
  } catch (err) {
    console.error("Extract error:", err);
    res.status(500).send("Failed to extract");
  }
});

// Get simplified DOM with GPT context
app.get('/dom', async (req, res) => {
  try {
    if (!page) {
      return res.status(500).send({ error: "MCP browser page is not initialized yet." });
    }

    const pageContext = await getPageContext();
    res.send(pageContext);
  } catch (err) {
    console.error("❌ DOM extraction error:", err.message);
    res.status(500).send({ error: err.message });
  }
});

// Get current page info
app.get('/page-info', async (req, res) => {
  try {
    if (!page) {
      return res.status(500).send({ error: "Page not initialized" });
    }
    
    const info = await page.evaluate(() => ({
      url: window.location.href,
      title: document.title,
      ready: document.readyState
    }));
    
    res.send(info);
  } catch (err) {
    console.error("❌ Page info error:", err.message);
    res.status(500).send({ error: err.message });
  }
});

// Analyze page for automation opportunities
app.post('/analyze', async (req, res) => {
  try {
    const { task } = req.body;
    const pageContext = await getPageContext();
    
    // This could be expanded to provide suggestions for automation
    const suggestions = pageContext.elements
      .filter(el => el.text || el.ariaLabel)
      .map(el => ({
        element: el.tag,
        text: el.text || el.ariaLabel,
        selector: el.selector,
        confidence: el.text ? 'high' : 'medium'
      }))
      .slice(0, 10);
    
    res.send({
      task,
      pageUrl: pageContext.url,
      suggestions,
      totalElements: pageContext.elements.length
    });
  } catch (err) {
    console.error("❌ Analysis error:", err.message);
    res.status(500).send({ error: err.message });
  }
});

// Start server
app.listen(port, async () => {
  await initBrowser();
  console.log(`✅ Enhanced MCP server running at http://localhost:${port}`);
  console.log(`📚 Available endpoints:`);
  console.log(`   POST /smart-click   - GPT-powered click`);
  console.log(`   POST /smart-type    - GPT-powered typing`);
  console.log(`   POST /smart-upload  - GPT-powered file upload`);
  console.log(`   POST /analyze       - Analyze page for automation`);
  console.log(`   GET  /dom           - Get page context`);
  console.log(`   GET  /page-info     - Get current page info`);
});
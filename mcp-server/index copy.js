// File: mcp-server/index.js

const express = require('express');
const { chromium } = require('playwright');
const bodyParser = require('body-parser');

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

// Reset session
app.post('/reset', async (req, res) => {
  if (browser) await browser.close();
  browser = null;
  await initBrowser();
  res.send({ status: 'reset' });
});

// Navigate
app.post('/navigate', async (req, res) => {
  const { url } = req.body;
  if (!page) await initBrowser();
  await page.goto(url);
  res.send({ status: 'navigated', url });
});

// Type
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

// Click
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

// Press
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

// Get simplified DOM
// app.get('/dom', async (req, res) => {
//   const elements = await page.$$eval('*', (nodes) =>
//     nodes.slice(0, 300).map((el, i) => ({
//       id: `el-${i}`,
//       tag: el.tagName.toLowerCase(),
//       type: el.type || null,
//       role: el.getAttribute('role'),
//       name: el.getAttribute('name'),
//       ariaLabel: el.getAttribute('aria-label'),
//       placeholder: el.getAttribute('placeholder'),
//       text: el.innerText?.trim().slice(0, 100),
//       selector: (() => {
//         if (el.id) return `#${el.id}`;
//         if (el.name) return `${el.tagName.toLowerCase()}[name='${el.name}']`;
//         if (el.getAttribute('aria-label')) return `${el.tagName.toLowerCase()}[aria-label='${el.getAttribute('aria-label')}']`;
//         return el.tagName.toLowerCase();
//       })()
//     }))
//   );

//   res.send({ url: page.url(), elements });
// });


// app.get('/dom', async (req, res) => {
//   const elements = await page.$$eval('*', (nodes) =>
//     nodes.slice(0, 200).map((el, i) => ({
//       id: `el-${i}`,
//       tag: el.tagName.toLowerCase(),
//       type: el.type || null,
//       role: el.getAttribute('role'),
//       name: el.getAttribute('name'),
//       ariaLabel: el.getAttribute('aria-label'),
//       placeholder: el.getAttribute('placeholder'),
//       href: el.getAttribute('href'),
//       className: el.className,
//       text: el.innerText?.trim().slice(0, 100)
//     }))
//   );

//   res.send({ url: page.url(), elements });
// });

app.get('/dom', async (req, res) => {
  try {
    if (!page) {
      return res.status(500).send({ error: "MCP browser page is not initialized yet." });
    }

    const elements = await page.evaluate(() => {
      const selectors = [
        'button', 'a', 'input', 'textarea', 'select', '[role]', '[aria-label]', 'div.ql-editor'
      ];
      const nodes = Array.from(document.querySelectorAll(selectors.join(',')));
      return nodes.map((el, i) => ({
        id: `el-${i}`,
        tag: el.tagName.toLowerCase(),
        type: el.type || null,
        role: el.getAttribute('role'),
        name: el.getAttribute('name'),
        ariaLabel: el.getAttribute('aria-label'),
        placeholder: el.getAttribute('placeholder'),
        href: el.getAttribute('href'),
        className: el.className,
        text: el.innerText?.trim().slice(0, 100),
        selector: (() => {
          if (el.id) return `#${el.id}`;
          if (el.name) return `${el.tagName.toLowerCase()}[name='${el.name}']`;
          if (el.getAttribute('aria-label')) return `${el.tagName.toLowerCase()}[aria-label='${el.getAttribute('aria-label')}']`;
          if (el.className) return `${el.tagName.toLowerCase()}.${el.className.split(' ').join('.')}`;
          return el.tagName.toLowerCase();
        })()
      }));
    });

    res.send({ url: page.url(), elements });
  } catch (err) {
    console.error("❌ DOM extraction error:", err.message);
    res.status(500).send({ error: err.message });
  }
});


// Start server
app.listen(port, async () => {
  await initBrowser();
  console.log(`✅ MCP server running at http://localhost:${port}`);
});

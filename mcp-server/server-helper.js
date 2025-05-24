// server-helper.js
const http = require('http');
const { exec } = require('child_process');
const express = require('express');
const querystring = require('querystring');
const app = express();
const cors = require('cors');
app.use(cors());
const MCP_SERVER_URL = 'http://localhost:3001/';
const MCP_WORKFLOW_API_PATH = '/api/runWorkflow';

// Function to check if the server is up (returns a Promise)
function checkServerReady(attempts = 10, delay = 1000) {
  return new Promise((resolve, reject) => {
    let count = 0;
    const interval = setInterval(() => {
      http.get(MCP_SERVER_URL, (res) => {
        console.log(`✅ Server is up!`);
        clearInterval(interval);
        resolve();
      }).on('error', () => {
        count++;
        if (count >= attempts) {
          clearInterval(interval);
          reject(new Error('Server did not start in time.'));
        } else {
          console.log(`⏳ Waiting for server... (${count}/${attempts})`);
        }
      });
    }, delay);
  });
}

// Function to trigger the workflow API via POST
function triggerWorkflowAPI(id) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({ id });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `${MCP_WORKFLOW_API_PATH}?id=${id}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          console.error('❌ Response is not valid JSON:', data);
          reject(new Error('Invalid JSON response from workflow API.'));
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Error calling workflow API:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Main helper API
app.get('/trigger-workflow', (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing workflow ID" });
  }

  // Step 1: Check if server is up
  http.get(MCP_SERVER_URL, (serverRes) => {
    console.log(`✅ Server already running. Calling workflow API...`);

    triggerWorkflowAPI(id).then((result) => {
      console.log('✅ Workflow triggered:', result);
      res.json({ message: 'Workflow triggered', response: result });
    }).catch((err) => {
      console.error('❌ Error triggering workflow:', err.message);
      res.status(500).json({ error: 'Error triggering workflow' });
    });

  }).on('error', () => {
    // Server not running — start it
    console.log('🚀 Server not running. Starting now...');
    exec('node mcp-server/index.js', (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Error starting server:', err.message);
        return res.status(500).json({ error: 'Failed to start server' });
      }
      console.log('✅ Server process started.');
    });

    // Wait for server to be ready, then call API
    checkServerReady().then(() => {
      console.log('✅ Server is now ready. Calling workflow API...');

    triggerWorkflowAPI(id).then((result) => {
		console.log('✅ Workflow started:', result);
		res.json({ message: 'Workflow triggered after server start', response: result });
		}).catch((err) => {
		console.error('❌ Error triggering workflow after server start:', err.message);
		res.status(500).json({ error: err.message || 'Error triggering workflow after server start' });
		});


    }).catch((err) => {
      console.error('❌', err.message);
      res.status(500).json({ error: 'Server failed to start in time.' });
    });
  });
});

// Start the helper API server
app.listen(4000, () => {
  console.log('Helper API running on http://localhost:4000/');
});

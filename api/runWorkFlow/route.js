import { exec } from "child_process";
import path from "path";

/**
 * POST /api/runWorkflow?id=1
 *
 * Starts the MCP server (if it isn’t already running) and then
 * launches the gpt-runner for the LinkedIn workflow.
 */
export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.query;
  if (id !== "1") {
    return res.status(400).json({ error: "Unsupported workflow id" });
  }

  // Adjust these paths to wherever your scripts actually live
  const projectRoot = process.cwd();

  const mcpDir      = path.join(projectRoot, "mcp-server");           // e.g. contains index.js
  const runnerDir   = path.join(projectRoot, "runner");           // contains gpt-runner
  const workflowDef = path.join(projectRoot, "workflows/linkedin.json");

  /** 1️⃣  start MCP (detached – won’t block) */
  exec("node index.js", { cwd: mcpDir, detached: true });

  /** 2️⃣  run the workflow */
  exec(
    `node gpt-runner ${workflowDef}`,
    { cwd: runnerDir },
    (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
        return res.status(500).json({ error: stderr.trim() });
      }
      console.log(stdout);
      return res.status(200).json({ message: "Workflow executed" });
    }
  );
}

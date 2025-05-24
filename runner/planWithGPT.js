const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


async function expandIntent(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!Array.isArray(raw)) throw new Error("Expected an array of steps");

  const output = [];

  for (const step of raw) {
    if (step.action === "figure_out") {
      console.log("🧠 GPT planning from vague intent:", step.intent);
      const prompt = `You are an automation planner. Break down the user's intent into clear browser steps. Each step should have an action and description. 
User intent: "${step.intent}"
Output JSON format:
[
  { "action": "navigate", "url": "..." },
  { "action": "type", "description": "..." },
  { "action": "press", "description": "..." },
  { "action": "click", "description": "..." }
]
  
Double check the json figure you give it it should be a valid json file
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      });


	  let content = response.choices[0].message.content.trim();

	// Remove markdown if GPT wrapped the output in ```
	if (content.startsWith("```")) {
	content = content.replace(/```(?:json)?\\n?/gi, "").replace(/```$/, "").trim();
	}

	try {
	const steps = JSON.parse(content);
	output.push(...steps);
	} catch (err) {
	console.error("❌ Failed to parse GPT response as JSON:");
	console.error(content);
	throw err;
	}
      output.push(...steps);
    } else {
      output.push(step);
    }
  }

  fs.writeFileSync(
    path.resolve(__dirname, "../workflows/generated-from-intent.json"),
    JSON.stringify(output, null, 2)
  );
  console.log("✅ Saved to workflows/generated-from-intent.json");
}

expandIntent(process.argv[2]);

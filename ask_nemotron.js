// ask_nemotron.js
// A simple CLI tool to allow Antigravity (Gemini) and the User to consult Nvidia NeMo Tron.

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node ask_nemotron.js \"<your prompt here>\"");
  process.exit(1);
}

const prompt = args.join(' ');
const apiKey = process.env.NVIDIA_API_KEY;

if (!apiKey) {
  console.error("Error: NVIDIA_API_KEY environment variable is not set.");
  console.error("Please get your API key from https://build.nvidia.com/ and set it.");
  console.error("On Windows Command Prompt: set NVIDIA_API_KEY=your_api_key");
  console.error("On Windows PowerShell: $env:NVIDIA_API_KEY=\"your_api_key\"");
  process.exit(1);
}

const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
const payload = {
  // We use NVIDIA's Llama 3.1 Nemotron 70B model which is highly optimized for coding and instruction following
  model: 'nvidia/llama-3.1-nemotron-70b-instruct',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.2,
  top_p: 0.7,
  max_tokens: 2048,
  stream: false
};

async function ask() {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      const errBody = await response.text();
      console.error(errBody);
      process.exit(1);
    }

    const json = await response.json();
    if (json.choices && json.choices.length > 0) {
      console.log("\n--- NeMo Tron Response ---\n");
      console.log(json.choices[0].message.content);
      console.log("\n--------------------------\n");
    } else {
      console.log("No response content found.");
    }
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

ask();

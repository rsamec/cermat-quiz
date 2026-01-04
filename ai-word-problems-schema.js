
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const codes = ["M9A-2025", "M9B-2025","M9C-2025", "M9D-2025"];
const runs = ["M9I-2025"].map(code => ({ code, prompt: "steps", model: "gpt-5-mini" }));

// Output directory
const outputDir = path.join(__dirname, "./src/generated");

// Create directory if it doesn't exist
fs.mkdirSync(outputDir, { recursive: true });

for (const { code, prompt, model } of runs) {
    const cmd = `node src/data/word-problems-ai-[prompt]-[code]-[model]-schema.json.js --code ${code} --prompt ${prompt} --model ${model}`;

    console.log(`\n▶ Running: ${cmd}`);

    const output = execSync(cmd, {
        encoding: "utf8",
    });

    const fileName = `word-problems-ai-${prompt}-${code}-${model}.json`;
    const outPath = path.join(outputDir, fileName);

    fs.writeFileSync(outPath, output);
}

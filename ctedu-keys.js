
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directories = fs.readdirSync(path.join(__dirname, "./src/ctedu"), { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);
// Output directory
const outputDir = path.join(__dirname, "./src/ctedu");

for (const period of directories) {
    const cmd = `node --experimental-vm-modules ./src/ctedu/key-[period].json.js --period ${period}`;

    console.log(`\n▶ Running: ${cmd}`);

    const output = execSync(cmd, {
        encoding: "utf8",
    });

    const outPath = path.join(outputDir, period, "key.json");

    fs.writeFileSync(outPath, output);
}

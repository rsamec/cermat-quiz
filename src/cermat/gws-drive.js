
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import { parseArgs } from "node:util";

const {
  values: { zip }
} = parseArgs({
  options: { zip: { type: "string" } }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __tempDir = "./generated";

const directories = fs.readdirSync(path.join(__dirname), { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .filter(d => d === "M9A-2026")


async function extractZip(zipPath, outputDir) {
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Read zip file
  const data = fs.readFileSync(zipPath);

  // Load zip
  const zip = await JSZip.loadAsync(data);

  // Iterate through files
  for (const [filename, file] of Object.entries(zip.files)) {
    const filePath = path.join(outputDir, filename);

    if (file.dir) {
      // Create directory
      fs.mkdirSync(filePath, { recursive: true });
    } else {
      // Ensure parent folder exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // Extract file content
      const content = await file.async("nodebuffer");

      // Write file
      fs.writeFileSync(filePath, content);
    }
  }

  console.log("Extraction complete!");
}

function deleteFolder(folder){
    if (fs.existsSync(folder)) {
      fs.rmSync(folder, { recursive: true, force: true });
      console.log("Output directory deleted!", folder);
    }
} 

await extractZip(path.join(__dirname, zip),__tempDir);

// Output directory
const parentId = "148YxchN5xk9YZVQWj2nBEHw-1pcL48db"
for (const period of directories) {
     
    const cmd = `gws drive files create --json '{"name": "${period}", "mimeType": "application/vnd.google-apps.folder", "parents": ["${parentId}"]}'`
    //const cmd = `node --experimental-vm-modules ./src/ctedu/key-[period].json.js --period ${period}`;    
    console.log(`\n▶ Running: ${cmd}`);

    const output = execSync(cmd, {
        encoding: "utf8",
    });
    const currentDir = JSON.parse(output).id;
    console.log(output, currentDir);

    
    const periodPath = path.join(__tempDir, period);    
    const files = fs.readdirSync(periodPath).filter(file => fs.statSync(path.join(periodPath,file)).isFile());

    for (let file of files){
        const fileLocation = path.join(periodPath,file);
        const copyCmd = `gws drive files create --json '{"name": "${file}","mimeType": "application/vnd.google-apps.document", "parents": ["${currentDir}"]}' --upload "${fileLocation}"`
        console.log(`\n▶ Running: ${copyCmd}`);

        const output = execSync(copyCmd, {
            encoding: "utf8",
        });
        console.log(output);
    }

    console.log("Upload complete")
    
    // const outPath = path.join(outputDir, period, "key.json");    

    // fs.writeFileSync(outPath, output);
}

deleteFolder(__tempDir)

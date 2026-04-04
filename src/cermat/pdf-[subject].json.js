import { parseArgs } from "node:util";
import path from 'path';
import { readJsonFromFile, fileExists, saveJsonToFile } from '../utils/file.utils.js';
import { processSubDirectory } from '../utils/pdf.utils.js';

const {
  values: { subject }
} = parseArgs({
  options: { subject: { type: "string" } }
});

const subDir = `cermat-${subject}`
const outputDir = path.resolve('./src/assets/pdf', subDir);
const jsonDataFilePath = path.join(outputDir, "data.json");

let outputData = {}
if (!(await fileExists(jsonDataFilePath))) {
  const entries = await processSubDirectory(path.resolve('./generated', subDir), outputDir);
  outputData = Object.fromEntries(entries);
  await saveJsonToFile(jsonDataFilePath, outputData)
}
else {
  outputData = await readJsonFromFile(jsonDataFilePath)
}

process.stdout.write(JSON.stringify(outputData));


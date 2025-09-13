import { parseArgs } from "node:util";
import fs from 'fs/promises';
import path from 'path';

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});

async function readJsonFromFile(filePath) {
  try {
    // Read the file content
    const data = await fs.readFile(filePath, 'utf8');

    // Parse JSON string into an object
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    throw error;
  }
}

const fileLocation = path.resolve('./src/data/math-geometry.json');

const outputData = await readJsonFromFile(fileLocation)
const parResults = outputData[code] ?? {};
if (parResults != null) {
  process.stdout.write(JSON.stringify(parResults, null, 2));
}
else {
  throw `${fileLocation} does not exists code: ${code}`;
}


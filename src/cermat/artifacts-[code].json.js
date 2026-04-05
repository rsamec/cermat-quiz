import { parseArgs } from "node:util";
import fs from 'fs/promises';
import path from 'path';
import { readJsonFromFile, fileExists } from '../utils/file.utils.js';

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});

const fileLocation = path.resolve(`./src/notebook-lm/data/artifacts-${code}.json`);

let outputData = {}
if (await fileExists(fileLocation)){
  outputData = await readJsonFromFile(fileLocation)
}

process.stdout.write(JSON.stringify(outputData));


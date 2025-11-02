import { parseArgs } from "node:util";
import path from 'path';
import { readJsonFromFile } from '../utils/file.utils.js';

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});

const fileLocation = path.resolve('./src/data/math-geometry.json');

const outputData = await readJsonFromFile(fileLocation)
const parResults = outputData[code] ?? {};
if (parResults != null) {
  process.stdout.write(JSON.stringify(parResults, null, 2));
}
else {
  throw `${fileLocation} does not exists code: ${code}`;
}


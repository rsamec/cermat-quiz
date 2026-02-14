
import { parseArgs } from "node:util";
import path from 'path';
import { readTextFromFile } from "../utils/file.utils.js";
import { buildTS, executeESM } from "../utils/ts-build.utils.js";

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});
const sourceDirPath = path.resolve(`./src/cermat`);
const content = await readTextFromFile(path.resolve(sourceDirPath, `${code}/key.ts`));
const compiled = await buildTS(content, `${sourceDirPath}/${code}`);
const result = await executeESM(compiled);
process.stdout.write(JSON.stringify(result))


import { parseArgs } from "node:util";
import { baseDomain, json } from "../utils/quiz-string-utils.js";

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" }}
});


const metadata = await json(`${baseDomain}/generated/${code}.json`)
process.stdout.write(JSON.stringify(metadata));
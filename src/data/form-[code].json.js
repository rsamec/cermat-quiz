import { parseArgs } from "node:util";
import { baseDomain } from "../utils/quiz-string-utils.js";

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" }}
});


async function json(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} - fetch failed: ${response.status}`);
  return await response.json();
}
const metadata = await json(`${baseDomain}/generated/${code}.json`)
process.stdout.write(JSON.stringify(metadata));
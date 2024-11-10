import { parseArgs } from "node:util";
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls } from "../utils/quiz-string-utils.js";

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" }}
});


async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.text();
}
const d = parseCode(code);
const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);
process.stdout.write(normalizeImageUrlsToAbsoluteUrls(content, [baseUrl]));
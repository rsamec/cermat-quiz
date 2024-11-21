import { parseArgs } from "node:util";
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, text } from "../utils/quiz-string-utils.js";

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" }}
});


const d = parseCode(code);
const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);
process.stdout.write(normalizeImageUrlsToAbsoluteUrls(content, [baseUrl]));
import JSZip from "jszip";
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatShortCode, formatCodeAlt, text } from '../utils/quiz-string-utils.js';
import { quizes } from '../utils/quiz-utils.js';

async function main() {
  const zip = new JSZip();
  for await (const code of quizes.flatMap(d => d.codes)) {
    const { period, subject } = parseCode(code);
    const baseUrl = `${baseDomainPublic}/${subject}/${period}/${code}`
    const content = await text(`${baseUrl}/index.md`);
    const data = `# ${formatCodeAlt(code)} \n\n ${content}`

    const rawContent = normalizeImageUrlsToAbsoluteUrls(data, [baseUrl])
    zip.file(`${subject}/${period}/${formatShortCode(code)}.md`, rawContent)
  }
  return zip
}


try {
  const output = await main();
  output.generateNodeStream().pipe(process.stdout);
}
catch (err) {
  console.error("The sample encountered an error:", err);
};

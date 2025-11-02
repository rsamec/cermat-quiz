import path from 'path';
import JSZip from "jszip";
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCodeAlt, text, formatShortCode, formatPeriod } from '../utils/quiz-string-utils.js';
import { quizes } from '../utils/quiz-utils.js';
import { readTextFromFile } from '../utils/file.utils.js';
import { parseQuiz } from '../utils/quiz-parser.js';
import wordProblems, {  } from '../math/word-problems.js';
import { jsonToMarkdownChat } from "../utils/deduce-utils.js";

const mathQuizesCode = quizes.filter(d => d.subject == "math").flatMap(d => d.codes)

async function outputMd(code){

  
  const d = parseCode(code);
  const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
  const content = await text(`${baseUrl}/index.md`);
  
  
  const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
  const quiz = parseQuiz(rawContent);
  
  const ids = quiz.questions.map(d => d.id);
  
  const wordProblem = wordProblems[code];
  const output = `# ${formatCodeAlt(code)}
  
  ${ids.map(id => {
    const values = (wordProblem?.[id] != null)
      ? [[id, wordProblem[id]]]
      : [1, 2, 3, 4]
        .map(i => `${id}.${i}`)
        .map(subId => wordProblem?.[subId])
        .filter(Boolean)
        .map((d, index) => [`${id}.${index + 1}`, d])
  
  
    return values?.length > 0 ? `
  ${quiz.content([id], { ids, render: 'content' })}\n
  ---
  ${values.map(([key, value]) => 
  `**${key} Rozbor řešení úlohy** \n
  ${jsonToMarkdownChat(value.deductionTree).join("")}`).join("")} \n---`:''}).join('')}
  `
  return output;
}

async function main() {
  const zip = new JSZip();
  for await (const code of mathQuizesCode) {
    const {period} = parseCode(code);
    const data = await outputMd(code);
    zip.file(`${period}/${formatShortCode(code)}.md`,data)
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

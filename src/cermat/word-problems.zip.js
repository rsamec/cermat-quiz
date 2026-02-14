import JSZip from "jszip";
import { normalizeImageUrlsToAbsoluteUrls } from '../utils/quiz-string-utils.js';
import wordProblems from "./word-problems.js";
import fs from 'fs';
import path from 'path';
import { readTextFromFile } from "../utils/file.utils.js";
import { baseUrl } from "./utils.js";
import { formatPeriod } from "./utils.js";
import { parseQuiz } from '../utils/quiz-parser.js';
import { jsonToMarkdownChat } from "../utils/deduce-utils.js";

const ctEduPath = path.resolve(`./src/cermat`);

async function outputMd(period){

  const content = await readTextFromFile(path.resolve(ctEduPath, `${period}/index.md`));        
  const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [`${baseUrl}/${period}`])
  
  const quiz = parseQuiz(rawContent);
  
  const ids = quiz.questions.map(d => d.id);
  
  const wordProblem = wordProblems[period];
  const output = `# ${formatPeriod(period)}
  
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

    const folders = fs.readdirSync(ctEduPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const zip = new JSZip();
    for await (const period of folders) {

        const output = await outputMd(period)
        zip.file(`${period}.md`,output)        
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

import path from 'path';
import JSZip from "jszip";
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCodeAlt, text, formatShortCode, formatPeriod } from '../utils/quiz-string-utils.js';
import { readJsonFromFile } from '../utils/file.utils.js';
import { parseQuiz } from '../utils/quiz-parser.js';
import wordProblems, { } from '../math/word-problems.js';
import { jsonToMarkdownChat } from "../utils/deduce-utils.js";

const unique = (value, index, array) => array.indexOf(value) === index;
const wordProblemsKeyValuePairs = Object.entries(wordProblems).flatMap(([key, value]) => Object.keys(value).map(d => d.split('.')[0]).filter(unique).map(d => [key, d]));

async function outputMd(quiz, code, number) {
  const id = parseInt(number, 10);


  const ids = quiz.questions.map(d => d.id);

  const wordProblem = wordProblems[code];

  const values = (wordProblem?.[id] != null)
    ? [[id, wordProblem[id]]]
    : [1, 2, 3, 4]
      .map(i => `${id}.${i}`)
      .map(subId => wordProblem?.[subId])
      .filter(Boolean)
      .map((d, index) => [`${id}.${index + 1}`, d])


  const output = `${values?.length > 0 ? `
  ${quiz.content([id], { ids, render: 'content' })}\n
  ---
  ${values.map(([key, value]) =>
    `**${key} Rozbor řešení úlohy** \n
  ${jsonToMarkdownChat(value.deductionTree).join("")}`).join("")} \n---` : ''}  
  `
  return output;
}

async function main() {
  const zip = new JSZip();
  const aiCategoriesData = await readJsonFromFile(path.resolve(`./src/data/quiz-categories-gemini-2.5-flash.json`));
  for await (const [code, number] of wordProblemsKeyValuePairs) {
    const aiCategories = aiCategoriesData[code]?.questions ?? [];

    const {subject, period} = parseCode(code);
    const baseUrl = `${baseDomainPublic}/${subject}/${period}/${code}`
    const content = await text(`${baseUrl}/index.md`);


    const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
    const quiz = parseQuiz(rawContent);


    const data = await outputMd(quiz, code, number);
    const fileName = `${number}. ${aiCategories.find(d => d.id == number)?.name ?? 'úloha'}`
    zip.file(`${period}/${code}/${fileName}.md`, data)
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

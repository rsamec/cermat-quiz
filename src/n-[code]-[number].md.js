import { parseArgs } from "node:util";
import path from 'path';
import { parseQuiz } from './utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, text } from './utils/quiz-string-utils.js';
import wordProblems from './math/word-problems.js';
import { jsonToMarkdownChat } from "./utils/deduce-utils.js";
import { readJsonFromFile } from './utils/file.utils.js';


const {
  values: { code, number }
} = parseArgs({
  options: { 
    code: { type: "string" },
    number: { type: "string" }
  }
});

const aiCategoriesData = await readJsonFromFile(path.resolve(`./src/data/quiz-categories-gemini-2.5-flash.json`));
const aiCategories = aiCategoriesData[code]?.questions ?? [];


const id = parseInt(number, 10);
const name = `${id}. ${aiCategories.find(d => d.id == number) ?? 'úloha'}`

const d = parseCode(code);
const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);


const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
const quiz = parseQuiz(rawContent);

const ids = quiz.questions.map(d => d.id);

const wordProblem = wordProblems[code];

const values = (wordProblem?.[id] != null)
    ? [[id, wordProblem[id]]]
    : [1, 2, 3, 4]
      .map(i => `${id}.${i}`)
      .map(subId => wordProblem?.[subId])
      .filter(Boolean)
      .map((d, index) => [`${id}.${index + 1}`, d])


process.stdout.write(`---
title: ${name}
sidebar: false
footer: false
pager: false
toc: false
---
${values?.length > 0 ? `
${quiz.content([id], { ids, render: 'content' })}\n
---
${values.map(([key, value]) => 
`**${key} Rozbor řešení úlohy** \n
${jsonToMarkdownChat(value.deductionTree).join("")}`).join("")} \n---`:''}
`)
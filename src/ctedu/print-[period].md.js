import { parseArgs } from "node:util";
import { parseQuiz } from '../utils/quiz-parser.js';
import mdPlus from '../utils/md-utils.js';
import path from 'path';
import { readTextFromFile } from "../utils/file.utils.js";
import { normalizeImageUrlsToAbsoluteUrls } from "../utils/quiz-string-utils.js";
import { formatPeriod, relativeBaseUrl } from "./utils.js";


const {
  values: { period }
} = parseArgs({
  options: { period: { type: "string" } }
});

const ctEduPath = path.resolve(`./src/ctedu`);
const content = await readTextFromFile(path.resolve(ctEduPath, `${period}/index.md`));        

// const rawContent = content;
const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [`${relativeBaseUrl}/${period}`])
const quiz = parseQuiz(rawContent);

const ids = quiz.questions.map(d => d.id);
process.stdout.write(`---
title: CT EDU doučko ze dne ${formatPeriod(period)}
theme: ["wide"]
sidebar: false
header: false
footer: false
pager: false
toc: false
style: /assets/css/print.css
---

<div data-testid="root" class="root">${ids.map(id => `${mdPlus.renderToString(quiz.content([id],{ ids, render:'content'}), {docId:`${period}-${id}` })}`).join('')}</div>`)
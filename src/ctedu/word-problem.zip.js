import JSZip from "jszip";
import { normalizeImageUrlsToAbsoluteUrls } from '../utils/quiz-string-utils.js';
import fs from 'fs';
import path from 'path';
import wordProblems from "./word-problems.js";
import { readTextFromFile } from "../utils/file.utils.js";
import { parseQuiz } from '../utils/quiz-parser.js';
import { baseUrl } from "./utils.js";
import { jsonToMarkdownChat } from "../utils/deduce-utils.js";

const unique = (value, index, array) => array.indexOf(value) === index;

function outputMd(quiz, period, number) {
    const id = parseInt(number, 10);
    const ids = [id];
    
    const wordProblem = wordProblems[period];
    const values = (wordProblem?.[id] != null)
        ? [[id, wordProblem[id]]]
        : [1, 2, 3, 4]
            .map(i => `${id}.${i}`)
            .map(subId => wordProblem?.[subId])
            .filter(Boolean)
            .map((d, index) => [`${id}.${index + 1}`, d])


    const output = `${values?.length > 0 ? `
${quiz.content(ids, { ids, render: 'content' })}\n---
${values.map(([key, value]) => `**${key} Rozbor řešení úlohy** \n
${jsonToMarkdownChat(value.deductionTree).join("")}`).join("")} \n---` : ''}  
`
    return output;

}

async function main() {

    const ctEduPath = path.resolve(`./src/ctedu`);

    const folders = fs.readdirSync(ctEduPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const zip = new JSZip();
    for await (const period of folders) {

        

        const content = await readTextFromFile(path.resolve(ctEduPath, `${period}/index.md`));
        const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [`${baseUrl}/${period}`])
        const quiz = parseQuiz(rawContent);

        const wordProblem = wordProblems[period];
        const wordProblemKeys = Object.keys(wordProblem).map(d => d.split('.')[0]).filter(unique);
        const questions = quiz.questions.map(d => d.id).filter(d => wordProblemKeys.includes(d.toString()));
        
        for (const number of questions) {
            const data = outputMd(quiz, period, number);
            const fileName = `${number}. uloha`
            zip.file(`${period}/${fileName}.md`, data)
        }
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

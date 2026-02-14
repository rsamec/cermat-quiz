import JSZip from "jszip";
import { normalizeImageUrlsToAbsoluteUrls } from '../utils/quiz-string-utils.js';
import fs from 'fs';
import path from 'path';
import { readTextFromFile } from "../utils/file.utils.js";
import { parseQuiz } from '../utils/quiz-parser.js';
import { baseUrl } from "./utils.js";

function outputMd(quiz, number) {
    const id = parseInt(number, 10);
    const ids = [id];
    const output = quiz.content(ids, { ids, render: 'content' });
    return output;
}

async function main() {

    const ctEduPath = path.resolve(`./src/cermat`);

    const folders = fs.readdirSync(ctEduPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const zip = new JSZip();
    for await (const period of folders) {

        const content = await readTextFromFile(path.resolve(ctEduPath, `${period}/index.md`));        
        const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [`${baseUrl}/${period}`])
        const quiz = parseQuiz(rawContent);

        const questions = quiz.questions.map(d => d.id);
        for (const number of questions) {
            const data = outputMd(quiz, number);
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

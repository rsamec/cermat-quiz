import JSZip from "jszip";
import path from 'path';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatShortCode, text } from '../utils/quiz-string-utils.js';
import { quizes } from '../utils/quiz-utils.js';
import { parseQuiz } from '../utils/quiz-parser.js';
import { readJsonFromFile } from '../utils/file.utils.js';



function outputMd(quiz, code, number) {
  const id = parseInt(number, 10);
  const ids = [id];
  const output = quiz.content(ids, { ids, render: 'content' });
  return output;
}

async function main() {
  const zip = new JSZip();
  const aiCategoriesData = await readJsonFromFile(path.resolve(`./src/data/quiz-categories-gemini-2.5-flash.json`));
  for await (const code of quizes.flatMap(d => d.codes)) {
    const aiCategories = aiCategoriesData[code]?.questions ?? [];

    const {period, subject} = parseCode(code);
    const baseUrl = `${baseDomainPublic}/${subject}/${period}/${code}`
    const content = await text(`${baseUrl}/index.md`);


    const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
    const quiz = parseQuiz(rawContent);

    const questions = quiz.questions.map(d => d.id);
    for (const number of questions){
      const data = outputMd(quiz, code, number);
      const fileName = `${number}. ${aiCategories.find(d => d.id == number)?.name ?? 'úloha'}`
      zip.file(`${subject}/${period}/${formatShortCode(code)}/${fileName}.md`, data)
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

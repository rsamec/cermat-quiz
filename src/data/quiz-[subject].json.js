import { parseArgs } from "node:util";
import { parser } from '@lezer/markdown';
import { getQuizBuilder } from "../utils/parse-utils.js";
import { normalizeImageUrlsToAbsoluteUrls, parseCode } from "../utils/quiz-string-utils.js";
import { readTextFromFile } from "../utils/file.utils.js";
import fs from "node:fs";
import path from "node:path";


const {
  values: { subject }
} = parseArgs({
  options: { subject: { type: "string" } }
});

const relativeBaseUrl = "/cermat";
const cermatPath = path.resolve(`./src/cermat`);
const cermatFolders = fs.readdirSync(cermatPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .filter(d => parseCode(d).subject == subject)


async function cermatQuestions() {
   const data = [] 
   for (const code of cermatFolders) {          
      const content = await readTextFromFile(path.resolve(cermatPath, `${code}/index.md`));        
      
      // const rawContent = content;
      const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [`${relativeBaseUrl}/${code}`])

      data.push({
        code,
        rawContent,      
      })
    }

    return data;
};

const markdownParser = parser.configure([]);
function makeQuizBuilder(normalizedQuiz) {  
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz,{});
}


const data = await cermatQuestions();

const entries = data.map(d => {  
  const questions = d.rawContent != "" ? makeQuizBuilder(d.rawContent).questions.map(d=>d.title) : [];  
  return [d.code,{...d, q:questions}]
});
process.stdout.write(JSON.stringify(Object.fromEntries(entries)));
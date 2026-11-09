import JSZip from "jszip";
import { extractSets } from '@upsetjs/bundle';
import wordProblems from './word-problems.js';
import { unique } from '../utils/common-utils.js';
import { computeTreeMetrics, jsonToMarkdownChatEx } from "../utils/deduce-utils.js";
import { rulesCategories } from '../utils/quiz-utils.js';
import { parser } from '@lezer/markdown';
import { getQuizBuilder } from "../utils/parse-utils.js";
import { normalizeImageUrlsToAbsoluteUrls, parseCode } from "../utils/quiz-string-utils.js";
import { readTextFromFile } from "../utils/file.utils.js";
import fs from "node:fs";
import path from "node:path";

async function createSources(){
  
  const source = "cermat"
  const relativeBaseUrl = `/${source}`;
  const sourcePath = path.resolve(`./src/${source}`);
  const sourceFolders = fs.readdirSync(sourcePath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(d => parseCode(d).subject == 'math')
  
  
  async function sourceQuestions() {
     const data = [] 
     for (const code of sourceFolders) {          
        const content = await readTextFromFile(path.resolve(sourcePath, `${code}/index.md`));        
        
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
  
  
  const data = await sourceQuestions();
  
  const entries = data.map(d => {  
    const questions = d.rawContent != "" ? makeQuizBuilder(d.rawContent).questions.map(d=>d.title) : [];  
    return [d.code,{...d, q:questions}]
  });
  return Object.fromEntries(entries);
}

const rulesMap = [...rulesCategories.entries()].reduce((out, [key, values]) => {
  for (let val of values) {
    out[val] = key
  }
  return out;
}, {})

const result = Object.entries(wordProblems)
  .flatMap(([code, value]) => {
    return Object.entries(value).flatMap(([key, value]) => {
      const metrics = computeTreeMetrics(value.deductionTree);
      const { rules } = metrics;
      const filteredRules = rules.filter(d => d.name != "evalToOptionRule").filter(unique);

      const categoryMap = filteredRules.reduce((out, d) => {
        const category = rulesMap[d.name] ?? d.name;
        out[category] = (out[category] ?? []).concat(d.name);
        return out;
      }, {});

      return {
        name: `${code}-${key}`,
        code,
        key,
        question: key.split(".")[0],
        sets: Object.keys(categoryMap)
      }
    })
  })
const sets = extractSets(result).filter(d => !["eval-option"].includes(d.name));


const markdownParser = parser.configure([]);
function makeQuizBuilder(normalizedQuiz) {  
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz,{});
}

const quizQuestionsMap = await createSources()
// console.log("Done")

const filteredQuizCategoriesMap = Object.entries(wordProblems).flatMap(([code, codeProblems]) => {  
  // const parsedCode = parseCode(code);
  const questionMap = quizQuestionsMap
  
  const quiz = questionMap[code];
  if (quiz == null) return [];
  const builder = makeQuizBuilder(quiz.rawContent)
  return Object.entries(Object.groupBy(Object.entries(codeProblems), ([id]) => id.split('.')[0])).map(([groupKey, problems]) => {
      return {
        id: groupKey,
        name: builder.questions.find(q => q.id == groupKey)?.title ?? groupKey,
        code,    
        builder,      
        deductionTrees: problems.map(([id, value]) => value.deductionTree)
      };
    })
  }
)
.reduce((out, d) => {
  out[`${d.code}-${d.id}`] = d;
  return out;
}, {})

function outputMd(selection, withInput, onlyHighlighted) {

  const rules = [selection.name].flatMap(d => rulesCategories.get(d) ?? [d]);
  return Object.entries(Object.groupBy(selection?.elems ?? [], d => `${d.code}-${d.question}`))
    .map(([key, values], index) => {
      const item = filteredQuizCategoriesMap[key];
      return `${withInput ? `${item.builder.content([parseInt(item.id)], { render: 'content' })} \n---\n`:''}${(item.deductionTrees ?? [])
        .map((tree, i) => jsonToMarkdownChatEx(tree, { rules })
          .filter(d => d.isContext !== true))
        .map((steps, i, arr) => {
          const filteredSteps = steps.filter(d => !onlyHighlighted || d.anyHighlighted);
          return filteredSteps.length > 0
            ? `## ${item.id}.${i + 1} - Kroky řešení (${steps.length > filteredSteps.length 
              ? `zobrazeno ${filteredSteps.length} z ${steps.length} kroků`
              : `celkem ${steps.length} kroků`}) \n\n ${filteredSteps.map((d, i) => `### ${i + 1}. ${d.md}`).join("")}` : ''
        })
        .filter(d => d != "").join(`---\n`)}`

    })
    .join('\n---\n')

}
async function main() {

  const zip = new JSZip();
  for await (const set of sets) {    
    zip.file(`rules/${set.name}.md`, outputMd(set, true, false))
    zip.file(`rules-only-highlighted/${set.name}.md`, outputMd(set, true, true))
    zip.file(`rules-minimal/${set.name}.md`, outputMd(set, false, true))
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

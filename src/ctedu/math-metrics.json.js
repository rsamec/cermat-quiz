import fs from "node:fs";
import path from "node:path";
import { readJsonFromFile, mergeShallow } from "../utils/file.utils.js";
import wordProblems from './word-problems.js';
import { uniqueQuestionCount } from '../utils/quiz-string-utils.js';
import { computeTreeMetrics } from "../utils/deduce-utils.js";

const source = "ctedu"
const relativeBaseUrl = `/${source}`;
const sourcePath = path.resolve(`./src/${source}`);
const sourceFolders = fs.readdirSync(sourcePath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)

async function sourceQuestions() {
  const data = []
  for (const code of sourceFolders) {
    const content = await readJsonFromFile(path.resolve(sourcePath, `${code}/key.json`));

    const questionsKeys = Object.keys(content.children)
    data.push({
      key:code,
      questions: {
        count: questionsKeys.length,
        keys: questionsKeys
      }
    })
  }

  return data;
};


function toWordProblemsKeys(data) {
  return Object.entries(data).map(([key, value]) => ({
    key,
    wordProblem: {
      count: uniqueQuestionCount(value),
      steps: sum(Object.entries(wordProblemGroupById(value)).flatMap(([key, values]) => count(values.flatMap(d => d.rules))))
    }
  }))
}

function count(strings) {
  return strings.reduce((acc) => acc = acc + 1, 0);
}
function sum(strings) {
  return strings.reduce((acc, d) => acc = acc + d, 0);
}
function wordProblemGroupById(wordProblem) {

  const deductionTrees = Object.entries(wordProblem).reduce((out, [key, value], index) => {
    out.push({
      key,
      ...computeTreeMetrics(value.deductionTree)
    })
    return out;
  }, []);

  return Object.groupBy(deductionTrees, ({ key }) => parseInt(key.split(".")[0]));
}

const questionsCount = await sourceQuestions();
const wordProblemObject = toWordProblemsKeys(wordProblems)



const result = Object.values(mergeShallow({}, questionsCount, wordProblemObject))

process.stdout.write(JSON.stringify(result))


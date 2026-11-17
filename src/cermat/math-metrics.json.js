import path from 'path';
import { readJsonFromFile, mergeShallow } from '../utils/file.utils.js';
import wordProblems from './word-problems.js';
import { uniqueQuestionCount } from '../utils/quiz-string-utils.js';
import { computeTreeMetrics } from "../utils/deduce-utils.js";

const expressions = await readJsonFromFile(path.resolve('./src/cermat/math-answers.json'));
const geometry = await readJsonFromFile(path.resolve('./src/cermat/math-geometry.json'));



function uniqueStepsCount(value) {
  return sum(Object.entries(value).map(([_, value]) => sum(value.results?.flatMap(d => d.TemplateSteps.flatMap(s => s.Steps.length)) ?? [])));
}

function toKeys(data, keyName, stepsKeyName) {
  return Object.entries(data).map(([key, value]) => ({
    key,
    [keyName]: {
      count: uniqueQuestionCount(value),
      steps: uniqueStepsCount(value)
    }
  }))
}
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

const expressionObject = toKeys(expressions, "expression")
const geometryObject = toKeys(geometry, "geometry")
const wordProblemObject = toWordProblemsKeys(wordProblems)

const result = Object.values(mergeShallow({}, wordProblemObject, expressionObject, geometryObject))

process.stdout.write(JSON.stringify(result))


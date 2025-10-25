import path from 'path';
import { readJsonFromFile } from '../utils/file.utils.js';
import wordProblems from '../math/word-problems.js';
import {uniqueQuestionCount} from '../utils/quiz-string-utils.js';
import { computeTreeMetrics } from "../utils/deduce-utils.js";

const expressions = await readJsonFromFile(path.resolve('./src/data/math-answers.json'));
const geometry = await readJsonFromFile(path.resolve('./src/data/math-geometry.json'));
const isPlainObject = v => v && typeof v === 'object' && !Array.isArray(v);

const mergeShallowImmutable = (...sources) =>
  sources.reduce((acc, src) => {
    if (!src) return acc;
    return Object.keys(src).reduce((next, key) => {
      const val = src[key];
      const existing = next[key];

      // If both are plain objects, shallow-merge their first level into a new object
      if (isPlainObject(val) && isPlainObject(existing)) {
        return { ...next, [key]: { ...existing, ...val } };
      }

      // Otherwise overwrite with src's value (arrays and primitives are overwritten)
      return { ...next, [key]: val };
    }, acc);
  }, {});

function uniqueStepsCount(value) {
  return sum(Object.entries(value).map(([_,value]) => sum(value.results?.flatMap(d => d.TemplateSteps.flatMap(s => s.Steps.length)) ?? [])));
}

function toKeys(data, keyName, stepsKeyName){
    return Object.entries(data).map(([key, value]) => ({
        key, 
        [keyName]:{
            count:uniqueQuestionCount(value),
            steps:uniqueStepsCount(value)
        }
    }))
}
function toWordProblemsKeys(data){
    return Object.entries(data).map(([key, value]) => ({
        key,
        wordProblem: {
          count: uniqueQuestionCount(value),
          steps:sum(Object.entries(wordProblemGroupById(value)).flatMap(([key, values]) => count(values.flatMap(d => d.rules))))
        }
     }))
}

function count(strings){
  return strings.reduce((acc) => acc = acc + 1,0);
}
function sum(strings){
  return strings.reduce((acc,d) => acc = acc + d,0);
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

const expressionObject = toKeys(expressions,"expression")
const geometryObject = toKeys(geometry, "geometry")
const wordProblemObject = toWordProblemsKeys(wordProblems)

const result = Object.values(mergeShallowImmutable(wordProblemObject, expressionObject, geometryObject))

process.stdout.write(JSON.stringify(result))


import wordProblems from '../math/word-problems.js';
import { unique } from '../utils/common-utils.js';
import { computeTreeMetrics } from "../utils/deduce-utils.js";
import { rulesCategories } from '../utils/quiz-utils.js';


const rulesMap = [...rulesCategories.entries()].reduce((out, [key, values]) => {
  for (let val of values) {
    out[val] = key
  }
  return out;
}, {})

const result = Object.entries(wordProblems)
  // .filter(([code]) => code === "M9B-2024")  
  
  .flatMap(([code, value]) => {
    return Object.entries(value).flatMap(([key, value]) => {
      const metrics = computeTreeMetrics(value.deductionTree);
      const { rules } = metrics;
      return {
        name: `${code}-${key}`,
        code,
        key,
        question: key.split(".")[0],
        sets: rules.filter(d => d.name != "evalToOptionRule").map(d => (rulesMap[d.name] ?? d.name)).filter(unique)
      }
    })
  })

process.stdout.write(JSON.stringify(result, null, 2));
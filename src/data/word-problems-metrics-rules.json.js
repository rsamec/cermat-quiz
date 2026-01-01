import wordProblems from '../math/word-problems.js';
import { computeTreeMetrics } from "../utils/deduce-utils.js";
import { predicatesCategories } from '../utils/quiz-utils.js';


const predicatesMap = [...predicatesCategories.entries()].reduce((out, [key, values]) => {
  for (let val of values) {
    out[val] = key
  }
  return out;
}, {})

const result = Object.entries(wordProblems)
//.filter(([code]) => code === "M9B-2024")
.flatMap(([code, value]) => {
  return Object.entries(value).flatMap(([key,value]) =>{
    const metrics = computeTreeMetrics(value.deductionTree);
    const {rules} = metrics;
    return rules.flatMap((d,i) => ({
      name: `${code}-${key} ${i+1}.`,
      code,
      key,
      question: key.split(".")[0],
      index:i,
      rule: d.name,
      sets: d.inputs.map(d => predicatesMap[d] ?? d)
    }))
  })
})

process.stdout.write(JSON.stringify(result, null, 2));
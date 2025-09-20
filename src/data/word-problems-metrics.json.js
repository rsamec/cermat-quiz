import { parseArgs } from "node:util";
import wordProblems from '../math/word-problems.js';
import { computeTreeMetrics } from "../utils/deduce-utils.js";
import { unique } from "../utils/common-utils.js";

function usages(strings) {
  return strings.reduce((acc, str) => {
    acc[str] = (acc[str] || 0) + 1;
    return acc;
  }, {});
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



const result = Object.entries(wordProblems).reduce((out, [key, value]) => {

  out[key] = Object.entries(wordProblemGroupById(value)).reduce((out, [key, values]) => {
    const predicates = values.flatMap(d => d.predicates);
    const rules = values.flatMap(d => d.rules);
    const inputParameters = values.flatMap(d => d.inputParameters);
    out[key] = {
      predicates: predicates.filter(unique),
      usages: usages(predicates),
      rules,
      rulesUsages: usages(rules),
      inputParameters,
      maxDepth: Math.max(...values.map(d => d.depth)),
      maxWidth: Math.max(...values.map(d => d.width)),
      count: values.length
    }
    return out;
  }, {})
  return out;
}, {})

process.stdout.write(JSON.stringify(result, null, 2));
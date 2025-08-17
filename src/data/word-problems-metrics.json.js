import { parseArgs } from "node:util";
import wordProblems from '../math/word-problems.js';
import { computeTreeMetrics } from "../utils/deduce-utils.js";
import { unique } from "../utils/common-utils.js";

function predicateUsages(strings) {
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
    out[key] = {
      predicates: predicates.filter(unique),
      usages: predicateUsages(predicates)
    }
    return out;
  }, {})
  return out;
}, {})

process.stdout.write(JSON.stringify(result, null, 2));
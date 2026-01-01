import wordProblems from '../math/word-problems.js';
import { computeTreeMetrics, wordProblemGroupById } from "../utils/deduce-utils.js";
import { unique } from "../utils/common-utils.js";

function usages(strings) {
  return strings.reduce((acc, str) => {
    acc[str] = (acc[str] || 0) + 1;
    return acc;
  }, {});
}

const result = Object.entries(wordProblems).reduce((out, [key, value]) => {

  out[key] = Object.entries(wordProblemGroupById(value, ([key, value]) => ({ key, ...computeTreeMetrics(value.deductionTree) })))
    .reduce((out, [key, values]) => {
      const predicates = values.flatMap(d => d.predicates);
      const rules = values.flatMap(d => d.rules).map(d => d.name);
      const formulas = values.flatMap(d => d.formulas);
      out[key] = {
        predicates: predicates.filter(unique),
        usages: usages(predicates),
        rules,
        rulesUsages: usages(rules),
        formulas,
        formulasUsages: usages(formulas),
        maxDepth: Math.max(...values.map(d => d.depth)),
        maxWidth: Math.max(...values.map(d => d.width)),
        count: values.length
      }
      return out;
    }, {})
  return out;
}, {})

process.stdout.write(JSON.stringify(result, null, 2));
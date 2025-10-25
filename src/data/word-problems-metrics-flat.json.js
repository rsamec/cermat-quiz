import wordProblems from '../math/word-problems.js';
import { computeTreeMetrics } from "../utils/deduce-utils.js";

function sum(strings){
  return strings.reduce((acc) => acc = acc + 1,0);
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
const result = Object.entries(wordProblems).flatMap(([code, value]) => {
  return Object.entries(wordProblemGroupById(value)).flatMap(([key, values]) => {
    const predicates = values.flatMap(d => d.predicates);
    const rules = values.flatMap(d => d.rules);
    const formulas = values.flatMap(d => d.formulas);
  
    return {
      code,
      key,
      predicates: sum(predicates),
      rules: sum(rules),
      formulas: sum(formulas),
      maxDepth: Math.max(...values.map(d => d.depth)),
      maxWidth: Math.max(...values.map(d => d.width)),
      count: values.length
    }
  })
})

process.stdout.write(JSON.stringify(result, null, 2));
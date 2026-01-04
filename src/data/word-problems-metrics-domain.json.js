import wordProblems from '../math/word-problems.js';
import { computeTreeMetrics } from "../utils/deduce-utils.js";
import { predicateTaxonomy, czTranslations } from '../utils/quiz-utils.js';


const result = Object.entries(wordProblems)
  .flatMap(([code, value]) => {
    return Object.entries(value).flatMap(([key, value]) => {
      const metrics = computeTreeMetrics(value.deductionTree);
      const { rules } = metrics;
      return rules.flatMap((d, i) => ({
        name: `${code}-${key} ${i + 1}.`,
        code,
        key,
        question: key.split(".")[0],
        index: i,
        rule: d.name,
        sets: d.inputs.flatMap(d => predicateTaxonomy[d].domain?.map(d => czTranslations[d]) ?? d)
      }))
    })
  })

process.stdout.write(JSON.stringify(result, null, 2));
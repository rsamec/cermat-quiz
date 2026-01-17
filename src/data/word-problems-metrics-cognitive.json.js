import wordProblems from '../math/word-problems.js';
import { computeTreeMetrics } from "../utils/deduce-utils.js";
import { rulesTaxonomy, czTranslations } from '../utils/quiz-utils.js';
import { unique } from '../utils/common-utils.js';


const result = Object.entries(wordProblems)
  .flatMap(([code, value]) => {
    return Object.entries(value).map(([key, value]) => {
      const metrics = computeTreeMetrics(value.deductionTree);
      const { rules } = metrics;
      return {      
        name: `${code}-${key}`,
        code,
        key,
        question: key.split(".")[0],
        sets: rules.flatMap(d => rulesTaxonomy[d.name]?.cognitive.map(d => czTranslations[d]) ?? d.name).filter(unique)
      }
    })
  })

process.stdout.write(JSON.stringify(result, null, 2));
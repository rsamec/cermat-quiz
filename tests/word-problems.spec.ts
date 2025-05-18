import { test, expect } from '@playwright/test';
import { parseCode } from '../src/utils/quiz-string-utils.js'
import { quizes } from "../src/utils/quiz-utils.js";
import wordProblems from '../src/math/word-problems';
import { convertTree, getAllLeafsWithAncestors, getQuizBuilder, OptionList, ShortCodeMarker } from '../src/utils/parse-utils.js';
import { baseDomain } from "../src/utils/quiz-string-utils.js";
import { getVerifyFunction } from '../src/utils/assert';

const codes = quizes.flatMap(d => d.codes);

async function json(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} - fetch failed: ${response.status}`);
  return await response.json();
}



function parseQuestionId(id, subject) {
  const parts = id.split(".");
  return parseInt(
    (subject === "cz" || subject === "math") ? parts[0] : parts[1],
    10
  );
}
function last(problem) {
  const node = problem.deductionTree;
  return node.children[node.children.length - 1];
}

for (const code of codes.filter(code => parseCode(code).subject === "math")) {
  const problems = wordProblems[code];
  const count = Object.keys(problems ?? {}).length;

  test(`${code} - ${count}`, async ({ page }) => {

    const { subject, period, year } = parseCode(code);
    const metadata = await json(`${baseDomain}/generated/${code}.json`)
    const leafs = getAllLeafsWithAncestors(convertTree(metadata)); //, ({ leaf }) => parseQuestionId(leaf.data.id, subject);

    const metadataMap = new Map<string, { verifyBy: any }>(leafs.map(d => [d.leaf.data.id, d.leaf.data.node]));
    

    for (let key in problems) {

      const { verifyBy } = metadataMap.get(key);
      const validator = getVerifyFunction(verifyBy);
      const problem = problems[key];
      const resultNode = last(problem);

      const resultQuantity = resultNode.quantity ?? resultNode.ratio;

      if (verifyBy.kind === "equal" && typeof verifyBy.args === "number") {
        expect(resultQuantity, key).toEqual(expect.closeTo(verifyBy.args, 2))
      }
      else if (verifyBy.kind === "equalOption") {
        //expect(resultNode.kind).toBe("eval-option");
        expect(resultNode.value, key).toBe(verifyBy.args);
      }
      else {
        const result = validator(resultQuantity);
        expect(result, key).toBeFalsy();
      }
    }
  })
}


import { test, expect } from '@playwright/test';
import { parseCode } from '../src/utils/quiz-string-utils.js'
import { quizes } from "../src/utils/quiz-utils.js";
import wordProblems from '../src/math/word-problems';
import { convertTree, getAllLeafsWithAncestors } from '../src/utils/parse-utils.js';
import { baseDomain } from "../src/utils/quiz-string-utils.js";
import { getVerifyFunction } from '../src/utils/assert';
import { skip } from 'node:test';

const codes = quizes.flatMap(d => d.codes);

async function json(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} - fetch failed: ${response.status}`);
  return await response.json(); ``
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
      console.log(`  - ${key}`);
      const { verifyBy } = metadataMap.get(key);
      const validator = getVerifyFunction(verifyBy);
      const problem = problems[key];
      const resultNode = last(problem);
      const nodeToConvert = problem.convertToTestedValue;
      const resultQuantity = nodeToConvert != null
        ? nodeToConvert(resultNode)
        : (resultNode.quantity ?? resultNode.ratio);

      console.log(`${code}: ${key} - ${resultNode.kind} - ${verifyBy.kind}`);
      if (verifyBy.kind === "equal" && typeof verifyBy.args === "number") {
        if (resultNode.kind === "comp-ratio" && resultNode.asPercent) {
          expect((resultQuantity - 1) * 100, `${code}: ${key}`).toEqual(expect.closeTo(verifyBy.args, 2))
        }
        else {
          expect(resultQuantity, `${code}: ${key}`).toEqual(expect.closeTo(verifyBy.args, 2))
        }
      }
      else if (verifyBy.kind === "equalOption") {
        //expect(resultNode.kind).toBe("eval-option");
        if (resultNode.kind === "ratios") {
          skip(`Skipping equalOption for ${code}: ${key}`);
        }
        else {
          expect(resultNode.value, `${code}: ${key}`).toBe(verifyBy.args);
        }
      }
      else if (verifyBy.kind === "equalRatio") {
        expect(resultNode.ratios.join(":")).toBe(verifyBy.args);
      }
      else if (verifyBy.kind === "equalNumberCollection" && resultNode.kind === "tuple") {
        expect(resultNode.items.map(d => d.quantity ?? d.ratio).sort()).toEqual(verifyBy.args.sort());
      }
      else if (verifyBy.kind === "selfEvaluate") {
        skip(`Skipping selfEvaluate for ${code}: ${key}`);
      }
      else if (verifyBy.kind === "equalMathExpression") {
        skip(`Skipping equalMathExpression for ${code}: ${key}`);
      }
      else {
        const result = validator(resultQuantity);
        expect(result, `${code}: ${key}`).toBeFalsy();
      }
    }
  })
}


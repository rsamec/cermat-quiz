import { test, expect } from '@playwright/test';
import wordProblems from '../src/cermat/word-problems.js';
import { convertTree, getAllLeafsWithAncestors } from '../src/utils/parse-utils.js';
import { getVerifyFunction } from '../src/utils/assert.js';
import { skip } from 'node:test';
import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import { readJsonFromFile } from '../src/utils/file.utils.js'


const ctEduPath = resolve(`./src/cermat`);

const ctEduFolders = readdirSync(ctEduPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);


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

for (const period of ctEduFolders) {
  const problems = wordProblems[period];
  const count = Object.keys(problems ?? {}).length;

  test(`${period} - ${count}`, async ({ page }) => {

    const metadata = await readJsonFromFile(resolve(`./src/cermat/${period}/key.json`))
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

      console.log(`${period}: ${key} - ${resultNode.kind} - ${verifyBy.kind}`);
      if (verifyBy.kind === "equal" && typeof verifyBy.args === "number") {
        if (resultNode.kind === "comp-ratio" && resultNode.asPercent) {
          expect(Math.abs((resultQuantity - 1) * 100), `${period}: ${key}`).toEqual(expect.closeTo(verifyBy.args, 2))
        }
        else {
          expect(resultQuantity, `${period}: ${key}`).toEqual(expect.closeTo(verifyBy.args, 2))
        }
      }
      else if (verifyBy.kind === "equalOption") {
        //expect(resultNode.kind).toBe("eval-option");
        if (resultNode.kind === "ratios") {
          skip(`Skipping equalOption for ${period}: ${key}`);
        }
        else {
          expect(resultNode.value, `${period}: ${key}`).toBe(verifyBy.args);
        }
      }
      else if (verifyBy.kind === "equalRatio") {
        expect(resultNode.ratios.join(":")).toBe(verifyBy.args);
      }
      else if (verifyBy.kind === "equalNumberCollection" && resultNode.kind === "tuple") {
        expect(resultNode.items.map(d => d.quantity ?? d.ratio).sort()).toEqual(verifyBy.args.sort());
      }
      else if (verifyBy.kind === "selfEvaluate") {
        skip(`Skipping selfEvaluate for ${period}: ${key}`);
      }
      else if (verifyBy.kind === "equalMathExpression") {
        skip(`Skipping equalMathExpression for ${period}: ${key}`);
      }
      else {
        const result = validator(resultQuantity);
        expect(result, `${period}: ${key}`).toBeFalsy();
      }
    }
  })
}

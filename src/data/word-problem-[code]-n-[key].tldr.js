import { parseArgs } from "node:util";
import wordProblems from '../math/word-problems.js';
import { deductionTreeShapes } from "../ai/tldraw.js";
import { mapShapes, mapBindings, serialize, createPage } from "../ai/tldraw-store.js";
const {
  values: { code, key }
} = parseArgs({
  options: {
    code: { type: "string" },
    key: { type: "string" }
  }
});

const wordProblem = wordProblems[code] ?? {};

const out = [];
const newPage = createPage({
  name: `Úloha ${key}`,
})
out.push(newPage);

const deduceTreeResponse = deductionTreeShapes(wordProblem[key].deductionTree, `Úloha ${key}`);
const { data, width, height } = deduceTreeResponse;

const shapesToAdd = mapShapes(data.shapes.map((d, i) => ({
  ...d,
  ...(i === 0 && { parentId: newPage.id }),
})), newPage.index);
out.push(...shapesToAdd);
out.push(...mapBindings(data.bindings));


process.stdout.write(serialize(out));
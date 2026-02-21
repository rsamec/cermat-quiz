import { parseArgs } from "node:util";
import wordProblems from './word-problems.js';
import { deductionTreeShapes } from "../ai/tldraw.js";
import { mapShapes, mapBindings, serialize, createPage } from "../ai/tldraw-store.js";

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});

const wordProblem = wordProblems[code] ?? {};

const usedQuestionIds = []
let newPage;
let cumulativeY = 0;
const result = Object.entries(wordProblem).sort(([f], [s]) => f.localeCompare(s, 'en', { numeric: true }))
  .reduce((out, [key, value], index) => {
    const id = parseInt(key.split(".")[0]);

    if (!usedQuestionIds.includes(id)) {
      newPage = createPage({
        name: `Úloha ${id}`,
      })
      out.push(newPage);
      cumulativeY = 0;
      usedQuestionIds.push(id)
    }

    const deduceTreeResponse = deductionTreeShapes(value.deductionTree, `Úloha ${key}`);
    const { data, width, height } = deduceTreeResponse;

    const shapesToAdd = mapShapes(data.shapes.map((d, i) => ({
      ...d,
      ...(i === 0 && { parentId: newPage.id }),
      ...(i === 0 && { y: (cumulativeY) }),
    })), newPage.index);
    out.push(...shapesToAdd);
    out.push(...mapBindings(data.bindings));

    cumulativeY += height + 60;
    return out;
  }, [])


process.stdout.write(serialize(result));
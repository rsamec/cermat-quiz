import { parseArgs } from "node:util";
import wordProblems from './word-problems.js';

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});

const wordProblem = wordProblems[code] ?? {};
process.stdout.write(JSON.stringify(wordProblem, null, 2));
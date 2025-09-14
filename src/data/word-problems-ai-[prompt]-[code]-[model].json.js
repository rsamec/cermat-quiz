import { parseArgs } from "node:util";
import { parseQuiz } from '../utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, text } from '../utils/quiz-string-utils.js';
import wordProblems, { } from '../math/word-problems.js';
import { generateAIMessages, wordProblemGroupById } from "../utils/deduce-utils.js";
import { client } from "../ai/ai-utils.js";



const {
  values: { code, prompt, model }
} = parseArgs({
  options: {
    code: { type: "string" },
    prompt: { type: "string" },
    model: { type: "string" }
  }
});


const provider = {
  kind: "openai",
  model,
}


const d = parseCode(code);
const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);


const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
const quiz = parseQuiz(rawContent);
const ids = quiz.questions.map(d => d.id);

const wordProblem = wordProblems[code] ?? {};

const wordProblemGroups = wordProblemGroupById(wordProblem);

const aiPrompts = [...Object.entries(wordProblemGroups)].map(([id, group]) => [id, generateAIMessages({
  template: quiz.content([parseInt(id)], { ids, render: 'content' }),
  deductionTrees: group.map(d => d.deductionTrees)
})]);

//console.log("Word problems prompts:", aiPrompts.map(([key,prompts]) => prompts[prompt]).join('\n\n'));

async function main() {

  // console.log(aiPrompts);
  // return "";

  let data = {}

  for await (let [key, prompts] of aiPrompts) {
    const response = await client.rawCallAI(provider.kind, {
      model: provider.model,
      prompt: [{ role: "user", content: prompts[prompt] }]
    });

    if (response.success) {
      // Update the data with new key-value pair
      data[key] = response.raw;
    }
    else {
      console.log(response.error)
    }

  }
  return data;
}

try {
  const output = await main();
  process.stdout.write(JSON.stringify(output, null, 2));
}
catch (err) {
  console.error("The sample encountered an error:", err);
};




import { parseArgs } from "node:util";
import { parseQuiz } from '../utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCodeAlt, text } from '../utils/quiz-string-utils.js';
import wordProblems, {  } from '../math/word-problems.js';
import { jsonToMarkdownChat } from "../utils/deduce-utils.js";
import Fraction from 'fraction.js';
import OpenAI from "openai";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";
const usePaidApi = false;  
const subject = "math";


const mdFormatting = {
  formatRatio: (d,asPercent) => asPercent ? `${(d * 100).toLocaleString("cs-CZ")}%`  : new Fraction(d).toFraction(),
}

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});


const d = parseCode(code);
const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);


const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
const quiz = parseQuiz(rawContent);

const ids = quiz.questions.map(d => d.id);

const wordProblem = wordProblems[code];

const questions = ids.map(id => {
  const values = (wordProblem?.[id] != null)
    ? [[id, wordProblem[id]]]
    : [1, 2, 3]
      .map(i => `${id}.${i}`)
      .map(subId => wordProblem?.[subId])
      .filter(Boolean)
      .map((d, index) => [`${id}.${index + 1}`, d])


  return values?.length > 0 ? [id,`
${quiz.content([id], { ids, render: 'content' })}\n
---
${values.map(([key, value]) => 
`**${key} Rozbor řešení úlohy** \n
${jsonToMarkdownChat(value.deductionTree, mdFormatting).join("")}`).join("")} \n
`]:null}).filter(d => d != null);


async function main() {


  const client = usePaidApi ? new OpenAI({
    organization: "org-u9Q9NxhzuntTO1rgjfl2Kkaq",
    project: "proj_3AmxUiUlFDCV0xxQD5DteczY",    
  }) : new OpenAI({ baseURL: endpoint, apiKey: token });
  


  let data = {}

  for await (let [key, text] of questions) {
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "user", content: `You are an expert at ${subject === 'math' ? 'math' : subject === 'cz' ? 'czech language' : `${subject} language`}.
            You will be given a question and the step by step solution.
            The input format is markdown text in czech language.
            Output text should be in the czech language.
            Follow the same step by step solution, but adjust the step explanation so that to make it as clear and understandable as possible.
            Follow the deduction logic. Do not add any equations with unknowns. 
            `
        },
        {
          role: "user", content: [
            { type: "text", text },
          ]
        },
      ],
      temperature: 1.,
      max_completion_tokens: 5000,
      top_p: 1.
    });

    const result = response.choices[0].message.content;

    if (result != null) {
      // Update the data with new key-value pair
      data[key] = result;
    }
    else {
      //console.log(response)
    }

  }
  return data;
}

try {
  const output = await main();
  process.stdout.write(JSON.stringify(output, null, 2));
}
catch(err){
  console.error("The sample encountered an error:", err);
};




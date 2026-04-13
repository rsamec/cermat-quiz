import { parseArgs } from "node:util";
import { client, chunk } from "../ai/ai-utils.js";
import { quizSchema } from "../utils/zod.utils.js";
import path from "node:path";

import { parseQuiz } from '../utils/quiz-parser.js';
import { parseCode, normalizeImageUrlsToAbsoluteUrls } from '../utils/quiz-string-utils.js';
import { readTextFromFile, readJsonFromFile } from '../utils/file.utils.js'
import { relativeBaseUrl } from './utils.js'

function getChildrenIdsByGroup(metaData, ids) {
  return ids.flatMap(id => Object.keys((metaData.children[id])?.children ?? {})).map(co => co.split(".").map(d => parseInt(d, 10))[1])
}
const {
  values: { code, model }
} = parseArgs({
  options: {
    code: { type: "string" },
    model: { type: "string" }
  }
});

const provider = {
  kind: "openai",
  model
}

const d = parseCode(code);
const { subject } = d;

const content = await readTextFromFile(path.resolve(`./src/cermat`, `${code}/index.md`));
const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [`${relativeBaseUrl}/${code}`])
const quizBuilder = parseQuiz(rawContent);

const metadata = await readJsonFromFile(path.resolve(`./src/cermat/${code}/key.json`))

const selfEvaluateKind = "selfEvaluate";
const metadataChildren = metadata.children;
const rootChildrenIds = Object.entries(metadataChildren)
  .filter(([_, value]) => value.verifyBy?.kind != selfEvaluateKind || Object.entries(value.children ?? {}).some(([_, value]) => value.verifyBy?.kind != selfEvaluateKind))
  .map(([key]) => parseInt(key, 10));

const chunkedChildren = chunk(rootChildrenIds, 2);

const chunkedDatas = chunkedChildren.map(d => ({
  metadata: {
    children: Object.fromEntries(Object.entries(metadataChildren)
      .filter(([key, value]) => d.includes(parseInt(key, 10))))
  },
  content: quizBuilder.content(subject == "math" || subject == "cz" ? d : getChildrenIdsByGroup(quiz, d))
}))

async function main() {
  let data = {}

  for await (let chunkedData of chunkedDatas) {

    const response = await client.callAI(provider.kind, {
      model: provider.model,
      prompt: [
        {
          role: "user", content: `You are an expert at ${subject === 'math' ? 'math' : subject === 'cz' ? 'czech language' : `${subject} language`}.
            You will be given quiz with questions. The quiz format is markdown text.
            Each question is identified by markdown headings. Some question can have sub questions.
            - # heading is root questions - question id is identified by format # {number}
            - ## heading is sub question - question id is identified by format ## {number}.{number}`
        },
        {
          role: "user", content: "Solve the quiz questions and return the final answer for each question or sub question. Do not include steps to explain the result."
        },
        { role: "user", content: chunkedData.content },
      ],
      schema: quizSchema(chunkedData.metadata),
      schemaName: code
    });


    if (response.success) {
      // Update the data with new key-value pair
      data = Object.assign(data ?? {}, response.data);
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

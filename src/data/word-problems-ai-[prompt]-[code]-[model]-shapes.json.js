import { parseArgs } from "node:util";
import path from 'path';
import { readJsonFromFile, fileExists } from '../utils/file.utils.js';
import { parseCode } from '../utils/quiz-string-utils.js';
import { client } from "../ai/ai-utils.js";
import { OPENAI_SYSTEM_PROMPT } from "../ai/system-prompt.js";
import { ModelResponse } from "../ai/schema.js";




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
  model
}

const d = parseCode(code);



const aiAnswersDataPath = path.resolve(`./src/data/word-problems-ai-${prompt}-${code}-${model}.json`);
if (!await fileExists(aiAnswersDataPath)) {
  throw `missing files ${aiAnswersDataPath}`
}
const aiAnswers = await readJsonFromFile(aiAnswersDataPath);


async function main() {


  let data = {}

  for await (let [key, text] of [...Object.entries(aiAnswers)]) {
    const response = await client.callAI(provider.kind, {
      model: provider.model,
      prompt: [
        { role: "system", content: OPENAI_SYSTEM_PROMPT },
        { role: "developer", content: "The user's viewport is { x: 0, y: 0, width: 1000, height: 500 }" },
        { role: "user", content: "Transform the following content to shapes. Use only czech language for texts and labels." },
        { role: "user", content: text },
      ],
      schema: ModelResponse,
      schemaName: 'event'
    });

    if (response.success) {
      // Update the data with new key-value pair
      data[key] = response.data;
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




import { parseArgs } from "node:util";
import { baseDomain, json } from "../utils/quiz-string-utils.js";
import { quizSchema } from "../utils/zod.utils.js";
import { zodResponseFormat } from "openai/helpers/zod";


const {
  values: { code }
} = parseArgs({
  options: {
    code: { type: "string" },
  }
});


const metadata = await json(`${baseDomain}/generated/${code}.json`);
//const aiAnswers = await readJsonFromFile(aiAnswersDataPath);
var output = zodResponseFormat(quizSchema(metadata), code);
process.stdout.write(JSON.stringify(output.json_schema.schema, null, 2));




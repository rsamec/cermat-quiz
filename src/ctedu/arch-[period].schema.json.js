import { parseArgs } from "node:util";
import { quizSchema } from "../utils/zod.utils.js";
import { zodResponseFormat } from "openai/helpers/zod";
import { readJsonFromFile} from '../utils/file.utils.js'
import path from "node:path";


const {
  values: { period }
} = parseArgs({
  options: {
    period: { type: "string" },
  }
});

const metadata = await readJsonFromFile(path.resolve(`./src/ctedu/${period}/key.json`))
var output = zodResponseFormat(quizSchema(metadata), period);
process.stdout.write(JSON.stringify(output.json_schema.schema, null, 2));




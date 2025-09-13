import { parseArgs } from "node:util";
import fs from 'fs/promises';
import path from 'path';
import markdownit from "markdown-it";
import * as katex from 'markdown-it-katex';
import { toArray, from, concatMap, catchError, of } from 'rxjs';
import { baseDomainPublic, parseCode, json, text } from "../utils/quiz-string-utils.js";

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});

const Markdown = new markdownit({ html: false })
  .use(katex.default, {})


async function solveLatex(d) {
  let result = await json("https://mathsolver.microsoft.com/cameraexp/api/v1/solvelatex", {
    latexExpression: d.mathContent,
    clientInfo: {
      mkt: 'cs'
    }
  });
  return [d, result];
}
function parseResults(input) {
  try {
    let Data = JSON.parse(input["results"][0]["tags"][0]["actions"][0]["customData"]);
    Data = JSON.parse(Data["previewText"]);
    Data = Data["mathSolverResult"]
    if (Data["errorMessage"] !== "") {
      throw Data["errorMessage"];
    }
    Data = Data["actions"];
    var FullResult = [];
    for (var i = 0; i < Data.length; i++) {
      var Temp = {};
      Temp["Name"] = Data[i]["actionName"];
      Temp["Answer"] = Data[i]["solution"];
      Temp["TemplateSteps"] = [];
      var TemplateSteps = Data[i]["templateSteps"];
      for (var j = 0; j < TemplateSteps.length; j++) {
        var Steps = TemplateSteps[j]["steps"];
        var Temp2 = {
          "Name": TemplateSteps[j]["templateName"],
          "Steps": [],
        }
        for (var k = 0; k < Steps.length; k++) {
          var Temp3 = {};
          Temp3["Hint"] = Steps[k]["hint"];
          Temp3["Step"] = Steps[k]["step"];
          Temp3["Expression"] = Steps[k]["expression"];
          Temp2.Steps.push(Temp3);
        }
        Temp["TemplateSteps"].push(Temp2);
      }
      FullResult.push(Temp);
      return FullResult;
    }
  }
  catch (error) {
    return [{ Name: "Error", Answer: '', TemplateSteps: [] }]
  }
}


const d = parseCode(code);


async function readJsonFromFile(filePath) {
  try {
    // Read the file content
    const data = await fs.readFile(filePath, 'utf8');

    // Parse JSON string into an object
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    throw error;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
const fileLocation = path.resolve('./src/data/math-answers.json');

if (await fileExists(fileLocation)) {
  const outputData = await readJsonFromFile(fileLocation)
  const parResults = outputData[code] ?? {};
  if (parResults != null) {
    process.stdout.write(JSON.stringify(parResults, null, 2));
  }
  else {
    throw `${fileLocation} does not exists code: ${code}`;
  }
}
else {
  const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
  const content = await text(`${baseUrl}/index.md`);
  const tokens = Markdown.parse(content, {});

  let currentHeader = null;
  const mathBlocksWithHeaders = [];
  // Process tokens
  tokens.forEach(token => {
    if (token.type === 'heading_open') {
      // Capture the current header
      const nextToken = tokens[tokens.indexOf(token) + 1];
      if (nextToken && nextToken.type === 'inline') {
        currentHeader = nextToken.content;
      }
    } else if (token.type === 'math_block') {
      // Associate the math_block with the current header
      mathBlocksWithHeaders.push({
        header: currentHeader,
        mathContent: token.content,
      });
    }
  });


  from(mathBlocksWithHeaders).pipe(
    concatMap(d => from(solveLatex(d)).pipe(
      // Catch fetch error, log it, and return undefined for that item
      catchError(error => {
        //console.error(`Error fetching ${d.header}:${d.mathContent}`, error);
        return of(undefined); // Continue with undefined on error
      })
    )),
    toArray()
  )
    .subscribe(results => {
      const parResults = Object.fromEntries(results.map(([d, result]) => [d.header.split(" ").shift(), { ...d, results: parseResults(result) }]));
      process.stdout.write(JSON.stringify(parResults, null, 2));
    }, (error) => {
      throw error;
    })
}
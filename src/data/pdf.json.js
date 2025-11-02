import path from 'path';
import { quizes } from "../utils/quiz-utils.js";
import { readJsonFromFile, fileExists } from '../utils/file.utils.js';

async function getOutput(subDir) {
  const outputDir = path.resolve('./src/assets/pdf', subDir);
  const jsonDataFilePath = path.join(outputDir, "data.json");

  let outputData = {}
  if (await fileExists(jsonDataFilePath)) {
    outputData = await readJsonFromFile(jsonDataFilePath)
  }
  return outputData;
}

const subDirs = quizes.map(({ subject, period }) => `${subject}-${period}`);
Promise.all(subDirs.map(d => getOutput(d))).then(response => {
  const res = response
    .flatMap((d, i) => Object.entries(d).map(([file, values]) => ({ file, values, directory: subDirs[i] })))
    .flatMap(d => d.values.map(([fileName, count]) => ({ ...d, fileName, count })))

  process.stdout.write(JSON.stringify(res));
})

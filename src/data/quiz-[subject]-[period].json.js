import { parseArgs } from "node:util";
import { parser } from '@lezer/markdown';
import { getQuizBuilder } from "../utils/parse-utils.js";
import { quizes } from '../utils/quizes.js';
import { normalizeImageUrlsToAbsoluteUrls } from "../utils/quiz-utils.js";


const {
  values: { subject, period }
} = parseArgs({
  options: { subject: { type: "string" }, period: { type: "string" } }
});

function quizQuestions(selectedQuizes) {
  const codesAndUrls = selectedQuizes.flatMap(d => d.codes.map(
    (code) => [
      code,
      `https://www.eforms.cz/${d.subject}/${d.period}/${code}`,
      `https://raw.githubusercontent.com/rsamec/cermat/refs/heads/main/generated/${code}.json`]
  ));
  return forkJoin(
    codesAndUrls.map(([_, mdBaseUrl, jsonUrl]) => forkJoin([
      fetch(`${mdBaseUrl}/index.md`).then((d) => {
        try {
          return d.ok ? d.text() : Promise.resolve('')
        }
        catch (e) {
          console.error(e)
          return ''
        }
      }),
      fetch(jsonUrl).then((d) => {
        try {
          return d.ok ? d.json() : Promise.resolve({})
        } catch (e) {
          console.error(e)
          return {}
        }
      }),
    ]))
  ).then(results =>
    results.map(([md, metadata], i) => {
      const rawContent = normalizeImageUrlsToAbsoluteUrls(md, [codesAndUrls[i][1]]);

      return {
        code: codesAndUrls[i][0],
        rawContent,
        metadata,
      }
    }
    )
  )
};

function forkJoin(promises) {
  // Return a new promise
  return new Promise((resolve, reject) => {
    // Array to hold the results of all promises
    const results = [];
    let completedPromises = 0;

    // Check if the input is an array of promises
    if (!Array.isArray(promises)) {
      reject(new Error("Input must be an array of promises"));
      return;
    }

    // Loop through each promise
    promises.forEach((promise, index) => {
      // Ensure each item is a promise
      Promise.resolve(promise)
        .then((result) => {
          // Store result at the corresponding index
          results[index] = result;
          completedPromises++;

          // If all promises are completed, resolve with the results array
          if (completedPromises === promises.length) {
            resolve(results);
          }
        })
        .catch((error) => {
          // Reject immediately if any promise fails
          reject(error);
        });
    });

    // Handle empty array case
    if (promises.length === 0) {
      resolve(results);
    }
  });
}

const markdownParser = parser.configure([]);
function makeQuizBuilder(normalizedQuiz) {  
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz,{});
}


const data = await quizQuestions(quizes.filter(d => d.subject === subject && d.period === period));

const entries = data.map(d => {  
  const questions = d.rawContent != "" ? makeQuizBuilder(d.rawContent).questions.map(d=>d.title) : [];  
  return [d.code,{...d, q:questions}]
});
//console.log(entries)
//process.stderr.write(val)
process.stdout.write(JSON.stringify(Object.fromEntries(entries)));
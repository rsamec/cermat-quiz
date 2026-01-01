import { parseArgs } from "node:util";
import { parser } from '@lezer/markdown';
import { getQuizBuilder } from "../utils/parse-utils.js";
import { forkJoin } from "../utils/common-utils.js";
import { quizes } from "../utils/quiz-utils.js";
import { baseDomain, baseDomainPublic, normalizeImageUrlsToAbsoluteUrls } from "../utils/quiz-string-utils.js";


const {
  values: { subject }
} = parseArgs({
  options: { subject: { type: "string" } }
});

function quizQuestions(selectedQuizes) {
  const codesAndUrls = selectedQuizes.flatMap(d => d.codes.map(
    (code) => [
      code,
      `${baseDomainPublic}/${d.subject}/${d.period}/${code}`,
      `${baseDomain}/generated/${code}.json`]
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

const markdownParser = parser.configure([]);
function makeQuizBuilder(normalizedQuiz) {  
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz,{});
}


const data = await quizQuestions(quizes.filter(d => d.subject === subject));

const entries = data.map(d => {  
  const questions = d.rawContent != "" ? makeQuizBuilder(d.rawContent).questions.map(d=>d.title) : [];  
  return [d.code,{...d, q:questions}]
});
//console.log(entries)
//process.stderr.write(val)
process.stdout.write(JSON.stringify(Object.fromEntries(entries)));
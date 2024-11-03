
import { getQuizBuilder, OptionList, ShortCodeMarker } from '../utils/parse-utils.js';
// import mdPlus from "../utils/md-utils.js";
// import { formatCode } from '../utils/quiz-utils.js';
// import { FileAttachment } from "@observablehq/stdlib";

import { parser, GFM, Subscript, Superscript } from '@lezer/markdown';

// export async function renderQuiz(params) {
//   const { selectedQuestions } = params;
//   const quizQuestionsMap = await FileAttachment(`../data/quiz.json`).json();
//   const questionsToRender = Object.entries(Object.groupBy(selectedQuestions, ({ code }) => code)).map(
//     ([code, values]) => {
//       const quizContent = quizQuestionsMap[code];
//       const quizBuilder = quizContent ? parseQuiz(quizContent) : null;

//       return quizContent ? {
//         code,
//         content: () => {
//           const ids = values.map(d => parseInt(d.id, 10));
//           return quizBuilder.content(ids, {render: 'content'})
//         }
//       } : { code, content: () => 'Quiz is not available' }
//     }
//   )

//   return questionsToRender.map((d) => html`<div><h0>${formatCode(d.code)}</h0>${mdPlus.unsafe(`${d.content()}`)}</div>`)

// }

export function parseQuiz(normalizedQuiz) {
  const markdownParser = parser.configure([[ShortCodeMarker, OptionList], GFM, Subscript, Superscript]);
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz, { render: 'contentWithoutOptions' });
} 
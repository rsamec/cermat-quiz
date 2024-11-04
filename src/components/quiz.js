
import { parser, GFM, Subscript, Superscript } from 'npm:@lezer/markdown';
import { getQuizBuilder, OptionList, ShortCodeMarker } from '../utils/parse-utils.js';
import { normalizeImageUrlsToAbsoluteUrls } from '../utils/quiz-utils.js';
import mdPlus from "../utils/md-utils-copy.js";

async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.text();
}

export async function renderQuiz(code, filterIds){
  const d = parseCode(code);
  const baseUrl = `https://www.eforms.cz/${d.subject}/${d.period}/${code}`
  const content = await text(`${baseUrl}/index.md`);
  
  const quiz = parseQuiz(normalizeImageUrlsToAbsoluteUrls(content));
  const ids = quiz.questions.map(d => d.id).filter(d => filterIds == null || filterIds.includes(d));  
  return mdPlus.unsafe(quiz.content(ids,{render:'content'}))
}

export function parseQuiz(normalizedQuiz) {
  const markdownParser = parser.configure([[ShortCodeMarker, OptionList], GFM, Subscript, Superscript]);
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz, { render: 'contentWithoutOptions' });
} 
import { getQuizBuilder, OptionList, ShortCodeMarker } from '../utils/parse-utils.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, text } from '../utils/quiz-string-utils.js';

export async function quizContent(code, filterIds){
  const d = parseCode(code);
  const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
  const content = await text(`${baseUrl}/index.md`);
  
  const quiz = parseQuiz(normalizeImageUrlsToAbsoluteUrls(content, [baseUrl]));
  const ids = quiz.questions.map(d => d.id).filter(d => filterIds == null || filterIds.includes(d));  
  return quiz.content(ids,{render:'content'})
}

export function parseQuiz(normalizedQuiz) {
  const markdownParser = parser.configure([[ShortCodeMarker, OptionList], GFM, Subscript, Superscript]);
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz, { render: 'contentWithoutOptions' });
} 
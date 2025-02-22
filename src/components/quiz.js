import { getQuizBuilder, OptionList, ShortCodeMarker } from '../utils/parse-utils.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, text } from '../utils/quiz-string-utils.js';

export async function loadQuiz(code) {
  const d = parseCode(code);
  const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
  const content = await text(`${baseUrl}/index.md`);
  
  return parseQuiz(normalizeImageUrlsToAbsoluteUrls(content, [baseUrl]));
}

export function parseQuiz(normalizedQuiz) {
  const markdownParser = parser.configure([[ShortCodeMarker, OptionList], GFM, Subscript, Superscript]);
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz, { render: 'contentWithoutOptions' });
} 
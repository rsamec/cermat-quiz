import { parser, GFM, Subscript, Superscript } from '@lezer/markdown';
import { getQuizBuilder, OptionList, ShortCodeMarker } from './parse-utils.js';

export function parseQuiz(normalizedQuiz) {
  const markdownParser = parser.configure([[ShortCodeMarker, OptionList], GFM, Subscript, Superscript]);
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz, { render: 'contentWithoutOptions' });
} 
import { baseDomain, json } from '../utils/quiz-string-utils.js';
import { QuizStore } from '../utils/quiz-store.js'

export async function loadQuizStore(code) {
  const metadata = await json(`${baseDomain}/generated/${code}.json`);
  return parseQuizStore(metadata);
}

export function parseQuizStore(metadata) {
  return new QuizStore({metadata});
} 

import { loadQuiz } from './quiz.js';
import mdPlus from "../utils/md-utils-copy.js";


export async function renderQuiz(code, filterIds){
  const quiz = await loadQuiz(code);
  const ids = quiz.questions.map(d => d.id).filter(d => filterIds == null || filterIds.includes(d));  
  return mdPlus.unsafe(quiz.content(ids,{render:'content'}))
}

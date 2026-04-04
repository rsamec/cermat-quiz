import { group, option, threePoints, twoPoints, number, mathExpr, selfEvaluateImage, optionBool, task3Max3Points, task2Max4Points, rootGroup, latexExpr } from "../../utils/quiz-builder";

const form = rootGroup({
   code: 'MAMZD23C0T01',
   maxPoints: 50,
   questions: {
      closed: 11,
      opened: 14
   }
}, {

   1: number(25, { prefix: 'o', suffix: '%' }),
   2: number(424, { suffix: 'cm^2^' }),
   3: mathExpr('1/2-x', { hintType: 'expression' }, twoPoints),
   4: latexExpr('\\{-4;1\\}', { prefix: 'K=' }, twoPoints),
   5: latexExpr('x=0, y=\\frac52', {}, twoPoints),
   6: latexExpr('\\{-1;9\\}', { prefix: 'k=' }, twoPoints),
   7: mathExpr('-8/3', { hintType: 'fraction' }, twoPoints),
   8: group({
      8.1: latexExpr('\\[2;-4\\]', { prefix: 'S=' }),
      8.2: selfEvaluateImage("image-9.png"),
   }),
   9: latexExpr('\\[0;-\\frac{1}{2}\\]', { prefix: 'P=' }),
   //neni hotovo kuli 8 
   10: latexExpr('4\\pi3', { prefix: 'x=' }, twoPoints),
   11: number(1),
   12: number(1.4),
   13: group({
      13.1: number(4.6, { prefix: '|AC|', suffix: 'cm' }),
      13.2: number(8.2, { prefix: '|BD|', suffix: 'cm' }, twoPoints),
   }),
   14: number(57, { prefix: 'využito', suffix: 'vydaných poukazů' }, threePoints),
   15: group({
      15.1: optionBool(true),
      15.2: optionBool(false),
      15.3: optionBool(false),
   }, task3Max3Points),
   16: option('B', twoPoints),
   17: option('E', twoPoints),
   18: option('B', twoPoints),
   19: option('C', twoPoints),
   20: option('A', twoPoints),
   21: option('D', twoPoints),
   22: option('C', twoPoints),
   23: option('A', twoPoints),
   24: option('E', twoPoints),
   25: group({
      25.1: option('D', twoPoints),
      25.2: option('C', twoPoints),
   }, task2Max4Points)
});
export default form

import { group, option, threePoints, twoPoints, number, mathExpr, selfEvaluateImage, optionBool, task3Max3Points, task2Max4Points, rootGroup, latexExpr, numbers, numbersGroup } from "../../utils/quiz-builder";

const form = rootGroup({
   code: 'MAMZD25C0T01',
   maxPoints: 50,
   questions: {
      closed: 11,
      opened: 14
   }
}, {

   1: number(624, { suffix: 'korun' }),
   2: latexExpr('\\frac{gT^2}{4\\pi^2}', { prefix: 'l=' }),
   3: numbers([147, 210, 245, 294], twoPoints),
   4: mathExpr('1-4a^2^', { hintType: 'expression' }, twoPoints),
   5: group({
      5.1: mathExpr('2,262d', { hintType: 'expression' }),
      5.2: mathExpr('0.058d(x+34,8)', { hintType: 'expression' }),
   }),
   6: number(4.2, { prefix: 'o', suffix: 'korun' }),
   7: numbersGroup({
      x: 18,
      y: 3,
      z: -9
   }, twoPoints),
   8: number(50_200, { suffix: 'korun' }, twoPoints),
   9: group({
      9.1: selfEvaluateImage("image-6.png"),
      9.2: mathExpr('2x-2', { prefix: 'y=' }),
   }),
   10: group({
      10.1: number(125, {}),
      10.2: number(15, {}),
   }),
   11: group({
      11.1: mathExpr('x+2y-1=0', { prefix: 'q:', hintType: 'equation' }),
      11.2: latexExpr('|pq|=\\sqrt{5}', {}),
   }),

   12: latexExpr('B_1[0;19],B_2[3;7]]', {}, twoPoints),
   13: group({
      13.1: number(45, { prefix: 'a_5', }),
      13.2: number(81, { suffix: 'krát' }),
   }),
   14: number(22, { prefix: 'φ', suffix: 'stupňů' }, twoPoints),
   15: group({
      15.1: optionBool(true),
      15.2: optionBool(false),
      15.3: optionBool(false),
   }, task3Max3Points),
   16: option('C', twoPoints),
   17: option('C', twoPoints),
   18: option('D', twoPoints),
   19: option('B', twoPoints),
   20: option('D', twoPoints),
   21: option('A', twoPoints),
   22: option('A', twoPoints),
   23: option('D', twoPoints),
   24: option('E', twoPoints),
   25: group({
      25.1: option('B', twoPoints),
      25.2: option('E', twoPoints),
   }, task2Max4Points)
});
export default form

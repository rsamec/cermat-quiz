import { group, option, threePoints, twoPoints, number, mathExpr, selfEvaluateImage, optionBool, task3Max3Points, task2Max4Points, rootGroup, latexExpr, numbers, numbersGroup } from "../../utils/quiz-builder";

const form = rootGroup({
   code: 'MAMZD26C0T01',
   maxPoints: 50,
   questions: {
      closed: 11,
      opened: 14
   }
}, {

   1: latexExpr('\\I_1 \\cap I_2', {}),
   2: number(25, { suffix: "m^3^" }),
   3: mathExpr('-1/3', { hintType: 'fraction' }),
   4: number(95, { prefix: 'o', suffix: '%' }),
   5: latexExpr('K={-4}', {}),
   6: mathExpr('(2x+5)(2x-1)', { hintType: 'expression' }, twoPoints),
   7: latexExpr('K=<0;8>', {}, twoPoints),
   8: group({
      8.1: latexExpr('B[64;3]', {}),
      8.2: latexExpr('C[\\frac{1}{16};-2]', {}),
   }),
   9: numbersGroup({
      x: 12,
      y: 72,
      z: 132
   }, twoPoints),
   10: group({
      10.1: mathExpr('1/2', { hintType: 'fraction' }),
      10.2: mathExpr('1/70', { hintType: 'fraction' })
   }),
   11: group({
      11.1: mathExpr('y=-3+2t', { hintType: 'equation' }),
      11.2: mathExpr('x+2y+6=0', { hintType: 'equation' })
   }),
   12: group({
      12.1: number(1_440, { suffix: 'stupňů' }),
      12.2: latexExpr('\\alpha_1 = 126\\degree', {}, twoPoints)
   }),
   13: number(21, { suffix: 'cm' }, twoPoints),
   14: group({
      14.1: number(31_500, { suffix: 'korun', }),
      14.2: number(10, { prefix: 'o', suffix: '%' }, twoPoints),
   }),
   15: group({
      15.1: optionBool(true),
      15.2: optionBool(false),
      15.3: optionBool(true),
   }, task3Max3Points),
   16: option('A', twoPoints),
   17: option('D', twoPoints),
   18: option('E', twoPoints),
   19: option('A', twoPoints),
   20: option('E', twoPoints),
   21: option('C', twoPoints),
   22: option('B', twoPoints),
   23: option('C', twoPoints),
   24: option('D', twoPoints),
   25: group({
      25.1: option('E', twoPoints),
      25.2: option('B', twoPoints),
   }, task2Max4Points)
});
export default form

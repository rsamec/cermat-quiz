import { group, mathEquation, mathExpr, number, option, optionBool, rootGroup, selfEvaluateImage, task3Max3Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PDD24C0T04',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 10
  }
}, {

  1: number(900),
  2: number(35, { suffix: '%' }, twoPoints),
  3: group({
    3.1: mathExpr("1/3", { hintType: 'fraction' }, twoPoints),
    3.2: mathExpr("-1/30", { hintType: 'fraction' }, twoPoints),
  }),
  4: group({
    4.1: mathExpr('a(5a-12)', { hintType: 'expression' }),
    4.2: mathExpr('(1/9)-(8/3)b+16b^2', { hintType: 'expression' }),
    4.3: mathExpr('14x+5', { hintType: 'expression' }, twoPoints),
  }),
  5: group({
    5.1: mathEquation('x=18', { hintType: 'equation' }, twoPoints),
    5.2: mathEquation('y=3', { hintType: 'equation' }, twoPoints),
  }),
  6: group({
    6.1: number(4, {}, twoPoints),
    6.2: number(120, { }, twoPoints),
  }),
  7: group({
    7.1: number(280, { suffix:'Kč'}, twoPoints),
    7.2: number(300, { suffix:'Kč'}, twoPoints)
  }),
  8: group({
    8.1: number(6, { suffix:'hodin'}, twoPoints),
    8.2: number(58, { suffix: 'minut' }, twoPoints),
  }),
  9: selfEvaluateImage("image-5.png", threePoints),
  10: selfEvaluateImage("image-6.png", threePoints),
  11: option('A', twoPoints),
  12: option('B', twoPoints),
  13: option('C', twoPoints),
  14: option('C', twoPoints),
  15: group({
    15.1: optionBool(true),
    15.2: optionBool(false),
    15.3: optionBool(true),
  }, task3Max3Points),
  16: group({
    16.1: option('D', twoPoints),
    16.2: option('A', twoPoints),
    16.3: option('E', twoPoints),
  }),
});
export default form;
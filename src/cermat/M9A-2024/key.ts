import { fourPoints, group, mathEquation, mathExpr, mathRatio, number, option, optionBool, rootGroup, selfEvaluateImage, task3Max3Points, task3Max4Points, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PAD24C0T01',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 10
  }
}, {

  1: number(45, { suffix: 'hodin' }),
  2: number(3140, { suffix: 'cm^2^' }, twoPoints),
  3: group({
    3.1: mathExpr("13/3", { hintType: 'fraction' }, twoPoints),
    3.2: mathExpr("-1/3", { hintType: 'fraction' }, twoPoints),
  }),
  4: group({
    4.1: mathExpr('9a^2/16', { hintType: 'expression' }),
    4.2: mathExpr('(3a+4)(3a-4)', { hintType: 'expression' }),
    4.3: mathExpr('10(c-1)', { hintType: 'expression' }, twoPoints),
  }),
  5: group({
    5.1: mathEquation('x=-1.1)', { hintType: 'equation' }, twoPoints),
    5.2: mathEquation('y=1.5', { hintType: 'equation' }, twoPoints),
  }),
  6: group({
    6.1: number(306, { suffix: 'cm^2^' }, twoPoints),
    6.2: number(15, { suffix: 'cm' }, twoPoints),
  }),
  7: group({
    7.1: number(8, { suffix: 'dívek' }, twoPoints),
    7.2: number(26, { suffix: 'žáků' }, twoPoints),
  }),
  8: group({
    8.1: number(43, { suffix: 'cm^2^' }, twoPoints),
    8.2: number(51, { suffix: 'cm' }, twoPoints),
  }),
  9: selfEvaluateImage("image-9.png", threePoints),
  10: selfEvaluateImage("image-10.png", threePoints),
  11: option('B', twoPoints),
  12: option('C', twoPoints),
  13: option('A', twoPoints),
  14: option('D', twoPoints),
  15: group({
    15.1: optionBool(false),
    15.2: optionBool(true),
    15.3: optionBool(false),
  }, task3Max3Points),
  16: group({
    16.1: option('A', twoPoints),
    16.2: option('C',twoPoints),
    16.3: option('E', twoPoints),
  }),
});
export default form;
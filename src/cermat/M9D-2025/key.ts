import { group, mathEquation, mathExpr, mathRatio, number, numbers, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PDD25C0T04',
  maxPoints: 50,
  questions: {
    closed: 5,
    opened: 11
  }
}, {

  1: number(135, { suffix: "cm" }),
  2: number(12),
  3: group({
    3.1: mathExpr("-7/8", { hintType: 'fraction' }),
    3.2: mathExpr('5/7', { hintType: 'fraction' }, twoPoints),
  }),
  4: group({
    4.1: mathExpr('3y^2+1', { hintType: 'expression' }),
    4.2: mathExpr('(k+12)(k-12)', { hintType: 'expression' }),
    4.3: mathExpr('x^2-5x-17', { hintType: 'expression' }, twoPoints),
  }),
  5: group({
    5.1: mathEquation('x=20', { hintType: 'equation' }, twoPoints),
    5.2: mathEquation('x=2,y=-5', { hintType: 'equation' }, twoPoints),
  }),
  6: group({
    6.1: mathRatio("5:6"),
    6.2: mathRatio("1:2"),
    6.3: number(33, { suffix: 'beden' }, twoPoints),
  }),
  7: group({
    7.1: number(9.1, {suffix:"bodu"}),
    7.2: numbers([1,3,5], threePoints),
  }),
  8: group({
    8.1: number(60, { prefix: 'o', suffix: 'cm^2^' }),
    8.2: number(40, { suffix: 'cm' }, twoPoints),
  }),
  9: group({
    9.1: selfEvaluateImage(""),
    9.2: selfEvaluateImage("", twoPoints),
  }),
  10: selfEvaluateImage("", threePoints),
  11: group({
    11.1: optionBool(false),
    11.2: optionBool(false),
    11.3: optionBool(true),
  }, task3Max4Points),
  12: option('C', twoPoints),
  13: option('E', twoPoints),
  14: option('A', twoPoints),
  15: group({
    15.1: option("D", twoPoints),
    15.2: option("C", twoPoints),
    15.3: option("B", twoPoints),
  }, task3Max6Points),
  16: group({
    16.1: number(6, { suffix: "m" }),
    16.2: number(30, { suffix: "m" }),
    16.3: number(150, { suffix: "m" }),
    16.4: number(18, { suffix: "m" }),

  }),
});
export default form;
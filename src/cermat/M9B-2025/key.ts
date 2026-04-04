import { group, mathEquation, mathExpr, number, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PBD25C0T02',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 10
  }
}, {

  1: number(60, {suffix:"Kč"}),
  2: mathExpr("25/6", { hintType: 'fraction' }),
  3: group({
    3.1: mathExpr("-11/10", { hintType: 'fraction' }),
    3.2: mathExpr('4/3', { hintType: 'fraction' }, twoPoints),
  }),
  4: group({
    4.1: mathExpr('2x^2-9', { hintType: 'expression' }),
    4.2: mathExpr('k(2k-1)', { hintType: 'expression' }),
    4.3:mathExpr('a^2-7a+10k(2k-1)', { hintType: 'expression' }, twoPoints),
  }),
  5: group({
    5.1: mathEquation('x=-3/5', { hintType: 'equation' }, twoPoints),
    5.2: mathEquation('x=3,y=-4', { hintType: 'equation' }, twoPoints),
  }),
  6: group({
    6.1: number(3),
    6.2: number(21),
    6.3: number(77),
  }),
  7: group({
    7.1: number(1200, { suffix: 'Kč' }),
    7.2: mathExpr('2/9x', { hintType: 'expression' }),
    7.3: number(270, {}, twoPoints),
  }),
  8: group({
    8.1: number(3600, { suffix: 'cm^2^' }),
    8.2: number(320, { suffix: 'cm' }),
    8.3: number(210, { suffix: 'cm' }, twoPoints),
  }),
  9: selfEvaluateImage("", threePoints),
  10: selfEvaluateImage("", threePoints),
  11: group({
    11.1: optionBool(true),
    11.2: optionBool(false),
    11.3: optionBool(false),
  }, task3Max4Points),
  12: option('B', twoPoints),
  13: option('C', twoPoints),
  14: option('D', twoPoints),
  15: group({
    15.1: option("A", twoPoints),
    15.2: option("F", twoPoints),
    15.3: option("D", twoPoints),
  }),
  16: group({
    16.1: number(47),
    16.2: number(235),
    16.3: number(99, {}, twoPoints),
  }),
});
export default form;
import { group, mathExpr, number, numbersGroup, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PBD26C0T01',
  maxPoints: 50,
  questions: {
    closed: 5,
    opened: 11
  }
}, {

  1: number(980, { suffix: 'cm^2^' }),
  2: group({
    2.1: mathExpr("1/3", { hintType: 'fraction' }),
    2.2: mathExpr("4/5", { hintType: 'fraction' }),
    2.3: number(-1, {}, twoPoints),
  }),
  3: group({
    3.1: mathExpr('2x', { hintType: 'expression' }),
    3.2: mathExpr('b(a-1)', { hintType: 'expression' }),
    3.3: mathExpr('1-4y', { hintType: 'expression' }, twoPoints),
  }),
  4: group({
    4.1: number(-3, { prefix: "x=" }, twoPoints),
    4.2: number(12, { prefix: "y=" }, twoPoints),
  }),
  5: group({
    5.1: number(85, { suffix: 'g' }),
    5.2: number(200, { prefix: "o", suffix: '%' }, twoPoints),
  }),
  6: group({
    6.1: number(70, { suffix: 'Kč' }),
    6.2: mathExpr('40x', { hintType: 'expression' }),
    6.3: number(200, { suffix: 'čajů' }, twoPoints),
  }),
  7: group({
    7.1: number(3, { suffix: 'krát' }),
    7.2: number(35.7, { suffix: 'cm' }, twoPoints),
  }),
  8: group({
    8.1: number(24, { suffix: 'cm' }),
    8.2: number(36, { suffix: 'cm' }),
  }),
  9: selfEvaluateImage("", twoPoints),
  10: selfEvaluateImage("", threePoints),
  11: group({
    11.1: optionBool(false),
    11.2: optionBool(true),
    11.3: optionBool(false),
  }, task3Max4Points),
  12: option('D', twoPoints),
  13: option('C', twoPoints),
  14: option('A', twoPoints),
  15: group({
    15.1: option("D", twoPoints),
    15.2: option("B", twoPoints),
    15.3: option("E", twoPoints),
  }),
  16: group({
    16.1: number(17, { suffix: 'šedých dílů' }),
    16.2: number(45, { suffix: 'obrazec' }),
    16.3: mathExpr("5/16", { hintType: 'fraction' }, twoPoints),
  }),
});
export default form;
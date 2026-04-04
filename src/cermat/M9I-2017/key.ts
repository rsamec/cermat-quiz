import { group, mathEquation, mathExpr, number, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PID17C0T01',
  maxPoints: 50,
  questions: {
    closed: 5,
    opened: 11
  }
}, {

  1: number(9, { suffix: 'krát' }),
  2: group({
    2.1: number(35, {}),
    2.2: number(90, {}),
  }),
  3: group({
    3.1: mathExpr("-5/12", { hintType: 'fraction' }, twoPoints),
    3.2: mathExpr("2/5", { hintType: 'fraction' }, twoPoints),
  }),
  4: group({
    4.1: mathExpr('1-6a^2', { hintType: 'expression' }, twoPoints),
    4.2: mathExpr('b^2+b-1', { hintType: 'expression' }, twoPoints),
  }),
  5: group({
    5.1: mathEquation('x=0', { hintType: 'equation' }),
    5.2: mathEquation('x=3/5', { hintType: 'equation' }, threePoints),
  }),
  6: group({
    6.1: mathEquation('n/4=140', { hintType: 'equation' }, twoPoints),
    6.2: number(30, { suffix: 'korun' }, twoPoints),
  }),
  7: group({
    7.1: number(190, { prefix: 'o', suffix: 'dm^2^' }),
    7.2: number(48, { suffix: 'krát' }),
    7.3: number(12, { suffix: 'krát' }),
  }),
  8: group({
    8.1: number(15, { suffix: 'cm^2^' }),
    8.2: number(7, { suffix: 'cm' }, twoPoints),
  }),
  9: selfEvaluateImage("", twoPoints),
  10: selfEvaluateImage("", threePoints),
  11: group({
    11.1: optionBool(true),
    11.2: optionBool(false),
    11.3: optionBool(false),
  }, task3Max4Points),
  12: option('B', twoPoints),
  13: option('C', twoPoints),
  14: option('C', twoPoints),
  15: group({
    15.1: option('A', twoPoints),
    15.2: option('E', twoPoints),
    15.3: option('D', twoPoints),
  }),
  16: group({
    16.1: number(18, { suffix: "bílých kostek" }),
    16.2: number(36, { suffix: 'tmavých kostek' }),
    16.3: number(40, { suffix: 'věží' }, twoPoints),
  }),
});
export default form;
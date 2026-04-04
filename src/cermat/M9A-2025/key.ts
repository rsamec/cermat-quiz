import { fourPoints, group, mathEquation, mathExpr, mathRatio, number, numbersGroup, option, optionBool, rootGroup, selfEvaluateImage, task3Max3Points, task3Max4Points, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PAD25C0T01',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 10
  }
}, {

  1: number(2.5),
  2: group({
    2.1: mathExpr("1/4", { hintType: 'fraction' }),
    2.2: mathExpr("1/2", { hintType: 'fraction' }, twoPoints),
  }),
  3: group({
    3.1: numbersGroup({
      a: 9,
      b: 81
    }),
    3.2: mathExpr('4n+5', { hintType: 'expression' }),
    3.3: mathExpr('(12-x)(12+x)', { hintType: 'expression' }, twoPoints),
  }),
  4: group({
    4.1: number(20, { prefix: "x=" }, twoPoints),
    4.2: mathEquation(false, { hintType: 'equation' }, twoPoints),
  }),
  5: group({
    5.1: number(12, { suffix: 'm' }, twoPoints),
    5.2: number(558, { suffix: 'm^2^' }, twoPoints),
  }),
  6: group({
    6.1: number(1.5, { suffix: 'l' }),
    6.2: number(20, { suffix: 'mm' }),
  }),
  7: group({
    7.1: number(30, { suffix: 'stupňů' }),
    7.2: number(50, { suffix: 'stupňů' }),
    7.3: number(140, { suffix: 'stupňů' }),
  }),
  8: group({
    8.1: number(26, { suffix: 'm' }),
    8.2: number(5, { suffix: 'rostlin' }),
    8.3: number(39, { suffix: 'červených rostlin' }, twoPoints),
  }),
  9: group({
    9.1: selfEvaluateImage(""),
    9.2: selfEvaluateImage("", twoPoints),
  }),
  10: selfEvaluateImage("", twoPoints),
  11: group({
    11.1: optionBool(true),
    11.2: optionBool(true),
    11.3: optionBool(true),
  }, task3Max4Points),
  12: option('A', twoPoints),
  13: option('B', twoPoints),
  14: option('D', twoPoints),
  15: group({
    15.1: option("B", twoPoints),
    15.2: option("E", twoPoints),
    15.3: option("C", twoPoints),
  }),
  16: group({
    16.1: number(24, { suffix: 'obdelníčků' }),
    16.2: number(12, { suffix: 'obdelníčků' }),
    16.3: number(36, { suffix: 'obdelníčků' }, twoPoints),
  }),
});
export default form;
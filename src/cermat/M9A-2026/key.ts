import { group, mathExpr, number, numbersGroup, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PAD26C0T01',
  maxPoints: 50,
  questions: {
    closed: 5,
    opened: 11
  }
}, {

  1: group({
    1.1: mathExpr("1/2", { hintType: 'fraction' }),
    1.2: mathExpr("4/5", { hintType: 'fraction' }),
    1.3: mathExpr("13/20", { hintType: 'fraction' }),
  }),
  2: group({
    2.1: number(1.25),
    2.2: mathExpr("-1/4", { hintType: 'fraction' }, twoPoints),
  }),
  3: group({
    3.1: number(400),
    3.2: mathExpr('(1+4n)(1-4n)', { hintType: 'expression' }),
    3.3: mathExpr('-x+2', { hintType: 'expression' }, twoPoints),
  }),
  4: group({
    4.1: number(-5, { prefix: "y=" }, twoPoints),
    4.2: numbersGroup({
      x: 2,
      y: -5
    }, twoPoints)
  }),
  5: number(270, { suffix: 'litrů' }),
  6: group({
    6.1: mathExpr('x/3', { hintType: 'expression' }),
    6.2: mathExpr('x/6', { hintType: 'expression' }),
    6.3: number(64, { suffix: 'km' }, twoPoints),
  }),
  7: group({
    7.1: number(5, { suffix: 'km' }),
    7.2: number(54, { suffix: 'minut' }, twoPoints),
  }),
  8: group({
    8.1: number(10, { prefix: '', suffix: 'stupňů' }),
    8.2: number(70, { prefix: '', suffix: 'stupňů' }, twoPoints),
  }),
  9: selfEvaluateImage("image-12.png", threePoints),
  10: selfEvaluateImage("image-13.png", twoPoints),
  11: group({
    11.1: optionBool(true),
    11.2: optionBool(true),
    11.3: optionBool(true),
  }, task3Max4Points),
  12: option('C', twoPoints),
  13: option('A', twoPoints),
  14: option('B', twoPoints),
  15: group({
    15.1: option("E", twoPoints),
    15.2: option("D", twoPoints),
    15.3: option("A", twoPoints),
  }),
  16: group({
    16.1: number(18, { suffix: 'míčků' }),
    16.2: number(28, { prefix: "ve", suffix: 'sekundě' }),
    16.3: number(78, { suffix: 'míčků' }, twoPoints),
  }),
});
export default form;
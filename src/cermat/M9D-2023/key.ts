import { fourPoints, group, mathEquation, mathExpr, mathRatio, number, numbers, option, optionBool, rootGroup, selfEvaluateImage, task2Max3Points, task2Max4Points, task3Max4Points, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PDD23C0T04',
  maxPoints: 50,
  questions: {
    closed: 5,
    opened: 11
  }
}, {

  1: number(900, { suffix: 'g' }),
  2: group({
    2.1: number(40),
    2.2: number(28)
  }),
  3: group({
    3.1: mathExpr("-3/8", { hintType: 'fraction' }),
    3.2: mathExpr("-7/6", { hintType: 'fraction' }),
    3.3: mathExpr("1/8", { hintType: 'fraction' }, twoPoints),

  }),
  4: group({
    4.1: mathExpr("0.09x^2+0.3x+0.25", { hintType: 'expression' }),
    4.2: mathExpr("(7+4a)(7-4a)", { hintType: 'expression' }),
    4.3: mathExpr("7n^2+5n+1", { hintType: 'expression' }, twoPoints),
  }),
  5: group({
    5.1: mathExpr("x=4", { hintType: 'equation' }, twoPoints),
    5.2: mathExpr("y=-9", { hintType: 'equation' }, twoPoints),
  }),
  6: group({
    6.1: mathExpr("(4/3)p", { hintType: 'expression' }),
    6.2: mathExpr("(8/5)p", { hintType: 'expression' }),
    6.3: number(150, { suffix: 'stromů' }),
  }),
  7: group({
    7.1: number(21, { suffix: "osobních aut" }),
    7.2: number(20, { suffix: "autobusů" }, twoPoints),

  }),
  8: group({
    8.1: numbers([6, 10], twoPoints),
    8.2: numbers([1, 9], twoPoints),
  }),
  9: selfEvaluateImage("image-9.png", threePoints),
  10: selfEvaluateImage("image-10.png", twoPoints),
  11: group({
    11.1: optionBool(true),
    11.2: optionBool(true),
    11.3: optionBool(false),
  }, task3Max4Points),
  12: option('B', twoPoints),
  13: option('C', twoPoints),
  14: option('A', twoPoints),
  15: group({
    15.1: option('E'),
    15.2: option('B'),
    15.3: option('D'),
  }, task3Max6Points),
  16: group({
    16.1: number(45, { suffix: 'úseček' }),
    16.2: number(33, { prefix: 'o', suffix: 'puntíků' }),
    16.3: number(900, { suffix: 'úseček' }, twoPoints)
  })

});
export default form;
import { fourPoints, group, mathEquation, mathExpr, mathRatio, number, numbers, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PBD23C0T02',
  maxPoints: 50,
  questions: {
      closed: 5,
      opened: 11
  }
}, {

  1: number(-4),
  2: group({
    2.1: number(2.5, { suffix: 'krát' }),
    2.2: number(300, { prefix: 'o', suffix: 'korun' })
  }),
  3: group({
    3.1: mathExpr("-13/18", { hintType: 'fraction' }),
    3.2: mathExpr("7/10", { hintType: 'fraction' }),
    3.3: mathExpr("2/9", { hintType: 'fraction' }, twoPoints),

  }),
  4: group({
    4.1: mathExpr("y(x-6)", { hintType: 'expression' }),
    4.2: mathExpr("3a+4", { hintType: 'expression' }),
    4.3: mathExpr("7n^2+8n+4", { hintType: 'expression' }, twoPoints),
  }),
  5: group({
    5.1: mathExpr("x=-3", { hintType: 'equation' }, twoPoints),
    5.2: mathExpr("y=5/3", { hintType: 'equation' }, twoPoints),
  }),
  6: group({
    6.1: number(25, { prefix: 'za', suffix: 'dní' }),
    6.2: number(8, { suffix: 'členná expedice' }),
    6.3: number(18, { suffix: 'členů' }, twoPoints),
  }),
  7: group({
    7.1: mathExpr("1/2x", { hintType: 'expression' }),
    7.2: mathExpr("5/4x", { hintType: 'expression' }),
    7.3: number(20, { suffix: 'minut' }),

  }),
  8: group({
    8.1: number(24, { suffix: 'cm' }),
    8.2: number(3140, { suffix: 'cm^3' }, twoPoints),
  }),
  9: selfEvaluateImage("V rovině leží úsečka AB a bod S.jpeg", twoPoints),
  10: selfEvaluateImage("V rovině leží body C, Q a kružnice k se středem S, která prochází bodem C.jpeg", threePoints),
  11: group({
    11.1: optionBool(false),
    11.2: optionBool(true),
    11.3: optionBool(true),
  }, task3Max4Points),
  12: option('E', twoPoints),
  13: option('C', twoPoints),
  14: option('A', twoPoints),
  15: group({
    15.1: option('D'),
    15.2: option('C'),
    15.3: option('B'),
  }, task3Max6Points),
  16: group({
    16.1: number(32, { suffix: 'polí' }),
    16.2: number(19, { prefix: 'o' }),
    16.3: numbers([361, 441],twoPoints)
  })

});
export default form;
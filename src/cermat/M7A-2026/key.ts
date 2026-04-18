import { group, mathExpr, mathRatio, number, numbers, numbersGroup, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M7PAD26C0T01',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 10
  }
}, {

  1: number(1_400, { suffix: "metrů" }),
  2: group({
    2.1: mathExpr("-9/10", { hintType: 'fraction' }, twoPoints),
    2.2: mathExpr("5/21", { hintType: 'fraction' }, twoPoints),
  }),
  3: numbers([5, 9, 7, 17, 11, 13], threePoints),
  4: group({
    4.1: number(30, { suffix: 'jízd' }),
    4.2: number(61, { suffix: 'žetonů' }, twoPoints),
  }),
  5: group({
    5.1: number(24, { prefix: '𝛾', suffix: 'stupňů' }),
    5.2: number(51, { prefix: '𝜑', suffix: 'stupňů' }),
    5.3: number(129, { prefix: '𝜔', suffix: 'stupňů' }, twoPoints),
  }),
  6: group({
    6.1: number(280, { suffix: 'čtverečků' }, twoPoints),
    6.2: mathExpr("1/4", { hintType: 'fraction' }, twoPoints),
  }),
  7: group({
    7.1: number(2_940, { suffix: 'cukru' }),
    7.2: number(50, { suffix: 'bábovek' }),
    7.3: number(36, {}, twoPoints),
  }),
  8: selfEvaluateImage("", twoPoints),
  9: selfEvaluateImage("", threePoints),
  10: group({
    10.1: optionBool(false),
    10.2: optionBool(false),
    10.3: optionBool(false),
  }, task3Max4Points),
  11: option('A', twoPoints),
  12: option('C', twoPoints),
  13: option('B', twoPoints),
  14: option('B', twoPoints),
  15: group({
    15.1: option('A'),
    15.2: option('E'),
    15.3: option('C'),
  }, task3Max6Points),
  16: group({
    16.1: number(25, { suffix: 'puntíků' }),
    16.2: number(17, { prefix: 'o', suffix: 'puntíků' }),
    16.3: number(86, { prefix: 'v', suffix: 'obrazci' }, twoPoints),
  })
});
export default form;

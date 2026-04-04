

import { group, mathExpr, mathRatio, number, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M7PAD24C0T01',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 10
  }
}, {

  1: group({
    1.1: number(7, {}, twoPoints),
    1.2: number(0.782, {}, twoPoints),
  }),
  2: group({
    2.1: mathExpr("1/7", { hintType: 'fraction' }, twoPoints),
    2.2: mathExpr("9/10", { hintType: 'fraction' }, twoPoints),
  }),
  3: group({
    3.1: number(0, {}),
    3.2: number(4.5, {}),
    3.3: number(2.1, {}),
  }),
  4: mathExpr("7/15", { hintType: 'fraction' }, twoPoints),
  5: group({
    5.1: number(282, { suffix: 'dětí' }, twoPoints),
    5.2: number(48, { suffix: 'dětí' }, twoPoints),
  }),
  6: number(61, {}, threePoints),
  7: number(12.4, {}, threePoints),  
  8: selfEvaluateImage("rovina2Primky-reseni.jpeg", threePoints),
  9: selfEvaluateImage("rovina1Primka-reseni.jpeg", threePoints),
  10: group({
    10.1: optionBool(false),
    10.2: optionBool(true),
    10.3: optionBool(true),
  }),
  11: option('E', twoPoints),
  12: option('D', twoPoints),
  13: option('D', twoPoints),
  14: option('B', twoPoints),
  15: group({
    15.1: option('E'),
    15.2: option('B'),
    15.3: option('A'),
  }, task3Max6Points),
  16: group({
    16.1: number(630, { suffix: 'cm^2^' }, twoPoints),
    16.2: number(675, { suffix: 'cm^3^' }, twoPoints)
  })
});
export default form;

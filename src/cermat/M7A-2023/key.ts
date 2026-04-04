

import { group, mathExpr, mathRatio, number, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M7PAD23C0T01',
  maxPoints: 50,
  questions: {
      closed: 6,
      opened: 10
  }
}, { 

  1: number(14, { prefix: 'o', suffix: 'litrů' }),
  2: group({
    2.1: mathExpr("-1/5", { hintType: 'fraction' }, twoPoints),
    2.2: mathExpr("2/15", { hintType: 'fraction' }, twoPoints),
  }),
  3: group({
    3.1: number(120, { suffix: 'vojínů' }),
    3.2: number(17, { suffix: 'osob' }),
    3.3: number(136, { suffix: 'osob' }),
  }),
  4: group({
    4.1: number(19, { suffix: 'žáků' }, twoPoints),
    4.2: mathRatio("2:3", twoPoints),
  }),
  5: group({
    5.1: number(54, { suffix: 'korun' }, twoPoints),
    5.2: number(520, { suffix: 'korun' }, twoPoints),
  }),
  6: group({
    6.1: number(2, { suffix: 'krát více' }),
    6.2: number(900, { suffix: 'korun' }, twoPoints),
  }),
  7: group({
    7.1: number(12, { suffix: 'krychliček' }),
    7.2: number(18, { suffix: 'krychliček' }),
    7.3: number(24, { suffix: 'krychliček' }),
  }),
  8: selfEvaluateImage("rovina2Primky-reseni.jpeg", threePoints),
  9: selfEvaluateImage("rovina1Primka-reseni.jpeg", threePoints),
  10: group({
    10.1: optionBool(false),
    10.2: optionBool(true),
    10.3: optionBool(false),
  }, task3Max4Points),
  11: option('D', twoPoints),
  12: option('B', twoPoints),
  13: option('E', twoPoints),
  14: option('A', twoPoints),
  15: group({
    15.1: option('C'),
    15.2: option('D'),
    15.3: option('B'),
  }, task3Max6Points),
  16: group({
    16.1: number(18, { suffix: 'sloupců' }),
    16.2: number(8, { suffix: 'sloupců' }),
    16.3: number(23, { suffix: 'rozšířených obrazců' }, twoPoints),
  })
});
export default form;

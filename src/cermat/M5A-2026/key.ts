

import { group, number, numbers, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max5Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M5PBD26C0T01',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 8
  }
}, {
  1: group({
    1.1: number(49,{}, twoPoints),
    1.2: number(80_000,{}, twoPoints),
  }),
  2: numbers([10, 13, 14], threePoints),
  3: group({
    3.1: number(36, { suffix: 'korun' }),
    3.2: number(300, { suffix: 'gramů' }, twoPoints),
  }),
  4: group({
    4.1: number(150, { suffix: 'lahví' }),
    4.2: number(100, { suffix: 'lahví' }, twoPoints),
    4.3: number(24, { prefix: "za", suffix: 'minut' }, twoPoints),
  }),
  5: group({
    5.1: number(4, { suffix: 'cm^2^' }, twoPoints),
    5.3: number(44, { suffix: 'cm^2^' }, twoPoints),
  }),
  6: group({
    6.1: number(6, { suffix: 'cm' }),
    6.2: number(72, { suffix: 'cm' }),
    6.3: number(36, { suffix: 'cm'}, twoPoints),
  }),
  7: group({
    7.1: selfEvaluateImage("", threePoints),
    7.2: selfEvaluateImage("", threePoints),
  }),
  8: group({
    8.1: optionBool(false),
    8.2: optionBool(true),
    8.3: optionBool(false),
  }, task3Max4Points),
  9: option("D", twoPoints),
  10: option("C", twoPoints),
  11: option("B", twoPoints),
  12: option("A", twoPoints),
  13: group({
    13.1: option("E",),
    13.2: option("F",),
    13.3: option("B",),
  }, task3Max5Points),
  14: group({
    14.1: number(25, { suffix: 'puntíků' }),
    14.2: number(17, { prefix: "o", suffix: 'puntíků' }),
    14.3: number(86, { prefix: "v", suffix: 'obrazci' }, twoPoints),
  })
});
export default form;

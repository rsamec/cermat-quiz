

import { group, number, numbers, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max5Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M5PBD25C0T02',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 8
  }
}, {
  1: group({
    1.1: number(49),
    1.2: number(132),
    1.3: numbers([48, 61], twoPoints),
  }),
  2: group({
    2.1: number(350),
    2.2: number(800),
    2.3: number(300),
  }),
  3: group({
    3.1: number(170, { suffix: 'korálků' }),
    3.2: number(16, { suffix: 'krát' }, twoPoints),
    3.3: number(102, { suffix: 'korálků' }, twoPoints),
  }),
  4: group({
    4.1: number(36, { suffix: 'stolů' }),
    4.2: number(96, { suffix: 'míst' }, twoPoints),
  }),
  5: group({
    5.1: number(8, { suffix: 'cm' }),
    5.2: number(4),
    5.3: number(20, { suffix: 'cm^2^' }, twoPoints),
  }),
  6: group({
    6.1: number(28, {}, twoPoints),
    6.2: number(56, {}, twoPoints),
  }),
  7: group({
    7.1: selfEvaluateImage("primkyABvRovineVysledek.jpg", threePoints),
    7.2: selfEvaluateImage("bodyVRovine.jpg", threePoints),
  }),
  8: group({
    8.1: optionBool(false),
    8.2: optionBool(false),
    8.3: optionBool(false),
  }, task3Max4Points),
  9: option("A", twoPoints),
  10: option("C", twoPoints),
  11: option("B", twoPoints),
  12: option("D", twoPoints),
  13: group({
    13.1: option("F",),
    13.2: option("E",),
    13.3: option("D",),
  }, task3Max5Points),
  14: group({
    14.1: number(120, { suffix: 'cm' }),
    14.2: number(2, { prefix:"o", suffix: 'cm' }),
    14.3: number(134, { suffix: 'cm' }, twoPoints),
  })

});
export default form;

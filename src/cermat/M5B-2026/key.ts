

import { group, number, numbers, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max5Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M5PBD26C0T02',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 8
  }
}, {
  1: group({
    1.1: number(650, {}, twoPoints),
    1.2: number(63, {}, twoPoints),
  }),
  2: group({
    2.1: number(170, { suffix: 'krát' }),
    2.2: number(16, { prefix: "o", suffix: 'gramů' }, twoPoints),
    2.3: number(102, { suffix: 'dílů' }, twoPoints),
  }),
  3: group({
    3.1: number(2),
    3.2: number(7, {}, twoPoints),
  }),
  4: group({
    4.1: number(400, { suffix: 'korun' }, twoPoints),
    4.2: number(28, { suffix: 'dnů' }, twoPoints),
  }),
  5: group({
    5.1: number(14, { suffix: 'červených proužků' }),
    5.2: number(4, { suffix: 'cm' }, twoPoints),
  }),
  6: group({
    6.1: number(10, { suffix: 'cm^2^' }, twoPoints),
    6.2: selfEvaluateImage("", twoPoints),
  }),
  7: group({
    7.1: selfEvaluateImage("", threePoints),
    7.2: selfEvaluateImage("", threePoints),
  }),
  8: group({
    8.1: optionBool(false),
    8.2: optionBool(false),
    8.3: optionBool(true),
  }, task3Max4Points),
  9: option("D", twoPoints),
  10: option("B", twoPoints),
  11: option("A", twoPoints),
  12: option("C", twoPoints),
  13: group({
    13.1: option("F",),
    13.2: option("B",),
    13.3: option("D",),
  }, task3Max5Points),
  14: group({
    14.1: number(4, { suffix: 'desky' }),
    14.2: number(3, { suffix: 'tyče' }),
    14.3: number(20, { suffix: 'kusů ohrady' }, twoPoints),
  })

});
export default form;



import { group, number, numbers, option, optionBool, rootGroup, selfEvaluateImage, selfEvaluateText, task3Max3Points, task3Max4Points, task3Max5Points, threePoints, twoPoints, wordsGroup } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M5PAD25C0T01',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 8
  }
}, {
  1: group({
    1.1: number(44, {}, twoPoints),
    1.2: number(3, {}, twoPoints),
  }),
  2: group({
    2.1: number(6, {}, twoPoints),
    2.2: numbers([45, 135], twoPoints),
  }),
  3: group({
    3.1: number(36, { suffix: 'krát' }, twoPoints),
    3.2: number(180, { suffix: 'krát' }, twoPoints),
  }),
  4: group({
    4.1: number(24, { suffix: 'kuliček' }, twoPoints),
    4.2: number(320, { suffix: 'gramů' }),
  }),
  5: group({
    5.1: number(0, { suffix: 'chlapců' }),
    5.2: number(5, { suffix: 'dětí' }, twoPoints),
    5.3: number(6, { suffix: 'dívek' }, twoPoints),
  }),
  6: group({
    6.1: number(20, { suffix: 'cm' }, twoPoints),
    6.2: number(2, { suffix: 'cm' }, twoPoints),
  }),
  7: group({
    7.1: selfEvaluateImage("", threePoints),
    7.2: selfEvaluateImage("", twoPoints),
  }),
  8: group({
    8.1: optionBool(true),
    8.2: optionBool(true),
    8.3: optionBool(false),
  }, task3Max4Points),
  9: option("A", twoPoints),
  10: option("B", twoPoints),
  11: option("D", twoPoints),
  12: option("C", twoPoints),
  13: group({
    13.1: option("C",),
    13.2: option("E",),
    13.3: option("D",),
  }, task3Max3Points),
  14: group({
    14.1: number(18, { suffix: 'dukátů' }, twoPoints),
    14.2: number(96, { suffix: 'dukátů' }, twoPoints),
    14.3: number(128, { suffix: 'dukátů' }, twoPoints),
  })

});
export default form;

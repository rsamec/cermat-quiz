

import { group, number, numbersGroup, option, optionBool, rootGroup, selfEvaluateImage, selfEvaluateText, task3Max3Points, task3Max4Points, task3Max5Points, threePoints, twoPoints, wordsGroup } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M5PAD24C0T01',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 8
  }
}, {
  1: group({
    1.1: number(591, {}, twoPoints),
    1.2: number(1, {}, twoPoints),
  }),
  2: number(6, {}, twoPoints),
  3: number(6, {}, threePoints),
  4: group({
    4.1: number(13, { suffix: 'korun' }, twoPoints),
    4.2: number(269, { suffix: 'korun' }, twoPoints),
    4.3: number(50, { suffix: 'korun' }, twoPoints),
  }),
  5: group({
    5.1: number(4800, { suffix: 'sekund' }, twoPoints),
    5.2: number(240, { suffix: 'mm' }, twoPoints),
  }),
  6: group({
    6.1: numbersGroup({ X: 22, Y: 77 }, twoPoints),
    6.2: selfEvaluateText('Číslo 0 se nachází o 2 dílky nalevo od bodu X.', twoPoints),
  }),
  7: group({
    7.1: selfEvaluateImage("primkyABvRovineVysledek.jpg", threePoints),
    7.2: selfEvaluateImage("bodyVRovine.jpg", threePoints),
  }),
  8: group({
    8.1: optionBool(false),
    8.2: optionBool(true),
    8.3: optionBool(false),
  }),
  9: option("B", twoPoints),
  10: option("C", twoPoints),
  11: option("D", twoPoints),
  12: group({
    12.1: option("E",),
    12.2: option("D",),
    12.3: option("B",),
  }, task3Max3Points),
  13: group({
    13.1: option("E",),
    13.2: option("C",),
    13.3: option("A",),
  }, task3Max3Points),
  14: group({
    14.1: number(12, { suffix: 'schodů' }, twoPoints),
    14.2: number(196, { suffix: 'schodů' }, twoPoints),
    14.3: number(18, { suffix: 'pater' }, twoPoints),
  })

});
export default form;



import { group, number, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max5Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M5PAD23C0T01',
  maxPoints: 50,
  questions: {
      closed: 6,
      opened: 8
  }
}, {
  1: group({
    1.1: number(710, {}, twoPoints),
    1.2: number(126, {}, twoPoints),
  }),
  2: group({
    2.1: number(2, { prefix: 'o', suffix: 'litry' }, twoPoints),
    2.2: number(60, {}, twoPoints)

  }),
  3: group({
    3.1: number(120, { suffix: 'vojínů' }),
    3.2: number(17, { suffix: 'osob' }),
    3.3: number(136, { suffix: 'osob' }),
  }),
  4: group({
    4.1: number(27, { suffix: 'linkovaných sešitů ' }),
    4.2: number(54, { suffix: 'korun' }, twoPoints),
    4.3: number(520, { suffix: 'korun' }, twoPoints),
  }),
  5: group({
    5.1: number(7, { suffix: 'dětí' }, twoPoints),
    5.2: number(18, { suffix: 'dětí' }, twoPoints),
  }),
  6: group({
    6.1: number(2, { suffix: 'krát více' }),
    6.2: number(900, { suffix: 'korun' }, twoPoints),
  }),
  7: group({
    7.1: selfEvaluateImage( "primkyABvRovineVysledek.jpg",threePoints),
    7.2: selfEvaluateImage( "bodyVRovine.jpg",threePoints),
  }),
  8: group({
    8.1: optionBool(false),
    8.2: optionBool(true),
    8.3: optionBool(false),
  }, task3Max4Points),
  9: option("A", twoPoints),
  10: option("B", twoPoints),
  11: option("C", twoPoints),
  12: option("D", twoPoints),
  13: group({
    13.1: option("C",),
    13.2: option("D",),
    13.3: option("E",),
  }, task3Max5Points),
  14: group({
    14.1: number(18, { suffix: 'sloupců' }),
    14.2: number(8, { suffix: 'sloupců' }),
    14.3: number(23, { suffix: 'rozšířených obrazců' }, twoPoints),
  })

});
export default form;

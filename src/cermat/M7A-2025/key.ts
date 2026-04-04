import { group, mathExpr, mathRatio, number, numbersGroup, option, optionBool, rootGroup, selfEvaluateImage, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M7PAD25C0T01',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 10
  }
}, {

  1: group({
    1.1: numbersGroup({
      hodin: 18,
      minut: 40
    }),
    1.2: number(33),
  }),
  2: group({
    2.1: mathExpr("1/2", { hintType: 'fraction' }, twoPoints),
    2.2: mathExpr("3/4", { hintType: 'fraction' }, twoPoints),
  }),
  3: group({
    3.1: number(120),
    3.2: number(48, {}, twoPoints),
  }),
  4: group({
    4.1: number(600, { suffix: 'korun' }),
    4.2: number(200, { prefix: 'o', suffix: 'korun' }),
    4.3: number(1900, { suffix: 'korun' }),
  }),
  5: group({
    5.1: number(21, { suffix: 'korun' }),
    5.2: number(42, { suffix: 'korun' }, twoPoints),
  }),
  6: group({
    6.1: number(77, { suffix: 'kartiček' }),
    6.2: number(3, { suffix: 'kartiček' }),
    6.3: number(7, { suffix: 'kartiček' }, twoPoints),
  }),
  7: group({
    7.1: number(5, { suffix: 'cm' }, twoPoints),
    7.2: number(110, { suffix: 'cm^2^' }, twoPoints),
  }),
  8: group({
    8.1: selfEvaluateImage(""),
    8.2: selfEvaluateImage("", twoPoints),
  }),
  9: selfEvaluateImage("", threePoints),
  10: group({
    10.1: optionBool(false),
    10.2: optionBool(true),
    10.3: optionBool(false),
  }),
  11: option('B', twoPoints),
  12: option('C', twoPoints),
  13: option('A', twoPoints),
  14: option('D', twoPoints),
  15: group({
    15.1: option('A'),
    15.2: option('E'),
    15.3: option('F'),
  }, task3Max6Points),
  16: group({
    16.1: number(38),
    16.2: number(23, { suffix: 'bílých čtyřúhelníků' }),
    16.3: mathRatio("52:49", twoPoints)
  })
});
export default form;

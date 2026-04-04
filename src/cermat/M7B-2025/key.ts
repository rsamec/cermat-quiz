import { group, mathExpr, number, numbers, option, optionBool, rootGroup, selfEvaluateImage, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M7PBD25C0T02',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 10
  }
}, {

  1: number(40, {}, twoPoints),
  2: numbers([32, 243], twoPoints),
  3: group({
    3.1: mathExpr("-5/6", { hintType: 'fraction' }, twoPoints),
    3.2: mathExpr("7/3", { hintType: 'fraction' }, twoPoints),
  }),
  4: group({
    4.1: mathExpr("1/3", { hintType: 'fraction' }),
    4.2: number(3, { suffix: 'čerpadla' }),
    4.3: number(6, { suffix: 'hodin' }, twoPoints),
  }),
  5: group({
    5.1: number(7, { suffix: 'dvojic' }),
    5.2: number(26, { suffix: 'žáků' }, twoPoints),
  }),
  6: group({
    6.1: number(-3),
    6.2: number(98_671),
    6.3: number(1024, {}, twoPoints),
  }),
  7: group({
    7.1: number(5, { suffix: 'cm' }),
    7.2: number(26, { suffix: 'cm' }),
    7.3: number(32, { suffix: 'cm^2^' }),
    7.4: number(160, { suffix: 'cm^3^' }),
  }),
  8: group({
    8.1: selfEvaluateImage(""),
    8.2: selfEvaluateImage("", twoPoints),
  }),
  9: group({
    9.1: selfEvaluateImage(""),
    9.2: selfEvaluateImage("", twoPoints),
  }),
  10: group({
    10.1: optionBool(false),
    10.2: optionBool(false),
    10.3: optionBool(true),
  }),
  11: option('D', twoPoints),
  12: option('C', twoPoints),
  13: option('A', twoPoints),
  14: option('B', twoPoints),
  15: group({
    15.1: option('F'),
    15.2: option('B'),
    15.3: option('C'),
  }, task3Max6Points),
  16: group({
    16.1: number(37, { suffix: "tmavých krychliček" }),
    16.2: number(15, { suffix: 'cm' }),
    16.3: number(148, { suffix: 'cm' }, twoPoints)
  })
});
export default form;

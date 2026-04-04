import { group, mathEquation, mathExpr, number, numbers, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M7PID18C0T01',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 11
  }
}, {

  1: number(3),
  2: group({
    2.1: number(9, { suffix: "cm" }),
    2.2: number(3, { prefix: "o", suffix: "cm" }),
  }),
  3: group({
    3.1: mathExpr("4/5", { hintType: 'fraction' }, twoPoints),
    3.2: mathExpr("51/25", { hintType: 'fraction' }, twoPoints),
  }),
  4: mathEquation('311*31-1=9640', { hintType: 'equation' }, twoPoints),
  5: group({
    5.1: number(160, { suffix: "krabic" }, twoPoints),
    5.2: number(100, { suffix: "krabic" }),
    5.3: number(1_920, { suffix: "mýdel" }),
  }),
  6: group({
    6.1: number(8, { prefix: "o", suffix: "cm" }),
    6.2: number(36, { suffix: 'cm' }),
    6.3: number(576, { suffix: "cm^2^" }),
  }),
  7: group({
    7.1: number(250, { suffix: 'm' }),
    7.2: number(50, { suffix: 'm' }),
  }),
  8: group({
    8.1: number(75, { suffix: 'mincí' }, threePoints),
    8.2: number(125, { suffix: 'Kč' },),
  }),
  9: group({
    9.1: selfEvaluateImage(""),
    9.2: selfEvaluateImage(""),
    9.3: selfEvaluateImage(""),
  }),
  10: selfEvaluateImage("", threePoints),
  11: group({
    11.1: optionBool(false),
    11.2: optionBool(true),
    11.3: optionBool(true),
  }, task3Max4Points),
  12: option('B', twoPoints),
  13: option('A', twoPoints),
  14: option('D', twoPoints),
  15: option('D', twoPoints),
  16: group({
    16.1: option('C'),
    16.2: option('E'),
    16.3: option('B'),
  }, task3Max6Points),
  17: group({
    17.1: numbers([2, 9]),
    17.2: numbers([15, 16]),
    17.3: numbers([215, 216], twoPoints)
  }),
});
export default form;
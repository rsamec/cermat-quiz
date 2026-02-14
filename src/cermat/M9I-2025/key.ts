import { group, mathEquation, mathExpr, number, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PND25C0T01',
  maxPoints: 50,
  questions: {
    closed: 5,
    opened: 11
  }
}, {

  1: number(1980, { suffix: 'cm^2^' }),
  2: group({
    2.1: number(0.36, {}),
    2.2: number(2, {}),
  }),
  3: group({
    3.1: mathExpr("7/20", { hintType: 'fraction' }, twoPoints),
    3.2: mathExpr("5/4", { hintType: 'fraction' }, twoPoints),
  }),
  4: group({
    4.1: mathExpr('4y^2', { hintType: 'expression' }),
    4.2: mathExpr('n^2+9', { hintType: 'expression' }),
    4.3: mathExpr('(3a-11)^2', { hintType: 'expression' }, twoPoints),
  }),
  5: group({
    5.1: mathEquation('y=0', { hintType: 'equation' }, twoPoints),
    5.2: mathEquation('x=-1/6, y=2', { hintType: 'equation' }, twoPoints),
  }),
  6: group({
    6.1: number(40, { suffix: 'sazenic salátů' }),
    6.2: number(30, { suffix: 'sazenic okurek' }, twoPoints),
  }),
  7: group({
    7.1: number(760, { suffix: 'g' }),
    7.2: number(56, { suffix: 'g' }),
    7.3: number(88, { prefix: 'o', suffix: 'g' }, twoPoints),
  }),
  8: group({
    8.1: number(84, { suffix: 'cm' }),
    8.2: number(432, { suffix: 'cm^2^' }, twoPoints),
  }),
  9: selfEvaluateImage("image-9.png", twoPoints),
  10: selfEvaluateImage("image-10.png", threePoints),
  11: group({
    11.1: optionBool(true),
    11.2: optionBool(false),
    11.3: optionBool(true),
  }, task3Max4Points),
  12: option('D', twoPoints),
  13: option('A', twoPoints),
  14: option('B', twoPoints),
  15: group({
    15.1: option('C', twoPoints),
    15.2: option('E', twoPoints),
    15.3: option('D', twoPoints),
  }),
  16: group({
    16.1: number(420, { suffix: "sloupců" }, twoPoints),
    16.2: number(11, { suffix: 'řad' }, twoPoints),
  }),
});
export default form;
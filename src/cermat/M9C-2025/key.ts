import { group, mathEquation, mathExpr, number, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PCD25C0T03',
  maxPoints: 50,
  questions: {
    closed: 5,
    opened: 11
  }
}, {

  1: number(20_000),
  2: number(7),
  3: group({
    3.1: mathExpr("9/10", { hintType: 'fraction' }),
    3.2: mathExpr('-2/5', { hintType: 'fraction' }, twoPoints),
  }),
  4: group({
    4.1: mathExpr('64a^2-64a+16', { hintType: 'expression' }),
    4.2: mathExpr('4x^2+4', { hintType: 'expression' }),
    4.3: mathExpr('2n^2+n', { hintType: 'expression' }, twoPoints),
  }),
  5: group({
    5.1: mathEquation('x=-1/6', { hintType: 'equation' }, twoPoints),
    5.2: mathEquation('y=0', { hintType: 'equation' }, twoPoints),
  }),
  6: group({
    6.1: mathExpr('2n', { hintType: 'expression' }),
    6.2: mathExpr('3/4n', { hintType: 'expression' }),
    6.3: number(2400, { suffix: "korun" }, twoPoints),
  }),
  7: group({
    7.1: number(42, { suffix: 'km/h' }),
    7.2: number(30, { suffix: 'km' }, twoPoints),
    7.3: number(40, { suffix: 'minut' }),
  }),
  8: group({
    8.1: number(79, { suffix: 'cm^2^' }),
    8.2: number(120, { prefix: 'o' }, twoPoints),
  }),
  9: selfEvaluateImage("", threePoints),
  10: selfEvaluateImage("", threePoints),
  11: group({
    11.1: optionBool(true),
    11.2: optionBool(true),
    11.3: optionBool(false),
  }, task3Max4Points),
  12: option('D', twoPoints),
  13: option('B', twoPoints),
  14: option('C', twoPoints),
  15: group({
    15.1: option("F", twoPoints),
    15.2: option("B", twoPoints),
    15.3: option("A", twoPoints),
  }, task3Max6Points),
  16: group({
    16.1: number(42, { suffix: "trojúhelníků" }),
    16.2: number(108, { suffix: "šedých trojúhelníků" }),
    16.3: number(38, { prefix: "ve", suffix: "obrazci" }, twoPoints),
  }),
});
export default form;
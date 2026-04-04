import { fourPoints, group, mathEquation, mathExpr, mathRatio, number, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PAD23C0T01',
  maxPoints: 50,
  questions: {
      closed: 5,
      opened: 11
  }
}, {

  1: number(20, { suffix: 'minut' }),
  2: group({
    2.1: number(1.2, { suffix: 'litru', step: 0.1 }, twoPoints),
    2.2: number(1_600_000, { suffix: 'krychliček' }),
  }),
  3: group({
    3.1: mathExpr("4/9", { hintType: 'fraction' }),
    3.2: mathExpr("-2/7", { hintType: 'fraction' }),
    3.3: mathExpr("5/14", { hintType: 'fraction' }, twoPoints)
  }),
  4: group({
    4.1: mathExpr('x(2x-1)', { hintType: 'expression' }),
    4.2: mathExpr('4/9a^2-4a+9', { hintType: 'expression' }),
    4.3: mathExpr('n^2+19n+7', { hintType: 'expression' }, twoPoints),
  }),
  5: group({
    5.1: mathEquation(false, { hintType: 'equation' }, twoPoints),
    5.2: mathEquation('y=-10', { hintType: 'equation' }, twoPoints),
  }),
  6: group({
    6.1: number(24, { suffix: 'cm^2^' }),
    6.2: number(64, { suffix: 'cm^2^' }),
  }),
  7: group({
    7.1: number(25, { prefix: 'o', suffix: '%' }),
    7.2: number(21, { suffix: 'žáků' }),
    7.3: mathRatio("3:7"),
  }),
  8: group({
    8.1: mathExpr("0.75a", { hintType: 'expression', hint: 'Odpověď zapište s proměnnou a.' }),
    8.2: number(40, { prefix: 'a = ', suffix: 'm' }, twoPoints),
    8.3: number(100, { prefix: 'o', suffix: 'm^2^' }),
  }),
  9: selfEvaluateImage( "9-result.jpeg",twoPoints),
  10: selfEvaluateImage( "10-result.jpeg",threePoints),
  11: group({
    11.1: optionBool(false),
    11.2: optionBool(true),
    11.3: optionBool(false),
  }, task3Max4Points),
  12: option('C', twoPoints),
  13: option('D', twoPoints),
  14: option('B', twoPoints),
  15: group({
    15.1: option('E'),
    15.2: option('C'),
    15.3: option('A'),
  }, task3Max6Points),
  16: group({
    16.1: number(81, { suffix: 'bílých trojúhelníků' }),
    16.2: number(364, { suffix: 'šedých trojúhelníků' }),
    16.3: number(19_683, { suffix: 'bílých trojúhelníků' }, twoPoints),
  }),

});
export default form;
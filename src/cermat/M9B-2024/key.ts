import { group, mathEquation, mathExpr, number, option, optionBool, rootGroup, selfEvaluateImage, task3Max3Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PBD24C0T02',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 10
  }
}, {

  1: number(1.5, { suffix: 'km' }),
  2: number(40, { prefix:'o', suffix: '%' }, twoPoints),
  3: group({
    3.1: mathExpr("-10/9", { hintType: 'fraction' }, twoPoints),
    3.2: mathExpr("-70/9", { hintType: 'fraction' }, twoPoints),
  }),
  4: group({
    4.1: mathExpr('9+12x+4x^2', { hintType: 'expression' }),
    4.2: mathExpr('(100-x)(100+x)', { hintType: 'expression' }),
    4.3: mathExpr('3x+21', { hintType: 'expression' }, twoPoints),
  }),
  5: group({
    5.1: mathEquation('x=-1', { hintType: 'equation' }, twoPoints),
    5.2: mathEquation('y=3', { hintType: 'equation' }, twoPoints),
  }),
  6: group({
    6.1: number(84, { suffix: 'cm^2^' }, twoPoints),
    6.2: number(48, { suffix: 'cm' }, twoPoints),
  }),
  7: group({
    7.1: mathExpr('1.5x', { hintType: 'expression' }, twoPoints),
    7.2: number(58, {}, twoPoints)
  }),
  8: group({
    8.1: number(64, { }, twoPoints),
    8.2: number(20, { suffix: '.' }, twoPoints),
  }),
  9: selfEvaluateImage("image-4.png", threePoints),
  10: selfEvaluateImage("image-9.png", threePoints),
  11: option('B', twoPoints),
  12: option('C', twoPoints),
  13: option('D', twoPoints),
  14: option('D', twoPoints),
  15: group({
    15.1: optionBool(true),
    15.2: optionBool(false),
    15.3: optionBool(true),
  }, task3Max3Points),
  16: group({
    16.1: option('D', twoPoints),
    16.2: option('C', twoPoints),
    16.3: option('B', twoPoints),
  }),
});
export default form;
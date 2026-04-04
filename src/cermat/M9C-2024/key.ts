import { group, mathEquation, mathExpr, number, option, optionBool, rootGroup, selfEvaluateImage, task3Max3Points, threePoints, twoPoints, video } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M9PCD24C0T03',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 10
  }
}, {

  1: number(35100),
  2: number(5, { suffix: 'cm' }, twoPoints),
  3: group({
    3.1: mathExpr("21/2", { hintType: 'fraction' }, { ...twoPoints, ...video("0") }),
    3.2: mathExpr("-16/5", { hintType: 'fraction' }, { ...twoPoints, ...video("1") }),
  }),
  4: group({
    4.1: mathExpr('(64/9)b^2', { hintType: 'expression' }, video("2")),
    4.2: mathExpr('(2+x)(2-x)', { hintType: 'expression' }, video("3")),
    4.3: mathExpr('c+49', { hintType: 'expression' }, { ...twoPoints, ...video("4") }),
  }),
  5: group({
    5.1: mathEquation('x=9', { hintType: 'equation' }, { ...twoPoints, ...video("5") }),
    5.2: mathEquation('x=2', { hintType: 'equation' }, twoPoints),
  }),
  6: group({
    6.1: number(8, { suffix: 'cm' }, twoPoints),
    6.2: number(88, { suffix: 'cm^2^' }, twoPoints),
  }),
  7: group({
    7.1: number(6, { suffix: 'm' }, twoPoints),
    7.2: number(2, { suffix: 'm' }, twoPoints)
  }),
  8: group({
    8.1: number(78, { suffix: 'stupňů' }, { ...twoPoints, ...video("8") }),
    8.2: number(2, { suffix: 'stupňů' }, twoPoints),
  }),
  9: selfEvaluateImage("image-9.png", { ...threePoints, ...video("9") }),
  10: selfEvaluateImage("image-10.png", { ...threePoints, ...video("10") }),
  11: option('B', twoPoints),
  12: option('C', twoPoints),
  13: option('D', twoPoints),
  14: option('E', twoPoints),
  15: group({
    15.1: optionBool(true),
    15.2: optionBool(false),
    15.3: optionBool(true),
  }, task3Max3Points),
  16: group({
    16.1: option('E', twoPoints),
    16.2: option('D', twoPoints),
    16.3: option('B', twoPoints),
  }),


});
export default form;
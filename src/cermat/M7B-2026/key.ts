import { group, mathExpr, mathRatio, number, numbers, numbersGroup, option, optionBool, rootGroup, selfEvaluateImage, task3Max4Points, task3Max6Points, threePoints, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'M7PAD26C0T01',
  maxPoints: 50,
  questions: {
    closed: 6,
    opened: 10
  }
}, {

  1: number(160, { suffix: "kusů" }),
  2: group({
    2.1: mathExpr("-2/5", { hintType: 'fraction' }, twoPoints),
    2.2: mathExpr("1/3", { hintType: 'fraction' }, twoPoints),
  }),
  3: group({
    3.1: number(8),
    3.2: number(72),
    3.3: number(96),
  }),
  4: group({
    4.1: number(14, { suffix: 'červených proužků' }),
    4.2: number(4, { suffix: 'cm' }, twoPoints),
  }),
  5: group({
    5.1: number(50, {suffix: 'cuket' }, twoPoints),
    5.2: number(560, {suffix: 'cuket' }, twoPoints),    
  }),
  6: group({
    6.1: number(220, { suffix: 'cm' }),
    6.2: number(320, { suffix: 'cm' }),
    6.3: number(410, { suffix: 'cm' }, twoPoints),  
  }),
  7: group({
    7.1: number(558, { suffix: 'cm^2^' }, twoPoints),
    7.2: number(225, { suffix: 'cm^2^' }, twoPoints), 
  }),
  8: selfEvaluateImage("", threePoints),
  9: selfEvaluateImage("", twoPoints),
  10: group({
    10.1: optionBool(true),
    10.2: optionBool(false),
    10.3: optionBool(false),
  }, task3Max4Points),
  11: option('B', twoPoints),
  12: option('A', twoPoints),
  13: option('C', twoPoints),
  14: option('C', twoPoints),
  15: group({
    15.1: option('E'),
    15.2: option('D'),
    15.3: option('A'),
  }, task3Max6Points),
  16: group({
    16.1: number(4, { suffix: 'desky' }),
    16.2: number(3, { suffix: 'tyče' }),
    16.3: number(20, { suffix: 'kusů ohrady' }, twoPoints),
  })
});
export default form;

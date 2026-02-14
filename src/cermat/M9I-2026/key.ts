
import { group, mathEquation, mathExpr, number, numbers, numbersGroup, option, optionBool, rootGroup, selfEvaluateImage, task2Max3Points, task3Max4Points, task3Max6Points, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-01-28',
  maxPoints: 50,
  questions: {
    closed: 5,
    opened: 5
  }
}, {
  1: number(100),
  2: group({
    2.1: number(-50),
    2.2: number(0.1)
  }),
  3: group({
    3.1: mathExpr("5/18", { hintType: 'fraction' }),
    3.2: mathExpr("-1/6", { hintType: 'fraction' }, twoPoints)
  }),
  4: group({
    4.1: mathExpr("y(3x+9y-1)", { hintType: 'expression' }),
    4.2: mathExpr("(3n-2)(3n+2)", { hintType: 'expression' }),
    4.3: mathExpr("-2x", { hintType: 'expression' }, twoPoints),
  }),
  5: group({
    5.1: mathEquation(false, { hintType: 'equation' }, twoPoints),
    5.2: numbersGroup({ x: 1, y: -5 }, twoPoints)
  }),
  6: group({
    6.1: mathExpr("2h-6", { hintType: 'expression' }),
    6.2: mathExpr("(2h-6)/3", { hintType: 'expression' }),
    6.3: number(9, { suffix: "Kč" }, twoPoints)
  }),
  7: group({
    7.1: number(36, { suffix: 'hodin' }),
    7.2: mathExpr("1/6", { suffix: 'zakázky', hintType: 'fraction' }),
    7.3: number(42, { suffix: 'hodin' }, twoPoints),
  }),
  8: group({
    8.1: number(5),
    8.2: numbers([3, 14], twoPoints)
  }),
  9: selfEvaluateImage("image-10.png", twoPoints),
  10: group({
    10.1: selfEvaluateImage("image-10.png"),
    10.2: selfEvaluateImage("image-10.png")
  }, task2Max3Points),
  11: group({
    11.1: optionBool(true),
    11.2: optionBool(false),
    11.3: optionBool(false),
  }, task3Max4Points),
  12: option("B", twoPoints),
  13: option("A", twoPoints),
  14: option("E", twoPoints),
  15: group({
    15.1: option('D'),
    15.2: option('C'),
    15.3: option('B'),
  }, task3Max6Points),
  16: group({
    16.1: number(6, { prefix: "v", suffix: 'kroku' }),
    16.2: number(55, { suffix: 'cm' }),
    16.3: number(353, { prefix: "v", suffix: 'kroku' }, twoPoints)
  })
})
export default form;
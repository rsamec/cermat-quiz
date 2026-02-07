
import { group, mathExpr, mathRatio, number, numbersGroup, option, optionBool, rootGroup, task3Max3Points, tasks4Max2Points, threePoints, twoPoints, words } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-01-27',
  maxPoints: 23,
  questions: {
    closed: 5,
    opened: 5
  }
}, {
  1: number(48),
  2: mathExpr("(4a+1)(4a-1)", { hintType: 'expression' }),
  3: numbersGroup({
    x: -4,
    y: 3
  }, twoPoints),
  4: group({
    4.1: number(12, { suffix: 'čerpadel' }),
    4.2: number(50, { suffix: '%' }),
    4.3: number(16, { suffix: 'hodin' }, twoPoints),
  }),
  5: group({
    5.1: number(6, { suffix: 'žáků' }),
    5.2: number(25, { suffix: '%' }),
    5.3: mathRatio("3:8"),
  }),
  6: option("C", twoPoints),
  7: option("A", twoPoints),
  8: group({
    8.1: option('D'),
    8.2: option('B'),
    8.3: option('E'),
  }, task3Max3Points),
  9: words("Čáslavi,vědomosti,radosti", threePoints),
  10: group({
    10.1: optionBool(true),
    10.2: optionBool(true),
    10.3: optionBool(false),
    10.4: optionBool(false),
  }, tasks4Max2Points)
})
export default form;
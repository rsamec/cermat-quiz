
import { group, match, mathEquation, mathExpr, number, numbersGroup, option, optionBool, rootGroup, task3Max4Points, tasks4Max2Points, threePoints, twoPoints, word, words, wordsGroup } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-02-24',
  maxPoints: 19,
  questions: {
    closed: 8,
    opened: 4,
  }
}, {
  1: option("A", twoPoints),
  2: option("B", twoPoints),
  3: mathExpr("-11/10", { hintType: 'fraction' }),
  4: numbersGroup({
    a: 9,
    b: 81
  }),
  5: group({
    5.1: number(30, { suffix: 'stupňů' }),
    5.2: number(50, { suffix: 'stupňů' }),
    5.3: number(140, { suffix: 'stupňů' }),
  }),
  6: group({
    6.1: optionBool(true),
    6.2: optionBool(true),
    6.3: optionBool(false),
  }, task3Max4Points),
  7: group({
    7.1: optionBool(true),
    7.2: optionBool(false),
    7.3: optionBool(false),
  }, task3Max4Points),
  8: option("B", twoPoints),
  9: group({
    9.1: word("obou"),
    9.2: word("nabízenou"),
  }),
  10: option("C"),
  11: option("B"),
  12: option("A"),
})
export default form;
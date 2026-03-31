import { group, match, mathExpr, mathExprGroup, number, option, rootGroup, sortedOptions, threePoints, twoPoints, word, wordsGroup } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-03-31',
  maxPoints: 23,
  questions: {
    closed: 5,
    opened: 5,
  }
}, {
  1: number(2.5, { suffix: "krát" }),
  2: mathExpr("1/5", { hintType: 'fraction' }),
  3: mathExprGroup({
    "první číslo": "5a",
    "druhé číslo": "25a^2"
  }),
  4: group({
    4.1: number(200, { suffix: "litrů" }),
    4.2: number(30, { suffix: 'mm' })
  }),
  5: option("D", twoPoints),
  6: group({
    6.1: option("B", twoPoints),
    6.2: option("D", twoPoints),
    6.3: option("F", twoPoints),
  }),
  7: wordsGroup({
    "první slovo": "6.pád žena",
    "druhé slovo": "1.pád muž"
  }),
  8: group({
    8.1: option("C"),
    8.2: option("B"),
    8.3: option("F"),
    8.4: option("E"),
  }),
  9: sortedOptions(["B", "D", "C", "A", "E"], threePoints),
  10: group({
    10.1: match(/^(okraj|krajíc|)$/),
    10.2: word("stinný"),
  })
})
export default form;
import { group, mathRatio, number, option, optionBool, rootGroup, tasks4Max2Points, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-04-07',
  maxPoints: 23,
  questions: {
    closed: 6,
    opened: 4,
  }
}, {
  1: number(3, { suffix: "%" }),
  2: number(64, { suffix: "cm" }, twoPoints),  
  3: group({
    3.1: number(114, { suffix: "m" }),
    3.2: number(157, { suffix: 's' })
  }),
  4: group({
    4.1: number(54, { suffix: "cm" }),
    4.2: mathRatio("1:4")
  }),
  5: option("B", twoPoints),
  6: option("D", twoPoints),
  7: option("A", twoPoints),
  8: group({
    8.1: optionBool(true),
    8.2: optionBool(false),
    8.3: optionBool(true),
    8.4: optionBool(true),
  }, tasks4Max2Points),
  9: group({
    9.1: option("F"),
    9.2: option("E"),
    9.3: option("B"),
    9.4: option("A"),
  }),
  10: option("C")
})
export default form;
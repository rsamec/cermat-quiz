
import { group, number, numbers, option, optionBool, rootGroup, threePoints, twoPoints, wordsGroup } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-03-10',
  maxPoints: 19,
  questions: {
    closed: 3,
    opened: 5,
  }
}, {
  1: number(75, { suffix: '%' }),
  2: numbers([5, 3, 1, 7, 6, 2], threePoints),
  3: group({
    3.1: number(110, { suffix: "šedých čtverců" }),
    3.2: number(272, { suffix: "šedých čtverců" }),
    3.3: number(74, { suffix: "bílých čtverců" }, twoPoints),
  }),
  4: group({
    4.1: number(9, { suffix: "plus symbolů" }),
    4.2: number(150, { suffix: "symbolů" }),
    4.3: number(17, { suffix: "krát symbolů" }, twoPoints),
  }),
  5: wordsGroup({
    "první přídavné jméno": "1.pád, mladý",
    "druhé přídavné jméno": "4.pád, jarní",    
  }),
  6: option("D"),
  7: group({
    7.1: optionBool(false),
    7.2: optionBool(true),
    7.3: optionBool(false),
    7.4: optionBool(true),
  }),
  8: group({
    8.1: option("E"),
    8.2: option("A"),
    8.3: option("F"),
    8.4: option("B"),
  })
})
export default form;
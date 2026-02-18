
import { group, match, mathEquation, mathExpr, number, numbersGroup, option, optionBool, rootGroup, task3Max4Points, tasks4Max2Points, threePoints, twoPoints, word, words, wordsGroup } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-02-17',
  maxPoints: 19,
  questions: {
    closed: 5,
    opened: 4,
  }
}, {
  1: number(45, { suffix: "hodin" }),
  2: group({
    2.1: option("E", twoPoints),
    2.2: option("D", twoPoints),
    2.3: option("B", twoPoints),
  }),
  3: group({
    3.1: option("D", twoPoints),
    3.2: option("F", twoPoints),
    3.3: option("A", twoPoints),
  }),
  4: numbersGroup({ hodin: 1, minut: 8 }),
  5: group({
    5.1: optionBool(false),
    5.2: optionBool(true),
    5.3: optionBool(true),
  }, task3Max4Points),
  6: group({
    6.1: option("D", twoPoints),
    6.2: option("A", twoPoints),
    6.3: option("C", twoPoints),
  }),
  7: group({
    7.1: wordsGroup({
      podmět: "noha",
      přísudek: "nesmí vkročit"
    }),
    7.2: wordsGroup({
      podmět: "občané i zástupci",
      přísudek: "protestovali"
    })
  }),
  8: group({
    8.1: option("D"),
    8.2: option("E"),
    8.3: option("B"),
    8.4: option("A"),
  }),
  9: group({
    9.1: match(/^(ručník|rukáv|)$/),
    9.2: word("zpoždění"),
    9.3: match(/^(náplň|výplň|)$/)
  })
})
export default form;
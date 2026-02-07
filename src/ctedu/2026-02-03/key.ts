
import { group, mathExpr, number, numbersGroup, option, rootGroup, threePoints, twoPoints, word, words } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-02-03',
  maxPoints: 16,
  questions: {
    closed: 3,
    opened: 6,
  }
}, {
  1: number(11),
  2: mathExpr("(5a-6)", { hintType: 'expression' }),
  3: numbersGroup({ x: -2, y: 0 }, twoPoints),
  4: option("C", twoPoints),
  5: option("C", twoPoints),
  6: number(20, { suffix: "%" }, twoPoints),
  7: group({
    7.1: word("se konají"),
    7.2: word("obdržíte")
  }),
  8: words("předměstí,nástavec,předskokan", threePoints),
  9: option("D"),

})
export default form;
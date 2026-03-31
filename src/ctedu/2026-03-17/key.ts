
import { group, mathEquation, mathExpr, number, option, optionBool, rootGroup, task3Max4Points, twoPoints, match, word, words, fourPoints } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-03-17',
  maxPoints: 23,
  questions: {
    closed: 3,
    opened: 7,
  }
}, {
  1: number(32),
  2: mathExpr("-5/24", { hintType: 'fraction' }, twoPoints),
  3: mathEquation("x=1", { hintType: 'equation' }, twoPoints),
  4: group({
    4.1: mathExpr("x/3-12", { hintType: 'expression' }, twoPoints),
    4.2: number(42, { suffix: "divočáků" }),
  }),
  5: group({
    5.1: optionBool(false),
    5.2: optionBool(true),
    5.3: optionBool(false),
  }, task3Max4Points
  ),
  6: option("D", twoPoints),
  7: option("D"),
  8: group({
    8.1: match(/^(běžný|zběhlý)$/),
    8.2: word("postrach")
  }),
  9: words("připravovali,daných,jednotlivými,objevila", fourPoints),
  10: group({
    10.1: word("neštěstí"),
    10.2: word("vítr")
  })
})
export default form;
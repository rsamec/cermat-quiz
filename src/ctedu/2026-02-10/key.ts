
import { group, mathEquation, mathExpr, number, numbersGroup, option, optionBool, rootGroup, tasks4Max2Points, threePoints, twoPoints, word, words } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-02-10',
  maxPoints: 19,
  questions: {
    closed: 5,
    opened: 5,
  }
}, {
  1: number(12, { suffix: "krát" }),
  2: group({
    2.1: mathExpr("(16/9)b^2", { hintType: 'expression' }),
    2.2: mathExpr("10(1-2c)", { hintType: 'expression' }, twoPoints),
  }),
  3: mathEquation("x=0", { hintType: 'equation' }, twoPoints),
  4: group({
    4.1: mathExpr("1/3x", { hintType: 'expression' }),
    4.2: mathExpr("2/5(200-x)", { hintType: 'expression' }),
    4.3: number(150, { suffix: "žen" }, twoPoints),
  }),
  5: option("E", twoPoints),
  6: option("C", twoPoints),
  7: option("D", twoPoints),
  8: option("A"),
  9: option("C"),
  10: group({
    10.1: optionBool(true),
    10.2: optionBool(false),
    10.3: optionBool(false),
    10.4: optionBool(false),
  }, tasks4Max2Points)

})
export default form;
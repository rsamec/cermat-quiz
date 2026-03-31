
import { group, mathExpr, number, numbers, option, optionBool, rootGroup, threePoints, twoPoints, wordsGroup } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-03-24',
  maxPoints: 22,
  questions: {
    closed: 6,
    opened: 4,
  }
}, {
  1: number(8),
  2: mathExpr("4y^2-y+1/16", { hintType: 'expression' }),
  3: group({
    3.1: mathExpr("x/3", { hintType: 'expression' }),
    3.2: mathExpr("5x/2", { hintType: 'expression' }),
    3.3: number(60, { suffix: "korun" }, twoPoints),
  }),
  4: option("B", twoPoints),
  5: option("D", twoPoints),
  6: option("A", twoPoints),
  7: number(640, {suffix:"Kč"}, twoPoints)  ,
  8: group({
    8.1: option("D"),
    8.2: option("E"),
    8.3: option("B"),
    8.4: option("A"),
  }),
  9: group({
    9.1: option("E"),
    9.2: option("C"),
    9.3: option("B"),    
  }),
  10: option("B")

})
export default form;

import { group, mathEquation, mathExpr, number, option, optionBool, rootGroup, tasks4Max2Points, twoPoints, wordsGroup } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-01-13',
  maxPoints: 22,
  questions: {
    closed: 4,
    opened: 6
  }
}, {
  1: mathExpr("1/3", { hintType: 'fraction' }, twoPoints),
  2: mathExpr("x(4+17x)", { hintType: 'expression' }, twoPoints),
  3: number(0.36, {}),
  4: option("C", twoPoints),
  5: option("B", twoPoints),
  
  6: group({
    6.1: mathExpr("4/5x", { hintType: 'expression' }),
    6.2: mathExpr("5x", { hintType: 'expression' }),
    6.3: number(125, { suffix: "testů" }, twoPoints),
  }),
  7: mathEquation('5/4', { prefix:"y", hintType: 'fraction' }, twoPoints),
  8: group({
    8.1: wordsGroup({
      podmět:"detox",
      přísudek:"může zlepšit"
    }),
    8.2: wordsGroup({
      podmět:"stovky",
      přísudek:"sklouznou"
    })
  }),
  9: group({
    9.1: optionBool(false),
    9.2: optionBool(true),
    9.3: optionBool(true),
    9.4: optionBool(false),
  }, tasks4Max2Points),
  10: group({
    10.1: option("A"),
    10.2: option("C"),
    10.3: option("E")
  })
})
export default form;

import { group, match, mathEquation, number, option, rootGroup, task3Max3Points, task3Max6Points, twoPoints, word } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-01-06',
  maxPoints: 23,
  questions: {
    closed: 5,
    opened: 5
  }
}, {
  1: number(112, { suffix: "krát" }),
  2: number(0.6, {}),
  3: group({
    3.1: number(4_480, { suffix: 'cm^2^' }),
    3.2: number(1_200, { suffix: 'cm^3^' }),
    3.3: number(15, { suffix: "krát" }),
  }),
  4: mathEquation('x=1/7', { hintType: 'equation' }, twoPoints),
  5: option("C", twoPoints),
  6: option("D", twoPoints),
  7: group({
    7.1: option('B'),
    7.2: option('A'),
    7.3: option('E'),
  }, task3Max6Points),
  8: option("B"),
  9: group({
    9.1: option('B'),
    9.2: option('C'),
    9.3: option('D'),
  }, task3Max3Points),
  10: group({
    10.1: match(/^(svícnem|lampou)$/),
    10.2: word("šetří")
  })
})
export default form;
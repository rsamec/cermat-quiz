
import { fourPoints, group, match, mathEquation, number, option, rootGroup, task3Max3Points, task3Max6Points, twoPoints, word, words } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-01-20',
  maxPoints: 25,
  questions: {
    closed: 1,
    opened: 8
  }
}, {
  1: number(24, { suffix: "cm" }, twoPoints),
  2: group({
    2.1: number(10, { suffix: 'cm' }),
    2.2: number(52, { suffix: 'cm' }, twoPoints),
  }),
  3: group({
    3.1: number(24, { suffix: 'cm' }),
    3.2: number(3_140, { suffix: 'cm^3^' }, twoPoints),
  }),
  4: group({
    4.1: number(6, { suffix: 'cm' }),
    4.2: number(40, { suffix: 'cm' }, twoPoints),
  }),
  5: group({
    5.1: number(10, { suffix: 'cm' }, twoPoints),
    5.2: number(6_300, { suffix: 'cm^3^' }, twoPoints),
  }),
  6: group({
    6.1: number(40, { suffix: 'cm^2^' }),
    6.2: number(100, { suffix: 'cm^2^' }),
  }),
  7: group({
    7.1: word('chůze'),
    7.2: word('řečník'),
    7.3: match(/^(pomlčka,pomlka,odmlka)$/),
  }),
  8: option("A"),
  9: words("tísnily,sebevědomě,otcovi,vítězství", fourPoints)
})
export default form;
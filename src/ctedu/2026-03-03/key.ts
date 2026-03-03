
import { fourPoints, group, mathExpr, number, option, rootGroup, threePoints, twoPoints, word, words } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'CTEDU-2026-03-03',
  maxPoints: 19,
  questions: {
    closed: 3,
    opened: 7,
  }
}, {
  1: group({
    1.1: number(26, { suffix: 'm' }),
    1.2: number(5, { suffix: 'rostlin' }),
    1.3: number(39, { suffix: 'červených rostlin' }, twoPoints),
  }),
  2: number(210, { suffix: 'cm' }, twoPoints),
  3: option("F", twoPoints),
  4: group({
    4.1: number(1200, { suffix: 'Kč' }),
    4.2: mathExpr('2/9x', { hintType: 'expression' }),
    4.3: number(270, {}, twoPoints),
  }),
  5: group({
    5.1: number(47),
    5.2: number(235),
    5.3: number(99, {}, twoPoints),
  }),
  6: word("příčiny"),
  7: option("C"),
  8: option("D"), 
  9: words("domorodý,mnohočetný,bohudík", threePoints),
  10: words("kamenný,zprostředkují,včelí,náramně", fourPoints),
  
})
export default form;
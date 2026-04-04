import { optionBool, group, wordsGroup, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, rootGroup, word } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'C9PDD23C0T04',
  maxPoints: 50,
  questions: {
    closed: 24,
    opened: 6
  }
}, {
  1: option("D"),
  2: option("B"),
  3: option("C"),
  4: option("B"),
  5: group({
    5.1: optionBool(true),
    5.2: optionBool(true),
    5.3: optionBool(false),
    5.4: optionBool(true),
  }, tasks4Max2Points),
  6: group({
    6.1: option("D"),
    6.2: option("E"),
    6.3: option("B"),
    6.4: option("A"),
  }),
  7: group({
    7.1: wordsGroup({ podmět: 'stavení', přísudek: 'se proměnilo' }),
    7.2: wordsGroup({ podmět: 'listy', přísudek: 'jsou potravou' }),
  }),
  8: group({
    8.1: optionBool(true),
    8.2: optionBool(false),
    8.3: optionBool(false),
    8.4: optionBool(true),
  }, tasks4Max2Points),
  9: option("D"),
  10: option("D"),
  11: option("A"),
  12: option("B"),
  13: option("D"),
  14: group({
    14.1: words("podezřelým"),
    14.2: words("odnětím"),
  }),
  15: sortedOptions(['E', 'A', 'D', 'B', 'F', 'C',], threePoints),
  16: group({
    16.1: word("nádvoří"),
    16.2: word("obhajoba"),
  }),
  17: option("A"),
  18: words('cizích, zákonné, historickými, upřímně', fourPoints),
  19: group({
    19.1: optionBool(false),
    19.2: optionBool(true),
    19.3: optionBool(false),
    19.4: optionBool(false),
  }, tasks4Max2Points),
  20: option("C"),
  21: option("A"),
  22: option("D"),
  23: group({
    23.1: word("důsledkový"),
    23.2: word("odporovací"),
  }),
  24: option("B"),
  25: group({
    25.1: optionBool(false),
    25.2: optionBool(false),
    25.3: optionBool(false),
    25.4: optionBool(false),
  }, tasks4Max2Points),
  26: option("B"),
  27: option("C"),
  28: option("D"),
  29: words('základní, další, obsahující', threePoints),
  30: group({
    30.1: option("E"),
    30.2: option("C"),
    30.3: option("B"),
  }),
});
export default form
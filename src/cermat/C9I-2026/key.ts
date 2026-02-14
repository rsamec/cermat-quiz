import { optionBool, group, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, rootGroup, word, match } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'C9PND26C0T01',
  maxPoints: 50,
  questions: {
    closed: 24,
    opened: 6
  }
}, {
  1: option("D"),
  2: option("B"),
  3: option("A"),
  4: option("A"),
  5: group({
    5.1: option("C"),
    5.2: option("A"),
    5.3: option("E"),
  }),
  6: group({
    6.1: word("chtěli bychom"),
    6.2: word("odpovězte")
  }),
  7: group({
    7.1: optionBool(false),
    7.2: optionBool(true),
    7.3: optionBool(true),
    7.4: optionBool(false),
  }, tasks4Max2Points),
  8: group({
    8.1: word("pokud"),
    8.2: word("či")
  }),
  9: option("C"),
  10: option("D"),
  11: option("D"),
  12: option("D"),
  13: group({
    13.1: optionBool(true),
    13.2: optionBool(true),
    13.3: optionBool(false),
    13.4: optionBool(true),
  }, tasks4Max2Points),
  14: sortedOptions(['D', 'A', 'F', 'B', 'E', 'C'], threePoints),
  15: words('nadvláda, podbradek, nádvoří', threePoints),
  16: option("A"),
  17: option("C"),
  18: words('protagonista, stejnojmenná, objednala (jsem), skrývá (se)', fourPoints),
  19: group({
    19.1: optionBool(false),
    19.2: optionBool(true),
    19.3: optionBool(true),
    19.4: optionBool(false),
  }, tasks4Max2Points),
  20: option("B"),
  21: option("C"),
  22: option("D"),
  23: words('bestiemi, džungli, vůle', threePoints),
  24: option("A"),
  25: match(/^(?:na )?zahájení (?:i )?koncert$/),
  26: group({
    26.1: optionBool(false),
    26.2: optionBool(false),
    26.3: optionBool(false),
    26.4: optionBool(true),
  }, tasks4Max2Points),
  27: option("C"),
  28: option("A"),
  29: option("B"),
  30: group({
    30.1: option("B"),
    30.2: option("D"),
    30.3: option("F"),
    30.4: option("E"),
  })
});
export default form
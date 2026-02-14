import { optionBool, group, wordsGroup, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, rootGroup, word} from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'C9PND25C0T01',
  maxPoints: 50,
  questions: {
    closed: 24,
    opened: 6
  }
}, {
  1: option("D"),
  2: option("D"),
  3: option("C"),
  4: option("C"),
  5: group({
    5.1: option("F"),
    5.2: option("D"),
    5.3: option("E"),
    5.4: option("C"),
  }),
  6: group({
    6.1: optionBool(false),
    6.2: optionBool(false),
    6.3: optionBool(false),
    6.4: optionBool(false),
  }, tasks4Max2Points),
  7: words('oceánu, místech, diskusích', threePoints),
  8: option("C"),
  9: option("D"),
  10: option("A"),
  11: option("A"),
  12: group({
    12.1: optionBool(true),
    12.2: optionBool(true),
    12.3: optionBool(false),
    12.4: optionBool(true),
  }, tasks4Max2Points),

  13: group({
    13.1: wordsGroup({ podmět: "příležitost", přísudek: "se naskytla" }),
    13.2: wordsGroup({ podmět: 'úroda', přísudek: 'bude menší' }),
  }),
  14: sortedOptions(['C', 'F', 'D', 'B', 'E', 'A'], threePoints),
  15: words('oblíbeným, zběhlý, sebevědomě, probrali', fourPoints),
  16: option("C"),
  17: group({
    17.1: word("provaz"),
    17.2: word("stébla"),
  }),
  18: group({
    18.1: optionBool(true),
    18.2: optionBool(false),
    18.3: optionBool(false),
    18.4: optionBool(true),
  }, tasks4Max2Points),
  19: group({
    19.1: word("malý"),
    19.2: word("raněných"),
  }),
  20: option("A"),
  21: option("A"),
  22: option("D"),
  23: option("D"),
  24: option("B"),
  25: group({
    25.1: optionBool(true),
    25.2: optionBool(true),
    25.3: optionBool(true),
    25.4: optionBool(false),
  }, tasks4Max2Points),
  26: option("B"),
  27: option("A"),
  28: option("A"),
  29: group({
    29.1: word("kategoriích"),
    29.2: word("závodícími"),
  }),
  30: group({
    30.1: option("B"),
    30.2: option("E"),
    30.3: option("A"),
  })
});
export default form
import { optionBool, group, wordsGroup, word, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, twoPoints, rootGroup, wordsGroupPattern } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'C9PAD25C0T01',
  maxPoints: 50,
  questions: {
      closed: 24,
      opened: 6
  }
}, {
  1: option("B"),
  2: option("D"),
  3: option("D"),
  4: option("D"),
  5: group({
    5.1: option('D'),
    5.2: option('A'),
    5.3: option('C'),
  }),
  6: words("domorodý,mnohočetný,bohudík", threePoints),
  7: group({
    7.1: optionBool(false),
    7.2: optionBool(true),
    7.3: optionBool(false),
    7.4: optionBool(false),
  }, tasks4Max2Points),
  8: words("zloději,příznivců,zvonaře", threePoints),
  9: option("C"),
  10: option("C"),
  11: option("A"),
  12: option("A"),
  13: group({
    13.1: optionBool(true),
    13.2: optionBool(true),
    13.3: optionBool(true),
    13.4: optionBool(true),
  }, tasks4Max2Points),
  14: group({
    14.1: word("obou"),
    14.2: word("nabízenou"),
  }),
  15: sortedOptions(['E', 'B', 'D', 'C', 'A', 'F'], threePoints),
  16: words("kamenný,zprostředkují,včelí,náramně", fourPoints),
  17: option("B"),
  18: group({
    18.1: optionBool(false),
    18.2: optionBool(true),
    18.3: optionBool(false),
    18.4: optionBool(false),
  }, tasks4Max2Points),
  19: group({
    19.1: word("příčiny"),
    19.2: word("času"),
  }),
  20: option("D"),
  21: option("C"),
  22: option("A"),
  23: option("C"),
  24: group({
    24.1: optionBool(false),
    24.2: optionBool(true),
    24.3: optionBool(true),
    24.4: optionBool(false),
  }, tasks4Max2Points),
  25: option("C"),
  26: option("B"),
  27: option("C"),
  28: option("D"),  
  29: word("vařený"),
  30: group({
    30.1: option("A"),
    30.2: option("D"),
    30.3: option("B"),
    30.4: option("E"),
  })
});

export default form;
import { optionBool, group, wordsGroup, word, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, twoPoints, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'C9PAD23C0T01',
  maxPoints: 50,
  questions: {
      closed: 24,
      opened: 6
  }
}, {
  1: option("D"),
  2: option("B"),
  3: option("C"),
  4: option("D"),
  5: option("C"),
  6: group({
    6.1: option('A'),
    6.2: option('E'),
    6.3: option('D'),
  }),
  7: group({
    7.1: word('řeč'),
    7.2: word('srovnání'),
  }),
  8: group({
    8.1: optionBool(false),
    8.2: optionBool(false),
    8.3: optionBool(false),
    8.4: optionBool(false),
  }, tasks4Max2Points),
  9: words("je,vaše", twoPoints),
  10: option("A"),
  11: option("D"),
  12: option("C"),
  13: group({
    13.1: optionBool(false),
    13.2: optionBool(true),
    13.3: optionBool(true),
    13.4: optionBool(true),
  }, tasks4Max2Points),
  14: group({
    14.1: word('zvyklému'),
    14.2: word('prožitého'),
  }),
  15: sortedOptions(['B', 'A', 'F', 'C', 'E', 'D'], threePoints),
  16: group({
    16.1: wordsGroup({ podmet: 'závan', prisudek: 'byl osvěžující' }),
    16.2: wordsGroup({ podmet: 'lidé', prisudek: 'by mohli žít' }),
  }),
  17: option("A"),
  18: words("nejvýznamnějším,spjatý,tradičně,knihomoly", fourPoints),
  19: group({
    19.1: optionBool(true),
    19.2: optionBool(true),
    19.3: optionBool(false),
    19.4: optionBool(true),
  }, tasks4Max2Points),
  20: option("A"),
  21: option("A"),
  22: option("B"),
  23: option("C"),
  24: option("B"),
  25: group({
    25.1: optionBool(true),
    25.2: optionBool(false),
    25.3: optionBool(true),
    25.4: optionBool(false),
  }, tasks4Max2Points),
  26: words("dějinách,úklidu,trhu", threePoints),
  27: option("B"),
  28: option("D"),
  29: option("C"),
  30: group({
    30.1: option("A"),
    30.2: option("D"),
    30.3: option("E"),
    30.4: option("C"),
  })
});

export default form;
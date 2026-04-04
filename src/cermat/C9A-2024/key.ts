import { optionBool, group, wordsGroup, word, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, twoPoints, rootGroup, wordsGroupPattern } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'C9PAD24C0T01',
  maxPoints: 50,
  questions: {
      closed: 24,
      opened: 6
  }
}, {
  1: option("B"),
  2: option("A"),
  3: option("C"),
  4: option("B"),
  5: group({
    5.1: option('D'),
    5.2: option('B'),
    5.3: option('C'),
  }),
  6: group({
    6.1: optionBool(true),
    6.2: optionBool(true),
    6.3: optionBool(false),
    6.4: optionBool(false),
  }, tasks4Max2Points),
  7: words("zhruba,totiž,během", threePoints),
  8: option("D"),
  9: option("D"),
  10: option("C"),
  11: option("B"),
  12: group({
    12.1: optionBool(true),
    12.2: optionBool(false),
    12.3: optionBool(true),
    12.4: optionBool(false),
  }, tasks4Max2Points),
  13: group({
    13.1: wordsGroup({ podmet: 'materiály', prisudek: 'budou vytvořeny' }),
    13.2: wordsGroupPattern({ podmet: 'bylinky, (ale i) koření', prisudek: 'dodávají' }),
  }),
  14: sortedOptions(['D', 'B', 'E', 'A', 'C', 'F'], threePoints),
  15: words("průkazku,dané,Oskarovi,my", fourPoints),
  16: option("C"),
  17: word("vítr"),
  18: group({
    18.1: optionBool(true),
    18.2: optionBool(false),
    18.3: optionBool(false),
    18.4: optionBool(false),
  }, tasks4Max2Points),
  19: option("B"),
  20: option("A"),
  21: option("A"),
  22: option("C"),
  23: option("D"),
  24: words("závislý,důrazný,podlomený", threePoints),
  25: group({
    25.1: optionBool(false),
    25.2: optionBool(true),
    25.3: optionBool(false),
    25.4: optionBool(false),
  }, tasks4Max2Points),
  26: option("A"),
  27: option("B"),
  28: option("D"),
  29: group({
    29.1: word("vyrobenými"),
    29.2: word("umístěných")
  }),
  30: group({
    30.1: option("A"),
    30.2: option("E"),
    30.3: option("C"),
    30.4: option("F"),
  })
});

export default form;
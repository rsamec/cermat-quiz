import { optionBool, group, wordsGroup, word, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, twoPoints, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'C9PAD24C0T02',
  maxPoints: 50,
  questions: {
      closed: 24,
      opened: 6
  }
}, {
  1: option("A"),
  2: option("C"),
  3: option("B"),
  4: option("D"),
  5: group({
    5.1: option('E'),
    5.2: option('B'),
    5.3: option('C'),
  }),
  6: group({
    6.1: optionBool(false),
    6.2: optionBool(true),
    6.3: optionBool(true),
    6.4: optionBool(true),
  }, tasks4Max2Points),
  7: words("sousední,pravým,nezkrotnou", threePoints),
  8: option("A"),
  9: option("D"),
  10: option("B"),
  11: option("D"),
  12: group({
    12.1: optionBool(false),
    12.2: optionBool(true),
    12.3: optionBool(true),
    12.4: optionBool(false),
  }, tasks4Max2Points),
  13: group({
    13.1: wordsGroup({ podmet: 'Někdo', prisudek: 'nechal' }),
    13.2: wordsGroup({ podmet: 'kamarádky', prisudek: 'by nedoporučily' }),
  }),
  14: sortedOptions(['F', 'E', 'B', 'D', 'A', 'C'], threePoints),
  15: words("modely,objevíte,strávit,dospělí", fourPoints),
  16: option("A"),
  17: word("hroší"),
  18: group({
    18.1: optionBool(true),
    18.2: optionBool(false),
    18.3: optionBool(false),
    18.4: optionBool(false),
  }, tasks4Max2Points),
  19: option("A"),
  20: option("B"),
  21: option("D"),
  22: option("C"),
  23: option("C"),
  24: words("příslovce,rýč,dobrman", threePoints),
  25: group({
    25.1: optionBool(false),
    25.2: optionBool(false),
    25.3: optionBool(false),
    25.4: optionBool(true),
  }, tasks4Max2Points),
  26: option("C"),
  27: option("C"),
  28: option("D"),
  29: group({
    29.1: word("vydaných"),
    29.2: word("zaslané")
  }),
  30: group({
    30.1: option("C"),
    30.2: option("D"),
    30.3: option("B"),
    30.4: option("E"),
  })
});

export default form;
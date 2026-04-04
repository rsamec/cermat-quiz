
import { optionBool, group, wordsGroup, word, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, selfEvaluateText, rootGroup, wordsGroupPattern } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'C7PAD24C0T01',
  maxPoints: 50,
  questions: {
    closed: 22,
    opened: 6
  }
}, {
  1: option("B"),
  2: option("A"),
  3: option("A"),
  4: option("D"),
  5: option("C"),
  6: group({
    6.1: option("C"),
    6.2: option("A"),
    6.3: option("E"),
  }),
  7: group({
    7.1: optionBool(true),
    7.2: optionBool(true),
    7.3: optionBool(true),
    7.4: optionBool(true),
  }, tasks4Max2Points),
  8: option("A"),
  9: option("C"),
  10: option("B"),
  11: group({
    11.1: word('lhář'),
    11.2: word('smetí'),
  }),
  12: group({
    12.1: optionBool(false),
    12.2: optionBool(true),
    12.3: optionBool(false),
    12.4: optionBool(true),
  }, tasks4Max2Points),
  13: group({
    13.1: wordsGroup({ podmet: 'autobus', prisudek: 'by nenabral' }),
    13.2: wordsGroupPattern({ podmet: 'ochota (a) schopnost', prisudek: 'patří' }),
  }),
  14: sortedOptions(['E', 'B', 'F', 'A', 'D', 'C'], threePoints),
  15: group({
    15.1: selfEvaluateText('např. Přestože naléhal, nabídku odmítla.',),
    15.2: selfEvaluateText("např. Sběr hub.")
  }),
  16: words("4,7,11", threePoints),
  17: words("nevídaný,medaili,směle,zpochybňovat", fourPoints),
  18: group({
    18.1: optionBool(false),
    18.2: optionBool(false),
    18.3: optionBool(false),
    18.4: optionBool(true),
  }, tasks4Max2Points),
  19: option("A"),
  20: option("D"),
  21: group({
    21.1: optionBool(true),
    21.2: optionBool(false),
    21.3: optionBool(false),
    21.4: optionBool(true),
  }, tasks4Max2Points),
  22: words("uprostřed,vedle,mezi", threePoints),
  23: option("C"),
  24: option("B"),
  25: group({
    25.1: optionBool(false),
    25.2: optionBool(true),
    25.3: optionBool(true),
    25.4: optionBool(false),
  }, tasks4Max2Points),
  26: option("D"),
  27: option("D"),
  28: group({
    28.1: option("C"),
    28.2: option("A"),
    28.3: option("F"),
    28.4: option("B"),
  })
});

export default form;
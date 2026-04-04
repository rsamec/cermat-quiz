
import { optionBool, group, wordsGroup, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, twoPoints, selfEvaluateText, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup({
  code: 'C7PAD23C0T01',
  maxPoints: 50,
  questions: {
      closed: 22,
      opened: 6
  }
}, {
  1: option("C"),
  2: option("A"),
  3: option("A"),
  4:selfEvaluateText(`např. Doma prohledal každý kout.`,twoPoints),
  5: group({
  5.1: option("E"),
  5.2: option("A"),
  5.3: option("B"),
  }), 
  6: option("D"),
  7: option("B"),
  8: group({
    8.1:optionBool(true),
    8.2:optionBool(true),
    8.3:optionBool(false),
    8.4:optionBool(false),
  },tasks4Max2Points),
    9: option("A"),
  10: option("D"),
  11: option("B"),
  12: option("B"),
  13: group({
  13.1: optionBool(false),
  13.2: optionBool(true),
  13.3: optionBool(false),
  13.4: optionBool(true),
  },tasks4Max2Points),
  14: group({
  14.1:wordsGroup({ podmet: 'návštěva', prisudek: 'je považována' }),
  14.2:wordsGroup({ podmet: 'ne', prisudek: 'zahřálo' }),
  }),
  15: sortedOptions(['C', 'A', 'D', 'F', 'E', 'B'], threePoints),
  16: group({
    16.1:selfEvaluateText( 'např. Učitelka informovala rodiče, že se chovám nevhodně.',),
    16.2:selfEvaluateText("např. Parkoval na místě určeném jen pro zákazníky")
  }),
  17:words("dějinách,úklidu,trhu",threePoints),
  18:words("skutečné,nerozuměl,autogramy,nejúžasnější",fourPoints),
  19: group({
  19.1: optionBool(false),
  19.2: optionBool(false),
  19.3: optionBool(false),
  19.4: optionBool(false),
  },tasks4Max2Points),
  20:option("C"),
  21:option("B"),
  22: group({
  22.1:optionBool(true),
  22.2:optionBool(true),
  22.3:optionBool(false),
  22.4:optionBool(false),
  },tasks4Max2Points),
  23:words("dějinách,úklidu,trhu",threePoints),
  24:option("D"),
  25: group({
  25.1:optionBool(true),
  25.2:optionBool(true),
  25.3:optionBool(true),
  25.4:optionBool(false),
  },tasks4Max2Points),
  26:option("B"),
  27:option("D"),
  28: group({
  28.1:option("D"),
  28.2:option("C"),
  28.3:option("A"),
  28.4:option("E"),
  })
});

export default form;
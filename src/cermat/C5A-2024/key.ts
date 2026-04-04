import { optionBool, group, match, wordsGroup, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, twoPoints, rootGroup, word } from "../../utils/quiz-builder";

const form = rootGroup(
  {
    code: 'C5PAD24C0T01',
    maxPoints: 50,
    questions: {
      closed: 22,
      opened: 6
    }
  },
  {
    1: option("C"),
    2: option("A"),
    3: option("D"),
    4: group({
      4.1: wordsGroup({ podmět: 'neděle', přísudek: 'bude patřit' }),
      4.2: wordsGroup({ podmět: 'jak učebny, tak hřiště', přísudek: 'upoutaly' }),
    }),
    5: group({
      5.1: optionBool(true),
      5.2: optionBool(false),
      5.3: optionBool(true),
      5.4: optionBool(true),
    }, tasks4Max2Points),
    6: group({
      6.1: option("E"),
      6.2: option("C"),
      6.3: option("B"),
    }),
    7: option("B"),
    8: option("C"),
    9: group({
      9.1: optionBool(true),
      9.2: optionBool(true),
      9.3: optionBool(true),
      9.4: optionBool(true),
    }, tasks4Max2Points),    
    10: option("C"),
    11: option("B"),
    12: group({
      12.1: optionBool(false),
      12.2: optionBool(false),
      12.3: optionBool(false),
      12.4: optionBool(false),
    }, tasks4Max2Points),
    13: option("C"),
    14: sortedOptions(["E", "B", "D", "C", "A", "F"], threePoints),
    15: group({
      15.1: match(/kteří budí důvěru/i),
      15.2: match(/promícháním těchto barev/i),
    }),
    16: words("4,9,13", threePoints),
    17: words('zrcadly,kroužku,zaměřil,nechyběly', fourPoints),
    18: group({
      18.1: optionBool(false),
      18.2: optionBool(true),
      18.3: optionBool(false),
      18.4: optionBool(true),
    }, tasks4Max2Points),
    19: words('jeho,té,nic', threePoints),
    20: option("A"),
    21: option("A"),
    22: option("A"),
    23: option("B"),
    24: word("Vystavili pět jeho děl.", twoPoints),
    25: group({
      25.1: optionBool(true),
      25.2: optionBool(false),
      25.3: optionBool(false),
      25.4: optionBool(true),
    }, tasks4Max2Points),
    26: option("B"),
    27: option("C"),
    28: group({
      28.1: option("C"),
      28.2: option("A"),
      28.3: option("F"),
      28.4: option("B"),
    })
  });
export default form
import { optionBool, group, selfEvaluateText, wordsGroup, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, twoPoints, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup(
  {
    code: 'C5PAD23C0T01',
    maxPoints: 50,
    questions: {
      closed: 22,
      opened: 6
    }
  },
  {
    1: option("A"),
    2: option("B"),
    3: option("B"),
    4: option("B"),
    5: group({
      5.1: optionBool(true),
      5.2: optionBool(false),
      5.3: optionBool(false),
      5.4: optionBool(true),
    }, tasks4Max2Points),
    6: group({
      6.1: option("E"),
      6.2: option("B"),
      6.3: option("D"),
    }),
    7: group({
      7.1: wordsGroup({ podmět: 'kousky', přísudek: 'se objeví' }),
      7.2: wordsGroup({ podmět: 'deště (a) záplavy', přísudek: 'zničily' }),
    }),
    8: group({
      8.1: optionBool(false),
      8.2: optionBool(false),
      8.3: optionBool(false),
      8.4: optionBool(false),
    }, tasks4Max2Points),
    9: option("D"),
    10: option("B"),
    11: option("A"),
    12: option("C"),
    13: option("A"),
    14: selfEvaluateText(`Věta musí obsahovat bezchybně zapsané slovo stát a musí splňovat tyto
  podmínky: a) výraz stát je jiným SD než ve VT; b) věta obsahuje přísudek;
  c) věta je gramaticky správná; d) věta je
  smysluplná; e) věta je pravopisně správná; f) věta obsahuje 4 slova.
  Věta, která splňovala podmínky a)–c), ale obsahovala 1 chybu
  (např. pravopisnou), byla hodnocena 1 bodem.
  V ostatních případech bylo přiděleno 0 bodů.`, twoPoints),
    15: sortedOptions(["C", "E", "B", "D", "A", "F"], threePoints),
    16: group({
      16.1: selfEvaluateText('např. Až skončí trénink, půjdeme do parku.'),
      16.2: selfEvaluateText('např. Rozhodl jsem se napsat román.'),
    }),
    17: words('čistota,důsledek,plavání', threePoints),
    18: words('vyzvídat,nerozuměl,autogramy,nejúžasnější', fourPoints),
    19: group({
      19.1: optionBool(false),
      19.2: optionBool(false),
      19.3: optionBool(false),
      19.4: optionBool(true),
    }, tasks4Max2Points),
    20: words('kukátku,plánu,náhodě', threePoints),
    21: option("D"),
    22: option("C"),
    23: group({
      23.1: optionBool(true),
      23.2: optionBool(false),
      23.3: optionBool(false),
      23.4: optionBool(true),
    }, tasks4Max2Points),
    24: option("C"),
    25: group({
      25.1: optionBool(true),
      25.2: optionBool(false),
      25.3: optionBool(false),
      25.4: optionBool(true),
    }, tasks4Max2Points),
    26: option("D"),
    27: option("A"),
    28: group({
      28.1: option("D"),
      28.2: option("C"),
      28.3: option("A"),
      28.4: option("E"),
    })
  });
export default form
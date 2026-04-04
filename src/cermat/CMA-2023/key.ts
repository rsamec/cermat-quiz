import { optionBool, group, selfEvaluateText, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, twoPoints, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup({
    code: 'CJMZD23C0T01',
    maxPoints: 50,
    questions: {
        closed: 27,
        opened: 5
    }
}, {
    1: group({
        1.1: optionBool(true),
        1.2: optionBool(false),
        1.3: optionBool(true),
        1.4: optionBool(false),
    }, tasks4Max2Points),
    2: words("příjmení,střetu,dceři", threePoints),
    3: option("B"),
    4: option("A"),
    5: option("C"),
    6: option("A"),
    7: option("B"),
    8: group({
        8.1: option("A"),
        8.2: option("E"),
        8.3: option("D"),
        8.4: option("F"),
    }),
    9: words("obrovský, nahatý", twoPoints),
    10: sortedOptions(['C', 'A', 'E', 'D', 'B',], threePoints),    
    11: option("A"),
    12: group({
        12.1: optionBool(true),
        12.2: optionBool(false),
        12.3: optionBool(false),
        12.4: optionBool(false),
    }, tasks4Max2Points),
    13: option("B"),
    14: option("A"),
    15: option("A"),
    16: option("D"),
    17: option("C"),
    18: group({
        18.1: optionBool(true),
        18.2: optionBool(false),
        18.3: optionBool(true),
        18.4: optionBool(false),
    }, tasks4Max2Points),
    19:group({
        19.1: selfEvaluateText("např. Epos o Gilgamešovi / Gilgameš"),
        19.2: selfEvaluateText("např. Homér / Homéros")
    }),

    20: option("C"),
    21: option("D"),
    22: option("D"),
    23: option("B"),
    24: group({
        24.1: optionBool(true),
        24.2: optionBool(false),
        24.3: optionBool(true),
        24.4: optionBool(true),
    }, tasks4Max2Points),
    25: option("C"),
    26: option("B"),
    27: option("D"),
    28: words("než"),
    29: group({
        29.1: option("D"),
        29.2: option("B"),
        29.3: option("E"),
    }),
    30: words("přibyly, amerických, výkonnou, čidly", fourPoints),
    31: option("D"),
    32: option("D"),

});
export default form

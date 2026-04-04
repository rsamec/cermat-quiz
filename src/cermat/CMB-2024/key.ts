import { optionBool, group, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, rootGroup, word, match, twoPoints } from "../../utils/quiz-builder";

const form = rootGroup({
    code: 'CJMZD24C0T04',
    maxPoints: 50,
    questions: {
        closed: 27,
        opened: 5
    }
}, {
    1: group({
        1.1: optionBool(false),
        1.2: optionBool(false),
        1.3: optionBool(false),
        1.4: optionBool(true),
    }, tasks4Max2Points),
    2:group ({
        2.1: word("ovlivněnou"),
        2.2: word("vedoucích")
    }),
    3: option("B"),
    4: option("A"),
    5: option("C"),
    6: group({
        6.1: option("C"),
        6.2: option("E"),
        6.3: option("D"),
    }),    
    7: group({
        7.1: optionBool(false),
        7.2: optionBool(true),
        7.3: optionBool(true),
        7.4: optionBool(true),
    }, tasks4Max2Points),
    8: word("po"),
    9: option("A"),
    10: option("A"),
    11: option("A"),
    12: sortedOptions(['B', 'A', 'E', 'C', 'D',], threePoints),
    13: option("D"),
    14: option("B"),
    15: option("A"),
    16: group({
        16.1: optionBool(false),
        16.2: optionBool(false),
        16.3: optionBool(false),
        16.4: optionBool(false),
    }, tasks4Max2Points),
    17: option("D"),
    18: option("D"),
    19: words("sušák,budík,škrabka", threePoints),
    20: group({
        20.1: optionBool(false),
        20.2: optionBool(false),
        20.3: optionBool(true),
        20.4: optionBool(false),
    }, tasks4Max2Points),   
    21: words("lidi,záda", twoPoints),
    22: option("B"),
    23: option("D"),
    24: option("B"),
    25: option("C"),
    26: option("D"),
    27: words("vzájemně,vysychání,neprospívají,ochranou", fourPoints),
    28: option("B"),
    29: option("B"),
    30: option("D"),
    31: group({
        31.1: option("F"),
        31.2: option("E"),
        31.3: option("D"),
        31.4: option("B"),
    }),
    32: option("A"),

});
export default form

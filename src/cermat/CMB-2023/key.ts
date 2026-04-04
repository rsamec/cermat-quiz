import { optionBool, group, selfEvaluateText, wordsGroup, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, twoPoints, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup({
    code: 'CJMZD23C0T04',
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
    2: words("srpnové, mezinárodní, známém", threePoints),
    3: option("A"),
    4: option("C"),
    5: option("A"),
    6: option("C"),
    7: option("A"),
    8: group({
        8.1: option("D"),
        8.2: option("E"),
        8.3: option("B"),
    }),
    9: sortedOptions(['D', 'C', 'A', 'B', 'E',], threePoints),
    10: words("sál, obrat", twoPoints),
    11: group({
        11.1: optionBool(false),
        11.2: optionBool(true),
        11.3: optionBool(false),
        11.4: optionBool(false),

    }, tasks4Max2Points),
    12: option("D"),
    13: option("B"),
    14: option("C"),
    15: option("B"),
    16: option("C"),
    17: option("D"),
    18: group({
        18.1: optionBool(true),
        18.2: optionBool(false),
        18.3: optionBool(false),
        18.4: optionBool(true),
    }, tasks4Max2Points),
    19: option("B"),
    20: option("C"),
    21: option("A"),
    22: words("oblast, ker", twoPoints),
    23: group({
        23.1: optionBool(true),
        23.2: optionBool(false),
        23.3: optionBool(false),
        23.4: optionBool(true),
    }, tasks4Max2Points),
    24: option("D"),
    25: option("A"),
    26: option("A"),
    27: option("V"),
    28: group({
        28.1: option("C"),
        28.2: option("F"),
        28.3: option("B"),
        28.4: option("D"),
    }),
    29: words("setměním, zcela, skleněných, narušily", fourPoints),
    30: option("A"),
    31: option("B"),
    32: option("B"),

});
export default form

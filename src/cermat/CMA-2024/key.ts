import { optionBool, group, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, rootGroup, word, match } from "../../utils/quiz-builder";

const form = rootGroup({
    code: 'CJMZD24C0T01',
    maxPoints: 50,
    questions: {
        closed: 27,
        opened: 5
    }
}, {
    1: group({
        1.1: optionBool(false),
        1.2: optionBool(true),
        1.3: optionBool(false),
        1.4: optionBool(false),
    }, tasks4Max2Points),
    2:group ({
        2.1: word("jelikož"),
        2.2: word("ač")
    }),
    3: option("A"),
    4: option("C"),
    5: option("C"),
    6: option("D"),
    7: option("A"),
    8: option("C"),
    9: group({
        9.1: option("A"),
        9.2: option("E"),
        9.3: option("C"),
    }),
    10: group({
        10.1: word("popsaném"),
        10.2: match(/(?:bych zapomněl|bych zapomenul)/)
    }),
    11: sortedOptions(['E', 'C', 'B', 'A', 'D',], threePoints),        
    12: group({
        12.1: optionBool(false),
        12.2: optionBool(true),
        12.3: optionBool(false),
        12.4: optionBool(false),
    }, tasks4Max2Points),
    13: words("dlaní,ženou,chováním", threePoints),
    14: option("A"),
    15: option("B"),
    16: option("B"),
    17: option("B"),
    18: option("B"),
    19: group({
        19.1: optionBool(true),
        19.2: optionBool(false),
        19.3: optionBool(false),
        19.4: optionBool(false),
    }, tasks4Max2Points),    
    20: option("A"),
    21: option("C"),
    22: option("D"),
    23: option("D"),
    24: group({
        24.1: optionBool(false),
        24.2: optionBool(true),
        24.3: optionBool(true),
        24.4: optionBool(true),
    }, tasks4Max2Points),
    25: option("A"),
    26: option("A"),
    27: option("C"),
    28: words("svý"),
    29: group({
        29.1: option("E"),
        29.2: option("C"),
        29.3: option("B"),
        29.4: option("D"),
    }),
    30: words("stezce,skromně,přemítání,poctěné", fourPoints),
    31: option("C"),
    32: option("D"),

});
export default form

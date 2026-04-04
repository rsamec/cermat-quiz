
import { optionBool, group, wordsGroup, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, twoPoints, selfEvaluateText, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup({
    code: 'C5PBD23C0T02',
    maxPoints: 50,
    questions: {
        closed: 22,
        opened: 6
    }
}, {
    1: option("B"),
    2: option("D"),
    3: option("D"),
    4: option("A"),
    5: group({
        5.1: optionBool(true),
        5.2: optionBool(false),
        5.3: optionBool(true),
        5.4: optionBool(false),
    }, tasks4Max2Points),
    6: group({
        6.1: option("C"),
        6.2: option("B"),
        6.3: option("A"),

    }),
    7: group({
        7.1: wordsGroup({ podmět: '(nejen) spolužáci, (ale i) učitelé', přísudek: 'se obávali' }),
        7.2: wordsGroup({ podmět: 'příjezd', přísudek: 'by zaskočil' }),
    }),
    8: option("A"),
    9: option("B"),
    10: group({
        10.1: optionBool(false),
        10.2: optionBool(false),
        10.3: optionBool(true),
        10.4: optionBool(false),

    }, tasks4Max2Points),
    11: option("C"),
    12: option("A"),
    13: option("C"),
    14: sortedOptions(['F', 'A', 'C', 'B', 'E', 'D'], threePoints),
    15: group({
        15.1: selfEvaluateText("např. S trenérem se sejdeme, než začne závod."),
        15.2: selfEvaluateText("např. Silnice vedoucí lesem je neprůjezdná."),

    }),
    16: words("taxi, menu, filé", threePoints),
    17: words("povinností, dědovi, holých, odměnu", fourPoints),
    18: group({
        18.1: optionBool(false),
        18.2: optionBool(false),
        18.3: optionBool(false),
        18.4: optionBool(true),
    }, tasks4Max2Points),
    19: words("součástí, jinovatkou, křídly", threePoints),
    20: option("B"),
    21: option("B"),
    22: group({
        22.1: optionBool(false),
        22.2: optionBool(false),
        22.3: optionBool(false),
        22.4: optionBool(true),

    }, tasks4Max2Points),
    23: option("D"),
    24: words("např. Muž utekl bez placení.", twoPoints),
    25: group({
        25.1: optionBool(true),
        25.2: optionBool(false),
        25.3: optionBool(true),
        25.4: optionBool(false),
    }, tasks4Max2Points),
    26: option("B"),
    27: option("B"),
    28: group({
        28.1: option("C"),
        28.2: option("D"),
        28.3: option("F"),
        28.4: option("A"),
    })
});

export default form;
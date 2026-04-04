
import { optionBool, group, wordsGroup, sortedOptions, words, option, tasks4Max2Points, threePoints, fourPoints, twoPoints, rootGroup, wordsGroupPattern } from "../../utils/quiz-builder";

const form = rootGroup({
    code: 'C9PBD23C0T02',
    maxPoints: 50,
    questions: {
        closed: 24,
        opened: 6
    }
}, {
    1: option("A"),
    2: option("B"),
    3: option("A"),
    4: option("B"),
    5: option("B"),
    6: group({
        6.1: option("C"),
        6.2: option("B"),
        6.3: option("D"),
    }),
    7: group({
        7.1: optionBool(false),
        7.2: optionBool(false),
        7.3: optionBool(false),
        7.4: optionBool(true),
    }, tasks4Max2Points),
    8: option("C"),
    9: option("A"),
    10: option("D"),
    11: words("podobu, turisty, kouzlo",threePoints),
    12: group({
        12.1: optionBool(true),
        12.2: optionBool(false),
        12.3: optionBool(true),
        12.4: optionBool(false),
    },tasks4Max2Points),
    13: group({
        13.1: words("jedlý"),
        13.2: words("obránce"),
    }),
    14: sortedOptions(['D', 'B', 'E', 'C', 'A', 'F'], threePoints),
    15: group({
        15.1: words("zaměřených"),
        15.2: words("způsobenými"),
    }),
    16: option("D"),
    17: group({
        17.1: wordsGroup({ podmět: 'zákusky', přísudek: 'byly připraveny' }),
        17.2: wordsGroupPattern({ podmět: 'větve (i) kmeny', přísudek: 'se lámaly' }),
    }),
    18: words("favoritům, hlavolamy, střežený, zločinného",fourPoints),
    19: option("D"),
    20: option("C"),
    21: group({
        21.1: optionBool(false),
        21.2: optionBool(false),
        21.3: optionBool(false),
        21.4: optionBool(false),
    },tasks4Max2Points),
    22: option("C"),
    23: option("D"),
    24: option("C"),
    25: group({
        25.1: optionBool(true),
        25.2: optionBool(false),
        25.3: optionBool(true),
        25.4: optionBool(false),
    },tasks4Max2Points),
    26: option("D"),
    27: option("A"),
    28: words("oproti, mezi",twoPoints),
    29: option("A"),
    30: group({
        30.1: option("A"),
        30.2: option("E"),
        30.3: option("C"),
        30.4: option("B"),
    })

});

export default form;
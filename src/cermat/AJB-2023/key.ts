import { optionBool, group, option, twoPoints, word, number, match, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup(
    {
        code: 'AJMZD23C0T04',
        maxPoints: 95,
        questions: {
            closed: 56,
            opened: 8
        }
    }, {
    1: group({
        1.1: option("D", twoPoints),
        1.2: option("C", twoPoints),
        1.3: option("D", twoPoints),
        1.4: option("A", twoPoints),
    }),
    2: group({
        2.5: optionBool(false),
        2.6: optionBool(true),
        2.7: optionBool(true),
        2.8: optionBool(false),
        2.9: optionBool(true),
        '2.10': optionBool(false),
        2.11: optionBool(false),
        2.12: optionBool(false),
    }),
    3: group({
        3.13: number(868, {}, twoPoints),
        3.14: word("MOYCULEN", twoPoints),
        3.15: word("brown", twoPoints),
        3.16: match(/(?:a|the) map(?:s)?/, twoPoints),
        3.17: match(/(?:a|the) concert(?:s)?/, twoPoints),
        3.18: match(/(?:a|the) sofa(?:s)?/, twoPoints),
        3.19: match(/rose(?:s)/, twoPoints),
        '3.20': match(/March (the )?3(?:rd)?|3(?:rd)? March|3\.3/, twoPoints),
    }),
    4: group({
        4.21: option("C", twoPoints),
        4.22: option("C", twoPoints),
        4.23: option("B", twoPoints),
        4.24: option("D", twoPoints),
    }),
    5: group({
        5.25: option("B", twoPoints),
        5.26: option("A", twoPoints),
        5.27: option("C", twoPoints),
        5.28: option("C", twoPoints),
        5.29: option("D", twoPoints),
    }),
    6: group({
        '6.30': optionBool(false),
        6.31: optionBool(true),
        6.32: optionBool(true),
        6.33: optionBool(true),
        6.34: optionBool(false),
        6.35: optionBool(false),
        6.36: optionBool(false),
        6.37: optionBool(true),
        6.38: optionBool(false),
        6.39: optionBool(false),
    }),
    7: group({
        '7.40': option("B", twoPoints),
        7.41: option("D", twoPoints),
        7.42: option("A", twoPoints),
        7.43: option("C", twoPoints),
        7.44: option("B", twoPoints),
    }),
    8: group({
        8.45: option("F", twoPoints),
        8.46: option("A", twoPoints),
        8.47: option("D", twoPoints),
        8.48: option("G", twoPoints),
        8.49: option("C", twoPoints),
    }),
    9: group({
        '9.50': option("A"),
        9.51: option("C"),
        9.52: option("C"),
        9.53: option("B"),
        9.54: option("B"),
        9.55: option("C"),
        9.56: option("A"),
        9.57: option("A"),
        9.58: option("B"),
        9.59: option("C"),
        '9.60': option("C"),
        9.61: option("B"),
        9.62: option("A"),
        9.63: option("B"),
        9.64: option("C"),
    }, { inline: true }),
});
export default form

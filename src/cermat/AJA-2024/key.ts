import { optionBool, group, option, twoPoints, word, match, number, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup(
    {
        code: 'AJMZD24C0K01',
        maxPoints: 100,
        questions: {
            closed: 51,
            opened: 13
        }
    },
    {
        1: group({
            1.1: option("C", twoPoints),
            1.2: option("A", twoPoints),
            1.3: option("D", twoPoints),
            1.4: option("B", twoPoints),
        }),
        2: group({
            2.5: optionBool(false),
            2.6: optionBool(true),
            2.7: optionBool(false),
            2.8: optionBool(true),
            2.9: optionBool(false),
            '2.10': optionBool(true),
            2.11: optionBool(false),
            2.12: optionBool(false),
        }),
        3: group({
            3.13: match(/(?:twice|two times|2|2 times)/, twoPoints),
            3.14: match(/(?:12th December|12.12.|12\/12)/, twoPoints),
            3.15: word("vocabulary", twoPoints),
            3.16: match(/(?:to )?record?/, twoPoints),
            3.17: number(368, {}, twoPoints),
            3.18: word("Jasey", twoPoints),
            3.19: match(/(?:grey|gray)/, twoPoints),
            '3.20': word("library", twoPoints),
        }),
        4: group({
            4.21: option("A", twoPoints),
            4.22: option("D", twoPoints),
            4.23: option("C", twoPoints),
            4.24: option("A", twoPoints),
        }),
        5: group({
            5.25: option("C", twoPoints),
            5.26: option("C", twoPoints),
            5.27: option("B", twoPoints),
            5.28: option("A", twoPoints),
            5.29: option("C", twoPoints),
        }),
        6: group({
            '6.30': optionBool(true),
            6.31: optionBool(true),
            6.32: optionBool(false),
            6.33: optionBool(true),
            6.34: optionBool(false),
            6.35: optionBool(true),
            6.36: optionBool(false),
            6.37: optionBool(true),
            6.38: optionBool(false),
            6.39: optionBool(false),
        }),
        7: group({
            '7.40': option("A", twoPoints),
            7.41: option("B", twoPoints),
            7.42: option("A", twoPoints),
            7.43: option("D", twoPoints),
            7.44: option("C", twoPoints),
        }),
        8: group({
            8.45: option("E", twoPoints),
            8.46: option("D", twoPoints),
            8.47: option("G", twoPoints),
            8.48: option("C", twoPoints),
            8.49: option("B", twoPoints),
        }),
        9: group({
            '9.50': option("A"),
            9.51: option("C"),
            9.52: option("B"),
            9.53: option("C"),
            9.54: option("B"),
            9.55: option("C"),
            9.56: option("A"),
            9.57: option("B"),
            9.58: option("C"),
            9.59: option("C"),
        }, { inline: true }),
        10: group({
            '10.60': word("from", twoPoints),
            10.61: word("are", twoPoints),
            10.62: match(/(?:who|that)/, twoPoints),
            10.63: word("in", twoPoints),
            10.64: word("forward", twoPoints),
        }, { inline: true }),
    });
export default form

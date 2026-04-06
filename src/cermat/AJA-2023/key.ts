import { optionBool, group, option, twoPoints, word, match, number, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup(
    {
        code: 'AJMZD23C0T01',
        maxPoints: 95,
        questions: {
            closed: 56,
            opened: 8
        }
    },
    {
        1: group({
            1.1: option("C", twoPoints),
            1.2: option("D", twoPoints),
            1.3: option("C", twoPoints),
            1.4: option("B", twoPoints),
        }),
        2: group({
            2.5: optionBool(true),
            2.6: optionBool(false),
            2.7: optionBool(true),
            2.8: optionBool(true),
            2.9: optionBool(false),
            '2.10': optionBool(true),
            2.11: optionBool(false),
            2.12: optionBool(false),
        }),
        3: group({
            3.13: match(/(?:a |her )?friend(?:s)?/, twoPoints),
            3.14: number(1962, {}, twoPoints),
            3.15: number(77590, {}, twoPoints),
            3.16: number(4, {}, twoPoints),
            3.17: match(/(?:a )?stone(?:s)?/, twoPoints),
            3.18: match(/(?:a |the )?(bath|bathroom)/, twoPoints),
            3.19: match(/(?:an |the )?architect/, twoPoints),
            '3.20': word("Hughes", twoPoints),
        }),
        4: group({
            4.21: option("C", twoPoints),
            4.22: option("D", twoPoints),
            4.23: option("B", twoPoints),
            4.24: option("B", twoPoints),
        }),
        5: group({
            5.25: option("D", twoPoints),
            5.26: option("A", twoPoints),
            5.27: option("A", twoPoints),
            5.28: option("C", twoPoints),
            5.29: option("B", twoPoints),
        }),
        6: group({
            '6.30': optionBool(false),
            6.31: optionBool(true),
            6.32: optionBool(true),
            6.33: optionBool(false),
            6.34: optionBool(true),
            6.35: optionBool(false),
            6.36: optionBool(false),
            6.37: optionBool(false),
            6.38: optionBool(true),
            6.39: optionBool(false),
        }),
        7: group({
            '7.40': option("A", twoPoints),
            7.41: option("A", twoPoints),
            7.42: option("C", twoPoints),
            7.43: option("B", twoPoints),
            7.44: option("D", twoPoints),
        }),
        8: group({
            8.45: option("E", twoPoints),
            8.46: option("B", twoPoints),
            8.47: option("C", twoPoints),
            8.48: option("G", twoPoints),
            8.49: option("A", twoPoints),
        }),
        9: group({
            '9.50': option("B"),
            9.51: option("C"),
            9.52: option("B"),
            9.53: option("B"),
            9.54: option("A"),
            9.55: option("A"),
            9.56: option("A"),
            9.57: option("C"),
            9.58: option("C"),
            9.59: option("A"),
            '9.60': option("B"),
            9.61: option("B"),
            9.62: option("C"),
            9.63: option("B"),
            9.64: option("C"),
        }, { inline: true }),
    });
export default form

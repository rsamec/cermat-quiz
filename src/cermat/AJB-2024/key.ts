import { optionBool, group, option, twoPoints, word, match, number, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup(
    {
        code: 'AJMZD24C0T04',
        maxPoints: 100,
        questions: {
            closed: 51,
            opened: 13
        }
    },
    {
        1: group({
            1.1: option("A", twoPoints),
            1.2: option("C", twoPoints),
            1.3: option("D", twoPoints),
            1.4: option("B", twoPoints),
        }),
        2: group({
            2.5: optionBool(false),
            2.6: optionBool(true),
            2.7: optionBool(false),
            2.8: optionBool(true),
            2.9: optionBool(true),
            '2.10': optionBool(false),
            2.11: optionBool(false),
            2.12: optionBool(false),
        }),
        3: group({
            3.13: word("GAYLE", twoPoints),
            3.14: match(/(?:the )?Moon?/, twoPoints),
            3.15: match(/(?:29th December|29.2.|29\/2)/, twoPoints),
            3.16: match(/(?:a |the )?hall?/, twoPoints),
            3.17: match(/(?:quarter past ten|10\.15|10\,15)/, twoPoints),
            3.18: match(/(?:a |the )?poster?/, twoPoints),
            3.19: match(/(?:a |the )?secretary?/, twoPoints),
            '3.20': number(8.4,{suffix:'pounds'}, twoPoints),
        }),
        4: group({
            4.21: option("C", twoPoints),
            4.22: option("D", twoPoints),
            4.23: option("B", twoPoints),
            4.24: option("C", twoPoints),
        }),
        5: group({
            5.25: option("B", twoPoints),
            5.26: option("C", twoPoints),
            5.27: option("D", twoPoints),
            5.28: option("C", twoPoints),
            5.29: option("A", twoPoints),
        }),
        6: group({
            '6.30': optionBool(false),
            6.31: optionBool(true),
            6.32: optionBool(false),
            6.33: optionBool(true),
            6.34: optionBool(true),
            6.35: optionBool(false),
            6.36: optionBool(true),
            6.37: optionBool(false),
            6.38: optionBool(true),
            6.39: optionBool(false),
        }),
        7: group({
            '7.40': option("C", twoPoints),
            7.41: option("B", twoPoints),
            7.42: option("A", twoPoints),
            7.43: option("A", twoPoints),
            7.44: option("D", twoPoints),
        }),
        8: group({
            8.45: option("D", twoPoints),
            8.46: option("E", twoPoints),
            8.47: option("B", twoPoints),
            8.48: option("A", twoPoints),
            8.49: option("G", twoPoints),
        }),
        9: group({
            '9.50': option("C"),
            9.51: option("B"),
            9.52: option("B"),
            9.53: option("B"),
            9.54: option("B"),
            9.55: option("A"),
            9.56: option("A"),
            9.57: option("A"),
            9.58: option("B"),
            9.59: option("C"),
        }, { inline: true }),
        10: group({
            '10.60': word("was", twoPoints),
            10.61: word("to", twoPoints),
            10.62: word("There", twoPoints),            
            10.63: word("then", twoPoints),
            10.64: match(/(?:work|write)/, twoPoints),
        }, { inline: true }),
    });
export default form

import { optionBool, group, option, twoPoints, word, number, match, rootGroup } from "../../utils/quiz-builder";

const form = rootGroup({
    code: 'NJMZD23C0T01',
    maxPoints: 95,
    questions: {
        closed: 56,
        opened: 8
    }
  }, {
    1: group({
        1.1: option("A", twoPoints),
        1.2: option("B", twoPoints),
        1.3: option("B", twoPoints),
        1.4: option("A", twoPoints),
    }),
    2: group({
        2.5: optionBool(true),
        2.6: optionBool(true),
        2.7: optionBool(false),
        2.8: optionBool(false),
        2.9: optionBool(false),
        '2.10': optionBool(true),
        2.11: optionBool(false),
        2.12: optionBool(false),
    }),
    3: group({
        3.13: number(1935, {}, twoPoints),
        3.14: number(10, {}, twoPoints),
        3.15: word("TAJEVU", twoPoints),
        3.16: word("15:15", twoPoints),
        3.17: match(/(?:die )?Giraffen malen/, twoPoints),
        3.18: match(/(?:ein |das )?Familienticket|Ticket/, twoPoints),
        3.19: match(/(?:eine |die )?Kanne/, twoPoints),
        '3.20': match(/(?:ein |das )?Pferd/, twoPoints),
    }),
    4: group({
        4.21: option("C", twoPoints),
        4.22: option("B", twoPoints),
        4.23: option("C", twoPoints),
        4.24: option("B", twoPoints),
    }),
    5: group({
        5.25: option("C", twoPoints),
        5.26: option("D", twoPoints),
        5.27: option("C", twoPoints),
        5.28: option("A", twoPoints),
        5.29: option("A", twoPoints),
    }),
    6: group({
        '6.30': optionBool(false),
        6.31: optionBool(false),
        6.32: optionBool(true),
        6.33: optionBool(false),
        6.34: optionBool(true),
        6.35: optionBool(false),
        6.36: optionBool(true),
        6.37: optionBool(true),
        6.38: optionBool(false),
        6.39: optionBool(true),
    }),
    7: group({
        '7.40': option("C", twoPoints),
        7.41: option("A", twoPoints),
        7.42: option("B", twoPoints),
        7.43: option("D", twoPoints),
        7.44: option("C", twoPoints),
    }),
    8: group({
        8.45: option("F", twoPoints),
        8.46: option("E", twoPoints),
        8.47: option("C", twoPoints),
        8.48: option("B", twoPoints),
        8.49: option("D", twoPoints),
    }),
    9: group({
        '9.50': option("A"),
        9.51: option("C"),
        9.52: option("B"),
        9.53: option("C"),
        9.54: option("A"),
        9.55: option("A"),
        9.56: option("A"),
        9.57: option("C"),
        9.58: option("B"),
        9.59: option("C"),
        '9.60': option("C"),
        9.61: option("A"),
        9.62: option("B"),
        9.63: option("A"),
        9.64: option("A"),
    }, { inline: true }),
});
export default form

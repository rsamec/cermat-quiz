export type JsonRegExp = { source: string, flags: string }
export type Option<T> = { name: string, value: T }
export type ComputeFunctionArgs<T> = { args: T }
export type GroupPoints<T> = { [key in keyof T]: number | undefined }

export type SumCompute = {
  kind: 'sum'
}
export type GroupCompute = ComputeFunctionArgs<{ points: number, min: number }[]> & {
  kind: 'group'
}
export type ComputeFunctionSpec = SumCompute | GroupCompute


export type ComponentFunctionArgs<T> = { args?: T }

export type MathExpressionHintType = 'fraction' | 'expression' | 'equation';

export type BooleanComponentFunctionSpec = ComponentFunctionArgs<never> & {
  kind: 'bool'
}
export type TextComponentFunctionArgs = { prefix?: string, suffix?: string, patternType?: 'ratio' };
export type TextComponentFunctionSpec = ComponentFunctionArgs<TextComponentFunctionArgs> & {
  kind: 'text'
}
export type NumberComponentFunctionArgs = { prefix?: string, suffix?: string, step?: number }
export type NumberComponentFunctionSpec = ComponentFunctionArgs<NumberComponentFunctionArgs> & {
  kind: 'number'
}
export type MathExpressionComponentFunctionArgs = { prefix?: string, suffix?: string, hintType?: MathExpressionHintType | MathExpressionHintType[], hint?: string }
export type MathExpressionComponentFunctionSpec = ComponentFunctionArgs<MathExpressionComponentFunctionArgs> & {
  kind: 'math'
}
export type LatexExpressionComponentFunctionArgs = { prefix?: string, suffix?: string, hint?: string }
export type LatexExpressionComponentFunctionSpec = ComponentFunctionArgs<LatexExpressionComponentFunctionArgs> & {
  kind: 'latex'
}

export type OptionsComponentFunctionSpec<T> = ComponentFunctionArgs<Option<T>[]> & {
  kind: 'options'
}
export type SortedOptionsComponentFunctionSpec = ComponentFunctionArgs<undefined> & {
  kind: 'sortedOptions'
}


export type ComponentFunctionSpec = BooleanComponentFunctionSpec | TextComponentFunctionSpec | NumberComponentFunctionSpec | OptionsComponentFunctionSpec<any> | MathExpressionComponentFunctionSpec | LatexExpressionComponentFunctionSpec | SortedOptionsComponentFunctionSpec

export interface AnswerInfo {
    code: string,
    maxPoints: number
    questions: {
        opened: number,
        closed: number,
    }
}
export interface AnswerGroupMetadata {
    computeBy?: ComputeFunctionSpec,
}
export function rootGroup(info: AnswerInfo, children: Record<string, any>) {
    return { children, info };
}
type additionalConfig = { points?: number }
export function group(children: Record<string, any>, metadata?: AnswerGroupMetadata) {
    return { children, metadata };
}

export function number(value: number, args?: NumberComponentFunctionArgs, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return { verifyBy: { kind: "equal", args: value }, points, inputBy: { kind: 'number', args } } as const
}

export function mathExpr(value: string | number, args: MathExpressionComponentFunctionArgs, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return { verifyBy: { kind: "equalMathExpression", args: value }, points, inputBy: { kind: 'math' as const, args } } as const
}
export function latexExpr(value: string, args: LatexExpressionComponentFunctionArgs, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return { verifyBy: { kind: "equalLatexExpression", args: value }, points, inputBy: { kind: 'latex' as const, args } } as const
}

export function mathEquation(value: string | boolean, args: MathExpressionComponentFunctionArgs, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return { verifyBy: { kind: 'equalMathEquation', args: value }, points, inputBy: { kind: 'math', args } } as const
}
export function mathRatio(value: string, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return { verifyBy: { kind: 'equalRatio', args: value }, points, inputBy: { kind: 'text', args: { patternType: 'ratio' } } } as const
}

export function text(value: string, args: TextComponentFunctionArgs, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return { verifyBy: { kind: "equal", args: value }, points, inputBy: { kind: 'text', args } } as const
}
export const noPoints = {}
export const twoPoints = { points: 2 };
export const threePoints = { points: 3 };
export const fourPoints = { points: 4 };


export const video = (id: string) => ({ resources: [{ kind: "video" as const, id }] });
export const observableCells = (cells: string[]) => ({ resources: [{ kind: "observableHQ" as const, cells }] });

export function optionBool(spravnaVolba: boolean, { points}: additionalConfig = { points: 1 }) {
    return {
        verifyBy:
            { kind: "equalOption", args: spravnaVolba },
        points,
        inputBy: {
            kind: 'bool'
        }
    } as const
}

export const tasks4Max2Points = {
    computeBy: {
        kind: 'group' as const, args: [{ points: 2, min: 4 }, { points: 1, min: 3 }]
    }
}
export const task3Max3Points = {
    computeBy: {
        kind: 'group' as const, args: [{ points: 3, min: 3 }, { points: 1, min: 2 }]
    }
}
export const task3Max4Points = {
    computeBy: {
        kind: 'group' as const, args: [{ points: 4, min: 3 }, { points: 2, min: 2 }]
    }
}
export const task3Max5Points = {
    computeBy: {
        kind: 'group' as const, args: [{ points: 5, min: 3 }, { points: 3, min: 2 }, { points: 1, min: 1 }]
    }
}
export const task3Max6Points = {
    computeBy: {
        kind: 'group' as const, args: [{ points: 2, min: 1 }, { points: 4, min: 2 }, { points: 6, min: 3 }]
    }
}

export const task2Max4Points = {
    computeBy: {
        kind: 'group' as const, args: [{ points: 4, min: 2 }, { points: 2, min: 1 }]
    }
}
export const task2Max3Points = {
    computeBy: {
        kind: 'group' as const, args: [{ points: 3, min: 2 }, { points: 2, min: 1 }]
    }
}

const points = [
    { value: 0, name: "0 bodů" }, { value: 1, name: "1 bod" }, { value: 2, name: "2 body" },
    { value: 3, name: "3 body" }, { value: 4, name: "4 body" }, { value: 5, name: "5 bodů" },
    { value: 6, name: "6 bodů" }, { value: 7, name: "7 bodů" }, { value: 8, name: "8 bodů" },
    { value: 9, name: "9 bodů" }, { value: 10, name: "10 bodů" }
]

function getPoints(max: number) {
    return points.slice(0, max + 1)
}
export function option(spravnaVolba: string, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return {
        verifyBy:
            { kind: "equalOption", args: spravnaVolba },
        points,
        inputBy: {
            kind: 'options'
        }
    } as const
}

export function word(slovo: string, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return {
        verifyBy:
            { kind: "equal", args: slovo },
        points,
                inputBy: {
            kind: 'text'
        }
    } as const
}

export function match(pattern: RegExp, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return {
        verifyBy:
        {
            kind: "match", args: {
                source: pattern.source,
                flags: pattern.flags
            }
        },
        points,
                inputBy: {
            kind: 'text'
        }
    } as const
}


export function words(slova: string, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    const items = slova.split(",").map(d => d.trim())
    return {
        verifyBy:
            { kind: "equalStringCollection", args: items },
        points,
        inputBy: items.map(() => ({
            kind: 'text' as const
        }))
    } as const
}

export function numbers(items: number[], { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return {
        verifyBy:
            { kind: "equalNumberCollection", args: items },
        points,
        inputBy: items.map(() => ({
            kind: 'number' as const
        }))
    } as const
}

export function wordsGroup(slova: { [key: string]: string }, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return {
        verifyBy: { kind: 'equal', args: slova },
        points,
        inputBy: Object.keys(slova).reduce((out: { [key: string]: ComponentFunctionSpec }, d) => {
            out[d] = { kind: 'text' as const };
            return out;
        }, {})
    } as const
}
export function wordsGroupPattern(slova: Record<string, string>, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return {
        verifyBy: {
            kind: 'matchObjectValues',
            source: slova,
            args: Object.entries(slova).reduce((out, [key, pattern]) => {
                const regex = stringPatternToRegex(pattern);
                out[key] = {
                    source: regex.source,
                    flags: regex.flags
                };
                return out;
            }, {} as Record<string, JsonRegExp>)
        },
        points,
        inputBy: Object.keys(slova).reduce((out: { [key: string]: ComponentFunctionSpec }, d) => {
            out[d] = { kind: 'text' as const };
            return out;
        }, {})
    } as const
}
export function numbersGroup(numbers: { [key: string]: number }, { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return {
        verifyBy: { kind: 'equal', args: numbers },
        points,
        inputBy: Object.keys(numbers).reduce((out: { [key: string]: ComponentFunctionSpec }, d) => {
            out[d] = { kind: 'number' as const };
            return out;
        }, {})
    } as const
}


export function sortedOptions(sortedOptions: string[], { points}: additionalConfig = { points: 1 }) {
    points = points ?? 1;
    return { verifyBy: { kind: 'equalSortedOptions', args: sortedOptions }, points, inputBy: { kind: 'sortedOptions' } } as const
}

// export function selfEvaluateImage(src: string, { points}: additionalConfig = { points: 1 }) {
//     points = points ?? 1;
//     return selfEvaluate({ kind: 'image' as const, src }, { points});
// }
// export function selfEvaluateText(content: string, { points}: additionalConfig = { points: 1 }) {
//     points = points ?? 1;
//     return selfEvaluate({ kind: 'text' as const, content }, { points});
// }
// export function selfEvaluate(hint: SelfEvaluateText | SelfEvaluateImage, { points}: additionalConfig = { points: 1 }) {
//     points = points ?? 1;
//     const options = getPoints(points ?? 1)
//     return {
//         verifyBy: { kind: 'selfEvaluate', args: { options, hint } } as SelfEvaluateValidator,
//         inputBy: { kind: 'options' as const, args: options },        
//     } as const
// }


function stringPatternToRegex(input: string) {
  const regexString = input
  .replace(/\((.*?)\)/g, "(?:$1\\s+)?") // Make parts in parentheses optional with spaces handled directly after each part
  .replace(/(?<=\?)\s/g, "") // spaces that are preceded by a question mark
  .replace(/,\s*/g, ",\\s*") // Allow optional spaces around commas
  .replace(/ /g, "\\s+")   // Require at least one space between words
  
  const regex = new RegExp(`^${regexString.trim()}$`);  // Anchor to ensure full match
  return regex;
}

import type { ISimpleCloudShape, ISimpleColor, ISimpleEllipseShape, ISimpleNoteShape, ISimpleRectangleShape } from "./schema";
import { concatString, type DeduceContext, formatPredicate, isPredicate } from "../utils/deduce-utils.js";
import { isEmptyOrWhiteSpace } from "../utils/string-utils.js";
import type { Predicate, Question } from "../components/math.js";
import { inferenceRuleWithQuestion } from "../math/math-configure.js"
import { toEquationExpr } from "../utils/math-solver.js";
import { flextree } from 'd3-flextree';
import Fraction from 'fraction.js';
import { convertToShapes, createFrame, createShapeId } from "./tldraw-utils.js";
export { createBookmarks, createFrame, createShapeId, convertToShapes } from "./tldraw-utils.js";

const defaultWidth = 250;
const defaultHeight = 200;
const defaultSpacingX = 100;
const defaultSpacingY = 50;

function createLayout(deductionTree) {
    const layout = flextree({
        nodeSize: node => [node.data?.width ?? 0, node.data?.height ?? 0],
        spacing: defaultSpacingX,
    });
    const tree = layout.hierarchy(deductionTree)
    layout(tree);
    //tree.each(node => console.log(`(${node.data?.shape?.shapeId}, ${node.x}, ${node.y})`));
    return tree;
}

type PredicateShapes = ISimpleRectangleShape | ISimpleEllipseShape;

function convertToFillColor(predicate): ISimpleColor {
    const kind = predicate?.kind?.toUpperCase()
    switch (kind) {
        case "CONT":
            return "blue";
        case "RATIO":
            return "light-green";
        case "RATIOS":
            return "light-green";
        case "COMP-RATIO":
            return "light-blue";
        case "COMP":
            return "light-blue";
        case "QUOTA":
            return "light-violet"
        case "RATE":
            return "light-violet";
        case "UNIT":
            return "light-green";
        default:
            return "grey"
    }
}

function convertKindToShape(predicate: Predicate, isConclusion: boolean): PredicateShapes {
    const kind = predicate?.kind?.toUpperCase();
    const common = {
        shapeId: createShapeId(),
        x: 0,
        y: 0,
        width: defaultWidth,
        height: defaultHeight,
        color: convertToFillColor(predicate),
        text: formatPredicate(predicate, richTextFormatting),
        fill: "tint",
        note: ""
    } as const

    if (isConclusion) {
        return {
            ...common,
            type: "rectangle",
        }
    }
    else {
        return {
            ...common,
            type: "oval",
        }
    }
}
function linearScale(domain, range) {
    const [d0, d1] = domain;
    const [r0, r1] = range;

    const scale = x => {
        const ratio = (x - d0) / (d1 - d0);
        return r0 + ratio * (r1 - r0);
    };

    scale.invert = y => {
        const ratio = (y - r0) / (r1 - r0);
        return d0 + ratio * (d1 - d0);
    };

    scale.domain = () => domain;
    scale.range = () => range;

    return scale;
}
export function deductionTreeShapes(node, title) {
    const links = []
    const shapesTree = deductionTreeToHierarchy(node, links, false, { counter: 0 });
    const layoutedTree = createLayout(shapesTree);


    const descendants = layoutedTree.descendants();
    const bounds = descendants.reduce((out, d) => {
        if (d.x > out.x.max) {
            out.x.max = d.x
        }
        if (d.x < out.x.min) {
            out.x.min = d.x
        }
        if (d.y > out.y.max) {
            out.y.max = d.y
        }
        if (d.y < out.y.min) {
            out.y.min = d.y
        }
        if (d.numChildren > out.maxChildren) {
            out.maxChildren = d.numChildren;
        }
        if (d.depth > out.maxDepth) {
            out.maxDepth = d.depth;
        }
        return out;
    },
        { maxChildren: 0, maxDepth: 0, x: { min: 0, max: 0 }, y: { min: 0, max: 0 } });

    const width = (bounds.x.max - bounds.x.min) + (bounds.maxChildren * defaultSpacingX);
    const height = (bounds.y.max - bounds.y.min) + (bounds.maxDepth * defaultSpacingY);
    const fullWidth = width + 2 * defaultWidth;
    const fullHeight = height + defaultHeight;

    const scaleX = linearScale([bounds.x.min, bounds.x.max], [0, width])
    const scaleY = linearScale([bounds.y.min, bounds.y.max], [0, height])

    const flattenShapes = descendants.map(d => ({
        ...d.data,
        x: scaleX(d.x),
        y: scaleY((bounds.y.max - bounds.y.min) - d.y),
        children: undefined
    })).concat(links);
    const final = convertToShapes(flattenShapes);

    const rootId = createShapeId();
    const root = createFrame({
        id: rootId,
        name: title,
        color: 'yellow',
        h: fullHeight,
        w: fullWidth,
    });

    return {
        width: fullWidth,
        height: fullHeight,
        data: {
            ...final,
            shapes: [].concat(root).concat(...final.shapes.map(d => ({ ...d, parentId: rootId }))),
        }
    };
}
const toText = (text: string) => {
    return text;
    //return {type: 'text', text}
}

const toStrongTextMark = (text: string) => {
    return text;
    //return {type: 'text',marks:[{type:'strong'}], text}
}
const toItalictMark = (text: string) => {
    return text;
    //return {type: 'text',marks:[{type:'strong'}], text}
}

const richTextFormatting = {
    compose: (strings: TemplateStringsArray, ...args) => concatString(strings, ...args),
    formatKind: d => d.quantity == null && d.ratio == null && d.kind != null ? toText(d.kind.toUpperCase()) : '',
    formatQuantity: d => {
        if (typeof d === "number") {
            return toText(d.toLocaleString("cs-CZ"));
        }
        else if (typeof d === "string") {
            return toText(d);
        }
        else {
            return toText(toEquationExpr(d))
        }
    },
    formatRatio: (d, asPercent) => asPercent ? toText(`${(d * 100).toLocaleString("cs-CZ")}%`) : toText(new Fraction(d).toFraction()),
    formatEntity: (d, unit) => {
        const res = [unit, d].filter(d => d != null).join(" ");
        return isEmptyOrWhiteSpace(res) ? '' : toItalictMark(res.trim());
    },
    formatAgent: d => toStrongTextMark(d),
    formatSequence: d => `${d}`
}
export function deductionTreeToHierarchy(node: { children: any[], context: DeduceContext }, links: any[], isLast: boolean, extra: { counter: number }) {

    if (isPredicate(node)) {
        return convertKindToShape(node, isLast);
    }
    const childrenShapes = []
    if (node.children && Array.isArray(node.children)) {

        for (let i = 0; i != node.children.length; i++) {
            const child = node.children[i];
            const isLastChild = i === (node.children.length - 1);
            const childShape = deductionTreeToHierarchy(child, links, isLastChild, extra);
            childrenShapes.push(childShape);
        }
    }
    const predicates = childrenShapes.slice(0, -1);
    const conclusion = childrenShapes.slice(-1)[0];

    const contextNodes = []
    if (node.context) {
        const contextNote: ISimpleNoteShape = {
            type: "note",
            shapeId: createShapeId(),
            text: node.context,
            width: defaultWidth,
            height: defaultHeight,
            x: 0,
            y: 0,
            note: '',
        };
        contextNodes.push(contextNote);
    }

    for (const predicate of predicates.concat(contextNodes)) {

        const x2 = predicate.x + predicate.width / 2;
        const y2 = predicate.y + predicate.height / 2;

        links.push({
            type: "arrow",
            shapeId: createShapeId(),
            fromId: predicate.shapeId,
            toId: conclusion.shapeId,
            x2,
            y2,
            x1: conclusion.x + conclusion.width / 2,
            y1: conclusion.y + conclusion.height / 2,
            note: ''
        })

    }

    const children = node.children.map(d => isPredicate(d) ? d : d.children.slice(-1)[0]);
    const questionRule = inferenceRuleWithQuestion(children) as Question;

    const option = questionRule?.options?.find(d => d.ok);
    const questionShapes = []
    const questionShape: ISimpleCloudShape = {
        type: "cloud",
        shapeId: createShapeId(),
        text: `${++extra.counter}. ${questionRule?.question ?? ''}`,
        x: 0,
        y: 0,
        width: defaultWidth * 2,
        height: defaultHeight,
        color: 'blue',
        fill: "semi",
        note: '',
    };
    questionShapes.push(questionShape);
    links.push({
        type: "arrow",
        shapeId: createShapeId(),
        fromId: questionShape.shapeId,
        toId: conclusion.shapeId,
        text: option != null ? `${option.tex} = ${option.result}` : '',
        x1: questionShape.x + questionShape.width / 2,
        y1: questionShape.y + questionShape.height / 2,
        x2: conclusion.x + conclusion.width / 2,
        y2: conclusion.y + conclusion.height / 2,
        note: ''
    })

    
    return {
        ...conclusion,
        children: predicates.concat(...questionShapes).concat(contextNodes)
    }
}
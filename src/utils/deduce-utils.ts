import { formatAngle, inferenceRule, nthQuadraticElements, isNumber, isQuantityPredicate, isRatioPredicate, isRatiosPredicate } from "../components/math.js"
import type { Predicate, Container, Rate, ComparisonDiff, Comparison, Quota, Transfer, Delta, EntityDef, RatioComparison, Frequency, PredicateKind } from "../components/math.js"
import { partionArray } from '../utils/common-utils.js';
import { inferenceRuleWithQuestion } from "../math/math-configure.js"
import { evaluate, substitute, toEquationExprAsTex, colors } from "./math-solver.js"
import Fraction from 'fraction.js';

type PredicateLabel = { labelKind?: 'input' | 'deduce', label?: number }

export function axiomInput<T extends Predicate>(predicate: T, label: number): T & PredicateLabel {
  return {
    ...predicate,
    ...{
      labelKind: 'input',
      label,
    }
  }
}

export function inputLbl(value: number) {
  return {
    labelKind: 'input' as const,
    label: value
  }
}

export function deduceLbl(value: number) {
  return {
    labelKind: 'deduce' as const,
    label: value
  }
}


export type Node = TreeNode | Predicate
export type TreeNode = {
  children?: Node[]
  useMapping?: boolean 
}

export type TreeNodeWithContext = { children: TreeNode, context: DeduceContext };
export type ColorContext = { colors?: Record<string, Predicate[]>, bgColors?: Record<string, Predicate[]>, autoColors?: boolean }
export type ExpressionContext = { depth?: number }
export type DeduceContext = string | (ColorContext & ExpressionContext)
export function isPredicate(node: Node): node is Predicate {
  return (node as any).kind != null
}
export function last(input: TreeNode) {
  return input.children[input.children.length - 1] as Container;
}
export function lastQuantity(input: TreeNode) {
  const lastPredicate = last(input);
  return isNumber(lastPredicate.quantity) ? lastPredicate.quantity : lastPredicate.quantity as unknown as number;
}
export function deduceAs(context: DeduceContext) {
  return (...children: Node[]) => {
    return toAs(context)(...children.concat(inferenceRule.apply(null, children.map(d => isPredicate(d) ? d : d.children.slice(-1)[0]))))
  }
}
export function deduce(...children: Node[]): TreeNode {
  return to(...children.concat(inferenceRule.apply(null, children.map(d => isPredicate(d) ? d : d.children.slice(-1)[0]))));
}
export function toAs(context: DeduceContext) {
  return (...children: Node[]) => {
    return { children, context }
  }
}
export function to(...children: Node[]): TreeNode {
  return { children: children }
}
export function toCont(child: TreeNode | Predicate, { agent, entity }: { agent: string, entity?: { entity: string, unit?: string } }): TreeNode {
  return toPredicate(child, mapToCont({ agent, entity }));
}
export function toFrequency(child: TreeNode | Predicate, { agent, entityBase, baseQuantity }: { agent: string, entityBase: { entity: string, unit?: string }, baseQuantity: number }): TreeNode {
  return toPredicate(child, mapToFrequency({ agent, entityBase, baseQuantity }));
}
export function toRate(child: RatioComparison, { agent, entity, entityBase }: { agent: string[], entity: EntityDef, entityBase: EntityDef }) {
  return to(child, {
    kind: 'rate',
    agent,
    entity,
    entityBase,
    quantity: child.ratio,
    baseQuantity: 1,
    asRatio: true
  } as Rate)
}
export function mapToCont({ agent, entity }: { agent: string, entity?: { entity: string, unit?: string } }) {
  return (node: Container | Transfer | ComparisonDiff | Comparison | Rate | Quota | Delta): Container => {
    const typeNode = node as unknown as ComparisonDiff | Comparison | Rate | Quota;
    return {
      kind: 'cont',
      agent: [agent],
      quantity: typeNode.quantity,
      entity: entity != null
        ? entity.entity
        : typeNode.kind == "quota"
          ? typeNode.agentQuota
          : typeNode.kind == "rate"
            ? typeNode.entity.entity
            : typeNode.entity,
      unit: entity != null
        ? entity.unit
        : typeNode.kind == "rate"
          ? typeNode.entity.unit
          : typeNode.kind == "quota"
            ? undefined
            : typeNode.unit
    }
  }
}
export function mapToFrequency({ agent, entityBase, baseQuantity }: { agent: string, entityBase: { entity: string, unit?: string }, baseQuantity: number }) {
  return (node: Container): Frequency => {
    return {
      kind: 'frequency',
      agent,
      quantity: node.quantity,
      baseQuantity,
      entity: {
        entity: node.entity,
        unit: node.unit,
      },
      entityBase
    }
  }
}
export function toPredicate<T extends Predicate>(node: TreeNode | T, mapFn: (node: T) => Predicate): TreeNode {
  const nodeToMap = isPredicate(node) ? node : last(node) as T;  
  const newNode = mapFn(nodeToMap);
  return { 
    children: [...(isPredicate(node) ? [node] : node.children.slice(0, -1)), newNode],    
    useMapping: true
   };
}

export function connectTo(node: any, input: TreeNode) {
  let inputState = {
    node: { children: input.children.map(d => ({ ...d })) },
    used: false
  };
  const connect = function (node: any, input: TreeNode) {
    // Base case: If the node is a leaf
    if (isPredicate(node)) {
      if (node === input.children[input.children.length - 1]) {
        const newNode = inputState.used ? inputState.node.children[inputState.node.children.length - 1] : inputState.node
        inputState.used = true;

        return newNode;
      }
      return node;
    }

    // Recursive case: Process children and calculate depth
    if (node.children && Array.isArray(node.children)) {

      let newChildren = [];
      for (const child of node.children) {
        const newChild = connect(child, input);
        newChildren.push(newChild);
      }
      node.children = newChildren;
    }
    return node;
  }
  return connect(node, input)
}


type TreeMetrics = {
  depth: number;
  width: number;
  predicates: string[]
  rules: RuleParameters[]
  formulas: string[]
};
type RuleParameters = { name: string, inputs: PredicateKind[], axioms: boolean[] }
export function computeTreeMetrics(
  node: Node,
  level = 0,
  levels: Record<number, number> = {},
  predicates: string[] = [],
  rules: RuleParameters[] = [],
  formulas: string[] = [],
  deduceMap = new Map(),
): TreeMetrics {
  // Base case: If the node is a leaf
  if (isPredicate(node)) {
    levels[level] = (levels[level] || 0) + 1; // Count nodes at this level
    if (node.kind === "eval-formula" && node.formulaName != null && !formulas.includes(node.formulaName)) {
      formulas.push(node.formulaName);
    }
    return {
      depth: level + 1,
      width: Math.max(...Object.values(levels)),
      predicates: predicates.includes(node.kind) ? predicates : predicates.concat(node.kind),
      rules,
      formulas,
    };
  }

  // Recursive case: Process children and calculate depth
  if (node.children) {
    levels[level] = (levels[level] || 0) + 1; // Count nodes at this level
    let maxDepth = level + 1;

    for (let i = 0; i != node.children.length; i++) {
      const child = node.children[i];
      const isConclusion = i === node.children.length - 1;

      if (isConclusion) {
        if (isPredicate(child) && !deduceMap.has(child)) {
          deduceMap.set(child, child)
        }
        const inputParameters = mapNodeChildrenToPredicates(node);
        const result = inferenceRuleWithQuestion(inputParameters);
        rules.push({
          name: result.name,
          inputs: inputParameters.filter(d => d != null && d.kind != null).map(d => d.kind),
          axioms: inputParameters.map(d => !deduceMap.has(d))
        })

      }

      const metrics = computeTreeMetrics(child, level + 1, levels, predicates, rules, formulas, deduceMap);
      predicates = metrics.predicates;
      maxDepth = Math.max(maxDepth, metrics.depth);
    }

    return { depth: maxDepth, width: Math.max(...Object.values(levels)), predicates, rules, formulas };
  }

  // Fallback for empty nodes
  return { depth: level, width: Math.max(...Object.values(levels)), predicates, rules, formulas };
}


export function jsonToMarkdownTree(node, level = 0, parentContext: DeduceContext) {
  const indent = "  ".repeat(level); // Two spaces for each level
  let markdown = [];

  const colorsMap = Object.entries(isObjectContext(parentContext) ? parentContext.colors ?? {} : {});
  const bgColorsMap = Object.entries(isObjectContext(parentContext) ? parentContext.bgColors ?? {} : {});

  // Add node details if they exist
  if (isPredicate(node)) {

    const textColor = isObjectContext(parentContext) ? colorsMap.find(([color, arr]) => arr.includes(node))?.[0] : null;
    const bgColor = isObjectContext(parentContext) ? bgColorsMap.find(([color, arr]) => arr.includes(node))?.[0] : null;
    const color = textColor ?? bgColor;

    markdown.push(`${indent}- ${formatPredicate(node, color != null ? colorFormattingFunc(0, color, parentContext) : mdFormattingFunc(0, parentContext))}\n`);
    return markdown;
  }


  // Process children recursively
  if (node.children && Array.isArray(node.children)) {

    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      const isConclusion = i === node.children.length - 1;
      if (isConclusion && isStringContext(node.context)) markdown.push(`${indent}- *${node.context}*\n`)
      markdown = markdown.concat(jsonToMarkdownTree(child, level + (isConclusion ? 0 : 1), mergeWithParent(node.context, parentContext)))
    }
  }


  return markdown
}
var nextId = 0;
export function jsonToMermaidMindMap(node) {
  nextId = 0;
  const result = ["mindmap\n"].concat(...jsonToMermaidMindMapEx(node, 0));
  return result;
}
function convertKindToIcon(predicate) {
  const kind = predicate?.kind?.toUpperCase()
  switch (kind) {
    case "CONT":
      return "fa fa-vector-square";
    case "RATIO":
      return "fa fa-percentage";
    case "COMP-RATIO":
      return "fa fa-compress-alt";
    case "COMP":
      return "fa fa-terminal";
    case "QUOTA":
      return "fa fa-object-ungroup";
    case "RATE":
      return "fa fa-layer-group";
    case "UNIT":
      return "fa fa-exchange-alt";
    default:
      return "fa fa-book";
  }
}

export function jsonToMermaidMindMapEx(node, isConclusion, level = 0) {
  const indent = "  ".repeat(level); // Two spaces for each level
  let markdown = [];


  // Add node details if they exist
  if (isPredicate(node)) {
    const formatedPredicat = formatPredicate(node, mermaidFormatting).trim();
    if (formatedPredicat !== "") {
      if (isConclusion) {
        markdown.push(`${indent} id${++nextId}{{"${formatedPredicat}"}}\n`);
      }
      else {
        markdown.push(`${indent} id${++nextId}))"${formatedPredicat}"((\n`);
      }
      markdown.push(`${indent} ::icon(${convertKindToIcon(node)})\n`);
    }
    return markdown;
  }


  // Process children recursively
  if (node.children && Array.isArray(node.children)) {

    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      const isConclusion = i === node.children.length - 1;
      if (isConclusion && isStringContext(node.context)) markdown.push(`${indent} id${++nextId}["${node.context}"]\n`)
      markdown = markdown.concat(jsonToMermaidMindMapEx(child, isConclusion, level + (isConclusion ? 0 : 1)))
    }
  }
  return markdown
}
export function deductionTreeToHierarchy(node: { children: any[] }, convertFn?: (node) => object) {

  if (isPredicate(node)) {
    return convertFn != null ? convertFn(node) : node;
  }
  const childrenShapes = []
  if (node.children && Array.isArray(node.children)) {

    for (let i = 0; i != node.children.length; i++) {
      const child = node.children[i];
      const childShape = deductionTreeToHierarchy(child, convertFn);
      childrenShapes.push(childShape);
    }
  }
  const predicates = childrenShapes.slice(0, -1);//map(d => convertFn != null ? convertFn(d) : d);
  const conclusion = childrenShapes.slice(-1)[0];
  return {
    ...conclusion,
    children: predicates
  }
}

export function jsonToTLDrawEx(node, isConclusion, level = 0) {
  const indent = "  ".repeat(level); // Two spaces for each level
  let markdown = [];


  // Add node details if they exist
  if (isPredicate(node)) {
    const formatedPredicat = formatPredicate(node, mermaidFormatting).trim();
    if (formatedPredicat !== "") {
      if (isConclusion) {
        markdown.push(`${indent} id${++nextId}{{"${formatedPredicat}"}}\n`);
      }
      else {
        markdown.push(`${indent} id${++nextId}))"${formatedPredicat}"((\n`);
      }
      markdown.push(`${indent} ::icon(${convertKindToIcon(node)})\n`);
    }
    return markdown;
  }


  // Process children recursively
  if (node.children && Array.isArray(node.children)) {

    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      const isConclusion = i === node.children.length - 1;
      if (isConclusion && isStringContext(node.context)) markdown.push(`${indent} id${++nextId}["${node.context}"]\n`)
      markdown = markdown.concat(jsonToMermaidMindMapEx(child, isConclusion, level + (isConclusion ? 0 : 1)))
    }
  }
  return markdown
}



export function jsonToMarkdownChat(node, { predicates, rules, formulas }: { predicates: string[], rules: string[], formulas: string[] } = { predicates: [], rules: [], formulas: [] }) {

  const flatStructure = [];
  function traverseEx(node) {
    const args = []
    // Add node details if they exist
    if (isPredicate(node)) {
      //return formatPredicate(node,chatFormatting);
      return node;
    }

    let q = null
    // Process children recursively
    if (node.children && Array.isArray(node.children)) {

      if (node.context != null) {
        if (isStringContext(node.context)) {
          flatStructure.push('\n');
          flatStructure.push(`Kontext: *${node.context}*\n\n`)
        }
      }

      for (let i = 0; i != node.children.length; i++) {
        const child = node.children[i];
        const isConclusion = i === node.children.length - 1;

        if (isConclusion) {
          const result = inferenceRuleWithQuestion(mapNodeChildrenToPredicates(node));
          q = result;
        }
        else {
          q = null;
        }
        const res = traverseEx(child);
        args.push(res)

      }
      // Add a group containing the parent and its children
      const arr = normalizeToArray(args).map(d => {
        return Array.isArray(d) ? d[d.length - 1] : d
      });



      const premises = arr.slice(0, -1);
      //const questions = premises.filter(d => d?.result != null)
      const conclusion = arr[arr.length - 1];

      const answer = q?.options?.find(d => d.ok)
      const [predicatesArr, other] = partionArray(premises, d => isPredicate(d));
      const body = predicatesArr.map(d => {
        return predicates.includes(d.kind) || (d.kind == "eval-formula" && formulas.includes(d.formulaName))
          ? `==${formatPredicate(d, chatFormattingFunc(0))}==`
          : formatPredicate(d, chatFormattingFunc(0))
      }).filter(d => !isEmptyOrWhiteSpace(d)).map(d => `- ${d}`).join("\n");

      const stepContext = '';

      flatStructure.push((q != null
        ? `${stepContext}${rules.includes(q.name) ? `==${q.question.trim()}==` : q.question}\n${body}\n\n` + (answer != null
          ? `${rules.includes(q.name) ? '==Výpočet==' : 'Výpočet'}: ${answer.tex} = ${answer.result}`
          : '')
        : `${stepContext}${body}`) + '\n\n' + `${rules.includes(q?.name) ? '==Závěr==' : 'Závěr'}:${predicates.includes(conclusion.kind)
          ? `==${formatPredicate(conclusion, chatFormattingFunc(1))}==`
          : formatPredicate(conclusion, chatFormattingFunc(1))}` + "\n\n");
    }

    return args
  }
  traverseEx(node)
  return flatStructure;

}
function isEmptyOrWhiteSpace(value: string | undefined) {
  return value == null || (typeof value === 'string' && value.trim() === '');
};

export function mapNodeChildrenToPredicates(node: TreeNode): Predicate[] {
  return node.children.map(d => isPredicate(d) ? d : d.children.slice(-1)[0] as Predicate);
}


const mdFormattingFunc = (defaultExpressionDepth: number, context: DeduceContext = null) => ({
  compose: (strings: TemplateStringsArray, ...args) => concatString(strings, ...args),
  formatKind: d => `[${d.kind.toUpperCase()}]`,
  formatQuantity: d => {
    if (typeof d === "number") {
      return d.toLocaleString("cs-CZ");
    }
    else if (d?.expression != null) {
      return toEquationExprAsTex(d, isObjectContext(context) ? (context.depth ?? defaultExpressionDepth) : defaultExpressionDepth, isObjectContext(context) ? context : null);
    }
    else if (typeof d === "string") {
      return d;
    }
    else {
      return d;
    }
  },
  formatRatio: (d, asPercent) => {
    if (typeof d === "number") {
      return asPercent ? `${(d * 100).toLocaleString("cs-CZ")}%` : new Fraction(d).toFraction();
    }
    else if (d?.expression != null) {
      const colorContext = isObjectContext(context) ? context : null;
      const requiredLevel = isObjectContext(context) ? (context.depth ?? defaultExpressionDepth) : defaultExpressionDepth;
      return asPercent
        ? toEquationExprAsTex({ ...d, expression: `(${d.expression}) * 100` }, requiredLevel, colorContext)
        : toEquationExprAsTex(d, requiredLevel, colorContext)
    }
    else if (typeof d === "string") {
      return d;
    }
    else {
      return d;
    }
  },
  formatEntity: (d, unit) => {
    const res = [unit, d].filter(d => d != null).join(" ");
    return isEmptyOrWhiteSpace(res) ? '' : `__${res.trim()}__`;
  },
  formatAgent: d => `**${Array.isArray(d) ? d.join(): d}**`,
  formatSequence: d => `${formatSequence(d)}`,
  formatTable: (data: (string | number)[][]) => `vzor opakování ${data.map(d => d[1]).join()}`
})
const mdFormatting = mdFormattingFunc(0)
const chatFormattingFunc = (defaultExpressionDepth: number) => ({
  ...mdFormattingFunc(defaultExpressionDepth),
  formatTable: d => `vzor opakování \n\n${mdFormatTable(d)}`
})
const colorFormattingFunc = (defaultExpressionDepth: number, color: string, context: DeduceContext) => ({
  ...mdFormattingFunc(defaultExpressionDepth, context),
  formatAgent: (d) => `{${color}}(**${d}**)`,
})
export function mdFormatTable(data: (string | number)[][]) {
  if (!Array.isArray(data) || data.length === 0) return "";

  // First row is header
  const header: (string | number)[] = data[0].map(d => "");
  const rows: (string | number)[][] = data;

  // Build header row
  let markdown = "| " + header.join(" | ") + " |\n";

  // Build separator row
  markdown += "| " + header.map(() => "---").join(" | ") + " |\n";

  // Build data rows
  for (const row of rows) {
    markdown += "| " + row.join(" | ") + " |\n";
  }

  return markdown;
}
const mermaidFormatting = {
  ...mdFormatting,
  formatKind: d => ``,
}

function formatSequence(type) {
  const simplify = (d, op = '') => d !== 1 ? `${d}${op}` : ''

  if (type.kind === "arithmetic")
    return `${type.sequence.join()} => a^n^ = ${type.sequence[0]} + ${type.commonDifference}(n-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements(first, second, type.secondDifference);
    const parts = [`${simplify(A)}n^2^`];
    if (B !== 0) {
      parts.concat(`${simplify(B)}n`)
    }
    if (C !== 0) {
      parts.concat(`${simplify(C)}n`)
    }
    return `${type.sequence.join()} => a^n^ = ${parts.map((d, i) => `${i !== 0 ? ' + ' : ''}${d}`)}`;
  }
  if (type.kind === "geometric") {
    return `${type.sequence.join()} => a^n^ = ${simplify(type.sequence[0], '*')}${type.commonRatio}^(n-1)^`;
  }
}

export function formatPredicate(d: Predicate, formatting: any) {
  const { formatKind, formatAgent, formatEntity, formatQuantity, formatRatio, formatSequence, formatTable, compose } = { ...mdFormatting, ...formatting }
  if ((isQuantityPredicate(d) && d.quantity == null) ||
    (isRatioPredicate(d) && d.ratio == null) ||
    (isRatiosPredicate(d) && d.ratios == null)) {
    return formatKind(d);
  }

  let result = ''
  switch (d.kind) {
    case "cont":
      result = compose`${formatAgent(d.agent)}=${d.asRatio ? formatRatio(d.quantity) : formatQuantity(d.quantity)}${d.entity != "" ? " " : ""}${formatEntity(d.entity, d.unit)}`;
      break;
    case "frequency":
      result = compose`${formatAgent(d.agent)}=${formatQuantity(d.quantity)} ${formatEntity(d.entity.entity, d.entity.unit)} po ${formatQuantity(d.baseQuantity)}${d.entityBase.entity != "" ? " " : ""}${formatEntity(d.entityBase.entity, d.entityBase.unit)}`;
      break;

    case "comp":
      if (isNumber(d.quantity)) {
        result = d.quantity === 0
          ? compose`${formatAgent(d.agentA)} je rovno ${formatAgent(d.agentB)}`
          : compose`${formatAgent(d.agentA)} ${d.quantity > 0 ? 'více' : 'méně'} než ${formatAgent(d.agentB)} o ${formatQuantity(Math.abs(d.quantity))}${d.entity != "" ? " " : ""}${formatEntity(d.entity, d.unit)}`
      }
      else {
        result = compose`rozdíl o ${formatQuantity(d.quantity)} ${formatEntity(d.entity, d.unit)} mezi ${formatAgent(d.agentA)} a ${formatAgent(d.agentB)}`
      }
      break;
    case "transfer":
      if (isNumber(d.quantity)) {
        result = d.quantity === 0
          ? compose`${formatAgent(d.agentReceiver.name)} je rovno ${formatAgent(d.agentSender.name)}`
          : d.agentReceiver === d.agentSender
            ? compose`změna o ${formatQuantity(d.quantity)} ${formatEntity(d.entity, d.unit)} mezi ${formatAgent(d.agentSender.nameBefore)} a ${formatAgent(d.agentSender.nameAfter)}`
            : compose`${formatQuantity(Math.abs(d.quantity))} ${formatEntity(d.entity, d.unit)}, ${formatAgent(d.quantity > 0 ? d.agentSender.name : d.agentReceiver.name)} => ${formatAgent(d.quantity > 0 ? d.agentReceiver.name : d.agentSender.name)}`
      }
      else {
        result = d.agentReceiver === d.agentSender
          ? compose`změna o ${formatQuantity(d.quantity)} ${formatEntity(d.entity, d.unit)} mezi ${formatAgent(d.agentSender.nameBefore)} a ${formatAgent(d.agentSender.nameAfter)}`
          : compose`transfer o ${formatQuantity(d.quantity)} ${formatEntity(d.entity, d.unit)} mezi ${formatAgent(d.agentSender.name)} a ${formatAgent(d.agentReceiver.name)}`
      }
      break;
    case "delta":
      result = d.quantity === 0
        ? compose`${formatAgent(d.agent.nameBefore ?? d.agent.name)} je rovno ${formatAgent(d.agent.nameAfter ?? d.agent.name)}`
        : compose`změna o ${formatQuantity(d.quantity)} ${formatEntity(d.entity, d.unit)} mezi ${formatAgent(d.agent.nameBefore ?? d.agent.name)} a ${formatAgent(d.agent.nameAfter ?? d.agent.name)}`;
      break;
    case "comp-ratio":
      if (isNumber(d.ratio)) {
        const between = (d.ratio > 1 / 2 && d.ratio < 2);
        result = between || d.asPercent
          ? compose`${formatAgent(d.agentA)} ${d.ratio < 1 ? 'méně' : 'více'} o ${formatRatio(d.ratio > 1 ? d.ratio - 1 : 1 - d.ratio, d.asPercent)} než ${formatAgent(d.agentB)}`
          : compose`${formatAgent(d.agentA)} ${formatRatio(d.ratio > 1 ? Math.abs(d.ratio) : 1 / Math.abs(d.ratio), false)} krát ${d.ratio > 1 ? 'více' : 'méně'} než ${formatAgent(d.agentB)}`
      }
      else {
        result = compose`poměr ${formatQuantity(d.ratio)} mezi ${formatAgent(d.agentA)} a ${formatAgent(d.agentB)}`
      }
      break;
    case "comp-diff":
      result = compose`${formatAgent(d.agentMinuend)} - ${formatAgent(d.agentSubtrahend)}=${formatQuantity(d.quantity)}${d.entity != "" ? " " : ""}${formatEntity(d.entity, d.unit)}`
      break;
    case "ratio":
      result = compose`${formatAgent(d.part)} z ${formatAgent(d.whole)}=${formatRatio(d.ratio, d.asPercent)}`;
      break;
    case "ratios":
      result = compose`${formatAgent(d.whole)} ${joinArray(d.parts?.map(d => formatAgent(d)), ":")} v poměru ${joinArray(d.ratios?.map(d => formatQuantity(d)), ":")}`;
      break;
    case "sum":
    case "sum-combine":
      result = compose`${formatKind(d)} ${joinArray(d.partAgents?.map(d => formatAgent(d)), " + ")}`;
      break;
    case "product":
    case "product-combine":
      result = compose`${formatKind(d)} ${joinArray(d.partAgents?.map(d => formatAgent(d)), " * ")}`;
      break;
    case "rate":
      result = compose`${formatAgent(d.agent)} ${d.asRatio ? formatRatio(d.quantity) : formatQuantity(d.quantity)} ${formatEntity(d.entity.entity, d.entity.unit)} per ${isNumber(d.baseQuantity) && d.baseQuantity == 1 ? '' : formatQuantity(d.baseQuantity)}${d.entityBase.entity != "" ? " " : ""}${formatEntity(d.entityBase.entity, d.entityBase.unit)}`
      break;
    case "quota":
      result = compose`${formatAgent(d.agent)} rozděleno na ${formatQuantity(d.quantity)} ${formatAgent(d.agentQuota)} ${ isNumber(d.restQuantity) && d.restQuantity !== 0 ? ` se zbytkem ${formatQuantity(d.restQuantity)}` : ''}`
      break;
    case "sequence":
      result = compose`${d.type != null ? formatSequence(d.type) : ''}`
      break;
    case "pattern":
      result = compose`${formatTable(
        [...[1, 2, 3, 4, 5]
          .map(pos => [pos, evaluate(d.nthTerm, { n: pos }), d.nthTermFormat != null ? d.nthTermFormat(pos) : substitute(d.nthTerm, "n", pos.toString())])
          , ["...", "...", "..."]
        ])
        }`
      break;
    case "nth-part":
      result = compose`${formatAgent(d.agent)}`;
      break;
    case "nth":
      result = compose`${formatEntity(d.entity)}`;
      break;
    case "unit":
      result = compose`převod na ${d.unit}`;
      break;
    case "proportion":
      result = compose`${d.inverse ? "nepřímá" : "přímá"} úměra mezi ${d.entities.join(' a ')}`;
      break;
    case "common-sense":
      result = compose`${d.description}`
      break;
    case "comp-angle":
      result = compose`${formatAngle(d.relationship)}`
      break;
    case "eval-expr":
    case "eval-formula":
      const { predicate, expression } = d;
      result = predicate.kind === "cont"
        ? compose`${formatAgent(predicate.agent)} = [${expression}]${predicate.entity != "" ? " " : ""}${formatEntity(predicate.entity, predicate.unit)}`
        : predicate.kind === "rate"
          ? compose`${formatAgent(predicate.agent)} [${expression}]${predicate.entity.entity != "" ? " " : ""}${formatEntity(predicate.entity.entity, predicate.entity.unit)} per ${isNumber(predicate.baseQuantity) && predicate.baseQuantity == 1
            ? ''
            : formatQuantity(predicate.baseQuantity)}${predicate.entityBase.entity != "" ? " " : ""}${formatEntity(predicate.entityBase.entity, predicate.entityBase.unit)}`
          : compose`${expression}`
      break;

    case "simplify-expr":
      result = compose`substituce za ${JSON.stringify(d.context)}`
      break;
    case "tuple":
      result = d.items != null ? compose`${joinArray(d.items.map(d => formatPredicate(d, formatting)), ", ")}` : formatKind(d)
      break;
    case "eval-option":
      result = d.value === undefined
        ? compose`${d.optionValue != null ? `Volba [${d.optionValue}]: ${d.expectedValue != null ? (d.expectedValueOptions?.asFraction ? formatRatio(d.expectedValue) : formatQuantity(d.expectedValue)) : d.expressionNice}` : d.expressionNice}`
        : compose`${d.value === true ? "Pravda" : d.value === false ? "Nepravda" : d.value != null ? `Volba [${d.value}]` : 'N/A'}`
      break;
    default:
      result = formatKind(d);
      break;
  }
  return compose`${result}`;
}

function joinArray(arr: string[], sep: string) {
  return arr?.flatMap((d, index) =>
    index < arr.length - 1 ? [d, sep] : [d]
  )
}

export function highlight(strings, ...substitutions) {

  const formattedString = strings.reduce((acc, curr, i) => {
    const substitution = substitutions[i];

    const res = substitution && typeof substitution === "function"
      ? `${curr}${substitution(concatString)}`
      : substitution
        ? `${curr}*${substitution}*`
        : `${curr}`;
    return `${acc}${res}`;
  }, '');

  return formattedString;
}

export function concatString(strings, ...substitutions) {
  const formattedString = strings.reduce((acc, curr, i) => {
    const substitution = substitutions[i];

    const res = substitution
      ? `${curr}${Array.isArray(substitution) ? substitution.join("") : substitution}`
      : curr;
    return `${acc}${res}`;
  }, '');

  return formattedString;
}


export type DeduceTemplate = (strings: TemplateStringsArray, ...substitutions: (number | string | Function)[]) => any

function normalizeToArray(d: any | any[]) {
  return Array.isArray(d) ? d : [d]
}

export function wordProblemGroupById(
  wordProblem: Record<string, { deductionTree: any }>,
  map = ([key, value]) => ({
    key,
    deductionTrees: [`Řešení ${key}`, value.deductionTree]
  })) {

  const deductionTrees = Object.entries(wordProblem).reduce((out, [key, value], index) => {
    out.push(map([key, value]));
    return out;
  }, []);

  return Object.groupBy(deductionTrees, ({ key }) => parseInt(key.split(".")[0]));
}


export function generateAIMessages({ template, deductionTrees }: { template, deductionTrees: [string, TreeNode][] }) {

  const alternateMessage = `
Zadání úlohy je 

${template}

Řešení úlohy je popsáno heslovitě po jednotlivých krocích. Správný výsledek je uveden jako poslední krok.
Jednotlivé kroky jsou odděleny horizontální čárou. Podúlohy jsou odděleny dvojitou horizontální čárou.


${deductionTrees.map(([title, deductionTree]) => `${title} \n\n ${jsonToMarkdownChat(deductionTree).join("\n---\n")}`).join("\n---\n---\n")}`


  const steps = `${alternateMessage}
Můžeš vysvětlit podrobné řešení krok po kroku v češtině. Vysvětluj ve stejných krocích jako je uvedeno v heslovitém řešení.`

  const keyPointsAndSteps = `${alternateMessage}
  Můžeš vysvětlit podrobné řešení krok po kroku v češtině. Vysvětluj ve stejných krocích jako je uvedeno v heslovitém řešení.
  Na začátku stručně představit koncept nebo strategii řešení, resp. 1 až maximálně 3 nejdůležitější myšlenky důležité k pochopení proč se jednotlivé kroky řešení dělají.
.`

  const vizualizeSolution = `${alternateMessage}
Můžeš vytvořit vizualizaci, která popisuje situaci, resp. řešení ve formě obrázku. Např. ve formě přehledné infografiky.`

  const generateMoreQuizes = `${alternateMessage}
Můžeš vymyslet novou úlohu v jiné doméně, která půjde řešit stejným postupem řešení 
- změnit agent - identifikovány pomocí markdown bold **
- změna entit - identifikace pomocí markdown bold __
- změnu parametry úlohy - identifikovány pomocí italic *

Změn agenty, entity a parametry úlohy tak aby byly z jiné, pokud možno netradiční domény.
Použij jiné vstupní parametry tak, aby výsledek byl jiná hodnota, která je možná a pravděpodobná v reálném světě.
Vygeneruj 3 různé úlohy v češtině. Nevracej způsob řešení, kroky řešení.
`

  const generalization = `${alternateMessage}
Můžeš vymyslet nové úlohu v jiné doméně, která půjde řešit stejným postupem řešení 
- změnit agent - identifikovány pomocí markdown bold **
- změna entit - identifikace pomocí markdown bold __
- změnu parametry úlohy - identifikovány pomocí italic *

Nad těmito úlohami provést systematickou generalizaci všech prvků (agenty, entity a číselné údaje),které jsou v těchto úlohách společné.
Vytořit abstraktní pojmenování a strukturu, která může sloužit jako univerzální rámec pro tvorbu dalších úloh podobného typu.
Nevracej konkrétní úlohy, ale jen generalizovaný rámec.
`

  const generateSubQuizes = `${alternateMessage}
Můžeš vytvořit pracovní list, který by obsahoval vhodné podúlohy, které jsou vhodné pro řešení stávající úlohy.
`
  const generateImportantPoints = `${alternateMessage}
Můžeš analyzovat úlohu a řešení úlohy a najít hlavní myšlenku, která vede k řešení stávající úlohy.
Uveď 1 až maximálně 3 nejdůležitější myšlenky, triky důležité k pochopení řešení úlohy.
`
  const vizualizeImportantPoints = `${alternateMessage}
Můžeš analyzovat úlohu a řešení úlohy a najít hlavní myšlenku, která vede k řešení stávající úlohy.
Dle složitosti úlohy vymysli 1 až maximálně 3 nejdůležitější myšlenky, triky důležité k pochopení řešení úlohy.
Vizualizuj vhodně tyto myšlenky do obrázku pomocí infografiky s vhodnými grafickými prvky.
`

  const realWorldExamples = `${alternateMessage}
Vysvětli studentovi, proč dáva smysl řešit výše uvedenou konkrétní úloha. Smyslem je zde hlavně propojení teorie s reálným světem a ukázání, proč je smysluplné se je učit.
Uveď 2 až 3 konkrétní příklady z reálného světa, kde se tento koncept běžně uplatňuje nebo vyskytuje.`

  return {
    vizualizeSolution,
    generateMoreQuizes,
    generateSubQuizes,
    generalization,
    generateImportantPoints,
    vizualizeImportantPoints,
    realWorldExamples,
    "key-points": generateImportantPoints,
    "working-sheet": generateSubQuizes,
    "more-quizes": generateMoreQuizes,
    steps,
    keyPointsAndSteps,
  }
}
type ThunkMap<T> = {
  [K in keyof T]: () => T[K];
};

export function createLazyMap<T>(thunks: ThunkMap<T>): T {
  const lazyMap = {} as T;


  for (const key in thunks) {
    Object.defineProperty(lazyMap, key, {
      get() {
        try {
          return thunks[key]();
        } catch (error) {
          console.error(`Error in "${key}":`, error);
          throw error;
        }
      },
      configurable: true,
      enumerable: true,
    });
  }

  return lazyMap;
}

export const anglesNames = {
  alpha: '𝛼',
  beta: '𝛽',
  gamma: '𝛾',
  delta: '𝛿',
  theta: '𝜃',
  lambda: '𝜆',
  omega: '𝜔',
  phi: '𝜑',
}

export function isStringContext(context: DeduceContext): context is string {
  return typeof context === "string";
}
function isObjectContext(context: DeduceContext): context is (ColorContext & ExpressionContext) {
  return context != null && typeof context === "object";
}
function mergeWithParent(context: DeduceContext, parentContext: DeduceContext): DeduceContext {
  if (context == null) return parentContext;
  if (isObjectContext(context) && isObjectContext(parentContext)) return { ...context, ...parentContext };
  return context
}

export function extractAxiomsFromTree(node, deduceMap = new Map()) {
  let result = [];

  // Add node details if they exist
  if (isPredicate(node) && !deduceMap.has(node)) {
    deduceMap.set(node, node)
    return [node]
  }

  // Process children recursively
  if (node.children && Array.isArray(node.children)) {
    for (let i = 0; i != node.children.length; i++) {
      const child = node.children[i];
      const isConclusion = i === node.children.length - 1;
      if (isConclusion && isPredicate(child) && !deduceMap.has(child)) {
        deduceMap.set(child, child)
      }

      result = result.concat(extractAxiomsFromTree(child, deduceMap))

    }
  }

  return result;
}

export function getStepsFromTree(tree) {
  const result = [];

  function traverse(node) {

    if (!node.children || node.children.length === 0) {
      return isPredicate(node) ? [node] : [];
    }
    else {
      // Node has children, continue traversal
      let items = [];
      for (let i = 0; i != node.children.length; i++) {
        const child = node.children[i];
        const isConclusion = i === node.children.length - 1;
        // if (isConclusion && isPredicate(child)) {
        //   // Skip conclusion predicates
        //   continue;
        // }
        items = items.concat(traverse(child));
      }
      const [premises, conclusion] = [items.slice(0, -1), items.slice(-1)[0]];
      result.push([premises, conclusion])
      return conclusion;
    }
  }
  traverse(tree);
  return result;
}

function isColorifyPredicate(d) {
  return isQuantityPredicate(d) || isRatioPredicate(d);
}
export function colorifyDeduceTree(originalTree, { maxDepth, axioms, deductions }: { maxDepth?: number, axioms?: boolean, deductions?: boolean } = { maxDepth: 2, axioms: true, deductions: false }) {
  let counter = 0;
  //const tree = JSON.parse(JSON.stringify(originalTree));
  const tree = originalTree;
  const colorKeys = Object.keys(colors);
  const deduceMap = new Map();
  const colorsMap = new Map();
  function traverse(node) {

    if (!node.children || node.children.length === 0) {
      if (isPredicate(node)) {
        const newPredicate = (isQuantityPredicate(node) && isNumber(node.quantity))
          ? Object.assign(node, { quantity: node.quantity.toString() })
          : isRatioPredicate(node) && isNumber(node.ratio)
            ? Object.assign(node, { ratio: false ? node.ratio.toString() : `${new Fraction(node.ratio).toFraction()}` })
            : node;
        return [newPredicate];
      }
      else {
        return [];
      }
    }
    // Node has children, continue traversal
    let items = [];
    for (let i = 0; i != node.children.length; i++) {
      const child = node.children[i];
      const isConclusion = i === node.children.length - 1;
      if (isConclusion) continue;
      items = items.concat(traverse(child));
    }
    const premises = items;


    const conclusion = node.useMapping ? node : node.context != null ? deduceAs(node.context)(...premises) : deduce(...premises)
    
    const lastPredicate = last(conclusion);
    deduceMap.set(node.children[node.children.length - 1], lastPredicate);

    if (!colorsMap.has(lastPredicate)) {
      colorsMap.set(lastPredicate, { bgColor: colorKeys[(counter++) % colorKeys.length] });
    }
    for (let i = 0; i != premises.length; i++) {
      if (!colorsMap.has(premises[i]) && isPredicate(premises[i]) && isColorifyPredicate(premises[i])) {
        if (deduceMap.has(premises[i])) {
          const correspondingColor = colorsMap.get(deduceMap.get(premises[i]))?.bgColor;
          if (correspondingColor != null) {
            colorsMap.set(premises[i], { color: correspondingColor });
          }
        }
        else {
          colorsMap.set(premises[i], { color: colorKeys[(counter++) % colorKeys.length] });
        }

      }
    }
    return conclusion;
  }

  const result = traverse(tree) as unknown as TreeNodeWithContext;
  result.context = {
    depth: maxDepth ?? tree.context?.depth ?? 2,
    ...(axioms ? tree.context?.colors ?? {
      colors: [...colorsMap.entries()].reduce((out, [predicate, d], index) => {
        if (d.color == null) return out;
        out[d.color] = out[d.color] ? out[d.color].concat([predicate]) : [predicate];
        return out;
      }, {})
    } : {}),
    ...(deductions ? tree.context?.bgColors ?? {
      bgColors: [...colorsMap.entries()].reduce((out, [predicate, d], index) => {
        if (d.bgColor == null) return out;
        out[d.bgColor] = out[d.bgColor] ? out[d.bgColor].concat([predicate]) : [predicate];
        return out;
      }, {})
    } : {}),
  }
  return { deductionTree: result, colorsMap }
}

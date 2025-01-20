import { inferenceRule } from "../components/math.js"
import type { Predicate, Container } from "../components/math.js"

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
}
export function isPredicate(node: Node): node is Predicate {
  return (node as any).kind != null
}
export function last(input: TreeNode) {
  return input.children[input.children.length - 1] as Container;
}
export function deduce(...children: Node[]): TreeNode {
  return to(...children.concat(inferenceRule.apply(null, children.map(d => isPredicate(d) ? d : d.children.slice(-1)[0]))));
}
export function to(...children: Node[]): TreeNode {
  return { children: children }
}

export function connectTo(node: any, input: TreeNode) {  
  let inputState = {
    node: { children: input.children.map(d => ({ ...d}))},
    used: false
  };
  const connect = function (node: any, input: TreeNode) {
    // Base case: If the node is a leaf
    if (isPredicate(node)) {
      if (node === input.children[input.children.length - 1]) {
        const newNode = inputState.used ? inputState.node.children[inputState.node.children.length - 1]: inputState.node
        inputState.used = true;
        
        return  newNode;
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
};

export function computeTreeMetrics(
  node: Node,
  level = 0,
  levels: Record<number, number> = {}
): TreeMetrics {
  // Base case: If the node is a leaf
  if (isPredicate(node)) {
    levels[level] = (levels[level] || 0) + 1; // Count nodes at this level
    return { depth: level + 1, width: Math.max(...Object.values(levels)) };
  }

  // Recursive case: Process children and calculate depth
  if (node.children) {
    levels[level] = (levels[level] || 0) + 1; // Count nodes at this level
    let maxDepth = level + 1;

    for (const child of node.children) {
      const metrics = computeTreeMetrics(child, level + 1, levels);
      maxDepth = Math.max(maxDepth, metrics.depth);
    }

    return { depth: maxDepth, width: Math.max(...Object.values(levels)) };
  }

  // Fallback for empty nodes
  return { depth: level, width: Math.max(...Object.values(levels)) };
}


export function jsonToMarkdownTree(node, level = 0) {
  const indent = "  ".repeat(level); // Two spaces for each level
  let markdown = [];

  // Add node details if they exist
  if (isPredicate(node)) {
    markdown.push(`${indent}- ${formatPredicate(node)}\n`);
    return markdown;
  }


  // Process children recursively
  if (node.children && Array.isArray(node.children)) {

    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      const isConclusion = i === node.children.length - 1;
      markdown = markdown.concat(jsonToMarkdownTree(child, level + (isConclusion ? 0 : 1)))
    }
  }


  return markdown
}

function formatPredicate(d) {
  const formatNumber = (d) => d.toLocaleString('cs-CZ')
  const formatQuantityWithEntity = (d, absolute: boolean = false) => `${formatNumber(absolute ? Math.abs(d.quantity) : d.quantity)} ${formatEntity(d)}`;

  if ((d.kind == "ratio" || d.kind === "comp-ratio" || d.kind === "rate" || d.kind === "comp-diff" || d.kind === "comp-part-eq") && (d.quantity == null && d.ratio == null)) {
    return formatToBadge(d);
  }

  let result = ''
  switch (d.kind) {
    case "cont":
      result = `${formatAgent(d.agent)}=${formatQuantityWithEntity(d)}`;
      break;
    case "comp":
      result = `${formatAgent(d.agentA)} ${d.quantity > 0 ? 'více' : 'méně'} než ${formatAgent(d.agentB)} o ${formatQuantityWithEntity(d, true)}`
      break;
    case "comp-ratio":
      const between = (d.quantity > -1 && d.quantity < 1);
      result = between
        ? `${formatAgent(d.agentA)}  ${d.quantity > 0 ? 'méně' : 'více'} ${formatNumber(Math.abs(d.quantity))} ${formatEntity(d)} než ${formatAgent(d.agentB)} `
        : `${formatAgent(d.agentA)} ${formatNumber(Math.abs(d.quantity))} krát ${d.quantity > 0 ? 'více' : 'méně'} ${formatEntity(d)} než ${formatAgent(d.agentB)} `
      break;
    case "comp-diff":
      result = `${formatAgent(d.agentMinuend)} - ${formatAgent(d.agentSubtrahend)}=${formatQuantityWithEntity(d)}`
      break;
    case "ratio":
      result = `${formatAgentEntity(d)}=${formatNumber(d.ratio)}`;
      break;
    case "ratios":
      result = `${d.parts.join(":")} v poměru ${d.ratios.join(":")} z ${d.whole}`;
      break;
    case "sum":
      result = `${d.partAgents.join("+")}`;
      break;
    case "rate":
      result = `${d.quantity} ${d.entity?.entity} per ${d.entityBase?.entity}`
      break;
    case "common-sense":
      result = `${d.agent}`
      break;
    default:
      break;
  }
  return `${formatToBadge(d)} ${result}`;
}

function formatToBadge({ kind }: { kind?: string } = {}) {
  return `<${kind === "cont" ? "C" : kind.toUpperCase()}>`
}
function formatAgent(d: string) {
  return `**${d}**`
}
function formatEntity(d: { entity: string }) {
  return d.entity != null && d.entity != '' ? `__${d.entity}__` : '';
}
function formatAgentEntity(ratio) {
  const isSame = false;//isSameEntity(ratio);
  const to = d => d?.agent != null
    ? isSame
      ? formatAgent(d.agent)
      : `${formatAgent(d.agent)}(${formatEntity(d)})`
    : d
  return `${to(ratio.part)} z ${to(ratio.whole)}`;
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

function concatString(strings, ...substitutions) {
  const formattedString = strings.reduce((acc, curr, i) => {
    const substitution = substitutions[i];

    const res = substitution
      ? `${curr}${substitution}`
      : curr;
    return `${acc}${res}`;
  }, '');

  return formattedString;
}


export type DeduceTemplate = (strings: TemplateStringsArray, ...substitutions: (number | string | Function)[]) => any
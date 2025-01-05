import { inferenceRule } from "../components/math.js"
import type { Predicate } from "../components/math.js"

type PredicateLabel = { labelKind?: 'input' | 'deduce', label?: number }

export function axiomInput(predicate: Predicate, label: number): Predicate & PredicateLabel {
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


type Node = TreeNode | Predicate
type TreeNode = {
  children?: Node[]
}
export function isPredicate(node: Node): node is Predicate {
  return (node as any).kind != null
}

function infererenceRuleEx(node: Node): any {
  // Base case: if the node is a leaf (a string), add it to the result  
  if (isPredicate(node)) {
    return node;
  }

  const args = []
  // Recursive case: traverse each child
  if (node.children) {
    for (const child of node.children) {
      args.push(infererenceRuleEx(child))
    }
  }

  // You can process the current node itself here if needed
  // For example, add something from the node to `result`.
  const res = inferenceRule(...args)  
  return res;
}

export function deduce(...children: Node[]): TreeNode {
  return to(...children.concat(inferenceRule.apply(null, children.map(d => isPredicate(d) ? d : d.children.slice(-1)[0]))));
}
export function to(...children: Node[]): TreeNode {
  return { children: children }
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


export type DeduceTemplate = (strings: TemplateStringsArray, ...substitutions: (number | string | Function)[]) => any
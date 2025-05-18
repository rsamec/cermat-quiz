import { cont, formatAngle, formatSequencePattern, inferenceRule, nthQuadraticElements, isNumber, areNumbers } from "../components/math.js"
import { Predicate, Container, Rate, ComparisonDiff, Comparison } from "../components/math.js"
import { inferenceRuleWithQuestion } from "../math/math-configure.js"
import { toEquationExpr } from "./math-solver.js"

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
export function lastQuantity(input: TreeNode) {
  const lastPredicate = last(input);
  return isNumber(lastPredicate.quantity) ? lastPredicate.quantity : NaN;
}
export function deduce(...children: Node[]): TreeNode {
  return to(...children.concat(inferenceRule.apply(null, children.map(d => isPredicate(d) ? d : d.children.slice(-1)[0]))));
}
export function to(...children: Node[]): TreeNode {
  return { children: children }
}
export function toCont(child: Node, { agent, entity }: { agent: string, entity?: { entity: string, unit?: string } }): TreeNode {
  const node = isPredicate(child) ? child : last(child);
  if (!(node.kind == "cont" || node.kind === "transfer" || node.kind == "comp" || node.kind === "comp-diff" || node.kind === "rate" || node.kind === 'quota' || node.kind === 'delta')) {
    throw `Non convertable node type: ${node.kind}`
  }
  const typeNode = node as ComparisonDiff | Comparison | Rate;
  return to(child, {
    kind: 'cont',
    agent,
    quantity: typeNode.quantity,
    entity: entity != null ? entity.entity : typeNode.kind == "rate" ? typeNode.entity.entity : typeNode.entity,
    unit: entity != null ? entity.unit : typeNode.kind == "rate" ? typeNode.entity.unit : typeNode.unit
  })
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
};

export function computeTreeMetrics(
  node: Node,
  level = 0,
  levels: Record<number, number> = {},
  predicates: string[] = []
): TreeMetrics {
  // Base case: If the node is a leaf
  if (isPredicate(node)) {
    levels[level] = (levels[level] || 0) + 1; // Count nodes at this level

    return { depth: level + 1, width: Math.max(...Object.values(levels)), predicates: predicates.includes(node.kind) ? predicates : predicates.concat(node.kind) };
  }

  // Recursive case: Process children and calculate depth
  if (node.children) {
    levels[level] = (levels[level] || 0) + 1; // Count nodes at this level
    let maxDepth = level + 1;

    for (const child of node.children) {
      const metrics = computeTreeMetrics(child, level + 1, levels, predicates);
      predicates = metrics.predicates;
      maxDepth = Math.max(maxDepth, metrics.depth);
    }

    return { depth: maxDepth, width: Math.max(...Object.values(levels)), predicates };
  }

  // Fallback for empty nodes
  return { depth: level, width: Math.max(...Object.values(levels)), predicates };
}


export function jsonToMarkdownTree(node, level = 0) {
  const indent = "  ".repeat(level); // Two spaces for each level
  let markdown = [];

  // Add node details if they exist
  if (isPredicate(node)) {
    markdown.push(`${indent}- ${formatPredicate(node, mdFormatting)}\n`);
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
export function jsonToMarkdownChat(node, formatting?: any) {

  const flatStructure = [];
  function traverseEx(node) {
    const args = []
    // Add node details if they exist
    if (isPredicate(node)) {
      return formatPredicate(node, { ...mdFormatting, formatKind: () => ``, ...formatting });
    }

    let q = null
    // Process children recursively
    if (node.children && Array.isArray(node.children)) {

      for (let i = 0; i != node.children.length; i++) {
        const child = node.children[i];
        const isConclusion = i === node.children.length - 1;

        if (isConclusion) {
          const children = node.children.map(d => isPredicate(d) ? d : d.children.slice(-1)[0]);
          const result = children.length > 2 ? inferenceRuleWithQuestion(...children.slice(0, -1)) : null;
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
      flatStructure.push((q != null
        ? q.question + `\n` + `${premises.filter(d => !isEmptyOrWhiteSpace(d)).map(d => `- ${d}`).join("\n")} ` + '\n\n' + (answer != null ? `Výpočet: ${answer.tex} = ${answer.result}` : '')
        : `${premises.filter(d => !isEmptyOrWhiteSpace(d)).map(d => `- ${d}`).join("\n")}`) + '\n\n' + `Závěr:${conclusion}` + "\n\n");
    }

    return args
  }
  traverseEx(node)
  return flatStructure;

}
function isEmptyOrWhiteSpace(value: string | undefined) {
  return value == null || (typeof value === 'string' && value.trim() === '');
};

const mdFormatting = {
  compose: (strings: TemplateStringsArray, ...args) => concatString(strings, ...args),
  formatKind: d => `[${d.kind.toUpperCase()}]`,
  formatQuantity: d => {
    if (typeof d === "number") {
      return d.toLocaleString("cs-CZ");
    }
    else if (typeof d === "string") {
      return d;
    }
    else {
      return toEquationExpr(d)
    }
  },
  formatRatio: (d, asPercent) => asPercent ? `${(d * 100).toLocaleString("cs-CZ")}%` : d.toLocaleString("cs-CZ"),
  formatEntity: (d, unit) => {
    const res = [unit, d].filter(d => d != null).join(" ");
    return isEmptyOrWhiteSpace(res) ? '' : `__${res.trim()}__`;
  },
  formatAgent: d => `**${d}**`,
  formatSequence: d => `${formatSequence(d)}`
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
  const { formatKind, formatAgent, formatEntity, formatQuantity, formatRatio, formatSequence, compose } = { ...mdFormatting, ...formatting }
  if (((d.kind == "transfer" || d.kind === "rate" || d.kind === "quota" || d.kind === "comp-diff" || d.kind === 'delta') && d.quantity == null)
    || ((d.kind == "ratio" || d.kind === "comp-ratio") && d.ratio == null) || d.kind === "comp-part-eq") {
    return formatKind(d);
  }

  let result = ''
  switch (d.kind) {
    case "cont":
      result = compose`${formatAgent(d.agent)}=${formatQuantity(d.quantity)} ${formatEntity(d.entity, d.unit)}`;
      break;
    case "comp":
      if (isNumber(d.quantity)) {
        result = d.quantity === 0
          ? compose`${formatAgent(d.agentA)} je rovno ${formatAgent(d.agentB)}`
          : compose`${formatAgent(d.agentA)} ${d.quantity > 0 ? 'více' : 'méně'} než ${formatAgent(d.agentB)} o ${formatQuantity(Math.abs(d.quantity))} ${formatEntity(d.entity, d.unit)}`
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
        result = between
          ? compose`${formatAgent(d.agentA)} ${d.ratio < 1 ? 'méně' : 'více'} o ${formatRatio(d.ratio > 1 ? d.ratio - 1 : 1 - d.ratio, d.asPercent)} než ${formatAgent(d.agentB)} `
          : compose`${formatAgent(d.agentA)} ${formatRatio(d.ratio > 1 ? Math.abs(d.ratio) : 1 / Math.abs(d.ratio), false)} krát ${d.ratio > 1 ? 'více' : 'méně'} než ${formatAgent(d.agentB)} `
      }
      else {
        result = compose`poměr ${formatQuantity(d.ratio)} mezi ${formatAgent(d.agentA)} a ${formatAgent(d.agentB)}`
      }
      break;
    case "comp-diff":
      result = compose`${formatAgent(d.agentMinuend)} - ${formatAgent(d.agentSubtrahend)}=${formatQuantity(d.quantity)} ${formatEntity(d.entity, d.unit)}`
      break;
    case "ratio":
      result = compose`${formatAgent(d.part)} z ${formatAgent(d.whole)}=${formatRatio(d.ratio, d.asPercent)}`;
      break;
    case "ratios":
      result = compose`${formatAgent(d.whole)} ${joinArray(d.parts?.map(d => formatAgent(d)), ":")} v poměru ${joinArray(d.ratios?.map(d => formatQuantity(d)), ":")}`;
      break;
    case "sum":
      result = compose`${joinArray(d.partAgents?.map(d => formatAgent(d)), " + ")}`;
      break;
    case "product":
      result = compose`${joinArray(d.partAgents?.map(d => formatAgent(d)), " * ")}`;
      break;
    case "rate":
      result = compose`${formatAgent(d.agent)} ${formatQuantity(d.quantity)} ${formatEntity(d.entity.entity, d.entity.unit)} per ${formatEntity(d.entityBase.entity, d.entityBase.unit)}`
      break;
    case "quota":
      result = compose`${formatAgent(d.agent)} rozděleno na ${formatQuantity(d.quantity)} ${formatAgent(d.agentQuota)} ${d.restQuantity !== 0 ? ` se zbytkem ${formatQuantity(d.restQuantity)}` : ''}`
      break;
    case "sequence":
      result = compose`${d.type != null ? formatSequence(d.type) : ''}`
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
      result = compose`${d.expression}`
      break;
    case "eval-option":
      result = d.value === undefined 
      ? compose`${d.optionValue !=null ? `Volba [${d.optionValue}]: ${d.expectedValue != null ? formatRatio(d.expectedValue):d.expression}`: d.expression }`
      : compose`${d.value === true ? "Pravda" : d.value === false ? "Nepravda" : d.value != null ? `Volba [${d.value}]` : 'N/A'}`
      break;
    default:
      break;
  }
  return compose`${formatKind(d)} ${result}`;
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

function concatString(strings, ...substitutions) {
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


export function generateAIMessages({ template, deductionTrees }: { template, deductionTrees: [string, TreeNode][] }) {

  const alternateMessage = `
Zadání úlohy je 

${template}

Řešení úlohy je popsáno heslovitě po jednotlivých krocích. Správný výsledek je uveden jako poslední krok.
Jednotlivé kroky jsou odděleny horizontální čárou. Podúlohy jsou odděleny dvojitou horizontální čárou.


${deductionTrees.map(([title, deductionTree]) => `${title} \n\n ${jsonToMarkdownChat(deductionTree).join("\n---\n")}`).join("\n---\n---\n")}`


  const explainSolution = `${alternateMessage}
Můžeš vysvětlit podrobné řešení krok po kroku v češtině. Vysvětluj ve stejných krocích jako je uvedeno v heslovitém řešení.`

  const vizualizeSolution = `${alternateMessage}
Můžeš vytvořit vizualizaci, která popisuje situaci, resp. řešení ve formě obrázku. Např. ve formě přehledné infografiky.`

  const generateMoreQuizes = `${alternateMessage}
Můžeš vymyslet novou úlohu v jiné doméně, která půjde řešit stejným postupem řešení 
- změnit agent - identifikovány pomocí markdown bold **
- změna entit - identifikace pomocí markdown bold __
- změnu parametry úlohy - identifikovány pomocí italic *

Změn agenty, entity a parametry úlohy tak aby byly z jiné, pokud možno netradiční domény.
Použij jiné vstupní parametry tak, aby výsledek byl jiná hodnota, která je možná a pravděpodobná v reálném světě.
Pokud původní zadání obsahuje vizualizaci situace, tak vygeneruj také vizualizaci pro novou doménu.
Vygeneruj 3 různé úlohy v češtině. Nevracej způsob řešení, kroky řešení.
`

  return {
    explainSolution,
    vizualizeSolution,
    generateMoreQuizes,
  }
}
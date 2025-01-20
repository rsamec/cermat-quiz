import { html } from "npm:htl";
import * as Plot from "npm:@observablehq/plot";
import Fraction from 'npm:fraction.js';
import { isSameEntity, nthQuadraticElements } from "../components/math.js";
import { isPredicate } from "../utils/deduce-utils.js";
import { deduce } from "./deduce.js";

export function partion(items, options) {
  const total = items.reduce((out, d) => out += d.value, 0);
  const data = items.map(d => ({ ...d, ratio: d.value / total }))

  const { width, height, unit, multiple, showLegend, showTicks, showSeparate, formatAsFraction, showAbsoluteValues, showRelativeValues, fill } = {
    ...{
      height: 150,
      showRelativeValues: true,
      showAbsoluteValues: true,
      showLegend: true,
      showTicks: false,
      showSeparate: false,
      formatAsFraction: false,
      fill: 'agent'
    },
    ...options
  }
  return Plot.plot({
    ...(showSeparate && {
      fy: { label: null, ticks: showTicks ? undefined : [], marginLeft: 0 },
    }),
    y: { label: null },
    color: {
      type: "categorical",
      legend: showLegend
    },
    x: { label: null, ticks: [] },
    ...(width && { width }),
    ...(height && { height }),
    marginBottom: 0,
    marginTop: showRelativeValues ? 20 : 0,
    marks: [
      Plot.waffleX(data, {
        x: 'value',
        fill,
        ...(unit && { unit }),
        ...(multiple && { multiple }),
        ...(showSeparate && { fy: "agent" }),
        opacity: d => d.opacity ?? 1,
        sort: {
          x: { order: null }
        }
      }),
      ...(showAbsoluteValues ? [
        Plot.textX(data, Plot.stackX({
          x: "value",
          text: (d, i) => `${formatAsFraction ? new Fraction(d.value).toFraction() : d.value.toLocaleString('cs-CZ')}`,
          fontSize: 16,
          fontWeight: 500,
          textAnchor: 'middle',
          lineAnchor: "middle",
          frameAnchor: "middle",
          ...(showSeparate && { fy: "agent" })
        }))] : []),
      ...(showRelativeValues ? [
        Plot.textX(data, Plot.stackX({
          x: "value",
          text: (d, i) => {
            const { hidePercent, hideFraction } = { ...{ hideFraction: true }, ...d.label };
            const percent = !hidePercent ? `${(d.ratio * 100).toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} %` : null;
            const fraction = !hideFraction ? `${new Fraction(d.ratio).toFraction()}` : null;
            return [percent, fraction].filter(Boolean).join(" | ");
          },
          ...(showSeparate && { fy: "agent" }),
          fontSize: 16,
          textAnchor: 'middle',
          lineAnchor: "bottom",
          frameAnchor: "top",
          dy: 0
        }))] : []),
    ]
  })
};

export function relativePartsData(value, { first, second, asPercent } = {}) {
  const d = asPercent ? value * 100 : value;
  const whole = asPercent ? 100 : 1;

  return [
    { agent: first, value: d },
    { agent: second, value: whole - d },
  ]
}
export function relativePartsDiffData(value, { first, second, asPercent } = {}) {
  const d = asPercent ? value * 100 : value;
  const whole = asPercent ? 100 : 1;


  return [
    { agent: first, value: d > 0 ? whole : whole + d },
    ...(d != 0 ? [{ agent: first, value: Math.abs(d), opacity: 0.2 }] : []),
    { agent: second, value: whole }]
}

export function relativeParts(d, options) {
  return partion(relativePartsData(d, options), { width: 300, height: 50, formatAsFraction: !options.asPercent, showRelativeValues: false, unit: 1, multiple: options.asPercent ? 5 : undefined })
}
export function relativePartsDiff(d, options) {
  return partion(relativePartsDiffData(d, options), { width: 300, height: 60, formatAsFraction: !options.asPercent, showRelativeValues: false, unit: 1, multiple: options.asPercent ? 5 : undefined, showSeparate: true })
}

function label(d) {
  return html`<div class=${`badge badge--${d.kind}`} >${d.id}</div>`
}
export function formatNode(t, label) {
  const res = html`${label != null ? label : ''}&nbsp;${t?.kind != null ? formatPredicate(t) : t}`
  if (t.collapsible) {
    res._collapsible = t.collapsible
  }

  return res;
}

function formatSequence(type) {
  const simplify = (d, op = '') => d !== 1 ? `${d}${op}` : ''

  if (type.kind === "arithmetic")
    return html`${type.sequence.join()} => a<sub>n</sub> = ${type.sequence[0]} + ${type.commonDifference}(n-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements(first, second, type.secondDifference);
    const parts = [html`${simplify(A)}n<sup>2</sup>`];
    if (B !== 0) {
      parts.concat(`${simplify(B)}n`)
    }
    if (C !== 0) {
      parts.concat(`${simplify(C)}n`)
    }
    return html`${type.sequence.join()} => a<sub>n</sub> = ${parts.map((d, i) => html`${i !== 0 ? ' + ' : ''}${d}`)}`;
  }
  if (type.kind === "geometric") {
    return html`${type.sequence.join()} => a<sub>n</sub> = ${simplify(type.sequence[0], '*')}${type.commonRatio}<sup>(n-1)</sup>`;
  }
}
export function formatPredicate(d) {
  const formatQuantity = (d, absolute) => (absolute ? Math.abs(d.quantity) : d.quantity).toLocaleString('cs-CZ',)
  const formatEntity = (d) => d.entity
  const formatQuantityWithEntity = (d, absolute) => html`${formatQuantity(d, absolute)}&nbsp;${formatEntity(d)}`;

  if ((d.kind == "ratio" || d.kind === "comp-ratio" || d.kind === "rate" || d.kind === "quota" || d.kind === "comp-diff" || d.kind === "comp-part-eq") && (d.quantity == null && d.ratio == null)) {
    return formatToBadge(d);
  }

  let result = ''
  switch (d.kind) {
    case "cont":
      result = html`${d.agent}=${formatQuantityWithEntity(d)}`;
      break;
    case "comp":
      result = html`${d.agentA} ${d.quantity > 0 ? 'více' : 'méně'} než ${d.agentB} o ${formatQuantityWithEntity(d, true)}`
      break;
    case "comp-ratio":
      const between = (d.ratio > 0 && d.ratio < 2);
      result = between
        ? html`${d.agentA} ${d.ratio < 1 ? 'méně' : 'více'} o ${new Fraction(d.ratio > 1 ? d.ratio - 1 : 1 - d.ratio).toFraction()}&nbsp;${formatEntity(d)} než ${d.agentB} `
        : html`${d.agentA} ${formatQuantity(d, true)} krát ${d.ratio > 0 ? 'více' : 'méně'}&nbsp;${formatEntity(d)} než ${d.agentB} `
      break;
    case "comp-diff":
      result = html`${d.agentMinuend} - ${d.agentSubtrahend}=${formatQuantityWithEntity(d)}`
      break;
    case "ratio":
      result = html`${formatRatio(d)}=${new Fraction(d.ratio).toFraction()}`;
      break;
    case "ratios":
      result = d.parts != null ? formatRatios(d) : d.whole != null ? formatAgentEntity(d.whole) : '';
      break;
    case "sum":
      result = `${d.partAgents?.join(" + ")}`;
      break;
    case "product":
      result = `${d.partAgents?.join(" * ")}`;
      break;
    case "rate":
      result = `${d.quantity} ${d.entity?.entity} per ${d.entityBase?.entity}`
      break;
    case "quota":
      result = `${d.agent} rozděleno na ${d.quantity} ${d.agentQuota} ${d.restQuantity !== 0 ? ` se zbytkem ${d.restQuantity}` : ''}`
      break;
    case "sequence":
      result = d.type != null ? formatSequence(d.type) : ''
      break;
    case "nth":
      result = d.entity;
      break;
    case "common-sense":
      result = `${d.agent}`
      break;
    default:
      break;
  }
  return html`${formatToBadge(d)} ${result}`;
}

function formatToBadge({ kind } = {}) {
  return html`<div class="badge">${kind === "cont" ? "C" : kind.toUpperCase()}</div>`
}

function formatRatio(ratio) {
  const args = { isSameEntity: isSameEntity(ratio) };
  return `${formatAgentEntity(ratio.part, args)} z ${formatAgentEntity(ratio.whole, args)}`;
}
function formatRatios(d) {
  const isSameAgent = d.parts[0]?.agent === d.parts[1]?.agent;
  const isSameEntity = d.parts[0]?.entity === d.parts[1]?.entity;
  return `${d.whole != null ? formatAgentEntity(d.whole, false) : ''} ${d.parts.map(d => formatAgentEntity(d, { isSameAgent, isSameEntity })).join(":")} v poměru ${d.ratios.map(d => d.toLocaleString('cs-CZ')).join(":")}`
}

function formatAgentEntity(d, { isSameEntity, isSameAgent } = {}) {
  if (d?.agent == null) return d;
  if (isSameAgent) return d.entity;
  if (isSameEntity) return d.agent;
  return `${d.agent}(${d.entity})`;
}

export function inputLabel(id) {
  return label({ id, kind: 'input' })
}
export function deduceLabel(id) {
  return label({ id, kind: 'deduce' })
}
export function outputLabel(id) {
  return label({ id, kind: 'output' })
}

export function highlightLabel(startNumber = 1) {
  return (strings, ...substitutions) => {
    const formattedString = strings.reduce((acc, curr, i) => {
      const substitution = substitutions[i];

      const res = substitution && typeof substitution === "function"
        ? html`${curr}${substitution(html)}`
        : substitution
          ? html`${curr}<span class="highlight">${inputLabel(startNumber + i)} ${substitution}</span>`
          : html`${curr}`;
      return html`${acc}${res}`;
    }, '');

    return formattedString;
  }
}
export function highlight(strings, ...substitutions) {
  const formattedString = strings.reduce((acc, curr, i) => {
    const substitution = substitutions[i];

    const res = substitution
      ? html`${curr}<span class="highlight">${substitution}</span>`
      : curr;
    return html`${acc}${res}`;
  }, '');

  return formattedString;
}


export function deduceTraverse(node) {
  let counter = 1;
  const deduceMap = new Map();
  function deduceTraverseEx(node) {

    // Base case: if the node is a leaf, add it to the result  
    if (isPredicate(node)) {
      return formatNode(node, node.labelKind === "input"
        ? inputLabel(node.label)
        : node.labelKind === "deduce"
          ? deduceLabel(node.label)
          : null);
    }
    if (node.tagName === "FIGURE") {
      return node;
    }

    const args = []
    // Recursive case: traverse each child
    if (node.children) {
      let i = 0;
      for (const child of node.children) {
        const isLast = node.children.length === ++i;
        let newChild;
        if (isLast && isPredicate(child) && !deduceMap.has(child)) {
          newChild = { ...child, ...{ labelKind: 'deduce', label: counter++ } }
          deduceMap.set(child, newChild)
        }
        else {
          newChild = deduceMap.has(child) ? deduceMap.get(child) : child;
        }

        const res = deduceTraverseEx(newChild);
        args.push(res)

        if (!isLast) {
          if (newChild?.kind === "ratio" && newChild?.ratio != null) {
            args.push(relativePartsDiff(-(1 - newChild.ratio), {  first: toAgent(newChild.part), second: toAgent(newChild.whole)}))
          }
          else if (newChild?.kind === "ratios" && newChild?.ratios?.length === 2) {
            args.push(relativeParts(newChild.ratios[0] / newChild.ratios[1], { first: toAgent(newChild.parts[0]), second: toAgent(newChild.parts[2]) }))
          }
          else if (newChild?.kind === "comp-ratio" && newChild?.ratio != null) {
            args.push(relativePartsDiff(newChild.ratio >= 0 ? newChild.ratio - 1 : -(1 + (1 / newChild.ratio)), { first: newChild.agentA, second: newChild.agentB }))
          }
        }
      }
    }

    // You can process the current node itself here if needed
    // For example, add something from the node to `result`.

    const res = deduce(...args)
    return res;
  }
  return deduceTraverseEx(node)
}
function toAgent(d) {
  return d?.agent ?? d;
}
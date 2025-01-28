import { html } from "npm:htl";
import * as Plot from "npm:@observablehq/plot";
import Fraction from 'npm:fraction.js';
import { inferenceRuleWithQuestion, nthQuadraticElements, primeFactorization } from "../components/math.js";
import { isPredicate, formatPredicate } from "../utils/deduce-utils.js";
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

export const formatting = {
  compose: (strings, ...args) => concatHtml(strings, ...args),
  formatKind: d => html`<div class="badge">${d.kind === "cont" ? "C" : d.kind.toUpperCase()}</div>`,
  formatQuantity: d => d.toLocaleString('cs-CZ'),
  formatRatio: d => new Fraction(d).toFraction(),
  formatEntity: d => d,
  formatAgent: d => html`<b>${d}</b>`,
  formatSequence: d => `${d.type}`
}

export function formatNode(t, label, format = formatting) {
  const res = html`${label != null ? label : ''} ${t?.kind != null ? formatPredicate(t, format) : t}`
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

function concatHtml(strings, ...substitutions) {
  const formattedString = strings.reduce((acc, curr, i) => {
    const substitution = substitutions[i];

    const res = substitution
      ? html.fragment`${curr}${substitution}`
      : curr;
    return html.fragment`${acc}${res}`;
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
            args.push(relativePartsDiff(-(1 - newChild.ratio), { first: toAgent(newChild.part), second: toAgent(newChild.whole) }))
          }
          // else if (newChild?.kind === "ratios" && newChild?.ratios?.length === 2) {
          //   args.push(relativeParts(newChild.ratios[0] / newChild.ratios[1], { first: toAgent(newChild.parts[0]), second: toAgent(newChild.parts[2]) }))
          // }
          if (newChild?.kind === "gcd" || newChild?.kind === "lcd") {
            const numbers = node.children.slice(0, -2).map(d => d.quantity);
            args.push(html`<div class='v-stack'><span>Rozklad na prvočísla:</span>${primeFactorization(numbers).map((d, i) => html`<div>${numbers[i]} = ${d.join()}</div>`)}</div>`)
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

export function stepsTraverse(node) {
  let counter = 1;
  const deduceMap = new Map();

  const flatStructure = [];
  function traverseEx(node) {

    // Base case: if the node is a leaf, add it to the result  
    if (isPredicate(node)) {
      return formatNode(node, node.labelKind === "input"
        ? inputLabel(node.label)
        : node.labelKind === "deduce"
          ? deduceLabel(node.label)
          : null, { ...formatting, formatKind: d => '' });
    }
    if (node.tagName === "FIGURE") {
      return node;
    }

    const args = []
    let question = null
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

        if (isLast) {
          const children = node.children.map(d => isPredicate(d) ? d : d.children.slice(-1)[0]);
          const result = children.length > 2 ? inferenceRuleWithQuestion(...children.slice(0, -1)) : null;
          question = result;
        }
        else {
          question = null;
        }

        const res = traverseEx(newChild);


        args.push(res)
        //args.push(Array.isArray(res) && res.length > 1 ? {premises: res.slice(0, -1), conlusion:res[res.length - 1]} : res);

        if (!isLast) {
          if (newChild?.kind === "ratio" && newChild?.ratio != null) {
            args.push(relativePartsDiff(-(1 - newChild.ratio), { first: toAgent(newChild.part), second: toAgent(newChild.whole) }))
          }
          // else if (newChild?.kind === "ratios" && newChild?.ratios?.length === 2) {
          //   args.push(relativeParts(newChild.ratios[0] / newChild.ratios[1], { first: toAgent(newChild.parts[0]), second: toAgent(newChild.parts[2]) }))
          // }
          if (newChild?.kind === "gcd" || newChild?.kind === "lcd") {
            const numbers = node.children.slice(0, -2).map(d => d.quantity);
            args.push(html`<div class='v-stack'><span>Rozklad na prvočísla:</span>${primeFactorization(numbers).map((d, i) => html`<div>${formatNumber(numbers[i])} = ${d.join()}</div>`)}</div>`)
          }
          else if (newChild?.kind === "comp-ratio" && newChild?.ratio != null) {
            args.push(relativePartsDiff(newChild.ratio >= 0 ? newChild.ratio - 1 : -(1 + (1 / newChild.ratio)), { first: newChild.agentA, second: newChild.agentB }))
          }
        }

      }

      // Add a group containing the parent and its children
      const arr = normalizeToArray(args).map(d => {
        return Array.isArray(d) ? d[d.length - 1] : d
      });

      const premises = arr.slice(0, -1);
      //const questions = premises.filter(d => d?.result != null)
      const conclusion = arr[arr.length - 1];
      flatStructure.push({ premises, conclusion, questions: [question] });

    }

    // You can process the current node itself here if needed
    // For example, add something from the node to `result`.
    return args; //html`<div class="v-stack v-stack--l"><div>${args.slice(0, args.length - 1).map(d => html.fragment`${d}`)}</div> <div style="opacity:0.4">${args[args.length - 1]}</div></div>`;
  }
  traverseEx(node)
  return flatStructure;
}
function normalizeToArray(d) {
  return Array.isArray(d) ? d : [d]
}
function toAgent(d) {
  return d?.agent ?? d;
}
function formatNumber(d) {
  return d.toLocaleString("cs-CZ")
}


export function renderChat(deductionTree) {
  const steps = stepsTraverse(deductionTree).map((d, i) => ({ ...d, index: i }));

  return html`<div class="chat">${steps.map(({ premises, conclusion, questions }, i) => {
    const q = questions[0];
    const answer = q?.options?.find(d => d.ok)
    return html`<div class="messages">
        <div class='message v-stack v-stack--s'>${premises.map(d => d)}</div>
        ${q != null ? html`<div class='message agent v-stack v-stack--s'>
          <div>${q?.question}</div>
          ${answer != null ? html`<div>${answer.tex} = ${answer.result}</div>` : ''}
        </div>`: ''
      }
        ${steps.length == i + 1 ? html`<div class='message'>${conclusion}</div>` : ''}
      </div>
    </div>`
  })}`
}
import { html } from "npm:htl";
import * as Plot from "npm:@observablehq/plot";
import Fraction from 'npm:fraction.js';
import { nthQuadraticElements, primeFactorization, lcdCalc, isNumber, gcdCalc } from "../components/math.js";
import { isPredicate, formatPredicate, mapNodeChildrenToPredicates, last, isStringContext } from "../utils/deduce-utils.js";
import { inferenceRuleWithQuestion } from "../math/math-configure.js";
import { toEquationExprAsText } from "./math-solver.js";

export function partion(items, options) {
  const total = items.reduce((out, d) => out += d.value, 0);
  const partTotal = items.filter(d => d.part).reduce((out, d) => out += d.value, 0);
  const data = items.map(d => ({ ...d, ratio: d.value / total }))
  const { width, height, unit, multiple, showLegend, showTicks, showSeparate, showSeparatePartLabel, formatAsFraction, showAbsoluteValues, showRelativeValues, fill, marginLeft } = {
    ...{
      height: 150,
      showRelativeValues: true,
      showAbsoluteValues: true,
      showLegend: true,
      showTicks: false,
      showSeparate: false,
      formatAsFraction: false,
      showSeparatePartLabel: undefined,
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
      legend: showLegend,
      //domain: data.map(d => d.agent)
    },
    x: { label: null, ticks: [] },
    ...(width && { width }),
    ...(height && { height }),
    marginBottom: 0,
    marginTop: showRelativeValues ? 20 : 0,
    ...(marginLeft && { marginLeft }),
    marks: [
      Plot.waffleX(data, {
        x: 'value',
        ...(data.some(d => d.yValue) && { y: "yValue" }),
        fill,
        ...(unit && { unit }),
        ...(multiple && { multiple }),
        ...(showSeparate && { fy: "agent" }),
        opacity: d => d.opacity ?? 1,
        sort: {
          x: { order: null },
          ...(showSeparate && { fy: { order: null } })
        }
      }),
      ...(showAbsoluteValues ? [
        Plot.textX(data, Plot.stackX({
          x: "value",
          text: (d, i) => `${formatAsFraction ? new Fraction(d.displayValue ?? d.value).toFraction() : (d.displayValue ?? d.value).toLocaleString('cs-CZ')}`,
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
      ...(showSeparate && showSeparatePartLabel
        ? [Plot.textX(data, Plot.stackX({
          x: 0,
          text: (d, i, arr) => {
            const partFraction = new Fraction(partTotal);
            if (i == 0) return partFraction.toFraction();
            if (i == arr.length - 1) return `${partFraction.d}/${partFraction.d}`;
          },
          fontSize: 16,
          textAnchor: 'end',
          fy: "agent",
          dx: -5,
          dy: 0
        }))
        ]
        : [])
    ]
  })
};

function proportionPlot({ data, columns, options = {} }) {
  const stack = (options) => Plot.stackY({}, { x: "type", y: "value", z: "scaleFactor", ...options });
  const { width, height, marginLeft, marginRight } = {
    ...{
      marginLeft: 50,
      marginRight: 60,
    },
    ...options
  }
  return Plot.plot({
    x: {
      domain: columns,
      axis: "top",
      label: null,
      tickFormat: (d) => `${d}`,
      labelSize: 16,
      tickSize: 0,
      padding: 0 // see margins
    },
    y: {
      axis: null,
      reverse: true
    },
    color: {
      scheme: "prgn",
      //reverse: false
    },
    style: {
      fontSize: 20,
    },
    ...(width && { width }),
    ...(height && { height }),
    ...(marginLeft && { marginLeft }),
    ...(marginRight && { marginRight }),
    marks: [
      Plot.areaY(
        data,
        stack({
          // curve: "bump-x",
          fill: "scaleFactor",
          stroke: "white"
        })
      ),
      Plot.text(
        data,
        stack({
          filter: (d) => d.type === columns[0],
          text: (d) => `${d.value * d.scaleFactor}`,
          textAnchor: "end",
          dx: -6
        })
      ),
      Plot.text(
        data,
        stack({
          filter: (d) => d.type === columns[1],
          text: (d) => `${d.value * d.scaleFactor}`,
          textAnchor: "start",
          dx: +6
        })
      ),
      Plot.text(
        data,
        stack({
          filter: (d) => d.type === columns[0],
          text: "value",
          textAnchor: "start",
          fill: "white",
          fontWeight: "bold",
          dx: +8
        })
      ),
      Plot.text(
        data,
        stack({
          filter: (d) => d.type === columns[1],
          text: "value",
          textAnchor: "end",
          fill: "white",
          fontWeight: "bold",
          dx: -8
        })
      )
    ]
  });
}

export function relativePartsData(values, { parts } = {}) {

  const fractions = values.map(d => new Fraction(d));
  const denominators = fractions.map(d => parseInt(d.d));
  const numerators = fractions.map(d => parseInt(d.n));
  const common = lcdCalc(denominators);
  const final = fractions.map(d => parseInt(d.n) * common / parseInt(d.d))
  return final.map((d, i) => ({ agent: parts[i], value: d, displayValue: values[i] })).reverse()
}

export function relativeTwoPartsData(value, { first, second, asPercent } = {}) {
  const d = asPercent ? value * 100 : value;
  const whole = asPercent ? 100 : 1;

  return [
    { agent: first, value: d },
    { agent: second, value: whole - d },
  ]
}
export function relativeTwoPartsDiffData(value, { first, second, asPercent } = {}) {
  const part = asPercent ? value * 100 : value;
  const whole = asPercent ? 100 : 1;
  return [
    { agent: first, value: part > 0 ? whole : whole + part, part: true },
    ...(part != 0 ? [{ agent: first, value: Math.abs(part), part: part > 0, opacity: part > 0 ? 1 : 0.2 }] : []),
    { agent: second, value: whole }]
}
export function relativeParts(d, options) {
  return partion(relativePartsData(d, options), { width: options.width ?? 300, height: options.height ?? 50, formatAsFraction: !options.asPercent, showRelativeValues: false, unit: 1, multiple: options.asPercent ? 5 : undefined })
}

export function relativeTwoParts(d, options) {
  return partion(relativeTwoPartsData(d, options), { width: options.width ?? 300, height: options.height ?? 50, formatAsFraction: !options.asPercent, showRelativeValues: false, unit: 1, multiple: options.asPercent ? 5 : undefined })
}
export function relativeTwoPartsDiff(d, options) {
  return partion(relativeTwoPartsDiffData(d, options), { width: options.width ?? 300, height: options.height ?? 50, formatAsFraction: !options.asPercent, showRelativeValues: false, unit: 1, multiple: options.asPercent ? 5 : undefined, showSeparate: true })
}

function label(d) {
  return html`<div class=${`badge badge--${d.kind}`} >${d.id}</div>`
}

export const formatting = {
  compose: (strings, ...args) => concatHtml(strings, ...args),
  formatKind: d => html`<div class="badge">${d.kind === "cont" ? "C" : d.kind.toUpperCase()}</div>`,
  formatQuantity: d => {
    if (typeof d === "number") {
      return d.toLocaleString("cs-CZ");
    }
    else if (d?.expression != null) {
      return html`<div class="badge badge--warning">${toEquationExprAsText(d)}</div>`
    }
    else if (typeof d === "string") {
      return html`<div class="badge badge--warning">${d}</div>`;
    }
    else {
      return d;
    }
  },
  formatRatio: (d, asPercent) => {
    if (typeof d === "number") {
      return asPercent ? `${(d * 100).toLocaleString('cs-CZ')}%` : new Fraction(d).toFraction()
    }
    else if (d?.expression != null) {
      html`<div class="badge badge--warning">${asPercent ? toEquationExprAsText({ ...d, expression: `(${d.expression}) * 100` }) : toEquationExprAsText(d)}</div>`
    }
    else if (typeof d === "string") {
      return html`<div class="badge badge--warning">${d}</div>`;
    }
    else {
      return d
    }
  },
  formatEntity: (d, u) => [u, d].filter(d => d != null).join(" "),
  formatAgent: d => html`<b>${d}</b>`,
  formatSequence: d => formatSequence(d),
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
  function deduceTraverseEx(node, level) {

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

        const res = deduceTraverseEx(newChild, level + 1);
        args.push(res)

        if (!isLast) {
          const plotFigure = renderPredicatePlot(newChild, node, { predicatesToExclude: ["cont"] });
          if (plotFigure != null) {
            args.push(plotFigure)
          }
        }
      }
    }

    // You can process the current node itself here if needed
    // For example, add something from the node to `result`.

    const res = renderDeduceTreeNode(args, node, level)
    return res;
  }
  return deduceTraverseEx(node, 0)
}

export function stepsTraverse(node) {
  let counter = 1;
  const deduceMap = new Map();
  const contextStack = [];
  const flatStructure = [];
  function traverseEx(node, contextStack) {

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
    if (isStringContext(node.context)) {
      contextStack.push(node.context);
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
          const result = inferenceRuleWithQuestion(mapNodeChildrenToPredicates(node));
          question = result;
        }
        else {
          question = null;
        }

        const res = traverseEx(newChild, contextStack);
        args.push(res)

        if (!isLast) {
          const plotFigure = renderPredicatePlot(newChild, node, { predicatesToExclude: ["cont"] });
          if (plotFigure != null) {
            args.push(plotFigure)
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
      flatStructure.push({ premises, conclusion, questions: [question], context: contextStack.pop() });

    }

    // You can process the current node itself here if needed
    // For example, add something from the node to `result`.
    return args; //html`<div class="v-stack v-stack--l"><div>${args.slice(0, args.length - 1).map(d => html.fragment`${d}`)}</div> <div style="opacity:0.4">${args[args.length - 1]}</div></div>`;
  }
  traverseEx(node, contextStack)
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

  return html`<div class="chat">${steps.map(({ premises, conclusion, questions, context }, i) => {
    const q = questions[0];
    const answer = q?.options?.find(d => d.ok)
    return html`<div class="messages">
        ${isStringContext(context) ? context : ''}
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

export function renderDeduceTreeNode(args, node, level) {
  const collapsible = false;
  let ts = args;
  const onmouseenter = (popover, button) => {
    setTimeout(() => {
      popover.showPopover({ source: button });
    }, 500);
  }

  const onmouseleave = (popover) => {
    setTimeout(() => {
      popover.hidePopover();
    }, 500);
  }
  let [premises, conclusion] = [ts.slice(0, -1), ts[ts.length - 1]];
  const result = inferenceRuleWithQuestion(mapNodeChildrenToPredicates(node))
  const option = result?.options?.find(d => d.ok);
  const proof = html`<div class="proof ${level % 2 == 0 ? 'even' : 'odd'}${collapsible && collapsible.collapsed === true ? ' hidden' : ''}" data-level=${level}>	  
    <div class="premises">    
      ${premises.map(d => html`<div class="node">${html.fragment`${d}`}</div>`)}
	  </div>
	  <div class="conclusion">
      <div class="le">${collapsible ? html`<button onclick=${(e) => proof.classList.toggle('hidden')}></button>` : ''}</div>
      <div class="ct">${html.fragment`${conclusion}`}</div>      
      <div class="ri">${result?.question != null && result.question != "" ? html`<i class="fa-solid fa-circle-question" onmouseenter=${(e) => onmouseenter(e.target.parentElement.querySelector('[popover]'), e.target)} onmouseleave=${(e) => onmouseleave(e.target.parentElement.querySelector('[popover]'))}></i>
        <div popover="hint">
          ${html`<div>${result?.question}</div>`}          
          ${option != null ? html`<div>${option.tex} = ${option.result}</div>` : ''}
        </div>` : ''}
      </div>
	  </div>
	</div>`;
  return proof;
}


export function renderPredicatePlot(newChild, node, options = { predicatesToExclude: [''] }) {
  const width = 250;
  if (newChild == null) return;
  if (options.predicatesToExclude.includes(newChild.kind)) return;

  if (newChild.kind == "cont" && isNumber(newChild.quantity)) {
    return partion([
      { agent: `${newChild.agent} ${newChild.entity ?? ''}`, value: newChild.quantity, yValue: `${newChild.unit ?? ''}` },
    ], { width, height: 50, marginLeft: 70, formatAsFraction: false, showRelativeValues: false, showSeparate: true })
  }
  else if (newChild.kind === "ratio" && newChild.ratio != null) {
    return relativeTwoPartsDiff(-(1 - newChild.ratio), { first: toAgent(newChild.part), second: `základ - ${toAgent(newChild.whole)}`, asPercent: newChild.asPercent })
  }
  else if (newChild.kind === "ratios" && newChild.parts != null) {
    if (newChild.parts?.length == 2) {
      const gcdValue = gcdCalc([newChild.ratios[0], newChild.ratios[1]]);
      if (gcdValue > 1 && gcdValue <= 10) {
        const baseRatios = [newChild.ratios[0] / gcdValue, newChild.ratios[1] / gcdValue];

        return proportionPlot({
          data: [...Array(gcdValue).keys()].flatMap(d => [
            { scaleFactor: d + 1, value: baseRatios[0], type: toAgent(newChild.parts[0]) },
            { scaleFactor: d + 1, value: baseRatios[1], type: toAgent(newChild.parts[1]) }
          ]),
          columns: [toAgent(newChild.parts[0]), toAgent(newChild.parts[1])],
          label: toAgent(newChild.whole),
        })
      }
      else {
        return relativeParts(newChild.ratios, { parts: newChild.parts })
      }
    }
    else {
      return relativeParts(newChild.ratios, { parts: newChild.parts })
    }
  }
  else if (newChild.kind === "rate" && newChild.quantity && isNumber(newChild.quantity)) {
    return partion([
      { agent: `${newChild.entity?.entity}`, value: newChild.quantity, yValue: `${newChild.entityBase?.entity}` },
    ], { width, height: 50, marginLeft: 70, formatAsFraction: false, showRelativeValues: false, showSeparate: true })
  }
  else if (newChild.kind === "unit") {
    //console.log(inferenceRuleWithQuestion(mapNodeChildrenToPredicates(node)), " -> ", newChild.unit)
    // return partion(
    //   { agent: `${newChild.entity?.entity}`, value: newChild.quantity, yValue: `${newChild.entityBase?.entity}` },
    // ], { width, height: 50, marginLeft: 70, formatAsFraction: false, showRelativeValues: false, showSeparate: true }))
  }
  else if (newChild.kind === "quota" && newChild.quantity && isNumber(newChild.quantity)) {
    return partion([
      { agent: `${newChild.agentQuota}`, value: newChild.quantity, yValue: `${newChild.agent}` },
    ], { width, height: 50, marginLeft: 70, formatAsFraction: false, showRelativeValues: false, showSeparate: true })
  }
  else if (newChild.kind === "gcd" || newChild.kind === "lcd") {
    const numbers = node.children.slice(0, -2).map(d => isPredicate(d) ? d : last(d)).map(d => d.quantity);
    return html`<div class='v-stack'><span>Rozklad na prvočísla:</span>${primeFactorization(numbers).map((d, i) => html`<div>${formatNumber(numbers[i])} = ${d.join()}</div>`)}</div>`
  }
  else if (newChild.kind === "comp-ratio" && newChild.ratio != null) {
    return relativeTwoPartsDiff(newChild.ratio >= 0 ? newChild.ratio - 1 : -(1 + (1 / newChild.ratio)), { width, first: newChild.agentA, second: newChild.agentB, asPercent: newChild.asPercent });
  }
  else if (newChild.kind === "comp-ratio" && newChild.ratio != null) {
    return relativeTwoPartsDiff(newChild.ratio >= 0 ? newChild.ratio - 1 : -(1 + (1 / newChild.ratio)), { width, first: newChild.agentA, second: `základ - ${newChild.agentB}`, asPercent: newChild.asPercent })
  }
  else if (newChild.kind === "eval-formula") {
    return;
  }
  else {
    return;
  }
}
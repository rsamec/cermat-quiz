import { html } from "npm:htl";
import * as Plot from "npm:@observablehq/plot";
import Fraction from 'npm:fraction.js';

export function partion(items, options) {
  const total = items.reduce((out, d) => out += d.value, 0);
  const data = items.map(d => ({ ...d, ratio: d.value / total }))

  const { width, height, unit, showAbsoluteValues, showRelativeValues } = {
    ...{
      height: 150,
      showRelativeValues: true,
      showAbsoluteValues: true,
    },
    ...options
  }
  return Plot.plot({
    fy: { label: null, ticks: [] },
    y: { label: null },
    color: {
      legend: true
    },
    x: { label: null, ticks: [] },
    ...(width && { width }),
    ...(height && { height }),
    marginBottom: 0,
    marginTop: showRelativeValues ? 20 : 0,
    marks: [
      Plot.waffleX(data, { x: 'value', fill: 'agent', ...(unit && { unit}), fy: "fy", opacity: d => d.opacity ?? 1 }),
      ...(showAbsoluteValues ? [
        Plot.textX(data, Plot.stackX({
          x: "value",
          text: (d, i) => `${d.fy != 99 ? d.value.toLocaleString('cs-CZ') : ''}`,
          fontSize: 16,
          fontWeight: 900,
          textAnchor: 'middle',
          lineAnchor: "middle",
          frameAnchor: "middle",
          dy: 0,
          fy: "fy"
        }))] : []),
      ...(showRelativeValues ? [
        Plot.textX(data, Plot.stackX({
          x: "value",
          text: (d, i) => {
            const { hidePercent, hideFraction } = { ...{ hideFraction: true }, ...d.label };
            const percent = !hidePercent ? `${(d.ratio * 100).toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} %` : null;
            const fraction = !hideFraction ? `${new Fraction(d.ratio).toFraction()}` : null;
            return [percent, fraction].filter(Boolean).join(" | ");
          },
          fy: "fy",
          fontSize: 16,
          textAnchor: 'middle',
          lineAnchor: "bottom",
          frameAnchor: "top",
          dy: 0
        }))] : []),
    ]
  })
};

export function relativePartsData(d, { first, second } = {}) {
  const label = { hideValue: true, hidePercent: true, hideFraction: false };
  return [
    { agent: second, value: 1 - d, label },
    { agent: first, value: d, label },
  ]
}
export function relativePartsDiffData(d, { first, second } = {}) {
  const label = { hideValue: true, hidePercent: true, hideFraction: false };
  
  return [
    { agent: first, value: d > 0 ? 1 :  1 + d, label, fy: 0 },
    ...(d > 0 ? [{ agent: first, value: d, label, fy: 0 }]:[]),
    { agent: second, value: 1 - Math.abs(d), label, fy: 1 },
    ...(d != 0 ? [{ agent: second, value: Math.abs(d), fy: 1, label }]:[])
  ]
}

export function relativeParts(d, options) {
  return partion(relativePartsData(d, options), { width: 180, height:50,  showAbsoluteValues: false })
}
export function relativePartsDiff(d, options) {
  return partion(relativePartsDiffData(d, options), { width: 200, height: 70, showRelativeValues: false, unit:1 })
}

function label(d) {
  return html`<div class=${`badge badge--${d.kind}`} >${d.id}</div>`
}
export function formatNode(t, label) {
  return html`${label != null ? label: ''}&nbsp;${t?.kind !=null ? formatPredicate(t): t}`
}
function formatPredicate(d){ 
  const formatEntity = (d, absolute) => 
    html`${(absolute ? Math.abs(d.quantity): d.quantity ).toLocaleString('cs-CZ')}&nbsp;${d.entity}${d.unit!=null ? `&nbps;${d.unit}`: ''}`
  switch (d.kind){
    case "cont":
      return html`${d.agent}=${formatEntity(d)}`;
    case "comp":
      return html`${d.agentA} ${d.quantity > 0 ? 'více':'méně'} než ${d.agentB} o ${formatEntity(d,true)}`
    case "diff":
      return html`rozdíl=${formatEntity(d)}`
    case "ratio":
      return html`${d.partAgent} z ${d.wholeAgent}=${new Fraction(d.ratio).toFraction()}`;
    case "sum":
      return html`součet ${d.partAgents.join("+")}`;
    case "rate":
      return html`${d.quantity} ${d.entityA.entity} per ${d.entityB.entity}`
    default:
      return html`${d.kind}`;
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

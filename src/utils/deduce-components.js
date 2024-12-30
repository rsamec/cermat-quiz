import { html } from "npm:htl";
import * as Plot from "npm:@observablehq/plot";
import Fraction from 'npm:fraction.js';
import { isSameEntity } from "../components/math.js";

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
        opacity: d => d.opacity ?? 1
      }),
      ...(showAbsoluteValues ? [
        Plot.textX(data, Plot.stackX({
          x: "value",
          text: (d, i) => `${formatAsFraction ? new Fraction(d.value).toFraction() : d.value.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })}`,
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
  return partion(relativePartsDiffData(d, options), { width: 300, height: 100, formatAsFraction: !options.asPercent, showRelativeValues: false, unit: 1, multiple: options.asPercent ? 5 : undefined, showSeparate: true })
}

function label(d) {
  return html`<div class=${`badge badge--${d.kind}`} >${d.id}</div>`
}
export function formatNode(t, label) {
  return html`${label != null ? label : ''}&nbsp;${t?.kind != null ? formatPredicate(t) : t}`
}
export function formatPredicate(d) {
  const formatQuantity = (d, absolute) => (absolute ? Math.abs(d.quantity) : d.quantity).toLocaleString('cs-CZ')
  const formatEntity = (d) => d.entity
  const formatQuantityWithEntity = (d, absolute) => html`${formatQuantity(d, absolute)}&nbsp;${formatEntity(d)}`;

  if ((d.kind == "ratio" || d.kind === "comp-ratio" || d.kind === "rate" || d.kind === "comp-diff" || d.kind === "comp-part-eq") && (d.quantity == null && d.ratio == null)) {
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
      result = html`${d.agentA} ${formatQuantity(d, true)} krát ${d.quantity > 0 ? 'více' : 'méně'}&nbsp;${formatEntity(d)} než ${d.agentB} `
      break;
    case "comp-diff":
      result = html`${d.agentMinuend} - ${d.agentSubtrahend}=${formatQuantityWithEntity(d)}`
      break;
    case "ratio":
      result = html`${formatAgentEntity(d)}=${new Fraction(d.ratio).toFraction()}`;
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
  return html`${formatToBadge(d)} ${result}`;
}

function formatToBadge({ kind } = {}) {
  return html`<div class="badge">${kind === "cont" ? "C" : kind.toUpperCase()}</div>`
}

function formatAgentEntity(ratio) {
  const isSame = isSameEntity(ratio);
  const to = d => d?.agent != null
    ? isSame
      ? d.agent
      : `${d.agent}(${d.entity})`
    : d
  return `${to(ratio.part)} z ${to(ratio.whole)}`;
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

      const res = substitution
        ? html`${curr}<span class="highlight">${inputLabel(startNumber + i)} ${substitution}</span>`
        : curr;
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

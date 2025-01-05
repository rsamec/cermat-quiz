import { parseArgs } from "node:util";
import path from 'path';
import mdPlus from './utils/md-utils.js';
import { parseQuiz } from './utils/quiz-parser.js';
import { readJsonFromFile } from './utils/file.utils.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCode, text, isEmptyOrWhiteSpace } from './utils/quiz-string-utils.js';
// import wordProblems from './math/word-problems.js';
// import { isPredicate } from "./utils/deduce-utils.js";
import Fraction from 'fraction.js';

const wordProblems = {}
const isPredicate = () => true;

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});


const d = parseCode(code);
const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);


const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
const quiz = parseQuiz(rawContent);


const merge = (f, s) => {
  return Object.keys(s).reduce((merged, key) => {
    merged[key] = { ...f[key], ...s[key] }
    return merged;
  }, { ...f })
}
const expressions = await readJsonFromFile(path.resolve('./src/data/math-answers.json'))
const geometry = await readJsonFromFile(path.resolve('./src/data/math-geometry.json'))

const result = Object.keys(geometry).reduce((merged, key) => {
  merged[key] = merge(expressions[key], geometry[key])
  return merged;
}, { ...expressions })



const answers = result[code];
const ids = quiz.questions.map(d => d.id);

const wordProblem = wordProblems[code];

process.stdout.write(`---
title: ${formatCode(code)}
sidebar: true
header: ${formatCode(code)}
footer: false
pager: true
toc: true
style: /assets/css/print-solution.css
---
<style>

details.solutions > summary > h1, h2 {
    display:inline-block;
}
</style>
${answers == null ? `<div class="warning" label="Upozornění">
  K tomuto testu v tuto chvíli neexistují žádná řešení.
</div>`: ''}
<div class="root">${ids.map(id => {
  const values = (answers[id] != null) ? [[id, answers[id] ?? wordProblem[id]]] : [1, 2, 3].map(i => answers?.[`${id}.${i}`]).filter(Boolean).map((d, index) => [`${id}.${index + 1}`, d])


  return `${mdPlus.renderToString(quiz.content([id], { ids, render: 'content' }), { docId: `${code}-${id}` })}
${values?.length > 0
      ? `<details class="solutions" open>
<summary><h2 style="flex:1;" id="s-${id}">Řešení úloha ${id}</h2></summary>
${values.map(([key, value]) => `<div class="card break-inside-avoid-column">${(value.results ?? []).map(d => renderResult(key, d)).join('')}${value.template != null ? value.template(highlight) : ''}
<div>
${value.deductionTree != null ? deduceTraverse(value.deductionTree) : ''}
</div>
</div>`).join("")}
</details>`: ''}
`}).join('')}`)



function normalizeMath(value) {
  return value
    .replace(/±/g, `\\pm`)
    .replace(/\$\$(\s+)\$\$/g, '$$$\n$$$');
}
function renderResult(key, { Name, Answer, TemplateSteps }) {
  return `<h3>${Name}</h3>
  ${Answer != null ? `<div class="card">
    ${mdPlus.renderToString(normalizeMath(Answer))}
  </div>`: ''}
<div class="v-stack v-stack--m">${TemplateSteps.map((d, i) =>
    `<div class="v-stack v-stack--s">
<video src="./assets/math/${code}/${key}-${i}.mp4" playsinline muted controls></video>
${d.Steps?.length > 0 ? renderTemplateSteps(d) : ''}
</div>`).join("")}
</div>`
}
function renderTemplateSteps({ Name, Steps }) {
  return `<details class="solution">
  <summary class="solution" >${Name}</summary>
  <div class="grid grid-cols-1" style="grid-auto-rows: auto;">
    ${Steps.map((d, i) => renderStep(d, i)).join("")}
  </div>
  </details>`
}

function renderStep({ Step, Hint, Expression }, index) {
  return `<div class="card">
  <div class="h-stack h-stack--m"><span style="font-size:60px">${index + 1}</span>${mdPlus.renderToString(normalizeMath(Step))}</div>  
  <div>${mdPlus.renderToString(normalizeMath(Expression))}</div>
  ${!isEmptyOrWhiteSpace(Hint) ? `<div class="tip">${Hint}</div>` : ''}
  </div>`
}

function highlight(strings, ...substitutions) {

  const formattedString = strings.reduce((acc, curr, i) => {
    const substitution = substitutions[i];

    const res = substitution && typeof substitution === "function"
      ? `${curr}${substitution(concatString)}`
      : substitution
        ? `${curr}<span class="highlight">${inputLabel(1 + i)} ${substitution}</span>`
        : `${curr}`;
    return `${acc}${res}`;
  }, '');

  return formattedString;
}

export function concatString(strings, ...substitutions) {
  const formattedString = strings.reduce((acc, curr, i) => {
    const substitution = substitutions[i];

    const res = substitution
      ? `${curr}${substitution}`
      : curr;
    return `${acc}${res}`;
  }, '');

  return formattedString;
}

function deduce(...ts) {
  const premises = ts.slice(0, -1);
  const conclusion = ts.slice(-1);


  const proof = `<div class="proof">
	  <div class="premises">
      ${premises.map(t => `<div class="node leaf">${t}</div>`).join('')}
	  </div>
	  <div class="conclusion">
      <div class="le"></div>
      <div class="ct">
      ${conclusion}
      </div>
      <div class="ri"></div>
	  </div>
	</div>`;

  return proof;

}


function deduceTraverse(node) {
  let counter = 1;
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
      return 'FIGURE' //node;
    }

    const args = []
    // Recursive case: traverse each child
    if (node.children) {
      let i = 0;
      for (const child of node.children) {
        const isLast = node.children.length === ++i;
        const newChild = isLast && isPredicate(child) ? { ...child, ...{ labelKind: 'deduce', label: counter++ } } : child
        args.push(deduceTraverseEx(newChild))
      }
    }

    // You can process the current node itself here if needed
    // For example, add something from the node to `result`.

    const res = deduce(...args)
    return res;
  }
  return deduceTraverseEx(node)
}

function formatNode(t, label) {
  return `${label != null ? label : ''}&nbsp;${t?.kind != null ? formatPredicate(t) : t}`
}
function formatPredicate(d) {
  const formatQuantity = (d, absolute) => (absolute ? Math.abs(d.quantity) : d.quantity).toLocaleString('cs-CZ')
  const formatEntity = (d) => d.entity
  const formatQuantityWithEntity = (d, absolute) => `${formatQuantity(d, absolute)}&nbsp;${formatEntity(d)}`;

  if ((d.kind == "ratio" || d.kind === "comp-ratio" || d.kind === "rate" || d.kind === "comp-diff" || d.kind === "comp-part-eq") && (d.quantity == null && d.ratio == null)) {
    return formatToBadge(d);
  }

  let result = ''
  switch (d.kind) {
    case "cont":
      result = `${d.agent}=${formatQuantityWithEntity(d)}`;
      break;
    case "comp":
      result = `${d.agentA} ${d.quantity > 0 ? 'více' : 'méně'} než ${d.agentB} o ${formatQuantityWithEntity(d, true)}`
      break;
    case "comp-ratio":
      const between = (d.quantity > -1 && d.quantity < 1);
      result = between 
        ? `${d.agentA}  ${d.quantity > 0 ? 'méně' : 'více'} ${new Fraction(Math.abs(d.quantity)).toFraction()}&nbsp;${formatEntity(d)} než ${d.agentB} `
        : `${d.agentA} ${formatQuantity(d, true)} krát ${d.quantity > 0 ? 'více' : 'méně'}&nbsp;${formatEntity(d)} než ${d.agentB} `
      break;
    case "comp-diff":
      result = `${d.agentMinuend} - ${d.agentSubtrahend}=${formatQuantityWithEntity(d)}`
      break;
    case "ratio":
      result = `${formatAgentEntity(d)}=${new Fraction(d.ratio).toFraction()}`;
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

function formatToBadge({ kind } = {}) {
  return `<div class="badge">${kind === "cont" ? "C" : kind.toUpperCase()}</div>`
}

function inputLabel(id) {
  return label({ id, kind: 'input' })
}
function deduceLabel(id) {
  return label({ id, kind: 'deduce' })
}
function label(d) {
  return `<div class="badge badge--${d.kind}">${d.id}</div>`
}

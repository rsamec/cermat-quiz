import { parseArgs } from "node:util";
import path from 'path';
import mdPlus from './utils/md-utils.js';
import { parseQuiz } from './utils/quiz-parser.js';
import { readJsonFromFile } from './utils/file.utils.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCode, text, isEmptyOrWhiteSpace } from './utils/quiz-string-utils.js';
import wordProblems, { inferenceRuleWithQuestion, formatPredicate, formatSequencePattern } from './math/word-problems.js';
import Fraction from 'fraction.js';

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});

const formatting = {
  compose: (strings, ...args) => concatString(strings, ...args),
  formatKind: d => ``,
  formatQuantity: d => d.toLocaleString('cs-CZ'),
  formatRatio: (d, asPercent) => d != null
    ? (asPercent
      ? `${(d * 100).toLocaleString('cs-CZ')}%`
      : new Fraction(d).toFraction())
    : d,
  formatEntity: (d, unit) => `<i>${[unit, d].filter(d => d != null).join(" ")}</i>`,
  formatAgent: d => `<b>${d}</b>`,
  formatSequence: d => formatSequencePattern(d)
}

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
const videoExlusions = await readJsonFromFile(path.resolve('./src/data/math-answers-video-exclude.json'))
const geometry = await readJsonFromFile(path.resolve('./src/data/math-geometry.json'))

const result = Object.keys(geometry).reduce((merged, key) => {
  merged[key] = merge(expressions[key], geometry[key])
  return merged;
}, { ...expressions })



const answers = result[code];
const videoExclude = videoExlusions[code] ?? {};
const ids = quiz.questions.map(d => d.id);

const wordProblem = wordProblems[code];

const solutionsCount = uniqueQuestion(answers) + uniqueQuestion(wordProblem)
const solutionRate = solutionsCount / quiz.questions.length;
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
${solutionsCount == 0 ? `<div class="danger" label="Upozornění">
  K tomuto testu v tuto chvíli neexistují žádná řešení.
</div>`: ''}
${solutionsCount < quiz.questions.length ? `<div class=${solutionRate < 0.2 ? 'caution' : solutionRate < 0.8 ? 'warning' : 'tip'} label="Upozornění">
  Vyřešeno ${solutionsCount} z ${quiz.questions.length} otázek.
</div>`: ''}

<div class="root">${ids.map(id => {
  const values = (answers?.[id] != null || wordProblem?.[id] != null)
    ? [[id, answers[id] ?? wordProblem[id]]]
    : [1, 2, 3]
      .map(i => `${id}.${i}`)
      .map(subId => answers?.[subId] ?? wordProblem?.[subId])
      .filter(Boolean)
      .map((d, index) => [`${id}.${index + 1}`, d])


  return `${mdPlus.renderToString(quiz.content([id], { ids, render: 'content' }), { docId: `${code}-${id}` })}
${values?.length > 0
      ?
      `<div class="break-inside-avoid-column">${values.map(([key, value]) => `<h2 id="s-${key}">Řešení úloha ${key}</h2><div class="card">${(value.results ?? []).map(d => renderResult(key, d)).join('')}
<div>
${value.deductionTree != null ? renderChat(value.deductionTree) : ''}
</div>
</div>`).join("")}
</div>`: ''}
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
${videoExclude[key]?.includes(i) ? '' : `<video src="./assets/math/${code}/${key}-${i}.mp4" playsinline muted controls></video>`}
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

function renderChat(deductionTree) {
  const steps = stepsTraverse(deductionTree).map((d, i) => ({ ...d, index: i }));

  return `<div class="chat">${steps.map(({ premises, conclusion, questions }, i) => {
    const q = questions[0];
    const answer = q?.options?.find(d => d.ok)
    return `<div class="messages">
<div class='message v-stack v-stack--s'>${premises.join("")}</div>
${q != null ? `<div class='message agent v-stack v-stack--s'>
<div>${q?.question}</div>
${answer != null ? `<div>${answer.tex} = ${answer.result}</div>` : ''}
</div>`: ''}
${steps.length == i + 1 ? `<div class='message'>${conclusion}</div>` : ''}
</div>`}).join("")}</div>`
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
          : null);
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

        // if (!isLast) {
        //   if (newChild?.kind === "gcd" || newChild?.kind === "lcd") {
        //     const numbers = node.children.slice(0, -2).map(d => d.quantity);
        //     args.push(`<div class='v-stack'><span>Rozklad na prvočísla:</span>${primeFactorization(numbers).map((d, i) => html`<div>${formatNumber(numbers[i])} = ${d.join()}</div>`)}</div>`)
        //   }
        // }

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
function formatNode(t, label) {
  return `<span>${label != null ? label : ''} ${t?.kind != null ? formatPredicate(t, formatting) : t}</span>`
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
function inputLabel(id) {
  return label({ id, kind: 'input' })
}
function deduceLabel(id) {
  return label({ id, kind: 'deduce' })
}
function label(d) {
  return `<div class="badge badge--${d.kind}">${d.id}</div>`
}
function normalizeToArray(d) {
  return Array.isArray(d) ? d : [d]
}

function isPredicate(node) {
  return node.kind != null;
}

function uniqueQuestion(obj) {
  if (obj == null) {
    return 0;
  }
  const keys = Object.keys(obj);
  return keys.map(d => d.split('.')[0]).filter((d, i, arr) => arr.indexOf(d) === i).length
}
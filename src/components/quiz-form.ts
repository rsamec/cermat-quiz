import { parser, GFM, Subscript, Superscript } from '@lezer/markdown';
import mdPlus from "../utils/md-utils.js";
import { html } from "npm:htl";
import { signal, computed } from '@preact/signals-core';
import { convertTree } from '../utils/quiz-utils.js';
import { formatCode } from '../utils/quiz-string-utils.js';
import { html as rhtml } from '../utils/reactive-htl.js';
import tippy from 'tippy.js';
import { getVerifyFunction } from '../utils/assert.js';
import Sortable from 'sortablejs/modular/sortable.core.esm.js';
import { getAllLeafsWithAncestors, getQuizBuilder, OptionList, ShortCodeMarker } from '../utils/parse-utils.js';
import * as Inputs from 'npm:@observablehq/inputs';
import { isEmptyOrWhiteSpace, cls, normalizeLatex } from '../utils/string-utils.js';

type QuizParams = {
  questions: string[][],
  quizQuestionsMap: Record<string, { metadata: any, rawContent: string }>,
  subject: string,
  displayOptions: { useCode?: boolean, useAIHelpers?: boolean, avoidBreakInsideQuestion?: boolean, useFormControl?: boolean, useResources?:boolean }
  resourcesMap?: Record<string, any>
  mathResourcesMap?: Record<string, any>
}

function parseQuestionId(id, subject) {
  const parts = id.split(".");
  return parseInt(
    (subject === "cz" || subject === "math") ? parts[0] : parts[1],
    10
  );
}


export function renderedQuestionsPerQuiz(params: QuizParams) {
  const questionsToRender = params.questions?.length > 0 ? renderedQuestionsByQuiz(params).renderedQuestions : [];
  return questionsToRender;
}
export function renderedQuestionsPerQuizWithInputs(params: QuizParams) {
  const questionsToRender = params.questions?.length > 0 ? renderedQuestionsByQuiz(params) : [];
  return questionsToRender;
}

function chunkMetadataByInputs(metadata, subject, selectedIds = []) {
  const leafs = Object.groupBy(getAllLeafsWithAncestors(convertTree(metadata)), ({ leaf }) => parseQuestionId(leaf.data.id, subject))
  //return leafs;
  return Object.entries(leafs).filter(([key,]) => selectedIds.indexOf(parseInt(key, 10)) !== -1).reduce((out, [key, values]) => {
    const groupKey = values[0].ancestors[1].data.node.metadata?.inline ?? false;
    const lastValue = out.length > 0 ? out[out.length - 1] : null;

    if (lastValue == null || lastValue[0] != groupKey) {
      out.push([groupKey, [[key, values]]]);
    } else {
      lastValue[1].push([key, values]);
    }

    return out;
  }, []);
}

function renderedQuestionsByQuiz({ questions, quizQuestionsMap, subject, displayOptions, resourcesMap, mathResourcesMap }: QuizParams) {
  const { avoidBreakInsideQuestion, useCode, useAIHelpers, useFormControl, useResources } = displayOptions;
  const inputsStore: Record<string, Record<string, any>> = {}
  return {
    renderedQuestions: questions.map(
      ([code, ...id], index) => {
        const ids = id.map(id => parseInt(id, 10));
        const quiz = quizQuestionsMap[code];
        const quizBuilder = quiz ? makeQuizBuilder(quiz.rawContent) : null;
        const optionsMap = Object.fromEntries(
          quizBuilder.questions.map((d) => [d.id, d.options])
        );
        const chunks = chunkMetadataByInputs(quiz.metadata, subject, ids);
        const submit = "Odeslat"

        const resource = resourcesMap?.[code];
        const mathResource = mathResourcesMap?.[code];

        return chunks.flatMap(([inline, g], i) => {
          const codeComponent = useCode && i === 0 ? (questionIndex) => questionIndex === 0 ? html`<h0>${formatCode(code)}</h0>` : null : () => null
          if (inline) {
            const ids = g.map(([key, leafs]) => parseInt(key, 10));
            const leafs = g.flatMap(([key, leafs]) => leafs);
            const metadataMap = Object.fromEntries(
              leafs.map((data) => {
                const d = data.leaf.data.node;
                const label = data.leaf.data.id;
                const id = parseQuestionId(label, subject);
                return [id, d]
              }))

            const context = Object.fromEntries(
              leafs.map((data) => {
                const d = data.leaf.data.node;
                const labelId = data.leaf.data.id;
                const id = parseQuestionId(labelId, subject);
                const { inputBy, verifyBy } = d;

                const component = inputBy.kind == "options"
                  ? Inputs.button(
                    optionsMap[id]?.map((opt) => [opt.name, (value) => opt])
                  )
                  : Inputs.text({ submit: true })

                const currentStore = inputsStore[code];
                if (currentStore == null) {
                  inputsStore[code] = {}
                }
                inputsStore[code][labelId] = component

                return [
                  id,
                  toTooltipInput(component)
                ];

              })
            )
            const env = { docId: `${code}-${i}` };
            return html`<div class=${cls(['q', avoidBreakInsideQuestion ? 'break-inside-avoid-column' : ''])}>${codeComponent(0)}${useFormControl
              ? toTemplate(quizBuilder.content(ids, { rootOnly: true }), env, context, (key) => {
                const metadata = metadataMap[key];
                const options = optionsMap[key];

                return (value) => {
                  if (isEmptyAnswer(value))
                    return ".........";
                  if (metadata == null || options == null) {
                    return value;
                  }
                  const verifyBy = metadata.verifyBy;
                  const answer = verifyBy.args;
                  const option = options?.find((d) => d.value === answer);
                  const valValue = value.value ?? value;
                  const formattedValue = value.name ?? value;
                  const isCorrect = answer.source
                    ? valValue.match(answer.source)
                    : valValue === answer;


                  return isCorrect
                    ? html`<span class="answer-text--right">${formattedValue}</span>`
                    : html`<span class="answer-text--right">${option?.name ?? answer.source ?? answer}</span> <span class="answer-text--wrong">${formattedValue}</span>`
                };
              })
              : mdPlus.unsafe(quizBuilder.content(ids, { render: 'content' }), env)
              }</div>`;

          }
          else {
            const groupedIds = g.map(([key]) => [parseInt(key, 10)]);            
            return g.map(([key, leafs], qIndex) => {
              const ids = [parseInt(key, 10)];
              //const filteredIds = ids.filter(id => id == key);        
              const rawContent = html`${mdPlus.unsafe(quizBuilder.content(ids, { ids: groupedIds, render: useFormControl ? 'contentWithoutOptions' : 'content' }), { docId: `${code}-${key}` })}`;              
              const mathResourceEntries = mathResource != null ? leafs
                .flatMap(d => {
                  return (mathResource[d.leaf.data.id]?.results ?? [])
                    .flatMap((x) => (x.TemplateSteps ?? []).map((x,i) => ({x,i})))
                    .map(({x,i}) => ([d.leaf.data.id,x,i]));
                }):[]
              return html`<div class=${cls(['q', `q-${key}`, avoidBreakInsideQuestion ? 'break-inside-avoid-column' : ''])}>
            ${codeComponent(qIndex)}
            <div>
              ${rawContent}
            </div>
            
            ${useAIHelpers ? html`<div class="h-stack h-stack--m h-stack--wrap h-stack--end">
              <a href="#" onclick=${(e) => {
                    e.preventDefault();
                    window.open(`https://chat.openai.com/?q=${encodeURIComponent(quizBuilder.content(ids, { render: 'content' }))}`)
                  }}><img src="https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white" alt="ChatGPT" /></a>
            ${html`<a href="#" class="a-button a-button--clipboard" onclick=${(e) => {
                    e.preventDefault();
                    var el = e.target.querySelector("i") ?? e.target;
                    if (el != null) {
                      el.classList.remove("fa-clipboard");
                      el.classList.add("fa-clipboard-check");
                    }
                    navigator.clipboard.writeText(quizBuilder.content(ids, { render: 'content' }));
                  }}><i class="fa fa-clipboard" aria-hidden="true"></i></a>`}
              </div>`: ''}
          
            ${useFormControl ? rhtml`<div class="form-group">${leafs.map((data) => {
                    const d = data.leaf.data.node;
                    const labelId = data.leaf.data.id;
                    const id = parseQuestionId(labelId, subject);

                    const { inputBy, verifyBy } = d;
                    const label = leafs.length > 1 && labelId;
                    const options = optionsMap[id] ?? [];

                    if (verifyBy.kind === "selfEvaluate") {
                      const { hint } = verifyBy.args;
                      return ''
                      if (hint.kind == "image") {
                        return html`<img src=${hint.src}>`
                      }
                      else {
                        return ''
                      }
                    }
                    else {

                      const component = Array.isArray(inputBy)
                        ? toForm(({ template }) => Inputs.form(inputBy.map((inputBy, index) => renderSingleInputByType({ inputBy, label: `${index + 1}.`, submit: false, options })), { submit, template }), { label })
                        : inputBy.kind != null
                          ? renderSingleInputByType({ inputBy, label, submit, options })
                          : toForm(({ template }) => Inputs.form(Object.entries(inputBy).reduce((out, d) => {
                            const [key, inputBy] = d;
                            out[key] = renderSingleInputByType({ inputBy, label: key, submit: false, options });
                            return out;
                          }, {}), { submit, template }), { label })

                      component.classList.add("form-control");

                      const inputValue = useInput(component);
                      const currentStore = inputsStore[code];
                      if (currentStore == null) {
                        inputsStore[code] = {}
                      }
                      inputsStore[code][labelId] = component


                      const validator = getVerifyFunction(verifyBy);

                      const answerClass = computed(() => {
                        const value = inputValue.value;
                        if (isEmptyAnswer(value)) {
                          return 'answer';
                        }
                        const error = validator(value);
                        return `answer answer-${error == null}`;
                      });
                      const answerTooltip = computed(() => {
                        const value = inputValue.value;
                        const tooltipMessage = isEmptyAnswer(value) ? '' : JSON.stringify(validator(value)?.expected);
                        return tooltipMessage;
                      })
                      const answerTooltipClass = computed(() => {
                        const value = inputValue.value;
                        const tooltipClass = isEmptyAnswer(value) || validator(value) == null ? 'hidden' : '';
                        return tooltipClass;
                      })
                      const tooltip = toolTipper(
                        html`<i class='fa-regular fa-circle-question'></i>`,
                        () => rhtml`${answerTooltip}`);
                      const wrappedComponent = inputBy.kind === "options" || inputBy.kind === "bool"
                        ? rhtml`<div class=${answerClass}>${component}</div>`
                        : rhtml`<div class="h-stack h-stack--s h-stack-items--center"><div class=${answerClass}>${component}</div><div class=${answerTooltipClass}>${tooltip}</div></div>`
                      return wrappedComponent;
                    }
                    ;
                  })}</div>` : ''}
            ${useResources ? html`<div class="v-stack v-stack--s">
              ${useResources && mathResourceEntries.length > 0 ? html`<details class="solution"><summary>Řešení úlohy</summary><div class="v-stack v-stack--s">
              ${mathResourceEntries.map(([key,value,i]) => html.fragment`<div class="h-stack h-stack--s">
                <span style="flex:1">${key} - ${value.Name}</span>
                <a href="./math-${code}"><i class="fa-solid fa-square-up-right"></i></a>
              </div>
              <video src="./assets/math/${code}/${key}-${i}.mp4" playsinline muted controls></video>`)}</div></details>` : ''}
              
              ${useResources && useAIHelpers && resource && !isEmptyOrWhiteSpace(resource[ids[0]]) ? html`
            <details class="solution"><summary><span style="margin-right: 1rem;">AI řešení - <span class='yellow'><i class="fa-solid fa-circle-exclamation"></i> může být chybně <i class="fa-solid fa-circle-exclamation"></i></span></span></summary><div>${mdPlus.unsafe(normalizeLatex(resource[ids[0]]))}<div></details>` : ''}
            </div>
            `:''}
          </div>`
            })
          }
        })
      }),
    inputs: inputsStore
  };
}

function renderSingleInputByType({ inputBy, label, options, submit }) {
  return inputBy.kind === "sortedOptions"
    ? toForm(({ footer }) => sortableInput(options, { format: d => html`<strong>${d.value})</strong> ${d.name}`, footer }), { submit })
    : inputBy.kind === "options"
      ? Inputs.radio(options, {
        format: (d) => mdPlus.unsafe(d.name),
        label,
      })
      : inputBy.kind === "bool"
        ? Inputs.radio([{ value: true, name: "Ano" }, { value: false, name: "Ne" }], {
          format: (d) => d.name,
          label,
        })
        : inputBy.kind === "number"
          ? Inputs.number({ submit, label })
          : Inputs.text({ submit, label });
}
function useInput(input) {
  const s = signal(input.value);

  // Update the signal on input events from the range slider
  const changed = (e) => (s.value = input.value);

  input.addEventListener("input", changed);
  //invalidation.then(() => input.removeEventListener("input", changed));
  return s;

}
function makeQuizBuilder(normalizedQuiz) {
  const markdownParser = parser.configure([[ShortCodeMarker, OptionList], GFM, Subscript, Superscript]);
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz, { render: 'contentWithoutOptions' });
}
function toTooltipInput(input) {

  const s = useInput(input);

  const tooltip = html`<span>
  ${toolTipper(
    html`<button class="btn btn--primary"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-index" viewBox="0 0 16 16">
  <path d="M6.75 1a.75.75 0 0 1 .75.75V8a.5.5 0 0 0 1 0V5.467l.086-.004c.317-.012.637-.008.816.027.134.027.294.096.448.182.077.042.15.147.15.314V8a.5.5 0 1 0 1 0V6.435l.106-.01c.316-.024.584-.01.708.04.118.046.3.207.486.43.081.096.15.19.2.259V8.5a.5.5 0 0 0 1 0v-1h.342a1 1 0 0 1 .995 1.1l-.271 2.715a2.5 2.5 0 0 1-.317.991l-1.395 2.442a.5.5 0 0 1-.434.252H6.035a.5.5 0 0 1-.416-.223l-1.433-2.15a1.5 1.5 0 0 1-.243-.666l-.345-3.105a.5.5 0 0 1 .399-.546L5 8.11V9a.5.5 0 0 0 1 0V1.75A.75.75 0 0 1 6.75 1M8.5 4.466V1.75a1.75 1.75 0 1 0-3.5 0v5.34l-1.2.24a1.5 1.5 0 0 0-1.196 1.636l.345 3.106a2.5 2.5 0 0 0 .405 1.11l1.433 2.15A1.5 1.5 0 0 0 6.035 16h6.385a1.5 1.5 0 0 0 1.302-.756l1.395-2.441a3.5 3.5 0 0 0 .444-1.389l.271-2.715a2 2 0 0 0-1.99-2.199h-.581a5 5 0 0 0-.195-.248c-.191-.229-.51-.568-.88-.716-.364-.146-.846-.132-1.158-.108l-.132.012a1.26 1.26 0 0 0-.56-.642 2.6 2.6 0 0 0-.738-.288c-.31-.062-.739-.058-1.05-.046zm2.094 2.025"/>
</svg></button>`,
    () => html`${input}`,
    {
      trigger: "click",
      onShow: (instance) => {
        instance.popper.querySelector("input")?.focus();
        instance.popper.querySelectorAll("button").forEach((el) =>
          el.addEventListener("click", (event) => {
            instance.hide();
          })
        );
      }
    }
  )}</span>`
  return [tooltip, s]
}
function toTemplate(
  template,
  env,
  context,
  formatValue = (key) => value => value,

) {

  // Function to replace placeholders based on the mask number (e.g., (1), (2), (3))
  const interpolateString = (str) => {
    const maskPlaceholderPattern = /\(\*\*(\d+)\*\*\)\s*(_+)/g;
    return str.replace(maskPlaceholderPattern, (match, maskNumber) => {
      return `**(${maskNumber})** **(formatValue(${maskNumber})(context[${maskNumber}]?.[1].value))}**  \${context[${maskNumber}]?.[0]}`;
    });
  };

  // Apply the string interpolation
  const updatedStrings = mdPlus.renderToString(interpolateString(template), env).replaceAll("(formatValue(", "\${computed(() => formatValue(")


  // Safely create a template literal using new Function
  const dynamicEvaluator = (templateStr, context) => {
    const func = new Function(
      "rhtml",
      "context",
      "computed",
      "formatValue",
      `return rhtml\`${templateStr}\`;`
    );
    return func(rhtml, context, computed, formatValue);
  };

  // Evaluate the final interpolated strings
  const finalStrings = dynamicEvaluator(updatedStrings, context);
  return finalStrings;

  //   return rmd`# Ahoj ${values(context[1])}
  // ${finalStrings}`;
}
function toolTipper(element, contentFunc = () => "", props = {}) {
  const parent = html`<div>`;
  Object.assign(parent.style, {
    position: "relative",
    display: "inline-flex"
  });
  parent.append(element);
  const def = {
    followCursor: false,
    allowHTML: true,
    interactive: true,
    hideOnClick: "toggle",
    theme: 'observable',
    content: contentFunc(),
    onClickOutside: (instance) => instance.hide()
  };
  const instance = tippy(parent, { ...def, ...props });
  // element.onmousemove = element.onmouseenter = (e) => {
  //   instance.setContent(contentFunc(e.offsetX, e.offsetY));
  // };
  return parent;
}
function isEmptyAnswer(value) {
  if (isEmptyOrWhiteSpace(value)) {
    return true;
  }
  if (Array.isArray(value) && value.every(d => isEmptyOrWhiteSpace(d))) {
    return true;
  }
  const values = Object.values(value);
  if (values.length > 0 && values.every((d: string) => isEmptyOrWhiteSpace(d))) {
    return true;
  }
  return false;
}
function toInputGroup({ type, value, label }: { type: 'text' | 'number', value: any, label: string }, inputBy) {
  const { prefix, suffix } = inputBy.args ?? {};

  let wrapper = html`<label>${label}</label>`;
  let input = html`<input type=${type}>`;

  if (!isEmptyOrWhiteSpace(prefix)) {
    wrapper.append(html`<span>${mdPlus.unsafe(prefix)}</span>`)
  }
  wrapper.append(input);
  if (!isEmptyOrWhiteSpace(suffix)) {
    wrapper.append(html`<span>${mdPlus.unsafe(suffix)}</span>`)
  }

  input.value = value

  input.addEventListener('change', (e) => {
    wrapper.value = input.value
    wrapper.dispatchEvent(new CustomEvent('input'))
  })

  // we need to have a starting value
  wrapper.value = input.value

  return wrapper
}

function toInput(node) {
  if (!hasValueProperty(node)) {
    Object.defineProperty(node, "value", {
      get: () => getInputNode(node)?.value,
      set: (value) => {
        const input = getInputNode(node);
        if (input != null) input.value = value;
      }
    });
  }
  return node;
}

function getInputNode(node) {
  let found = null;
  visitNodes(node, (n) => {
    if (!hasValueProperty(n) || n === node) return true;
    found = n
    return false;
  });
  return found;
}
function hasValueProperty(n) {
  if (Object.hasOwn(n, "value")) return true;
  return (
    typeof n === "object" && Object.hasOwn(n.constructor.prototype, "value")
  );
}
function visitNodes(node, callback) {
  const r = callback(node);
  if (r !== undefined && !r) return false;
  for (let n = node.firstChild; n; n = n.nextSibling) {
    visitNodes(n, callback);
  }
  return true;
}
function toForm(fn, options: any = {}) {
  const {
    submitLabel = 'Submit',
    resetLabel = 'Reset',
    required = false,
    resubmit = true,
    width = 'fit-content',
    justify = 'start',
    label,
  } = options;
  const onSubmit = () => {
    value = input.value;
    submit.disabled = !resubmit;
    reset.disabled = true;
    wrapper.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const onReset = () => {
    input.value = value;
    submit.disabled = !resubmit;
    reset.disabled = true;
  };

  const submit = html`<button ${{ disabled: !resubmit && !required, onclick: onSubmit }}>${submitLabel}`;
  const reset = html`<button ${{ disabled: true, onclick: onReset }}>${resetLabel}`;
  const footer = html`<div><hr style="padding:0;margin:10px 0"><div style="display:flex;gap:1ch;justify-content:${justify}">${submit} ${reset}`;
  const template = inputs => html`<div>${label ? html`<span class="form-group-label">${label}</span>` : ''}<div>${Array.isArray(inputs) ? inputs : Object.values(inputs)
    }${footer}</div>`;

  const input = fn({ submit, reset, footer, template, onSubmit, onReset });
  input.addEventListener('input', (e) => {
    e.stopPropagation();
    submit.disabled = false;
    reset.disabled = false;
  });
  let value = required ? undefined : input.value;
  const wrapper = html`<div style="width:${width}">${input}`;
  wrapper.addEventListener('submit', onSubmit);
  return Object.defineProperty(wrapper, 'value', {
    get: () => value,
    set: (v) => { input.value = v },
  });
}
function sortableInput(array, options: any = {}) {
  let {
    format = d => d,
    footer
  } = options;


  let list = html`<ul class="sortable sortable__list" >`;
  
  array.forEach((d, i) => {
    let li = html`<li class="sortable__item" value=${i}>${format(d)}</li>`;
    //li.style.cssText += itemStyle;
    list.append(li);
  });

  let form = footer !== null ? html`<div>${list}${footer}</div>` : list;

  let listValue = () => {
    let result = [];
    for (let li of list.querySelectorAll("li")) {
      result.push(array[parseInt(li.value, 10)]);
    }
    return result;
  };

  //list.value = listValue();

  var sortable = Sortable.create(list, {
    onSort: () => {
      form.value = listValue();
      form.dispatchEvent(new CustomEvent('input'));
    }
  });

  return form;
}
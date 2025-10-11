---
title: Záznamový arch, klíč řešení
footer: false
pager: true
toc: true
style: 'assets/css/arch.css'
---

```js
import Sortable from 'sortablejs/modular/sortable.core.esm.js';
import { QuizStore } from './utils/quiz-store.js';

const metadata = await FileAttachment(`./data/form-${observable.params.code}.json`).json();
const schema = await FileAttachment(`./data/arch-${observable.params.code}.schema.json`).json();
```

```js
const personForm = formFromSchemaWithRefs(schema, {});
const person = Generators.input(personForm);

const showAnswersInput =  Inputs.toggle({label: "Zobrazit klíč řešení"})
const showAnswers = Generators.input(showAnswersInput);
```

```js
const store = new QuizStore({metadata});

const values = Generators.observe((notify) => {
  
  const inputted = (event, v) => {
      const value = personForm.value;
      store.submitQuiz(value)
      notify(store.getState())
  }
  personForm.addEventListener("input", inputted);
  
  
  notify(store.getState());
  return () =>  personForm.removeEventListener("input", inputted);
});
const isEmptyOrWhiteSpace = value => value == null || (typeof value === 'string' && value.trim() === '');

const formatArgs = (args) => {
  if (args == null) return;
  if (Array.isArray(args)) return args.filter(d => !isEmptyOrWhiteSpace(d)).join();
  if (typeof args === "string" || typeof args === "number") return args;
  return JSON.stringify(args);
}
const hasAnswer = (answer) => Array.isArray(answer) ? answer.filter(d => !isEmptyOrWhiteSpace(d)).length > 0 : !isEmptyOrWhiteSpace(answer)
```

Body: ${values.totalPoints}/${values.maxTotalPoints}


<div class="grid grid-cols-4" style="grid-auto-rows: auto;">
  
  ${personForm}
  <div>
  <div>${showAnswersInput}</div>
  ${showAnswers ? html`<table class="arch-report">
  <thead><tr>
    <th>Otázka</th>
    <th>Odpověď</th>
    <th>Klíč řešení</th>
  </tr></thead>
  <tbody>
  ${values.questions.map(({id: key, node}) => html`<tr class=${!hasAnswer(values.answers[key])  ? '' : values.corrections[key] === true ? 'row--success': 'row--danger'}>
  <td>${key}</td>
  <td>${formatArgs(values.answers[key])}</td>
  <td>${formatArgs(node.verifyBy?.args)}</td>
</tr></tbody>`)}</table>`:''}
</div>
</div>



```js
// ---------- Utilities (unchanged) ----------
function deepClone(x) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }

function followPointer(root, pointer) {
  if (!pointer) return root;
  if (pointer === "#") return root;
  const p = pointer.startsWith("#") ? pointer.slice(1) : pointer;
  if (!p) return root;
  const parts = p.split('/').filter(Boolean).map(s => decodeURIComponent(s.replace(/~1/g, '/').replace(/~0/g, '~')));
  let cur = root;
  for (const part of parts) {
    if (cur === undefined || cur === null) return undefined;
    cur = cur[part];
  }
  return cur;
}

function dereference(node, root, seen = new Set()) {
  if (!node || typeof node !== "object") return node;

  if (node.$ref && typeof node.$ref === "string") {
    const ref = node.$ref;
    if (seen.has(ref)) {
      return { type: "object", title: `(circular ref ${ref})`, __circularRef: ref };
    }
    const target = followPointer(root, ref);
    if (!target) {
      return { type: "object", title: `(unresolved ref ${ref})`, __unresolvedRef: ref };
    }
    seen.add(ref);
    const merged = Object.assign({}, deepClone(target), Object.assign({}, node, { $ref: undefined }));
    const expanded = dereference(merged, root, seen);
    seen.delete(ref);
    return expanded;
  }

  const out = Array.isArray(node) ? [] : {};
  for (const [k, v] of Object.entries(node)) {
    if (k === "enum" || k === "const") {
      out[k] = v;
      continue;
    }
    if (k === "properties" || k === "$defs" || k === "definitions") {
      out[k] = {};
      for (const [pk, pv] of Object.entries(v || {})) out[k][pk] = dereference(pv, root, seen);
      continue;
    }
    if (k === "items") {
      out[k] = dereference(v, root, seen);
      continue;
    }
    if (k === "anyOf" || k === "oneOf" || k === "allOf") {
      out[k] = (v || []).map(sub => dereference(sub, root, seen));
      continue;
    }
    out[k] = (v && typeof v === "object") ? dereference(v, root, seen) : v;
  }
  return out;
}

// ---------- New / updated input mapping ----------

// Helper: build the inputs object for an object schema (used recursively)
function buildInputsFromSchema(schema, data = {}, opts = {}) {
  const props = schema.properties || {};
  const result = {};
  for (const key of Object.keys(props)) {
    const propSchema = props[key];
    result[key] = inputForProperty(key, propSchema, data[key], opts);
  }
  return result;
}


const formLabelTemplate = (name) => inputs => htl.html`<details open>
  <summary>${name}</summary>
  ${Array.isArray(inputs)? inputs: Object.values(inputs)}
</details>`

// ---------- Replacement: primitives (no per-item labels, wrapped with a single heading) ----------
function buildFixedArrayOfPrimitiveSubforms(name, itemsSchema, currentArrayValue = [], opts = {}) {
  const max = Number.isFinite(itemsSchema._parentMaxItems) ? itemsSchema._parentMaxItems : undefined;
  const min = Number.isFinite(itemsSchema._parentMinItems) ? itemsSchema._parentMinItems : undefined;

  let length = 1;
  if (Number.isFinite(max)) {
    length = Math.max(0, Math.floor(max));
  } else if (Number.isFinite(min)) {
    length = Math.max(0, Math.floor(min));
  } else if (Array.isArray(currentArrayValue) && currentArrayValue.length > 0) {
    length = currentArrayValue.length;
  } else {
    length = 1;
  }

  // Build items with NO individual labels (they belong to the enclosing wrapper)
  const itemsObject = [];
  for (let i = 0; i < length; i++) {
    const itemValue = Array.isArray(currentArrayValue) && currentArrayValue[i] !== undefined ? currentArrayValue[i] : undefined;
  
    if (itemsSchema.type === "string") {
      if (itemsSchema.format === "textarea" || (itemsSchema.maxLength && itemsSchema.maxLength > 200)) {
        itemsObject.push(Inputs.textarea({ value: itemValue ?? itemsSchema.default }));
      } else {
        itemsObject.push(Inputs.text({ value: itemValue ?? itemsSchema.default }));
      }
    } else if (itemsSchema.type === "integer" || itemsSchema.type === "number") {
      if (typeof itemsSchema.minimum === "number" && typeof itemsSchema.maximum === "number") {
        itemsObject.push(Inputs.range([itemsSchema.minimum, itemsSchema.maximum], { value: itemValue ?? itemsSchema.default ?? itemsSchema.minimum }));
      } else {
        itemsObject.push(Inputs.number({ value: itemValue ?? itemsSchema.default}));
      }
    } else {
      itemsObject.push(Inputs.textarea({ value: itemValue ? JSON.stringify(itemValue, null, 2) : (itemsSchema.default ? JSON.stringify(itemsSchema.default, null, 2) : "") }));
    }
  }

  // Create the form (no label passed to Inputs.form)
  return Inputs.form(itemsObject, {template: formLabelTemplate(name)});
}

// ---------- Replacement: objects (no per-item labels, wrapped with a single heading) ----------
function buildFixedArrayOfObjectSubforms(name, itemsSchema, currentArrayValue = [], opts = {}) {
  const max = Number.isFinite(itemsSchema._parentMaxItems) ? itemsSchema._parentMaxItems : undefined;
  const min = Number.isFinite(itemsSchema._parentMinItems) ? itemsSchema._parentMinItems : undefined;

  let length = 1;
  if (Number.isFinite(max)) {
    length = Math.max(0, Math.floor(max));
  } else if (Number.isFinite(min)) {
    length = Math.max(0, Math.floor(min));
  } else if (Array.isArray(currentArrayValue) && currentArrayValue.length > 0) {
    length = currentArrayValue.length;
  } else {
    length = 1;
  }

  const itemsObject = {};
  for (let i = 0; i < length; i++) {
    const itemValue = Array.isArray(currentArrayValue) && currentArrayValue[i] !== undefined ? currentArrayValue[i] : undefined;
    // build subform for each item but DO NOT give the subform a label
    if (itemsSchema.type === "object") {
      itemsObject[i] = Inputs.form(buildInputsFromSchema(itemsSchema, itemValue || {}, opts)); // no label option
    } else {
      // fallback - primitive or unknown: create unlabeled input via inputForProperty but suppress labels by calling the primitive builder directly
      // we deliberately avoid inputForProperty here because it tends to produce labeled widgets.
      if (itemsSchema.type === "string") {
        itemsObject[i] = Inputs.text({ value: itemValue ?? itemsSchema.default });
      } else if (itemsSchema.type === "integer" || itemsSchema.type === "number") {
        if (typeof itemsSchema.minimum === "number" && typeof itemsSchema.maximum === "number") {
          itemsObject[i] = Inputs.range([itemsSchema.minimum, itemsSchema.maximum], { value: itemValue ?? itemsSchema.default ?? itemsSchema.minimum });
        } else {
          itemsObject[i] = Inputs.number({ value: itemValue ?? itemsSchema.default });
        }
      } else {
        itemsObject[i] = Inputs.textarea({ value: itemValue ? JSON.stringify(itemValue, null, 2) : (itemsSchema.default ? JSON.stringify(itemsSchema.default, null, 2) : "") });
      }
    }
  }

  // Create the form (no label passed to Inputs.form)
  return Inputs.form(itemsObject, {template: formLabelTemplate(name)});

}

// Main property-to-input mapping (modified array/object behavior)
function inputForProperty(name, propSchema, value = undefined, opts = {}) {
  const label = propSchema.title || name;
  const common = { label };

  if (propSchema.__circularRef) {
    return Inputs.html(`${label}: <em>circular reference to ${propSchema.__circularRef}</em>`);
  }
  if (propSchema.__unresolvedRef) {
    return Inputs.html(`${label}: <em>unresolved reference ${propSchema.__unresolvedRef}</em>`);
  }

  if (propSchema.enum) {
    if (propSchema.type === "array") {
      return Inputs.select(propSchema.enum, {
        label,
        multiple: true,
        value: Array.isArray(value) ? value : propSchema.default || []
      });
    } else {
      return Inputs.select([null].concat(propSchema.enum), {
        label,
        value: value ?? propSchema.default ?? null,
        format: d => d === null ? "---" : d
      });
    }
  }

  switch (propSchema.type) {
    case "string":
      if (propSchema.format === "textarea" || (propSchema.maxLength && propSchema.maxLength > 200)) {
        return Inputs.textarea(Object.assign({}, common, { value: value ?? propSchema.default }));
      }
      if (propSchema.format === "date") {
        return Inputs.date(Object.assign({}, common, { value: value ?? propSchema.default }));
      }
      return Inputs.text(Object.assign({}, common, { value: value ?? propSchema.default }));

    case "integer":
    case "number":
      if (typeof propSchema.minimum === "number" && typeof propSchema.maximum === "number") {
        return Inputs.range([propSchema.minimum, propSchema.maximum], Object.assign({}, common, {
          value: value ?? propSchema.default ?? propSchema.minimum
        }));
      }
      return Inputs.number(Object.assign({}, common, { value: value ?? propSchema.default }));

    case "boolean":
      return Inputs.radio(new Map([["Ano", true], ["Ne", false]]), Object.assign({}, common, { value: value ?? propSchema.default }));

    case "array":
      // --- arrays of objects -> fixed number of per-item recursive subforms (no add/remove) ---
      if (propSchema.items && propSchema.items.type === "object") {
        const itemsSchema = deepClone(propSchema.items);
        if (Number.isFinite(propSchema.maxItems)) itemsSchema._parentMaxItems = propSchema.maxItems;
        if (Number.isFinite(propSchema.minItems)) itemsSchema._parentMinItems = propSchema.minItems;
        return buildFixedArrayOfObjectSubforms(label, itemsSchema, value, opts);
      }

      // --- NEW: arrays of primitives (string / number / integer) -> fixed-length primitive inputs ---
      
      if (propSchema.items && (propSchema.items.type === "string" || propSchema.items.type === "number" || propSchema.items.type === "integer") && !propSchema.items.enum) {
        const itemsSchema = deepClone(propSchema.items);
        if (Number.isFinite(propSchema.maxItems)) itemsSchema._parentMaxItems = propSchema.maxItems;
        if (Number.isFinite(propSchema.minItems)) itemsSchema._parentMinItems = propSchema.minItems;
        return buildFixedArrayOfPrimitiveSubforms(label, itemsSchema, value, opts);
      }

      // if items is primitive or enum -> select multiple (for enum) or fallback to textarea
      if (propSchema.items && propSchema.items.enum) {

        return sortableInput(propSchema.items.enum, { format: d => html`${d}`, label: name })
      }

      // fallback: JSON textarea for array
      return Inputs.textarea(Object.assign({}, common, {
        value: value ? JSON.stringify(value, null, 2) : (propSchema.default ? JSON.stringify(propSchema.default, null, 2) : "[]"),
        placeholder: "JSON array"
      }));
    case "object":
      return Inputs.form(buildInputsFromSchema(propSchema, value ?? {}, opts), {template: formLabelTemplate(name)});
      

    default:
      return Inputs.textarea(Object.assign({}, common, {
        value: value ? JSON.stringify(value, null, 2) : (propSchema.default ? JSON.stringify(propSchema.default, null, 2) : ""),
        placeholder: "raw JSON"
      }));
  }
}

// ---------- Top-level function (dereference then build) ----------
function formFromSchemaWithRefs(schema, data = {}, opts = {}) {
  const cloned = deepClone(schema);
  const expanded = dereference(cloned, cloned);

  
  return Inputs.form(buildInputsFromSchema(expanded, data, opts), {template: inputs => html`${Object.keys(inputs).sort((f,s) => f.localeCompare(s, undefined, {numeric: true})).map(key => inputs[key]) }`});
}


function sortableInput(array, options = {}) {
  let {
    format = d => d,
    footer,
    label
  } = options;


  let list = html`<label>${label}</label><ul class="sortable sortable__list" >`;

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

  form.value = listValue();

  var sortable = Sortable.create(list, {
    onSort: () => {
      form.value = listValue();
      form.dispatchEvent(new CustomEvent('input'));
    },
    onUpdate: () => {
      form.value = listValue();
      console.log(form.value)
      form.dispatchEvent(new CustomEvent('input', { bubbles: true }));
    }
  });

  return form;
}

```

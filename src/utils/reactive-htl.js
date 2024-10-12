/// A lightly modified version of yurivish version https://github.com/yurivish/reactive-htl
/// https://observablehq.com/@yurivish/reactive-htl
import { signal, computed, effect, batch, Signal } from '@preact/signals-core';

import {
  hypertext,
  processAttr,
  processAttrs,
  processChildren,
  removeAttribute,
  isObjectLiteral,
  setStyles,
  renderHtml,
  renderSvg,
} from './htl-special-0.3.1.js';

export const html = hypertext(
  renderHtml,
  (fragment) => {
    const cleanup = effectsCleanup(fragment.removeEffects);
    if (fragment.firstChild === null) return null;
    // a single comment node indicates the presence of reactive children, which need
    // to maintain a non-null parent node for updates (which use parent.insertBefore)
    if (fragment.firstChild === fragment.lastChild && !isComment(fragment.firstChild)) {
      return onUnmount(fragment.removeChild(fragment.firstChild), cleanup);
    }
    const span = document.createElement('span');
    span.appendChild(fragment);
    return onUnmount(span, cleanup);
  },
  isSpecial,
  processSpecial,
);

export const svg = hypertext(
  renderSvg,
  (g) => {
    const cleanup = effectsCleanup(g.removeEffects);
    if (g.firstChild === null) return null;
    if (g.firstChild === g.lastChild && !isComment(g.firstChild)) {
      return onUnmount(g.removeChild(g.firstChild), cleanup);
    }
    return onUnmount(g, cleanup);
  },
  isSpecial,
  processSpecial,
);

function effectsCleanup(removeEffects) {
  if (removeEffects && removeEffects.length > 0) {
    return () => {
      for (const dispose of removeEffects) dispose();
    };
  }
  return null;
}

function isComment(node) {
  return node.nodeType === 8 /* TYPE_COMMENT */;
}

function processSpecial(process, node, name, value, fragment) {
  const removeEffects = (fragment.removeEffects ??= []);
  switch (process) {
    // fall through, treating this as a case of processAttrs.
    case processAttr:
      value = { [name]: value };
    // fallthrough
    case processAttrs:
      // cases:
      // - signal w/ attrs object
      // - attrs object w/ signal value(s)
      // - attr object w/ style: object w/ signal value(s)
      if (isSignal(value)) {
        // value is a signal w/ attrs object
        let prev = value.peek();
        removeEffects.push(
          effect(() => {
            const v = value.value;
            if (!isObjectLiteral(v)) throw new Error('invalid binding');
            removeStaleAttrs(node, prev, v);
            processAttrs(node, name, v);
            prev = v;
          }),
        );
      } else {
        // set all non-dynamic attributes on initialization
        const staticAttrs = {};
        for (const attr in value) {
          const attrvalue = value[attr];
          if (isSignal(attrvalue)) {
            // value is an attrs object w/ potential signal value(s)
            let prev = attrvalue.peek();
            removeEffects.push(
              effect(() => {
                const v = attrvalue.value;
                // treat the value attribute specially to allow controlling <input> values
                if (attr === 'value') node.value = v;
                else {
                  removeStaleAttr(node, attr, prev, v);
                  processAttrs(node, name, { [attr]: v });
                  prev = v;
                }
              }),
            );
          } else if (isStyleObjectLiteral(attr, attrvalue)) {
            // value is an style attrs object w/ potential signal value(s)
            const staticStyleAttrs = (staticAttrs.style = {});
            const style = value[attr];
            for (const prop in style) {
              const propvalue = style[prop];
              if (isSignal(propvalue)) {
                removeEffects.push(
                  effect(() => {
                    const v = propvalue.value;
                    processAttrs(node, name, { style: { [prop]: v } });
                  }),
                );
              } else {
                staticStyleAttrs[prop] = propvalue;
              }
            }
          } else {
            // attribute is neither { key: signal } nor { style: obj }, so
            // it must be a static { key: subvalue } attribute.
            staticAttrs[key] = subvalue;
          }
          processAttrs(node, name, staticAttrs);
        }
      }
      break;
    case processChildren:
      if (isSignal(value)) {
        // process reactive children by appending them into a document fragment so that we
        // can queue their removal for the next update.
        const insertionMarker = node.parentNode.insertBefore(document.createComment(' '), node);
        const fragment = document.createDocumentFragment();
        const removeChildren = [];

        removeEffects.push(
          effect(() => {
            const currentValue = value.value ?? [];
            for (const child of removeChildren) child.parentNode.removeChild(child);
            processChildren(null, fragment, currentValue);
            removeChildren.length = 0;
            for (const child of fragment.childNodes) removeChildren.push(child);
            insertionMarker.parentNode.insertBefore(fragment, insertionMarker);

          }),
        );
      } else if (isForEachExpr(value)) {
        console.log("For.....")
        const insertionMarker = node.parentNode.insertBefore(document.createComment(' '), node);
        const { forEachExpr: signalExpr, template } = value;
        let lastValue = [];
        const map = new Map()
        const indexMap = new Map();
        removeEffects.push(
          effect(() => {
            const currentValue = signalExpr.value;
            //console.log(currentValue);
            //console.log(map);
            if (Array.isArray(currentValue) && Array.isArray(lastValue)) {
              const actions = listDiff(lastValue, currentValue);
              //console.log(actions)
              console.log(actions, lastValue, currentValue);

              for (let action of actions) {
                if (action.type == "add") {
                  const key = action.elm;
                  const index$ = signal(action.index);
                  
                  const newItemEl = template(key, index$)
                  map.set(key, newItemEl);
                  indexMap.set(key,index$);
                  processChildren(null, insertionMarker.parentNode, newItemEl)
                }
                else if (action.type == "remove") {
                  const key = action.elm;
                  const elToRemove = map.get(key);
                  insertionMarker.parentNode.removeChild(elToRemove);
                  map.delete(key);
                  
                }
                else if (action.type == "move"){
                  const key = action.elm;
                  insertionMarker.parentNode.insertBefore(map.get(key),map.get(action.before))
                }
              }
            }
            lastValue = currentValue
            refreshIndexMap(indexMap,lastValue)
          })
          
        )
        
        //console.log(currentValue, lastValue, removeChildren)
        // if (Array.isArray(currentValue) && Array.isArray(lastValue)) {

        //   const actions = listDiff(lastValue, currentValue);
        //   console.log(actions, lastValue, currentValue);
        // for (let action of actions){
        //   if (action.type == "add"){
        //     processChildren(action.before, insertionMarker.parentNode, action.elm)
        //   }
        //   else if (action.type == "remove"){                  
        //     const elToRemove = action.elm;                                    
        //     console.log(elToRemove, elToRemove.parentNode);
        //     insertionMarker.parentNode.removeChild(elToRemove);


        //   }
        // }
        //}


      } else {
        processChildren(node, node.parentNode, value);
      }
      break;
  }
}
function refreshIndexMap(map, current) {
  for(let i=0; i!=current.length;i++){
    map.get(current[i]).value = i;
  }
  console.log(map);
}

function isForEachExpr(value) {
  return value.forEachExpr != null && isSignal(value.forEachExpr);
}

function isSpecial(value) {
  // this function may return a false positive since it lacks the context of where
  // this value is being interpolated. This can result in special values being interpolated
  // into non-special places, leading to a lack of reactivity. For example,
  // html`<div style="color: ${colorSignal}">Hello` will not reactively update. The reactive
  // alternative is html`<div style=${{color: colorSignal}}>Hello` or, if a string is desired,
  // html`<div style=${computed(() => `color: ${colorSignal}`)}>Hello`.
  if (isSignal(value)) return true;
  if (isObjectLiteral(value)) {
    for (const key in value) {
      const subvalue = value[key];
      if (isSignal(subvalue)) return true;
      if (isStyleObjectLiteral(key, subvalue)) {
        for (const styleprop in subvalue) if (isSignal(subvalue[styleprop])) return true;
      }
    }
  }
  return false;
}

function removeStaleAttrs(node, prev, value) {
  for (const key in prev) removeStaleAttr(node, key, prev[key], value[key]);
}

function removeStaleAttr(node, key, prev, value) {
  if (value == null || value === false) {
    if (typeof prev === 'function' || key === 'value') delete node[key];
    else if (isStyleObjectLiteral(key, prev)) setStyles(node.style, { style: null });
    else removeAttribute(node, key);
  } else if (key === 'style') {
    const prevIsLiteral = isObjectLiteral(prev[key]);
    const valueIsLiteral = isObjectLiteral(value[key]);
    if (prevIsLiteral && valueIsLiteral) removeStaleStyles(node[key], prev[key], value[key]);
    // handle the case where the style changes between being an object and a string/non-object
    else if (prevIsLiteral) removeStaleStyles(node[key], prev, {});
    else removeAttribute(node, key);
  }
}

function removeStaleStyles(style, prev, value) {
  for (const key in prev) if (!(key in value)) setStyles(style, { [key]: null });
}

function mountMutationCallback(mutationList) {
  for (const mutation of mutationList) {
    for (const node of mutation.removedNodes) {
      // Walk the removed node and call all cleanup functions. Since we allow specifying
      // custom cleanup functions as attributes, and because literals may be nested,
      // there can be cleanup functions anywhere below the child node that was removed.
      if (node instanceof HTMLElement || node instanceof DocumentFragment) {
        const walker = document.createTreeWalker(node, 1, null, false);
        if (node.onunmount) node.onunmount();
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (node.onunmount) node.onunmount();
        }
      }
    }
  }
}

// Add a cleanup handler to the node and return the node. Cleanup handlers
// will be called in the order they were defined.
export function onUnmount(node, cleanup) {
  console.assert(!(node instanceof DocumentFragment));
  if (!cleanup) return node;
  const current = node.onunmount;
  if (current === undefined) {
    node.onunmount = cleanup;
  } else {
    node.onunmount = () => {
      current();
      cleanup();
    };
  }
  return node;
}

// Instantiate and mount the component to the provided parent DOM node and return
// a disposal function that will run cleanup functions and detatch the component
// node from its parent.
export function mount(component, parent, insertBefore) {
  // Using batch ensures that signal updates that happen during component initialization
  // are processed after the mutation observer is ready .If a signal value is updated
  // multiple times during component initialization, cleaning up their the resources of
  // intermediate values is the responsibility of the component.
  return batch(() => {
    const elem = component();
    if (elem === null) return () => null;
    // To avoid edge cases, we use a separate MutationObserver for each mount point.
    // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#reusing_mutationobservers
    const observer = new MutationObserver(mountMutationCallback);
    observer.observe(parent, { childList: true, subtree: true });
    if (insertBefore) parent.insertBefore(elem, insertBefore);
    else parent.appendChild(elem);
    return () => {
      parent.removeChild(elem);
      mountMutationCallback(observer.takeRecords());
      observer.disconnect();
    };
  });
}

function isSignal(value) {
  return value instanceof Signal;
}

function isStyleObjectLiteral(key, value) {
  return key === 'style' && isObjectLiteral(value);
}

// Creates custom elements from components, designed for lightweight authoring of reactive documents.
// The component is passed a simple Proxy as props, which returns signals for observed attributes and
// element.getAttribute(prop) otherwise. The Proxy does not currently support being used with
// {...props} spread syntax or other behaviors beyond plain property access.
export function customElement(component, shadowMode, observedAttributes) {
  return class extends HTMLElement {
    connectedCallback() {
      const self = this;
      let root = shadowMode ? this.attachShadow({ mode: shadowMode }) : this;

      // Create a signal for every observed attribute
      this.attributeSignals = {};
      for (name of observedAttributes) {
        this.attributeSignals[name] = signal(self.getAttribute(name));
      }

      // Create a Proxy that delegates non-observed attributes to property access
      const attrProxy = new Proxy(this.attributeSignals, {
        get(target, prop) {
          if (prop in target) return target[prop];
          if (typeof prop === 'symbol') return undefined;
          return self.getAttribute(prop);
        },
      });

      // Mount and store the disposal function
      this.dispose = mount(() => component(attrProxy), root);

      // Add an attribute enabling CSS-based loading indicators that display before the component mounts.
      // The selector looks for elements with no children that have not yet been rendered (ie. HTML has
      // loaded but initial JS has not run):
      // body :empty:not([data-rendered])::before { content: "…"; }
      this.dataset.rendered = true;
    }

    attributeChangedCallback(name, oldValue, newValue) {
      // Update the signal
      this.attributeSignals[name].value = newValue;
    }

    disconnectedCallback() {
      if (this.dispose) this.dispose();
      // Don't delete the rendered attribute since the rendered content is still present.
    }

    static get observedAttributes() {
      return observedAttributes;
    }

    // adoptedCallback { }
  };
}

export function defineCustomElement(name, component, { shadowMode, observedAttributes = [] } = {}) {
  customElements.define(name, customElement(component, shadowMode, observedAttributes));
}

// Creates something akin to an un-cached computed signal,
// which behaves as if its value is never equal to its
// previous value (it will always fire when a dependency is
// updated).
// First argument: compute function f(value); signal accesses are tracked
// Second argument: initial value.
// This is useful for maintaining a signal containing a
// mutable value that updates in response to signals,
// such as a d3 scale which updates its domain and range
// in response to signals (but maintains object identity).
// Example:
// {
//   // Here's how to have a "reducer" pattern
//   // where a mutable d3 scale can be mutated
//   // in response to events (eg. set the domain)
//   // and anything that calls scale() will re-run
//   // when the scale is modified, even though it's
//   // still the same object
//   const x = signal(0);
//   const y = signal(1);
//   const scale = recomputed(
//     (s) => {
//       s.x = x.value;
//       s.y = y.value;
//       return s;
//     },
//     { x: 0, y: 0 }
//   );
//   let render = effect(() => {
//     const s = scale.value;
//     // const s = _scale;
//     console.log("rendering with s.x", s.x, "s.y", s.y);
//   });
//   x.value = 2;
//   x.value = 2;
//   y.value = 3;
//   y.value = 3;
// }
export function recomputed(reduce, initialValue) {
  let value = initialValue;
  const changed = computed(() => {
    value = reduce(value);
    return NaN;
  });
  return {
    get value() {
      changed.value;
      return value;
    }
  };
}
export function forEach(forEachExpr,template){
  return {
    forEachExpr,
    template
  }
}

export const p = (...args) => (console.log(...args), args[args.length - 1]);
function listDiff(a, b, opts) {
  var opts = opts || {};
  var actions = [];
  var extr = function (v) {
    return v
  };
  var replace = function (elm, i, newElm) {
    actions.push({ type: 'replace', target: a[i], replacement: newElm });
  };
  var move = function (from, to) {
    actions.push({ type: 'move', elm: a[from], before: a[to] });
  };
  var add = function (elm, i) {
    actions.push({ type: 'add', elm: elm, before: a[i], index:i });
  };
  var remove = function (i) {
    actions.push({ type: 'remove', elm: a[i], before: a[i + 1] });
  };
  listDiffEx({
    old: a,
    cur: b,
    extractKey: opts.extr || extr,
    add: add, move: move, remove: remove, replace: replace,
  });
  return actions;
};
function listDiffEx(opts) {

  //The MIT License (MIT)

  //Copyright (c) 2015 Simon Friis Vindum

  var actions = [],
    aIdx = new Map(),
    bIdx = new Map(),
    a = opts.old,
    b = opts.cur,
    key = opts.extractKey,
    i, j;
  // Create a mapping from keys to their position in the old list
  for (i = 0; i < a.length; i++) {
    aIdx.set(key(a[i]),i);
  }
  // Create a mapping from keys to their position in the new list
  for (i = 0; i < b.length; i++) {
    bIdx.set(key(b[i]),i);
  }
  for (i = j = 0; i !== a.length || j !== b.length;) {
    var aElm = a[i], bElm = b[j];
    if (aElm === null) {
      // This is a element that has been moved to earlier in the list
      i++;
    } else if (b.length <= j) {
      // No more elements in new, this is a delete
      opts.remove(i);
      i++;
    } else if (a.length <= i) {
      // No more elements in old, this is an addition
      opts.add(bElm, i);
      j++;
    } else if (key(aElm) === key(bElm)) {
      // No difference, we move on
      i++; j++;
    } else {
      // Look for the current element at this location in the new list
      // This gives us the idx of where this element should be
      var curElmInNew = bIdx.get(key(aElm));
      // Look for the the wanted elment at this location in the old list
      // This gives us the idx of where the wanted element is now
      var wantedElmInOld = aIdx.get(key(bElm));
      if (curElmInNew === undefined) {
        // Current element is not in new list, it has been removed
        opts.remove(i);
        i++;
      } else if (wantedElmInOld === undefined) {
        // New element is not in old list, it has been added
        opts.add(bElm, i);
        j++;
      } else {
        // Element is in both lists, it has been moved
        opts.move(wantedElmInOld, i);
        a[wantedElmInOld] = null;
        j++;
      }
    }
  }
  return actions;
};
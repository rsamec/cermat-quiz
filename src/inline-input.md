---
title: Inline input
draft: true
---

```js
import {html as rhtml} from './utils/reactive-htl.js';
import mdPlus from './utils/md-utils.js';
import { signal, computed, batch } from '@preact/signals-core';
import tippy from 'tippy.js';

const themes = ["light", "light-border", "material", "translucent"];
  const themeCss = await Promise.all(
    themes.map(async (theme) => {
      return await (
        await fetch(`https://unpkg.com/tippy.js@6/themes/${theme}.css`)
      ).text();
    })
  );

  const customStyles = `
  [data-tippy-root] {
    display:inline;
  }`
document.head.insertAdjacentHTML(
    "beforeend",
    `<style>${themeCss}${customStyles}</style>`
  );  
```

```js
html`${toTemplate(
  `We look (**1**) ________________ to seeing you all there.
 The results were (**2**) ________________ impressive.
 We should move (**3**) ________________ with the plan.
 We should move (**4**) ________________ with the plan.`,
  {
    1: toTooltipInput(
      Inputs.button(
        [
          ["Increment", (value) => value + 1],
          ["Decrement", (value) => value - 1],
          ["Reset", (value) => 0]
        ],
        { value: 0 }
      )
    ),
    2: toTooltipInput(Inputs.select(["abc", "cdg"])),
    3: toTooltipInput(Inputs.text({ submit: true })),
    4: toTooltipInput(Inputs.radio([{value:'A', name:"AAAA"}, {value:'B', name:"BBBB"}],{format: d => d.name}))
  },
  (key,value) => {
    return ''
  }
)}`
```

```js

function toTooltipInput(input) { 

  const s = useInput(input);

  const tooltip = html`<span>
  ${toolTipper(    
    html`<div class="btn"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-index" viewBox="0 0 16 16">
  <path d="M6.75 1a.75.75 0 0 1 .75.75V8a.5.5 0 0 0 1 0V5.467l.086-.004c.317-.012.637-.008.816.027.134.027.294.096.448.182.077.042.15.147.15.314V8a.5.5 0 1 0 1 0V6.435l.106-.01c.316-.024.584-.01.708.04.118.046.3.207.486.43.081.096.15.19.2.259V8.5a.5.5 0 0 0 1 0v-1h.342a1 1 0 0 1 .995 1.1l-.271 2.715a2.5 2.5 0 0 1-.317.991l-1.395 2.442a.5.5 0 0 1-.434.252H6.035a.5.5 0 0 1-.416-.223l-1.433-2.15a1.5 1.5 0 0 1-.243-.666l-.345-3.105a.5.5 0 0 1 .399-.546L5 8.11V9a.5.5 0 0 0 1 0V1.75A.75.75 0 0 1 6.75 1M8.5 4.466V1.75a1.75 1.75 0 1 0-3.5 0v5.34l-1.2.24a1.5 1.5 0 0 0-1.196 1.636l.345 3.106a2.5 2.5 0 0 0 .405 1.11l1.433 2.15A1.5 1.5 0 0 0 6.035 16h6.385a1.5 1.5 0 0 0 1.302-.756l1.395-2.441a3.5 3.5 0 0 0 .444-1.389l.271-2.715a2 2 0 0 0-1.99-2.199h-.581a5 5 0 0 0-.195-.248c-.191-.229-.51-.568-.88-.716-.364-.146-.846-.132-1.158-.108l-.132.012a1.26 1.26 0 0 0-.56-.642 2.6 2.6 0 0 0-.738-.288c-.31-.062-.739-.058-1.05-.046zm2.094 2.025"/>
</svg></div>`,
    (x, y) => html`${input}`,
    {
      onShown: (instance) => {        
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
```

```js
function toTemplate(
  template,
  context,
  formatValue = (key) => key, 
  
) {
  
  // Function to replace placeholders based on the mask number (e.g., (1), (2), (3))
  const interpolateString = (str) => {
    const maskPlaceholderPattern = /\(\*\*(\d+)\*\*\)\s*(_+)/g;
    return str.replace(maskPlaceholderPattern, (match, maskNumber) => {      
      return `(${maskNumber}) **(formatValue(context[${maskNumber}]?.[1].value))}**  \${context[${maskNumber}]?.[0]}`;
    });
  };

  // Apply the string interpolation
  const updatedStrings = mdPlus.renderToString(interpolateString(template)).replaceAll("(formatValue(","\${computed(() => formatValue(")


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
```


```js
function toolTipper(element, contentFunc = () => "", props = {}) {
  const parent = html`<div>`;
  Object.assign(parent.style, {
    position: "relative",
    display: "inline-flex"
  });
  parent.append(element);
  Object.assign(props, {
    followCursor: false,
    allowHTML: true,
    interactive: true,
    trigger: "click",
    hideOnClick: "toggle",
    theme: 'light',
    content: contentFunc(0, 0),
    onClickOutside: (instance) => instance.hide()
  });
  const instance = tippy(parent, props);
  // element.onmousemove = element.onmouseenter = (e) => {
  //   instance.setContent(contentFunc(e.offsetX, e.offsetY));
  // };
  return parent;
}
```

```js
function useInput(input){
  const s = signal(input.value);

  // Update the signal on input events from the range slider
  const changed = (e) => (s.value = input.value);
  
  input.addEventListener("input", changed);
  invalidation.then(() => input.removeEventListener("input", changed));
  return s;

}
```
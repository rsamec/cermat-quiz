---
title: Nastavení
sidebar: true
pager: true
footer: false
toc: true
---

```js
import { localStorageSubject } from './utils/storage.utils.js'
import { providersConfig } from './utils/quiz-utils.js';
import { signal, computed } from '@preact/signals-core';


const defaultProviderCode = "default-ai-provider"
const defaultProvider = localStorageSubject(defaultProviderCode,'ChatGTP', {
    from: value => providersConfig.find(d => d.shortName === value),
    to: value => value.shortName
})

function useInput(input){
  const s = signal(input.value);

  // Update the signal on input events from the range slider
  const changed = (e) => (s.value = input.value);
  
  input.addEventListener("input", changed);
  //invalidation.then(() => input.removeEventListener("input", changed));
  return s;
}

```

```js
const selectedProviderInput = Inputs.select(providersConfig, { value:defaultProvider.value, label: "Poskytovatel", format: d => d.name});
const selectedProvider$ = useInput(selectedProviderInput)

const saveButton = Inputs.button("Uložit", {value: null, reduce: () => {
    defaultProvider.next(selectedProvider$.value)
}})
```

## AI nastavení

${selectedProviderInput}
${saveButton}
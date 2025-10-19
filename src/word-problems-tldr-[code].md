---
sidebar: true
footer: false
header: false
title: Slovní úlohy
pager: false
toc: false

---


# ${formatCodeAlt(observable.params.code)}

```js
import {download} from "./utils/common-utils.js";
import {formatCodeAlt} from "./utils/quiz-string-utils.js";
const data = await FileAttachment(`./data/word-problems-${observable.params.code}.tldr`).json();
const extendedData = await FileAttachment(`./data/word-problems-page-${observable.params.code}.tldr`).json();
```

## Použití tldraw canvasu
K zobrazení strukturovaného řešení slovních úloh si stáhněte *.tldr soubor a nahrajte do canvasu. 

1. Stáhnout soubor *.tldr
```js
view(download(async () => {  
  return new Blob([JSON.stringify(data)], { type: "application/tldr" });
}, `${observable.params.code}.tldr`, "Pouze dedukční stromy"));

```

```js
view(download(async () => {  
  return new Blob([JSON.stringify(extendedData)], { type: "application/tldr" });
}, `${observable.params.code}.tldr`, "Zadaní a dedukční stromy."));
```

2. Otevři [tldraw.com](https://www.tldraw.com)
3. Přetáhni stažený soubor na stránku

Více informací [https://tldraw.dev/](https://tldraw.dev/).
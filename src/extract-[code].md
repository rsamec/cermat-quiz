---
title: Text comprehension
footer: false
pager: true
toc: true
style: 'assets/css/arch.css'
---

```js
import  mdPlus from './utils/md-utils.js';

const code = observable.params.code;
// const rawContent = await FileAttachment(`./data/form-${observable.params.code}.md`).text();
const extractInfo = await FileAttachment(`./data/word-problem-extract-${observable.params.code}.json`).json();

const extractions = extractInfo.extractions;
let result = extractInfo.text;

const classToColorMapping = {
  agent: 'blue',
  entity: 'green',
  quantity: 'red',
  unit: 'yellow',
}

let offset = 0;
for (const extraction of extractions.filter((d, i) => d.char_interval != null).sort((f,s) => f.char_interval.start_pos - s.char_interval.start_pos)){
  const {char_interval, extraction_class} = extraction;
  const {start_pos, end_pos} = char_interval;

  const start = start_pos + offset;
  const end = end_pos + offset;
  if (start < 0 || end > result.length || start > end) {
    throw new Error("Invalid start or end positions");    
  }
  const color = classToColorMapping[extraction_class] ?? 'yellow'
  result = `${result.slice(0, start)}{${color}}(${result.slice(start, end)})${result.slice(end)}`  
  offset += color.length + 4;
  // console.log(extraction.char_interval, offset, extraction.extraction_text)
}
```


${mdPlus.unsafe(result)}

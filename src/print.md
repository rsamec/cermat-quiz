
```js
import { quizes, formatShortCode, parseCode } from './utils/quizes.js';
```
```js
const paddingInput = Inputs.range([0, 1],{step: 0.01, value:0.01});
const padding =  Generators.input(paddingInput);
display(paddingInput)

const columnsCountInput = Inputs.range([1, 6],{step: 1, value:2, label:"Columns"});
const columnsCount =  Generators.input(columnsCountInput);
display(columnsCountInput)

const landscapeInput = Inputs.toggle({ label:"Landscape"});
const landscape =  Generators.input(landscapeInput);
display(landscapeInput)

```
```js

const columns = [...new Array(columnsCount)].map((d,i) => i);
const p = [1,2];
const codes = quizes.filter(d => d.subject === "math").flatMap(d => d.codes).sort((f,s) => parseCode(s).year - parseCode(f).year);
const pages = codes.flatMap(code => {
  return p.flatMap(page => columns.map(column => ({code:formatShortCode(code) ,column, page, period})))
});

const dia = Plot.plot({
  padding: 0,
  marginLeft: 100,
  width: 200,
  height: codes.length * (landscape ? 30: 60),
  fx: {padding, round: false},  
  y: { type:'band', padding, 
      domain:codes.map(code => formatShortCode(code)),
      tickFormat: d => formatShortCode(d),
      label:null, stroke: 'green'},
  x: { label: null, tickFormat: null},
  marks: [
    Plot.cell(pages, {
      y: "code",
      x: "column",
      fx: "page",
      fy: "period",
      fill: 'transparent',
      stroke:'black'
    }),
    //Plot.text(pages, { y: Plot.identity, x:1, text: (d) => d, fill: "black", title: "title"}),
    // Plot.tickX(pages, {y: Plot.identity, x: 1, dx: -5 }),
    // Plot.tickX(pages, {y: Plot.identity, x: 1, dx: 5})
  ]
});
display(dia)
```

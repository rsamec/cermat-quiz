---
title: Výběr testu
sidebar: true,
pager: true
footer: false
toc: false
style: '/assets/css/quiz-picker.css'
---

```js
import { formatShortCode, formatCode, formatSubject, formatPeriod, formatVersion, parseCode ,baseMediaPublic, normalizeAssetFileName} from './utils/quiz-string-utils.js';
import { quizes } from './utils/quiz-utils.js';
const filteredQuizes = quizes.filter(d => d.subject === observable.params.subject && d.period === observable.params.period).flatMap(d => d.codes)
const quizesByYear = Object.entries(Object.groupBy(filteredQuizes, (d) => parseCode(d).year));

const pdfs = await FileAttachment(`./data/pdf-${observable.params.subject}-${observable.params.period}.json`).json();

const assetsData = await FileAttachment("./data/word-problems-assets.json").json();
const assets = assetsData.filter((({code}) => parseCode(code).period == observable.params.period)).map(({code, explainer, deepDive}) => {  
  const {period} = parseCode(code);
  return {
    video: `${baseMediaPublic}/${period}/${explainer}`,
    audio: `${baseMediaPublic}/${period}/${normalizeAssetFileName(deepDive)}`,
    name: `${formatCode(code)}`,
    description: deepDive.slice(0,-4),
    id: code,
  }
})

```

<!-- Cards with big numbers -->

<div class="grid grid-cols-4">
 ${quizesByYear.map(([year,codes]) => html`<div class="card">
    <div class="v-stack v-stack--l">
    <div class="v-stack v-stack--s">
      <div>
        <div class="big">${year}</div>
        <!-- <span>${codes.length.toLocaleString("en-US")} testy</span> -->
      </div>
      <div class="v-stack v-stack--l">
        ${codes.map(code => {
          const {order,subject,period,year} = parseCode(code);
          return html`<div class="h-stack h-stack--m h-stack-items--center h-stack--wrap">
              <a class="h-stack h-stack--s" href="./form-${code}"><i class="fas fa-money-check"></i><span>${formatVersion({order,period})}</span></a>
              <a class="h-stack h-stack--s" href="./print-${code}"><i class="fa-solid fa-print"></i><span>tisk</span></a>
              <a class="h-stack h-stack--s" href="./arch-${code}"><i class="fa-solid fa-key"></i>klíč</a>              
              ${subject === "math" ? html`
              <button  popovertarget=popover-${code}>Rozbor<i class="fas fa-caret-down"></i></button>
              <div id=popover-${code} class="menu-items" popover>
                <div class="v-stack v-stack--m">
                  <a class="h-stack h-stack--s" href="solution-${code}"><i class="fa fa-comment-nodes"></i>Chat rozbor</a>
                  <a class="h-stack h-stack--s" href="word-problems-tree-${code}" title="Rozbor stromem"><i class="fa fa-folder-tree"></i><span>Slovní úlohy - strom</span></a>
                  <a class="h-stack h-stack--s" href="word-problems-${code}" title="Řešení slovních úloh (markdown)"><i class="fa fa-brands fa-markdown"></i><span>Slovní úlohy - markdown</span></a>
                  <a download class="h-stack h-stack--s" href="/data/word-problems-${code}.tldr"  title="Řešení slovních úloh (tldraw)"><i class="fa fa-chart-diagram"></i><span>Slovní úlohy - tldraw</span><a>
                </div>
              </div>
              <button  popovertarget=popover-apps-${code}>Trénuj<i class="fas fa-caret-down"></i></button>
              <div id=popover-apps-${code} class="menu-items" popover>
                <div class="v-stack v-stack--m">
                  <a class="h-stack h-stack--s" href="calc/calculator-${code}" title="Kalkulačka"><i class="fa fa-calculator"></i><span>Kalkulačka</span></a>
                  <a class="h-stack h-stack--s" href="chat-stepper-${code}" title="Rozhodovačka"><i class="fa fa-diagram-project"></i><span>Rozhodovačka</span></a>
                  <a class="h-stack h-stack--s" href="form-${code}" title="Vyplnění odpovědí"><i class="fa fa-file-waveform"></i><span>Vyplňovačka</span></a>
                </div>
              </div>              
              <button  popovertarget=popover-ai-${code}>AI <i class="fas fa-caret-down"></i></button>
              <div id=popover-ai-${code} class="menu-items" popover>
                <div class="v-stack v-stack--m">          
                  <a class="h-stack h-stack--s" title="Řešení úloh pomocí AI" href="./ai-gpt-5-mini-as-${code}"><i class="fa fa-brands fa-openai"></i><span>OpenAI - GTP 5 mini</span></a>
                  <a class="h-stack h-stack--s" title="Řešení úloh pomocí AI" href="./ai-o1-mini-as-${code}"><i class="fa fa-brands fa-openai"></i><span>OpenAI - o1 mini</span></a>
                </div>
              </div>              
              `:''              
              }              
          <div>`
        })}
      </div>
    </div>
  </div>`
  )}
</div>


${assets.length > 0 ? html`<h2>Podcasts</h2><div class="warning" label="Vygenerovány pomocí NotebookLM"><b>Minimalizace chyb</b> je dosaženo tak, že se vedle zadání úlohy vždy předává i <b>řešení úlohy</b> ve formě heslovitého rozboru řešení úlohy.</div>`:''}




<div class="grid grid-cols-4">
${assets.map(({ video, name, id, audio, description }, i) => html`<div class="carousel__slide" data-label=a${i}>
    <figure class="parallax-item" role="tabpanel">
    <figcaption style="padding:10px 0px">    
      <h2>${name}</h2>
      <span>${description}</span>
     </figcaption> 
       <audio src=${audio} playsinline controls style="min-width: 100px;" preload="metadata"></audio>     
    </figure>
  </div>`)}
</div>


## Balíčky testů pro tisk ke stažení - PDF

```js
function parseFileKey(value) {
  const parts =  value.split('-');
  return  {
    pageSize:parts[0],
    columnsCount: parts[2],
    pageOrientation: parts.length === 4 ? 'landscape': 'portrait'}
}

const pageSizeInput = Inputs.radio(['A4','A3'], {value: 'A4', label: 'Velikost stránky'});
const pageSize = Generators.input(pageSizeInput);
view(pageSizeInput);

const pageOrientationInput = Inputs.radio(['portrait','landscape'], {value: 'portrait', label:"Orientace", format: d => d == "landscape" ? 'na šířku': 'na výšku'});
const pageOrientation = Generators.input(pageOrientationInput);
view(pageOrientationInput);
```

```js
const pdfsData = Object.entries(pdfs).flatMap(([key,value]) => value.map(([code,count]) => ({key, code,count})))
const filteredData = pdfsData.filter(d =>  parseFileKey(d.key).pageSize === pageSize && parseFileKey(d.key).pageOrientation === pageOrientation).sort((f,s) => parseCode(s.code).year - parseCode(f.code).year);

```

<ul>${Object.entries(pdfs).filter(([key]) => parseFileKey(key).pageSize === pageSize && parseFileKey(key).pageOrientation === pageOrientation).map(([key, values]) => html`<li><a href="./assets/pdf/${observable.params.subject}-${observable.params.period}/${key}.pdf"><i class="fa-solid fa-file-pdf"></i> ${key} (${values.reduce((out,[v,n])=> out+=n,0)} stránek)</a></li>`)}</ul>

<details>
  <summary>
    Obsah PDF balíčků dle počtu sloupců a stran
  </summary>
  ${Plot.plot({
    color: {legend: true, tickFormat: d => formatShortCode(d.substring(0,8))},
    height: 420,
    x:{ label: 'Počet sloupců na stránce' },
    y:{ label:'Počet stran' },
    marks:[
      Plot.waffleY(filteredData, Plot.groupX({y:"sum"}, {x: "key", y:"count", fill:'code', tip: true})),
    ]
   })}
</details>


<!-- <details>
  <summary>
    Postupy řešení slovních úloh
  </summary>
  <ul>
    ${quizesByYear.flatMap(([year,codes]) => codes.filter(d => parseCode(d).subject == "math")).map(code => html`<li><a href=word-problems-raw-${code}>${formatShortCode(code)}</a></li>`)}
  </ul>
</details> -->

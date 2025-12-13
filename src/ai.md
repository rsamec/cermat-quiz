---
title: Výsledky cermat testů řešené pomocí AI
footer: false
pager: true
toc: true
---

```js
import {categories} from './utils/quiz-utils.js';
import {formatSubject, formatShortCode, formatPeriod, formatGrade, formatVersionByCode, parseCode, formatCode } from './utils/quiz-string-utils.js';


const rawData1 = await FileAttachment(`./data/quiz-results-gpt-4o.json`).json();
const rawData2 = await FileAttachment(`./data/quiz-results-o3-mini.json`).json();
const rawData3 = await FileAttachment(`./data/quiz-results-gpt-5-mini.json`).json();
const rawData4 = await FileAttachment(`./data/quiz-results-gemini-2.5-flash.json`).json();

function totalP(rawData) {

  const data = Object.entries(rawData).map(([code,values]) => ({code,year: parseInt(code.substr(4,4),10),...values}));
  const groupedData = [...d3.rollup(data, v => ({totalPoints:d3.sum(v, d => d.totalPoints), maxTotalPoints: d3.sum(v, d => d.maxTotalPoints)}), d => d.subject)].map(([subject,value]) => ({...value, subject})).sort((f,s) => f.maxTotalPoints - s.maxTotalPoints);
  return Plot.plot({
    grid: true,
    axis: null,
    label: null,
    width,
    height: 260,
    marginTop: 50,
    marginBottom: 70,
    marks: [
      Plot.axisFx({
        lineWidth: 10,
        anchor: "bottom",
        dy: 30,
        fontSize: 16,
        text: (d) => formatSubject(d),
      }),
      Plot.waffleY(groupedData, { y: "maxTotalPoints", fx:"subject", fillOpacity: 0.4, rx: "100%" }),
      Plot.waffleY(groupedData, {
        fx: "subject",
        y: "totalPoints",
        rx: "100%",
        fill: "orange",
        sort: { fx: "y", reverse: true }
      }),
      Plot.text(groupedData, {
        fx: "subject",
        text: (d) =>
          (d.totalPoints / d.maxTotalPoints).toLocaleString("en-US", {
            style: "percent"
          }),
        frameAnchor: "bottom",
        lineAnchor: "top",
        dy: 6,
        fill: "orange",
        fontSize: 30,
        fontWeight: "bold"
      }),
      Plot.text(groupedData, {
        fx: "subject",
        text: (d) => `${d.totalPoints}`,
        frameAnchor: "top",
        lineAnchor: "bottom",
        dy: -25,
        fill: "orange",
        fontSize: 30,
        fontWeight: "bold"
      }),
      Plot.text(groupedData, {
        fx: "subject",
        text: (d) => `(${d.maxTotalPoints})`,
        frameAnchor: "top",
        lineAnchor: "bottom",
        dy: -5,
        fontSize: 16,
        fontWeight: "bold"
      }),
      
    ]
  })
}

```

Řešení testových úloh v češtině, matice a cizích jazycích pomocí AI.

 - srovnává se pouze konečný výsledek, **né postup řešení**
 - lze srovnávat pouze úlohy, které mají výsledek v textové (číselné) podobě, resp.nelze srovnávat např. konstrukční úlohy, kde výsledkem je geometrická konstrukce - AI nedostává žádné body


<div class="tip" label="Postupy řešení">
 
**Postupy řešení** místo konečného výsledku jsou k dispozici u konkrétních testů.

</div>

# Úspěšnost dle předmětů

Procento vyjadřuje **počet bodů z maximálního počtu možných bodů**. Vstupem jsou úlohy z databanky.

# model gtp-5-mini

${
  totalP(rawData3)
}

[více informací](./ai-results-gpt-5-mini)

# model o3-mini

${
  totalP(rawData2)
}

[více informací](./ai-results-o3-mini)

# model gtp-4o

${
  totalP(rawData1)
}

[více informací](./ai-results-gpt-4o)

# model gemini-2.5-flash

${
  totalP(rawData4)
}

[více informací](./ai-results-gemini-2.5-flash)



# Jak je to uděláno?

Vstupem jsou [data](./inputs).

```js run=false
  //load quiz content
  const markdownContent = await loadMarkdown();
  //load quiz metadata
  const jsonMetadata = await loadJson();

  //init api call and expect to return structured output (json schema based on json metadata)
  const response = await client.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: "system", content: `You are an expert at ${subject === 'math' ? 'math' : subject === 'cz' ? 'czech language' : `${subject} language`}.
            You will be given quiz with questions. The quiz format is markdown text.
            Each question is identified by markdown headings. Some question can have sub questions.
            - # heading is root questions - question id is identified by format # {number}
            - ## heading is sub question - question id is identified by format ## {number}.{number}`
          },
          {
            role: "user", content: [
              { type: "text", text: "Solve the quiz questions and return the final answer for each question or sub question. Do not include steps to explain the result." },
              { type: "text", text: markdownContent },
            ]
          },
        ],
        response_format: zodResponseFormat(quizSchema(jsonMetadata), code),
        temperature: 1.,
        max_tokens: 2000,
        top_p: 1.
      });

  //get the result of api call
  const result = response.choices[0].message.content;
  
  //init quiz model
  await dispatch.quiz.initAsync({ tree: convertTree(jsonMetadata), assetPath: pathes });
  
  //submit quiz results
  dispatch.quiz.submitQuiz(JSON.parse(result));

  //log the total points
  console.log(pathes, store.getState().quiz.totalPoints)

```
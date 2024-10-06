---
title: Quiz utils
theme: ["wide"]
sidebar: true
header: false
footer: false
pager: false
toc: false
---

```js
import {getQuizBuilder, ShortCodeMarker, getAllLeafsWithAncestors} from './utils/parse-utils.js';
```

```js
const subjects = ["math","cz"].flatMap(subject => ["4","6","8"].map(period => ({subject, period}))).concat(["cz", "en","de"].map(subject => ({subject,period:'diploma'})));


const selectedSubject = view(Inputs.select(subjects, {label: "Předmět", format: d => `${formatSubject(d.subject)} ${formatPeriod(d.period)}`}));
```

```js
const quizLangCategories = await FileAttachment("./data/quiz-lang-categories.json").json();
const quizGeneratedCategories = await FileAttachment("./data/quiz-categories.json").json();
const quizCategories = ({
  ...quizLangCategories,
  ...quizGeneratedCategories
})

const filteredQuizCategories = Object.entries(quizCategories).flatMap(([code, value]) =>
  value.questions.map((d) => {
    const parsedCode = parseCode(code);
    return {
      ...d,
      code,      
      period: parsedCode.period,      
      subject: parsedCode.subject,
      Category: categories[parsedCode.subject][d.category],
    };
  })
).filter(d => d.subject === selectedSubject.subject && d.period === selectedSubject.period)

const selectedQuestions = view(Inputs.table(filteredQuizCategories));
```

```js
function quizQuestionsByCategory(){
  const groupByQuiz = Object.entries(Object.groupBy(selectedQuestions, ({code}) => code))
  const urls = groupByQuiz.map(
    ([d, values]) => `https://www.eforms.cz/${selectedSubject.subject}/${selectedSubject.period}/${d}`
  );  
  //return urls;
  return forkJoin(
    urls.map((url) => fetch(`${url}/index.md`).then((d) => d.text()))
  ).then((results) =>
    results.map((d, i) => {
      const ids = groupByQuiz[i][1].map(d => parseInt(d.id,10));
      const quizBuilder = parseQuestions(normalizeImageUrlsToAbsoluteUrls(d, [urls[i]]));
      return {
        code:groupByQuiz[i][0],
        content:() => quizBuilder.content(ids),
        quizBuilder,
      }
    }
    )
  )
};
```

```js
function forkJoin(promises) {
  // Return a new promise
  return new Promise((resolve, reject) => {
    // Array to hold the results of all promises
    const results = [];
    let completedPromises = 0;

    // Check if the input is an array of promises
    if (!Array.isArray(promises)) {
      reject(new Error("Input must be an array of promises"));
      return;
    }

    // Loop through each promise
    promises.forEach((promise, index) => {
      // Ensure each item is a promise
      Promise.resolve(promise)
        .then((result) => {
          // Store result at the corresponding index
          results[index] = result;
          completedPromises++;

          // If all promises are completed, resolve with the results array
          if (completedPromises === promises.length) {
            resolve(results);
          }
        })
        .catch((error) => {
          // Reject immediately if any promise fails
          reject(error);
        });
    });

    // Handle empty array case
    if (promises.length === 0) {
      resolve(results);
    }
  });
}
```

```js

const questionsByCategory = await quizQuestionsByCategory();
const quiz = html`<style>img { max-width: 100%;height: auto;}</style><div style="columns: 24rem;">${html`${questionsByCategory.map(
  (d) => html`<div><h0 class="highlight">${formatCode(d.code)}</h0>${mdPlus.unsafe(`${d.content()}`)}</div>`
)}`}</div>`
display(quiz);
```

```js
function parseMetadata(metadata) {
  return getAllLeafsWithAncestors(convertTree(metadata))
}
```

```js
import { parser, GFM, Subscript, Superscript } from 'npm:@lezer/markdown';

function parseQuestions(normalizedQuiz) {
  const markdownParser = parser.configure([[ShortCodeMarker], GFM, Subscript, Superscript]);
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree,normalizedQuiz);
}
```

```js
function normalizeImageUrlsToAbsoluteUrls(markdown, segments) {
  const regex = /\]\((.*?)\)/g;
  const replacedMarkdown = markdown.replace(regex, (match, imageUrl) => {
    const modifiedImageUrl = segments.concat(imageUrl.replace('./', '')).join('/');
    // Reconstruct the markdown with the modified image URL
    return `](${modifiedImageUrl})`;
  });

  return replacedMarkdown;

}
```


```js
import markdownit from "npm:markdown-it";
import mdPlus from "./utils/md-utils.js";
import {convertTree, formatSubject, formatPeriod, parseCode, formatCode, categories} from './utils/quiz-utils.js';
```
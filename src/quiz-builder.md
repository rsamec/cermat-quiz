# Quiz builder

```js
viewof selectedSubject = Inputs.select(subjects, {label: "Předmět", format: d => `${formatSubject(d.subject)} ${formatPeriod(d.period)}`, value:subjects[5]})

```

```table echo

```

```js
viewof showToC = Inputs.toggle({label: "Zobrazit obsah", value: false})
```

```js
{
  if (showToC) {
    return toc({
      headers: "h2, h3, h4",
      hideStartingFrom: "Implementation",
      title: `${formatSubject(selectedSubject.subject)} - ${formatPeriod(
        selectedSubject.period
      )}`
    });
  }
  return md`---`
}
```

```js
quiz = html`<style>img { max-width: 100%;height: auto;}</style><div style="columns: 24rem;">${mdPlus`${quizQuestionsByCategory.map(d => `${formatCode(d.code)}\n---\n${d.content()}`).join(`\n---\n`)}`}</div>`
```

# Implementation

```js echo
subjects = ["math","cz"].flatMap(subject => ["4","6","8"].map(period => ({subject, period}))).concat(["cz", "en","de"].map(subject => ({subject,period:'diploma'})))

```

```js
quizQuestionsByCategory = {
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
      const questions = parseQuestions(normalizeImageUrlsToAbsoluteUrls(d, [urls[i]]));
      const filteredQuestions = questions.filter(d => ids.includes(d.id));
      return {
        code:groupByQuiz[i][0],
        questions: filteredQuestions.map(d => ({ id: d.id, title: d.title })),
        content: () => {
          const aa = filteredQuestions.map(d => d.id);
          console.log(aa)
          return filteredQuestions.map(d => d.content(filteredQuestions.map(d => d.id))).join(" ")
        }
      }
    }
    )
  )
}
```

```js
filteredCategories = categories.filter(d => d.subject === selectedSubject.subject && d.period === selectedSubject.period)
```

```js
categories = Object.entries(quizCategories).flatMap(([code, value]) =>
  value.questions.map((d) => {
    const parsedCode = parseCode(code);
    return {
      ...d,
      code,      
      period: parsedCode.period,      
      subject: parsedCode.subject,
      Category: cat[parsedCode.subject][d.category],
    };
  })
)
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
quizCategories = ({
  ...quizLangCategories,
  ...quizGeneratedCategories
})
```

```js
quizLangCategories = ["AJA-2023", "AJB-2023", "AJA-2024", "AJB-2024", "DEA-2023"].reduce(
  (out, d) => {
    out[d] = {
      questions: [
        [1, 2, 3, 4],
        _.range(5, 13),
        _.range(13,21),
        _.range(21,25),
        _.range(25,30),
        _.range(30,40),
        _.range(40,45),
        _.range(45,50),
        _.range(50,60),
        _.range(60,65),        
      ].flatMap((arr, i) =>
        arr.map((d) => ({
          id: d,
          category:
            i < 4 ? `LISTENING_${i+1}` : i < 8 ? `READING_${i+1}` : `GRAMMER_${i+1}`
        }))
      )
    };
    return out;
  },
  {}
)
```

```js
quizGeneratedCategories = FileAttachment("quiz-categories@1.json").json()
```

```js
html`<style type="text/css">

  blockquote {
    margin-left: 5px;
    border-left: solid 3px #ccc;
    padding-left:10px;
  }
  
  
  h2 {
    padding: 2px 0px;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
  }
  
  h3,
  h4,
  h5,
  h6 {
    padding: 0px;
  }
  img {
    max-width: 100%;
    height: auto;
  }

@media print {
  .observablehq {
     display:none
   }
}

</style>`
```

```js
import {mdPlus} from "@rsamec/quiz-markdown"
```

```js
import {
  normalizeImageUrlsToAbsoluteUrls,
  parseQuestions,
  commonStyles,
  categories as cat,
  parseCode,
  formatCode,
  formatGrade,
  formatPeriod,
  formatSubject
} from "@rsamec/quiz-utils"
```

```js
import { toc } from "@nebrius/indented-toc"
```

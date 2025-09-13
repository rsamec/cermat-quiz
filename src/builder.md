---
title: Sestavení vlastního testu
footer: false
pager: true
toc: true
---

V sekci 'Sestavení testu z úloh' lze z jednotlivých úloh sestavit vlastní test. Ten si následně vytisknout, nasdílet přes url a použít pro online trénování. 


<div class="tip" label="Filtrování">
  Možnosti filtrování až na úroveň jednotlivých úloh.
  <p>Dále lze filterovat podle <strong>roku, testu a kategorie úlohy</strong>.</p>
</div>

# Příklady vlastního sestavení testů

```js
const baseUrl = "https://www.cermatdata.cz";

function renderQuizEx(url){
  return html`<div class="v-stack v-stack--s">
    <div class="h-stack h-stack--end"><a href="${url}" target="_blank">Otevřít <span>↗︎</span></a></div>
    <iframe width="100%" height="350" frameborder="0" src="${url}"></iframe>
  </div>`;
}
```


## Angličtina doplňovačka - maturita jaro + podzim (2024)

```js
const quizEn = `${baseUrl}/quiz-en-diploma?q=AJA-2024,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64|AJB-2024,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64?layout=multiColumn&useFormControl=true&useCode=true`;

display(renderQuizEx(quizEn))

```
---

## Matika konstrukční úlohy - příjmačky čtyřleté 2024

```js
const mathGeo = `${baseUrl}/quiz-math-4?q=M9A-2024,9,10|M9B-2024,9,10|M9C-2024,9,10|M9D-2024,9,10?layout=multiColumn&useFormControl=true&useCode=true&useResources=true`

display(renderQuizEx(mathGeo))
```


## Matika výrazy, rovnice - příjmačky čtyřleté 2024

```js
const mathEquation = `${baseUrl}/quiz-math-4?q=M9A-2024,5|M9B-2024,5|M9C-2024,5|M9D-2024,5?layout=multiColumn&useFormControl=true&useCode=true&useResources=true`
display(renderQuizEx(mathEquation))
```

## Čeština textová návaznost - příjmačky čtyřleté 2024

```js
const czText = `${baseUrl}/quiz-cz-4?q=C9A-2024,14|C9B-2024,14|C9A-2023,15|C9B-2023,14|C9C-2023,15?layout=multiColumn&useFormControl=true&useCode=true`

display(renderQuizEx(czText))
```

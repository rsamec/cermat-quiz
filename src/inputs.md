---
title: Data
footer: false
pager: true
toc: true
---
```js
import { baseDomain, baseDomainPublic, formatSubject, formatPeriod, formatShortCode} from './utils/quiz-string-utils.js';
import { quizes } from "./utils/quiz-utils.js";
```

# Základní zdrojová data

Banka úloh výchází z oficiálních cermat úloh. Použité formáty dat k testovým úlohám.
- **markdown** - testové zadání
- **json** - meta data - klíč správných řešení, body, ...


<div class="caution" label="Upozornění">
  Využití dat je limitováno dodržením pravidel <a href="https://prijimacky.cermat.cz/files/files/CZVV_pravidla-vyuziti-webstrankyn.pdf">CERMAT licence</a>.
</div>

Navíc jsou k dispozici postupy řešení matematických úloh (vše ve formátu **json**)
- **slovní úlohy** - dedukční stromy
- **výrazy a rovnice** - kroky s úpravami výrazů a rovnic
- **konstruční úlohy** - kroky konstrukce geometrických útvarů


## Další formáty dat

Na základě zdrojových dat jsou generovány další možné formáty dat
- **schema.json** - generovaná struktura očekávaných odpovědí na základě meta dat - vhodné pro generování formuláře k vyplnění odpovědí, případně jako struktura pro vrácení odpovědi AI
- kompaktní zadání pro tisk v PDF
  - **pdf** v různých velikostech - [více informací](/print)
- jednotlivé úlohy pro zobrazení v prohlížeči
  - **html** - [více informací](/embedding#javascript-module)
- postupy řešení slovních úloh
  - **markdown** - heslovité řešení vhodné pro LLM modely umělé inteligence - [více informací](/blog/2025-october/#vyuziti-v-notebook-lm)
  - **tldr** - kolaborativní interaktivní canvas - [více informací](/blog/2025-october/#vyuziti-v-tldr-canvasu)


## Příklad zadání

```md

VÝCHOZÍ TEXT K ÚLOZE 4
===
> Petr se Janě před celou třídou posmíval, že má nemoderní mobil a nosí hnusné oblečení,
> a pak se divil, když mu řekla, že se chová jako blbec. Zkrátka *****.

# 4 Která z následujících možností obsahuje ustálené slovní spojení vystihující situaci ve výchozím textu, a patří tedy na vynechané místo (*****) v textu?
- [A] na děravý pytel nová záplata
- [B] na hrubý pytel hrubá záplata
- [C] na hrubý pytel jemná záplata
- [D] na děravý pytel děravá záplata


# 5 Rozhodněte o každé z následujících vět, zda je zapsána pravopisně správně (A), nebo ne (N).
## 5.1 Spoluviníka toho zločinného spiknutí zřejmě nikdo neodhalí. 
## 5.2 Vjezd do areálu výstaviště se nachází hned za kameným mostem. 
## 5.3 V tomto patře jsou kanceláře s výhledem do ulice a nezbitné zázemí. 
## 5.4 Své úspory vynaložil na vybudování záchranné stanice pro zvířata v nouzi. 


```

## Příklad metadata

```ts run = false
  group({
    1: option("B"),
    2: option("D"),
    3: option("D"),
    4: option("B"),
    5: group({
      5.1: optionBool(true),
      5.2: optionBool(false),
      5.3: optionBool(false),
      5.4: optionBool(true),
    }, tasks4Max2Points),
    6: group({
      6.1: option("E"),
      6.2: option("B"),
      6.3: option("D"),
    }),
    7: group({
      7.1: wordsGroup({ podmět: 'kousky', přísudek: 'se objeví' }),
      7.2: wordsGroup({ podmět: 'deště (a) záplavy', přísudek: 'zničily' }),
    }),
  })
```

## Příklad struktura odpovědí

```json
{
  
      "type": "object",
      "properties": {
        "1": {
          "type": "number"
        },
        "2": {
          "type": "number"
        },
        "10": {
          "type": "string",
          "enum": [
            0,
            1,
            2,
            3
          ]
        },
        "12": {
          "type": "string",
          "enum": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        },
        "13": {
          "$ref": "#/definitions/M9D-2025_properties_12"
        },
        "14": {
          "$ref": "#/definitions/M9D-2025_properties_12"
        },
        "3.1": {
          "type": "string",
          "description": "do not use latex formating, use simple math string, for fraction use slash symbol, for powers use caret symbol"
        },
        "3.2": {
          "type": "string",
          "description": "do not use latex formating, use simple math string, for fraction use slash symbol, for powers use caret symbol"
        },    
        "6.1": {
          "type": "string",
          "description": "use format {number}:{number}"
        },
        "6.2": {
          "type": "string",
          "description": "use format {number}:{number}"
        },
        "6.3": {
          "type": "number"
        },
        "7.1": {
          "type": "number"
        },
        "7.2": {
          "type": "array",
          "items": {
            "type": "number"
          },
          "maxItems": 3
        },
        "8.1": {
          "type": "number"
        },
        "8.2": {
          "type": "number"
        },
        "9.1": {
          "type": "string",
          "enum": [
            0,
            1
          ]
        },
}
```

## Příklad dedukční strom

```json
{
 "1": {
    "deductionTree": {
      "children": [
        {
          "children": [
            {
              "children": [
                {
                  "kind": "cont",
                  "agent": "trasa",
                  "quantity": 2.7,
                  "entity": "délka",
                  "unit": "km"
                },
                {
                  "kind": "unit",
                  "unit": "cm"
                },
                {
                  "kind": "cont",
                  "agent": "trasa",
                  "quantity": 270000,
                  "entity": "délka",
                  "unit": "cm"
                }
              ]
            },
            {
              "kind": "rate",
              "agent": "Naďa",
              "quantity": 60,
              "baseQuantity": 1,
              "entity": {
                "entity": "délka",
                "unit": "cm"
              },
              "entityBase": {
                "entity": "krok"
              }
            },
            {
              "kind": "cont",
              "agent": "Naďa",
              "quantity": 4500,
              "entity": "krok"
            }
          ]
        },
        {
          "children": [
            {
              "kind": "rate",
              "agent": "Adam",
              "quantity": 75,
              "baseQuantity": 1,
              "entity": {
                "entity": "délka",
                "unit": "cm"
              },
              "entityBase": {
                "entity": "krok"
              }
            },
            {
              "kind": "cont",
              "agent": "trasa",
              "quantity": 270000,
              "entity": "délka",
              "unit": "cm"
            },
            {
              "kind": "cont",
              "agent": "Adam",
              "quantity": 3600,
              "entity": "krok"
            }
          ]
        },
        {
          "kind": "comp"
        },
        {
          "kind": "comp",
          "agentB": "Adam",
          "agentA": "Naďa",
          "quantity": 900,
          "entity": "krok"
        }
      ]
    }
  },
}
```

### Příklad výrazy a rovnice

```json
{
  "1": {
    "header": "1 Vypočtěte:",
    "mathContent": "\\sqrt{\\left({-5}\\right)^{2}}-3^2= \n",
    "results": [
      {
        "Name": "Vyhodnotit",
        "Answer": "$-4$",
        "TemplateSteps": [
          {
            "Name": "Postup řešení",
            "Steps": [
              {
                "Hint": "Proveďte výpočet.",
                "Step": "Výpočtem $-5$ na $2$ získáte $25$.",
                "Expression": "$$\\sqrt{25}-3^{2}$$ "
              },
              {
                "Hint": null,
                "Step": "Vypočítejte druhou odmocninu z $25$ a dostanete $5$.",
                "Expression": "$$5-3^{2}$$ "
              },
              {
                "Hint": "Proveďte výpočet.",
                "Step": "Výpočtem $3$ na $2$ získáte $9$.",
                "Expression": "$$5-9$$ "
              },
              {
                "Hint": "Odečtěte jeden člen od druhého.",
                "Step": "Odečtěte $9$ od $5$ a dostanete $-4$.",
                "Expression": "$$-4$$ "
              }
            ]
          }
        ]
      }
    ]
  },
}
```
## Příklad konstrukční úlohy

```json
{
    "9": {
    "header": "9 Sestrojte zbývající vrcholy B, C a D lichoběžníku ABCD, označte je písmeny a lichoběžník narýsujte.",
    "results": [
      {
        "Name": "Sestrojit",
        "TemplateSteps": [
          {
            "Name": "Postup řešení",
            "Steps": [
              {
                "Step": "Sestroj přímku AS",
                "Expression": "$ \\mapsto AS $"
              },
              {
                "Step": "Označ bod C jako průsečík kružnice k a přímky AS",
                "Expression": "$ C;C\\in k \\cap \\mapsto AS $"
              },
              {
                "Step": "",
                "Expression": "$ \\mapsto CE $"
              },
              {
                "Step": "",
                "Expression": "$ B;B\\in \\mapsto CE; |CE|=|BE| $"
              },
              {
                "Step": "",
                "Expression": "$ \\mapsto BA $"
              },
              {
                "Step": "",
                "Expression": "$ \\mapsto A; \\mapsto A \\perp \\mapsto BA $"
              },
              {
                "Step": "",
                "Expression": "$ D;D \\in k  \\cap \\mapsto A $"
              },
              {
                "Step": "",
                "Expression": "$ \\square ABCD $"
              }
            ]
          }
        ]
      }
    ]
  },
}
```

## Seznam zdrojových dat v bance úloh


${quizes.map(({subject, period, codes}) => html`<h3>${formatSubject(subject)} ${formatPeriod(period)}</h3> <ul>${
  codes.map(code => html`<li>${formatShortCode(code)}<ul><li><a class="h-stack h-stack--s h-stack-items--center" href="${baseDomainPublic}/${subject}/${period}/${code}/index.md"><i class="fa-brands fa-markdown"></i>testové zadání</a></li><li><a class="h-stack h-stack--s h-stack-items--center" href="${baseDomain}/generated/${code}.json"><i class="fa-brands fa-js"></i>metadata</a></li><li><a class="h-stack h-stack--s h-stack-items--center"  href="/data/arch-${code}.schema.json"><i class="fa-brands fa-js"></i>schéma</a></li>${subject =='math' ? html`<li>postupy řešení<ul><li><a download class="h-stack h-stack--s h-stack-items--center" href="/data/word-problems-${code}.json"><i class="fa-brands fa-js"></i>slovní úlohy - dedukční strom</a></li><li><a download class="h-stack h-stack--s h-stack-items--center" href="/data/math-answers-${code}.json"><i class="fa-brands fa-js"></i>výrazy a rovnice - kroky řešení</a></li><li><a download class="h-stack h-stack--s h-stack-items--center" href="/data/math-geometry-${code}.json"><i class="fa-brands fa-js"></i>konstruční úlohy - kroky řešení</a></li><ul></li>`:''}</ul></li>`
)}</ul>`)}
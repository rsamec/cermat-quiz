---
title: Kategorie úloh
footer: false
pager: true
toc: true
---


# Obtížnost slovních úloh  🚀

```js
import { categories, predicatesCategories} from './utils/quiz-utils.js';
import { formatShortCode,formatShortCodeAlt, formatSubject,formatCode, formatPeriod, parseCode, baseMediaPublic } from './utils/quiz-string-utils.js';
import mdPlus from './utils/md-utils.js';
const rawData = await FileAttachment("./data/word-problems-metrics-flat.json").json();
const data = rawData.filter(d => parseCode(d.code).period != "diploma");

function groupByCode(data){
  return data.reduce((out, d) => {
    if (out[d.code] == null) {
      out[d.code] = {
          rules: 0,
          predicates: 0,
          formulas: 0,
          maxWidth: 0,
          maxDepth: 0,
          count: 0,
          counter: 0,
        } 
    }
    const obj = out[d.code];
    obj.rules+= d.rules;
    obj.predicates+= d.predicates;
    obj.formulas+= d.formulas;
    obj.counter+=1;
    obj.count+=d.count;
    if (d.maxWidth > obj.maxWidth){
      obj.maxWidth = d.maxWidth
    }  
    if (d.maxDepth > obj.maxDepth){
      obj.maxDepth = d.maxDepth
    }

    return out;
  }, {})
}

```

<!-- A shared color scale for consistency, sorted by the number of launches -->


```js

const showMaxWidthInput = Inputs.toggle({label:"Hloubka logického řetězce (maximum)" });
const showMaxWidth = Generators.input(showMaxWidthInput);

const showMaxDepthInput = Inputs.toggle({label:"Šířka logického řetězce (maximum)" });
const showMaxDepth = Generators.input(showMaxDepthInput);

const showFormulasInput = Inputs.toggle({label:"Vzorce (celkem)" });
const showFormulas = Generators.input(showFormulasInput);

```

```js
const wordProblemsSummary =  Plot.plot({
    
    marginLeft: 150,
    marginBottom: 120,
    width: 1000,
  
    //title:`${formatSubject(subject)} - body / maximální počet bodů dle kategorií`,
    x: { label: null, tickRotate: -40, tickFormat: d => d},
    y: { label: null, tickFormat: (d) => (d != null ? formatCode(d) : "") },
    r: { range: [0, 12] },
    marks: [
      Plot.dot(
        data,
        Plot.group(
          { r: "sum" },
          { r: "count", x: "predicates", y: "code", fill: "lightgreen", tip:true }
        ),
        
      ),
      Plot.dot(data, {
        ...Plot.group(
          { r: "count" },
          {
            r: "count",
            x: "rules",
            y: "code",
            //stroke: "blue",
            //fill: "transparent",
            title: "tooltip"
          }
        ),
        stroke: (arr) => {
          return arr.some((d) => d.v != d.count) ? "lightsalmon" : "lightgreen";
        }
      })
    ]
})


const count =  Plot.plot({
      width: 700,
      height: 400,
      marginBottom: 70,
      x: { label: "Rule", tickRotate: -45 },
      y: { label: "Usage Count" },
      marks: [
        Plot.barY(data, { x: "code", y: "predicates", fill: "#4682b4" }),
        Plot.text(data, { x: "code", y: "predicates", text: "predicates", dy: -5 })
      ]
    });

function renderMedian(parameterCode, parameterName){  
  return  Plot.plot({
    marginLeft: 120,
    x: { label: `${parameterName ?? parameterCode} →`, transform: (x) => x},
    y: { label: null, tickFormat: (d) => (d != null ? formatShortCodeAlt(d) : "") },
    marks: [
      Plot.ruleX([0]),
      Plot.tickX(
        data,
        {x: parameterCode, y: "code", strokeOpacity: 0.3,  tip: true, title: d => `Úloha č.${d.key}: ${d[parameterCode]}`}
      ),
      Plot.tickX(
        data,
        Plot.groupY(
          {x: "median"},
          {x: parameterCode, y: "code", stroke: "red", strokeWidth: 4, sort: {y: "x"}}    
        )
      )
    ]
  })
}


function renderRadar(data) {
  const groupedData = Object.entries(data).map(([key,d]) => ({
    name: formatShortCodeAlt(key),
    "kroky": d.rules,
    ...(showFormulas && {"vzorce": d.formulas}),    
    "predikáty": d.predicates,    
    ...(showMaxDepth && {"hloubka (maximum)":d.maxDepth}),
    "úloh":d.counter,
    ...(showMaxWidth && {"šířka (maximum)": d.maxWidth}),

   }
 ));

 const points = groupedData.flatMap(({ name, ...values }, i) =>
    Object.entries(values).map(([key, raw]) => ({
      name,
      key,
      raw,
      fx: (1 + i) % 4, // trellis (facets); we leave facet <0,0> empty for the legend
      fy: Math.floor((1 + i) / 4)
    }))
  );
  for (const [, g] of d3.group(points, d => d.key)) {
    const m = d3.max(g, d => d.raw);
    for (const d of g) d.value = d.raw / m;
  }


const longitude = d3.scalePoint(new Set(Plot.valueof(points, "key")), [180, -180]).padding(0.5).align(1)
return Plot.plot({
  width: Math.max(width, 600),
  marginBottom: 10,
  projection: {
    type: "azimuthal-equidistant",
    rotate: [0, -90],
    // Note: 1.22° corresponds to max. percentage (1.0), plus some room for the labels
    domain: d3.geoCircle().center([0, 90]).radius(1.22)()
  },
  facet: {
    data: points,
    x: "fx",
    y: "fy",
    axis: null
  },
  marks: [

    // Facet name
    Plot.text(points, Plot.selectFirst({text: "name", frameAnchor: "bottom", fontWeight: "400", fontSize: 14})),
    
    // grey discs
    Plot.geo([1.0, 0.8, 0.6, 0.4, 0.2], {
      geometry: (r) => d3.geoCircle().center([0, 90]).radius(r)(),
      stroke: dark ? "white": "black" ,
      fill: dark ? "white": "black",
      strokeOpacity: 0.2,
      fillOpacity: 0.02,
      strokeWidth: 0.5
    }),

    // white axes
    Plot.link(longitude.domain(), {
      x1: longitude,
      y1: 90 - 0.8,
      x2: 0,
      y2: 90,
      stroke: "white",
      strokeOpacity: 0.5,
      strokeWidth: 2.5
    }),

    // tick labels
    Plot.text([0.4, 0.6, 0.8], {
      fx: 0, fy: 0,
      x: 180,
      y: (d) => 90 - d,
      dx: 2,
      textAnchor: "start",
      text: (d) => ( d == 0.8 ? `${100 * d}th percentile` : `${100 * d}th`),
      fill: "currentColor",
      // stroke: "white",
      fontSize: 12
    }),

    // axes labels
    Plot.text(longitude.domain(), {
      fx: 0, fy: 0,
      x: longitude,
      y: 90 - 1.07,
      text: Plot.identity,
      lineWidth: 5,
      fontSize: 12
    }),

    // axes labels, initials
    Plot.text(longitude.domain(), {
      fx: 0, fy: 0, facet: "exclude",
      x: longitude,
      y: 90 - 1.09,
      text: d => d[0],
      lineWidth: 5
    }),
    
    // areas
    Plot.area(points, {
      x1: ({ key }) => longitude(key),
      y1: ({ value }) => 90 - value,
      x2: 0,
      y2: 90,
      fill: "#4269D0",
      fillOpacity: 0.25,
      stroke: "#4269D0",
      curve: "cardinal-closed"
    }),

    // points
    Plot.dot(data, {
      x: ({ key }) => longitude(key),
      y: ({ value }) => 90 - value,
      fill: "#4269D0",
      stroke: "white"
    }),

    // interactive labels
    Plot.text(
      points,
      Plot.pointer({
        x: ({ key }) => longitude(key),
        y: ({ value }) => 90 - value,
        text: (d) => `${d.raw}\n(${Math.round(100 * d.value)}%)`,
        textAnchor: "start",
        dx: 4,
        fill: "currentColor",
        stroke: "white",
        maxRadius: 10,
        fontSize: 12
      })
    )
  ]
})
}

```  


## Obecná myšlenka

Obtížnost úlohy může být považována za funkci několika parametrů, které popisují komplexitu řešení na základě logické a strukturální složitosti.
Formálně: 

${mdPlus.unsafe("$$ D=func(k,p,h,w,f), kde $$")}

- D = obtížnost úlohy
- k = počet kroků
- p = počet použitých predikátů
- h = maximální hloubka dedukčního stromu
- w = maximální šířka dedukčního stromu
- f = počet vzorců (formulí) použitých v dedukčním stromu



| Parametr                  | Popis                                                       | Typický vliv na obtížnost                                              |
| ------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Počet kroků (k)**       | Kolik inferenčních kroků je nutno provést k vyřešení úlohy. | Lineární růst obtížnosti, např. ( D_k \propto k ).                     |
| **Počet predikátů (p)**   | Kolik různých predikátů či konceptů se v úloze objevuje.    | Zvyšuje kognitivní zátěž, často **nelineárně** – kombinatorický efekt. |
| **Maximální hloubka (h)** | Největší počet závislých kroků (hloubka logického řetězce). | Indikátor *logické náročnosti* – často exponenciální růst obtížnosti.  |
| **Maximální šířka (w)**   | Počet paralelních větví dedukce (alternativ, případů).      | Odráží *rozvětvenost úvahy* – zvyšuje obtížnost kombinatoricky.        |
| **Počet vzorců (fₛ)**     | Počet různých vzorců (axiomů, vztahů) použitých při řešení. | Zvyšuje množství potřebné znalosti a paměťové zátěže.                  |


<div class="warning" label="Reálné stanovení obtížnosti">

  Výpočet obtížnosti tak, aby objektivně zhodnotil obtížnost testu, vyžaduje **pokročilejší model**, kde se váhy jednotlivých parametrů stanový empiricky např. analýzou data o úspěšnosti studentů.

</div>

## Vizualice rozdílů v jednotlivých testech

Jednoduchý přehled o rozdílech v jednotlivých testech. Použité parametry
- k - počet kroků (celkem za test)
- p - počet použitých predikátů (celkem za test)
- ú - počet úloh (celkem za test)

Volitelné parametry
- h = maximální hloubka dedukčního stromu
- w = maximální šířka dedukčního stromu
- f = počet použití vzorců (formulí) (celkem za test)



${showMaxWidthInput}

${showMaxDepthInput}

${showFormulasInput}



### Čtyřleté studium

```js
display(renderRadar(groupByCode(data.filter(d => parseCode(d.code).period == 4))))
```

### Osmileté studium

```js
display(renderRadar(groupByCode(data.filter(d => parseCode(d.code).period == 8))))
```

### Šestileté studium

```js
display(renderRadar(groupByCode(data.filter(d => parseCode(d.code).period == 6))))
```

## Medián dle parametrů za jednotlivé úlohy
```js
```

### Medián počtu kroků za jednotlivé úlohy
${renderMedian("rules", "počet kroků za úlohu")}

### Medián počtu predikátů za jednotlivé úlohy
${renderMedian("predicates", "počet predikátů za úlohu")}

### Medián maximální hloubka dedukčního stromu
${renderMedian("maxDepth","max. hloubka logického řetězce per úloha")}

### Medián maximální šířka dedukčního stromu
${renderMedian("maxWidth","max. šířka dedukčního stromu per úloha")}

### Medián počtu podúloh za úlohu
${renderMedian("count", "počet podúloh per úloha")}


</div>
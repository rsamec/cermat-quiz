import { commonSense, comp, compAngle, compDiff, compPercent, compRatio, cont, ctor, ctorComplement, nthPart, percent, product, proportion, rate, ratios, sum } from "../../components/math";
import { axiomInput, deduce, last, to, toCont } from "../../utils/deduce-utils";


export const example_4_1 = () => {
  const entity = "žáci";
  return {
    deductionTree: toCont(
      deduce(
        deduce(
          axiomInput(cont("průměř", 21, entity), 2),
          cont("počet míčových sportů", 3, ""),
          product("počet všech žáků míčové sporty", [], entity, entity)
        ),
        deduce(
          cont("volejbal", 28, entity),
          cont("fotbal", 16, entity),
          sum("fotbal a volejbal", [], entity, entity)
        ),
        ctor('comp-diff')
      ),
      { agent: "vybíjená" }
    )
  }
}
export const example_4_2 = () => {
  return {
    deductionTree: to(
      compRatio("chlapci", "dívky", 3 / 2),
      ratios("plavání", ["dívky", "chlapci"], [2, 3])
    )
  }
}

export const example_13 = () => {
  const dvou = "dvoukorunové"
  const peti = "pětikorunové"
  const deseti = "desitikorunové"
  const entity = "kus"
  const entityPrice = "korun";
  const pocetDeseti = cont(deseti, 6, entity);
  const pocetPeti = deduce(
    pocetDeseti,
    compRatio(peti, deseti, 2)
  );
  const pocetDvou = deduce(
    pocetPeti,
    compRatio(dvou, peti, 5)
  )



  return {
    deductionTree: deduce(
      deduce(pocetDvou, rate(dvou, 2, entityPrice, entity)),
      deduce(last(pocetPeti), rate(peti, 5, entityPrice, entity)),
      deduce(pocetDeseti, rate(deseti, 10, entityPrice, entity)),
      sum("hodnota", [], entityPrice, entityPrice)
    )
  }
}

export const example_11 = () => {
  const entity = "stupňů";

  const inputAngleLabel = `zadaný úhel`;
  const triangleSum = cont('součet úhlů v trojúhelníku', 180, entity)
  const triangle = "úhel trojúhelníku ABD";

  return {
    deductionTree:
      deduce(
        toCont(
          deduce(
            triangleSum,
            deduce(
              deduce(axiomInput(cont(inputAngleLabel, 40, entity), 2), compAngle(inputAngleLabel, `${triangle} u vrcholu B`, 'alternate')),
              deduce(
                axiomInput(cont(inputAngleLabel, 70, entity), 1),
                compAngle(inputAngleLabel, `${triangle} u vrcholu A`, "supplementary")
              ),
              sum("dvojice úhlů v trojúhelníku", [], entity, entity)),
            ctor('comp-diff'))
          , { agent: `${triangle} u vrcholu D` }),
        compAngle(`${triangle} u vrcholu D`, "φ", 'supplementary')

      )

  }
}

export const example_12 = () => {
  const ctverecDelkaLabel = "strana čtverce";
  const entity = "cm"
  const entity2d = "cm2"
  const rectangleWidthLabel = "šířka obdelníka"

  const rectangleWidth = to(
    axiomInput(cont("nejdelší strana sedmiúhelníku", 5, entity), 2),
    commonSense("tato délka odpovídá šířce obdélníku"),
    cont(rectangleWidthLabel, 5, entity)
  )

  const triangleHeight = to(
    commonSense("tři čtverce tvoří výšku trojůhelníku"),
    cont("výška šedého trojúhelníku", 3, entity),
  )

  //const rectangleWidth = cont(rectangleWidthLabel, 5, entity);

  return {
    deductionTree: deduce(
      deduce(
        axiomInput(cont(ctverecDelkaLabel, 1, entity), 1),
        cont("počet čtverců", 3, ""),
        product("obsah tři shodné čtverce", [], entity2d, entity)
      ),
      deduce(
        rectangleWidth,
        deduce(
          last(rectangleWidth),
          compDiff(rectangleWidthLabel, "výška obdelníku", 3, entity)
        ),
        product("obsah obdelníku", [], entity2d, entity)
      ),
      deduce(
        deduce(
          triangleHeight,
          deduce(
            last(rectangleWidth),
            compDiff(rectangleWidthLabel, "základna šedého trojúhelníku", 1, entity)
          ),
          cont("polovina", 1 / 2, ""),
          product("obsah šedého trojúhelníku", [], entity2d, entity)
        ),
        cont("počet šedých trojúhleníků", 3, ""),
        product("obsah tří šedých trojúhelníku", [], entity2d, entity2d)
      ),
      sum("obsah sedmiúhelníku", [], entity2d, entity2d)
    )
  }

}

export const example_15_1 = () => {

  const deducePercent = deduce(
    axiomInput(percent("celá kniha", "Róza přečteno", 60), 2),
    ctorComplement("Róza nepřečteno")
  );


  return {
    deductionTree: deduce(
      axiomInput(cont("celá kniha", 1200, "stran"), 1),
      deducePercent)
  }
}

export const example_15_2 = () => {
  const entity = "Kč"
  const compare = axiomInput(comp("dospělé vstupné", "dětské vstupné", 210, entity), 2);

  return {
    deductionTree: deduce(deduce(
      axiomInput(compPercent("dětské vstupné", "dospělé vstupné", 70), 1),
      compare,
    ), compare)
  }
}

export const example_15_3 = () => {
  const entity = "obyvatel";
  const den1 = axiomInput(cont("přišlo 1.den", 500, entity), 2)
  const obec = deduce(
    axiomInput(percent("obec", "přišlo 1.den", 25), 1),
    den1
  );


  return {
    deductionTree:
      deduce(
        last(obec),
        deduce(
          deduce(
            deduce(
              obec,
              compDiff("obec", "zbývající dospělý", 500, entity)),
            axiomInput(percent("zbývající dospělý", "přišlo 2.den", 70), 3)
          ),
          den1,
          sum("přišlo celkem", [], entity, entity)
        ),
        ctor('comp-diff')
      )
  }
}


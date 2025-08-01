import { productCombine, commonSense, comp, compAngle, compDiff, compPercent, compRatio, cont, ctor, accumulate, ctorComplement, ctorOption, repeat, sum, percent, rate, ratios, product } from "../../components/math";
import { axiomInput, createLazyMap, deduce, last, to, toCont } from "../../utils/deduce-utils";
import { comparingValues } from "../comparing-values";
import { compass } from "../compass";
import { obrazce } from "../obrazce";
import { odmenySoutezici } from "../odmeny-soutezici";
import { sesity } from "../sesity";
import { trideni_odpadu } from "../trideni-odpady";
import cetar from "./cetar";
import zakusek from "./zakusek";

var cetarParams = {
  input: {
    kapitan: 1,
    porucik: 4,
    cetarPerPorucik: 3,
    vojinPerCetar: 10
  }
};

export default createLazyMap({
  1: () => comparingValues({
    input: {
      first: {
        ratio: 3 / 4,
        value: 24
      },
      second: {
        ratio: 1 / 3,
        value: 12
      }
    }
  }),
  3.1: () => cetar(cetarParams)[0],
  3.2: () => cetar(cetarParams)[1],
  3.3: () => cetar(cetarParams)[2],
  4.1: () => example_4_1(),
  4.2: () => example_4_2(),
  5.1: () => sesity()[1],
  5.2: () => compass(),
  6.1: () => odmenySoutezici()[0],
  6.2: () => odmenySoutezici()[1],
  10.1: () => trideni_odpadu().papirStoR,
  10.2: () => trideni_odpadu().plast2,
  10.3: () => trideni_odpadu().kovyToPapir,
  11: () => example_11(),
  12: () => example_12(),
  // 13:() => example_13(),
  14: () => zakusek({
    input: {
      cena: 72
    }
  }),
  15.1: () => example_15_1(),
  15.2: () => example_15_2(),
  15.3: () => example_15_3(),
  16.1: () => obrazce()[0],
  16.2: () => obrazce()[1],
  16.3: () => obrazce()[2]
})
function example_4_1() {
  const entity = "žáci";
  return {
    deductionTree: toCont(
      deduce(
        deduce(
          axiomInput(cont("průměř", 21, entity), 2),
          repeat("počet míčových sportů", 3),
          product("počet všech žáků míčové sporty")
        ),
        deduce(
          cont("volejbal", 28, entity),
          cont("fotbal", 16, entity),
          accumulate("fotbal a volejbal")
        ),
        ctor('comp-diff')
      ),
      { agent: "vybíjená" }
    )
  }
}
function example_4_2() {
  return {
    deductionTree: to(
      compRatio("chlapci", "dívky", 3 / 2),
      ratios("plavání", ["dívky", "chlapci"], [2, 3])
    )
  }
}

function example_13() {
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
      accumulate("hodnota")
    )
  }
}

function example_11() {
  const entity = "stupňů";

  const inputAngleLabel = `zadaný úhel`;
  const triangleSum = cont('součet úhlů v trojúhelníku', 180, entity)
  const triangle = "úhel trojúhelníku ABD";

  return {
    deductionTree: deduce(
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
              sum("dvojice úhlů v trojúhelníku")),
            ctor('comp-diff'))
          , { agent: `${triangle} u vrcholu D` }),
        compAngle(`${triangle} u vrcholu D`, "φ", 'supplementary')

      ),
      ctorOption("D", 150)
    )

  }
}

function example_12() {
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
        deduce(
          axiomInput(cont(ctverecDelkaLabel, 1, entity), 1),
          cont("počet čtverců", 3, ""),
          productCombine("obsah tři shodné čtverce", entity2d)
        ),
        deduce(
          rectangleWidth,
          deduce(
            last(rectangleWidth),
            compDiff(rectangleWidthLabel, "výška obdelníku", 3, entity)
          ),
          productCombine("obsah obdelníku", entity2d)
        ),
        deduce(
          deduce(
            triangleHeight,
            deduce(
              last(rectangleWidth),
              compDiff(rectangleWidthLabel, "základna šedého trojúhelníku", 1, entity)
            ),
            cont("polovina", 1 / 2, ""),
            productCombine("obsah šedého trojúhelníku", entity2d)
          ),
          cont("počet šedých trojúhleníků", 3, ""),
          productCombine("obsah tří šedých trojúhelníku", entity2d)
        ),
        sum("obsah sedmiúhelníku")
      ),
      ctorOption("B", 31)
    )
  }

}

function example_15_1() {

  const deducePercent = deduce(
    axiomInput(percent("celá kniha", "Róza přečteno", 60), 2),
    ctorComplement("Róza nepřečteno")
  );


  return {
    deductionTree: deduce(
      deduce(
        axiomInput(cont("celá kniha", 1200, "stran"), 1),
        deducePercent),
      ctorOption("C", 480)
    )
  }
}

function example_15_2() {
  const entity = "Kč"
  const compare = axiomInput(comp("dospělé vstupné", "dětské vstupné", 210, entity), 2);

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(compPercent("dětské vstupné", "dospělé vstupné", 70), 1),
          compare,
        ), compare),
      ctorOption("D", 490)
    )
  }
}

function example_15_3() {
  const entity = "obyvatel";
  const den1 = axiomInput(cont("přišlo 1.den", 500, entity), 2)
  const obec = deduce(
    axiomInput(percent("obec", "přišlo 1.den", 25), 1),
    den1
  );


  return {
    deductionTree: deduce(
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
          accumulate("přišlo celkem")
        ),
        ctor('comp-diff')
      ),
      ctorOption("B", 450)
    )
  }
}


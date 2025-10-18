import { commonSense, comp, compAngle, compDiff, compPercent, compRatio, cont, ctor, sum, ctorComplement, ctorOption, counter, percent, rate, ratios, product, triangleAngle, ctorDifference, nthPart, contLength, dimensionEntity, ctorRatios, rectangleArea, triangleArea } from "../../components/math";
import { axiomInput, createLazyMap, deduce, last, to } from "../../utils/deduce-utils";
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
  13: () => minceVKasicce(),
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
    deductionTree: deduce(
      deduce(
        axiomInput(cont("průměř", 21, entity), 2),
        counter("počet míčových sportů", 3),
        product("počet všech žáků míčové sporty")
      ),
      deduce(
        cont("volejbal", 28, entity),
        cont("fotbal", 16, entity),
        sum("fotbal a volejbal")
      ),
      ctorDifference('vybíjená')
    )
  }
}
function example_4_2() {
  return {
    deductionTree: deduce(
      deduce(
        compRatio("chlapci", "dívky", 3 / 2),
        ctorRatios("plavání")
      ),
      ctor("reverse")
    )
  }
}

function minceVKasicce() {
  const entity = "Kč";
  const dvou = "dvoukoruny"
  const deseti = "desetikoruny";
  const peti = "pětikoruny";

  const minceEntity = "mince"
  const celkem = cont("kasička s mincemi", 78, minceEntity)
  const rozlozeni = ratios("kasička s mincemi", [deseti, peti, dvou], [1, 2, 10])
  const dvouPocet = deduce(
    rozlozeni,
    celkem,
  )
  const petiPocet = deduce(
    rozlozeni,
    celkem,
    nthPart(peti)
  )
  const desetiPocet = deduce(
    rozlozeni,
    celkem,
    nthPart(deseti)
  )


  return {
    deductionTree: deduce(
      deduce(
        deduce(dvouPocet, rate(dvou, 2, { entity }, { entity: minceEntity })),
        deduce(petiPocet, rate(peti, 5, { entity }, { entity: minceEntity })),
        deduce(desetiPocet, rate(deseti, 10, { entity }, { entity: minceEntity })),
        sum("celkem v kasičce")
      ),
      ctorOption("E", 240)
    )
  }
}

function example_11() {
  const entity = "stupňů";

  const inputAngleLabel = `zadaný úhel`;

  const triangle = "úhel trojúhelníku ABD";

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(axiomInput(cont(inputAngleLabel, 40, entity), 2), compAngle(inputAngleLabel, `${triangle} u vrcholu B`, 'alternate')),
          deduce(
            axiomInput(cont(inputAngleLabel, 70, entity), 1),
            compAngle(inputAngleLabel, `${triangle} u vrcholu A`, "supplementary")
          ),
          triangleAngle(`${triangle} u vrcholu D`)
        ),
        compAngle(`${triangle} u vrcholu D`, "φ", 'supplementary')
      ),
      ctorOption("D", 150)
    )

  }
}

function example_12() {
  const dim = dimensionEntity()
  const ctverecDelkaLabel = "strana čtverce";
  const rectangleWidthLabel = "šířka obdelníka"

  const rectangleWidth = to(
    axiomInput(contLength("nejdelší strana sedmiúhelníku", 5), 2),
    commonSense("tato délka odpovídá šířce obdélníku"),
    contLength(rectangleWidthLabel, 5)
  )

  const triangleHeight = to(
    commonSense("tři čtverce tvoří výšku trojůhelníku"),
    contLength("výška šedého trojúhelníku", 3),
  )

  //const rectangleWidth = cont(rectangleWidthLabel, 5, entity);

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(contLength(ctverecDelkaLabel, 1), 1),
          counter("počet čtverců", 3),
          product("tři shodné čtverce")
        ),
        deduce(
          rectangleWidth,
          deduce(
            last(rectangleWidth),
            compDiff(rectangleWidthLabel, "výška obdelníku", 3, dim.length.entity)
          ),
          rectangleArea("obdelník")
        ),
        deduce(
          deduce(
            triangleHeight,
            deduce(
              last(rectangleWidth),
              compDiff(rectangleWidthLabel, "základna šedého trojúhelníku", 1, dim.length.entity)
            ),
            triangleArea("šedý trojúhelníku")
          ),
          counter("počet šedých trojúhleníků", 3),
          product("tři šedé trojúhelníky")
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
          sum("přišlo celkem")
        ),
        ctorDifference('nepřišlo')
      ),
      ctorOption("B", 450)
    )
  }
}


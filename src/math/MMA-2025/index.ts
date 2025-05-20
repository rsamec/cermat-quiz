import { comp, cont, ctor, ctorComplement, ctorLinearEquation, ctorUnit, product, quota, rate, ratio, sum } from "../../components/math";
import { deduce, last, lastQuantity, to, toCont } from "../../utils/deduce-utils";


export default {
  1: boruvky(),
  5.1: spotrebaPaliva().beznePalivo,
  5.2: spotrebaPaliva().powerPalivo,
  6: spotrebaPaliva().cenaPowerPalivo,
  // 8: prumernyPlat(),
}


function boruvky() {
  const entity = "hmotnost"
  const entity50 = "hmotnost po 50 g"
  const unit = "g"
  const entityPrice = "korun"
  const prodejce1Label = "prodejce 1";
  const prodejce2Label = "prodejce 2";

  const drazsiBoruvky = deduce(
    deduce(
      cont(prodejce2Label, 120, entityPrice),
      cont(prodejce2Label, 10, entity50),
      ctor('rate')
    ),
    toCont(deduce(
      cont(prodejce1Label, 650, entity, unit),
      cont("částí", 50, entity, "g"),
      ctor('quota')
    ), { agent: "skupina po 650 gramech", entity: { entity: entity50 } }))

  return {
    template: () => '',
    deductionTree: deduce(
      deduce(
        cont("zaplaceno celkem", 600, entityPrice),
        cont("skupina po 650 gramech", 150, entityPrice),
        ctor('quota'),
      ),
      drazsiBoruvky
    )
  }
}

function spotrebaPaliva() {
  const standard = "běžné palivo"
  const power = "power"
  const entityPrice = "korun"
  const entity = "";

  const entityLength = "vzdálenost"
  const unitLength = "km"
  const unit = "l"

  const standardRate = rate(standard, 6.5, { entity, unit }, { entity: entityLength, unit: unitLength });
  const powerRate = rate(power, 5.8, { entity, unit }, { entity: entityLength, unit: unitLength });

  const standardPriceRate = rate(standard, 34.8, entityPrice, { entity, unit })
  const standardPrice = cont(standard, 34.8, entityPrice)
  const powerCompare = comp(power, standard, "x", entityPrice)

  const powerPrice = deduce(
    standardPrice,
    powerCompare
  );

  return {
    beznePalivo: {
      template: () => '',
      deductionTree: deduce(
        deduce(
          cont(standard, "d", entityLength, unitLength),
          standardRate
        ),
        standardPriceRate
      )
    },
    powerPalivo: {
      template: () => '',
      deductionTree:
        deduce(
          deduce(
            cont(power, "d", entityLength, unitLength),
            powerRate
          ),
          to(
            powerPrice,
            rate(power, last(powerPrice).quantity, entityPrice, { entity, unit })
          )
        )
    },
    cenaPowerPalivo: {
      template: () => '',
      deductionTree: deduce(
        deduce(
          deduce(
            cont(power, 1, entityLength, unitLength),
            powerRate
          ),
          to(
            powerPrice,
            rate(power, last(powerPrice).quantity, entityPrice, { entity, unit })
          )
        ),
        deduce(
          deduce(
            cont(standard, 1, entityLength, unitLength),
            standardRate
          ),
          standardPriceRate
        ),
        ctorLinearEquation("o kolik dražší power než běžné palivo", { entity: entityPrice }, "x")
      )
    }
  }
}


function prumernyPlat() {
  const entity = "zaměstnanci"
  const entityPrice = "korun"
  const zamLabel = "celkem"
  const seniorLabel = "senior"
  const ostatniLabel = "ostatní"
  const prumerLabel = "průměr"

  const platJunior = cont(ostatniLabel, "x", entityPrice);
  const platCompare = comp(seniorLabel, ostatniLabel, 6_000, entityPrice)
  const platSenior = deduce(
    platJunior,
    platCompare
  )

  const senioryPocetRatio = ratio(zamLabel, seniorLabel, 1 / 3);


  const prumernyPlat = cont(prumerLabel, 46_200, entityPrice)

  const senioryCelkem = deduce(
    platSenior,
    senioryPocetRatio
  )
  const juniorPocatRatio = deduce(senioryPocetRatio, ctorComplement(ostatniLabel));
  const juniorCelkem = deduce(
    platJunior,
    deduce(senioryPocetRatio, ctorComplement(ostatniLabel))
  )

  const seniorVsJuniorPlat = comp(seniorLabel, ostatniLabel, 6_000, entityPrice)

  return {
    template: () => '',
    deductionTree: deduce(
      prumernyPlat,
      deduce(
        senioryCelkem,
        juniorCelkem,
        product("celkem vyplaceno", [], entityPrice, entityPrice)
      ),
      ctorLinearEquation(zamLabel, {entity:entityPrice}, "x" )
    )
  }
}
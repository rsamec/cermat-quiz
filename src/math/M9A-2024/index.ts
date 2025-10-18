import { comp, compRatio, contLength, counter, ctorDifference, ctorOption, dimensionEntity, pythagoras, rectangleArea, sum, triangleArea } from "../../components/math";
import { createLazyMap, deduce } from "../../utils/deduce-utils";
import { rozdilUhlu } from "./angle";
import dumMeritko from "./dum-meritko";
import dvaCtverce from "./dva-ctverce";
import { example1, example2, example3 } from "./kolo";
import obrazec from "./obrazec";
import svadleny from "./svadleny";
import tanga from "./tanga";
import tezitko from "./tezitko";
import tridaSkupiny from "./trida-skupiny";


const tridaSkupinyParams = {
  input: {
    chlapci: 14,
    anglictinaChlapci: 5,
    nemcinaDivky: 4
  }
}

const dumMeritkoParams = {
  input: {
    sirkaM: 10,
    planSirkaCM: 10,
    planDelkaDM: 2,
  }
}

export default createLazyMap({
  1: () => svadleny({ input: { currentWorker: 4, previousWorker: 5, previousHours: 24 } }),
  2: () => tezitko({
    input: {
      out: {
        radius: 10,
        height: 12,
      },
      in: {
        radius: 5,
        height: 8
      }
    }
  }),
  6.1: () => lichobeznik().obsah,
  6.2: () => lichobeznik().rameno,
  7.1: () => tridaSkupiny(tridaSkupinyParams)[0],
  7.2: () => tridaSkupiny(tridaSkupinyParams)[1],
  8.1: () => tanga({ input: { tangaWidth: 20 } })[0],
  8.2: () => tanga({ input: { tangaWidth: 20 } })[1],
  11: () => rozdilUhlu({ input: { delta: 107, beta: 23 } }),
  12: () => obrazec({ input: { obvod: 30 } }),
  13: () => dvaCtverce({ input: { rozdilObvod: 6, obdelnikCtvAStrana: 1 / 2, obdelnikCtvBStrana: 1 / 5 } }),
  14: () => neznama().alternative1,
  15.1: () => dumMeritko(dumMeritkoParams)[0],
  15.2: () => dumMeritko(dumMeritkoParams)[1],
  15.3: () => dumMeritko(dumMeritkoParams)[2],
  16.1: () => example1({ input: { base: 20_000, percentage: 13.5 } }),
  16.2: () => example2({ input: { vlozeno: 1_000_000, urokPercentage: 2.5, danPercentage: 15 } }),
  16.3: () => example3({ input: { base: 20_000, percentageDown: 10, percentageNewUp: 10 } }),
})
function neznama() {
  const polovina = compRatio("polovina", "neznámé číslo", 1 / 2)
  return {
    alternative1: {
      deductionTree: deduce(
        deduce(
          deduce(
            compRatio("dvojnásobek", "neznámé číslo", 2),
            polovina,
            ctorDifference("rozdíl")
          ),
          counter("rozdíl", 135)
        ),
        ctorOption("D", 90)
      )
    },
    alternative2: {
      deductionTree: deduce(
        deduce(
          deduce(
            compRatio("dvojnásobek", "neznámé číslo", 2),
            polovina,
          ),
          comp("dvojnásobek", "polovina", 135, "")
        ),
        polovina
      )
    }
  }

}
function lichobeznik() {
  const dim = dimensionEntity()
  const zakladna1 = contLength("spodní základna - AB", 40)
  const zakladna2 = contLength("horní základna - DC", 28)
  const vyska = deduce(
    zakladna1,
    contLength("AC", 41),
    pythagoras("AC", ["AB", "strana BC = výška"])
  )
  const rozdilZakladen = deduce(
    zakladna1,
    zakladna2,
    ctorDifference("rozdíl základen")
  )


  return {
    obsah: {
      deductionTree: deduce(
        deduce(
          vyska,
          zakladna2,
          rectangleArea("obdelník")
        ),
        deduce(
          rozdilZakladen,
          vyska,
          triangleArea("trojúhelník")
        ),
        sum("lichoběžník")
      )
    },
    rameno: {
      deductionTree: deduce(
        vyska,
        rozdilZakladen,
        pythagoras("AD", ["strana BC = výška", "rozdíl základen"])
      )
    },
  }
}
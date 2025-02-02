import { cont, ratio, type Container, ctorRatio, ctor, comp, compDiff, sum, transfer } from "../../components/math.js";
import { deduce, axiomInput, last, deduceLbl, to } from "../../utils/deduce-utils.js";


const entity = "litrů";
const entityPercent = "%";

export function objemNadoby1({ input }: {
  input: {
    zbyva: number,
    zaplnenoPomer: number
  }
}) {
  const percentage = axiomInput(ratio("celkem", "zaplněno", input.zaplnenoPomer), 1);
  const part = axiomInput(cont("zbytek", input.zbyva, entity), 2);


  const deductionTree = deduce(
    deduce(percentage, ctorRatio("zbytek")),
    part,
  )

  return { deductionTree }
}

export function objemNadoby2({ input }: {
  input: {
    odebrano: number,
    zaplnenoProcento: number
    zaplnenoPoOdebraniRatio: number,
  }
}) {

  const percentage = axiomInput(cont("původně zaplněno", input.zaplnenoProcento, entityPercent), 1);
  const odebrano = axiomInput(comp("původně zaplněno", "nově zaplněno", input.odebrano, entity), 2);
  const zaplnenoPoOddebrani = axiomInput(ratio("celek", "nově zaplněno", input.zaplnenoPoOdebraniRatio), 3);
  const celek = cont("celek", 100, entityPercent);

  const deductionTree = deduce(deduce(
    deduce(
      percentage,
      deduce(zaplnenoPoOddebrani, celek),
    ),
    odebrano

  ), celek)

  return { deductionTree }
}

export function objemNadoby3({ input }: {
  input: {
    nadoba1Procent: number
    nadoba2Procent: number
    nadoba3: number,
    prumerNadobaRatio: number
  }
}) {

  const nadoba1 = axiomInput(cont("nádoba 1", input.nadoba1Procent, entityPercent), 1);
  const nadoba2 = axiomInput(cont("nádoba 2", input.nadoba2Procent, entityPercent), 2);
  const nadoba3 = axiomInput(cont("nádoba 3", input.nadoba3, entity), 3);
  const prumer = axiomInput(ratio("nádoba celkem", "naplněno průměr", input.prumerNadobaRatio), 4);

  const celek = cont("nádoba celkem", 100, entityPercent);

  const average = deduce(prumer, celek)

  const deductionTree = deduce(
    deduce(
      deduce(
        to(
          deduce(
            deduce(nadoba1, average),
            deduce(nadoba2, { ...last(average), ...deduceLbl(1) }),
            sum("rozdíl vůči průměru", [], entityPercent, entityPercent)
          ),
          transfer("nádoba 3", "nádoba 1", 10, entityPercent)),
          nadoba1,
      ),
      celek,
      ctor("ratio")
    )
    ,nadoba3
  )

  return { deductionTree }
}

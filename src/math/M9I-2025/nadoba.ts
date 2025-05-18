import { cont, ratio, ctorComplement, comp, transfer, percent, ctorPercent, commonSense, ctorOption } from "../../components/math.js";
import { deduce, axiomInput, to } from "../../utils/deduce-utils.js";


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
    deduce(
      deduce(percentage, ctorComplement("zbytek")),
      part,
    ),
    ctorOption("C", 35)
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

  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(
          percentage,
          deduce(zaplnenoPoOddebrani, celek),
        ),
        odebrano

      ), celek),
    ctorOption("E", 40)
  )

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

  return {
    deductionTree: deduce(
      deduce(
        to(
          nadoba1,
          commonSense(""),
          nadoba2,
          deduce(prumer, ctorPercent()),
          transfer("nádoba 3", "nádoba 1", 10, entityPercent),
          percent("nádoba celkem", "nádoba 3", 50)
        ),
        nadoba3),
      ctorOption("D", 38)
    )
  }
}

import { cont, ctor, ctorBooleanOption, ctorOption, sum } from "../components/math";
import { deduce } from "../utils/deduce-utils";

export const trideni_odpadu = () => {
  const oddilR = "oddíl R"
  const oddilS = "oddíl S"
  const oddilT = "oddíl T"
  const entityPapir = "papír";
  const entityPlast = "plast";
  const entityKovy = "kovy";
  const entityVaha = "kg"

  const kovyCelkem = deduce(
    cont(oddilR, 3, entityKovy),
    cont(oddilS, 3, entityKovy),
    cont(oddilT, 4, entityKovy),
    sum(`kovy všechny oddíly`, [], entityVaha, entityPlast)
  )

  const papirCelkem = deduce(
    cont(oddilR, 6, entityPapir),
    cont(oddilS, 8, entityPapir),
    cont(oddilT, 1, entityPapir),
    sum(`papír všechny oddíly`, [], entityVaha, entityPlast)
  )
  const plast = deduce(
    deduce(
      cont(oddilT, 9, entityPlast),
      cont(oddilS, 11, entityPlast),
      sum(`oddíl S a T`, [], entityPlast, entityPlast)
    ),
    cont(oddilR, 15, entityPlast),
    ctor('comp-ratio')
  );

  return {
    papirStoR: {
      deductionTree: deduce(
        deduce(
          cont(oddilS, 8, entityPapir),
          cont(oddilR, 6, entityPapir),
          ctor('comp-ratio')
        ),
        ctorBooleanOption(1 / 4)
      )
    },
    papirRtoS: {
      deductionTree: deduce(
        deduce(
          cont(oddilR, 6, entityPapir),
          cont(oddilS, 8, entityPapir),
          ctor('comp-ratio')
        ),
        ctorOption('C', 1 / 4)
      )
    },
    plast1: {
      deductionTree: deduce(
        plast,
        ctorOption("D", 1 / 3)
      )
    },
    plast2: {
      deductionTree: deduce(
        plast,
        ctorBooleanOption(1 / 3)
      )
    },
    kovyToPapir: {
      deductionTree: deduce(
        deduce(
          kovyCelkem,
          papirCelkem,
          ctor('comp-ratio')
        ),
        ctorBooleanOption(1 / 2)
      )
    },
    papirToKovy: {
      deductionTree: deduce(
        deduce(
          papirCelkem,
          kovyCelkem,
          ctor('comp-ratio')
        ),
        ctorOption("E", 1 / 2)
      )
    }
  }
}
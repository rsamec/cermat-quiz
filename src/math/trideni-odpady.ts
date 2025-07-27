import { cont, ctor, ctorBooleanOption, ctorOption, combine, ctorSlide } from "../components/math";
import { deduce } from "../utils/deduce-utils";

export const trideni_odpadu = () => {
  const oddilR = "oddíl R"
  const oddilS = "oddíl S"
  const oddilT = "oddíl T"
  const entityPapir = "papír";
  const entityPlast = "plast";
  const entityKovy = "kovy";
  const unit = "kg"

  const kovyCelkem = deduce(
    cont(oddilR, 3, entityKovy, unit),
    cont(oddilS, 3, entityKovy, unit),
    cont(oddilT, 4, entityKovy, unit),
    ctorSlide(`kovy všechny oddíly`)
  )

  const papirCelkem = deduce(
    cont(oddilR, 6, entityPapir, unit),
    cont(oddilS, 8, entityPapir, unit),
    cont(oddilT, 1, entityPapir, unit),
    ctorSlide(`papír všechny oddíly`)
  )
  const plast = deduce(
    deduce(
      cont(oddilT, 9, entityPlast, unit),
      cont(oddilS, 11, entityPlast, unit),
      ctorSlide(`oddíl S a T`)
    ),
    cont(oddilR, 15, entityPlast, unit),
    ctor('comp-ratio')
  );

  return {
    papirStoR: {
      deductionTree: deduce(
        deduce(
          cont(oddilS, 8, entityPapir, unit),
          cont(oddilR, 6, entityPapir, unit),
          ctor('comp-ratio')
        ),
        ctorBooleanOption(1 / 4)
      )
    },
    papirRtoS: {
      deductionTree: deduce(
        deduce(
          cont(oddilR, 6, entityPapir, unit),
          cont(oddilS, 8, entityPapir, unit),
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
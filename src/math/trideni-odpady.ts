import { cont, ctor, sum } from "../components/math";
import { deduce } from "../utils/deduce-utils";

export const trideni_odpadu = () => {
  const oddilR = "oddíl R"
  const oddilS = "oddíl S"
  const oddilT = "oddíl T"
  const entityPapir = "papír";
  const entityPlast = "plast";
  const entityKovy = "kovy";
  const entityVaha = "kg"

  return [
    {
      deductionTree: deduce(
        cont(oddilS, 8, entityPapir),
        cont(oddilR, 6, entityPapir),
        ctor('comp-ratio')
      )
    },
    {
      deductionTree: deduce(
        deduce(
          cont(oddilT, 9, entityPlast),
          cont(oddilS, 11, entityPlast),
          sum(`oddíl S a T`, [], entityPlast, entityPlast)
        ),
        cont(oddilR, 15, entityPlast),
        ctor('comp-ratio')
      )
    },
    {
      deductionTree: deduce(
        deduce(
          cont(oddilR, 3, entityKovy),
          cont(oddilS, 3, entityKovy),
          cont(oddilT, 4, entityKovy),
          sum(`kovy všechny oddíly`, [], entityVaha, entityPlast)
        ),
        deduce(
          cont(oddilR, 6, entityPapir),
          cont(oddilS, 8, entityPapir),
          cont(oddilT, 1, entityPapir),
          sum(`plast všechny oddíly`, [], entityVaha, entityPlast)
        ),
        ctor('comp-ratio')
      )
    },

  ]
}

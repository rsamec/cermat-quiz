import { commonSense, compDiff, cont, ctorOption, primeFactorization, sum } from "../../components/math";
import { axiomInput, deduce, deduceLbl, to } from "../../utils/deduce-utils";


interface InputParameters {
  pocetCasti
}
export function caryNaPapire({ input }: { input: InputParameters }) {

  const entity = "část";
  const usekLabel = "počet pásem";
  const separatorLabel = "počet čar"
  const pocetCasti = axiomInput(cont("počet částí", input.pocetCasti, entity), 1);
  const emptyEntity = ""


  const diff = compDiff(usekLabel, separatorLabel, 1, emptyEntity);


  const dvojice = to(
    pocetCasti,
    commonSense(`rozklad na prvočísla:${primeFactorization([input.pocetCasti]).join(",")}`),
    commonSense(`seskup je do dvojic (2x20), (4x10), (8x5)`),
    commonSense(`najdi dvojici, která má nejmenší součet = (8x5)`),
    cont(usekLabel, 8, emptyEntity)
  )

  const deductionTree = deduce(
    deduce(
      deduce(dvojice, diff),
      deduce({ ...cont(usekLabel, 5, emptyEntity), ...deduceLbl(1) }, diff),
      sum(`součet čar`)
    ),
    ctorOption("A", 11)
  )



  return { deductionTree }
}

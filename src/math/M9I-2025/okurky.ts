import { comp, cont, ctorLinearEquation, ratio } from "../../components/math";
import { axiomInput, deduce, last } from "../../utils/deduce-utils";

interface InputParameters {
  salatyNavic: number,  
}
export function okurkyASalaty({ input }: { input: InputParameters }) {
  const entity = "sazenice";
  const okurkaLabel = "zasazeno okurek"
  const salatLabel = "zasazeno salátů"

  const ujaloOkurekLabel = "ujalo okurek";
  const ujaloSalatLabel = "ujalo salátů";
  const variableName = "okurky"

  const salatyAndOkurkyCompare = axiomInput(comp(salatLabel, okurkaLabel, input.salatyNavic, entity), 1)
  const ujaloSalataRatio = axiomInput(ratio(salatLabel, ujaloSalatLabel, 3 / 4), 2)
  const ujaloOkurekRatio = axiomInput(ratio(okurkaLabel, ujaloOkurekLabel, 5 / 6), 3)

  const okurka = axiomInput(cont(okurkaLabel, variableName, entity), 1);
  const sazenicSalatu = deduce(
    okurka,
    salatyAndOkurkyCompare
  )
  const ujaloSalatu = deduce(
    sazenicSalatu,
    ujaloSalataRatio
  )
  const ujaloOkurek = deduce(
    okurka,
    ujaloOkurekRatio
  )

  const sazenicOkurek = deduce(ujaloSalatu, ujaloOkurek, ctorLinearEquation(okurkaLabel,{ entity}, variableName));

  return [
    { deductionTree: deduce(sazenicOkurek, salatyAndOkurkyCompare), template: () => '' },
    { deductionTree: deduce(last(sazenicOkurek), ujaloOkurekRatio), template: () => '' }]
}
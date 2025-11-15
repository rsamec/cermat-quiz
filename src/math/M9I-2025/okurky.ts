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

  const okurka = cont(okurkaLabel, variableName, entity);
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
  const mark = ' ';
  
  return [
    { deductionTree: deduce(sazenicOkurek, salatyAndOkurkyCompare), template: highlight => highlight`Zahradník sázel na záhon sazenice. Sazenice salátů zasadil o ${mark} 4 více než sazenic okurek.
Na záhoně ${mark} čtvrtinu sazenic salátů zlikvidovali slimáci a ${mark} šestina sazenic okurek uschla.\ Všechny ostatní sazenice se ujaly. Na záhoně se tak ujal stejný počet sazenic salátů a okurek.
Kolik sazenic salátů zahradník zasadil?` },
    { deductionTree: deduce(last(sazenicOkurek), ujaloOkurekRatio), template: highlight => '' }]
}
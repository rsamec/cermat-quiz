import { comp, compRatio, cont, ratio } from "../../components/math.js";
import { axiomInput, deduce, last } from "../../utils/deduce-utils.js";


interface InputParameters {
  okurky: number
}
export function okurkyASalaty({ input }: { input: InputParameters }) {
  const entity = "sazenic";
  const okurkaLabel = "zasazeno okurek"
  const salatLabel = "zasazeno salátů"

  const ujaloOkurekLabel = "ujalo okurek";
  const ujaloSalatLabel = "ujalo salátů";

  const okurka = axiomInput(cont(okurkaLabel, input.okurky, entity), 1);


  const salat = deduce(
    okurka,
    comp(salatLabel, okurkaLabel, 4, entity)
  )

  const dd1 = deduce(
    salat,
    ratio(salatLabel, ujaloSalatLabel, 3 / 4)
  )

  const dd2 = deduce(
    okurka,
    ratio(okurkaLabel, ujaloOkurekLabel, 5 / 6)
  )

  return [{ deductionTree: deduce(dd1,dd2) }, { deductionTree: dd2 }]
}

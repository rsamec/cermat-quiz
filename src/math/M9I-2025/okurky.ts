import { comp, cont, ratio } from "../../components/math.js";
import { axiomInput, deduce, last } from "../../utils/deduce-utils.js";


interface InputParameters {
  okurky: number
}
export function okurkyASalaty({ input }: { input: InputParameters }) {
  const entity = "sazenice";
  const okurkaLabel = "zasazeno okurek"
  const salatLabel = "zasazeno salátů"

  const ujaloOkurekLabel = "ujalo okurek";
  const ujaloSalatLabel = "ujalo salátů";

  const zeleninaFactory = (okurka) => {
    const sazenicSalatu = deduce(
      okurka,
      comp(salatLabel, okurkaLabel, 4, entity)
    )

    const ujaloSalatu = deduce(
      sazenicSalatu,
      ratio(salatLabel, ujaloSalatLabel, 3 / 4)
    )

    const ujaloOkurek = deduce(
      okurka,
      ratio(okurkaLabel, ujaloOkurekLabel, 5 / 6)
    )
    return { sazenicSalatu, ujaloSalatu, ujaloOkurek }
  }

  const { ujaloSalatu, ujaloOkurek } = zeleninaFactory(cont(okurkaLabel, "okurky", entity), 1);

  const equationTree = deduce(ujaloSalatu, ujaloOkurek);

  const { sazenicSalatu, ujaloOkurek: ujaloOkurek2 } = zeleninaFactory(axiomInput(cont(okurkaLabel, input.okurky, entity), 1));

  return [
    { deductionTree: deduce(ujaloSalatu, ujaloOkurek), template: () => '' },
    { deductionTree: sazenicSalatu, template: () => '' },
    { deductionTree: ujaloOkurek2, template: () => '' }]
}

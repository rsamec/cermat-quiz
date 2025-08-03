import { commonSense, comp, compRatio, compRelative, cont, ctorOption, counter, product } from "../../components/math";
import { axiomInput, deduce, to } from "../../utils/deduce-utils";

export default function example({ input }: {
  input: {
    rozdilObvod: number,
    obdelnikCtvAStrana: number
    obdelnikCtvBStrana: number
  }
}) {

  const ALabel = "strana obdelník A"
  const BLabel = "strana obdelník B"
  const entity = "cm"
  const bocniStrana = commonSense("boční strany obou čtverců jsou schodné, horní a spodní strana obdelníku mají rozdíl 3")

  const rozdilObvod = axiomInput(cont("obvod rozdíl", 6, entity), 1)
  const diffAbsolute = comp(ALabel, BLabel, input.rozdilObvod / 2, entity)
  const compRel = axiomInput(compRelative(ALabel, BLabel, 3 / 2), 2);

  const kratsiStran = deduce(
    to(rozdilObvod, bocniStrana, diffAbsolute),
    compRel
  );

  const delsiStrana = deduce(
    deduce(
      kratsiStran,
      compRel
    ),
    compRatio('delší strana obdelník A', ALabel, 2),
  )

  const deductionTree = deduce(
    deduce(
      delsiStrana,
      counter("počet stran čtverce", 4),
      product("obvod čtverce")
    ),
    ctorOption("A", 40)
  )

  return { deductionTree }

}
import { commonSense, compDiff, compRatio, cont, ctor, ratio } from "../../components/math.js";
import { axiomInput, deduce, to } from "../../utils/deduce-utils.js";

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
  const stranaLabel = "rozdíl horní strana"

  const stranyLabel = "horní a spodní strana"
  const bocniStrana = commonSense("boční strany obou čtverců jsou schodné")

  const stranaRatio = ratio({ agent: "rozdíl horní a spodní strana", entity }, { agent: stranaLabel, entity }, 1 / 2);
  const rozdilObvod = axiomInput(cont("rozdíl obvod", input.rozdilObvod, entity), 1)
  const rozdilStran = cont("rozdíl horní a spodní strana", input.rozdilObvod, entity)


  const deductionTree =
    deduce(

      deduce(
        to(rozdilObvod, bocniStrana, rozdilStran),
        stranaRatio
      ),
      ratio({ agent: ALabel, entity }, { agent: stranaLabel, entity }, (input.obdelnikCtvAStrana - input.obdelnikCtvBStrana))
      // deduce(
      //   cont(ALabel, input.obdelnikCtvAStrana, entity),
      //   cont(BLabel, input.obdelnikCtvBStrana, entity),
      // )

    )

  return { deductionTree }

}
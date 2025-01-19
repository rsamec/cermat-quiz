import { commonSense, compRatio, cont, product, ratios, sum } from "../../components/math.js";
import { axiomInput, deduce, last, to } from "../../utils/deduce-utils.js";

export default function example({ input }: {
  input: {
    obvod: number,
  }
}) {

  const ramenoLabel = "rameno"
  const zakladnaLabel = "základna"
  const obvodLabel = "obvod trojúhelníku";
  const entity = "cm"
  const obvod = axiomInput(cont(obvodLabel, 30, entity), 1)

  const ramenoCount = axiomInput(cont("počet ramen", 4, ""), 2)
  const zakladnaCount = axiomInput(cont("počet základen", 3, ""), 3)

  const rameno = deduce(
    to(
      commonSense("rameno trojúhelníku je půleno vrcholem jiného trojúhelníku"),
      ratios({ agent: obvodLabel, entity }, [{ agent: zakladnaLabel, entity }, { agent: ramenoLabel, entity }, { agent: ramenoLabel, entity }], [1, 2, 2])
    ),
    obvod
  );
  const zakladna = deduce(
    last(rameno),
    compRatio(ramenoLabel, zakladnaLabel, 2)
  )

  const deductionTree = deduce(
    deduce(
      rameno,
      ramenoCount,
      product("obvod obrazce (ramena)", ["délka ramena", "počet stran"], entity, entity)
    ),
    deduce(
      zakladna, zakladnaCount, product("obvod obrazce (zakladny)", ["délka základny", "počet stran"], entity, entity)),
    sum("obvod obrazce", [], entity, entity)
  )


  return { deductionTree }

}
import { commonSense, compRatio, cont, ctorOption, ratios, sum, product, repeat } from "../../components/math";
import { axiomInput, deduce, last, to } from "../../utils/deduce-utils";

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

  const ramenoCount = axiomInput(repeat("počet ramen", 4,), 2)
  const zakladnaCount = axiomInput(repeat("počet základen", 3), 3)

  const rameno = deduce(
    to(
      commonSense("rameno trojúhelníku je půleno vrcholem jiného trojúhelníku"),
      ratios(obvodLabel, [zakladnaLabel, ramenoLabel, ramenoLabel], [1, 2, 2])
    ),
    obvod
  );
  const zakladna = deduce(
    last(rameno),
    compRatio(ramenoLabel, zakladnaLabel, 2)
  )

  const deductionTree = deduce(
    deduce(
      deduce(
        rameno,
        ramenoCount,
        product("obvod obrazce (ramena)", ["délka ramena", "počet stran"])
      ),
      deduce(
        zakladna, zakladnaCount, 
        product("obvod obrazce (zakladny)", ["délka základny", "počet stran"])),
      sum("obvod obrazce")
    ),
    ctorOption("C", 66)
  )


  return { deductionTree }

}
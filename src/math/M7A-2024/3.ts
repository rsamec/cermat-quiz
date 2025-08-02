import { cont, ctor, sum } from "../../components/math";
import { axiomInput, deduce, last, lastQuantity, to } from "../../utils/deduce-utils";
import { cislaNaOse } from "../cislaNaOse";

export function triCislaNaOse({ input }: { input: { mensiCislo: number, vetsiCislo: number, pocetUsekuMeziCisly: number, A: number, B: number, C: number } }) {
  const entityLength = "délka";

  const entity = "úsek"

  const mensi = axiomInput(cont('menší zadané číslo', input.mensiCislo, entityLength,), 1)
  const vetsi = axiomInput(cont('větší zadnané číslo', input.vetsiCislo, entityLength,), 2)
  const pocetUseku = axiomInput(cont('vzdálenost mezi zadanými čísly', input.pocetUsekuMeziCisly, "úsek",), 3)

  const positionA = axiomInput(cont('posun A', input.A, entity), 1)
  const positionB = axiomInput(cont('posun B', input.B, entity), 1)
  const positionC = axiomInput(cont('posun C', input.C, entity), 1)

  const usekRate = cislaNaOse({ mensi, vetsi, pocetUseku })

  const rozdilPostion = deduce(positionB, positionA, ctor('comp-diff'));
  const dd1 = deduce(deduce(positionC, usekRate), mensi, sum("pozice C"));
  const dd2 = deduce(deduce(deduce(positionB, last(usekRate)), mensi, sum("pozice B")), mensi, ctor('comp-ratio'));
  const dd3 = deduce(to(rozdilPostion, cont('rozdíl', lastQuantity(rozdilPostion), entity)), last(usekRate))

  return { "C": { deductionTree: dd1 }, "B": { deductionTree: dd2 }, "rozdil": { deductionTree: dd3 } }
}
import { cont, counter, ctor, ctorDifference, ctorSlide } from "../../components/math";
import { axiomInput, deduce, last, toCont } from "../../utils/deduce-utils";
import { cislaNaOse } from "../cislaNaOse";

export function triCislaNaOse({ input }: { input: { mensiCislo: number, vetsiCislo: number, pocetUsekuMeziCisly: number, A: number, B: number, C: number } }) {
  const entity = "úsek"

  const mensi = axiomInput(counter('menší zadané číslo', input.mensiCislo), 1)
  const vetsi = axiomInput(counter('větší zadnané číslo', input.vetsiCislo), 2)
  const pocetUseku = axiomInput(cont('vzdálenost mezi zadanými čísly', input.pocetUsekuMeziCisly, "úsek",), 3)

  const positionA = axiomInput(cont('posun A', input.A, entity), 1)
  const positionB = axiomInput(cont('posun B', input.B, entity), 1)
  const positionC = axiomInput(cont('posun C', input.C, entity), 1)

  const usekRate = cislaNaOse({ mensi, vetsi, pocetUseku })

  const rozdilPosition = deduce(positionB, positionA, ctorDifference('rozdíl'));
  const dd1 = deduce(deduce(positionC, usekRate), mensi, ctorSlide("pozice C"));
  const dd2 = deduce(deduce(deduce(positionB, last(usekRate)), mensi, ctorSlide("pozice B")), mensi, ctor('comp-ratio'));
  const dd3 = deduce(rozdilPosition, last(usekRate))

  return { "C": { deductionTree: dd1 }, "B": { deductionTree: dd2 }, "rozdil": { deductionTree: dd3 } }
}
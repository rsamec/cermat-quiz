import { comp, compDiff, cont, ctor, rate, sum } from "../../components/math.js";
import { axiomInput, deduce, last, to } from "../../utils/deduce-utils.js";

export function cislaNaOse({ input }: { input: { mensiCislo: number, vetsiCislo: number, pocetUsekuMeziCisly: number, A: number, B: number, C: number } }) {
  const entityLength = "délka";
  
  const entity = "úsek"

  const mensi = axiomInput(cont('menší zadané číslo', input.mensiCislo, entityLength,), 1)
  const vetsi = axiomInput(cont('větší zadnané číslo', input.vetsiCislo, entityLength,), 2)
  const pocetUseku = axiomInput(cont('vzdálenost mezi zadanými čísly', input.pocetUsekuMeziCisly, "úsek",), 3)

  const positionA = axiomInput(cont('posun A', input.A, entity), 1)
  const positionB = axiomInput(cont('posun B', input.B, entity), 1)
  const positionC = axiomInput(cont('posun C', input.C, entity), 1)

  const rozdil = deduce(
    vetsi, mensi
  );
  const usekRate = deduce(
    to(
      rozdil,
      cont('vzdálenost mezi zadanými čísly', last(rozdil).quantity, entityLength)
    ),
    pocetUseku,
    ctor("rate")
  );

  const rozdilPostion = deduce(positionB, positionA, ctor('comp-diff'));
  const dd1 = deduce(deduce(positionC, usekRate), mensi, sum("pozice C",[],entityLength, entityLength));
  const dd2 = deduce(deduce(deduce(positionB, last(usekRate)), mensi, sum("pozice B", [], entityLength, entityLength)), mensi, ctor('comp-ratio'));
  const dd3 = deduce(to(rozdilPostion, cont('rozdíl', last(rozdilPostion).quantity, entity)),last(usekRate))

  return [{ deductionTree: dd1 }, { deductionTree: dd2 }, { deductionTree: dd3 }]
}
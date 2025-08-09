import { sum, comp, cont, ctor } from "../../components/math";
import { axiomInput, deduce, toCont } from "../../utils/deduce-utils";

export function porovnatAaB({ input }: { input: { a: number, b: number } }) {
  const entity = ""
  const a = axiomInput(cont('a', input.a, entity,), 1)
  const b = axiomInput(cont('b', input.b, entity,), 2)

  const rozdil = deduce(
    a, b,
    ctor('comp-diff')
  );
  return {
    deductionTree: deduce(
      deduce(
        a, b,
        sum("součet")
      ),
      toCont(
        rozdil,
        { agent: "rozdíl" }
      ),
      ctor('comp-ratio')
    ),
    convertToTestedValue: (value) => 1 / value.ratio
  }
}

export function najitMensiCislo({ input }: { input: { zadane: number, mensiO: number } }) {
  const entity = ""
  const a = axiomInput(cont('zadané číslo', input.zadane, entity,), 1)
  const comparsion = axiomInput(comp('hledané číslo', 'zadané číslo', -input.mensiO, entity,), 2)


  return {
    deductionTree: deduce(
      a, comparsion
    )
  }
}
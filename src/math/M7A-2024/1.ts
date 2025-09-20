import { sum, comp, cont, ctor, ctorDifference } from "../../components/math";
import { axiomInput, deduce } from "../../utils/deduce-utils";

export function porovnatAaB({ input }: { input: { a: number, b: number } }) {
  const entity = ""
  const a = axiomInput(cont('a', input.a, entity,), 1)
  const b = axiomInput(cont('b', input.b, entity,), 2)

  return {
    deductionTree: deduce(
      deduce(
        a, b,
        sum("součet")
      ),
      deduce(
        a, b,
        ctorDifference('rozdíl')
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
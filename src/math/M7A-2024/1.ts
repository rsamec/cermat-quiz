import { comp, compDiff, cont, ctor, sum } from "../../components/math.js";
import { axiomInput, deduce, last, to } from "../../utils/deduce-utils.js";

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
        sum("součet", ["a", "b"], entity, entity)
      ),
      to(
        rozdil,
        cont("rozdíl", last(rozdil).quantity, entity)
      ),
      ctor('comp-ratio')
    )
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
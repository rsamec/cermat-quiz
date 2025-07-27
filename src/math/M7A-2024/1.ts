import { comp, cont, ctor, ctorSlide } from "../../components/math";
import { axiomInput, deduce, lastQuantity, to } from "../../utils/deduce-utils";

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
        ctorSlide("součet")
      ),
      to(
        rozdil,
        cont("rozdíl", lastQuantity(rozdil), entity)
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
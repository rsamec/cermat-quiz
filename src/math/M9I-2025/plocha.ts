import { cont, ctorUnit } from "../../components/math";
import { axiomInput, deduce } from "../../utils/deduce-utils";

export function porovnani2Ploch({ }: { input: {} }) {
  const entity = "";
  const unit = "cm2"
  return {
    deductionTree: deduce(
      deduce(
        axiomInput(cont("1. plocha", 0.2, entity, "m2"), 1),
        ctorUnit(unit)
      ),
      axiomInput(cont("2. plocha", 20, entity, unit), 2)
    )
  }
}
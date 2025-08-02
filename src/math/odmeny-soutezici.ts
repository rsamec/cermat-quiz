import { cont, ratio, compRatio, ctorComplement, ctor, accumulate } from "../components/math";
import { axiomInput, deduce, last, deduceLbl } from "../utils/deduce-utils";

export const odmenySoutezici = () => {
  const souteziciLabel = "soutěžící"
  const odmenaLabel = "odměna"
  const entity = 'Kč'
  const druhy = axiomInput(cont(`2.${souteziciLabel}`, 300, entity), 3);
  const prvni = axiomInput(ratio(odmenaLabel, `1.${souteziciLabel}`, 1 / 2), 1);
  const treti = deduce(
    prvni,
    axiomInput(compRatio(`1.${souteziciLabel}`, `3.${souteziciLabel}`, 3), 3)
  )


  const druhyRelative = deduce(
    deduce(
      prvni,
      treti,
      accumulate(`1. a 3. ${souteziciLabel}`)
    ),
    ctorComplement(`2.${souteziciLabel}`)
  )

  return [
    {
      deductionTree: deduce(
        druhyRelative,
        { ...last(treti), ...deduceLbl(1) },
        ctor('comp-ratio')
      )
    },
    {
      deductionTree:
        deduce(
          { ...last(druhyRelative), ...deduceLbl(3) },
          druhy
        )
    },
  ]
}
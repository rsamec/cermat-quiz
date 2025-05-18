import { compDiff, cont, ctor } from "../../components/math.js";
import { axiomInput, deduce, deduceLbl, last, lastQuantity, to } from "../../utils/deduce-utils.js";


interface InputParameters {
  pocetKusuVKrabice: number,
  missingVyrobku: number,
}
export function plnaKrabice({ input }: { input: InputParameters }) {
  const krabiceLabel = "krabice";
  const triKrabiceABezPetiLabel = "3 krabice bez chybějící výrobků";
  const missingVyrobkyLabel = "chybějící výrobky";
  const plnaKrabiceLabel = "plná krabice";
  const plnaKrabiceVyrobkyLabel = "všechny výrobky v plné krabici";
  const vyrobekEntity = "kus";
  const entity = "gram";

  const plnaKrabicePocet = axiomInput(cont(plnaKrabiceLabel, input.pocetKusuVKrabice, vyrobekEntity), 1);
  const plnaKrabiceVyrobkuPocet = axiomInput(cont(plnaKrabiceVyrobkyLabel, input.pocetKusuVKrabice, vyrobekEntity), 1);
  const missingVyrobkyPocet = axiomInput(cont(missingVyrobkyLabel, input.missingVyrobku, vyrobekEntity), 2);

  const triKrabice = axiomInput(cont(triKrabiceABezPetiLabel, 2000, entity), 3);
  const rozdil = axiomInput(compDiff(triKrabiceABezPetiLabel, `2 ${plnaKrabiceLabel}`, 480, entity), 4)

  const deductionTree1 = deduce(
    deduce(triKrabice, rozdil),
    cont(`2 ${plnaKrabiceLabel}`, 2, vyrobekEntity),
    ctor("rate")
  );

  const rozdilGram = deduce(
    deduce(
      { ...last(deductionTree1), ...deduceLbl(2) },
      cont(`3 ${plnaKrabiceLabel}`, 3, vyrobekEntity),
    ),
    triKrabice);

  const deductionTree2 = deduce(
    to(
      rozdilGram,
      cont(missingVyrobkyLabel, lastQuantity(rozdilGram), entity)
    ),
    missingVyrobkyPocet,
    ctor("rate")
  );

  const deductionTree3 = deduce(
    to(
      { ...last(deductionTree1), ...deduceLbl(2) },
      cont(plnaKrabiceLabel, lastQuantity(deductionTree1), entity)),
    deduce(
      { ...last(deductionTree2), ...deduceLbl(4) },
      plnaKrabiceVyrobkuPocet),

  )



  return [
    { deductionTree: deductionTree1 },
    { deductionTree: deductionTree2 },
    { deductionTree: deductionTree3 },
  ]
}

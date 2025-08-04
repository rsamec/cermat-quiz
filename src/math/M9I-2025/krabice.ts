import { compDiff, cont, ctor } from "../../components/math";
import { axiomInput, deduce, last, toCont } from "../../utils/deduce-utils";


interface InputParameters {
  pocetKusuVKrabice: number,
  missingVyrobku: number,
}
export function plnaKrabice({ input }: { input: InputParameters }) {  
  const triKrabiceABezPetiLabel = "3 krabice bez chybějící výrobků";
  const missingVyrobkyLabel = "chybějící výrobky";
  const plnaKrabiceLabel = "plná krabice";
  const plnaKrabiceVyrobkyLabel = "všechny výrobky v plné krabici";
  const vyrobekEntity = "kus";
  const entity = "gram";

  
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
      last(deductionTree1),
      cont(`3 ${plnaKrabiceLabel}`, 3, vyrobekEntity),
    ),
    triKrabice);

  const deductionTree2 = deduce(
    toCont(
      rozdilGram,
      { agent: missingVyrobkyLabel }
    ),
    missingVyrobkyPocet,
    ctor("rate")
  );

  const deductionTree3 = deduce(
    toCont(
      deductionTree1,
      { agent: plnaKrabiceLabel }),
    deduce(
      last(deductionTree2),
      plnaKrabiceVyrobkuPocet),

  )



  return [
    { deductionTree: deductionTree1 },
    { deductionTree: deductionTree2 },
    { deductionTree: deductionTree3 },
  ]
}

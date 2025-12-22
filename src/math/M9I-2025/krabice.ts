import { compDiff, cont, ctorDifference, ctorRate } from "../../components/math";
import { axiomInput, deduce, last } from "../../utils/deduce-utils";


interface InputParameters {
  pocetKusuVKrabice: number,
  missingVyrobku: number,
}
export function plnaKrabice({ input }: { input: InputParameters }) {
  const triKrabiceABezPetiLabel = "plné krabice a jedna krabice bez chybějící výrobků";
  const missingVyrobkyLabel = "chybějící výrobky";
  const plnaKrabiceLabel = "plná krabice";
  const vyrobekAgent = "výrobek"
  const vyrobekEntity = "kus";
  const entity = "gram";


  const plnaKrabiceVyrobkuPocet = axiomInput(cont(plnaKrabiceLabel, input.pocetKusuVKrabice, vyrobekEntity), 1);
  const missingVyrobkyPocet = axiomInput(cont(missingVyrobkyLabel, input.missingVyrobku, vyrobekEntity), 2);

  const triKrabice = axiomInput(cont(triKrabiceABezPetiLabel, 2000, entity), 3);
  const rozdil = axiomInput(compDiff(triKrabiceABezPetiLabel, plnaKrabiceLabel, 480, entity), 4)

  const krabiceRate = deduce(
    deduce(triKrabice, rozdil),
    cont(plnaKrabiceLabel, 2, vyrobekEntity),
    ctorRate(plnaKrabiceLabel)
  );

  const missingVyrobkyVaha = deduce(
    deduce(
      last(krabiceRate),
      cont(plnaKrabiceLabel, 3, vyrobekEntity),
    ),
    triKrabice,
    ctorDifference(missingVyrobkyLabel)
  );

  const vyrobekRate = deduce(
    missingVyrobkyVaha,
    missingVyrobkyPocet,
    ctorRate(vyrobekAgent)
  );

  const prazdnaKrabice = deduce(
    deduce(
      last(krabiceRate),
      cont(plnaKrabiceLabel, 1, vyrobekEntity)
    ),
    deduce(
      last(vyrobekRate),
      plnaKrabiceVyrobkuPocet)
  )



  return [
    { deductionTree: krabiceRate },
    { deductionTree: vyrobekRate },
    { deductionTree: prazdnaKrabice },
  ]
}

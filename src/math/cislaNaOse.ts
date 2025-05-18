import { cont, Container, ctor } from "../components/math";
import { deduce, to, last, lastQuantity } from "../utils/deduce-utils";


export function cislaNaOse({ mensi, vetsi, pocetUseku }: { mensi: Container, vetsi: Container, pocetUseku: Container }) {
  const entityLength = "délka";

  const entity = "úsek"

  const rozdil = deduce(
    vetsi, mensi
  );
  const usekRate = deduce(
    to(
      rozdil,
      cont('vzdálenost mezi zadanými čísly', lastQuantity(rozdil), entityLength)
    ),
    pocetUseku,
    ctor("rate")
  );

  return usekRate;
}


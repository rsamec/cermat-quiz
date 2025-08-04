import { ctor } from "../components/math";
import type { Container } from "../components/math"
import { deduce, toCont } from "../utils/deduce-utils";


export function cislaNaOse({ mensi, vetsi, pocetUseku }: { mensi: Container, vetsi: Container, pocetUseku: Container }) {
  const entityLength = "délka";

  const entity = "úsek"

  const rozdil = deduce(
    vetsi, mensi
  );
  const usekRate = deduce(
    toCont(
      rozdil,
      { agent: 'vzdálenost mezi zadanými čísly', entity: { entity: entityLength } }
    ),
    pocetUseku,
    ctor("rate")
  );

  return usekRate;
}


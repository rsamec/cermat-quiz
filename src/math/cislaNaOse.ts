import { ctor, EmptyUnit } from "../components/math";
import type { Container } from "../components/math"
import { deduce, toCont } from "../utils/deduce-utils";


export function cislaNaOse({ mensi, vetsi, pocetUseku }: { mensi: Container, vetsi: Container, pocetUseku: Container }) {

  const rozdil = deduce(
    vetsi, mensi
  );
  const usekRate = deduce(
    toCont(
      rozdil,
      { agent: 'vzdálenost mezi zadanými čísly', entity: { entity: EmptyUnit } }
    ),
    pocetUseku,
    ctor("rate")
  );

  return usekRate;
}


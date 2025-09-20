import { ctor, ctorDifference } from "../components/math";
import type { Container } from "../components/math"
import { deduce } from "../utils/deduce-utils";


export function cislaNaOse({ mensi, vetsi, pocetUseku }: { mensi: Container, vetsi: Container, pocetUseku: Container }) {

  const usekRate = deduce(
    deduce(
      vetsi,
      mensi,
      ctorDifference("vzdálenost mezi zadanými čísly")
    ),
    pocetUseku,
    ctor("rate")
  );

  return usekRate;
}


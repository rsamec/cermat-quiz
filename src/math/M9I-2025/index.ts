import { createLazyMap } from "../../utils/deduce-utils";
import { desetiuhelnik } from "./angle";
import { domecek } from "./domecek";
import { plnaKrabice } from "./krabice";
import { kytice } from "./kytice";
import { letajiciCtverecky } from "./letajiciCtverecky";
import { objemNadoby1, objemNadoby2, objemNadoby3 } from "./nadoba";
import { okurkyASalaty } from "./okurky";
import { caryNaPapire } from "./papirACary";
import { porovnani2Ploch } from "./plocha";

const krabiceParams = { pocetKusuVKrabice: 12, missingVyrobku: 5 }

export default createLazyMap({
  1: () => porovnani2Ploch({ input: {} }),
  6.1: () => okurkyASalaty({ input: { salatyNavic: 4 } })[0],
  6.2: () => okurkyASalaty({ input: { salatyNavic: 4 } })[1],
  7.1: () => plnaKrabice({ input: krabiceParams })[0],
  7.2: () => plnaKrabice({ input: krabiceParams })[1],
  7.3: () => plnaKrabice({ input: krabiceParams })[2],
  11.1: () => desetiuhelnik({ input: { pocetUhlu: 10 } })[0],
  11.2: () => desetiuhelnik({ input: { pocetUhlu: 10 } })[1],
  11.3: () => desetiuhelnik({ input: { pocetUhlu: 10 } })[2],
  12: () => kytice({ input: { cenaZaKus: { ruze: 54, chryzantema: 40, statice: 35 } } }),
  13: () => caryNaPapire({ input: { pocetCasti: 40 } }),
  14: () => domecek(),
  15.1: () => objemNadoby1({ input: { zbyva: 14, zaplnenoPomer: 3 / 5 } }),
  15.2: () => objemNadoby2({ input: { zaplnenoProcento: 55, odebrano: 12, zaplnenoPoOdebraniRatio: 1 / 4 } }),
  15.3: () => objemNadoby3({ input: { nadoba1Procent: 30, nadoba2Procent: 40, nadoba3: 19, prumerNadobaRatio: 2 / 5 } }),
  16.1: () => letajiciCtverecky({ input: { pocetRad: 21, pocetSloupcu: 110 } })[0],
  16.2: () => letajiciCtverecky({ input: { pocetRad: 21, pocetSloupcu: 110 } })[1]
})
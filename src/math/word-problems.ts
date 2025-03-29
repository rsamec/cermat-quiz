import cetar from './M7A-2023/cetar.js';
import zakusek from './M7A-2023/zakusek.js';
import pocetSportovcu from './M7A-2024/pocet-sportovcu.js';
import letniTabor from './M7A-2024/letni-tabor.js';
import kraliciASlepice from './M7A-2024/kralice-a-slepice-v-ohrade.js';

import svadleny from './M9A-2024/svadleny.js';
import tridaSkupiny from './M9A-2024/trida-skupiny.js';
import dumMeritko from './M9A-2024/dum-meritko.js';
import { example1, example2, example3 } from './M9A-2024/kolo.js';
import tezitko from './M9A-2024/tezitko.js';
import tanga from './M9A-2024/tanga.js';
import dvaCtverce from './M9A-2024/dva-ctverce.js';
import obrazec from './M9A-2024/obrazec.js';


import { plnaKrabice } from './M9I-2025/krabice.js';
import { kytice } from './M9I-2025/kytice.js';
import { caryNaPapire } from './M9I-2025/papirACary.js'
import { letajiciCtverecky } from './M9I-2025/letajiciCtverecky.js';
import { domecek } from './M9I-2025/domecek.js';
import { objemNadoby1, objemNadoby2, objemNadoby3 } from './M9I-2025/nadoba.js';
import { porovnani2Ploch } from './M9I-2025/plocha.js';
import { porovnatObsahObdelnikACtverec } from './M7A-2024/13.js';
import { najitMensiCislo, porovnatAaB } from './M7A-2024/1.js';
import { triCislaNaOse } from './M7A-2024/3.js';
import { rozdilUhlu } from './M9A-2024/angle.js';
import { desetiuhelnik } from './M9I-2025/angle.js';
import { example_11, example_12, example_15_1, example_15_2, example_15_3, example_4_1, example_4_2 } from './M7A-2023/index.js';
import { angle, cestovni_kancelar, koupaliste, krouzky, pozemek } from './M7A-2024/index.js';
import { comparingValues } from './comparing-values.js';
import { desitiuhelnik, hledani_cisel, klubSEN, stavebnice } from './M5A-2023/index.js';
import { sesity } from './sesity.js';
import { compass } from './compass.js';
import { odmenySoutezici } from './odmeny-soutezici.js';
import { obrazce } from './obrazce.js';
import { trideni_odpadu } from './trideni-odpady.js';
import { appleBox, carTrip, distanceUnitCompareDiff, dveCislaNaOse, giftAndBox, lukasAccount, novorocniPrani, pyramida, sestiuhelnik, souctovyTrojuhelnik, timeUnitSum, vyvojObyvatel } from './M5A-2024/index.js';


export { inferenceRuleWithQuestion } from '../math/math-configure.js'
export { formatPredicate } from '../utils/deduce-utils.js';
export { formatSequencePattern } from '../components/math.js';


const letniTaborInput = {
  input: {
    zdravotnik: 1,
    kucharPerZdravotnik: 4,
    vedouciPerKuchar: 2,
    instruktorPerVedouci: 2,
    ditePerInstruktor: 2
  }
}

const tridaSkupinyParams = {
  input: {
    chlapci: 14,
    anglictinaChlapci: 5,
    nemcinaDivky: 4
  }
}

const dumMeritkoParams = {
  input: {
    sirkaM: 10,
    planSirkaCM: 10,
    planDelkaDM: 2,
  }
}

const krabiceParams = { pocetKusuVKrabice: 12, missingVyrobku: 5 }
const osaParams = { mensiCislo: 1.4, vetsiCislo: 5.6, pocetUsekuMeziCisly: 6, A: 4, B: 7, C: -2 };
const cetarParams = {
  input: {
    kapitan: 1,
    porucik: 4,
    cetarPerPorucik: 3,
    vojinPerCetar: 10
  }
};

const dveCislaNaOseParams = {
  input: {
    mensiCislo: 44,
    vetsiCislo: 110,
    pocetUsekuMeziCisly: 6,
    X: -2,
    Y: 3,
  }
}
export default {
  "M5A-2023": {
    2.1: comparingValues({
      input: {
        first: {
          ratio: 1 / 4,
          value: 24
        },
        second: {
          ratio: 1 / 3,
          value: 12
        }
      }
    }),
    2.2: hledani_cisel({
      input: {
        value: 180
      }
    }),
    3.1: cetar(cetarParams)[0],
    3.2: cetar(cetarParams)[1],
    3.3: cetar(cetarParams)[2],
    4.1: sesity()[0],
    4.2: sesity()[1],
    4.3: compass(),
    5.1: klubSEN().jedenKrouzek,
    5.2: klubSEN().klub,
    6.1: odmenySoutezici()[0],
    6.2: odmenySoutezici()[1],
    8.1: desitiuhelnik().whiteTriangle,
    8.2: desitiuhelnik().grayRectangle,
    8.3: desitiuhelnik().grayTriangle,
    9: zakusek({
      input: {
        cena: 72
      }
    }),
    11: stavebnice().cube,
    12: stavebnice().minimalCube,
    13.1: trideni_odpadu().papirRtoS,
    13.2: trideni_odpadu().plast,
    13.3: trideni_odpadu().papirToKovy,
    14.1: obrazce()[0],
    14.2: obrazce()[1],
    14.3: obrazce()[2]
  },
  "M5A-2024": {
    3:souctovyTrojuhelnik(),
    4.1: giftAndBox(),
    4.2: lukasAccount(),
    4.3: appleBox(),
    5.1: timeUnitSum(),
    5.2: distanceUnitCompareDiff(),
    6.1: dveCislaNaOse(dveCislaNaOseParams).XandY,
    6.2: dveCislaNaOse(dveCislaNaOseParams).posun,
    9: novorocniPrani(),
    11: sestiuhelnik(),
    12.1: vyvojObyvatel().panov,
    12.2: vyvojObyvatel().lidov,
    12.3: vyvojObyvatel().damov,
    13.1: carTrip().pocatekCesty,
    13.2: carTrip().zeleznicniPrejezd,
    13.3: carTrip().konecCesty,
    14.1: pyramida().floor8,
    14.2: pyramida().floor7,
    14.3: pyramida().stairs,
  },
  "M7A-2023": {
    1: comparingValues({
      input: {
        first: {
          ratio: 3 / 4,
          value: 24
        },
        second: {
          ratio: 1 / 3,
          value: 12
        }
      }
    }),
    3.1: cetar(cetarParams)[0],
    3.2: cetar(cetarParams)[1],
    3.3: cetar(cetarParams)[2],
    4.1: example_4_1(),
    4.2: example_4_2(),
    5.1: sesity()[1],
    5.2: compass(),
    6.1: odmenySoutezici()[0],
    6.2: odmenySoutezici()[1],
    10.1: trideni_odpadu().papirStoR,
    10.2: trideni_odpadu().plast,
    10.3: trideni_odpadu().kovyToPapir,
    11: example_11(),
    12: example_12(),
    // 13: example_13(),
    14: zakusek({
      input: {
        cena: 72
      }
    }),
    15.1: example_15_1(),
    15.2: example_15_2(),
    15.3: example_15_3(),
    16.1: obrazce()[0],
    16.2: obrazce()[1],
    16.3: obrazce()[2]
  },
  "M7A-2024": {
    1.1: porovnatAaB({ input: { a: 1.6, b: -1.2 } }),
    1.2: najitMensiCislo({ input: { zadane: 7 / 8, mensiO: 0.093 } }),
    3.1: triCislaNaOse({ input: osaParams }).C,
    3.2: triCislaNaOse({ input: osaParams }).B,
    3.3: triCislaNaOse({ input: osaParams }).rozdil,
    5.1: krouzky()[0],
    5.2: krouzky()[1],
    6: pocetSportovcu({ input: {} }),
    10.1: letniTabor(letniTaborInput)[0],
    10.2: letniTabor(letniTaborInput)[1],
    10.3: letniTabor(letniTaborInput)[2],
    11: kraliciASlepice({
      input: {
        kralikuMene: 5,
        pocetHlav: 37
      }
    }),
    13: porovnatObsahObdelnikACtverec({
      input: {
        obdelnik: { a: 36, b: 12 },
        ctverec: { a: 6 }
      }
    }),
    14: angle(),
    15.1: koupaliste(),
    15.2: cestovni_kancelar(),
    15.3: pozemek(),
  },
  // "M9A-2023": {
  //   16.1: trojuhelnik({ input: {} })[0],
  //   16.2: trojuhelnik({ input: {} })[1],
  //   16.3: trojuhelnik({ input: {} })[2],
  // },
  // "M9B-2023": {
  //   16.1: ctvercovaSit({ input: {} })[0],
  //   16.2: ctvercovaSit({ input: {} })[1],
  //   16.3: ctvercovaSit({ input: {} })[2],
  // },
  "M9A-2024": {
    1: svadleny({ input: { currentWorker: 4, previousWorker: 5, previousHours: 24 } }),
    2: tezitko({
      input: {
        out: {
          radius: 10,
          height: 12,
        },
        in: {
          radius: 5,
          height: 8
        }
      }
    }),
    7.1: tridaSkupiny(tridaSkupinyParams)[0],
    7.2: tridaSkupiny(tridaSkupinyParams)[1],
    8.1: tanga({ input: { tangaWidth: 20 } })[0],
    8.2: tanga({ input: { tangaWidth: 20 } })[1],
    11: rozdilUhlu({ input: { delta: 107, beta: 23 } }),
    12: obrazec({ input: { obvod: 30 } }),
    13: dvaCtverce({ input: { rozdilObvod: 6, obdelnikCtvAStrana: 1 / 2, obdelnikCtvBStrana: 1 / 5 } }),
    15.1: dumMeritko(dumMeritkoParams)[0],
    15.2: dumMeritko(dumMeritkoParams)[1],
    15.3: dumMeritko(dumMeritkoParams)[2],
    16.1: example1({ input: { base: 20_000, percentage: 13.5 } }),
    16.2: example2({ input: { vlozeno: 1_000_000, urokPercentage: 2.5, danPercentage: 15 } }),
    16.3: example3({ input: { base: 20_000, percentageDown: 10, percentageNewUp: 10 } }),
  },
  // "M9C-2024": {
  //   1: pocetObyvatel({ input: { celkem: 86_200, jihlavaPlus: 16_000 } }),
  //   12: sourozenci({ input: { evaPodil: 40, michalPlus: 24, zbyvaNasporit: 72 } }),
  // },
  "M9I-2025": {
    1: porovnani2Ploch({ input: {} }),
    // 6.1: okurkyASalaty({ input: { okurky: 36 } })[0],
    // 6.2: okurkyASalaty({ input: { okurky: 36 } })[1],
    7.1: plnaKrabice({ input: krabiceParams })[0],
    7.2: plnaKrabice({ input: krabiceParams })[1],
    7.3: plnaKrabice({ input: krabiceParams })[2],
    11.1: desetiuhelnik({ input: { pocetUhlu: 10 } })[0],
    11.2: desetiuhelnik({ input: { pocetUhlu: 10 } })[1],
    11.3: desetiuhelnik({ input: { pocetUhlu: 10 } })[2],
    12: kytice({ input: { cenaZaKus: { ruze: 54, chryzantema: 40, statice: 35 } } }),
    13: caryNaPapire({ input: { pocetCasti: 40 } }),
    14: domecek({ input: { baseSurfaceArea: 16, quota: 4 } }),
    15.1: objemNadoby1({ input: { zbyva: 14, zaplnenoPomer: 3 / 5 } }),
    15.2: objemNadoby2({ input: { zaplnenoProcento: 55, odebrano: 12, zaplnenoPoOdebraniRatio: 1 / 4 } }),
    15.3: objemNadoby3({ input: { nadoba1Procent: 30, nadoba2Procent: 40, nadoba3: 19, prumerNadobaRatio: 2 / 5 } }),
    16.1: letajiciCtverecky({ input: { pocetRad: 21, pocetSloupcu: 110 } })[0],
    16.2: letajiciCtverecky({ input: { pocetRad: 21, pocetSloupcu: 110 } })[1]
  },

}
import cetar from './M7A-2023/cetar.js';
import zakusek from './M7A-2023/zakusek.js';
import pocetSportovcu from './M7A-2024/pocet-sportovcu.js';
import letniTabor from './M7A-2024/letni-tabor.js';
import kraliciASlepice from './M7A-2024/kralice-a-slepice-v-ohrade.js';

import svadleny from './M9A-2024/svadleny.js';
import tridaSkupiny from './M9A-2024/trida-skupiny.js';
import dumMeritko from './M9A-2024/dum-meritko.js';
import kolo from './M9A-2024/kolo.js';

import pocetObyvatel from './M9C-2024/pocet-obyvatel.js';
import sourozenci from './M9C-2024/sourozenci.js';

import trojuhelnik from './M9A-2023/trojuhelnik.js';
import ctvercovaSit from './M9B-2023/ctvercova-sit.js';

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
export default {
  "M7A-2023": {
    3.3: cetar({
      input: {
        kapitan: 1,
        porucik: 4,
        cetarPerPorucik: 3,
        vojinPerCetar: 10
      }
    }),
    14: zakusek({
      input: {
        cena: 72
      }
    })
  },
  "M7A-2024": {
    6: pocetSportovcu({ input: {} }),
    10.1: letniTabor(letniTaborInput)[0],
    10.2: letniTabor(letniTaborInput)[1],
    10.3: letniTabor(letniTaborInput)[2],
    11: kraliciASlepice({
      input: {
        kralikuMene: 5,
        pocetHlav: 37
      }
    })
  },
  "M9A-2023": {
    16.1: trojuhelnik({ input: {} })[0],
    16.2: trojuhelnik({ input: {} })[1],
    16.3: trojuhelnik({ input: {} })[2],
  },
  "M9B-2023": {
    16.1: ctvercovaSit({ input: {} })[0],
    16.2: ctvercovaSit({ input: {} })[1],
    16.3: ctvercovaSit({ input: {} })[2],
  },
  "M9A-2024": {
    1: svadleny({ input: { currentWorker: 4, previousWorker: 5, previousHours: 24 } }),
    7.1: tridaSkupiny(tridaSkupinyParams)[0],
    7.2: tridaSkupiny(tridaSkupinyParams)[1],
    15.1: dumMeritko(dumMeritkoParams)[0],
    15.2: dumMeritko(dumMeritkoParams)[1],
    15.3: dumMeritko(dumMeritkoParams)[2],
    16.3: kolo({ input: { base: 20_000, percentageDown: 10, percentageNewUp: 10 } }),
  },
  "M9C-2024": {
    1: pocetObyvatel({ input: { celkem: 86_200, jihlavaPlus: 16_000 } }),
    12: sourozenci({ input: { evaPodil: 40, michalPlus: 24, zbyvaNasporit: 72 } }),
  },
}
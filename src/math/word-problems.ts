import cetar from './M7A-2023/cetar';
import zakusek from './M7A-2023/zakusek';
import pocetSportovcu from './M7A-2024/pocet-sportovcu';
import letniTabor from './M7A-2024/letni-tabor';
import kraliciASlepice from './M7A-2024/kralice-a-slepice-v-ohrade';

const letniTaborInput = {
  input: {
    zdravotnik: 1,
    kucharPerZdravotnik: 4,
    vedouciPerKuchar: 2,
    instruktorPerVedouci: 2,
    ditePerInstruktor: 2
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
}
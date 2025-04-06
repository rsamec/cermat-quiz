import { compAngle, compPercent, cont, ctor, ctorUnit, nthPart, percent, ratios, sum } from "../../components/math.js";
import { axiomInput, deduce, last, to, toCont } from "../../utils/deduce-utils.js";
import { porovnatAaB, najitMensiCislo } from "./1.js";
import { porovnatObsahObdelnikACtverec } from "./13.js";
import { triCislaNaOse } from "./3.js";
import letniTabor from "./letni-tabor.js";
import pocetSportovcu from "./pocet-sportovcu.js";
import kraliciASlepice from "./kralice-a-slepice-v-ohrade.js"

const letniTaborInput = {
  input: {
    zdravotnik: 1,
    kucharPerZdravotnik: 4,
    vedouciPerKuchar: 2,
    instruktorPerVedouci: 2,
    ditePerInstruktor: 2
  }
}

const osaParams = { mensiCislo: 1.4, vetsiCislo: 5.6, pocetUsekuMeziCisly: 6, A: 4, B: 7, C: -2 };
export default {
  1.1: porovnatAaB({ input: { a: 1.6, b: -1.2 } }),
  1.2: najitMensiCislo({ input: { zadane: 7 / 8, mensiO: 0.093 } }),
  3.1: triCislaNaOse({ input: osaParams }).C,
  3.2: triCislaNaOse({ input: osaParams }).B,
  3.3: triCislaNaOse({ input: osaParams }).rozdil,
  5.1: krouzky().divkyAnglictina,
  5.2: krouzky().pocetZaku,
  6: pocetSportovcu({ input: {} }),
  10.1: letniTabor(letniTaborInput).pocetVedoucichAInstruktoru,
  10.2: letniTabor(letniTaborInput).porovnaniInstrukturuAKucharek,
  10.3: letniTabor(letniTaborInput).pocetDeti,
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
}
function koupaliste() {

  const entity = "návštěvníků"

  return {
    deductionTree: deduce(
      axiomInput(percent("koupaliště loni", "koupaliště letos", 80), 1),
      axiomInput(cont("koupaliště letos", 680, entity), 2)
    )
  }
}

function cestovni_kancelar() {
  const entity = "klientů"

  return {
    deductionTree: deduce(
      axiomInput(cont("červen", 330, entity), 1),
      axiomInput(compPercent("červen", "červenec", 100 - 40), 2),
    )
  }
}

function pozemek() {
  const skutecnost = "skutečnost"
  const mapa = "plán"
  const entity = ""

  return {
    deductionTree: deduce(
      deduce(
        axiomInput(ratios("pozemek měřítko", [mapa, skutecnost], [1, 3_000]), 1),
        axiomInput(cont(mapa, 15, entity, "cm"), 2),
        nthPart(skutecnost)
      ),
      ctorUnit("m")
    )
  }
}

function krouzky() {
  const entity = "děti";
  const entityPercent = "%";

  const basketabal = cont("basketbal", 16, entityPercent);
  const tanecni = cont("taneční", 15, entityPercent);
  const lezeckaStena = cont("lezecká stěna", 25, entityPercent);
  const bezKrouzku = cont("žádný kroužek", 6, entityPercent);

  const celek = cont("celek", 100, entityPercent);

  const florbalPocet = cont("florbal", 114, entity)

  const florbalDiff = deduce(
    celek,
    deduce(
      bezKrouzku,
      basketabal,
      tanecni,
      lezeckaStena,
      sum(`zadané údaje`, [], entityPercent, entityPercent)
    ),
    ctor('comp-diff')
  );

  const celekPocet = deduce(
    to(florbalDiff, percent("celek", "florbal", last(florbalDiff).quantity)),
    florbalPocet
  );

  return {
    divkyAnglictina:{
      deductionTree: deduce(
        celekPocet,
        deduce(
          last(celekPocet),
          percent("celek", "žádný kroužek", 6)
        ),
        ctor('comp-diff')
      )
    },
    pocetZaku:{
      deductionTree: deduce(
        last(celekPocet),
        percent("celek", "basketbal", 16)
      )
    }
  }
}

function angle() {
  const entity = "stupňů";
  const betaEntity = "beta úhel"

  const inputAngleLabel = `zadaný úhel`;
  const triangleSumLabel = 'součet úhlů v trojúhelníku';
  const triangleSum = cont(triangleSumLabel, 180, entity)
  const triangle = "úhel trojúhelníku ABC";

  const doubleBeta = deduce(
    cont(inputAngleLabel, 2, betaEntity),
    compAngle(inputAngleLabel, `${triangle} u vrcholu A`, 'alternate')
  )

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          toCont(
            deduce(
              triangleSum,
              deduce(
                axiomInput(cont(inputAngleLabel, 105, entity), 1),
                compAngle(inputAngleLabel, `${triangle} u vrcholu C`, 'supplementary')
              ),
              ctor('comp-diff'))
            , { agent: `beta`, }),
          deduce(
            doubleBeta,
            cont(`${triangle} u vrcholu B`, 1, betaEntity),
            sum("beta", [], betaEntity, betaEntity)
          ),
          ctor('rate')),
        last(doubleBeta)
      ),
      compAngle(`${triangle} u vrcholu A`, 'alfa', 'supplementary')
    )
  }
}

import { compAngle, compPercent, cont, ctor, ctorOption, sum, ctorUnit, nthPart, percent, ratios } from "../../components/math";
import { axiomInput, createLazyMap, deduce, last, lastQuantity, to, toCont } from "../../utils/deduce-utils";
import { porovnatAaB, najitMensiCislo } from "./1";
import { porovnatObsahObdelnikACtverec } from "./13";
import { triCislaNaOse } from "./3";
import letniTabor from "./letni-tabor";
import pocetSportovcu from "./pocet-sportovcu";
import kraliciASlepice from "./kralice-a-slepice-v-ohrade"

const letniTaborInput = {
  input: {
    zdravotnik: 1,
    kucharPerZdravotnik: 4,
    vedouciPerKuchar: 2,
    instruktorPerVedouci: 2,
    ditePerInstruktor: 4
  }
}

const osaParams = { mensiCislo: 1.4, vetsiCislo: 5.6, pocetUsekuMeziCisly: 6, A: 4, B: 7, C: -2 };
export default createLazyMap({
  1.1: () => porovnatAaB({ input: { a: 1.6, b: -1.2 } }),
  1.2: () => najitMensiCislo({ input: { zadane: 7 / 8, mensiO: 0.093 } }),
  3.1: () => triCislaNaOse({ input: osaParams }).C,
  3.2: () => triCislaNaOse({ input: osaParams }).B,
  3.3: () => triCislaNaOse({ input: osaParams }).rozdil,
  5.1: () => krouzky().divkyAnglictina,
  5.2: () => krouzky().pocetZaku,
  6: () => pocetSportovcu({ input: {} }),
  10.1: () => letniTabor(letniTaborInput).pocetVedoucichAInstruktoru,
  10.2: () => letniTabor(letniTaborInput).porovnaniInstrukturuAKucharek,
  10.3: () => letniTabor(letniTaborInput).pocetDeti,
  11: () => kraliciASlepice({
    input: {
      kralikuMene: 5,
      pocetHlav: 37
    }
  }),
  13: () => porovnatObsahObdelnikACtverec({
    input: {
      obdelnik: { a: 36, b: 12 },
      ctverec: { a: 6 }
    }
  }),
  14: () => angle(),
  15.1: () => koupaliste(),
  15.2: () => cestovni_kancelar(),
  15.3: () => pozemek(),
})

function koupaliste() {

  const entity = "návštěvníků"

  return {
    deductionTree: deduce(
      deduce(
        axiomInput(percent("koupaliště loni", "koupaliště letos", 80), 1),
        axiomInput(cont("koupaliště letos", 680, entity), 2)
      ),
      ctorOption("E", 850)
    )
  }
}

function cestovni_kancelar() {
  const entity = "klientů"

  return {
    deductionTree: deduce(
      deduce(
        axiomInput(cont("červen", 330, entity), 1),
        axiomInput(compPercent("červen", "červenec", 100 - 40), 2),
      ),
      ctorOption("B", 550)
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
        deduce(
          axiomInput(ratios("pozemek měřítko", [mapa, skutecnost], [1, 3_000]), 1),
          axiomInput(cont(mapa, 15, entity, "cm"), 2),
          nthPart(skutecnost)
        ),
        ctorUnit("m")
      ),
      ctorOption("A", 450)
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
      sum(`zadané údaje`)
    ),
    ctor('comp-diff')
  );

  const celekPocet = deduce(
    to(florbalDiff, percent("celek", "florbal", lastQuantity(florbalDiff))),
    florbalPocet
  );

  return {
    divkyAnglictina: {
      deductionTree: deduce(
        celekPocet,
        deduce(
          last(celekPocet),
          percent("celek", "žádný kroužek", 6)
        ),
        ctor('comp-diff')
      )
    },
    pocetZaku: {
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
              sum("beta")
            ),
            ctor('rate')),
          last(doubleBeta)
        ),
        compAngle(`${triangle} u vrcholu A`, 'alfa', 'supplementary')
      ),
      ctorOption("B", 110)
    )
  }
}

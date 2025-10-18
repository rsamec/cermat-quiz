import { compAngle, compPercent, cont, ctor, ctorOption, sum, ctorUnit, nthPart, percent, ratios, type Container, isNumber, rate, ctorSlide, proportion, counter, compRatio, ctorDifference, product, double, contLength, squareArea, rectangleArea, cuboidVolume } from "../../components/math";
import { axiomInput, createLazyMap, deduce, last, toPredicate, deduceAs } from "../../utils/deduce-utils";
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
  7: () => utulek(),
  10.1: () => letniTabor(letniTaborInput).pocetVedoucichAInstruktoru,
  10.2: () => letniTabor(letniTaborInput).porovnaniInstrukturuAKucharek,
  10.3: () => letniTabor(letniTaborInput).pocetDeti,
  11: () => kraliciASlepice({
    input: {
      kralikuMene: 5,
      pocetHlav: 37
    }
  }),
  12: () => charitativniZavod(),
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
  16.1: () => hranol().povrh,
  16.2: () => hranol().objem,

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
    ctorDifference('florbal')
  );

  const celekPocet = deduce(
    toPredicate<Container>(florbalDiff, (node) => {
      if (!isNumber(node.quantity)) {
        throw new Error("Expected a number for quantity in the node");
      }
      else {
        return percent("celek", "florbal", node.quantity);
      }
    }),
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
        ctorDifference('florbal')
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

function utulek() {
  const steneLabel = "štěně"
  const dospelyLabel = "dospělý pes"
  const entity = "krmeni"
  const entityBase = "zvíře"
  const entityTime = "dny"

  const puvodne = cont("původně", 5, entity)
  return {
    deductionTree: deduce(
      deduce(
        cont("od 2.4 do 8.4", 6, entityTime),
        deduceAs("od 8.4 do 18.4")(
          cont("původně", 10, entityTime),
          deduce(
            deduce(
              deduce(
                puvodne,
                deduce(
                  cont(steneLabel, 1, entity),
                  deduce(
                    rate(dospelyLabel, 2, entity, entityBase),
                    cont(dospelyLabel, 2, entityBase)
                  ),
                  sum("přibylo")
                ),
                sum("nově")
              ),
              puvodne,
              ctor('comp-ratio')
            ),
            proportion(true, ["zásoby krmení", "doba krmení"])
          )
        ),
        sum("celková doba nově")
      ),
      cont("posun o 1 den (začátek krmení 2.4.)", 1, entityTime),
      ctorSlide("začátek krmení")
    ),
    convertToTestedValue: value => value.quantity + 0.4
  }
}
function charitativniZavod() {
  const entity = "delka"
  const unit = "km"
  const entityBase = "doba"
  const unitBase = "h"

  const janaRate = rate("Jana", 4, { entity, unit }, { entity: entityBase, unit: unitBase })

  const adamDoba = cont("Adam", 40, entityBase, "min");
  return {
    deductionTree: deduce(
      deduce(
        adamDoba,
        deduce(
          deduceAs("zbytek závodu chůzí, stejná rychlost jako Jana")(
            deduce(
              deduce(
                deduce(
                  janaRate,
                  compRatio("Roman", "Jana", 5)
                ),
                cont("Roman", 1 / 2, entityBase, unitBase)
              ),
              deduce(
                deduce(
                  janaRate,
                  compRatio("Adam", "Jana", 3)
                ),
                deduce(
                  adamDoba,
                  ctorUnit('h')
                )
              ),
              ctorDifference("Adam zbytek závodu chůzí")
            ),
            { ...janaRate, agent: "Adam zbytek závodu chůzí" }
          ),
          ctorUnit("min")
        ),
        sum("Adam závod celkem")
      ),
      ctorOption("D", 70)
    )
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
            deduce(
              triangleSum,
              deduce(
                axiomInput(cont(inputAngleLabel, 105, entity), 1),
                compAngle(inputAngleLabel, `${triangle} u vrcholu C`, 'supplementary')
              ),
              ctorDifference("beta")
            ),
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


function hranol() {

  const obdelnikStrana1 = contLength("větší hranol kratší strana", 3)
  const obdelnikStrana2 = contLength("větší hranol delší strana", 6)

  const ctverecStrana = contLength("menší hranol kratší strana", 3)
  const vyska = contLength("výška", 15)
  return {
    povrh: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              ctverecStrana,
              squareArea("menší hranol")
            ),
            deduce(
              deduce(
                obdelnikStrana1,
                obdelnikStrana2,
                rectangleArea("větší hranol")
              ),
              double(),
              product("2 x větší hranol")
            ),
            sum("podstava")
          ),
          double(),
          product("2 x podstava = horní a spodní podstava")
        ),
        deduce(
          deduce(
            deduce(
              obdelnikStrana1,
              vyska,
              rectangleArea("část boční plášť odpovídající kratší straně")
            ),
            counter("osmkrát", 8),
            product("8 částí boční plášť odpovídající kratší straně")
          ),
          deduce(
            deduce(
              obdelnikStrana2,
              vyska,
              rectangleArea("část boční plášť odpovídající delší straně")
            ),
            double(),
            product("2 části boční plášť odpovídající delší straně")
          ),
          sum("boční plášť celkem")
        ),
        sum("hranol celkem (složený ze 3 hranolů)")
      )
    },
    objem: {
      deductionTree: deduce(
        deduce(
          ctverecStrana,
          ctverecStrana,
          vyska,
          cuboidVolume("menší hranol")
        ),
        deduce(
          deduce(
            obdelnikStrana1,
            obdelnikStrana2,
            vyska,
            cuboidVolume("objem větší hranol")
          ),
          double(),
          product("2 x větší hranol")
        ),
        sum("hranol celkem (složený ze 3 hranolů)")
      )
    }
  }
}
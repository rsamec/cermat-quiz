import { commonSense, comp, cont, ctor, ctorComplement, ctorDifference, ctorOption, ctorUnit, primeFactorization, rate, ratio, transfer, sum, ctorSlide, counter, ctorScaleInvert, ctorBooleanOption, pythagoras, product, productCombine, ctorRate } from "../../components/math";
import { axiomInput, deduce, last, to, createLazyMap, deduceAs, toPredicate } from "../../utils/deduce-utils";
import { cislaNaOse } from "../cislaNaOse";
const dveCislaNaOseParams = {
  input: {
    mensiCislo: 44,
    vetsiCislo: 110,
    pocetUsekuMeziCisly: 6,
    X: -2,
    Y: 3,
  }
}


export default createLazyMap({
  3: () => souctovyTrojuhelnik(),
  4.1: () => giftAndBox(),
  4.2: () => lukasAccount(),
  4.3: () => appleBox(),
  5.1: () => timeUnitSum(),
  5.2: () => distanceUnitCompareDiff(),
  6.1: () => dveCislaNaOse(dveCislaNaOseParams).XandY,
  6.2: () => dveCislaNaOse(dveCislaNaOseParams).posun,
  8.1: () => ctvercovaSit().porovnani,
  8.2: () => ctvercovaSit().obsah,
  8.3: () => ctvercovaSit().obvod,
  9: () => novorocniPrani(),
  11: () => sestiuhelnik(),
  12.1: () => vyvojObyvatel().panov,
  12.2: () => vyvojObyvatel().lidov,
  12.3: () => vyvojObyvatel().damov,
  13.1: () => carTrip().pocatekCesty,
  13.2: () => carTrip().zeleznicniPrejezd,
  13.3: () => carTrip().konecCesty,
  14.1: () => pyramida().floor8,
  14.2: () => pyramida().floor7,
  14.3: () => pyramida().stairs,
})
function souctovyTrojuhelnik() {
  const zbytekKRozdeleni = "zbytek k rozdělení"
  return {
    deductionTree: deduceAs("výsledek je složen z čísla 7 a trojnásobku hodnoty v šedém poli")(
      deduce(
        counter("výsledek", 25),
        counter("zadaná hodnota", 7),
        ctorDifference(zbytekKRozdeleni)
      ),
      counter("trojnásobek", 3),
      ctorScaleInvert("hodnota v šedém poli")
    )
  }
}

function ctvercovaSit() {
  const entity = "délka"
  const unit = "cm"

  const entity2d = "obsah"
  const unit2d = "cm2"
  const obdelnikVLabel = "větší obdelník 2x3"
  const obdelnikMLabel = "menší obdelník 2x2"
  const trojV = "větší trojúhleník";
  const trojM = "menší trojúhleník"

  const trojuhlenikV = to(
    commonSense(`${trojV} je polovinou ${obdelnikVLabel}`),
    cont(trojV, 3, entity2d, unit2d)
  )

  const trojuhlenikM = to(
    commonSense(`${trojM} je polovinou ${obdelnikMLabel}`),
    cont(trojV, 2, entity2d, unit2d)
  )

  const obdelnikV = cont(obdelnikVLabel, 6, entity2d, unit2d)
  const obdelnikM = cont(obdelnikMLabel, 4, entity2d, unit2d)

  const obsahA = deduce(
    obdelnikV,
    trojuhlenikM,
    trojuhlenikV,
    sum("obrazec A")
  )

  return {
    porovnani: {
      deductionTree: deduce(
        deduce(
          obsahA,
          deduce(
            obdelnikM,
            last(trojuhlenikM),
            last(trojuhlenikM),
            last(trojuhlenikM),
            sum("obrazec B")
          ),
        ),
        ctorBooleanOption(0)
      )
    },
    obsah: {
      deductionTree: deduce(
        obsahA,
        ctorBooleanOption(11)
      )
    },
    obvod: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont("strana 2", 2, entity, unit),
            counter("čtyřikrát", 4),
            product("část obvodu za přepony")
          ),
          cont("strana 1", 2, entity, unit),
          deduceAs("zde bereme délku přepony pouze 2 cm, víme však, že musí být delší než 2 cm")(
            cont("min. virtuální délka přepony", 2, entity, unit),
            counter("tři přepony", 3),
            product("část obvodu za přepony")
          ),
          sum("obvod")
        ),
        ctorBooleanOption(16, "smaller")
      )
    }
  }
}
function giftAndBox() {
  const entity = 'Kč'
  const giftLabel = "dárek";
  const boxLabel = "krabička"

  const paidTotal = axiomInput(cont("zaplaceno", 84, entity), 2)
  const giftToBox = axiomInput(comp(giftLabel, boxLabel, 72, entity), 1);


  const box = deduce(giftToBox, paidTotal, ctor('comp-part-eq'));
  return {
    deductionTree: deduce(
      deduce(giftToBox, last(box)),
      box,
      ctor("comp-ratio")
    )
  }
}


function lukasAccount() {
  const entity = 'Kč'

  const grandMotherIn = cont("babička", 500, entity);
  const bookCostOut = cont("kniha", 186, entity);

  const pocketMoneyIn = cont("kapesné", 150, entity);
  const fatherGiftOut = cont("dárek pro tatínka", 263, entity);
  const newState = cont("účet nově", 470, entity);


  const moneyIn = deduce(grandMotherIn, pocketMoneyIn, sum("přijato"));
  const moneyOut = deduce(bookCostOut, fatherGiftOut, sum("vydáno"));
  const balance = deduce(moneyIn, moneyOut, ctorDifference("změna na účtě"));
  return {
    deductionTree: deduce(
      newState,
      balance,
      ctorDifference("účet původně")
    )
  }
}

function appleBox() {

  const entity = "jablko";
  const soldLabel = "prodáno";
  const boxLabel = "plná bedna";
  const soldRatio = ratio(boxLabel, `${soldLabel} dopoledne`, 1 / 5);
  const sold = cont(`${soldLabel} odpoledne`, 20, entity);
  const restRatio = ratio(boxLabel, "2. den zbytek", 2 / 5);

  return {
    deductionTree: deduce(
      deduce(
        deduce(restRatio, ctorComplement("1. den prodáno")),
        soldRatio,
        ctorDifference(`${soldLabel} odpoledne`)
      ),
      sold
    )
  }
}

function timeUnitSum() {
  const entity = "";
  const minutes = "min"
  return {
    deductionTree: deduce(
      deduce(
        deduce(cont("hodin", 1, entity, "h"), ctorUnit(minutes)),
        cont("minut", 20, entity, minutes),
        sum("celkem")
      ),
      ctorUnit("s")
    )
  }
}

function distanceUnitCompareDiff() {
  const entity = "";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(cont("m", 1, entity, "m"), ctorUnit("cm")),
          cont("cm", 26, entity, "cm"),
          ctorDifference("pravá strana")
        ),
        deduce(cont("levá strana", 1 / 2, entity, "m"), ctorUnit("cm")),
        ctorDifference("výsledek")
      ),
      ctorUnit("mm")
    )
  }
}

export function dveCislaNaOse({ input }: { input: { mensiCislo: number, vetsiCislo: number, pocetUsekuMeziCisly: number, X: number, Y: number } }) {
  const entityLength = "délka";
  const entity = "úsek"

  const mensi = axiomInput(cont('menší zadané číslo', input.mensiCislo, entityLength,), 1)
  const vetsi = axiomInput(cont('větší zadnané číslo', input.vetsiCislo, entityLength,), 2)
  const pocetUseku = axiomInput(cont('vzdálenost mezi zadanými čísly', input.pocetUsekuMeziCisly, "úsek",), 3)

  const positionX = axiomInput(cont('posun X', input.X, entity), 1)
  const positionY = axiomInput(cont('posun Y', input.Y, entity), 1)

  const usekRate = cislaNaOse({ mensi, vetsi, pocetUseku })


  const dd1 = deduce(deduce(positionX, usekRate), mensi, ctorSlide("pozice X"));
  const dd2 = deduce(deduce(positionY, last(usekRate)), mensi, ctorSlide("pozice Y"));



  const zeroPositionPosun = deduce(mensi, usekRate);

  return {
    "XandY": {
      deductionTree: deduce(dd1, dd2, ctor("tuple")),
      convertToTestedValue: (value) => ({ X: value.items[0].quantity, Y: value.items[1].quantity })
    }, "posun": { deductionTree: zeroPositionPosun }
  }
}

export function novorocniPrani() {
  const entity = "přání";
  const entityBase = "minuty";
  const spolecne = cont("společně", 120, entity)
  return {
    deductionTree: deduce(
      deduce(
        spolecne,
        toPredicate<any>(
          deduce(
            cont("Tereza", 14, entity),
            cont("Nikola", 10, entity),
            sum("společně")
          ), node => ({ kind: 'rate', quantity: node.quantity, agent: "společně", entity: { entity }, entityBase: { entity: entityBase }, baseQuantity: 5 }))
      ),
      ctorOption("B", 25)
    )
  }
}

export function carTrip() {
  const entity = "minuty";
  const pocatekLabel = "čas odjezdu";
  const pocatekMinut = axiomInput(cont(pocatekLabel, 8, entity), 1)
  const dobaCesta = axiomInput(cont("cesta", 24, entity), 1)

  const pocatekPosun = deduce(
    dobaCesta,
    ratio("cesta", "1. třetina cesty", 1 / 3)
  );
  const pocatek = deduce(pocatekMinut, pocatekPosun, ctorDifference(pocatekLabel));

  return {
    pocatekCesty: {
      deductionTree: deduce(
        pocatek,
        ctorOption("E", 0)
      )
    },
    zeleznicniPrejezd: {
      deductionTree: deduce(
        deduce(
          dobaCesta,
          ratio("cesta", "polovina cesty", 1 / 2)
        ),
        ctorOption("C", 12)
      )
    },
    konecCesty: {
      deductionTree: deduce(
        deduce(
          deduce(last(pocatek), dobaCesta, ctorSlide("čas odjezdu")),
          cont("posun odjezdu o", 6, entity),
          ctorSlide("posunutý čas příjezdu"),
        ),
        ctorOption("A", 30)
      )
    },
  }
}

export function sestiuhelnik() {
  const entity = "trojúhleník"
  const entity2d = "cm2"
  const dark = cont("tmavá část", 2, entity);
  const obsah = cont("tmavá část", 112, entity2d)
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            cont("pravidelný šestiúhleník", 6, entity),
            dark,
            ctorDifference("světlá část")
          ),
          dark,
          ctor('comp-ratio')
        ),
        obsah,
      ),
      ctorOption("D", 224)
    )
  }
}

export function vyvojObyvatel() {
  const entity = "obyvatel"
  const lidovLabel = "Lidov"
  return {
    panov: {
      deductionTree: deduce(
        cont("přírůstek 2021", 10, entity),
        ctorOption("E", 10)
      )
    },
    lidov: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              cont(lidovLabel, 300, entity),
              transfer(`přírůstek 2019`, lidovLabel, 10, entity),
            ),
            transfer(`přírůstek 2020`, lidovLabel, 5, entity)
          ),
          transfer(lidovLabel, 'úbytek 2021', 5, entity)
        ),
        ctorOption("D", 310)
      )
    },
    damov: {
      deductionTree: deduce(
        deduce(
          cont("2019", -5, entity),
          cont("2020", -10, entity),
          cont("2021", 10, entity),
          cont("2022", 5, entity),
          sum("změna obyvatel")
        ),
        ctorOption("B", 0)
      )
    }
  }
}

export function pyramida() {
  const entity = "schody"
  const entityFloor = "patra";

  const pyramida7 = cont("pyramida", 7, entityFloor);
  const pyramida90 = cont("pyramida", 90, entity);

  return {
    floor8: {
      deductionTree: deduce(
        cont("černé schody", 48, entity),
        deduce(
          cont("pyramida", 8, entityFloor),
          ratio("pyramida", "černé schody", 1 / 2)
        ),
        ctor("rate")
      )
    },
    floor7: {
      deductionTree: deduce(
        deduce(
          cont("bílé schody", 84, entity),
          to(
            pyramida7,
            commonSense("patra se střídají pravidelně, první patro je černé"),
            cont("bílé schody", 3, entityFloor)
          ),
          ctor("rate")
        ),
        pyramida7
      )
    },
    stairs: {
      deductionTree: deduce(
        to(
          pyramida90,
          commonSense(`rozklad na prvočísla:${primeFactorization([pyramida90.quantity]).join(",")}`),
          commonSense(`hledáme co nejmenší periodu opakování schodů z rozkladu`),
          commonSense(`2 a 3 můžeme vyloučit, protože opakován schodů po 2,3 nesplňujem podmínku stejné barvnosti pro 27.patro = 30.patro`),
          commonSense(`5 je nejmenší možný počet schodů, který splňuje podmínku podmínku stejné barvnosti pro 27.patro = 30.patro`),
          rate('pyramida', 5, entity, entityFloor)
        ),
        pyramida90)
    }
  }
}
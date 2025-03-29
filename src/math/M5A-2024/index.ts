import { commonSense, comp, cont, ctor, ctorComplement, ctorDifference, ctorUnit, primeFactorization, rate, ratio, sum, transfer } from "../../components/math";
import { axiomInput, deduce, last, to } from "../../utils/deduce-utils";
import { cislaNaOse } from "../cislaNaOse";

export function souctovyTrojuhelnik() {
  const entity = 'velikost'
  return {
    deductionTree: deduce(
      deduce(
        cont("zadaná hodnota ve vrcholu trojúhelníku", 25, entity),
        cont("zadaná hodnota v jednom z polí", 7, entity),
        ctorDifference("zbytek k rozdělení")
      ),
      cont("zbytek k rozdělení", 3, "čísel"),
      ctor('rate')
    )
  }
}
export const giftAndBox = () => {
  const entity = 'Kč'
  const giftLabel = "dárek";
  const boxLabel = "krabička"

  const paidTotal = axiomInput(cont("zaplaceno", 84, entity), 2)
  const giftToBox = axiomInput(comp(giftLabel, boxLabel, 72, entity), 1);


  const box = deduce(giftToBox, paidTotal, ctor('comp-part-eq'));
  return {
    deductionTree: deduce(
      box,
      deduce(giftToBox, last(box)),
      ctor("comp-ratio")
    )
  }
}


export const lukasAccount = () => {
  const entity = 'Kč'

  const grandMotherIn = cont("babička", 500, entity);
  const bookCostOut = cont("kniha", 186, entity);

  const pocketMoneyIn = cont("kapesné", 150, entity);
  const fatherGiftOut = cont("dárek pro tatínka", 263, entity);
  const newState = cont("účet nově", 470, entity);


  const moneyIn = deduce(grandMotherIn, pocketMoneyIn, sum("přijato", [], entity, entity));
  const moneyOut = deduce(bookCostOut, fatherGiftOut, sum("vydáno", [], entity, entity));
  const balance = deduce(moneyIn, moneyOut, ctorDifference("změna na účtě"));
  return {
    deductionTree: deduce(
      newState,
      balance,
      ctorDifference("účet původně")
    )
  }
}

export const appleBox = () => {

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

export const timeUnitSum = () => {
  const entity = "";
  const minutes = "min"
  return {
    deductionTree: deduce(
      deduce(
        deduce(cont("hodin", 1, entity, "h"), ctorUnit(minutes)),
        cont("minut", 20, entity, minutes),
        sum("celkem", [], { entity, unit: minutes }, { entity, unit: minutes })
      ),
      ctorUnit("s")
    )
  }
}

export const distanceUnitCompareDiff = () => {
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


  const dd1 = deduce(deduce(positionX, usekRate), mensi, sum("pozice X", [], entityLength, entityLength));
  const dd2 = deduce(deduce(positionY, last(usekRate)), mensi, sum("pozice Y", [], entityLength, entityLength));



  const zeroPositionPosun = deduce(mensi, usekRate);

  return { "XandY": { deductionTree: to(dd1, dd2) }, "posun": { deductionTree: zeroPositionPosun } }
}

export function novorocniPrani() {
  const entity = "přání";
  const entityBase = "minuty";
  const spolecne = cont("společně", 120, entity)
  return {
    deductionTree: deduce(
      spolecne,
      deduce(
        deduce(cont("Tereza", 14, entity), cont("Tereza", 5, entityBase), ctor('rate')),
        deduce(cont("Nikola", 10, entity), cont("Nikola", 5, entityBase), ctor('rate')),
        sum("společně", [], entity, entity)
      )
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
      deductionTree: pocatek
    },
    zeleznicniPrejezd: {
      deductionTree: deduce(
        dobaCesta,
        ratio("cesta", "polovina cesty", 1 / 2)
      )
    },
    konecCesty: {
      deductionTree: deduce(
        deduce(last(pocatek), dobaCesta, sum("čas odjezdu", [], entity, entity)),
        cont("posun odjezdu o", 6, entity),
        sum("posunutý čas příjezdu", [], entity, entity),
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
          cont("pravidelný šestiúhleník", 6, entity),
          dark,
          ctorDifference("světlá část")
        ),
        dark,
        ctor('comp-ratio')
      ),
      obsah,
    )
  }
}

export function vyvojObyvatel() {
  const entity = "obyvatel"
  const lidovLabel = "Lidov"
  return {
    panov: {
      deductionTree: to(
        comp("počátek 2021", " konec 2021", 10, entity)
      )
    },
    lidov: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(lidovLabel, 300, entity),
            transfer(`přírůstek 2019`, lidovLabel, 10, entity),
          ),
          transfer(`přírůstek 2020`, lidovLabel, 5, entity)
        ),
        transfer(lidovLabel, 'úbytek 2021', 5, entity)
      )
    },
    damov: {
      deductionTree: deduce(
        cont("2019", -5, entity),
        cont("2020", -10, entity),
        cont("2021", 10, entity),
        cont("2022", 5, entity),
        sum("změna obyvatel", ["2019", "2020", "2021", "2022"], entity, entity)
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
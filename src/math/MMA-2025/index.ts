import { commonSense, comp, compPercent, compRatio, compRelativePercent, cont, ctor, ctorCompareRatio, ctorComplement, ctorDifference, ctorLinearEquation, ctorRatios, ctorUnit, evalExprAsCont, nthPart, primeFactorization, product, pythagoras, rate, ratio, ratios, sum } from "../../components/math";
import { deduce, deduceAs, last, lastQuantity, to, toCont } from "../../utils/deduce-utils";
import { solveLinearEquation } from "../../utils/math-solver";


export default {
  1: boruvky(),
  //3: delitelnost(),
  5.1: spotrebaPaliva().beznePalivo,
  5.2: spotrebaPaliva().powerPalivo,
  6: spotrebaPaliva().cenaPowerPalivo,
  8: prumernyPlat(),
  18: rovnoramennySatek(),
  19: kruhovaVysec(),
  20: vzestupHladinyVody(),
  21: vyrezKrychle(),
}


function boruvky() {
  const entity = "hmotnost"
  const entity50 = "dávka po 50g"
  const unit = "g"
  const entityPrice = "korun"
  const prodejce1Label = "prodejce 1";
  const prodejce2Label = "prodejce 2";

  const skupina = cont(entity50, 50, entity, "g");

  const drazsiBoruvky = deduceAs(`za dražší cenu ${prodejce2Label}`)(
    toCont(
      deduce(
        cont(prodejce1Label, 650, entity, unit),
        skupina,
        ctor('quota')
      ), { agent: `13 dávek` }),
    deduce(
      cont(prodejce2Label, 120, entityPrice),
      deduce(
        deduce(
          cont(prodejce2Label, 0.5, entity, "kg"),
          ctorUnit("g")
        ),
        skupina,
        ctor('quota')
      ),
      ctor('rate'),
    ),
    //asCont({ agent: `13 dávek` })
  )


  return {
    template: () => `Na trhu prodávají borůvky dva prodejci.
První prodejce prodává 1 litr za 150 korun. Přitom 1 litr borůvek má hmotnost 650 g.
Druhý prodejce borůvky váží a za 0,5 kg se zaplatí 120 korun.
Zákazník koupil levnější borůvky celkem za 600 korun.

Vypočtěte, za kolik korun by zákazník koupil dražší borůvky
o stejné hmotnosti.`,
    deductionTree: deduce(
      drazsiBoruvky,
      deduceAs(`za levnější cenu ${prodejce1Label}`)(
        cont("zaplaceno celkem", 600, entityPrice),
        cont("13 dávek", 150, entityPrice),
        ctor("comp-ratio"),
      ),
    )
  }
}

function spotrebaPaliva() {
  const standard = "běžné palivo"
  const power = "power"
  const entityPrice = "korun"
  const entity = "";

  const entityLength = "vzdálenost"
  const unitLength = "km"
  const unit = "l"

  const standardRate = rate(standard, 6.5, { entity, unit }, { entity: entityLength, unit: unitLength }, 100);
  const powerRate = rate(power, 5.8, { entity, unit }, { entity: entityLength, unit: unitLength }, 100);

  const standardPriceRate = rate(standard, 34.8, entityPrice, { entity, unit })
  const standardPrice = cont(standard, 34.8, entityPrice)
  const powerCompare = comp(power, standard, "x", entityPrice)

  const powerPrice = deduce(
    standardPrice,
    powerCompare
  );

  return {
    beznePalivo: {
      template: () => '',
      deductionTree: deduce(
        deduce(
          cont(standard, "d", entityLength, unitLength),
          standardRate
        ),
        standardPriceRate
      )
    },
    powerPalivo: {
      template: () => '',
      deductionTree:
        deduce(
          deduce(
            cont(power, "d", entityLength, unitLength),
            powerRate
          ),
          to(
            powerPrice,
            rate(power, lastQuantity(powerPrice), entityPrice, { entity, unit })
          )
        )
    },
    cenaPowerPalivo: {
      template: () => '',
      deductionTree: deduce(
        deduce(
          deduce(
            cont(power, 1, entityLength, unitLength),
            powerRate
          ),
          to(
            powerPrice,
            rate(power, lastQuantity(powerPrice), entityPrice, { entity, unit })
          )
        ),
        deduce(
          deduce(
            cont(standard, 1, entityLength, unitLength),
            standardRate
          ),
          standardPriceRate
        ),
        ctorLinearEquation("o kolik dražší power než běžné palivo", { entity: entityPrice }, "x")
      )
    }
  }
}


function prumernyPlat() {
  const entity = "zaměstnanci"
  const entityPrice = "korun"
  const zamLabel = "celkem"
  const seniorLabel = "senior"
  const ostatniLabel = "ostatní"
  const prumerLabel = "průměr"

  const platJunior = cont(ostatniLabel, "x", entityPrice);
  const platCompare = comp(seniorLabel, ostatniLabel, 6_000, entityPrice)
  const platSenior = deduce(
    platJunior,
    platCompare
  )


  const seniorPocet = ratio(seniorLabel, `podíl dle počtu v průměru ${seniorLabel}`, 1 / 3)
  const juniorPocet = ratio(ostatniLabel, `podíl dle počtu v průměru ${ostatniLabel}`, 2 / 3)


  const prumernyPlat = cont(prumerLabel, 46_200, entityPrice)

  const senioryCelkem = deduce(
    platSenior,
    seniorPocet
  )

  const juniorCelkem = deduce(
    platJunior,
    juniorPocet
  )

  return {
    template: () => '',
    deductionTree: deduce(
      deduce(
        prumernyPlat,
        deduce(
          senioryCelkem,
          juniorCelkem,
          sum("celkem vyplaceno", [], entityPrice, entityPrice)
        ),
        ctorLinearEquation(ostatniLabel, { entity: entityPrice }, "x")
      ),
      platCompare
    )
  }
}

function vzestupHladinyVody() {
  const unit = "cm"
  const entity = "délka"

  const unit3d = "cm3"
  const entity3d = "objem"


  const objemKulicky =
    deduce(
      cont("kulička poloměr", 3, entity, unit),
      evalExprAsCont("4/3*r^3*π", { kind: 'cont', agent: 'kulička', entity: entity3d, unit: unit3d })
    )

  const objemValce =
    deduce(
      deduce(
        cont("válec průměr", 12, entity, unit),
        compRatio("válec průměr", "válec poloměr", 2)
      ),
      evalExprAsCont("r^2*π", { kind: 'cont', agent: 'válec', entity: entity3d, unit: unit3d })
    )



  return {
    deductionTree: deduce(
      objemValce,
      objemKulicky,
      ctor("comp-ratio")
    )
  }
}

function delitelnost() {
  return {
    deductionTree: to(
      commonSense(`${primeFactorization([1470])}`)
    )
  }
}

function rovnoramennySatek() {
  const odvesnaLabel = "odvěsna";
  const preponaLabel = "přepona";
  const mensiSatekLabel = "menší šátek";
  const vetsiSatekLabel = "větší šátek";
  const entity = "délka";
  const unit = "cm";
  const entity2d = "obsah";
  const unit2d = "cm2"
  const mensiSatekOdvesna = cont(mensiSatekLabel, 50, entity, unit);

  const mensiSatek = deduce(
    mensiSatekOdvesna,
    evalExprAsCont("1/2*a^2", { kind: 'cont', agent: mensiSatekLabel, entity: entity2d, unit: unit2d })
  );

  const vetsiStatekOdvesna = deduce(
    deduce(
      mensiSatek,
      compRelativePercent(vetsiSatekLabel, mensiSatekLabel, 125)
    ),
    evalExprAsCont("sqrt(2*a)", { kind: 'cont', agent: vetsiSatekLabel, entity: entity2d, unit: unit2d })
  )
  return {
    deductionTree: deduce(
      vetsiStatekOdvesna,
      last(vetsiStatekOdvesna),
      pythagoras(`${vetsiSatekLabel} - ${preponaLabel}`, [mensiSatekLabel, mensiSatekLabel])
    )
  }
}

function vyrezKrychle() {
  const entity = "délka"
  const entity2d = "obsah"
  const telesoLabel = "nové těleso";
  const krychleLabel = "krychle";
  const stranaLabel = "strana krychle";
  const odvesna = "odvěsna trojúhelníku";
  const kratsiOdvesnaLabel = `kratší ${odvesna}`;
  const delsiOdvesnaLabel = `delší ${odvesna}`;
  const preponaLabel = 'přepona trojúhelníku';

  const stranaKrychle = to(
    commonSense("výřez se skládá ze dvou pravoúhlých trojúhlelníků, např. zvolím poměru délek pravoúhlého trojůhelníku odvěsna:odvěsna:přepona (3:4:5)"),
    commonSense("vede na výpočet délky strany krychle a = 6"),
    cont(stranaLabel, 6, entity)
  );

  const lastStranaKrychle = last(stranaKrychle)

  const kratsiOdvesna = deduce(lastStranaKrychle, ratio(stranaLabel, kratsiOdvesnaLabel, 1 / 2))
  const delsiOdvesna = deduce(lastStranaKrychle, ratio(stranaLabel, delsiOdvesnaLabel, 2 / 3))
  const prepona = deduce(
    kratsiOdvesna,
    delsiOdvesna,
    pythagoras(preponaLabel, [kratsiOdvesnaLabel, delsiOdvesnaLabel])
  )
  return {
    template: () => '',
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            stranaKrychle,
            lastStranaKrychle,
            product(`stěna ${krychleLabel}`, [], entity2d, entity)
          ),
          cont(`počet stěn ${krychleLabel}`, 6, ""),
          product(`${krychleLabel}`, [], entity2d, entity)
        ),
        deduce(
          deduce(
            deduce(
              lastStranaKrychle,
              lastStranaKrychle,
              product("stěna krychle", [], entity2d, entity)
            ),
            cont("počet čtvercových stěn", 3, ""),
            product(`levá, pravá a spodní stěna - ${telesoLabel}`, [], entity2d, entity)
          ),
          deduce(
            deduce(
              deduce(
                lastStranaKrychle,
                lastStranaKrychle,
                product(`přední stěna - ${telesoLabel}`, [], entity2d, entity)
              ),
              deduce(
                lastStranaKrychle,
                lastStranaKrychle,
                product(`zadní stěna - ${telesoLabel}`, [], entity2d, entity)
              ),
              sum(`přední a zadní stěna - ${telesoLabel}`, [], entity2d, entity)
            ),
            deduce(
              delsiOdvesna,
              lastStranaKrychle,
              product("přední a zadní trojúhelníkový výřez", [], entity2d, entity)
            ),
            ctorDifference(`přední a zadní stěna bez výřezu - ${telesoLabel}`)
          ),
          deduce(
            deduce(
              lastStranaKrychle,
              last(prepona),
              product(`obdelníková šikmá stěna - ${telesoLabel}`, [], entity2d, entity)
            ),
            cont(`počet obdelníkových šikmých stěn - ${telesoLabel}`, 2, ""),
            product(`obě obdelníkové šikmé stěny - ${telesoLabel}`, [], entity2d, entity)
          ),
          sum(`${telesoLabel}`, [], entity2d, entity)
        ),
        ctorRatios("poměr těles")
      ),
      cont("největší společný dělitel", 216, ""),
      ctor('scale')
    )
  }
}

 function kruhovaVysec() {
    const vetsiLabel = "celkový úhel kruhu";
    const mensiLabel = "uhel φ odpovídající výseči kruhu";
    const entity = "stupňů"
    return {
      deductionTree: deduce(
        to(
          commonSense(`obsah celého kruhu (r): π*r^2`),
          commonSense(`obsah celého kruhu s větším poloměrem(3/2r): π*3/2r^2 = 9/4*π*r^2`),
          commonSense(`větší kruh je 9/4 krát větší než menší kruh, což musí odpovídat tomu, že obsah výseče  výseče kruhu  jeho celkovému obsahu`),
          commonSense(`výseč je část z celého kruhu s větším poloměrem`),
          compRatio(vetsiLabel, mensiLabel, 9 / 4)
        ),
        cont(vetsiLabel, 360, entity)
      )

    }
  }
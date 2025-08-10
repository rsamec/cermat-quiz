import { productCombine, commonSense, comp, compRatio, compRelativePercent, cont, ctor, ctorDifference, ctorLinearEquation, product, ctorRatios, sum, ctorUnit, evalExprAsCont, primeFactorization, pythagoras, rate, ratio, counter, type Container, ctorOption, double, ctorScaleInvert, simplifyExpr, evalExprAsRate, ctorRound } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, to, toCont, toPredicate } from "../../utils/deduce-utils";


export default createLazyMap({
  1: () => boruvky({
    input: {
      quantityEntity: {
        entity: "hmotnost",
        unit: "g",
        groupSize: 50,
      },
      priceEntity: {
        entity: "korun",
      },
      agentA: {
        label: "prodejce 1",
        quantity: 650,
        price: 150,
      },
      agentB:
      {
        label: "prodejce 2",
        quantity: 0.5,
        price: 120,
        unit: "kg"
      },
      finalPrice: 600,
    }
  }),
  //3:()=> delitelnost(),
  5.1: () => spotrebaPaliva().beznePalivo,
  5.2: () => spotrebaPaliva().powerPalivo,
  6: () => spotrebaPaliva().cenaPowerPalivo,
  8: () => prumernyPlat(),
  18: () => rovnoramennySatek(),
  19: () => kruhovaVysec(),
  20: () => vzestupHladinyVody(),
  21: () => vyrezKrychle(),
})


function boruvky(inputs: {
  input: {
    quantityEntity: {
      groupSize: number,
      entity: string,
      unit: string
    },
    priceEntity: {
      entity: string,
    }
    finalPrice: number,
    agentA: {
      label: string,
      quantity: number,
      price: number,
    },
    agentB:
    {
      label: string,
      quantity: number,
      price: number,
      unit: string,
    },

  }
}) {
  const { quantityEntity, priceEntity, agentA, agentB, finalPrice } = inputs.input;
  const skupinaAgent = `skupina po ${quantityEntity.groupSize}${quantityEntity.unit}`
  const skupina = cont(skupinaAgent, quantityEntity.groupSize, quantityEntity.entity, quantityEntity.unit);
  const pocetSkupin = deduce(
    cont(agentA.label, agentA.quantity, quantityEntity.entity, quantityEntity.unit),
    skupina,
    ctor('quota')
  )

  const pocetSkupinAgent = `${last(pocetSkupin).quantity} ${skupinaAgent}`
  const morePriceEntity = deduceAs(`za dražší cenu ${agentB.label}`)(
    toCont(pocetSkupin
      , { agent: pocetSkupinAgent }),
    deduce(
      cont(agentB.label, agentB.price, priceEntity.entity),
      deduce(
        deduce(
          cont(agentB.label, agentB.quantity, quantityEntity.entity, agentB.unit),
          ctorUnit(quantityEntity.unit)
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
      morePriceEntity,
      deduceAs(`za levnější cenu ${agentA.label}`)(
        cont("celkem", finalPrice, priceEntity.entity),
        cont(pocetSkupinAgent, agentA.price, priceEntity.entity),
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
          toPredicate<Container>(powerPrice, d => ({
            kind: 'rate',
            agent: power,
            entity: { entity: entityPrice },
            entityBase: { entity, unit },
            quantity: d.quantity,
            baseQuantity: 1
          }))
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
          toPredicate<Container>(powerPrice, d => ({
            kind: 'rate',
            agent: power,
            entity: { entity: entityPrice },
            entityBase: { entity, unit },
            quantity: d.quantity,
            baseQuantity: 1
          }))
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
          sum("celkem vyplaceno")
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
    deduceAs("kulička")(
      cont("kulička poloměr", 3, entity, unit),
      evalExprAsCont("4/3*r^3*π", { kind: 'cont', agent: 'voda', entity: entity3d, unit: unit3d })
    )

  const objemValce =
    deduceAs("válec")(
      deduce(
        cont("válec průměr", 12, entity, unit),
        double(),
        ctorScaleInvert("válec poloměr")
      ),
      evalExprAsRate("r^2*π", { kind: 'rate', agent: 'voda', entity: { entity: entity3d, unit: unit3d }, entityBase: { entity, unit }, baseQuantity: 1 })
    )



  return {
    deductionTree: deduce(
      deduce(
        deduce(
          objemValce,
          objemKulicky,
        ),
        simplifyExpr({ "π": 3.14 }),
      ),
      ctorOption("D", 1))
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
  const delsiStranaSatku = "delší strana šátku";
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
    evalExprAsCont("1/2*delka_strany^2", { kind: 'cont', agent: mensiSatekLabel, entity: entity2d, unit: unit2d })
  );

  const vetsiStatekOdvesna = deduce(
    deduce(
      mensiSatek,
      compRelativePercent(vetsiSatekLabel, mensiSatekLabel, 125)
    ),
    evalExprAsCont("sqrt(2*obsah)", { kind: 'cont', agent: vetsiSatekLabel, entity: entity, unit: unit })
  )
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          vetsiStatekOdvesna,
          last(vetsiStatekOdvesna),
          pythagoras(delsiStranaSatku, [mensiSatekLabel, mensiSatekLabel])
        ),
        ctorRound()
      ),
      ctorOption("D", 106)
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
            productCombine(`stěna ${krychleLabel}`, entity2d)
          ),
          counter(`počet stěn ${krychleLabel}`, 6),
          product(`${krychleLabel}`)
        ),
        deduce(
          deduce(
            deduce(
              lastStranaKrychle,
              lastStranaKrychle,
              productCombine("stěna krychle", entity2d)
            ),
            counter("počet čtvercových stěn", 3),
            product(`levá, pravá a spodní stěna - ${telesoLabel}`)
          ),
          deduce(
            deduce(
              deduce(
                lastStranaKrychle,
                lastStranaKrychle,
                productCombine(`přední stěna - ${telesoLabel}`, entity2d)
              ),
              deduce(
                lastStranaKrychle,
                lastStranaKrychle,
                productCombine(`zadní stěna - ${telesoLabel}`, entity2d)
              ),
              sum(`přední a zadní stěna - ${telesoLabel}`)
            ),
            deduce(
              delsiOdvesna,
              lastStranaKrychle,
              productCombine("přední a zadní trojúhelníkový výřez", entity2d)
            ),
            ctorDifference(`přední a zadní stěna bez výřezu - ${telesoLabel}`)
          ),
          deduce(
            deduce(
              lastStranaKrychle,
              last(prepona),
              productCombine(`obdelníková šikmá stěna - ${telesoLabel}`, entity2d)
            ),
            counter(`počet obdelníkových šikmých stěn - ${telesoLabel}`, 2),
            product(`obě obdelníkové šikmé stěny - ${telesoLabel}`)
          ),
          sum(`${telesoLabel}`)
        ),
        ctorRatios("poměr těles")
      ),
      cont("největší společný dělitel", 216, ""),
      ctor('scale-invert')
    )
  }
}

function kruhovaVysec() {
  const vetsiLabel = "celkový úhel kruhu";
  const mensiLabel = "uhel φ odpovídající výseči kruhu";
  const entity = "stupňů"
  return {
    deductionTree: deduce(
      deduce(
        to(
          commonSense(`obsah celého kruhu (r): π*r^2`),
          commonSense(`obsah celého kruhu s větším poloměrem(3/2r): π*3/2r^2 = 9/4*π*r^2`),
          commonSense(`větší kruh je 9/4 krát větší než menší kruh, což musí odpovídat tomu, že obsah výseče  výseče kruhu  jeho celkovému obsahu`),
          commonSense(`výseč je část z celého kruhu s větším poloměrem`),
          compRatio(vetsiLabel, mensiLabel, 9 / 4)
        ),
        cont(vetsiLabel, 360, entity)
      ),
      ctorOption("B", 160)
    )
  }
}
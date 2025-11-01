import { commonSense, comp, compRatio, compRelativePercent, cont, ctor, ctorDifference, ctorLinearEquation, product, ctorRatios, sum, ctorUnit, evalExprAsCont, pythagoras, rate, ratio, counter, type Container, ctorOption, double, ctorScaleInvert, simplifyExpr, evalExprAsRate, ctorRound, contLength, dimensionEntity, EmptyUnit, primeFactors, squareArea, rectangleArea, triangleArea, half, ctorScale } from "../../components/math";
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
  const dim = dimensionEntity()

  const objemKulicky =
    deduceAs("kulička")(
      contLength("kulička poloměr", 3),
      evalExprAsCont("4/3*r^3*Pi", 'voda', dim.volume)
    )

  const objemValce =
    deduceAs("válec")(
      deduce(
        contLength("válec průměr", 12),
        half(),
        ctorScale("válec poloměr")
      ),
      evalExprAsRate("r^2*Pi", { kind: 'rate', agent: 'voda', entity: dim.volume, entityBase: dim.length, baseQuantity: 1 })
    )



  return {
    deductionTree: deduce(
      deduce(
        deduce(
          objemValce,
          objemKulicky,
        ),
        simplifyExpr({ "Pi": 3.14 }),
      ),
      ctorOption("D", 1))
  }
}

function delitelnost() {
  return {
    deductionTree: to(
      primeFactors([1470])
    )
  }
}

function rovnoramennySatek() {
  const dim = dimensionEntity()

  const delsiStranaSatku = "delší strana šátku";
  const mensiSatekLabel = "menší šátek";
  const vetsiSatekLabel = "větší šátek";
  const mensiSatekOdvesna = contLength(mensiSatekLabel, 50);

  const mensiSatek = deduce(
    mensiSatekOdvesna,
    mensiSatekOdvesna,
    triangleArea(mensiSatekLabel)
  );

  const vetsiStatekOdvesna = deduce(
    deduce(
      mensiSatek,
      compRelativePercent(vetsiSatekLabel, mensiSatekLabel, 125)
    ),
    evalExprAsCont("sqrt(2*obsah)", vetsiSatekLabel, dim.length)
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
    contLength(stranaLabel, 6, EmptyUnit)
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
          stranaKrychle,
          squareArea(`stěna ${krychleLabel}`, EmptyUnit)
        ),
        counter(`počet stěn ${krychleLabel}`, 6),
        product(`${krychleLabel}`)
      ),
      deduce(
        deduce(
          deduce(
            lastStranaKrychle,
            squareArea("stěna krychle", EmptyUnit)
          ),
          counter("počet čtvercových stěn", 3),
          product(`levá, pravá a spodní stěna - ${telesoLabel}`)
        ),
        deduce(
          deduce(
            deduce(
              lastStranaKrychle,
              squareArea(`přední stěna - ${telesoLabel}`, EmptyUnit)
            ),
            deduce(
              lastStranaKrychle,
              squareArea(`zadní stěna - ${telesoLabel}`, EmptyUnit)
            ),
            sum(`přední a zadní stěna - ${telesoLabel}`)
          ),
          deduce(
            delsiOdvesna,
            lastStranaKrychle,
            rectangleArea("přední a zadní trojúhelníkový výřez", EmptyUnit)
          ),
          ctorDifference(`přední a zadní stěna bez výřezu - ${telesoLabel}`)
        ),
        deduce(
          deduce(
            lastStranaKrychle,
            last(prepona),
            rectangleArea(`obdelníková šikmá stěna - ${telesoLabel}`, EmptyUnit)
          ),
          counter(`počet obdelníkových šikmých stěn - ${telesoLabel}`, 2),
          product(`obě obdelníkové šikmé stěny - ${telesoLabel}`)
        ),
        sum(`${telesoLabel}`)
      ),
      ctorRatios("poměr těles", { useBase: true })
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
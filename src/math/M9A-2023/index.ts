import { commonSense, comp, compAngle, compPercent, compRatio, cont, ctor, ctorComplement, ctorDifference, ctorComparePercent, ctorRatios, ctorUnit, nthPart, pythagoras, rate, ratio, ratios, ctorOption, ctorBooleanOption, counter, product, sum, contLength, dimensionEntity, pattern, range, triangleArea, squareArea, rectangleArea, circleArea, contTringleAngleSum } from "../../components/math";
import { anglesNames, axiomInput, createLazyMap, deduce, last, to } from "../../utils/deduce-utils";

export default createLazyMap({
  1: () => dobaFilmu({ input: { celkovaDobaFilmuVHodina: 1 } }),
  2.1: () => sud(),
  2.2: () => rezaniKvadru(),
  6.1: () => triangleExample().obsahABD,
  6.2: () => triangleExample().obsahABCD,
  7.1: () => krouzkyATridy().procent,
  7.2: () => krouzkyATridy().pocet,
  7.3: () => krouzkyATridy().pomer,
  8.2: () => pozemekObdelnik().delkaStrany,
  8.3: () => pozemekObdelnik().obsah,
  11.1: () => rovinataOblast().skutecnost,
  11.2: () => rovinataOblast().vychazkovaTrasa,
  11.3: () => rovinataOblast().meritko,
  12: () => lomanaCaraACFHA(),
  13: () => povrchValce(),
  14: () => angleBeta(),
  15.1: () => vyrobenoVyrobku(),
  15.2: () => dovolenaNaKole(),
  15.3: () => propousteniVeFirme(),
  16.1: () => trojuhelnik().patyObrazec,
  16.2: () => trojuhelnik().sestyObrazec,
  16.3: () => trojuhelnik().posledniObrazec,
})

function trojuhelnik() {


  const agent = "obrazec"
  const entity = "trojúhelník";
  const whiteEntity = `bílý ${entity}`
  const grayEntity = `šedý ${entity}`
  const nthLabel = "pozice"

  const vzor = pattern({
    nthTerm: `3^(n-1)`,
    nthPosition: 'ln(x)/ln(3)',
    nthTermFormat: n => n == 1 ? "1" : `${range(n, 1).map(d => 3).join(" * ")}`
  }, {
    entity: whiteEntity
  })


  return {
    patyObrazec: {
      deductionTree: deduce(
        vzor,
        cont(`${agent} 5`, 5, nthLabel)
      )
    },
    sestyObrazec: {
      deductionTree: deduce(
        deduce(
          vzor,
          cont(`${agent} 6`, 6, nthLabel)
        ),
        cont(`${agent} 6`, 121, grayEntity),
        sum("celkem", { entity: grayEntity })
      )
    },
    posledniObrazec: {
      deductionTree: deduce(
        to(
          comp("poslední", "předposlední", 6561, grayEntity),
          commonSense("Počet šedých trojúhelníků v následujícím obrazci se zvýší o počet bílých trojúhelníků v předchozím obrazci."),
          cont("předposlední", 6561, whiteEntity)
        ),
        counter("trojnásobek", 3),
        product("poslední obrazec")
      )
    },

  }
}

function dobaFilmu({ input }: { input: { celkovaDobaFilmuVHodina: number } }) {
  const entity = "hodin";
  return {
    title: 'Zbývající čas filmu',
    deductionTree: deduce(
      deduce(
        axiomInput(cont("film", input.celkovaDobaFilmuVHodina, entity, "h"), 1),
        ctorUnit("min")
      ),
      deduce(
        compRatio("zbytek do konce filmu", "uplynulo od začátku filmu", 1 / 2),
        ctorRatios("film"),
      ),
      nthPart("zbytek do konce filmu")
    )
  }
}


export function sud() {
  const entity = "litr";
  return {
    title: "Objem konvičky",
    deductionTree: deduce(
      deduce(
        deduce(
          cont("zbylo", 60, entity),
          deduce(ratio("sud", "odebráno", 1 / 3), ctorComplement("zbylo"))
        ),
        compRatio("sud", "kbelík", 15)),
      compRatio("kbelík", "konvička", 5),
    )
  }
}

export function rezaniKvadru() {
  const dim = dimensionEntity("dm");
  const entity = "krychle"
  return {
    title: 'Rozřezání kvádru na krychličky',
    deductionTree: deduce(
      deduce(
        cont("kvádr", 200, entity),
        rate("kvádr", 8, dim.volume, entity)
      ),
      ctorUnit("cm3")
    )
  }
}

export function vyrobenoVyrobku() {
  const entity = "výrobků";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          cont("vyrobeno 2020", 250, entity),
          compPercent("vyrobeno 2021", "vyrobeno 2020", 120)
        ),
        compPercent("vyrobeno 2022", "vyrobeno 2021", 120)
      ),
      ctorOption("E", 360)
    )
  }
}

export function dovolenaNaKole() {
  const entity = "vzdálenost";
  const unit = "km"
  return {
    deductionTree: deduce(
      deduce(
        cont("Roman", 400, entity, unit),
        compRatio("Roman", "Jana", 5 / 4)
      ),
      ctorOption("C", 320)
    )
  }
}

// export function propousteniVeFirme() {
//   const entity = "zaměstnanec";
//   return {
//     deductionTree: deduce(
//       deduce(
//         cont("nově přijato", 42, entity),
//         percent("konec krize","nově přijato", 25)),
//       compPercent("konec krize", "počátek krize", 60)
//     ),
//   }
// }

export function propousteniVeFirme() {
  const entity = "zaměstnanec";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          comp("nově přijato", "konec krize", 42, entity),
          compPercent("nově přijato", "konec krize", 125)),
        compPercent("konec krize", "počátek krize", 60)
      ),
      ctorOption("A", 280)
    )
  }
}

export function povrchValce() {

  const polomer = contLength("poloměr podstavy", 10);

  const podstava = deduce(
    polomer,
    circleArea("podstava")
  )

  return {
    title: 'Povrch válce',
    deductionTree: deduce(
      deduce(
        podstava,
        last(podstava),
        deduce(last(podstava), compRatio("plášť", "podstava", 3)),
        sum("válec")
      ),
      ctorOption("D", 1570)
    )
  }
}

function krouzkyATridy() {
  const entity = "žák";
  const entityBase = "jednotka grafu"

  const hudebniLabel = "hudební";
  const sachovyLabel = "šachový";
  const robotickyLabel = "robotický";

  const hudebni8 = cont(`${hudebniLabel} 8.`, 5, entityBase);
  const hudebni9 = cont(`${hudebniLabel} 9.`, 4, entityBase);

  const sachovy8 = cont(`${sachovyLabel} 8.`, 4, entityBase);
  const sachovy9 = cont(`${sachovyLabel} 9.`, 7, entityBase);

  const roboticky8 = cont(`${robotickyLabel} 8.`, 3, entityBase);

  return {
    procent: {
      title: 'Procentuální rozdíl žáků v hudebním kroužku',
      deductionTree: deduce(
        hudebni8,
        hudebni9,
        ctorComparePercent()
      ),
    },
    pocet: {
      title: 'Počet žáků 9. tříd v šachovém kroužku',
      deductionTree: deduce(
        deduce(
          comp(hudebniLabel, sachovyLabel, -6, entity),
          comp(hudebniLabel, sachovyLabel, -2, entityBase)),
        sachovy9
      )
    },
    pomer: {
      title: 'Poměr žáků 8. a 9. tříd v robotickém kroužku',
      deductionTree: deduce(
        roboticky8,
        deduce(
          deduce(
            deduce(hudebni8, sachovy8, roboticky8, sum("8.")),
            ratios("celkem", ["8.", "9."], [2, 3]),
            nthPart("9.")
          ),
          deduce(hudebni9, sachovy9, sum("9.")),
          ctorDifference(`${robotickyLabel} 9.`)
        ),
        ctorRatios(robotickyLabel)
      )
    }
  }
}

export function pozemekObdelnik() {
  const dim = dimensionEntity("m")

  const delsiStranaComp = comp("obdelník delší strana", "čtverec", 10, dim.length)
  const kratsiStranaComp = comp("obdelník kratší strana", "čtverec", -10, dim.length)
  const stranaCtverce = deduce(
    compPercent("obdelník kratší strana", "čtverec", 75),
    to(
      delsiStranaComp,
      commonSense("pokud je jedna strana delší, musí být druhá strana kratší o stejnou vzdálenost, aby byl zachován stejný obvod"),
      kratsiStranaComp
    )
  )

  return {
    delkaStrany: {
      title: 'Délka strany čtvercového pozemku',
      deductionTree: stranaCtverce,
    },
    obsah: {
      title: 'Rozdíl obsahů pozemků',
      deductionTree: deduce(
        deduce(
          last(stranaCtverce),
          squareArea("čtverec", "m2")
        ),
        deduce(
          deduce(last(stranaCtverce), kratsiStranaComp),
          deduce(last(stranaCtverce), delsiStranaComp),
          rectangleArea("obdelník", "m2")
        )
      )
    }
  }
}


function angleBeta() {

  const alfaEntity = anglesNames.alpha;
  const triangleSum = contTringleAngleSum();
  const triangle = "trojúhelníku";

  const alfaA = cont(`vnitřní ${triangle}`, 4, alfaEntity);
  const vedleKBetaLabel = `vrchol vedle k ${anglesNames.beta} u vnitřního ${triangle}`
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          triangleSum,
          deduce(
            deduce(
              cont(`zadaný u vnějšího ${triangle}`, 4, alfaEntity),
              compAngle(`zadaný u vnějšího ${triangle}`, vedleKBetaLabel, 'corresponding'),
            ),
            cont(`zadaný u vnitřního ${triangle}`, 4, alfaEntity),
            deduce(
              cont(`zadaný`, 2, alfaEntity),
              compAngle(`zadaný`, `vrchol u vnitřního ${triangle}`, 'opposite'),
            ),
            ctorRatios(triangleSum.agent)
          ),
          alfaA,
          nthPart(vedleKBetaLabel)
        ),
        compAngle(vedleKBetaLabel, anglesNames.beta, 'supplementary')
      ),
      ctorOption("B", 108)
    )
  }
}


export function rovinataOblast() {
  const agent = "měřítko"
  const plan = "plán";
  const skutecnost = "skutečnost"

  const meritko = deduce(
    deduce(
      cont(agent, 700, skutecnost, "m"),
      ctorUnit("cm")
    ),
    cont(agent, 3.5, plan, "cm"),
    ctor("rate")
  );
  const vychazkovaTrasaLabel = "vycházková trasa"
  const vychazkovaTrasa = cont(vychazkovaTrasaLabel, 6, skutecnost, "km");
  return {
    skutecnost: {
      title: 'Délka trasy na mapě a ve skutečnosti',
      deductionTree: deduce(
        deduce(
          deduce(
            meritko,
            deduce(
              cont("trasa", 49, plan, "mm"),
              ctorUnit("cm")
            ),
          ),
          ctorUnit("km"),
        ),
        ctorBooleanOption(1, "greater")
      )
    },
    vychazkovaTrasa: {
      title: 'Rozdíl délek tras na mapě',
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              vychazkovaTrasa,
              deduce(
                vychazkovaTrasa,
                compRatio(vychazkovaTrasaLabel, "přímá trasa", 3),
              ),
              ctorDifference("rozdíl")
            ),
            ctorUnit("cm")
          ),
          last(meritko),
          nthPart(plan)
        ),
        ctorBooleanOption(20)
      )
    },
    meritko: {
      title: 'Měřítko turistické mapy',
      deductionTree: deduce(
        meritko,
        ctorBooleanOption(200_000)
      )
    }
  }
}

export function lomanaCaraACFHA() {
  const entity = "délka";
  const unit = "cm";
  const ac = cont("AC", 17, entity, unit);
  const bc = deduce(
    ac,
    cont("AB", 15, entity, unit),
    pythagoras("AC", ["AB", "BC"])
  );

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            bc,
            cont("BF", 6, entity, unit),
            pythagoras("CF", ["BF", "BC"])
          ),
          ac,
          sum("úhlopříčka na podlaze (AC) + úhlopříčka na stěně (CF)")
        ),
        counter("stejně dlouhá úhlopříčka na stropě (FH) i stejně dlouhá úhlopříčka na druhé stěně (HA)", 2),
        product("lomené čáry ACFHA")
      ),
      ctorOption("C", 54)
    )
  }
}

export function triangleExample() {

  const height = contLength("výška CB", 8);
  const abd = deduce(
    contLength("základna AB", 6),
    height,
    triangleArea("trojúhelník ABD")
  );
  return {
    obsahABD: {
      deductionTree: abd
    },
    obsahABCD: {
      deductionTree: deduce(
        last(abd),
        deduce(
          contLength("základna CD", 10),
          height,
          triangleArea("trojúhelník BCD")
        ),
        sum("obsah ABCD")
      )
    }
  }
}
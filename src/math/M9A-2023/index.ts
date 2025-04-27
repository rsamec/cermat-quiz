import { commonSense, comp, compAngle, compPercent, compRatio, cont, ctor, ctorComplement, ctorDifference, ctorComparePercent, ctorRatios, ctorUnit, nthPart, pi, product, pythagoras, rate, ratio, ratios, sum } from "../../components/math";
import { axiomInput, deduce, last, to } from "../../utils/deduce-utils";
import { triangleArea } from "../shapes/triangle";
import trojuhelnik from "./trojuhelnik";

export default {
  1: dobaFilmu({ input: { celkovaDobaFilmuVHodina: 1 } }),
  2.1: sud(),
  2.2: rezaniKvadru(),
  6.1: triangleExample().obsahABD,
  6.2: triangleExample().obsahABCD,
  7.1: krouzkyATridy().procent,
  7.2: krouzkyATridy().pocet,
  7.3: krouzkyATridy().pomer,
  8.2: pozemekObdelnik().delkaStrany,
  8.3: pozemekObdelnik().obsah,
  11.1: rovinataOblast().skutecnost,
  11.2: rovinataOblast().vychazkovaTrasa,
  11.3: rovinataOblast().meritko,
  12: lomanaCaraACFHA(),
  13: povrchValce(),
  14: angleBeta(),
  15.1: vyrobenoVyrobku(),
  15.2: dovolenaNaKole(),
  15.3: propousteniVeFirme(),
  16.1: trojuhelnik({ input: {} })[0],
  16.2: trojuhelnik({ input: {} })[1],
  16.3: trojuhelnik({ input: {} })[2],
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
        compRatio("zbytek do konce filmu", "uplynulo od začátku filmu", 1/2),
        ctorRatios("film"),
      )
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
  const entity = "krychle"
  return {
    title: 'Rozřezání kvádru na krychličky',
    deductionTree: deduce(
      deduce(
        cont("kvádr", 200, entity),
        rate("kvádr", 8, { entity: "objem", unit: "dm3" }, entity)
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
        cont("vyrobeno 2020", 250, entity),
        compPercent("vyrobeno 2021", "vyrobeno 2020", 120)
      ),
      compPercent("vyrobeno 2022", "vyrobeno 2021", 120)
    )
  }
}

export function dovolenaNaKole() {
  const entity = "vzdálenost";
  const unit = "km"
  return {
    deductionTree: deduce(
      cont("Roman", 400, entity, unit),
      compRatio("Roman", "Jana", 5 / 4)
    ),
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
        comp("nově přijato", "konec krize", 42, entity),
        compPercent("nově přijato", "konec krize", 125)),
      compPercent("konec krize", "počátek krize", 60)
    ),
  }
}

export function povrchValce() {
  const entity = "délka";
  const unit = "cm"
  const entity2d = "obsah";
  const unit2d = "cm2"

  const polomer = cont("poloměr podstavy", 10, entity, unit);

  const podstava = deduce(
    polomer,
    polomer,
    pi(),
    product("podstava", [], entity2d, entity)
  )

  return {
    title: 'Povrch válce',
    deductionTree: deduce(
      podstava,
      last(podstava),
      deduce(last(podstava), compRatio("plášť", "podstava", 3)),
      sum("válec", ["dolní podstava", "horní podstava", "plášť"], entity2d, entity2d)
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
      )
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
            deduce(hudebni8, sachovy8, roboticky8, sum("8.", [], entityBase, entityBase)),
            ratios("celkem", ["8.", "9."], [2, 3]),
            nthPart("9.")
          ),
          deduce(hudebni9, sachovy9, sum("9.", [], entityBase, entityBase)),
          ctorDifference(`${robotickyLabel} 9.`)
        ),
        ctorRatios(robotickyLabel)
      )
    }
  }
}

export function pozemekObdelnik() {
  const entity = "délka"
  const unit = "m"
  const entity2d = "obsah"
  const unit2d = "m2"


  const delsiStranaComp = comp("obdelník delší strana", "čtverec", 10, { entity, unit })
  const kratsiStranaComp = comp("obdelník kratší strana", "čtverec", -10, { entity, unit })
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
          last(stranaCtverce),
          product("čtverec", [], { entity: entity2d, unit: unit2d }, { entity, unit })
        ),
        deduce(
          deduce(last(stranaCtverce), kratsiStranaComp),
          deduce(last(stranaCtverce), delsiStranaComp),
          product("obdelník", [], { entity: entity2d, unit: unit2d }, { entity, unit })
        )
      )
    }
  }
}


function angleBeta() {
  const entity = "stupňů";
  const alfaEntity = "alfa";

  const triangleSumLabel = 'součet úhlů v trojúhelníku';
  const triangleSum = cont(triangleSumLabel, 180, entity)
  const triangle = "úhel trojúhelníku ABC";

  const alfaA = cont(`vnitřní ${triangle} u vrcholu A`, 4, alfaEntity);
  return {
    title: 'Velikost úhlu β',
    deductionTree: deduce(
      deduce(
        triangleSum,
        deduce(
          to(
            cont(`zadaný úhel u vnějšího ${triangle} u vrcholu A`, 4, alfaEntity),
            compAngle(`zadaný úhel u vnějšího ${triangle} u vrcholu A`, `vnitřní ${triangle} u vrcholu A`, 'corresponding'),
            alfaA,
          ),
          cont(`zadaný úhel vnitřní ${triangle} u vrcholu B`, 4, alfaEntity),
          to(
            cont(`zadaný úhel u ${triangle} u vrcholu C`, 2, alfaEntity),
            compAngle(`zadaný úhel u ${triangle} u vrcholu C`, `vnitřní ${triangle} u vrcholu A`, 'opposite'),
            cont(`vnitřní ${triangle} u vrcholu C`, 2, alfaEntity),
          ),
          ctorRatios(triangleSumLabel)
        ),
        alfaA,
        nthPart(`vnitřní ${triangle} u vrcholu A`)
      ),
      compAngle(`vnitřní ${triangle} u vrcholu A`, 'beta', 'supplementary')
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
          meritko,
          deduce(
            cont("trasa", 49, plan, "mm"),
            ctorUnit("cm")
          ),
        ),
        ctorUnit("km"),
      )
    },
    vychazkovaTrasa: {
      title: 'Rozdíl délek tras na mapě',
      deductionTree: deduce(
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
      )
    },
    meritko: {
      title: 'Měřítko turistické mapy',
      deductionTree: meritko
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
          bc,
          cont("BF", 6, entity, unit),
          pythagoras("CF", ["BF", "BC"])
        ),
        ac,
        sum("úhlopříčka na podlaze (AC) + úhlopříčka na stěně (CF)", ["AC", "CF"], { entity, unit }, { entity, unit })
      ),
      cont("stejně dlouhá úhlopříčka na stropě (FH) i stejně dlouhá úhlopříčka na druhé stěně (HA)", 2, ""),
      product("lomené čáry ACFHA", [], { entity, unit }, { entity, unit })
    )
  }
}

export function triangleExample() {
  const entity = "délka";
  const unit = "cm";
  const unit2D = "cm2"

  const height = cont("výška CB", 8, entity, unit);
  const abd = triangleArea({
    size: cont("základna AB", 6, entity, unit),
    height,
    triangle: {
      agent: "trojúhelník ABD",
      unit: unit2D
    }
  });
  return {
    obsahABD: {
      deductionTree: abd
    },
    obsahABCD: {
      deductionTree: deduce(
        last(abd),
        triangleArea({
          size: cont("základna CD", 10, entity, unit),
          height,
          triangle: {
            agent: "trojúhelník BCD",
            unit: unit2D
          }
        }),
        sum("obsah ABCD", [], { entity, unit: unit2D }, { entity, unit })
      )
    }
  }
}
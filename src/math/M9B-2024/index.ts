import { commonSense, comp, compAngle, compPercent, compRatio, cont, ctor, ctorComplement, ctorDifference, ctorPercent, ctorRatios, ctorUnit, nthPart, pi, product, pythagoras, rate, ratio, ratios, sum } from "../../components/math";
import { deduce, last, to } from "../../utils/deduce-utils";
import { triangleArea } from "../shapes/triangle";
export default {
  1: delkaKroku(),
  2: AdamAOta(),
  6.1: ctyruhelnik(),
}
function delkaKroku() {
  const entityBase = "krok";
  const entity = "délka";
  const unit = "cm";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          rate("Josef", 75, { entity, unit }, entityBase),
          cont("Josef", 10_000, entityBase)
        ),
        deduce(
          rate("Naďa", 60, { entity, unit }, entityBase),
          cont("Naďa", 10_000, entityBase)
        ),
      ),
      ctorUnit("km")
    )
  }
}

function AdamAOta() {
  const entity = "délka";
  const unit = "m";
  const adam1 = cont("Adam 1.část", 40, entity, unit);
  const adam2 = cont("Adam 2.část", 30, entity, unit);

  return {
    deductionTree: deduce(
      deduce(
        adam1,
        adam2,
        sum("Adam", [], { entity, unit }, { entity, unit })
      ),
      deduce(
        adam1,
        adam2,
        pythagoras("Ota", ["Adam 1.část", "Adam 2.část"])
      ),
      ctorPercent()
    )
  }
}

function ctyruhelnik() {
  const entity = "délka";
  const unit = "cm";
  const entity2d = "krychliček";
  const unit2d = "cm2";
  const AD = cont("AD", 17, entity, unit);
  const BD = cont("BD", 8, entity, unit);

  return {
    deductionTree: deduce(
      triangleArea({
        size: deduce(
          AD,
          BD,
          pythagoras("AD", ["BD", "AB"])
        ),
        height: BD,
        triangle: {
          agent: 'ABD'
        }
      }),
      deduce(
        deduce(
          cont("trojúhelník BCD", 24, entity2d, unit2d),
          cont("2", 2, ""),
          product("obdelník", [], { entity: entity2d, unit: unit2d }, { entity: entity2d, unit: unit2d })
        ),
        cont("DC", 8, entity2d, unit2d),
        ctor("quota")
      ),
      sum("celkem", [], { entity: entity2d, unit: unit2d }, { entity: entity2d, unit: unit2d })
    )
  }
}


function sud() {
  const entity = "litr";
  return {
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

function rezaniKvadru() {
  const entity = "krychle"
  return {
    deductionTree: deduce(
      deduce(
        cont("kvádr", 200, entity),
        rate("kvádr", 8, { entity: "objem", unit: "dm3" }, entity)
      ),
      ctorUnit("cm3")
    )
  }
}

function vyrobenoVyrobku() {
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

function dovolenaNaKole() {
  const entity = "vzdálenost";
  const unit = "km"
  return {
    deductionTree: deduce(
      cont("Roman", 400, entity, unit),
      compRatio("Roman", "Jana", 5 / 4)
    ),
  }
}

// function propousteniVeFirme() {
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

function propousteniVeFirme() {
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

function povrchValce() {
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
    deductionTree: deduce(
      podstava,
      last(podstava),
      deduce(last(podstava), compRatio("plášť", "podstava", 3)),
      sum("válec", ["dolní podstava", "horní podstava", "plášť"], entity2d, entity2d)
    )
  }
}

export const krouzkyATridy = () => {
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
      deductionTree: deduce(
        hudebni8,
        hudebni9,
        ctorPercent()
      )
    },
    pocet: {
      deductionTree: deduce(
        deduce(
          comp(hudebniLabel, sachovyLabel, -6, entity),
          comp(hudebniLabel, sachovyLabel, -2, entityBase)),
        sachovy9
      )
    },
    pomer: {
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

function pozemekObdelnik() {
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
      deductionTree: stranaCtverce,
    },
    obsah: {
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


export const angleBeta = () => {
  const entity = "stupňů";
  const alfaEntity = "alfa";

  const triangleSumLabel = 'součet úhlů v trojúhelníku';
  const triangleSum = cont(triangleSumLabel, 180, entity)
  const triangle = "úhel trojúhelníku ABC";

  const alfaA = cont(`vnitřní ${triangle} u vrcholu A`, 4, alfaEntity);
  return {
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


function rovinataOblast() {
  const entity = "délka"
  const plan = "plán";
  const skutecnost = "skutečnost"

  const meritko = deduce(
    cont(plan, 3.5, entity, "cm"),
    deduce(
      cont(skutecnost, 700, entity, "m"),
      ctorUnit("cm")
    ),
    ctorRatios("mapa")
  );

  const vychazkovaTrasa = cont("vycházková trasa", 6, entity, "km");
  return {
    skutecnost: {
      deductionTree: deduce(
        deduce(
          meritko,
          deduce(
            cont(plan, 49, entity, "mm"),
            ctorUnit("cm")
          ),
          nthPart(skutecnost)
        ),
        ctorUnit("km"),
      )
    },
    vychazkovaTrasa: {
      deductionTree: deduce(
        deduce(
          deduce(
            vychazkovaTrasa,
            deduce(
              vychazkovaTrasa,
              compRatio("vycházková trasa", "přímá trasa", 3),
            ),
            ctorDifference(skutecnost)
          ),
          ctorUnit("cm")
        ),
        last(meritko),
        nthPart(plan)
      )
    },
    meritko: {
      deductionTree: deduce(
        last(meritko),
        cont(plan, 3.5, entity, "cm"),
        ctor('simplify')
      )
    }
  }
}

function lomanaCaraACFHA() {
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

function triangleExample() {
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
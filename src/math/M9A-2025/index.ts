import { commonSense, compRatio, compRelative, cont, ctor, ctorDifference, ctorRatios, ctorUnit, nthPart, primeFactorization, quota, rate, ratio, ratios, ctorPercent, percent, compAngle, ctorLinearEquation, ctorOption, sum, product, productCombine, counter, triangleAngle } from "../../components/math";
import { createLazyMap, deduce, last, to, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
  //1:() => porovnani(),
  5.1: () => pozemek().sirkaDum,
  5.2: () => pozemek().rozlohaVolnyPozemek,
  6.1: () => sud().vzestupObjem,
  6.2: () => sud().vzestupVyska,
  7.1: () => uhly().alfa,
  7.2: () => uhly().beta,
  7.3: () => uhly().gamma,
  8.1: () => zahon().obvod,
  8.2: () => zahon().rozdilPocetRostlin,
  8.3: () => zahon().nejmensiPocetCerveneKvetoucich,
  12: () => bazen(),
  13: () => pelhrimov(),
  14: () => znamkyPrumer(),
  15.1: () => organizatoriPercent(),
  15.2: () => soutez(),
  15.3: () => atletika(),
  //16.1:() =>  obrazce().pocetTmavyObrazec,
})

function porovnani() {
  const entity = "";
  const zadaneCislo1 = cont("zadané číslo", 16, entity);
  const zadaneCislo2 = cont("zadané číslo", 4, entity);

  return {
    deductionTree: deduce(
      deduce(
        zadaneCislo1,
        zadaneCislo2,
        sum("součet")
      ),
      deduce(
        zadaneCislo1,
        zadaneCislo2,
        product("součin")
      ),
      ctor('comp-ratio')
    )
  }
}

function pozemek() {
  const entity2d = "obsah"
  const entity = "délka"
  const unit = "m";
  const unit2d = "m2"


  const pozemek = cont("c", 30, entity, unit);
  const obsahPozemek = deduce(
    pozemek,
    pozemek,
    productCombine("pozemek", { entity: entity2d, unit: unit2d })
  )
  const obsahDum = deduce(
    obsahPozemek,
    compRatio("dům", "pozemek", 1 / 5)
  )
  return {
    sirkaDum: {
      deductionTree: deduce(
        obsahDum,
        deduce(
          compRatio("a", "c", 1 / 2),
          pozemek,
        ),
        ctor("quota")
      )
    },
    rozlohaVolnyPozemek: {
      deductionTree: deduce(
        last(obsahPozemek),
        deduce(
          last(obsahDum),
          deduce(
            percent("pozemek", "rybník", 18),
            last(obsahPozemek)
          ),
          sum("dum a rybnik")
        ),
        ctorDifference("volný pozemkek")
      )
    }
  }
}


function sud() {
  const entity2d = "obsah"
  const entity3d = "objem"
  const entity = "výška"
  const unit = "cm";
  const unit2d = "cm2"
  const unit3d = "cm3"

  const dnoSudu = cont("dno sudu", 1500, entity2d, unit2d);
  const vzestupHladiny = deduce(
    deduce(cont("přibylo vody", 3, entity3d, "l"), ctorUnit(unit3d)),
    dnoSudu,
    ctor("quota")
  )
  return {
    vzestupObjem: {
      deductionTree: deduce(
        deduce(
          dnoSudu,
          deduce(cont("vzestup hladiny", 10, entity, "mm"), ctorUnit("cm")),
          productCombine("přibylo vody", { entity: entity3d, unit: unit3d })
        ),
        ctorUnit("l")
      )
    },
    vzestupVyska: {
      deductionTree: deduce(
        toCont(
          vzestupHladiny,
          { agent: "vzestup hladiny", entity: { entity, unit } }),
        ctorUnit("mm"))
    }
  }
}

function uhly() {
  const entity = "úhel"
  const unit = "stupňů"
  const angleLabel = "zadaná hodnota"
  const angle1 = cont(angleLabel, 30, entity, unit)
  const angle2 = cont(angleLabel, 130, entity, unit)
  return {
    alfa: {
      deductionTree: deduce(
        angle1,
        compAngle(angleLabel, "alfa", "alternate-interior")
      )
    },
    beta: {
      deductionTree: deduce(
        deduce(angle2, compAngle(angleLabel, "vedlejší", "supplementary")),
        compAngle("vedlejší", "beta", "corresponding")
      )
    },
    gamma: {
      deductionTree: deduce(
        deduce(
          deduce(angle2, compAngle(angleLabel, "bod R v pravoúhlém trojúhelníku", "supplementary")),
          cont("pravý úhel", 90, entity, unit),
          triangleAngle("vrchol v pravoúhlém trojúhelníku")
        ),
        compAngle("vrchol v pravoúhlém trojúhelníku", "gamma", "supplementary")
      )
    }
  }
}

function zahon() {
  const entity1d = "délka";
  const unit1d = "cm";

  const entity = "počet";
  const pocetRostlinQuantity = 65;
  const pocetRostlin = cont("rostliny", pocetRostlinQuantity, entity);
  const rozestup = rate("rostliny", 40, { entity: entity1d, unit: unit1d }, entity);


  const obvod = deduce(
    pocetRostlin,
    rozestup
  )

  const kratsiStranaLabel = "kratší strana"
  const delsiStranaLabel = "delší strana"
  const delsiStrana = deduce(
    ratios("rostliny", [kratsiStranaLabel, kratsiStranaLabel, kratsiStranaLabel, delsiStranaLabel], [3 / 4, 3 / 4, 3 / 4, 1]),
    obvod,
  );
  return {

    obvod: {
      deductionTree: deduce(obvod, ctorUnit("m"))
    },
    rozdilPocetRostlin: {
      deductionTree: deduce(
        deduce(
          delsiStrana,
          rozestup
        ),
        deduce(
          deduce(
            compRelative(kratsiStranaLabel, delsiStranaLabel, -1 / 4),
            last(delsiStrana),
          ),
          rozestup
        )
      )
    },
    nejmensiPocetCerveneKvetoucich: {
      deductionTree: deduce(
        deduce(
          deduce(
            to(
              pocetRostlin,
              commonSense(`rozklad na prvočísla:${primeFactorization([pocetRostlinQuantity]).join(",")}`),
              commonSense(`kombinace 5x13 nebo 13x5, vybereme větší počet opakování, aby jsme docílili menšího počtu červených růží`),
              quota("rostliny", "skupina dohromady bílé a červené rostliny", 13)
            ),
            pocetRostlin,

          ),
          cont("bílých rostlin", 2, entity),
          ctorDifference("červených rostlin")
        ),
        counter("počet opakování", 13),
        product("červených rostlin")
      )
    }
  }
}

function bazen() {
  const entity = ""
  const unit = "m"
  const entity3d = "objem";
  const unit3d = "m3";

  const agentLabel = "bazén";
  const dnoLabel = "šikmé dno";
  const zonaLabel = "prohloubení zóna pro plavce"
  const delka = cont(agentLabel, 40, "délka", unit)
  const sirka = cont(agentLabel, 10, "šírka", unit)
  const vyska = cont(agentLabel, 1, "výška", unit)
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          delka,
          sirka,
          vyska,
          productCombine(agentLabel, { entity: entity3d, unit: unit3d })
        ),
        deduce(
          deduce(
            cont(zonaLabel, 20, "délka", unit),
            cont(zonaLabel, 1, "výška", unit),
            sirka,
            productCombine(zonaLabel, { entity: entity3d, unit: unit3d })
          ),
          ratio(zonaLabel, dnoLabel, 1 / 2)
        ),
        sum("bazén celkem")
      ),
      ctorOption("A", 500)
    )
  }
}

function pelhrimov() {
  const entity = "osob";
  const entityBase = "termín";
  const prihlasek = cont("tábor přihlášeno", 375, entity);
  const pocet = cont("tábor nabízeno", 2, entityBase)
  return {
    deductionTree: deduce(
      deduce(
        prihlasek,
        deduce(
          deduce(deduce(
            deduce(
              ratio("tábor nabízeno", "přihlášeno 1. termín", 6 / 5),
              percent("tábor nabízeno", "přihlášeno 2. termín", 130),
              sum("tábor přihlášeno")
            ),
            prihlasek
          ),
            cont("tábor nabízeno", 1, entityBase),
            ctor('rate')
          ),
          pocet
        ),
        ctorDifference("odmítnuto")
      ),
      ctorOption("B", 75)
    )
  }
}


function organizatoriPercent() {
  const entity = "osoby";
  const entityBase = "družstvo"
  const celkem = cont("nastoupilo", 200, entity);
  return {
    deductionTree: deduce(
      deduce(
        toCont(deduce(
          celkem,
          deduce(
            cont("hráči", 10, entityBase),
            rate("hráči", 11, entity, entityBase),
          ),
          ctorDifference("organizátoři")
        ), { agent: 'organizátoři' }),
        celkem,
        ctorPercent(),
      ),
      ctorOption("B", 45, { asPercent: true })
    )
  }
}
function znamkyPrumer() {
  const entity = "hodnota";
  const entityPocet = "známka";
  const pocetJednicek = cont("jedničky", "x", entityPocet);
  const pocetDvojek = cont("dvojky", "x", entityPocet);

  const pocetCelkem = cont("celkem", 20, entityPocet);
  const pocetTrojek = deduce(
    pocetCelkem,
    deduce(
      pocetJednicek,
      pocetDvojek,
      sum("celkem")
    ),
    ctorDifference("")
  )

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            pocetJednicek,
            deduce(pocetDvojek, cont("dvojka", 2, entity), product("dvojka")),
            deduce(pocetTrojek, cont("trojka", 3, entity), product("trojka")),
            sum("celkem", { entity })
          ),
          pocetCelkem,
          ctor("rate")
        ),
        rate("aritmetický průměr", 1.8, entity, entityPocet),
        ctorLinearEquation("jednička", { entity: entityPocet }, "x")
      ),
      ctorOption("D", 8)
    )
  }
}
function soutez() {
  const entity = "osoby";
  const entityBase = "družstvo"

  const druzstva = cont("celkem", 20, entityBase);

  const viceMuzuLabel = 'družstvo s jednou ženou';
  const viceZenLabel = 'družstvo s jedním mužem';
  const women = "žena";

  const ratiosDruzstva = deduce(
    compRatio(viceZenLabel, viceMuzuLabel, 4),
    ctorRatios("celkem")
  );


  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            ratiosDruzstva,
            druzstva,
            nthPart(viceMuzuLabel),
          ),
          deduce(
            deduce(
              last(ratiosDruzstva),
              druzstva,
              nthPart(viceZenLabel),
            ),
            rate(viceZenLabel, 2, entity, entityBase)),
          sum(women, { entity })
        ),
        deduce(druzstva, rate("celkem", 3, entity, entityBase)),
        ctorPercent()
      ),
      ctorOption("E", 60, { asPercent: true })
    )
  }
}

function atletika() {
  const entity = "atlet";
  const ostep = cont("oštěp", 12, entity);
  const skok = deduce(
    ostep,
    compRelative("skok", "oštěp", 1 / 2)
  );
  const beh = deduce(skok,
    compRelative("skok", "běh", -2 / 5)
  )
  return {
    deductionTree: deduce(
      deduce(
        beh,
        deduce(
          ostep,
          last(skok),
          last(beh),
          sum("celkem")
        ),
        ctorPercent()
      ),
      ctorOption("C", 50, { asPercent: true })
    )
  }
}


function obrazce() {
  const entity = "délka"
  const entityPocet = "obdelníků"
  const unit = "cm";
  const tmavyObrazec1 = cont("obrazec č.1", 5, entity, unit)
  const tmavyObrazec2 = cont("obrazec č.1", 8, entity, unit)
  const tmavyObrazec3 = cont("obrazec č.1", 11, entity, unit)
  return {
    pocetTmavyObrazec: {
      deductionTree: deduce(
        cont("obrazec č.1", 2, entityPocet),
        deduce(
          toCont(deduce(
            cont("hledaný obrazec", 20, entity, unit),
            cont("obrazec č.1", 5, entity, unit),
            ctorDifference("přechody"),
          ), { agent: "přechody" }),
          to(deduce(
            tmavyObrazec1,
            tmavyObrazec2,
            tmavyObrazec3,
            ctor("sequence")
          ), rate("přechody", 3, { entity, unit }, "obrazec")),
          ctor("quota")
        ),

        sum("obrazec č.6")
      )
    }

  }
}

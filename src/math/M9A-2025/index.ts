import { commonSense, compRatio, compRelative, cont, ctor, ctorDifference, ctorRatios, ctorUnit, nthPart, quota, rate, ratio, ratios, ctorPercent, percent, compAngle, ctorLinearEquation, ctorOption, sum, product, counter, triangleAngle, contLength, dimensionEntity, contArea, primeFactors, squareArea, baseAreaVolume, cuboidVolume, formulaRegistry, evalExprAsCont, evalFormulaAsCont, contAngle, contRightAngle } from "../../components/math";
import { anglesNames, createLazyMap, deduce, deduceAs, last, to } from "../../utils/deduce-utils";

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


  const pozemek = contLength("c", 30, "m");
  const obsahPozemek = deduce(
    pozemek,
    squareArea("pozemek", "m2")
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
  const dim = dimensionEntity();

  const dnoSudu = contArea("dno sudu", 1500);
  const vzestupHladiny = deduce(
    deduce(cont("přibylo vody", 3, dim.volume.entity, "l"), ctorUnit(dim.volume.unit)),
    dnoSudu,
    evalFormulaAsCont(formulaRegistry.volume.baseArea, x => x.h, "vzestup hladiny", dim.length)
  )
  return {
    vzestupObjem: {
      deductionTree: deduce(
        deduce(
          dnoSudu,
          deduce(cont("vzestup hladiny", 10, dim.length.entity, "mm"), ctorUnit("cm")),
          baseAreaVolume("přibylo vody")
        ),
        ctorUnit("l")
      )
    },
    vzestupVyska: {
      deductionTree: deduce(
        vzestupHladiny,
        ctorUnit("mm"))
    }
  }
}

export function uhly() {
  const angleLabel = "zadaný"
  const angle1 = contAngle(angleLabel, 30)
  const angle2 = contAngle(angleLabel, 130)
  return {
    alfa: {
      deductionTree: deduce(
        angle1,
        compAngle(angleLabel, anglesNames.alpha, "alternate-interior")
      )
    },
    beta: {
      deductionTree: deduce(
        deduce(angle2, compAngle(angleLabel, "vedle k zadanému", "supplementary")),
        compAngle("vedle k zadanému", anglesNames.beta, "corresponding")
      )
    },
    gamma: {
      deductionTree: deduceAs("pravoúhlý trojúhelník, vytvořený mezi přímkami r,t,q, kde r a t jsou kolmé")(
        deduce(
          deduce(angle2, compAngle(angleLabel, "bod R", "supplementary")),
          contRightAngle(),
          triangleAngle("zbývající vrchol")
        ),
        compAngle("zbývající vrchol", anglesNames.gamma, "supplementary")
      )
    }
  }
}

function zahon() {
  const dim = dimensionEntity();

  const entity = "počet";
  const pocetRostlinQuantity = 65;
  const pocetRostlin = cont("rostliny", pocetRostlinQuantity, entity);
  const rozestup = rate("rostliny", 40, dim.length, entity);


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
              primeFactors([pocetRostlinQuantity]),
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
  const unit = "m"
  const agentLabel = "bazén";
  const dnoLabel = "šikmé dno";
  const zonaLabel = "prohloubení zóna pro plavce"
  const delka = contLength(agentLabel, 40, unit)
  const sirka = cont(agentLabel, 10, unit)
  const vyska = cont(agentLabel, 1, unit)
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          delka,
          sirka,
          vyska,
          cuboidVolume(agentLabel, "m3")
        ),
        deduce(
          deduce(
            cont(zonaLabel, 20, "délka", unit),
            cont(zonaLabel, 1, "výška", unit),
            sirka,
            cuboidVolume(zonaLabel, "m3")
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


export function organizatoriPercent() {
  const entity = "osoby";
  const entityBase = "družstvo"
  const celkem = cont("nastoupilo", 200, entity);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          celkem,
          deduce(
            cont("hráči", 10, entityBase),
            rate("hráči", 11, entity, entityBase),
          ),
          ctorDifference("organizátoři")
        ),
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

  const dim = dimensionEntity()

  const entityPocet = "obdelníků"

  const tmavyObrazec1 = contLength("obrazec č.1", 5)
  const tmavyObrazec2 = contLength("obrazec č.1", 8)
  const tmavyObrazec3 = contLength("obrazec č.1", 11)
  return {
    pocetTmavyObrazec: {
      deductionTree: deduce(
        cont("obrazec č.1", 2, entityPocet),
        deduce(
          deduce(
            contLength("hledaný obrazec", 20),
            contLength("obrazec č.1", 5),
            ctorDifference("přechody"),
          ),
          to(deduce(
            tmavyObrazec1,
            tmavyObrazec2,
            tmavyObrazec3,
            ctor("sequence")
          ), rate("přechody", 3, dim.length, "obrazec")),
          ctor("quota")
        ),

        sum("obrazec č.6")
      )
    }

  }
}

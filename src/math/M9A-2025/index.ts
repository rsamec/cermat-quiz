import { commonSense, compRatio, compRelative, cont, ctor, ctorDifference, ctorRatios, ctorUnit, nthPart, primeFactorization, product, quota, rate, ratio, ratios, sum, ctorPercent, percent, compAngle } from "../../components/math";
import { deduce, last, to, toCont } from "../../utils/deduce-utils";

export default {
  //1: porovnani(),
  5.1: pozemek().sirkaDum,
  5.2: pozemek().rozlohaVolnyPozemek,
  6.1: sud().vzestupObjem,
  6.2: sud().vzestupVyska,
  7.1: uhly().alfa,
  7.2: uhly().beta,
  7.3: uhly().gamma,
  8.1: zahon().obvod,
  8.2: zahon().rozdilPocetRostlin,
  8.3: zahon().nejmensiPocetCerveneKvetoucich,
  12: bazen(),
  13: pelhrimov(),
  15.1: organizatoriPercent(),
  15.2: soutez(),
  15.3: atletika(),
  //16.1: obrazce().pocetTmavyObrazec,
}

function porovnani() {
  const entity = "";
  const zadaneCislo1 = cont("zadané číslo", 16, entity);
  const zadaneCislo2 = cont("zadané číslo", 4, entity);

  return {
    deductionTree: deduce(
      deduce(
        zadaneCislo1,
        zadaneCislo2,
        sum("součet", [], entity, entity)
      ),
      deduce(
        zadaneCislo1,
        zadaneCislo2,
        product("součin", [], entity, entity)
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
    product("pozemek", [], { entity: entity2d, unit: unit2d }, { entity, unit })
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
          sum("dum a rybnik", [], { entity: entity2d, unit: unit2d }, { entity: entity2d, unit: unit2d })
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
          product("přibylo vody", [], { entity: entity3d, unit: unit3d }, { entity: entity2d, unit: unit2d })
        ),
        ctorUnit("l")
      )
    },
    vzestupVyska: {
      deductionTree: deduce(
        to(
          vzestupHladiny,
          cont("vzestup hladiny", last(vzestupHladiny).quantity, entity, unit),
        ),
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
          cont('součet úhlů v trojúhelníku', 180, entity, unit),
          deduce(
            deduce(angle2, compAngle(angleLabel, "bod R v pravoúhlém trojúhelníku", "supplementary")),
            cont("pravý úhel", 90, entity, unit),
            sum("součet dvou úhlů", [], { entity, unit }, { entity, unit })
          ),
          ctorDifference("vrchol v pravoúhlém trojúhelníku")
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
  const pocetRostlin = cont("rostliny", 65, entity);
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
              commonSense(`rozklad na prvočísla:${primeFactorization([pocetRostlin.quantity]).join(",")}`),
              commonSense(`kombinace 5x13 nebo 13x5, vybereme větší počet opakování, aby jsme docílili menšího počtu červených růží`),
              quota("rostliny", "skupina dohromady bílé a červené rostliny", 13)
            ),
            pocetRostlin,

          ),
          cont("bílých rostlin", 2, entity),
          ctorDifference("červených rostlin")
        ),
        cont("počet opakování", 13, ""),
        product("červených rostlin", [], entity, entity)
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
        delka,
        sirka,
        vyska,
        product(agentLabel, [], { entity: entity3d, unit: unit3d }, { entity, unit })
      ),
      deduce(
        deduce(
          cont(zonaLabel, 20, "délka", unit),
          cont(zonaLabel, 1, "výška", unit),
          sirka,
          product(zonaLabel, [], { entity: entity3d, unit: unit3d }, { entity, unit })
        ),
        ratio(zonaLabel, dnoLabel, 1 / 2)
      ),
      sum("bazén celkem", [], { entity: entity3d, unit: unit3d }, { entity: entity3d, unit: unit3d })
    )
  }
}


function pelhrimov() {
  const entity = "osob";
  const entityBase = "termín";
  const prihlasek = cont("tábor přihlášeno", 375, entity);
  return {
    deductionTree: deduce(
      prihlasek,
      deduce(
        to(
          deduce(
            to(
              commonSense(""),
              ratio("nabízeno 1. termín", "přihlášeno 1. termín", 6 / 5),
              percent("nabízeno 2. termín", "přihlášeno 2. termín", 130),
              commonSense("6/5 + (130/100) = 5/2"),
              ratio("nabízeno per termín", "tábor přihlášeno", 6 / 5 + 13 / 10),
            ),
            prihlasek
          ),
          rate("tábor nabízeno", 150, entity, entityBase)
        ),
        cont("tábor nabízeno", 2, entityBase)
      )
    )
  }
}


function organizatoriPercent() {
  const entity = "osoby";
  const entityBase = "družstvo"
  const celkem = cont("nastoupilo", 200, entity);
  return {
    deductionTree: deduce(
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
        sum(women, [], entity, entity)
      ),
      deduce(druzstva, rate("celkem", 3, entity, entityBase)),
      ctorPercent()
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
      beh,
      deduce(
        ostep,
        last(skok),
        last(beh),
        sum("celkem", [], entity, entity)
      ),
      ctorPercent()
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

        sum("obrazec č.6", [], entityPocet, entityPocet)
      )
    }

  }
}

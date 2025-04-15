import { commonSense, compRatio, compRelative, cont, ctor, ctorDifference, ctorRatios, ctorUnit, nthPart, primeFactorization, product, quota, rate, ratio, ratios, sum, ctorPercent, percent, compAngle, ctorComplement, ctorComparePercent, compPercent, compRelativePercent, compDiff, pythagoras } from "../../components/math";
import { deduce, last, to, toCont } from "../../utils/deduce-utils";
import { triangleArea } from "../shapes/triangle";

export default {
  1: porovnani(),
  7.1: salaty().druhyDenTrzba,
  7.2: salaty().pocetSalatu,
  8.1: pravouhlyLichobeznik().obsah,
  8.2: pravouhlyLichobeznik().obvod,
  8.3: pravouhlyLichobeznik().obvodRovnobeznik,
  11.1: zahrada().jabloneVsMagnolie,
  11.2: zahrada().levanduleABazalkaVsHortenzie,
  11.3: zahrada().ruzePlocha,
  12: uhelAlfa(),
  14: dort(),
  15.1: tabor().percentPerVedouci,
  15.2: tabor().mladsiPercent,
}

function porovnani() {
  const entity = "kusy";
  const vstupenkaDestskaLabel = "vstupenka dětská"
  const vstupenkaDospelyLabel = "vstupenka dospělý"
  const porovnat = compRatio(vstupenkaDestskaLabel, vstupenkaDospelyLabel, 2 / 5);
  const celkem = cont("celkem", 330, "Kč");

  return {
    deductionTree: deduce(
      to(
        porovnat,
        commonSense(""),
        cont("vstupenka dětská", 3, entity),
        ratios("celkem", [vstupenkaDestskaLabel, vstupenkaDestskaLabel, vstupenkaDestskaLabel, vstupenkaDospelyLabel], [2 / 5, 2 / 5, 2 / 5, 1])
      ),
      celkem,
      nthPart(vstupenkaDestskaLabel)
    )
  }
}
function salaty() {
  const entity = "salát";
  const den1Ratio = ratio("celkem", "prodáno 1.den", 1 / 3);
  const den2vsDen1 = compRelative("prodáno 2.den", "prodáno 1.den", -1 / 3);

  const celkem = cont("celkem", 5400, "Kč");

  const den2 = deduce(
    den1Ratio,
    den2vsDen1
  );

  const den2Trzba = deduce(
    den2,
    celkem
  );
  return {
    druhyDenTrzba:
    {
      deductionTree: den2Trzba
    },
    pocetSalatu:
    {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              deduce(
                den1Ratio,
                last(den2),
                sum("prodano za dva dny", [], "", "")
              ),
              ctorComplement("prodáno 3.den")
            ),
            celkem),
          cont("prodáno 3.den", 120, "salát"),
          ctor('rate')
        ),
        celkem
      )

    }
  }
}

function dort() {
  const entity = "poloměr"
  const unit = "cm"
  const entity2d = "obsah"
  const unit2d = "cm2"


  const vetsiKorpus = cont("větší korpus", 8, entity, unit)
  const mensiKorpus = deduce(
    vetsiKorpus,
    compRelative("menší korpus", "větší korpus", -1 / 4)
  );

  const height = cont("korpus", 5, entity, unit);

  return {
    deductionTree: deduce(
      deduce(
        vetsiKorpus,
        vetsiKorpus,
        height,
        product("větší korpus", [], { entity: entity2d, unit: unit2d }, { entity, unit })
      ),
      deduce(
        mensiKorpus,
        last(mensiKorpus),
        height,
        product("menší korpus", [], { entity: entity2d, unit: unit2d }, { entity, unit })
      ),
      sum("celkem", [], { entity: entity2d, unit: unit2d }, { entity: entity2d, unit: unit2d })
    )
  }
}


function uhelAlfa() {
  const entity = "úhel"
  const unit = "stupňů"
  const triangleSumLabel = 'součet úhlů v trojúhelníku'

  const soucetUhluVTrojuhelniku = cont(triangleSumLabel, 180, entity, unit)
  const praveRameho = deduce(
    ratios(triangleSumLabel, ["vrcholový úhel", "levé rameno", "pravé rameno"], [40, 70, 70]),
    soucetUhluVTrojuhelniku,
  );

  return {
    deductionTree: deduce(
      deduce(
        soucetUhluVTrojuhelniku,
        deduce(
          deduce(
            deduce(
              praveRameho,
              compAngle("pravé rameno", "úhel přímka p", "corresponding")
            ),
            compAngle("úhel přímka p", "trojúhelník bod A", "alternate-exterior")
          ),
          last(praveRameho),
          sum("dvojice součet", ["trojúhelník bod A", "trohúhelník bod B"], { entity, unit }, { entity, unit }),
        ),
        ctorDifference("trojúhelník bod C")
      ),
      compAngle("trojúhelník bod C", "alfa", "supplementary")
    )
  }
}
function pravouhlyLichobeznik() {
  const entity = "délka"
  const unit = "cm"
  const entity2d = "obsah";
  const unit2d = "cm2";

  const agentLabel = "lichoběžník";
  const spodniZakladna = cont("spodní základna", 140, entity, unit);
  const horniZakladna = cont("horní základna", 100, entity, unit);

  const height = cont(`${agentLabel} výška`, 30, entity, unit)
  const prepona = deduce(
    deduce(
      spodniZakladna,
      horniZakladna,
      ctorDifference("základna")
    ),
    height,
    pythagoras("přepona", ["výška", "základna"])
  )
  const obvod = deduce(
    prepona,
    horniZakladna,
    spodniZakladna,
    height,
    sum(`${agentLabel} obvod`, [], { entity, unit }, { entity, unit })
  )

  return {
    obsah: {
      deductionTree: deduce(
        triangleArea({
          size: spodniZakladna, height, triangle: {
            agent: agentLabel
          }
        }),
        triangleArea({
          size: horniZakladna, height, triangle: {
            agent: agentLabel
          }
        }),
        sum(agentLabel, [], { entity: entity2d, unit: unit2d }, { entity: entity2d, unit: unit2d })
      )
    },
    obvod: {
      deductionTree: obvod
    },
    obvodRovnobeznik: {
      deductionTree: deduce(
        deduce(
          last(obvod),
          ratios(`${agentLabel} obvod`, ["menší lichoběžník", "rovnoběžník"], [1, 1])
        ),
        prepona,
        sum("rovnoběžník obvod", [], { entity, unit }, { entity, unit })
      )
    }

  }
}


function zahrada() {
  const magnolieL = "magnolie";
  const jablonL = "jabloň"
  const ruzeL = "růže"
  const hortenzieL = "hortenzie"
  const levanduleL = "levandule"
  const bazalkaL = "bazalka"

  const entity = "stupeň";
  const entity2d = "obsah";
  const magnoliePlocha = cont(magnolieL, 20, entity2d);

  const jablon = cont(jablonL, 105, entity);
  const magnolie = cont(magnolieL, 60, entity);
  const hortenzie = cont(hortenzieL, 30, entity);
  const levandule = cont(levanduleL, 60, entity);
  const bazalka = cont(bazalkaL, 15, entity);

  const celkem = cont("celkem", 360, entity)

  const ruze = deduce(
    celkem,
    deduce(
      jablon,
      magnolie,
      hortenzie,
      levandule,
      bazalka,
      sum("celkem", [], entity, entity)
    ),
    ctorDifference(ruzeL)
  )

  const plochaCelkem = deduce(
    deduce(
      magnolie,
      celkem,
      ctor('ratio')
    ),
    magnoliePlocha

  )

  return {
    jabloneVsMagnolie: {
      deductionTree: deduce(
        deduce(
          deduce(
            jablon,
            celkem,
            ctor('ratio')
          ),
          plochaCelkem,
        ),
        magnoliePlocha
      )
    },
    levanduleABazalkaVsHortenzie: {
      deductionTree: deduce(
        deduce(
          levandule,
          bazalka,
          sum("dohromady", [], entity, entity)
        ),
        hortenzie,
        ctor('comp-ratio')
      )
    },
    ruzePlocha: {
      deductionTree: deduce(
        deduce(
          ruze,
          celkem,
          ctor('ratio')
        ),
        plochaCelkem,
      )
    }

  }
}


function tabor() {
  const entity = "děti";
  const entityBase = "vedoucí"
  const deti = cont("tábor", 80, entity);
  const vedouci = cont("tábor", 5, entityBase);

  const mladsiLabel = "mladší děti"
  const starsiLabel = "starší děti"
  return {
    percentPerVedouci: {
      deductionTree: deduce(
        toCont(deduce(
          deti,
          vedouci,
          ctor('rate')
        ), { agent: "děti na starost jeden vedoucí" }),
        deti,
        ctorPercent(),
      )
    },
    mladsiPercent: {
      deductionTree: to(
        deduce(
          compRelative(mladsiLabel, starsiLabel, -1 / 3),
          ctorRatios("tábor")
        ),
        compRelativePercent(starsiLabel, mladsiLabel, 50)
      ),
    },
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


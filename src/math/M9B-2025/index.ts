import { commonSense, compRatio, compRelative, cont, ctor, ctorDifference, ctorRatios, ctorUnit, nthPart, primeFactorization, product, quota, rate, ratio, ratios, combine, ctorPercent, percent, compAngle, ctorComplement, ctorComparePercent, compPercent, compRelativePercent, compDiff, pythagoras, nthPartFactor, ctorBooleanOption, ctorOption, comp, ctorLinearEquation } from "../../components/math";
import { deduce, last, to, toCont } from "../../utils/deduce-utils";
import { triangleArea } from "../shapes/triangle";

export default {
  1: porovnani(),
  7.1: salaty().druhyDenTrzba,
  7.2: salaty().druhyDenVyrazSPromenou,
  7.3: salaty().pocetSalatu,
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
  15.3: tabor().pocetDivek,
}

function porovnani() {
  const entity = "kusy";
  const vstupenkaDestskaLabel = "vstupenka dětská"
  const vstupenkaDospelyLabel = "vstupenka dospělý"
  const porovnat = compRatio(vstupenkaDestskaLabel, vstupenkaDospelyLabel, 2 / 5);
  const celkem = cont("celkem", 330, "Kč");
  const pocetDeti = cont(vstupenkaDestskaLabel, 3, entity);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          porovnat,
          ctorRatios("celkem")
        ),
        pocetDeti,
        nthPartFactor(vstupenkaDestskaLabel)
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
    druhyDenVyrazSPromenou:{
      deductionTree: deduce(
        last(den2),
        cont("celkem","x", entity)
      )
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
                combine("prodano za dva dny", [], "", "")
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
        combine("celkem", [], { entity: entity2d, unit: unit2d }, { entity: entity2d, unit: unit2d })
      ),
      ctorOption("D", 500)
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
            combine("dvojice součet", ["trojúhelník bod A", "trohúhelník bod B"], { entity, unit }, { entity, unit }),
          ),
          ctorDifference("trojúhelník bod C")
        ),
        compAngle("trojúhelník bod C", "alfa", "supplementary")
      ),
      ctorOption("B", 140)
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
    combine(`${agentLabel} obvod`, [], { entity, unit }, { entity, unit })
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
        combine(agentLabel, [], { entity: entity2d, unit: unit2d }, { entity: entity2d, unit: unit2d })
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
        combine("rovnoběžník obvod", [], { entity, unit }, { entity, unit })
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
      combine("celkem", [], entity, entity)
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
            deduce(
              jablon,
              celkem,
              ctor('ratio')
            ),
            plochaCelkem,
          ),
          magnoliePlocha
        ),
        ctorBooleanOption(15)
      )
    },
    levanduleABazalkaVsHortenzie: {
      deductionTree: deduce(
        deduce(
          deduce(
            levandule,
            bazalka,
            combine("dohromady", [], entity, entity)
          ),
          hortenzie,
          ctor('comp-ratio')
        ),
        ctorBooleanOption(1.5)
      )
    },
    ruzePlocha: {
      deductionTree: deduce(
        deduce(
          deduce(
            ruze,
            celkem,
            ctor('ratio')
          ),
          plochaCelkem,
        ),
        ctorBooleanOption(30, "smaller")
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

  const divkyL = "všechny dívky"
  const chlapciL = "všichni chlapci"

  const divky = cont(divkyL, "x", entity)

  const chlapci = deduce(
    deti,
    divky,
    ctorDifference(chlapciL)
  );
  return {
    percentPerVedouci: {
      deductionTree: deduce(
        deduce(
          toCont(deduce(
            deti,
            vedouci,
            ctor('rate')
          ), { agent: "děti na starost jeden vedoucí" }),
          deti,
          ctorPercent(),
        ),
        ctorOption("A", 20, { asPercent: true })
      )
    },
    mladsiPercent: {
      deductionTree: deduce(
        deduce(
          compRelative(mladsiLabel, starsiLabel, -1 / 3),
          ctorComparePercent()
        ),
        ctorOption("F", 50, { asPercent: true })
      )
    },
    pocetDivek: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              deduce(
                divky,
                ratio(divkyL, "dívky na výlet", 1 / 2)
              ),
              deduce(
                chlapci,
                ratio(chlapciL, "chlapci na výlet", 1 / 4)
              ),
              ctorDifference("rozdil")
            ),
            cont("rozdil", 4, entity),
            ctorLinearEquation("počet dívek", { entity }, "x")
          ),
          deti,
          ctorPercent()
        ),
        ctorOption("D", 40, { asPercent: true })
      )
    }
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

        combine("obrazec č.6", [], entityPocet, entityPocet)
      )
    }

  }
}


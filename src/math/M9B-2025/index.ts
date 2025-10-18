import { compRatio, compRelative, cont, ctor, ctorDifference, ctorRatios, nthPart, rate, ratio, ratios, ctorPercent, compAngle, ctorComplement, pythagoras, nthPartFactor, ctorBooleanOption, ctorOption, ctorLinearEquation, sum, triangleAngle, contLength, contArea, dimensionEntity, cuboidVolume, triangleArea } from "../../components/math";
import { createLazyMap, deduce, last, to, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
  1: () => porovnani(),
  7.1: () => salaty().druhyDenTrzba,
  7.2: () => salaty().druhyDenVyrazSPromenou,
  7.3: () => salaty().pocetSalatu,
  8.1: () => pravouhlyLichobeznik().obsah,
  8.2: () => pravouhlyLichobeznik().obvod,
  8.3: () => pravouhlyLichobeznik().obvodRovnobeznik,
  11.1: () => zahrada().jabloneVsMagnolie,
  11.2: () => zahrada().levanduleABazalkaVsHortenzie,
  11.3: () => zahrada().ruzePlocha,
  12: () => uhelAlfa(),
  14: () => dort(),
  15.1: () => tabor().percentPerVedouci,
  15.2: () => tabor().mladsiPercent,
  15.3: () => tabor().pocetDivek,
})

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
    druhyDenVyrazSPromenou: {
      deductionTree: deduce(
        last(den2),
        cont("celkem", "x", entity)
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
                sum("prodano za dva dny")
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


  const vetsiKorpus = contLength("větší korpus", 8)
  const mensiKorpus = deduce(
    vetsiKorpus,
    compRelative("menší korpus", "větší korpus", -1 / 4)
  );

  const height = contLength("korpus", 5);

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          vetsiKorpus,
          vetsiKorpus,
          height,
          cuboidVolume("větší korpus")
        ),
        deduce(
          mensiKorpus,
          last(mensiKorpus),
          height,
          cuboidVolume("menší korpus")
        ),
        sum("celkem")
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
          deduce(
            deduce(
              praveRameho,
              compAngle("pravé rameno", "úhel přímka p", "corresponding")
            ),
            compAngle("úhel přímka p", "trojúhelník bod A", "alternate-exterior")
          ),
          last(praveRameho),
          triangleAngle("trojúhelník bod C")
        ),
        compAngle("trojúhelník bod C", "alfa", "supplementary")
      ),
      ctorOption("B", 140)
    )
  }
}
function pravouhlyLichobeznik() {

  const agentLabel = "lichoběžník";
  const spodniZakladna = contLength("spodní základna", 140);
  const horniZakladna = contLength("horní základna", 100);

  const height = contLength(`${agentLabel} výška`, 30)
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
    sum(`${agentLabel} obvod`)
  )

  return {
    obsah: {
      deductionTree: deduce(
        deduce(
          spodniZakladna,
          height,
          triangleArea(agentLabel)
        ),
        deduce(
          horniZakladna,
          height,
          triangleArea(agentLabel)
        ),
        sum(agentLabel)
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
        sum("rovnoběžník obvod")
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

  const magnoliePlocha = contArea(magnolieL, 20);

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
      sum("celkem")
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
            sum("dohromady")
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
          deduce(
            compRelative(mladsiLabel, starsiLabel, -1 / 3),
            ctor("invert-comp-ratio")
          ),
          ctor("convert-percent")
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

  const dim = dimensionEntity();
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
          to(
            deduce(
              tmavyObrazec1,
              tmavyObrazec2,
              tmavyObrazec3,
              ctor("sequence")
            ),
            rate("přechody", 3, dim.length, "obrazec")
          ),
          ctor("quota")
        ),
        sum("obrazec č.6")
      )
    }

  }
}


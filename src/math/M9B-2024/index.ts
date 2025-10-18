import { commonSense, compAngle, compRatio, cont, ctor, ctorComplement, ctorDifference, ctorComparePercent, ctorUnit, pythagoras, rate, ratio, sum, ctorSlide, double, ctorPercent, ctorOption, compRelative, compRelativePercent, type Container, evalExprAsCont, ctorScaleInvert, ctorBooleanOption, triangleAngle, contLength, contArea, dimensionEntity, doubleProduct, triangleArea, circleArea } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, to, toCont, toPredicate } from "../../utils/deduce-utils";

export default createLazyMap({
  1: () => delkaKroku(),
  2: () => AdamAOta(),
  6.1: () => ctyruhelnik().obsah,
  6.2: () => ctyruhelnik().obvod,
  7.1: () => modely().druhyRok,
  7.2: () => modely().tretiRok,
  8.1: () => kruhy().osmyObrazec,
  8.2: () => kruhy().tmaveKruhy,
  11: () => hracka(),
  12: () => pekar(),
  13: () => uhlyTrojuhelniku(),
  14: () => pulkruh(),
  15.1: () => graf().stejnyPocet,
  15.2: () => graf().ceskyJazyk,
  15.3: () => graf().matika,
  16.1: () => procenta().lyzarskyPobyt,
  16.2: () => procenta().cenaUcebnice,
  16.3: () => procenta().darek,
})

function delkaKroku() {
  const entityBase = "krok";
  const dim = dimensionEntity();

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          rate("Josef", 75, dim.length, entityBase),
          cont("Josef", 10_000, entityBase)
        ),
        deduce(
          rate("Naďa", 60, dim.length, entityBase),
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
        ctorSlide("Adam")
      ),
      deduce(
        adam1,
        adam2,
        pythagoras("Ota", ["Adam 1.část", "Adam 2.část"])
      ),
      ctorComparePercent()
    ),
  }
}

function ctyruhelnik() {

  const dim = dimensionEntity();
  const AD = contLength("AD", 17);
  const BD = contLength("BD", 8);

  const AB = deduce(
    AD,
    BD,
    pythagoras("AD", ["BD", "AB"])
  );
  const CD = toCont(
    deduce(
      deduce(
        contArea("trojúhelník BCD", 24),
        ...doubleProduct("obdelník")
      ),
      BD,
      ctor('quota')
    ),
    { agent: "CD", entity: dim.length }
  );
  return {
    obsah: {
      deductionTree: deduce(
        deduce(
          AB,
          BD,
          triangleArea('ABD')
        ),
        contArea("trojúhelník BCD", 24),
        sum("lichoběžníku ABCD")
      )
    },
    obvod: {
      deductionTree: deduce(
        AB,
        CD,
        deduce(last(CD), BD, pythagoras("BC", ["BD", "CD"])),
        AD,
        sum("obvod lichoběžníku ABCD")
      )
    }
  }
}

function modely() {
  const prvniRokLabel = "Petr 1. rok";
  const druhyRokLabel = "Petr 2. rok";
  const tretiRokLabel = "Petr 3. rok";
  const prvniDvaRokyLabel = "Petr dohromady za dva roky";
  const entity = "model";
  const prvniRok = cont(prvniRokLabel, "x", "model");
  const prvniDruhyComp = compRatio(druhyRokLabel, prvniRokLabel, 3 / 2);

  return {
    druhyRok: {
      deductionTree: deduce(prvniRok, prvniDruhyComp)
    },
    tretiRok: {
      deductionTree: deduce(
        deduce(
          cont("Petr celkem za 3 roky", 217, entity),
          cont(tretiRokLabel, 72, entity),
          ctorDifference(prvniDvaRokyLabel),
        ),
        prvniDruhyComp
      )
    }
  }
}

function hracka() {
  const entity = "korun"
  const hrackaPuvodniCenaLabel = "hračka původní cena";
  const hrackaPoZdrazeniLabel = "hračka cena po zdražení";
  const hracka = cont(hrackaPuvodniCenaLabel, 250, entity);


  return {
    deductionTree: deduce(
      deduce(
        deduce(
          hracka,
          compRelativePercent(hrackaPoZdrazeniLabel, hrackaPuvodniCenaLabel, 40)
        ),
        compRelativePercent("konečná cena", hrackaPoZdrazeniLabel, -40),
      ),
      ctorOption("B", 210)
    )
  }
}
function pekar() {
  const labelSmall = "malé"
  const labelBig = "velké"
  const entityBase = "koláčky";
  const entity = "korun"

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          toPredicate<Container>(deduce(
            cont(labelBig, 30, entity),
            compRelative(labelBig, labelSmall, 1 / 2),
          ), node => ({ kind: 'rate', agent: "prodáno", quantity: node.quantity, entity: { entity }, entityBase: { entity: entityBase }, baseQuantity: 1 })),
          cont("prodáno", 3_600, entity)
        ),
        deduce(
          ratio("přivezeno", "neprodáno", 1 / 10),
          ctorComplement("prodáno")
        )
      ),
      ctorOption("C", 200)
    )
  }
}
function pulkruh() {
  const dim = dimensionEntity()
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          to(
            commonSense("čtvercová síť 4x4 s čtvercem o velikostí 2 cm"),
            commonSense("vepsaný kruh ve čtvercové síti"),
            contLength("poloměr (r)", 4)
          ),
          circleArea('vepsaný kruh')
        ),
        double(),
        ctorScaleInvert("šedý půlkruh")
      ),
      ctorOption("D", 25.12)
    )
  }
}

function graf() {
  const entityGirls = "dívky"
  const entityBoys = "chlapci"
  const entity = "děti"

  const matika = "M"
  const cestina = "Čj"
  const ang = 'Aj'
  const telak = "Tv"
  const vytvarka = "Vv"

  const matikaChlapci = cont(matika, 7, entityBoys)
  const matikaDivky = cont(matika, 4, entityGirls)
  const cestinaChlapci = cont(cestina, 2, entityBoys)
  const cestinaDivky = cont(cestina, 6, entityGirls)

  const chlapci = deduce(
    matikaChlapci,
    cestinaChlapci,
    cont(ang, 5, entityBoys),
    cont(telak, 7, entityBoys),
    cont(vytvarka, 4, entityBoys),
    sum("celkem chlapci", { entity })
  )
  const divky = deduce(
    matikaDivky,
    cestinaDivky,
    cont(ang, 8, entityGirls),
    cont(telak, 5, entityGirls),
    cont(vytvarka, 2, entityGirls),
    sum("celkem dívky", { entity })
  )
  return {
    stejnyPocet: {
      deductionTree: deduce(
        deduce(
          chlapci,
          divky,
        ),
        ctorBooleanOption(0))
    },
    ceskyJazyk: {
      deductionTree: deduce(
        deduce(
          deduce(
            cestinaChlapci,
            cestinaDivky,
            sum(`celkem ${cestina}`)
          ),
          deduce(
            last(chlapci),
            last(divky),
            sum("celkem")
          ),
          ctorPercent()
        ),
        ctorBooleanOption(16, "greater", { asPercent: true })
      )
    },
    matika: {
      deductionTree: deduce(
        deduce(
          matikaChlapci,
          matikaDivky,
          ctorComparePercent()
        ),
        ctorBooleanOption(75, "closeTo", { asPercent: true })
      )
    }

  }
}
function uhlyTrojuhelniku() {
  const entity = "stupňů"
  const uhelUVrcholu = (vrchol: string, typUhel: string) => `${typUhel} úhel u vrcholu ${vrchol}`
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            cont(uhelUVrcholu("A", "známý vnější"), 105, entity),
            compAngle(uhelUVrcholu("A", "dopočtený"), uhelUVrcholu("A", "známý"), "supplementary")
          ),
          deduce(
            cont(uhelUVrcholu("C", "známý vnější"), 125, entity),
            compAngle(uhelUVrcholu("C", "dopočtený vnitřní"), uhelUVrcholu("C", "známý"), "supplementary")
          ),
          triangleAngle(uhelUVrcholu("B", "dopočtený vnitřní"))
        ),
        compAngle(uhelUVrcholu("B", "dopočtený vnitřní"), uhelUVrcholu("C", "alfa"), "complementary")
      ),
      ctorOption("D", 40)
    )
  }
}

function kruhy() {
  const entity = "bílý kruh"

  const position = "pozice"

  return {
    osmyObrazec: {
      deductionTree: deduceAs("vzor opakování, resp. počet bílých kruhů je závislý na pozici = n * n, kde n je pozice")(
        cont("8. obrazec", 8, position),
        evalExprAsCont("n * n", "8. obrazec", { entity })
      ),
    },
    tmaveKruhy: {
      deductionTree: deduceAs("počet tmavých kruhů je roven počtu bílých kruhů v předcházejícím obrazci")(
        to(
          cont("obrazec", 361, entity),
          commonSense("vzor opakování, resp. počet bílých kruhů je závislý na pozici = n * n, kde n je pozice"),
          cont("obrazec", 19, position),
        ),
        cont("následující obrazec", 1, position),
        ctorSlide("hledaný obrazec")
      )
    },
  }
}

function procenta() {
  const entity = "korun"
  const entityEUR = "euro"
  const entityPercent = "%"

  const doprava = cont("doprava", 10, entityPercent);
  const ubytko = cont("ubytování", 60, entityPercent)

  return {
    lyzarskyPobyt: {
      deductionTree: deduce(
        deduceAs("zbytek do celku")(
          cont("celek", 100, entityPercent),
          deduce(
            doprava,
            ubytko,
            sum("doprava + ubytování")
          ),
          ctorDifference("lístek")
        ),
        ctorOption("D", 30)
      )
    },
    cenaUcebnice: {
      deductionTree: deduce(
        deduce(
          cont("nově", 1_500, entity),
          cont("původně", 2_000, entity),
          ctorComparePercent()
        ),
        ctorOption("C", 25, { asPercent: true })
      )
    },
    darek: {
      deductionTree: deduce(
        deduce(
          cont("dárek", 40, entityEUR),
          cont("vyměněno", 200, entityEUR),
          ctorPercent()
        ),
        ctorOption("B", 20, { asPercent: true })
      )
    }
  }
}

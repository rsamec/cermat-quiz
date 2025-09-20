import { commonSense, comp, cont, ctor, sum, ctorComplement, ctorDifference, ctorOption, ctorUnit, percent, rate, ratio, ratios, transfer, ctorSlide, compRatio, nthPart, counter, double, product, contLength, productArea, dimensionEntity, contArea, productCombine, pattern, balancedPartition, balancedEntityPartition, ctorRatios, range } from "../../components/math"
import { createLazyMap, deduce, deduceAs, last, to, toCont, toPredicate } from "../../utils/deduce-utils"

export default createLazyMap({
  1.1: () => ceremonial().polovina,
  1.2: () => ceremonial().pocetMinut,

  3.1: () => doplneniCisel().cislo1,
  3.2: () => doplneniCisel().cislo2,
  4.1: () => asistencniPes().bara,
  4.2: () => asistencniPes().rozdilBaraACyril,
  4.3: () => asistencniPes().sum,
  5.1: () => nakupFigurek().zbytek,
  5.2: () => nakupFigurek().cenaFigurky,
  6.1: () => karticky().petr,
  7.1: () => domecek().strana,
  7.2: () => domecek().obsah,
  11: () => tornado(),
  12: () => cestaKeStudance().meritko,
  13: () => cestaKeStudance().delkaTrasa,
  14: () => schody(),
  15.1: () => jazyky().porovnaniZaku,
  15.2: () => jazyky().fracouzstina,
  15.3: () => jazyky().nemcinaVsFrancouzstina,
  16.1: () => obrazec().pozice,
  16.2: () => obrazec().pocet,
  16.3: () => obrazec().pomer,
})
function obrazec() {
  const obrazec = "obrazec"
  const entityObdelnik = "obdelník"
  const entityRady = "číslo řada"
  const nthPosition = "pozice"

  const vzorCtverce = pattern({
    nthTerm: '(n % 2)==0 ? 0: n',
    nthPosition: '',
    nthTermFormat: n => n % 2 == 0 ? "0" : [1].concat(range((n - 1) / 2, 1).map(_ => 2)).join(" + ")
  }, { entity: "čtverec" })

  const vzorObdelnik = pattern({
    nthTerm: '(n % 2)==0 ? 1/2*n: 0',
    nthPosition: '',
    nthTermFormat: n => n % 2 == 0 ? range(n / 2, 1).map(_ => 1).join(" + ") : "0"
  }, { entity: "obdelník" })

  const obdelnik50 = deduce(
    vzorObdelnik,
    cont("obrazec č. 50", 50, nthPosition)
  )
  const ctverce51 = deduce(
    vzorCtverce,
    cont("obrazec č. 51", 51, nthPosition)
  )

  const bily = balancedEntityPartition(["bílý", "šedý"], { entity: "bílý" });
  const sedy = balancedEntityPartition(["bílý", "šedý"], { entity: "šedý" });

  return {
    pozice: {
      deductionTree: deduce(
        to(
          commonSense("Obdélníky se nacházejí v sudých řadách a jejich počet odpovídá polovině čísla sudé řady."),
          commonSense("18 obdelníků (končí šedým obdelníkem) nebo 19 obdelníků (končí bílým obdelníkem)"),
          cont(obrazec, 19, entityObdelnik)
        ),
        double(),
        product("nejvýšší pořadové číslo řady")
      )
    },
    pocet: {
      deductionTree: deduce(
        deduce(
          deduce(
            vzorCtverce,
            cont("obrazec č. 29", 29, nthPosition)
          ),
          bily,
          nthPart("bílý")
        ),
        deduce(
          deduce(
            vzorObdelnik,
            cont("obrazec č. 30", 30, nthPosition)
          ),
          bily,
          nthPart("bílý")
        ),
        sum("celkem")
      )
    },
    pomer: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              obdelnik50,
              bily,
              nthPart("bílý")
            ),
            double(),
            product("obrazec č. 50")
          ),
          deduce(
            ctverce51,
            bily,
            nthPart("bílý")
          ),
          sum("celkem")
        ),
        deduce(
          deduce(
            deduce(
              last(obdelnik50),
              sedy
            ),
            double(),
            product("obrazec č. 50")
          ),
          deduce(
            last(ctverce51),
            sedy,
          ),
          sum("celkem")
        ),
        ctorRatios("pom")
      )
    }
  }
}
function ceremonial() {
  const entity = "doba"
  const unit = "minut"
  const ceremonial = "ceremoniál";
  const promitani = "promítání";
  const zacatekLabel = "zacatek"
  const konecLabel = "konec"

  const dobaCeremonial = to(
    commonSense(`${zacatekLabel} (17:45) - ${konecLabel} (19:35)`),
    cont(ceremonial, 110, entity, unit),
  )
  const dobaPrvniPulka = deduce(
    dobaCeremonial,
    ratios(ceremonial, ["1. půlka", "2. půlka"], [1, 1])
  );

  return {
    polovina: {
      deductionTree: dobaPrvniPulka,
      convertToTestedValue: (value) => {
        const totalMinutes = 45 + value.quantity;
        var hours = 17 + Math.floor(totalMinutes / 60);
        var minutes = totalMinutes % 60;
        return { hodin: hours, minut: minutes };
      }
    },
    pocetMinut: {
      deductionTree: deduce(
        last(dobaCeremonial),
        deduce(
          last(dobaPrvniPulka),
          deduce(
            last(dobaCeremonial),
            ratio(ceremonial, promitani, 1 / 5)
          ),
          ctorSlide("konec promitani")
        ),
        ctorDifference("rozdil")
      )
    }
  }
}

function doplneniCisel() {
  const entity = ""
  const boldNumberL = "číslo v silně ohraničeném kroužku"
  const numberL = "číslo v kroužku"
  const rozdilCisel = comp(boldNumberL, numberL, 80, entity)

  const rozdilCisel2 = toPredicate(
    deduce(
      counter("rozdil", 34),
      counter("rozdil", -10),
      sum("rozdíl")
    ),
    node => comp(boldNumberL, numberL, 24, entity)
  )
  return {
    cislo1: {
      deductionTree: deduce(
        deduce(
          compRatio(boldNumberL, numberL, 3),
          rozdilCisel
        ),
        rozdilCisel
      )
    },
    cislo2: {
      deductionTree: deduce(
        deduce(
          compRatio(boldNumberL, numberL, 2),
          rozdilCisel2
        ),
        last(rozdilCisel2)
      )
    }

  }
}
function nakupFigurek() {
  const entity = "cena"
  const unit = "korun"
  const entityBase = "figurka"
  const puvodniCena = rate("původní nákup", 39, { entity, unit }, { entity: entityBase })
  const obnos = toCont(deduce(
    puvodniCena,
    cont("původní nákup", 7, entityBase)
  ), { agent: "Lída obnos" })

  const zbytek = deduce(
    obnos,
    ratios("Lída obnos", ["koupeno", "zbylo"], [6, 1 / 2]),
    nthPart("zbylo")
  )


  return {
    zbytek: {
      deductionTree: zbytek
    },
    cenaFigurky: {
      deductionTree: deduce(
        last(zbytek),
        double(),
        product("figurka po zdražení")
      )
    },
  }
}

function asistencniPes() {
  const adamL = "Adam";
  const baraL = "Bára";
  const cyrilL = "Cyril";

  const entity = "korun"
  const entityArtifical = "pomyslný dílek"

  const adamToBara = comp(adamL, baraL, 300, entity)

  const baraPolovinaL = `polovina ${baraL}`;
  const cyrilPolovinaL = `polovina ${cyrilL}`;


  const baraPolovina = ratio(baraL, baraPolovinaL, 1 / 2)
  const baraTretina = ratio(baraL, cyrilPolovinaL, 1 / 3)
  const adamTretina = ratio(adamL, baraPolovinaL, 1 / 3)
  const cyrilPolovina = ratio(cyrilL, cyrilPolovinaL, 1 / 2)

  const baraDilku = to(
    commonSense("Bářina částku - dělitelná 3 a 2."),
    commonSense("Bářina částce přiřadíme 6 pomyslných dílků."),
    cont(baraL, 6, entityArtifical)
  )

  const adamDilku = deduce(
    deduce(baraDilku, baraPolovina),
    adamTretina
  )

  const cyrilDilku = deduce(
    deduce(last(baraDilku), baraTretina),
    cyrilPolovina
  )

  const bara = deduce(
    deduce(
      adamDilku,
      last(baraDilku),
      ctor('comp-ratio')
    ),
    adamToBara,
  )


  const rate = deduce(
    cont("rozdíl", 300, entity),
    deduce(
      last(adamDilku),
      last(baraDilku),
      ctorDifference("rozdíl")
    ),
    ctor('rate')
  )

  const cyril = deduce(rate, cyrilDilku);
  const adam = deduce(rate, last(adamDilku))

  return {
    bara: {
      deductionTree: bara
    },
    rozdilBaraACyril: {
      deductionTree: deduce(
        last(bara),
        cyril,
        ctorDifference("rozdíl")
      )
    },
    sum: {
      deductionTree: deduce(
        last(bara),
        last(cyril),
        adam,
        sum("dohromady")
      )
    }

  }
}


function karticky() {
  const entity = "kartičky"
  const tondaToPeter = transfer("Tonda", "Petr", 4, entity);
  const petrToTonda = transfer("Petr", "Tonda", 6, entity);

  //const tondaToJirka = transfer("Tonda","Jirka")
  const jirkaToTonda = transfer("Jirka", "Tonda", 3, entity)

  const petrToJirka = transfer("Petr", "Jirka", 2, entity)
  const jirkaToPetr = transfer("Jirka", "Petr", 3, entity)

  const vedouciToPetr = transfer("vedouci", "Petr", 4, entity)
  const petr = cont("Petr", 80, entity);
  return {
    petr: {
      deductionTree: deduce(
        petrToTonda,
        deduce(
          tondaToPeter,
          deduce(
            petrToJirka,
            deduce(
              jirkaToPetr,
              deduce(
                vedouciToPetr,
                petr
              )
            )
          )
        )
      )
    }
  }
}
function domecek() {
  const dim = dimensionEntity();

  const stranaRate = deduceAs("obvod se skládá z 4 stran čtverce a dvou ramen trojúhleníku a každé rameno = 2 strany čterce zvětšené o 3")(
    deduce(
      contLength("obvod", 46),
      contLength("zvětšení ramen", 6),
      ctorDifference("obvod zmenšený")
    ),
    cont("obvod zmenšený", 8, "strana"),
    ctor("rate")
  );

  const strana = toCont(stranaRate, { agent: "čtverec" })
  return {
    strana: {
      deductionTree: stranaRate
    },
    obsah: {
      deductionTree: deduce(
        deduce(
          deduce(
            last(strana),
            last(strana),
            productArea("čtverec")
          ),
          double(),
          productArea("základna")
        ),
        deduce(
          deduce(
            deduce(
              deduce(
                last(strana),
                double(),
                product("základna")
              ),
              comp("rameno", "základna", 3, dim.length.entity)
            ),
            comp("rameno", "výška", 1, dim.length.entity)
          ),
          last(strana),
          productArea("rovnoramenný trojúhleník")
        ),
        sum("domeček")
      )
    }
  }
}

function schody() {
  const dim = dimensionEntity()
  const entity = "obdelník"
  return {
    deductionTree: deduce(
      deduce(
        deduceAs("rozdíl vzniká pouze v horní a spodní části")(
          cont("schodiště", 6, entity),
          cont("krychle", 4, entity),
          ctorDifference("rozdíl")
        ),
        deduce(
          contLength("obdelník", 9),
          contLength("obdelník", 9 / 2),
          productArea("obdelník")
        ),
        productCombine("rozdíl", dim.area)
      ),
      ctorOption("D", 81)
    )
  }
}

function jazyky() {
  const deLabel = "němčina"
  const frLabel = "francouzština"
  const esLabel = "španělština"

  const school1Label = "1.škola"
  const school2Label = "2.škola"
  const entity = "žák"

  const de1 = percent(school1Label, deLabel, 62);
  const fr1 = percent(school1Label, frLabel, 18);
  const es1 = deduce(
    deduce(
      de1,
      fr1,
      sum("dva jazyky")
    ),
    ctorComplement(esLabel)
  )


  const es1Val = cont(esLabel, 100, entity);

  const es2 = percent(school2Label, esLabel, 35);
  const fr2 = percent(school2Label, frLabel, 20);
  const de2 = deduce(
    deduce(
      fr2,
      es2,
      sum("dva jazyky")
    ),
    ctorComplement(deLabel)
  )


  const de2Val = cont(deLabel, 270, entity);

  const school1 = deduce(
    es1,
    es1Val
  )

  const school2 = deduce(
    de2,
    de2Val
  )

  const fr1Pocet = deduce(
    fr1,
    last(school1)
  )

  return {
    porovnaniZaku: {
      deductionTree: deduce(
        deduce(
          school2,
          school1,
        ),
        ctorOption("A", 100)
      )
    },
    fracouzstina: {
      deductionTree: deduce(
        deduce(
          fr1Pocet,
          deduce(
            fr2,
            last(school2)
          ),
          sum(frLabel)
        ),
        ctorOption("E", 210)
      )
    },
    nemcinaVsFrancouzstina: {
      deductionTree: deduce(
        deduce(
          deduce(de1,
            last(school1)
          ),
          fr1Pocet,
        ),
        ctorOption("F", 220)
      )
    }


  }

}

function cestaKeStudance() {
  const entity = "skutečnost"
  const entityBase = "mapa"
  const unit = "cm"

  const tiborAgent = "plánovaná trasa";
  const tiborMeritko = rate(tiborAgent, 50_000, { entity, unit }, entityBase)
  const tiborTrasaPlan = cont(tiborAgent, 4.2, entityBase, unit)

  const matyasAgent = "plánovaná trasa";
  const matyasTrasaPlan = cont(matyasAgent, 28, entityBase, "mm")

  const trasaSkutecnost = deduce(
    tiborMeritko,
    tiborTrasaPlan
  )

  return {
    meritko: {
      deductionTree: deduce(
        deduce(
          trasaSkutecnost,
          deduce(matyasTrasaPlan, ctorUnit("cm")),
          ctor('rate')
        ),
        ctorOption("C", 75_000)
      )
    },
    delkaTrasa: {
      deductionTree: deduce(
        deduce(
          last(trasaSkutecnost),
          ctorUnit("km")
        ),
        ctorOption("A", 2.1)
      )
    }
  }
}


function tornado() {
  const entity = "dům"
  const neposkozenoLabel = "nepoškozeno"
  const poskozenoLabel = "poškozeno"
  const domuBezeSkod = cont(neposkozenoLabel, 270, entity)
  const poskozenoRate = percent("celkem", poskozenoLabel, 40)
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            deduce(
              poskozenoRate,
              ctorComplement(neposkozenoLabel)
            ),
            domuBezeSkod,
          ),
          poskozenoRate
        ),
        percent(poskozenoLabel, "demolice", 30)
      ),
      ctorOption("B", 54)
    )
  }
}

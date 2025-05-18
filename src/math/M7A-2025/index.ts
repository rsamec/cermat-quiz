import { commonSense, comp, cont, ctor, ctorComplement, ctorDifference, ctorOption, ctorUnit, percent, rate, ratio, ratios, sum, transfer } from "../../components/math"
import { deduce, last, to } from "../../utils/deduce-utils"

export default {
  1.1: ceremonial().polovina,
  1.2: ceremonial().pocetMinut,
  4.1: asistencniPes().bara,
  4.2: asistencniPes().rozdilBaraACyril,
  4.3: asistencniPes().sum,
  6.1: karticky().petr,
  11: tornado(),
  12: cestaKeStudance().meritko,
  13: cestaKeStudance().delkaTrasa,
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
      deductionTree: dobaPrvniPulka
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
          sum("konec promitani", [], { entity, unit }, { entity, unit })
        ),
        ctorDifference("rozdil")
      )
    }
  }
}


function asistencniPes() {
  const adamL = "Adam";
  const baraL = "Bára";
  const cyrilL = "Cyril";

  const entity = "korun"
  const entityArtifical = "pomyslný dílek"

  const adamToBara = comp(adamL, baraL, 300, entity)

  const adamEqualBaraL = `1/3 ${adamL} = 1/2 ${baraL}`;
  const baraEqualCyrilL = `1/3 ${baraL} = 1/2 ${cyrilL}`;

  const baraPolovina = ratio(baraL, adamEqualBaraL, 1 / 2)
  const baraTretina = ratio(baraL, baraEqualCyrilL, 1 / 3)
  const adamTretina = ratio(adamL, adamEqualBaraL, 1 / 3)
  const cyrilPolovina = ratio(cyrilL, baraEqualCyrilL, 1 / 2)

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
    deduce(baraDilku, baraTretina),
    cyrilPolovina
  )

  const bara = deduce(
    deduce(
      adamDilku,
      baraDilku,
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
        sum("dohromady", [], entity, entity)
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

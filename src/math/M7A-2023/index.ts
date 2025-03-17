import { commonSense, comp, compAngle, compDiff, compPercent, compRatio, cont, ctor, ctorComplement, nthPart, percent, product, proportion, rate, ratio, ratios, sum } from "../../components/math";
import { axiomInput, deduce, deduceLbl, last, to, toCont } from "../../utils/deduce-utils";

export const example_1 = () => {
  const entity = "litr";
  return {
    deductionTree: deduce(
      deduce(
        ratio("zadaná hodnota", "první hodnota", 3 / 4),
        axiomInput(cont("zadaná hodnota", 24, entity), 1)
      ),
      deduce(
        ratio("zadaná hodnota", "druhá hodnota", 1 / 3),
        axiomInput(cont("zadaná hodnota", 12, entity), 1)
      )
    )
  }
}

export const example_4_1 = () => {
  const entity = "žáci";
  return {
    deductionTree: toCont(
      deduce(
        deduce(
          axiomInput(cont("průměř", 21, entity), 2),
          cont("počet míčových sportů", 3, ""),
          product("počet všech žáků míčové sporty", [], entity, entity)
        ),
        deduce(
          cont("volejbal", 28, entity),
          cont("fotbal", 16, entity),
          sum("fotbal a volejbal", [], entity, entity)
        ),
        ctor('comp-diff')
      ),
      { agent: "vybíjená" }
    )
  }
}
export const example_4_2 = () => {
  return {
    deductionTree: to(
      compRatio("chlapci", "dívky", 3 / 2),
      ratios("plavání", ["dívky", "chlapci"], [2, 3])
    )
  }
}


export const example_5_1 = () => {
  const ctvereckovaniSesitLabel = "čtverečkovaný sešit";
  const linkovanySesitLabel = "linkovaný sešit";
  const entity = "sešit";
  const entityPrice = "Kč";
  const pocetLabel = "počet sešitů";
  const cenaLabel = "cena sešitů";
  const ctvereckovanyPocet = axiomInput(cont(ctvereckovaniSesitLabel, 2, entity), 1);

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(ratios(pocetLabel, [ctvereckovaniSesitLabel, linkovanySesitLabel], [2, 3]), 2),
          proportion(true, [pocetLabel, cenaLabel])
        ),
        axiomInput(cont(cenaLabel, 180, entityPrice), 3),
        nthPart(ctvereckovaniSesitLabel)
      ),
      ctvereckovanyPocet,
      ctor("rate")
    )
  }
}

export const example_5_2 = () => {
  const agent = "nákup kružítek";
  const entityPrice = "korun";

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(cont("chybělo", 160, entityPrice), 2),
          axiomInput(cont("zbylo", 100, entityPrice), 3),
          sum(agent, [], entityPrice, entityPrice)
        ),
        axiomInput(cont(agent, 2, "kus"), 1),
        ctor('rate')),
      axiomInput(cont(agent, 4, "kus"), 4)
    )
  }
}

export const example_6 = () => {
  const souteziciLabel = "soutěžící"
  const odmenaLabel = "odměna"
  const entity = 'Kč'
  const druhy = axiomInput(cont(`2.${souteziciLabel}`, 300, entity), 3);
  const prvni = axiomInput(ratio(odmenaLabel, `1.${souteziciLabel}`, 1 / 2), 1);
  const treti = deduce(
    prvni,
    axiomInput(compRatio(`1.${souteziciLabel}`, `3.${souteziciLabel}`, 3), 3)
  )


  const druhyRelative = deduce(
    deduce(
      prvni,
      treti,
      sum(`1. a 3. ${souteziciLabel}`, [], "", "")
    ),
    ctorComplement(`2.${souteziciLabel}`)
  )

  return [
    {
      deductionTree: deduce(
        druhyRelative,
        { ...last(treti), ...deduceLbl(1) },
        ctor('comp-ratio')
      )
    },
    {
      deductionTree:
        deduce(
          { ...last(druhyRelative), ...deduceLbl(3) },
          druhy
        )
    },
  ]
}

export const trideni_odpadu = () => {
  const oddilR = "oddíl R"
  const oddilS = "oddíl S"
  const oddilT = "oddíl T"
  const entityPapir = "papír";
  const entityPlast = "plast";
  const entityKovy = "kovy";
  const entityVaha = "kg"

  return [
    {
      deductionTree: deduce(
        cont(oddilS, 8, entityPapir),
        cont(oddilR, 6, entityPapir),
        ctor('comp-ratio')
      )
    },
    {
      deductionTree: deduce(
        deduce(
          cont(oddilT, 9, entityPlast),
          cont(oddilS, 11, entityPlast),
          sum(`oddíl S a T`, [], entityPlast, entityPlast)
        ),
        cont(oddilR, 15, entityPlast),
        ctor('comp-ratio')
      )
    },
    {
      deductionTree: deduce(
        deduce(
          cont(oddilR, 3, entityKovy),
          cont(oddilS, 3, entityKovy),
          cont(oddilT, 4, entityKovy),
          sum(`kovy všechny oddíly`, [], entityVaha, entityPlast)
        ),
        deduce(
          cont(oddilR, 6, entityPapir),
          cont(oddilS, 8, entityPapir),
          cont(oddilT, 1, entityPapir),
          sum(`plast všechny oddíly`, [], entityVaha, entityPlast)
        ),
        ctor('comp-ratio')
      )
    },

  ]
}

export const example_13 = () => {
  const dvou = "dvoukorunové"
  const peti = "pětikorunové"
  const deseti = "desitikorunové"
  const entity = "kus"
  const entityPrice = "korun";
  const pocetDeseti = cont(deseti, 6, entity);
  const pocetPeti = deduce(
    pocetDeseti,
    compRatio(peti, deseti, 2)
  );
  const pocetDvou = deduce(
    pocetPeti,
    compRatio(dvou, peti, 5)
  )



  return {
    deductionTree: deduce(
      deduce(pocetDvou, rate(dvou, 2, entityPrice, entity)),
      deduce(last(pocetPeti), rate(peti, 5, entityPrice, entity)),
      deduce(pocetDeseti, rate(deseti, 10, entityPrice, entity)),
      sum("hodnota", [], entityPrice, entityPrice)
    )
  }
}

export const example_11 = () => {
  const entity = "stupňů";

  const inputAngleLabel = `zadaný úhel`;
  const triangleSum = cont('součet úhlů v trojúhelníku', 180, entity)
  const triangle = "úhel trojúhelníku ABD";

  return {
    deductionTree:
      deduce(
        toCont(
          deduce(
            triangleSum,
            deduce(
              deduce(axiomInput(cont(inputAngleLabel, 40, entity), 2), compAngle(inputAngleLabel, `${triangle} u vrcholu B`, 'alternate')),
              deduce(
                axiomInput(cont(inputAngleLabel, 70, entity), 1),
                compAngle(inputAngleLabel, `${triangle} u vrcholu A`, "supplementary")
              ),
              sum("dvojice úhlů v trojúhelníku", [], entity, entity)),
            ctor('comp-diff'))
          , { agent: `${triangle} u vrcholu D` }),
        compAngle(`${triangle} u vrcholu D`, "φ", 'supplementary')

      )

  }
}

export const example_12 = () => {
  const ctverecDelkaLabel = "strana čtverce";
  const entity = "cm"
  const entity2d = "cm2"
  const rectangleWidthLabel = "šířka obdelníka"

  const rectangleWidth = to(
    axiomInput(cont("nejdelší strana sedmiúhelníku", 5, entity), 2),
    commonSense("tato délka odpovídá šířce obdélníku"),
    cont(rectangleWidthLabel, 5, entity)
  )

  const triangleHeight = to(
    commonSense("tři čtverce tvoří výšku trojůhelníku"),
    cont("výška šedého trojúhelníku", 3, entity),
  )

  //const rectangleWidth = cont(rectangleWidthLabel, 5, entity);

  return {
    deductionTree: deduce(
      deduce(
        axiomInput(cont(ctverecDelkaLabel, 1, entity), 1),
        cont("počet čtverců", 3, ""),
        product("obsah tři shodné čtverce", [], entity2d, entity)
      ),
      deduce(
        rectangleWidth,
        deduce(
          last(rectangleWidth),
          compDiff(rectangleWidthLabel, "výška obdelníku", 3, entity)
        ),
        product("obsah obdelníku", [], entity2d, entity)
      ),
      deduce(
        deduce(
          triangleHeight,
          deduce(
            last(rectangleWidth),
            compDiff(rectangleWidthLabel, "základna šedého trojúhelníku", 1, entity)
          ),
          cont("polovina", 1 / 2, ""),
          product("obsah šedého trojúhelníku", [], entity2d, entity)
        ),
        cont("počet šedých trojúhleníků", 3, ""),
        product("obsah tří šedých trojúhelníku", [], entity2d, entity2d)
      ),
      sum("obsah sedmiúhelníku", [], entity2d, entity2d)
    )
  }

}

export const example_15_1 = () => {

  const deducePercent = deduce(
    axiomInput(percent("celá kniha", "Róza přečteno", 60), 2),
    ctorComplement("Róza nepřečteno")
  );


  return {
    deductionTree: deduce(
      axiomInput(cont("celá kniha", 1200, "stran"), 1),
      deducePercent)
  }
}

export const example_15_2 = () => {
  const entity = "Kč"
  const compare = axiomInput(comp("dospělé vstupné", "dětské vstupné", 210, entity), 2);

  return {
    deductionTree: deduce(deduce(
      axiomInput(compPercent("dětské vstupné", "dospělé vstupné", 70), 1),
      compare,
    ), compare)
  }
}

export const example_15_3 = () => {
  const entity = "obyvatel";
  const den1 = axiomInput(cont("přišlo 1.den", 500, entity), 2)
  const obec = deduce(
    axiomInput(percent("obec", "přišlo 1.den", 25), 1),
    den1
  );


  return {
    deductionTree:
      deduce(
        last(obec),
        deduce(
          deduce(
            deduce(
              obec,
              compDiff("obec", "zbývající dospělý", 500, entity)),
            axiomInput(percent("zbývající dospělý", "přišlo 2.den", 70), 3)
          ),
          den1,
          sum("přišlo celkem", [], entity, entity)
        ),
        ctor('comp-diff')
      )
  }
}

export const obrazce = () => {
  const entityRow = "řádků"
  const entityColumn = "sloupců"
  const entityTmave = "tmavý čtvereček"
  const entitySvetle = "světlé čtvereček"
  const entity = "čtverečků"
  const base = "základní obrazec"
  const extended = "rozšířený obrazec"

  const dd1 = deduce(
    cont(`přidáno ${extended}`, 30, entityTmave),
    deduce(
      cont(`levý sloupec ${extended}`, 6, entityTmave),
      cont(`pravý sloupec ${extended}`, 6, entityTmave),
      sum("oba krajní sloupce", [], entityTmave, entityTmave)
    ),
    ctor('comp-diff')
  );
  return [
    {
      deductionTree: to(
        dd1,
        commonSense("horní řada tmavých čtverčků bez krajních sloupců rozšířeného obrazce odpovídá počtu sloupců základního obrazce"),
        cont(base, last(dd1).quantity, entityColumn)
      )
    },
    {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(`levý sloupec`, 3, entity),
            cont(`pravý sloupec`, 3, entity),
            sum("oba krajní sloupce", [], entity, entity)
          ),
          ratios(extended, [entitySvetle, "horní řada", "oba krajní sloupce"], [2, 1, 1])
        ),
        cont(extended, 3, entityRow),
        ctor("rate")
      )
    },
    {
      deductionTree: to(deduce(
        rate("oba krajní sloupce", 2, entityTmave, entityRow),
        cont("oba krajní sloupce", 24, entityRow)
      ),
        commonSense("základní obrazec je tvořen jednou nebo více řadami světlých čtverečků."),
        commonSense("2 řádky jsou minimum a 24 řádků je maximum."),
        commonSense("možných rozšířených obrazců tvoří obrazce s 2, 3, 4... 24 řádků"),
        cont("možných rozšířených obrazců s 50 tmavými čtverečky", 23, extended)
      )
    }

  ]
}


import { commonSense, cont, Container, ctor, ctorDifference, ctorPercent, ctorSlide, ctorUnit, product, productCombine, quota, rate, sum } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, to, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => procento(),
    3.1: () => mozaika().a,
    3.2: () => mozaika().b,
    3.3: () => mozaika().c,
    4.1: () => symboly().plus,
    4.2: () => symboly().dohromady,
    4.3: () => symboly().hvezdicka,
})


function procento() {
    return {
        deductionTree: deduce(
            deduce(
                cont("část", 1080, "čas", "min"),
                ctorUnit("h")
            ),
            cont("celek", 24, "čas", "h"),
            ctorPercent()
        ),
    }
}

function mozaika() {
    const entitySloupec = "sloupců"
    const entityRadek = "řádků"
    const obrazec12 = "mozaika s 12 řadami"
    const korekce = "korekce okraje"
    const sedeCtverce = "šedé čtverce"
    const bileCtverce = "bílé čtverce"
    const ctverec = "čtverec"

    const okraje = "mozaika"
    const mozajka = "mozaika"

    const kratsiStrana = deduce(
        deduce(
            cont(okraje, 70, bileCtverce),
            cont("korekce - rohy", 4, bileCtverce),
            ctorDifference(okraje)
        ),
        cont(bileCtverce, 4, "stran"),
        ctor("quota")
    );
    return {
        a: {
            deductionTree: deduce(
                deduce(
                    cont(obrazec12, 12, entitySloupec),
                    cont(korekce, 2, entitySloupec),
                    ctorDifference(obrazec12),
                ),
                deduce(
                    cont(obrazec12, 13, entityRadek),
                    cont(korekce, 2, entityRadek),
                    ctorDifference(obrazec12)
                ),
                productCombine(obrazec12, { entity: sedeCtverce })
            )
        },
        b: {
            deductionTree: deduce(
                toCont(kratsiStrana, { agent: okraje, entity: { entity: entitySloupec } }),
                to(
                    last(kratsiStrana),
                    commonSense("2 zbylé bílé čtverce odpovídájí +1 pro horní a dolní okraj"),
                    cont(okraje, 17, entityRadek)
                ),
                productCombine(okraje, { entity: sedeCtverce })
            )
        },
        c: {
            deductionTree: deduce(
                cont([mozajka, "celkem"], 380, ctverec),
                deduceAs("Hledáme dvě čísla vedle sebe (řady a sloupce), jejichž součin je 380.")(
                    deduce(
                        cont(mozajka, 19, entitySloupec),
                        cont(korekce, 2, entitySloupec),
                        ctorDifference(mozajka),
                    ),
                    deduce(
                        cont(mozajka, 20, entityRadek),
                        cont(korekce, 2, entityRadek),
                        ctorDifference(mozajka)
                    ),
                    productCombine([mozajka, sedeCtverce], { entity: ctverec })
                ),
                ctorDifference(mozajka)
            )
        }
    }
}


function symboly() {
    const entity = "symbol"
    const entityBase = "pípnutí"
    const plusAgent = "liché"
    const kratAgent = "sudé"
    const hvezdaAgent = "hvězdička"
    const plusRate = rate(plusAgent, 2, entity, entityBase)
    const kratRate = rate(kratAgent, 2, entity, entityBase)
    const pipaniHvezdaRate = rate(hvezdaAgent, 3, entityBase, entity)


    const pipnuti11 = "obrazovka při 11. pípnutí"
    const pipnuti90 = "obrazovka při 90. pípnutí"
    const symbolHvezda9 = "obrazovka s 9 hvězdičkami"

    return {
        plus: {
            deductionTree: deduce(
                deduce(
                    cont([pipnuti11, plusAgent], 6, entityBase),
                    plusRate
                ),
                cont([pipnuti11, hvezdaAgent], 3, entity),
                ctorDifference(pipnuti11)
            )
        },
        dohromady: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont([pipnuti90, plusAgent], 45, entityBase),
                        plusRate
                    ),
                    deduce(
                        cont([pipnuti90, kratAgent], 45, entityBase),
                        kratRate
                    ),
                    sum(`${pipnuti90}, ${plusAgent} a ${kratAgent}`)
                ),
                cont([pipnuti11, hvezdaAgent], 30, entity),
                ctorDifference(pipnuti90)
            )
        },
        hvezdicka: {
            deductionTree:
                deduce(
                    deduce(
                        toCont(
                            deduce(
                                deduce(
                                    cont([symbolHvezda9, hvezdaAgent], 9, entity),
                                    pipaniHvezdaRate
                                ),
                                cont(kratAgent, 2, entityBase),
                                ctor("quota")
                            ), { agent: kratAgent, entity: { entity: entityBase } }),
                        kratRate
                    ),
                    cont(hvezdaAgent, 9, entity),
                    ctorDifference(kratAgent)
                )
        },
    }
}

function slice(arg0: Container): import("../../utils/deduce-utils").Node {
    throw new Error("Function not implemented.");
}

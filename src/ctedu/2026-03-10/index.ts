
import { cont, ctor, ctorDifference, ctorPercent, ctorUnit, quota, rate, sum } from "../../components/math";
import { createLazyMap, deduce, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => procento(),
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

function symboly() {
    const entity = "symbol"
    const entityBase = "pípnutí"
    const plusAgent = "sudé - plus"
    const kratAgent = "liché - krát"
    const hvezdaAgent = "hvězdička"
    const plusRate = rate(plusAgent, 2, entity, entityBase)
    const kratRate = rate(kratAgent, 2, entity, entityBase)
    const pipaniHvezdaRate = rate(hvezdaAgent, 3, entityBase, entity)

    const pipnuti11 = "11. pípnutí"
    const pipnuti90 = "90. pípnutí"
    const situace9 = "situace"
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
                                    cont(hvezdaAgent, 9, entity),
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
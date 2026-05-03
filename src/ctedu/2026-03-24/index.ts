
import { compAngle, compRelative, cont, contAngle, contArea, contLength, ctor, ctorLinearEquation, ctorOption, ctorRound, ctorUnit, dimensionEntity, evalFormulaAsCont, formulaRegistry, halfProduct, rate, sum, thirdProduct, triangleAngle } from "../../components/math";
import { anglesNames, createLazyMap, deduce, last } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => obdelnik(),
    3.1: () => kinoSal().a,
    3.2: () => kinoSal().b,
    3.3: () => kinoSal().c,
    4: () => pizza(),
    5: () => krychle(),
    6: () => uhel(),
    7: () => kava(),

})


function obdelnik() {
    const dim = dimensionEntity();
    const delka = contLength("délka", 15);
    return {
        deductionTree: deduce(
            delka,
            deduce(
                deduce(
                    contArea("obdélník", 1.05, "dm2"),
                    ctorUnit("cm2")
                ),
                delka,
                evalFormulaAsCont(formulaRegistry.surfaceArea.rectangle, x => x.b, "šířka", dim.length)
            ),
        )
    }
}

function kinoSal() {
    const entity = 'cena'
    const entityBase = 'lístek'
    const triListkyCena = cont("2D kino", "x", entity)
    const triListky = cont("2D kino", 3, entityBase)

    const kino2DRate = deduce(
        triListkyCena,
        triListky,
        ctor('rate')
    )

    const dvaListkyCena = cont("3D kino", "x", entity)
    const kino3DRate = deduce(
        dvaListkyCena,
        cont("3D kino", 2, entityBase),
        ctor('rate')
    )

    return {
        a: {
            deductionTree: kino2DRate
        },
        b: {
            deductionTree: deduce(
                kino3DRate,
                cont("3D kino", 5, entityBase),
            )
        },
        c: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            kino2DRate,
                            cont("2D kino", 4, entityBase),
                        ),
                        deduce(
                            kino3DRate,
                            cont("3D kino", 3, entityBase),
                        ),
                        sum("celkem")
                    ),
                    cont("celkem", 510, entity),
                    ctorLinearEquation("2D kino", { entity: entity }, "x")
                ),
                triListky,
                ctor('rate')
            )
        },
    }
}

function pizza() {
    const dim = dimensionEntity()
    const polomer = deduce(
        contLength("průměr", 20),
        ...halfProduct("poloměr")
    )
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    deduce(
                        deduce(
                            polomer,
                            evalFormulaAsCont(formulaRegistry.circumReference.circle, x => x.o, "pizza", dim.length),
                        ),
                        cont("pizza", 8, "kousek"),
                        ctor('rate')
                    ),
                    last(polomer),
                    last(polomer),
                    sum("obvod pizza kousek")
                ),
                ctorRound()
            ),
            ctorOption("B", 28)
        )
    }
}

function krychle() {
    const dim = dimensionEntity()
    const hranaKrychle = contLength("hrana krychle", 12)
    const kratsiStranKvadr = deduce(
        hranaKrychle,
        ...thirdProduct("nejkratší strana kvádr")
    )
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    kratsiStranKvadr,
                    hranaKrychle,
                    hranaKrychle,
                    evalFormulaAsCont(formulaRegistry.surfaceArea.cuboid, x => x.S, "kvádr", dim.area),
                ),
                ctorUnit("dm2")
            ),
            ctorOption("D", 4.8)
        )
    }
}

function uhel() {
    const dopoctenyTroj = deduce(
        contAngle("vrcholový", 43),
        deduce(
            contAngle("známý úhel", 58),
            compAngle("známý úhel", "B", "opposite")
        ),
        triangleAngle("C")
    )
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    dopoctenyTroj,
                    compAngle("C", anglesNames.beta, "supplementary")
                ),
                deduce(
                    last(dopoctenyTroj),
                    compAngle("C", anglesNames.alpha, "alternate-interior")
                )
            ),
            ctorOption("A", 22)
        )
    }
}

function kava() {
    const entity = { entity: "cena", unit: "Kč" }
    const entityBase = { entity: "balení" }
    return {
        deductionTree: deduce(
            deduce(
                rate("luxusní káva", 400, entity, entityBase),
                compRelative("luxusní káva", "standardní káva", 1 / 4)
            ),
            cont("standardní káva", 2, entityBase.entity)
        )
    }
}

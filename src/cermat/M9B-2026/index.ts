import { cont, ctor, ctorOption, sum, ctorDifference, contLength, dimensionEntity, evalFormulaAsCont, formulaRegistry, ratio, ctorComparePercent, ctorLinearEquation, percent, contAngle, doubleProduct, contArea, quaterProduct, ctorUnit, rate, compRelativePercent, type Container, ctorBooleanOption, counter } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, toCont, toPredicate } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => vypocetPlocha(),
    5.1: () => salat().recept,
    5.2: () => salat().rozdilPercent,
    6.1: () => jarmark().punc,
    6.2: () => jarmark().caj,
    6.3: () => jarmark().trzba,
    7.1: () => kruh().porovnani,
    7.2: () => kruh().obvod,
    8.1: () => trojuhelnik().nejmensi,
    8.2: () => trojuhelnik().nejvetsi,
    // 12: () => diagram(),
    11.1: () => parkoviste().a,
    11.2: () => parkoviste().b,
    11.3: () => parkoviste().c,
    13: () => krychle(),
    14: () => hrnek(),
    15.1: () => procenta().prvni,
    15.2: () => procenta().druha,
    15.3: () => procenta().treti,

})

function vypocetPlocha() {
    return {
        deductionTree: deduce(
            deduce(
                contArea("první plocha", 0.1, "m2"),
                ctorUnit("cm2")
            ),
            contArea("druhá plocha", 20,),
        )
    }
}
function salat() {
    const entity = { entity: "cukr", unit: "g" }
    const entityBase = { entity: "rajčat", unit: "g" }
    const agentName = "salát"
    const receptRate = rate([agentName, "recept"], 25, entity, entityBase, 250);

    const recept = deduce(
        cont(agentName, 850, entityBase.entity, entityBase.unit),
        receptRate
    )
    return {
        recept: {
            deductionTree: recept,
        },
        rozdilPercent: {
            deductionTree: deduce(
                cont([agentName, "Fratišek"], 255, entity.entity, entity.unit),
                last(recept),
                ctorComparePercent()
            )
        }
    }
}
function jarmark() {
    const entity = "Kč"
    const entityBase = "kus"
    const cajUnitCena = rate("čaj", 40, entity, entityBase);
    const cajRate = rate("čaj", 40, entity, entityBase);
    const cajPocet = cont("čaj", "x", entityBase)


    const puncRate = deduce(
        cajUnitCena,
        compRelativePercent("punč", "čaj", 75)
    )

    const puncPocet = deduce(
        cont("prodáno celkem", 510, entityBase),
        cajPocet,
        ctorDifference("punč")
    )

    const cajTrzba = deduce(
        cajRate,
        cajPocet,
    )
    return {
        punc: {
            deductionTree: puncRate
        },
        caj: {
            deductionTree: cajTrzba
        },
        trzba: {
            deductionTree: deduce(
                deduce(
                    cajTrzba,
                    deduce(
                        puncRate,
                        puncPocet
                    ),
                    sum("tržba")
                ),
                cont("tržba", 29_700, entity),
                ctorLinearEquation("čaj", { entity: entityBase }, "x")
            )
        }
    }
}

function trojuhelnik() {
    const a = contLength("strana a", 7);
    const b = contLength("strana b", 30)
    const cislo = contLength("nejmenší možné celé číslo", 1)
    return {
        nejmensi: {
            deductionTree: deduce(
                deduce(
                    b,
                    a,
                    ctorDifference("rozdíl stran")
                ),
                cislo,
                sum("nejmenší možná strana")
            )
        },
        nejvetsi: {
            deductionTree: deduce(               
                deduce(
                    b,
                    a,
                    sum("součet stran")
                ),
                cislo,
                ctorDifference("největší možná strana")            
            )
        }
    }
}


function kruh() {
    const polomer = contLength(["kruh", "poloměr"], 10);
    return {
        porovnani: {
            deductionTree: deduce(
                contAngle("bílá část", 90),
                contAngle("tmavá část", 30),
                ctor("comp-ratio")
            )
        },
        obvod: {
            deductionTree: deduce(
                deduce(
                    polomer,
                    ...doubleProduct(["čtvrkruh", "strany"].join())
                ),
                deduce(
                    deduce(
                        polomer,
                        evalFormulaAsCont(formulaRegistry.circumReference.circle, x => x.o, "kruh", dimensionEntity().length)
                    ),
                    ...quaterProduct(["čtvrkruh", "oblouk"].join())
                ),
                sum(["čtvrkruh", "obvod"].join())
            )
        }
    }
}

function hrnek() {
    const entity = { entity: "vody", unit: "ml" }
    const entityKus = "hrnek"
    const entityBase = "osmina"
    const nalito = cont("nalito", 28, entityKus)
    const nalitoRelativne = cont("nalito", 7, entityBase)
    return {
        deductionTree: deduce(
            deduce(
                cont("zbývá", 1_050, entity.entity, entity.unit),
                deduce(
                    toCont(deduce(
                        nalito,
                        nalitoRelativne,
                        ctor("rate")
                    ), { agent: "nezaplněno" }),
                    cont("přilito", 1, entityKus),
                    ctorDifference("zbývá")
                ),
                ctor("rate")
            ),
            ctorOption("A", 350)
        )
    }
}


function parkoviste() {
    const entity = "aut"
    const parkovisteLabel = "parkoviště"

    const poPribylo = cont(["pondělí", "přibylo"], 14, entity)
    const poUbylo = cont(["pondělí", "ubylo"], 4, entity)
    const ut = cont(["úterý", "stav"], 16, entity)

    const utPribylo = cont(["úterý", "přibylo"], 4, entity)
    const utUbylo = cont(["úterý", "ubylo"], 7, entity)
    const stUbylo = cont(["středa", "ubylo"], 6, entity)

    const ctPribylo = cont(["čtvrtek", "přibylo"], 5, entity)
    const ct = cont(["čtvrtek", "stav"], 16, entity)
    const pa = cont(["pátek", "stav"], 9, entity)
    return {
        a: {
            deductionTree: deduce(
                deduce(
                    ut,
                    deduce(
                        poPribylo,
                        poUbylo,
                        ctorDifference("změna")
                    ),
                    ctorDifference("pondělí")
                ),
                ctorBooleanOption(10)
            )
        },
        b: {
            deductionTree: deduce(
                deduceAs("počet aut (stav na parkovišti) je stejný v úterý a ve čtvrtek  stejný, stačí jen porovnat úbytek s nově zaparkovanými auty")(
                    deduce(
                        utUbylo,
                        stUbylo,
                        sum(["uterý a středa", "ubylo"].join())
                    ),
                    utPribylo,
                    ctorDifference(["středa", "přibylo"].join())
                ),
                ctorBooleanOption(9)
            )
        },
        c: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        ct,
                        ctPribylo,
                        sum(["čtvrtek", "stav a nově přibylo"].join())
                    ),
                    pa,
                    ctorDifference(["čtvrtek", "ubylo"].join())
                ),
                ctorBooleanOption(12, "smaller")
            )
        },

    }
}


function krychle() {
    const dim = dimensionEntity()
    const strana = contLength("šířka krychle", 10)

    return {
        deductionTree: deduce(
            deduceAs("v každém rohu zaniknout 3 původní plošky, ale zároveň 3 nové vzniknout, změna povrhu je tak nulová")(
                strana,
                evalFormulaAsCont(formulaRegistry.surfaceArea.cube, x => x.S, "nové těleso", dim.area)
            ),
            ctorOption("C", 600)
        )
    }
}

// function diagram() {
//     return {
//         deductionTree: deduce(
//             counter("strana 1", 40),
//             counter("strana 2", 48),
//             counter("strana 3", 4),
//             lcd("násobek", "")
//         )
//     }
// }

function procenta() {
    const entity = "kg"
    const entityPercent = "%"
    const dzemPercent = percent("celek", "džem", 65)
    const zavazadloPorovnani = compRelativePercent("menší zavazadlo", "větší zavazadlo", -60);
    const vetsiZavazdlo = deduce(
        cont("dohromady", 42, entity),
        zavazadloPorovnani,
    );
    return {
        prvni: {
            deductionTree: deduce(
                deduce(
                    cont("jablka", 20, entity),
                    compRelativePercent("jablka", "hrušky", 25)
                ),
                ctorOption("D", 16)
            )
        },
        druha: {
            deductionTree: deduce(
                deduce(

                    deduce(
                        toPredicate(deduce(
                            cont("celek", 100, entityPercent),
                            deduce(
                                cont("džem", 65, entityPercent),
                                cont("sirup", 20, entityPercent),
                                sum("džem a sirup")
                            ),
                            ctorDifference("zbytek zamraženo")
                        ), (node: Container) => percent("celek", node.agent.join(), node.quantity as number)),
                        cont("zbytek zamraženo", 3, entity)
                    ),
                    dzemPercent
                ),
                ctorOption("B", 13)
            )
        },
        treti: {
            deductionTree: deduce(
                deduce(
                    vetsiZavazdlo,
                    deduce(
                        last(vetsiZavazdlo),
                        zavazadloPorovnani
                    )
                ),
                ctorOption("E", 18)
            )
        }
    }
}
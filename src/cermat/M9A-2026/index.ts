import { cont, ctor, ctorOption, sum, ctorDifference, contLength, dimensionEntity, evalFormulaAsCont, formulaRegistry, ctorPercent, ctorComplement, ratio, ctorComparePercent, ctorRatios, pythagoras, ctorLinearEquation, percent, halfProduct, ctorBooleanOption, contAngle, compAngle, contRightAngle, triangleAngle, ratios, nthPart, compRelative, doubleProduct, ctorRate, contArea, quaterProduct } from "../../components/math";
import { anglesNames, createLazyMap, deduce, deduceAs, last } from "../../utils/deduce-utils";

export default createLazyMap({
    5: () => sud(),
    6.1: () => cyklosteska().stanekKChate,
    6.2: () => cyklosteska().stanekKMistuZtraty,
    6.3: () => cyklosteska().ujeto,
    7.1: () => beh().bara,
    7.2: () => beh().baraOkruh,
    8.1: () => uhel().phi,
    8.2: () => uhel().alpha,
    11.1: () => nakladNaLodi().a,
    11.2: () => nakladNaLodi().b,
    11.3: () => nakladNaLodi().c,
    12: () => parkoviste(),
    13: () => obsah(),
    14: () => hranol(),
    15.1: () => procenta().prvni,
    15.2: () => procenta().druha,
    15.3: () => procenta().treti,

})

function sud() {
    return {
        deductionTree: deduce(
            cont("větší sud", 360, "litr"),
            compRelative("větší sud", "menší sud", 1 / 3)
        )
    }
}

function cyklosteska() {
    const dim = dimensionEntity("km")
    const cyklotrasa = "cyklostezka"
    const trasa = contLength(cyklotrasa, "x", "km");
    const nadraziToStanekLabel = "od nádraží ke stánku";
    const nadraziToStanekPomer = ratio(cyklotrasa, nadraziToStanekLabel, 2 / 3);
    const mistoZtratyLabel = "od místa ztráty k chatě"

    const stanek = deduce(
        deduce(
            nadraziToStanekPomer,
            ctorComplement("od stánku k chatě")
        ),
        trasa
    )

    const mistoZtratyPomer = ratio("od nádraží ke stánku", "od stánek k místu ztráty telefonu", 1 / 4);
    const mistoZtraty = deduce(
        deduce(nadraziToStanekPomer, trasa),
        mistoZtratyPomer,
    )

    const celkem = deduce(
        deduce(last(stanek), last(mistoZtraty), sum(mistoZtratyLabel)),
        contLength(mistoZtratyLabel, 24, "km"),
        ctorLinearEquation(cyklotrasa, dim.length, "x")
    )
    const mistoZtratyAbsolutne = deduce(
        deduce(nadraziToStanekPomer, last(celkem)),
        mistoZtratyPomer,
    )
    return {
        stanekKChate: {
            deductionTree: stanek
        },
        stanekKMistuZtraty: {
            deductionTree: mistoZtraty
        },
        ujeto: {
            deductionTree: deduce(
                celkem,
                deduce(
                    mistoZtratyAbsolutne,
                    ...doubleProduct("cesta navíc kůli ztrátě telefonu")
                ),
                sum("celkem")
            )
        },
    }
}

function beh() {
    const dim = dimensionEntity("km");
    const entityBase = { entity: "doba", unit: "min" }
    const adamLabel = "Adam celá trasa";
    const adamDelka = contLength(adamLabel, 10, "km");
    const baraLabel = "Bára celá trasa";
    const baraDelka = contLength(baraLabel, 9, "km");

    const baraDoba = cont("Bára uběhla", 30, entityBase.entity, entityBase.unit)
    const baraUbehla = deduce(
        baraDelka,
        deduce(
            adamDelka,
            deduce(
                deduce(
                    adamDelka,
                    cont(adamLabel, 50, entityBase.entity, entityBase.unit),
                    ctor("rate")
                ),
                cont(["Adam", "uběhl"], 30, entityBase.entity, entityBase.unit),
            ),
            ctorDifference("zbývá úběhnout(Adam i Bára)")
        ),
        ctorDifference("Bára uběhla")
    )
    return {
        bara: {
            deductionTree: baraUbehla,
        },
        baraOkruh: {
            deductionTree: deduce(
                baraDoba,
                deduce(
                    baraDelka,
                    last(baraUbehla),
                    ctor('comp-ratio')
                )
            )
        }
    }
}

function nakladNaLodi() {
    const percent = "procent";
    const entity = { entity: "hmotnost", unit: "tun" }
    const kavaHodnota = cont("káva", 36, entity.entity, entity.unit)
    const banany = cont("banány", 36, entity.entity, entity.unit)
    const celek = cont("celek", 100, percent)

    const ryze = cont("rýže", 35, percent);

    const kavaABanany = deduce(
        celek,
        deduce(
            cont("rýže", 35, percent),
            cont("cukr", 25, percent),
            sum("rýže a cukr")
        ),
        ctorDifference("káva a banány")
    );

    const kava = deduce(last(kavaABanany), ratios("káva a banány", ["káva", "banány"], [1, 1]), nthPart("káva"));
    return {
        a: {
            deductionTree: deduce(
                deduce(
                    kavaABanany,
                    celek,
                    ctor("ratio")
                ),
                ctorBooleanOption(2 / 5)
            )
        },
        b: {
            deductionTree: deduce(
                kava,
                ryze,
                ctorRatios("poměr zboží", { useBase: true })
            )
        },
        c: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        kavaHodnota,
                        last(kava),
                        ctorRate("zboží")
                    ),
                    ryze
                ),
                ctorBooleanOption(63)
            )
        }
    }
}

function obsah() {
    const zakladna = contLength("LM", 16);
    const rameno = deduce(
        deduce(
            contLength("KLM", 50),
            zakladna,
            ctorDifference("obě ramena")
        ),
        ratios("obě ramena", ["KL", "KM"], [1, 1]),
        nthPart("KL")
    );
    const polovinaZakladna = deduce(zakladna, ...halfProduct("polovina základny"))
    return {
        deductionTree: deduce(
            deduce(
                zakladna,
                deduce(
                    polovinaZakladna,
                    rameno,
                    pythagoras("KL", ["polovina základny", "výška na LM"])
                ),
                evalFormulaAsCont(formulaRegistry.surfaceArea.triangle, x => x.S, "KLM", dimensionEntity().area)
            ),
            ctorOption('A', 120)
        )
    }
}

function parkoviste() {
    const parkovisteLabel = "parkoviště"
    const zasobovaniLabel = "zásobování"
    const zasobovani = cont(zasobovaniLabel, 15, "míst")
    return {
        deductionTree: deduce(
            deduce(
                deduceAs("letos")(
                    zasobovani,
                    percent(parkovisteLabel, zasobovaniLabel, 4)
                ),
                deduceAs("loni")(
                    zasobovani,
                    ratio(parkovisteLabel, zasobovaniLabel, 1 / 20)
                ),
                ctorDifference("navýšení kapacity")
            ),
            ctorOption("C", 75)
        )

    }
}


function hranol() {
    const dim = dimensionEntity()
    const strana = contArea("šířka stěny", 3)
    const stranaPovrch = deduce(
        contArea("hranol", 72),
        ...quaterProduct("jedna boční stěna")
    );

    return {
        deductionTree: deduceAs("počítáme pouze zvětšení/rozdíl mezi dvěmi hranoly")(
            stranaPovrch,
            strana,
            ctor('quota')
        )
        // deduce(
        //     deduce(

        //         deduce(
        //             contLength(["hranol", "strana"], 2),
        //             contLength(["hranol", "strana"], 2),
        //             contLength(["hranol", "výška"], 4),
        //             evalFormulaAsCont(formulaRegistry.volume.cuboid, x => x.V, "hranol", dim.volume)
        //         ),
        //         deduce(
        //             deduce(
        //                 contLength(["válec", "poloměr"], 1),
        //                 contLength(["válec", "výška"], 4),
        //                 evalFormulaAsCont(formulaRegistry.volume.cylinder, x => x.V, "válec", dim.volume)
        //             ),
        //             ...halfProduct("polovina válce")
        //         ),
        //         ctorDifference("těleso s prohlubní")
        //     ),
        //     ctorOption("B", 9.72)
        // )
    }
}

function uhel() {

    const phi = deduceAs("označíme pravoúhlý trojůhelník BOQ, kde O = je průsečík o a q a Q je průsečík q a AB")(
        contRightAngle("OQB"),
        deduce(
            contAngle("zadaný úhel", 100),
            compAngle("zadaný úhel", "BOQ", "supplementary")
        ),
        triangleAngle("QBO")
    )

    return {
        phi: {
            deductionTree: phi,

        },
        alpha: {
            deductionTree: deduce(
                contRightAngle("BCA"),
                deduce(
                    phi,
                    ...doubleProduct("ABC")
                ),
                triangleAngle(anglesNames.alpha)
            )
        }
    }
}

function procenta() {
    const entity = "kvádr"
    const b = cont("těleso B", 3, entity);
    const c = cont("těleso C", 5, entity);
    return {
        prvni: {
            deductionTree: deduce(
                deduce(                    
                    b,
                    cont("těleso A", 2, entity),
                    ctorComparePercent()
                ),
                ctorOption("E", 50, { asPercent: true })
            )
        },
        druha: {
            deductionTree: deduce(
                deduce(                    
                    b,
                    c,                    
                    ctorComparePercent()
                ),
                ctorOption("D", 40, { asPercent: true })
            )
        },
        treti: {
            deductionTree: deduce(
                deduce(
                    cont("zaplnění", 1 / 2, entity),
                    c,                    
                    ctorPercent()
                ),
                ctorOption("A", 10, { asPercent: true })
            )
        }
    }
}
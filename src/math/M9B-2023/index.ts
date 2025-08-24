import { commonSense, compRatio, cont, ctor, ctorComplement, ctorDifference, ctorComparePercent, ratio, sum, product, ctorSlide, double, ctorPercent, ctorOption, compRelative, compRelativePercent, evalExprAsCont, counter, proportion, productCombine, ctorLinearEquation, comp, ctorScale, ctorComplementCompRatio, ctorSlideInvert, ctorScaleInvert, ctorBooleanOption, pythagoras, simplifyExpr, contArea, dimensionEntity, contLength, productArea, productVolume, squareNumbersPattern, nth } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, lastQuantity, to, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
    2.1: () => lyzarskaPermice().porovnani,
    2.2: () => lyzarskaPermice().triJednodenni,
    6.1: () => expedice().spotreba,
    6.2: () => expedice().velikostExpedice,
    6.3: () => expedice().zasoby,
    7.1: () => cestaDoPrace().rychlik,
    7.2: () => cestaDoPrace().vlak,
    7.3: () => cestaDoPrace().autobus,
    8.1: () => dort().prumerTacu,
    8.2: () => dort().objemDortu,
    11.1: () => kosoctverec().obsah,
    11.2: () => kosoctverec().strana,
    11.3: () => kosoctverec().vyska,
    13: () => hranol(),
    14: () => kosikar(),
    15.1: () => procenta().skauti,
    15.2: () => procenta().kapesne,
    15.3: () => procenta().vstupenky,
    16.1: () => vzorCtverce().pridano,
    16.2: () => vzorCtverce().rozdil,
    16.3: () => vzorCtverce().pocet,


})

function expedice() {
    const newState = "nově"
    const currentState = "původně"
    const entity = "dny"
    const dny = cont("dny", 30, entity);
    const osoby = cont("osoby", 12, "osob");
    const osoboDnyEntity = { entity: "spotřeba", unit: "osobodenni" };

    const prvniExpedice = cont("první expedice", "x", "osob");
    return {
        spotreba: {
            deductionTree: deduce(
                deduce(
                    compRatio("nově", "původně", 5 / 6),
                    proportion(false, ["zásoby masa", "počet dní"])
                ),
                cont("původně", 30, entity)
            )
        },
        velikostExpedice: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont(newState, 45, entity),
                        cont(currentState, 30, entity),
                        ctor("comp-ratio")
                    ),
                    proportion(true, ["velikost expedice", "počet dní"])
                ),
                cont(currentState, 12, "osob")
            )
        },
        zasoby: {
            deductionTree: deduce(
                deduce(
                    dny,
                    osoby,
                    productCombine("spotreba", osoboDnyEntity)
                ),
                deduce(
                    deduce(
                        prvniExpedice,
                        cont("první expedice", 4, entity),
                        productCombine("první expedice", osoboDnyEntity)
                    ),
                    deduce(
                        deduce(
                            compRatio("druhá expedice", "první expedice", 2),
                            prvniExpedice
                        ),
                        cont("druhá expedice", 8, entity),
                        productCombine("druhá expedice", osoboDnyEntity)
                    ),
                    sum("obě expedice")
                ),
                ctorLinearEquation("první expedice", { entity: "osob" }, "x")
            )
        }
    }
}
function lyzarskaPermice() {

    const entity = "korun"
    const jednodenni = cont("jednodenní", 600, entity)
    const porovnani = compRelativePercent("třídenní", "jednodenní", 150)
    return {
        porovnani: {
            deductionTree: deduce(
                compRelativePercent("třídenní", "jednodenní", 150),
                ctor("convert-percent")
            )
        },
        triJednodenni: {
            deductionTree: deduce(
                deduce(
                    jednodenni,
                    counter("třikrát", 3),
                    product("tři jednodenní")
                ),
                deduce(
                    porovnani,
                    jednodenni
                )
            )
        }

    }
}

function cestaDoPrace() {
    const entity = "doba";
    const unit = "minut";
    const bus = cont("autobus", "x", entity);
    const busVsRychlik = compRatio("autobus", "rychlík", 2);
    const vlakVsBus = compRelative("osobní vlak", "autobus", 1 / 4);

    return {
        rychlik: {
            deductionTree: deduce(
                busVsRychlik,
                bus,
            )
        },
        vlak: {
            deductionTree: deduce(
                vlakVsBus,
                bus
            )
        },
        autobus: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        vlakVsBus,
                        busVsRychlik,
                    ),
                    comp("rychlík", "osobní vlak", -15, { entity, unit })
                ),
                busVsRychlik
            )
        }
    }
}

function dort() {
    const dim = dimensionEntity();
    const stranaCtverce = deduce(
        deduce(
            contArea("plocha řezu dortu", 200),
            counter("polovina", 1 / 2),
            ctorScale("čtverec")
        ),
        evalExprAsCont("sqrt(x)", { kind: 'cont', agent: "strana čtverce", ...dim.length })
    )
    return {
        prumerTacu: {
            deductionTree: deduce(
                deduce(
                    contArea("π * obsah", 144),
                    evalExprAsCont("sqrt(x)", { kind: 'cont', agent: "poloměr (r)", ...dim.length })
                ),
                double(),
                product("průměr")
            )
        },
        objemDortu: {
            deductionTree: deduce(
                deduce(
                    to(
                        stranaCtverce,
                        commonSense("strana čtverce = poloměr dortu"),
                        contLength("poloměr dortu", lastQuantity(stranaCtverce))
                    ),
                    evalExprAsCont("π * r^2", { kind: 'cont', agent: "podstava dortu", ...dim.area })
                ),
                to(
                    last(stranaCtverce),
                    commonSense("strana čtverce = výška dortu"),
                    contLength("výška dortu", lastQuantity(stranaCtverce))
                ),
                productVolume("dort")
            )
        }
    }
}

function kosikar() {
    const entity = "pomlázka"
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    deduce(
                        ratio("prodáno celkem za dva dny", "prodáno 1.den", 1 / 5),
                        ctorComplement("prodáno 2.den")
                    ),
                    ctorComplementCompRatio("prodáno 1.den")
                ),
                comp("prodáno 2.den", "prodáno 1.den", 180, entity)
            ),
            ctorOption("A", 60)
        )
    }
}

function procenta() {
    const entity = "členi"
    const letos = cont("letos", 60, entity);
    const vstupenkyEntity = "vstupenky"

    const den2 = cont("2.den", 3, entity);
    const den3 = deduce(
        den2,
        compRelative("3.den", "2.den", 1 / 3)
    )

    return {
        skauti: {
            deductionTree: deduce(
                deduce(
                    letos,
                    deduce(
                        letos,
                        comp("letos", "loni", 20, entity)
                    ),
                    ctorComparePercent()
                ),
                ctorOption("D", 50, { asPercent: true })
            )
        },
        kapesne: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        ratio("kapesné", "utraceno celkem", 3 / 5),
                        ratio("utraceno celkem", "nákup turistické známky", 3 / 4),
                    ),
                    ctor("convert-percent"),
                ),
                ctorOption("C", 45, { asPercent: true })
            )
        },
        vstupenky: {
            deductionTree: deduce(
                deduceAs("zvolíme vhodné číslo pro počet členů 1.den, např. 1.den = 3 členi")(
                    den3,
                    deduce(
                        cont("1.den", 3, entity),
                        den2,
                        last(den3),
                        sum("celkem")
                    ),
                    ctorPercent()
                ),
                ctorOption("B", 40, { asPercent: true })
            )
        }
    }

}

function kosoctverec() {
    const dim = dimensionEntity()

    const stranaKosoctverec = deduce(
        contLength("trojúhelník kratší strana", 3),
        contLength("trojúhelník delší strana", 4),
        pythagoras("přepona", ["kratší strana", "delší strana"])
    );
    return {
        obsah: {
            deductionTree: deduce(
                deduceAs("samotné přemístěním 4 trojúhelníků sekládaných jako obdelník, resp. kosočtverec nemá vliv na obsah, pouze se změnil tvar obrazce nikoliv však jeho celková plocha")(
                    contLength("obdelník kratší strana", 3),
                    contLength("obdelník delší strana", 8),
                    productArea("obdelník = kosočtverec")
                ),
                ctorBooleanOption(24, "greater")
            )
        },
        strana: {
            deductionTree: deduceAs("strana kosočtverce je rovna přeponě v trojúhlníku")(
                stranaKosoctverec,
                ctorBooleanOption(5)
            )
        },
        vyska: {
            deductionTree: deduce(
                deduce(
                    deduceAs("vztah pro obsah kosočtverce (obsah = strana x výška => výška = obsah / strana)")(
                        contLength("obdelník kratší strana", 3),
                        contLength("obdelník delší strana", 8),
                        productArea("obdelník = kosočtverec")
                    ),
                    last(stranaKosoctverec),
                    evalExprAsCont("obsah / strana", { kind: 'cont', agent: 'výška', ...dim.length })
                ),
                ctorBooleanOption(4.8)
            )
        }
    }
}

function hranol() {
    const dim = dimensionEntity();
    const stranaZakladna = contLength("základna", 24)
    const vyska = toCont(deduce(
        deduceAs("doplnění trojúhleník na obdelník, tak že ho složím ze dvou stejných trojúhleníku")(
            contArea("základna", 60),
            double(),
            ctorScale("obdelník")
        ),
        stranaZakladna,
        ctor("quota")),
        { agent: "výška", entity: dim.length }
    )

    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    vyska,
                    stranaZakladna,
                    last(vyska),
                    productVolume("kvádr")
                ),
                counter("zmenšení", 2),
                ctorScaleInvert("hranol")
            ),
            ctorOption("C", 300)
        )
    }
}

function vzorCtverce() {
    const entity = "pole"

    const position = "pozice"
    const pattern = squareNumbersPattern({ entity });
    const currentPosition = deduce(
        cont("obrazec", 400, entity),
        pattern,
        nth(position)
    )


    return {
        pridano: {
            deductionTree: deduceAs("vzor opakování, resp. počet přídaných polí je závislý na pozici = (4 x spodní, horní, levé a pravá okraje) - 4 za rohové prvky")(
                cont("9. obrazec", 9, position),
                evalExprAsCont("(4 * n) - 4", { kind: 'cont', agent: "přidaná pole na 9. obrazec", entity })
            )
        },
        rozdil: {
            deductionTree: deduce(
                deduceAs("u sudých obrazců tmavá")(
                    cont("10. obrazec", 10, position),
                    pattern,
                ),
                deduceAs("u sudých obrazců světlá")(
                    cont("9. obrazec", 9, position),
                    pattern
                ),
                ctorDifference("rozdíl",)
            )
        },
        pocet: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        currentPosition,
                        cont("posun na další obrazec", 1, position),
                        ctorSlide("následující obrazec")
                    ), pattern
                ),
                deduce(
                    deduce(
                        last(currentPosition),
                        cont("posun na předchozí obrazec", 1, position),
                        ctorSlideInvert("předchozí obrazec")
                    ), pattern
                ),
                ctor("tuple")
            )
        }


    }
}


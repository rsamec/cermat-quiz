import { commonSense, compAngle, compRatio, cont, ctor, ctorComplement, ctorDifference, ctorComparePercent, ctorUnit, pythagoras, rate, ratio, sum, product, ctorSlide, double, ctorPercent, ctorOption, compRelative, compRelativePercent, type Container, evalExprAsCont, ctorScaleInvert, ctorBooleanOption, triangleAngle, counter, proportion, productCombine, ctorLinearEquation, comp, ctorScale } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, lastQuantity, to, toCont, toPredicate } from "../../utils/deduce-utils";

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
    8.2: () => dort().objemDortu

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
    const entity = "délka"
    const unit = "cm"
    const entity2d = "obsah"
    const unit2d = "cm2"
    const stranaCtverce = deduce(
        deduce(
            cont("plocha řezu dortu", 200, entity2d, unit2d),
            counter("polovina", 1 / 2),
            ctorScale("čtverec")
        ),
        evalExprAsCont("sqrt(x)", { kind: 'cont', agent: "strana čtverce", entity, unit })
    )
    return {
        prumerTacu: {
            deductionTree: deduce(
                deduce(
                    cont("π * obsah", 144, entity2d, unit2d),
                    evalExprAsCont("sqrt(x)", { kind: 'cont', agent: "poloměr (r)", entity, unit })
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
                        cont("poloměr dortu", lastQuantity(stranaCtverce), entity, unit)
                    ),
                    evalExprAsCont("π * r^2", { kind: 'cont', agent: "podstava dortu", entity: entity2d, unit: unit2d })
                ),
                to(
                    last(stranaCtverce),
                    commonSense("strana čtverce = výška dortu"),
                    cont("výška dortu", lastQuantity(stranaCtverce), entity, unit)
                ),
                productCombine("dort", { entity: "objem", unit: "cm3" })
            )
        }
    }
}


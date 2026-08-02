import { cont, rate, ctorUnit, compRelative, ctorDifference, nthPart, dimensionEntity, contArea, sum, ctor, ctorRate, ctorOption, comp, counter, evalFormulaAsCont, formulaRegistry, contLength, compRatio, ctorCompDiff, ctorBooleanOption, ctorBooleanOption } from "../../components/math";
import { createLazyMap, deduce, last, toRate } from "../../utils/deduce-utils";
import { aquapark } from "../M7A-2026/index";

export default createLazyMap({

    3.1: () => reznictvi().zaplaceno,
    3.2: () => reznictvi().mnozstvi,
    4.1: () => trideniLahvi().cibo,
    4.2: () => trideniLahvi().arex,
    4.3: () => trideniLahvi().bot,
    5.1: () => ctvercovaSit().sit,
    5.2: () => ctvercovaSit().obsahSedyObrazec,
    6.1: () => papirovyCtverec().strana,
    6.2: () => papirovyCtverec().obvodCtverce,
    6.3: () => papirovyCtverec().tretiObrazec,
    8.1: () => farmar().a,
    8.2: () => farmar().b,
    8.3: () => farmar().c,
    10: () => ({
        deductionTree: deduce(
            aquapark().zetony.deductionTree,
            ctorOption("C", 61)
        )
    }),
    12: () => aktivity(),
})

function reznictvi() {
    const entity = "korun"
    const entityBase = { entity: "hmotnost", unit: "kg" }
    const entityBaseInGram = { entity: "hmotnost", unit: "g" }
    const masoRate = rate("maso", 180, entity, entityBase)
    const masoRateInGram = deduce(
        masoRate,
        ctorUnit("g", "hmotnost")
    )
    return {
        zaplaceno: {
            deductionTree: deduce(
                masoRateInGram,
                cont("maso", 200, entityBaseInGram.entity, entityBaseInGram.unit)
            )
        },
        mnozstvi: {
            deductionTree: deduce(
                last(masoRateInGram),
                cont("maso", 54, entity)
            )
        },

    }
}

function trideniLahvi() {
    const entity = "lahve"
    const entityBase = { entity: "doba", unit: "min" }
    const ArexVsBot = compRelative("Bot", "Arex", 1 / 2);
    const ArexAndBot = cont("Arex a Bot", 250, entity);
    const ArexAndBotRate = rate("Arex a Bot", 250, { entity }, entityBase, 10)
    const Arex = deduce(
        ArexAndBot,
        ArexVsBot
    )
    return {
        cibo: {
            deductionTree: deduce(
                cont("Arex, Bot a Cibo", 900, entity),
                deduce(
                    ArexAndBotRate,
                    deduce(
                        cont("Arex a Bot", 1 / 2, entityBase.entity, "h"),
                        ctorUnit("min")
                    )
                ),
                ctorDifference("Cibo")
            )
        },
        arex: {
            deductionTree: Arex
        },
        bot: {
            deductionTree: deduce(
                toRate(
                    deduce(
                        ArexAndBot,
                        ArexVsBot,
                        nthPart("Bot")
                    ), { agent: ["Bot"], entityBase, baseQuantity: 10 }),
                cont("Bot", 360, entity)
            )
        }

    }
}

function ctvercovaSit() {
    const entity = "čtvereček"
    const bilyAgent = "bilý"
    const sedyAgent = "šedý"
    const sedyACernyAgent = "šedý a černý"
    const cernyAgent = "černý"
    const sitAgent = "čtvercová síť"

    const sitRate = deduce(
        contArea(bilyAgent, 60),
        deduce(
            cont([bilyAgent, "celá horní řadka"], 6, entity),
            cont([bilyAgent, "polovina tří řádek"], 9, entity),
            sum(bilyAgent)
        ),
        ctorRate(sitAgent)

    )
    return {
        sit: {
            deductionTree: sitRate,
        },
        obsahSedyObrazec: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont([sedyACernyAgent, "celá spodní řadka"], 6, entity),
                        cont([sedyACernyAgent, "polovina tří řádek"], 9, entity),
                        sum(sedyACernyAgent)
                    ),
                    deduce(
                        cont([cernyAgent, "polovina 1x2"], 1, entity),
                        cont([cernyAgent, "polovina 3x2"], 3, entity),
                        sum(cernyAgent)
                    ),
                    ctorDifference(sedyAgent)
                ),
                last(sitRate)
            )
        },

    }
}

function aktivity() {
    const entity = { entity: "doba", unit: "min" }
    const mirekAgent = "Mirek"
    const janekAgent = "Janek"
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    cont([mirekAgent, "hraní na počítači"], 3 * 45, entity.entity, entity.unit),
                    deduce(
                        cont([mirekAgent, "sledování videa"], 1 / 4, entity.entity, "h"),
                        ctorUnit("min")
                    ),
                    cont([mirekAgent, "chatovaní s kamarádem"], 15, entity.entity, entity.unit),
                    sum([mirekAgent, janekAgent].join())
                ),
                comp([janekAgent, "sportování"].join(), [janekAgent, "četba"].join(), 15, entity),
                ctor('comp-part-eq')
            ),
            ctorOption("A", 75)
        )
    }
}

function papirovyCtverec() {
    const dim = dimensionEntity();
    const entity = "strana"

    const stranaTrojuhelnikLabel = "rovnostranný trojúhleník"

    const stranaTrojuhlenik = deduce(
        comp("2.obrazec", "1.obrazec", 3, entity),
        comp("2.obrazec", "1.obrazec", 18, dim.length),
        ctorRate(stranaTrojuhelnikLabel)
    )

    const obvodCtverce = deduce(
        deduce(
            last(stranaTrojuhlenik),
            cont(stranaTrojuhelnikLabel, 3, entity),
        ),
        evalFormulaAsCont(formulaRegistry.circumReference.square, x => x.o, "čtverec", dim.length)
    )

    return {
        strana: {
            deductionTree: stranaTrojuhlenik
        },
        obvodCtverce: {
            deductionTree: obvodCtverce,
        },
        tretiObrazec: {
            deductionTree: deduce(
                contLength(["2.obrazec", "obvod navíc"], 18),
                contLength(["3.obrazec", "obvod navíc"], 18),
                sum("celkem navíc")
            )
        }

    }
}

function farmar() {
    const entityBase = { entity: "hmotnost", unit: "kg" }
    const entity = "korun"
    const jablkaL = "jablka"
    const broskveL = "broskve"
    const merunkyL = "meruňky"

    const merunkyRate = rate(merunkyL, 120, entity, entityBase)
    const jablkaRate = rate(jablkaL, 30, entity, entityBase)

    return {
        a: {
            deductionTree: deduce(
                deduce(
                    cont("pondělí", 15, entityBase.entity, entityBase.unit),
                    cont("úterý", 30, entityBase.entity, entityBase.unit),
                    cont("středa", 20, entityBase.entity, entityBase.unit),
                    cont("čtvrtek", 15, entityBase.entity, entityBase.unit),
                    sum("celý týden")
                ),
                ctorBooleanOption(80, "greater")
            )
        },
        b: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        compRatio(jablkaL, broskveL, 2),
                        cont("pátek, broskve", 60, entityBase.entity, entityBase.unit)
                    ),
                    cont("pondělí, broskve", 15, entityBase.entity, entityBase.unit),
                    ctorCompDiff("rozdíl")
                ),
                ctorBooleanOption(5)
            )
        },
        c: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            cont(["úterý", merunkyL], 30, entityBase.entity, entityBase.unit),
                            merunkyRate
                        ),
                        deduce(
                            cont(["úterý", jablkaL], 25, entityBase.entity, entityBase.unit),
                            jablkaRate
                        ),
                        sum(["úterý", merunkyL, jablkaL].join())
                    ),
                    deduce(
                        deduce(
                            cont(["čtvrtek", merunkyL], 20, entityBase.entity, entityBase.unit),
                            merunkyRate
                        ),
                        deduce(
                            cont(["čtvrtek", jablkaL], 45, entityBase.entity, entityBase.unit),
                            jablkaRate
                        ),
                        sum(["čtvrtek", merunkyL, jablkaL].join())
                    ),
                    ctorCompDiff("rozdíl v tržbě")
                ),
                ctorBooleanOption(0, "smaller")
            )
        },
    }
}

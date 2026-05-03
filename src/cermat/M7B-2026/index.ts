import { cont, ctor, ctorOption, sum, ctorDifference, contLength, ctorPercent, rate, doubleProduct, ctorUnit, compRelativePercent, compRelative, compDiff, comp, ctorLinearEquation, proportion, percent, ctorComplement, ctorBooleanOption, ratio, ctorComparePercent, contArea, evalFormulaAsCont, formulaRegistry, dimensionEntity, product, ratios, nthPart, halfProduct, sumCombine, ctorRestQuantity, ctorRateQuota, ctorQuota } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, toRate } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => krabice(),
    3.1: () => osa().dilek,
    3.2: () => osa().a,
    3.3: () => osa().b,
    4.1: () => stuha().a,
    4.2: () => stuha().b,
    5.1: () => farmar().pocetCuket,
    5.2: () => farmar().celkemCuket,
    7.1: () => kvadr().a,
    7.2: () => kvadr().b,
    10.1: () => hry().a,
    10.2: () => hry().b,
    10.3: () => hry().c,
    11: () => plasty(),
    12: () => podlaha(),
    13: () => nadrz().b,
    14: () => nadrz().c,
    15.1: () => procenta().a,
    15.2: () => procenta().b,
    15.3: () => procenta().c,
    16.1: () => hra().a,
    16.2: () => hra().b,
    16.3: () => hra().c,
})

function krabice() {
    const entity = "kapesník"
    return {
        deductionTree: deduce(
            cont("větší krabička", 200, entity),
            compRelative("větší krabička", "menší krabička", 1 / 4)
        )
    }
}
function osa() {
    const entityBase = "dílek"
    const entity = "hodnota"
    const A = cont("od výchozího bodu k A", 4, entityBase);
    const B = cont("od výchozího bodu k B", 7, entityBase);
    const prvniBod = cont("výchozí bod", 40, entity);
    const hodnotaDilku = deduce(
        deduce(
            cont("(A+B)", 168, entity),
            deduce(
                cont("A k výchozímu bodu", 40, entity),
                cont("B k výchozímu bodu", 40, entity),
                sum("(A+B) k výchozímu bodu")
            ),
            ctorDifference("osa")
        ),
        deduce(
            A,
            B,
            sum("osa")
        ),
        ctor("rate")
    )
    return {
        dilek: {
            deductionTree: hodnotaDilku,
        },
        a: {
            deductionTree: deduce(
                prvniBod,
                deduce(
                    last(hodnotaDilku),
                    A
                ),
                sum("A")
            )
        },
        b: {
            deductionTree: deduce(
                prvniBod,
                deduce(
                    last(hodnotaDilku),
                    B
                ),
                sum("B")
            )
        }
    }
}
function stuha() {
    const dim = dimensionEntity();

    const odstrizeno = deduce(
        deduce(
            contLength("odstřiženo", 1.7, "m"),
            ctorUnit("cm")
        ),
        contLength("odstřiženo", 6),
        ctor("quota")
    )
    return {
        a: {
            deductionTree: deduce(
                odstrizeno,
                ratios("odstřiženo", ["bílý", "červený"], [1, 1]),
            )
        },
        b: {
            deductionTree: deduce(
                contLength("proužek", 6),
                deduce(last(odstrizeno), ctorRestQuantity(["odstřižení zbytek"])),
                ctorDifference("stuha zbytek"),
            )
        }
    }
}
function farmar() {
    const entityBase = "bedna"
    const entity = "cuketa"
    const agent = "farmář"

    const prodano = cont("prodáno", 310, entity);

    const male = cont(["sklizeno", "malé"], 4, entityBase)
    const stredni = cont(["sklizeno", "střední"], 3, entityBase)

    const comparison = comp("střední", "malé", 30, entity)

    const malaRate = rate(["prodané", "malé"], "x", entity, entityBase)
    const malaRateHodnota = deduce(
        deduce(
            deduce(
                deduce(
                    compDiff(["sklizeno", "malé"].join(), ["prodané", "malé"].join(), 1, entityBase),
                    male
                ),
                malaRate,
            ),
            deduce(
                deduce(
                    compDiff(["sklizeno", "střední"].join(), ["prodané", "střední"].join(), 1, entityBase),
                    stredni,
                ),
                deduce(
                    malaRate,
                    comparison
                )
            ),
            sum("prodáno")
        ),
        prodano,
        ctorLinearEquation("malá", { entity }, "x")
    )
    const malaRateHodnotaRate = toRate(last(malaRateHodnota), { agent: ["sklizeno", "malé"], entityBase: { entity: entityBase }, baseQuantity: 1 })
    return {
        pocetCuket: {
            deductionTree: malaRateHodnota,
        },
        celkemCuket: {
            deductionTree: deduce(
                deduce(
                    malaRateHodnotaRate,
                    male
                ),
                deduce(
                    deduce(
                        malaRateHodnotaRate,
                        comparison,
                    ),
                    stredni
                ),
                cont(["sklizeno", "velké"], 120, entity),
                sum("sklizeno")
            )

        }

    }
}

function hry() {
    const finishedEntity = "dohrané hry";
    const workingEntity = "rozehrané hry";
    const leden = "leden"
    const unor = "únor"
    const brezen = "březen"
    const duben = "duben"
    const kveten = "květen"

    return {
        a: {
            deductionTree: deduce(
                deduce(
                    cont(leden, 2, workingEntity),
                    cont(unor, 1, workingEntity),
                    ctor('delta')
                ),
                ctorBooleanOption(-1)
            )
        },
        b: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont(unor, 1, workingEntity),
                        cont(unor, 2, finishedEntity),
                        sumCombine(`${unor} celkem`, "hry")
                    ),
                    deduce(
                        cont(brezen, 3, workingEntity),
                        cont(brezen, 3, finishedEntity),
                        sumCombine(`${brezen} celkem`, "hry")
                    ),
                    ctor('delta')
                ),
                ctorBooleanOption(2)
            )
        },
        c: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont(brezen, 3, finishedEntity),
                        cont(duben, 5, finishedEntity),
                        ctor('delta')
                    ),
                    deduce(
                        cont(duben, 5, finishedEntity),
                        cont(kveten, 5, finishedEntity),
                        ctor('delta')
                    )
                ),
                ctorBooleanOption(0)
            )
        }

    }
}

function kvadr() {
    const podstava = contArea("podstava", 54);
    const strany = ratios("strany", ["podstava", "větší boční strana", "menší boční strana"], [6, 15, 10]);
    const vetsiBok = deduce(
        podstava,
        strany,
        nthPart("větší boční strana")
    )

    const mensiBok = deduce(
        podstava,
        strany,
        nthPart("menší boční strana")
    )
    return {
        a: {
            deductionTree: deduce(
                deduce(
                    podstava,
                    vetsiBok,
                    mensiBok,
                    sum("3 boční strany dohromady")
                ),
                ...doubleProduct("kvádr")
            )
        },
        b: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        last(vetsiBok),
                        ...halfProduct("šedý rovnoběžník na větší boční straně")
                    ),
                    deduce(
                        last(mensiBok),
                        ...halfProduct("šedý rovnoběžník na menší boční straně")
                    ),
                    sum("2 šedé rovnoběžníky dohromady")
                ),
                ...doubleProduct("všechny šedé rovnoběžníky")
            )
        }
    }
}

function nadrz() {
    const entity = "čerpadla"
    const entityTime = { entity: "čas", unit: "min" }
    return {
        b: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        compRelative("B", "A", 1 / 2),
                        proportion(true, ["čerpadla", "doba"])
                    ),
                    cont("A", 6, entity)
                ),
                ctorOption("C", 4)
            )
        },
        c: {
            deductionTree: deduce(
                deduce(
                    cont("část C", 18, entityTime.entity, entityTime.unit),
                    deduce(
                        compRelativePercent("C", "A", -25),
                        cont("A", 40, entityTime.entity, entityTime.unit)
                    ),
                    ctorPercent()
                ),
                ctorOption("C", 60, { asPercent: true })
            )
        }
    }
}
function podlaha() {
    const dlazdice = deduce(
        contArea("dlaždice", 25),
        evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.a, "dlaždice strana", dimensionEntity().length)
    )
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    deduce(
                        contLength("délka", 2, "m"),
                        ctorUnit("cm")
                    ),
                    dlazdice,
                    ctor("quota")
                ),
                deduce(
                    deduce(
                        contLength("šírka", 1.25, "m"),
                        ctorUnit("cm")
                    ),
                    last(dlazdice),
                    ctor("quota")
                ),
                product("dlaždice")
            ),
            ctorOption("A", 1000)
        )
    }
}
function plasty() {
    const entity = "plastová víčka";
    const trickaRate = rate("výroba", 5, entity, "tričko")
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    cont("výroba", 1_200, entity),
                    deduce(
                        percent("výroba", "nepoužitelná", 15),
                        ctorComplement("použitelná")
                    )
                ),
                trickaRate
            ),
            ctorOption("B", 204)
        )
    }
}

function komora() {
    return {
        deductionTree: deduce
    }
}

function procenta() {
    const entity = "míst"
    const celkem = cont("celkem", 300, entity);
    const muzi = cont("muži", 108, entity);
    const zeny = cont("ženy", 120, entity);

    const obsazeno = deduce(
        muzi,
        zeny,
        sum("obsazeno")
    );
    const neobsazeno = deduce(
        celkem,
        obsazeno,
        ctorDifference("neobsazeno")
    )

    return {
        a: {
            deductionTree: deduce(
                deduce(
                    neobsazeno,
                    celkem,
                    ctorPercent()
                ),
                ctorOption("E", 24, { asPercent: true })
            )
        },
        b: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            last(obsazeno),
                            deduce(
                                ratio("neobsazeno", "zaplaceno", 1 / 6),
                                last(neobsazeno)
                            ),
                            sum("zaplaceno")
                        ),
                        celkem,
                        ctorPercent()
                    ),
                    ctorComplement("nezaplaceno")
                ),
                ctorOption("D", 20, { asPercent: true })
            )
        },
        c: {
            deductionTree: deduce(
                deduce(
                    muzi,
                    zeny,
                    ctorComparePercent(),
                ),
                ctorOption("A", 10, { asPercent: true })
            )
        }
    }
}

function hra() {

    const entityTyc = "tyč"
    const entityDeska = "deska"
    const entityPrkna = "prkno"
    const entityOhrada = "ohrada"

    const agentHra = "spotřeba"

    const prknaRate = rate(agentHra, 4, entityPrkna, entityDeska)
    const tycRate = rate(agentHra, 5, entityTyc, entityPrkna, 2)
    const ohradaPrknaRate = rate(agentHra, 3, entityPrkna, entityOhrada)
    const ohradaTycRate = rate(agentHra, 2, entityTyc, entityOhrada)


    const vypocetPotreba = (ohrada, quota) => deduce(
        deduce(
            deduceAs("přímá spotřeba")(
                ohrada,
                ohradaPrknaRate,
            ),
            deduceAs("spotřeba výměnou za tyče")(
                deduce(
                    ohrada,
                    ohradaTycRate,
                ),
                tycRate,
                quota,
            ),
            sum(agentHra)
        ),
        prknaRate,
        quota
    )


    const vypocetPotrebaZbytek = (ohrada, quota, zbytek) => {
        const neprimaSpotreba = deduceAs("spotřeba výměnou za tyče")(
            deduce(
                ohrada,
                ohradaTycRate,
            ),
            tycRate,
            quota
        );
        return deduce(
            deduce(
                deduce(
                    deduce(
                        deduceAs("přímá spotřeba")(
                            ohrada,
                            ohradaPrknaRate,
                        ),
                        neprimaSpotreba,
                        sum(agentHra)
                    ),
                    prknaRate,
                    quota
                ),
                zbytek),
            deduce(
                deduce(
                    last(neprimaSpotreba),
                    zbytek,
                ),
                ctor('invert')
            ),
            ctor('tuple')
        )
    }


    const ohradaTycPrkaRate = deduce(
        deduce(
            ohradaTycRate,
            tycRate,
            ctor('rate')
        ),
        ohradaPrknaRate,
        sum('spotřeba společně na ohradu')
    )
    const vypocetPrumer = celkemDesek => deduce(
        deduce(
            celkemDesek,
            prknaRate
        ),
        ohradaTycPrkaRate
    )

    return {
        a: {
            deductionTree: vypocetPotreba(cont(agentHra, 3, entityOhrada), ctorRateQuota(undefined, 'ceil'))
        },
        b: {
            deductionTree: vypocetPotrebaZbytek(cont(agentHra, 6, entityOhrada), ctorRateQuota(undefined, "ceil"), ctorRestQuantity("nespotřebovaný zbytek")),
            convertToTestedValue: d => d.items[1].quantity
        },
        c: {
            deductionTree: vypocetPrumer(cont(agentHra, 19, entityDeska))
        }
    }
}
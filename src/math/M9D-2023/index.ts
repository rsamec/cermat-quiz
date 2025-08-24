import { commonSense, compAngle, compRatio, cont, ctor, ctorComplement, ctorDifference, ctorComparePercent, ctorUnit, pythagoras, rate, ratio, sum, product, ctorSlide, double, ctorPercent, ctorOption, compRelative, compRelativePercent, type Container, evalExprAsCont, ctorScaleInvert, ctorBooleanOption, triangleAngle, contLength, contArea, dimensionEntity, triangularNumbersPattern, nthPart, comp } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, lastQuantity, to, toCont, toPredicate } from "../../utils/deduce-utils";


export default createLazyMap({
    16.1: () => obrazce().pocetUsecek,
    16.2: () => obrazce().rozdilPuntiku,
    16.3: () => obrazce().pocetUsecekPro300Puntiku,
})

function obrazce() {
    const entity = "pater";
    const trojUhelnik = "trojúhleník";
    const usecky = "úsečka"
    const puntiky = "puntiky"


    const useckaVsTrojuhelnik = compRatio(usecky, trojUhelnik, 3)
    const posledniObrazec = deduce(
        comp("poslední obrazec", "předposlední obrazec", 96, usecky),
        useckaVsTrojuhelnik,
        ctor('comp')
    )

    return {
        pocetUsecek: {
            deductionTree: deduce(
                deduce(
                    cont("obrazec č.5", 5, entity),
                    triangularNumbersPattern({ entity: trojUhelnik })
                ),
                useckaVsTrojuhelnik                
            )
        },
        rozdilPuntiku: {
            deductionTree: to(
                commonSense("počet puntíků = počet trojúhleníků v následujícím obrazci"),
                posledniObrazec,
                cont("přidáno v posledním obrazci + 1", lastQuantity(posledniObrazec) + 1, "puntíky")
            )
        },
        pocetUsecekPro300Puntiku: {
            deductionTree: deduce(
                to(
                    commonSense("počet puntíků = počet trojúhleníků v následujícím obrazci"),
                    cont("obrazec", 300, puntiky),
                    cont("následující obrazec", 300, trojUhelnik)
                ),
                useckaVsTrojuhelnik
            )
        }
    }
}

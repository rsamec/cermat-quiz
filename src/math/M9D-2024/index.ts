import { compRatio, cont, ctor, rate, compRelativePercent, comp, contLength, dimensionEntity, ctorUnit, ctorComparePercent } from "../../components/math";
import { createLazyMap, deduce, last, toCont } from "../../utils/deduce-utils";


export default createLazyMap({
    1: () => trasa(),
    // 2: () => reproduktory(),
})

function trasa() {
    const dim = dimensionEntity();

    const baseEntity = "krok";
    const adam = "Adam"
    const nada = "Naďa"

    const trasaKm = contLength("trasa", 2.7, "km");

    const trasa = deduce(
        trasaKm,
        ctorUnit("cm")
    );

    return {
        deductionTree: deduce(
            toCont(deduce(
                trasa,
                rate(nada, 60, dim.length, baseEntity),
            ), { agent: nada }),
            toCont(deduce(
                rate(adam, 75, dim.length, baseEntity),
                last(trasa)
            ), { agent: adam }),
            ctor("comp")
        )
    }
}

function reproduktory() {
    const puvodne = "původně"
    const novePoSleve1 = "před Vánoci"
    const novePoSleve2 = "po Vánocích"
    const entity = "korun"

    const zlevneni1 = comp(novePoSleve1, puvodne, -150, entity);
    const zlevneni2 = comp(novePoSleve2, novePoSleve1, -200, entity);

    const puvodniCena = deduce(
        compRelativePercent(novePoSleve1, puvodne, -15),
        zlevneni1
    );

    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    puvodniCena,
                    zlevneni1,
                ),
                zlevneni2
            ),
            puvodniCena,
            ctorComparePercent()
        )
    }
}

function rychlik() {
    const trida1 = "1.třída"
    const trida2 = "2.třída"

    const entityBase = "vagón"
    const kupeEntity = "kupé"
    const mistaEntity = "místa k sezení"

    const kupeRate = rate("vlak", 10, kupeEntity, entityBase)
    const trida1Mista = rate(trida1, 6, mistaEntity, kupeEntity)
    const trida2Mista = rate(trida2, 8, mistaEntity, kupeEntity)

    const celkem = cont("vlak", 440, mistaEntity)
    return {
        vagon: {
            deductionTree: deduce(
                compRatio(trida2, trida1, 2)
            )
        },
        mista: {
            deductionTree: deduce()
        }

    }
}

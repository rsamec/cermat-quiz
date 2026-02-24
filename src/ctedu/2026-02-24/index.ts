import { ctor, ctorOption, cont, ctorPercent } from "../../components/math";
import { organizatoriPercent, uhly } from "../../math/M9A-2025/index";
import { uhelAlfa, zahrada } from "../../math/M9B-2025/index";
import { rodinnyDum } from "../../math/M9C-2025/index";
import { createLazyMap, deduce } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => tabor(),
    2: () => organizatoriPercent(),
    5.1: () => uhly().alfa,
    5.2: () => uhly().beta,
    5.3: () => uhly().gamma,
    6.1: () => rodinnyDum().a,
    6.2: () => rodinnyDum().b,
    6.3: () => rodinnyDum().c,
    7.1: () => zahrada().jabloneVsMagnolie,
    7.2: () => zahrada().levanduleABazalkaVsHortenzie,
    7.3: () => zahrada().ruzePlocha,
    8: () => uhelAlfa()
})

function tabor() {
    const entity = "děti";
    const entityBase = "vedoucí"
    const deti = cont("tábor", 80, entity);
    const vedouci = cont("tábor", 5, entityBase);

    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    deti,
                    vedouci,
                    ctor('rate')
                ),
                deti,
                ctorPercent(),
            ),
            ctorOption("A", 20, { asPercent: true })
        )
    }
}

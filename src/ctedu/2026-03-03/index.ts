
import { zahon } from "../../math/M9A-2025/index";
import { pravouhlyLichobeznik, salaty, tabor } from "../../math/M9B-2025/index";
import { createLazyMap, deduce } from "../../utils/deduce-utils";

export default createLazyMap({
    1.1: () => zahon().obvod,
    1.2: () => zahon().rozdilPocetRostlin,
    1.3: () => zahon().nejmensiPocetCerveneKvetoucich,
    2: () => pravouhlyLichobeznik().obvodRovnobeznikExpanded,
    3: () => tabor().mladsiPercent,
    4.1: () => salaty().druhyDenTrzba,
    4.2: () => salaty().druhyDenVyrazSPromenou,
    4.3: () => salaty().pocetSalatu,


})

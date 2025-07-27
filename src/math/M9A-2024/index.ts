import { createLazyMap } from "../../utils/deduce-utils";
import { rozdilUhlu } from "./angle";
import dumMeritko from "./dum-meritko";
import dvaCtverce from "./dva-ctverce";
import { example1, example2, example3 } from "./kolo";
import obrazec from "./obrazec";
import svadleny from "./svadleny";
import tanga from "./tanga";
import tezitko from "./tezitko";
import tridaSkupiny from "./trida-skupiny";


const tridaSkupinyParams = {
  input: {
    chlapci: 14,
    anglictinaChlapci: 5,
    nemcinaDivky: 4
  }
}

const dumMeritkoParams = {
  input: {
    sirkaM: 10,
    planSirkaCM: 10,
    planDelkaDM: 2,
  }
}

export default createLazyMap({
  1: () => svadleny({ input: { currentWorker: 4, previousWorker: 5, previousHours: 24 } }),
  2: () => tezitko({
    input: {
      out: {
        radius: 10,
        height: 12,
      },
      in: {
        radius: 5,
        height: 8
      }
    }
  }),
  7.1: () => tridaSkupiny(tridaSkupinyParams)[0],
  7.2: () => tridaSkupiny(tridaSkupinyParams)[1],
  8.1: () => tanga({ input: { tangaWidth: 20 } })[0],
  8.2: () => tanga({ input: { tangaWidth: 20 } })[1],
  11: () => rozdilUhlu({ input: { delta: 107, beta: 23 } }),
  12: () => obrazec({ input: { obvod: 30 } }),
  13: () => dvaCtverce({ input: { rozdilObvod: 6, obdelnikCtvAStrana: 1 / 2, obdelnikCtvBStrana: 1 / 5 } }),
  15.1: () => dumMeritko(dumMeritkoParams)[0],
  15.2: () => dumMeritko(dumMeritkoParams)[1],
  15.3: () => dumMeritko(dumMeritkoParams)[2],
  16.1: () => example1({ input: { base: 20_000, percentage: 13.5 } }),
  16.2: () => example2({ input: { vlozeno: 1_000_000, urokPercentage: 2.5, danPercentage: 15 } }),
  16.3: () => example3({ input: { base: 20_000, percentageDown: 10, percentageNewUp: 10 } }),
})


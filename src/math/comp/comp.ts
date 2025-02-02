
import { cont, ratio, ctor, comp, compRelative, compRatio, ctorRatio, ctorRatios } from "../../components/math.js";
import type { PartWholeRatio, Container } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";



export function diffPartToWhole({ partRatio, whole }: { partRatio: PartWholeRatio, whole: Container },
  partDiffAgent?: string) {
  return deduce(
    deduce(
      partRatio,
      ctorRatio(partDiffAgent ?? "zbytek"),
    ),
    whole
  )
}

export function diffPartToPart({ partRatio, whole }: { partRatio: PartWholeRatio, whole: Container },
  partDiffAgent?: string) {
  return deduce(
    deduce(
      partRatio,
      ctorRatios(partDiffAgent ?? "zbytek"),
    ),
    whole
  )
}


export function examplePartEq({ input }: {
  input: {
    whole: number;
    diff: number;
  }
}) {
  const agentA = "výrobek A";
  const agentB = "výrobek B"
  const agentWhole = "celkem";
  const entity = "Kč";

  const whole = axiomInput(cont(agentWhole, input.whole, entity), 1);
  const compare = axiomInput(comp(agentA, agentB, input.diff, entity), 2);

  const template = highlight => highlight`
    Cena za výrobek A a B je celkem ${input.whole} Kč.
    Výrobek A je o  ${input.diff + (input.diff > 0 ? ` dražší` : ' levnější')} než výrobek B.
    Kolik stojí druhý výrobek?`;

  return [
    { deductionTree: deduce(compare, whole, ctor('comp-part-eq')), template },
  ]
}


export function examplePartToWhole({ input }: {
  input: {
    whole: number;
    partRatio: number;
  }
}) {
  const agentPart = "výrobek A";
  const agentRestPart = "výrobek B"
  const agentWhole = "celkem";
  const entity = "Kč";

  const whole = axiomInput(cont(agentWhole, input.whole, entity), 1);
  const partRatio = axiomInput(ratio("celkem", agentPart, input.partRatio), 2);

  const template = highlight => highlight`
    Cena za výrobek A a B je celkem ${input.whole} Kč.
    Výrobek A je ${input.partRatio} z celkem.
    Kolik stojí výrobek B?`;

  return [
    { deductionTree: diffPartToWhole({ partRatio, whole }, agentRestPart), template },
  ]
}

export function exampleComparePartToWhole({ input }: {
  input: {
    part: number;
    partRatio: number;
    second: boolean,
  }
}) {
  const agentFirst = "výrobek A";
  const agentSecond = "výrobek B"
  const entity = "Kč";

  const part = axiomInput(cont(input.second ? agentSecond : agentFirst, input.part, entity), 1);

  const template1 = highlight => highlight`
    Cena ${`${input.second ? agentSecond : agentFirst} je ${input.part}`} Kč.
    Výrobek A je relativně o ${`${Math.abs(input.partRatio)} ${input.partRatio > 0 ? 'dražší' : 'levnější'}`} než výrobek B.
    Kolik stojí druhý výrobek?`;

  const template2 = highlight => highlight`
    Cena ${`${input.second ? agentSecond : agentFirst} je ${input.part}`} Kč.
    Výrobek A je ${`${Math.abs(input.partRatio)} krát ${input.partRatio > 0 ? 'dražší' : 'levnější'}`} než výrobek B.
    Kolik stojí druhý výrobek?`;

  return [
    { deductionTree: deduce(axiomInput(compRelative(agentFirst, agentSecond, input.partRatio), 2), part), template: template1 },
    { deductionTree: deduce(axiomInput(compRatio(agentFirst, agentSecond, input.partRatio), 2), part), template: template2 },

  ]
}

export function exampleDiffPartToWhole({ input }: {
  input: {
    diff: number;
    partRatio: number;
  }
}) {
  const agentFirst = "výrobek A";
  const agentSecond = "výrobek B"
  const entity = "Kč";

  const diff = axiomInput(comp(agentFirst, agentSecond, input.diff, entity), 1);

  const template1 = highlight => highlight`
    Rozdíl cen ${agentFirst} a ${agentSecond} je ${input.diff} Kč.
    Výrobek A je relativně o ${`${Math.abs(input.partRatio)} ${input.partRatio > 0 ? 'dražší' : 'levnější'}`} než výrobek B.
    Kolik stojí druhý výrobek?`;

  const template2 = highlight => highlight`
    Rozdíl cen ${agentFirst} a ${agentSecond} je ${input.diff} Kč.
    Výrobek A je ${`${Math.abs(input.partRatio)} krát ${input.partRatio > 0 ? 'dražší' : 'levnější'}`} než výrobek B.
    Kolik stojí druhý výrobek?`;

  return [
    { deductionTree: deduce(axiomInput(compRelative(agentFirst, agentSecond, input.partRatio), 2), diff), template: template1 },
    // { deductionTree: deduce(axiomInput(compRatio(agentFirst, agentSecond, input.partRatio), 2), diff), template: template2 },

  ]
}


export function examplePartToPart({ input }: {
  input: {
    whole: number;
    partRatio: number;
  }
}) {
  const agentPart = "výrobek A";
  const agentRestPart = "výrobek B"
  const agentWhole = "celkem";
  const entity = "Kč";

  const whole = axiomInput(cont(agentWhole, input.whole, entity), 1);
  const partRatio = axiomInput(ratio(agentWhole, agentPart, input.partRatio), 2);

  const template = highlight => highlight`
    Cena za výrobek A a B je celkem ${input.whole} Kč.
    Výrobek A je ${input.partRatio} z celkem.
    Kolik stojí druhý výrobek?`;

  return [
    { deductionTree: diffPartToPart({ partRatio, whole }, agentRestPart), template }]

}
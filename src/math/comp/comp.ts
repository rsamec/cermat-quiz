
import { cont, ratio, ctorPartToPartDiff, ctorPartToWholeDiff, ctor, comp, compRelative, compRatio } from "../../components/math.js";
import type { PartWholeRatio, Container } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";



export function diffPartToWhole({ partRatio, whole }: { partRatio: PartWholeRatio, whole: Container },
  labels: { partDiffAgent?: { agent: string, entity: string } } = {}) {
  const { partDiffAgent } = { ...{ partDiffAgent: "zbytek" }, ...labels }
  return deduce(
    deduce(
      partRatio,
      ctorPartToWholeDiff(partDiffAgent),
    ),
    whole
  )
}

export function diffPartToPart({ partRatio, whole }: { partRatio: PartWholeRatio, whole: Container },
  labels: { partDiffAgent?: { agent: string, entity: string } } = {}) {
  const { partDiffAgent } = { ...{ partDiffAgent: "zbytek" }, ...labels }
  return deduce(
    deduce(
      partRatio,
      ctorPartToPartDiff(partDiffAgent),
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
  const partRatio = axiomInput(ratio({ agent: "celkem", entity }, agentPart, input.partRatio), 2);

  const template = highlight => highlight`
    Cena za výrobek A a B je celkem ${input.whole} Kč.
    Výrobek A je ${input.partRatio} z celkem.
    Kolik stojí výrobek B?`;

  return [
    { deductionTree: diffPartToWhole({ partRatio, whole }, { partDiffAgent: { agent: agentRestPart, entity } }), template },
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

  const part = axiomInput(cont(input.second ? agentSecond: agentFirst, input.part, entity), 1);

  const template1 = highlight => highlight`
    Cena ${`${input.second ? agentSecond : agentFirst} je ${input.part}`} Kč.
    Výrobek A je o ${`${Math.abs(input.partRatio)} ${input.partRatio > 0 ? 'dražší' : 'levnější'}`} než výrobek B.
    Kolik stojí druhý výrobek?`;

  const template2 = highlight => highlight`
    Cena ${`${input.second ? agentSecond : agentFirst} je ${input.part}`} Kč.
    Výrobek A je ${`${Math.abs(input.partRatio)} krát ${input.partRatio > 0 ? 'dražší' : 'levnější'}`} než výrobek B.
    Kolik stojí druhý výrobek?`;

  return [
    { deductionTree: deduce(axiomInput(compRelative(agentFirst, agentSecond, input.partRatio), 2), part), template:template1 },
    { deductionTree: deduce(axiomInput(compRatio(agentFirst, agentSecond, input.partRatio), 2), part), template: template2 },

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
  const partRatio = axiomInput(ratio({ agent: "celkem", entity }, agentPart, input.partRatio), 2);
  const compare = axiomInput(comp(agentPart, agentRestPart, input.partRatio, entity), 2);

  const template = highlight => highlight`
    Cena za výrobek A a B je celkem ${input.whole} Kč.
    Výrobek A je ${input.partRatio} z celkem.
    Kolik stojí druhý výrobek?`;

  return [
    { deductionTree: diffPartToPart({ partRatio, whole }, { partDiffAgent: { agent: agentRestPart, entity } }), template }]

}
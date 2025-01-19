
import { cont, ratio, ctorPartToPartDiff, ctorPartToWholeDiff, ctor, comp, compRelative, compRatio, RelativeEntity } from "../../components/math.js";
import type { Comparison, PartWholeRatio, Container, RatioComparison } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";


export function compToPartToWhole({ compare, part }: { compare: Comparison, part: Container }) {
  return deduce(
    deduce(
      compare,
      ctor('ratio'),
    ),
    part
  )
}
export function compRatioToPartToWhole({ compare, part }: { compare: RatioComparison, part: Container }) {
  return deduce(
    deduce(
      compare,
      ctor('ratio'),
    ),
    part
  )
}


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
    Výrobek A je o  ${input.diff + (input.diff > 0 ?  ` dražší` : ' levnější')} než výrobek B.
    Kolik stojí výrobek B?`;

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
  }
}) {
  const agentPart = "výrobek A";
  const agentRestPart = "výrobek B"
  const entity = "Kč";

  const part = axiomInput(cont(agentPart, input.part, entity), 1);
  const compare = axiomInput(compRelative(agentPart, agentRestPart, input.partRatio), 2);
  const compareRatio = axiomInput(compRatio(agentPart, agentRestPart, input.partRatio), 2);

  const template = highlight => highlight`
    Cena výrobek A je ${input.part} Kč.
    Výrobek A je relativně o ${Math.abs(input.partRatio)} ${input.partRatio > 0 ? 'dražší' : 'levnější'} než výrobek B.
    Kolik stojí výrobek B?`;

  return [    
    { deductionTree: compRatioToPartToWhole({ compare, part }), template },
    { deductionTree: compRatioToPartToWhole({ compare: compareRatio, part }), template },

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
    Kolik stojí výrobek B?`;

  return [
    { deductionTree: diffPartToPart({ partRatio, whole }, { partDiffAgent: { agent: agentRestPart, entity } }), template }]

}
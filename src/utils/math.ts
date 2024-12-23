
type CountableUnit = '';
type Unit = CountableUnit;

type EntityBase = { entity: string, unit?: Unit }

export type Container = EntityBase &
{
  kind: 'cont';
  agent: string,
  quantity: number
}

export type Comparison = EntityBase & {
  kind: 'comp'
  agentA: string,
  agentB: string,
  quantity: number
}

export type ComparisonDiff = EntityBase & {
  kind: 'diff'
  agentMinuend: string,
  agentSubtrahend: string,
  quantity: number
}

export type Transfer = EntityBase & {
  kind: 'transfer'
  agentA: string,
  agentB: string,
  quantity: number
}

export type Rate = {
  kind: 'rate'
  agent: string,
  entityA: EntityBase,
  entityB: EntityBase,
  quantity: number
}

export type PartWholeRatio = {
  kind: 'ratio'
  wholeAgent: string,
  partAgent: string,
  ratio: number
}

export type PartWhole = {
  kind: 'sum'
  wholeAgent: string
  partAgents: string[]
  wholeEntity: EntityBase
  partEntity: EntityBase
}

export type PartToPartRatio = {
  kind: 'ratios'
  partAgents: string[]
  ratios: [],
  partAgent: string
}

export type TwoPartRatio = {
  kind: 'ratios'
  partAgents: [string, string]
  ratios: [number, number]
  partAgent: string
  partEntity: EntityBase
}

export type ThreePartRatio = {
  kind: 'ratios'
  partAgents: [string, string, string]
  ratios: [number, number, number]
  partAgent: string
}

export type CommonSense = {
  kind: 'common-sense'
  agent: string
}

export type Predicate = Container | Comparison | Transfer | Rate | PartWhole | PartWholeRatio | PartToPartRatio | ComparisonDiff | CommonSense;

export function cont(agent: string, quantity: number, entity: string): Container {
  return { kind: 'cont', agent, quantity, entity };
}
export function comp(agentA: string, agentB: string, quantity: number, entity: string): Comparison {
  return { kind: 'comp', agentA, agentB, quantity, entity }
}
export function diff(agentMinuend: string, agentSubtrahend: string, quantity: number, entity: string): ComparisonDiff {
  return { kind: 'diff', agentMinuend, agentSubtrahend, quantity, entity }
}
export function ratio(wholeAgent: string, partAgent: string, ratio: number): PartWholeRatio {
  return { kind: 'ratio', wholeAgent, partAgent, ratio }
}
export function sum(wholeAgent: string, partAgents: string[], wholeEntity: string, partEntity: string): PartWhole {
  return { kind: 'sum', wholeAgent, partAgents, wholeEntity: { entity: wholeEntity }, partEntity: { entity: partEntity } }
}
export function rate(agent: string, quantity: number, entityA: string, entityB: string): Rate {
  return { kind: 'rate', agent, quantity, entityA: { entity: entityA }, entityB: { entity: entityB } }
}

export function commonSense(agent: string): CommonSense {
  return { kind: 'common-sense', agent }
}

function containerWithCompareRule(a: Container, b: Comparison): Container {
  //check
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  if (!(a.agent == b.agentA || a.agent == b.agentB)) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  if (a.agent == b.agentB) {
    return { kind: 'cont', agent: b.agentA, quantity: a.quantity + b.quantity, entity: a.entity }
  }
  else if (a.agent == b.agentA) {
    return { kind: 'cont', agent: b.agentB, quantity: a.quantity + -1 * b.quantity, entity: a.entity }

  }
}

function containerTransferRule(a: Container, b: Transfer): Container {
  if (a.entity == b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return { kind: 'cont', agent: a.agent, quantity: a.quantity + b.quantity, entity: a.entity }
}

function partRule(whole: Container, b: PartWholeRatio): Container {
  // if (whole.agent != b.wholeAgent) {
  //   throw `Mismatch agents ${whole.agent}, ${b.wholeAgent}`
  // }
  return { kind: 'cont', agent: b.partAgent, quantity: whole.quantity * b.ratio, entity: whole.entity }
}
function wholeRule(part: Container, b: PartWholeRatio): Container {
  // if (part.agent != b.partAgent) {
  //   throw `Mismatch agents ${part.agent}, ${b.wholeAgent}`
  // }

  return { kind: 'cont', agent: b.wholeAgent, quantity: part.quantity / b.ratio, entity: part.entity }
}
function rateRule(a: Container, rate: Rate): Container {
  return { kind: 'cont', agent: a.agent, entity: rate.entityB.entity, quantity: rate.quantity * a.quantity }
}
function ratioRule(part: Container, whole: Container): PartWholeRatio {
  return { kind: 'ratio', partAgent: part.agent, wholeAgent: whole.agent, ratio: part.quantity / whole.quantity }
}
function diffRule(a: Container, b: ComparisonDiff): Container {
  if (!(a.agent == b.agentMinuend || a.agent == b.agentSubtrahend)) {
    throw `Mismatch agents ${a.agent} any of ${b.agentMinuend} ${b.agentSubtrahend}`
  }
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return {
    kind: 'cont',
    agent: a.agent == b.agentMinuend ? b.agentSubtrahend : b.agentMinuend,
    quantity: a.agent == b.agentMinuend ? a.quantity - b.quantity : a.quantity + b.quantity,
    entity: b.entity
  }
}
// function diffRatioRule(compare: Comparison, whole: Container): PartWholeRatio {
//   return { kind: 'ratio', partAgent: `Diff between ${compare.agentB} and ${compare.agentB}`, wholeAgent: whole.agent, ratio: Math.abs(compare.quantity) / whole.quantity }
// }

function partWhole(items: Container[], b: PartWhole): Container {
  return { kind: 'cont', agent: b.wholeAgent, quantity: items.reduce((out, d) => out += d.quantity, 0), entity: b.partEntity.entity }
}


function compareRule(a: Container, b: Container): Comparison {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return { kind: 'comp', agentB: a.agent, agentA: b.agent, quantity: b.quantity - a.quantity, entity: a.entity }
}


function partionRule(whole: Container, parts: TwoPartRatio): Container {
  return {
    kind: 'cont', agent: parts.partAgent,
    quantity: whole.quantity / parts.ratios.reduce((out, d) => out += d, 0),
    entity: parts.partEntity.entity
  }
}

function compareToCompareRule(a: Comparison, b: Comparison): Rate {
  return {
    kind: 'rate',
    agent: a.agentA,
    quantity: Math.abs(a.quantity) / Math.abs(b.quantity),
    entityA: { entity: a.entity },
    entityB: { entity: b.entity }

  }
}

export function inferenceRule(a: Predicate | Container[], b: Predicate, c?: { kind: 'ratio' | 'ratioDiff' | 'diff' }) {
  if (Array.isArray(a)) {
    return b.kind == "sum" ? partWhole(a, b) : null
  }
  else if (a.kind === "comp" && b.kind == "comp") {
    return compareToCompareRule(b, a)
  }
  else if (a.kind === "cont" && b.kind == "rate") {
    return rateRule(a, b)
  }
  else if (a.kind === "rate" && b.kind == "cont") {
    return rateRule(b, a)
  }
  else if (a.kind === "cont" && b.kind == "cont") {
    return c?.kind === "ratio"
      ? ratioRule(a, b)
      : compareRule(a, b)
  }
  else if (a.kind === "cont" && b.kind === "diff") {
    return diffRule(a, b);
  }
  else if (a.kind === "diff" && b.kind === "cont") {
    return diffRule(b, a);
  }
  else if (a.kind === "comp" && b.kind === "cont") {
    return containerWithCompareRule(b, a);
  }
  else if (a.kind === "cont" && b.kind === "comp") {
    return containerWithCompareRule(a, b);
  }
  else if (a.kind === "comp" && b.kind === "ratio") {
    //return b.wholeAgent == a.agentA ? partRule(a, b) : wholeRule(a, b)
  }
  else if (a.kind === "cont" && b.kind == "cont") {
    return c?.kind === "ratio"
      ? ratioRule(a, b)
      : compareRule(a, b)
  }
  else if (a.kind === "cont" && b.kind === "ratio") {
    const toggleRatio = c?.kind == "ratioDiff" ? { ...b, ratio: 1 - b.ratio } : b
    return b.wholeAgent == a.agent ? partRule(a, toggleRatio) : wholeRule(a, toggleRatio)
  }
  else if (a.kind === "cont" && b.kind === "transfer") {
    return containerTransferRule(a, b)
  }
  else {
    return null;
  }
}





export function gcd(numbers) {
  let num = 2, res = 1;
  while (num <= Math.min(...numbers)) {
    if (numbers.every(n => n % num === 0)) {
      res = num;
    }
    num++;
  }
  return res;
}

export function globalNormalize(
  arr: number[],
  [targetMin, targetMax]: [targetMin: number, targetMax: number]
): number[] {
  // Check if any number exceeds the threshold
  console.log(arr, targetMin, targetMax)
  const maxValue = Math.max(...arr);
  const threshold = targetMax;
  if (maxValue > threshold) {
    const minValue = Math.min(...arr);

    // Avoid division by zero
    if (maxValue === minValue) {
      return arr.map(() => targetMin);
    }

    // Normalize the entire array
    return arr.map(
      (x) => targetMin + ((x - minValue) * (targetMax - targetMin)) / (maxValue - minValue)
    );
  }

  // Return the array unchanged if no number exceeds the threshold
  return arr;
}


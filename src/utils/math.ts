
type CountableUnit = '';
type Unit = CountableUnit;

type EntityBase = { entity: string, unit?: Unit }
function isAgentEntity(d: EntityMatcher): d is AgentEntityMatcher {
  return (d as any).agent != null
}
type AgentEntityMatcher = { agent: string, entity: string };
type EntityMatcher = string | AgentEntityMatcher
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

export type RatioComparison = EntityBase & {
  kind: 'comp-ratio'
  agentA: string,
  agentB: string,
  quantity: number
}

export type ComparisonDiff = EntityBase & {
  kind: "comp-diff"
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
  entity: EntityBase,
  entityBase: EntityBase,
  quantity: number
}

export type PartWholeRatio = {
  kind: 'ratio'
  whole: EntityMatcher,
  part: EntityMatcher,
  ratio: number
}

export type Combine = {
  kind: 'sum'
  wholeAgent: string
  partAgents: string[]
  wholeEntity: EntityBase
  partEntity: EntityBase
}
export type GCD = EntityBase & {
  kind: 'gcd'
  agent: string
}

export type LCD = EntityBase & {
  kind: 'lcd'
  agent: string
}



export type PartToPartRatio = {
  kind: 'ratios'
  parts: EntityMatcher[]
  whole: EntityMatcher,
  ratios: number[],
}


export type TwoPartRatio = PartToPartRatio & {
  parts: [EntityMatcher, EntityMatcher]
  ratios: [number, number]
}

export type ThreePartRatio = PartToPartRatio & {
  parts: [EntityMatcher, EntityMatcher, EntityMatcher]
  ratios: [number, number, number]
}

export type CommonSense = {
  kind: 'common-sense'
  agent: string
}

export type Predicate = Container | Comparison | RatioComparison | Transfer | Rate | Combine | PartWholeRatio | PartToPartRatio | ComparisonDiff | CommonSense | GCD | LCD;

export function cont(agent: string, quantity: number, entity: string): Container {
  return { kind: 'cont', agent, quantity, entity };
}
export function comp(agentA: string, agentB: string, quantity: number, entity: string): Comparison {
  return { kind: 'comp', agentA, agentB, quantity, entity }
}
export function ratioComp(agentA: string, agentB: string, quantity: number, entity: string): RatioComparison {
  return { kind: 'comp-ratio', agentA, agentB, quantity, entity }
}
export function diff(agentMinuend: string, agentSubtrahend: string, quantity: number, entity: string): ComparisonDiff {
  return { kind: "comp-diff", agentMinuend, agentSubtrahend, quantity, entity }
}
export function ratio(whole: EntityMatcher, part: EntityMatcher, ratio: number): PartWholeRatio {
  return { kind: 'ratio', whole, part, ratio }
}
export function sum(wholeAgent: string, partAgents: string[], wholeEntity: string, partEntity: string): Combine {
  return { kind: 'sum', wholeAgent, partAgents, wholeEntity: { entity: wholeEntity }, partEntity: { entity: partEntity } }
}
export function gcd(agent: string, entity: string): GCD {
  return { kind: 'gcd', agent, entity }
}
export function lcd(agent: string, entity: string): LCD {
  return { kind: 'lcd', agent, entity }
}

export function rate(agent: string, quantity: number, entity: string, entityBase: string): Rate {
  return { kind: 'rate', agent, quantity, entity: { entity: entity }, entityBase: { entity: entityBase } }
}
export function ratios(whole: EntityMatcher, parts: EntityMatcher[], ratios: number[]): PartToPartRatio {
  return { kind: 'ratios', parts, whole, ratios };
}

export function commonSense(agent: string): CommonSense {
  return { kind: 'common-sense', agent }
}

function compareRule(a: Container, b: Comparison): Container {
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
function ratioCompareRule(a: Container, b: RatioComparison): Container {
  //check
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  if (!(a.agent == b.agentA || a.agent == b.agentB)) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  if (a.agent == b.agentB) {
    return { kind: 'cont', agent: b.agentA, quantity: a.quantity * b.quantity, entity: a.entity }
  }
  else if (a.agent == b.agentA) {
    return { kind: 'cont', agent: b.agentB, quantity: a.quantity / b.quantity, entity: a.entity }
  }
}


function transferRule(a: Container, b: Transfer): Container {
  if (a.entity == b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return { kind: 'cont', agent: a.agent, quantity: a.quantity + b.quantity, entity: a.entity }
}

function partToWholeRule(a: Container, b: PartWholeRatio): Container {
  const isSame = isSameEntity(b)
  if (!(matchEntity(b.whole, a, isSame) || matchEntity(b.part, a, isSame))) {
    throw `Mismatch entity ${[a.agent, a.entity].join()} any of ${[b.whole, b.part].map(d => formatAgentEntity(d)).join()}`
  }
  return matchEntity(b.whole, a, isSame)
    ? { kind: 'cont', ...toAgentEntity(b.part, a, isSame), quantity: a.quantity * b.ratio }
    : { kind: 'cont', ...toAgentEntity(b.whole, a, isSame), quantity: a.quantity / b.ratio }
}
function rateRule(a: Container, rate: Rate): Container {
  if (!(a.entity === rate.entity.entity || a.entity === rate.entityBase.entity)) {
    throw `Mismatch entity ${a.entity} any of ${rate.entity.entity}, ${rate.entityBase.entity}`
  }
  return {
    kind: 'cont', agent: a.agent, entity: a.entity == rate.entity.entity
      ? rate.entityBase.entity
      : rate.entity.entity, quantity: a.entity == rate.entity.entity
        ? a.quantity / rate.quantity
        : a.quantity * rate.quantity
  }
}
function toPartWholeRatio(part: Container, whole: Container): PartWholeRatio {
  return {
    kind: 'ratio',
    part: { agent: part.agent, entity: part.entity },
    whole: { agent: whole.agent, entity: whole.entity },
    ratio: part.quantity / whole.quantity
  }
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

function sumRule(items: Container[], b: Combine): Container {
  return { kind: 'cont', agent: b.wholeAgent, quantity: items.reduce((out, d) => out += d.quantity, 0), entity: b.partEntity.entity }
}
function gcdRule(items: Container[], b: GCD): Container {
  return { kind: 'cont', agent: b.agent, quantity: gcdCalc(items.map(d => d.quantity)), entity: b.entity }
}
function lcdRule(items: Container[], b: LCD): Container {
  return { kind: 'cont', agent: b.agent, quantity: lcdCalc(items.map(d => d.quantity)), entity: b.entity }
}


function toComparison(a: Container, b: Container): Comparison {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return { kind: 'comp', agentB: a.agent, agentA: b.agent, quantity: b.quantity - a.quantity, entity: a.entity }
}
function toRatioComparison(a: Container, b: Container): RatioComparison {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return { kind: 'comp-ratio', agentB: a.agent, agentA: b.agent, quantity: b.quantity / a.quantity, entity: a.entity }
}

function compareToCompareRule(a: Comparison, b: Comparison): Rate {
  return {
    kind: 'rate',
    agent: a.agentA,
    quantity: Math.abs(a.quantity) / Math.abs(b.quantity),
    entity: { entity: a.entity },
    entityBase: { entity: b.entity }

  }
}
function toDiff(a: Container, b: Container): ComparisonDiff {
  if (a.entity !== b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return {
    kind: "comp-diff",
    agentMinuend: a.agent,
    agentSubtrahend: b.agent,
    quantity: a.quantity - b.quantity,
    entity: a.entity

  }
}
function toRate(a: Container, b: Container): Rate {
  if (a.agent !== b.agent) {
    throw `Mismatch angent ${a.agent}, ${b.agent}`
  }
  return {
    kind: 'rate',
    agent: a.agent,
    quantity: a.quantity / b.quantity,
    entity: {
      entity: a.entity
    },
    entityBase: {
      entity: b.entity
    }
  }
}


function partToPartRule(a: Container, parts: PartToPartRatio): Container {
  const lastEntity = parts.parts[parts.parts.length - 1];
  if (!(matchEntity(parts.whole, a) || matchEntity(lastEntity, a))) {
    throw `Mismatch entity ${[a.agent, a.entity].join()} any of ${[parts.whole, lastEntity].map(d => formatAgentEntity(d)).join()}`
  }
  const partsSum = parts.ratios.reduce((out, d) => out += d, 0);
  const lastRatio = parts.ratios[parts.ratios.length - 1];
  const isWhole = matchEntity(parts.whole, a);
  return {
    kind: 'cont',
    quantity: isWhole
      ? (a.quantity / partsSum) * lastRatio
      : (a.quantity / lastRatio) * partsSum,
    ...(toAgentEntity(isWhole ? lastEntity : parts.whole, a))
  }
}
export function isSameEntity(d: PartWholeRatio) {
  return toEntity(d.whole) === toEntity(d.part);
}
function toEntity(d: EntityMatcher) {
  return isAgentEntity(d) ? d.entity : d;
}
function matchEntity(entity: EntityMatcher, value: Container, isSameEntity = false) {
  const d = toAgentEntity(entity, value)
  return (isSameEntity || value.entity === d.entity) && value.agent === d.agent;
}
function toAgentEntity(entity: EntityMatcher, value: Container, inheritValueEntity = false): AgentEntityMatcher {
  return isAgentEntity(entity)
    ? (inheritValueEntity
      ? { ...entity, entity: value.entity }
      : entity)
    : (inheritValueEntity
      ? { agent: value.agent, entity: value.entity }
      : { agent: value.agent, entity })
}
function formatAgentEntity(d: EntityMatcher) {
  return isAgentEntity(d) ? [d.agent, d.entity].join() : d
}
function partEqual(a: Comparison, b: Container) {
  const rest = diffRule(b, diff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, Math.abs(a.quantity), a.entity));
  return {
    ...rest,
    quantity: rest.quantity / 2
  }

}
export function inferenceRule(a: Predicate | Container[], b: Predicate, c?: { kind: 'ratio' | 'comp-ratio' | 'rate' | "comp-diff" | 'comp-part-eq' }) {
  if (Array.isArray(a)) {
    return b.kind === "gcd"
      ? gcdRule(a, b) 
      : b.kind === "lcd"
        ? lcdRule(a, b)
        : b.kind === "sum"
          ? sumRule(a, b)
          : null
  }
  else if (a.kind === "cont" && b.kind == "cont") {
    const kind = c?.kind;
    return kind === "comp-diff"
      ? toDiff(a, b)
      : kind === "rate"
        ? toRate(a, b)
        : kind === "comp-ratio"
          ? toRatioComparison(a, b)
          : kind === "ratio"
            ? toPartWholeRatio(a, b)
            : toComparison(a, b)
  }
  else if (a.kind === "comp" && b.kind === "cont") {
    const kind = c?.kind;
    return kind === "comp-part-eq" ? partEqual(a, b) : compareRule(b, a);
  }
  else if (a.kind === "cont" && b.kind === "comp") {
    const kind = c?.kind;
    return kind === "comp-part-eq" ? partEqual(b, a) : compareRule(a, b);
  }
  else if (a.kind === "cont" && b.kind == "rate") {
    return rateRule(a, b)
  }
  else if (a.kind === "rate" && b.kind == "cont") {
    return rateRule(b, a)
  }
  else if (a.kind === "comp-ratio" && b.kind === "cont") {
    return ratioCompareRule(b, a);
  }
  else if (a.kind === "cont" && b.kind === "comp-ratio") {
    return ratioCompareRule(a, b);
  }
  else if (a.kind === "cont" && b.kind === "ratio") {
    return partToWholeRule(a, b);
  }
  else if (a.kind === "ratio" && b.kind === "cont") {
    return partToWholeRule(b, a);
  }
  else if (a.kind === "cont" && b.kind == "ratios") {
    return partToPartRule(a, b)
  }
  else if (a.kind === "ratios" && b.kind == "cont") {
    return partToPartRule(b, a)
  }
  else if (a.kind === "cont" && b.kind === "comp-diff") {
    return diffRule(a, b);
  }
  else if (a.kind === "comp-diff" && b.kind === "cont") {
    return diffRule(b, a);
  }
  else if (a.kind === "cont" && b.kind === "transfer") {
    return transferRule(a, b)
  }
  else if (a.kind === "comp" && b.kind === "comp") {
    return compareToCompareRule(b, a)
  }
  else {
    return null;
  }
}


function gcdCalc(numbers: number[]) {
  let num = 2, res = 1;
  while (num <= Math.min(...numbers)) {
    if (numbers.every(n => n % num === 0)) {
      res = num;
    }
    num++;
  }
  return res;
}
function lcdCalcEx(a,b){
  return Math.abs(a * b) / gcdCalc([a, b]);
}
function lcdCalc(numbers: number[]) {
  return numbers.reduce((acc, num) => lcdCalcEx(acc, num), 1);  
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


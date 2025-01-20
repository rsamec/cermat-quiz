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

export type RatioComparison = {
  kind: 'comp-ratio'
  agentA: string,
  agentB: string,
  ratio: number
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

export type Quota = {
  kind: 'quota'
  agentQuota: string,
  agent: string
  quantity: number
  restQuantity: number
}

export type PartWholeRatio = {
  kind: 'ratio'
  whole: EntityMatcher,
  part: EntityMatcher,
  ratio: number
}
export type SumCombine = Combine & {
  kind: 'sum'
}

export type ProductCombine = Combine & {
  kind: 'product'
}
type Combine = {
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
export type Sequence = EntityBase & {
  kind: 'sequence'
  type: SequenceAnalysis
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

export type CompareAndPartEqual = {
  kind: 'comp-part-eq'
}

export type Simplify = {
  kind: 'simplify'
}
export type PartToWholeDiff = {
  kind: 'ratio-diff'
  part: EntityMatcher
}
export type PartToPartDiff = {
  kind: 'ratios-diff'
  part: EntityMatcher
}

export type NthRule = {
  kind: 'nth'
  entity: string
}

export type Predicate = Container | Comparison | RatioComparison | Transfer | Rate | PartToWholeDiff | PartToPartDiff | SumCombine | ProductCombine | PartWholeRatio | PartToPartRatio | ComparisonDiff |
  CommonSense | GCD | LCD | CompareAndPartEqual | Sequence | NthRule | Quota | Simplify;

export function ctor(kind: 'ratio' | 'comp-ratio' | 'rate' | "comp-diff" | 'ratio-diff' | 'ratios-diff' | 'comp-part-eq' | 'sequence' | 'nth' | 'ratios' | 'simplify') {
  return { kind } as Predicate
}
export function ctorRatios(whole: EntityMatcher) {
  return { kind: "ratios", whole } as PartToPartRatio
}
export function ctorRatio(whole: EntityMatcher) {
  return { kind: "ratio", whole } as PartWholeRatio
}

export function ctorPartToWholeDiff(part: EntityMatcher) {
  return { kind: "ratio-diff", part } as PartToWholeDiff
}
export function ctorPartToPartDiff(part: EntityMatcher) {
  return { kind: "ratios-diff", part } as PartToPartDiff
}

export function cont(agent: string, quantity: number, entity: string): Container {
  return { kind: 'cont', agent, quantity, entity };
}
export function pi(): Container {
  return { kind: 'cont', agent: "PI", quantity: 3.14, entity: '' }
}
export function comp(agentA: string, agentB: string, quantity: number, entity: string): Comparison {
  return { kind: 'comp', agentA, agentB, quantity, entity }
}
export function compRelative(agentA: string, agentB: string, ratio: number): RatioComparison {
  if (ratio <= -1 && ratio >= 1) {
    throw 'Relative compare should be between (-1,1).'
  }
  return compRatio(agentA, agentB, 1 + ratio);
}
export function compRatio(agentA: string, agentB: string, ratio: number): RatioComparison {
  return { kind: 'comp-ratio', agentA, agentB, ratio }
}
export function compDiff(agentMinuend: string, agentSubtrahend: string, quantity: number, entity: string): ComparisonDiff {
  return { kind: "comp-diff", agentMinuend, agentSubtrahend, quantity, entity }
}
export function ratio(whole: EntityMatcher, part: EntityMatcher, ratio: number): PartWholeRatio {
  return { kind: 'ratio', whole, part, ratio }
}
export function ratios(whole: EntityMatcher, parts: EntityMatcher[], ratios: number[]): PartToPartRatio {
  return { kind: 'ratios', parts, whole, ratios };
}
export function sum(wholeAgent: string, partAgents: string[], wholeEntity: string, partEntity: string): SumCombine {
  return { kind: 'sum', wholeAgent, partAgents, wholeEntity: { entity: wholeEntity }, partEntity: { entity: partEntity } }
}
export function product(wholeAgent: string, partAgents: string[], wholeEntity: string, partEntity: string): ProductCombine {
  return { kind: 'product', wholeAgent, partAgents, wholeEntity: { entity: wholeEntity }, partEntity: { entity: partEntity } }
}
export function gcd(agent: string, entity: string): GCD {
  return { kind: 'gcd', agent, entity }
}
export function lcd(agent: string, entity: string): LCD {
  return { kind: 'lcd', agent, entity }
}
export function nth(entity): NthRule {
  return { kind: 'nth', entity }
}
export function rate(agent: string, quantity: number, entity: string, entityBase: string): Rate {
  return { kind: 'rate', agent, quantity, entity: { entity: entity }, entityBase: { entity: entityBase } }
}
export function quota(agent: string, agentQuota, quantity: number, restQuantity = 0): Quota {
  return { kind: 'quota', agent, agentQuota, quantity, restQuantity }
}
export function commonSense(description: string): CommonSense {
  return { kind: 'common-sense', agent: description }
}


function compareRule(a: Container, b: Comparison): Container {
  //check
  // if (a.entity != b.entity) {
  //   throw `Mismatch entity ${a.entity}, ${b.entity}`
  // }
  // if (!(a.agent == b.agentA || a.agent == b.agentB)) {
  //   throw `Mismatch entity ${a.agent}, ${b.agentA} or ${b.agentB}`
  // }
  if (a.agent == b.agentB) {
    return { kind: 'cont', agent: b.agentA, quantity: a.quantity + b.quantity, entity: a.entity }
  }
  else if (a.agent == b.agentA) {
    return { kind: 'cont', agent: b.agentB, quantity: a.quantity + -1 * b.quantity, entity: a.entity }
  }
}
function ratioCompareRule(a: Container, b: RatioComparison): Container {
  if (!(a.agent == b.agentA || a.agent == b.agentB)) {
    throw `Mismatch agent ${a.agent} any of ${b.agentA}, ${b.agentB}`
  }
  if (a.agent == b.agentB) {
    return { kind: 'cont', agent: b.agentA, quantity: b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / Math.abs(b.ratio), entity: a.entity }
  }
  else if (a.agent == b.agentA) {
    return { kind: 'cont', agent: b.agentB, quantity: b.ratio > 0 ? a.quantity / b.ratio : a.quantity * Math.abs(b.ratio), entity: a.entity }
  }
}


function transferRule(a: Container, b: Transfer): Container {
  if (a.entity == b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return { kind: 'cont', agent: a.agent, quantity: a.quantity + b.quantity, entity: a.entity }
}
function diffPartToWholeRule(a: PartToWholeDiff, b: PartWholeRatio): PartWholeRatio {

  return {
    kind: 'ratio',
    whole: b.whole,
    ratio: 1 - b.ratio,
    part: a.part
  }
}
function diffPartToPartRule(a: PartToPartDiff, b: PartWholeRatio): TwoPartRatio {

  if (b.ratio > 1) {
    throw `Part to part ratio should be less than 1.`
  }

  return {
    kind: 'ratios',
    whole: b.whole,
    ratios: [b.ratio, 1 - b.ratio],
    parts: [b.part, a.part]
  }
}
function compPartToWholeRule(a: Comparison, b: { kind: 'ratio' }): PartWholeRatio {
  // if (a.quantity <= -1) {
  //   throw `Relative compare have to be greater than -1. Compare is ${a.quantity}`
  // }
  const quantity = Math.abs(a.quantity)
  return {
    kind: 'ratio',
    whole: { agent: a.agentB, entity: a.entity },
    ratio: a.quantity > 0 ? 1 + quantity : 1 - quantity,
    part: { agent: a.agentA, entity: a.entity }
  }
}


function compRatioToCompRule(a: RatioComparison, b: Comparison): Container {
  return {
    kind: 'cont',
    agent: b.agentA,
    entity: b.entity,
    quantity: a.ratio * (b.quantity >= 0 ? (b.quantity - 1) : 1 + 1 / b.quantity)
  }
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
function quotaRule(a: Container, quota: Quota): Container {
  if (!(a.agent === quota.agent || a.agent === quota.agentQuota)) {
    throw `Mismatch entity ${a.entity} any of ${quota.agent}, ${quota.agentQuota}`
  }
  return {
    kind: 'cont',
    agent: a.agent === quota.agentQuota ? quota.agent : quota.agentQuota,
    entity: a.entity,
    quantity: a.agent === quota.agentQuota
      ? a.quantity * quota.quantity
      : a.quantity / quota.quantity
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

function sumRule(items: Container[], b: SumCombine): Container {
  return { kind: 'cont', agent: b.wholeAgent, quantity: items.reduce((out, d) => out += d.quantity, 0), entity: b.wholeEntity.entity }
}
function productRule(items: Container[], b: ProductCombine): Container {
  return { kind: 'cont', agent: b.wholeAgent, quantity: items.reduce((out, d) => out *= d.quantity, 1), entity: b.wholeEntity.entity }
}
function gcdRule(items: Container[], b: GCD): Container {
  return { kind: 'cont', agent: b.agent, quantity: gcdCalc(items.map(d => d.quantity)), entity: b.entity }
}
function lcdRule(items: Container[], b: LCD): Container {
  return { kind: 'cont', agent: b.agent, quantity: lcdCalc(items.map(d => d.quantity)), entity: b.entity }
}

function sequenceRule(items: Container[]): Sequence {
  if (new Set(items.map(d => d.entity)).size > 1) {
    throw `Mismatch entity ${items.map(d => d.entity).join()}`
  }
  const type = sequencer(items.map(d => d.quantity));
  return { kind: 'sequence', type, entity: items[0].entity }
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
  return { kind: 'comp-ratio', agentB: a.agent, agentA: b.agent, ratio: b.quantity / a.quantity }
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
function toQuota(a: Container, quota: Container): Quota {
  if (a.entity !== quota.entity) {
    throw `Mismatch entity ${a.entity}, ${quota.entity}`
  }
  const { groupCount, remainder } = divide(a.quantity, quota.quantity);
  return {
    kind: 'quota',
    agentQuota: quota.agent,
    agent: a.agent,
    quantity: groupCount,
    restQuantity: remainder
  }
}

function divide(total: number, divisor: number, isPartitative: boolean = false) {
  const rawQuotient = total / divisor;
  const rawRemainder = rawQuotient % 1;
  const quotient = rawQuotient - rawRemainder;
  const remainder = isPartitative
    ? (divisor - Math.floor(divisor)) * rawQuotient
    : rawRemainder * divisor;

  const groupCount = isPartitative ? divisor : quotient;
  const groupSize = isPartitative ? rawQuotient : divisor;
  return {
    groupCount,
    groupSize,
    remainder
  }
}

function toRatios(a: Container, b: Container, whole?: EntityMatcher): TwoPartRatio {
  return {
    kind: 'ratios',
    parts: [
      whole != null ? toAgentEntity(whole, a, true) : a,
      whole != null ? toAgentEntity(whole, b, true) : b
    ],
    ratios: [a.quantity, b.quantity],
    whole
  }
}



function partToPartRule(a: Container, parts: PartToPartRatio): Container {
  const firstEntity = parts.parts[0];
  const lastEntity = parts.parts[parts.parts.length - 1];
  if (!(parts.whole != null && matchEntity(parts.whole, a) || matchEntity(lastEntity, a) || matchEntity(firstEntity, a))) {
    throw `Mismatch entity ${[a.agent, a.entity].join()} any of ${[parts.whole, lastEntity, firstEntity].map(d => formatAgentEntity(d)).join()}`
  }
  const partsSum = parts.ratios.reduce((out, d) => out += d, 0);
  const isFirst = matchEntity(firstEntity, a);
  const itemRatio = isFirst ? parts.ratios[0] : parts.ratios[parts.ratios.length - 1];
  const isWhole = parts.whole != null && matchEntity(parts.whole, a);
  return {
    kind: 'cont',
    ...(toAgentEntity(isWhole
      ? lastEntity
      : parts.whole != null
        ? parts.whole
        : isFirst ? lastEntity : firstEntity, a)),

    quantity: isWhole
      ? (a.quantity / partsSum) * itemRatio
      : (a.quantity / itemRatio) * (parts.whole != null ? partsSum : isFirst ? parts.ratios[parts.ratios.length - 1] : parts.ratios[0])
  }
}

function mapRatiosByFactor(multi: PartToPartRatio, quantity: number) {
  return { ...multi, ratios: multi.ratios.map(d => d * quantity) }
}
export function isSameEntity(d: PartWholeRatio) {
  return toEntity(d.whole) === toEntity(d.part);
}
function toEntity(d: EntityMatcher) {
  return isAgentEntity(d) ? d.entity : d;
}
function toAgent(d: EntityMatcher) {
  return isAgentEntity(d) ? d.agent : d;
}

function matchEntity(entity: EntityMatcher, value: Container, isSameEntity = false) {
  //if (!isAgentEntity(entity)) return value.agent === entity;
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
  const rest = diffRule(b, compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, Math.abs(a.quantity), a.entity));
  return {
    ...rest,
    quantity: rest.quantity / 2
  }
}

function nthTermRule(a: Container, b: Sequence): Container {
  const [first, second] = b.type.sequence;
  return {
    kind: 'cont', agent: a.agent, entity: b.entity,
    quantity:
      b.type.kind === "arithmetic"
        ? first + (a.quantity - 1) * b.type.commonDifference
        : b.type.kind === 'quadratic'
          ? nthQuadraticElementFromDifference(first, second, b.type.secondDifference, a.quantity)
          : b.type.kind === 'geometric'
            ? first * Math.pow(b.type.commonRatio, a.quantity - 1) : NaN
  }
}

function nthPositionRule(a: Container, b: Sequence, newEntity: string = 'nth'): Container {

  const { kind, sequence } = b.type;
  const [first, second] = sequence;
  return {
    kind: 'cont',
    agent: a.agent,
    entity: newEntity,
    quantity: kind === "arithmetic"
      ? Math.round((a.quantity - first) / b.type.commonDifference) + 1
      : kind === "quadratic"
        ? findPositionInQuadraticSequence(a.quantity, first, second, b.type.secondDifference)
        : kind === "geometric" ?
          Math.round(Math.log(a.quantity / first) / Math.log(b.type.commonRatio)) + 1
          : NaN
  }
}
export function inferenceRule(...args: Predicate[]) {
  const [a, b, ...rest] = args;
  const last = rest?.length > 0 ? rest[rest.length - 1] : null;

  if (last?.kind === "sum" || last?.kind === "product" || last?.kind === "lcd" || last?.kind === "gcd" || (last?.kind === "sequence" && args.length > 3)) {
    const arr = [a, b].concat(rest.slice(0, -1)) as Container[];

    return last.kind === "sequence"
      ? sequenceRule(arr)
      : last.kind === "gcd"
        ? gcdRule(arr, last)
        : last.kind === "lcd"
          ? lcdRule(arr, last)
          : last.kind === "product"
            ? productRule(arr, last)
            : last.kind === "sum"
              ? sumRule(arr, last)
              : null
  }
  else if (a.kind === "cont" && b.kind == "cont") {
    const kind = last?.kind;
    return kind === "comp-diff"
      ? toDiff(a, b)
      : kind === "quota"
        ? toQuota(a, b)
        : kind === "rate"
          ? toRate(a, b)
          : kind === "ratios"
            ? toRatios(a, b, last.whole)
            : kind === "comp-ratio"
              ? toRatioComparison(a, b)
              : kind === "ratio"
                ? toPartWholeRatio(a, b)
                : toComparison(a, b)
  }
  else if (a.kind === "comp" && b.kind === "cont") {
    const kind = last?.kind;
    return kind === "comp-part-eq" ? partEqual(a, b) : compareRule(b, a);
  }
  else if (a.kind === "cont" && b.kind === "comp") {
    const kind = last?.kind;
    return kind === "comp-part-eq" ? partEqual(b, a) : compareRule(a, b);
  }
  else if (a.kind === "cont" && b.kind == "rate") {
    return rateRule(a, b)
  }
  else if (a.kind === "rate" && b.kind == "cont") {
    return rateRule(b, a)
  }
  else if (a.kind === "ratio" && b.kind == "comp") {
    return compPartToWholeRule(b, a)
  }
  else if (a.kind === "comp" && b.kind == "ratio") {
    return compPartToWholeRule(a, b)
  }
  else if (a.kind === "comp" && b.kind == "comp-ratio") {
    return compRatioToCompRule(b, a)
  }
  else if (a.kind === "comp-ratio" && b.kind == "comp") {
    return compRatioToCompRule(a, b)
  }
  else if (a.kind === "cont" && b.kind == "quota") {
    return quotaRule(a, b)
  }
  else if (a.kind === "quota" && b.kind == "cont") {
    return quotaRule(b, a)
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
  else if (a.kind === "ratio-diff" && b.kind === "ratio") {
    return diffPartToWholeRule(a, b);
  }
  else if (a.kind === "ratio" && b.kind === "ratio-diff") {
    return diffPartToWholeRule(b, a);
  }
  else if (a.kind === "ratios-diff" && b.kind === "ratio") {
    return diffPartToPartRule(a, b);
  }
  else if (a.kind === "ratio" && b.kind === "ratios-diff") {
    return diffPartToPartRule(b, a);
  }
  else if (a.kind === "cont" && b.kind == "ratios") {
    const kind = last?.kind;
    return kind === "simplify" ? mapRatiosByFactor(b, 1 / a.quantity) : partToPartRule(a, b);
  }
  else if (a.kind === "ratios" && b.kind == "cont") {
    const kind = last?.kind;
    return kind === "simplify" ? mapRatiosByFactor(a, 1 / b.quantity) : partToPartRule(b, a);

  }
  else if (a.kind === "cont" && b.kind === "comp-diff") {
    return diffRule(a, b);
  }
  else if (a.kind === "comp-diff" && b.kind === "cont") {
    return diffRule(b, a);
  }
  else if (a.kind === "sequence" && b.kind === "cont") {
    const kind = last?.kind;
    return kind === "nth" ? nthPositionRule(b, a, last.entity) : nthTermRule(b, a);
  }
  else if (a.kind === "cont" && b.kind === "sequence") {
    const kind = last?.kind;
    return kind === "nth" ? nthPositionRule(a, b, last.entity) : nthTermRule(a, b);
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
function lcdCalcEx(a, b) {
  return Math.abs(a * b) / gcdCalc([a, b]);
}
function lcdCalc(numbers: number[]) {
  return numbers.reduce((acc, num) => lcdCalcEx(acc, num), 1);
}

type SequenceAnalysisBase = { sequence: number[] }
type SequenceAnalysis =
  | { kind: "arithmetic"; commonDifference: number } & SequenceAnalysisBase
  | { kind: "geometric"; commonRatio: number } & SequenceAnalysisBase
  | { kind: "quadratic"; secondDifference: number } & SequenceAnalysisBase


function sequencer(sequence: number[]): SequenceAnalysis {
  if (sequence.length < 2) {
    throw ("Insufficient Data")
  }

  // Check for Arithmetic Sequence
  const commonDifference = sequence[1] - sequence[0];
  const isArithmetic = sequence.every((_, i, arr) =>
    i < 2 || arr[i] - arr[i - 1] === commonDifference
  );

  if (isArithmetic) {
    return {
      kind: "arithmetic",
      sequence,
      commonDifference,
    };
  }

  // Check for Geometric Sequence
  const commonRatio = sequence[1] / sequence[0];
  const isGeometric = sequence.every((_, i, arr) =>
    i < 2 || arr[i] / arr[i - 1] === commonRatio
  );

  if (isGeometric) {
    return {
      kind: "geometric",
      sequence,
      commonRatio,
    };
  }

  // Check for Quadratic Sequence
  const differences = sequence.map((_, i, arr) =>
    i === 0 ? null : arr[i] - arr[i - 1]
  ).slice(1) as number[]; // First differences
  const secondDifferences = differences.map((_, i, arr) =>
    i === 0 ? null : arr[i] - arr[i - 1]
  ).slice(1) as number[]; // Second differences

  const isQuadratic = secondDifferences.every(
    (value) => value === secondDifferences[0]
  );

  if (isQuadratic) {
    const [a, b] = sequence;
    return {
      kind: "quadratic",
      sequence,
      secondDifference: secondDifferences[0],
    };
  }

  throw ("Unknown Sequence");
}
export function nthQuadraticElements(
  firstElement: number,
  secondElement: number,
  secondDifference: number,
) {
  // Step 1: Compute A
  const A = secondDifference / 2;

  // Step 2: Compute B and C
  const B = (secondElement - firstElement) - 3 * A;
  const C = firstElement - (A + B);
  return { A, B, C }
}
function nthQuadraticElementFromDifference(
  firstElement: number,
  secondElement: number,
  secondDifference: number,
  n: number
): number {
  const { A, B, C } = nthQuadraticElements(firstElement, secondElement, secondDifference);
  // Step 3: Compute the nth term
  return A * n ** 2 + B * n + C;
}

function findPositionInQuadraticSequence(
  nthTermValue: number,
  first: number,
  second: number,
  secondDifference: number
): number {
  // Step 1: Compute A, B, and C
  const A = secondDifference / 2;
  const B = second - first - 3 * A;
  const C = first - A - B;



  // Step 2: Solve the quadratic equation A*n^2 + B*n + (C - nthTermValue) = 0
  const delta = B ** 2 - 4 * A * (C - nthTermValue);

  if (delta < 0) {
    throw new Error("No valid position exists for the given values.");
  }

  const n1 = (-B + Math.sqrt(delta)) / (2 * A);
  const n2 = (-B - Math.sqrt(delta)) / (2 * A);

  // Return the valid position (n must be a positive integer)
  if (Number.isInteger(n1) && n1 > 0) return n1;
  if (Number.isInteger(n2) && n2 > 0) return n2;



  throw new Error("The given values do not correspond to a valid position in the sequence.");
}
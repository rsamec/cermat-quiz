import Fraction from 'fraction.js';
import configureMeasurements from 'convert-units';
import length from 'convert-units/definitions/length';
import area from 'convert-units/definitions/area';
import mass from 'convert-units/definitions/mass'
import volume from 'convert-units/definitions/volume'

const convert = configureMeasurements<any, any, any>({
  length,
  area,
  volume,
  mass,
});
type Unit = string;

type EntityBase = { entity: string, unit?: Unit }
type AgentMatcher = string

export type Container = EntityBase &
{
  kind: 'cont';
  agent: string,
  quantity: number
}

export type ConvertUnit =
  {
    kind: 'unit';
    unit: Unit
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
  whole: AgentMatcher,
  part: AgentMatcher,
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
  parts: AgentMatcher[]
  whole: AgentMatcher,
  ratios: number[],
}


export type TwoPartRatio = PartToPartRatio & {
  parts: [AgentMatcher, AgentMatcher]
  ratios: [number, number]
}

export type ThreePartRatio = PartToPartRatio & {
  parts: [AgentMatcher, AgentMatcher, AgentMatcher]
  ratios: [number, number, number]
}

export type Proportion = {
  kind: 'proportion',
  inverse: boolean,
  entities?: [string, string]
}

export type CommonSense = {
  kind: 'common-sense'
  description: string
}

export type CompareAndPartEqual = {
  kind: 'comp-part-eq'
}

export type Simplify = {
  kind: 'simplify'
}

export type NthRule = {
  kind: 'nth'
  entity: string
}
export type NthPart = {
  kind: 'nth-part'
  agent: string
}

export type RatioCtor = {
  kind: 'ratio-c'
  agent: string
}
export type RatiosCtor = {
  kind: 'ratios-c',
  agent: string
}

export type Question = {
  question: string,
  result: Predicate
  options: {
    tex: string
    result: string,
    ok: boolean
  }[]
}


export type Predicate = Container | Comparison | RatioComparison | Transfer | Rate | SumCombine | ProductCombine | PartWholeRatio | PartToPartRatio | ComparisonDiff |
  CommonSense | GCD | LCD | CompareAndPartEqual | Sequence | NthRule | Quota | Simplify | RatioCtor | RatiosCtor | NthPart | Transfer | Proportion | ConvertUnit;

export function ctor(kind: 'ratio' | 'comp-ratio' | 'rate' | "comp-diff" | 'comp-part-eq' | 'sequence' | 'nth' | 'ratios' | 'simplify') {
  return { kind } as Predicate
}
export function ctorUnit(unit: Unit): ConvertUnit {
  return { kind: "unit", unit }
}

export function ctorRatios(agent: AgentMatcher): RatiosCtor {
  return { kind: "ratios-c", agent }
}
export function ctorRatio(agent: AgentMatcher): RatioCtor {
  return { kind: "ratio-c", agent }
}

export function cont(agent: string, quantity: number, entity: string, unit?: string): Container {
  return { kind: 'cont', agent, quantity, entity, unit };
}
export function pi(): Container {
  return { kind: 'cont', agent: "PI", quantity: 3.14, entity: '' }
}
export function comp(agentA: string, agentB: string, quantity: number, entity: string): Comparison {
  return { kind: 'comp', agentA, agentB, quantity, entity }
}
export function transfer(agentA: string, agentB: string, quantity: number, entity: string): Transfer {
  return { kind: 'transfer', agentA, agentB, quantity, entity }
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
export function ratio(whole: AgentMatcher, part: AgentMatcher, ratio: number): PartWholeRatio {
  return { kind: 'ratio', whole, part, ratio }
}
export function ratios(whole: AgentMatcher, parts: AgentMatcher[], ratios: number[]): PartToPartRatio {
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
export function nthPart(agent): NthPart {
  return { kind: 'nth-part', agent }
}
export function rate(agent: string, quantity: number, entity: string, entityBase: string): Rate {
  return { kind: 'rate', agent, quantity, entity: { entity: entity }, entityBase: { entity: entityBase } }
}
export function quota(agent: string, agentQuota, quantity: number, restQuantity = 0): Quota {
  return { kind: 'quota', agent, agentQuota, quantity, restQuantity }
}

export function proportion(inverse: boolean, entities: [string, string]): Proportion {
  return { kind: 'proportion', inverse, entities };
}

export function commonSense(description: string): CommonSense {
  return { kind: 'common-sense', description }
}


function compareRuleEx(a: Container, b: Comparison): Container {
  //check
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }

  if (a.agent == b.agentB) {
    return { kind: 'cont', agent: b.agentA, quantity: a.quantity + b.quantity, entity: a.entity, unit: a.unit }
  }
  else if (a.agent == b.agentA) {
    return { kind: 'cont', agent: b.agentB, quantity: a.quantity + -1 * b.quantity, entity: a.entity, unit: a.unit }
  }
}
function compareRule(a: Container, b: Comparison): Question {
  const result = compareRuleEx(a, b)
  return {
    question: `Vypočti ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity(result)}?`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? ' + ' : ' - '} ${formatNumber(Math.abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentB },
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? ' - ' : ' + '} ${formatNumber(Math.abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentA },
    ]
  }
}

function toComparisonRatioEx(a: PartWholeRatio, b: PartWholeRatio): RatioComparison {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole}`
  }
  return { kind: 'comp-ratio', agentB: b.part, agentA: a.part, ratio: 1 + (a.ratio - b.ratio) }
}
function toComparisonRatio(a: PartWholeRatio, b: PartWholeRatio): Question {
  const result = toComparisonRatioEx(a, b)
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik?`,
    result,
    options: [
      { tex: `${formatRatio(a.ratio)} - ${formatRatio(b.ratio)}`, result: formatRatio(a.ratio - b.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} - ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio - a.ratio), ok: false },
    ]
  }
}
function convertToUnitEx(a: Container, b: ConvertUnit): Container {
  if (a.unit == null) {
    throw `Missing entity unit ${a.agent} a ${a.entity}`;
  }
  return { ...a, quantity: convert(a.quantity).from(a.unit).to(b.unit), unit: b.unit }
}
function convertToUnit(a: Container, b: ConvertUnit): Question {
  const result = convertToUnitEx(a, b)
  const destination = convert().getUnit(a.unit)?.unit?.to_anchor;
  const origin = convert().getUnit(b.unit)?.unit?.to_anchor;
  return {
    question: `Převeď ${formatNumber(a.quantity)} ${formatEntity(a)} na ${b.unit}.`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(destination / origin)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(origin / destination)}`, result: formatNumber(result.quantity), ok: false },
    ]
  }
}

function ratioCompareRuleEx(a: Container, b: RatioComparison): Container {
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

function ratioCompareRule(a: Container, b: RatioComparison): Question {
  const result = ratioCompareRuleEx(a, b)
  return {
    question: `Vypočti ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity(result)}?`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(Math.abs(b.ratio))}`, result: formatNumber(a.quantity * b.ratio), ok: (a.agent == b.agentB && b.ratio >= 0) || (a.agent == b.agentB && b.ratio < 0) },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(Math.abs(b.ratio))}`, result: formatNumber(a.quantity / b.ratio), ok: (a.agent == b.agentA && b.ratio >= 0) || (a.agent == b.agentA && b.ratio < 0) },
    ]
  }
}

function transferRule(a: Container, b: Transfer): Container {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  if (a.agent == b.agentB) {
    return { kind: 'cont', agent: b.agentA, quantity: a.quantity + 2 * b.quantity, entity: a.entity }
  }
  else if (a.agent == b.agentA) {
    return { kind: 'cont', agent: b.agentB, quantity: a.quantity + -2 * b.quantity, entity: a.entity }
  }
}

function diffPartToWholeRuleEx(a: RatioCtor, b: PartWholeRatio): PartWholeRatio {
  return {
    kind: 'ratio',
    whole: b.whole,
    ratio: 1 - b.ratio,
    part: a.agent
  }
}

function diffPartToWholeRule(a: RatioCtor, b: PartWholeRatio): Question {
  const result = diffPartToWholeRuleEx(a, b)
  return {
    question: `Vyjádři poměrem ${result.part} z ${result.whole}?`,
    result,
    options: [
      { tex: `1 - ${formatRatio(b.ratio)}`, result: formatRatio(1 - b.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} - 1`, result: formatRatio(b.ratio - 1), ok: false },
    ]
  }
}

function diffPartToPartRule(a: RatiosCtor, b: PartWholeRatio): TwoPartRatio {

  if (b.ratio > 1) {
    throw `Part to part ratio should be less than 1.`
  }

  return {
    kind: 'ratios',
    whole: b.whole,
    ratios: [b.ratio, 1 - b.ratio],
    parts: [b.part, a.agent]
  }
}


function compRatioToCompRuleEx(a: RatioComparison, b: Comparison): Container {
  if (b.quantity > 0 && a.ratio < 1 || b.quantity < 0 && a.ratio > 1) {
    throw `Uncompatible compare rules. Absolute compare ${b.quantity} between ${b.agentA} a ${b.agentB} does not match relative compare ${a.ratio}. `
  }
  return {
    kind: 'cont',
    agent: b.agentB,
    entity: b.entity,
    quantity: Math.abs(b.quantity / (a.ratio - 1))
  }
}

function compRatioToCompRule(a: RatioComparison, b: Comparison): Question {
  const result = compRatioToCompRuleEx(a, b)
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `${formatNumber(Math.abs(b.quantity))} / ${formatRatio(Math.abs(a.ratio - 1))}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(Math.abs(b.quantity))} / ${formatRatio(Math.abs(1 - a.ratio))}`, result: formatNumber(Math.abs(b.quantity / (1 - a.ratio))), ok: false },
    ]
  }
}

function proportionRuleEx(a: RatioComparison, b: Proportion): RatioComparison {
  return {
    ...a,
    ...(b.inverse && { ratio: 1 / a.ratio })
  }
}

function proportionRule(a: RatioComparison, b: Proportion): Question {
  const result = proportionRuleEx(a, b)
  return {
    question: `Jaký je vztah mezi veličinami? ${b.entities?.join(' a ')}`,
    result,
    options: [
      { tex: `zachovat poměr`, result: formatRatio(a.ratio), ok: !b.inverse },
      { tex: `obrátit poměr - 1 / ${formatRatio(a.ratio)}`, result: formatRatio(1 / a.ratio), ok: b.inverse },
    ]
  }
}

function partToWholeRuleEx(a: Container, b: PartWholeRatio): Container {

  if (!(matchAgent(b.whole, a) || matchAgent(b.part, a))) {
    throw `Mismatch entity ${[a.agent, a.entity].join()} any of ${[b.whole, b.part].join()}`
  }
  return matchAgent(b.whole, a)
    ? { kind: 'cont', agent: b.part, entity: a.entity, quantity: a.quantity * b.ratio }
    : { kind: 'cont', agent: b.whole, entity: a.entity, quantity: a.quantity / b.ratio }
}
function partToWholeRule(a: Container, b: PartWholeRatio): Question {
  const result = partToWholeRuleEx(a, b)
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(b.ratio)}`, result: formatNumber(a.quantity * b.ratio), ok: matchAgent(b.whole, a) },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(b.ratio)}`, result: formatNumber(a.quantity / b.ratio), ok: !matchAgent(b.whole, a) }]
  }
}

function rateRuleEx(a: Container, rate: Rate): Container {
  if (!(a.entity === rate.entity.entity || a.entity === rate.entityBase.entity)) {
    throw `Mismatch entity ${a.entity} any of ${rate.entity.entity}, ${rate.entityBase.entity}`
  }
  return {
    kind: 'cont', agent: a.agent,
    entity: a.entity == rate.entity.entity
      ? rate.entityBase.entity
      : rate.entity.entity,
    quantity: a.entity == rate.entity.entity
      ? a.quantity / rate.quantity
      : a.quantity * rate.quantity
  }
}

function rateRule(a: Container, rate: Rate): Question {
  const result = rateRuleEx(a, rate)
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(rate.quantity)}`, result: formatNumber(a.quantity * rate.quantity), ok: a.entity !== rate.entity.entity },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(rate.quantity)}`, result: formatNumber(a.quantity / rate.quantity), ok: a.entity === rate.entity.entity }]
  }
}

function quotaRuleEx(a: Container, quota: Quota): Container {
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

function quotaRule(a: Container, quota: Quota): Question {
  const result = quotaRuleEx(a, quota)
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(quota.quantity)}`, result: formatNumber(a.quantity * quota.quantity), ok: a.agent === quota.agentQuota },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota.quantity)}`, result: formatNumber(a.quantity / quota.quantity), ok: a.agent !== quota.agentQuota }]
  }
}

function toPartWholeRatioEx(part: Container, whole: Container): PartWholeRatio {
  return {
    kind: 'ratio',
    part: part.agent,
    whole: whole.agent,
    ratio: part.quantity / whole.quantity
  }
}
function toPartWholeRatio(part: Container, whole: Container): Question {
  const result = toPartWholeRatioEx(part, whole)
  return {
    question: `Vyjádři poměrem ${part.agent} z ${whole.agent}?`,
    result,
    options: [
      { tex: `${formatNumber(whole.quantity)} / ${formatNumber(part.quantity)}`, result: formatRatio(part.quantity * whole.quantity), ok: false },
      { tex: `${formatNumber(part.quantity)} / ${formatNumber(whole.quantity)}`, result: formatRatio(part.quantity / whole.quantity), ok: true }]
  }
}


function diffRuleEx(a: Container, b: ComparisonDiff): Container {
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

function diffRule(a: Container, diff: ComparisonDiff): Question {
  const result = diffRuleEx(a, diff)
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(diff.quantity)}`, result: formatNumber(a.quantity - diff.quantity), ok: a.agent === diff.agentMinuend },
      { tex: `${formatNumber(a.quantity)} + ${formatNumber(diff.quantity)}`, result: formatNumber(a.quantity + diff.quantity), ok: a.agent !== diff.agentMinuend }
    ]
  }
}

function sumRuleEx(items: Container[], b: SumCombine): Container {
  return { kind: 'cont', agent: b.wholeAgent, quantity: items.reduce((out, d) => out += d.quantity, 0), entity: b.wholeEntity.entity }
}
function sumRule(items: Container[], b: SumCombine): Question {
  const result = sumRuleEx(items, b)
  return {
    question: combineQuestion(result),
    result,
    options: [
      { tex: items.map(d => formatNumber(d.quantity)).join(" + "), result: formatNumber(items.map(d => d.quantity).reduce((out, d) => out += d, 0)), ok: true },
      { tex: items.map(d => formatNumber(d.quantity)).join(" * "), result: formatNumber(items.map(d => d.quantity).reduce((out, d) => out *= d, 1)), ok: false },
    ]
  }

}

function productRuleEx(items: Container[], b: ProductCombine): Container {
  return { kind: 'cont', agent: b.wholeAgent, quantity: items.reduce((out, d) => out *= d.quantity, 1), entity: b.wholeEntity.entity }
}

function productRule(items: Container[], b: ProductCombine): Question {
  const result = productRuleEx(items, b)
  return {
    question: combineQuestion(result),
    result,
    options: [
      { tex: items.map(d => formatNumber(d.quantity)).join(" * "), result: formatNumber(items.map(d => d.quantity).reduce((out, d) => out *= d, 1)), ok: true },
      { tex: items.map(d => formatNumber(d.quantity)).join(" + "), result: formatNumber(items.map(d => d.quantity).reduce((out, d) => out += d, 0)), ok: false },
    ]
  }

}


function gcdRuleEx(items: Container[], b: GCD): Container {
  return { kind: 'cont', agent: b.agent, quantity: gcdCalc(items.map(d => d.quantity)), entity: b.entity }
}
function gcdRule(items: Container[], b: GCD): Question {
  const result = gcdRuleEx(items, b)
  const factors = primeFactorization(items.map(d => d.quantity))
  return {
    question: combineQuestion(result),
    result,
    options: [
      { tex: gcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: true },
      //{ tex: lcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ]
  }
}
function lcdRuleEx(items: Container[], b: LCD): Container {
  return { kind: 'cont', agent: b.agent, quantity: lcdCalc(items.map(d => d.quantity)), entity: b.entity }
}
function lcdRule(items: Container[], b: LCD): Question {
  const result = lcdRuleEx(items, b)
  const factors = primeFactorization(items.map(d => d.quantity))
  return {
    question: combineQuestion(result),
    result,
    options: [
      { tex: lcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: true },
      //{ tex: gcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ]
  }
}
function sequenceRule(items: Container[]): Sequence {
  if (new Set(items.map(d => d.entity)).size > 1) {
    throw `Mismatch entity ${items.map(d => d.entity).join()}`
  }
  const type = sequencer(items.map(d => d.quantity));
  return { kind: 'sequence', type, entity: items[0].entity }
}

function toComparisonEx(a: Container, b: Container): Comparison {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return { kind: 'comp', agentB: b.agent, agentA: a.agent, quantity: a.quantity - b.quantity, entity: a.entity, unit: a.unit }
}
function toComparison(a: Container, b: Container): Question {
  const result = toComparisonEx(a, b)
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik?`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false },
    ]
  }
}
function toRatioComparisonEx(a: Container, b: Container): RatioComparison {
  if (b.agent === a.agent && b.entity != a.entity) {
    //auto convert to
    b = toGenerAgent(b);
    a = toGenerAgent(a)
  }
  if (b.entity != a.entity) {
    throw `Mismatch entity ${b.entity}, ${a.entity}`
  }
  return { kind: 'comp-ratio', agentB: b.agent, agentA: a.agent, ratio: a.quantity / b.quantity }
}
function toRatioComparison(a: Container, b: Container): Question {
  const result = toRatioComparisonEx(a, b);
  const between = (result.ratio > 1/2 && result.ratio < 2);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}.${between ? `O kolik z ${result.agentB}?` : `Kolikrát ${result.ratio < 1 ? 'menší' : 'větší'}?`}`,
    result,
    options: between
      ? [
        { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)} - 1`, result: formatRatio(result.ratio - 1), ok: result.ratio > 1 },
        { tex: `1 - ${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatRatio(1 - result.ratio), ok: result.ratio <= 1 }
      ]
      : [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatRatio(a.quantity / b.quantity), ok: result.ratio >= 1 },
        { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatRatio(b.quantity / a.quantity), ok: result.ratio < 1 }
      ]
  }
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
function toDiffEx(a: Container, b: Container): ComparisonDiff {
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
function toDiff(a: Container, b: Container): Question {
  const result = toDiffEx(a, b)
  return {
    question: `Vypočti rozdíl mezi ${a.quantity} a ${b.quantity}`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false },
    ]
  }
}

function toRateEx(a: Container, b: Container): Rate {
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

function toRate(a: Container, b: Container): Question {
  const result = toRateEx(a, b)
  return {
    question: `Rozděl rovnoměrně na ${b.quantity} ${b.entity}`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity / a.quantity), ok: false },
    ]
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

function toRatiosEx(a: Container, b: Container, whole: AgentMatcher): TwoPartRatio {
  return {
    kind: 'ratios',
    parts: [
      a.agent,
      b.agent
    ],
    ratios: [a.quantity, b.quantity],
    whole
  }
}
function toRatios(a: Container, b: Container, whole: AgentMatcher): Question {
  const result = toRatiosEx(a, b, whole)
  return {
    question: `Vyjádři poměrem mezi ${result.parts.join(":")}?`,
    result,
    options: [
      { tex: `${result.ratios.map(d => formatNumber(d)).join(":")}`, result: result.ratios.map(d => formatNumber(d)).join(":"), ok: true },
      { tex: `${result.ratios.map(d => formatNumber(d)).join(":")}`, result: result.ratios.map(d => formatNumber(d)).join(":"), ok: false },
    ]
  }
}




function partToPartRuleEx(a: Container, partToPartRatio: PartToPartRatio, nth?: NthPart): Container {

  if (!(partToPartRatio.whole != null && matchAgent(partToPartRatio.whole, a) || partToPartRatio.parts.some(d => matchAgent(d, a)))) {
    throw `Mismatch agent ${[a.agent, a.entity].join()} any of ${[partToPartRatio.whole].concat(partToPartRatio.parts).join()}`
  }

  const sourcePartIndex = partToPartRatio.parts.findIndex(d => matchAgent(d, a))
  const targetPartIndex = nth != null ? partToPartRatio.parts.findIndex(d => d === nth.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;


  const partsSum = partToPartRatio.ratios.reduce((out, d) => out += d, 0);
  const matchedWhole = matchAgent(partToPartRatio.whole, a);

  return {
    kind: 'cont',
    agent: (matchedWhole || nth != null) && targetPartIndex != -1
      ? partToPartRatio.parts[targetPartIndex]
      : partToPartRatio.whole,
    entity: a.entity,
    quantity: matchedWhole
      ? (a.quantity / partsSum) * partToPartRatio.ratios[targetPartIndex]
      : (a.quantity / partToPartRatio.ratios[sourcePartIndex]) * (nth != null ? partToPartRatio.ratios[targetPartIndex] : partsSum),
    unit: a.unit,
  }
}

function partToPartRule(a: Container, partToPartRatio: PartToPartRatio, nth?: NthPart): Question {
  const result = partToPartRuleEx(a, partToPartRatio, nth)
  const matchedWhole = matchAgent(partToPartRatio.whole, a);
  let sourcePartIndex = partToPartRatio.parts.findIndex(d => matchAgent(d, a))
  const targetPartIndex = nth != null ? partToPartRatio.parts.findIndex(d => d === nth.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;

  if (sourcePartIndex == -1) sourcePartIndex = 0;
  const partsSum = `(${partToPartRatio.ratios.join(" + ")})`
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} / ${partsSum} * ${formatNumber(partToPartRatio.ratios[targetPartIndex])}`, result: formatNumber(result.quantity), ok: matchedWhole },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(partToPartRatio.ratios[sourcePartIndex])} * ${nth != null ? partToPartRatio.ratios[targetPartIndex] : partsSum}`, result: formatNumber(result.quantity), ok: !matchedWhole },
    ]
  }
}

function mapRatiosByFactorEx(multi: PartToPartRatio, quantity: number) {
  return { ...multi, ratios: multi.ratios.map(d => d * quantity) }
}
function mapRatiosByFactor(multi: PartToPartRatio, quantity: number): Question {
  const result = mapRatiosByFactorEx(multi, quantity)

  return {
    question: "Zjednoduš",
    result,
    options: []

  }
}

function matchAgent(d: AgentMatcher, a: Container) {
  return d === a.agent;
}

function partEqualEx(a: Comparison, b: Container) {
  const diff = compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, Math.abs(a.quantity), a.entity);
  const rest = diffRuleEx(b, diff);
  return {
    ...rest,
    quantity: rest.quantity / 2
  }
}
function partEqual(a: Comparison, b: Container): Question {
  const diff = compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, Math.abs(a.quantity), a.entity);
  const result = partEqualEx(a, b)
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `(${formatNumber(b.quantity)} - ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity - diff.quantity) / 2), ok: b.agent === diff.agentMinuend },
      { tex: `(${formatNumber(b.quantity)} + ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity + diff.quantity) / 2), ok: b.agent !== diff.agentMinuend }
    ]
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

function isQuestion(value: Question | Predicate): value is Question {
  return (value as any)?.result != null
}
export function inferenceRule(...args: Predicate[]): Predicate {
  const value = inferenceRuleEx(...args);
  return isQuestion(value) ? value.result : value;
}
export function inferenceRuleWithQuestion(...args: Predicate[]) {
  return inferenceRuleEx(...args)
}
function inferenceRuleEx(...args: Predicate[]): Question | Predicate {
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
            ? toRatios(a, b, "")
            : kind === "ratios-c"
              ? toRatios(a, b, last.agent)
              : kind === "comp-ratio"
                ? toRatioComparison(a, b)
                : kind === "ratio"
                  ? toPartWholeRatio(a, b)
                  : toComparison(a, b)
  }
  else if (a.kind === "cont" && b.kind === "unit") {
    return convertToUnit(a, b);
  }
  else if (a.kind === "unit" && b.kind === "cont") {
    return convertToUnit(b, a);
  }
  else if (a.kind === "ratio" && b.kind === "ratio") {
    return toComparisonRatio(a, b);
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
  else if (a.kind === "comp" && b.kind == "comp-ratio") {
    return compRatioToCompRule(b, a)
  }
  else if (a.kind === "comp-ratio" && b.kind == "comp") {
    return compRatioToCompRule(a, b)
  }
  else if (a.kind === "proportion" && b.kind == "comp-ratio") {
    return proportionRule(b, a)
  }
  else if (a.kind === "comp-ratio" && b.kind == "proportion") {
    return proportionRule(a, b)
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
  else if (a.kind === "ratio-c" && b.kind === "ratio") {
    return diffPartToWholeRule(a, b);
  }
  else if (a.kind === "ratio" && b.kind === "ratio-c") {
    return diffPartToWholeRule(b, a);
  }
  else if (a.kind === "ratios-c" && b.kind === "ratio") {
    return diffPartToPartRule(a, b);
  }
  else if (a.kind === "ratio" && b.kind === "ratios-c") {
    return diffPartToPartRule(b, a);
  }
  else if (a.kind === "cont" && b.kind == "ratios") {
    const kind = last?.kind;
    return kind === "simplify"
      ? mapRatiosByFactor(b, 1 / a.quantity)
      : kind === "nth-part"
        ? partToPartRule(a, b, last) : partToPartRule(a, b);
  }
  else if (a.kind === "ratios" && b.kind == "cont") {
    const kind = last?.kind;
    return kind === "simplify"
      ? mapRatiosByFactor(a, 1 / b.quantity)
      : kind === "nth-part"
        ? partToPartRule(b, a, last) : partToPartRule(b, a);


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
  else if (a.kind === "transfer" && b.kind === "cont") {
    return transferRule(b, a)
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

function formatNumber(d: number) {
  return d.toLocaleString("cs-CZ")
}

function formatRatio(d: number) {
  return (d > -2 && d < 2) ? new Fraction(d).toFraction() : formatNumber(d)
}

function containerQuestion(d: Container) {
  return `Vypočti ${d.agent}${formatEntity(d)}?`
}

function combineQuestion(d: Container) {
  return `Vypočti ${d.agent}${formatEntity(d)}?`
}


function toGenerAgent(a: Container, entity: string = "") {
  return cont(a.entity, a.quantity, entity);
}

export function primeFactorization(numbers: number[]): number[][] {
  const getPrimeFactors = (num: number): number[] => {
    const factors: number[] = [];
    let divisor = 2;

    while (num >= 2) {
      while (num % divisor === 0) {
        factors.push(divisor);
        num = num / divisor;
      }
      divisor++;
    }

    return factors;
  };

  return numbers.map(getPrimeFactors);
}

function gcdFromPrimeFactors(primeFactors: number[][]): number[] {
  const intersection = (arr1: number[], arr2: number[]): number[] => {
    const result: number[] = [];
    const countMap = new Map<number, number>();

    // Count occurrences of elements in the first array
    for (const num of arr1) {
      countMap.set(num, (countMap.get(num) || 0) + 1);
    }

    // For each element in the second array, check if it exists in the map
    for (const num of arr2) {
      if (countMap.get(num)) {
        result.push(num);
        countMap.set(num, countMap.get(num)! - 1); // Decrement the count
      }
    }

    return result;
  };

  // Reduce the arrays by applying the intersection function iteratively
  return primeFactors.reduce((acc, curr) => intersection(acc, curr), primeFactors[0] || []);
}

function lcdFromPrimeFactors(primeFactors: number[][]): number[] {
  const union = (arr1: number[], arr2: number[]): number[] => {
    const result: number[] = [];
    const countMap = new Map<number, number>();

    // Count the occurrences of elements in the first array
    for (const num of arr1) {
      countMap.set(num, (countMap.get(num) || 0) + 1);
    }

    // Update the map with the maximum count from the second array
    for (const num of arr2) {
      countMap.set(num, Math.max(countMap.get(num) || 0, (countMap.get(num) || 0) + 1));
    }

    // Add the prime factors with their maximum occurrences to the result
    for (const [num, count] of countMap.entries()) {
      for (let i = 0; i < count; i++) {
        result.push(num);
      }
    }

    return result;
  };

  // Reduce the arrays by applying the union function iteratively
  return primeFactors.reduce((acc, curr) => union(acc, curr), []);
}

function formatEntity(d: EntityBase) {
  return (d.entity || d.unit) ? `(${[d.unit, d.entity].filter(d => d != null).join(" ")})` : ''
}
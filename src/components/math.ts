export type UnitType = string
export type Helpers = {
  convertToFraction?: (quantity: number) => string | number,
  convertToUnit?: (quantity: number, from: UnitType, to: UnitType) => number
  unitAnchor?: (unit: UnitType) => number;
  solveLinearEquation?: (first: Quantity, second: Quantity, variable: string) => number
  evalExpression?: (expression: Expression, quantity: number) => number
}
const defaultHelpers: Helpers = {
  convertToFraction: d => d,
  convertToUnit: d => d,
  unitAnchor: () => 1,
  solveLinearEquation: (fist, second, variable) => NaN,
  evalExpression: (expression, context) => NaN

}

let helpers = defaultHelpers
export function configure(config: Helpers) {
  helpers = { ...defaultHelpers, ...config }
}

type Unit = string;

type Expression = string;
type ExpressionContext = Record<string, Predicate>
type ExpressionNode = { expression: Expression, context: ExpressionContext }
type NumberOrVariable = number | Expression
type NumberOrExpression = number | ExpressionNode
type Quantity = NumberOrExpression
type Ratio = NumberOrExpression

export function isNumber(quantity: NumberOrExpression | NumberOrVariable): quantity is number {
  return typeof quantity === "number";
}
export function areNumbers(ratios: NumberOrExpression[]): ratios is number[] {
  return ratios.every(d => isNumber(d))
}

function wrapToQuantity(expression: string, context?: ExpressionContext): Quantity {
  //return evaluate(expression, context);  
  return { expression, context: convertContext(context) };
}
function wrapToRatio(expression: string, context?: ExpressionContext): Ratio {
  //return evaluate(expression, context);
  return { expression, context: convertContext(context) };
}

function formatNumbersInExpression(expr) {
  return expr.replace(/(\d*\.\d+|\d+)/g, (match) => {
    const num = parseFloat(match);
    if (!isNaN(num)) {
      return num.toFixed(2).replace(/\.?0+$/, ''); // remove trailing zeros
    }
    return match;
  });
}
function convertContext(context: ExpressionContext) {
  return Object.fromEntries(Object.entries(context).map(([key, value]) => [key, convertRatioKeysToFractions(value)])) as ExpressionContext;
}
function convertRatioKeysToFractions(obj: any) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, key === "ratio" ? helpers.convertToFraction(value as number) : value]))
}
type EntityBase = { entity: string, unit?: Unit }
type AgentMatcher = string

type AgentNames = {
  name: string
  nameAfter?: string
  nameBefore?: string
}

export type Container = EntityBase &
{
  kind: 'cont',
  agent: string,
  quantity: Quantity
}

export type EvalExpr = {
  kind: 'eval-expr',
  expression: Expression
}

export type Option = {
  kind: 'eval-option'
  expression: Expression,
  value?: true | false | "A" | "B" | "C" | "D" | "E" | "F"
  expectedValue?: number | true | false
  optionValue?: "A" | "B" | "C" | "D" | "E" | "F"
}

export type ConvertUnit = {
  kind: 'unit',
  unit: Unit
}
export type Round = {
  kind: 'round',
  fractionDigits: number
}

export type AngleComparison = {
  kind: 'comp-angle',
  agentA: string,
  agentB: string,
  relationship: AngleRelationship
}

export type Comparison = EntityBase & {
  kind: 'comp'
  agentA: string,
  agentB: string,
  quantity: Quantity
}

export type RatioComparison = {
  kind: 'comp-ratio'
  agentA: string,
  agentB: string,
  ratio: Ratio
  asPercent?: boolean
}

export type ComparisonDiff = EntityBase & {
  kind: "comp-diff"
  agentMinuend: string,
  agentSubtrahend: string,
  quantity: Quantity
}

export type Transfer = EntityBase & {
  kind: 'transfer'
  agentReceiver: AgentNames,
  agentSender: AgentNames,
  quantity: Quantity
}

export type Delta = EntityBase & {
  kind: 'delta'
  agent: AgentNames,
  quantity: Quantity
}

export type Rate = {
  kind: 'rate'
  agent: string,
  entity: EntityBase,
  entityBase: EntityBase,
  quantity: Quantity
  baseQuantity: Quantity
}

export type Quota = {
  kind: 'quota'
  agentQuota: string,
  agent: string
  quantity: Quantity
  restQuantity: Quantity
}

export type PartWholeRatio = {
  kind: 'ratio'
  whole: AgentMatcher,
  part: AgentMatcher,
  ratio: Ratio
  asPercent?: boolean
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
  ratios: Ratio[],
}


export type TwoPartRatio = PartToPartRatio & {
  parts: [AgentMatcher, AgentMatcher]
  ratios: [Ratio, Ratio]
}

export type ThreePartRatio = PartToPartRatio & {
  parts: [AgentMatcher, AgentMatcher, AgentMatcher]
  ratios: [Ratio, Ratio, Ratio]
}
export type Phytagoras = {
  kind: 'pythagoras'
  longest: AgentMatcher
  sites: [AgentMatcher, AgentMatcher]
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

export type Scale = {
  kind: 'scale'
  quantity: number
}

export type InvertScale = {
  kind: "invert-scale"
  quantity: number
}

export type NthRule = {
  kind: 'nth'
  entity: string
}
export type NthPart = {
  kind: 'nth-part'
  agent: string
}

export type NthPartFactor = {
  kind: 'nth-factor'
  agent: string
}

export type Complement = {
  kind: 'complement',
  part: AgentMatcher
}
export type Difference = {
  kind: 'diff',
  differenceAgent: AgentMatcher
}

export type LinearEquation = {
  kind: 'linear-equation',
  agent: string,
  variable: string,
  entity: EntityBase
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



export type EntityDef = string | EntityBase
export type Predicate = Container | Comparison | RatioComparison | Transfer | Rate | SumCombine | ProductCombine | PartWholeRatio | PartToPartRatio | ComparisonDiff |
  CommonSense | GCD | LCD | CompareAndPartEqual | Sequence | NthRule | Quota | Scale | Complement | NthPart | NthPartFactor | Transfer | Proportion | ConvertUnit |
  AngleComparison | Delta | Difference | Phytagoras | InvertScale | LinearEquation | EvalExpr | Option | Round

export function ctor(kind: 'ratio' | 'comp-ratio' | 'rate' | 'quota' | "comp-diff" | 'comp-part-eq' | 'sequence' | 'nth' | 'ratios' | 'scale' | 'invert-scale' | 'complement' | 'delta') {
  return { kind } as Predicate
}

export function ctorUnit(unit: Unit): ConvertUnit {
  return { kind: "unit", unit }
}
export function ctorRound(fractionDigits: number = 0): Round {
  return { kind: "round", fractionDigits }
}
export function ctorLinearEquation(agent: string, entity: EntityBase, variable: string = 'x'): LinearEquation {
  return { kind: "linear-equation", agent, variable, entity }
}
export function ctorDelta(agent: string): Delta {
  return { kind: "delta", agent: { name: agent } } as Delta
}
export function ctorPercent(): RatioComparison {
  return { kind: "ratio", asPercent: true } as any
}

export function ctorCompareRatio(agentB?: string): RatioComparison {
  return { kind: "comp-ratio", agentB: agentB, asPercent: false } as any
}
export function ctorComparePercent(agentB?: string): RatioComparison {
  return { kind: "comp-ratio", agentB: agentB, asPercent: true } as any
}

export function ctorRatios(agent: AgentMatcher): PartToPartRatio {
  return { kind: "ratios", whole: agent } as PartToPartRatio
}
export function ctorComplement(part: AgentMatcher): Complement {
  return { kind: "complement", part }
}
export function ctorDifference(differenceAgent: AgentMatcher): Difference {
  return { kind: "diff", differenceAgent }
}

export function cont(agent: string, quantity: NumberOrVariable, entity: string, unit?: string): Container {
  return { kind: 'cont', agent, quantity: quantity as NumberOrExpression, entity, unit };
}

export function evalExpr(expression: string): EvalExpr {
  return { kind: 'eval-expr', expression }
}
export function ctorOption(optionValue: "A" | "B" | "C" | "D" | "E" | "F", expectedValue: number, { asPercent }: { asPercent?: boolean } = { asPercent: false }): Option {
  return { kind: 'eval-option', expression: `closeTo(x, ${asPercent ? expectedValue / 100 : expectedValue})`, expectedValue, optionValue }
}
export function ctorExpressionOption(optionValue: "A" | "B" | "C" | "D" | "E" | "F", expression: string): Option {
  return { kind: 'eval-option', expression, optionValue }
}

export type ComparisonType = "equal" | "greater" | "greaterOrEqual" | "smaller" | "smallerOrEqual" | "closeTo";
export function ctorBooleanOption(expectedValue: number, compareTo: ComparisonType = 'closeTo'): Option {
  return { kind: 'eval-option', expression: convertToExpression(expectedValue, compareTo), expectedValue }
}

function convertToExpression(expectedValue: number, compareTo: ComparisonType) {
  const toCompare = (comp) => `x ${comp} ${helpers.convertToFraction(expectedValue)}`
  switch (compareTo) {
    case "equal": return toCompare("==")
    case "greater": return toCompare(">");
    case "greaterOrEqual": return toCompare("=>");
    case "smaller": return toCompare("<");
    case "smallerOrEqual": return toCompare("=<");
    default:
      return `closeTo(x, ${helpers.convertToFraction(expectedValue)})`;
  }
}
export function delta(agent: AgentNames, quantity: number, entity: string, unit?: string): Delta {
  return { kind: 'delta', agent, quantity, entity, unit };
}
export function pi(): Container {
  return { kind: 'cont', agent: "PI", quantity: 3.14, entity: '' }
}
export function piNumber() {
  return pi().quantity as number
}

export function comp(agentA: string, agentB: string, quantity: NumberOrVariable, entity: EntityDef): Comparison {
  return { kind: 'comp', agentA, agentB, quantity: quantity as NumberOrExpression, entity: toEntity(entity).entity, unit: toEntity(entity).unit }
}
export function compAngle(agentA: string, agentB: string, relationship: AngleRelationship): AngleComparison {
  return { kind: 'comp-angle', agentA, agentB, relationship }
}
export function pythagoras(longestSite: AgentMatcher, sites: [AgentMatcher, AgentMatcher]): Phytagoras {
  return { kind: 'pythagoras', longest: longestSite, sites }
}
export function transfer(agentSender: string | AgentNames, agentReceiver: string | AgentNames, quantity: number, entity: string): Transfer {
  return { kind: 'transfer', agentReceiver: toAgentNames(agentReceiver), agentSender: toAgentNames(agentSender), quantity, entity }
}
function toAgentNames(agent: string | AgentNames) {
  return typeof agent === "string" ? { name: agent } : agent
}
export function compRelative(agentA: string, agentB: string, ratio: number, asPercent?: boolean): RatioComparison {
  if (ratio <= -1 && ratio >= 1) {
    throw 'Relative compare should be between (-1,1).'
  }
  return { kind: 'comp-ratio', agentA, agentB, ratio: 1 + ratio, asPercent }
}
export function compRelativePercent(agentA: string, agentB: string, percent: number): RatioComparison {
  return compRelative(agentA, agentB, percent / 100, true);
}

export function compRatio(agentA: string, agentB: string, ratio: number): RatioComparison {
  return { kind: 'comp-ratio', agentA, agentB, ratio }
}
export function compPercent(agentA: string, agentB: string, percent: number): RatioComparison {
  return { kind: 'comp-ratio', agentA, agentB, ratio: percent / 100, asPercent: true }
}
export function compDiff(agentMinuend: string, agentSubtrahend: string, quantity: number, entity: string): ComparisonDiff {
  return { kind: "comp-diff", agentMinuend, agentSubtrahend, quantity, entity }
}
export function ratio(whole: AgentMatcher, part: AgentMatcher, ratio: number): PartWholeRatio {
  return { kind: 'ratio', whole, part, ratio }
}
export function percent(whole: AgentMatcher, part: AgentMatcher, percent: number): PartWholeRatio {
  return { kind: 'ratio', whole, part, ratio: percent / 100, asPercent: true }
}
export function ratios(whole: AgentMatcher, parts: AgentMatcher[], ratios: number[]): PartToPartRatio {
  return { kind: 'ratios', parts, whole, ratios };
}
export function sum(wholeAgent: string, partAgents: string[], wholeEntity: EntityDef, partEntity: EntityDef): SumCombine {
  return {
    kind: 'sum',
    wholeAgent,
    partAgents,
    wholeEntity: toEntity(wholeEntity),
    partEntity: toEntity(partEntity)
  }
}
export function product(wholeAgent: string, partAgents: string[], wholeEntity: EntityDef, partEntity: EntityDef): ProductCombine {
  return { kind: 'product', wholeAgent, partAgents, wholeEntity: toEntity(wholeEntity), partEntity: toEntity(partEntity) }
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

export function nthPartFactor(agent): NthPartFactor {
  return { kind: 'nth-factor', agent }
}
export function rate(agent: string, quantity: number, entity: EntityDef, entityBase: EntityDef, baseQuantity: number = 1): Rate {
  return { kind: 'rate', agent, quantity, baseQuantity, entity: toEntity(entity), entityBase: toEntity(entityBase) }
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

function toEntity(entity: EntityDef): EntityBase {
  return isEntityBase(entity) ? entity : { entity }
}
function compareRuleEx(a: Container, b: Comparison): Container {
  //check
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity} `
  }

  if (a.agent == b.agentB) {
    return {
      kind: 'cont', agent: b.agentA,
      quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b }),
      entity: a.entity, unit: a.unit
    }
  }
  else if (a.agent == b.agentA) {
    return {
      kind: 'cont', agent: b.agentB,
      quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + -1 * b.quantity : wrapToQuantity(`a.quantity + -1 * b.quantity`, { a, b }),
      entity: a.entity, unit: a.unit
    }
  }
}
function compareRule(a: Container, b: Comparison): Question {
  const result = compareRuleEx(a, b)
  return {
    question: `${computeQuestion(result.quantity)} ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity)
      ? [
        { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? ' + ' : ' - '} ${formatNumber(abs(b.quantity))} `, result: formatNumber(result.quantity), ok: a.agent == b.agentB },
        { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? ' - ' : ' + '} ${formatNumber(abs(b.quantity))} `, result: formatNumber(result.quantity), ok: a.agent == b.agentA },
      ]
      : []
  }
}
function compareAngleRuleEx(a: Container, b: AngleComparison): Container {
  //check
  return { kind: 'cont', agent: a.agent == b.agentB ? b.agentA : b.agentB, quantity: computeOtherAngle(a.quantity, b.relationship), entity: a.entity, unit: a.unit }
}
function compareAngleRule(a: Container, b: AngleComparison): Question {
  const result = compareAngleRuleEx(a, b)
  return {
    question: `Vypočti ${a.agent == b.agentB ? b.agentA : b.agentB}? Úhel ${b.agentA} je ${formatAngle(b.relationship)} úhel k ${b.agentB}.`,
    result,
    options: isNumber(result.quantity)
      ? [
        { tex: `90 - ${a.quantity} `, result: formatNumber(result.quantity), ok: b.relationship == "complementary" },
        { tex: `180 - ${a.quantity} `, result: formatNumber(result.quantity), ok: b.relationship == "supplementary" || b.relationship == "sameSide" },
        { tex: `${a.quantity} `, result: formatNumber(result.quantity), ok: b.relationship != "supplementary" && b.relationship != "complementary" && b.relationship != "sameSide" },
      ]
      : []
  }
}

function toComparisonAsRatioEx(a: PartWholeRatio, b: PartWholeRatio): RatioComparison {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole} `
  }
  return {
    kind: 'comp-ratio', agentB: b.part, agentA: a.part,
    ratio: isNumber(a.ratio) && isNumber(b.ratio) ? 1 + (a.ratio - b.ratio) : wrapToRatio(`1 + (a.ratio - b.ratio)`, { a, b })
  }
}
function toComparisonAsRatio(a: PartWholeRatio, b: PartWholeRatio): Question {
  const result = toComparisonAsRatioEx(a, b)
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik ? `,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) && isNumber(result.ratio)
      ? [
        { tex: `1 + (${formatRatio(a.ratio)} - ${formatRatio(b.ratio)})`, result: formatRatio(result.ratio), ok: true },
        { tex: `${formatRatio(b.ratio)} - ${formatRatio(a.ratio)} `, result: formatRatio(result.ratio), ok: false },
      ]
      : []
  }
}
function toComparisonRatioEx(a: PartWholeRatio, b: PartWholeRatio): RatioComparison {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole} `
  }
  return {
    kind: 'comp-ratio', agentB: b.part, agentA: a.part,
    ratio: isNumber(a.ratio) && isNumber(b.ratio) ? a.ratio / b.ratio : wrapToRatio(`a.ratio / b.ratio`, { a, b })
  }
}
function toComparisonRatio(a: PartWholeRatio, b: PartWholeRatio): Question {
  const result = toComparisonRatioEx(a, b)
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}.Kolikrát ? `,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) ? [
      {
        tex: `${formatRatio(a.ratio)} / ${formatRatio(b.ratio)}`, result: formatRatio(a.ratio / b.ratio), ok: true
      },
      { tex: `${formatRatio(b.ratio)} / ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio / a.ratio), ok: false },
    ] : []
  }
}

function comparisonRatioRuleEx(b: RatioComparison, a: PartWholeRatio): PartWholeRatio {
  if (!(a.part == b.agentA || a.part == b.agentB)) {
    throw `Mismatch agent ${a.part} any of ${b.agentA}, ${b.agentB}`
  }
  if (a.part == b.agentB) {
    return {
      kind: 'ratio', whole: a.whole, part: b.agentA,
      ratio: isNumber(a.ratio) && isNumber(b.ratio) ? b.ratio >= 0 ? a.ratio * b.ratio : a.ratio / abs(b.ratio) : wrapToRatio(`b.ratio >= 0 ? a.ratio * b.ratio : a.ratio / abs(b.ratio)`, { a, b })
    }
  }
  else if (a.part == b.agentA) {
    return {
      kind: 'ratio', whole: a.whole, part: b.agentB,
      ratio: isNumber(a.ratio) && isNumber(b.ratio) ? b.ratio > 0 ? a.ratio / b.ratio : a.ratio * abs(b.ratio) : wrapToRatio(`b.ratio > 0 ? a.ratio / b.ratio : a.ratio * abs(b.ratio)`, { a, b })
    }
  }
}
function comparisonRatioRule(b: RatioComparison, a: PartWholeRatio): Question {
  const result = comparisonRatioRuleEx(b, a)
  return {
    question: `${computeQuestion(result.ratio)}} ${a.part == b.agentB ? b.agentA : b.agentB}?`,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) ? [
      { tex: `${formatRatio(a.ratio)} * ${formatRatio(abs(b.ratio))}`, result: formatRatio(a.ratio * b.ratio), ok: (a.part == b.agentB && b.ratio >= 0) || (a.part == b.agentA && b.ratio < 0) },
      { tex: `${formatRatio(a.ratio)} / ${formatRatio(abs(b.ratio))}`, result: formatRatio(a.ratio / b.ratio), ok: (a.part == b.agentA && b.ratio >= 0) || (a.part == b.agentB && b.ratio < 0) },
    ] : []
  }
}

function comparisonRatioTransitiveRuleEx(a: RatioComparison, b: RatioComparison): RatioComparison {
  if (a.agentB === b.agentA) {
    return {
      kind: 'comp-ratio', agentA: a.agentA, agentB: b.agentB,
      ratio: isNumber(a.ratio) && isNumber(b.ratio) ? abs(a.ratio) * abs(b.ratio) : wrapToRatio(`abs(a.ratio) * abs(b.ratio)`, { a, b })
    }
  }
  else if (a.agentB === b.agentB) {
    return {
      kind: 'comp-ratio', agentA: a.agentA, agentB: b.agentA,
      ratio: isNumber(a.ratio) && isNumber(b.ratio) ? abs(a.ratio) * 1 / abs(b.ratio) : wrapToRatio(`abs(a.ratio) * 1 / abs(b.ratio)`, { a, b })
    }
  }
  else if (a.agentA === b.agentA) {
    return {
      kind: 'comp-ratio', agentA: a.agentB, agentB: b.agentB,
      ratio: isNumber(a.ratio) && isNumber(b.ratio) ? 1 / abs(a.ratio) * abs(b.ratio) : wrapToRatio(`1 / abs(a.ratio) * abs(b.ratio)`, { a, b })
    }
  }
  else if (a.agentA === b.agentB) {
    return {
      kind: 'comp-ratio', agentA: a.agentB, agentB: b.agentA,
      ratio: isNumber(a.ratio) && isNumber(b.ratio) ? 1 / abs(a.ratio) * 1 / abs(b.ratio) : wrapToRatio(`1 / abs(a.ratio) * 1 / abs(b.ratio)`, { a, b })
    }
  }
  else {
    throw `Mismatch agent ${a.agentA}, ${a.agentB} any of ${b.agentA}, ${b.agentB}`
  }
}
function comparisonRatioTransitiveRule(b: RatioComparison, a: RatioComparison): Question {
  const result = comparisonRatioTransitiveRuleEx(b, a)
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}?`,
    result,
    options: [
    ]
  }
}


function convertToPartToPartRatiosEx(b: RatioComparison, a: PartToPartRatio): PartToPartRatio {
  if (!isNumber(b.ratio)) {
    throw "convertToPartToPartRatios does not non quantity"
  }
  return { kind: 'ratios', whole: a.whole, parts: [b.agentA, b.agentB], ratios: [abs(b.ratio), 1] }
}
function convertToPartToPartRatios(b: RatioComparison, a: PartToPartRatio): Question {
  const result = convertToPartToPartRatiosEx(b, a);
  if (!isNumber(b.ratio)) {
    throw "convertToPartToPartRatios does not support expressions"
  }

  return {
    question: `Vyjádři poměrem částí ${[b.agentA, b.agentB].join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `(${formatRatio(abs(b.ratio))}) ku 1`, result: result.ratios.map(d => formatRatio(d)).join(":"), ok: true },
      { tex: `(1 / ${formatRatio(abs(b.ratio))}) ku 1`, result: result.ratios.map(d => formatRatio(d)).join(":"), ok: false },
    ] : []
  }
}


function convertToUnitEx(a: Container | Comparison, b: ConvertUnit): Container | Comparison {
  if (a.unit == null) {
    throw `Missing unit ${a.kind === "cont" ? a.agent : `${a.agentA} to ${a.agentB}`} a ${a.entity}`;
  }
  if (!isNumber(a.quantity)) {
    throw "convertToUnit does not support expressions"
  }
  return { ...a, quantity: helpers.convertToUnit(a.quantity, a.unit, b.unit), unit: b.unit }
}
function convertToUnit(a: Container | Comparison, b: ConvertUnit): Question {
  const result = convertToUnitEx(a, b)
  if (!isNumber(a.quantity) || !isNumber(result.quantity)) {
    throw "convertToUnit does not support expressions"
  }
  const destination = helpers.unitAnchor(a.unit);
  const origin = helpers.unitAnchor(b.unit);
  return {
    question: `Převeď ${formatNumber(a.quantity)} ${formatEntity(a)} na ${b.unit}.`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(destination / origin)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(destination / origin)}`, result: formatNumber(result.quantity), ok: false },
    ]
  }
}
function roundTo(a: Container, b: Round): Question {
  const result = {
    ...a,
    quantity: isNumber(a.quantity) ? Math.round(a.quantity)
      : wrapToQuantity(`round ${a.quantity}`, { a })
  };
  return {
    question: isNumber(a.quantity) ? `Zaokrouhli ${formatNumber(a.quantity)} ${formatEntity(a)} na celé číslo.` : `Zaokrouhli na celé číslo.`,
    result,
    options: isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)}`, result: formatNumber(result.quantity), ok: true },
    ] : []
  }
}

function ratioCompareRuleEx(a: Container, b: RatioComparison): Container {
  if (!(a.agent == b.agentA || a.agent == b.agentB)) {
    throw `Mismatch agent ${a.agent} any of ${b.agentA}, ${b.agentB}`
  }
  if (a.agent == b.agentB) {
    return {
      kind: 'cont', agent: b.agentA,
      quantity: isNumber(a.quantity) && isNumber(b.ratio)
        ? b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / abs(b.ratio)
        : isNumber(b.ratio)
          ? b.ratio >= 0 ? wrapToQuantity(`a.quantity * b.ratio`, { a, b }) : wrapToQuantity(`a.quantity / abs(b.ratio)`, { a, b })
          : wrapToQuantity(`b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / abs(b.ratio)`, { a, b }),
      entity: a.entity, unit: a.unit
    }
  }
  else if (a.agent == b.agentA) {
    return {
      kind: 'cont', agent: b.agentB,
      quantity: isNumber(a.quantity) && isNumber(b.ratio)
        ? b.ratio > 0 ? a.quantity / b.ratio : a.quantity * abs(b.ratio)
        : isNumber(b.ratio)
          ? b.ratio > 0 ? wrapToQuantity(`a.quantity / b.ratio`, { a, b }) : wrapToQuantity(`a.quantity * abs(b.ratio)`, { a, b })
          : wrapToQuantity(`b.ratio > 0 ? a.quantity / b.ratio : a.quantity * abs(b.ratio)`, { a, b }),
      entity: a.entity, unit: a.unit
    }
  }
}

function ratioCompareRule(a: Container, b: RatioComparison): Question {
  const result = ratioCompareRuleEx(a, b)
  return {
    question: `${computeQuestion(result.quantity)} ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.ratio) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity * b.ratio), ok: (a.agent == b.agentB && b.ratio >= 0) || (a.agent == b.agentA && b.ratio < 0) },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity / b.ratio), ok: (a.agent == b.agentA && b.ratio >= 0) || (a.agent == b.agentB && b.ratio < 0) },
    ] : []
  }
}

function transferRuleEx(a: Container, b: Transfer, transferOrder: "after" | "before"): Container {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }

  const plus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b })
  const minus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b })

  const quantity = transferOrder === "before"
    ? a.agent == b.agentSender.name ? plus : minus
    : a.agent == b.agentSender.name ? minus : plus;

  const newAgent = a.agent === b.agentReceiver.name
    ? getAgentName(b.agentReceiver, transferOrder)
    : a.agent == b.agentSender.name
      ? getAgentName(b.agentSender, transferOrder)
      : a.agent;

  return { kind: 'cont', agent: newAgent, quantity, entity: a.entity }

}
function getAgentName(agent: AgentNames, transferOrder: "after" | "before") {
  const name = transferOrder === "before" ? agent.nameBefore : agent.nameAfter;
  return name ?? agent.name;
}
function transferRule(a: Container, b: Transfer, transferOrder: "after" | "before"): Question {
  const result = transferRuleEx(a, b, transferOrder)
  return {
    question: `${computeQuestion(result.quantity)} ${a.agent}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${transferOrder === "before" && a.agent == b.agentSender.name ? ' + ' : ' - '} ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentSender.name },
      { tex: `${formatNumber(a.quantity)} ${transferOrder !== "before" && a.agent == b.agentSender.name ? ' - ' : ' + '} ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentReceiver.name },
    ] : []
  }
}

function deltaRuleEx(a: Container, b: Delta, transferOrder: "after" | "before"): Container {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }

  const plus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b })
  const minus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b })

  const quantity = transferOrder === "before"
    ? minus
    : plus

  const agent = b.agent.name;

  return { kind: 'cont', agent, quantity, entity: a.entity }

}

function deltaRule(a: Container, b: Delta, transferOrder: "after" | "before"): Question {
  const result = deltaRuleEx(a, b, transferOrder)
  return {
    question: `${computeQuestion(result.quantity)} ${result.agent}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${transferOrder === "before" ? ' - ' : ' + '} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(a.quantity)} ${transferOrder == "before" ? ' + ' : ' - '} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: false },
    ] : []
  }
}

function ratioComplementRuleEx(a: Complement, b: PartWholeRatio): PartWholeRatio {
  return {
    kind: 'ratio',
    whole: b.whole,
    ratio: isNumber(b.ratio) ? 1 - b.ratio : wrapToRatio(`1 - b.ratio`, { a, b }),
    part: a.part,
    asPercent: b.asPercent
  }
}

function ratioComplementRule(a: Complement, b: PartWholeRatio): Question {
  const result = ratioComplementRuleEx(a, b)
  return {
    question: `Vyjádři ${b.asPercent ? "procentem" : "poměrem"} ${result.part} z ${result.whole}?`,
    result,
    options: isNumber(b.ratio) ? [
      { tex: `${formatRatio(1, b.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(1 - b.ratio, b.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false },
    ] : []
  }
}

function convertToCompRatioEx(b: PartToPartRatio, { agentB, asPercent }: { agentB?: string, asPercent?: boolean }): RatioComparison {

  if (!areNumbers(b.ratios)) {
    throw "ratios does not support non quantity type"
  }
  const bRatios = b.ratios as number[]
  if (!(b.ratios.length === 2 && b.parts.length === 2)) {
    throw `Part to part ratio has to have exactly two parts.`
  }

  const agentBIndex = agentB != null ? b.parts.indexOf(agentB) : 1;
  if (agentBIndex === -1) {
    throw `Part not found ${agentB}, expecting ${b.parts.join()}.`
  }
  const agentAIndex = agentBIndex === 0 ? 1 : 0
  return {
    kind: 'comp-ratio',
    agentA: b.parts[agentAIndex],
    agentB: b.parts[agentBIndex],
    ratio: bRatios[agentAIndex] / bRatios[agentBIndex],
    asPercent
  }
}
function convertToCompRatio(b: PartToPartRatio, { agentB, asPercent }: { agentB?: string, asPercent?: boolean }): Question {
  const result = convertToCompRatioEx(b, { agentB, asPercent })
  return {
    question: `Porovnej ${asPercent ? "procentem" : "poměrem"} ${result.agentA} a ${result.agentB}?`,
    result,
    options: [
      // { tex: `${formatRatio(1, b.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(1 - b.ratio, b.asPercent), ok: true },
      // { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false },
    ]
  }
}
function toRatioEx(b: PartWholeRatio, asPercent?: boolean): PartWholeRatio {
  return {
    ...b,
    asPercent
  }
}

function toRatio(b: PartWholeRatio, asPercent?: boolean): Question {
  const result = toRatioEx(b, asPercent)

  return {
    question: `Vyjádři ${(asPercent) ? "procentem" : "poměrem"}?`,
    result,
    options: isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `1 / ${formatRatio(b.ratio, b.asPercent)}${asPercent ? " * 100" : ''}`, result: formatRatio(result.ratio, result.asPercent), ok: asPercent },
    ] : []
  }
}

function reverseCompRatioEx(b: RatioComparison, asPercent?: boolean): RatioComparison {
  return {
    kind: 'comp-ratio',
    agentA: b.agentB,
    agentB: b.agentA,
    ratio: isNumber(b.ratio) ? 1 / b.ratio : wrapToRatio(`1 / b.ratio`, { b }),
    asPercent: asPercent ?? b.asPercent
  }
}

function reverseCompRatio(b: RatioComparison, asPercent?: boolean): Question {
  const result = reverseCompRatioEx(b, asPercent)

  return {
    question: `Obrať porovnání ${(asPercent ?? b.asPercent) ? "procentem" : "poměrem"} ${result.agentA} a ${result.agentB}?`,
    result,
    options: isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `1 / ${formatRatio(b.ratio, b.asPercent)}${result.asPercent ? " * 100" : ''}`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      // { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false },
    ] : []
  }
}

function ratiosConvertRuleEx(a: NthPart, b: PartToPartRatio, asPercent: boolean): PartWholeRatio {
  if (!areNumbers(b.ratios)) {
    throw "ratios does not support non quantity type"
  }
  if (!b.parts.includes(a.agent)) {
    throw `Missing part ${a.agent} , ${b.parts.join()}.`
  }
  const index = b.parts.indexOf(a.agent);

  return {
    kind: 'ratio',
    whole: b.whole,
    ratio: b.ratios[index] / b.ratios.reduce((out, d) => out += d, 0),
    part: b.parts[index],
    asPercent
  }
}
function ratiosConvertRule(a: NthPart, b: PartToPartRatio, last: PartWholeRatio): Question {
  const result = ratiosConvertRuleEx(a, b, last.asPercent)
  if (!areNumbers(b.ratios) || !isNumber(result.ratio)) {
    throw "ratios does not support non quantity type"
  }

  const index = b.parts.indexOf(a.agent);
  const value = b.ratios[index];

  return {
    question: `Vyjádři ${last.asPercent ? "procentem" : "poměrem"} ${result.part} z ${result.whole}?`,
    result,
    options: [
      { tex: `${formatNumber(value)} / (${b.ratios.map(d => formatNumber(d)).join(" + ")})`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatNumber(value)} * (${b.ratios.map(d => formatNumber(d)).join(" + ")})`, result: formatRatio(result.ratio, result.asPercent), ok: false },
    ]
  }
}
function compRatioToCompRuleEx(a: RatioComparison, b: Comparison): Container {

  const agent = a.agentB === b.agentA ? b.agentA : b.agentB;
  if (isNumber(a.ratio) && isNumber(b.quantity)) {
    const quantity = a.agentB === b.agentA ? -1 * b.quantity : b.quantity
    if (quantity > 0 && a.ratio < 1 || quantity < 0 && a.ratio > 1) {
      throw `Uncompatible compare rules. Absolute compare ${quantity} between ${b.agentA} a ${b.agentB} does not match relative compare ${a.ratio}. `
    }
  }
  return {
    kind: 'cont',
    agent: agent,
    entity: b.entity,
    unit: b.unit,
    quantity: isNumber(a.ratio) && isNumber(b.quantity) ? abs(b.quantity / (a.ratio - 1)) : wrapToQuantity(`abs(b.quantity / (a.ratio - 1))`, { a, b })
  }
}

function compRatioToCompRule(a: RatioComparison, b: Comparison): Question {
  const result = compRatioToCompRuleEx(a, b)
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.ratio) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(abs(b.quantity))} / ${formatRatio(abs(a.ratio - 1))}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(abs(b.quantity))} / ${formatRatio(abs(1 - a.ratio))}`, result: formatNumber(abs(b.quantity / (1 - a.ratio))), ok: false },
    ] : []
  }
}

function compRatiosToCompRuleEx(a: PartToPartRatio, b: Comparison): Container {
  if (!areNumbers(a.ratios) || !isNumber(b.quantity)) {
    throw "ratios does not support non quantity type"
  }

  const aIndex = a.parts.indexOf(b.agentA);
  const bIndex = a.parts.indexOf(b.agentB);
  if (aIndex === -1 || bIndex === -1) {
    throw `Missing parts to compare ${a.parts.join(",")}, required parts ${b.agentA, b.agentB}`
  }

  const aAgent = a.parts[aIndex];
  const bAgent = a.parts[bIndex];
  const diff = a.ratios[aIndex] - a.ratios[bIndex];
  if (!((diff > 0 && b.quantity > 0) || (diff < 0 && b.quantity < 0 || (diff == 0 && b.quantity == 0)))) {
    throw `Uncompatible compare rules. Absolute compare ${b.quantity} between ${b.agentA} a ${b.agentB} does not match relative compare.`
  }

  const lastIndex = aIndex > bIndex ? aIndex : bIndex;
  const nthPartAgent = a.parts[lastIndex]

  return {
    kind: 'cont',
    agent: nthPartAgent,
    entity: b.entity,
    unit: b.unit,
    quantity: abs(b.quantity / diff) * a.ratios[lastIndex]
  }
}

function compRatiosToCompRule(a: PartToPartRatio, b: Comparison): Question {
  const result = compRatiosToCompRuleEx(a, b)
  const aIndex = a.parts.indexOf(b.agentA);
  const bIndex = a.parts.indexOf(b.agentB);
  const lastIndex = aIndex > bIndex ? aIndex : bIndex;

  return {
    question: containerQuestion(result),
    result,
    options: areNumbers(a.ratios) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(abs(b.quantity))} / (${formatNumber(a.ratios[aIndex])} - ${formatNumber(a.ratios[bIndex])}) * ${formatNumber(a.ratios[lastIndex])}`, result: formatNumber(result.quantity), ok: true },
    ] : []
  }
}


function proportionRuleEx(a: RatioComparison, b: Proportion): RatioComparison {
  return {
    ...a,
    ...(b.inverse && { ratio: isNumber(a.ratio) ? 1 / a.ratio : wrapToRatio(`1 / a.ratio`, { a }) })
  }
}

function proportionRule(a: RatioComparison, b: Proportion): Question {
  const result = proportionRuleEx(a, b)
  return {
    question: `Jaký je vztah mezi veličinami? ${b.entities?.join(' a ')}`,
    result,
    options: isNumber(a.ratio) ? [
      { tex: `zachovat poměr`, result: formatRatio(a.ratio), ok: !b.inverse },
      { tex: `obrátit poměr - 1 / ${formatRatio(a.ratio)}`, result: formatRatio(1 / a.ratio), ok: b.inverse },
    ] : []
  }
}


function proportionRatiosRuleEx(a: PartToPartRatio, b: Proportion): PartToPartRatio {
  if (a.ratios.length != 2) {
    throw 'Only two part ratios is supported.'
  }
  return {
    kind: 'ratios',
    whole: b.entities[0] == a.whole ? b.entities[1] : b.entities[0],
    parts: a.parts,
    ratios: b.inverse ? a.ratios.reverse() : a.ratios,
  }
}

function proportionRatiosRule(a: PartToPartRatio, b: Proportion): Question {
  const result = proportionRatiosRuleEx(a, b)
  return {
    question: `Jaký je vztah mezi veličinami? ${b.entities?.join(' a ')}`,
    result,
    options: [
      { tex: `zachovat poměr`, result: result.ratios.join(":"), ok: !b.inverse },
      { tex: `obrátit poměr`, result: result.ratios.join(":"), ok: b.inverse },
    ]
  }
}

function partToWholeRuleEx(a: Container, b: PartWholeRatio): Container {

  if (!(matchAgent(b.whole, a) || matchAgent(b.part, a))) {
    throw `Mismatch entity ${[a.agent, a.entity].join()} any of ${[b.whole, b.part].join()}`
  }
  return matchAgent(b.whole, a)
    ? {
      kind: 'cont', agent: b.part, entity: a.entity,
      quantity: isNumber(a.quantity) && isNumber(b.ratio) ? a.quantity * b.ratio : wrapToQuantity(`a.quantity * b.ratio`, { a, b }),
      unit: a.unit
    }
    : {
      kind: 'cont', agent: b.whole, entity: a.entity,
      quantity: isNumber(a.quantity) && isNumber(b.ratio) ? a.quantity / b.ratio : wrapToQuantity(`a.quantity / b.ratio`, { a, b }),
      unit: a.unit
    }
}
function partToWholeRule(a: Container, b: PartWholeRatio): Question {
  const result = partToWholeRuleEx(a, b)
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(b.ratio) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(b.ratio)}`, result: formatNumber(a.quantity * b.ratio), ok: matchAgent(b.whole, a) },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(b.ratio)}`, result: formatNumber(a.quantity / b.ratio), ok: !matchAgent(b.whole, a) }]
      : []
  }
}

function rateRuleEx(a: Container | Quota, rate: Rate): Container {

  const aEntity = a.kind == "cont" ? a.entity : a.agentQuota
  if (!(aEntity === rate.entity.entity || aEntity === rate.entityBase.entity)) {
    throw `Mismatch entity ${aEntity} any of ${rate.entity.entity}, ${rate.entityBase.entity}`
  }
  const isEntityBase = aEntity == rate.entity.entity;
  const isUnitRate = rate.baseQuantity === 1;
  return {
    kind: 'cont', agent: a.agent,
    entity: isEntityBase
      ? rate.entityBase.entity
      : rate.entity.entity,
    unit: isEntityBase
      ? rate.entityBase.unit
      : rate.entity.unit,
    quantity: aEntity == rate.entity.entity
      ? isNumber(a.quantity) && isNumber(rate.quantity) && isNumber(rate.baseQuantity)
        ? a.quantity / (!isUnitRate ? rate.quantity / rate.baseQuantity : rate.quantity)
        : !isUnitRate
          ? wrapToQuantity(`a.quantity / (rate.quantity/rate.baseQuantity)`, { a, rate })
          : wrapToQuantity(`a.quantity / rate.quantity`, { a, rate })
      : isNumber(a.quantity) && isNumber(rate.quantity) && isNumber(rate.baseQuantity)
        ? a.quantity * (!isUnitRate ? rate.quantity / rate.baseQuantity : rate.quantity)
        : !isUnitRate
          ? wrapToQuantity(`a.quantity * (rate.quantity/rate.baseQuantity)`, { a, rate })
          : wrapToQuantity(`a.quantity * rate.quantity`, { a, rate })
  }
}

function rateRule(a: Container | Quota, rate: Rate): Question {
  const result = rateRuleEx(a, rate)
  const aEntity = a.kind == "cont" ? a.entity : a.agentQuota
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(rate.quantity) && isNumber(result.quantity) && isNumber(rate.baseQuantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(rate.quantity)}`, result: formatNumber(result.quantity), ok: aEntity !== rate.entity.entity },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(rate.quantity)}`, result: formatNumber(result.quantity), ok: aEntity === rate.entity.entity }]
      : []
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
      ? isNumber(a.quantity) && isNumber(quota.quantity) ? a.quantity * quota.quantity : wrapToQuantity(`a.quantity * quota.quantity`, { a, quota })
      : isNumber(a.quantity) && isNumber(quota.quantity) ? a.quantity / quota.quantity : wrapToQuantity(`a.quantity / quota.quantity`, { a, quota })
  }
}

function quotaRule(a: Container, quota: Quota): Question {
  const result = quotaRuleEx(a, quota)
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(quota.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(quota.quantity)}`, result: formatNumber(a.quantity * quota.quantity), ok: a.agent === quota.agentQuota },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota.quantity)}`, result: formatNumber(a.quantity / quota.quantity), ok: a.agent !== quota.agentQuota }]
      : []
  }
}

function toPartWholeRatioEx(part: Container, whole: Container, asPercent?: boolean): PartWholeRatio {
  return {
    kind: 'ratio',
    part: part.agent,
    whole: whole.agent,
    ratio: isNumber(part.quantity) && isNumber(whole.quantity) ? part.quantity / whole.quantity : wrapToRatio(`part.quantity / whole.quantity`, { part, whole }),
    asPercent
  }
}
function toPartWholeRatio(part: Container, whole: Container, last: PartWholeRatio): Question {
  const result = toPartWholeRatioEx(part, whole, last.asPercent)
  return {
    question: `Vyjádři ${last.asPercent ? 'procentem' : 'poměrem'} ${part.agent} z ${whole.agent}?`,
    result,
    options: isNumber(part.quantity) && isNumber(whole.quantity) && isNumber(result.ratio) ? [
      { tex: `${formatNumber(whole.quantity)} / ${formatNumber(part.quantity)} ${last.asPercent ? ' * 100' : ''}`, result: last.asPercent ? formatNumber(result.ratio * 100) : formatRatio(result.ratio), ok: false },
      { tex: `${formatNumber(part.quantity)} / ${formatNumber(whole.quantity)} ${last.asPercent ? ' * 100' : ''}`, result: last.asPercent ? formatNumber(result.ratio * 100) : formatRatio(result.ratio), ok: true }]
      : []
  }
}


function diffRuleEx(a: Container, b: ComparisonDiff): Container {
  if (!(a.agent == b.agentMinuend || a.agent == b.agentSubtrahend)) {
    throw `Mismatch agents ${a.agent} any of ${b.agentMinuend} ${b.agentSubtrahend}`
  }
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }

  const plus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b })
  const minus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b })

  return {
    kind: 'cont',
    agent: a.agent == b.agentMinuend ? b.agentSubtrahend : b.agentMinuend,
    quantity: a.agent == b.agentMinuend
      ? minus
      : plus,
    entity: b.entity
  }
}

function diffRule(a: Container, b: ComparisonDiff): Question {
  const result = diffRuleEx(a, b)
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: a.agent === b.agentMinuend },
      { tex: `${formatNumber(a.quantity)} + ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity + b.quantity), ok: a.agent !== b.agentMinuend }
    ] : []
  }
}

function sumRuleEx(items: Container[] | PartWholeRatio[] | Rate[], b: SumCombine): Container | PartWholeRatio | Rate {
  if (items.every(d => isRatioPredicate(d))) {
    const wholes = items.map(d => (d as any).whole);
    if (wholes.filter(unique).length == wholes.length) {
      throw `Combine only part to whole ratio with the same whole ${wholes}`
    };
    const ratios = items.map(d => d.ratio);
    const ratio = areNumbers(ratios) ? ratios.reduce((out, d) => out += d, 0) : wrapToRatio(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
    return { kind: 'ratio', whole: wholes[0], ratio, part: b.wholeAgent }
  }
  else if (items.every(d => isQuantityPredicate(d))) {
    const values = items.map(d => d.quantity);
    const quantity = areNumbers(values) ? values.reduce((out, d) => out += d, 0) : wrapToQuantity(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
    if (items.every(d => isRatePredicate(d))) {
      const { entity, entityBase } = items[0];
      return { kind: 'rate', agent: b.wholeAgent, quantity, entity, entityBase, baseQuantity: 1 }
    }
    else {
      return { kind: 'cont', agent: b.wholeAgent, quantity, entity: b.wholeEntity.entity, unit: b.wholeEntity.unit }
    }
  }

}
function sumRule(items: Container[] | PartWholeRatio[] | Rate[], b: SumCombine): Question {
  const result = sumRuleEx(items, b)
  const isQuantity = isQuantityPredicate(result);
  return {
    question: result.kind === "cont"
      ? containerQuestion(result)
      : result.kind === "rate"
        ? `${computeQuestion(result.quantity)} ${result.agent}`
        : `${computeQuestion(result.ratio)} ${result.part}`,
    result,
    options: (isQuantity && isNumber(result.quantity)) || (isRatioPredicate(result) && isNumber(result.ratio)) ? [
      {
        tex: items.map(d => isQuantity ? formatNumber(d.quantity) : formatRatio(d.ratio)).join(" + "),
        result: isQuantity
          ? isNumber(result.quantity) ? formatNumber(result.quantity) : 'N/A'
          : isNumber(result.ratio) ? formatRatio(result.ratio) : 'N/A',
        ok: true
      },
      {
        tex: items.map(d => isQuantity ? formatNumber(d.quantity) : formatRatio(d.ratio)).join(" * "),
        result: isQuantity
          ? isNumber(result.quantity) ? formatNumber(result.quantity) : 'N/A'
          : isNumber(result.ratio) ? formatRatio(result.ratio) : 'N/A',
        ok: false
      },
    ] : []
  }
}

function productRuleEx(items: Container[], b: ProductCombine): Container {
  const values = items.map(d => d.quantity)
  return {
    kind: 'cont', agent: b.wholeAgent,
    quantity: areNumbers(values) ? values.reduce((out, d) => out *= d, 1) : wrapToQuantity(items.map((d, i) => `y${i + 1}.quantity`).join(" * "), Object.fromEntries(items.map((d, i) => [`y${i + 1}`, d]))),
    entity: b.wholeEntity.entity, unit: b.wholeEntity.unit
  }
}

function productRule(items: Container[], b: ProductCombine): Question {

  const result = productRuleEx(items, b)
  const values = items.map(d => d.quantity);
  return {
    question: containerQuestion(result),
    result,
    options: areNumbers(values) ? [
      { tex: values.map(d => formatNumber(d)).join(" * "), result: formatNumber(values.reduce((out, d) => out *= d, 1)), ok: true },
      { tex: values.map(d => formatNumber(d)).join(" + "), result: formatNumber(values.reduce((out, d) => out += d, 0)), ok: false },
    ] : []
  }

}


function gcdRuleEx(values: NumberOrExpression[], b: GCD): Container {
  return {
    kind: 'cont', agent: b.agent,
    quantity: areNumbers(values) ? gcdCalc(values) : wrapToQuantity(`gcd(${values.join(',')})`),
    entity: b.entity
  }
}
function gcdRule(items: Container[], b: GCD): Question {
  const values = items.map(d => d.quantity);
  const result = gcdRuleEx(values, b)
  return {
    question: containerQuestion(result),
    result,
    options: areNumbers(values) && isNumber(result.quantity) ? [
      { tex: gcdFromPrimeFactors(primeFactorization(values)).join(" * "), result: formatNumber(result.quantity), ok: true },
      //{ tex: lcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ] : []
  }
}
function lcdRuleEx(values: NumberOrExpression[], b: LCD): Container {
  return {
    kind: 'cont', agent: b.agent,

    quantity: areNumbers(values) ? lcdCalc(values) : wrapToQuantity(`gcd(${values.join(',')})`),
    entity: b.entity
  }
}
function lcdRule(items: Container[], b: LCD): Question {
  const values = items.map(d => d.quantity);
  const result = lcdRuleEx(values, b)
  return {
    question: containerQuestion(result),
    result,
    options: areNumbers(values) && isNumber(result.quantity) ? [
      { tex: lcdFromPrimeFactors(primeFactorization(values)).join(" * "), result: formatNumber(result.quantity), ok: true },
      //{ tex: gcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ] : []
  }
}
function sequenceRuleEx(items: Container[]): Sequence {
  const values = items.map(d => d.quantity);
  if (!areNumbers(values)) {
    throw "quota does not support non quantity type"
  }
  if (new Set(items.map(d => d.entity)).size > 1) {
    throw `Mismatch entity ${items.map(d => d.entity).join()}`
  }
  const type = sequencer(values);
  return { kind: 'sequence', type, entity: items[0].entity }
}
function sequenceRule(items: Container[]): Question {
  const result = sequenceRuleEx(items);
  return {
    question: `Hledej vzor opakování. Jaký je vztah mezi sousedními členy?`,
    result,
    options: sequenceOptions(result.type)
  }
}

function toComparisonEx(a: Container, b: Container): Comparison {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return {
    kind: 'comp', agentB: b.agent, agentA: a.agent,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }),
    entity: a.entity, unit: a.unit
  }
}
function toComparison(a: Container, b: Container): Question {
  const result = toComparisonEx(a, b)
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false },
    ] : []
  }
}
function toTransferEx(a: Container, b: Container, last: Delta): Transfer {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  const agent = { name: last.agent, nameBefore: a.agent, nameAfter: b.agent }
  return {
    kind: 'transfer', agentReceiver: agent.name, agentSender: agent.name,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? b.quantity - a.quantity : wrapToQuantity(`b.quantity - a.quantity`, { a, b }),
    entity: a.entity, unit: a.unit
  }
}
function toTransfer(a: Container, b: Container, last: Delta): Question {
  const result = toTransferEx(a, b, last)
  return {
    question: `Změna stavu ${a.agent} => ${b.agent}. O kolik?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: false },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: true },
    ] : []
  }
}

function toDeltaEx(a: Container, b: Container, last: Delta): Delta {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return {
    kind: 'delta', agent: { name: last.agent?.name ?? b.agent, nameBefore: a.agent, nameAfter: b.agent },
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? b.quantity - a.quantity : wrapToQuantity(`b.quantity - a.quantity`, { a, b }),
    entity: a.entity, unit: a.unit
  }
}
function toDelta(a: Container, b: Container, last: Delta): Question {
  const result = toDeltaEx(a, b, last)
  return {
    question: `Změna stavu ${a.agent} => ${b.agent}. O kolik?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: false },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: true },
    ] : []
  }
}

function convertCompareToDeltaEx(a: Comparison, b: Delta): Delta {
  const { name, nameBefore, nameAfter } = b.agent;
  return { kind: 'delta', agent: { name, nameBefore: nameBefore ?? a.agentA, nameAfter: nameAfter ?? a.agentB }, quantity: a.quantity, entity: a.entity, unit: a.unit }
}

function convertDeltaToCompareEx(a: Delta, b: Comparison): Comparison {
  const { agentA, agentB, entity, unit } = b;
  return { kind: 'comp', agentA, agentB, quantity: a.quantity, entity, unit }
}

function pythagorasRuleEx(a: Container, b: Container, last: Phytagoras): Container {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  if (a.unit != b.unit) {
    throw `Mismatch unit ${a.unit}, ${b.unit}`
  }

  const temp = {
    kind: 'cont' as const,
    entity: a.entity,
    unit: a.unit
  }
  if (a.agent === last.longest || b.agent === last.longest) {
    const longest = a.agent === last.longest ? a : b;
    const otherSite = a.agent === last.longest ? b : a;
    return {
      ...temp,
      quantity: isNumber(longest.quantity) && isNumber(otherSite.quantity)
        ? Math.sqrt(Math.pow(longest.quantity, 2) - Math.pow(otherSite.quantity, 2))
        : wrapToQuantity(`sqrt(longest.quantity^2 - otherSite.quantity^2)`, { longest, otherSite }),
      agent: last.sites[1] === otherSite.agent ? last.sites[0] : last.sites[1]
    }
  }
  else {
    return {
      ...temp,
      quantity: isNumber(a.quantity) && isNumber(b.quantity)
        ? Math.sqrt(Math.pow(a.quantity, 2) + Math.pow(b.quantity, 2))
        : wrapToQuantity(`sqrt(a.quantity^2 + b.quantity^2)`, { a, b }),
      agent: last.longest
    }
  }
}
function pythagorasRule(a: Container, b: Container, last: Phytagoras): Question {
  const result = pythagorasRuleEx(a, b, last)
  const longest = a.agent === last.longest ? a : b;
  const otherSite = a.agent === last.longest ? b : a;
  return {
    question: `Vypočítej stranu ${result.agent} dle Pythagorovi věty?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(longest.quantity) && isNumber(otherSite.quantity) && isNumber(result.quantity) ? [
      { tex: `odmocnina z (${formatNumber(longest.quantity)}^2^ - ${formatNumber(otherSite.quantity)}^2^)`, result: formatNumber(result.quantity), ok: a.agent === last.longest },
      { tex: `odmocnina z (${formatNumber(a.quantity)}^2^ + ${formatNumber(b.quantity)}^2^)`, result: formatNumber(result.quantity), ok: a.agent !== last.longest },
    ] : []
  }
}

function toRatioComparisonEx(a: Container, b: Container, ctor: RatioComparison): RatioComparison {
  if (b.agent === a.agent && b.entity != a.entity) {
    //auto convert to
    b = toGenerAgent(b);
    a = toGenerAgent(a)
  }
  if (b.entity != a.entity) {
    throw `Mismatch entity ${b.entity}, ${a.entity}`
  }
  return {
    kind: 'comp-ratio', agentB: b.agent, agentA: a.agent,
    ratio: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity / b.quantity : wrapToRatio(`a.quantity / b.quantity`, { a, b }),
    ...(ctor.asPercent && { asPercent: true })
  }
}
function toRatioComparison(a: Container, b: Container, ctor: RatioComparison): Question {
  const result = toRatioComparisonEx(a, b, ctor);
  if (isNumber(result.ratio) && isNumber(a.quantity) && isNumber(b.quantity)) {
    const between = (result.ratio > 1 / 2 && result.ratio < 2);
    return {
      question: `Porovnej ${result.agentA} a ${result.agentB}.${between ? `O kolik z ${result.agentB}?` : `Kolikrát ${result.ratio < 1 ? 'menší' : 'větší'}?`}`,
      result,
      options: between
        ?
        [
          { tex: `(${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}) / ${b.quantity}`, result: formatRatio((a.quantity - b.quantity) / b.quantity), ok: result.ratio > 1 },
          { tex: `(${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}) / ${b.quantity}`, result: formatRatio((b.quantity - a.quantity) / b.quantity), ok: result.ratio <= 1 }
        ]
        // [
        //   { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)} - 1`, result: formatRatio(result.ratio - 1), ok: result.ratio > 1 },
        //   { tex: `1 - ${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatRatio(1 - result.ratio), ok: result.ratio <= 1 }
        // ]
        : [
          { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatRatio(a.quantity / b.quantity), ok: result.ratio >= 1 },
          { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatRatio(b.quantity / a.quantity), ok: result.ratio < 1 }
        ]
    }
  }
  else {
    return resultAsQuestion(result);
  }
}

function compareToCompareRuleEx(a: Comparison, b: Comparison): Rate {
  return {
    kind: 'rate',
    agent: a.agentA,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? abs(a.quantity) / abs(b.quantity) : wrapToQuantity(`abs(a.quantity) / abs(b.quantity)`, { a, b }),
    entity: { entity: a.entity },
    entityBase: { entity: b.entity },
    baseQuantity: 1
  }
}
function compareToCompareRule(a: Comparison, b: Comparison): Question {
  const result = compareToCompareRuleEx(a, b);

  return {
    question: `Rozděl ${formatEntity({ entity: a.entity })} rovnoměrně na ${formatEntity({ entity: b.entity })}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(abs(a.quantity))} / ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(abs(b.quantity))} / ${formatNumber(abs(a.quantity))}`, result: formatNumber(abs(b.quantity) / abs(a.quantity)), ok: false },
    ] : []
  }
}

function toComparisonDiffEx(a: Container, b: Container): ComparisonDiff {
  if (a.entity !== b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return {
    kind: "comp-diff",
    agentMinuend: a.agent,
    agentSubtrahend: b.agent,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }),
    entity: a.entity

  }
}
function toComparisonDiff(a: Container, b: Container): Question {
  const result = toComparisonDiffEx(a, b)
  return {
    question: `${computeQuestion(result.quantity)} rozdíl mezi ${a.quantity} a ${b.quantity}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false },
    ] : []
  }
}
function toDifferenceEx(a: Container, b: Container, diff: Difference): Container {
  if (a.entity !== b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  if (a.unit !== b.unit) {
    throw `Mismatch unit ${a.unit}, ${b.unit}`
  }

  return {
    kind: "cont",
    agent: diff.differenceAgent,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }),
    entity: a.entity,
    unit: a.unit
  }
}
function toDifference(a: Container, b: Container, diff: Difference): Question {
  const result = toDifferenceEx(a, b, diff)
  return {
    question: `${computeQuestion(result.quantity)} rozdíl mezi ${a.agent} a ${b.agent}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false },
    ] : []
  }
}

function toDifferenceAsRatioEx(a: PartWholeRatio, b: PartWholeRatio, diff: Difference): PartWholeRatio {
  if (a.whole !== b.whole) {
    throw `Mismatch whole agents ${a.whole}, ${b.whole}`
  }
  return {
    kind: "ratio",
    whole: a.whole,
    part: diff.differenceAgent,
    ratio: isNumber(a.ratio) && isNumber(b.ratio) ? a.ratio - b.ratio : wrapToRatio(`a.ratio - b.ratio`, { a, b })
  }
}
function toDifferenceAsRatio(a: PartWholeRatio, b: PartWholeRatio, diff: Difference): Question {
  const result = toDifferenceAsRatioEx(a, b, diff)
  return {
    question: `${computeQuestion(result.ratio)} rozdíl mezi ${a.part} a ${b.part}`,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio)} - ${formatRatio(b.ratio)}`, result: formatRatio(result.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} - ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio - a.ratio), ok: false },
    ] : []
  }
}


function toRateEx(a: Container, b: Container | Quota): Rate {
  if (a.agent !== b.agent) {
    throw `Mismatch angent ${a.agent}, ${b.agent}`
  }
  return {
    kind: 'rate',
    agent: a.agent,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity / b.quantity : wrapToQuantity(`a.quantity / b.quantity`, { a, b }),
    entity: {
      entity: a.entity,
      unit: a.unit
    },
    entityBase: {
      entity: b.kind === "cont" ? b.entity : b.agentQuota,
      unit: a.unit
    },
    baseQuantity: 1
  }
}

function toRate(a: Container, b: Container | Quota): Question {
  const result = toRateEx(a, b)
  if (isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity)) {
    return {
      question: `Rozděl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity })} rovnoměrně na ${formatNumber(b.quantity)} ${formatEntity({ entity: b.kind === "cont" ? b.entity : b.agentQuota })}`,
      result,
      options: [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
        { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity / a.quantity), ok: false },
      ]
    }
  }
  else {
    return resultAsQuestion(result)
  }
}
function solveEquationEx(a: Container | Rate, b: Container | Rate, last: LinearEquation): Container {
  return {
    kind: 'cont',
    agent: last.agent,
    quantity: helpers.solveLinearEquation(a.quantity, b.quantity, last.variable),
    ...last.entity,
  }
}

function solveEquation(a: Container | Rate, b: Container | Rate, last: LinearEquation): Question {
  const result = solveEquationEx(a, b, last)
  return {
    question: `Vyřeš lineární rovnici ${a.agent} = ${b.agent} pro neznámou ${last.variable}.`,
    result,
    options: []
  }
}

function toQuotaEx(a: Container, quota: Container): Quota {
  // if (a.entity !== quota.entity) {
  //   throw `Mismatch entity ${a.entity}, ${quota.entity}`
  // }
  if (!isNumber(a.quantity) || !isNumber(quota.quantity)) {
    throw "quota does not support non quantity type"
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
function toQuota(a: Container, quota: Container): Question {
  const result = toQuotaEx(a, quota);
  if (isNumber(a.quantity) && isNumber(quota.quantity) && isNumber(result.quantity)) {
    return {
      question: `Rozděl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity, unit: a.unit })} postupně na skupiny velikosti ${formatNumber(quota.quantity)} ${formatEntity({ entity: quota.entity, unit: quota.unit })}`,
      result,
      options: [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota.quantity)}`, result: formatNumber(result.quantity), ok: true },
        { tex: `${formatNumber(quota.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(result.quantity), ok: false },
      ]
    }
  }
  else {
    return resultAsQuestion(result)
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

function toRatiosEx(parts: Container[] | Rate[], whole: AgentMatcher): PartToPartRatio {
  return {
    kind: 'ratios',
    parts: parts.map(d => d.agent),
    ratios: parts.map(d => d.quantity),
    whole
  }
}
function toRatios(parts: Container[] | Rate[], last: PartToPartRatio): Question {
  const result = toRatiosEx(parts, last.whole)
  return {
    question: `Vyjádři poměrem mezi ${result.parts.join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `${result.ratios.map(d => formatNumber(d)).join(":")}`, result: result.ratios.map(d => formatNumber(d)).join(":"), ok: true },
      { tex: `${result.ratios.map(d => formatNumber(d)).join(":")}`, result: result.ratios.map(d => formatNumber(d)).join(":"), ok: false },
    ] : []
  }
}

function evalToQuantityEx<T extends Predicate & { quantity: Quantity }>(a: T, b: EvalExpr): T {
  if (!isNumber(a.quantity)) {
    throw `evalToQuantity does not support non quantity types`
  }

  return {
    ...a,
    quantity: helpers.evalExpression(b.expression, a.quantity)

  }
}
function evalToQuantity<T extends Predicate & { quantity: Quantity }>(a: T, b: EvalExpr): Question {
  const result = evalToQuantityEx(a, b);
  return {
    question: `Vypočti výraz ${b.expression}?`,
    result,
    options: []
  }
}

function evalToOptionEx<T extends Predicate & { quantity?: Quantity, ratio?: Quantity }>(a: T, b: Option): Option {
  let valueToEval = a.quantity ?? a.ratio;


  if (!isNumber(valueToEval)) {
    throw `evalToQuantity does not support non quantity types`
  }
  if (a.kind == "comp-ratio" && valueToEval > 1 / 2 && valueToEval < 2) {
    valueToEval = valueToEval > 1 ? valueToEval - 1 : 1 - valueToEval;
  }

  const matched = helpers.evalExpression(b.expression, valueToEval) as unknown as boolean;
  return {
    kind: 'eval-option',
    expression: b.expression,
    value: b.optionValue != null ? matched ? b.optionValue : null : matched
  }
}
function evalToOption<T extends Predicate>(a: T, b: Option): Question {
  const result = evalToOptionEx(a, b);
  return {
    question: b.optionValue != null ? `Vyhodnoť volbu [${b.optionValue}]?` : `Vyhodnoť výraz ${b.expression}?`,
    result,
    options: []
  }
}



function partToPartRuleEx(a: Container, partToPartRatio: PartToPartRatio, nth?: NthPart): Container {

  if (!(partToPartRatio.whole != null && matchAgent(partToPartRatio.whole, a) || partToPartRatio.parts.some(d => matchAgent(d, a)))) {
    throw `Mismatch agent ${[a.agent, a.entity].join()} any of ${[partToPartRatio.whole].concat(partToPartRatio.parts).join()}`
  }

  const sourcePartIndex = partToPartRatio.parts.findIndex(d => matchAgent(d, a))
  const targetPartIndex = nth != null ? partToPartRatio.parts.findIndex(d => d === nth.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;


  const partsSum = areNumbers(partToPartRatio.ratios) ? partToPartRatio.ratios.reduce((out, d) => out += d, 0) : partToPartRatio.ratios.join(" + ");
  const matchedWhole = matchAgent(partToPartRatio.whole, a);

  return {
    kind: 'cont',
    agent: (matchedWhole || nth != null) && targetPartIndex != -1
      ? partToPartRatio.parts[targetPartIndex]
      : partToPartRatio.whole,
    entity: a.entity,
    quantity: matchedWhole
      ? areNumbers(partToPartRatio.ratios) && isNumber(a.quantity)
        ? (a.quantity / partToPartRatio.ratios.reduce((out, d) => out += d, 0)) * partToPartRatio.ratios[targetPartIndex]
        : wrapToQuantity(`a.quantity / (${partToPartRatio.ratios.map((d, i) => `partToPartRatio.ratios[${i}]`).join(" + ")}) * partToPartRatio.ratios[${targetPartIndex}]`, { a, partToPartRatio })
      : areNumbers(partToPartRatio.ratios) && isNumber(a.quantity)
        ? (a.quantity / partToPartRatio.ratios[sourcePartIndex]) * (nth != null ? partToPartRatio.ratios[targetPartIndex] : partToPartRatio.ratios.reduce((out, d) => out += d, 0))
        : nth != null
          ? wrapToQuantity(`a.quantity / partToPartRatio.ratios[${sourcePartIndex}] * partToPartRatio.ratios[${targetPartIndex}]`, { a, partToPartRatio })
          : wrapToQuantity(`a.quantity / partToPartRatio.ratios[${sourcePartIndex}] * (${partToPartRatio.ratios.map((d, i) => `partToPartRatio.ratios[${i}]`).join(" + ")})`, { a, partToPartRatio }),
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
    options: areNumbers(partToPartRatio.ratios) && isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} / ${partsSum} * ${formatNumber(partToPartRatio.ratios[targetPartIndex])}`, result: formatNumber(result.quantity), ok: matchedWhole },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(partToPartRatio.ratios[sourcePartIndex])} * ${nth != null ? partToPartRatio.ratios[targetPartIndex] : partsSum}`, result: formatNumber(result.quantity), ok: !matchedWhole },
    ] : []
  }
}

function mapRatiosByFactorEx(multi: PartToPartRatio, quantity: number) {
  if (!areNumbers(multi.ratios)) {
    throw "ratios are not supported by non quantity types"
  }

  return { ...multi, ratios: multi.ratios.map(d => d * quantity) }
}
function mapRatiosByFactor(multi: PartToPartRatio, factor: Container, inverse?: boolean): Question {
  if (!areNumbers(multi.ratios) || !isNumber(factor.quantity)) {
    throw "ratios are not supported by non quantity types"
  }
  const quantity = inverse ? factor.quantity : 1 / factor.quantity;
  const result = mapRatiosByFactorEx(multi, quantity)

  return {
    question: `${quantity > 1 ? "Roznásob " : "Zkrať "} poměr číslem ${quantity > 1 ? formatNumber(quantity) : formatNumber(1 / quantity)}`,
    result,
    options: []

  }
}
function nthPartFactorByEx(multi: PartToPartRatio, factor: NumberOrExpression, nthPart: NthPartFactor): PartToPartRatio {
  if (!areNumbers(multi.ratios) || !isNumber(factor)) {
    throw "ratios are not supported by non quantity types"
  }
  if (factor < 1) {
    throw `Ratios can be only extended by positive quantity ${factor}.`
  }
  const partIndex = multi.parts.indexOf(nthPart.agent)

  const multiplePartByFactor = (arr) => arr.reduce((out, d, i) => {
    if (i === partIndex) {
      out.push(...[...Array(factor)].map(_ => d))
    }
    else out.push(d)
    return out;
  }, [])

  return {
    kind: 'ratios',
    whole: multi.whole,
    parts: multiplePartByFactor(multi.parts),
    ratios: multiplePartByFactor(multi.ratios),
  }
}
function nthPartFactorBy(multi: PartToPartRatio, factor: Container, nthPart: NthPartFactor): Question {
  if (!areNumbers(multi.ratios) || !isNumber(factor.quantity)) {
    throw "ratios are not supported by non quantity types"
  }
  const result = nthPartFactorByEx(multi, factor.quantity, nthPart)

  return {
    question: `Vyjádři poměrem ${nthPart.agent} ${formatNumber(factor.quantity)} ${formatEntity(factor)}`,
    result,
    options: []

  }
}

function matchAgent(d: AgentMatcher, a: Container) {
  return d === a.agent;
}

function partEqualEx(a: Comparison, b: Container) {
  if (!isNumber(a.quantity)) {
    throw "partEqual are not supported by non quantity types"
  }
  const diff = compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, abs(a.quantity), a.entity);
  const rest = diffRuleEx(b, diff);
  if (!isNumber(rest.quantity)) {
    throw "partEqual are not supported by non quantity types"
  }
  return {
    ...rest,
    quantity: rest.quantity / 2
  }
}
function partEqual(a: Comparison, b: Container): Question {
  if (!isNumber(a.quantity)) {
    throw "partEqual are not supported by non quantity types"
  }
  const diff = compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, abs(a.quantity), a.entity);
  const result = partEqualEx(a, b)
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(b.quantity) && isNumber(a.quantity) && isNumber(diff.quantity) ? [
      { tex: `(${formatNumber(b.quantity)} - ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity - diff.quantity) / 2), ok: b.agent === diff.agentMinuend },
      { tex: `(${formatNumber(b.quantity)} + ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity + diff.quantity) / 2), ok: b.agent !== diff.agentMinuend }
    ] : []
  }

}

function nthTermRuleEx(a: Container, b: Sequence): Container {
  if (!isNumber(a.quantity)) {
    throw "nthTermRule are not supported by non quantity types"
  }
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
function nthTermRule(a: Container, b: Sequence): Question {
  const result = nthTermRuleEx(a, b)
  return {
    question: `Vypočti ${result.agent} na pozici ${a.quantity}?`,
    result,
    options: isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: formatSequence(b.type, a.quantity), result: formatNumber(result.quantity), ok: true },
    ] : []
  }
}


function nthPositionRuleEx(a: Container, b: Sequence, newEntity: string = 'nth'): Container {
  if (!isNumber(a.quantity)) {
    throw "nthTermRule are not supported by non quantity types"
  }
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
function nthPositionRule(a: Container, b: Sequence, newEntity: string = 'nth'): Question {
  const result = nthPositionRuleEx(a, b, newEntity)
  return {
    question: `Vypočti pozici ${result.agent} = ${formatEntity(a)}?`,
    result,
    options: isNumber(result.quantity) ? [
      { tex: 'Dle vzorce', result: formatNumber(result.quantity), ok: true },
    ] : []
  }
}
function isQuestion(value: Question | Predicate): value is Question {
  return (value as any)?.result != null
}
function isQuantityPredicate(value: { ratio: Ratio } | { quantity: Quantity }): value is { quantity: Quantity } {
  return (value as any).quantity != null;
}
function isRatioPredicate(value: { ratio: Ratio } | { quantity: Quantity }): value is { ratio: Ratio } {
  return (value as any).ratio != null;
}
function isRatePredicate(value: Predicate): value is Rate {
  return value.kind === "rate";
}
function isEntityBase(value: EntityDef): value is EntityBase {
  return (value as any).entity != null;
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

  if (last?.kind === "sum" || last?.kind === "product" || last?.kind === "lcd" || last?.kind === "gcd" || (last?.kind === "sequence" || (last?.kind === "ratios") && args.length > 3)) {
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
              : last.kind === "ratios"
                ? toRatios(arr, last)
                : null
  }
  else if (a.kind === "eval-option" || b.kind === "eval-option") {
    return a.kind === "eval-option" ? evalToOption(b, a) : b.kind === "eval-option" ? evalToOption(a, b) : null
  }
  else if (a.kind === "cont" && b.kind == "cont") {
    const kind = last?.kind;
    return kind === "comp-diff"
      ? toComparisonDiff(a, b)
      : kind === "diff"
        ? toDifference(a, b, last)
        : kind === "quota"
          ? toQuota(a, b)
          : kind === "delta"
            ? toDelta(a, b, last)
            : kind === "pythagoras"
              ? pythagorasRule(a, b, last)
              : kind === "rate"
                ? toRate(a, b)
                : kind === "ratios"
                  ? toRatios([a, b], last)
                  : kind === "comp-ratio"
                    ? toRatioComparison(a, b, last)
                    : kind === "ratio"
                      ? toPartWholeRatio(a, b, last)
                      : kind === "linear-equation"
                        ? solveEquation(a, b, last)
                        : toComparison(a, b)
  }
  else if (a.kind === "cont" && b.kind === "eval-expr") {
    return evalToQuantity(a, b)
  }
  else if (a.kind === "eval-expr" && b.kind === "cont") {
    return evalToQuantity(b, a)
  }
  else if (a.kind === "rate" && b.kind === "rate" && last.kind === "ratios") {
    return toRatios([a, b], last)
  }
  else if (a.kind === "rate" && b.kind === "rate" && last.kind === "linear-equation") {
    return solveEquation(a, b, last)
  }
  else if ((a.kind === "cont" || a.kind === "comp") && b.kind === "unit") {
    return convertToUnit(a, b);
  }
  else if (a.kind === "unit" && (b.kind === "cont" || b.kind === "comp")) {
    return convertToUnit(b, a);
  }
  else if ((a.kind === "cont") && b.kind === "round") {
    return roundTo(a, b);
  }
  else if (a.kind === "round" && (b.kind === "cont")) {
    return roundTo(b, a);
  }
  else if (a.kind === "cont" && b.kind === "comp-angle") {
    return compareAngleRule(a, b);
  }
  else if (a.kind === "comp-angle" && b.kind === "cont") {
    return compareAngleRule(b, a);
  }
  else if (a.kind === "ratio" && b.kind === "ratio" && a.ratio == null) {
    return toRatio(b, a.asPercent)
  }
  else if (a.kind === "ratio" && b.kind === "ratio" && b.ratio == null) {
    return toRatio(a, b.asPercent)
  }
  else if (a.kind === "ratio" && b.kind === "ratio") {
    const kind = last?.kind;
    return kind === 'diff' ? toDifferenceAsRatio(a, b, last) :
      kind === "comp-ratio" ? toComparisonRatio(a, b) : toComparisonAsRatio(a, b);
  }
  else if (a.kind === "comp" && b.kind === "cont") {
    const kind = last?.kind;
    return kind === "comp-part-eq" ? partEqual(a, b) : compareRule(b, a);
  }
  else if (a.kind === "cont" && b.kind === "comp") {
    const kind = last?.kind;
    return kind === "comp-part-eq" ? partEqual(b, a) : compareRule(a, b);
  }
  else if ((a.kind === "cont" || a.kind === "quota") && b.kind == "rate") {
    return rateRule(a, b)
  }
  else if (a.kind === "rate" && (b.kind == "cont" || b.kind === "quota")) {
    return rateRule(b, a)
  }
  else if (a.kind === "comp" && b.kind == "comp-ratio") {
    return compRatioToCompRule(b, a)
  }
  else if (a.kind === "comp-ratio" && b.kind == "comp") {
    return compRatioToCompRule(a, b)
  }
  else if (a.kind === "comp" && b.kind == "ratios") {
    return compRatiosToCompRule(b, a)
  }
  else if (a.kind === "ratios" && b.kind == "comp") {
    return compRatiosToCompRule(a, b)
  }
  else if (a.kind === "proportion" && b.kind == "ratios") {
    return proportionRatiosRule(b, a)
  }
  else if (a.kind === "ratios" && b.kind == "proportion") {
    return proportionRatiosRule(a, b)
  }
  else if (a.kind === "proportion" && b.kind == "comp-ratio") {
    return proportionRule(b, a)
  }
  else if (a.kind === "comp-ratio" && b.kind == "proportion") {
    return proportionRule(a, b)
  }
  else if (a.kind === "cont" && b.kind == "quota") {
    const kind = last?.kind;
    return kind === "rate" ? toRate(a, b) : quotaRule(a, b)
  }
  else if (a.kind === "quota" && b.kind == "cont") {
    const kind = last?.kind;
    return kind === "rate" ? toRate(b, a) : quotaRule(b, a)
  }
  else if (a.kind === "comp-ratio" && b.kind === "cont") {
    return ratioCompareRule(b, a);
  }
  else if (a.kind === "cont" && b.kind === "comp-ratio") {
    return ratioCompareRule(a, b);
  }
  else if (a.kind === "comp-ratio" && b.kind === "ratio") {
    return comparisonRatioRule(a, b);
  }
  else if (a.kind === "ratio" && b.kind === "comp-ratio") {
    return comparisonRatioRule(b, a);
  }
  else if (a.kind === "comp-ratio" && b.kind === "ratios") {
    return a.ratio == null ? convertToCompRatio(b, a) : convertToPartToPartRatios(a, b);
  }
  else if (a.kind === "ratios" && b.kind === "comp-ratio") {
    return b.ratio == null ? convertToCompRatio(a, b) : convertToPartToPartRatios(b, a);
  }
  else if (a.kind === "comp-ratio" && b.kind === "comp-ratio" && b.ratio == null) {
    return reverseCompRatio(a, b.asPercent);
  }
  else if (a.kind === "comp-ratio" && b.kind === "comp-ratio" && a.ratio == null) {
    return reverseCompRatio(b, a.asPercent);
  }
  else if (a.kind === "comp-ratio" && b.kind === "comp-ratio") {
    return comparisonRatioTransitiveRule(a, b)
  }
  else if (a.kind === "cont" && b.kind === "ratio") {
    return partToWholeRule(a, b);
  }
  else if (a.kind === "ratio" && b.kind === "cont") {
    return partToWholeRule(b, a);
  }
  else if (a.kind === "complement" && b.kind === "ratio") {
    return ratioComplementRule(a, b);
  }
  else if (a.kind === "ratio" && b.kind === "complement") {
    return ratioComplementRule(b, a);
  }
  // else if (a.kind === "complement" && b.kind === "ratio") {
  //   return ratioConvertRule(a, b);
  // }
  // else if (a.kind === "ratio" && b.kind === "complement") {
  //   return ratioConvertRule(b, a);
  // }
  else if (a.kind === "nth-part" && b.kind === "ratios") {
    const kind = last?.kind;
    return kind === "ratio" ? ratiosConvertRule(a, b, last) : null;
  }
  else if (a.kind === "ratios" && b.kind === "nth-part") {
    const kind = last?.kind;
    return kind === "ratio" ? ratiosConvertRule(b, a, last) : null;
  }
  else if (a.kind === "cont" && b.kind == "ratios") {
    const kind = last?.kind;

    return kind === "scale"
      ? mapRatiosByFactor(b, a)
      : kind === "invert-scale"
        ? mapRatiosByFactor(b, a, true)
        : kind === "nth-factor"
          ? nthPartFactorBy(b, a, last)
          : kind === "nth-part"
            ? partToPartRule(a, b, last) : partToPartRule(a, b);
  }
  else if (a.kind === "ratios" && b.kind == "cont") {
    const kind = last?.kind;
    return kind === "scale"
      ? mapRatiosByFactor(a, b)
      : kind === "invert-scale"
        ? mapRatiosByFactor(a, b, true)
        : kind === "nth-factor"
          ? nthPartFactorBy(a, b, last)
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
    return transferRule(a, b, "after")
  }
  else if (a.kind === "transfer" && b.kind === "cont") {
    return transferRule(b, a, "before")
  }
  else if (a.kind === "cont" && b.kind === "delta") {
    return deltaRule(a, b, "after")
  }
  else if (a.kind === "delta" && b.kind === "cont") {
    return deltaRule(b, a, "before")
  }
  else if (a.kind === "comp" && b.kind === "delta") {
    return convertCompareToDeltaEx(a, b)
  }
  else if (a.kind === "delta" && b.kind === "comp") {
    return convertDeltaToCompareEx(a, b)
  }
  else if (a.kind === "comp" && b.kind === "delta") {
    return convertCompareToDeltaEx(a, b)
  }

  else if (a.kind === "comp" && b.kind === "comp") {
    return compareToCompareRule(b, a)
  }
  else {
    return null;
  }
}



export function gcdCalc(numbers: number[]) {
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
  return abs(a * b) / gcdCalc([a, b]);
}
export function lcdCalc(numbers: number[]) {
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
  return d.toLocaleString("cs-CZ", { maximumFractionDigits: 6, minimumFractionDigits: 0 })
}

function formatRatio(d: number, asPercent?: boolean) {
  if (asPercent) return `${formatNumber(d * 100)} %`;
  return (d > -2 && d < 2) ? helpers.convertToFraction(d) as string : formatNumber(d)
}

function containerQuestion(d: Container) {
  return `${computeQuestion(d.quantity)} ${d.agent}${formatEntity(d)}?`
}

function computeQuestion(d: NumberOrExpression) {
  return isNumber(d) ? 'Vypočti' : 'Vyjádři výrazem s proměnnou'
}

function toGenerAgent(a: Container): Container {
  return {
    kind: 'cont',
    agent: a.entity,
    quantity: a.quantity,
    entity: ""
  }
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
  return (d.entity || d.unit) ? `(${[d.unit, d.entity].filter(d => d != null && d != "").join(" ")})` : ''
}
export type AngleRelationship = "complementary" | "supplementary" | "opposite" | "corresponding" | "sameSide" | "alternate" | "alternate-interior" | "alternate-exterior"
function computeOtherAngle(angle1, relationship: AngleRelationship) {
  switch (relationship) {
    case "complementary":
      return 90 - angle1; // Sum must be 90°
    case "supplementary":
    case "sameSide":
      return 180 - angle1; // Sum must be 180°
    case "opposite":
    case "corresponding":
    case "alternate":
    case "alternate-interior":
    case "alternate-exterior":
      return angle1; // Equal angles
    default:
      throw "Unknown Angle Relationship";
  }
}

export function formatAngle(relationship: AngleRelationship) {
  switch (relationship) {
    case "complementary":
      return "doplňkový"
    case "supplementary":
      return "vedlejší"
    case "sameSide":
      return "přilehlý"
    case "opposite":
      return "vrcholový";
    case "corresponding":
      return "souhlasný";
    case "alternate":
      return "střídavý";
    case "alternate-interior":
      return "střídavý vnitřní";
    case "alternate-exterior":
      return "střídavý vnější";
    default:
      throw "Neznámý vztah";

  }
}

export function formatSequence(type, n: number) {
  const simplify = (d, op = '') => d !== 1 ? `${d}${op}` : ''

  if (type.kind === "arithmetic")
    return `${type.sequence[0]} + ${type.commonDifference}(${formatNumber(n)}-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements(first, second, type.secondDifference);
    let parts = [`${simplify(A, "*")}${formatNumber(n)}^2^`];
    if (B !== 0) {
      parts = parts.concat(`${simplify(B, "*")}${formatNumber(n)}`)
    }
    if (C !== 0) {
      parts = parts.concat(`${simplify(C, "*")}${formatNumber(n)}`)
    }
    return `${parts.map((d, i) => `${i !== 0 ? ' + ' : ''}${d}`).join(' ')}`;
  }
  if (type.kind === "geometric") {
    return `${simplify(type.sequence[0], '*')}${type.commonRatio}^(${formatNumber(n)}-1)^`;
  }
}

function sequenceOptions(seqType: SequenceAnalysis) {
  return [
    { tex: 'stejný rozdíl', result: `${seqType.kind === 'arithmetic' ? formatNumber(seqType.commonDifference) : "chybně"}`, ok: seqType.kind === 'arithmetic' },
    { tex: 'stejný druhý rozdíl', result: `${seqType.kind === 'quadratic' ? formatNumber(seqType.secondDifference) : "chybně"}`, ok: seqType.kind === 'quadratic' },
    { tex: 'stejný poměr', result: `${seqType.kind === 'geometric' ? formatNumber(seqType.commonRatio) : "chybně"}`, ok: seqType.kind === 'geometric' },
  ]
}
export function formatSequencePattern(seqType: SequenceAnalysis) {
  const d = sequenceOptions(seqType).find(d => d.ok === true);
  return d != null ? `${d.tex} = ${d.result}` : 'N/A'
}

const unique = (value, index, array) => array.indexOf(value) === index;
function abs(v: number) {
  return Math.abs(v);
}

function resultAsQuestion(result: Predicate): Question {
  return {
    question: '',
    result,
    options: []
  }
}


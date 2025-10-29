export type UnitType = string
export type Helpers = {
  convertToFraction?: (quantity: number) => string | number,
  convertToUnit?: (quantity: number, from: UnitType, to: UnitType) => number
  unitAnchor?: (unit: UnitType) => number;
  solveLinearEquation?: (first: Quantity, second: Quantity, variable: string) => number
  evalExpression?: (expression: Expression | ExpressionNode, quantityOrContext: number | Record<string, number>) => number
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

type EntityBase = { entity: string, unit?: Unit }
type AgentMatcher = string

type AgentNames = {
  name: string
  nameAfter?: string
  nameBefore?: string
}
// #region Dimension entities
type EmptyUnitDim = ""
type LengthDim = "mm" | "cm" | "dm" | "m" | "km" | "mi" | EmptyUnitDim
type AreaDim = "mm2" | "cm2" | "dm2" | "m2" | "km2" | "mi2" | EmptyUnitDim
type VolumeDim = "mm3" | "cm3" | "dm3" | "m3" | "km3" | "mi3" | EmptyUnitDim
export const EmptyUnit: EmptyUnitDim = ""
export function dimensionEntity(unit: LengthDim = "cm") {
  return {
    length: { entity: "délka", unit },
    area: { entity: "obsah", unit: unit === EmptyUnit ? EmptyUnit : `${unit}2` },
    volume: { entity: "objem", unit: unit === EmptyUnit ? EmptyUnit : `${unit}3` },
    lengths: ["délka", unit] as [string, string],
    areas: ["obsah", unit === EmptyUnit ? EmptyUnit : `${unit}2`] as [string, string],
    volumes: ["objem", unit === EmptyUnit ? EmptyUnit : `${unit}3`] as [string, string]
  }
}
const dim = dimensionEntity();
// #endregion


// #endregion

// #region Predicates type guards
export function isQuantityPredicate(value: Predicate): value is QuantityPredicate {
  return ["cont", "comp", "transfer", "rate", "comp-diff", "transfer", "quota", "delta", "frequency"].includes(value.kind);
}

export function isRatioPredicate(value: Predicate): value is RatioPredicate {
  return ["ratio", "comp-ratio"].includes(value.kind);
}

export function isRatiosPredicate(value: Predicate): value is RatiosPredicate {
  return ["ratios"].includes(value.kind);
}

export function isOperationPredicate(value: Predicate): value is OperationPredicate {
  return ["sum", "sum-combine", "product", "product-combine", "gcd", "lcd"].includes(value.kind)
    || ["scale", "scale-invert", "slide", "slide-invert", "diff", "complement", "unit", "round"].includes(value.kind);
}

function isRatePredicate(value: Predicate): value is Rate {
  return value.kind === "rate";
}
function isFrequencyPredicate(value: Predicate): value is Frequency {
  return value.kind === "frequency";
}
// #endregion


// #region Predicates


export type Container = EntityBase &
{
  kind: 'cont',
  agent: string,
  quantity: Quantity
  asRatio?: boolean
}

export type EvalExpr<T extends Omit<Predicate, 'quantity'>> = {
  kind: 'eval-expr',
  expression: Expression
  predicate: T
}
export type EvalFormula<T extends Omit<Predicate, 'quantity'>> = {
  kind: 'eval-formula',
  expression: Expression
  formulaName: string,
  predicate: T
}
export type SimplifyExpr = {
  kind: 'simplify-expr',
  context: Record<string, number>
}
export type Option = {
  kind: 'eval-option'
  expression: Expression,
  expressionNice: string

  value?: true | false | "A" | "B" | "C" | "D" | "E" | "F"

  expectedValue?: number
  compareTo?: ComparisonType
  expectedValueOptions?: FormattingOptions
  optionValue?: "A" | "B" | "C" | "D" | "E" | "F"
}

export type ConvertUnit = {
  kind: 'unit',
  unit: Unit
}
export type ConvertPercent = {
  kind: 'convert-percent'
}
export type InvertCompRatio = {
  kind: 'invert-comp-ratio'
}
export type Reverse = {
  kind: 'reverse'
}
export type RatiosBase = {
  kind: 'ratios-base'
}

export type RatiosInvert = {
  kind: 'ratios-invert',
  agent: AgentMatcher,
}

export type ComplementCompRatio = {
  kind: 'complement-comp-ratio'
  agent: AgentMatcher
}

export type Round = {
  kind: 'round',
  order: number
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
  asRatio?: boolean
}
export type Frequency = {
  kind: 'frequency'
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

export type Sum = {
  kind: 'sum',
  wholeAgent: string
} & AsImplicitOneToOneRateEntity & SumExtraInfo


export type Product = {
  kind: 'product'
  wholeAgent: string
  partAgents?: string[]
} & AsImplicitOneToOneRateEntity

export type SumExtraInfo = {
  partAgents?: string[]
}
export type AsImplicitOneToOneRateEntity = {
  wholeEntity?: EntityBase
}


export type SumCombine = Combine & {
  kind: 'sum-combine'
}

export type ProductCombine = Combine & {
  kind: 'product-combine'
}
type Combine = {
  wholeAgent: string
  wholeEntity: EntityBase
  partAgents?: string[]
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
export type Pattern = EntityBase & {
  kind: 'pattern'
  nthTerm: Expression
  nthTermFormat?: (n: number) => string
  nthPosition: Expression
  nthTermDescription?: string
}

export type PartToPartRatio = {
  kind: 'ratios'
  parts: AgentMatcher[]
  whole: AgentMatcher,
  ratios: Ratio[],
  useBase?: boolean,
}
export type BalancedPartition = {
  kind: 'balanced-partition'
  parts: AgentMatcher[]
  entity?: EntityBase
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
export type Alligation = {
  kind: 'alligation'
  agent: AgentMatcher,
}
export type TriangleAngle = {
  kind: 'triangle-angle'
  agent: AgentMatcher
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
  agent?: string
}

export type InvertScale = {
  kind: "scale-invert"
  agent?: string
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
export type NthPartScale = {
  kind: 'nth-scale'
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
export type Slide = {
  kind: 'slide',
  agent: AgentMatcher
}
export type InvertSlide = {
  kind: 'slide-invert',
  agent: AgentMatcher
}

export type LinearEquation = {
  kind: 'linear-equation',
  agent: string,
  variable: string,
  entity: EntityBase
}

export type Question<T extends Predicate> = {
  name: string
  inputParameters: PredicateKind[],
  question: string,
  result: T
  options: {
    tex: string
    result: string,
    ok: boolean
  }[]
}
export type Tuple = {
  kind: 'tuple',
  agent: string,
  items: Predicate[]
}

export type ContainerEval = Omit<Container, 'quantity'>
export type RateEval = Omit<Rate, 'quantity'>

export type FormattingOptions = {
  asPercent?: boolean
  asFraction?: boolean
  asRelative?: boolean
  expectedValueLabel?: string
}

export type EntityDef = string | EntityBase

export type QuantityPredicate = Container | Comparison | Transfer | Rate | ComparisonDiff | Transfer | Quota | Frequency | Delta
export type RatioPredicate = RatioComparison | PartWholeRatio
export type RatiosPredicate = PartToPartRatio | TwoPartRatio | ThreePartRatio;
export type ExpressionPredicate = EvalExpr<ContainerEval | RateEval> | EvalFormula<ContainerEval | RateEval> | SimplifyExpr | LinearEquation | Phytagoras;
export type CommonSensePredicate = CommonSense | Proportion
export type MultipleOperationPredicate = Sum | SumCombine | Product | ProductCombine | GCD | LCD
export type SingleOperationPredicate = Scale | InvertScale | Slide | InvertSlide | Difference | Complement | ConvertUnit | Round | ConvertPercent | InvertCompRatio | Reverse | ComplementCompRatio | RatiosInvert | RatiosBase
export type OperationPredicate = SingleOperationPredicate | MultipleOperationPredicate

export type Predicate = QuantityPredicate | RatioPredicate | RatiosPredicate | ExpressionPredicate | MultipleOperationPredicate | CommonSensePredicate | OperationPredicate
  | Sequence | Pattern | BalancedPartition | Alligation | NthRule | NthPart | NthPartFactor | NthPartScale | AngleComparison | TriangleAngle | Tuple | Option | CompareAndPartEqual

export type PredicateKind = Pick<Predicate, 'kind'>
// #endregion

// #region Predicate constructors
export function ctor(kind: 'ratio' | 'comp-ratio' | 'comp' | 'rate' | 'quota' | "comp-diff"
  | 'comp-part-eq' | 'sequence' | 'nth' | 'ratios' | 'scale' | 'scale-invert' | 'slide' | 'slide-invert'
  | 'complement' | 'delta' | 'tuple' | 'simplify-expr' | 'convert-percent' | 'invert-comp-ratio' | 'reverse' | 'ratios-base') {
  return { kind } as Predicate
}

export function ctorUnit(unit: Unit): ConvertUnit {
  return { kind: "unit", unit }
}
export function sum(wholeAgent: string, wholeEntity?: EntityBase): Sum {
  return { kind: "sum", wholeAgent, wholeEntity: wholeEntity }
}

export function ctorRate(agent: AgentMatcher, baseQuantity: number = 1) {
  return { kind: 'rate', agent, baseQuantity } as Predicate
}

export function counter(agent, quantity: number, { asRatio }: { asRatio?: boolean } = {}): Container {
  return { kind: "cont", agent, quantity, entity: '', asRatio }
}
export function double() {
  return counter("dvojnásobek", 2)
}
export function doubleProduct(agent: string) {
  return [double(), product(agent)]
}

export function half() {
  return counter("polovina", 1 / 2, { asRatio: true })
}
export function halfProduct(agent: string) {
  return [half(), product(agent)]
}

export function product(wholeAgent: string, partAgents?: string[], asEntity?: EntityDef): Product {
  return {
    kind: "product",
    wholeAgent,
    ...(asEntity != null && { wholeEntity: toEntity(asEntity) }),
    partAgents: partAgents ?? []
  }
}
export function ctorRatiosInvert(agent: AgentMatcher): RatiosInvert {
  return { kind: 'ratios-invert', agent }
}

export function ctorScale(agent: AgentMatcher): Scale {
  return { kind: 'scale', agent }
}
export function ctorScaleInvert(agent: AgentMatcher): InvertScale {
  return { kind: 'scale-invert', agent }
}
export function ctorRound(order: number = 1): Round {
  return { kind: "round", order }
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

export function ctorComparePercent(): RatioComparison {
  return { kind: "comp-ratio", asPercent: true } as any
}
export function ctorComplementCompRatio(agent: AgentMatcher): ComplementCompRatio {
  return { kind: "complement-comp-ratio", agent }
}
export function ctorRatios(agent: AgentMatcher, { useBase }: { useBase?: boolean } = {}): PartToPartRatio {
  return { kind: "ratios", whole: agent, useBase } as PartToPartRatio
}
export function ctorRatio(agent: AgentMatcher): PartWholeRatio {
  return { kind: "ratio", whole: agent } as PartWholeRatio
}
export function ctorComplement(part: AgentMatcher): Complement {
  return { kind: "complement", part }
}
export function ctorDifference(differenceAgent: AgentMatcher): Difference {
  return { kind: "diff", differenceAgent }
}
export function ctorSlide(agent: AgentMatcher): Slide {
  return { kind: "slide", agent }
}
export function ctorSlideInvert(agent: AgentMatcher): InvertSlide {
  return { kind: "slide-invert", agent }
}
export function ctorTuple(agent: AgentMatcher): Tuple {
  return { kind: "tuple", agent, items: [] }
}

export function cont(agent: string, quantity: NumberOrVariable, entity: string, unit?: string, opts?: { asFraction: boolean }): Container {
  return { kind: 'cont', agent, quantity: quantity as NumberOrExpression, entity, unit, asRatio: opts?.asFraction };
}
export function tuple(agent: string, items: Predicate[]): Tuple {
  return { kind: 'tuple', agent, items }
}
export function evalExprAsCont(expression: string, agent: AgentMatcher, entity: EntityBase, opts: { asRatio?: boolean } = {}): EvalExpr<ContainerEval> {
  return { kind: 'eval-expr', expression, predicate: { kind: 'cont', agent, ...entity, asRatio: opts.asRatio } }
}
export function evalExprAsRate(expression: string, predicate: RateEval): EvalExpr<RateEval> {
  return { kind: 'eval-expr', expression, predicate }
}
export function evalFormulaAsCont<F>(f: Formula<F>, expression: (context: F) => Expression, agent: AgentMatcher, entity: EntityBase, opts: { asRatio?: boolean } = {}): EvalFormula<ContainerEval> {
  return { kind: 'eval-formula', expression: expression(f.formula), formulaName: f.name, predicate: { kind: 'cont', agent, ...entity, asRatio: opts.asRatio } }
}
export function evalFormulaAsRate<F>(f: Formula<F>, expression: (context: F) => Expression, predicate: RateEval): EvalFormula<RateEval> {
  return { kind: 'eval-formula', expression: expression(f.formula), formulaName: f.name, predicate }
}

export function simplifyExpr(context: Record<string, number>): SimplifyExpr {
  return { kind: 'simplify-expr', context }
}

export function ctorOption(optionValue: "A" | "B" | "C" | "D" | "E" | "F", expectedValue: number, expectedValueOptions: FormattingOptions = { asPercent: false, asFraction: false }): Option {
  return {
    kind: 'eval-option',
    expression: convertToExpression(expectedValue, "closeTo", expectedValueOptions),
    expressionNice: convertToNiceExpression(expectedValue, "equal", { ...expectedValueOptions, asPercent: false }),
    expectedValue, expectedValueOptions, optionValue, compareTo: "closeTo"
  }
}
export function option(optionValue: "A" | "B" | "C" | "D" | "E" | "F"): Option {
  return {
    kind: 'eval-option',
    expression: '',
    expressionNice: '',
    value: optionValue
  }
}
export function ctorExpressionOption(optionValue: "A" | "B" | "C" | "D" | "E" | "F", expression: string): Option {
  return { kind: 'eval-option', expression, expressionNice: expression, optionValue }
}

export type ComparisonType = "equal" | "greater" | "greaterOrEqual" | "smaller" | "smallerOrEqual" | "closeTo";

export function ctorHasNoRemainder() {
  return ctorBooleanOption(0, "closeTo", { expectedValueLabel: 'zbytek' })
}
export function ctorBooleanOption(expectedValue: number, compareTo: ComparisonType = 'closeTo', expectedValueOptions: FormattingOptions = { asPercent: false, asFraction: false }): Option {
  return {
    kind: 'eval-option',
    expression: convertToExpression(expectedValue, compareTo, expectedValueOptions),
    expressionNice: convertToNiceExpression(expectedValue, compareTo == "closeTo" ? "equal" : compareTo, { ...expectedValueOptions, asPercent: false }),
    expectedValue, expectedValueOptions, compareTo
  }
}
function convertToNiceExpression(expectedValue: number, compareTo: ComparisonType, expectedValueOptions: FormattingOptions) {
  return convertToExpression(expectedValue, compareTo, expectedValueOptions, expectedValueOptions.expectedValueLabel ?? 'zjištěná hodnota');
}
function convertToExpression(expectedValue: number, compareTo: ComparisonType, expectedValueOptions: FormattingOptions, variable = "x") {
  const convertedValue = expectedValueOptions.asFraction
    ? helpers.convertToFraction(expectedValue)
    : expectedValueOptions.asPercent
      ? expectedValue / 100
      : expectedValue;
  const toCompare = (comp) => `${variable} ${comp} ${convertedValue}`
  switch (compareTo) {
    case "equal": return toCompare("==")
    case "greater": return toCompare(">");
    case "greaterOrEqual": return toCompare("=>");
    case "smaller": return toCompare("<");
    case "smallerOrEqual": return toCompare("=<");
    default:
      return `closeTo(${variable}, ${convertedValue})`;
  }
}
export function delta(agent: AgentNames, quantity: number, entity: string, unit?: string): Delta {
  return { kind: 'delta', agent, quantity, entity, unit };
}
export function pi(): Container {
  return { kind: 'cont', agent: "π", quantity: 3.14, entity: '' }
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
export function alligation(agent: AgentMatcher): Alligation {
  return { kind: 'alligation', agent }
}
export function triangleAngle(agent: AgentMatcher): TriangleAngle {
  return { kind: 'triangle-angle', agent }
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
export function sumCombine(wholeAgent: string, wholeEntity: EntityDef, partAgents?: string[]): SumCombine {
  return {
    kind: 'sum-combine',
    wholeAgent,
    partAgents: partAgents ?? [],
    wholeEntity: toEntity(wholeEntity)
  }
}



export function pattern({ nthTerm, nthPosition, nthTermFormat, nthTermDescription }:
  { nthTerm: Expression, nthPosition: Expression, nthTermFormat?: (n: number) => string, nthTermDescription?: string }, { entity, unit }:
    EntityBase): Pattern {
  return {
    kind: 'pattern',
    entity,
    unit,
    nthTerm,
    nthTermDescription,
    nthTermFormat,
    nthPosition,
  }
}
export function squareNumbersPattern(entity: EntityBase) {
  return pattern({
    nthPosition: 'sqrt(x)',
    nthTerm: 'n*n'
  }, entity)
}


export function triangularNumbersPattern(entity: EntityBase) {
  return pattern({
    nthPosition: '(-1+sqrt(1 + 8*x))/2',
    nthTerm: 'n*(n+1)/2',
    nthTermFormat: (n) => range(n, 1).map((d) => d).join(" + ")
  }, entity)
}
export function oblongNumbers(entity: EntityBase, diff: 1 | -1 = 1) {
  return pattern({
    nthPosition: diff === 1 ? '(-1+sqrt(1 + 4*x))/2' : '(1+sqrt(1 + 4*x))/2',
    nthTerm: diff === 1 ? 'n*(n+1)' : 'n*(n-1)',
    nthTermFormat: (n) => range(n, 1).map((d) => d + (d + diff) - 1).join(" + ")
  }, entity)
}

export function balancedPartition(parts: AgentMatcher[]): BalancedPartition {
  return {
    kind: 'balanced-partition',
    parts
  }
}
export function balancedEntityPartition(parts: AgentMatcher[], entity: EntityBase): BalancedPartition {
  return {
    kind: 'balanced-partition',
    parts,
    entity
  }
}

export function contLength(agent: string, quantity: NumberOrVariable, unit: LengthDim = "cm") {
  return cont(agent, quantity, dimensionEntity().length.entity, unit)
}
export function contArea(agent: string, quantity: NumberOrVariable, unit: AreaDim = "cm2") {
  return cont(agent, quantity, dimensionEntity().area.entity, unit)
}
export function contVolume(agent: string, quantity: NumberOrVariable, unit: VolumeDim = "cm3") {
  return cont(agent, quantity, dimensionEntity().volume.entity, unit)
}
export function circleLength(wholeAgent: string, unit: LengthDim = "cm") {
  return evalFormulaAsCont(formulaRegistry.circumReference.circle, x => x.o, wholeAgent, { entity: dim.length.entity, unit });
}

export function squareArea(wholeAgent: string, unit: AreaDim = "cm2") {
  return evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.S, wholeAgent, { entity: dim.area.entity, unit });
}
export function rectangleArea(wholeAgent: string, unit: AreaDim = "cm2") {
  return evalFormulaAsCont(formulaRegistry.surfaceArea.rectangle, x => x.S, wholeAgent, { entity: dim.area.entity, unit });
}
export function triangleArea(wholeAgent: string, unit: AreaDim = "cm2") {
  return evalFormulaAsCont(formulaRegistry.surfaceArea.triangle, x => x.S, wholeAgent, { entity: dim.area.entity, unit });
}
export function circleArea(wholeAgent: string, unit: AreaDim = "cm2") {
  return evalFormulaAsCont(formulaRegistry.surfaceArea.circle, x => x.S, wholeAgent, { entity: dim.area.entity, unit });
}
export function cylinderArea(wholeAgent: string, unit: AreaDim = "cm2") {
  return evalFormulaAsCont(formulaRegistry.surfaceArea.cylinder, x => x.S, wholeAgent, { entity: dim.area.entity, unit });
}
export function cubeArea(wholeAgent: string, unit: AreaDim = "cm2") {
  return evalFormulaAsCont(formulaRegistry.surfaceArea.cube, x => x.S, wholeAgent, { entity: dim.area.entity, unit });
}

export function cubeVolume(wholeAgent: string, unit: VolumeDim = "cm3") {
  return evalFormulaAsCont(formulaRegistry.volume.cube, x => x.V, wholeAgent, { entity: dim.volume.entity, unit });
}
export function cuboidVolume(wholeAgent: string, unit: VolumeDim = "cm3") {
  return evalFormulaAsCont(formulaRegistry.volume.cuboid, x => x.V, wholeAgent, { entity: dim.volume.entity, unit });
}
export function cylinderVolume(wholeAgent: string, unit: VolumeDim = "cm3") {
  return evalFormulaAsCont(formulaRegistry.volume.cylinder, x => x.V, wholeAgent, { entity: dim.volume.entity, unit });
}
export function baseAreaVolume(wholeAgent: string, unit: VolumeDim = "cm3") {
  return evalFormulaAsCont(formulaRegistry.volume.baseArea, x => x.V, wholeAgent, { entity: dim.volume.entity, unit });
}
export function productCombine(wholeAgent: string, wholeEntity: EntityDef, partAgents?: string[]): ProductCombine {
  return {
    kind: 'product-combine',
    wholeAgent,
    partAgents: partAgents ?? [],
    wholeEntity: toEntity(wholeEntity)
  }
}
export function gcd(agent: string, entity: string, unit?: string): GCD {
  return { kind: 'gcd', agent, entity, unit }
}
export function lcd(agent: string, entity: string, unit?: string): LCD {
  return { kind: 'lcd', agent, entity, unit }
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
export function nthPartScale(agent): NthPartScale {
  return { kind: 'nth-scale', agent }
}

export function rate(agent: string, quantity: number, entity: EntityDef, entityBase: EntityDef, baseQuantity: number = 1): Rate {
  return { kind: 'rate', agent, quantity, baseQuantity, entity: toEntity(entity), entityBase: toEntity(entityBase) }
}
export function frequency(agent: string, quantity: number, entity: EntityDef, entityBase: EntityDef, baseQuantity): Frequency {
  return { kind: 'frequency', agent, quantity, baseQuantity, entity: toEntity(entity), entityBase: toEntity(entityBase) }
}

export function quota(agent: string, agentQuota, quantity: number, restQuantity = 0): Quota {
  return { kind: 'quota', agent, agentQuota, quantity, restQuantity }
}

export function proportion(inverse: boolean, entities: [string, string]): Proportion {
  return { kind: 'proportion', inverse, entities };
}

export function primeFactors(numbers: number[]): CommonSense {
  return { kind: 'common-sense', description: `rozklad na prvočísla:${primeFactorization(numbers).join(",")}` }

}
export function commonSense(description: string): CommonSense {
  return { kind: 'common-sense', description }
}

// #endregion

// #region Inference rules

function compareRule(a: Container, b: Comparison): Container {
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

function inferCompareRule(a: Container, b: Comparison): Question<Container> {
  const result = compareRule(a, b)

  return {
    name: compareRule.name,
    inputParameters: extractKinds(a, b),
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

function angleCompareRule(a: Container, b: AngleComparison): Container {
  //check
  return { kind: 'cont', agent: a.agent == b.agentB ? b.agentA : b.agentB, quantity: computeOtherAngle(a.quantity, b.relationship), entity: a.entity, unit: a.unit }
}
function inferAngleCompareRule(a: Container, b: AngleComparison): Question<Container> {
  const result = angleCompareRule(a, b)
  return {
    name: angleCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypočti ${a.agent == b.agentB ? b.agentA : b.agentB}? ${b.agentA} je ${formatAngle(b.relationship)} k ${b.agentB}.`,
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

function toPartWholeCompareRule(a: PartWholeRatio, b: PartWholeRatio): RatioComparison {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole} `
  }
  return {
    kind: 'comp-ratio', agentB: b.part, agentA: a.part,
    ratio: isNumber(a.ratio) && isNumber(b.ratio) ? a.ratio / b.ratio : wrapToRatio(`a.ratio / b.ratio`, { a, b })
  }
}
function inferToPartWholeCompareRule(a: PartWholeRatio, b: PartWholeRatio): Question<RatioComparison> {
  const result = toPartWholeCompareRule(a, b)
  return {
    name: toPartWholeCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${result.agentA} a ${result.agentB}. Kolikrát? `,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) ? [
      {
        tex: `${formatRatio(a.ratio)} / ${formatRatio(b.ratio)}`, result: formatRatio(a.ratio / b.ratio), ok: true
      },
      { tex: `${formatRatio(b.ratio)} / ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio / a.ratio), ok: false },
    ] : []
  }
}

function partWholeCompareRule(b: RatioComparison, a: PartWholeRatio): PartWholeRatio {
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
function inferPartWholeCompareRule(b: RatioComparison, a: PartWholeRatio): Question<PartWholeRatio> {
  const result = partWholeCompareRule(b, a)
  return {
    name: partWholeCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.ratio)} ${a.part == b.agentB ? b.agentA : b.agentB}?`,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) ? [
      { tex: `${formatRatio(a.ratio)} * ${formatRatio(abs(b.ratio))}`, result: formatRatio(a.ratio * b.ratio), ok: (a.part == b.agentB && b.ratio >= 0) || (a.part == b.agentA && b.ratio < 0) },
      { tex: `${formatRatio(a.ratio)} / ${formatRatio(abs(b.ratio))}`, result: formatRatio(a.ratio / b.ratio), ok: (a.part == b.agentA && b.ratio >= 0) || (a.part == b.agentB && b.ratio < 0) },
    ] : []
  }
}

function transitiveRatioCompareRule(a: RatioComparison, b: RatioComparison): RatioComparison {
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
function inferTransitiveRatioCompareRule(b: RatioComparison, a: RatioComparison): Question<RatioComparison> {
  const result = transitiveRatioCompareRule(b, a)
  return {
    name: transitiveRatioCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${result.agentA} a ${result.agentB}?`,
    result,
    options: [
    ]
  }
}

function convertRatioCompareToRatioRule(b: RatioComparison): PartWholeRatio {
  if (!isNumber(b.ratio)) {
    throw "convertRatioCompareToRatioRule does not non quantity"
  }
  const whole = b.ratio > 1 ? b.agentA : b.agentB

  return { kind: 'ratio', whole, part: whole == b.agentB ? b.agentA : b.agentB, ratio: whole == b.agentA ? abs(b.ratio) : abs(1 / b.ratio) }
}
function inferConvertRatioCompareToRatioRule(b: RatioComparison): Question<PartWholeRatio> {
  const result = convertRatioCompareToRatioRule(b);

  if (!isNumber(b.ratio) || !isNumber(result.ratio)) {
    throw "convertRatioCompareToRatioRule does not support expressions"
  }

  return {
    name: convertRatioCompareToRatioRule.name,
    inputParameters: extractKinds(b),
    question: `Vyjádři ${result.part} jako část z ${result.whole}?`,
    result,
    options: isNumber(result.ratio) ? [
      { tex: `${formatRatio(abs(b.ratio))}`, result: formatRatio(result.ratio), ok: result.whole == b.agentA },
      { tex: `1 / ${formatRatio(abs(b.ratio))}`, result: formatRatio(result.ratio), ok: result.whole == b.agentB },
    ] : []
  }
}

function convertRatioCompareToTwoPartRatioRule(b: RatioComparison, a: { whole: AgentMatcher }): TwoPartRatio {
  if (!isNumber(b.ratio)) {
    throw "convertToPartToPartRatios does not non quantity"
  }
  return { kind: 'ratios', whole: a.whole, parts: [b.agentA, b.agentB], ratios: [abs(b.ratio), 1] }
}
function inferConvertRatioCompareToTwoPartRatioRule(b: RatioComparison, a: { whole: AgentMatcher }, last?: RatiosBase): Question<TwoPartRatio> {
  const tempResult = convertRatioCompareToTwoPartRatioRule(b, a);
  if (!isNumber(b.ratio) || !areNumbers(tempResult.ratios)) {
    throw "convertToPartToPartRatios does not support expressions"
  }

  const result = {
    ...tempResult,
    ratios: last != null ? ratiosToBaseForm(tempResult.ratios) : tempResult.ratios
  }

  return {
    name: convertRatioCompareToTwoPartRatioRule.name,
    inputParameters: extractKinds(b),
    question: `Vyjádři poměrem částí ${[b.agentA, b.agentB].join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `(${formatRatio(abs(b.ratio))}) v poměru k 1`, result: result.ratios.map(d => formatRatio(d)).join(":"), ok: true },
      { tex: `(1 / ${formatRatio(abs(b.ratio))}) v poměru k 1`, result: result.ratios.map(d => formatRatio(d)).join(":"), ok: false },
    ] : []
  }
}

function convertRatioCompareToRatiosRule(arr: RatioComparison[], a: { whole: AgentMatcher }): PartToPartRatio {
  const numbers = arr.map(d => d.ratio);
  if (!areNumbers(numbers)) {
    throw "convertRatioCompareToRatiosRule does not non quantity"
  }
  return { kind: 'ratios', whole: a.whole, parts: arr.map(d => d.agentA).concat(arr[0].agentB), ratios: numbers.map(d => abs(d)).concat(1) }
}
function inferConvertRatioCompareToRatiosRule(arr: RatioComparison[], a: { whole: AgentMatcher }, last?: RatiosBase): Question<PartToPartRatio> {
  const numbers = arr.map(d => d.ratio);
  const tempResult = convertRatioCompareToRatiosRule(arr, a);
  if (!areNumbers(numbers) || !areNumbers(tempResult.ratios)) {
    throw "convertRatioCompareToRatiosRule does not support expressions"
  }

  const result = {
    ...tempResult,
    ratios: last != null ? ratiosToBaseForm(tempResult.ratios) : tempResult.ratios
  }

  return {
    name: convertRatioCompareToRatiosRule.name,
    inputParameters: [],
    question: `Vyjádři poměrem částí ${tempResult.parts.join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `(${numbers.map(d => formatRatio(abs(d)))}) v poměru k 1`, result: result.ratios.map(d => formatRatio(d)).join(":"), ok: true },
      { tex: `(1 / ${numbers.map(d => formatRatio(abs(d)))}) v poměru k 1`, result: result.ratios.map(d => formatRatio(d)).join(":"), ok: false },
    ] : []
  }
}

function convertToUnitRule(a: Container | Comparison, b: ConvertUnit): Container | Comparison {
  if (a.unit == null) {
    throw `Missing unit ${a.kind === "cont" ? a.agent : `${a.agentA} to ${a.agentB}`} a ${a.entity}`;
  }
  if (!isNumber(a.quantity)) {
    throw "convertToUnit does not support expressions"
  }
  return { ...a, quantity: helpers.convertToUnit(a.quantity, a.unit, b.unit), unit: b.unit }
}
function inferConvertToUnitRule(a: Container | Comparison, b: ConvertUnit): Question<Container | Comparison> {
  const result = convertToUnitRule(a, b)
  if (!isNumber(a.quantity) || !isNumber(result.quantity)) {
    throw "convertToUnit does not support expressions"
  }
  const destination = helpers.unitAnchor(a.unit);
  const origin = helpers.unitAnchor(b.unit);
  const convertFactor = destination >= origin ? destination / origin : origin / destination;
  return {
    name: convertToUnitRule.name,
    inputParameters: extractKinds(a, b),
    question: `Převeď ${formatNumber(a.quantity)} ${formatEntity(a)} na ${b.unit}.`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(convertFactor)}`, result: formatNumber(result.quantity), ok: destination >= origin },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(convertFactor)}`, result: formatNumber(result.quantity), ok: destination < origin },
    ]
  }
}

function roundToRule(a: Container, b: Round): Container {
  const order = b.order ?? 1;
  if (order <= 0) {
    throw new Error("Order must be positive");
  }

  return {
    ...a,
    quantity: isNumber(a.quantity)
      ? Math.round(a.quantity / order) * order
      : wrapToQuantity(`round ${a.quantity}`, { a, b }) //@TODO - fix usage of the b.order in expression
  };
}
function inferRoundToRule(a: Container, b: Round): Question<Container> {
  const result = roundToRule(a, b)
  return {
    name: roundToRule.name,
    inputParameters: extractKinds(a, b),
    question: isNumber(a.quantity) ? `Zaokrouhli ${formatNumber(a.quantity)} ${formatEntity(a)} na ${formatOrder(b.order)}.` : `Zaokrouhli na ${formatOrder(b.order)}.`,
    result,
    options: isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} `, result: formatNumber(result.quantity), ok: true },
    ] : []
  }
}

function computeQuantityByRatioBase<T extends Predicate & { quantity: NumberOrExpression }, K extends Predicate & { ratio: NumberOrExpression }>(a: T, b: K) {
  return isNumber(a.quantity) && isNumber(b.ratio)
    ? b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / abs(b.ratio)
    : isNumber(b.ratio)
      ? b.ratio >= 0 ? wrapToQuantity(`a.quantity * b.ratio`, { a, b }) : wrapToQuantity(`a.quantity / abs(b.ratio)`, { a, b })
      : wrapToQuantity(`b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / abs(b.ratio)`, { a, b })
}
function computeQuantityByRatioPart<T extends Predicate & { quantity: NumberOrExpression }, K extends Predicate & { ratio: NumberOrExpression }>(a: T, b: K) {
  return isNumber(a.quantity) && isNumber(b.ratio)
    ? b.ratio > 0 ? a.quantity / b.ratio : a.quantity * abs(b.ratio)
    : isNumber(b.ratio)
      ? b.ratio > 0 ? wrapToQuantity(`a.quantity / b.ratio`, { a, b }) : wrapToQuantity(`a.quantity * abs(b.ratio)`, { a, b })
      : wrapToQuantity(`b.ratio > 0 ? a.quantity / b.ratio : a.quantity * abs(b.ratio)`, { a, b })

}

function ratioCompareRule(a: Container | Rate, b: RatioComparison, nthPart: NthPart): Container | Rate {

  let result;
  if (a.agent == b.agentB || a.entity == b.agentB) {
    result = {
      agent: a.agent == b.agentB ? b.agentA : a.agent,
      entity: a.entity == b.agentB ? b.agentA : a.entity,
      quantity: computeQuantityByRatioBase(a, b)

    }
  }
  else if (a.agent == b.agentA || a.entity == b.agentA) {
    result = {
      agent: a.agent == b.agentA ? b.agentB : a.agent,
      entity: a.entity == b.agentA ? b.agentB : a.entity,
      quantity: computeQuantityByRatioPart(a, b)
    }
  }
  else if (b.agentA == nthPart?.agent) {
    result = {
      agent: b.agentA,
      quantity: isNumber(a.quantity) && isNumber(b.ratio)
        ? a.quantity / (abs(b.ratio) + 1) * abs(b.ratio)
        : wrapToQuantity(`a.quantity / (abs(b.ratio) + 1) * abs(b.ratio)`, { a, b }),

    }
  }
  else {

    //throw `Mismatch agent ${ a.agent } any of ${ b.agentA }, ${ b.agentB } `
    result = {
      agent: b.agentB,
      quantity: isNumber(a.quantity) && isNumber(b.ratio)
        ? a.quantity / (Math.abs(b.ratio) + 1)
        : wrapToQuantity(`a.quantity / (abs(b.ratio) + 1)`, { a, b }),

    }
  }

  return { ...a, ...result }
}
function inferRatioCompareRule(a: Container | Rate, b: RatioComparison, nthPart?: NthPart): Question<Container | Rate> {
  const result = ratioCompareRule(a, b, nthPart)
  return {
    name: ratioCompareRule.name,
    inputParameters: extractKinds(a, b, nthPart),
    question: `${computeQuestion(result.quantity)} ${result.agent} ${result.kind === "rate" ? formatEntity(result.entity) : formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.ratio) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(abs(b.ratio))} `, result: formatNumber(a.quantity * b.ratio), ok: ([a.agent, a.entity].includes(b.agentB) && b.ratio >= 0) || ([a.agent, a.entity].includes(b.agentA) && b.ratio < 0) },
      {
        tex: `${formatNumber(a.quantity)} / ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity / b.ratio), ok: ([a.agent, a.entity].includes(b.agentA) && b.ratio >= 0) || ([a.agent, a.entity].includes(b.agentB) && b.ratio < 0)
      },
      { tex: `${formatNumber(a.quantity)} / (${formatRatio(abs(b.ratio))} + 1)`, result: formatNumber(result.quantity), ok: ![a.agent, a.entity].includes(b.agentA) && ![a.agent, a.entity].includes(b.agentB) && b.agentA !== nthPart?.agent },
      { tex: `${formatNumber(a.quantity)} / (${formatRatio(abs(b.ratio))} + 1) * ${formatRatio(abs(b.ratio))}`, result: formatNumber(result.quantity), ok: b.agentA == nthPart?.agent },
    ] : []
  }
}

function transferRule(a: Container, b: Transfer, transferOrder: "after" | "before"): Container {
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
function inferTransferRule(a: Container, b: Transfer, transferOrder: "after" | "before"): Question<Container> {
  const result = transferRule(a, b, transferOrder)
  return {
    name: transferRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.quantity)} ${a.agent}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${transferOrder === "before" && a.agent == b.agentSender.name ? ' + ' : ' - '} ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentSender.name },
      { tex: `${formatNumber(a.quantity)} ${transferOrder !== "before" && a.agent == b.agentSender.name ? ' - ' : ' + '} ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentReceiver.name },
    ] : []
  }
}

function deltaRule(a: Container, b: Delta, transferOrder: "after" | "before"): Container {
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
function inferDeltaRule(a: Container, b: Delta, transferOrder: "after" | "before"): Question<Container> {
  const result = deltaRule(a, b, transferOrder)
  return {
    name: deltaRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.quantity)} ${result.agent}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${transferOrder === "before" ? ' - ' : ' + '} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(a.quantity)} ${transferOrder == "before" ? ' + ' : ' - '} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: false },
    ] : []
  }
}

function partWholeComplementRule(a: Complement, b: PartWholeRatio): PartWholeRatio {
  return {
    kind: 'ratio',
    whole: b.whole,
    ratio: isNumber(b.ratio) ? 1 - b.ratio : wrapToRatio(`1 - b.ratio`, { a, b }),
    part: a.part,
    asPercent: b.asPercent
  }
}
function inferPartWholeComplementRule(a: Complement, b: PartWholeRatio): Question<PartWholeRatio> {
  const result = partWholeComplementRule(a, b)
  return {
    name: partWholeComplementRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vyjádři ${b.asPercent ? "procentem" : "poměrem"} ${result.part} z ${result.whole}?`,
    result,
    options: isNumber(b.ratio) ? [
      { tex: `${formatRatio(1, b.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(1 - b.ratio, b.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false },
    ] : []
  }
}

function convertTwoPartRatioToRatioCompareRule(b: PartToPartRatio, { agent, asPercent }: { agent?: string, asPercent?: boolean }): RatioComparison {

  if (!areNumbers(b.ratios)) {
    throw "ratios does not support non quantity type"
  }
  const bRatios = b.ratios as number[]
  if (!(b.ratios.length === 2 && b.parts.length === 2)) {
    throw `Part to part ratio has to have exactly two parts.`
  }

  const agentBaseIndex = agent != null ? b.parts.indexOf(agent) : 1;
  if (agentBaseIndex === -1) {
    throw `Part not found ${agent}, expecting ${b.parts.join()}.`
  }
  const agentAIndex = agentBaseIndex === 0 ? 1 : 0
  return {
    kind: 'comp-ratio',
    agentA: b.parts[agentAIndex],
    agentB: b.parts[agentBaseIndex],
    ratio: bRatios[agentAIndex] / bRatios[agentBaseIndex],
    asPercent
  }
}
function inferConvertTwoPartRatioToRatioCompareRule(b: PartToPartRatio, { agent, asPercent }: { agent?: string, asPercent?: boolean }): Question<RatioComparison> {
  const result = convertTwoPartRatioToRatioCompareRule(b, { agent, asPercent })
  return {
    name: convertTwoPartRatioToRatioCompareRule.name,
    inputParameters: extractKinds(b),
    question: `Porovnej ${result.agentA} a ${result.agentB}?`,
    result,
    options: [
      // { tex: `${formatRatio(1, b.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(1 - b.ratio, b.asPercent), ok: true },
      // { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false },
    ]
  }
}

function convertPartWholeToRatioCompareRule(a: PartWholeRatio, agent: string): RatioComparison {
  return {
    kind: 'comp-ratio',
    agentA: a.part,
    agentB: agent,
    ratio: isNumber(a.ratio) ? a.ratio / (1 - a.ratio) : wrapToRatio(`a.ratio / (1 - a.ratio)`, { a }),
    asPercent: a.asPercent
  }
}
function inferConvertPartWholeToRatioCompareRule(a: PartWholeRatio, b: ComplementCompRatio): Question<RatioComparison> {
  const result = convertPartWholeToRatioCompareRule(a, b.agent)
  return {
    name: convertPartWholeToRatioCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${result.agentA} a ${result.agentB}?`,
    result,
    options: isNumber(a.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio, a.asPercent)} / (${formatRatio(1, a.asPercent)} - ${formatRatio(a.ratio, a.asPercent)})`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(1, a.asPercent)} - ${formatRatio(a.ratio, a.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: false },

    ] : []
  }
}

function togglePartWholeAsPercentRule(b: PartWholeRatio): PartWholeRatio {
  return {
    ...b,
    asPercent: !!!b.asPercent
  }
}
function inferTogglePartWholeAsPercentRule(b: PartWholeRatio): Question<PartWholeRatio> {
  const result = togglePartWholeAsPercentRule(b)

  return {
    name: togglePartWholeAsPercentRule.name,
    inputParameters: extractKinds(b),
    question: `Vyjádři ${(!b.asPercent) ? "procentem" : "poměrem"}?`,
    result,
    options: isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(b.ratio, b.asPercent)} * 100`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} / 100`, result: formatRatio(result.ratio, result.asPercent), ok: false },
    ] : []
  }
}

function invertRatioCompareRule(b: RatioComparison): RatioComparison {
  return {
    kind: 'comp-ratio',
    agentA: b.agentB,
    agentB: b.agentA,
    ratio: isNumber(b.ratio) ? 1 / b.ratio : wrapToRatio(`1 / b.ratio`, { b }),
    asPercent: b.asPercent
  }
}
function inferInvertRatioCompareRule(b: RatioComparison): Question<RatioComparison> {
  const result = invertRatioCompareRule(b)

  return {
    name: invertRatioCompareRule.name,
    inputParameters: extractKinds(b),
    question: `Obrať porovnání ${result.agentA} a ${result.agentB}?`,
    result,
    options: isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `1 / ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} / 100`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false },
    ] : []
  }
}

function convertPartToPartToPartWholeRule(a: NthPart, b: PartToPartRatio, asPercent: boolean): PartWholeRatio {
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
function inferConvertPartToPartToPartWholeRule(a: NthPart, b: PartToPartRatio, last: PartWholeRatio): Question<PartWholeRatio> {
  const result = convertPartToPartToPartWholeRule(a, b, last.asPercent)
  if (!areNumbers(b.ratios) || !isNumber(result.ratio)) {
    throw "ratios does not support non quantity type"
  }

  const index = b.parts.indexOf(a.agent);
  const value = b.ratios[index];

  return {
    name: convertPartToPartToPartWholeRule.name,
    inputParameters: extractKinds(a, b, last),
    question: `Vyjádři ${last.asPercent ? "procentem" : "poměrem"} ${result.part} z ${result.whole}?`,
    result,
    options: [
      { tex: `${formatNumber(value)} / (${b.ratios.map(d => formatNumber(d)).join(" + ")})`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatNumber(value)} * (${b.ratios.map(d => formatNumber(d)).join(" + ")})`, result: formatRatio(result.ratio, result.asPercent), ok: false },
    ]
  }
}

function ratioCompareToCompareRule(a: RatioComparison, b: Comparison): Container {

  if (!(a.agentA == b.agentA && a.agentB == b.agentB || a.agentA == b.agentB && a.agentB == b.agentA)) {
    throw 'Uncompatible compare rules. Absolute compare agent does not match relative compare agent'
  }

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
function inferRatioCompareToCompareRule(a: RatioComparison, b: Comparison, last?: NthPart): Question<Container> {
  const result = ratioCompareToCompareRule(a, b)
  return {
    name: ratioCompareToCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: containerQuestion(result),
    result,
    options: isNumber(a.ratio) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(abs(b.quantity))} / ${formatRatio(abs(a.ratio - 1))}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(abs(b.quantity))} / ${formatRatio(abs(1 - a.ratio))}`, result: formatNumber(abs(b.quantity / (1 - a.ratio))), ok: false },
    ] : []
  }
}

function transitiveCompareRule(a: Comparison, b: RatioComparison): Comparison {

  if (a.entity != b.agentA && a.entity != b.agentB) {
    throw `Mismatch entity with ${a.agentA} with agents ${b.agentA}, ${b.agentB}`
  }

  return {
    ...a,
    entity: a.entity == b.agentA ? b.agentB : b.agentA,
    quantity: a.entity == b.agentA ? computeQuantityByRatioPart(a, b) : computeQuantityByRatioBase(a, b)
  }
}
function inferTransitiveCompareRule(a: Comparison, b: RatioComparison): Question<Comparison> {
  const result = transitiveCompareRule(a, b);
  return {
    name: transitiveCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik ${result.entity}?`,
    result,
    options: isNumber(b.ratio) && isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity * b.ratio), ok: ([a.entity].includes(b.agentB) && b.ratio >= 0) || ([a.entity].includes(b.agentA) && b.ratio < 0) },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity / b.ratio), ok: ([a.entity].includes(b.agentA) && b.ratio >= 0) || ([a.entity].includes(b.agentB) && b.ratio < 0) },
    ] : []
  }
}

function compRatiosToCompRule(a: PartToPartRatio, b: Comparison, nthPart: NthPart): Container {
  if (!areNumbers(a.ratios) || !isNumber(b.quantity)) {
    throw "ratios does not support non quantity type"
  }

  const aIndex = a.parts.indexOf(b.agentA);
  const bIndex = a.parts.indexOf(b.agentB);
  if (aIndex === -1 || bIndex === -1) {
    throw `Missing parts to compare ${a.parts.join(",")}, required parts ${b.agentA, b.agentB}`
  }

  const diff = a.ratios[aIndex] - a.ratios[bIndex];
  if (!((diff > 0 && b.quantity > 0) || (diff < 0 && b.quantity < 0) || (diff == 0 && b.quantity == 0))) {
    throw `Uncompatible compare rules. Absolute compare ${b.quantity} between ${b.agentA} a ${b.agentB} does not match relative compare.`
  }

  const lastIndex = nthPart?.agent != null ? a.parts.findIndex(d => d === nthPart.agent) : aIndex > bIndex ? aIndex : bIndex;
  const nthPartAgent = a.parts[lastIndex]

  return {
    kind: 'cont',
    agent: nthPartAgent,
    entity: b.entity,
    unit: b.unit,
    quantity: abs(b.quantity / diff) * a.ratios[lastIndex]
  }
}
function inferCompRatiosToCompRule(a: PartToPartRatio, b: Comparison, nthPart: NthPart): Question<Container> {
  const result = compRatiosToCompRule(a, b, nthPart)
  const aIndex = a.parts.indexOf(b.agentA);
  const bIndex = a.parts.indexOf(b.agentB);
  const lastIndex = nthPart?.agent != null ? a.parts.findIndex(d => d === nthPart.agent) : aIndex > bIndex ? aIndex : bIndex;

  return {
    name: compRatiosToCompRule.name,
    inputParameters: extractKinds(a, b, nthPart),
    question: containerQuestion(result),
    result,
    options: areNumbers(a.ratios) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(abs(b.quantity))} / |${formatNumber(a.ratios[aIndex])} - ${formatNumber(a.ratios[bIndex])}| * ${formatNumber(a.ratios[lastIndex])}`, result: formatNumber(result.quantity), ok: true },
    ] : []
  }
}


function proportionRule(a: RatioComparison, b: Proportion): RatioComparison {
  return {
    ...a,
    ...(b.inverse && { ratio: isNumber(a.ratio) ? 1 / a.ratio : wrapToRatio(`1 / a.ratio`, { a }) })
  }
}
function inferProportionRule(a: RatioComparison, b: Proportion): Question<RatioComparison> {
  const result = proportionRule(a, b)
  return {
    name: proportionRule.name,
    inputParameters: extractKinds(a, b),
    question: `Jaký je vztah mezi veličinami? ${b.entities?.join(' a ')}`,
    result,
    options: isNumber(a.ratio) ? [
      { tex: `zachovat poměr`, result: formatRatio(a.ratio), ok: !b.inverse },
      { tex: `obrátit poměr - 1 / ${formatRatio(a.ratio)}`, result: formatRatio(1 / a.ratio), ok: b.inverse },
    ] : []
  }
}


function proportionTwoPartRatioRule(a: PartToPartRatio, b: Proportion): PartToPartRatio {
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
function inferProportionTwoPartRatioRule(a: PartToPartRatio, b: Proportion): Question<PartToPartRatio> {
  const result = proportionTwoPartRatioRule(a, b)
  return {
    name: proportionTwoPartRatioRule.name,
    inputParameters: extractKinds(a, b),
    question: `Jaký je vztah mezi veličinami? ${b.entities?.join(' a ')}`,
    result,
    options: [
      { tex: `zachovat poměr`, result: result.ratios.join(":"), ok: !b.inverse },
      { tex: `obrátit poměr`, result: result.ratios.join(":"), ok: b.inverse },
    ]
  }
}

function invertRatiosRule(a: PartToPartRatio, b: RatiosInvert): PartToPartRatio {
  if (!areNumbers(a.ratios)) {
    throw `invertRatisRule is not support by non quantity type`
  }
  return {
    kind: 'ratios',
    whole: b.agent,
    parts: a.parts,
    ratios: a.ratios.map(d => 1 / d)
  }
}
function inferInvertRatiosRule(a: PartToPartRatio, b: RatiosInvert): Question<PartToPartRatio> {
  if (!areNumbers(a.ratios)) {
    throw `invertRatiosRule is not support by non quantity type`
  }
  const result = mapRationsByFactorRule(invertRatiosRule(a, b), lcdCalc(a.ratios))
  return {
    name: invertRatiosRule.name,
    inputParameters: extractKinds(a, b),
    question: `Převeď poměry na obracené hodnoty.`,
    result,
    options: areNumbers(a.ratios) ? [
      { tex: `obrátit poměr`, result: result.ratios.join(":"), ok: true },
    ] : []
  }
}
function inferReverseRatiosRule(a: PartToPartRatio, b: Reverse): Question<PartToPartRatio> {
  const result = {
    ...a,
    ratios: a.ratios.toReversed(),
    parts: a.parts.toReversed(),
  }
  return {
    name: "reverseRatiosRule",
    inputParameters: extractKinds(a, b),
    question: `Otoč členy poměru.`,
    result,
    options: areNumbers(a.ratios) ? [
      { tex: `${a.ratios.join(":")} => ${result.ratios.join(":")}`, result: result.ratios.join(":"), ok: true },
    ] : []
  }
}

function partToWholeRule(a: Container, b: PartWholeRatio): Container {

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
function inferPartToWholeRule(a: Container, b: PartWholeRatio): Question<Container> {
  const result = partToWholeRule(a, b)
  return {
    name: partToWholeRule.name,
    inputParameters: extractKinds(a, b),
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(b.ratio) && isNumber(result.quantity) ? [
      { tex: `${formatRatio(b.ratio)} * ${formatNumber(a.quantity)}`, result: formatNumber(result.quantity), ok: matchAgent(b.whole, a) },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(b.ratio)}`, result: formatNumber(a.quantity / b.ratio), ok: !matchAgent(b.whole, a) }]
      : []
  }
}

function rateRule(a: Container | Quota | Rate, rate: Rate): Container {

  const aEntity = a.kind == "cont" ? a.entity : a.kind === "quota" ? a.agentQuota : a.entity.entity;
  if (!(aEntity === rate.entity.entity || aEntity === rate.entityBase.entity)) {
    throw `Mismatch entity ${aEntity} any of ${rate.entity.entity}, ${rate.entityBase.entity}`
  }
  const isEntityBase = aEntity == rate.entity.entity;
  const isUnitRate = rate.baseQuantity === 1;
  return {
    kind: 'cont',
    agent: a.agent,
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
function inferRateRule(a: Container | Quota | Rate, rate: Rate): Question<Container> {
  const result = rateRule(a, rate)
  const aEntity = a.kind == "cont" ? a.entity : a.kind === "quota" ? a.agentQuota : a.entity.entity
  const isUnitRate = rate.baseQuantity === 1;
  return {
    name: rateRule.name,
    inputParameters: extractKinds(a, rate),
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(rate.quantity) && isNumber(result.quantity) && isNumber(rate.baseQuantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(rate.quantity)}`, result: formatNumber(result.quantity), ok: isUnitRate && aEntity !== rate.entity.entity },
      ...(!isUnitRate ? [{ tex: `${formatNumber(a.quantity)} * (${formatNumber(rate.quantity)}/${formatNumber(rate.baseQuantity)})`, result: formatNumber(result.quantity), ok: !isUnitRate && aEntity !== rate.entity.entity }] : []),
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(rate.quantity)}`, result: formatNumber(result.quantity), ok: aEntity === rate.entity.entity },
      ...(!isUnitRate ? [{ tex: `${formatNumber(a.quantity)} / (${formatNumber(rate.quantity)}/${formatNumber(rate.baseQuantity)})`, result: formatNumber(result.quantity), ok: !isUnitRate && aEntity === rate.entity.entity }] : []),
    ]
      : []
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
      ? isNumber(a.quantity) && isNumber(quota.quantity) ? a.quantity * quota.quantity : wrapToQuantity(`a.quantity * quota.quantity`, { a, quota })
      : isNumber(a.quantity) && isNumber(quota.quantity) ? a.quantity / quota.quantity : wrapToQuantity(`a.quantity / quota.quantity`, { a, quota })
  }
}
function inferQuotaRule(a: Container, quota: Quota): Question<Container> {
  const result = quotaRule(a, quota)
  return {
    name: quotaRule.name,
    inputParameters: extractKinds(a, quota),
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(quota.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(quota.quantity)}`, result: formatNumber(a.quantity * quota.quantity), ok: a.agent === quota.agentQuota },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota.quantity)}`, result: formatNumber(a.quantity / quota.quantity), ok: a.agent !== quota.agentQuota }]
      : []
  }
}

function toPartWholeRatio(part: Container, whole: Container, asPercent?: boolean): PartWholeRatio {
  return {
    kind: 'ratio',
    part: part.agent,
    whole: whole.agent,
    ratio: isNumber(part.quantity) && isNumber(whole.quantity) ? part.quantity / whole.quantity : wrapToRatio(`part.quantity / whole.quantity`, { part, whole }),
    asPercent
  }
}
function inferToPartWholeRatio(part: Container, whole: Container, last: PartWholeRatio): Question<PartWholeRatio> {
  const result = toPartWholeRatio(part, whole, last.asPercent)
  return {
    name: toPartWholeRatio.name,
    inputParameters: extractKinds(part, whole, last),
    question: `Vyjádři ${last.asPercent ? 'procentem' : 'poměrem'} ${part.agent} z ${whole.agent}?`,
    result,
    options: isNumber(part.quantity) && isNumber(whole.quantity) && isNumber(result.ratio) ? [
      { tex: `${formatNumber(whole.quantity)} / ${formatNumber(part.quantity)} ${last.asPercent ? ' * 100' : ''}`, result: last.asPercent ? formatNumber(result.ratio * 100) : formatRatio(result.ratio), ok: false },
      { tex: `${formatNumber(part.quantity)} / ${formatNumber(whole.quantity)} ${last.asPercent ? ' * 100' : ''}`, result: last.asPercent ? formatNumber(result.ratio * 100) : formatRatio(result.ratio), ok: true }]
      : []
  }
}


function compareDiffRule(a: Container, b: ComparisonDiff): Container {
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
function inferCompareDiffRule(a: Container, b: ComparisonDiff): Question<Container> {
  const result = compareDiffRule(a, b)
  return {
    name: compareDiffRule.name,
    inputParameters: extractKinds(a, b),
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: a.agent === b.agentMinuend },
      { tex: `${formatNumber(a.quantity)} + ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity + b.quantity), ok: a.agent !== b.agentMinuend }
    ] : []
  }
}

function sumRule(items: Container[] | PartWholeRatio[] | Rate[] | RatioComparison[] | Frequency[], b: SumCombine | Sum): Container | PartWholeRatio | Rate | RatioComparison {
  if (items.every(d => isRatioPredicate(d))) {

    const bases = items.every(d => d.kind === "ratio") ? items.map(d => d.whole) : items.map(d => d.agentB);
    if (bases.filter(unique).length == bases.length) {
      throw `Sum only part to whole ratio with the same whole ${bases}`
    };

    const ratios = items.map(d => d.ratio);
    const ratio = areNumbers(ratios) ? ratios.reduce((out, d) => out += d, 0) : wrapToRatio(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));

    return items.every(d => d.kind === "ratio")
      ? { kind: 'ratio', whole: bases[0], ratio, part: b.wholeAgent, asPercent: items[0].asPercent }
      : { kind: 'comp-ratio', agentA: b.wholeAgent, agentB: bases[0], ratio, asPercent: items[0].asPercent }
  }
  else if (items.every(d => isQuantityPredicate(d))) {
    if (items.every(d => isFrequencyPredicate(d))) {
      const values = items.map(d => [d.quantity, d.baseQuantity]);
      const quantity = areTupleNumbers(values) ? values.reduce((out, [q, baseQ]) => out += q * baseQ, 0) : wrapToQuantity(items.map((d, i) => `x${i + 1}.quantity * x${i + 1}.baseQuantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
      return {
        kind: 'cont',
        agent: b.wholeAgent,
        quantity,
        entity: b.wholeEntity != null ? b.wholeEntity.entity : items[0].entityBase.entity,
        unit: b.wholeEntity != null ? b.wholeEntity.unit : items[0].entityBase.unit
      }
    }
    else {
      const values = items.map(d => d.quantity);
      const quantity = areNumbers(values) ? values.reduce((out, d) => out += d, 0) : wrapToQuantity(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
      if (items.every(d => isRatePredicate(d))) {
        const { entity, entityBase } = items[0];
        return { kind: 'rate', agent: b.wholeAgent, quantity, entity, entityBase, baseQuantity: 1 }
      }
      else {
        if (b.kind !== 'sum-combine') {
          const itemsEntities = items.map(d => d.entity);
          if (b.wholeEntity === null && itemsEntities.filter(unique).length !== 1) {
            throw `All predicates should have the same entity ${itemsEntities.map(d => JSON.stringify(d)).join("")}.`
          }
        }
        return {
          kind: 'cont',
          agent: b.wholeAgent,
          quantity,
          entity: b.wholeEntity != null ? b.wholeEntity.entity : items[0].entity,
          unit: b.wholeEntity != null ? b.wholeEntity.unit : items[0].unit
        }
      }
    }
  }
}
function inferSumRule(items: Container[] | PartWholeRatio[] | Rate[] | RatioComparison[] | Frequency[], b: SumCombine | Sum): Question<Container | PartWholeRatio | Rate | RatioComparison> {
  const result = sumRule(items, b)
  const isQuantity = isQuantityPredicate(result);
  return {
    name: sumRule.name,
    inputParameters: extractKinds(...items, b),
    question: result.kind === "cont"
      ? containerQuestion(result)
      : result.kind === "rate"
        ? `${computeQuestion(result.quantity)} ${result.agent}?`
        : result.kind === "ratio"
          ? `${computeQuestion(result.ratio)} ${result.part} z ${result.whole}?`
          : `${computeQuestion(result.ratio)} kolikrát ${result.agentA} více nebo méně než ${result.agentB}?`,
    result,
    options: items.every(d => isFrequencyPredicate(d))
      ? []
      : (isQuantity && isNumber(result.quantity)) || (isRatioPredicate(result) && isNumber(result.ratio)) ? [
        {
          tex: items.map(d => isQuantity ? formatNumber(d.quantity) : formatRatio(d.ratio, d.percent)).join(" + "),
          result: isQuantity
            ? isNumber(result.quantity) ? formatNumber(result.quantity) : 'N/A'
            : isNumber(result.ratio) ? formatRatio(result.ratio, result.asPercent) : 'N/A',
          ok: true
        },
        {
          tex: items.map(d => isQuantity ? formatNumber(d.quantity) : formatRatio(d.ratio, d.percent)).join(" * "),
          result: isQuantity
            ? isNumber(result.quantity) ? formatNumber(result.quantity) : 'N/A'
            : isNumber(result.ratio) ? formatRatio(result.ratio, result.asPercent) : 'N/A',
          ok: false
        },
      ] : []
  }
}

function productRule(items: Container[], b: ProductCombine | Product): Container {
  const values = items.map(d => d.quantity)

  //first non empty entity
  const entity = b.wholeEntity != null ? b.wholeEntity : items.find(d => d.entity != null && d.entity != "")
  const convertedEntity = entity != null ? toEntity(entity) : { entity: "", unit: undefined }

  return {
    kind: 'cont', agent: b.wholeAgent,
    quantity: areNumbers(values) ? values.reduce((out, d) => out *= d, 1) : wrapToQuantity(items.map((d, i) => `y${i + 1}.quantity`).join(" * "), Object.fromEntries(items.map((d, i) => [`y${i + 1}`, d]))),
    entity: convertedEntity.entity, unit: convertedEntity.unit
  }
}
function inferProductRule(items: Container[], b: ProductCombine | Product): Question<Container> {

  const result = productRule(items, b)
  const values = items.map(d => d.quantity);
  return {
    name: productRule.name,
    inputParameters: extractKinds(...items, b),
    question: containerQuestion(result),
    result,
    options: areNumbers(values) ? [
      { tex: values.map(d => formatNumber(d)).join(" * "), result: formatNumber(values.reduce((out, d) => out *= d, 1)), ok: true },
      { tex: values.map(d => formatNumber(d)).join(" + "), result: formatNumber(values.reduce((out, d) => out += d, 0)), ok: false },
    ] : []
  }

}


function gcdRule(values: NumberOrExpression[], b: GCD): Container {
  return {
    kind: 'cont', agent: b.agent,
    quantity: areNumbers(values) ? gcdCalc(values) : wrapToQuantity(`gcd(${values.join(',')})`),
    entity: b.entity,
    unit: b.unit
  }
}
function inferGcdRule(items: Container[], b: GCD): Question<Container> {
  const values = items.map(d => d.quantity);
  const result = gcdRule(values, b)
  return {
    name: gcdRule.name,
    inputParameters: extractKinds(b),
    question: containerQuestion(result),
    result,
    options: areNumbers(values) && isNumber(result.quantity) ? [
      { tex: gcdFromPrimeFactors(primeFactorization(values)).join(" * "), result: formatNumber(result.quantity), ok: true },
      //{ tex: lcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ] : []
  }
}

function lcdRule(values: NumberOrExpression[], b: LCD): Container {
  return {
    kind: 'cont',
    agent: b.agent,
    quantity: areNumbers(values) ? lcdCalc(values) : wrapToQuantity(`lcd(${values.join(',')})`),
    entity: b.entity,
    unit: b.unit
  }
}
function inferLcdRule(items: (Container | Rate)[], b: LCD): Question<Container> {
  const values = items.map(d => d.quantity);
  const result = lcdRule(values, b)
  return {
    name: lcdRule.name,
    inputParameters: extractKinds(b),
    question: containerQuestion(result),
    result,
    options: areNumbers(values) && isNumber(result.quantity) ? [
      { tex: lcdFromPrimeFactors(primeFactorization(values)).join(" * "), result: formatNumber(result.quantity), ok: true },
      //{ tex: gcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ] : []
  }
}

function tupleRule(items: Predicate[], last: { agent: AgentMatcher }): Question<Tuple> {
  const result: Tuple = { kind: 'tuple', agent: last.agent, items }
  return {
    name: "tupleRule",
    inputParameters: extractKinds(...items),
    question: `Seskup více objektů do jednoho složeného objektu.`,
    result,
    options: []
  }
}

function toSequenceRule(items: Container[]): Sequence {
  const values = items.map(d => d.quantity);
  if (!areNumbers(values)) {
    throw "sequenceRule does not support non quantity type"
  }
  if (new Set(items.map(d => d.entity)).size > 1) {
    throw `Mismatch entity ${items.map(d => d.entity).join()}`
  }
  const type = sequencer(values);
  return { kind: 'sequence', type, entity: items[0].entity }
}
function inferToSequenceRule(items: Container[]): Question<Sequence> {
  const result = toSequenceRule(items);
  return {
    name: toSequenceRule.name,
    inputParameters: extractKinds(...items),
    question: `Hledej vzor opakování. Jaký je vztah mezi sousedními členy?`,
    result,
    options: sequenceOptions(result.type)
  }
}

function toCompareRule(a: Container | Rate, b: Container | Rate): Comparison {
  const aEntity = a.kind === "rate" ? a.entity : { entity: a.entity, unit: a.unit }
  const bEntity = b.kind === "rate" ? b.entity : { entity: b.entity, unit: b.unit }
  if (aEntity.entity != bEntity.entity) {
    throw `Mismatch entity ${aEntity.entity}, ${bEntity.entity}`
  }
  return {
    kind: 'comp', agentB: b.agent, agentA: a.agent,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }),
    ...aEntity
  }
}
function inferToCompareRule(a: Container | Rate, b: Container | Rate): Question<Comparison> {
  const result = toCompareRule(a, b)
  return {
    name: toCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false },
    ] : []
  }
}

function toDeltaRule(a: Container, b: Container, last: Delta): Delta {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  return {
    kind: 'delta', agent: { name: last.agent?.name ?? b.agent, nameBefore: a.agent, nameAfter: b.agent },
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? b.quantity - a.quantity : wrapToQuantity(`b.quantity - a.quantity`, { a, b }),
    entity: a.entity, unit: a.unit
  }
}
function inferToDeltaRule(a: Container, b: Container, last: Delta): Question<Delta> {
  const result = toDeltaRule(a, b, last)
  return {
    name: toDeltaRule.name,
    inputParameters: extractKinds(a, b, last),
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
function inferConvertCompareToDeltaRule(a: Comparison, b: Delta): Question<Delta> {
  const result = convertCompareToDeltaEx(a, b)
  return {
    name: toDeltaRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypočti změnu stavu ${a.agentA} => ${a.agentB}. O kolik?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [] : []
  }
}

function convertDeltaToCompareEx(a: Delta, b: Comparison): Comparison {
  const { agentA, agentB, entity, unit } = b;
  return { kind: 'comp', agentA, agentB, quantity: a.quantity, entity, unit }
}

function inferConvertDeltaToCompareRule(a: Delta, b: Comparison): Question<Comparison> {
  const result = convertDeltaToCompareEx(a, b)
  return {
    name: toDeltaRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${b.agentA} => ${b.agentB}. O kolik?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [] : []
  }
}


function pythagorasRule(a: Container, b: Container, last: Phytagoras): Container {
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
        : wrapToQuantity(`sqrt (a.quantity^2 + b.quantity^2)`, { a, b }),
      agent: last.longest
    }
  }
}
function inferPythagorasRule(a: Container, b: Container, last: Phytagoras): Question<Container> {
  const result = pythagorasRule(a, b, last)
  const longest = a.agent === last.longest ? a : b;
  const otherSite = a.agent === last.longest ? b : a;
  return {
    name: pythagorasRule.name,
    inputParameters: extractKinds(a, b, last),
    question: `Vypočítej stranu ${result.agent} dle Pythagorovi věty?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(longest.quantity) && isNumber(otherSite.quantity) && isNumber(result.quantity) ? [
      { tex: `odmocnina z (${formatNumber(longest.quantity)}^2 - ${formatNumber(otherSite.quantity)}^2)`, result: formatNumber(result.quantity), ok: a.agent === last.longest || b.agent === last.longest },
      { tex: `odmocnina z (${formatNumber(a.quantity)}^2 + ${formatNumber(b.quantity)}^2)`, result: formatNumber(result.quantity), ok: !(a.agent === last.longest || b.agent === last.longest) },
    ] : []
  }
}

function alligationRule(items: Container[] | Rate[], last: Alligation): TwoPartRatio {

  const [a, b, c] = items;
  const aEntity = a.kind === "rate" ? a.entity : { entity: a.entity, unit: a.unit }
  const bEntity = b.kind === "rate" ? b.entity : { entity: b.entity, unit: b.unit }
  const cEntity = c.kind === "rate" ? c.entity : { entity: c.entity, unit: c.unit }

  if (aEntity.entity != bEntity.entity || bEntity.entity != cEntity.entity) {
    throw `Mismatch entity ${aEntity.entity}, ${bEntity.entity}, ${cEntity.entity}`
  }
  if (aEntity.unit != bEntity.unit || bEntity.unit != cEntity.unit) {
    throw `Mismatch unit ${aEntity.unit}, ${bEntity.unit}, ${cEntity.unit}`
  }

  const nums = [a, b, c]

  if (!areNumbers(nums.map(d => d.quantity))) {
    throw `A=lligationRule does not support non quantitive numbers.`
  }

  // Sort them to find the middle (median)
  nums.sort((x, y) => (x.quantity as number) - (y.quantity as number));

  const small = nums[0].quantity as number
  const middle = nums[1].quantity as number
  const large = nums[2].quantity as number

  return {
    kind: 'ratios',
    whole: last.agent,
    ...aEntity,
    ratios: [Math.abs(small - middle), Math.abs(large - middle)],
    parts: [nums[0].agent, nums[2].agent]
  }
}
function inferAlligationRule(items: Container[] | Rate[], last: Alligation): Question<TwoPartRatio> {
  const result = alligationRule(items, last)
  const [min, avarage, max] = items.map(d => d.quantity as number).sort((f, s) => f - s);
  return {
    name: alligationRule.name,
    inputParameters: extractKinds(...items, last),
    question: `Vypočítej ${result.whole} mezi ${result.parts.join(" a ")} vyvážením vůči průměru?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `${formatNumber(avarage)} - ${formatNumber(min)} :: ${formatNumber(max)} - ${formatNumber(avarage)}`, result: result.ratios.join(":"), ok: true },
    ] : []
  }
}

function triangleAngleRule(a: Container, b: Container, last: TriangleAngle): Container {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  if (a.unit != b.unit) {
    throw `Mismatch unit ${a.unit}, ${b.unit}`
  }
  return {
    kind: 'cont',
    entity: a.entity,
    unit: a.unit,
    quantity: isNumber(a.quantity) && isNumber(b.quantity)
      ? 180 - (a.quantity + b.quantity)
      : wrapToQuantity(`180 - (a.quantity + b.quantity)`, { a, b }),
    agent: last.agent
  }
}
function inferTriangleAngleRule(a: Container, b: Container, last: TriangleAngle): Question<Container> {
  const result = triangleAngleRule(a, b, last)
  return {
    name: triangleAngleRule.name,
    inputParameters: extractKinds(a, b, last),
    question: `Vypočítej ${result.agent} dle pravidla součtu vnitřních úhlů v trojúhelníku?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `180 - (${formatNumber(a.quantity)} + ${formatNumber(b.quantity)})`, result: formatNumber(result.quantity), ok: true },
    ] : []
  }
}

function convertPercentRule(a: RatioComparison): RatioComparison {
  return {
    ...a,
    asPercent: !!!a.asPercent
  }
}
function inferConvertPercentRule(a: RatioComparison): Question<RatioComparison> {
  const result = convertPercentRule(a);
  return {
    name: convertPercentRule.name,
    inputParameters: extractKinds(a),
    question: a.asPercent ? `Převeď procenta na násobek` : `Převeď násobek na procenta`,
    result,
    options: isNumber(a.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio, a.asPercent)} / 100`, result: formatRatio(result.ratio, result.asPercent), ok: a.asPercent },
      { tex: `${formatRatio(a.ratio, a.asPercent)} * 100`, result: formatRatio(result.ratio, result.asPercent), ok: !a.asPercent }
    ] : []
  }
}

function toRatioCompareRule(a: Container, b: Container, ctor: RatioComparison): RatioComparison {
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
function inferToRatioCompareRule(a: Container, b: Container, ctor: RatioComparison): Question<RatioComparison> {
  const result = toRatioCompareRule(a, b, ctor);
  if (isNumber(result.ratio) && isNumber(a.quantity) && isNumber(b.quantity)) {
    const between = (result.ratio > 1 / 2 && result.ratio < 2);
    return {
      name: toRatioCompareRule.name,
      inputParameters: [a, b, ctor],
      question: `Porovnej ${result.agentA} a ${result.agentB}.${between ? `O kolik z ${result.agentB}?` : `Kolikrát ${result.ratio < 1 ? 'menší' : 'větší'}?`}`,
      result,
      options: between
        ?
        [
          { tex: `(${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}) / ${formatNumber(b.quantity)}`, result: formatRatio((a.quantity - b.quantity) / b.quantity), ok: result.ratio > 1 },
          { tex: `(${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}) / ${formatNumber(b.quantity)}`, result: formatRatio((b.quantity - a.quantity) / b.quantity), ok: result.ratio <= 1 }
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
    return resultAsQuestion<RatioComparison>(result, { name: toRatioCompareRule.name, inputParamters: extractKinds(a, b, ctor) });
  }
}

function compareToRateRule(a: Comparison, b: Comparison, last?: { agent: AgentMatcher }): Rate {
  return {
    kind: 'rate',
    agent: last?.agent ?? a.agentA,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? abs(a.quantity) / abs(b.quantity) : wrapToQuantity(`abs(a.quantity) / abs(b.quantity)`, { a, b }),
    entity: { entity: a.entity },
    entityBase: { entity: b.entity },
    baseQuantity: 1
  }
}
function inferCompareToRateRule(a: Comparison, b: Comparison, last?: { agent: AgentMatcher }): Question<Rate> {
  const result = compareToRateRule(a, b, last);

  return {
    name: compareToRateRule.name,
    inputParameters: extractKinds(a, b),
    question: `Rozděl ${formatEntity({ entity: a.entity })} rovnoměrně na ${formatEntity({ entity: b.entity })}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(abs(a.quantity))} / ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(abs(b.quantity))} / ${formatNumber(abs(a.quantity))}`, result: formatNumber(abs(b.quantity) / abs(a.quantity)), ok: false },
    ] : []
  }
}

function toCompareDiffRule(a: Container, b: Container): ComparisonDiff {
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
function inferToCompareDiffRule(a: Container, b: Container): Question<ComparisonDiff> {
  const result = toCompareDiffRule(a, b)
  return {
    name: toCompareDiffRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.quantity)} rozdíl mezi ${a.quantity} a ${b.quantity}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false },
    ] : []
  }
}


function toSlideRule(a: Container, b: Container, last: Slide | InvertSlide): Container {
  if (a.entity !== b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`
  }
  if (a.unit !== b.unit) {
    throw `Mismatch unit ${a.unit}, ${b.unit}`
  }

  return {
    kind: "cont",
    agent: last.agent ?? a.agent,
    quantity: last.kind === "slide-invert"
      ? isNumber(a.quantity) && isNumber(b.quantity)
        ? a.quantity - b.quantity
        : wrapToQuantity(`a.quantity - b.quantity`, { a, b })
      : isNumber(a.quantity) && isNumber(b.quantity)
        ? a.quantity + b.quantity
        : wrapToQuantity(`a.quantity + b.quantity`, { a, b }),
    entity: a.entity,
    unit: a.unit
  }
}
function infetToSlideRule(a: Container, b: Container, last: Slide | InvertSlide): Question<Container> {
  const result = toSlideRule(a, b, last)
  return {
    name: toSlideRule.name,
    inputParameters: extractKinds(a, b, last),
    question: `${containerQuestion(result)}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${last.kind === "slide-invert" ? '-' : '+'} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false },
    ] : []
  }
}

function toDifferenceRule(a: Container, b: Container, diff: Difference): Container {
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
function inferToDifferenceRule(a: Container, b: Container, diff: Difference): Question<Container> {
  const result = toDifferenceRule(a, b, diff)
  return {
    name: toDifferenceRule.name,
    inputParameters: extractKinds(a, b, diff),
    question: `${computeQuestion(result.quantity)} rozdíl mezi ${a.agent} a ${b.agent}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false },
    ] : []
  }
}

function toDifferenceAsRatioRule(a: PartWholeRatio | RatioComparison, b: PartWholeRatio | RatioComparison, diff: Difference): PartWholeRatio {
  const aBase = a.kind === "comp-ratio" ? a.agentB : a.whole;
  const bBase = b.kind === "comp-ratio" ? b.agentB : b.whole;

  if (aBase !== bBase) {
    throw `Mismatch base agents ${aBase}, ${bBase}`
  }
  return {
    kind: "ratio",
    whole: aBase,
    part: diff.differenceAgent,
    ratio: isNumber(a.ratio) && isNumber(b.ratio) ? a.ratio - b.ratio : wrapToRatio(`a.ratio - b.ratio`, { a, b }),
    asPercent: a.asPercent
  }
}
function inferToDifferenceAsRatioRule(a: PartWholeRatio | RatioComparison, b: PartWholeRatio | RatioComparison, diff: Difference): Question<PartWholeRatio> {
  const result = toDifferenceAsRatioRule(a, b, diff)
  const aPart = a.kind === "comp-ratio" ? a.agentA : a.part;
  const bPart = b.kind === "comp-ratio" ? b.agentA : b.part;

  return {
    name: toDifferenceAsRatioRule.name,
    inputParameters: extractKinds(a, b, diff),
    question: `${computeQuestion(result.ratio)} rozdíl mezi ${aPart} a ${bPart}`,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio, a.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(a.ratio, a.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: false },
    ] : []
  }
}

function transitiveRatioRule(a: PartWholeRatio, b: PartWholeRatio): PartWholeRatio {

  if (!((a.whole === b.part) || (b.whole === a.part))) {
    throw `Mismatch agents ${a.whole} -> ${b.part} or  ${b.whole} -> ${a.part}`
  }
  const firstWhole = a.whole === b.part;
  return {
    kind: "ratio",
    whole: firstWhole ? b.whole : a.whole,
    part: firstWhole ? a.part : b.part,
    ratio: isNumber(a.ratio) && isNumber(b.ratio) ? a.ratio * b.ratio : wrapToRatio(`a.ratio * b.ratio`, { a, b })
  }
}
function inferTransitiveRatioRule(a: PartWholeRatio, b: PartWholeRatio): Question<PartWholeRatio> {
  const result = transitiveRatioRule(a, b)
  return {
    name: transitiveRatioRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.ratio)} ${result.part} z ${result.whole}`,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio)} * ${formatRatio(b.ratio)}`, result: formatRatio(result.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} / ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio / a.ratio), ok: false },
    ] : []
  }
}

function toRateRule(a: Container, b: Container | Quota, rate: Rate): Rate {
  if (a.agent !== b.agent) {
    throw `Mismatch angent ${a.agent}, ${b.agent}`
  }
  const baseQuantity = rate?.baseQuantity ?? 1;
  return {
    kind: 'rate',
    agent: rate.agent ?? a.agent,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(baseQuantity)
      ? (baseQuantity === 1 ? a.quantity / b.quantity * baseQuantity : a.quantity / b.quantity * baseQuantity)
      : (isNumber(baseQuantity) && baseQuantity === 1) ? wrapToQuantity(`a.quantity / b.quantity`, { a, b }) : wrapToQuantity(`a.quantity / b.quantity * rate.baseQuantity`, { a, b, rate }),
    entity: {
      entity: a.entity,
      unit: a.unit
    },
    entityBase: {
      entity: b.kind === "cont" ? b.entity : b.agentQuota,
      unit: b.kind === "cont" ? b.unit : EmptyUnit,
    },
    baseQuantity: rate?.baseQuantity ?? 1
  }
}
function inferToRateRule(a: Container, b: Container | Quota, rate: Rate): Question<Rate> {
  const result = toRateRule(a, b, rate)
  if (isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.baseQuantity) && isNumber(result.quantity)) {
    return {
      name: toRateRule.name,
      inputParameters: extractKinds(a, b, rate),
      question: `Rozděl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity })} rovnoměrně ${formatNumber(b.quantity)} krát${result.baseQuantity !== 1 ? ` po ${formatNumber(result.baseQuantity)} ${formatEntity({ entity: b.kind === "cont" ? b.entity : b.agentQuota })}` : ''}`,
      result,
      options: [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: rate.baseQuantity === 1 },
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)} * ${formatNumber(result.baseQuantity)}`, result: formatNumber(result.quantity), ok: rate.baseQuantity !== 1 },
        { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity / a.quantity), ok: false },
      ]
    }
  }
  else {
    return resultAsQuestion<Rate>(result, { name: toRateRule.name, inputParamters: extractKinds(a, b, rate) });
  }
}

function solveEquationRule(a: Container | Rate, b: Container | Rate, last: LinearEquation): Container {
  return {
    kind: 'cont',
    agent: last.agent,
    quantity: helpers.solveLinearEquation(a.quantity, b.quantity, last.variable),
    ...last.entity,
  }
}
function inferSolveEquationRule(a: Container | Rate, b: Container | Rate, last: LinearEquation): Question<Container> {
  const result = solveEquationRule(a, b, last)
  return {
    name: solveEquationRule.name,
    inputParameters: extractKinds(a, b, last),
    question: `Vyřeš lineární rovnici ${a.agent} = ${b.agent} pro neznámou ${last.variable}.`,
    result,
    options: []
  }
}

function toQuotaRule(a: Container, quota: Container): Quota {
  // if (a.entity !== quota.entity) {
  //   throw `Mismatch entity ${a.entity}, ${quota.entity}`
  // }

  return {
    kind: 'quota',
    agentQuota: quota.agent,
    agent: a.agent,
    quantity: isNumber(a.quantity) && isNumber(quota.quantity) ? Math.floor(a.quantity / quota.quantity) : wrapToQuantity(`floor(a.quantity / quota.quantity)`, { a, quota }),
    restQuantity: isNumber(a.quantity) && isNumber(quota.quantity) ? a.quantity % quota.quantity : wrapToQuantity(`a.quantity % quota.quantity`, { a, quota })
  }
}
function inferToQuotaRule(a: Container, quota: Container): Question<Quota> {
  const result = toQuotaRule(a, quota);
  if (isNumber(a.quantity) && isNumber(quota.quantity) && isNumber(result.quantity)) {
    return {
      name: toQuotaRule.name,
      inputParameters: extractKinds(a, quota),
      question: `Rozděl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity, unit: a.unit })} postupně na skupiny velikosti ${formatNumber(quota.quantity)} ${formatEntity({ entity: quota.entity, unit: quota.unit })}`,
      result,
      options: [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota.quantity)}`, result: formatNumber(result.quantity), ok: true },
        { tex: `${formatNumber(quota.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(result.quantity), ok: false },
      ]
    }
  }
  else {
    return resultAsQuestion<Quota>(result, { name: toQuotaRule.name, inputParamters: extractKinds(a, quota) });
  }
}

function toRatiosRule(parts: Container[] | Rate[], last: PartToPartRatio): PartToPartRatio {
  const ratios = parts.map(d => d.quantity);
  return {
    kind: 'ratios',
    parts: parts.map(d => d.agent),
    ratios: last.useBase ? ratiosToBaseForm(ratios) : ratios,
    whole: last.whole
  }
}
function inferToRatiosRule(parts: Container[] | Rate[], last: PartToPartRatio): Question<PartToPartRatio> {
  const result = toRatiosRule(parts, last)
  return {
    name: toRatiosRule.name,
    inputParameters: extractKinds(...parts, last),
    question: `Vyjádři poměrem mezi ${result.parts.join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `${last.useBase ? parts.map(d => d.quantity).map(d => formatNumber(d)).join(":") : ''}`, result: result.ratios.map(d => formatNumber(d)).join(":"), ok: true },
    ] : []
  }
}

function transitiveRateRule(a: Rate, b: Rate, newAgent: AgentMatcher): Rate {
  if (a.baseQuantity != b.baseQuantity) {
    throw `transitive rate uncompatible baseQuantity not supported ${a.baseQuantity}, ${b.baseQuantity}`
  }

  if (isSameEntity(a.entity, b.entityBase)) {
    return {
      kind: 'rate',
      agent: newAgent,
      quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity * b.quantity : wrapToQuantity(`a.quantity * b.quantity`, { a, b }),
      entity: b.entity,
      entityBase: a.entityBase,
      baseQuantity: a.baseQuantity
    }
  }
  else if (isSameEntity(b.entity, a.entityBase)) {
    return {
      kind: 'rate',
      agent: newAgent,
      quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity * b.quantity : wrapToQuantity(`a.quantity * b.quantity`, { a, b }),
      entity: b.entity,
      entityBase: a.entityBase,
      baseQuantity: a.baseQuantity
    }
  }
  else {
    throw `transitive rate uncompatible entities ${formatEntity(a.entity)} per ${formatEntity(a.entityBase)} to  ${formatEntity(b.entity)} per ${formatEntity(b.entityBase)}`
  }

}
function inferTrasitiveRateRule(a: Rate, b: Rate, last: Rate): Question<Rate> {
  const result = transitiveRateRule(a, b, last.agent)
  return {
    name: transitiveRateRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypočti ${last.agent} ${formatEntity(result.entity)} per ${formatEntity(result.entityBase)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: false },
    ] : []
  }
}


function evalToQuantityRule<
  T extends Predicate & { quantity: Quantity },
  K extends Omit<Predicate, 'quantity'>
>(a: T[], b: { predicate: K, expression: Expression }): K {

  const quantities = a.map(d => d.quantity);
  const variables = extractDistinctWords(b.expression);

  const context = quantities.reduce((out, d, i) => {
    out[variables[i]] = d
    return out;
  }, {});

  return {
    ...b.predicate,
    quantity: areNumbers(quantities) ? helpers.evalExpression(b.expression, context) : wrapToQuantity(`${b.expression}`, variables.reduce((out, d, i) => {
      out[d] = a[i];
      return out;
    }, {}))
  } as K
}

const preservedWords = ["sqrt", "closeTo"]
function extractDistinctWords(str: string): string[] {
  // Match sequences of letters (including multi-letter words)
  const matches = str.match(/[a-zA-Z]+/g) || [];

  // Remove duplicates while preserving order
  return [...new Set(matches)]
    .filter(d => !preservedWords.includes(d));
}

function inferEvalToQuantityRule<
  T extends Predicate & { quantity: Quantity },
  K extends Omit<Predicate, 'quantity'>
>(a: T[], b: EvalExpr<K> | EvalFormula<K>): Question<any> {
  const result = evalToQuantityRule(a, b);
  return {
    name: evalToQuantityRule.name,
    inputParameters: extractKinds(a as any, b as any),
    question: `Vypočti výraz ${b.expression}?`,
    result,
    options: []
  }
}

function simplifyExprRuleAsRatio(a: RatioComparison, b: SimplifyExpr): Predicate {

  if (isNumber(a.ratio)) {
    throw `simplifyExpr does not support quantity types`
  }

  return {
    ...a,
    ratio: helpers.evalExpression(a.ratio, b.context)
  } as Predicate
}
function simplifyExprRuleAsQuantity(a: Container, b: SimplifyExpr): Predicate {

  if (isNumber(a.quantity)) {
    throw `simplifyExpr does not support quantity types`
  }

  return {
    ...a,
    quantity: helpers.evalExpression(a.quantity, b.context)
  } as Predicate
}
function inferSimplifyExprRule(a: RatioComparison | Container, b: SimplifyExpr): Question<Predicate> {
  const result = isQuantityPredicate(a) ? simplifyExprRuleAsQuantity(a, b) : simplifyExprRuleAsRatio(a, b);
  return {
    name: "simplifyExprRule",
    inputParameters: extractKinds(a, b),
    question: `Zjednoduš výraz dosazením ${JSON.stringify(b.context)} ?`,
    result,
    options: []
  }
}
function evalQuotaRemainderExprRule(a: Quota, b: Option): Predicate {

  if (!isNumber(a.restQuantity)) {
    throw `evalQuotaRemainderExprRule does not support quantity types`
  }

  const matched = helpers.evalExpression(b.expression, a.restQuantity) as unknown as boolean;
  return {
    kind: 'eval-option',
    expression: b.expression,
    expressionNice: convertToExpression(b.expectedValue, b.compareTo === "closeTo" ? "equal" : b.compareTo, { ...b.expectedValueOptions, asPercent: false }),
    value: b.optionValue != null ? matched ? b.optionValue : null : matched
  }
}
function inferEvalQuotaRemainderExprRule(a: Quota, b: Option): Question<Predicate> {
  const result = evalQuotaRemainderExprRule(a, b);
  return {
    name: evalToOptionRule.name,
    inputParameters: extractKinds(a, b),
    question: b.optionValue != null ? `Vyhodnoť volbu [${b.optionValue}]?` : `Vyhodnoť pravdivost ${b.expressionNice}?`,
    result,
    options: []
  }
}

function evalToOptionRule<T extends Predicate & { quantity?: Quantity, ratio?: Quantity }>(a: T, b: Option): Option {
  let valueToEval = a.quantity ?? a.ratio;

  if (isExpressionNode(valueToEval)) {

    valueToEval = helpers.evalExpression(valueToEval.expression, valueToEval.context)
    //console.log(a.quantity ?? a.ratio, valueToEval)
  }

  if (!isNumber(valueToEval)) {
    throw `evalToQuantity does not support non quantity types. ${JSON.stringify(valueToEval)}`
  }
  if (a.kind == "comp-ratio" && (b.expectedValueOptions.asRelative || (valueToEval > 1 / 2 && valueToEval < 2))) {
    valueToEval = valueToEval > 1 ? valueToEval - 1 : 1 - valueToEval;
  }

  const matched = helpers.evalExpression(b.expression, valueToEval) as unknown as boolean;
  return {
    kind: 'eval-option',
    expression: b.expression,
    expressionNice: convertToExpression(b.expectedValue, b.compareTo === "closeTo" ? "equal" : b.compareTo, { ...b.expectedValueOptions, asPercent: false }),
    value: b.optionValue != null ? matched ? b.optionValue : null : matched
  }
}
function inferEvalToOptionRule<T extends Predicate>(a: T, b: Option): Question<Option> {
  const result = evalToOptionRule(a, b);
  return {
    name: evalToOptionRule.name,
    inputParameters: extractKinds(a, b),
    question: b.optionValue != null ? `Vyhodnoť volbu [${b.optionValue}]?` : `Vyhodnoť pravdivost ${b.expressionNice}?`,
    result,
    options: []
  }
}

function partToPartRule(a: Container | Rate, partToPartRatio: PartToPartRatio, nth?: NthPart): Container | Rate {
  if (!(partToPartRatio.whole != null && matchAgent(partToPartRatio.whole, a) || partToPartRatio.parts.some(d => matchAgent(d, a)))) {
    throw `Mismatch agent ${[a.agent, a.entity].join()} any of ${[partToPartRatio.whole].concat(partToPartRatio.parts).join()}`
  }

  const sourcePartIndex = partToPartRatio.parts.findIndex(d => matchAgent(d, a))
  const targetPartIndex = nth != null ? partToPartRatio.parts.findIndex(d => d === nth.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;

  const matchedWhole = matchAgent(partToPartRatio.whole, a);
  return {
    ...a,
    agent: (matchedWhole || nth != null) && targetPartIndex != -1
      ? partToPartRatio.parts[targetPartIndex]
      : partToPartRatio.whole,
    quantity: matchedWhole
      ? areNumbers(partToPartRatio.ratios) && isNumber(a.quantity)
        ? (a.quantity / partToPartRatio.ratios.reduce((out, d) => out += d, 0)) * partToPartRatio.ratios[targetPartIndex]
        : wrapToQuantity(`a.quantity / (${partToPartRatio.ratios.map((d, i) => `b.ratios[${i}]`).join(" + ")}) * b.ratios[${targetPartIndex}]`, { a, b: partToPartRatio })
      : areNumbers(partToPartRatio.ratios) && isNumber(a.quantity)
        ? (a.quantity / partToPartRatio.ratios[sourcePartIndex]) * (nth != null ? partToPartRatio.ratios[targetPartIndex] : partToPartRatio.ratios.reduce((out, d) => out += d, 0))
        : nth != null
          ? wrapToQuantity(`a.quantity / b.ratios[${sourcePartIndex}] * b.ratios[${targetPartIndex}]`, { a, b: partToPartRatio })
          : wrapToQuantity(`a.quantity / b.ratios[${sourcePartIndex}] * (${partToPartRatio.ratios.map((d, i) => `b.ratios[${i}]`).join(" + ")})`, { a, b: partToPartRatio }),

  }
}
function inferPartToPartRule(a: Container | Rate, partToPartRatio: PartToPartRatio, nth?: NthPart): Question<Container | Rate> {
  const result = partToPartRule(a, partToPartRatio, nth)
  const matchedWhole = matchAgent(partToPartRatio.whole, a);
  let sourcePartIndex = partToPartRatio.parts.findIndex(d => matchAgent(d, a))
  const targetPartIndex = nth != null ? partToPartRatio.parts.findIndex(d => d === nth.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;

  if (sourcePartIndex == -1) sourcePartIndex = 0;
  const partsSum = `(${partToPartRatio.ratios.join(" + ")})`
  return {
    name: partToPartRule.name,
    inputParameters: extractKinds(a, partToPartRatio, nth),
    question: result.kind === "rate" ? `${computeQuestion(result.quantity)} ${result.agent}` : containerQuestion(result),
    result,
    options: areNumbers(partToPartRatio.ratios) && isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} / ${partsSum} * ${formatNumber(partToPartRatio.ratios[targetPartIndex])}`, result: formatNumber(result.quantity), ok: matchedWhole },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(partToPartRatio.ratios[sourcePartIndex])} * ${nth != null ? partToPartRatio.ratios[targetPartIndex] : partsSum}`, result: formatNumber(result.quantity), ok: !matchedWhole },
    ] : []
  }
}

function computeBalancedPartition(n, k, i) {
  if (i < 0 || i >= k) {
    throw new Error("Index out of range");
  }

  const q = Math.floor(n / k); // base size
  const r = n % k;             // remainder

  // If i is among the first r indices, it gets q+1
  return i < r ? q + 1 : q;
}
function balancedPartitionRule(a: Container, balanced: BalancedPartition, nth?: NthPart): Container {
  if (!isNumber(a.quantity)) {
    throw "balancedPartitionRule is not supported by non quantity types"
  }
  const index = nth?.agent != null ? balanced.parts.findIndex(d => d === nth.agent) : balanced.parts.length - 1;
  if (index === -1) {
    throw `No part found ${nth?.agent ?? balanced.parts.length} - ${balanced.parts.join(",")}`
  }

  const agent = balanced.parts[index];

  return {
    kind: 'cont',
    agent: balanced.entity != null ? a.agent : agent,
    entity: balanced.entity != null ? balanced.entity.entity : a.entity,
    unit: balanced.entity != null ? balanced.entity.unit : a.unit,
    quantity: computeBalancedPartition(a.quantity, balanced.parts.length, index)
  }
}
function inferBalancedPartitionRule(a: Container, balanced: BalancedPartition, nth?: NthPart): Question<Container> {
  if (!isNumber(a.quantity)) {
    throw "balancedPartitionRule is not supported by non quantity types"
  }
  const result = balancedPartitionRule(a, balanced, nth)

  return {
    name: balancedPartitionRule.name,
    inputParameters: extractKinds(a, balanced, nth),
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(result.quantity)
      ? []
      : []
  }
}

function inferToScaleRule(target: Container, factor: Container, last: Scale | InvertScale): Question<Container> {
  const inverse = last.kind === "scale-invert";

  const quantity = isNumber(target.quantity) && isNumber(factor.quantity)
    ? inverse ? target.quantity * 1 / factor.quantity : target.quantity * factor.quantity
    : inverse ? wrapToQuantity('target.quantity * 1 / factor.quantity', { target, factor }) : wrapToQuantity('target.quantity * factor.quantity', { target, factor });

  const result = {
    ...target,
    agent: last.agent ?? target.agent,
    quantity
  }
  const moreOrLess = (quantity: number) => inverse
    ? quantity <= 1
    : quantity > 1;

  return {
    name: "scaleRule",
    inputParameters: extractKinds(target, factor, last),
    question: isNumber(factor.quantity) ? `${moreOrLess(factor.quantity) ? "Zvětši" : "Zmenši"} ${factor.quantity} krát ${target.agent}.` : `${computeQuestion(result.quantity)}`,
    result,
    options: isNumber(target.quantity) && isNumber(factor.quantity) && isNumber(result.quantity) ? [
      {
        tex: inverse
          ? `${formatNumber(target.quantity)} / ${formatNumber(factor.quantity)}`
          : `${formatNumber(target.quantity)} * ${formatNumber(factor.quantity)}`, result: formatNumber(result.quantity), ok: true
      }
    ] : []

  }
}
function mapRationsByFactorRule(multi: PartToPartRatio, quantity: number) {
  if (!areNumbers(multi.ratios)) {
    throw "ratios are not supported by non quantity types"
  }

  return { ...multi, ratios: multi.ratios.map(d => d * quantity) }
}
function inferMapRatiosByFactorRule(multi: PartToPartRatio, factor: Container, inverse?: boolean): Question<PartToPartRatio> {
  if (!areNumbers(multi.ratios) || !isNumber(factor.quantity)) {
    throw "ratios are not supported by non quantity types"
  }
  const quantity = inverse ? 1 / factor.quantity : factor.quantity;
  const result = mapRationsByFactorRule(multi, quantity)

  return {
    name: mapRationsByFactorRule.name,
    inputParameters: extractKinds(multi, factor),
    question: `${quantity > 1 ? "Roznásob " : "Zkrať "} poměr číslem ${quantity > 1 ? formatNumber(quantity) : formatNumber(1 / quantity)}`,
    result,
    options: []

  }
}
function nthPartFactorByRule(multi: PartToPartRatio, factor: NumberOrExpression, nthPart: NthPartFactor): PartToPartRatio {
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
function inferNthPartFactorByRule(multi: PartToPartRatio, factor: Container | Rate, nthPart: NthPartFactor): Question<PartToPartRatio> {
  if (!areNumbers(multi.ratios) || !isNumber(factor.quantity)) {
    throw "ratios are not supported by non quantity types"
  }
  const result = nthPartFactorByRule(multi, factor.quantity, nthPart)

  return {
    name: nthPartFactorByRule.name,
    inputParameters: extractKinds(multi, factor, nthPart),
    question: `Rozšířit poměr o ${nthPart.agent} ${formatNumber(factor.quantity)} krát ${formatEntity(factor.kind === "rate" ? factor.entity : factor)}`,
    result,
    options: []

  }
}

function nthPartScaleByRule(multi: PartToPartRatio, factor: NumberOrExpression, nthPart: NthPartScale): PartToPartRatio {
  if (!areNumbers(multi.ratios) || !isNumber(factor)) {
    throw "ratios are not supported by non quantity types"
  }
  if (factor < 1) {
    throw `Ratios can be only extended by positive quantity ${factor}.`
  }
  const partIndex = multi.parts.indexOf(nthPart.agent)

  const multiplePartByFactor = (arr) => arr.map((d, i) => i === partIndex ? d * factor : d)

  return {
    kind: 'ratios',
    whole: multi.whole,
    parts: multi.parts,
    ratios: multiplePartByFactor(multi.ratios),
  }
}
function inferNthPartScaleByRule(multi: PartToPartRatio, factor: Container | Rate, nthPart: NthPartScale): Question<PartToPartRatio> {
  if (!areNumbers(multi.ratios) || !isNumber(factor.quantity)) {
    throw "ratios are not supported by non quantity types"
  }
  const result = nthPartScaleByRule(multi, factor.quantity, nthPart)

  return {
    name: nthPartScaleByRule.name,
    inputParameters: extractKinds(multi, factor, nthPart),
    question: `Rozšířit poměr o ${nthPart.agent} ${formatNumber(factor.quantity)} krát ${formatEntity(factor.kind === "rate" ? factor.entity : factor)}`,
    result,
    options: []

  }
}

function matchAgent(d: AgentMatcher, a: { agent: AgentMatcher }) {
  return d === a.agent;
}

function partEqualRule(a: Comparison, b: Container) {
  if (!isNumber(a.quantity)) {
    throw "partEqual are not supported by non quantity types"
  }
  const diff = compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, abs(a.quantity), a.entity);
  const rest = compareDiffRule(b, diff);
  if (!isNumber(rest.quantity)) {
    throw "partEqual are not supported by non quantity types"
  }
  return {
    ...rest,
    quantity: rest.quantity / 2
  }
}
function inferPartEqualRule(a: Comparison, b: Container): Question<Container> {
  if (!isNumber(a.quantity)) {
    throw "partEqual are not supported by non quantity types"
  }
  const diff = compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, abs(a.quantity), a.entity);
  const result = partEqualRule(a, b)
  return {
    name: partEqualRule.name,
    inputParameters: extractKinds(a, b),
    question: containerQuestion(result),
    result,
    options: isNumber(b.quantity) && isNumber(a.quantity) && isNumber(diff.quantity) ? [
      { tex: `(${formatNumber(b.quantity)} - ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity - diff.quantity) / 2), ok: b.agent === diff.agentMinuend },
      { tex: `(${formatNumber(b.quantity)} + ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity + diff.quantity) / 2), ok: b.agent !== diff.agentMinuend }
    ] : []
  }

}

function nthTermRule(a: Container, b: Sequence): Container {
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
function nthTermExpressionRuleEx(a: Container, b: Pattern): Container {
  if (!isNumber(a.quantity)) {
    throw "nthTermExpressionRule are not supported by non quantity types"
  }

  return evalToQuantityRule<Container, ContainerEval>([a], {
    predicate: {
      kind: 'cont', agent: a.agent, entity: b.entity,
    },
    expression: b.nthTerm,    
  }) as Container

}

function inferNthTermRule(a: Container, b: Sequence | Pattern): Question<Container> {
  const result = b.kind === "pattern" ? nthTermExpressionRuleEx(a, b) : nthTermRule(a, b)
  return {
    name: nthTermRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypočti ${result.entity}?`,
    result,
    options: isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: b.kind === "pattern" ? (b.nthTermDescription ?? b.nthTerm) : formatSequence(b.type, a.quantity), result: formatNumber(result.quantity), ok: true },
    ] : []
  }
}


function nthPositionRule(a: Container, b: Sequence, newEntity: string = 'nth'): Container {
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
function nthPositionExpressionRuleEx(a: Container, b: Pattern, newEntity: string = 'nth'): Container {
  if (!isNumber(a.quantity)) {
    throw "nthPositionExpressionRuleEx are not supported by non quantity types"
  }

  return evalToQuantityRule<Container, ContainerEval>([a], {
    predicate: {
      kind: 'cont', agent: a.agent, entity: newEntity,
    },
    expression: b.nthPosition
  }) as Container

}

function inferNthPositionRule(a: Container, b: Sequence | Pattern, newEntity: string = 'nth'): Question<Container> {
  const result = b.kind === "pattern" ? nthPositionExpressionRuleEx(a, b, newEntity) : nthPositionRule(a, b, newEntity)
  return {
    name: nthPositionRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypočti pozici ${result.agent} = ${formatEntity(a)}?`,
    result,
    options: isNumber(result.quantity) ? [
      { tex: 'Dle vzorce', result: formatNumber(result.quantity), ok: true },
    ] : []
  }
}

// #endregion

// #region Inference rules application
function isQuestion(value: Question<any> | Predicate): value is Question<any> {
  return (value as any)?.result != null
}

export function inferenceRule(...args: Predicate[]): Predicate {
  const value = inferenceRuleEx(...args);
  return isQuestion(value) ? value.result : value;
}
export function inferenceRuleWithQuestion(children: Predicate[]) {
  if (children.length < 1) {
    throw "inferenceRuleWithQuestion requires at least one child";
  }
  const last = children[children.length - 1];
  const predicates = children.slice(0, -1);

  const result = predicates.length > 1 ? inferenceRuleEx(...predicates) : null;
  //if result == null not possible to evaluate -> it has no derived computation
  return result == null
    ? {
      name: predicates.find(d => d.kind == "common-sense") != null ? "commonSense" : "unknownRule",
      inputParamters: predicates.map(d => d.kind),
      question: (last.kind === "cont")
        ? containerQuestion(last)
        : (last.kind === "comp")
          ? `${computeQuestion(last.quantity)} porovnání ${last.agentA} a ${last.agentB}`
          : (last.kind === "ratio")
            ? `Vyjádři jako poměr ${last.part} k ${last.whole}`
            : 'Co lze vyvodit na základě zadaných předpokladů?',
      result: last,
      options: []
    }
    : result;
}
function inferenceRuleEx(...args: Predicate[]): Question<any> {
  const [a, b, ...rest] = args;
  const last = rest?.length > 0 ? rest[rest.length - 1] : null;
  const kind = last?.kind;

  if (last == null && a.kind == "eval-expr") {
    return inferEvalToQuantityRule([], a)
  }
  if (['sum-combine', "sum", 'product-combine', "product", "gcd", "lcd", "sequence", "tuple", "eval-expr", "eval-formula", "alligation"].includes(last?.kind)) {

    const arr = [a, b].concat(rest.slice(0, -1)) as Container[];

    if (last.kind === "sequence") return inferToSequenceRule(arr)
    if (last.kind === "gcd") return inferGcdRule(arr, last)
    if (last.kind === "lcd") return inferLcdRule(arr, last)
    if (last.kind === "eval-expr" || last.kind === "eval-formula") return inferEvalToQuantityRule(arr, last)
    if (last.kind === "tuple") return tupleRule(arr, last)
    if (['product-combine', "product"].includes(last.kind)) return inferProductRule(arr, last as ProductCombine | Product)
    if (['sum-combine', "sum",].includes(last.kind)) return inferSumRule(arr, last as SumCombine | Sum)
    if (last.kind === "alligation") return inferAlligationRule(arr, last)
    return null
  }
  else if ((last?.kind === "ratios") && args.length > 3) {

    const arr = [a, b].concat(rest.slice(0, -1));
    if (arr.every(d => d.kind === 'comp-ratio')) return inferConvertRatioCompareToRatiosRule(arr, last);
    if (arr.every(d => d.kind === 'cont')) return inferToRatiosRule(arr, last);
    return null;
  }
  else if (a.kind === "eval-option" || b.kind === "eval-option") {
    if (a.kind === "eval-option") {
      return b.kind == "quota" ? inferEvalQuotaRemainderExprRule(b, a) : inferEvalToOptionRule(b, a)
    }
    else if (b.kind === "eval-option") {
      return a.kind == "quota" ? inferEvalQuotaRemainderExprRule(a, b) : inferEvalToOptionRule(a, b)
    }
    else {
      return null
    }
  }
  else if (a.kind === "cont" && b.kind == "cont") {
    if (kind === "comp-diff") return inferToCompareDiffRule(a, b)
    if (kind === "scale" || kind === "scale-invert") return inferToScaleRule(a, b, last)
    if (kind === "slide" || kind === "slide-invert") return infetToSlideRule(a, b, last)
    if (kind === "diff") return inferToDifferenceRule(a, b, last)
    if (kind === "quota") return inferToQuotaRule(a, b)
    if (kind === "delta") return inferToDeltaRule(a, b, last)
    if (kind === "pythagoras") return inferPythagorasRule(a, b, last)
    if (kind === "triangle-angle") return inferTriangleAngleRule(a, b, last)
    if (kind === "rate") return inferToRateRule(a, b, last)
    if (kind === "ratios") return inferToRatiosRule([a, b], last)
    if (kind === "comp-ratio") return inferToRatioCompareRule(a, b, last)
    if (kind === "ratio") return inferToPartWholeRatio(a, b, last)
    if (kind === "linear-equation") return inferSolveEquationRule(a, b, last)
    return inferToCompareRule(a, b)
  }
  else if (a.kind === "comp-ratio" && b.kind === "comp-ratio" && kind === "ratios") {
    return inferConvertRatioCompareToRatiosRule([a, b], last)
  }
  else if ((a.kind === "comp-ratio" || a.kind === "cont") && b.kind === "simplify-expr") {
    return inferSimplifyExprRule(a, b)
  }
  else if (a.kind === "simplify-expr" && (b.kind === "comp-ratio" || b.kind === "cont")) {
    return inferSimplifyExprRule(b, a)
  }
  else if (a.kind === "cont" && (b.kind === "eval-expr" || b.kind === "eval-formula")) {
    return inferEvalToQuantityRule([a], b)
  }
  else if ((a.kind === "eval-expr" || a.kind === "eval-formula") && b.kind === "cont") {
    return inferEvalToQuantityRule([b], a)
  }
  else if (a.kind === "rate" && b.kind === "rate" && last?.kind === "ratios") {
    return inferToRatiosRule([a, b], last)
  }
  else if (a.kind === "rate" && b.kind === "rate" && last?.kind === "linear-equation") {
    return inferSolveEquationRule(a, b, last)
  }
  else if (a.kind === "rate" && b.kind === "rate" && last?.kind === "rate") {
    return inferTrasitiveRateRule(a, b, last)
  }

  else if ((a.kind === "cont" || a.kind === "comp") && b.kind === "unit") {
    return inferConvertToUnitRule(a, b);
  }
  else if (a.kind === "unit" && (b.kind === "cont" || b.kind === "comp")) {
    return inferConvertToUnitRule(b, a);
  }
  else if ((a.kind === "cont") && b.kind === "round") {
    return inferRoundToRule(a, b);
  }
  else if (a.kind === "round" && (b.kind === "cont")) {
    return inferRoundToRule(b, a);
  }
  else if (a.kind === "cont" && b.kind === "comp-angle") {
    return inferAngleCompareRule(a, b);
  }
  else if (a.kind === "comp-angle" && b.kind === "cont") {
    return inferAngleCompareRule(b, a);
  }
  else if (a.kind === "convert-percent" && b.kind === "ratio") {
    return inferTogglePartWholeAsPercentRule(b)
  }
  else if (a.kind === "ratio" && b.kind === "convert-percent") {
    return inferTogglePartWholeAsPercentRule(a)
  }
  else if (a.kind === "ratio" && b.kind === "ratio") {
    return kind === 'diff'
      ? inferToDifferenceAsRatioRule(a, b, last)
      : kind === "comp-ratio"
        ? inferToPartWholeCompareRule(a, b)
        : inferTransitiveRatioRule(a, b)
  }
  else if (a.kind === "comp" && b.kind === "cont") {

    return kind === "comp-part-eq" ? inferPartEqualRule(a, b) : inferCompareRule(b, a);
  }
  else if (a.kind === "cont" && b.kind === "comp") {

    return kind === "comp-part-eq" ? inferPartEqualRule(b, a) : inferCompareRule(a, b);
  }
  else if ((a.kind === "cont" || a.kind === "quota" || a.kind === "rate") && b.kind == "rate") {
    return inferRateRule(a, b)
  }
  else if (a.kind === "rate" && (b.kind == "cont" || b.kind === "quota" || b.kind === "rate")) {
    return inferRateRule(b, a)
  }
  else if (a.kind === "comp" && b.kind == "comp-ratio") {
    return kind === "comp" ? inferTransitiveCompareRule(a, b) : inferRatioCompareToCompareRule(b, a, kind === "nth-part" && last)
  }
  else if (a.kind === "comp-ratio" && b.kind == "comp") {
    return kind === "comp" ? inferTransitiveCompareRule(b, a) : inferRatioCompareToCompareRule(a, b, kind === "nth-part" && last)
  }
  else if (a.kind === "comp" && b.kind == "ratios") {
    return inferCompRatiosToCompRule(b, a, kind === "nth-part" && last)
  }
  else if (a.kind === "ratios" && b.kind == "comp") {
    return inferCompRatiosToCompRule(a, b, kind === "nth-part" && last)
  }
  else if (a.kind === "ratios-invert" && b.kind == "ratios") {
    return inferInvertRatiosRule(b, a)
  }
  else if (a.kind === "ratios" && b.kind == "ratios-invert") {
    return inferInvertRatiosRule(a, b)
  }
  else if (a.kind === "reverse" && b.kind == "ratios") {
    return inferReverseRatiosRule(b, a)
  }
  else if (a.kind === "ratios" && b.kind == "reverse") {
    return inferReverseRatiosRule(a, b)
  }
  else if (a.kind === "proportion" && b.kind == "ratios") {
    return inferProportionTwoPartRatioRule(b, a)
  }
  else if (a.kind === "ratios" && b.kind == "proportion") {
    return inferProportionTwoPartRatioRule(a, b)
  }
  else if (a.kind === "proportion" && b.kind == "comp-ratio") {
    return inferProportionRule(b, a)
  }
  else if (a.kind === "comp-ratio" && b.kind == "proportion") {
    return inferProportionRule(a, b)
  }
  else if (a.kind === "cont" && b.kind == "quota") {
    return kind === "rate" ? inferToRateRule(a, b, last) : inferQuotaRule(a, b)
  }
  else if (a.kind === "quota" && b.kind == "cont") {
    return kind === "rate" ? inferToRateRule(b, a, last) : inferQuotaRule(b, a)
  }
  else if (a.kind === "comp-ratio" && (b.kind === "cont" || b.kind === "rate")) {
    return inferRatioCompareRule(b, a, kind === "nth-part" && last);
  }
  else if ((a.kind === "cont" || a.kind === "rate") && b.kind === "comp-ratio") {
    return inferRatioCompareRule(a, b, kind === "nth-part" && last);
  }
  else if (a.kind === "comp-ratio" && b.kind === "convert-percent") {
    return inferConvertPercentRule(a);
  }
  else if (a.kind === "convert-percent" && b.kind === "comp-ratio") {
    return inferConvertPercentRule(b);
  }
  else if (a.kind === "complement-comp-ratio" && b.kind === "ratio") {
    return inferConvertPartWholeToRatioCompareRule(b, a);
  }
  else if (a.kind === "ratio" && b.kind === "complement-comp-ratio") {
    return inferConvertPartWholeToRatioCompareRule(a, b);
  }
  else if (a.kind === "comp-ratio" && b.kind === "ratio") {
    return b.ratio == null ? inferConvertRatioCompareToRatioRule(a) : inferPartWholeCompareRule(a, b);
  }
  else if (a.kind === "ratio" && b.kind === "comp-ratio") {
    return a.ratio == null ? inferConvertRatioCompareToRatioRule(b) : inferPartWholeCompareRule(b, a);
  }
  else if (a.kind === "comp-ratio" && b.kind === "ratios") {
    return a.ratio == null ? inferConvertTwoPartRatioToRatioCompareRule(b, a) : inferConvertRatioCompareToTwoPartRatioRule(a, b, kind === "ratios-base" && last);
  }
  else if (a.kind === "ratios" && b.kind === "comp-ratio") {
    return b.ratio == null ? inferConvertTwoPartRatioToRatioCompareRule(a, b) : inferConvertRatioCompareToTwoPartRatioRule(b, a, kind === "ratios-base" && last);
  }
  else if (a.kind === "comp-ratio" && b.kind === "invert-comp-ratio") {
    return inferInvertRatioCompareRule(a);
  }
  else if (a.kind === "invert-comp-ratio" && b.kind === "comp-ratio") {
    return inferInvertRatioCompareRule(b);
  }
  else if (a.kind === "comp-ratio" && b.kind === "comp-ratio") {
    return kind === "diff" ? inferToDifferenceAsRatioRule(a, b, last) : inferTransitiveRatioCompareRule(a, b)
  }
  else if (a.kind === "cont" && b.kind === "ratio") {
    return inferPartToWholeRule(a, b);
  }
  else if (a.kind === "ratio" && b.kind === "cont") {
    return inferPartToWholeRule(b, a);
  }
  else if (a.kind === "complement" && b.kind === "ratio") {
    return inferPartWholeComplementRule(a, b);
  }
  else if (a.kind === "ratio" && b.kind === "complement") {
    return inferPartWholeComplementRule(b, a);
  }
  // else if (a.kind === "complement" && b.kind === "ratio") {
  //   return ratioConvertRule(a, b);
  // }
  // else if (a.kind === "ratio" && b.kind === "complement") {
  //   return ratioConvertRule(b, a);
  // }
  else if (a.kind === "nth-part" && b.kind === "ratios") {
    return kind === "ratio" ? inferConvertPartToPartToPartWholeRule(a, b, last) : null;
  }
  else if (a.kind === "ratios" && b.kind === "nth-part") {
    return kind === "ratio" ? inferConvertPartToPartToPartWholeRule(b, a, last) : null;
  }
  else if (a.kind === "rate" && b.kind == "ratios") {
    if (kind === "nth-factor") {
      return inferNthPartFactorByRule(b, a, last)
    }
    else if (kind === "nth-scale") {
      return inferNthPartScaleByRule(b, a, last)
    }
    else {
      return inferPartToPartRule(a, b, kind === "nth-part" && last)
    }

  }
  else if (a.kind === "ratios" && b.kind == "rate") {
    if (kind === "nth-factor") {
      return inferNthPartFactorByRule(a, b, last);
    }
    else if (kind === "nth-scale") {
      return inferNthPartScaleByRule(a, b, last);
    }
    else {
      return inferPartToPartRule(b, a, kind === "nth-part" && last)
    }
  }
  else if (a.kind === "cont" && b.kind == "balanced-partition") {
    return inferBalancedPartitionRule(a, b, kind === "nth-part" && last)
  }
  else if (a.kind === "balanced-partition" && b.kind == "cont") {
    return inferBalancedPartitionRule(b, a, kind === "nth-part" && last)
  }
  else if (a.kind === "cont" && b.kind == "ratios") {
    return kind === "scale"
      ? inferMapRatiosByFactorRule(b, a)
      : kind === "scale-invert"
        ? inferMapRatiosByFactorRule(b, a, true)
        : kind === "nth-factor"
          ? inferNthPartFactorByRule(b, a, last)
          : kind === "nth-part"
            ? inferPartToPartRule(a, b, last) : inferPartToPartRule(a, b);
  }
  else if (a.kind === "ratios" && b.kind == "cont") {
    return kind === "scale"
      ? inferMapRatiosByFactorRule(a, b)
      : kind === "scale-invert"
        ? inferMapRatiosByFactorRule(a, b, true)
        : kind === "nth-factor"
          ? inferNthPartFactorByRule(a, b, last)
          : kind === "nth-part"
            ? inferPartToPartRule(b, a, last) : inferPartToPartRule(b, a);


  }
  else if (a.kind === "cont" && b.kind === "comp-diff") {
    return inferCompareDiffRule(a, b);
  }
  else if (a.kind === "comp-diff" && b.kind === "cont") {
    return inferCompareDiffRule(b, a);
  }
  else if (a.kind === "sequence" && b.kind === "cont") {
    return kind === "nth" ? inferNthPositionRule(b, a, last.entity) : inferNthTermRule(b, a);
  }
  else if (a.kind === "cont" && b.kind === "sequence") {
    return kind === "nth" ? inferNthPositionRule(a, b, last.entity) : inferNthTermRule(a, b);
  }
  else if (a.kind === "pattern" && b.kind === "cont") {
    return kind === "nth" ? inferNthPositionRule(b, a, last.entity) : inferNthTermRule(b, a);
  }
  else if (a.kind === "cont" && b.kind === "pattern") {
    return kind === "nth" ? inferNthPositionRule(a, b, last.entity) : inferNthTermRule(a, b);
  }
  else if (a.kind === "cont" && b.kind === "transfer") {
    return inferTransferRule(a, b, "after")
  }
  else if (a.kind === "transfer" && b.kind === "cont") {
    return inferTransferRule(b, a, "before")
  }
  else if (a.kind === "cont" && b.kind === "delta") {
    return inferDeltaRule(a, b, "after")
  }
  else if (a.kind === "delta" && b.kind === "cont") {
    return inferDeltaRule(b, a, "before")
  }
  else if (a.kind === "comp" && b.kind === "delta") {
    return inferConvertCompareToDeltaRule(a, b)
  }
  else if (a.kind === "delta" && b.kind === "comp") {
    return inferConvertDeltaToCompareRule(a, b)
  }
  else if (a.kind === "comp" && b.kind === "comp") {
    return inferCompareToRateRule(b, a, kind === "rate" && last)
  }
  else {
    return null;
  }
}
//#endregion

// #region Math utility functions
function abs(v: number) {
  return Math.abs(v);
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

function ratiosToBaseForm(ratios) {
  // Get denominators by converting decimals to fractions
  let precision = 1e6; // adjust if higher precision needed
  let nums = ratios.map(r => Math.round(r * precision));

  // Find GCD
  function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
  }
  let overallGCD = nums.reduce((a, b) => gcd(a, b));

  // Divide all by GCD
  return nums.map(v => v / overallGCD);
}

// #endregion

// #region Angle utils
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

// #endregion

// #region Sequence utils

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
// #endregion

// #region Utility functions

function isEntityBase(value: EntityDef): value is EntityBase {
  return (value as any).entity != null;
}
function toEntity(entity: EntityDef): EntityBase {
  return isEntityBase(entity) ? entity : { entity }
}
function isSameEntity(f: EntityBase, s: EntityBase) {
  return f.entity == s.entity && f.unit == s.unit
}

function extractKinds(...args: Predicate[]): PredicateKind[] {
  return args.filter(d => d != null).map(d => d.kind as unknown as PredicateKind)
}

export function isNumber(quantity: NumberOrExpression | NumberOrVariable): quantity is number {
  return typeof quantity === "number";
}
export function isExpressionNode(quantity: NumberOrExpression | NumberOrVariable): quantity is ExpressionNode {
  return (quantity as any)?.expression != null;
}
export function areNumbers(ratios: NumberOrExpression[]): ratios is number[] {
  return ratios.every(d => isNumber(d))
}
export function areTupleNumbers(ratios: NumberOrExpression[][]): ratios is number[][] {
  return ratios.every(d => d.every(d => isNumber(d)))
}

function wrapToQuantity(expression: string, context?: ExpressionContext): Quantity {
  //return evaluate(expression, context);    
  return { expression, context: convertContext(context) };
}
function wrapToRatio(expression: string, context?: ExpressionContext): Ratio {
  //return evaluate(expression, context);
  return { expression, context: convertContext(context) };
}
function convertContext(context: ExpressionContext) {
  //return context;
  return Object.fromEntries(Object.entries(context).map(([key, value]) => [key, convertRatioKeysToFractions(value)])) as ExpressionContext;
}
function convertRatioKeysToFractions(obj: any) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, key === "ratio" ? helpers.convertToFraction(value as number) : value]))
}

function formatNumber(d: number) {
  return d.toLocaleString("cs-CZ", { maximumFractionDigits: 6, minimumFractionDigits: 0 })
}

function formatRatio(d: number, asPercent?: boolean) {
  if (asPercent) return `${formatNumber(d * 100)} %`;
  return helpers.convertToFraction(d) as string;
  //return (d > -2 && d < 2) ? helpers.convertToFraction(d) as string : formatNumber(d)
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

function formatEntity(d: EntityBase) {
  return (d.entity || d.unit) ? `(${[d.unit, d.entity].filter(d => d != null && d != "").join(" ")})` : ''
}
function resultAsQuestion<T extends Predicate>(result: T, { name, inputParamters }: { name: string, inputParamters: PredicateKind[] }): Question<T> {
  return {
    name,
    inputParameters: inputParamters,
    question: '',
    result,
    options: []
  }
}


function formatOrder(order: number) {
  switch (order) {
    case 1:
      return "jednotky"
    case 10:
      return "desítky"
    case 100:
      return "stovky"
    case 1000:
      return "tisíce"
    default:
      return order
  }
}
function getAgentName(agent: AgentNames, transferOrder: "after" | "before") {
  const name = transferOrder === "before" ? agent.nameBefore : agent.nameAfter;
  return name ?? agent.name;
}

// #endregion

// #region Generic utils
export function range(size, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt);
}
const unique = (value, index, array) => array.indexOf(value) === index;
// #endregion


// #region Common formula

export type Formula<T> = {
  name: string
  formula: T
}
export const formulaRegistry = {
  circumReference: {
    square: {
      name: 'Obvod čtverce',
      description: 'Vypočítá obvod čtverce ze strany a, nebo stranu z obvodu.',
      params: ['o', 'a'],
      formula: {
        'o': '4 * a',
        'a': 'o / 4',
      },
    },
    rectangle: {
      name: 'Obvod obdélníku',
      description: 'Vypočítá obvod obdélníku ze stran a, b nebo neznámou stranu.',
      params: ['o', 'a', 'b'],
      formula: {
        'o': '2 * (a + b)',
        'a': '(o / 2) - b',
        'b': '(o / 2) - a',
      },
    },
    circle: {
      name: 'Obvod kruhu (délka kružnice)',
      description: 'Vypočítá obvod kruhu z poloměru nebo průměru.',
      params: ['o', 'r', 'd'],
      formula: {
        'o': '2 * π * r',
        'r': 'o / (2 * π)',
        'd': 'o / π',
      },
    },
  },
  surfaceArea: {
    circle: {
      name: 'Obsah kruhu',
      description: 'Vzorce pro obsah kruhu',
      params: ['S', 'o', 'r', 'd'],
      formula: {
        'S': 'π * r^2',
        'r': 'sqrt(S / π)', // Poloměr z obsahu
        'd': '2 * sqrt(S / π)',
      },
    },
    square: {
      name: 'Obsah čtverce',
      description: 'Vypočítá obsah čtverce ze strany a, nebo stranu z obsahu.',
      params: ['S', 'a'],
      formula: {
        'S': 'a^2',
        'a': 'sqrt(S)',
      },
    },
    rectangle: {
      name: 'Obsah obdélníku',
      description: 'Vypočítá obsah obdélníku ze stran a, b nebo neznámou stranu.',
      params: ['S', 'a', 'b'],
      formula: {
        'S': 'a * b',
        'a': 'S / b',
        'b': 'S / a',
      },
    },
    triangle: {
      name: 'Obsah trojúhelníku',
      description: 'Obsah z délky základny a výšky.',
      params: ['S', 'b', 'h'],
      formula: {
        'S': '1/2 * b * h',
        'b': '2 * S / h',
        'h': '2 * S / b',
      },
    },
    cube: {
      name: 'Povrch krychle',
      description: 'Vypočítá povrch krychle ze strany a.',
      params: ['S', 'a'],
      formula: {
        'S': '6 * a^2',
        'a': 'sqrt(S / 6)',
      },
    },
    cuboid: {
      name: 'Povrch kvádru',
      description: 'Vypočítá povrch kvádru ze stran a, b a c.',
      params: ['S', 'a', 'b', 'c'],
      formula: {
        'S': '2 * (a * b + a * c + b * c)',
        // Řešení pro neznámou stranu je složitější, ale lze ho přesto definovat:
        'a': '(S - 2 * b * c) / (2 * (b + c))',
        'b': '(S - 2 * a * c) / (2 * (a + c))',
        'c': '(S - 2 * a * b) / (2 * (a + b))',
      },
    },
    cylinder: {
      name: 'Povrch válce',
      description: 'Vypočítá povrch válce z poloměru r a výšky v.',
      params: ['S', 'r', 'v'],
      formula: {
        'S': '2 * π * r * (r + v)',
        'v': 'S / (2 * π * r) - r',
        // Výpočet poloměru je kvadratická rovnice, pro jednoduchost zde není explicitní
      },
    },
    sphere: {
      name: 'Povrch koule',
      description: 'Vypočítá povrch koule z poloměru r.',
      params: ['S', 'r'],
      formula: {
        'S': '4 * r^2 * π',
        'r': 'sqrt(S / (4 * π))', // Poloměr z povrchu
      },
    },
  },
  // Kategorie vzorců pro objem
  volume: {
    // Formula for a cube
    cube: {
      name: 'Objem krychle',
      formula: {
        'V': 'a * a * a',
        'a': 'V / (a * a)',
      },
      params: ['V', 'a'],
      description: 'Vypočítá objem krychle ze strany a nebo stranu z objemu.',
    },
    // Vzorec pro kvádr
    cuboid: {
      name: 'Objem kvádru',
      description: 'Vypočítá objem kvádru nebo jednu stranu.',
      params: ['V', 'a', 'b', 'c'],
      formula: {
        'V': 'a * b * c',
        'a': 'V / (b * c)',
        'b': 'V / (a * c)',
        'c': 'V / (a * b)',
      },
    },
    // Vzorec pro válec
    cylinder: {
      name: 'Objem válce',
      description: 'Vypočítá objem válce, poloměr nebo výšku.',
      params: ['V', 'r', 'h'],
      formula: {
        'V': 'π * r^2 * h',
        'h': 'V / (π * r^2)',
        'r': 'sqrt(V / (π * h))',
      },
    },
    sphere: {
      name: 'Objem koule',
      description: 'Vypočítá objem koule z poloměru r.',
      params: ['V', 'r'],
      formula: {
        'V': '(4/3) * r^3 * π ',
        'r': 'pow((3 * V) / (4 * π), 1/3)', // Poloměr z objemu (odmocnina třetího stupně)
      },
    },
    // Vzorec pro kvádr
    baseArea: {
      name: 'Objem z podstavy',
      description: 'Vypočítá objem z podstavy.',
      params: ['V', 'S', 'h'],
      formula: {
        'V': 'S * h',
        'h': 'V / S',
        'S': 'V / h',
      },
    },
  },
  // Vzorce pro výpočty v = s/t
  speed: {
    name: 'Rychlost, dráha, čas',
    description: 'Vztah mezi rychlostí, dráhou a časem.',
    params: ['v', 's', 't'],
    formula: {
      's': 'v * t',
      'v': 's / t',
      't': 's / v',
    },
  },
  squareRoot: {
    name: 'Druhá mocnina a odmocnina',
    description: 'Vypočítá druhou mocninu nebo odmocninu.',
    params: ['y', 'x'],
    formula: {
      'y': 'x * x', // Alternativně 'x^2'
      'x': 'sqrt(y)',
    },
  }

}

// #endregion
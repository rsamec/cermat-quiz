// src/components/math.ts
var defaultHelpers = {
  convertToFraction: (d) => d,
  convertToUnit: (d) => d,
  unitAnchor: () => 1,
  solveLinearEquation: (fist, second, variable) => NaN,
  evalExpression: (expression, context) => NaN,
  evalNodeToNumber: (expression) => NaN
};
var helpers = defaultHelpers;
function configure(config) {
  helpers = { ...defaultHelpers, ...config };
}
var EmptyUnit = "";
function dimensionEntity(unit = "cm") {
  return {
    length: { entity: "d\xE9lka", unit },
    area: { entity: "obsah", unit: unit === EmptyUnit ? EmptyUnit : `${unit}2` },
    volume: { entity: "objem", unit: unit === EmptyUnit ? EmptyUnit : `${unit}3` },
    lengths: ["d\xE9lka", unit],
    areas: ["obsah", unit === EmptyUnit ? EmptyUnit : `${unit}2`],
    volumes: ["objem", unit === EmptyUnit ? EmptyUnit : `${unit}3`]
  };
}
var dim = dimensionEntity();
function angleEntity(unit = "deg") {
  return {
    angle: { entity: "\xFAhel", unit },
    angles: ["\xFAhel", unit]
  };
}
function isQuantityPredicate(value) {
  return ["cont", "comp", "transfer", "rate", "comp-diff", "transfer", "quota", "delta", "frequency"].includes(value.kind);
}
function isRatioPredicate(value) {
  return ["ratio", "comp-ratio"].includes(value.kind);
}
function isRatiosPredicate(value) {
  return ["ratios"].includes(value.kind);
}
function isRatePredicate(value) {
  return value.kind === "rate";
}
function isFrequencyPredicate(value) {
  return value.kind === "frequency";
}
function ctor(kind) {
  return { kind };
}
function ctorUnit(unit) {
  return { kind: "unit", unit };
}
function sum(wholeAgent, wholeEntity) {
  return { kind: "sum", wholeAgent, wholeEntity };
}
function ctorRate(agent, baseQuantity = 1) {
  return { kind: "rate", agent, baseQuantity };
}
function counter(agent, quantity, { asRatio } = {}) {
  return { kind: "cont", agent, quantity, entity: "", asRatio };
}
function double() {
  return counter("dvojn\xE1sobek", 2);
}
function doubleProduct(agent) {
  return [double(), product(agent)];
}
function half() {
  return counter("polovina", 1 / 2, { asRatio: true });
}
function halfProduct(agent) {
  return [half(), product(agent)];
}
function product(wholeAgent, partAgents, asEntity) {
  return {
    kind: "product",
    wholeAgent,
    ...asEntity != null && { wholeEntity: toEntity(asEntity) },
    partAgents: partAgents ?? []
  };
}
function ctorRatiosInvert(agent) {
  return { kind: "ratios-invert", agent };
}
function ctorScale(agent) {
  return { kind: "scale", agent };
}
function ctorScaleInvert(agent) {
  return { kind: "scale-invert", agent };
}
function ctorRound(order = 1) {
  return { kind: "round", order };
}
function ctorLinearEquation(agent, entity3, variable = "x") {
  return { kind: "linear-equation", agent, variable, entity: entity3 };
}
function ctorDelta(agent) {
  return { kind: "delta", agent: { name: agent } };
}
function ctorPercent() {
  return { kind: "ratio", asPercent: true };
}
function ctorComparePercent() {
  return { kind: "comp-ratio", asPercent: true };
}
function ctorComplementCompRatio(agent) {
  return { kind: "complement-comp-ratio", agent };
}
function ctorRatios(agent, { useBase } = {}) {
  return { kind: "ratios", whole: agent, useBase };
}
function ctorComplement(part) {
  return { kind: "complement", part };
}
function ctorDifference(differenceAgent) {
  return { kind: "diff", differenceAgent };
}
function ctorSlide(agent) {
  return { kind: "slide", agent };
}
function ctorSlideInvert(agent) {
  return { kind: "slide-invert", agent };
}
function ctorTuple(agent) {
  return { kind: "tuple", agent, items: [] };
}
function cont(agent, quantity, entity3, unit, opts) {
  return { kind: "cont", agent, quantity: opts?.asExpression ? quantity.toString() : quantity, entity: entity3, unit, asRatio: opts?.asFraction };
}
function tuple(agent, items) {
  return { kind: "tuple", agent, items };
}
function evalExprAsCont(expression, agent, entity3, opts = {}) {
  return { kind: "eval-expr", expression, predicate: { kind: "cont", agent, ...entity3, asRatio: opts.asRatio } };
}
function evalExprAsRate(expression, predicate) {
  return { kind: "eval-expr", expression, predicate };
}
function evalFormulaAsCont(f, expression, agent, entity3, opts = {}) {
  return { kind: "eval-formula", expression: expression(f.formula), formulaName: f.name, predicate: { kind: "cont", agent, ...entity3, asRatio: opts.asRatio } };
}
function simplifyExpr(context) {
  return { kind: "simplify-expr", context };
}
function ctorOption(optionValue, expectedValue, expectedValueOptions = { asPercent: false, asFraction: false }) {
  return {
    kind: "eval-option",
    expression: convertToExpression(expectedValue, "closeTo", expectedValueOptions),
    expressionNice: convertToNiceExpression(expectedValue, "equal", { ...expectedValueOptions, asPercent: false }),
    expectedValue,
    expectedValueOptions,
    optionValue,
    compareTo: "closeTo"
  };
}
function option(optionValue) {
  return {
    kind: "eval-option",
    expression: "",
    expressionNice: "",
    value: optionValue
  };
}
function ctorExpressionOption(optionValue, expression) {
  return { kind: "eval-option", expression, expressionNice: expression, optionValue };
}
function ctorHasNoRemainder() {
  return ctorBooleanOption(0, "closeTo", { expectedValueLabel: "zbytek" });
}
function ctorBooleanOption(expectedValue, compareTo = "closeTo", expectedValueOptions = { asPercent: false, asFraction: false }) {
  return {
    kind: "eval-option",
    expression: convertToExpression(expectedValue, compareTo, expectedValueOptions),
    expressionNice: convertToNiceExpression(expectedValue, compareTo == "closeTo" ? "equal" : compareTo, { ...expectedValueOptions, asPercent: false }),
    expectedValue,
    expectedValueOptions,
    compareTo
  };
}
function convertToNiceExpression(expectedValue, compareTo, expectedValueOptions) {
  return convertToExpression(expectedValue, compareTo, expectedValueOptions, expectedValueOptions.expectedValueLabel ?? "zji\u0161t\u011Bn\xE1 hodnota");
}
function convertToExpression(expectedValue, compareTo, expectedValueOptions, variable = "x") {
  const convertedValue = Array.isArray(expectedValue) ? expectedValue : expectedValueOptions.asFraction ? helpers.convertToFraction(expectedValue) : expectedValueOptions.asPercent ? expectedValue / 100 : expectedValue;
  const toCompare = (comp2) => `${variable} ${comp2} ${convertedValue}`;
  switch (compareTo) {
    case "equal":
      return toCompare("==");
    case "greater":
      return toCompare(">");
    case "greaterOrEqual":
      return toCompare("=>");
    case "smaller":
      return toCompare("<");
    case "smallerOrEqual":
      return toCompare("=<");
    default:
      return `closeTo(${variable}, ${convertedValue})`;
  }
}
function comp(agentA, agentB, quantity, entity3) {
  return { kind: "comp", agentA, agentB, quantity, entity: toEntity(entity3).entity, unit: toEntity(entity3).unit };
}
function compAngle(agentA, agentB, relationship) {
  return { kind: "comp-angle", agentA, agentB, relationship };
}
function pythagoras(longestSite, sites) {
  return { kind: "pythagoras", longest: longestSite, sites };
}
function alligation(agent) {
  return { kind: "alligation", agent };
}
function triangleAngle(agent) {
  return { kind: "triangle-angle", agent };
}
function transfer(agentSender, agentReceiver, quantity, entity3) {
  return { kind: "transfer", agentReceiver: toAgentNames(agentReceiver), agentSender: toAgentNames(agentSender), quantity, entity: entity3 };
}
function toAgentNames(agent) {
  return typeof agent === "string" ? { name: agent } : agent;
}
function compRelative(agentA, agentB, ratio2, asPercent) {
  if (ratio2 <= -1 && ratio2 >= 1) {
    throw "Relative compare should be between (-1,1).";
  }
  return { kind: "comp-ratio", agentA, agentB, ratio: 1 + ratio2, asPercent };
}
function compRelativePercent(agentA, agentB, percent2) {
  return compRelative(agentA, agentB, percent2 / 100, true);
}
function compRatio(agentA, agentB, ratio2) {
  return { kind: "comp-ratio", agentA, agentB, ratio: ratio2 };
}
function compPercent(agentA, agentB, percent2) {
  return { kind: "comp-ratio", agentA, agentB, ratio: percent2 / 100, asPercent: true };
}
function compDiff(agentMinuend, agentSubtrahend, quantity, entity3) {
  return { kind: "comp-diff", agentMinuend, agentSubtrahend, quantity, entity: entity3 };
}
function ratio(whole, part, ratio2) {
  return { kind: "ratio", whole, part, ratio: ratio2 };
}
function percent(whole, part, percent2) {
  return { kind: "ratio", whole, part, ratio: percent2 / 100, asPercent: true };
}
function ratios(whole, parts, ratios2) {
  return { kind: "ratios", parts, whole, ratios: ratios2 };
}
function pattern({ nthTerm, nthPosition, nthTermFormat, nthTermDescription }, { entity: entity3, unit }) {
  return {
    kind: "pattern",
    entity: entity3,
    unit,
    nthTerm,
    nthTermDescription,
    nthTermFormat,
    nthPosition
  };
}
function squareNumbersPattern(entity3) {
  return pattern({
    nthPosition: "sqrt(x)",
    nthTerm: "n*n"
  }, entity3);
}
function triangularNumbersPattern(entity3) {
  return pattern({
    nthPosition: "(-1+sqrt(1 + 8*x))/2",
    nthTerm: "n*(n+1)/2",
    nthTermFormat: (n) => range(n, 1).map((d) => d).join(" + ")
  }, entity3);
}
function oblongNumbers(entity3, diff = 1) {
  return pattern({
    nthPosition: diff === 1 ? "(-1+sqrt(1 + 4*x))/2" : "(1+sqrt(1 + 4*x))/2",
    nthTerm: diff === 1 ? "n*(n+1)" : "n*(n-1)",
    nthTermFormat: (n) => range(n, 1).map((d) => d + (d + diff) - 1).join(" + ")
  }, entity3);
}
function balancedEntityPartition(parts, entity3) {
  return {
    kind: "balanced-partition",
    parts,
    entity: entity3
  };
}
function contAngle(agent, quantity, unit = "deg", { asExpression } = {}) {
  return cont(agent, quantity, angleEntity().angle.entity, unit, { asExpression });
}
function contRightAngle(agent) {
  return contAngle(agent ?? "prav\xFD \xFAhel", 90, "deg");
}
function contTringleAngleSum(agent) {
  return contAngle(agent ?? "sou\u010Det \xFAhl\u016F v troj\xFAheln\xEDku", 180, "deg");
}
function contLength(agent, quantity, unit = "cm") {
  return cont(agent, quantity, dimensionEntity().length.entity, unit);
}
function contArea(agent, quantity, unit = "cm2") {
  return cont(agent, quantity, dimensionEntity().area.entity, unit);
}
function circleLength(wholeAgent, unit = "cm") {
  return evalFormulaAsCont(formulaRegistry.circumReference.circle, (x) => x.o, wholeAgent, { entity: dim.length.entity, unit });
}
function squareArea(wholeAgent, unit = "cm2") {
  return evalFormulaAsCont(formulaRegistry.surfaceArea.square, (x) => x.S, wholeAgent, { entity: dim.area.entity, unit });
}
function rectangleArea(wholeAgent, unit = "cm2") {
  return evalFormulaAsCont(formulaRegistry.surfaceArea.rectangle, (x) => x.S, wholeAgent, { entity: dim.area.entity, unit });
}
function triangleArea(wholeAgent, unit = "cm2") {
  return evalFormulaAsCont(formulaRegistry.surfaceArea.triangle, (x) => x.S, wholeAgent, { entity: dim.area.entity, unit });
}
function circleArea(wholeAgent, unit = "cm2") {
  return evalFormulaAsCont(formulaRegistry.surfaceArea.circle, (x) => x.S, wholeAgent, { entity: dim.area.entity, unit });
}
function cubeArea(wholeAgent, unit = "cm2") {
  return evalFormulaAsCont(formulaRegistry.surfaceArea.cube, (x) => x.S, wholeAgent, { entity: dim.area.entity, unit });
}
function cubeVolume(wholeAgent, unit = "cm3") {
  return evalFormulaAsCont(formulaRegistry.volume.cube, (x) => x.V, wholeAgent, { entity: dim.volume.entity, unit });
}
function cuboidVolume(wholeAgent, unit = "cm3") {
  return evalFormulaAsCont(formulaRegistry.volume.cuboid, (x) => x.V, wholeAgent, { entity: dim.volume.entity, unit });
}
function cylinderVolume(wholeAgent, unit = "cm3") {
  return evalFormulaAsCont(formulaRegistry.volume.cylinder, (x) => x.V, wholeAgent, { entity: dim.volume.entity, unit });
}
function baseAreaVolume(wholeAgent, unit = "cm3") {
  return evalFormulaAsCont(formulaRegistry.volume.baseArea, (x) => x.V, wholeAgent, { entity: dim.volume.entity, unit });
}
function productCombine(wholeAgent, wholeEntity, partAgents) {
  return {
    kind: "product-combine",
    wholeAgent,
    partAgents: partAgents ?? [],
    wholeEntity: toEntity(wholeEntity)
  };
}
function lcd(agent, entity3, unit) {
  return { kind: "lcd", agent, entity: entity3, unit };
}
function nth(entity3) {
  return { kind: "nth", entity: entity3 };
}
function nthPart(agent) {
  return { kind: "nth-part", agent };
}
function nthPartFactor(agent) {
  return { kind: "nth-factor", agent };
}
function nthPartScale(agent) {
  return { kind: "nth-scale", agent };
}
function rate(agent, quantity, entity3, entityBase, baseQuantity = 1) {
  return { kind: "rate", agent, quantity, baseQuantity, entity: toEntity(entity3), entityBase: toEntity(entityBase) };
}
function quota(agent, agentQuota, quantity, restQuantity = 0) {
  return { kind: "quota", agent, agentQuota, quantity, restQuantity };
}
function proportion(inverse, entities) {
  return { kind: "proportion", inverse, entities };
}
function primeFactors(numbers) {
  return { kind: "common-sense", description: `rozklad na prvo\u010D\xEDsla:${primeFactorization(numbers).join(",")}` };
}
function commonSense(description) {
  return { kind: "common-sense", description };
}
function compareRule(a, b) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity} `;
  }
  if (a.agent == b.agentB) {
    return {
      kind: "cont",
      agent: b.agentA,
      quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b }),
      entity: a.entity,
      unit: a.unit
    };
  } else if (a.agent == b.agentA) {
    return {
      kind: "cont",
      agent: b.agentB,
      quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + -1 * b.quantity : wrapToQuantity(`a.quantity + -1 * b.quantity`, { a, b }),
      entity: a.entity,
      unit: a.unit
    };
  }
}
function inferCompareRule(a, b) {
  const result = compareRule(a, b);
  return {
    name: compareRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.quantity)} ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? " + " : " - "} ${formatNumber(abs(b.quantity))} `, result: formatNumber(result.quantity), ok: a.agent == b.agentB },
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? " - " : " + "} ${formatNumber(abs(b.quantity))} `, result: formatNumber(result.quantity), ok: a.agent == b.agentA }
    ] : []
  };
}
function angleCompareRule(a, b) {
  return { kind: "cont", agent: a.agent == b.agentB ? b.agentA : b.agentB, quantity: computeOtherAngle(a.quantity, b.relationship), entity: a.entity, unit: a.unit };
}
function inferAngleCompareRule(a, b) {
  const result = angleCompareRule(a, b);
  return {
    name: angleCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypo\u010Dti ${a.agent == b.agentB ? b.agentA : b.agentB}? ${b.agentA} je ${formatAngle(b.relationship)} k ${b.agentB}.`,
    result,
    options: isNumber(result.quantity) ? [
      { tex: `90 - ${a.quantity} `, result: formatNumber(result.quantity), ok: b.relationship == "complementary" },
      { tex: `180 - ${a.quantity} `, result: formatNumber(result.quantity), ok: b.relationship == "supplementary" || b.relationship == "sameSide" },
      { tex: `${a.quantity}`, result: formatNumber(result.quantity), ok: b.relationship != "supplementary" && b.relationship != "complementary" && b.relationship != "sameSide" }
    ] : []
  };
}
function toPartWholeCompareRule(a, b) {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole} `;
  }
  return {
    kind: "comp-ratio",
    agentB: b.part,
    agentA: a.part,
    ratio: isNumber(a.ratio) && isNumber(b.ratio) ? a.ratio / b.ratio : wrapToRatio(`a.ratio / b.ratio`, { a, b })
  };
}
function inferToPartWholeCompareRule(a, b) {
  const result = toPartWholeCompareRule(a, b);
  return {
    name: toPartWholeCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${result.agentA} a ${result.agentB}. Kolikr\xE1t? `,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) ? [
      {
        tex: `${formatRatio(a.ratio)} / ${formatRatio(b.ratio)}`,
        result: formatRatio(a.ratio / b.ratio),
        ok: true
      },
      { tex: `${formatRatio(b.ratio)} / ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio / a.ratio), ok: false }
    ] : []
  };
}
function partWholeCompareRule(b, a) {
  if (!(a.part == b.agentA || a.part == b.agentB)) {
    throw `Mismatch agent ${a.part} any of ${b.agentA}, ${b.agentB}`;
  }
  if (a.part == b.agentB) {
    return {
      kind: "ratio",
      whole: a.whole,
      part: b.agentA,
      ratio: isNumber(a.ratio) && isNumber(b.ratio) ? b.ratio >= 0 ? a.ratio * b.ratio : a.ratio / abs(b.ratio) : wrapToRatio(`b.ratio >= 0 ? a.ratio * b.ratio : a.ratio / abs(b.ratio)`, { a, b })
    };
  } else if (a.part == b.agentA) {
    return {
      kind: "ratio",
      whole: a.whole,
      part: b.agentB,
      ratio: isNumber(a.ratio) && isNumber(b.ratio) ? b.ratio > 0 ? a.ratio / b.ratio : a.ratio * abs(b.ratio) : wrapToRatio(`b.ratio > 0 ? a.ratio / b.ratio : a.ratio * abs(b.ratio)`, { a, b })
    };
  }
}
function inferPartWholeCompareRule(b, a) {
  const result = partWholeCompareRule(b, a);
  return {
    name: partWholeCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.ratio)} ${a.part == b.agentB ? b.agentA : b.agentB}?`,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) ? [
      { tex: `${formatRatio(a.ratio)} * ${formatRatio(abs(b.ratio))}`, result: formatRatio(a.ratio * b.ratio), ok: a.part == b.agentB && b.ratio >= 0 || a.part == b.agentA && b.ratio < 0 },
      { tex: `${formatRatio(a.ratio)} / ${formatRatio(abs(b.ratio))}`, result: formatRatio(a.ratio / b.ratio), ok: a.part == b.agentA && b.ratio >= 0 || a.part == b.agentB && b.ratio < 0 }
    ] : []
  };
}
function transitiveRatioCompareRule(a, b) {
  if (a.agentB === b.agentA) {
    return {
      kind: "comp-ratio",
      agentA: a.agentA,
      agentB: b.agentB,
      ratio: isNumber(a.ratio) && isNumber(b.ratio) ? abs(a.ratio) * abs(b.ratio) : wrapToRatio(`abs(a.ratio) * abs(b.ratio)`, { a, b })
    };
  } else if (a.agentB === b.agentB) {
    return {
      kind: "comp-ratio",
      agentA: a.agentA,
      agentB: b.agentA,
      ratio: isNumber(a.ratio) && isNumber(b.ratio) ? abs(a.ratio) * 1 / abs(b.ratio) : wrapToRatio(`abs(a.ratio) * 1 / abs(b.ratio)`, { a, b })
    };
  } else if (a.agentA === b.agentA) {
    return {
      kind: "comp-ratio",
      agentA: a.agentB,
      agentB: b.agentB,
      ratio: isNumber(a.ratio) && isNumber(b.ratio) ? 1 / abs(a.ratio) * abs(b.ratio) : wrapToRatio(`1 / abs(a.ratio) * abs(b.ratio)`, { a, b })
    };
  } else if (a.agentA === b.agentB) {
    return {
      kind: "comp-ratio",
      agentA: a.agentB,
      agentB: b.agentA,
      ratio: isNumber(a.ratio) && isNumber(b.ratio) ? 1 / abs(a.ratio) * 1 / abs(b.ratio) : wrapToRatio(`1 / abs(a.ratio) * 1 / abs(b.ratio)`, { a, b })
    };
  } else {
    throw `Mismatch agent ${a.agentA}, ${a.agentB} any of ${b.agentA}, ${b.agentB}`;
  }
}
function inferTransitiveRatioCompareRule(b, a) {
  const result = transitiveRatioCompareRule(b, a);
  return {
    name: transitiveRatioCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${result.agentA} a ${result.agentB}?`,
    result,
    options: []
  };
}
function convertRatioCompareToRatioRule(b) {
  if (!isNumber(b.ratio)) {
    throw "convertRatioCompareToRatioRule does not non quantity";
  }
  const whole = b.ratio > 1 ? b.agentA : b.agentB;
  return { kind: "ratio", whole, part: whole == b.agentB ? b.agentA : b.agentB, ratio: whole == b.agentA ? abs(b.ratio) : abs(1 / b.ratio) };
}
function inferConvertRatioCompareToRatioRule(b) {
  const result = convertRatioCompareToRatioRule(b);
  if (!isNumber(b.ratio) || !isNumber(result.ratio)) {
    throw "convertRatioCompareToRatioRule does not support expressions";
  }
  return {
    name: convertRatioCompareToRatioRule.name,
    inputParameters: extractKinds(b),
    question: `Vyj\xE1d\u0159i ${result.part} jako \u010D\xE1st z ${result.whole}?`,
    result,
    options: isNumber(result.ratio) ? [
      { tex: `${formatRatio(abs(b.ratio))}`, result: formatRatio(result.ratio), ok: result.whole == b.agentA },
      { tex: `1 / ${formatRatio(abs(b.ratio))}`, result: formatRatio(result.ratio), ok: result.whole == b.agentB }
    ] : []
  };
}
function convertRatioCompareToTwoPartRatioRule(b, a) {
  if (!isNumber(b.ratio)) {
    throw "convertToPartToPartRatios does not non quantity";
  }
  return { kind: "ratios", whole: a.whole, parts: [b.agentA, b.agentB], ratios: [abs(b.ratio), 1] };
}
function inferConvertRatioCompareToTwoPartRatioRule(b, a, last2) {
  const tempResult = convertRatioCompareToTwoPartRatioRule(b, a);
  if (!isNumber(b.ratio) || !areNumbers(tempResult.ratios)) {
    throw "convertToPartToPartRatios does not support expressions";
  }
  const result = {
    ...tempResult,
    ratios: last2 != null ? ratiosToBaseForm(tempResult.ratios) : tempResult.ratios
  };
  return {
    name: convertRatioCompareToTwoPartRatioRule.name,
    inputParameters: extractKinds(b),
    question: `Vyj\xE1d\u0159i pom\u011Brem \u010D\xE1st\xED ${[b.agentA, b.agentB].join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `(${formatRatio(abs(b.ratio))}) v pom\u011Bru k 1`, result: result.ratios.map((d) => formatRatio(d)).join(":"), ok: true },
      { tex: `(1 / ${formatRatio(abs(b.ratio))}) v pom\u011Bru k 1`, result: result.ratios.map((d) => formatRatio(d)).join(":"), ok: false }
    ] : []
  };
}
function convertRatioCompareToRatiosRule(arr, a) {
  const numbers = arr.map((d) => d.ratio);
  if (!areNumbers(numbers)) {
    throw "convertRatioCompareToRatiosRule does not non quantity";
  }
  return { kind: "ratios", whole: a.whole, parts: arr.map((d) => d.agentA).concat(arr[0].agentB), ratios: numbers.map((d) => abs(d)).concat(1) };
}
function inferConvertRatioCompareToRatiosRule(arr, a, last2) {
  const numbers = arr.map((d) => d.ratio);
  const tempResult = convertRatioCompareToRatiosRule(arr, a);
  if (!areNumbers(numbers) || !areNumbers(tempResult.ratios)) {
    throw "convertRatioCompareToRatiosRule does not support expressions";
  }
  const result = {
    ...tempResult,
    ratios: last2 != null ? ratiosToBaseForm(tempResult.ratios) : tempResult.ratios
  };
  return {
    name: convertRatioCompareToRatiosRule.name,
    inputParameters: [],
    question: `Vyj\xE1d\u0159i pom\u011Brem \u010D\xE1st\xED ${tempResult.parts.join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `(${numbers.map((d) => formatRatio(abs(d)))}) v pom\u011Bru k 1`, result: result.ratios.map((d) => formatRatio(d)).join(":"), ok: true },
      { tex: `(1 / ${numbers.map((d) => formatRatio(abs(d)))}) v pom\u011Bru k 1`, result: result.ratios.map((d) => formatRatio(d)).join(":"), ok: false }
    ] : []
  };
}
function convertToUnitRule(a, b) {
  if (a.unit == null) {
    throw `Missing unit ${a.kind === "cont" ? a.agent : `${a.agentA} to ${a.agentB}`} a ${a.entity}`;
  }
  if (!isNumber(a.quantity)) {
    throw "convertToUnit does not support expressions";
  }
  return { ...a, quantity: helpers.convertToUnit(a.quantity, a.unit, b.unit), unit: b.unit };
}
function inferConvertToUnitRule(a, b) {
  const result = convertToUnitRule(a, b);
  if (!isNumber(a.quantity) || !isNumber(result.quantity)) {
    throw "convertToUnit does not support expressions";
  }
  const destination = helpers.unitAnchor(a.unit);
  const origin = helpers.unitAnchor(b.unit);
  const convertFactor = destination >= origin ? destination / origin : origin / destination;
  return {
    name: convertToUnitRule.name,
    inputParameters: extractKinds(a, b),
    question: `P\u0159eve\u010F ${formatNumber(a.quantity)} ${formatEntity(a)} na ${b.unit}.`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(convertFactor)}`, result: formatNumber(result.quantity), ok: destination >= origin },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(convertFactor)}`, result: formatNumber(result.quantity), ok: destination < origin }
    ]
  };
}
function roundToRule(a, b) {
  const order = b.order ?? 1;
  if (order <= 0) {
    throw new Error("Order must be positive");
  }
  return {
    ...a,
    quantity: isNumber(a.quantity) ? Math.round(a.quantity / order) * order : wrapToQuantity(`round ${a.quantity}`, { a, b })
    //@TODO - fix usage of the b.order in expression
  };
}
function inferRoundToRule(a, b) {
  const result = roundToRule(a, b);
  return {
    name: roundToRule.name,
    inputParameters: extractKinds(a, b),
    question: isNumber(a.quantity) ? `Zaokrouhli ${formatNumber(a.quantity)} ${formatEntity(a)} na ${formatOrder(b.order)}.` : `Zaokrouhli na ${formatOrder(b.order)}.`,
    result,
    options: isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} `, result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function computeQuantityByRatioBase(a, b) {
  return isNumber(a.quantity) && isNumber(b.ratio) ? b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / abs(b.ratio) : isNumber(b.ratio) ? b.ratio >= 0 ? wrapToQuantity(`a.quantity * b.ratio`, { a, b }) : wrapToQuantity(`a.quantity / abs(b.ratio)`, { a, b }) : wrapToQuantity(`b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / abs(b.ratio)`, { a, b });
}
function computeQuantityByRatioPart(a, b) {
  return isNumber(a.quantity) && isNumber(b.ratio) ? b.ratio > 0 ? a.quantity / b.ratio : a.quantity * abs(b.ratio) : isNumber(b.ratio) ? b.ratio > 0 ? wrapToQuantity(`a.quantity / b.ratio`, { a, b }) : wrapToQuantity(`a.quantity * abs(b.ratio)`, { a, b }) : wrapToQuantity(`b.ratio > 0 ? a.quantity / b.ratio : a.quantity * abs(b.ratio)`, { a, b });
}
function ratioCompareRule(a, b, nthPart2) {
  let result;
  if (a.agent == b.agentB || a.entity == b.agentB) {
    result = {
      agent: a.agent == b.agentB ? b.agentA : a.agent,
      entity: a.entity == b.agentB ? b.agentA : a.entity,
      quantity: computeQuantityByRatioBase(a, b)
    };
  } else if (a.agent == b.agentA || a.entity == b.agentA) {
    result = {
      agent: a.agent == b.agentA ? b.agentB : a.agent,
      entity: a.entity == b.agentA ? b.agentB : a.entity,
      quantity: computeQuantityByRatioPart(a, b)
    };
  } else if (b.agentA == nthPart2?.agent) {
    result = {
      agent: b.agentA,
      quantity: isNumber(a.quantity) && isNumber(b.ratio) ? a.quantity / (abs(b.ratio) + 1) * abs(b.ratio) : wrapToQuantity(`a.quantity / (abs(b.ratio) + 1) * abs(b.ratio)`, { a, b })
    };
  } else {
    result = {
      agent: b.agentB,
      quantity: isNumber(a.quantity) && isNumber(b.ratio) ? a.quantity / (Math.abs(b.ratio) + 1) : wrapToQuantity(`a.quantity / (abs(b.ratio) + 1)`, { a, b })
    };
  }
  return { ...a, ...result };
}
function inferRatioCompareRule(a, b, nthPart2) {
  const result = ratioCompareRule(a, b, nthPart2);
  return {
    name: ratioCompareRule.name,
    inputParameters: extractKinds(a, b, nthPart2),
    question: `${computeQuestion(result.quantity)} ${result.agent} ${result.kind === "rate" ? formatEntity(result.entity) : formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.ratio) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(abs(b.ratio))} `, result: formatNumber(a.quantity * b.ratio), ok: [a.agent, a.entity].includes(b.agentB) && b.ratio >= 0 || [a.agent, a.entity].includes(b.agentA) && b.ratio < 0 },
      {
        tex: `${formatNumber(a.quantity)} / ${formatRatio(abs(b.ratio))}`,
        result: formatNumber(a.quantity / b.ratio),
        ok: [a.agent, a.entity].includes(b.agentA) && b.ratio >= 0 || [a.agent, a.entity].includes(b.agentB) && b.ratio < 0
      },
      { tex: `${formatNumber(a.quantity)} / (${formatRatio(abs(b.ratio))} + 1)`, result: formatNumber(result.quantity), ok: ![a.agent, a.entity].includes(b.agentA) && ![a.agent, a.entity].includes(b.agentB) && b.agentA !== nthPart2?.agent },
      { tex: `${formatNumber(a.quantity)} / (${formatRatio(abs(b.ratio))} + 1) * ${formatRatio(abs(b.ratio))}`, result: formatNumber(result.quantity), ok: b.agentA == nthPart2?.agent }
    ] : []
  };
}
function transferRule(a, b, transferOrder) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const plus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b });
  const minus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b });
  const quantity = transferOrder === "before" ? a.agent == b.agentSender.name ? plus : minus : a.agent == b.agentSender.name ? minus : plus;
  const newAgent = a.agent === b.agentReceiver.name ? getAgentName(b.agentReceiver, transferOrder) : a.agent == b.agentSender.name ? getAgentName(b.agentSender, transferOrder) : a.agent;
  return { kind: "cont", agent: newAgent, quantity, entity: a.entity };
}
function inferTransferRule(a, b, transferOrder) {
  const result = transferRule(a, b, transferOrder);
  return {
    name: transferRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.quantity)} ${a.agent}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${transferOrder === "before" && a.agent == b.agentSender.name ? " + " : " - "} ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentSender.name },
      { tex: `${formatNumber(a.quantity)} ${transferOrder !== "before" && a.agent == b.agentSender.name ? " - " : " + "} ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentReceiver.name }
    ] : []
  };
}
function deltaRule(a, b, transferOrder) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const plus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b });
  const minus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b });
  const quantity = transferOrder === "before" ? minus : plus;
  const agent = b.agent.name;
  return { kind: "cont", agent, quantity, entity: a.entity };
}
function inferDeltaRule(a, b, transferOrder) {
  const result = deltaRule(a, b, transferOrder);
  return {
    name: deltaRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.quantity)} ${result.agent}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${transferOrder === "before" ? " - " : " + "} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(a.quantity)} ${transferOrder == "before" ? " + " : " - "} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: false }
    ] : []
  };
}
function partWholeComplementRule(a, b) {
  return {
    kind: "ratio",
    whole: b.whole,
    ratio: isNumber(b.ratio) ? 1 - b.ratio : wrapToRatio(`1 - b.ratio`, { a, b }),
    part: a.part,
    asPercent: b.asPercent
  };
}
function inferPartWholeComplementRule(a, b) {
  const result = partWholeComplementRule(a, b);
  return {
    name: partWholeComplementRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vyj\xE1d\u0159i ${b.asPercent ? "procentem" : "pom\u011Brem"} ${result.part} z ${result.whole}?`,
    result,
    options: isNumber(b.ratio) ? [
      { tex: `${formatRatio(1, b.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(1 - b.ratio, b.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false }
    ] : []
  };
}
function convertTwoPartRatioToRatioCompareRule(b, { agent, asPercent }) {
  if (!areNumbers(b.ratios)) {
    throw "ratios does not support non quantity type";
  }
  const bRatios = b.ratios;
  if (!(b.ratios.length === 2 && b.parts.length === 2)) {
    throw `Part to part ratio has to have exactly two parts.`;
  }
  const agentBaseIndex = agent != null ? b.parts.indexOf(agent) : 1;
  if (agentBaseIndex === -1) {
    throw `Part not found ${agent}, expecting ${b.parts.join()}.`;
  }
  const agentAIndex = agentBaseIndex === 0 ? 1 : 0;
  return {
    kind: "comp-ratio",
    agentA: b.parts[agentAIndex],
    agentB: b.parts[agentBaseIndex],
    ratio: bRatios[agentAIndex] / bRatios[agentBaseIndex],
    asPercent
  };
}
function inferConvertTwoPartRatioToRatioCompareRule(b, { agent, asPercent }) {
  const result = convertTwoPartRatioToRatioCompareRule(b, { agent, asPercent });
  return {
    name: convertTwoPartRatioToRatioCompareRule.name,
    inputParameters: extractKinds(b),
    question: `Porovnej ${result.agentA} a ${result.agentB}?`,
    result,
    options: [
      // { tex: `${formatRatio(1, b.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(1 - b.ratio, b.asPercent), ok: true },
      // { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false },
    ]
  };
}
function convertPartWholeToRatioCompareRule(a, agent) {
  return {
    kind: "comp-ratio",
    agentA: a.part,
    agentB: agent,
    ratio: isNumber(a.ratio) ? a.ratio / (1 - a.ratio) : wrapToRatio(`a.ratio / (1 - a.ratio)`, { a }),
    asPercent: a.asPercent
  };
}
function inferConvertPartWholeToRatioCompareRule(a, b) {
  const result = convertPartWholeToRatioCompareRule(a, b.agent);
  return {
    name: convertPartWholeToRatioCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${result.agentA} a ${result.agentB}?`,
    result,
    options: isNumber(a.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio, a.asPercent)} / (${formatRatio(1, a.asPercent)} - ${formatRatio(a.ratio, a.asPercent)})`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(1, a.asPercent)} - ${formatRatio(a.ratio, a.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: false }
    ] : []
  };
}
function togglePartWholeAsPercentRule(b) {
  return {
    ...b,
    asPercent: !!!b.asPercent
  };
}
function inferTogglePartWholeAsPercentRule(b) {
  const result = togglePartWholeAsPercentRule(b);
  return {
    name: togglePartWholeAsPercentRule.name,
    inputParameters: extractKinds(b),
    question: `Vyj\xE1d\u0159i ${!b.asPercent ? "procentem" : "pom\u011Brem"}?`,
    result,
    options: isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(b.ratio, b.asPercent)} * 100`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} / 100`, result: formatRatio(result.ratio, result.asPercent), ok: false }
    ] : []
  };
}
function invertRatioCompareRule(b) {
  return {
    kind: "comp-ratio",
    agentA: b.agentB,
    agentB: b.agentA,
    ratio: isNumber(b.ratio) ? 1 / b.ratio : wrapToRatio(`1 / b.ratio`, { b }),
    asPercent: b.asPercent
  };
}
function inferInvertRatioCompareRule(b) {
  const result = invertRatioCompareRule(b);
  return {
    name: invertRatioCompareRule.name,
    inputParameters: extractKinds(b),
    question: `Obra\u0165 porovn\xE1n\xED ${result.agentA} a ${result.agentB}?`,
    result,
    options: isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `1 / ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} / 100`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false }
    ] : []
  };
}
function convertPartToPartToPartWholeRule(a, b, asPercent) {
  if (!areNumbers(b.ratios)) {
    throw "ratios does not support non quantity type";
  }
  if (!b.parts.includes(a.agent)) {
    throw `Missing part ${a.agent} , ${b.parts.join()}.`;
  }
  const index = b.parts.indexOf(a.agent);
  return {
    kind: "ratio",
    whole: b.whole,
    ratio: b.ratios[index] / b.ratios.reduce((out, d) => out += d, 0),
    part: b.parts[index],
    asPercent
  };
}
function inferConvertPartToPartToPartWholeRule(a, b, last2) {
  const result = convertPartToPartToPartWholeRule(a, b, last2.asPercent);
  if (!areNumbers(b.ratios) || !isNumber(result.ratio)) {
    throw "ratios does not support non quantity type";
  }
  const index = b.parts.indexOf(a.agent);
  const value = b.ratios[index];
  return {
    name: convertPartToPartToPartWholeRule.name,
    inputParameters: extractKinds(a, b, last2),
    question: `Vyj\xE1d\u0159i ${last2.asPercent ? "procentem" : "pom\u011Brem"} ${result.part} z ${result.whole}?`,
    result,
    options: [
      { tex: `${formatNumber(value)} / (${b.ratios.map((d) => formatNumber(d)).join(" + ")})`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatNumber(value)} * (${b.ratios.map((d) => formatNumber(d)).join(" + ")})`, result: formatRatio(result.ratio, result.asPercent), ok: false }
    ]
  };
}
function ratioCompareToCompareRule(a, b) {
  if (!(a.agentA == b.agentA && a.agentB == b.agentB || a.agentA == b.agentB && a.agentB == b.agentA)) {
    throw "Uncompatible compare rules. Absolute compare agent does not match relative compare agent";
  }
  const agent = a.agentB === b.agentA ? b.agentA : b.agentB;
  if (isNumber(a.ratio) && isNumber(b.quantity)) {
    const quantity = a.agentB === b.agentA ? -1 * b.quantity : b.quantity;
    if (quantity > 0 && a.ratio < 1 || quantity < 0 && a.ratio > 1) {
      throw `Uncompatible compare rules. Absolute compare ${quantity} between ${b.agentA} a ${b.agentB} does not match relative compare ${a.ratio}. `;
    }
  }
  return {
    kind: "cont",
    agent,
    entity: b.entity,
    unit: b.unit,
    quantity: isNumber(a.ratio) && isNumber(b.quantity) ? abs(b.quantity / (a.ratio - 1)) : wrapToQuantity(`abs(b.quantity / (a.ratio - 1))`, { a, b })
  };
}
function inferRatioCompareToCompareRule(a, b, last2) {
  const result = ratioCompareToCompareRule(a, b);
  return {
    name: ratioCompareToCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: containerQuestion(result),
    result,
    options: isNumber(a.ratio) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(abs(b.quantity))} / ${formatRatio(abs(a.ratio - 1))}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(abs(b.quantity))} / ${formatRatio(abs(1 - a.ratio))}`, result: formatNumber(abs(b.quantity / (1 - a.ratio))), ok: false }
    ] : []
  };
}
function transitiveCompareRule(a, b) {
  if (a.entity != b.agentA && a.entity != b.agentB) {
    throw `Mismatch entity with ${a.agentA} with agents ${b.agentA}, ${b.agentB}`;
  }
  return {
    ...a,
    entity: a.entity == b.agentA ? b.agentB : b.agentA,
    quantity: a.entity == b.agentA ? computeQuantityByRatioPart(a, b) : computeQuantityByRatioBase(a, b)
  };
}
function inferTransitiveCompareRule(a, b) {
  const result = transitiveCompareRule(a, b);
  return {
    name: transitiveCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik ${result.entity}?`,
    result,
    options: isNumber(b.ratio) && isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity * b.ratio), ok: [a.entity].includes(b.agentB) && b.ratio >= 0 || [a.entity].includes(b.agentA) && b.ratio < 0 },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity / b.ratio), ok: [a.entity].includes(b.agentA) && b.ratio >= 0 || [a.entity].includes(b.agentB) && b.ratio < 0 }
    ] : []
  };
}
function compRatiosToCompRule(a, b, nthPart2) {
  if (!areNumbers(a.ratios) || !isNumber(b.quantity)) {
    throw "ratios does not support non quantity type";
  }
  const aIndex = a.parts.indexOf(b.agentA);
  const bIndex = a.parts.indexOf(b.agentB);
  if (aIndex === -1 || bIndex === -1) {
    throw `Missing parts to compare ${a.parts.join(",")}, required parts ${b.agentA, b.agentB}`;
  }
  const diff = a.ratios[aIndex] - a.ratios[bIndex];
  if (!(diff > 0 && b.quantity > 0 || diff < 0 && b.quantity < 0 || diff == 0 && b.quantity == 0)) {
    throw `Uncompatible compare rules. Absolute compare ${b.quantity} between ${b.agentA} a ${b.agentB} does not match relative compare.`;
  }
  const lastIndex = nthPart2?.agent != null ? a.parts.findIndex((d) => d === nthPart2.agent) : aIndex > bIndex ? aIndex : bIndex;
  const nthPartAgent = a.parts[lastIndex];
  return {
    kind: "cont",
    agent: nthPartAgent,
    entity: b.entity,
    unit: b.unit,
    quantity: abs(b.quantity / diff) * a.ratios[lastIndex]
  };
}
function inferCompRatiosToCompRule(a, b, nthPart2) {
  const result = compRatiosToCompRule(a, b, nthPart2);
  const aIndex = a.parts.indexOf(b.agentA);
  const bIndex = a.parts.indexOf(b.agentB);
  const lastIndex = nthPart2?.agent != null ? a.parts.findIndex((d) => d === nthPart2.agent) : aIndex > bIndex ? aIndex : bIndex;
  return {
    name: compRatiosToCompRule.name,
    inputParameters: extractKinds(a, b, nthPart2),
    question: containerQuestion(result),
    result,
    options: areNumbers(a.ratios) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(abs(b.quantity))} / |${formatNumber(a.ratios[aIndex])} - ${formatNumber(a.ratios[bIndex])}| * ${formatNumber(a.ratios[lastIndex])}`, result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function proportionRule(a, b) {
  return {
    ...a,
    ...b.inverse && { ratio: isNumber(a.ratio) ? 1 / a.ratio : wrapToRatio(`1 / a.ratio`, { a }) }
  };
}
function inferProportionRule(a, b) {
  const result = proportionRule(a, b);
  return {
    name: proportionRule.name,
    inputParameters: extractKinds(a, b),
    question: `Jak\xFD je vztah mezi veli\u010Dinami? ${b.entities?.join(" a ")}`,
    result,
    options: isNumber(a.ratio) ? [
      { tex: `zachovat pom\u011Br`, result: formatRatio(a.ratio), ok: !b.inverse },
      { tex: `obr\xE1tit pom\u011Br - 1 / ${formatRatio(a.ratio)}`, result: formatRatio(1 / a.ratio), ok: b.inverse }
    ] : []
  };
}
function proportionTwoPartRatioRule(a, b) {
  if (a.ratios.length != 2) {
    throw "Only two part ratios is supported.";
  }
  return {
    kind: "ratios",
    whole: b.entities[0] == a.whole ? b.entities[1] : b.entities[0],
    parts: a.parts,
    ratios: b.inverse ? a.ratios.reverse() : a.ratios
  };
}
function inferProportionTwoPartRatioRule(a, b) {
  const result = proportionTwoPartRatioRule(a, b);
  return {
    name: proportionTwoPartRatioRule.name,
    inputParameters: extractKinds(a, b),
    question: `Jak\xFD je vztah mezi veli\u010Dinami? ${b.entities?.join(" a ")}`,
    result,
    options: [
      { tex: `zachovat pom\u011Br`, result: result.ratios.join(":"), ok: !b.inverse },
      { tex: `obr\xE1tit pom\u011Br`, result: result.ratios.join(":"), ok: b.inverse }
    ]
  };
}
function invertRatiosRule(a, b) {
  if (!areNumbers(a.ratios)) {
    throw `invertRatisRule is not support by non quantity type`;
  }
  return {
    kind: "ratios",
    whole: b.agent,
    parts: a.parts,
    ratios: a.ratios.map((d) => 1 / d)
  };
}
function inferInvertRatiosRule(a, b) {
  if (!areNumbers(a.ratios)) {
    throw `invertRatiosRule is not support by non quantity type`;
  }
  const result = mapRationsByFactorRule(invertRatiosRule(a, b), lcdCalc(a.ratios));
  return {
    name: invertRatiosRule.name,
    inputParameters: extractKinds(a, b),
    question: `P\u0159eve\u010F pom\u011Bry na obracen\xE9 hodnoty.`,
    result,
    options: areNumbers(a.ratios) ? [
      { tex: `obr\xE1tit pom\u011Br`, result: result.ratios.join(":"), ok: true }
    ] : []
  };
}
function inferReverseRatiosRule(a, b) {
  const result = {
    ...a,
    ratios: a.ratios.toReversed(),
    parts: a.parts.toReversed()
  };
  return {
    name: "reverseRatiosRule",
    inputParameters: extractKinds(a, b),
    question: `Oto\u010D \u010Dleny pom\u011Bru.`,
    result,
    options: areNumbers(a.ratios) ? [
      { tex: `${a.ratios.join(":")} => ${result.ratios.join(":")}`, result: result.ratios.join(":"), ok: true }
    ] : []
  };
}
function partToWholeRule(a, b) {
  if (!(matchAgent(b.whole, a) || matchAgent(b.part, a))) {
    throw `Mismatch entity ${[a.agent, a.entity].join()} any of ${[b.whole, b.part].join()}`;
  }
  return matchAgent(b.whole, a) ? {
    kind: "cont",
    agent: b.part,
    entity: a.entity,
    quantity: isNumber(a.quantity) && isNumber(b.ratio) ? a.quantity * b.ratio : wrapToQuantity(`a.quantity * b.ratio`, { a, b }),
    unit: a.unit
  } : {
    kind: "cont",
    agent: b.whole,
    entity: a.entity,
    quantity: isNumber(a.quantity) && isNumber(b.ratio) ? a.quantity / b.ratio : wrapToQuantity(`a.quantity / b.ratio`, { a, b }),
    unit: a.unit
  };
}
function inferPartToWholeRule(a, b) {
  const result = partToWholeRule(a, b);
  return {
    name: partToWholeRule.name,
    inputParameters: extractKinds(a, b),
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(b.ratio) && isNumber(result.quantity) ? [
      { tex: `${formatRatio(b.ratio)} * ${formatNumber(a.quantity)}`, result: formatNumber(result.quantity), ok: matchAgent(b.whole, a) },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(b.ratio)}`, result: formatNumber(a.quantity / b.ratio), ok: !matchAgent(b.whole, a) }
    ] : []
  };
}
function rateRule(a, rate2) {
  const aEntity = a.kind == "cont" ? a.entity : a.kind === "quota" ? a.agentQuota : a.entity.entity;
  if (!(aEntity === rate2.entity.entity || aEntity === rate2.entityBase.entity)) {
    throw `Mismatch entity ${aEntity} any of ${rate2.entity.entity}, ${rate2.entityBase.entity}`;
  }
  const isEntityBase2 = aEntity == rate2.entity.entity;
  const isUnitRate = rate2.baseQuantity === 1;
  return {
    kind: "cont",
    agent: a.agent,
    entity: isEntityBase2 ? rate2.entityBase.entity : rate2.entity.entity,
    unit: isEntityBase2 ? rate2.entityBase.unit : rate2.entity.unit,
    quantity: aEntity == rate2.entity.entity ? isNumber(a.quantity) && isNumber(rate2.quantity) && isNumber(rate2.baseQuantity) ? a.quantity / (!isUnitRate ? rate2.quantity / rate2.baseQuantity : rate2.quantity) : !isUnitRate ? wrapToQuantity(`a.quantity / (rate.quantity/rate.baseQuantity)`, { a, rate: rate2 }) : wrapToQuantity(`a.quantity / rate.quantity`, { a, rate: rate2 }) : isNumber(a.quantity) && isNumber(rate2.quantity) && isNumber(rate2.baseQuantity) ? a.quantity * (!isUnitRate ? rate2.quantity / rate2.baseQuantity : rate2.quantity) : !isUnitRate ? wrapToQuantity(`a.quantity * (rate.quantity/rate.baseQuantity)`, { a, rate: rate2 }) : wrapToQuantity(`a.quantity * rate.quantity`, { a, rate: rate2 })
  };
}
function inferRateRule(a, rate2) {
  const result = rateRule(a, rate2);
  const aEntity = a.kind == "cont" ? a.entity : a.kind === "quota" ? a.agentQuota : a.entity.entity;
  const isUnitRate = rate2.baseQuantity === 1;
  return {
    name: rateRule.name,
    inputParameters: extractKinds(a, rate2),
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(rate2.quantity) && isNumber(result.quantity) && isNumber(rate2.baseQuantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(rate2.quantity)}`, result: formatNumber(result.quantity), ok: isUnitRate && aEntity !== rate2.entity.entity },
      ...!isUnitRate ? [{ tex: `${formatNumber(a.quantity)} * (${formatNumber(rate2.quantity)}/${formatNumber(rate2.baseQuantity)})`, result: formatNumber(result.quantity), ok: !isUnitRate && aEntity !== rate2.entity.entity }] : [],
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(rate2.quantity)}`, result: formatNumber(result.quantity), ok: aEntity === rate2.entity.entity },
      ...!isUnitRate ? [{ tex: `${formatNumber(a.quantity)} / (${formatNumber(rate2.quantity)}/${formatNumber(rate2.baseQuantity)})`, result: formatNumber(result.quantity), ok: !isUnitRate && aEntity === rate2.entity.entity }] : []
    ] : []
  };
}
function quotaRule(a, quota3) {
  if (!(a.agent === quota3.agent || a.agent === quota3.agentQuota)) {
    throw `Mismatch entity ${a.entity} any of ${quota3.agent}, ${quota3.agentQuota}`;
  }
  return {
    kind: "cont",
    agent: a.agent === quota3.agentQuota ? quota3.agent : quota3.agentQuota,
    entity: a.entity,
    quantity: a.agent === quota3.agentQuota ? isNumber(a.quantity) && isNumber(quota3.quantity) ? a.quantity * quota3.quantity : wrapToQuantity(`a.quantity * quota.quantity`, { a, quota: quota3 }) : isNumber(a.quantity) && isNumber(quota3.quantity) ? a.quantity / quota3.quantity : wrapToQuantity(`a.quantity / quota.quantity`, { a, quota: quota3 })
  };
}
function inferQuotaRule(a, quota3) {
  const result = quotaRule(a, quota3);
  return {
    name: quotaRule.name,
    inputParameters: extractKinds(a, quota3),
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(quota3.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(quota3.quantity)}`, result: formatNumber(a.quantity * quota3.quantity), ok: a.agent === quota3.agentQuota },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota3.quantity)}`, result: formatNumber(a.quantity / quota3.quantity), ok: a.agent !== quota3.agentQuota }
    ] : []
  };
}
function toPartWholeRatio(part, whole, asPercent) {
  return {
    kind: "ratio",
    part: part.agent,
    whole: whole.agent,
    ratio: isNumber(part.quantity) && isNumber(whole.quantity) ? part.quantity / whole.quantity : wrapToRatio(`part.quantity / whole.quantity`, { part, whole }),
    asPercent
  };
}
function inferToPartWholeRatio(part, whole, last2) {
  const result = toPartWholeRatio(part, whole, last2.asPercent);
  return {
    name: toPartWholeRatio.name,
    inputParameters: extractKinds(part, whole, last2),
    question: `Vyj\xE1d\u0159i ${last2.asPercent ? "procentem" : "pom\u011Brem"} ${part.agent} z ${whole.agent}?`,
    result,
    options: isNumber(part.quantity) && isNumber(whole.quantity) && isNumber(result.ratio) ? [
      { tex: `${formatNumber(whole.quantity)} / ${formatNumber(part.quantity)} ${last2.asPercent ? " * 100" : ""}`, result: last2.asPercent ? formatNumber(result.ratio * 100) : formatRatio(result.ratio), ok: false },
      { tex: `${formatNumber(part.quantity)} / ${formatNumber(whole.quantity)} ${last2.asPercent ? " * 100" : ""}`, result: last2.asPercent ? formatNumber(result.ratio * 100) : formatRatio(result.ratio), ok: true }
    ] : []
  };
}
function compareDiffRule(a, b) {
  if (!(a.agent == b.agentMinuend || a.agent == b.agentSubtrahend)) {
    throw `Mismatch agents ${a.agent} any of ${b.agentMinuend} ${b.agentSubtrahend}`;
  }
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const plus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b });
  const minus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b });
  return {
    kind: "cont",
    agent: a.agent == b.agentMinuend ? b.agentSubtrahend : b.agentMinuend,
    quantity: a.agent == b.agentMinuend ? minus : plus,
    entity: b.entity
  };
}
function inferCompareDiffRule(a, b) {
  const result = compareDiffRule(a, b);
  return {
    name: compareDiffRule.name,
    inputParameters: extractKinds(a, b),
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: a.agent === b.agentMinuend },
      { tex: `${formatNumber(a.quantity)} + ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity + b.quantity), ok: a.agent !== b.agentMinuend }
    ] : []
  };
}
function sumRule(items, b) {
  if (items.every((d) => isRatioPredicate(d))) {
    const bases = items.every((d) => d.kind === "ratio") ? items.map((d) => d.whole) : items.map((d) => d.agentB);
    if (bases.filter(unique).length == bases.length) {
      throw `Sum only part to whole ratio with the same whole ${bases}`;
    }
    ;
    const ratios2 = items.map((d) => d.ratio);
    const ratio2 = areNumbers(ratios2) ? ratios2.reduce((out, d) => out += d, 0) : wrapToRatio(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
    return items.every((d) => d.kind === "ratio") ? { kind: "ratio", whole: bases[0], ratio: ratio2, part: b.wholeAgent, asPercent: items[0].asPercent } : { kind: "comp-ratio", agentA: b.wholeAgent, agentB: bases[0], ratio: ratio2, asPercent: items[0].asPercent };
  } else if (items.every((d) => isQuantityPredicate(d))) {
    if (items.every((d) => isFrequencyPredicate(d))) {
      const values = items.map((d) => [d.quantity, d.baseQuantity]);
      const quantity = areTupleNumbers(values) ? values.reduce((out, [q, baseQ]) => out += q * baseQ, 0) : wrapToQuantity(items.map((d, i) => `x${i + 1}.quantity * x${i + 1}.baseQuantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
      return {
        kind: "cont",
        agent: b.wholeAgent,
        quantity,
        entity: b.wholeEntity != null ? b.wholeEntity.entity : items[0].entityBase.entity,
        unit: b.wholeEntity != null ? b.wholeEntity.unit : items[0].entityBase.unit
      };
    } else {
      const values = items.map((d) => d.quantity);
      const quantity = areNumbers(values) ? values.reduce((out, d) => out += d, 0) : wrapToQuantity(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
      if (items.every((d) => isRatePredicate(d))) {
        const { entity: entity3, entityBase } = items[0];
        return { kind: "rate", agent: b.wholeAgent, quantity, entity: entity3, entityBase, baseQuantity: 1 };
      } else {
        if (b.kind !== "sum-combine") {
          const itemsEntities = items.map((d) => d.entity);
          if (b.wholeEntity === null && itemsEntities.filter(unique).length !== 1) {
            throw `All predicates should have the same entity ${itemsEntities.map((d) => JSON.stringify(d)).join("")}.`;
          }
        }
        return {
          kind: "cont",
          agent: b.wholeAgent,
          quantity,
          entity: b.wholeEntity != null ? b.wholeEntity.entity : items[0].entity,
          unit: b.wholeEntity != null ? b.wholeEntity.unit : items[0].unit
        };
      }
    }
  }
}
function inferSumRule(items, b) {
  const result = sumRule(items, b);
  const isQuantity = isQuantityPredicate(result);
  return {
    name: sumRule.name,
    inputParameters: extractKinds(...items, b),
    question: result.kind === "cont" ? containerQuestion(result) : result.kind === "rate" ? `${computeQuestion(result.quantity)} ${result.agent}?` : result.kind === "ratio" ? `${computeQuestion(result.ratio)} ${result.part} z ${result.whole}?` : `${computeQuestion(result.ratio)} kolikr\xE1t ${result.agentA} v\xEDce nebo m\xE9n\u011B ne\u017E ${result.agentB}?`,
    result,
    options: items.every((d) => isFrequencyPredicate(d)) ? [] : isQuantity && isNumber(result.quantity) || isRatioPredicate(result) && isNumber(result.ratio) ? [
      {
        tex: items.map((d) => isQuantity ? formatNumber(d.quantity) : formatRatio(d.ratio, d.percent)).join(" + "),
        result: isQuantity ? isNumber(result.quantity) ? formatNumber(result.quantity) : "N/A" : isNumber(result.ratio) ? formatRatio(result.ratio, result.asPercent) : "N/A",
        ok: true
      },
      {
        tex: items.map((d) => isQuantity ? formatNumber(d.quantity) : formatRatio(d.ratio, d.percent)).join(" * "),
        result: isQuantity ? isNumber(result.quantity) ? formatNumber(result.quantity) : "N/A" : isNumber(result.ratio) ? formatRatio(result.ratio, result.asPercent) : "N/A",
        ok: false
      }
    ] : []
  };
}
function productRule(items, b) {
  const values = items.map((d) => d.quantity);
  const entity3 = b.wholeEntity != null ? b.wholeEntity : items.find((d) => d.entity != null && d.entity != "");
  const convertedEntity = entity3 != null ? toEntity(entity3) : { entity: "", unit: void 0 };
  return {
    kind: "cont",
    agent: b.wholeAgent,
    quantity: areNumbers(values) ? values.reduce((out, d) => out *= d, 1) : wrapToQuantity(items.map((d, i) => `y${i + 1}.quantity`).join(" * "), Object.fromEntries(items.map((d, i) => [`y${i + 1}`, d]))),
    entity: convertedEntity.entity,
    unit: convertedEntity.unit
  };
}
function inferProductRule(items, b) {
  const result = productRule(items, b);
  const values = items.map((d) => d.quantity);
  return {
    name: productRule.name,
    inputParameters: extractKinds(...items, b),
    question: containerQuestion(result),
    result,
    options: areNumbers(values) ? [
      { tex: values.map((d) => formatNumber(d)).join(" * "), result: formatNumber(values.reduce((out, d) => out *= d, 1)), ok: true },
      { tex: values.map((d) => formatNumber(d)).join(" + "), result: formatNumber(values.reduce((out, d) => out += d, 0)), ok: false }
    ] : []
  };
}
function gcdRule(values, b) {
  return {
    kind: "cont",
    agent: b.agent,
    quantity: areNumbers(values) ? gcdCalc(values) : wrapToQuantity(`gcd(${values.join(",")})`),
    entity: b.entity,
    unit: b.unit
  };
}
function inferGcdRule(items, b) {
  const values = items.map((d) => d.quantity);
  const result = gcdRule(values, b);
  return {
    name: gcdRule.name,
    inputParameters: extractKinds(b),
    question: containerQuestion(result),
    result,
    options: areNumbers(values) && isNumber(result.quantity) ? [
      { tex: gcdFromPrimeFactors(primeFactorization(values)).join(" * "), result: formatNumber(result.quantity), ok: true }
      //{ tex: lcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ] : []
  };
}
function lcdRule(values, b) {
  return {
    kind: "cont",
    agent: b.agent,
    quantity: areNumbers(values) ? lcdCalc(values) : wrapToQuantity(`lcd(${values.join(",")})`),
    entity: b.entity,
    unit: b.unit
  };
}
function inferLcdRule(items, b) {
  const values = items.map((d) => d.quantity);
  const result = lcdRule(values, b);
  return {
    name: lcdRule.name,
    inputParameters: extractKinds(b),
    question: containerQuestion(result),
    result,
    options: areNumbers(values) && isNumber(result.quantity) ? [
      { tex: lcdFromPrimeFactors(primeFactorization(values)).join(" * "), result: formatNumber(result.quantity), ok: true }
      //{ tex: gcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ] : []
  };
}
function tupleRule(items, last2) {
  const result = { kind: "tuple", agent: last2.agent, items };
  return {
    name: "tupleRule",
    inputParameters: extractKinds(...items),
    question: `Seskup v\xEDce objekt\u016F do jednoho slo\u017Een\xE9ho objektu.`,
    result,
    options: []
  };
}
function splitDecimalAndFractionPartsRule(value) {
  const decimal = Math.floor(value);
  const fraction = value - decimal;
  return [decimal, fraction];
}
function inferSplitDecimalAndFractionPartsRule(a, b) {
  const quantity = isNumber(a.quantity) ? b.kind === "number-decimal-part" ? splitDecimalAndFractionPartsRule(a.quantity)[0] : splitDecimalAndFractionPartsRule(a.quantity)[1] : b.kind === "number-decimal-part" ? wrapToQuantity(`floor(${a.quantity})`, { a }) : wrapToQuantity(`(${a.quantity}) - floor(${a.quantity})`, { a });
  const result = {
    ...a,
    agent: b?.agent ?? a.agent,
    quantity
  };
  return {
    name: "splitDecimalAndFractionPartsRule",
    inputParameters: extractKinds(a),
    question: `Rozd\u011Bl \u010D\xEDslo na celo\u010D\xEDselnou a desetinnou \u010D\xE1st. Vra\u0165 ${b.kind === "number-decimal-part" ? "celo\u010D\xEDselnou" : "desetinnou"} \u010D\xE1st.`,
    result,
    options: []
  };
}
function toSequenceRule(items) {
  const values = items.map((d) => d.quantity);
  if (!areNumbers(values)) {
    throw "sequenceRule does not support non quantity type";
  }
  if (new Set(items.map((d) => d.entity)).size > 1) {
    throw `Mismatch entity ${items.map((d) => d.entity).join()}`;
  }
  const type = sequencer(values);
  return { kind: "sequence", type, entity: items[0].entity };
}
function inferToSequenceRule(items) {
  const result = toSequenceRule(items);
  return {
    name: toSequenceRule.name,
    inputParameters: extractKinds(...items),
    question: `Hledej vzor opakov\xE1n\xED. Jak\xFD je vztah mezi sousedn\xEDmi \u010Dleny?`,
    result,
    options: sequenceOptions(result.type)
  };
}
function toCompareRule(a, b) {
  const aEntity = a.kind === "rate" ? a.entity : { entity: a.entity, unit: a.unit };
  const bEntity = b.kind === "rate" ? b.entity : { entity: b.entity, unit: b.unit };
  if (aEntity.entity != bEntity.entity) {
    throw `Mismatch entity ${aEntity.entity}, ${bEntity.entity}`;
  }
  return {
    kind: "comp",
    agentB: b.agent,
    agentA: a.agent,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }),
    ...aEntity
  };
}
function inferToCompareRule(a, b) {
  const result = toCompareRule(a, b);
  return {
    name: toCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ] : []
  };
}
function toDeltaRule(a, b, last2) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return {
    kind: "delta",
    agent: { name: last2.agent?.name ?? b.agent, nameBefore: a.agent, nameAfter: b.agent },
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? b.quantity - a.quantity : wrapToQuantity(`b.quantity - a.quantity`, { a, b }),
    entity: a.entity,
    unit: a.unit
  };
}
function inferToDeltaRule(a, b, last2) {
  const result = toDeltaRule(a, b, last2);
  return {
    name: toDeltaRule.name,
    inputParameters: extractKinds(a, b, last2),
    question: `Zm\u011Bna stavu ${a.agent} => ${b.agent}. O kolik?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: false },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: true }
    ] : []
  };
}
function convertCompareToDeltaEx(a, b) {
  const { name, nameBefore, nameAfter } = b.agent;
  return { kind: "delta", agent: { name, nameBefore: nameBefore ?? a.agentA, nameAfter: nameAfter ?? a.agentB }, quantity: a.quantity, entity: a.entity, unit: a.unit };
}
function inferConvertCompareToDeltaRule(a, b) {
  const result = convertCompareToDeltaEx(a, b);
  return {
    name: toDeltaRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypo\u010Dti zm\u011Bnu stavu ${a.agentA} => ${a.agentB}. O kolik?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [] : []
  };
}
function convertDeltaToCompareEx(a, b) {
  const { agentA, agentB, entity: entity3, unit } = b;
  return { kind: "comp", agentA, agentB, quantity: a.quantity, entity: entity3, unit };
}
function inferConvertDeltaToCompareRule(a, b) {
  const result = convertDeltaToCompareEx(a, b);
  return {
    name: toDeltaRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${b.agentA} => ${b.agentB}. O kolik?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [] : []
  };
}
function pythagorasRule(a, b, last2) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  if (a.unit != b.unit) {
    throw `Mismatch unit ${a.unit}, ${b.unit}`;
  }
  const temp = {
    kind: "cont",
    entity: a.entity,
    unit: a.unit
  };
  if (a.agent === last2.longest || b.agent === last2.longest) {
    const longest = a.agent === last2.longest ? a : b;
    const otherSite = a.agent === last2.longest ? b : a;
    return {
      ...temp,
      quantity: isNumber(longest.quantity) && isNumber(otherSite.quantity) ? Math.sqrt(Math.pow(longest.quantity, 2) - Math.pow(otherSite.quantity, 2)) : wrapToQuantity(`sqrt(longest.quantity^2 - otherSite.quantity^2)`, { longest, otherSite }),
      agent: last2.sites[1] === otherSite.agent ? last2.sites[0] : last2.sites[1]
    };
  } else {
    return {
      ...temp,
      quantity: isNumber(a.quantity) && isNumber(b.quantity) ? Math.sqrt(Math.pow(a.quantity, 2) + Math.pow(b.quantity, 2)) : wrapToQuantity(`sqrt (a.quantity^2 + b.quantity^2)`, { a, b }),
      agent: last2.longest
    };
  }
}
function inferPythagorasRule(a, b, last2) {
  const result = pythagorasRule(a, b, last2);
  const longest = a.agent === last2.longest ? a : b;
  const otherSite = a.agent === last2.longest ? b : a;
  return {
    name: pythagorasRule.name,
    inputParameters: extractKinds(a, b, last2),
    question: `Vypo\u010D\xEDtej stranu ${result.agent} dle Pythagorovi v\u011Bty?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(longest.quantity) && isNumber(otherSite.quantity) && isNumber(result.quantity) ? [
      { tex: `odmocnina z (${formatNumber(longest.quantity)}^2 - ${formatNumber(otherSite.quantity)}^2)`, result: formatNumber(result.quantity), ok: a.agent === last2.longest || b.agent === last2.longest },
      { tex: `odmocnina z (${formatNumber(a.quantity)}^2 + ${formatNumber(b.quantity)}^2)`, result: formatNumber(result.quantity), ok: !(a.agent === last2.longest || b.agent === last2.longest) }
    ] : []
  };
}
function alligationRule(items, last2) {
  const [a, b, c] = items;
  const aEntity = a.kind === "rate" ? a.entity : { entity: a.entity, unit: a.unit };
  const bEntity = b.kind === "rate" ? b.entity : { entity: b.entity, unit: b.unit };
  const cEntity = c.kind === "rate" ? c.entity : { entity: c.entity, unit: c.unit };
  if (aEntity.entity != bEntity.entity || bEntity.entity != cEntity.entity) {
    throw `Mismatch entity ${aEntity.entity}, ${bEntity.entity}, ${cEntity.entity}`;
  }
  if (aEntity.unit != bEntity.unit || bEntity.unit != cEntity.unit) {
    throw `Mismatch unit ${aEntity.unit}, ${bEntity.unit}, ${cEntity.unit}`;
  }
  const nums = [a, b, c];
  if (!areNumbers(nums.map((d) => d.quantity))) {
    throw `A=lligationRule does not support non quantitive numbers.`;
  }
  nums.sort((x, y) => x.quantity - y.quantity);
  const small = nums[0].quantity;
  const middle = nums[1].quantity;
  const large = nums[2].quantity;
  return {
    kind: "ratios",
    whole: last2.agent,
    ...aEntity,
    ratios: [Math.abs(small - middle), Math.abs(large - middle)],
    parts: [nums[0].agent, nums[2].agent]
  };
}
function inferAlligationRule(items, last2) {
  const result = alligationRule(items, last2);
  const [min2, avarage, max2] = items.map((d) => d.quantity).sort((f, s) => f - s);
  return {
    name: alligationRule.name,
    inputParameters: extractKinds(...items, last2),
    question: `Vypo\u010D\xEDtej ${result.whole} mezi ${result.parts.join(" a ")} vyv\xE1\u017Een\xEDm v\u016F\u010Di pr\u016Fm\u011Bru?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `${formatNumber(avarage)} - ${formatNumber(min2)} :: ${formatNumber(max2)} - ${formatNumber(avarage)}`, result: result.ratios.join(":"), ok: true }
    ] : []
  };
}
function triangleAngleRule(a, b, last2) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  if (a.unit != b.unit) {
    throw `Mismatch unit ${a.unit}, ${b.unit}`;
  }
  return {
    kind: "cont",
    entity: a.entity,
    unit: a.unit,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? 180 - (a.quantity + b.quantity) : wrapToQuantity(`180 - (a.quantity + b.quantity)`, { a, b }),
    agent: last2.agent
  };
}
function inferTriangleAngleRule(a, b, last2) {
  const result = triangleAngleRule(a, b, last2);
  return {
    name: triangleAngleRule.name,
    inputParameters: extractKinds(a, b, last2),
    question: `Vypo\u010D\xEDtej ${result.agent} dle pravidla sou\u010Dtu vnit\u0159n\xEDch \xFAhl\u016F v troj\xFAheln\xEDku?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `180 - (${formatNumber(a.quantity)} + ${formatNumber(b.quantity)})`, result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function convertPercentRule(a) {
  return {
    ...a,
    asPercent: !!!a.asPercent
  };
}
function inferConvertPercentRule(a) {
  const result = convertPercentRule(a);
  return {
    name: convertPercentRule.name,
    inputParameters: extractKinds(a),
    question: a.asPercent ? `P\u0159eve\u010F procenta na n\xE1sobek` : `P\u0159eve\u010F n\xE1sobek na procenta`,
    result,
    options: isNumber(a.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio, a.asPercent)} / 100`, result: formatRatio(result.ratio, result.asPercent), ok: a.asPercent },
      { tex: `${formatRatio(a.ratio, a.asPercent)} * 100`, result: formatRatio(result.ratio, result.asPercent), ok: !a.asPercent }
    ] : []
  };
}
function toRatioCompareRule(a, b, ctor2) {
  if (b.agent === a.agent && b.entity != a.entity) {
    b = toGenerAgent(b);
    a = toGenerAgent(a);
  }
  if (b.entity != a.entity) {
    throw `Mismatch entity ${b.entity}, ${a.entity}`;
  }
  return {
    kind: "comp-ratio",
    agentB: b.agent,
    agentA: a.agent,
    ratio: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity / b.quantity : wrapToRatio(`a.quantity / b.quantity`, { a, b }),
    ...ctor2.asPercent && { asPercent: true }
  };
}
function inferToRatioCompareRule(a, b, ctor2) {
  const result = toRatioCompareRule(a, b, ctor2);
  if (isNumber(result.ratio) && isNumber(a.quantity) && isNumber(b.quantity)) {
    const between = result.ratio > 1 / 2 && result.ratio < 2;
    return {
      name: toRatioCompareRule.name,
      inputParameters: [a, b, ctor2],
      question: `Porovnej ${result.agentA} a ${result.agentB}.${between ? `O kolik z ${result.agentB}?` : `Kolikr\xE1t ${result.ratio < 1 ? "men\u0161\xED" : "v\u011Bt\u0161\xED"}?`}`,
      result,
      options: between ? [
        { tex: `(${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}) / ${formatNumber(b.quantity)}`, result: formatRatio((a.quantity - b.quantity) / b.quantity), ok: result.ratio > 1 },
        { tex: `(${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}) / ${formatNumber(b.quantity)}`, result: formatRatio((b.quantity - a.quantity) / b.quantity), ok: result.ratio <= 1 }
      ] : [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatRatio(a.quantity / b.quantity), ok: result.ratio >= 1 },
        { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatRatio(b.quantity / a.quantity), ok: result.ratio < 1 }
      ]
    };
  } else {
    return resultAsQuestion(result, { name: toRatioCompareRule.name, inputParamters: extractKinds(a, b, ctor2) });
  }
}
function compareToRateRule(a, b, last2) {
  return {
    kind: "rate",
    agent: last2?.agent ?? a.agentA,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? abs(a.quantity) / abs(b.quantity) : wrapToQuantity(`abs(a.quantity) / abs(b.quantity)`, { a, b }),
    entity: { entity: a.entity },
    entityBase: { entity: b.entity },
    baseQuantity: 1
  };
}
function inferCompareToRateRule(a, b, last2) {
  const result = compareToRateRule(a, b, last2);
  return {
    name: compareToRateRule.name,
    inputParameters: extractKinds(a, b),
    question: `Rozd\u011Bl ${formatEntity({ entity: a.entity })} rovnom\u011Brn\u011B na ${formatEntity({ entity: b.entity })}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(abs(a.quantity))} / ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(abs(b.quantity))} / ${formatNumber(abs(a.quantity))}`, result: formatNumber(abs(b.quantity) / abs(a.quantity)), ok: false }
    ] : []
  };
}
function toCompareDiffRule(a, b) {
  if (a.entity !== b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return {
    kind: "comp-diff",
    agentMinuend: a.agent,
    agentSubtrahend: b.agent,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }),
    entity: a.entity
  };
}
function inferToCompareDiffRule(a, b) {
  const result = toCompareDiffRule(a, b);
  return {
    name: toCompareDiffRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.quantity)} rozd\xEDl mezi ${a.quantity} a ${b.quantity}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ] : []
  };
}
function toSlideRule(a, b, last2) {
  if (a.entity !== b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  if (a.unit !== b.unit) {
    throw `Mismatch unit ${a.unit}, ${b.unit}`;
  }
  return {
    kind: "cont",
    agent: last2.agent ?? a.agent,
    quantity: last2.kind === "slide-invert" ? isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }) : isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b }),
    entity: a.entity,
    unit: a.unit
  };
}
function infetToSlideRule(a, b, last2) {
  const result = toSlideRule(a, b, last2);
  return {
    name: toSlideRule.name,
    inputParameters: extractKinds(a, b, last2),
    question: `${containerQuestion(result)}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${last2.kind === "slide-invert" ? "-" : "+"} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ] : []
  };
}
function toDifferenceRule(a, b, diff) {
  if (a.entity !== b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  if (a.unit !== b.unit) {
    throw `Mismatch unit ${a.unit}, ${b.unit}`;
  }
  return {
    kind: "cont",
    agent: diff.differenceAgent,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }),
    entity: a.entity,
    unit: a.unit
  };
}
function inferToDifferenceRule(a, b, diff) {
  const result = toDifferenceRule(a, b, diff);
  return {
    name: toDifferenceRule.name,
    inputParameters: extractKinds(a, b, diff),
    question: `${computeQuestion(result.quantity)} rozd\xEDl mezi ${a.agent} a ${b.agent}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ] : []
  };
}
function toDifferenceAsRatioRule(a, b, diff) {
  const aBase = a.kind === "comp-ratio" ? a.agentB : a.whole;
  const bBase = b.kind === "comp-ratio" ? b.agentB : b.whole;
  if (aBase !== bBase) {
    throw `Mismatch base agents ${aBase}, ${bBase}`;
  }
  return {
    kind: "ratio",
    whole: aBase,
    part: diff.differenceAgent,
    ratio: isNumber(a.ratio) && isNumber(b.ratio) ? a.ratio - b.ratio : wrapToRatio(`a.ratio - b.ratio`, { a, b }),
    asPercent: a.asPercent
  };
}
function inferToDifferenceAsRatioRule(a, b, diff) {
  const result = toDifferenceAsRatioRule(a, b, diff);
  const aPart = a.kind === "comp-ratio" ? a.agentA : a.part;
  const bPart = b.kind === "comp-ratio" ? b.agentA : b.part;
  return {
    name: toDifferenceAsRatioRule.name,
    inputParameters: extractKinds(a, b, diff),
    question: `${computeQuestion(result.ratio)} rozd\xEDl mezi ${aPart} a ${bPart}`,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio, a.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(a.ratio, a.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: false }
    ] : []
  };
}
function transitiveRatioRule(a, b) {
  if (!(a.whole === b.part || b.whole === a.part)) {
    throw `Mismatch agents ${a.whole} -> ${b.part} or  ${b.whole} -> ${a.part}`;
  }
  const firstWhole = a.whole === b.part;
  return {
    kind: "ratio",
    whole: firstWhole ? b.whole : a.whole,
    part: firstWhole ? a.part : b.part,
    ratio: isNumber(a.ratio) && isNumber(b.ratio) ? a.ratio * b.ratio : wrapToRatio(`a.ratio * b.ratio`, { a, b })
  };
}
function inferTransitiveRatioRule(a, b) {
  const result = transitiveRatioRule(a, b);
  return {
    name: transitiveRatioRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.ratio)} ${result.part} z ${result.whole}`,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio)} * ${formatRatio(b.ratio)}`, result: formatRatio(result.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} / ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio / a.ratio), ok: false }
    ] : []
  };
}
function toRateRule(a, b, rate2) {
  if (a.agent !== b.agent) {
    throw `Mismatch angent ${a.agent}, ${b.agent}`;
  }
  const baseQuantity = rate2?.baseQuantity ?? 1;
  return {
    kind: "rate",
    agent: rate2.agent ?? a.agent,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(baseQuantity) ? baseQuantity === 1 ? a.quantity / b.quantity * baseQuantity : a.quantity / b.quantity * baseQuantity : isNumber(baseQuantity) && baseQuantity === 1 ? wrapToQuantity(`a.quantity / b.quantity`, { a, b }) : wrapToQuantity(`a.quantity / b.quantity * rate.baseQuantity`, { a, b, rate: rate2 }),
    entity: {
      entity: a.entity,
      unit: a.unit
    },
    entityBase: {
      entity: b.kind === "cont" ? b.entity : b.agentQuota,
      unit: b.kind === "cont" ? b.unit : EmptyUnit
    },
    baseQuantity: rate2?.baseQuantity ?? 1
  };
}
function inferToRateRule(a, b, rate2) {
  const result = toRateRule(a, b, rate2);
  if (isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.baseQuantity) && isNumber(result.quantity)) {
    return {
      name: toRateRule.name,
      inputParameters: extractKinds(a, b, rate2),
      question: `Rozd\u011Bl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity })} rovnom\u011Brn\u011B ${formatNumber(b.quantity)} kr\xE1t${result.baseQuantity !== 1 ? ` po ${formatNumber(result.baseQuantity)} ${formatEntity({ entity: b.kind === "cont" ? b.entity : b.agentQuota })}` : ""}`,
      result,
      options: [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: rate2.baseQuantity === 1 },
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)} * ${formatNumber(result.baseQuantity)}`, result: formatNumber(result.quantity), ok: rate2.baseQuantity !== 1 },
        { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity / a.quantity), ok: false }
      ]
    };
  } else {
    return resultAsQuestion(result, { name: toRateRule.name, inputParamters: extractKinds(a, b, rate2) });
  }
}
function solveEquationRule(a, b, last2) {
  return {
    kind: "cont",
    agent: last2.agent,
    quantity: helpers.solveLinearEquation(a.quantity, b.quantity, last2.variable),
    ...last2.entity
  };
}
function inferSolveEquationRule(a, b, last2) {
  const result = solveEquationRule(a, b, last2);
  return {
    name: solveEquationRule.name,
    inputParameters: extractKinds(a, b, last2),
    question: `Vy\u0159e\u0161 line\xE1rn\xED rovnici ${a.agent} = ${b.agent} pro nezn\xE1mou ${last2.variable}.`,
    result,
    options: []
  };
}
function toQuotaRule(a, quota3) {
  return {
    kind: "quota",
    agentQuota: quota3.agent,
    agent: a.agent,
    quantity: isNumber(a.quantity) && isNumber(quota3.quantity) ? Math.floor(a.quantity / quota3.quantity) : wrapToQuantity(`floor(a.quantity / quota.quantity)`, { a, quota: quota3 }),
    restQuantity: isNumber(a.quantity) && isNumber(quota3.quantity) ? a.quantity % quota3.quantity : wrapToQuantity(`a.quantity % quota.quantity`, { a, quota: quota3 })
  };
}
function inferToQuotaRule(a, quota3) {
  const result = toQuotaRule(a, quota3);
  if (isNumber(a.quantity) && isNumber(quota3.quantity) && isNumber(result.quantity)) {
    return {
      name: toQuotaRule.name,
      inputParameters: extractKinds(a, quota3),
      question: `Rozd\u011Bl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity, unit: a.unit })} postupn\u011B na skupiny velikosti ${formatNumber(quota3.quantity)} ${formatEntity({ entity: quota3.entity, unit: quota3.unit })}`,
      result,
      options: [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota3.quantity)}`, result: formatNumber(result.quantity), ok: true },
        { tex: `${formatNumber(quota3.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(result.quantity), ok: false }
      ]
    };
  } else {
    return resultAsQuestion(result, { name: toQuotaRule.name, inputParamters: extractKinds(a, quota3) });
  }
}
function toRatiosRule(parts, last2) {
  const ratios2 = parts.map((d) => d.quantity);
  return {
    kind: "ratios",
    parts: parts.map((d) => d.agent),
    ratios: last2.useBase ? ratiosToBaseForm(ratios2) : ratios2,
    whole: last2.whole
  };
}
function inferToRatiosRule(parts, last2) {
  const result = toRatiosRule(parts, last2);
  return {
    name: toRatiosRule.name,
    inputParameters: extractKinds(...parts, last2),
    question: `Vyj\xE1d\u0159i pom\u011Brem mezi ${result.parts.join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `${last2.useBase ? parts.map((d) => d.quantity).map((d) => formatNumber(d)).join(":") : ""}`, result: result.ratios.map((d) => formatNumber(d)).join(":"), ok: true }
    ] : []
  };
}
function transitiveRateRule(a, b, newAgent) {
  if (a.baseQuantity != b.baseQuantity) {
    throw `transitive rate uncompatible baseQuantity not supported ${a.baseQuantity}, ${b.baseQuantity}`;
  }
  if (isSameEntity(a.entity, b.entityBase)) {
    return {
      kind: "rate",
      agent: newAgent,
      quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity * b.quantity : wrapToQuantity(`a.quantity * b.quantity`, { a, b }),
      entity: b.entity,
      entityBase: a.entityBase,
      baseQuantity: a.baseQuantity
    };
  } else if (isSameEntity(b.entity, a.entityBase)) {
    return {
      kind: "rate",
      agent: newAgent,
      quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity * b.quantity : wrapToQuantity(`a.quantity * b.quantity`, { a, b }),
      entity: b.entity,
      entityBase: a.entityBase,
      baseQuantity: a.baseQuantity
    };
  } else {
    throw `transitive rate uncompatible entities ${formatEntity(a.entity)} per ${formatEntity(a.entityBase)} to  ${formatEntity(b.entity)} per ${formatEntity(b.entityBase)}`;
  }
}
function inferTrasitiveRateRule(a, b, last2) {
  const result = transitiveRateRule(a, b, last2.agent);
  return {
    name: transitiveRateRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypo\u010Dti ${last2.agent} ${formatEntity(result.entity)} per ${formatEntity(result.entityBase)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: false }
    ] : []
  };
}
function evalToQuantityRule(a, b) {
  const quantities = a.map((d) => d.quantity);
  const variables = extractDistinctWords(b.expression);
  const context = quantities.reduce((out, d, i) => {
    out[variables[i]] = d;
    return out;
  }, {});
  return {
    ...b.predicate,
    quantity: areNumbers(quantities) ? helpers.evalExpression(b.expression, context) : wrapToQuantity(`${b.expression}`, variables.reduce((out, d, i) => {
      out[d] = a[i];
      return out;
    }, {}))
  };
}
var preservedWords = ["sqrt", "closeTo"];
function extractDistinctWords(str) {
  const matches = str.match(/[a-zA-Z]+/g) || [];
  return [...new Set(matches)].filter((d) => !preservedWords.includes(d));
}
function inferEvalToQuantityRule(a, b) {
  const result = evalToQuantityRule(a, b);
  return {
    name: evalToQuantityRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypo\u010Dti v\xFDraz ${b.expression}?`,
    result,
    options: []
  };
}
function simplifyExprRuleAsRatio(a, b) {
  if (isNumber(a.ratio)) {
    throw `simplifyExpr does not support quantity types`;
  }
  return {
    ...a,
    ratio: helpers.evalExpression(a.ratio, b.context)
  };
}
function simplifyExprRuleAsQuantity(a, b) {
  if (isNumber(a.quantity)) {
    throw `simplifyExpr does not support quantity types`;
  }
  return {
    ...a,
    quantity: helpers.evalExpression(a.quantity, b.context)
  };
}
function inferSimplifyExprRule(a, b) {
  const result = isQuantityPredicate(a) ? simplifyExprRuleAsQuantity(a, b) : simplifyExprRuleAsRatio(a, b);
  return {
    name: "simplifyExprRule",
    inputParameters: extractKinds(a, b),
    question: `Zjednodu\u0161 v\xFDraz dosazen\xEDm ${JSON.stringify(b.context)} ?`,
    result,
    options: []
  };
}
function evalQuotaRemainderExprRule(a, b) {
  if (!isNumber(a.restQuantity)) {
    throw `evalQuotaRemainderExprRule does not support quantity types`;
  }
  const matched = helpers.evalExpression(b.expression, a.restQuantity);
  return {
    kind: "eval-option",
    expression: b.expression,
    expressionNice: convertToExpression(b.expectedValue, b.compareTo === "closeTo" ? "equal" : b.compareTo, { ...b.expectedValueOptions, asPercent: false }),
    value: b.optionValue != null ? matched ? b.optionValue : null : matched
  };
}
function inferEvalQuotaRemainderExprRule(a, b) {
  const result = evalQuotaRemainderExprRule(a, b);
  return {
    name: evalToOptionRule.name,
    inputParameters: extractKinds(a, b),
    question: b.optionValue != null ? `Vyhodno\u0165 volbu [${b.optionValue}]?` : `Vyhodno\u0165 pravdivost ${b.expressionNice}?`,
    result,
    options: []
  };
}
function evalToOptionRule(a, b) {
  let valueToEval = a.quantity ?? a.ratio;
  if (isExpressionNode(valueToEval)) {
    valueToEval = helpers.evalNodeToNumber(valueToEval);
  }
  if (!isNumber(valueToEval) || isNaN(valueToEval)) {
    throw `evalToOptionRule does not support non quantity types. ${JSON.stringify(a)}`;
  }
  if (a.kind == "comp-ratio" && (b.expectedValueOptions.asRelative || valueToEval > 1 / 2 && valueToEval < 2)) {
    valueToEval = valueToEval > 1 ? valueToEval - 1 : 1 - valueToEval;
  }
  const matched = helpers.evalExpression(b.expression, valueToEval);
  return {
    kind: "eval-option",
    expression: b.expression,
    expressionNice: convertToExpression(b.expectedValue, b.compareTo === "closeTo" ? "equal" : b.compareTo, { ...b.expectedValueOptions, asPercent: false }),
    value: b.optionValue != null ? matched ? b.optionValue : null : matched
  };
}
function inferEvalToOptionRule(a, b) {
  const result = evalToOptionRule(a, b);
  return {
    name: evalToOptionRule.name,
    inputParameters: extractKinds(a, b),
    question: b.optionValue != null ? `Vyhodno\u0165 volbu [${b.optionValue}]?` : `Vyhodno\u0165 pravdivost ${b.expressionNice}?`,
    result,
    options: []
  };
}
function partToPartRule(a, partToPartRatio, nth2) {
  if (!(partToPartRatio.whole != null && matchAgent(partToPartRatio.whole, a) || partToPartRatio.parts.some((d) => matchAgent(d, a)))) {
    throw `Mismatch agent ${[a.agent, a.entity].join()} any of ${[partToPartRatio.whole].concat(partToPartRatio.parts).join()}`;
  }
  const sourcePartIndex = partToPartRatio.parts.findIndex((d) => matchAgent(d, a));
  const targetPartIndex = nth2 != null ? partToPartRatio.parts.findIndex((d) => d === nth2.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;
  const matchedWhole = matchAgent(partToPartRatio.whole, a);
  return {
    ...a,
    agent: (matchedWhole || nth2 != null) && targetPartIndex != -1 ? partToPartRatio.parts[targetPartIndex] : partToPartRatio.whole,
    quantity: matchedWhole ? areNumbers(partToPartRatio.ratios) && isNumber(a.quantity) ? a.quantity / partToPartRatio.ratios.reduce((out, d) => out += d, 0) * partToPartRatio.ratios[targetPartIndex] : wrapToQuantity(`a.quantity / (${partToPartRatio.ratios.map((d, i) => `b.ratios[${i}]`).join(" + ")}) * b.ratios[${targetPartIndex}]`, { a, b: partToPartRatio }) : areNumbers(partToPartRatio.ratios) && isNumber(a.quantity) ? a.quantity / partToPartRatio.ratios[sourcePartIndex] * (nth2 != null ? partToPartRatio.ratios[targetPartIndex] : partToPartRatio.ratios.reduce((out, d) => out += d, 0)) : nth2 != null ? wrapToQuantity(`a.quantity / b.ratios[${sourcePartIndex}] * b.ratios[${targetPartIndex}]`, { a, b: partToPartRatio }) : wrapToQuantity(`a.quantity / b.ratios[${sourcePartIndex}] * (${partToPartRatio.ratios.map((d, i) => `b.ratios[${i}]`).join(" + ")})`, { a, b: partToPartRatio })
  };
}
function inferPartToPartRule(a, partToPartRatio, nth2) {
  const result = partToPartRule(a, partToPartRatio, nth2);
  const matchedWhole = matchAgent(partToPartRatio.whole, a);
  let sourcePartIndex = partToPartRatio.parts.findIndex((d) => matchAgent(d, a));
  const targetPartIndex = nth2 != null ? partToPartRatio.parts.findIndex((d) => d === nth2.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;
  if (sourcePartIndex == -1)
    sourcePartIndex = 0;
  const partsSum = `(${partToPartRatio.ratios.join(" + ")})`;
  return {
    name: partToPartRule.name,
    inputParameters: extractKinds(a, partToPartRatio, nth2),
    question: result.kind === "rate" ? `${computeQuestion(result.quantity)} ${result.agent}` : containerQuestion(result),
    result,
    options: areNumbers(partToPartRatio.ratios) && isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} / ${partsSum} * ${formatNumber(partToPartRatio.ratios[targetPartIndex])}`, result: formatNumber(result.quantity), ok: matchedWhole },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(partToPartRatio.ratios[sourcePartIndex])} * ${nth2 != null ? partToPartRatio.ratios[targetPartIndex] : partsSum}`, result: formatNumber(result.quantity), ok: !matchedWhole }
    ] : []
  };
}
function computeBalancedPartition(n, k, i) {
  if (i < 0 || i >= k) {
    throw new Error("Index out of range");
  }
  const q = Math.floor(n / k);
  const r = n % k;
  return i < r ? q + 1 : q;
}
function balancedPartitionRule(a, balanced, nth2) {
  if (!isNumber(a.quantity)) {
    throw "balancedPartitionRule is not supported by non quantity types";
  }
  const index = nth2?.agent != null ? balanced.parts.findIndex((d) => d === nth2.agent) : balanced.parts.length - 1;
  if (index === -1) {
    throw `No part found ${nth2?.agent ?? balanced.parts.length} - ${balanced.parts.join(",")}`;
  }
  const agent = balanced.parts[index];
  return {
    kind: "cont",
    agent: balanced.entity != null ? a.agent : agent,
    entity: balanced.entity != null ? balanced.entity.entity : a.entity,
    unit: balanced.entity != null ? balanced.entity.unit : a.unit,
    quantity: computeBalancedPartition(a.quantity, balanced.parts.length, index)
  };
}
function inferBalancedPartitionRule(a, balanced, nth2) {
  if (!isNumber(a.quantity)) {
    throw "balancedPartitionRule is not supported by non quantity types";
  }
  const result = balancedPartitionRule(a, balanced, nth2);
  return {
    name: balancedPartitionRule.name,
    inputParameters: extractKinds(a, balanced, nth2),
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(result.quantity) ? [] : []
  };
}
function inferToScaleRule(target, factor, last2) {
  const inverse = last2.kind === "scale-invert";
  const quantity = isNumber(target.quantity) && isNumber(factor.quantity) ? inverse ? target.quantity * 1 / factor.quantity : target.quantity * factor.quantity : inverse ? wrapToQuantity("target.quantity * 1 / factor.quantity", { target, factor }) : wrapToQuantity("target.quantity * factor.quantity", { target, factor });
  const result = {
    ...target,
    agent: last2.agent ?? target.agent,
    quantity
  };
  const moreOrLess = (quantity2) => inverse ? quantity2 <= 1 : quantity2 > 1;
  return {
    name: "scaleRule",
    inputParameters: extractKinds(target, factor, last2),
    question: isNumber(factor.quantity) ? `${moreOrLess(factor.quantity) ? "Zv\u011Bt\u0161i" : "Zmen\u0161i"} ${factor.quantity} kr\xE1t ${target.agent}.` : `${computeQuestion(result.quantity)}`,
    result,
    options: isNumber(target.quantity) && isNumber(factor.quantity) && isNumber(result.quantity) ? [
      {
        tex: inverse ? `${formatNumber(target.quantity)} / ${formatNumber(factor.quantity)}` : `${formatNumber(target.quantity)} * ${formatNumber(factor.quantity)}`,
        result: formatNumber(result.quantity),
        ok: true
      }
    ] : []
  };
}
function mapRationsByFactorRule(multi, quantity) {
  if (!areNumbers(multi.ratios)) {
    throw "ratios are not supported by non quantity types";
  }
  return { ...multi, ratios: multi.ratios.map((d) => d * quantity) };
}
function inferMapRatiosByFactorRule(multi, factor, inverse) {
  if (!areNumbers(multi.ratios) || !isNumber(factor.quantity)) {
    throw "ratios are not supported by non quantity types";
  }
  const quantity = inverse ? 1 / factor.quantity : factor.quantity;
  const result = mapRationsByFactorRule(multi, quantity);
  return {
    name: mapRationsByFactorRule.name,
    inputParameters: extractKinds(multi, factor),
    question: `${quantity > 1 ? "Rozn\xE1sob " : "Zkra\u0165 "} pom\u011Br \u010D\xEDslem ${quantity > 1 ? formatNumber(quantity) : formatNumber(1 / quantity)}`,
    result,
    options: []
  };
}
function nthPartFactorByRule(multi, factor, nthPart2) {
  if (!areNumbers(multi.ratios) || !isNumber(factor)) {
    throw "ratios are not supported by non quantity types";
  }
  if (factor < 1) {
    throw `Ratios can be only extended by positive quantity ${factor}.`;
  }
  const partIndex = multi.parts.indexOf(nthPart2.agent);
  const multiplePartByFactor = (arr) => arr.reduce((out, d, i) => {
    if (i === partIndex) {
      out.push(...[...Array(factor)].map((_) => d));
    } else
      out.push(d);
    return out;
  }, []);
  return {
    kind: "ratios",
    whole: multi.whole,
    parts: multiplePartByFactor(multi.parts),
    ratios: multiplePartByFactor(multi.ratios)
  };
}
function inferNthPartFactorByRule(multi, factor, nthPart2) {
  if (!areNumbers(multi.ratios) || !isNumber(factor.quantity)) {
    throw "ratios are not supported by non quantity types";
  }
  const result = nthPartFactorByRule(multi, factor.quantity, nthPart2);
  return {
    name: nthPartFactorByRule.name,
    inputParameters: extractKinds(multi, factor, nthPart2),
    question: `Roz\u0161\xED\u0159it pom\u011Br o ${nthPart2.agent} ${formatNumber(factor.quantity)} kr\xE1t ${formatEntity(factor.kind === "rate" ? factor.entity : factor)}`,
    result,
    options: []
  };
}
function nthPartScaleByRule(multi, factor, nthPart2) {
  if (!areNumbers(multi.ratios) || !isNumber(factor)) {
    throw "ratios are not supported by non quantity types";
  }
  if (factor < 1) {
    throw `Ratios can be only extended by positive quantity ${factor}.`;
  }
  const partIndex = multi.parts.indexOf(nthPart2.agent);
  const multiplePartByFactor = (arr) => arr.map((d, i) => i === partIndex ? d * factor : d);
  return {
    kind: "ratios",
    whole: multi.whole,
    parts: multi.parts,
    ratios: multiplePartByFactor(multi.ratios)
  };
}
function inferNthPartScaleByRule(multi, factor, nthPart2) {
  if (!areNumbers(multi.ratios) || !isNumber(factor.quantity)) {
    throw "ratios are not supported by non quantity types";
  }
  const result = nthPartScaleByRule(multi, factor.quantity, nthPart2);
  return {
    name: nthPartScaleByRule.name,
    inputParameters: extractKinds(multi, factor, nthPart2),
    question: `Roz\u0161\xED\u0159it pom\u011Br o ${nthPart2.agent} ${formatNumber(factor.quantity)} kr\xE1t ${formatEntity(factor.kind === "rate" ? factor.entity : factor)}`,
    result,
    options: []
  };
}
function matchAgent(d, a) {
  return d === a.agent;
}
function partEqualRule(a, b) {
  if (!isNumber(a.quantity)) {
    throw "partEqual are not supported by non quantity types";
  }
  const diff = compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, abs(a.quantity), a.entity);
  const rest = compareDiffRule(b, diff);
  if (!isNumber(rest.quantity)) {
    throw "partEqual are not supported by non quantity types";
  }
  return {
    ...rest,
    quantity: rest.quantity / 2
  };
}
function inferPartEqualRule(a, b) {
  if (!isNumber(a.quantity)) {
    throw "partEqual are not supported by non quantity types";
  }
  const diff = compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, abs(a.quantity), a.entity);
  const result = partEqualRule(a, b);
  return {
    name: partEqualRule.name,
    inputParameters: extractKinds(a, b),
    question: containerQuestion(result),
    result,
    options: isNumber(b.quantity) && isNumber(a.quantity) && isNumber(diff.quantity) ? [
      { tex: `(${formatNumber(b.quantity)} - ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity - diff.quantity) / 2), ok: b.agent === diff.agentMinuend },
      { tex: `(${formatNumber(b.quantity)} + ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity + diff.quantity) / 2), ok: b.agent !== diff.agentMinuend }
    ] : []
  };
}
function nthTermRule(a, b) {
  if (!isNumber(a.quantity)) {
    throw "nthTermRule are not supported by non quantity types";
  }
  const [first, second] = b.type.sequence;
  return {
    kind: "cont",
    agent: a.agent,
    entity: b.entity,
    quantity: b.type.kind === "arithmetic" ? first + (a.quantity - 1) * b.type.commonDifference : b.type.kind === "quadratic" ? nthQuadraticElementFromDifference(first, second, b.type.secondDifference, a.quantity) : b.type.kind === "geometric" ? first * Math.pow(b.type.commonRatio, a.quantity - 1) : NaN
  };
}
function nthTermExpressionRuleEx(a, b) {
  if (!isNumber(a.quantity)) {
    throw "nthTermExpressionRule are not supported by non quantity types";
  }
  return evalToQuantityRule([a], {
    predicate: {
      kind: "cont",
      agent: a.agent,
      entity: b.entity
    },
    expression: b.nthTerm
  });
}
function inferNthTermRule(a, b) {
  const result = b.kind === "pattern" ? nthTermExpressionRuleEx(a, b) : nthTermRule(a, b);
  return {
    name: nthTermRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypo\u010Dti ${result.entity}?`,
    result,
    options: isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: b.kind === "pattern" ? b.nthTermDescription ?? b.nthTerm : formatSequence(b.type, a.quantity), result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function nthPositionRule(a, b, newEntity = "nth") {
  if (!isNumber(a.quantity)) {
    throw "nthTermRule are not supported by non quantity types";
  }
  const { kind, sequence } = b.type;
  const [first, second] = sequence;
  return {
    kind: "cont",
    agent: a.agent,
    entity: newEntity,
    quantity: kind === "arithmetic" ? Math.round((a.quantity - first) / b.type.commonDifference) + 1 : kind === "quadratic" ? findPositionInQuadraticSequence(a.quantity, first, second, b.type.secondDifference) : kind === "geometric" ? Math.round(Math.log(a.quantity / first) / Math.log(b.type.commonRatio)) + 1 : NaN
  };
}
function nthPositionExpressionRuleEx(a, b, newEntity = "nth") {
  if (!isNumber(a.quantity)) {
    throw "nthPositionExpressionRuleEx are not supported by non quantity types";
  }
  return evalToQuantityRule([a], {
    predicate: {
      kind: "cont",
      agent: a.agent,
      entity: newEntity
    },
    expression: b.nthPosition
  });
}
function inferNthPositionRule(a, b, newEntity = "nth") {
  const result = b.kind === "pattern" ? nthPositionExpressionRuleEx(a, b, newEntity) : nthPositionRule(a, b, newEntity);
  return {
    name: nthPositionRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypo\u010Dti pozici ${result.agent} = ${formatEntity(a)}?`,
    result,
    options: isNumber(result.quantity) ? [
      { tex: "Dle vzorce", result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function isQuestion(value) {
  return value?.result != null;
}
function inferenceRule(...args) {
  const value = inferenceRuleEx(...args);
  return isQuestion(value) ? value.result : value;
}
function inferenceRuleWithQuestion(children) {
  if (children.length < 1) {
    throw "inferenceRuleWithQuestion requires at least one child";
  }
  const last2 = children[children.length - 1];
  const predicates = children.slice(0, -1);
  const result = predicates.length > 1 ? inferenceRuleEx(...predicates) : null;
  return result == null ? {
    name: predicates.find((d) => d.kind == "common-sense") != null ? "commonSense" : "unknownRule",
    inputParamters: predicates.map((d) => d.kind),
    question: last2.kind === "cont" ? containerQuestion(last2) : last2.kind === "comp" ? `${computeQuestion(last2.quantity)} porovn\xE1n\xED ${last2.agentA} a ${last2.agentB}` : last2.kind === "ratio" ? `Vyj\xE1d\u0159i jako pom\u011Br ${last2.part} k ${last2.whole}` : "Co lze vyvodit na z\xE1klad\u011B zadan\xFDch p\u0159edpoklad\u016F?",
    result: last2,
    options: []
  } : result;
}
function inferenceRuleEx(...args) {
  const [a, b, ...rest] = args;
  const last2 = rest?.length > 0 ? rest[rest.length - 1] : null;
  const kind = last2?.kind;
  if (last2 == null && a.kind == "eval-expr") {
    return inferEvalToQuantityRule([], a);
  }
  if (["sum-combine", "sum", "product-combine", "product", "gcd", "lcd", "sequence", "tuple", "eval-expr", "eval-formula", "alligation"].includes(last2?.kind)) {
    const arr = [a, b].concat(rest.slice(0, -1));
    if (last2.kind === "sequence")
      return inferToSequenceRule(arr);
    if (last2.kind === "gcd")
      return inferGcdRule(arr, last2);
    if (last2.kind === "lcd")
      return inferLcdRule(arr, last2);
    if (last2.kind === "eval-expr" || last2.kind === "eval-formula")
      return inferEvalToQuantityRule(arr, last2);
    if (last2.kind === "tuple")
      return tupleRule(arr, last2);
    if (["product-combine", "product"].includes(last2.kind))
      return inferProductRule(arr, last2);
    if (["sum-combine", "sum"].includes(last2.kind))
      return inferSumRule(arr, last2);
    if (last2.kind === "alligation")
      return inferAlligationRule(arr, last2);
    return null;
  } else if (last2?.kind === "ratios" && args.length > 3) {
    const arr = [a, b].concat(rest.slice(0, -1));
    if (arr.every((d) => d.kind === "comp-ratio"))
      return inferConvertRatioCompareToRatiosRule(arr, last2);
    if (arr.every((d) => d.kind === "cont"))
      return inferToRatiosRule(arr, last2);
    return null;
  } else if (a.kind === "eval-option" || b.kind === "eval-option") {
    if (a.kind === "eval-option") {
      return b.kind == "quota" ? inferEvalQuotaRemainderExprRule(b, a) : inferEvalToOptionRule(b, a);
    } else if (b.kind === "eval-option") {
      return a.kind == "quota" ? inferEvalQuotaRemainderExprRule(a, b) : inferEvalToOptionRule(a, b);
    } else {
      return null;
    }
  } else if (a.kind === "cont" && b.kind == "cont") {
    if (kind === "comp-diff")
      return inferToCompareDiffRule(a, b);
    if (kind === "scale" || kind === "scale-invert")
      return inferToScaleRule(a, b, last2);
    if (kind === "slide" || kind === "slide-invert")
      return infetToSlideRule(a, b, last2);
    if (kind === "diff")
      return inferToDifferenceRule(a, b, last2);
    if (kind === "quota")
      return inferToQuotaRule(a, b);
    if (kind === "delta")
      return inferToDeltaRule(a, b, last2);
    if (kind === "pythagoras")
      return inferPythagorasRule(a, b, last2);
    if (kind === "triangle-angle")
      return inferTriangleAngleRule(a, b, last2);
    if (kind === "rate")
      return inferToRateRule(a, b, last2);
    if (kind === "ratios")
      return inferToRatiosRule([a, b], last2);
    if (kind === "comp-ratio")
      return inferToRatioCompareRule(a, b, last2);
    if (kind === "ratio")
      return inferToPartWholeRatio(a, b, last2);
    if (kind === "linear-equation")
      return inferSolveEquationRule(a, b, last2);
    return inferToCompareRule(a, b);
  } else if (a.kind === "comp-ratio" && b.kind === "comp-ratio" && kind === "ratios") {
    return inferConvertRatioCompareToRatiosRule([a, b], last2);
  } else if ((a.kind === "comp-ratio" || a.kind === "cont") && b.kind === "simplify-expr") {
    return inferSimplifyExprRule(a, b);
  } else if (a.kind === "simplify-expr" && (b.kind === "comp-ratio" || b.kind === "cont")) {
    return inferSimplifyExprRule(b, a);
  } else if (a.kind === "cont" && (b.kind === "eval-expr" || b.kind === "eval-formula")) {
    return inferEvalToQuantityRule([a], b);
  } else if ((a.kind === "eval-expr" || a.kind === "eval-formula") && b.kind === "cont") {
    return inferEvalToQuantityRule([b], a);
  } else if (a.kind === "rate" && b.kind === "rate" && last2?.kind === "ratios") {
    return inferToRatiosRule([a, b], last2);
  } else if (a.kind === "rate" && b.kind === "rate" && last2?.kind === "linear-equation") {
    return inferSolveEquationRule(a, b, last2);
  } else if (a.kind === "rate" && b.kind === "rate" && last2?.kind === "rate") {
    return inferTrasitiveRateRule(a, b, last2);
  } else if ((a.kind === "cont" || a.kind === "comp") && b.kind === "unit") {
    return inferConvertToUnitRule(a, b);
  } else if (a.kind === "unit" && (b.kind === "cont" || b.kind === "comp")) {
    return inferConvertToUnitRule(b, a);
  } else if (a.kind === "cont" && b.kind === "round") {
    return inferRoundToRule(a, b);
  } else if (a.kind === "round" && b.kind === "cont") {
    return inferRoundToRule(b, a);
  } else if (a.kind === "cont" && (b.kind === "number-fraction-part" || b.kind === "number-decimal-part")) {
    return inferSplitDecimalAndFractionPartsRule(a, b);
  } else if ((a.kind === "number-fraction-part" || a.kind === "number-decimal-part") && b.kind === "cont") {
    return inferSplitDecimalAndFractionPartsRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-angle") {
    return inferAngleCompareRule(a, b);
  } else if (a.kind === "comp-angle" && b.kind === "cont") {
    return inferAngleCompareRule(b, a);
  } else if (a.kind === "convert-percent" && b.kind === "ratio") {
    return inferTogglePartWholeAsPercentRule(b);
  } else if (a.kind === "ratio" && b.kind === "convert-percent") {
    return inferTogglePartWholeAsPercentRule(a);
  } else if (a.kind === "ratio" && b.kind === "ratio") {
    return kind === "diff" ? inferToDifferenceAsRatioRule(a, b, last2) : kind === "comp-ratio" ? inferToPartWholeCompareRule(a, b) : inferTransitiveRatioRule(a, b);
  } else if (a.kind === "comp" && b.kind === "cont") {
    return kind === "comp-part-eq" ? inferPartEqualRule(a, b) : inferCompareRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp") {
    return kind === "comp-part-eq" ? inferPartEqualRule(b, a) : inferCompareRule(a, b);
  } else if ((a.kind === "cont" || a.kind === "quota" || a.kind === "rate") && b.kind == "rate") {
    return inferRateRule(a, b);
  } else if (a.kind === "rate" && (b.kind == "cont" || b.kind === "quota" || b.kind === "rate")) {
    return inferRateRule(b, a);
  } else if (a.kind === "comp" && b.kind == "comp-ratio") {
    return kind === "comp" ? inferTransitiveCompareRule(a, b) : inferRatioCompareToCompareRule(b, a, kind === "nth-part" && last2);
  } else if (a.kind === "comp-ratio" && b.kind == "comp") {
    return kind === "comp" ? inferTransitiveCompareRule(b, a) : inferRatioCompareToCompareRule(a, b, kind === "nth-part" && last2);
  } else if (a.kind === "comp" && b.kind == "ratios") {
    return inferCompRatiosToCompRule(b, a, kind === "nth-part" && last2);
  } else if (a.kind === "ratios" && b.kind == "comp") {
    return inferCompRatiosToCompRule(a, b, kind === "nth-part" && last2);
  } else if (a.kind === "ratios-invert" && b.kind == "ratios") {
    return inferInvertRatiosRule(b, a);
  } else if (a.kind === "ratios" && b.kind == "ratios-invert") {
    return inferInvertRatiosRule(a, b);
  } else if (a.kind === "reverse" && b.kind == "ratios") {
    return inferReverseRatiosRule(b, a);
  } else if (a.kind === "ratios" && b.kind == "reverse") {
    return inferReverseRatiosRule(a, b);
  } else if (a.kind === "proportion" && b.kind == "ratios") {
    return inferProportionTwoPartRatioRule(b, a);
  } else if (a.kind === "ratios" && b.kind == "proportion") {
    return inferProportionTwoPartRatioRule(a, b);
  } else if (a.kind === "proportion" && b.kind == "comp-ratio") {
    return inferProportionRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind == "proportion") {
    return inferProportionRule(a, b);
  } else if (a.kind === "cont" && b.kind == "quota") {
    return kind === "rate" ? inferToRateRule(a, b, last2) : inferQuotaRule(a, b);
  } else if (a.kind === "quota" && b.kind == "cont") {
    return kind === "rate" ? inferToRateRule(b, a, last2) : inferQuotaRule(b, a);
  } else if (a.kind === "comp-ratio" && (b.kind === "cont" || b.kind === "rate")) {
    return inferRatioCompareRule(b, a, kind === "nth-part" && last2);
  } else if ((a.kind === "cont" || a.kind === "rate") && b.kind === "comp-ratio") {
    return inferRatioCompareRule(a, b, kind === "nth-part" && last2);
  } else if (a.kind === "comp-ratio" && b.kind === "convert-percent") {
    return inferConvertPercentRule(a);
  } else if (a.kind === "convert-percent" && b.kind === "comp-ratio") {
    return inferConvertPercentRule(b);
  } else if (a.kind === "complement-comp-ratio" && b.kind === "ratio") {
    return inferConvertPartWholeToRatioCompareRule(b, a);
  } else if (a.kind === "ratio" && b.kind === "complement-comp-ratio") {
    return inferConvertPartWholeToRatioCompareRule(a, b);
  } else if (a.kind === "comp-ratio" && b.kind === "ratio") {
    return b.ratio == null ? inferConvertRatioCompareToRatioRule(a) : inferPartWholeCompareRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "comp-ratio") {
    return a.ratio == null ? inferConvertRatioCompareToRatioRule(b) : inferPartWholeCompareRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "ratios") {
    return a.ratio == null ? inferConvertTwoPartRatioToRatioCompareRule(b, a) : inferConvertRatioCompareToTwoPartRatioRule(a, b, kind === "ratios-base" && last2);
  } else if (a.kind === "ratios" && b.kind === "comp-ratio") {
    return b.ratio == null ? inferConvertTwoPartRatioToRatioCompareRule(a, b) : inferConvertRatioCompareToTwoPartRatioRule(b, a, kind === "ratios-base" && last2);
  } else if (a.kind === "comp-ratio" && b.kind === "invert-comp-ratio") {
    return inferInvertRatioCompareRule(a);
  } else if (a.kind === "invert-comp-ratio" && b.kind === "comp-ratio") {
    return inferInvertRatioCompareRule(b);
  } else if (a.kind === "comp-ratio" && b.kind === "comp-ratio") {
    return kind === "diff" ? inferToDifferenceAsRatioRule(a, b, last2) : inferTransitiveRatioCompareRule(a, b);
  } else if (a.kind === "cont" && b.kind === "ratio") {
    return inferPartToWholeRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "cont") {
    return inferPartToWholeRule(b, a);
  } else if (a.kind === "complement" && b.kind === "ratio") {
    return inferPartWholeComplementRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "complement") {
    return inferPartWholeComplementRule(b, a);
  } else if (a.kind === "nth-part" && b.kind === "ratios") {
    return kind === "ratio" ? inferConvertPartToPartToPartWholeRule(a, b, last2) : null;
  } else if (a.kind === "ratios" && b.kind === "nth-part") {
    return kind === "ratio" ? inferConvertPartToPartToPartWholeRule(b, a, last2) : null;
  } else if (a.kind === "rate" && b.kind == "ratios") {
    if (kind === "nth-factor") {
      return inferNthPartFactorByRule(b, a, last2);
    } else if (kind === "nth-scale") {
      return inferNthPartScaleByRule(b, a, last2);
    } else {
      return inferPartToPartRule(a, b, kind === "nth-part" && last2);
    }
  } else if (a.kind === "ratios" && b.kind == "rate") {
    if (kind === "nth-factor") {
      return inferNthPartFactorByRule(a, b, last2);
    } else if (kind === "nth-scale") {
      return inferNthPartScaleByRule(a, b, last2);
    } else {
      return inferPartToPartRule(b, a, kind === "nth-part" && last2);
    }
  } else if (a.kind === "cont" && b.kind == "balanced-partition") {
    return inferBalancedPartitionRule(a, b, kind === "nth-part" && last2);
  } else if (a.kind === "balanced-partition" && b.kind == "cont") {
    return inferBalancedPartitionRule(b, a, kind === "nth-part" && last2);
  } else if (a.kind === "cont" && b.kind == "ratios") {
    return kind === "scale" ? inferMapRatiosByFactorRule(b, a) : kind === "scale-invert" ? inferMapRatiosByFactorRule(b, a, true) : kind === "nth-factor" ? inferNthPartFactorByRule(b, a, last2) : kind === "nth-part" ? inferPartToPartRule(a, b, last2) : inferPartToPartRule(a, b);
  } else if (a.kind === "ratios" && b.kind == "cont") {
    return kind === "scale" ? inferMapRatiosByFactorRule(a, b) : kind === "scale-invert" ? inferMapRatiosByFactorRule(a, b, true) : kind === "nth-factor" ? inferNthPartFactorByRule(a, b, last2) : kind === "nth-part" ? inferPartToPartRule(b, a, last2) : inferPartToPartRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-diff") {
    return inferCompareDiffRule(a, b);
  } else if (a.kind === "comp-diff" && b.kind === "cont") {
    return inferCompareDiffRule(b, a);
  } else if (a.kind === "sequence" && b.kind === "cont") {
    return kind === "nth" ? inferNthPositionRule(b, a, last2.entity) : inferNthTermRule(b, a);
  } else if (a.kind === "cont" && b.kind === "sequence") {
    return kind === "nth" ? inferNthPositionRule(a, b, last2.entity) : inferNthTermRule(a, b);
  } else if (a.kind === "pattern" && b.kind === "cont") {
    return kind === "nth" ? inferNthPositionRule(b, a, last2.entity) : inferNthTermRule(b, a);
  } else if (a.kind === "cont" && b.kind === "pattern") {
    return kind === "nth" ? inferNthPositionRule(a, b, last2.entity) : inferNthTermRule(a, b);
  } else if (a.kind === "cont" && b.kind === "transfer") {
    return inferTransferRule(a, b, "after");
  } else if (a.kind === "transfer" && b.kind === "cont") {
    return inferTransferRule(b, a, "before");
  } else if (a.kind === "cont" && b.kind === "delta") {
    return inferDeltaRule(a, b, "after");
  } else if (a.kind === "delta" && b.kind === "cont") {
    return inferDeltaRule(b, a, "before");
  } else if (a.kind === "comp" && b.kind === "delta") {
    return inferConvertCompareToDeltaRule(a, b);
  } else if (a.kind === "delta" && b.kind === "comp") {
    return inferConvertDeltaToCompareRule(a, b);
  } else if (a.kind === "comp" && b.kind === "comp") {
    return inferCompareToRateRule(b, a, kind === "rate" && last2);
  } else {
    return null;
  }
}
function abs(v) {
  return Math.abs(v);
}
function gcdCalc(numbers) {
  let num = 2, res = 1;
  while (num <= Math.min(...numbers)) {
    if (numbers.every((n) => n % num === 0)) {
      res = num;
    }
    num++;
  }
  return res;
}
function lcdCalcEx(a, b) {
  return abs(a * b) / gcdCalc([a, b]);
}
function lcdCalc(numbers) {
  return numbers.reduce((acc, num) => lcdCalcEx(acc, num), 1);
}
function sequencer(sequence) {
  if (sequence.length < 2) {
    throw "Insufficient Data";
  }
  const commonDifference = sequence[1] - sequence[0];
  const isArithmetic = sequence.every(
    (_, i, arr) => i < 2 || arr[i] - arr[i - 1] === commonDifference
  );
  if (isArithmetic) {
    return {
      kind: "arithmetic",
      sequence,
      commonDifference
    };
  }
  const commonRatio = sequence[1] / sequence[0];
  const isGeometric = sequence.every(
    (_, i, arr) => i < 2 || arr[i] / arr[i - 1] === commonRatio
  );
  if (isGeometric) {
    return {
      kind: "geometric",
      sequence,
      commonRatio
    };
  }
  const differences = sequence.map(
    (_, i, arr) => i === 0 ? null : arr[i] - arr[i - 1]
  ).slice(1);
  const secondDifferences = differences.map(
    (_, i, arr) => i === 0 ? null : arr[i] - arr[i - 1]
  ).slice(1);
  const isQuadratic = secondDifferences.every(
    (value) => value === secondDifferences[0]
  );
  if (isQuadratic) {
    const [a, b] = sequence;
    return {
      kind: "quadratic",
      sequence,
      secondDifference: secondDifferences[0]
    };
  }
  throw "Unknown Sequence";
}
function nthQuadraticElements(firstElement, secondElement, secondDifference) {
  const A = secondDifference / 2;
  const B = secondElement - firstElement - 3 * A;
  const C = firstElement - (A + B);
  return { A, B, C };
}
function nthQuadraticElementFromDifference(firstElement, secondElement, secondDifference, n) {
  const { A, B, C } = nthQuadraticElements(firstElement, secondElement, secondDifference);
  return A * n ** 2 + B * n + C;
}
function findPositionInQuadraticSequence(nthTermValue, first, second, secondDifference) {
  const A = secondDifference / 2;
  const B = second - first - 3 * A;
  const C = first - A - B;
  const delta2 = B ** 2 - 4 * A * (C - nthTermValue);
  if (delta2 < 0) {
    throw new Error("No valid position exists for the given values.");
  }
  const n1 = (-B + Math.sqrt(delta2)) / (2 * A);
  const n2 = (-B - Math.sqrt(delta2)) / (2 * A);
  if (Number.isInteger(n1) && n1 > 0)
    return n1;
  if (Number.isInteger(n2) && n2 > 0)
    return n2;
  throw new Error("The given values do not correspond to a valid position in the sequence.");
}
function primeFactorization(numbers) {
  const getPrimeFactors = (num) => {
    const factors = [];
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
function gcdFromPrimeFactors(primeFactors2) {
  const intersection = (arr1, arr2) => {
    const result = [];
    const countMap = /* @__PURE__ */ new Map();
    for (const num of arr1) {
      countMap.set(num, (countMap.get(num) || 0) + 1);
    }
    for (const num of arr2) {
      if (countMap.get(num)) {
        result.push(num);
        countMap.set(num, countMap.get(num) - 1);
      }
    }
    return result;
  };
  return primeFactors2.reduce((acc, curr) => intersection(acc, curr), primeFactors2[0] || []);
}
function lcdFromPrimeFactors(primeFactors2) {
  const union = (arr1, arr2) => {
    const result = [];
    const countMap = /* @__PURE__ */ new Map();
    for (const num of arr1) {
      countMap.set(num, (countMap.get(num) || 0) + 1);
    }
    for (const num of arr2) {
      countMap.set(num, Math.max(countMap.get(num) || 0, (countMap.get(num) || 0) + 1));
    }
    for (const [num, count] of countMap.entries()) {
      for (let i = 0; i < count; i++) {
        result.push(num);
      }
    }
    return result;
  };
  return primeFactors2.reduce((acc, curr) => union(acc, curr), []);
}
function ratiosToBaseForm(ratios2) {
  let precision = 1e6;
  let nums = ratios2.map((r) => Math.round(r * precision));
  function gcd2(a, b) {
    return b === 0 ? a : gcd2(b, a % b);
  }
  let overallGCD = nums.reduce((a, b) => gcd2(a, b));
  return nums.map((v) => v / overallGCD);
}
function computeOtherAngle(angle1, relationship) {
  switch (relationship) {
    case "complementary":
      return 90 - angle1;
    case "supplementary":
    case "sameSide":
      return 180 - angle1;
    case "opposite":
    case "corresponding":
    case "alternate":
    case "alternate-interior":
    case "alternate-exterior":
    case "axially-symmetric":
    case "isosceles-triangle-at-the-base":
    case "equilateral-triangle":
      return angle1;
    default:
      throw "Unknown Angle Relationship";
  }
}
function formatAngle(relationship) {
  switch (relationship) {
    case "complementary":
      return "dopl\u0148kov\xFD";
    case "supplementary":
      return "vedlej\u0161\xED";
    case "sameSide":
      return "p\u0159ilehl\xFD";
    case "opposite":
      return "vrcholov\xFD";
    case "corresponding":
      return "souhlasn\xFD";
    case "alternate":
      return "st\u0159\xEDdav\xFD";
    case "alternate-interior":
      return "st\u0159\xEDdav\xFD vnit\u0159n\xED";
    case "alternate-exterior":
      return "st\u0159\xEDdav\xFD vn\u011Bj\u0161\xED";
    case "axially-symmetric":
      return "osov\u011B soum\u011Brn\xFD";
    case "isosceles-triangle-at-the-base":
      return "schodnost \xFAhl\u016F p\u0159i z\xE1kadn\u011B rovnoramenn\xE9ho troj\xFAheln\xEDku";
    case "equilateral-triangle":
      return "schodnost v\u0161ech \xFAhl\u016F v rovnostrann\xE9m troj\xFAheln\xEDku";
    default:
      throw "Nezn\xE1m\xFD vztah";
  }
}
function formatSequence(type, n) {
  const simplify2 = (d, op = "") => d !== 1 ? `${d}${op}` : "";
  if (type.kind === "arithmetic")
    return `${type.sequence[0]} + ${type.commonDifference}(${formatNumber(n)}-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements(first, second, type.secondDifference);
    let parts = [`${simplify2(A, "*")}${formatNumber(n)}^2^`];
    if (B !== 0) {
      parts = parts.concat(`${simplify2(B, "*")}${formatNumber(n)}`);
    }
    if (C !== 0) {
      parts = parts.concat(`${simplify2(C, "*")}${formatNumber(n)}`);
    }
    return `${parts.map((d, i) => `${i !== 0 ? " + " : ""}${d}`).join(" ")}`;
  }
  if (type.kind === "geometric") {
    return `${simplify2(type.sequence[0], "*")}${type.commonRatio}^(${formatNumber(n)}-1)^`;
  }
}
function sequenceOptions(seqType) {
  return [
    { tex: "stejn\xFD rozd\xEDl", result: `${seqType.kind === "arithmetic" ? formatNumber(seqType.commonDifference) : "chybn\u011B"}`, ok: seqType.kind === "arithmetic" },
    { tex: "stejn\xFD druh\xFD rozd\xEDl", result: `${seqType.kind === "quadratic" ? formatNumber(seqType.secondDifference) : "chybn\u011B"}`, ok: seqType.kind === "quadratic" },
    { tex: "stejn\xFD pom\u011Br", result: `${seqType.kind === "geometric" ? formatNumber(seqType.commonRatio) : "chybn\u011B"}`, ok: seqType.kind === "geometric" }
  ];
}
function formatSequencePattern(seqType) {
  const d = sequenceOptions(seqType).find((d2) => d2.ok === true);
  return d != null ? `${d.tex} = ${d.result}` : "N/A";
}
function isEntityBase(value) {
  return value.entity != null;
}
function toEntity(entity3) {
  return isEntityBase(entity3) ? entity3 : { entity: entity3 };
}
function isSameEntity(f, s) {
  return f.entity == s.entity && f.unit == s.unit;
}
function extractKinds(...args) {
  return args.filter((d) => d != null).map((d) => d.kind);
}
function isNumber(quantity) {
  return typeof quantity === "number";
}
function isExpressionNode(quantity) {
  return quantity?.expression != null;
}
function areNumbers(ratios2) {
  return ratios2.every((d) => isNumber(d));
}
function areTupleNumbers(ratios2) {
  return ratios2.every((d) => d.every((d2) => isNumber(d2)));
}
function wrapToQuantity(expression, context) {
  return { expression, context: convertContext(context) };
}
function wrapToRatio(expression, context) {
  return { expression, context: convertContext(context) };
}
function convertContext(context) {
  return Object.fromEntries(Object.entries(context).map(([key, value]) => [key, convertRatioKeysToFractions(value)]));
}
function convertRatioKeysToFractions(obj) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, key === "ratio" ? helpers.convertToFraction(value) : value]));
}
function formatNumber(d) {
  return d.toLocaleString("cs-CZ", { maximumFractionDigits: 6, minimumFractionDigits: 0 });
}
function formatRatio(d, asPercent) {
  if (asPercent)
    return `${formatNumber(d * 100)} %`;
  return helpers.convertToFraction(d);
}
function containerQuestion(d) {
  return `${computeQuestion(d.quantity)} ${d.agent}${formatEntity(d)}?`;
}
function computeQuestion(d) {
  return isNumber(d) ? "Vypo\u010Dti" : "Vyj\xE1d\u0159i v\xFDrazem s prom\u011Bnnou";
}
function toGenerAgent(a) {
  return {
    kind: "cont",
    agent: a.entity,
    quantity: a.quantity,
    entity: ""
  };
}
function formatEntity(d) {
  return d.entity || d.unit ? `(${[d.unit, d.entity].filter((d2) => d2 != null && d2 != "").join(" ")})` : "";
}
function resultAsQuestion(result, { name, inputParamters }) {
  return {
    name,
    inputParameters: inputParamters,
    question: "",
    result,
    options: []
  };
}
function formatOrder(order) {
  switch (order) {
    case 1:
      return "jednotky";
    case 10:
      return "des\xEDtky";
    case 100:
      return "stovky";
    case 1e3:
      return "tis\xEDce";
    default:
      return order;
  }
}
function getAgentName(agent, transferOrder) {
  const name = transferOrder === "before" ? agent.nameBefore : agent.nameAfter;
  return name ?? agent.name;
}
function range(size, startAt = 0) {
  return [...Array(size).keys()].map((i) => i + startAt);
}
var unique = (value, index, array) => array.indexOf(value) === index;
var formulaRegistry = {
  circumReference: {
    square: {
      name: "Obvod \u010Dtverce",
      description: "Vypo\u010D\xEDt\xE1 obvod \u010Dtverce ze strany a, nebo stranu z obvodu.",
      params: ["o", "a"],
      formula: {
        "o": "4 * a",
        "a": "o / 4"
      }
    },
    rectangle: {
      name: "Obvod obd\xE9ln\xEDku",
      description: "Vypo\u010D\xEDt\xE1 obvod obd\xE9ln\xEDku ze stran a, b nebo nezn\xE1mou stranu.",
      params: ["o", "a", "b"],
      formula: {
        "o": "2 * (a + b)",
        "a": "(o / 2) - b",
        "b": "(o / 2) - a"
      }
    },
    circle: {
      name: "Obvod kruhu (d\xE9lka kru\u017Enice)",
      description: "Vypo\u010D\xEDt\xE1 obvod kruhu z polom\u011Bru nebo pr\u016Fm\u011Bru.",
      params: ["o", "r", "d"],
      formula: {
        "o": "2 * \u03C0 * r",
        "r": "o / (2 * \u03C0)",
        "d": "o / \u03C0"
      }
    },
    triangle: {
      name: "Obvod troj\xFAheln\xEDku",
      description: "Vypo\u010D\xEDt\xE1 obvod troj\xFAheln\xEDku z d\xE9lek stran.",
      params: ["o", "a", "b", "c"],
      formula: {
        "o": "a + b + c",
        "a": "o - (b + c)",
        "b": "o - (a + c)",
        "c": "o - (a + b)"
      }
    }
  },
  surfaceArea: {
    circle: {
      name: "Obsah kruhu",
      description: "Vzorce pro obsah kruhu",
      params: ["S", "o", "r", "d"],
      formula: {
        "S": "\u03C0 * r^2",
        "r": "sqrt(S / \u03C0)",
        // Poloměr z obsahu
        "d": "2 * sqrt(S / \u03C0)"
      }
    },
    square: {
      name: "Obsah \u010Dtverce",
      description: "Vypo\u010D\xEDt\xE1 obsah \u010Dtverce ze strany a, nebo stranu z obsahu.",
      params: ["S", "a"],
      formula: {
        "S": "a^2",
        "a": "sqrt(S)"
      }
    },
    rectangle: {
      name: "Obsah obd\xE9ln\xEDku",
      description: "Vypo\u010D\xEDt\xE1 obsah obd\xE9ln\xEDku ze stran a, b nebo nezn\xE1mou stranu.",
      params: ["S", "a", "b"],
      formula: {
        "S": "a * b",
        "a": "S / b",
        "b": "S / a"
      }
    },
    triangle: {
      name: "Obsah troj\xFAheln\xEDku",
      description: "Obsah z d\xE9lky z\xE1kladny a v\xFD\u0161ky.",
      params: ["S", "b", "h"],
      formula: {
        "S": "1/2 * b * h",
        "b": "2 * S / h",
        "h": "2 * S / b"
      }
    },
    cube: {
      name: "Povrch krychle",
      description: "Vypo\u010D\xEDt\xE1 povrch krychle ze strany a.",
      params: ["S", "a"],
      formula: {
        "S": "6 * a^2",
        "a": "sqrt(S / 6)"
      }
    },
    cuboid: {
      name: "Povrch kv\xE1dru",
      description: "Vypo\u010D\xEDt\xE1 povrch kv\xE1dru ze stran a, b a c.",
      params: ["S", "a", "b", "c"],
      formula: {
        "S": "2 * (a * b + a * c + b * c)",
        // Řešení pro neznámou stranu je složitější, ale lze ho přesto definovat:
        "a": "(S - 2 * b * c) / (2 * (b + c))",
        "b": "(S - 2 * a * c) / (2 * (a + c))",
        "c": "(S - 2 * a * b) / (2 * (a + b))"
      }
    },
    cylinder: {
      name: "Povrch v\xE1lce",
      description: "Vypo\u010D\xEDt\xE1 povrch v\xE1lce z polom\u011Bru r a v\xFD\u0161ky v.",
      params: ["S", "r", "v"],
      formula: {
        "S": "2 * \u03C0 * r * (r + v)",
        "v": "S / (2 * \u03C0 * r) - r"
        // Výpočet poloměru je kvadratická rovnice, pro jednoduchost zde není explicitní
      }
    },
    sphere: {
      name: "Povrch koule",
      description: "Vypo\u010D\xEDt\xE1 povrch koule z polom\u011Bru r.",
      params: ["S", "r"],
      formula: {
        "S": "4 * r^2 * \u03C0",
        "r": "sqrt(S / (4 * \u03C0))"
        // Poloměr z povrchu
      }
    }
  },
  // Kategorie vzorců pro objem
  volume: {
    // Formula for a cube
    cube: {
      name: "Objem krychle",
      formula: {
        "V": "a * a * a",
        "a": "V / (a * a)"
      },
      params: ["V", "a"],
      description: "Vypo\u010D\xEDt\xE1 objem krychle ze strany a nebo stranu z objemu."
    },
    // Vzorec pro kvádr
    cuboid: {
      name: "Objem kv\xE1dru",
      description: "Vypo\u010D\xEDt\xE1 objem kv\xE1dru nebo jednu stranu.",
      params: ["V", "a", "b", "c"],
      formula: {
        "V": "a * b * c",
        "a": "V / (b * c)",
        "b": "V / (a * c)",
        "c": "V / (a * b)"
      }
    },
    // Vzorec pro válec
    cylinder: {
      name: "Objem v\xE1lce",
      description: "Vypo\u010D\xEDt\xE1 objem v\xE1lce, polom\u011Br nebo v\xFD\u0161ku.",
      params: ["V", "r", "h"],
      formula: {
        "V": "\u03C0 * r^2 * h",
        "h": "V / (\u03C0 * r^2)",
        "r": "sqrt(V / (\u03C0 * h))"
      }
    },
    sphere: {
      name: "Objem koule",
      description: "Vypo\u010D\xEDt\xE1 objem koule z polom\u011Bru r.",
      params: ["V", "r"],
      formula: {
        "V": "(4/3) * r^3 * \u03C0 ",
        "r": "pow((3 * V) / (4 * \u03C0), 1/3)"
        // Poloměr z objemu (odmocnina třetího stupně)
      }
    },
    // Vzorec pro kvádr
    baseArea: {
      name: "Objem z podstavy",
      description: "Vypo\u010D\xEDt\xE1 objem z podstavy.",
      params: ["V", "S", "h"],
      formula: {
        "V": "S * h",
        "h": "V / S",
        "S": "V / h"
      }
    }
  },
  // Vzorce pro výpočty v = s/t
  speed: {
    name: "Rychlost, dr\xE1ha, \u010Das",
    description: "Vztah mezi rychlost\xED, dr\xE1hou a \u010Dasem.",
    params: ["v", "s", "t"],
    formula: {
      "s": "v * t",
      "v": "s / t",
      "t": "s / v"
    }
  },
  squareRoot: {
    name: "Druh\xE1 mocnina a odmocnina",
    description: "Vypo\u010D\xEDt\xE1 druhou mocninu nebo odmocninu.",
    params: ["y", "x"],
    formula: {
      "y": "x * x",
      // Alternativně 'x^2'
      "x": "sqrt(y)"
    }
  }
};

// node_modules/fraction.js/dist/fraction.mjs
if (typeof BigInt === "undefined")
  BigInt = function(n) {
    if (isNaN(n))
      throw new Error("");
    return n;
  };
var C_ZERO = BigInt(0);
var C_ONE = BigInt(1);
var C_TWO = BigInt(2);
var C_FIVE = BigInt(5);
var C_TEN = BigInt(10);
var MAX_CYCLE_LEN = 2e3;
var P = {
  "s": C_ONE,
  "n": C_ZERO,
  "d": C_ONE
};
function assign(n, s) {
  try {
    n = BigInt(n);
  } catch (e) {
    throw InvalidParameter();
  }
  return n * s;
}
function trunc(x) {
  return typeof x === "bigint" ? x : Math.floor(x);
}
function newFraction(n, d) {
  if (d === C_ZERO) {
    throw DivisionByZero();
  }
  const f = Object.create(Fraction.prototype);
  f["s"] = n < C_ZERO ? -C_ONE : C_ONE;
  n = n < C_ZERO ? -n : n;
  const a = gcd(n, d);
  f["n"] = n / a;
  f["d"] = d / a;
  return f;
}
function factorize(num) {
  const factors = {};
  let n = num;
  let i = C_TWO;
  let s = C_FIVE - C_ONE;
  while (s <= n) {
    while (n % i === C_ZERO) {
      n /= i;
      factors[i] = (factors[i] || C_ZERO) + C_ONE;
    }
    s += C_ONE + C_TWO * i++;
  }
  if (n !== num) {
    if (n > 1)
      factors[n] = (factors[n] || C_ZERO) + C_ONE;
  } else {
    factors[num] = (factors[num] || C_ZERO) + C_ONE;
  }
  return factors;
}
var parse = function(p1, p2) {
  let n = C_ZERO, d = C_ONE, s = C_ONE;
  if (p1 === void 0 || p1 === null) {
  } else if (p2 !== void 0) {
    if (typeof p1 === "bigint") {
      n = p1;
    } else if (isNaN(p1)) {
      throw InvalidParameter();
    } else if (p1 % 1 !== 0) {
      throw NonIntegerParameter();
    } else {
      n = BigInt(p1);
    }
    if (typeof p2 === "bigint") {
      d = p2;
    } else if (isNaN(p2)) {
      throw InvalidParameter();
    } else if (p2 % 1 !== 0) {
      throw NonIntegerParameter();
    } else {
      d = BigInt(p2);
    }
    s = n * d;
  } else if (typeof p1 === "object") {
    if ("d" in p1 && "n" in p1) {
      n = BigInt(p1["n"]);
      d = BigInt(p1["d"]);
      if ("s" in p1)
        n *= BigInt(p1["s"]);
    } else if (0 in p1) {
      n = BigInt(p1[0]);
      if (1 in p1)
        d = BigInt(p1[1]);
    } else if (typeof p1 === "bigint") {
      n = p1;
    } else {
      throw InvalidParameter();
    }
    s = n * d;
  } else if (typeof p1 === "number") {
    if (isNaN(p1)) {
      throw InvalidParameter();
    }
    if (p1 < 0) {
      s = -C_ONE;
      p1 = -p1;
    }
    if (p1 % 1 === 0) {
      n = BigInt(p1);
    } else if (p1 > 0) {
      let z = 1;
      let A = 0, B = 1;
      let C = 1, D = 1;
      let N = 1e7;
      if (p1 >= 1) {
        z = 10 ** Math.floor(1 + Math.log10(p1));
        p1 /= z;
      }
      while (B <= N && D <= N) {
        let M = (A + C) / (B + D);
        if (p1 === M) {
          if (B + D <= N) {
            n = A + C;
            d = B + D;
          } else if (D > B) {
            n = C;
            d = D;
          } else {
            n = A;
            d = B;
          }
          break;
        } else {
          if (p1 > M) {
            A += C;
            B += D;
          } else {
            C += A;
            D += B;
          }
          if (B > N) {
            n = C;
            d = D;
          } else {
            n = A;
            d = B;
          }
        }
      }
      n = BigInt(n) * BigInt(z);
      d = BigInt(d);
    }
  } else if (typeof p1 === "string") {
    let ndx = 0;
    let v = C_ZERO, w = C_ZERO, x = C_ZERO, y = C_ONE, z = C_ONE;
    let match = p1.replace(/_/g, "").match(/\d+|./g);
    if (match === null)
      throw InvalidParameter();
    if (match[ndx] === "-") {
      s = -C_ONE;
      ndx++;
    } else if (match[ndx] === "+") {
      ndx++;
    }
    if (match.length === ndx + 1) {
      w = assign(match[ndx++], s);
    } else if (match[ndx + 1] === "." || match[ndx] === ".") {
      if (match[ndx] !== ".") {
        v = assign(match[ndx++], s);
      }
      ndx++;
      if (ndx + 1 === match.length || match[ndx + 1] === "(" && match[ndx + 3] === ")" || match[ndx + 1] === "'" && match[ndx + 3] === "'") {
        w = assign(match[ndx], s);
        y = C_TEN ** BigInt(match[ndx].length);
        ndx++;
      }
      if (match[ndx] === "(" && match[ndx + 2] === ")" || match[ndx] === "'" && match[ndx + 2] === "'") {
        x = assign(match[ndx + 1], s);
        z = C_TEN ** BigInt(match[ndx + 1].length) - C_ONE;
        ndx += 3;
      }
    } else if (match[ndx + 1] === "/" || match[ndx + 1] === ":") {
      w = assign(match[ndx], s);
      y = assign(match[ndx + 2], C_ONE);
      ndx += 3;
    } else if (match[ndx + 3] === "/" && match[ndx + 1] === " ") {
      v = assign(match[ndx], s);
      w = assign(match[ndx + 2], s);
      y = assign(match[ndx + 4], C_ONE);
      ndx += 5;
    }
    if (match.length <= ndx) {
      d = y * z;
      s = /* void */
      n = x + d * v + z * w;
    } else {
      throw InvalidParameter();
    }
  } else if (typeof p1 === "bigint") {
    n = p1;
    s = p1;
    d = C_ONE;
  } else {
    throw InvalidParameter();
  }
  if (d === C_ZERO) {
    throw DivisionByZero();
  }
  P["s"] = s < C_ZERO ? -C_ONE : C_ONE;
  P["n"] = n < C_ZERO ? -n : n;
  P["d"] = d < C_ZERO ? -d : d;
};
function modpow(b, e, m) {
  let r = C_ONE;
  for (; e > C_ZERO; b = b * b % m, e >>= C_ONE) {
    if (e & C_ONE) {
      r = r * b % m;
    }
  }
  return r;
}
function cycleLen(n, d) {
  for (; d % C_TWO === C_ZERO; d /= C_TWO) {
  }
  for (; d % C_FIVE === C_ZERO; d /= C_FIVE) {
  }
  if (d === C_ONE)
    return C_ZERO;
  let rem = C_TEN % d;
  let t = 1;
  for (; rem !== C_ONE; t++) {
    rem = rem * C_TEN % d;
    if (t > MAX_CYCLE_LEN)
      return C_ZERO;
  }
  return BigInt(t);
}
function cycleStart(n, d, len) {
  let rem1 = C_ONE;
  let rem2 = modpow(C_TEN, len, d);
  for (let t = 0; t < 300; t++) {
    if (rem1 === rem2)
      return BigInt(t);
    rem1 = rem1 * C_TEN % d;
    rem2 = rem2 * C_TEN % d;
  }
  return 0;
}
function gcd(a, b) {
  if (!a)
    return b;
  if (!b)
    return a;
  while (1) {
    a %= b;
    if (!a)
      return b;
    b %= a;
    if (!b)
      return a;
  }
}
function Fraction(a, b) {
  parse(a, b);
  if (this instanceof Fraction) {
    a = gcd(P["d"], P["n"]);
    this["s"] = P["s"];
    this["n"] = P["n"] / a;
    this["d"] = P["d"] / a;
  } else {
    return newFraction(P["s"] * P["n"], P["d"]);
  }
}
var DivisionByZero = function() {
  return new Error("Division by Zero");
};
var InvalidParameter = function() {
  return new Error("Invalid argument");
};
var NonIntegerParameter = function() {
  return new Error("Parameters must be integer");
};
Fraction.prototype = {
  "s": C_ONE,
  "n": C_ZERO,
  "d": C_ONE,
  /**
   * Calculates the absolute value
   *
   * Ex: new Fraction(-4).abs() => 4
   **/
  "abs": function() {
    return newFraction(this["n"], this["d"]);
  },
  /**
   * Inverts the sign of the current fraction
   *
   * Ex: new Fraction(-4).neg() => 4
   **/
  "neg": function() {
    return newFraction(-this["s"] * this["n"], this["d"]);
  },
  /**
   * Adds two rational numbers
   *
   * Ex: new Fraction({n: 2, d: 3}).add("14.9") => 467 / 30
   **/
  "add": function(a, b) {
    parse(a, b);
    return newFraction(
      this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"],
      this["d"] * P["d"]
    );
  },
  /**
   * Subtracts two rational numbers
   *
   * Ex: new Fraction({n: 2, d: 3}).add("14.9") => -427 / 30
   **/
  "sub": function(a, b) {
    parse(a, b);
    return newFraction(
      this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"],
      this["d"] * P["d"]
    );
  },
  /**
   * Multiplies two rational numbers
   *
   * Ex: new Fraction("-17.(345)").mul(3) => 5776 / 111
   **/
  "mul": function(a, b) {
    parse(a, b);
    return newFraction(
      this["s"] * P["s"] * this["n"] * P["n"],
      this["d"] * P["d"]
    );
  },
  /**
   * Divides two rational numbers
   *
   * Ex: new Fraction("-17.(345)").inverse().div(3)
   **/
  "div": function(a, b) {
    parse(a, b);
    return newFraction(
      this["s"] * P["s"] * this["n"] * P["d"],
      this["d"] * P["n"]
    );
  },
  /**
   * Clones the actual object
   *
   * Ex: new Fraction("-17.(345)").clone()
   **/
  "clone": function() {
    return newFraction(this["s"] * this["n"], this["d"]);
  },
  /**
   * Calculates the modulo of two rational numbers - a more precise fmod
   *
   * Ex: new Fraction('4.(3)').mod([7, 8]) => (13/3) % (7/8) = (5/6)
   * Ex: new Fraction(20, 10).mod().equals(0) ? "is Integer"
   **/
  "mod": function(a, b) {
    if (a === void 0) {
      return newFraction(this["s"] * this["n"] % this["d"], C_ONE);
    }
    parse(a, b);
    if (C_ZERO === P["n"] * this["d"]) {
      throw DivisionByZero();
    }
    return newFraction(
      this["s"] * (P["d"] * this["n"]) % (P["n"] * this["d"]),
      P["d"] * this["d"]
    );
  },
  /**
   * Calculates the fractional gcd of two rational numbers
   *
   * Ex: new Fraction(5,8).gcd(3,7) => 1/56
   */
  "gcd": function(a, b) {
    parse(a, b);
    return newFraction(gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]), P["d"] * this["d"]);
  },
  /**
   * Calculates the fractional lcm of two rational numbers
   *
   * Ex: new Fraction(5,8).lcm(3,7) => 15
   */
  "lcm": function(a, b) {
    parse(a, b);
    if (P["n"] === C_ZERO && this["n"] === C_ZERO) {
      return newFraction(C_ZERO, C_ONE);
    }
    return newFraction(P["n"] * this["n"], gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]));
  },
  /**
   * Gets the inverse of the fraction, means numerator and denominator are exchanged
   *
   * Ex: new Fraction([-3, 4]).inverse() => -4 / 3
   **/
  "inverse": function() {
    return newFraction(this["s"] * this["d"], this["n"]);
  },
  /**
   * Calculates the fraction to some integer exponent
   *
   * Ex: new Fraction(-1,2).pow(-3) => -8
   */
  "pow": function(a, b) {
    parse(a, b);
    if (P["d"] === C_ONE) {
      if (P["s"] < C_ZERO) {
        return newFraction((this["s"] * this["d"]) ** P["n"], this["n"] ** P["n"]);
      } else {
        return newFraction((this["s"] * this["n"]) ** P["n"], this["d"] ** P["n"]);
      }
    }
    if (this["s"] < C_ZERO)
      return null;
    let N = factorize(this["n"]);
    let D = factorize(this["d"]);
    let n = C_ONE;
    let d = C_ONE;
    for (let k in N) {
      if (k === "1")
        continue;
      if (k === "0") {
        n = C_ZERO;
        break;
      }
      N[k] *= P["n"];
      if (N[k] % P["d"] === C_ZERO) {
        N[k] /= P["d"];
      } else
        return null;
      n *= BigInt(k) ** N[k];
    }
    for (let k in D) {
      if (k === "1")
        continue;
      D[k] *= P["n"];
      if (D[k] % P["d"] === C_ZERO) {
        D[k] /= P["d"];
      } else
        return null;
      d *= BigInt(k) ** D[k];
    }
    if (P["s"] < C_ZERO) {
      return newFraction(d, n);
    }
    return newFraction(n, d);
  },
  /**
   * Calculates the logarithm of a fraction to a given rational base
   *
   * Ex: new Fraction(27, 8).log(9, 4) => 3/2
   */
  "log": function(a, b) {
    parse(a, b);
    if (this["s"] <= C_ZERO || P["s"] <= C_ZERO)
      return null;
    const allPrimes = {};
    const baseFactors = factorize(P["n"]);
    const T1 = factorize(P["d"]);
    const numberFactors = factorize(this["n"]);
    const T2 = factorize(this["d"]);
    for (const prime in T1) {
      baseFactors[prime] = (baseFactors[prime] || C_ZERO) - T1[prime];
    }
    for (const prime in T2) {
      numberFactors[prime] = (numberFactors[prime] || C_ZERO) - T2[prime];
    }
    for (const prime in baseFactors) {
      if (prime === "1")
        continue;
      allPrimes[prime] = true;
    }
    for (const prime in numberFactors) {
      if (prime === "1")
        continue;
      allPrimes[prime] = true;
    }
    let retN = null;
    let retD = null;
    for (const prime in allPrimes) {
      const baseExponent = baseFactors[prime] || C_ZERO;
      const numberExponent = numberFactors[prime] || C_ZERO;
      if (baseExponent === C_ZERO) {
        if (numberExponent !== C_ZERO) {
          return null;
        }
        continue;
      }
      let curN = numberExponent;
      let curD = baseExponent;
      const gcdValue = gcd(curN, curD);
      curN /= gcdValue;
      curD /= gcdValue;
      if (retN === null && retD === null) {
        retN = curN;
        retD = curD;
      } else if (curN * retD !== retN * curD) {
        return null;
      }
    }
    return retN !== null && retD !== null ? newFraction(retN, retD) : null;
  },
  /**
   * Check if two rational numbers are the same
   *
   * Ex: new Fraction(19.6).equals([98, 5]);
   **/
  "equals": function(a, b) {
    parse(a, b);
    return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"];
  },
  /**
   * Check if this rational number is less than another
   *
   * Ex: new Fraction(19.6).lt([98, 5]);
   **/
  "lt": function(a, b) {
    parse(a, b);
    return this["s"] * this["n"] * P["d"] < P["s"] * P["n"] * this["d"];
  },
  /**
   * Check if this rational number is less than or equal another
   *
   * Ex: new Fraction(19.6).lt([98, 5]);
   **/
  "lte": function(a, b) {
    parse(a, b);
    return this["s"] * this["n"] * P["d"] <= P["s"] * P["n"] * this["d"];
  },
  /**
   * Check if this rational number is greater than another
   *
   * Ex: new Fraction(19.6).lt([98, 5]);
   **/
  "gt": function(a, b) {
    parse(a, b);
    return this["s"] * this["n"] * P["d"] > P["s"] * P["n"] * this["d"];
  },
  /**
   * Check if this rational number is greater than or equal another
   *
   * Ex: new Fraction(19.6).lt([98, 5]);
   **/
  "gte": function(a, b) {
    parse(a, b);
    return this["s"] * this["n"] * P["d"] >= P["s"] * P["n"] * this["d"];
  },
  /**
   * Compare two rational numbers
   * < 0 iff this < that
   * > 0 iff this > that
   * = 0 iff this = that
   *
   * Ex: new Fraction(19.6).compare([98, 5]);
   **/
  "compare": function(a, b) {
    parse(a, b);
    let t = this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"];
    return (C_ZERO < t) - (t < C_ZERO);
  },
  /**
   * Calculates the ceil of a rational number
   *
   * Ex: new Fraction('4.(3)').ceil() => (5 / 1)
   **/
  "ceil": function(places) {
    places = C_TEN ** BigInt(places || 0);
    return newFraction(
      trunc(this["s"] * places * this["n"] / this["d"]) + (places * this["n"] % this["d"] > C_ZERO && this["s"] >= C_ZERO ? C_ONE : C_ZERO),
      places
    );
  },
  /**
   * Calculates the floor of a rational number
   *
   * Ex: new Fraction('4.(3)').floor() => (4 / 1)
   **/
  "floor": function(places) {
    places = C_TEN ** BigInt(places || 0);
    return newFraction(
      trunc(this["s"] * places * this["n"] / this["d"]) - (places * this["n"] % this["d"] > C_ZERO && this["s"] < C_ZERO ? C_ONE : C_ZERO),
      places
    );
  },
  /**
   * Rounds a rational numbers
   *
   * Ex: new Fraction('4.(3)').round() => (4 / 1)
   **/
  "round": function(places) {
    places = C_TEN ** BigInt(places || 0);
    return newFraction(
      trunc(this["s"] * places * this["n"] / this["d"]) + this["s"] * ((this["s"] >= C_ZERO ? C_ONE : C_ZERO) + C_TWO * (places * this["n"] % this["d"]) > this["d"] ? C_ONE : C_ZERO),
      places
    );
  },
  /**
    * Rounds a rational number to a multiple of another rational number
    *
    * Ex: new Fraction('0.9').roundTo("1/8") => 7 / 8
    **/
  "roundTo": function(a, b) {
    parse(a, b);
    const n = this["n"] * P["d"];
    const d = this["d"] * P["n"];
    const r = n % d;
    let k = trunc(n / d);
    if (r + r >= d) {
      k++;
    }
    return newFraction(this["s"] * k * P["n"], P["d"]);
  },
  /**
   * Check if two rational numbers are divisible
   *
   * Ex: new Fraction(19.6).divisible(1.5);
   */
  "divisible": function(a, b) {
    parse(a, b);
    return !(!(P["n"] * this["d"]) || this["n"] * P["d"] % (P["n"] * this["d"]));
  },
  /**
   * Returns a decimal representation of the fraction
   *
   * Ex: new Fraction("100.'91823'").valueOf() => 100.91823918239183
   **/
  "valueOf": function() {
    return Number(this["s"] * this["n"]) / Number(this["d"]);
  },
  /**
   * Creates a string representation of a fraction with all digits
   *
   * Ex: new Fraction("100.'91823'").toString() => "100.(91823)"
   **/
  "toString": function(dec) {
    let N = this["n"];
    let D = this["d"];
    dec = dec || 15;
    let cycLen = cycleLen(N, D);
    let cycOff = cycleStart(N, D, cycLen);
    let str = this["s"] < C_ZERO ? "-" : "";
    str += trunc(N / D);
    N %= D;
    N *= C_TEN;
    if (N)
      str += ".";
    if (cycLen) {
      for (let i = cycOff; i--; ) {
        str += trunc(N / D);
        N %= D;
        N *= C_TEN;
      }
      str += "(";
      for (let i = cycLen; i--; ) {
        str += trunc(N / D);
        N %= D;
        N *= C_TEN;
      }
      str += ")";
    } else {
      for (let i = dec; N && i--; ) {
        str += trunc(N / D);
        N %= D;
        N *= C_TEN;
      }
    }
    return str;
  },
  /**
   * Returns a string-fraction representation of a Fraction object
   *
   * Ex: new Fraction("1.'3'").toFraction() => "4 1/3"
   **/
  "toFraction": function(showMixed) {
    let n = this["n"];
    let d = this["d"];
    let str = this["s"] < C_ZERO ? "-" : "";
    if (d === C_ONE) {
      str += n;
    } else {
      let whole = trunc(n / d);
      if (showMixed && whole > C_ZERO) {
        str += whole;
        str += " ";
        n %= d;
      }
      str += n;
      str += "/";
      str += d;
    }
    return str;
  },
  /**
   * Returns a latex representation of a Fraction object
   *
   * Ex: new Fraction("1.'3'").toLatex() => "\frac{4}{3}"
   **/
  "toLatex": function(showMixed) {
    let n = this["n"];
    let d = this["d"];
    let str = this["s"] < C_ZERO ? "-" : "";
    if (d === C_ONE) {
      str += n;
    } else {
      let whole = trunc(n / d);
      if (showMixed && whole > C_ZERO) {
        str += whole;
        n %= d;
      }
      str += "\\frac{";
      str += n;
      str += "}{";
      str += d;
      str += "}";
    }
    return str;
  },
  /**
   * Returns an array of continued fraction elements
   *
   * Ex: new Fraction("7/8").toContinued() => [0,1,7]
   */
  "toContinued": function() {
    let a = this["n"];
    let b = this["d"];
    let res = [];
    do {
      res.push(trunc(a / b));
      let t = a % b;
      a = b;
      b = t;
    } while (a !== C_ONE);
    return res;
  },
  "simplify": function(eps2) {
    const ieps = BigInt(1 / (eps2 || 1e-3) | 0);
    const thisABS = this["abs"]();
    const cont4 = thisABS["toContinued"]();
    for (let i = 1; i < cont4.length; i++) {
      let s = newFraction(cont4[i - 1], C_ONE);
      for (let k = i - 2; k >= 0; k--) {
        s = s["inverse"]()["add"](cont4[k]);
      }
      let t = s["sub"](thisABS);
      if (t["n"] * ieps < t["d"]) {
        return s["mul"](this["s"]);
      }
    }
    return this;
  }
};

// node_modules/convert-units/lib/esm/convert.js
var UnknownUnitError = class extends Error {
};
var OperationOrderError = class extends Error {
};
var IncompatibleUnitError = class extends Error {
};
var MeasureStructureError = class extends Error {
};
var UnknownMeasureError = class extends Error {
};
var Converter = class {
  constructor(measures, unitCache, value) {
    this.val = 0;
    this.destination = null;
    this.origin = null;
    if (typeof value === "number") {
      this.val = value;
    }
    this.measureData = measures;
    this.unitCache = unitCache;
  }
  /**
   * Lets the converter know the source unit abbreviation
   *
   * @throws OperationOrderError, UnknownUnitError
   */
  from(from) {
    if (this.destination != null)
      throw new OperationOrderError(".from must be called before .to");
    this.origin = this.getUnit(from);
    if (this.origin == null) {
      this.throwUnsupportedUnitError(from);
    }
    return this;
  }
  /**
   * Converts the unit and returns the value
   *
   * @throws OperationOrderError, UnknownUnitError, IncompatibleUnitError, MeasureStructureError
   */
  to(to2) {
    var _a, _b;
    if (this.origin == null)
      throw new Error(".to must be called after .from");
    this.destination = this.getUnit(to2);
    if (this.destination == null) {
      this.throwUnsupportedUnitError(to2);
    }
    const destination = this.destination;
    const origin = this.origin;
    if (origin.abbr === destination.abbr) {
      return this.val;
    }
    if (destination.measure != origin.measure) {
      throw new IncompatibleUnitError(`Cannot convert incompatible measures of ${destination.measure} and ${origin.measure}`);
    }
    let result = this.val * origin.unit.to_anchor;
    if (origin.unit.anchor_shift) {
      result -= origin.unit.anchor_shift;
    }
    if (origin.system != destination.system) {
      const measure7 = this.measureData[origin.measure];
      const anchors = measure7.anchors;
      if (anchors == null) {
        throw new MeasureStructureError(`Unable to convert units. Anchors are missing for "${origin.measure}" and "${destination.measure}" measures.`);
      }
      const anchor = anchors[origin.system];
      if (anchor == null) {
        throw new MeasureStructureError(`Unable to find anchor for "${origin.measure}" to "${destination.measure}". Please make sure it is defined.`);
      }
      const transform = (_a = anchor[destination.system]) === null || _a === void 0 ? void 0 : _a.transform;
      const ratio2 = (_b = anchor[destination.system]) === null || _b === void 0 ? void 0 : _b.ratio;
      if (typeof transform === "function") {
        result = transform(result);
      } else if (typeof ratio2 === "number") {
        result *= ratio2;
      } else {
        throw new MeasureStructureError("A system anchor needs to either have a defined ratio number or a transform function.");
      }
    }
    if (destination.unit.anchor_shift) {
      result += destination.unit.anchor_shift;
    }
    return result / destination.unit.to_anchor;
  }
  /**
   * Converts the unit to the best available unit.
   *
   * @throws OperationOrderError
   */
  toBest(options) {
    var _a, _b, _c;
    if (this.origin == null)
      throw new OperationOrderError(".toBest must be called after .from");
    const isNegative = this.val < 0;
    let exclude = [];
    let cutOffNumber = isNegative ? -1 : 1;
    let system = this.origin.system;
    if (typeof options === "object") {
      exclude = (_a = options.exclude) !== null && _a !== void 0 ? _a : [];
      cutOffNumber = (_b = options.cutOffNumber) !== null && _b !== void 0 ? _b : cutOffNumber;
      system = (_c = options.system) !== null && _c !== void 0 ? _c : this.origin.system;
    }
    let best = null;
    for (const possibility of this.possibilities()) {
      const unit = this.describe(possibility);
      const isIncluded = exclude.indexOf(possibility) === -1;
      if (isIncluded && unit.system === system) {
        const result = this.to(possibility);
        if (isNegative ? result > cutOffNumber : result < cutOffNumber) {
          continue;
        }
        if (best === null || (isNegative ? result <= cutOffNumber && result > best.val : result >= cutOffNumber && result < best.val)) {
          best = {
            val: result,
            unit: possibility,
            singular: unit.singular,
            plural: unit.plural
          };
        }
      }
    }
    if (best == null) {
      return {
        val: this.val,
        unit: this.origin.abbr,
        singular: this.origin.unit.name.singular,
        plural: this.origin.unit.name.plural
      };
    }
    return best;
  }
  /**
   * Finds the unit
   */
  getUnit(abbr) {
    var _a;
    return (_a = this.unitCache.get(abbr)) !== null && _a !== void 0 ? _a : null;
  }
  /**
   * Provides additional information about the unit
   *
   * @throws UnknownUnitError
   */
  describe(abbr) {
    const result = this.getUnit(abbr);
    if (result != null) {
      return this.describeUnit(result);
    }
    this.throwUnsupportedUnitError(abbr);
  }
  describeUnit(unit) {
    return {
      abbr: unit.abbr,
      measure: unit.measure,
      system: unit.system,
      singular: unit.unit.name.singular,
      plural: unit.unit.name.plural
    };
  }
  /**
   * Detailed list of all supported units
   *
   * If a measure is supplied the list will only contain
   * details about that measure. Otherwise the list will contain
   * details abaout all measures.
   *
   * However, if the measure doesn't exist, an empty array will be
   * returned
   *
   *
   */
  list(measureName) {
    const list = [];
    if (measureName == null) {
      for (const [name, measure7] of Object.entries(this.measureData)) {
        for (const [systemName, units] of Object.entries(measure7.systems)) {
          for (const [abbr, unit] of Object.entries(units)) {
            list.push(this.describeUnit({
              abbr,
              measure: name,
              system: systemName,
              unit
            }));
          }
        }
      }
    } else {
      if (!this.isMeasure(measureName))
        throw new UnknownMeasureError(`Meausure "${measureName}" not found.`);
      const measure7 = this.measureData[measureName];
      for (const [systemName, units] of Object.entries(measure7.systems)) {
        for (const [abbr, unit] of Object.entries(units)) {
          list.push(this.describeUnit({
            abbr,
            measure: measureName,
            system: systemName,
            unit
          }));
        }
      }
    }
    return list;
  }
  isMeasure(measureName) {
    return measureName in this.measureData;
  }
  throwUnsupportedUnitError(what) {
    let validUnits = [];
    for (const measure7 of Object.values(this.measureData)) {
      for (const systems of Object.values(measure7.systems)) {
        validUnits = validUnits.concat(Object.keys(systems));
      }
    }
    throw new UnknownUnitError(`Unsupported unit ${what}, use one of: ${validUnits.join(", ")}`);
  }
  /**
   * Returns the abbreviated measures that the value can be
   * converted to.
   */
  possibilities(forMeasure) {
    let possibilities = [];
    let list_measures = [];
    if (typeof forMeasure == "string" && this.isMeasure(forMeasure)) {
      list_measures.push(forMeasure);
    } else if (this.origin != null) {
      list_measures.push(this.origin.measure);
    } else {
      list_measures = Object.keys(this.measureData);
    }
    for (const measure7 of list_measures) {
      const systems = this.measureData[measure7].systems;
      for (const system of Object.values(systems)) {
        possibilities = [
          ...possibilities,
          ...Object.keys(system)
        ];
      }
    }
    return possibilities;
  }
  /**
   * Returns the abbreviated measures that the value can be
   * converted to.
   */
  measures() {
    return Object.keys(this.measureData);
  }
};
function buildUnitCache(measures) {
  const unitCache = /* @__PURE__ */ new Map();
  for (const [measureName, measure7] of Object.entries(measures)) {
    for (const [systemName, system] of Object.entries(measure7.systems)) {
      for (const [testAbbr, unit] of Object.entries(system)) {
        unitCache.set(testAbbr, {
          measure: measureName,
          system: systemName,
          abbr: testAbbr,
          unit
        });
      }
    }
  }
  return unitCache;
}
function configureMeasurements(measures) {
  if (typeof measures !== "object") {
    throw new TypeError("The measures argument needs to be an object");
  }
  const unitCache = buildUnitCache(measures);
  return (value) => new Converter(measures, unitCache, value);
}

// node_modules/convert-units/lib/esm/definitions/length.js
var metric = {
  nm: {
    name: {
      singular: "Nanometer",
      plural: "Nanometers"
    },
    to_anchor: 1e-9
  },
  \u03BCm: {
    name: {
      singular: "Micrometer",
      plural: "Micrometers"
    },
    to_anchor: 1e-6
  },
  mm: {
    name: {
      singular: "Millimeter",
      plural: "Millimeters"
    },
    to_anchor: 1e-3
  },
  cm: {
    name: {
      singular: "Centimeter",
      plural: "Centimeters"
    },
    to_anchor: 0.01
  },
  dm: {
    name: {
      singular: "Decimeter",
      plural: "Decimeters"
    },
    to_anchor: 0.1
  },
  m: {
    name: {
      singular: "Meter",
      plural: "Meters"
    },
    to_anchor: 1
  },
  km: {
    name: {
      singular: "Kilometer",
      plural: "Kilometers"
    },
    to_anchor: 1e3
  }
};
var imperial = {
  mil: {
    name: {
      singular: "Mil",
      plural: "Mils"
    },
    to_anchor: 1 / 12e3
  },
  in: {
    name: {
      singular: "Inch",
      plural: "Inches"
    },
    to_anchor: 1 / 12
  },
  yd: {
    name: {
      singular: "Yard",
      plural: "Yards"
    },
    to_anchor: 3
  },
  "ft-us": {
    name: {
      singular: "US Survey Foot",
      plural: "US Survey Feet"
    },
    to_anchor: 1.000002
  },
  ft: {
    name: {
      singular: "Foot",
      plural: "Feet"
    },
    to_anchor: 1
  },
  fathom: {
    name: {
      singular: "Fathom",
      plural: "Fathoms"
    },
    to_anchor: 6
  },
  mi: {
    name: {
      singular: "Mile",
      plural: "Miles"
    },
    to_anchor: 5280
  },
  nMi: {
    name: {
      singular: "Nautical Mile",
      plural: "Nautical Miles"
    },
    to_anchor: 6076.12
  }
};
var measure = {
  systems: {
    metric,
    imperial
  },
  anchors: {
    metric: {
      imperial: {
        ratio: 3.28084
      }
    },
    imperial: {
      metric: {
        ratio: 1 / 3.28084
      }
    }
  }
};
var length_default = measure;

// node_modules/convert-units/lib/esm/definitions/area.js
var metric2 = {
  nm2: {
    name: {
      singular: "Square Nanometer",
      plural: "Square Nanometers"
    },
    to_anchor: 1e-18
  },
  \u03BCm2: {
    name: {
      singular: "Square Micrometer",
      plural: "Square Micrometers"
    },
    to_anchor: 1e-12
  },
  mm2: {
    name: {
      singular: "Square Millimeter",
      plural: "Square Millimeters"
    },
    to_anchor: 1 / 1e6
  },
  cm2: {
    name: {
      singular: "Square Centimeter",
      plural: "Square Centimeters"
    },
    to_anchor: 1 / 1e4
  },
  dm2: {
    name: {
      singular: "Square Decimeter",
      plural: "Square Decimeters"
    },
    to_anchor: 1 / 100
  },
  m2: {
    name: {
      singular: "Square Meter",
      plural: "Square Meters"
    },
    to_anchor: 1
  },
  a: {
    name: {
      singular: "Are",
      plural: "Ares"
    },
    to_anchor: 100
  },
  ha: {
    name: {
      singular: "Hectare",
      plural: "Hectares"
    },
    to_anchor: 1e4
  },
  km2: {
    name: {
      singular: "Square Kilometer",
      plural: "Square Kilometers"
    },
    to_anchor: 1e6
  }
};
var imperial2 = {
  in2: {
    name: {
      singular: "Square Inch",
      plural: "Square Inches"
    },
    to_anchor: 1 / 144
  },
  yd2: {
    name: {
      singular: "Square Yard",
      plural: "Square Yards"
    },
    to_anchor: 9
  },
  ft2: {
    name: {
      singular: "Square Foot",
      plural: "Square Feet"
    },
    to_anchor: 1
  },
  ac: {
    name: {
      singular: "Acre",
      plural: "Acres"
    },
    to_anchor: 43560
  },
  mi2: {
    name: {
      singular: "Square Mile",
      plural: "Square Miles"
    },
    to_anchor: 27878400
  }
};
var measure2 = {
  systems: {
    metric: metric2,
    imperial: imperial2
  },
  anchors: {
    metric: {
      imperial: {
        ratio: 10.7639
      }
    },
    imperial: {
      metric: {
        ratio: 1 / 10.7639
      }
    }
  }
};
var area_default = measure2;

// node_modules/convert-units/lib/esm/definitions/mass.js
var metric3 = {
  mcg: {
    name: {
      singular: "Microgram",
      plural: "Micrograms"
    },
    to_anchor: 1 / 1e6
  },
  mg: {
    name: {
      singular: "Milligram",
      plural: "Milligrams"
    },
    to_anchor: 1 / 1e3
  },
  g: {
    name: {
      singular: "Gram",
      plural: "Grams"
    },
    to_anchor: 1
  },
  kg: {
    name: {
      singular: "Kilogram",
      plural: "Kilograms"
    },
    to_anchor: 1e3
  },
  mt: {
    name: {
      singular: "Metric Tonne",
      plural: "Metric Tonnes"
    },
    to_anchor: 1e6
  }
};
var imperial3 = {
  oz: {
    name: {
      singular: "Ounce",
      plural: "Ounces"
    },
    to_anchor: 1 / 16
  },
  lb: {
    name: {
      singular: "Pound",
      plural: "Pounds"
    },
    to_anchor: 1
  },
  st: {
    name: {
      singular: "Stone",
      plural: "Stones"
    },
    to_anchor: 14
  },
  t: {
    name: {
      singular: "Ton",
      plural: "Tons"
    },
    to_anchor: 2e3
  }
};
var measure3 = {
  systems: {
    metric: metric3,
    imperial: imperial3
  },
  anchors: {
    metric: {
      imperial: {
        ratio: 1 / 453.59237
      }
    },
    imperial: {
      metric: {
        ratio: 453.59237
      }
    }
  }
};
var mass_default = measure3;

// node_modules/convert-units/lib/esm/definitions/volume.js
var metric4 = {
  mm3: {
    name: {
      singular: "Cubic Millimeter",
      plural: "Cubic Millimeters"
    },
    to_anchor: 1 / 1e6
  },
  cm3: {
    name: {
      singular: "Cubic Centimeter",
      plural: "Cubic Centimeters"
    },
    to_anchor: 1 / 1e3
  },
  dm3: {
    name: {
      singular: "Cubic Decimeter",
      plural: "Cubic Decimeters"
    },
    to_anchor: 1
  },
  ml: {
    name: {
      singular: "Millilitre",
      plural: "Millilitres"
    },
    to_anchor: 1 / 1e3
  },
  cl: {
    name: {
      singular: "Centilitre",
      plural: "Centilitres"
    },
    to_anchor: 1 / 100
  },
  dl: {
    name: {
      singular: "Decilitre",
      plural: "Decilitres"
    },
    to_anchor: 1 / 10
  },
  l: {
    name: {
      singular: "Litre",
      plural: "Litres"
    },
    to_anchor: 1
  },
  kl: {
    name: {
      singular: "Kilolitre",
      plural: "Kilolitres"
    },
    to_anchor: 1e3
  },
  Ml: {
    name: {
      singular: "Megalitre",
      plural: "Megalitres"
    },
    to_anchor: 1e6
  },
  Gl: {
    name: {
      singular: "Gigalitre",
      plural: "Gigalitres"
    },
    to_anchor: 1e9
  },
  m3: {
    name: {
      singular: "Cubic meter",
      plural: "Cubic meters"
    },
    to_anchor: 1e3
  },
  km3: {
    name: {
      singular: "Cubic kilometer",
      plural: "Cubic kilometers"
    },
    to_anchor: 1e12
  },
  // Swedish units
  krm: {
    name: {
      singular: "Kryddm\xE5tt",
      plural: "Kryddm\xE5tt"
    },
    to_anchor: 1 / 1e3
  },
  tsk: {
    name: {
      singular: "Tesked",
      plural: "Teskedar"
    },
    to_anchor: 5 / 1e3
  },
  msk: {
    name: {
      singular: "Matsked",
      plural: "Matskedar"
    },
    to_anchor: 15 / 1e3
  },
  kkp: {
    name: {
      singular: "Kaffekopp",
      plural: "Kaffekoppar"
    },
    to_anchor: 150 / 1e3
  },
  glas: {
    name: {
      singular: "Glas",
      plural: "Glas"
    },
    to_anchor: 200 / 1e3
  },
  kanna: {
    name: {
      singular: "Kanna",
      plural: "Kannor"
    },
    to_anchor: 2.617
  }
};
var imperial4 = {
  tsp: {
    name: {
      singular: "Teaspoon",
      plural: "Teaspoons"
    },
    to_anchor: 1 / 6
  },
  Tbs: {
    name: {
      singular: "Tablespoon",
      plural: "Tablespoons"
    },
    to_anchor: 1 / 2
  },
  in3: {
    name: {
      singular: "Cubic inch",
      plural: "Cubic inches"
    },
    to_anchor: 0.55411
  },
  "fl-oz": {
    name: {
      singular: "Fluid Ounce",
      plural: "Fluid Ounces"
    },
    to_anchor: 1
  },
  cup: {
    name: {
      singular: "Cup",
      plural: "Cups"
    },
    to_anchor: 8
  },
  pnt: {
    name: {
      singular: "Pint",
      plural: "Pints"
    },
    to_anchor: 16
  },
  qt: {
    name: {
      singular: "Quart",
      plural: "Quarts"
    },
    to_anchor: 32
  },
  gal: {
    name: {
      singular: "Gallon",
      plural: "Gallons"
    },
    to_anchor: 128
  },
  ft3: {
    name: {
      singular: "Cubic foot",
      plural: "Cubic feet"
    },
    to_anchor: 957.506
  },
  yd3: {
    name: {
      singular: "Cubic yard",
      plural: "Cubic yards"
    },
    to_anchor: 25852.7
  }
};
var measure4 = {
  systems: {
    metric: metric4,
    imperial: imperial4
  },
  anchors: {
    metric: {
      imperial: {
        ratio: 33.8140226
      }
    },
    imperial: {
      metric: {
        ratio: 1 / 33.8140226
      }
    }
  }
};
var volume_default = measure4;

// node_modules/convert-units/lib/esm/definitions/time.js
var daysInYear = 365.25;
var SI = {
  ns: {
    name: {
      singular: "Nanosecond",
      plural: "Nanoseconds"
    },
    to_anchor: 1 / 1e9
  },
  mu: {
    name: {
      singular: "Microsecond",
      plural: "Microseconds"
    },
    to_anchor: 1 / 1e6
  },
  ms: {
    name: {
      singular: "Millisecond",
      plural: "Milliseconds"
    },
    to_anchor: 1 / 1e3
  },
  s: {
    name: {
      singular: "Second",
      plural: "Seconds"
    },
    to_anchor: 1
  },
  min: {
    name: {
      singular: "Minute",
      plural: "Minutes"
    },
    to_anchor: 60
  },
  h: {
    name: {
      singular: "Hour",
      plural: "Hours"
    },
    to_anchor: 60 * 60
  },
  d: {
    name: {
      singular: "Day",
      plural: "Days"
    },
    to_anchor: 60 * 60 * 24
  },
  week: {
    name: {
      singular: "Week",
      plural: "Weeks"
    },
    to_anchor: 60 * 60 * 24 * 7
  },
  month: {
    name: {
      singular: "Month",
      plural: "Months"
    },
    to_anchor: 60 * 60 * 24 * daysInYear / 12
  },
  year: {
    name: {
      singular: "Year",
      plural: "Years"
    },
    to_anchor: 60 * 60 * 24 * daysInYear
  }
};
var measure5 = {
  systems: {
    SI
  }
};
var time_default = measure5;

// node_modules/convert-units/lib/esm/definitions/angle.js
var SI2 = {
  rad: {
    name: {
      singular: "radian",
      plural: "radians"
    },
    to_anchor: 180 / Math.PI
  },
  deg: {
    name: {
      singular: "degree",
      plural: "degrees"
    },
    to_anchor: 1
  },
  grad: {
    name: {
      singular: "gradian",
      plural: "gradians"
    },
    to_anchor: 9 / 10
  },
  arcmin: {
    name: {
      singular: "arcminute",
      plural: "arcminutes"
    },
    to_anchor: 1 / 60
  },
  arcsec: {
    name: {
      singular: "arcsecond",
      plural: "arcseconds"
    },
    to_anchor: 1 / 3600
  }
};
var measure6 = {
  systems: {
    SI: SI2
  }
};
var angle_default = measure6;

// src/utils/math-solver.js
var INUMBER = "INUMBER";
var IOP1 = "IOP1";
var IOP2 = "IOP2";
var IOP3 = "IOP3";
var IVAR = "IVAR";
var IVARNAME = "IVARNAME";
var IFUNCALL = "IFUNCALL";
var IFUNDEF = "IFUNDEF";
var IEXPR = "IEXPR";
var IEXPREVAL = "IEXPREVAL";
var IMEMBER = "IMEMBER";
var IENDSTATEMENT = "IENDSTATEMENT";
var IARRAY = "IARRAY";
function Instruction(type, value) {
  this.type = type;
  this.value = value !== void 0 && value !== null ? value : 0;
}
Instruction.prototype.toString = function() {
  switch (this.type) {
    case INUMBER:
    case IOP1:
    case IOP2:
    case IOP3:
    case IVAR:
    case IVARNAME:
    case IENDSTATEMENT:
      return this.value;
    case IFUNCALL:
      return "CALL " + this.value;
    case IFUNDEF:
      return "DEF " + this.value;
    case IARRAY:
      return "ARRAY " + this.value;
    case IMEMBER:
      return "." + this.value;
    default:
      return "Invalid Instruction";
  }
};
function unaryInstruction(value) {
  return new Instruction(IOP1, value);
}
function binaryInstruction(value) {
  return new Instruction(IOP2, value);
}
function ternaryInstruction(value) {
  return new Instruction(IOP3, value);
}
function simplify(tokens, unaryOps, binaryOps, ternaryOps, values) {
  var nstack = [];
  var newexpression = [];
  var n1, n2, n3;
  var f;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER || type === IVARNAME) {
      if (Array.isArray(item.value)) {
        nstack.push.apply(nstack, simplify(item.value.map(function(x) {
          return new Instruction(INUMBER, x);
        }).concat(new Instruction(IARRAY, item.value.length)), unaryOps, binaryOps, ternaryOps, values));
      } else {
        nstack.push(item);
      }
    } else if (type === IVAR && values.hasOwnProperty(item.value)) {
      item = new Instruction(INUMBER, values[item.value]);
      nstack.push(item);
    } else if (type === IOP2 && nstack.length > 1) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = binaryOps[item.value];
      item = new Instruction(INUMBER, f(n1.value, n2.value));
      nstack.push(item);
    } else if (type === IOP3 && nstack.length > 2) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === "?") {
        nstack.push(n1.value ? n2.value : n3.value);
      } else {
        f = ternaryOps[item.value];
        item = new Instruction(INUMBER, f(n1.value, n2.value, n3.value));
        nstack.push(item);
      }
    } else if (type === IOP1 && nstack.length > 0) {
      n1 = nstack.pop();
      f = unaryOps[item.value];
      item = new Instruction(INUMBER, f(n1.value));
      nstack.push(item);
    } else if (type === IEXPR) {
      while (nstack.length > 0) {
        newexpression.push(nstack.shift());
      }
      newexpression.push(new Instruction(IEXPR, simplify(item.value, unaryOps, binaryOps, ternaryOps, values)));
    } else if (type === IMEMBER && nstack.length > 0) {
      n1 = nstack.pop();
      nstack.push(new Instruction(INUMBER, n1.value[item.value]));
    } else {
      while (nstack.length > 0) {
        newexpression.push(nstack.shift());
      }
      newexpression.push(item);
    }
  }
  while (nstack.length > 0) {
    newexpression.push(nstack.shift());
  }
  return newexpression;
}
function substitute(tokens, variable, expr) {
  var newexpression = [];
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === IVAR && item.value === variable) {
      for (var j = 0; j < expr.tokens.length; j++) {
        var expritem = expr.tokens[j];
        var replitem;
        if (expritem.type === IOP1) {
          replitem = unaryInstruction(expritem.value);
        } else if (expritem.type === IOP2) {
          replitem = binaryInstruction(expritem.value);
        } else if (expritem.type === IOP3) {
          replitem = ternaryInstruction(expritem.value);
        } else {
          replitem = new Instruction(expritem.type, expritem.value);
        }
        newexpression.push(replitem);
      }
    } else if (type === IEXPR) {
      newexpression.push(new Instruction(IEXPR, substitute(item.value, variable, expr)));
    } else {
      newexpression.push(item);
    }
  }
  return newexpression;
}
function evaluate(tokens, expr, values) {
  var nstack = [];
  var n1, n2, n3;
  var f, args, argCount;
  if (isExpressionEvaluator(tokens)) {
    return resolveExpression(tokens, values);
  }
  var numTokens = tokens.length;
  for (var i = 0; i < numTokens; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER || type === IVARNAME) {
      nstack.push(item.value);
    } else if (type === IOP2) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === "and") {
        nstack.push(n1 ? !!evaluate(n2, expr, values) : false);
      } else if (item.value === "or") {
        nstack.push(n1 ? true : !!evaluate(n2, expr, values));
      } else if (item.value === "=") {
        f = expr.binaryOps[item.value];
        nstack.push(f(n1, evaluate(n2, expr, values), values));
      } else {
        f = expr.binaryOps[item.value];
        nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values)));
      }
    } else if (type === IOP3) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === "?") {
        nstack.push(evaluate(n1 ? n2 : n3, expr, values));
      } else {
        f = expr.ternaryOps[item.value];
        nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values), resolveExpression(n3, values)));
      }
    } else if (type === IVAR) {
      if (item.value in expr.functions) {
        nstack.push(expr.functions[item.value]);
      } else if (item.value in expr.unaryOps && expr.parser.isOperatorEnabled(item.value)) {
        nstack.push(expr.unaryOps[item.value]);
      } else {
        var v = values[item.value];
        if (v !== void 0) {
          nstack.push(v);
        } else {
          throw new Error("undefined variable: " + item.value);
        }
      }
    } else if (type === IOP1) {
      n1 = nstack.pop();
      f = expr.unaryOps[item.value];
      nstack.push(f(resolveExpression(n1, values)));
    } else if (type === IFUNCALL) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(resolveExpression(nstack.pop(), values));
      }
      f = nstack.pop();
      if (f.apply && f.call) {
        nstack.push(f.apply(void 0, args));
      } else {
        throw new Error(f + " is not a function");
      }
    } else if (type === IFUNDEF) {
      nstack.push(function() {
        var n22 = nstack.pop();
        var args2 = [];
        var argCount2 = item.value;
        while (argCount2-- > 0) {
          args2.unshift(nstack.pop());
        }
        var n12 = nstack.pop();
        var f2 = function() {
          var scope = Object.assign({}, values);
          for (var i2 = 0, len = args2.length; i2 < len; i2++) {
            scope[args2[i2]] = arguments[i2];
          }
          return evaluate(n22, expr, scope);
        };
        Object.defineProperty(f2, "name", {
          value: n12,
          writable: false
        });
        values[n12] = f2;
        return f2;
      }());
    } else if (type === IEXPR) {
      nstack.push(createExpressionEvaluator(item, expr));
    } else if (type === IEXPREVAL) {
      nstack.push(item);
    } else if (type === IMEMBER) {
      n1 = nstack.pop();
      nstack.push(n1[item.value]);
    } else if (type === IENDSTATEMENT) {
      nstack.pop();
    } else if (type === IARRAY) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      nstack.push(args);
    } else {
      throw new Error("invalid Expression");
    }
  }
  if (nstack.length > 1) {
    throw new Error("invalid Expression (parity)");
  }
  return nstack[0] === 0 ? 0 : resolveExpression(nstack[0], values);
}
function createExpressionEvaluator(token, expr, values) {
  if (isExpressionEvaluator(token))
    return token;
  return {
    type: IEXPREVAL,
    value: function(scope) {
      return evaluate(token.value, expr, scope);
    }
  };
}
function isExpressionEvaluator(n) {
  return n && n.type === IEXPREVAL;
}
function resolveExpression(n, values) {
  return isExpressionEvaluator(n) ? n.value(values) : n;
}
function expressionToString(tokens, toJS) {
  var nstack = [];
  var n1, n2, n3;
  var f, args, argCount;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER) {
      if (typeof item.value === "number" && item.value < 0) {
        nstack.push("(" + item.value + ")");
      } else if (Array.isArray(item.value)) {
        nstack.push("[" + item.value.map(escapeValue).join(", ") + "]");
      } else {
        nstack.push(escapeValue(item.value));
      }
    } else if (type === IOP2) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = item.value;
      if (toJS) {
        if (f === "^") {
          nstack.push("Math.pow(" + n1 + ", " + n2 + ")");
        } else if (f === "and") {
          nstack.push("(!!" + n1 + " && !!" + n2 + ")");
        } else if (f === "or") {
          nstack.push("(!!" + n1 + " || !!" + n2 + ")");
        } else if (f === "||") {
          nstack.push("(function(a,b){ return Array.isArray(a) && Array.isArray(b) ? a.concat(b) : String(a) + String(b); }((" + n1 + "),(" + n2 + ")))");
        } else if (f === "==") {
          nstack.push("(" + n1 + " === " + n2 + ")");
        } else if (f === "!=") {
          nstack.push("(" + n1 + " !== " + n2 + ")");
        } else if (f === "[") {
          nstack.push(n1 + "[(" + n2 + ") | 0]");
        } else {
          nstack.push("(" + n1 + " " + f + " " + n2 + ")");
        }
      } else {
        if (f === "[") {
          nstack.push(n1 + "[" + n2 + "]");
        } else {
          nstack.push("(" + n1 + " " + f + " " + n2 + ")");
        }
      }
    } else if (type === IOP3) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = item.value;
      if (f === "?") {
        nstack.push("(" + n1 + " ? " + n2 + " : " + n3 + ")");
      } else {
        throw new Error("invalid Expression");
      }
    } else if (type === IVAR || type === IVARNAME) {
      nstack.push(item.value);
    } else if (type === IOP1) {
      n1 = nstack.pop();
      f = item.value;
      if (f === "-" || f === "+") {
        nstack.push("(" + f + n1 + ")");
      } else if (toJS) {
        if (f === "not") {
          nstack.push("(!" + n1 + ")");
        } else if (f === "!") {
          nstack.push("fac(" + n1 + ")");
        } else {
          nstack.push(f + "(" + n1 + ")");
        }
      } else if (f === "!") {
        nstack.push("(" + n1 + "!)");
      } else {
        nstack.push("(" + f + " " + n1 + ")");
      }
    } else if (type === IFUNCALL) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      f = nstack.pop();
      nstack.push(f + "(" + args.join(", ") + ")");
    } else if (type === IFUNDEF) {
      n2 = nstack.pop();
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      n1 = nstack.pop();
      if (toJS) {
        nstack.push("(" + n1 + " = function(" + args.join(", ") + ") { return " + n2 + " })");
      } else {
        nstack.push("(" + n1 + "(" + args.join(", ") + ") = " + n2 + ")");
      }
    } else if (type === IMEMBER) {
      n1 = nstack.pop();
      nstack.push(n1 + "." + item.value);
    } else if (type === IARRAY) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      nstack.push("[" + args.join(", ") + "]");
    } else if (type === IEXPR) {
      nstack.push("(" + expressionToString(item.value, toJS) + ")");
    } else if (type === IENDSTATEMENT)
      ;
    else {
      throw new Error("invalid Expression");
    }
  }
  if (nstack.length > 1) {
    if (toJS) {
      nstack = [nstack.join(",")];
    } else {
      nstack = [nstack.join(";")];
    }
  }
  return String(nstack[0]);
}
function escapeValue(v) {
  if (typeof v === "string") {
    return JSON.stringify(v).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  return v;
}
function contains(array, obj) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === obj) {
      return true;
    }
  }
  return false;
}
function getSymbols(tokens, symbols, options) {
  options = options || {};
  var withMembers = !!options.withMembers;
  var prevVar = null;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    if (item.type === IVAR || item.type === IVARNAME) {
      if (!withMembers && !contains(symbols, item.value)) {
        symbols.push(item.value);
      } else if (prevVar !== null) {
        if (!contains(symbols, prevVar)) {
          symbols.push(prevVar);
        }
        prevVar = item.value;
      } else {
        prevVar = item.value;
      }
    } else if (item.type === IMEMBER && withMembers && prevVar !== null) {
      prevVar += "." + item.value;
    } else if (item.type === IEXPR) {
      getSymbols(item.value, symbols, options);
    } else if (prevVar !== null) {
      if (!contains(symbols, prevVar)) {
        symbols.push(prevVar);
      }
      prevVar = null;
    }
  }
  if (prevVar !== null && !contains(symbols, prevVar)) {
    symbols.push(prevVar);
  }
}
function Expression(tokens, parser2) {
  this.tokens = tokens;
  this.parser = parser2;
  this.unaryOps = parser2.unaryOps;
  this.binaryOps = parser2.binaryOps;
  this.ternaryOps = parser2.ternaryOps;
  this.functions = parser2.functions;
}
Expression.prototype.simplify = function(values) {
  values = values || {};
  return new Expression(simplify(this.tokens, this.unaryOps, this.binaryOps, this.ternaryOps, values), this.parser);
};
Expression.prototype.substitute = function(variable, expr) {
  if (!(expr instanceof Expression)) {
    expr = this.parser.parse(String(expr));
  }
  return new Expression(substitute(this.tokens, variable, expr), this.parser);
};
Expression.prototype.evaluate = function(values) {
  values = values || {};
  return evaluate(this.tokens, this, values);
};
Expression.prototype.toString = function() {
  return expressionToString(this.tokens, false);
};
Expression.prototype.symbols = function(options) {
  options = options || {};
  var vars = [];
  getSymbols(this.tokens, vars, options);
  return vars;
};
Expression.prototype.variables = function(options) {
  options = options || {};
  var vars = [];
  getSymbols(this.tokens, vars, options);
  var functions = this.functions;
  return vars.filter(function(name) {
    return !(name in functions);
  });
};
Expression.prototype.toJSFunction = function(param, variables) {
  var expr = this;
  var f = new Function(param, "with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return " + expressionToString(this.simplify(variables).tokens, true) + "; }");
  return function() {
    return f.apply(expr, arguments);
  };
};
var TEOF = "TEOF";
var TOP = "TOP";
var TNUMBER = "TNUMBER";
var TSTRING = "TSTRING";
var TPAREN = "TPAREN";
var TBRACKET = "TBRACKET";
var TCOMMA = "TCOMMA";
var TNAME = "TNAME";
var TSEMICOLON = "TSEMICOLON";
function Token(type, value, index) {
  this.type = type;
  this.value = value;
  this.index = index;
}
Token.prototype.toString = function() {
  return this.type + ": " + this.value;
};
function TokenStream(parser2, expression) {
  this.pos = 0;
  this.current = null;
  this.unaryOps = parser2.unaryOps;
  this.binaryOps = parser2.binaryOps;
  this.ternaryOps = parser2.ternaryOps;
  this.consts = parser2.consts;
  this.expression = expression;
  this.savedPosition = 0;
  this.savedCurrent = null;
  this.options = parser2.options;
  this.parser = parser2;
}
TokenStream.prototype.newToken = function(type, value, pos) {
  return new Token(type, value, pos != null ? pos : this.pos);
};
TokenStream.prototype.save = function() {
  this.savedPosition = this.pos;
  this.savedCurrent = this.current;
};
TokenStream.prototype.restore = function() {
  this.pos = this.savedPosition;
  this.current = this.savedCurrent;
};
TokenStream.prototype.next = function() {
  if (this.pos >= this.expression.length) {
    return this.newToken(TEOF, "EOF");
  }
  if (this.isWhitespace() || this.isComment()) {
    return this.next();
  } else if (this.isRadixInteger() || this.isNumber() || this.isOperator() || this.isString() || this.isParen() || this.isBracket() || this.isComma() || this.isSemicolon() || this.isNamedOp() || this.isConst() || this.isName()) {
    return this.current;
  } else {
    this.parseError('Unknown character "' + this.expression.charAt(this.pos) + '"');
  }
};
TokenStream.prototype.isString = function() {
  var r = false;
  var startPos = this.pos;
  var quote = this.expression.charAt(startPos);
  if (quote === "'" || quote === '"') {
    var index = this.expression.indexOf(quote, startPos + 1);
    while (index >= 0 && this.pos < this.expression.length) {
      this.pos = index + 1;
      if (this.expression.charAt(index - 1) !== "\\") {
        var rawString = this.expression.substring(startPos + 1, index);
        this.current = this.newToken(TSTRING, this.unescape(rawString), startPos);
        r = true;
        break;
      }
      index = this.expression.indexOf(quote, index + 1);
    }
  }
  return r;
};
TokenStream.prototype.isParen = function() {
  var c = this.expression.charAt(this.pos);
  if (c === "(" || c === ")") {
    this.current = this.newToken(TPAREN, c);
    this.pos++;
    return true;
  }
  return false;
};
TokenStream.prototype.isBracket = function() {
  var c = this.expression.charAt(this.pos);
  if ((c === "[" || c === "]") && this.isOperatorEnabled("[")) {
    this.current = this.newToken(TBRACKET, c);
    this.pos++;
    return true;
  }
  return false;
};
TokenStream.prototype.isComma = function() {
  var c = this.expression.charAt(this.pos);
  if (c === ",") {
    this.current = this.newToken(TCOMMA, ",");
    this.pos++;
    return true;
  }
  return false;
};
TokenStream.prototype.isSemicolon = function() {
  var c = this.expression.charAt(this.pos);
  if (c === ";") {
    this.current = this.newToken(TSEMICOLON, ";");
    this.pos++;
    return true;
  }
  return false;
};
TokenStream.prototype.isConst = function() {
  var startPos = this.pos;
  var i = startPos;
  for (; i < this.expression.length; i++) {
    var c = this.expression.charAt(i);
    if (c.toUpperCase() === c.toLowerCase()) {
      if (i === this.pos || c !== "_" && c !== "." && (c < "0" || c > "9")) {
        break;
      }
    }
  }
  if (i > startPos) {
    var str = this.expression.substring(startPos, i);
    if (str in this.consts) {
      this.current = this.newToken(TNUMBER, this.consts[str]);
      this.pos += str.length;
      return true;
    }
  }
  return false;
};
TokenStream.prototype.isNamedOp = function() {
  var startPos = this.pos;
  var i = startPos;
  for (; i < this.expression.length; i++) {
    var c = this.expression.charAt(i);
    if (c.toUpperCase() === c.toLowerCase()) {
      if (i === this.pos || c !== "_" && (c < "0" || c > "9")) {
        break;
      }
    }
  }
  if (i > startPos) {
    var str = this.expression.substring(startPos, i);
    if (this.isOperatorEnabled(str) && (str in this.binaryOps || str in this.unaryOps || str in this.ternaryOps)) {
      this.current = this.newToken(TOP, str);
      this.pos += str.length;
      return true;
    }
  }
  return false;
};
TokenStream.prototype.isName = function() {
  var startPos = this.pos;
  var i = startPos;
  var hasLetter = false;
  for (; i < this.expression.length; i++) {
    var c = this.expression.charAt(i);
    if (c.toUpperCase() === c.toLowerCase()) {
      if (i === this.pos && (c === "$" || c === "_")) {
        if (c === "_") {
          hasLetter = true;
        }
        continue;
      } else if (i === this.pos || !hasLetter || c !== "_" && (c < "0" || c > "9")) {
        break;
      }
    } else {
      hasLetter = true;
    }
  }
  if (hasLetter) {
    var str = this.expression.substring(startPos, i);
    this.current = this.newToken(TNAME, str);
    this.pos += str.length;
    return true;
  }
  return false;
};
TokenStream.prototype.isWhitespace = function() {
  var r = false;
  var c = this.expression.charAt(this.pos);
  while (c === " " || c === "	" || c === "\n" || c === "\r") {
    r = true;
    this.pos++;
    if (this.pos >= this.expression.length) {
      break;
    }
    c = this.expression.charAt(this.pos);
  }
  return r;
};
var codePointPattern = /^[0-9a-f]{4}$/i;
TokenStream.prototype.unescape = function(v) {
  var index = v.indexOf("\\");
  if (index < 0) {
    return v;
  }
  var buffer = v.substring(0, index);
  while (index >= 0) {
    var c = v.charAt(++index);
    switch (c) {
      case "'":
        buffer += "'";
        break;
      case '"':
        buffer += '"';
        break;
      case "\\":
        buffer += "\\";
        break;
      case "/":
        buffer += "/";
        break;
      case "b":
        buffer += "\b";
        break;
      case "f":
        buffer += "\f";
        break;
      case "n":
        buffer += "\n";
        break;
      case "r":
        buffer += "\r";
        break;
      case "t":
        buffer += "	";
        break;
      case "u":
        var codePoint = v.substring(index + 1, index + 5);
        if (!codePointPattern.test(codePoint)) {
          this.parseError("Illegal escape sequence: \\u" + codePoint);
        }
        buffer += String.fromCharCode(parseInt(codePoint, 16));
        index += 4;
        break;
      default:
        throw this.parseError('Illegal escape sequence: "\\' + c + '"');
    }
    ++index;
    var backslash = v.indexOf("\\", index);
    buffer += v.substring(index, backslash < 0 ? v.length : backslash);
    index = backslash;
  }
  return buffer;
};
TokenStream.prototype.isComment = function() {
  var c = this.expression.charAt(this.pos);
  if (c === "/" && this.expression.charAt(this.pos + 1) === "*") {
    this.pos = this.expression.indexOf("*/", this.pos) + 2;
    if (this.pos === 1) {
      this.pos = this.expression.length;
    }
    return true;
  }
  return false;
};
TokenStream.prototype.isRadixInteger = function() {
  var pos = this.pos;
  if (pos >= this.expression.length - 2 || this.expression.charAt(pos) !== "0") {
    return false;
  }
  ++pos;
  var radix;
  var validDigit;
  if (this.expression.charAt(pos) === "x") {
    radix = 16;
    validDigit = /^[0-9a-f]$/i;
    ++pos;
  } else if (this.expression.charAt(pos) === "b") {
    radix = 2;
    validDigit = /^[01]$/i;
    ++pos;
  } else {
    return false;
  }
  var valid = false;
  var startPos = pos;
  while (pos < this.expression.length) {
    var c = this.expression.charAt(pos);
    if (validDigit.test(c)) {
      pos++;
      valid = true;
    } else {
      break;
    }
  }
  if (valid) {
    this.current = this.newToken(TNUMBER, parseInt(this.expression.substring(startPos, pos), radix));
    this.pos = pos;
  }
  return valid;
};
TokenStream.prototype.isNumber = function() {
  var valid = false;
  var pos = this.pos;
  var startPos = pos;
  var resetPos = pos;
  var foundDot = false;
  var foundDigits = false;
  var c;
  while (pos < this.expression.length) {
    c = this.expression.charAt(pos);
    if (c >= "0" && c <= "9" || !foundDot && c === ".") {
      if (c === ".") {
        foundDot = true;
      } else {
        foundDigits = true;
      }
      pos++;
      valid = foundDigits;
    } else {
      break;
    }
  }
  if (valid) {
    resetPos = pos;
  }
  if (c === "e" || c === "E") {
    pos++;
    var acceptSign = true;
    var validExponent = false;
    while (pos < this.expression.length) {
      c = this.expression.charAt(pos);
      if (acceptSign && (c === "+" || c === "-")) {
        acceptSign = false;
      } else if (c >= "0" && c <= "9") {
        validExponent = true;
        acceptSign = false;
      } else {
        break;
      }
      pos++;
    }
    if (!validExponent) {
      pos = resetPos;
    }
  }
  if (valid) {
    this.current = this.newToken(TNUMBER, parseFloat(this.expression.substring(startPos, pos)));
    this.pos = pos;
  } else {
    this.pos = resetPos;
  }
  return valid;
};
TokenStream.prototype.isOperator = function() {
  var startPos = this.pos;
  var c = this.expression.charAt(this.pos);
  if (c === "+" || c === "-" || c === "*" || c === "/" || c === "%" || c === "^" || c === "?" || c === ":" || c === ".") {
    this.current = this.newToken(TOP, c);
  } else if (c === "\u2219" || c === "\u2022") {
    this.current = this.newToken(TOP, "*");
  } else if (c === ">") {
    if (this.expression.charAt(this.pos + 1) === "=") {
      this.current = this.newToken(TOP, ">=");
      this.pos++;
    } else {
      this.current = this.newToken(TOP, ">");
    }
  } else if (c === "<") {
    if (this.expression.charAt(this.pos + 1) === "=") {
      this.current = this.newToken(TOP, "<=");
      this.pos++;
    } else {
      this.current = this.newToken(TOP, "<");
    }
  } else if (c === "|") {
    if (this.expression.charAt(this.pos + 1) === "|") {
      this.current = this.newToken(TOP, "||");
      this.pos++;
    } else {
      return false;
    }
  } else if (c === "=") {
    if (this.expression.charAt(this.pos + 1) === "=") {
      this.current = this.newToken(TOP, "==");
      this.pos++;
    } else {
      this.current = this.newToken(TOP, c);
    }
  } else if (c === "!") {
    if (this.expression.charAt(this.pos + 1) === "=") {
      this.current = this.newToken(TOP, "!=");
      this.pos++;
    } else {
      this.current = this.newToken(TOP, c);
    }
  } else {
    return false;
  }
  this.pos++;
  if (this.isOperatorEnabled(this.current.value)) {
    return true;
  } else {
    this.pos = startPos;
    return false;
  }
};
TokenStream.prototype.isOperatorEnabled = function(op) {
  return this.parser.isOperatorEnabled(op);
};
TokenStream.prototype.getCoordinates = function() {
  var line = 0;
  var column;
  var newline = -1;
  do {
    line++;
    column = this.pos - newline;
    newline = this.expression.indexOf("\n", newline + 1);
  } while (newline >= 0 && newline < this.pos);
  return {
    line,
    column
  };
};
TokenStream.prototype.parseError = function(msg) {
  var coords = this.getCoordinates();
  throw new Error("parse error [" + coords.line + ":" + coords.column + "]: " + msg);
};
function ParserState(parser2, tokenStream, options) {
  this.parser = parser2;
  this.tokens = tokenStream;
  this.current = null;
  this.nextToken = null;
  this.next();
  this.savedCurrent = null;
  this.savedNextToken = null;
  this.allowMemberAccess = options.allowMemberAccess !== false;
}
ParserState.prototype.next = function() {
  this.current = this.nextToken;
  return this.nextToken = this.tokens.next();
};
ParserState.prototype.tokenMatches = function(token, value) {
  if (typeof value === "undefined") {
    return true;
  } else if (Array.isArray(value)) {
    return contains(value, token.value);
  } else if (typeof value === "function") {
    return value(token);
  } else {
    return token.value === value;
  }
};
ParserState.prototype.save = function() {
  this.savedCurrent = this.current;
  this.savedNextToken = this.nextToken;
  this.tokens.save();
};
ParserState.prototype.restore = function() {
  this.tokens.restore();
  this.current = this.savedCurrent;
  this.nextToken = this.savedNextToken;
};
ParserState.prototype.accept = function(type, value) {
  if (this.nextToken.type === type && this.tokenMatches(this.nextToken, value)) {
    this.next();
    return true;
  }
  return false;
};
ParserState.prototype.expect = function(type, value) {
  if (!this.accept(type, value)) {
    var coords = this.tokens.getCoordinates();
    throw new Error("parse error [" + coords.line + ":" + coords.column + "]: Expected " + (value || type));
  }
};
ParserState.prototype.parseAtom = function(instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }
  if (this.accept(TNAME) || this.accept(TOP, isPrefixOperator)) {
    instr.push(new Instruction(IVAR, this.current.value));
  } else if (this.accept(TNUMBER)) {
    instr.push(new Instruction(INUMBER, this.current.value));
  } else if (this.accept(TSTRING)) {
    instr.push(new Instruction(INUMBER, this.current.value));
  } else if (this.accept(TPAREN, "(")) {
    this.parseExpression(instr);
    this.expect(TPAREN, ")");
  } else if (this.accept(TBRACKET, "[")) {
    if (this.accept(TBRACKET, "]")) {
      instr.push(new Instruction(IARRAY, 0));
    } else {
      var argCount = this.parseArrayList(instr);
      instr.push(new Instruction(IARRAY, argCount));
    }
  } else {
    throw new Error("unexpected " + this.nextToken);
  }
};
ParserState.prototype.parseExpression = function(instr) {
  var exprInstr = [];
  if (this.parseUntilEndStatement(instr, exprInstr)) {
    return;
  }
  this.parseVariableAssignmentExpression(exprInstr);
  if (this.parseUntilEndStatement(instr, exprInstr)) {
    return;
  }
  this.pushExpression(instr, exprInstr);
};
ParserState.prototype.pushExpression = function(instr, exprInstr) {
  for (var i = 0, len = exprInstr.length; i < len; i++) {
    instr.push(exprInstr[i]);
  }
};
ParserState.prototype.parseUntilEndStatement = function(instr, exprInstr) {
  if (!this.accept(TSEMICOLON))
    return false;
  if (this.nextToken && this.nextToken.type !== TEOF && !(this.nextToken.type === TPAREN && this.nextToken.value === ")")) {
    exprInstr.push(new Instruction(IENDSTATEMENT));
  }
  if (this.nextToken.type !== TEOF) {
    this.parseExpression(exprInstr);
  }
  instr.push(new Instruction(IEXPR, exprInstr));
  return true;
};
ParserState.prototype.parseArrayList = function(instr) {
  var argCount = 0;
  while (!this.accept(TBRACKET, "]")) {
    this.parseExpression(instr);
    ++argCount;
    while (this.accept(TCOMMA)) {
      this.parseExpression(instr);
      ++argCount;
    }
  }
  return argCount;
};
ParserState.prototype.parseVariableAssignmentExpression = function(instr) {
  this.parseConditionalExpression(instr);
  while (this.accept(TOP, "=")) {
    var varName = instr.pop();
    var varValue = [];
    var lastInstrIndex = instr.length - 1;
    if (varName.type === IFUNCALL) {
      if (!this.tokens.isOperatorEnabled("()=")) {
        throw new Error("function definition is not permitted");
      }
      for (var i = 0, len = varName.value + 1; i < len; i++) {
        var index = lastInstrIndex - i;
        if (instr[index].type === IVAR) {
          instr[index] = new Instruction(IVARNAME, instr[index].value);
        }
      }
      this.parseVariableAssignmentExpression(varValue);
      instr.push(new Instruction(IEXPR, varValue));
      instr.push(new Instruction(IFUNDEF, varName.value));
      continue;
    }
    if (varName.type !== IVAR && varName.type !== IMEMBER) {
      throw new Error("expected variable for assignment");
    }
    this.parseVariableAssignmentExpression(varValue);
    instr.push(new Instruction(IVARNAME, varName.value));
    instr.push(new Instruction(IEXPR, varValue));
    instr.push(binaryInstruction("="));
  }
};
ParserState.prototype.parseConditionalExpression = function(instr) {
  this.parseOrExpression(instr);
  while (this.accept(TOP, "?")) {
    var trueBranch = [];
    var falseBranch = [];
    this.parseConditionalExpression(trueBranch);
    this.expect(TOP, ":");
    this.parseConditionalExpression(falseBranch);
    instr.push(new Instruction(IEXPR, trueBranch));
    instr.push(new Instruction(IEXPR, falseBranch));
    instr.push(ternaryInstruction("?"));
  }
};
ParserState.prototype.parseOrExpression = function(instr) {
  this.parseAndExpression(instr);
  while (this.accept(TOP, "or")) {
    var falseBranch = [];
    this.parseAndExpression(falseBranch);
    instr.push(new Instruction(IEXPR, falseBranch));
    instr.push(binaryInstruction("or"));
  }
};
ParserState.prototype.parseAndExpression = function(instr) {
  this.parseComparison(instr);
  while (this.accept(TOP, "and")) {
    var trueBranch = [];
    this.parseComparison(trueBranch);
    instr.push(new Instruction(IEXPR, trueBranch));
    instr.push(binaryInstruction("and"));
  }
};
var COMPARISON_OPERATORS = ["==", "!=", "<", "<=", ">=", ">", "in"];
ParserState.prototype.parseComparison = function(instr) {
  this.parseAddSub(instr);
  while (this.accept(TOP, COMPARISON_OPERATORS)) {
    var op = this.current;
    this.parseAddSub(instr);
    instr.push(binaryInstruction(op.value));
  }
};
var ADD_SUB_OPERATORS = ["+", "-", "||"];
ParserState.prototype.parseAddSub = function(instr) {
  this.parseTerm(instr);
  while (this.accept(TOP, ADD_SUB_OPERATORS)) {
    var op = this.current;
    this.parseTerm(instr);
    instr.push(binaryInstruction(op.value));
  }
};
var TERM_OPERATORS = ["*", "/", "%"];
ParserState.prototype.parseTerm = function(instr) {
  this.parseFactor(instr);
  while (this.accept(TOP, TERM_OPERATORS)) {
    var op = this.current;
    this.parseFactor(instr);
    instr.push(binaryInstruction(op.value));
  }
};
ParserState.prototype.parseFactor = function(instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }
  this.save();
  if (this.accept(TOP, isPrefixOperator)) {
    if (this.current.value !== "-" && this.current.value !== "+") {
      if (this.nextToken.type === TPAREN && this.nextToken.value === "(") {
        this.restore();
        this.parseExponential(instr);
        return;
      } else if (this.nextToken.type === TSEMICOLON || this.nextToken.type === TCOMMA || this.nextToken.type === TEOF || this.nextToken.type === TPAREN && this.nextToken.value === ")") {
        this.restore();
        this.parseAtom(instr);
        return;
      }
    }
    var op = this.current;
    this.parseFactor(instr);
    instr.push(unaryInstruction(op.value));
  } else {
    this.parseExponential(instr);
  }
};
ParserState.prototype.parseExponential = function(instr) {
  this.parsePostfixExpression(instr);
  while (this.accept(TOP, "^")) {
    this.parseFactor(instr);
    instr.push(binaryInstruction("^"));
  }
};
ParserState.prototype.parsePostfixExpression = function(instr) {
  this.parseFunctionCall(instr);
  while (this.accept(TOP, "!")) {
    instr.push(unaryInstruction("!"));
  }
};
ParserState.prototype.parseFunctionCall = function(instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }
  if (this.accept(TOP, isPrefixOperator)) {
    var op = this.current;
    this.parseAtom(instr);
    instr.push(unaryInstruction(op.value));
  } else {
    this.parseMemberExpression(instr);
    while (this.accept(TPAREN, "(")) {
      if (this.accept(TPAREN, ")")) {
        instr.push(new Instruction(IFUNCALL, 0));
      } else {
        var argCount = this.parseArgumentList(instr);
        instr.push(new Instruction(IFUNCALL, argCount));
      }
    }
  }
};
ParserState.prototype.parseArgumentList = function(instr) {
  var argCount = 0;
  while (!this.accept(TPAREN, ")")) {
    this.parseExpression(instr);
    ++argCount;
    while (this.accept(TCOMMA)) {
      this.parseExpression(instr);
      ++argCount;
    }
  }
  return argCount;
};
ParserState.prototype.parseMemberExpression = function(instr) {
  this.parseAtom(instr);
  while (this.accept(TOP, ".") || this.accept(TBRACKET, "[")) {
    var op = this.current;
    if (op.value === ".") {
      if (!this.allowMemberAccess) {
        throw new Error('unexpected ".", member access is not permitted');
      }
      this.expect(TNAME);
      instr.push(new Instruction(IMEMBER, this.current.value));
    } else if (op.value === "[") {
      if (!this.tokens.isOperatorEnabled("[")) {
        throw new Error('unexpected "[]", arrays are disabled');
      }
      this.parseExpression(instr);
      this.expect(TBRACKET, "]");
      instr.push(binaryInstruction("["));
    } else {
      throw new Error("unexpected symbol: " + op.value);
    }
  }
};
function add(a, b) {
  return Number(a) + Number(b);
}
function sub(a, b) {
  return a - b;
}
function mul(a, b) {
  return a * b;
}
function div(a, b) {
  return a / b;
}
function mod(a, b) {
  return a % b;
}
function concat(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.concat(b);
  }
  return "" + a + b;
}
function equal(a, b) {
  return a === b;
}
function notEqual(a, b) {
  return a !== b;
}
function greaterThan(a, b) {
  return a > b;
}
function lessThan(a, b) {
  return a < b;
}
function greaterThanEqual(a, b) {
  return a >= b;
}
function lessThanEqual(a, b) {
  return a <= b;
}
function andOperator(a, b) {
  return Boolean(a && b);
}
function orOperator(a, b) {
  return Boolean(a || b);
}
function inOperator(a, b) {
  return contains(b, a);
}
function sinh(a) {
  return (Math.exp(a) - Math.exp(-a)) / 2;
}
function cosh(a) {
  return (Math.exp(a) + Math.exp(-a)) / 2;
}
function tanh(a) {
  if (a === Infinity)
    return 1;
  if (a === -Infinity)
    return -1;
  return (Math.exp(a) - Math.exp(-a)) / (Math.exp(a) + Math.exp(-a));
}
function asinh(a) {
  if (a === -Infinity)
    return a;
  return Math.log(a + Math.sqrt(a * a + 1));
}
function acosh(a) {
  return Math.log(a + Math.sqrt(a * a - 1));
}
function atanh(a) {
  return Math.log((1 + a) / (1 - a)) / 2;
}
function log10(a) {
  return Math.log(a) * Math.LOG10E;
}
function neg(a) {
  return -a;
}
function not(a) {
  return !a;
}
function trunc2(a) {
  return a < 0 ? Math.ceil(a) : Math.floor(a);
}
function random(a) {
  return Math.random() * (a || 1);
}
function factorial(a) {
  return gamma(a + 1);
}
function isInteger(value) {
  return isFinite(value) && value === Math.round(value);
}
var GAMMA_G = 4.7421875;
var GAMMA_P = [
  0.9999999999999971,
  57.15623566586292,
  -59.59796035547549,
  14.136097974741746,
  -0.4919138160976202,
  3399464998481189e-20,
  4652362892704858e-20,
  -9837447530487956e-20,
  1580887032249125e-19,
  -21026444172410488e-20,
  21743961811521265e-20,
  -1643181065367639e-19,
  8441822398385275e-20,
  -26190838401581408e-21,
  36899182659531625e-22
];
function gamma(n) {
  var t, x;
  if (isInteger(n)) {
    if (n <= 0) {
      return isFinite(n) ? Infinity : NaN;
    }
    if (n > 171) {
      return Infinity;
    }
    var value = n - 2;
    var res = n - 1;
    while (value > 1) {
      res *= value;
      value--;
    }
    if (res === 0) {
      res = 1;
    }
    return res;
  }
  if (n < 0.5) {
    return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));
  }
  if (n >= 171.35) {
    return Infinity;
  }
  if (n > 85) {
    var twoN = n * n;
    var threeN = twoN * n;
    var fourN = threeN * n;
    var fiveN = fourN * n;
    return Math.sqrt(2 * Math.PI / n) * Math.pow(n / Math.E, n) * (1 + 1 / (12 * n) + 1 / (288 * twoN) - 139 / (51840 * threeN) - 571 / (2488320 * fourN) + 163879 / (209018880 * fiveN) + 5246819 / (75246796800 * fiveN * n));
  }
  --n;
  x = GAMMA_P[0];
  for (var i = 1; i < GAMMA_P.length; ++i) {
    x += GAMMA_P[i] / (n + i);
  }
  t = n + GAMMA_G + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
}
function stringOrArrayLength(s) {
  if (Array.isArray(s)) {
    return s.length;
  }
  return String(s).length;
}
function hypot() {
  var sum2 = 0;
  var larg = 0;
  for (var i = 0; i < arguments.length; i++) {
    var arg = Math.abs(arguments[i]);
    var div2;
    if (larg < arg) {
      div2 = larg / arg;
      sum2 = sum2 * div2 * div2 + 1;
      larg = arg;
    } else if (arg > 0) {
      div2 = arg / larg;
      sum2 += div2 * div2;
    } else {
      sum2 += arg;
    }
  }
  return larg === Infinity ? Infinity : larg * Math.sqrt(sum2);
}
function condition(cond, yep, nope) {
  return cond ? yep : nope;
}
function roundTo(value, exp) {
  if (typeof exp === "undefined" || +exp === 0) {
    return Math.round(value);
  }
  value = +value;
  exp = -+exp;
  if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
    return NaN;
  }
  value = value.toString().split("e");
  value = Math.round(+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
  value = value.toString().split("e");
  return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
}
function setVar(name, value, variables) {
  if (variables)
    variables[name] = value;
  return value;
}
function arrayIndex(array, index) {
  return array[index | 0];
}
function max(array) {
  if (arguments.length === 1 && Array.isArray(array)) {
    return Math.max.apply(Math, array);
  } else {
    return Math.max.apply(Math, arguments);
  }
}
function min(array) {
  if (arguments.length === 1 && Array.isArray(array)) {
    return Math.min.apply(Math, array);
  } else {
    return Math.min.apply(Math, arguments);
  }
}
function arrayMap(f, a) {
  if (typeof f !== "function") {
    throw new Error("First argument to map is not a function");
  }
  if (!Array.isArray(a)) {
    throw new Error("Second argument to map is not an array");
  }
  return a.map(function(x, i) {
    return f(x, i);
  });
}
function arrayFold(f, init, a) {
  if (typeof f !== "function") {
    throw new Error("First argument to fold is not a function");
  }
  if (!Array.isArray(a)) {
    throw new Error("Second argument to fold is not an array");
  }
  return a.reduce(function(acc, x, i) {
    return f(acc, x, i);
  }, init);
}
function arrayFilter(f, a) {
  if (typeof f !== "function") {
    throw new Error("First argument to filter is not a function");
  }
  if (!Array.isArray(a)) {
    throw new Error("Second argument to filter is not an array");
  }
  return a.filter(function(x, i) {
    return f(x, i);
  });
}
function stringOrArrayIndexOf(target, s) {
  if (!(Array.isArray(s) || typeof s === "string")) {
    throw new Error("Second argument to indexOf is not a string or array");
  }
  return s.indexOf(target);
}
function arrayJoin(sep, a) {
  if (!Array.isArray(a)) {
    throw new Error("Second argument to join is not an array");
  }
  return a.join(sep);
}
function sign(x) {
  return (x > 0) - (x < 0) || +x;
}
var ONE_THIRD = 1 / 3;
function cbrt(x) {
  return x < 0 ? -Math.pow(-x, ONE_THIRD) : Math.pow(x, ONE_THIRD);
}
function expm1(x) {
  return Math.exp(x) - 1;
}
function log1p(x) {
  return Math.log(1 + x);
}
function log2(x) {
  return Math.log(x) / Math.LN2;
}
function Parser(options) {
  this.options = options || {};
  this.unaryOps = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sinh: Math.sinh || sinh,
    cosh: Math.cosh || cosh,
    tanh: Math.tanh || tanh,
    asinh: Math.asinh || asinh,
    acosh: Math.acosh || acosh,
    atanh: Math.atanh || atanh,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt || cbrt,
    log: Math.log,
    log2: Math.log2 || log2,
    ln: Math.log,
    lg: Math.log10 || log10,
    log10: Math.log10 || log10,
    expm1: Math.expm1 || expm1,
    log1p: Math.log1p || log1p,
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    trunc: Math.trunc || trunc2,
    "-": neg,
    "+": Number,
    exp: Math.exp,
    not,
    length: stringOrArrayLength,
    "!": factorial,
    sign: Math.sign || sign
  };
  this.binaryOps = {
    "+": add,
    "-": sub,
    "*": mul,
    "/": div,
    "%": mod,
    "^": Math.pow,
    "||": concat,
    "==": equal,
    "!=": notEqual,
    ">": greaterThan,
    "<": lessThan,
    ">=": greaterThanEqual,
    "<=": lessThanEqual,
    and: andOperator,
    or: orOperator,
    "in": inOperator,
    "=": setVar,
    "[": arrayIndex
  };
  this.ternaryOps = {
    "?": condition
  };
  this.functions = {
    random,
    fac: factorial,
    min,
    max,
    hypot: Math.hypot || hypot,
    pyt: Math.hypot || hypot,
    // backward compat
    pow: Math.pow,
    atan2: Math.atan2,
    "if": condition,
    gamma,
    roundTo,
    map: arrayMap,
    fold: arrayFold,
    filter: arrayFilter,
    indexOf: stringOrArrayIndexOf,
    join: arrayJoin
  };
  this.consts = {
    E: Math.E,
    PI: Math.PI,
    "true": true,
    "false": false
  };
}
Parser.prototype.parse = function(expr) {
  var instr = [];
  var parserState = new ParserState(
    this,
    new TokenStream(this, expr),
    { allowMemberAccess: this.options.allowMemberAccess }
  );
  parserState.parseExpression(instr);
  parserState.expect(TEOF, "EOF");
  return new Expression(instr, this);
};
Parser.prototype.evaluate = function(expr, variables) {
  return this.parse(expr).evaluate(variables);
};
var sharedParser = new Parser();
Parser.parse = function(expr) {
  return sharedParser.parse(expr);
};
Parser.evaluate = function(expr, variables) {
  return sharedParser.parse(expr).evaluate(variables);
};
var optionNameMap = {
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  "/": "divide",
  "%": "remainder",
  "^": "power",
  "!": "factorial",
  "<": "comparison",
  ">": "comparison",
  "<=": "comparison",
  ">=": "comparison",
  "==": "comparison",
  "!=": "comparison",
  "||": "concatenate",
  "and": "logical",
  "or": "logical",
  "not": "logical",
  "?": "conditional",
  ":": "conditional",
  "=": "assignment",
  "[": "array",
  "()=": "fndef"
};
function getOptionName(op) {
  return optionNameMap.hasOwnProperty(op) ? optionNameMap[op] : op;
}
Parser.prototype.isOperatorEnabled = function(op) {
  var optionName = getOptionName(op);
  var operators = this.options.operators || {};
  return !(optionName in operators) || !!operators[optionName];
};
var parser = new Parser({
  operators: {
    add: true,
    substract: true,
    divide: true,
    multiply: true,
    power: true,
    remainder: true,
    conditional: true,
    logical: true,
    comparison: true
  }
});
parser.consts.\u03C0 = 3.14;
parser.functions.gcd = function(...args) {
  return gcdCalc2(args);
};
parser.functions.lcd = function(...args) {
  return lcdCalc2(args);
};
var eps = 1e-3;
parser.functions.closeTo = function(value, center) {
  const start = center - eps;
  const end = center + eps;
  return start <= value && value <= end;
};
parser.functions.red = function(value) {
  return value;
};
parser.functions.blue = function(value) {
  return value;
};
parser.functions.green = function(value) {
  return value;
};
parser.functions.color = function(color, value) {
  return value;
};
function gcdCalc2(numbers) {
  let num = 2, res = 1;
  while (num <= Math.min(...numbers)) {
    if (numbers.every((n) => n % num === 0)) {
      res = num;
    }
    num++;
  }
  return res;
}
function lcdCalcEx2(a, b) {
  return Math.abs(a * b) / gcdCalc2([a, b]);
}
function lcdCalc2(numbers) {
  return numbers.reduce((acc, num) => lcdCalcEx2(acc, num), 1);
}
function evaluate2(expression, context) {
  return parser.parse(expression).evaluate(context);
}
function substitute2(expression, source, replace) {
  return parser.parse(expression).substitute(source, replace);
}
function evalExpression(expression, quantityOrContext) {
  const expr = typeof expression === "string" ? parser.parse(expression) : toEquationExpr(expression);
  const variables = expr.variables();
  const context = typeof quantityOrContext === "number" ? { [variables.length === 1 ? variables : variables[0]]: quantityOrContext } : quantityOrContext;
  if (variables.length <= Object.keys(context).length) {
    return expr.evaluate(context);
  }
  const res = expr.simplify(context);
  return res.toString();
}
function recurExpr(node, level, requiredLevel = 0, parentContext = {}) {
  const quantity = node.quantity ?? node.ratio ?? {};
  const { context, expression } = quantity;
  const colors2 = parentContext?.colors ?? {};
  if (expression) {
    let expr = parser.parse(expression);
    const variables = expr.variables();
    for (let variable of variables) {
      const res = recurExpr(context[variable], level + 1, requiredLevel, parentContext);
      if (res.substitute != null) {
        expr = parser.parse(cleanUpExpression(expr, variable));
        if (level < requiredLevel) {
          for (let [key, values] of Object.entries(colors2)) {
            if (values.includes(context[variable]?.agent)) {
              expr = expr.substitute(variable, parser.parse(`${key}(${variable})`));
            }
          }
        }
        expr = expr.substitute(variable, res);
        if (level >= requiredLevel) {
          expr = expr.simplify();
        }
      } else {
        const q = res.quantity ?? res.ratio;
        if (typeof q == "number" || !isNaN(parseFloat(q))) {
          expr = parser.parse(cleanUpExpression(expr, variable));
          if (level >= requiredLevel) {
            expr = expr.simplify({ [variable]: q });
          } else {
            for (let [key, values] of Object.entries(colors2)) {
              if (values.includes(context[variable]?.agent)) {
                expr = expr.substitute(variable, parser.parse(`${key}(${variable})`));
              }
            }
            expr = expr.substitute(variable, q);
          }
        } else {
          expr = expr.substitute(variable, q);
        }
      }
    }
    return expr;
  } else {
    return node;
  }
}
function toEquationExpr(lastExpr, requiredLevel = 0, context = {}) {
  const final = recurExpr({ quantity: lastExpr }, 0, requiredLevel, context);
  return parser.parse(cleanUpExpression(final));
}
function evaluateNodeToNumber(lastNode) {
  const final = toEquationExpr(lastNode);
  return parseFloat(final.toString());
}
function toEquationExprAsTex(lastExpr, requiredLevel = 0, context = {}) {
  return `$ ${tokensToTex(toEquationExpr(lastExpr, requiredLevel, context).tokens)} $`;
}
function cleanUpExpression(exp, variable = "") {
  const replaced = exp.toString().replaceAll(`${variable}.quantity`, variable).replaceAll(`${variable}.ratio`, variable).replaceAll(`${variable}.baseQuantity`, variable);
  return formatNumbersInExpression(replaced);
}
function formatNumbersInExpression(expr) {
  return expr.replace(/(\d*\.\d+|\d+)/g, (match) => {
    const num = parseFloat(match);
    if (!isNaN(num)) {
      return num.toLocaleString("en", { maximumFractionDigits: 6, minimumFractionDigits: 0 }).replace(/,/g, "");
    }
    return match;
  });
}
function solveLinearEquation(lhs, rhs, variable = "x") {
  const expr = `(${typeof lhs === "number" ? lhs : toEquationExpr(lhs)}) - (${typeof rhs === "number" ? rhs : toEquationExpr(rhs)})`;
  const terms = evaluateLinearExpression(expr, variable);
  const a = terms[variable] || 0;
  const b = terms.constant || 0;
  if (a === 0) {
    if (b === 0)
      throw "Infinite solutions (identity)";
    else
      throw "No solution";
  }
  const x = -b / a;
  return x;
}
function evaluateLinearExpression(expr, variable) {
  const tokens = tokenize(expr);
  const rpn = toRPN(tokens);
  return evalRPN(rpn, variable);
}
function tokenize(str) {
  const regex = /\d+\.\d+|\d+|[a-zA-Z]+|[\+\-\*\/\(\)]/g;
  return str.match(regex);
}
function toRPN(tokens) {
  const output = [];
  const ops = [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };
  const associativity = { "+": "L", "-": "L", "*": "L", "/": "L" };
  tokens.forEach((token) => {
    if (!isNaN(token) || /^[a-zA-Z]+$/.test(token)) {
      output.push(token);
    } else if ("+-*/".includes(token)) {
      while (ops.length > 0 && "*/+-".includes(ops[ops.length - 1])) {
        const top = ops[ops.length - 1];
        if (associativity[token] === "L" && precedence[token] <= precedence[top] || associativity[token] === "R" && precedence[token] < precedence[top]) {
          output.push(ops.pop());
        } else
          break;
      }
      ops.push(token);
    } else if (token === "(") {
      ops.push(token);
    } else if (token === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") {
        output.push(ops.pop());
      }
      ops.pop();
    }
  });
  while (ops.length)
    output.push(ops.pop());
  return output;
}
function evalRPN(rpn, variable) {
  const stack = [];
  rpn.forEach((token) => {
    if (!isNaN(token)) {
      stack.push({ constant: parseFloat(token) });
    } else if (token === variable) {
      stack.push({ [variable]: 1 });
    } else if ("+-*/".includes(token)) {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(applyOp(a, b, token, variable));
    }
  });
  return stack.pop();
}
function applyOp(a, b, op, variable) {
  const aCoeff = a[variable] || 0;
  const bCoeff = b[variable] || 0;
  const aConst = a.constant || 0;
  const bConst = b.constant || 0;
  if (op === "+") {
    return {
      [variable]: aCoeff + bCoeff,
      constant: aConst + bConst
    };
  }
  if (op === "-") {
    return {
      [variable]: aCoeff - bCoeff,
      constant: aConst - bConst
    };
  }
  if (op === "*") {
    if (aCoeff !== 0 && bCoeff !== 0) {
      throw new Error("Non-linear term produced \u2014 equation must remain linear.");
    }
    return {
      [variable]: aCoeff * bConst + bCoeff * aConst,
      constant: aConst * bConst
    };
  }
  if (op === "/") {
    if (bCoeff !== 0) {
      throw new Error("Division by a variable not supported.");
    }
    return {
      [variable]: aCoeff / bConst,
      constant: aConst / bConst
    };
  }
}
var colors = {
  darkred: "#e7040f",
  red: "#ff4136",
  lightred: "#ff725c",
  orange: "#ff6300",
  gold: "#ffb700",
  yellow: "#ffd700",
  lightyellow: "#fbf1a9",
  purple: "#5e2ca5",
  lightpurple: "#a463f2",
  darkpink: "#d5008f",
  hotpink: "#ff41b4",
  pink: "#ff80cc",
  lightpink: "#ffa3d7",
  darkgreen: "#137752",
  green: "#19a974",
  lightgreen: "#9eebcf",
  navy: "#001b44",
  darkblue: "#1b4b98",
  blue: "#266bd9",
  lightblue: "#96ccff"
};
function tokensToTex(tokens, opts = {}) {
  const options = {
    mulSymbol: "\\cdot",
    // "\\cdot", " ", "\\times", ""
    divMode: "frac",
    // "frac" | "slash"
    stretchyParens: true,
    implicitMul: false,
    ...opts
  };
  const stack = [];
  function parens(str) {
    return options.stretchyParens ? `\\left(${str}\\right)` : `(${str})`;
  }
  for (const tok of tokens) {
    switch (tok.type) {
      case "INUMBER":
        stack.push(String(tok.value));
        break;
      case "IVARNAME":
      case "IVAR":
        stack.push(tok.value);
        break;
      case "IOP1": {
        const a = stack.pop();
        if (tok.value === "sqrt") {
          stack.push(`\\sqrt{${a}}`);
        } else {
          stack.push(`${tok.value}${parens(a)}`);
        }
        break;
      }
      case "IOP2": {
        const b = stack.pop();
        const a = stack.pop();
        if (tok.value === "/") {
          if (options.divMode === "frac") {
            stack.push(`\\frac{${a}}{${b}}`);
          } else {
            stack.push(`${a} / ${b}`);
          }
        } else if (tok.value === "^") {
          stack.push(`${parens(a)}^{${b}}`);
        } else if (tok.value === "*") {
          const sym = options.implicitMul ? "" : options.mulSymbol;
          stack.push(`${a}${sym} ${b}`);
        } else {
          const texOps = { "==": "=", "!=": "\\ne", "<=": "\\le", ">=": "\\ge" };
          stack.push(`(${a} ${texOps[tok.value] || tok.value} ${b})`);
        }
        break;
      }
      case "IOP3": {
        const c = stack.pop();
        const b = stack.pop();
        const a = stack.pop();
        stack.push(`${a}\\ ?\\ ${b}\\ :\\ ${c}`);
        break;
      }
      case "FUNCALL":
      case "IFUNCALL": {
        const argCount = tok.value || 0;
        const args = [];
        for (let i = 0; i < argCount; i++) {
          args.unshift(stack.pop());
        }
        const f = stack.pop();
        if (tok.value === "sqrt" && args.length === 1) {
          stack.push(`\\sqrt{${args[0]}}`);
        } else if (tok.value === "abs" && args.length === 1) {
          stack.push(`\\left|${args[0]}\\right|`);
        } else if (["sin", "cos", "tan", "log", "ln"].includes(tok.value)) {
          stack.push(`\\${tok.value}\\left(${args.join(", ")}\\right)`);
        } else if (["red", "blue", "green"].includes(f)) {
          stack.push(`\\textcolor{${colors[f]}}{${args.join(", ")}}`);
        } else {
          stack.push(`${tok.value}\\left(${args.join(", ")}\\right)`);
        }
        break;
      }
      default:
        stack.push(String(tok.value));
    }
  }
  return stack.pop();
}

// src/math/math-configure.ts
var convert = configureMeasurements({
  length: length_default,
  area: area_default,
  volume: volume_default,
  mass: mass_default,
  time: time_default,
  angle: angle_default
});
configure({
  convertToFraction: (d) => new Fraction(d).toFraction(),
  convertToUnit: (d, from, to2) => convert(d).from(from).to(to2),
  unitAnchor: (unit) => convert().getUnit(unit)?.unit?.to_anchor,
  solveLinearEquation: (first, second, variable) => solveLinearEquation(first, second, variable),
  evalExpression: (expression, quantity) => evalExpression(expression, quantity),
  evalNodeToNumber: (expression) => evaluateNodeToNumber(expression)
});
var inferenceRuleWithQuestion2 = inferenceRuleWithQuestion;

// src/utils/deduce-utils.ts
function axiomInput(predicate, label) {
  return {
    ...predicate,
    ...{
      labelKind: "input",
      label
    }
  };
}
function deduceLbl(value) {
  return {
    labelKind: "deduce",
    label: value
  };
}
function isPredicate(node) {
  return node.kind != null;
}
function last(input) {
  return input.children[input.children.length - 1];
}
function lastQuantity(input) {
  const lastPredicate = last(input);
  return isNumber(lastPredicate.quantity) ? lastPredicate.quantity : lastPredicate.quantity;
}
function deduceAs(context) {
  return (...children) => {
    return toAs(context)(...children.concat(inferenceRule.apply(null, children.map((d) => isPredicate(d) ? d : d.children.slice(-1)[0]))));
  };
}
function deduce(...children) {
  return to(...children.concat(inferenceRule.apply(null, children.map((d) => isPredicate(d) ? d : d.children.slice(-1)[0]))));
}
function toAs(context) {
  return (...children) => {
    return { children, context };
  };
}
function to(...children) {
  return { children };
}
function toCont(child, { agent, entity: entity3 }) {
  return toPredicate(child, mapToCont({ agent, entity: entity3 }));
}
function toFrequency(child, { agent, entityBase, baseQuantity }) {
  return toPredicate(child, mapToFrequency({ agent, entityBase, baseQuantity }));
}
function toRate(child, { agent, entity: entity3, entityBase }) {
  return to(child, {
    kind: "rate",
    agent,
    entity: entity3,
    entityBase,
    quantity: child.ratio,
    baseQuantity: 1,
    asRatio: true
  });
}
function mapToCont({ agent, entity: entity3 }) {
  return (node) => {
    const typeNode = node;
    return {
      kind: "cont",
      agent,
      quantity: typeNode.quantity,
      entity: entity3 != null ? entity3.entity : typeNode.kind == "quota" ? typeNode.agentQuota : typeNode.kind == "rate" ? typeNode.entity.entity : typeNode.entity,
      unit: entity3 != null ? entity3.unit : typeNode.kind == "rate" ? typeNode.entity.unit : typeNode.kind == "quota" ? void 0 : typeNode.unit
    };
  };
}
function mapToFrequency({ agent, entityBase, baseQuantity }) {
  return (node) => {
    return {
      kind: "frequency",
      agent,
      quantity: node.quantity,
      baseQuantity,
      entity: {
        entity: node.entity,
        unit: node.unit
      },
      entityBase
    };
  };
}
function toPredicate(node, mapFn) {
  const nodeToMap = isPredicate(node) ? node : last(node);
  const newNode = mapFn(nodeToMap);
  return { children: [...isPredicate(node) ? [node] : node.children.slice(0, -1), newNode] };
}
function connectTo(node, input) {
  let inputState = {
    node: { children: input.children.map((d) => ({ ...d })) },
    used: false
  };
  const connect = function(node2, input2) {
    if (isPredicate(node2)) {
      if (node2 === input2.children[input2.children.length - 1]) {
        const newNode = inputState.used ? inputState.node.children[inputState.node.children.length - 1] : inputState.node;
        inputState.used = true;
        return newNode;
      }
      return node2;
    }
    if (node2.children && Array.isArray(node2.children)) {
      let newChildren = [];
      for (const child of node2.children) {
        const newChild = connect(child, input2);
        newChildren.push(newChild);
      }
      node2.children = newChildren;
    }
    return node2;
  };
  return connect(node, input);
}
function isEmptyOrWhiteSpace(value) {
  return value == null || typeof value === "string" && value.trim() === "";
}
var mdFormattingFunc = (defaultExpressionDepth, context = null) => ({
  compose: (strings, ...args) => concatString(strings, ...args),
  formatKind: (d) => `[${d.kind.toUpperCase()}]`,
  formatQuantity: (d) => {
    if (typeof d === "number") {
      return d.toLocaleString("cs-CZ");
    } else if (d?.expression != null) {
      return toEquationExprAsTex(d, isObjectContext(context) ? context.depth ?? defaultExpressionDepth : defaultExpressionDepth, isObjectContext(context) ? context : null);
    } else if (typeof d === "string") {
      return d;
    } else {
      return d;
    }
  },
  formatRatio: (d, asPercent) => {
    if (typeof d === "number") {
      return asPercent ? `${(d * 100).toLocaleString("cs-CZ")}%` : new Fraction(d).toFraction();
    } else if (d?.expression != null) {
      const colorContext = isObjectContext(context) ? context : null;
      const requiredLevel = isObjectContext(context) ? context.depth ?? defaultExpressionDepth : defaultExpressionDepth;
      return asPercent ? toEquationExprAsTex({ ...d, expression: `(${d.expression}) * 100` }, requiredLevel, colorContext) : toEquationExprAsTex(d, requiredLevel, colorContext);
    } else if (typeof d === "string") {
      return d;
    } else {
      return d;
    }
  },
  formatEntity: (d, unit) => {
    const res = [unit, d].filter((d2) => d2 != null).join(" ");
    return isEmptyOrWhiteSpace(res) ? "" : `__${res.trim()}__`;
  },
  formatAgent: (d) => `**${d}**`,
  formatSequence: (d) => `${formatSequence2(d)}`,
  formatTable: (data) => `vzor opakov\xE1n\xED ${data.map((d) => d[1]).join()}`
});
var mdFormatting = mdFormattingFunc(0);
var mermaidFormatting = {
  ...mdFormatting,
  formatKind: (d) => ``
};
function formatSequence2(type) {
  const simplify2 = (d, op = "") => d !== 1 ? `${d}${op}` : "";
  if (type.kind === "arithmetic")
    return `${type.sequence.join()} => a^n^ = ${type.sequence[0]} + ${type.commonDifference}(n-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements(first, second, type.secondDifference);
    const parts = [`${simplify2(A)}n^2^`];
    if (B !== 0) {
      parts.concat(`${simplify2(B)}n`);
    }
    if (C !== 0) {
      parts.concat(`${simplify2(C)}n`);
    }
    return `${type.sequence.join()} => a^n^ = ${parts.map((d, i) => `${i !== 0 ? " + " : ""}${d}`)}`;
  }
  if (type.kind === "geometric") {
    return `${type.sequence.join()} => a^n^ = ${simplify2(type.sequence[0], "*")}${type.commonRatio}^(n-1)^`;
  }
}
function formatPredicate(d, formatting) {
  const { formatKind, formatAgent, formatEntity: formatEntity2, formatQuantity, formatRatio: formatRatio2, formatSequence: formatSequence3, formatTable, compose } = { ...mdFormatting, ...formatting };
  if (isQuantityPredicate(d) && d.quantity == null || isRatioPredicate(d) && d.ratio == null || isRatiosPredicate(d) && d.ratios == null) {
    return formatKind(d);
  }
  let result = "";
  switch (d.kind) {
    case "cont":
      result = compose`${formatAgent(d.agent)}=${d.asRatio ? formatRatio2(d.quantity) : formatQuantity(d.quantity)}${d.entity != "" ? " " : ""}${formatEntity2(d.entity, d.unit)}`;
      break;
    case "frequency":
      result = compose`${formatAgent(d.agent)}=${formatQuantity(d.quantity)} ${formatEntity2(d.entity.entity, d.entity.unit)} po ${formatQuantity(d.baseQuantity)}${d.entityBase.entity != "" ? " " : ""}${formatEntity2(d.entityBase.entity, d.entityBase.unit)}`;
      break;
    case "comp":
      if (isNumber(d.quantity)) {
        result = d.quantity === 0 ? compose`${formatAgent(d.agentA)} je rovno ${formatAgent(d.agentB)}` : compose`${formatAgent(d.agentA)} ${d.quantity > 0 ? "v\xEDce" : "m\xE9n\u011B"} než ${formatAgent(d.agentB)} o ${formatQuantity(Math.abs(d.quantity))}${d.entity != "" ? " " : ""}${formatEntity2(d.entity, d.unit)}`;
      } else {
        result = compose`rozdíl o ${formatQuantity(d.quantity)} ${formatEntity2(d.entity, d.unit)} mezi ${formatAgent(d.agentA)} a ${formatAgent(d.agentB)}`;
      }
      break;
    case "transfer":
      if (isNumber(d.quantity)) {
        result = d.quantity === 0 ? compose`${formatAgent(d.agentReceiver.name)} je rovno ${formatAgent(d.agentSender.name)}` : d.agentReceiver === d.agentSender ? compose`změna o ${formatQuantity(d.quantity)} ${formatEntity2(d.entity, d.unit)} mezi ${formatAgent(d.agentSender.nameBefore)} a ${formatAgent(d.agentSender.nameAfter)}` : compose`${formatQuantity(Math.abs(d.quantity))} ${formatEntity2(d.entity, d.unit)}, ${formatAgent(d.quantity > 0 ? d.agentSender.name : d.agentReceiver.name)} => ${formatAgent(d.quantity > 0 ? d.agentReceiver.name : d.agentSender.name)}`;
      } else {
        result = d.agentReceiver === d.agentSender ? compose`změna o ${formatQuantity(d.quantity)} ${formatEntity2(d.entity, d.unit)} mezi ${formatAgent(d.agentSender.nameBefore)} a ${formatAgent(d.agentSender.nameAfter)}` : compose`transfer o ${formatQuantity(d.quantity)} ${formatEntity2(d.entity, d.unit)} mezi ${formatAgent(d.agentSender.name)} a ${formatAgent(d.agentReceiver.name)}`;
      }
      break;
    case "delta":
      result = d.quantity === 0 ? compose`${formatAgent(d.agent.nameBefore ?? d.agent.name)} je rovno ${formatAgent(d.agent.nameAfter ?? d.agent.name)}` : compose`změna o ${formatQuantity(d.quantity)} ${formatEntity2(d.entity, d.unit)} mezi ${formatAgent(d.agent.nameBefore ?? d.agent.name)} a ${formatAgent(d.agent.nameAfter ?? d.agent.name)}`;
      break;
    case "comp-ratio":
      if (isNumber(d.ratio)) {
        const between = d.ratio > 1 / 2 && d.ratio < 2;
        result = between || d.asPercent ? compose`${formatAgent(d.agentA)} ${d.ratio < 1 ? "m\xE9n\u011B" : "v\xEDce"} o ${formatRatio2(d.ratio > 1 ? d.ratio - 1 : 1 - d.ratio, d.asPercent)} než ${formatAgent(d.agentB)}` : compose`${formatAgent(d.agentA)} ${formatRatio2(d.ratio > 1 ? Math.abs(d.ratio) : 1 / Math.abs(d.ratio), false)} krát ${d.ratio > 1 ? "v\xEDce" : "m\xE9n\u011B"} než ${formatAgent(d.agentB)}`;
      } else {
        result = compose`poměr ${formatQuantity(d.ratio)} mezi ${formatAgent(d.agentA)} a ${formatAgent(d.agentB)}`;
      }
      break;
    case "comp-diff":
      result = compose`${formatAgent(d.agentMinuend)} - ${formatAgent(d.agentSubtrahend)}=${formatQuantity(d.quantity)}${d.entity != "" ? " " : ""}${formatEntity2(d.entity, d.unit)}`;
      break;
    case "ratio":
      result = compose`${formatAgent(d.part)} z ${formatAgent(d.whole)}=${formatRatio2(d.ratio, d.asPercent)}`;
      break;
    case "ratios":
      result = compose`${formatAgent(d.whole)} ${joinArray(d.parts?.map((d2) => formatAgent(d2)), ":")} v poměru ${joinArray(d.ratios?.map((d2) => formatQuantity(d2)), ":")}`;
      break;
    case "sum":
    case "sum-combine":
      result = compose`${formatKind(d)} ${joinArray(d.partAgents?.map((d2) => formatAgent(d2)), " + ")}`;
      break;
    case "product":
    case "product-combine":
      result = compose`${formatKind(d)} ${joinArray(d.partAgents?.map((d2) => formatAgent(d2)), " * ")}`;
      break;
    case "rate":
      result = compose`${formatAgent(d.agent)} ${d.asRatio ? formatRatio2(d.quantity) : formatQuantity(d.quantity)} ${formatEntity2(d.entity.entity, d.entity.unit)} per ${isNumber(d.baseQuantity) && d.baseQuantity == 1 ? "" : formatQuantity(d.baseQuantity)}${d.entityBase.entity != "" ? " " : ""}${formatEntity2(d.entityBase.entity, d.entityBase.unit)}`;
      break;
    case "quota":
      result = compose`${formatAgent(d.agent)} rozděleno na ${formatQuantity(d.quantity)} ${formatAgent(d.agentQuota)} ${d.restQuantity !== 0 ? ` se zbytkem ${formatQuantity(d.restQuantity)}` : ""}`;
      break;
    case "sequence":
      result = compose`${d.type != null ? formatSequence3(d.type) : ""}`;
      break;
    case "pattern":
      result = compose`${formatTable(
        [
          ...[1, 2, 3, 4, 5].map((pos) => [pos, evaluate2(d.nthTerm, { n: pos }), d.nthTermFormat != null ? d.nthTermFormat(pos) : substitute2(d.nthTerm, "n", pos.toString())]),
          ["...", "...", "..."]
        ]
      )}`;
      break;
    case "nth-part":
      result = compose`${formatAgent(d.agent)}`;
      break;
    case "nth":
      result = compose`${formatEntity2(d.entity)}`;
      break;
    case "unit":
      result = compose`převod na ${d.unit}`;
      break;
    case "proportion":
      result = compose`${d.inverse ? "nep\u0159\xEDm\xE1" : "p\u0159\xEDm\xE1"} úměra mezi ${d.entities.join(" a ")}`;
      break;
    case "common-sense":
      result = compose`${d.description}`;
      break;
    case "comp-angle":
      result = compose`${formatAngle(d.relationship)}`;
      break;
    case "eval-expr":
    case "eval-formula":
      const { predicate, expression } = d;
      result = predicate.kind === "cont" ? compose`${formatAgent(predicate.agent)} = [${expression}]${predicate.entity != "" ? " " : ""}${formatEntity2(predicate.entity, predicate.unit)}` : predicate.kind === "rate" ? compose`${formatAgent(predicate.agent)} [${expression}]${predicate.entity.entity != "" ? " " : ""}${formatEntity2(predicate.entity.entity, predicate.entity.unit)} per ${isNumber(predicate.baseQuantity) && predicate.baseQuantity == 1 ? "" : formatQuantity(predicate.baseQuantity)}${predicate.entityBase.entity != "" ? " " : ""}${formatEntity2(predicate.entityBase.entity, predicate.entityBase.unit)}` : compose`${expression}`;
      break;
    case "simplify-expr":
      result = compose`substituce za ${JSON.stringify(d.context)}`;
      break;
    case "tuple":
      result = d.items != null ? compose`${joinArray(d.items.map((d2) => formatPredicate(d2, formatting)), ", ")}` : formatKind(d);
      break;
    case "eval-option":
      result = d.value === void 0 ? compose`${d.optionValue != null ? `Volba [${d.optionValue}]: ${d.expectedValue != null ? d.expectedValueOptions?.asFraction ? formatRatio2(d.expectedValue) : formatQuantity(d.expectedValue) : d.expressionNice}` : d.expressionNice}` : compose`${d.value === true ? "Pravda" : d.value === false ? "Nepravda" : d.value != null ? `Volba [${d.value}]` : "N/A"}`;
      break;
    default:
      result = formatKind(d);
      break;
  }
  return compose`${result}`;
}
function joinArray(arr, sep) {
  return arr?.flatMap(
    (d, index) => index < arr.length - 1 ? [d, sep] : [d]
  );
}
function concatString(strings, ...substitutions) {
  const formattedString = strings.reduce((acc, curr, i) => {
    const substitution = substitutions[i];
    const res = substitution ? `${curr}${Array.isArray(substitution) ? substitution.join("") : substitution}` : curr;
    return `${acc}${res}`;
  }, "");
  return formattedString;
}
function createLazyMap(thunks) {
  const lazyMap = {};
  for (const key in thunks) {
    Object.defineProperty(lazyMap, key, {
      get() {
        try {
          return thunks[key]();
        } catch (error) {
          console.error(`Error in "${key}":`, error);
          throw error;
        }
      },
      configurable: true,
      enumerable: true
    });
  }
  return lazyMap;
}
var anglesNames = {
  alpha: "\u{1D6FC}",
  beta: "\u{1D6FD}",
  gamma: "\u{1D6FE}",
  delta: "\u{1D6FF}",
  theta: "\u{1D703}",
  lambda: "\u{1D706}",
  omega: "\u{1D714}",
  phi: "\u{1D711}"
};
function isObjectContext(context) {
  return context != null && typeof context === "object";
}

// src/math/comparing-values.ts
var comparingValues = ({ input }) => {
  const { first, second } = input;
  const entity3 = "litr";
  return {
    deductionTree: deduce(
      deduce(
        axiomInput(ratio("zadan\xE1 hodnota", "prvn\xED hodnota", first.ratio), 1),
        axiomInput(cont("zadan\xE1 hodnota", first.value, entity3), 2)
      ),
      deduce(
        axiomInput(ratio("zadan\xE1 hodnota", "druh\xE1 hodnota", second.ratio), 3),
        axiomInput(cont("zadan\xE1 hodnota", second.value, entity3), 4)
      )
    )
  };
};

// src/math/compass.ts
var compass = () => {
  const agent = "n\xE1kup kru\u017E\xEDtek";
  const entityPrice = "korun";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(cont("chyb\u011Blo", 160, entityPrice), 2),
          axiomInput(cont("zbylo", 100, entityPrice), 3),
          sum(agent)
        ),
        axiomInput(cont(agent, 2, "kus"), 1),
        ctor("rate")
      ),
      axiomInput(cont(agent, 4, "kus"), 4)
    )
  };
};

// src/math/obrazce.ts
var obrazce = () => {
  const entityRow = "\u0159\xE1dk\u016F";
  const entityColumn = "sloupc\u016F";
  const entityTmave = "tmav\xFD \u010Dtvere\u010Dek";
  const entitySvetle = "sv\u011Btl\xE9 \u010Dtvere\u010Dek";
  const entity3 = "\u010Dtvere\u010Dk\u016F";
  const base = "z\xE1kladn\xED obrazec";
  const extended = "roz\u0161\xED\u0159en\xFD obrazec";
  const dd1 = deduce(
    cont(`p\u0159id\xE1no ${extended}`, 30, entityTmave),
    deduce(
      cont(`lev\xFD sloupec ${extended}`, 6, entityTmave),
      cont(`prav\xFD sloupec ${extended}`, 6, entityTmave),
      sum("oba krajn\xED sloupce")
    ),
    ctorDifference(base)
  );
  return [
    {
      deductionTree: toCont(
        dd1,
        //commonSense("horní řada tmavých čtverčků bez krajních sloupců rozšířeného obrazce odpovídá počtu sloupců základního obrazce"),
        { agent: base, entity: { entity: entityColumn } }
      )
    },
    {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(`lev\xFD sloupec`, 3, entity3),
            cont(`prav\xFD sloupec`, 3, entity3),
            sum("oba krajn\xED sloupce")
          ),
          ratios(extended, [entitySvetle, "horn\xED \u0159ada", "oba krajn\xED sloupce"], [2, 1, 1])
        ),
        cont(extended, 3, entityRow),
        ctor("rate")
      )
    },
    {
      deductionTree: to(
        deduce(
          rate("oba krajn\xED sloupce", 2, entityTmave, entityRow),
          cont("oba krajn\xED sloupce", 24, entityRow)
        ),
        commonSense("z\xE1kladn\xED obrazec je tvo\u0159en jednou nebo v\xEDce \u0159adami sv\u011Btl\xFDch \u010Dtvere\u010Dk\u016F."),
        commonSense("2 \u0159\xE1dky jsou minimum a 24 \u0159\xE1dk\u016F je maximum."),
        commonSense("mo\u017En\xFDch roz\u0161\xED\u0159en\xFDch obrazc\u016F tvo\u0159\xED obrazce s 2, 3, 4... 24 \u0159\xE1dk\u016F"),
        cont("mo\u017En\xFDch roz\u0161\xED\u0159en\xFDch obrazc\u016F s 50 tmav\xFDmi \u010Dtvere\u010Dky", 23, extended)
      )
    }
  ];
};

// src/math/odmeny-soutezici.ts
var odmenySoutezici = () => {
  const souteziciLabel = "sout\u011B\u017E\xEDc\xED";
  const odmenaLabel = "odm\u011Bna";
  const entity3 = "K\u010D";
  const druhy = axiomInput(cont(`2.${souteziciLabel}`, 300, entity3), 3);
  const prvni = axiomInput(ratio(odmenaLabel, `1.${souteziciLabel}`, 1 / 2), 1);
  const treti = deduce(
    prvni,
    axiomInput(compRatio(`1.${souteziciLabel}`, `3.${souteziciLabel}`, 3), 3)
  );
  const druhyRelative = deduce(
    deduce(
      prvni,
      treti,
      sum(`1. a 3. ${souteziciLabel}`)
    ),
    ctorComplement(`2.${souteziciLabel}`)
  );
  return [
    {
      deductionTree: deduce(
        druhyRelative,
        { ...last(treti), ...deduceLbl(1) },
        ctor("comp-ratio")
      )
    },
    {
      deductionTree: deduce(
        { ...last(druhyRelative), ...deduceLbl(3) },
        druhy
      )
    }
  ];
};

// src/math/sesity.ts
var sesity = () => {
  const ctvereckovaniSesitLabel = "\u010Dtvere\u010Dkovan\xFD se\u0161it";
  const linkovanySesitLabel = "linkovan\xFD se\u0161it";
  const entity3 = "se\u0161it";
  const entityPrice = "K\u010D";
  const pocetLabel = "po\u010Det se\u0161it\u016F za stejnou cenu";
  const ctvereckovanyPocet = cont(ctvereckovaniSesitLabel, 2, entity3);
  const linkovanyPocet = cont(linkovanySesitLabel, 2, entity3);
  const cenaSesitu = ratios(pocetLabel, [ctvereckovaniSesitLabel, linkovanySesitLabel], [2, 3]);
  return [
    {
      deductionTree: deduce(
        cont("celkem koupeno", 36, entity3),
        compRatio(linkovanySesitLabel, ctvereckovaniSesitLabel, 3),
        nthPart(linkovanySesitLabel)
      )
    },
    {
      deductionTree: deduce(
        deduce(
          cont(linkovanySesitLabel, 180, entityPrice),
          deduce(
            linkovanyPocet,
            deduce(
              ratios(pocetLabel, [ctvereckovaniSesitLabel, linkovanySesitLabel], [2, 3]),
              ctvereckovanyPocet,
              nthPart(linkovanySesitLabel)
            ),
            sum(linkovanySesitLabel)
          ),
          ctor("rate")
        ),
        deduce(cenaSesitu, ctorRatiosInvert("cena se\u0161it\u016F")),
        nthPart(ctvereckovaniSesitLabel)
      )
    }
  ];
};

// src/math/trideni-odpady.ts
var trideni_odpadu = () => {
  const oddilR = "odd\xEDl R";
  const oddilS = "odd\xEDl S";
  const oddilT = "odd\xEDl T";
  const entityPapir = "pap\xEDr";
  const entityPlast = "plast";
  const entityKovy = "kovy";
  const entity3 = "hmotnost";
  const unit = "kg";
  const kovyCelkem = deduce(
    cont(oddilR, 3, entityKovy, unit),
    cont(oddilS, 3, entityKovy, unit),
    cont(oddilT, 4, entityKovy, unit),
    sum(`kovy v\u0161echny odd\xEDly`, { entity: entity3, unit })
  );
  const papirCelkem = deduce(
    cont(oddilR, 6, entityPapir, unit),
    cont(oddilS, 8, entityPapir, unit),
    cont(oddilT, 1, entityPapir, unit),
    sum(`pap\xEDr v\u0161echny odd\xEDly`, { entity: entity3, unit })
  );
  const plast = deduce(
    deduce(
      cont(oddilT, 9, entityPlast, unit),
      cont(oddilS, 11, entityPlast, unit),
      sum(`odd\xEDl S a T`)
    ),
    cont(oddilR, 15, entityPlast, unit),
    ctor("comp-ratio")
  );
  return {
    papirStoR: {
      deductionTree: deduce(
        deduce(
          cont(oddilS, 8, entityPapir, unit),
          cont(oddilR, 6, entityPapir, unit),
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1 / 4)
      )
    },
    papirRtoS: {
      deductionTree: deduce(
        deduce(
          cont(oddilR, 6, entityPapir, unit),
          cont(oddilS, 8, entityPapir, unit),
          ctor("comp-ratio")
        ),
        ctorOption("C", 1 / 4, { asFraction: true })
      )
    },
    plast1: {
      deductionTree: deduce(
        plast,
        ctorOption("D", 1 / 3, { asFraction: true })
      )
    },
    plast2: {
      deductionTree: deduce(
        plast,
        ctorBooleanOption(1 / 3, "closeTo", { asFraction: true })
      )
    },
    kovyToPapir: {
      deductionTree: deduce(
        deduce(
          kovyCelkem,
          papirCelkem,
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1 / 2, "closeTo", { asFraction: true })
      )
    },
    papirToKovy: {
      deductionTree: deduce(
        deduce(
          papirCelkem,
          kovyCelkem,
          ctor("comp-ratio")
        ),
        ctorOption("E", 1 / 2, { asFraction: true })
      )
    }
  };
};

// src/math/M7A-2023/cetar.ts
function build({ input }) {
  const agent = "rota";
  const kapitanLabel = "kapit\xE1n";
  const porucikLabel = "poru\u010D\xEDk";
  const cetarLabel = "\u010Deta\u0159";
  const vojinLabel = "voj\xEDn";
  const entity3 = "rozkaz";
  const kapitan = axiomInput(cont(agent, input.kapitan, kapitanLabel), 1);
  const porucik = axiomInput(cont(agent, input.porucik, porucikLabel), 2);
  const cetarPerPorucik = axiomInput(rate(agent, input.cetarPerPorucik, cetarLabel, porucikLabel), 3);
  const vojinPerCetar = axiomInput(rate(agent, input.vojinPerCetar, vojinLabel, cetarLabel), 4);
  const pocetCetaru = deduce(
    porucik,
    cetarPerPorucik
  );
  const pocetVojinu = deduce(
    pocetCetaru,
    vojinPerCetar
  );
  const dTree2 = deduce(
    kapitan,
    porucik,
    last(pocetCetaru),
    sum("vydan\xE9 rozkazy", { entity: entity3 })
  );
  const dTree3 = deduce(
    porucik,
    last(pocetCetaru),
    last(pocetVojinu),
    sum("p\u0159ijat\xE9 rozkazy", { entity: entity3 })
  );
  const template1 = (html) => html`<br/><strong>Kolik osob v rotě dostalo rozkaz k nástupu?</strong>`;
  const template = (highlight) => highlight`V rotě je ${input.kapitan} kapitán a má pod sebou ${input.porucik} poručíky.Každý poručík má pod sebou ${input.cetarPerPorucik} své četaře
a každý četař má pod sebou ${input.vojinPerCetar} svých vojínů. (Další osoby v rotě nejsou.)
Kapitán se rozhodl svolat celou rotu k nástupu.Rozkaz k nástupu se předával tak, že
kapitán vydal rozkaz všem poručíkům, z nichž každý vydal tento rozkaz svým četařům
a každý četař jej vydal svým vojínům.Poté celá rota nastoupila.
  ${template1}`;
  return [
    {
      deductionTree: pocetVojinu
    },
    {
      deductionTree: dTree2
    },
    {
      deductionTree: dTree3,
      template
    }
  ];
}

// src/math/M7A-2023/zakusek.ts
function build2({ input }) {
  const piece1 = "1.z\xE1kusek";
  const piece2 = "2.z\xE1kusek";
  const piece3 = "3.z\xE1kusek";
  const entity3 = "K\u010D";
  const totalPrice = "celkem";
  const partTotalPrice = "1.z\xE1k.+2.z\xE1k";
  const p1p2 = axiomInput(compRelative(piece2, piece1, -1 / 4), 2);
  const p1 = axiomInput(cont(piece1, input.cena, entity3), 1);
  const p2Ratio = ratio(piece1, piece2, 3 / 4);
  const p3Ratio = ratio(totalPrice, partTotalPrice, 2 / 3);
  const oneThird = axiomInput(ratio(totalPrice, piece3, 1 / 3), 3);
  const soucet = sum(partTotalPrice);
  const dd1 = inferenceRule(p1, p2Ratio);
  const dd2 = inferenceRule(p1, dd1, soucet);
  const dd3 = inferenceRule(dd2, p3Ratio);
  const deductionTree = deduce(
    deduce(
      { ...dd1, ...deduceLbl(2) },
      deduce(
        deduce(
          deduce(
            p1,
            deduce(
              p1,
              p1p2
            ),
            soucet
          ),
          deduce(
            oneThird,
            ctorComplement(partTotalPrice)
          )
        ),
        oneThird
      )
    ),
    ctorExpressionOption("A", "x < 12")
  );
  const zak2 = dd2.kind === "cont" ? dd2.quantity - input.cena : 0;
  const celkemVse = dd3.kind === "cont" ? dd3.quantity : 0;
  const data = [
    { agent: "\u010D.1", value: input.cena },
    { agent: "\u010D.2", value: zak2 },
    { agent: "\u010D.3", value: celkemVse - (input.cena + zak2) }
  ];
  const template = (highlight) => highlight`
  Maminka koupila v cukrárně tři různé zákusky.
  První zákusek stál ${input.cena} korun.
  Druhý zákusek byl o ${"\u010Dtvrtinu levn\u011Bj\u0161\xED ne\u017E prvn\xED"}.
  Cena třetího zákusku byla ${"t\u0159etinou celkov\xE9 ceny v\u0161ech t\u0159\xED z\xE1kusk\u016F"}.
  ${(html) => html`<br/><strong>O kolik korun byl třetí zákusek dražší než druhý?</strong>`}`;
  return { deductionTree, data, template };
}

// src/math/M7A-2023/index.ts
var cetarParams = {
  input: {
    kapitan: 1,
    porucik: 4,
    cetarPerPorucik: 3,
    vojinPerCetar: 10
  }
};
var M7A_2023_default = createLazyMap({
  1: () => comparingValues({
    input: {
      first: {
        ratio: 3 / 4,
        value: 24
      },
      second: {
        ratio: 1 / 3,
        value: 12
      }
    }
  }),
  3.1: () => build(cetarParams)[0],
  3.2: () => build(cetarParams)[1],
  3.3: () => build(cetarParams)[2],
  4.1: () => example_4_1(),
  4.2: () => example_4_2(),
  5.1: () => sesity()[1],
  5.2: () => compass(),
  6.1: () => odmenySoutezici()[0],
  6.2: () => odmenySoutezici()[1],
  10.1: () => trideni_odpadu().papirStoR,
  10.2: () => trideni_odpadu().plast2,
  10.3: () => trideni_odpadu().kovyToPapir,
  11: () => example_11(),
  12: () => example_12(),
  13: () => minceVKasicce(),
  14: () => build2({
    input: {
      cena: 72
    }
  }),
  15.1: () => example_15_1(),
  15.2: () => example_15_2(),
  15.3: () => example_15_3(),
  16.1: () => obrazce()[0],
  16.2: () => obrazce()[1],
  16.3: () => obrazce()[2]
});
function example_4_1() {
  const entity3 = "\u017E\xE1ci";
  return {
    deductionTree: deduce(
      deduce(
        axiomInput(cont("pr\u016Fm\u011B\u0159", 21, entity3), 2),
        counter("po\u010Det m\xED\u010Dov\xFDch sport\u016F", 3),
        product("po\u010Det v\u0161ech \u017E\xE1k\u016F m\xED\u010Dov\xE9 sporty")
      ),
      deduce(
        cont("volejbal", 28, entity3),
        cont("fotbal", 16, entity3),
        sum("fotbal a volejbal")
      ),
      ctorDifference("vyb\xEDjen\xE1")
    )
  };
}
function example_4_2() {
  return {
    deductionTree: deduce(
      deduce(
        compRatio("chlapci", "d\xEDvky", 3 / 2),
        ctorRatios("plav\xE1n\xED")
      ),
      ctor("reverse")
    )
  };
}
function minceVKasicce() {
  const entity3 = "K\u010D";
  const dvou = "dvoukoruny";
  const deseti = "desetikoruny";
  const peti = "p\u011Btikoruny";
  const minceEntity = "mince";
  const celkem = cont("kasi\u010Dka s mincemi", 78, minceEntity);
  const rozlozeni = ratios("kasi\u010Dka s mincemi", [deseti, peti, dvou], [1, 2, 10]);
  const dvouPocet = deduce(
    rozlozeni,
    celkem
  );
  const petiPocet = deduce(
    rozlozeni,
    celkem,
    nthPart(peti)
  );
  const desetiPocet = deduce(
    rozlozeni,
    celkem,
    nthPart(deseti)
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(dvouPocet, rate(dvou, 2, { entity: entity3 }, { entity: minceEntity })),
        deduce(petiPocet, rate(peti, 5, { entity: entity3 }, { entity: minceEntity })),
        deduce(desetiPocet, rate(deseti, 10, { entity: entity3 }, { entity: minceEntity })),
        sum("celkem v kasi\u010Dce")
      ),
      ctorOption("E", 240)
    )
  };
}
function example_11() {
  const inputAngleLabel = `zadan\xFD`;
  const triangle = "troj\xFAheln\xEDk ABD";
  return {
    deductionTree: deduce(
      deduceAs(triangle)(
        deduce(
          deduce(
            axiomInput(contAngle(inputAngleLabel, 40), 2),
            compAngle(inputAngleLabel, `vrchol B`, "alternate")
          ),
          deduce(
            axiomInput(contAngle(inputAngleLabel, 70), 1),
            compAngle(inputAngleLabel, `vrchol A`, "supplementary")
          ),
          triangleAngle(`vrchol D`)
        ),
        compAngle(`vrchol D`, anglesNames.phi, "supplementary")
      ),
      ctorOption("D", 150)
    )
  };
}
function example_12() {
  const dim2 = dimensionEntity();
  const ctverecDelkaLabel = "strana \u010Dtverce";
  const rectangleWidthLabel = "\u0161\xED\u0159ka obdeln\xEDka";
  const rectangleWidth = to(
    axiomInput(contLength("nejdel\u0161\xED strana sedmi\xFAheln\xEDku", 5), 2),
    commonSense("tato d\xE9lka odpov\xEDd\xE1 \u0161\xED\u0159ce obd\xE9ln\xEDku"),
    contLength(rectangleWidthLabel, 5)
  );
  const triangleHeight = to(
    commonSense("t\u0159i \u010Dtverce tvo\u0159\xED v\xFD\u0161ku troj\u016Fheln\xEDku"),
    contLength("v\xFD\u0161ka \u0161ed\xE9ho troj\xFAheln\xEDku", 3)
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(contLength(ctverecDelkaLabel, 1), 1),
          counter("po\u010Det \u010Dtverc\u016F", 3),
          product("t\u0159i shodn\xE9 \u010Dtverce")
        ),
        deduce(
          rectangleWidth,
          deduce(
            last(rectangleWidth),
            compDiff(rectangleWidthLabel, "v\xFD\u0161ka obdeln\xEDku", 3, dim2.length.entity)
          ),
          rectangleArea("obdeln\xEDk")
        ),
        deduce(
          deduce(
            triangleHeight,
            deduce(
              last(rectangleWidth),
              compDiff(rectangleWidthLabel, "z\xE1kladna \u0161ed\xE9ho troj\xFAheln\xEDku", 1, dim2.length.entity)
            ),
            triangleArea("\u0161ed\xFD troj\xFAheln\xEDku")
          ),
          counter("po\u010Det \u0161ed\xFDch troj\xFAhlen\xEDk\u016F", 3),
          product("t\u0159i \u0161ed\xE9 troj\xFAheln\xEDky")
        ),
        sum("obsah sedmi\xFAheln\xEDku")
      ),
      ctorOption("B", 31)
    )
  };
}
function example_15_1() {
  const deducePercent = deduce(
    axiomInput(percent("cel\xE1 kniha", "R\xF3za p\u0159e\u010Dteno", 60), 2),
    ctorComplement("R\xF3za nep\u0159e\u010Dteno")
  );
  return {
    deductionTree: deduce(
      deduce(
        axiomInput(cont("cel\xE1 kniha", 1200, "stran"), 1),
        deducePercent
      ),
      ctorOption("C", 480)
    )
  };
}
function example_15_2() {
  const entity3 = "K\u010D";
  const compare = axiomInput(comp("dosp\u011Bl\xE9 vstupn\xE9", "d\u011Btsk\xE9 vstupn\xE9", 210, entity3), 2);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(compPercent("d\u011Btsk\xE9 vstupn\xE9", "dosp\u011Bl\xE9 vstupn\xE9", 70), 1),
          compare
        ),
        compare
      ),
      ctorOption("D", 490)
    )
  };
}
function example_15_3() {
  const entity3 = "obyvatel";
  const den1 = axiomInput(cont("p\u0159i\u0161lo 1.den", 500, entity3), 2);
  const obec = deduce(
    axiomInput(percent("obec", "p\u0159i\u0161lo 1.den", 25), 1),
    den1
  );
  return {
    deductionTree: deduce(
      deduce(
        last(obec),
        deduce(
          deduce(
            deduce(
              obec,
              compDiff("obec", "zb\xFDvaj\xEDc\xED dosp\u011Bl\xFD", 500, entity3)
            ),
            axiomInput(percent("zb\xFDvaj\xEDc\xED dosp\u011Bl\xFD", "p\u0159i\u0161lo 2.den", 70), 3)
          ),
          den1,
          sum("p\u0159i\u0161lo celkem")
        ),
        ctorDifference("nep\u0159i\u0161lo")
      ),
      ctorOption("B", 450)
    )
  };
}

// src/math/M7A-2024/1.ts
function porovnatAaB({ input }) {
  const entity3 = "";
  const a = axiomInput(cont("a", input.a, entity3), 1);
  const b = axiomInput(cont("b", input.b, entity3), 2);
  return {
    deductionTree: deduce(
      deduce(
        a,
        b,
        sum("sou\u010Det")
      ),
      deduce(
        a,
        b,
        ctorDifference("rozd\xEDl")
      ),
      ctor("comp-ratio")
    ),
    convertToTestedValue: (value) => 1 / value.ratio
  };
}
function najitMensiCislo({ input }) {
  const entity3 = "";
  const a = axiomInput(cont("zadan\xE9 \u010D\xEDslo", input.zadane, entity3), 1);
  const comparsion = axiomInput(comp("hledan\xE9 \u010D\xEDslo", "zadan\xE9 \u010D\xEDslo", -input.mensiO, entity3), 2);
  return {
    deductionTree: deduce(
      a,
      comparsion
    )
  };
}

// src/math/M7A-2024/13.ts
function porovnatObsahObdelnikACtverec({ input }) {
  const ctverec2 = axiomInput(contLength("\u010Dtverec a", input.ctverec.a), 3);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(contLength("obd\xE9ln\xEDk a", input.obdelnik.a), 1),
          axiomInput(contLength("obd\xE9ln\xEDk b", input.obdelnik.b), 2),
          rectangleArea("obd\xE9ln\xEDk")
        ),
        deduce(
          ctverec2,
          ctverec2,
          squareArea("\u010Dtverec")
        ),
        ctor("comp-ratio")
      ),
      ctorOption("D", 12)
    )
  };
}

// src/math/cislaNaOse.ts
function cislaNaOse({ mensi, vetsi, pocetUseku }) {
  const usekRate = deduce(
    deduce(
      vetsi,
      mensi,
      ctorDifference("vzd\xE1lenost mezi zadan\xFDmi \u010D\xEDsly")
    ),
    pocetUseku,
    ctor("rate")
  );
  return usekRate;
}

// src/math/M7A-2024/3.ts
function triCislaNaOse({ input }) {
  const entity3 = "\xFAsek";
  const mensi = axiomInput(counter("men\u0161\xED zadan\xE9 \u010D\xEDslo", input.mensiCislo), 1);
  const vetsi = axiomInput(counter("v\u011Bt\u0161\xED zadnan\xE9 \u010D\xEDslo", input.vetsiCislo), 2);
  const pocetUseku = axiomInput(cont("vzd\xE1lenost mezi zadan\xFDmi \u010D\xEDsly", input.pocetUsekuMeziCisly, "\xFAsek"), 3);
  const positionA = axiomInput(cont("posun A", input.A, entity3), 1);
  const positionB = axiomInput(cont("posun B", input.B, entity3), 1);
  const positionC = axiomInput(cont("posun C", input.C, entity3), 1);
  const usekRate = cislaNaOse({ mensi, vetsi, pocetUseku });
  const rozdilPosition = deduce(positionB, positionA, ctorDifference("rozd\xEDl"));
  const dd1 = deduce(deduce(positionC, usekRate), mensi, ctorSlide("pozice C"));
  const dd2 = deduce(deduce(deduce(positionB, last(usekRate)), mensi, ctorSlide("pozice B")), mensi, ctor("comp-ratio"));
  const dd3 = deduce(rozdilPosition, last(usekRate));
  return { "C": { deductionTree: dd1 }, "B": { deductionTree: dd2 }, "rozdil": { deductionTree: dd3 } };
}

// src/math/M7A-2024/letni-tabor.ts
function build3({ input }) {
  const agent = "tabor";
  const zdravotniLabel = "zdravotn\xEDk";
  const kucharLabel = "kucha\u0159ka";
  const vedouciLabel = "vedouc\xED";
  const instruktorLabel = "instruktor";
  const diteLabel = "d\xEDt\u011B";
  const entity3 = "osob";
  const zdravotnik = axiomInput(cont(agent, input.zdravotnik, zdravotniLabel), 1);
  const kucharPerZdravotnik = axiomInput(rate(agent, input.kucharPerZdravotnik, kucharLabel, zdravotniLabel), 2);
  const vedouciPerKuchar = axiomInput(rate(agent, input.vedouciPerKuchar, vedouciLabel, kucharLabel), 3);
  const instruktorPerVedouci = axiomInput(rate(agent, input.instruktorPerVedouci, instruktorLabel, vedouciLabel), 4);
  const ditePerInstruktor = axiomInput(rate(agent, input.ditePerInstruktor, diteLabel, instruktorLabel), 5);
  const kuchari = deduce(
    zdravotnik,
    kucharPerZdravotnik
  );
  const vedouci = deduce(
    kuchari,
    vedouciPerKuchar
  );
  const instruktori = deduce(
    vedouci,
    instruktorPerVedouci
  );
  const dTree1 = deduce(
    instruktori,
    last(vedouci),
    sum("vedouc\xEDch a instruktor\u016F")
  );
  const dTree1Result = last(dTree1);
  const dTree2 = deduce(
    instruktori,
    last(kuchari),
    ctor("comp-ratio")
  );
  const dTree2Result = last(dTree2);
  const dTree3 = deduce(
    instruktori,
    ditePerInstruktor
  );
  const dTree3Result = last(dTree3);
  const templateBase = (highlight) => highlight`Na letním táboře jsou kromě dětí také instruktoři, vedoucí, kuchařky a ${input.zdravotnik} zdravotník.
     Počet zdravotníků a počet kuchařek je v poměru ${`1:${input.kucharPerZdravotnik}`},
     počet kuchařek a vedoucích ${`1:${input.vedouciPerKuchar}`},
     počet vedoucích a instruktorů ${`1:${input.instruktorPerVedouci}`},
     a počet instruktorů a dětí ${`1:${input.ditePerInstruktor}`}.
     Všichni jsou ubytováni ve stanech. Zdravotník je ve stanu sám, ostatní jsou ubytováni po dvou.`;
  const template1 = (html) => html`<br/>
     <strong>Na táboře je dohromady ${dTree1Result.quantity} vedoucích a instruktorů?</strong>`;
  const template2 = (html) => html`<br/>
     <strong>Instruktorů je ${dTree2Result.ratio} krát více než kuchařek.?</strong>`;
  const template3 = (html) => html`<br/>
    <strong>Na táboře je celkem ${dTree3Result.quantity} dětí?</strong>`;
  return {
    pocetVedoucichAInstruktoru: { deductionTree: deduce(dTree1, ctorBooleanOption(22)), template: (highlight) => highlight`${() => templateBase(highlight)}${template1}` },
    porovnaniInstrukturuAKucharek: { deductionTree: deduce(dTree2, ctorBooleanOption(4)), template: (highlight) => highlight`${() => templateBase(highlight)}${template2}` },
    pocetDeti: { deductionTree: deduce(dTree3, ctorBooleanOption(64)), template: (highlight) => highlight`${() => templateBase(highlight)}${template3}` }
  };
}

// src/math/M7A-2024/pocet-sportovcu.ts
function build4({ input }) {
  const entity3 = "sportovc\u016F";
  const dvojice = axiomInput(cont("dvojice", 2, entity3), 1);
  const trojice = axiomInput(cont("trojice", 3, entity3), 2);
  const ctverice = axiomInput(cont("\u010Dtve\u0159ice", 4, entity3), 3);
  const petice = axiomInput(cont("p\u011Btice", 5, entity3), 4);
  const lcdLabel = "nejmen\u0161\xED mo\u017En\xE1 skupina";
  const nasobek = lcd(lcdLabel, entity3);
  const rozdil = axiomInput(cont("sportovec nav\xEDc", 1, entity3), 5);
  const deductionTree = deduce(
    deduce(
      dvojice,
      trojice,
      ctverice,
      petice,
      nasobek
    ),
    rozdil,
    sum("celkem")
  );
  const template = (highlight) => highlight`Počet sportovců na závodech byl více než 1 a zároveň méně než 90. 
  Pořadatel chtěl sportovce seřadit do slavnostního průvodu, ale ať je rozděloval do ${"dvojic"}, ${"trojic"}, ${"\u010Dtve\u0159ic"} nebo ${"p\u011Btic"}, vždy mu ${"jeden"} sportovec zbyl.
  ${(html) => html`<br/><strong>Kolik sportovců se sešlo na závodech?</strong>`}`;
  return { deductionTree, template };
}

// src/math/M7A-2024/kralice-a-slepice-v-ohrade.ts
function build5({ input }) {
  const rozdil = input.pocetHlav - input.kralikuMene;
  const halfTotal = Math.round(rozdil / 2);
  const nohy = (halfTotal + input.kralikuMene) * 2 + halfTotal * 4;
  const data = [
    { value: halfTotal, agent: "kr\xE1l\xEDci" },
    { value: halfTotal, agent: "slepice" },
    { value: input.kralikuMene, agent: "slepice", opacity: 0.6 }
  ];
  const hlava = "hlava";
  const celkem = "slepice a kr\xE1l\xEDci";
  const entity3 = "zv\xED\u0159e";
  const slepice = "slepice";
  const kralik = "kr\xE1l\xEDk";
  const total = axiomInput(cont(celkem, input.pocetHlav, hlava), 1);
  const perHlava = rate(celkem, 1, hlava, entity3);
  const slepicePlus = axiomInput(comp(kralik, slepice, -input.kralikuMene, entity3), 2);
  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(total, perHlava),
        slepicePlus,
        ctor("comp-part-eq")
      ),
      slepicePlus
    ),
    ctorOption("E", 21)
  );
  const template = (highlight) => highlight`V ohradě pobíhali králíci a slepice.
  Králíků bylo o ${input.kralikuMene} méně.
  Králíci a slepice měli dohromady ${nohy} nohou a ${input.pocetHlav} hlav.
  ${(html) => html`<br/><strong> Kolik bylo v ohradě slepic?</strong>`}`;
  return { deductionTree, data, template };
}

// src/math/M7A-2024/index.ts
var letniTaborInput = {
  input: {
    zdravotnik: 1,
    kucharPerZdravotnik: 4,
    vedouciPerKuchar: 2,
    instruktorPerVedouci: 2,
    ditePerInstruktor: 4
  }
};
var osaParams = { mensiCislo: 1.4, vetsiCislo: 5.6, pocetUsekuMeziCisly: 6, A: 4, B: 7, C: -2 };
var M7A_2024_default = createLazyMap({
  1.1: () => porovnatAaB({ input: { a: 1.6, b: -1.2 } }),
  1.2: () => najitMensiCislo({ input: { zadane: 7 / 8, mensiO: 0.093 } }),
  3.1: () => triCislaNaOse({ input: osaParams }).C,
  3.2: () => triCislaNaOse({ input: osaParams }).B,
  3.3: () => triCislaNaOse({ input: osaParams }).rozdil,
  5.1: () => krouzky().divkyAnglictina,
  5.2: () => krouzky().pocetZaku,
  6: () => build4({ input: {} }),
  7: () => utulek(),
  10.1: () => build3(letniTaborInput).pocetVedoucichAInstruktoru,
  10.2: () => build3(letniTaborInput).porovnaniInstrukturuAKucharek,
  10.3: () => build3(letniTaborInput).pocetDeti,
  11: () => build5({
    input: {
      kralikuMene: 5,
      pocetHlav: 37
    }
  }),
  12: () => charitativniZavod(),
  13: () => porovnatObsahObdelnikACtverec({
    input: {
      obdelnik: { a: 36, b: 12 },
      ctverec: { a: 6 }
    }
  }),
  14: () => angle(),
  15.1: () => koupaliste(),
  15.2: () => cestovni_kancelar(),
  15.3: () => pozemek(),
  16.1: () => hranol().povrh,
  16.2: () => hranol().objem
});
function koupaliste() {
  const entity3 = "n\xE1v\u0161t\u011Bvn\xEDk\u016F";
  return {
    deductionTree: deduce(
      deduce(
        axiomInput(percent("koupali\u0161t\u011B loni", "koupali\u0161t\u011B letos", 80), 1),
        axiomInput(cont("koupali\u0161t\u011B letos", 680, entity3), 2)
      ),
      ctorOption("E", 850)
    )
  };
}
function cestovni_kancelar() {
  const entity3 = "klient\u016F";
  return {
    deductionTree: deduce(
      deduce(
        axiomInput(cont("\u010Derven", 330, entity3), 1),
        axiomInput(compPercent("\u010Derven", "\u010Dervenec", 100 - 40), 2)
      ),
      ctorOption("B", 550)
    )
  };
}
function pozemek() {
  const skutecnost = "skute\u010Dnost";
  const mapa = "pl\xE1n";
  const entity3 = "";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(ratios("pozemek m\u011B\u0159\xEDtko", [mapa, skutecnost], [1, 3e3]), 1),
          axiomInput(cont(mapa, 15, entity3, "cm"), 2),
          nthPart(skutecnost)
        ),
        ctorUnit("m")
      ),
      ctorOption("A", 450)
    )
  };
}
function krouzky() {
  const entity3 = "d\u011Bti";
  const entityPercent2 = "%";
  const basketabal = cont("basketbal", 16, entityPercent2);
  const tanecni = cont("tane\u010Dn\xED", 15, entityPercent2);
  const lezeckaStena = cont("lezeck\xE1 st\u011Bna", 25, entityPercent2);
  const bezKrouzku = cont("\u017E\xE1dn\xFD krou\u017Eek", 6, entityPercent2);
  const celek = cont("celek", 100, entityPercent2);
  const florbalPocet = cont("florbal", 114, entity3);
  const florbalDiff = deduce(
    celek,
    deduce(
      bezKrouzku,
      basketabal,
      tanecni,
      lezeckaStena,
      sum(`zadan\xE9 \xFAdaje`)
    ),
    ctorDifference("florbal")
  );
  const celekPocet = deduce(
    toPredicate(florbalDiff, (node) => {
      if (!isNumber(node.quantity)) {
        throw new Error("Expected a number for quantity in the node");
      } else {
        return percent("celek", "florbal", node.quantity);
      }
    }),
    florbalPocet
  );
  return {
    divkyAnglictina: {
      deductionTree: deduce(
        celekPocet,
        deduce(
          last(celekPocet),
          percent("celek", "\u017E\xE1dn\xFD krou\u017Eek", 6)
        ),
        ctorDifference("florbal")
      )
    },
    pocetZaku: {
      deductionTree: deduce(
        last(celekPocet),
        percent("celek", "basketbal", 16)
      )
    }
  };
}
function utulek() {
  const steneLabel = "\u0161t\u011Bn\u011B";
  const dospelyLabel = "dosp\u011Bl\xFD pes";
  const entity3 = "krmeni";
  const entityBase = "zv\xED\u0159e";
  const entityTime = "dny";
  const puvodne = cont("p\u016Fvodn\u011B", 5, entity3);
  return {
    deductionTree: deduce(
      deduce(
        cont("od 2.4 do 8.4", 6, entityTime),
        deduceAs("od 8.4 do 18.4")(
          cont("p\u016Fvodn\u011B", 10, entityTime),
          deduce(
            deduce(
              deduce(
                puvodne,
                deduce(
                  cont(steneLabel, 1, entity3),
                  deduce(
                    rate(dospelyLabel, 2, entity3, entityBase),
                    cont(dospelyLabel, 2, entityBase)
                  ),
                  sum("p\u0159ibylo")
                ),
                sum("nov\u011B")
              ),
              puvodne,
              ctor("comp-ratio")
            ),
            proportion(true, ["z\xE1soby krmen\xED", "doba krmen\xED"])
          )
        ),
        sum("celkov\xE1 doba nov\u011B")
      ),
      cont("posun o 1 den (za\u010D\xE1tek krmen\xED 2.4.)", 1, entityTime),
      ctorSlide("za\u010D\xE1tek krmen\xED")
    ),
    convertToTestedValue: (value) => value.quantity + 0.4
  };
}
function charitativniZavod() {
  const entity3 = "delka";
  const unit = "km";
  const entityBase = "doba";
  const unitBase = "h";
  const janaRate = rate("Jana", 4, { entity: entity3, unit }, { entity: entityBase, unit: unitBase });
  const adamDoba = cont("Adam", 40, entityBase, "min");
  return {
    deductionTree: deduce(
      deduce(
        adamDoba,
        deduce(
          deduceAs("zbytek z\xE1vodu ch\u016Fz\xED, stejn\xE1 rychlost jako Jana")(
            deduce(
              deduce(
                deduce(
                  janaRate,
                  compRatio("Roman", "Jana", 5)
                ),
                cont("Roman", 1 / 2, entityBase, unitBase)
              ),
              deduce(
                deduce(
                  janaRate,
                  compRatio("Adam", "Jana", 3)
                ),
                deduce(
                  adamDoba,
                  ctorUnit("h")
                )
              ),
              ctorDifference("Adam zbytek z\xE1vodu ch\u016Fz\xED")
            ),
            { ...janaRate, agent: "Adam zbytek z\xE1vodu ch\u016Fz\xED" }
          ),
          ctorUnit("min")
        ),
        sum("Adam z\xE1vod celkem")
      ),
      ctorOption("D", 70)
    )
  };
}
function angle() {
  const inputAngleLabel = `zadan\xFD \xFAhel mezi p\u0159\xEDmkami n a r`;
  const triangle = "troj\xFAheln\xEDk";
  const sousedniUhel = `vrchol mezi p\u0159\xEDmkami r a m`;
  const doubleBeta = deduce(
    cont(inputAngleLabel, 2, anglesNames.beta),
    compAngle(inputAngleLabel, sousedniUhel, "alternate-interior")
  );
  return {
    deductionTree: deduce(
      deduce(
        deduceAs("troj\xFAheln\xEDk vznikl\xFD z p\u0159\xEDmek p,r,m")(
          deduce(
            doubleBeta,
            cont(anglesNames.beta, 1, anglesNames.beta),
            ctorRatios(`dvojice \xFAhl\u016F v ${triangle}`)
          ),
          deduce(
            contTringleAngleSum(),
            deduce(
              contAngle("zadan\xFD", 105),
              compAngle(inputAngleLabel, `vrchol mezi p\u0159\xEDmkami p a r`, "supplementary")
            ),
            ctorDifference(`dvojice \xFAhl\u016F v ${triangle}`)
          ),
          nthPart(sousedniUhel)
        ),
        compAngle(sousedniUhel, "alfa", "supplementary")
      ),
      ctorOption("B", 110)
    )
  };
}
function hranol() {
  const obdelnikStrana1 = contLength("v\u011Bt\u0161\xED hranol krat\u0161\xED strana", 3);
  const obdelnikStrana2 = contLength("v\u011Bt\u0161\xED hranol del\u0161\xED strana", 6);
  const ctverecStrana = contLength("men\u0161\xED hranol krat\u0161\xED strana", 3);
  const vyska = contLength("v\xFD\u0161ka", 15);
  return {
    povrh: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              ctverecStrana,
              squareArea("men\u0161\xED hranol")
            ),
            deduce(
              deduce(
                obdelnikStrana1,
                obdelnikStrana2,
                rectangleArea("v\u011Bt\u0161\xED hranol")
              ),
              double(),
              product("2 x v\u011Bt\u0161\xED hranol")
            ),
            sum("podstava")
          ),
          double(),
          product("2 x podstava = horn\xED a spodn\xED podstava")
        ),
        deduce(
          deduce(
            deduce(
              obdelnikStrana1,
              vyska,
              rectangleArea("\u010D\xE1st bo\u010Dn\xED pl\xE1\u0161\u0165 odpov\xEDdaj\xEDc\xED krat\u0161\xED stran\u011B")
            ),
            counter("osmkr\xE1t", 8),
            product("8 \u010D\xE1st\xED bo\u010Dn\xED pl\xE1\u0161\u0165 odpov\xEDdaj\xEDc\xED krat\u0161\xED stran\u011B")
          ),
          deduce(
            deduce(
              obdelnikStrana2,
              vyska,
              rectangleArea("\u010D\xE1st bo\u010Dn\xED pl\xE1\u0161\u0165 odpov\xEDdaj\xEDc\xED del\u0161\xED stran\u011B")
            ),
            double(),
            product("2 \u010D\xE1sti bo\u010Dn\xED pl\xE1\u0161\u0165 odpov\xEDdaj\xEDc\xED del\u0161\xED stran\u011B")
          ),
          sum("bo\u010Dn\xED pl\xE1\u0161\u0165 celkem")
        ),
        sum("hranol celkem (slo\u017Een\xFD ze 3 hranol\u016F)")
      )
    },
    objem: {
      deductionTree: deduce(
        deduce(
          ctverecStrana,
          ctverecStrana,
          vyska,
          cuboidVolume("men\u0161\xED hranol")
        ),
        deduce(
          deduce(
            obdelnikStrana1,
            obdelnikStrana2,
            vyska,
            cuboidVolume("objem v\u011Bt\u0161\xED hranol")
          ),
          double(),
          product("2 x v\u011Bt\u0161\xED hranol")
        ),
        sum("hranol celkem (slo\u017Een\xFD ze 3 hranol\u016F)")
      )
    }
  };
}

// src/math/M7A-2025/index.ts
var M7A_2025_default = createLazyMap({
  1.1: () => ceremonial().polovina,
  1.2: () => ceremonial().pocetMinut,
  3.1: () => doplneniCisel().cislo1,
  3.2: () => doplneniCisel().cislo2,
  4.1: () => asistencniPes().bara,
  4.2: () => asistencniPes().rozdilBaraACyril,
  4.3: () => asistencniPes().sum,
  5.1: () => nakupFigurek().zbytek,
  5.2: () => nakupFigurek().cenaFigurky,
  6.1: () => karticky().petr,
  7.1: () => domecek().strana,
  7.2: () => domecek().obsah,
  11: () => tornado(),
  12: () => cestaKeStudance().meritko,
  13: () => cestaKeStudance().delkaTrasa,
  14: () => schody(),
  15.1: () => jazyky().porovnaniZaku,
  15.2: () => jazyky().fracouzstina,
  15.3: () => jazyky().nemcinaVsFrancouzstina,
  16.1: () => obrazec().pozice,
  16.2: () => obrazec().pocet,
  16.3: () => obrazec().pomer
});
function obrazec() {
  const obrazec2 = "obrazec";
  const entityObdelnik = "obdeln\xEDk";
  const entityRady = "\u010D\xEDslo \u0159ada";
  const nthPosition = "pozice";
  const vzorCtverce2 = pattern({
    nthTerm: "(n % 2)==0 ? 0: n",
    nthTermDescription: "pro sud\xE1 je 0, pro lich\xE1 je n",
    nthPosition: "",
    nthTermFormat: (n) => n % 2 == 0 ? "0" : [1].concat(range((n - 1) / 2, 1).map((_) => 2)).join(" + ")
  }, { entity: "\u010Dtverec" });
  const vzorObdelnik = pattern({
    nthTerm: "(n % 2)==0 ? 1/2*n: 0",
    nthTermDescription: "pro lich\xE1 je 0, pro sud\xE1 je polovina n",
    nthPosition: "",
    nthTermFormat: (n) => n % 2 == 0 ? range(n / 2, 1).map((_) => 1).join(" + ") : "0"
  }, { entity: "obdeln\xEDk" });
  const obdelnik50 = deduce(
    vzorObdelnik,
    cont("obrazec \u010D. 50", 50, nthPosition)
  );
  const ctverce51 = deduce(
    vzorCtverce2,
    cont("obrazec \u010D. 51", 51, nthPosition)
  );
  const bily = balancedEntityPartition(["b\xEDl\xFD", "\u0161ed\xFD"], { entity: "b\xEDl\xFD" });
  const sedy = balancedEntityPartition(["b\xEDl\xFD", "\u0161ed\xFD"], { entity: "\u0161ed\xFD" });
  return {
    pozice: {
      deductionTree: deduce(
        to(
          commonSense("Obd\xE9ln\xEDky se nach\xE1zej\xED v sud\xFDch \u0159ad\xE1ch a jejich po\u010Det odpov\xEDd\xE1 polovin\u011B \u010D\xEDsla sud\xE9 \u0159ady."),
          commonSense("18 obdeln\xEDk\u016F (kon\u010D\xED \u0161ed\xFDm obdeln\xEDkem) nebo 19 obdeln\xEDk\u016F (kon\u010D\xED b\xEDl\xFDm obdeln\xEDkem)"),
          cont(obrazec2, 19, entityObdelnik)
        ),
        double(),
        product("nejv\xFD\u0161\u0161\xED po\u0159adov\xE9 \u010D\xEDslo \u0159ady")
      )
    },
    pocet: {
      deductionTree: deduce(
        deduce(
          deduce(
            vzorCtverce2,
            cont("obrazec \u010D. 29", 29, nthPosition)
          ),
          bily,
          nthPart("b\xEDl\xFD")
        ),
        deduce(
          deduce(
            vzorObdelnik,
            cont("obrazec \u010D. 30", 30, nthPosition)
          ),
          bily,
          nthPart("b\xEDl\xFD")
        ),
        sum("celkem")
      )
    },
    pomer: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              obdelnik50,
              bily,
              nthPart("b\xEDl\xFD")
            ),
            double(),
            product("obrazec \u010D. 50")
          ),
          deduce(
            ctverce51,
            bily,
            nthPart("b\xEDl\xFD")
          ),
          sum("celkem")
        ),
        deduce(
          deduce(
            deduce(
              last(obdelnik50),
              sedy
            ),
            double(),
            product("obrazec \u010D. 50")
          ),
          deduce(
            last(ctverce51),
            sedy
          ),
          sum("celkem")
        ),
        ctorRatios("pom")
      )
    }
  };
}
function ceremonial() {
  const entity3 = "doba";
  const unit = "minut";
  const ceremonial2 = "ceremoni\xE1l";
  const promitani = "prom\xEDt\xE1n\xED";
  const zacatekLabel = "zacatek";
  const konecLabel = "konec";
  const dobaCeremonial = to(
    commonSense(`${zacatekLabel} (17:45) - ${konecLabel} (19:35)`),
    cont(ceremonial2, 110, entity3, unit)
  );
  const dobaPrvniPulka = deduce(
    dobaCeremonial,
    ratios(ceremonial2, ["1. p\u016Flka", "2. p\u016Flka"], [1, 1])
  );
  return {
    polovina: {
      deductionTree: dobaPrvniPulka,
      convertToTestedValue: (value) => {
        const totalMinutes = 45 + value.quantity;
        var hours = 17 + Math.floor(totalMinutes / 60);
        var minutes = totalMinutes % 60;
        return { hodin: hours, minut: minutes };
      }
    },
    pocetMinut: {
      deductionTree: deduce(
        last(dobaCeremonial),
        deduce(
          last(dobaPrvniPulka),
          deduce(
            last(dobaCeremonial),
            ratio(ceremonial2, promitani, 1 / 5)
          ),
          ctorSlide("konec promitani")
        ),
        ctorDifference("rozdil")
      )
    }
  };
}
function doplneniCisel() {
  const entity3 = "";
  const boldNumberL = "\u010D\xEDslo v siln\u011B ohrani\u010Den\xE9m krou\u017Eku";
  const numberL = "\u010D\xEDslo v krou\u017Eku";
  const rozdilCisel = comp(boldNumberL, numberL, 80, entity3);
  const rozdilCisel2 = toPredicate(
    deduce(
      counter("rozdil", 34),
      counter("rozdil", -10),
      sum("rozd\xEDl")
    ),
    (node) => comp(boldNumberL, numberL, 24, entity3)
  );
  return {
    cislo1: {
      deductionTree: deduce(
        deduce(
          compRatio(boldNumberL, numberL, 3),
          rozdilCisel
        ),
        rozdilCisel
      )
    },
    cislo2: {
      deductionTree: deduce(
        deduce(
          compRatio(boldNumberL, numberL, 2),
          rozdilCisel2
        ),
        last(rozdilCisel2)
      )
    }
  };
}
function nakupFigurek() {
  const entity3 = "cena";
  const unit = "korun";
  const entityBase = "figurka";
  const puvodniCena = rate("p\u016Fvodn\xED n\xE1kup", 39, { entity: entity3, unit }, { entity: entityBase });
  const obnos = toCont(deduce(
    puvodniCena,
    cont("p\u016Fvodn\xED n\xE1kup", 7, entityBase)
  ), { agent: "L\xEDda obnos" });
  const zbytek = deduce(
    obnos,
    ratios("L\xEDda obnos", ["koupeno", "zbylo"], [6, 1 / 2]),
    nthPart("zbylo")
  );
  return {
    zbytek: {
      deductionTree: zbytek
    },
    cenaFigurky: {
      deductionTree: deduce(
        last(zbytek),
        double(),
        product("figurka po zdra\u017Een\xED")
      )
    }
  };
}
function asistencniPes() {
  const adamL = "Adam";
  const baraL = "B\xE1ra";
  const cyrilL = "Cyril";
  const entity3 = "korun";
  const entityArtifical = "pomysln\xFD d\xEDlek";
  const adamToBara = comp(adamL, baraL, 300, entity3);
  const baraPolovinaL = `polovina ${baraL}`;
  const cyrilPolovinaL = `polovina ${cyrilL}`;
  const baraPolovina = ratio(baraL, baraPolovinaL, 1 / 2);
  const baraTretina = ratio(baraL, cyrilPolovinaL, 1 / 3);
  const adamTretina = ratio(adamL, baraPolovinaL, 1 / 3);
  const cyrilPolovina = ratio(cyrilL, cyrilPolovinaL, 1 / 2);
  const baraDilku = to(
    commonSense("B\xE1\u0159ina \u010D\xE1stku - d\u011Bliteln\xE1 3 a 2."),
    commonSense("B\xE1\u0159ina \u010D\xE1stce p\u0159i\u0159ad\xEDme 6 pomysln\xFDch d\xEDlk\u016F."),
    cont(baraL, 6, entityArtifical)
  );
  const adamDilku = deduce(
    deduce(baraDilku, baraPolovina),
    adamTretina
  );
  const cyrilDilku = deduce(
    deduce(last(baraDilku), baraTretina),
    cyrilPolovina
  );
  const bara = deduce(
    deduce(
      adamDilku,
      last(baraDilku),
      ctor("comp-ratio")
    ),
    adamToBara
  );
  const rate2 = deduce(
    cont("rozd\xEDl", 300, entity3),
    deduce(
      last(adamDilku),
      last(baraDilku),
      ctorDifference("rozd\xEDl")
    ),
    ctor("rate")
  );
  const cyril = deduce(rate2, cyrilDilku);
  const adam = deduce(rate2, last(adamDilku));
  return {
    bara: {
      deductionTree: bara
    },
    rozdilBaraACyril: {
      deductionTree: deduce(
        last(bara),
        cyril,
        ctorDifference("rozd\xEDl")
      )
    },
    sum: {
      deductionTree: deduce(
        last(bara),
        last(cyril),
        adam,
        sum("dohromady")
      )
    }
  };
}
function karticky() {
  const entity3 = "karti\u010Dky";
  const tondaToPeter = transfer("Tonda", "Petr", 4, entity3);
  const petrToTonda = transfer("Petr", "Tonda", 6, entity3);
  const jirkaToTonda = transfer("Jirka", "Tonda", 3, entity3);
  const petrToJirka = transfer("Petr", "Jirka", 2, entity3);
  const jirkaToPetr = transfer("Jirka", "Petr", 3, entity3);
  const vedouciToPetr = transfer("vedouci", "Petr", 4, entity3);
  const petr = cont("Petr", 80, entity3);
  return {
    petr: {
      deductionTree: deduce(
        petrToTonda,
        deduce(
          tondaToPeter,
          deduce(
            petrToJirka,
            deduce(
              jirkaToPetr,
              deduce(
                vedouciToPetr,
                petr
              )
            )
          )
        )
      )
    }
  };
}
function domecek() {
  const dim2 = dimensionEntity();
  const stranaRate = deduceAs("obvod se skl\xE1d\xE1 z 4 stran \u010Dtverce a dvou ramen troj\xFAhlen\xEDku a ka\u017Ed\xE9 rameno = 2 strany \u010Dterce zv\u011Bt\u0161en\xE9 o 3")(
    deduce(
      contLength("obvod", 46),
      contLength("zv\u011Bt\u0161en\xED ramen", 6),
      ctorDifference("obvod zmen\u0161en\xFD")
    ),
    cont("obvod zmen\u0161en\xFD", 8, "strana"),
    ctor("rate")
  );
  const strana = toCont(stranaRate, { agent: "\u010Dtverec", ...dim2.lengths });
  const zakladna = deduce(
    last(strana),
    ...doubleProduct("z\xE1kladna")
  );
  return {
    strana: {
      deductionTree: stranaRate
    },
    obsah: {
      deductionTree: deduce(
        deduce(
          deduce(
            last(strana),
            squareArea("\u010Dtverec")
          ),
          ...doubleProduct("z\xE1kladna")
        ),
        deduce(
          zakladna,
          deduce(
            deduce(
              last(zakladna),
              comp("rameno", "z\xE1kladna", 3, dim2.length.entity)
            ),
            comp("rameno", "v\xFD\u0161ka", 1, dim2.length.entity)
          ),
          triangleArea("rovnoramenn\xFD troj\xFAhlen\xEDk")
        ),
        sum("dome\u010Dek")
      )
    }
  };
}
function schody() {
  const dim2 = dimensionEntity();
  const entity3 = "obdeln\xEDk";
  return {
    deductionTree: deduce(
      deduce(
        deduceAs("rozd\xEDl vznik\xE1 pouze v horn\xED a spodn\xED \u010D\xE1sti")(
          cont("schodi\u0161t\u011B", 6, entity3),
          cont("krychle", 4, entity3),
          ctorDifference("rozd\xEDl")
        ),
        deduce(
          contLength("obdeln\xEDk", 9),
          contLength("obdeln\xEDk", 9 / 2),
          rectangleArea("obdeln\xEDk")
        ),
        productCombine("rozd\xEDl", dim2.area)
      ),
      ctorOption("D", 81)
    )
  };
}
function jazyky() {
  const deLabel = "n\u011Bm\u010Dina";
  const frLabel = "francouz\u0161tina";
  const esLabel = "\u0161pan\u011Bl\u0161tina";
  const school1Label = "1.\u0161kola";
  const school2Label = "2.\u0161kola";
  const entity3 = "\u017E\xE1k";
  const de1 = percent(school1Label, deLabel, 62);
  const fr1 = percent(school1Label, frLabel, 18);
  const es1 = deduce(
    deduce(
      de1,
      fr1,
      sum("dva jazyky")
    ),
    ctorComplement(esLabel)
  );
  const es1Val = cont(esLabel, 100, entity3);
  const es2 = percent(school2Label, esLabel, 35);
  const fr2 = percent(school2Label, frLabel, 20);
  const de2 = deduce(
    deduce(
      fr2,
      es2,
      sum("dva jazyky")
    ),
    ctorComplement(deLabel)
  );
  const de2Val = cont(deLabel, 270, entity3);
  const school1 = deduce(
    es1,
    es1Val
  );
  const school2 = deduce(
    de2,
    de2Val
  );
  const fr1Pocet = deduce(
    fr1,
    last(school1)
  );
  return {
    porovnaniZaku: {
      deductionTree: deduce(
        deduce(
          school2,
          school1
        ),
        ctorOption("A", 100)
      )
    },
    fracouzstina: {
      deductionTree: deduce(
        deduce(
          fr1Pocet,
          deduce(
            fr2,
            last(school2)
          ),
          sum(frLabel)
        ),
        ctorOption("E", 210)
      )
    },
    nemcinaVsFrancouzstina: {
      deductionTree: deduce(
        deduce(
          deduce(
            de1,
            last(school1)
          ),
          fr1Pocet
        ),
        ctorOption("F", 220)
      )
    }
  };
}
function cestaKeStudance() {
  const entity3 = "skute\u010Dnost";
  const entityBase = "mapa";
  const unit = "cm";
  const tiborAgent = "pl\xE1novan\xE1 trasa";
  const tiborMeritko = rate(tiborAgent, 5e4, { entity: entity3, unit }, entityBase);
  const tiborTrasaPlan = cont(tiborAgent, 4.2, entityBase, unit);
  const matyasAgent = "pl\xE1novan\xE1 trasa";
  const matyasTrasaPlan = cont(matyasAgent, 28, entityBase, "mm");
  const trasaSkutecnost = deduce(
    tiborMeritko,
    tiborTrasaPlan
  );
  return {
    meritko: {
      deductionTree: deduce(
        deduce(
          trasaSkutecnost,
          deduce(matyasTrasaPlan, ctorUnit("cm")),
          ctor("rate")
        ),
        ctorOption("C", 75e3)
      )
    },
    delkaTrasa: {
      deductionTree: deduce(
        deduce(
          last(trasaSkutecnost),
          ctorUnit("km")
        ),
        ctorOption("A", 2.1)
      )
    }
  };
}
function tornado() {
  const entity3 = "d\u016Fm";
  const neposkozenoLabel = "nepo\u0161kozeno";
  const poskozenoLabel = "po\u0161kozeno";
  const domuBezeSkod = cont(neposkozenoLabel, 270, entity3);
  const poskozenoRate = percent("celkem", poskozenoLabel, 40);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            deduce(
              poskozenoRate,
              ctorComplement(neposkozenoLabel)
            ),
            domuBezeSkod
          ),
          poskozenoRate
        ),
        percent(poskozenoLabel, "demolice", 30)
      ),
      ctorOption("B", 54)
    )
  };
}

// src/math/M7B-2025/index.ts
var M7B_2025_default = createLazyMap({
  1: () => hledaneCislo(),
  2: () => pomer(),
  4.1: () => vodniNadrz().pomer,
  4.2: () => vodniNadrz().pocetCerpadel,
  4.3: () => vodniNadrz().pocetHodin,
  5.1: () => zaciSkupiny().dvojic,
  5.2: () => zaciSkupiny().zaku,
  6.1: () => operaceM().a,
  6.2: () => operaceM().b,
  6.3: () => operaceM().c,
  7.1: () => hranol2().vyskaHranol,
  7.2: () => hranol2().obvodPodstava,
  7.3: () => hranol2().obsahPodstava,
  7.4: () => hranol2().objem,
  10.1: () => deleniObrazce().a,
  10.2: () => deleniObrazce().b,
  10.3: () => deleniObrazce().c,
  11: () => uhly(),
  12: () => ctvercovaSit(),
  13: () => kapesne().utratila,
  14: () => kapesne().usetrila,
  15.1: () => cislo(),
  15.2: () => zahradnictvi(),
  15.3: () => predstaveni()
});
function hledaneCislo() {
  const entity3 = "";
  const prvniL = "osmina";
  const druhyL = "polovina";
  const prvniRelative = cont(prvniL, 1 / 8, entity3);
  const druhyRelative = cont(druhyL, 1 / 2, entity3);
  const prvni = cont(prvniL, 1, entity3);
  const druhy = cont(druhyL, 16, entity3);
  return {
    deductionTree: deduce(
      deduceAs("Osmina \u010D\xEDsla + 16 = Polovina \u010D\xEDsla + 1")(
        deduce(
          prvniRelative,
          druhyRelative,
          ctor("comp-ratio")
        ),
        deduce(
          prvni,
          druhy
        )
      ),
      double(),
      ctorScale("hledan\xE9 \u010D\xEDslo")
    )
  };
}
function pomer() {
  const entity3 = "";
  const a3 = cont("3. \u010D\xEDslo", 72, entity3);
  const a4 = cont("4. \u010D\xEDslo", 108, entity3);
  const sousedniCislaPomerLabel = "sousedn\xED \u010D\xEDsla";
  const sousedniCislaPomer = deduce(
    a3,
    a4,
    ctorRatios(sousedniCislaPomerLabel, { useBase: true })
  );
  const createRatios = (treeNode, n1, n2) => {
    const newRatio = last(treeNode);
    return {
      ...newRatio,
      parts: [`${n1}. \u010D\xEDslo`, `${n2}. \u010D\xEDslo`]
    };
  };
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          to(
            sousedniCislaPomer,
            createRatios(sousedniCislaPomer, 2, 3)
          ),
          a3,
          nthPart("2. \u010D\xEDslo")
        ),
        createRatios(sousedniCislaPomer, 1, 2),
        nthPart("1. \u010D\xEDslo")
      ),
      deduce(
        deduce(
          createRatios(sousedniCislaPomer, 4, 5),
          a4,
          nthPart("5. \u010D\xEDslo")
        ),
        createRatios(sousedniCislaPomer, 5, 6),
        nthPart("6. \u010D\xEDslo")
      ),
      ctor("tuple")
    )
  };
}
function vodniNadrz() {
  const entity3 = "doba";
  const unit = "h";
  const entityCerpadlo = "\u010Derpadlo";
  return {
    pomer: {
      deductionTree: deduce(
        deduce(
          cont("dopln\u011Bno", 4, entity3, unit),
          cont("pln\u011B napln\u011Bno", 6, entity3, unit),
          ctor("ratio")
        ),
        ctorComplement("r\xE1no ji\u017E napln\u011Bno")
      )
    },
    pocetCerpadel: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont("p\u016Fvodn\u011B", 6, entity3, unit),
            cont("nov\u011B", 8, entity3, unit),
            ctor("comp-ratio")
          ),
          proportion(true, [entity3, entityCerpadlo])
        ),
        cont("p\u016Fvodn\u011B", 4, entityCerpadlo)
      )
    },
    pocetHodin: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              cont("p\u016Fvodn\u011B", 4, entityCerpadlo),
              cont("nov\u011B", 2, entityCerpadlo),
              ctor("comp-ratio")
            ),
            proportion(true, [entityCerpadlo, entity3])
          ),
          cont("p\u016Fvodn\u011B", 6, entity3, unit)
        ),
        ratio("nov\u011B", "nov\u011B polovina n\xE1dr\u017Ee", 1 / 2)
      )
    }
  };
}
function zaciSkupiny() {
  const entityGroup = "skupina";
  const entity3 = "\u017E\xE1k\u016F";
  const dvojice = "dvojic";
  const trojice = "trojic";
  const skupinaRatios = deduce(
    ratios("rozlo\u017Een\xED \u017E\xE1k\u016F", [dvojice, trojice], [2, 3]),
    ctorRatiosInvert("rozlo\u017Een\xED skupin")
  );
  const dvojicePriRovnosti = deduceAs("rozlo\u017Een\xED \u017E\xE1k\u016F,resp. vytvo\u0159en\xFDch skupin p\u0159i rovnosti")(
    skupinaRatios,
    comp(dvojice, trojice, 2, entityGroup),
    nthPart(dvojice)
  );
  const dvojiceCelkem = deduce(
    dvojicePriRovnosti,
    cont("zb\xFDvaj\xEDc\xED dvojice", 1, entityGroup),
    sum(dvojice)
  );
  return {
    dvojic: {
      deductionTree: dvojiceCelkem
    },
    zaku: {
      deductionTree: deduce(
        deduce(
          last(dvojiceCelkem),
          rate(dvojice, 2, entity3, entityGroup)
        ),
        deduce(
          deduce(
            last(skupinaRatios),
            last(dvojicePriRovnosti),
            nthPart(trojice)
          ),
          rate(trojice, 3, entity3, entityGroup)
        ),
        sum("celkem")
      )
    }
  };
}
function kapesne() {
  const entity3 = "korun";
  const entityBase = "m\u011Bs\xEDc";
  const agentHelena = "Helena";
  const agentTereza = "Tereza";
  const ledenPocatekHelena = cont("po\u010D\xE1tek leden", 550, entity3);
  const brezenPocatekHelena = cont("po\u010D\xE1tek b\u0159ezen", 1e3, entity3);
  const kapesneRateHelena = rate(agentHelena, 400, entity3, entityBase);
  const kapesneRateTereza = rate(agentTereza, 400, entity3, entityBase);
  const ledenPocateTereza = cont("po\u010D\xE1tek leden", 400, entity3);
  const dubenPocateTereza = cont("po\u010D\xE1tek duben", 1200, entity3);
  return {
    utratila: {
      deductionTree: deduce(
        deduce(
          deduce(
            kapesneRateHelena,
            cont("p\u0159ijmy z kapesn\xE9ho", 2, entityBase)
          ),
          toCont(
            deduce(
              ledenPocatekHelena,
              brezenPocatekHelena,
              ctorDelta(agentHelena)
            ),
            { agent: "zm\u011Bna stavu \xFA\u010Dtu" }
          ),
          ctorDifference("utraceno")
        ),
        ctorOption("A", 350)
      )
    },
    usetrila: {
      deductionTree: deduce(
        deduce(
          toCont(
            deduce(
              ledenPocateTereza,
              dubenPocateTereza,
              ctorDelta(agentTereza)
            ),
            { agent: "u\u0161et\u0159ila" }
          ),
          deduce(
            kapesneRateTereza,
            cont("p\u0159ijmy z kapesn\xE9ho", 3, entityBase)
          ),
          ctor("ratio")
        ),
        ctorOption("B", 2 / 3, { asFraction: true })
      )
    }
  };
}
function hranol2() {
  const dim2 = dimensionEntity();
  const bocniStenaObdelnikL = "bo\u010Dn\xED st\u011Bna - obdeln\xEDk";
  const bocniStenaCtverecL = "bo\u010Dn\xED st\u011Bna - \u010Dtverec";
  const podstavaVyska = contLength("v\xFD\u0161ka podstavy", 4);
  const bocniStenaObdelnik = contLength(bocniStenaObdelnikL, 11);
  const vyskaHranol = deduce(
    contArea(bocniStenaObdelnikL, 55),
    bocniStenaObdelnik,
    evalFormulaAsCont(formulaRegistry.surfaceArea.rectangle, (x) => x.b, "v\xFD\u0161ka hranolu", dim2.length)
  );
  const bocniStenaCtverec = to(
    commonSense("bo\u010Dn\xED st\u011Bna \u010Dtverec => v\xFD\u0161ka hranolu = strana \u010Dtverce"),
    last(vyskaHranol),
    contLength(bocniStenaCtverecL, lastQuantity(vyskaHranol))
  );
  const obsah = deduce(
    deduce(
      last(bocniStenaCtverec),
      podstavaVyska,
      rectangleArea("obdeln\xEDk")
    ),
    deduce(
      deduceAs("podstava hranol - rozd\u011Blen\xED na obdeln\xEDk 4x5 a lev\xFD a prav\xFD pravo\xFAhl\xFD troj\u016Fheln\xEDk, kter\xE9 p\u0159il\xE9haj\xED k obdeln\xEDku")(
        bocniStenaObdelnik,
        last(bocniStenaCtverec),
        ctorDifference("zbytek z\xE1kladny")
      ),
      podstavaVyska,
      triangleArea("lev\xFD a prav\xFD pravo\xFAhl\xFD troj\u016Fheln\xEDk")
    ),
    sum("obsah postavy hranolu")
  );
  return {
    vyskaHranol: {
      deductionTree: vyskaHranol
    },
    obvodPodstava: {
      deductionTree: deduce(
        deduce(
          bocniStenaCtverec,
          counter(bocniStenaCtverecL, 3),
          product(bocniStenaCtverecL)
        ),
        bocniStenaObdelnik,
        sum("obvod podstavy hranolu")
      )
    },
    obsahPodstava: {
      deductionTree: obsah
    },
    objem: {
      deductionTree: deduce(
        last(obsah),
        last(vyskaHranol),
        baseAreaVolume("objem hranolu")
      )
    }
  };
}
function cislo() {
  const entity3 = "";
  return {
    deductionTree: deduce(
      deduce(
        cont("zv\u011Bt\u0161en\xE9 \u010D\xEDslo", 98, entity3),
        cont("zadan\xE9 \u010D\xEDslo", 56, entity3),
        ctorComparePercent()
      ),
      ctorOption("F", 75, { asPercent: true })
    )
  };
}
function zahradnictvi() {
  const entity3 = "sazenic";
  const celkemLabel = "kv\u011Btina";
  const kopretinyLabel = "kopretina";
  const hvozdikyLabel = "hvozd\xEDk";
  const astraLabel = "astra";
  const celkem = cont(celkemLabel, 120, entity3);
  const hvozdiky = deduce(
    rate(hvozdikyLabel, 24, entity3, "bedna"),
    cont(hvozdikyLabel, 2, "bedna")
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          celkem,
          deduce(
            deduce(
              celkem,
              ratio(celkemLabel, kopretinyLabel, 1 / 4)
            ),
            hvozdiky,
            sum("dohromady")
          ),
          ctorDifference(astraLabel)
        ),
        celkem,
        ctorPercent()
      ),
      ctorOption("B", 35, { asPercent: true })
    )
  };
}
function predstaveni() {
  const entity3 = "div\xE1k\u016F";
  const dospeliLabel = "dosp\u011Bl\xFD";
  const detiLabel = "d\u011Bti";
  const predskolniDetiLabel = "p\u0159ed\u0161kol\xE1ci";
  const dospely = cont(dospeliLabel, 100, entity3);
  const deti = deduce(
    dospely,
    compRelative(detiLabel, dospeliLabel, 1 / 2)
  );
  const predskolaci = deduce(
    deti,
    percent(detiLabel, predskolniDetiLabel, 60)
  );
  return {
    deductionTree: deduce(
      deduce(
        predskolaci,
        deduce(
          last(deti),
          dospely,
          sum("celkem")
        ),
        ctorPercent()
      ),
      ctorOption("C", 36, { asPercent: true })
    )
  };
}
function operaceM() {
  const entity3 = "";
  return {
    a: {
      deductionTree: deduce(
        evalExprAsCont(`1-8+0-5+9`, "M(18 059)", { entity: entity3 })
      )
    },
    b: {
      deductionTree: to(
        commonSense("nejv\u011Bt\u0161\xED mo\u017En\xE9 s r\u016Fzn\xFDmi \u010D\xEDslicemi"),
        deduce(
          evalExprAsCont(`9-8+7-6+5`, "M(98 765)", { entity: entity3 })
        ),
        commonSense("sn\xED\u017Een\xED jednotek nesta\u010D\xED, sni\u017Eujeme o 1 des\xEDtku"),
        deduce(
          evalExprAsCont(`9-8+7-5+6`, "M(98 756)", { entity: entity3 })
        ),
        commonSense("sn\xED\u017Een\xED jednotek ani des\xEDtek nesta\u010D\xED, sni\u017Eujeme o 1 stovku"),
        deduce(
          evalExprAsCont(`9-8+6-7+5`, "M(98 675)", { entity: entity3 })
        ),
        commonSense("d\xE1le jen sn\xED\u017Een\xED jednotek o 4"),
        deduce(
          evalExprAsCont(`9-8+6-7+1`, "M(98 671)", { entity: entity3 })
        ),
        cont("M(98 671)", 98671, entity3)
      )
    },
    c: {
      deductionTree: to(
        commonSense("nejmen\u0161\xED mo\u017En\xE9 \u010D\xEDslo s r\u016Fzn\xFDmi \u010D\xEDslicemi"),
        deduce(
          evalExprAsCont(`1-0+2-3`, "M(1 023)", { entity: entity3 })
        ),
        commonSense("d\xE1le jen zv\xFD\u0161en\xED jednotek o 1"),
        deduce(
          evalExprAsCont(`1-0+2-4`, "M(1 024)", { entity: entity3 })
        ),
        cont("M(1 024)", 1024, entity3)
      )
    }
  };
}
function deleniObrazce() {
  const dim2 = dimensionEntity();
  const bigL = "velk\xFD rovnostrann\xFD troj\xFAheln\xEDk";
  const smallL = "strana mal\xFD rovnostrann\xFD troj\xFAheln\xEDk";
  const strana = deduce(
    contLength(bigL, 60),
    cont(bigL, 3, "strana"),
    ctor("rate")
  );
  const zakladna = deduce(
    toCont(strana, { agent: `strana ${bigL}` }),
    to(
      commonSense("z\xE1kladna mal\xE9ho rovnostrann\xE9ho troj\xFAheln\xEDku se rovn\xE1 3 zkr\xE1cen\xEDm, resp. o kolik byly jednotliv\xE9 strany zkr\xE1ceny"),
      compRelative(`strana ${bigL}`, smallL, 1 / 3)
    )
  );
  return {
    a: {
      deductionTree: deduce(
        deduce(
          zakladna,
          last(zakladna),
          last(zakladna),
          evalFormulaAsCont(formulaRegistry.circumReference.triangle, (x) => x.o, smallL, dim2.length)
        ),
        ctorBooleanOption(30)
      )
    },
    b: {
      deductionTree: deduce(
        deduce(
          toCont(last(strana), { agent: `rameno ${bigL}` }),
          last(zakladna),
          ctor("comp-ratio")
        ),
        ctorBooleanOption(2)
      )
    },
    c: {
      deductionTree: deduce(
        toCont(last(zakladna), { agent: `krat\u0161\xED z\xE1kladna lichob\u011B\u017En\xEDku` }),
        toCont(last(strana), { agent: `del\u0161\xED z\xE1kladna lichob\u011B\u017En\xEDku` }),
        ctorRatios("pom\u011Br", { useBase: true })
      ),
      convertToTestedValue: (value) => value.ratios.join(":")
    }
  };
}
function uhly() {
  const pravouhlyLabel = "pravouhl\xFD troj\xFAheln\xEDk ABC";
  const rovnoramennyLabel = "rovnoramenn\xFD troj\xFAheln\xEDk KCS";
  const vrchol = deduce(
    contRightAngle("vrchol A"),
    contAngle("vrchol B", 56),
    triangleAngle("vrchol C")
  );
  return {
    deductionTree: deduce(
      deduce(
        deduceAs(`2 troj\xFAheln\xEDky - ${pravouhlyLabel}, ${rovnoramennyLabel}`)(
          vrchol,
          deduce(
            last(vrchol),
            compAngle("vrchol K", "vrchol C", "isosceles-triangle-at-the-base")
          ),
          triangleAngle("vrchol S")
        ),
        compAngle(anglesNames.omega, "vrchol S", "supplementary")
      ),
      ctorOption("D", 68)
    )
  };
}
function ctvercovaSit() {
  const celekL = "\u010Dtvercov\xE9 pole";
  const polovinaL = "polovina \u010Dtvercov\xE9ho pole";
  const ctvrtinaL = "\u010Dtvrtina \u010Dtvercov\xE9ho pole";
  const osmiL = "osmi\xFAheln\xEDk nav\xEDc";
  const celek = contArea(celekL, 25);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            celek,
            ratio(celekL, polovinaL, 1 / 2)
          ),
          counter(polovinaL, 4),
          ctorScale(osmiL)
        ),
        deduce(
          deduce(
            celek,
            ratio(celekL, ctvrtinaL, 1 / 4)
          ),
          counter(ctvrtinaL, 4),
          ctorScale(osmiL)
        ),
        sum(`celkem ${osmiL}`)
      ),
      ctorOption("C", 75)
    )
  };
}

// src/math/M5A-2023/index.ts
var cetarParams2 = {
  input: {
    kapitan: 1,
    porucik: 4,
    cetarPerPorucik: 3,
    vojinPerCetar: 10
  }
};
var M5A_2023_default = createLazyMap({
  2.1: () => comparingValues({
    input: {
      first: {
        ratio: 1 / 4,
        value: 24
      },
      second: {
        ratio: 1 / 3,
        value: 12
      }
    }
  }),
  2.2: () => hledani_cisel({
    input: {
      value: 180
    }
  }),
  3.1: () => build(cetarParams2)[0],
  3.2: () => build(cetarParams2)[1],
  3.3: () => build(cetarParams2)[2],
  4.1: () => sesity()[0],
  4.2: () => sesity()[1],
  4.3: () => compass(),
  5.1: () => klubSEN().jedenKrouzek,
  5.2: () => klubSEN().klub,
  6.1: () => odmenySoutezici()[0],
  6.2: () => odmenySoutezici()[1],
  8.1: () => desitiuhelnik().whiteTriangle,
  8.2: () => desitiuhelnik().grayRectangle,
  8.3: () => desitiuhelnik().grayTriangle,
  9: () => build2({
    input: {
      cena: 72
    }
  }),
  10: () => minceVKasicce2(),
  11: () => stavebnice().cube,
  12: () => stavebnice().minimalCube,
  13.1: () => trideni_odpadu().papirRtoS,
  13.2: () => trideni_odpadu().plast1,
  13.3: () => trideni_odpadu().papirToKovy,
  14.1: () => obrazce()[0],
  14.2: () => obrazce()[1],
  14.3: () => obrazce()[2]
});
function hledani_cisel({ input }) {
  return {
    deductionTree: deduce(
      deduce(
        axiomInput(counter("zadan\xE1 hodnota", input.value), 1),
        counter("zv\u011Bt\u0161en\xED", 2),
        ctorScale("zv\u011Bt\u0161en\xE1 hodnota")
      ),
      counter("zmen\u0161en\xED", 6),
      ctorScaleInvert("v\xFDsledn\xE1 hodnota")
    )
  };
}
function klubSEN() {
  const entity3 = "d\xEDt\u011B";
  const entityKrouzek = "\xFA\u010Dast krou\u017Eek";
  const sportovni = cont("sportovn\xED", 14, entity3);
  const divadelni = cont("divadeln\xED", 12, entity3);
  const roboticky = cont("robotick\xFD", 6, entity3);
  const threeRate = rate("nav\u0161t\u011Bvuje 3 krou\u017Eky", 3, entityKrouzek, entity3);
  const twoRate = rate("nav\u0161t\u011Bvuje 2 krou\u017Eky", 2, entityKrouzek, entity3);
  const three = cont("nav\u0161t\u011Bvuje 3 krou\u017Eky", 3, entity3);
  const two = cont("nav\u0161t\u011Bvuje 2 krou\u017Eky", 8, entity3);
  const one = deduce(
    deduce(
      sportovni,
      divadelni,
      roboticky,
      sum("celkem u\u010Dastn\xEDk\u016F")
    ),
    deduce(
      deduce(
        threeRate,
        three
      ),
      deduce(
        twoRate,
        two
      ),
      sum("nav\u0161t\u011Bvuje v\xEDce krou\u017Ek\u016F", { entity: entity3 })
    ),
    ctorDifference("nav\u0161t\u011Bvuje 1 krou\u017Eek")
  );
  return {
    jedenKrouzek: {
      deductionTree: one
    },
    klub: {
      deductionTree: deduce(
        last(one),
        two,
        three,
        sum("po\u010Det d\u011Bt\xED")
      )
    }
  };
}
function desitiuhelnik() {
  const squareSizeLabel = "strana \u010Dtverce";
  const rectangleWidthLabel = "\u0161\xED\u0159ka obdeln\xEDka";
  const triangleWidthLabel = "nejdel\u0161\xED stran\u011B troj\xFAheln\xEDku";
  const squareSize = to(
    axiomInput(contLength("nejkrat\u0161\xED strana desiti\xFAheln\xEDk", 4), 1),
    commonSense("tato d\xE9lka odpov\xEDd\xE1 stran\u011B \u010Dtverce"),
    contLength(squareSizeLabel, 4)
  );
  const rectangleWidth = to(
    axiomInput(contLength("nejdel\u0161\xED strana desiti\xFAheln\xEDk", 20), 2),
    commonSense("tato d\xE9lka odpov\xEDd\xE1 \u0161\xED\u0159ce obd\xE9ln\xEDku"),
    contLength(rectangleWidthLabel, 20)
  );
  const whiteTriangle = to(
    commonSense("2 \u010Dtverce tvo\u0159\xED v\xFD\u0161ku b\xEDl\xE9ho rovnostrann\xE9ho troj\xFAheln\xEDku"),
    contLength("v\xFD\u0161ka \u0161ed\xE9ho troj\xFAheln\xEDku", 2 * 4)
  );
  const triangleHeight = to(
    commonSense("t\u0159i \u010Dtverce tvo\u0159\xED nejkrat\u0161\xED stran\u011B troj\xFAheln\xEDku"),
    contLength("v\xFD\u0161ka \u0161ed\xE9ho troj\xFAheln\xEDku", 3 * 4)
  );
  const triangleWidth = to(
    axiomInput(contLength("nejdel\u0161\xED strana desiti\xFAheln\xEDk", 20), 2),
    commonSense("tato d\xE9lka odpov\xEDd\xE1 nejdel\u0161\xED stran\u011B troj\xFAheln\xEDku"),
    contLength(triangleWidthLabel, 20)
  );
  const whiteTriangleSize = to(
    squareSize,
    commonSense("2 \u010Dtverce tvo\u0159\xED stranu b\xEDl\xE9ho rovnostrann\xE9ho troj\xFAheln\xEDku"),
    contLength("strana b\xEDl\xFD troj\xFAheln\xEDk", 2 * 4)
  );
  return {
    whiteTriangle: {
      deductionTree: deduce(
        deduce(
          whiteTriangleSize,
          counter("po\u010Det stran troj\xFAheln\xEDku", 3),
          product("obvod")
        ),
        ctorBooleanOption(12)
      )
    },
    grayRectangle: {
      deductionTree: deduce(
        deduce(
          deduce(
            to(
              last(whiteTriangleSize),
              commonSense("strana b\xEDleho troj\xFAheln\xEDku odpov\xEDd\xE1 v\xFD\u0161ka \u0161ed\xE9ho obdeln\xEDku"),
              contLength("v\xFD\u0161ka \u0161ed\xE9ho obdeln\xEDku", 8)
            ),
            counter("po\u010Det stran", 2),
            product("horn\xED a doln\xED strana")
          ),
          deduce(
            rectangleWidth,
            counter("po\u010Det stran", 2),
            product("lev\xE1 a prav\xE1 strana")
          ),
          sum("obvod")
        ),
        ctorBooleanOption(56)
      )
    },
    grayTriangle: {
      deductionTree: deduce(
        deduce(
          triangleHeight,
          triangleWidth,
          deduce(
            last(triangleWidth),
            last(squareSize),
            ctor("comp-diff")
          ),
          sum("obvod")
        ),
        ctorBooleanOption(50, "greater")
      )
    }
  };
}
function stavebnice() {
  const dim2 = dimensionEntity();
  const cube = ({ length, width, height }) => ({
    length: contLength("d\xE9lka", length),
    width: contLength("\u0161\xED\u0159ka", width),
    height: contLength("v\xFD\u0161ka", height)
  });
  const base = cube({ length: 4, width: 4, height: 6 });
  const inputCube = cube({ length: 8, width: 12, height: 16 });
  const minimalSize = deduce(
    base.length,
    base.width,
    base.height,
    lcd("nejmen\u0161\xED mo\u017En\xE1 velikost strany krychle", dim2.length.entity)
  );
  return {
    cube: {
      deductionTree: deduce(
        deduce(
          deduce(
            inputCube.length,
            inputCube.width,
            inputCube.height,
            cuboidVolume("kv\xE1dr")
          ),
          deduce(
            base.length,
            base.width,
            base.height,
            cuboidVolume("kv\xE1dr")
          ),
          ctor("rate")
        ),
        ctorOption("C", 16)
      )
    },
    minimalCube: {
      deductionTree: deduce(
        deduce(
          deduce(
            minimalSize,
            last(minimalSize),
            last(minimalSize),
            cuboidVolume("kv\xE1dr")
          ),
          deduce(
            base.length,
            base.width,
            base.height,
            cuboidVolume("kv\xE1dr")
          ),
          ctor("rate")
        ),
        ctorOption("D", 18)
      )
    }
  };
}
function minceVKasicce2() {
  const entity3 = "K\u010D";
  const deseti = "desetikoruny";
  const peti = "p\u011Btikoruny";
  const minceEntity = "mince";
  const celkem = cont("kasi\u010Dka s mincemi", 78, minceEntity);
  const petiPocet = deduce(
    ratios("kasi\u010Dka s mincemi", [deseti, peti], [5, 10]),
    celkem
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(petiPocet, rate(peti, 5, { entity: entity3 }, { entity: minceEntity })),
        deduce(
          deduce(
            celkem,
            last(petiPocet),
            ctorDifference(deseti)
          ),
          rate(deseti, 10, { entity: entity3 }, { entity: minceEntity })
        ),
        sum("celkem v kasi\u010Dce")
      ),
      ctorOption("B", 520)
    )
  };
}

// src/math/M5A-2024/index.ts
var dveCislaNaOseParams = {
  input: {
    mensiCislo: 44,
    vetsiCislo: 110,
    pocetUsekuMeziCisly: 6,
    X: -2,
    Y: 3
  }
};
var M5A_2024_default = createLazyMap({
  3: () => souctovyTrojuhelnik(),
  4.1: () => giftAndBox(),
  4.2: () => lukasAccount(),
  4.3: () => appleBox(),
  5.1: () => timeUnitSum(),
  5.2: () => distanceUnitCompareDiff(),
  6.1: () => dveCislaNaOse(dveCislaNaOseParams).XandY,
  6.2: () => dveCislaNaOse(dveCislaNaOseParams).posun,
  8.1: () => ctvercovaSit2().porovnani,
  8.2: () => ctvercovaSit2().obsah,
  8.3: () => ctvercovaSit2().obvod,
  9: () => novorocniPrani(),
  10: () => hledaniObrazku(),
  11: () => sestiuhelnik(),
  12.1: () => vyvojObyvatel().panov,
  12.2: () => vyvojObyvatel().lidov,
  12.3: () => vyvojObyvatel().damov,
  13.1: () => carTrip().pocatekCesty,
  13.2: () => carTrip().zeleznicniPrejezd,
  13.3: () => carTrip().konecCesty,
  14.1: () => pyramida().floor8,
  14.2: () => pyramida().floor7,
  14.3: () => pyramida().stairs
});
function hledaniObrazku() {
  return {
    deductionTree: to(
      commonSense("Ot\xE1\u010Den\xEDm ka\u017Ed\xE9ho obrazce lze z\xEDskat ostatn\xED obrazce. Vyjimkou z tohoto pravidla je obrazec C."),
      option("C")
    )
  };
}
function souctovyTrojuhelnik() {
  const zbytekKRozdeleni = "zbytek k rozd\u011Blen\xED";
  return {
    deductionTree: deduceAs("v\xFDsledek je slo\u017Een z \u010D\xEDsla 7 a trojn\xE1sobku hodnoty v \u0161ed\xE9m poli")(
      deduce(
        counter("v\xFDsledek", 25),
        counter("zadan\xE1 hodnota", 7),
        ctorDifference(zbytekKRozdeleni)
      ),
      counter("zmen\u0161en\xED", 3),
      ctorScaleInvert("hodnota v \u0161ed\xE9m poli")
    )
  };
}
function ctvercovaSit2() {
  const dim2 = dimensionEntity();
  const obdelnikVLabel = "v\u011Bt\u0161\xED obdeln\xEDk 2x3";
  const obdelnikMLabel = "men\u0161\xED obdeln\xEDk 2x2";
  const trojV = "v\u011Bt\u0161\xED troj\xFAhlen\xEDk";
  const trojM = "men\u0161\xED troj\xFAhlen\xEDk";
  const trojuhlenikV = to(
    commonSense(`${trojV} je polovinou ${obdelnikVLabel}`),
    contArea(trojV, 3)
  );
  const trojuhlenikM = to(
    commonSense(`${trojM} je polovinou ${obdelnikMLabel}`),
    contArea(trojV, 2)
  );
  const obdelnikV = cont(obdelnikVLabel, 6, ...dim2.areas);
  const obdelnikM = cont(obdelnikMLabel, 4, ...dim2.areas);
  const obsahA = deduce(
    obdelnikV,
    trojuhlenikM,
    trojuhlenikV,
    sum("obrazec A")
  );
  return {
    porovnani: {
      deductionTree: deduce(
        deduce(
          obsahA,
          deduce(
            obdelnikM,
            last(trojuhlenikM),
            last(trojuhlenikM),
            last(trojuhlenikM),
            sum("obrazec B")
          )
        ),
        ctorBooleanOption(0)
      )
    },
    obsah: {
      deductionTree: deduce(
        obsahA,
        ctorBooleanOption(11)
      )
    },
    obvod: {
      deductionTree: deduce(
        deduce(
          deduce(
            contLength("strana 2", 2),
            counter("\u010Dty\u0159ikr\xE1t", 4),
            product("\u010D\xE1st obvodu za p\u0159epony")
          ),
          contLength("strana 1", 2),
          deduceAs("zde bereme d\xE9lku p\u0159epony pouze 2 cm, v\xEDme v\u0161ak, \u017Ee mus\xED b\xFDt del\u0161\xED ne\u017E 2 cm")(
            contLength("min. virtu\xE1ln\xED d\xE9lka p\u0159epony", 2),
            counter("t\u0159i p\u0159epony", 3),
            product("\u010D\xE1st obvodu za p\u0159epony")
          ),
          sum("obvod")
        ),
        ctorBooleanOption(16, "smaller")
      )
    }
  };
}
function giftAndBox() {
  const entity3 = "K\u010D";
  const giftLabel = "d\xE1rek";
  const boxLabel = "krabi\u010Dka";
  const paidTotal = axiomInput(cont("zaplaceno", 84, entity3), 2);
  const giftToBox = axiomInput(comp(giftLabel, boxLabel, 72, entity3), 1);
  const box = deduce(giftToBox, paidTotal, ctor("comp-part-eq"));
  return {
    deductionTree: deduce(
      deduce(giftToBox, last(box)),
      box,
      ctor("comp-ratio")
    )
  };
}
function lukasAccount() {
  const entity3 = "K\u010D";
  const grandMotherIn = cont("babi\u010Dka", 500, entity3);
  const bookCostOut = cont("kniha", 186, entity3);
  const pocketMoneyIn = cont("kapesn\xE9", 150, entity3);
  const fatherGiftOut = cont("d\xE1rek pro tat\xEDnka", 263, entity3);
  const newState = cont("\xFA\u010Det nov\u011B", 470, entity3);
  const moneyIn = deduce(grandMotherIn, pocketMoneyIn, sum("p\u0159ijato"));
  const moneyOut = deduce(bookCostOut, fatherGiftOut, sum("vyd\xE1no"));
  const balance = deduce(moneyIn, moneyOut, ctorDifference("zm\u011Bna na \xFA\u010Dt\u011B"));
  return {
    deductionTree: deduce(
      newState,
      balance,
      ctorDifference("\xFA\u010Det p\u016Fvodn\u011B")
    )
  };
}
function appleBox() {
  const entity3 = "jablko";
  const soldLabel = "prod\xE1no";
  const boxLabel = "pln\xE1 bedna";
  const soldRatio = ratio(boxLabel, `${soldLabel} dopoledne`, 1 / 5);
  const sold = cont(`${soldLabel} odpoledne`, 20, entity3);
  const restRatio = ratio(boxLabel, "2. den zbytek", 2 / 5);
  return {
    deductionTree: deduce(
      deduce(
        deduce(restRatio, ctorComplement("1. den prod\xE1no")),
        soldRatio,
        ctorDifference(`${soldLabel} odpoledne`)
      ),
      sold
    )
  };
}
function timeUnitSum() {
  const entity3 = "";
  const minutes = "min";
  return {
    deductionTree: deduce(
      deduce(
        deduce(cont("hodin", 1, entity3, "h"), ctorUnit(minutes)),
        cont("minut", 20, entity3, minutes),
        sum("celkem")
      ),
      ctorUnit("s")
    )
  };
}
function distanceUnitCompareDiff() {
  const entity3 = "";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(cont("m", 1, entity3, "m"), ctorUnit("cm")),
          cont("cm", 26, entity3, "cm"),
          ctorDifference("prav\xE1 strana")
        ),
        deduce(cont("lev\xE1 strana", 1 / 2, entity3, "m"), ctorUnit("cm")),
        ctorDifference("v\xFDsledek")
      ),
      ctorUnit("mm")
    )
  };
}
function dveCislaNaOse({ input }) {
  const entity3 = "\xFAsek";
  const mensi = axiomInput(counter("men\u0161\xED zadan\xE9 \u010D\xEDslo", input.mensiCislo), 1);
  const vetsi = axiomInput(counter("v\u011Bt\u0161\xED zadnan\xE9 \u010D\xEDslo", input.vetsiCislo), 2);
  const pocetUseku = axiomInput(cont("vzd\xE1lenost mezi zadan\xFDmi \u010D\xEDsly", input.pocetUsekuMeziCisly, "\xFAsek"), 3);
  const positionX = axiomInput(cont("posun X", input.X, entity3), 1);
  const positionY = axiomInput(cont("posun Y", input.Y, entity3), 1);
  const usekRate = cislaNaOse({ mensi, vetsi, pocetUseku });
  const dd1 = deduce(deduce(positionX, usekRate), mensi, ctorSlide("pozice X"));
  const dd2 = deduce(deduce(positionY, last(usekRate)), mensi, ctorSlide("pozice Y"));
  const zeroPositionPosun = deduce(mensi, usekRate);
  return {
    "XandY": {
      deductionTree: deduce(dd1, dd2, ctor("tuple")),
      convertToTestedValue: (value) => ({ X: value.items[0].quantity, Y: value.items[1].quantity })
    },
    "posun": { deductionTree: zeroPositionPosun }
  };
}
function novorocniPrani() {
  const entity3 = "p\u0159\xE1n\xED";
  const entityBase = "minuty";
  const spolecne = cont("spole\u010Dn\u011B", 120, entity3);
  return {
    deductionTree: deduce(
      deduce(
        spolecne,
        toPredicate(
          deduce(
            cont("Tereza", 14, entity3),
            cont("Nikola", 10, entity3),
            sum("spole\u010Dn\u011B")
          ),
          (node) => ({ kind: "rate", quantity: node.quantity, agent: "spole\u010Dn\u011B", entity: { entity: entity3 }, entityBase: { entity: entityBase }, baseQuantity: 5 })
        )
      ),
      ctorOption("B", 25)
    )
  };
}
function carTrip() {
  const entity3 = "minuty";
  const pocatekLabel = "\u010Das odjezdu";
  const pocatekMinut = axiomInput(cont(pocatekLabel, 8, entity3), 1);
  const dobaCesta = axiomInput(cont("cesta", 24, entity3), 1);
  const pocatekPosun = deduce(
    dobaCesta,
    ratio("cesta", "1. t\u0159etina cesty", 1 / 3)
  );
  const pocatek = deduce(pocatekMinut, pocatekPosun, ctorDifference(pocatekLabel));
  return {
    pocatekCesty: {
      deductionTree: deduce(
        pocatek,
        ctorOption("E", 0)
      )
    },
    zeleznicniPrejezd: {
      deductionTree: deduce(
        deduce(
          dobaCesta,
          ratio("cesta", "polovina cesty", 1 / 2)
        ),
        ctorOption("C", 12)
      )
    },
    konecCesty: {
      deductionTree: deduce(
        deduce(
          deduce(last(pocatek), dobaCesta, ctorSlide("\u010Das odjezdu")),
          cont("posun odjezdu o", 6, entity3),
          ctorSlide("posunut\xFD \u010Das p\u0159\xEDjezdu")
        ),
        ctorOption("A", 30)
      )
    }
  };
}
function sestiuhelnik() {
  const entity3 = "troj\xFAhlen\xEDk";
  const dark = cont("tmav\xE1 \u010D\xE1st", 2, entity3);
  const obsah = contArea("tmav\xE1 \u010D\xE1st", 112);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            cont("pravideln\xFD \u0161esti\xFAhlen\xEDk", 6, entity3),
            dark,
            ctorDifference("sv\u011Btl\xE1 \u010D\xE1st")
          ),
          dark,
          ctor("comp-ratio")
        ),
        obsah
      ),
      ctorOption("D", 224)
    )
  };
}
function vyvojObyvatel() {
  const entity3 = "obyvatel";
  const lidovLabel = "Lidov";
  return {
    panov: {
      deductionTree: deduce(
        cont("p\u0159\xEDr\u016Fstek 2021", 10, entity3),
        ctorOption("E", 10)
      )
    },
    lidov: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              cont(lidovLabel, 300, entity3),
              transfer(`p\u0159\xEDr\u016Fstek 2019`, lidovLabel, 10, entity3)
            ),
            transfer(`p\u0159\xEDr\u016Fstek 2020`, lidovLabel, 5, entity3)
          ),
          transfer(lidovLabel, "\xFAbytek 2021", 5, entity3)
        ),
        ctorOption("D", 310)
      )
    },
    damov: {
      deductionTree: deduce(
        deduce(
          cont("2019", -5, entity3),
          cont("2020", -10, entity3),
          cont("2021", 10, entity3),
          cont("2022", 5, entity3),
          sum("zm\u011Bna obyvatel")
        ),
        ctorOption("B", 0)
      )
    }
  };
}
function pyramida() {
  const entity3 = "schody";
  const entityFloor = "patra";
  const pyramida7 = cont("pyramida", 7, entityFloor);
  const pyramida90 = cont("pyramida", 90, entity3);
  return {
    floor8: {
      deductionTree: deduce(
        cont("\u010Dern\xE9 schody", 48, entity3),
        deduce(
          cont("pyramida", 8, entityFloor),
          ratio("pyramida", "\u010Dern\xE9 schody", 1 / 2)
        ),
        ctor("rate")
      )
    },
    floor7: {
      deductionTree: deduce(
        deduce(
          cont("b\xEDl\xE9 schody", 84, entity3),
          to(
            pyramida7,
            commonSense("patra se st\u0159\xEDdaj\xED pravideln\u011B, prvn\xED patro je \u010Dern\xE9"),
            cont("b\xEDl\xE9 schody", 3, entityFloor)
          ),
          ctor("rate")
        ),
        pyramida7
      )
    },
    stairs: {
      deductionTree: deduce(
        to(
          pyramida90,
          primeFactors([90]),
          commonSense(`hled\xE1me co nejmen\u0161\xED periodu opakov\xE1n\xED schod\u016F z rozkladu`),
          commonSense(`2 a 3 m\u016F\u017Eeme vylou\u010Dit, proto\u017Ee opakov\xE1n schod\u016F po 2,3 nespl\u0148ujem podm\xEDnku stejn\xE9 barvnosti pro 27.patro = 30.patro`),
          commonSense(`5 je nejmen\u0161\xED mo\u017En\xFD po\u010Det schod\u016F, kter\xFD spl\u0148uje podm\xEDnku podm\xEDnku stejn\xE9 barvnosti pro 27.patro = 30.patro`),
          rate("pyramida", 5, entity3, entityFloor)
        ),
        pyramida90
      )
    }
  };
}

// src/math/M5A-2025/index.ts
var M5A_2025_default = createLazyMap({
  2.1: () => ramecek(),
  2.2: () => kolecka(),
  3.1: () => jizdniKolo().a,
  3.2: () => jizdniKolo().b,
  4.1: () => kulicka().pocet,
  4.2: () => kulicka().hmotnost,
  5.1: () => patrovyDum().druhePatroChlapci,
  5.2: () => patrovyDum().prvniPatroPocetDeti,
  5.3: () => patrovyDum().pocetDivek,
  6.1: () => domecek2().obvod,
  6.2: () => domecek2().kratsiStranaObdelni,
  8.1: () => turistickyOdil().pocetMuzu,
  8.2: () => turistickyOdil().pocetClenu,
  8.3: () => turistickyOdil().pocetZen,
  9: () => farmar(),
  10: () => penize(),
  11: () => ctvercovaSit3(),
  12: () => ctvercovaSit22(),
  13.1: () => kostky().a,
  13.2: () => kostky().b,
  13.3: () => kostky().c,
  14.1: () => poutnik().prvniKouzlo,
  14.2: () => poutnik().druheKouzlo,
  14.3: () => poutnik().maximumKouzel
});
function ramecek() {
  return {
    deductionTree: to(
      deduce(
        deduce(
          evalExprAsCont("0+1+2+3+4+5+6+7+8", "velk\xFD \u010Dtverec", { entity: "hodnota" })
        ),
        cont("velk\xFD \u010Dtverec", 3, "\u0159\xE1dek"),
        ctor("rate")
      ),
      commonSense("postupn\u011B dopo\u010D\xEDt\xE1v\xE1me \u010D\xEDsla, tam kde zn\xE1me 2 \u010D\xEDsla"),
      cont("hledan\xE9ho \u010D\xEDsla", 6, "hodnota")
    )
  };
}
function kolecka() {
  const rozdil = comp("prav\xFD krou\u017Eek", "lev\xFD kou\u017Eek", 90, "hodnota");
  const prvniKrouzek = deduce(
    compRatio("prav\xFD krou\u017Eek", "lev\xFD kou\u017Eek", 3),
    rozdil
  );
  return {
    deductionTree: deduce(
      deduce(
        compRatio("prav\xFD krou\u017Eek", "lev\xFD kou\u017Eek", 3),
        rozdil
      ),
      deduce(
        last(prvniKrouzek),
        rozdil
      ),
      ctorTuple("ob\u011B \u010D\xEDsla")
    )
  };
}
function ctvercovaSit3() {
  const dim2 = dimensionEntity();
  return {
    deductionTree: deduce(
      to(
        commonSense("pokud p\u0159ilo\u017E\xEDme 2 strany \u010Dtverce ABC za sebou, z\xEDsk\xE1me d\xE9lku ramena troh\xFAheln\xEDku ABC"),
        commonSense("cel\xFD obvod \u010Dtverce ABC je roven d\xE9lce obou ramen troh\xFAheln\xEDku ABC"),
        comp("troh\xFAheln\xEDku ABC", "\u010Dtverec ABC", 4, dim2.length)
      ),
      ctorOption("D", 4)
    )
  };
}
function ctvercovaSit22() {
  const trojuhlenikL = "pravo\xFAhl\xFD troj\xFAheln\xEDk";
  return {
    deductionTree: deduce(
      deduce(
        deduceAs("dopln\xEDme troj\xFAheln\xEDk ABC na \u010Dtverec, pak vid\xEDme, \u017Ee plat\xED")(
          ratio("troj\xFAheln\xEDk ABC", "dokreslen\xFD \u010Dtverec", 1 / 2),
          deduce(
            contLength("strana dokreslen\xFD \u010Dtverec", 4),
            squareArea("troj\xFAheln\xEDk ABC")
          )
        ),
        deduceAs("dopln\xEDme troj\xFAheln\xEDk KLM na obdeln\xEDk, pak vzniknou 3 pravo\xFAhl\xE9 troj\xFAheln\xEDky jako dopln\u011Bk k p\u016Fvodn\xEDmu troj\xFAheln\xEDk KLM")(
          deduce(
            contLength("krat\u0161\xED strana", 3),
            contLength("del\u0161\xED strana", 4),
            rectangleArea("dokreslen\xFD obdeln\xEDk")
          ),
          deduce(
            deduce(
              contLength(trojuhlenikL, 3),
              contLength(trojuhlenikL, 1),
              triangleArea(trojuhlenikL)
            ),
            deduce(
              contLength(trojuhlenikL, 3),
              contLength(trojuhlenikL, 1),
              triangleArea(trojuhlenikL)
            ),
            deduce(
              contLength(trojuhlenikL, 4),
              contLength(trojuhlenikL, 2),
              triangleArea(trojuhlenikL)
            ),
            sum("dohromady 3 pravo\xFAhl\xFD troj\xFAheln\xEDk")
          ),
          ctorDifference("troj\xFAheln\xEDk KLM")
        )
      ),
      ctorOption("C", 3)
    )
  };
}
function kostky() {
  const entityBase = "kostka";
  const entity3 = "te\u010Dky";
  const agent = "t\u011Bleso";
  const telesoPovrch = "t\u011Bleso na povrchu";
  const teckaPerKostka = rate(agent, 12, entity3, entityBase);
  return {
    a: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(agent, 2, entityBase),
            teckaPerKostka
          ),
          deduceAs("maximalizujeme po\u010Det te\u010Dek na t\u011Blese tak, \u017Ee st\u011Bny slepen\xE9 k sob\u011B budou m\xEDt na sob\u011B 1 te\u010Dku")(
            evalExprAsCont("2*1", "celkem schovan\xE9 te\u010Dky", { entity: entity3 })
          ),
          ctorDifference(telesoPovrch)
        ),
        ctorOption("C", 22)
      )
    },
    b: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(agent, 3, entityBase),
            teckaPerKostka
          ),
          deduceAs("minimalizujeme po\u010Det te\u010Dek na t\u011Blese tak, \u017Ee se sna\u017E\xEDme slepit st\u011Bny se 3 te\u010Dkami k sob\u011B, to nelze u prost\u0159edn\xED kostky, lze pouze u jedn\xE9 strany, proto\u017Ee na prot\u011Bj\u0161\xED stran\u011B se 3 te\u010Dkami je v\u017Edy strana s 1 te\u010Dkou")(
            evalExprAsCont("3*3 + 1*1", "celkem schovan\xE9 te\u010Dky", { entity: entity3 })
          ),
          ctorDifference(telesoPovrch)
        ),
        ctorOption("E", 26)
      )
    },
    c: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(agent, 3, entityBase),
            teckaPerKostka
          ),
          deduceAs("minimalizujeme po\u010Det te\u010Dek na t\u011Blese tak, \u017Ee st\u011Bny slepen\xE9 k sob\u011B budou m\xEDt na sob\u011B 3 te\u010Dky")(
            evalExprAsCont("4*3", "celkem schovan\xE9 te\u010Dky", { entity: entity3 })
          ),
          ctorDifference(telesoPovrch)
        ),
        ctorOption("D", 24)
      )
    }
  };
}
function turistickyOdil() {
  const muzLabel = "mu\u017Ei";
  const zenyLabel = "\u017Eeny";
  const clenLabel = "\u010Dlenov\xE9";
  const muzi = Object.fromEntries(Object.entries({
    2015: 30,
    2016: 45
  }).map(([key, value]) => [key, counter(`${muzLabel} - ${key}`, value)]));
  const clenove = Object.fromEntries(Object.entries({
    2016: 90,
    2017: 100
  }).map(([key, value]) => [key, counter(`${clenLabel} - ${key}`, value)]));
  const zeny = Object.fromEntries(Object.entries({
    2017: 50,
    2018: 50
  }).map(([key, value]) => [key, counter(`${zenyLabel} - ${key}`, value)]));
  return {
    pocetMuzu: {
      deductionTree: deduce(
        deduce(
          muzi["2015"],
          muzi["2016"],
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1 / 3, "closeTo", { asFraction: true })
      )
    },
    pocetClenu: {
      deductionTree: deduce(
        deduce(
          clenove["2017"],
          clenove["2016"],
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1 / 9, "closeTo", { asFraction: true })
      )
    },
    pocetZen: {
      deductionTree: deduce(
        deduce(
          zeny["2017"],
          zeny["2018"]
        ),
        ctorBooleanOption(0, "greater")
      )
    }
  };
}
function jizdniKolo() {
  const entity3 = "oto\u010Den\xED";
  const otaceniKola = ratios("ot\xE1\u010Den\xED kola", ["t\xE1ta", "Mirek"], [25, 30]);
  return {
    a: {
      deductionTree: deduce(
        otaceniKola,
        cont("t\xE1ta", 30, entity3),
        nthPart("Mirek")
      )
    },
    b: {
      deductionTree: deduce(
        otaceniKola,
        comp("t\xE1ta", "Mirek", -30, entity3)
      )
    }
  };
}
function kulicka() {
  const entity3 = "v\xE1ha";
  const unit = "g";
  const entityBase = "kuli\u010Dka";
  const bigLabel = "velk\xE1 kuli\u010Dka";
  const smallLabel = "mal\xE1 kuli\u010Dka";
  const big = rate(bigLabel, 30, { entity: entity3, unit }, entityBase);
  const small = rate(smallLabel, 20, { entity: entity3, unit }, entityBase);
  const pocetSrovnani = compRatio(smallLabel, bigLabel, 2);
  const bigPocet = deduce(
    deduce(
      deduce(
        deduce(
          big,
          small,
          ctorRatios("celkem")
        ),
        cont(smallLabel, 2, ""),
        nthPartFactor(smallLabel)
      ),
      cont("celkem", 560, entity3, unit),
      nthPart(bigLabel)
    ),
    big
  );
  const smallPocet = deduce(
    bigPocet,
    pocetSrovnani
  );
  return {
    pocet: {
      deductionTree: deduce(
        smallPocet,
        last(bigPocet),
        sum("celkem")
      )
    },
    hmotnost: {
      deductionTree: deduce(
        last(smallPocet),
        small
      )
    }
  };
}
function patrovyDum() {
  const boyLabel = "chlapci";
  const girlLabel = "d\xEDvky";
  const entity3 = "d\xEDt\u011B";
  const prvniL = "prvn\xED patro";
  const druheL = "druh\xE9 patro";
  const tretiL = "t\u0159et\xED patro";
  const rozlozeniChlapcuVPatrech = to(
    commonSense("Ve druh\xE9m pat\u0159e bydl\xED jen d\xEDvky."),
    commonSense("V prvn\xEDm a t\u0159et\xEDm pat\u0159e bydl\xED dohromady 5 chlapc\u016F a 3 d\xEDvky."),
    commonSense("Ze v\u0161ech chlapc\u016F z na\u0161eho domu pouze 3 chlapci nebydl\xED ve t\u0159et\xEDm pat\u0159e."),
    ratios("rozlo\u017Een\xED chlapc\u016F v patrech", [prvniL, druheL, tretiL], [3, 0, 2])
  );
  const celkem = cont("celkem", 11, entity3);
  const chlapci = to(
    commonSense("Ve druh\xE9m pat\u0159e bydl\xED jen d\xEDvky."),
    commonSense("V prvn\xEDm a t\u0159et\xEDm pat\u0159e bydl\xED dohromady 5 chlapc\u016F a 3 d\xEDvky."),
    cont(boyLabel, 5, entity3)
  );
  const celkovyPocetDivek = deduce(
    celkem,
    chlapci,
    ctorDifference(girlLabel)
  );
  return {
    druhePatroChlapci: {
      deductionTree: to(
        commonSense("Ve druh\xE9m pat\u0159e bydl\xED jen d\xEDvky."),
        cont(druheL, 0, boyLabel)
      )
    },
    prvniPatroPocetDeti: {
      deductionTree: deduce(
        cont("v prvn\xEDm a t\u0159et\xEDm pat\u0159e", 8, entity3),
        deduce(
          celkem,
          cont("v prvn\xEDm a druh\xE9m pat\u0159e", 8, entity3),
          ctorDifference(tretiL)
        ),
        ctorDifference(prvniL)
      )
    },
    pocetDivek: {
      deductionTree: celkovyPocetDivek
    }
  };
}
function penize() {
  const entity3 = "K\u010D";
  const janaRatio = ratio("celkem", "Jana", 1 / 5);
  const ivoCompare = compRatio("Ivo", "Jana", 2);
  const eva = cont("Eva", 240, entity3);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            janaRatio,
            deduce(
              janaRatio,
              ivoCompare
            ),
            sum("Ivo + Jana")
          ),
          ctorComplement("Eva")
        ),
        eva
      ),
      ctorOption("B", 600)
    )
  };
}
function domecek2() {
  const dumLabel = "dome\u010Dek";
  const strechaLabel = "st\u0159echa";
  const onlyStrechLabel = `${strechaLabel} bez spole\u010Den\xE9 \u010D\xE1sti`;
  const sharedLabel = "sd\xEDlen\xE1 \u010D\xE1st mezi p\u0159izem\xED a st\u0159echa";
  const prizemiLabel = "p\u0159\xEDzem\xED";
  const onlyPrizemiLabel = `${prizemiLabel} bez spole\u010Den\xE9 \u010D\xE1sti`;
  const kratsiStranaLabel = "krat\u0161\xED strana obdeln\xEDku";
  const delsiStranLabel = "del\u0161\xED strana obdeln\xEDku";
  const dum = contLength(dumLabel, 24);
  const obvodJenStrecha = deduce(
    dum,
    ratios(dumLabel, [onlyPrizemiLabel, onlyStrechLabel], [1, 1])
  );
  const shared = deduce(
    obvodJenStrecha,
    ratios(strechaLabel, [onlyStrechLabel, sharedLabel], [3, 2]),
    nthPart(sharedLabel)
  );
  return {
    obvod: {
      deductionTree: deduce(
        obvodJenStrecha,
        to(
          commonSense("st\u0159echa je slo\u017Eena ze t\u0159\xED rovnostrann\xFDch troj\xFAheln\xEDk\u016F"),
          commonSense("tyto troj\xFAheln\xEDky jsou spojeny tak, \u017Ee dv\u011B strany tvo\u0159\xED spole\u010Dnou z\xE1kladnu s p\u0159\xEDzem\xEDm"),
          ratios(strechaLabel, [onlyStrechLabel, sharedLabel], [3, 2])
        )
      )
    },
    kratsiStranaObdelni: {
      deductionTree: deduce(
        deduce(
          deduce(
            dum,
            ratios(dumLabel, [onlyPrizemiLabel, onlyStrechLabel], [1, 1]),
            nthPart(onlyPrizemiLabel)
          ),
          last(shared),
          ctorDifference(`2x${kratsiStranaLabel}`)
        ),
        ratios(`2x${kratsiStranaLabel}`, [kratsiStranaLabel, kratsiStranaLabel], [1, 1])
      )
    }
  };
}
function farmar() {
  const entityBase = "kr\xE1va";
  const entity3 = "objem";
  const unit = "l";
  const farmaPuvodneLabel = "farma p\u016Fvodn\u011B";
  const farmaNove = "farma nov\u011B";
  const farmaPuvodne = cont(farmaPuvodneLabel, 7, entityBase);
  const prodano = cont("prod\xE1no", 5, entityBase);
  const puvodneMlekoPerKrava = rate(farmaPuvodneLabel, 15, { entity: entity3, unit }, entityBase);
  const noveMlekoPerKrava = rate(farmaNove, 20, { entity: entity3, unit }, entityBase);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            deduce(
              farmaPuvodne,
              puvodneMlekoPerKrava
            ),
            counter(farmaPuvodneLabel, 2),
            product("2 dny")
          ),
          deduce(
            deduce(
              farmaPuvodne,
              prodano,
              ctorDifference(farmaPuvodneLabel)
            ),
            puvodneMlekoPerKrava
          ),
          ctorDifference(farmaNove)
        ),
        noveMlekoPerKrava
      ),
      ctorOption("A", 9)
    )
  };
}
function poutnik() {
  const entity3 = "duk\xE1ty";
  const kouzelnik = cont("kouzeln\xEDk", 54, entity3);
  const kouzelnikPuvodne = cont("kouzeln\xEDk p\u016Fvodn\u011B", 54, entity3);
  const poutnik2 = cont("poutn\xEDk", 54, entity3);
  const compareKvP = compRatio("poutn\xEDk", "kouzeln\xEDk", 1 / 2);
  const ratiosKvP = deduce(
    compareKvP,
    ctorRatios("celkem")
  );
  const kouzelnik1 = deduce(
    deduce(
      kouzelnik,
      poutnik2,
      sum("celkem")
    ),
    ratiosKvP
  );
  const kouzelnik2 = deduce(
    deduce(
      last(kouzelnik1),
      mapToCont({ agent: "poutn\xEDk" })(last(kouzelnik1)),
      sum("celkem")
    ),
    ratiosKvP
  );
  return {
    prvniKouzlo: {
      deductionTree: deduce(
        mapToCont({ agent: "kouzeln\xEDk p\u016Fvodn\u011B" })(kouzelnik),
        toCont(kouzelnik1, { agent: "kouzeln\xEDk po 1.kouzle" }),
        ctorDelta("kouzeln\xEDk")
      )
    },
    druheKouzlo: {
      deductionTree: deduce(
        deduce(
          deduce(
            last(kouzelnik1),
            mapToCont({ agent: "poutn\xEDk" })(last(kouzelnik1)),
            sum("celkem")
          ),
          last(ratiosKvP),
          nthPart("poutn\xEDk")
        ),
        double(),
        product("poutn\xEDk")
      )
    },
    maximumKouzel: {
      deductionTree: deduceAs("\u010D\xE1stka mus\xED b\xFD d\u011Bliteln\xE1 3, tak aby \u0161lo rozd\u011Blit v pom\u011Bru 1:2, resp. aby \u010D\xE1sti byla cel\xE1 \u010D\xEDsla")(
        deduce(
          deduce(
            last(kouzelnik2),
            mapToCont({ agent: "poutn\xEDk" })(last(kouzelnik2)),
            sum("celkem")
          ),
          last(ratiosKvP),
          nthPart("poutn\xEDk")
        ),
        double(),
        product("poutn\xEDk")
      )
    }
  };
}

// src/math/M5B-2025/index.ts
var M5B_2025_default = createLazyMap({
  1.1: () => hledaneCisla().cislo1,
  1.2: () => hledaneCisla().cislo2,
  1.3: () => hledaneCisla().cisla3,
  2.1: () => prevody().delka,
  2.2: () => prevody().hmotnost,
  2.3: () => prevody().cas,
  3.1: () => koralky().celkem,
  3.2: () => koralky().porovnani4To2,
  3.3: () => koralky().cerneKoralky,
  4.1: () => restaurace().celkemStolu,
  4.2: () => restaurace().celkemMist,
  5.1: () => lepeniCtvercu().nejdelsiMoznaStrana,
  5.2: () => lepeniCtvercu().pocetKombinaci,
  5.3: () => lepeniCtvercu().nejvetsiMoznyObsah,
  6.1: () => cislaNaTabuly().rozdil,
  6.2: () => cislaNaTabuly().cislo,
  8.1: () => grafPocetMinci().vera,
  8.2: () => grafPocetMinci().pavelAVeraVsTomas,
  8.3: () => grafPocetMinci().vsechnyDeti,
  10: () => zahon().yellow,
  11: () => zahon().velvet,
  14.1: () => ctverce().obvodObrazec2,
  14.2: () => ctverce().obrazecWidthToLength
});
function prevody() {
  const entityDelka = "d\xE9lka";
  const entityHmotnost = "hmotnost";
  const entityCas = "\u010Das";
  return {
    delka: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont("20m", 20, entityDelka, "m"),
            ctorUnit("dm")
          ),
          deduce(
            deduce(
              cont("18m", 18, entityDelka, "m"),
              ctorUnit("dm")
            ),
            cont("15dm", 15, entityDelka, "dm"),
            ctorDifference("rozd\xEDl")
          ),
          ctorDifference("hledan\xE9 \u010D\xEDslo")
        ),
        ctorUnit("cm")
      )
    },
    hmotnost: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont("3 kg", 3, entityHmotnost, "kg"),
            ctorUnit("g")
          ),
          toPredicate(
            deduce(
              deduce(
                cont("kilogram", 1, entityHmotnost, "kg"),
                ctorUnit("g")
              ),
              ratio("kilogram", "1/5 kilogramu", 1 / 5)
            ),
            (node) => ({ kind: "comp-diff", quantity: node.quantity, agentMinuend: "hledan\xE9 \u010D\xEDslo", agentSubtrahend: "3 kg", entity: entityHmotnost, unit: "g" })
          )
        ),
        counter("zmen\u0161en\xED", 4),
        ctorScaleInvert("hledan\xE9 \u010D\xEDslo")
      )
    },
    cas: {
      deductionTree: deduce(
        deduce(
          cont("20 minut", 20, entityCas, "min"),
          deduce(
            deduce(
              cont("hodina", 1, entityCas, "h"),
              ctorUnit("min")
            ),
            ratio("hodina", "1/4", 1 / 4)
          ),
          ctorDifference("hledan\xE9 \u010D\xEDslo")
        ),
        ctorUnit("s")
      )
    }
  };
}
function lepeniCtvercu() {
  const dim2 = dimensionEntity();
  return {
    nejdelsiMoznaStrana: {
      deductionTree: deduceAs("obdeln\xEDk s nejdel\u0161\xED mo\u017Enou stranu vytvo\u0159\xEDme tak, \u017Ee nalep\xEDme \u010Dtvere\u010Dky do jedn\xE1 \u0159ady za sebou")(
        deduce(
          contLength("obvod", 18),
          contLength("2 krat\u0161\xED strany", 2),
          ctorDifference("zbytek na 2 del\u0161\xED strany")
        ),
        evalExprAsCont("zbytekKRozdeleni / 2", "nejdel\u0161\xED mo\u017En\xE1 strana", dim2.length)
      )
    },
    pocetKombinaci: {
      deductionTree: to(
        commonSense("obvod obdeln\xEDku mus\xED b\xFDt 18, resp. sou\u010Det stran mus\xED b\xFDt 9"),
        commonSense("mo\u017Enosti rozm\u011Br\u016F stran: 1+8, 2+7, 3+6, 4+5"),
        commonSense("mo\u017Enosti obsah\u016F: 1x8=8, 2x7=14, 3x6=18, 4x5=20"),
        counter("mo\u017Enosti obsah\u016F", 4)
      )
    },
    nejvetsiMoznyObsah: {
      deductionTree: to(
        commonSense("vybere obdeln\xED se stranamy 4x5=20"),
        contArea("nejv\u011Bt\u0161\xED mo\u017En\xFD obsah", 20)
      )
    }
  };
}
function hledaneCisla() {
  const entity3 = "";
  const unknownNumberLabel = "nezn\xE1m\xE9 \u010D\xEDslo";
  const soucet = deduce(
    cont("sou\u010Det", 109, entity3),
    evalExprAsCont("soucet / 2", "polovina sou\u010Dtu", { entity: entity3 })
  );
  const rozdil = deduce(
    cont("rozd\xEDl", 13, entity3),
    evalExprAsCont("rozdil / 2", "polovina sou\u010Dtu", { entity: entity3 })
  );
  return {
    cislo1: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont("zn\xE1m\xFD v\xFDsledek", 20, entity3),
            counter("zmen\u0161en\xED", 2),
            ctorScaleInvert("\u010D\xEDslo bez n\xE1soben\xED")
          ),
          cont("opak p\u0159i\u010Dten\xE9 \u010D\xEDslo", 3, entity3),
          ctorDifference("\u010D\xEDslo bez p\u0159i\u010Dten\xE9ho \u010D\xEDsla")
        ),
        counter("zv\u011Bt\u0161en\xED", 7),
        ctorScale("nezn\xE1n\xE9 \u010D\xEDslo bez d\u011Blen\xED")
      )
    },
    cislo2: {
      deductionTree: deduce(
        deduce(
          compRelative("zv\u011Bt\u0161en\xED", unknownNumberLabel, -1 / 2),
          ctorRatios("zn\xE1m\xFD v\xFDsledek")
        ),
        cont("zn\xE1m\xFD v\xFDsledek", 198, entity3),
        nthPart(unknownNumberLabel)
      )
    },
    cisla3: {
      deductionTree: deduceAs("abychom zachovali sou\u010Det a z\xE1rove\u0148 vzniknul po\u017Eadovan\xFD rozd\xEDl")(
        deduceAs("p\u0159i\u010Dteme polovinu rozd\xEDlu")(
          soucet,
          rozdil,
          ctorSlide("prvn\xED nezn\xE1m\xE9 \u010D\xEDslo")
        ),
        deduceAs("ode\u010Dteme polovinu rozd\xEDlu")(
          last(soucet),
          last(rozdil),
          ctorSlideInvert("druh\xE9 nezn\xE1m\xE9 \u010D\xEDslo")
        ),
        ctor("tuple")
      )
    }
  };
}
function koralky() {
  const entity3 = "kor\xE1lky";
  const skupina3 = cont(`3. skupina`, 32, entity3);
  const groupRatioFactory = (num) => compRatio(`${num}. skupina`, `${num - 1}. skupina`, 4);
  const skupina2 = deduce(
    skupina3,
    groupRatioFactory(3)
  );
  const skupina1 = deduce(
    last(skupina2),
    groupRatioFactory(2)
  );
  const skupina4 = deduce(
    skupina3,
    groupRatioFactory(4)
  );
  const celkem = deduce(
    skupina4,
    skupina3,
    skupina2,
    skupina1,
    sum("celkem")
  );
  const name = "skupina barev (\u010Dern\xE9 a b\xEDl\xFD)";
  const colorQuota = deduce(
    last(skupina4),
    cont(name, 5, ""),
    ctor("quota")
  );
  return {
    celkem: {
      deductionTree: celkem
    },
    porovnani4To2: {
      deductionTree: deduce(
        last(skupina4),
        last(skupina2),
        ctor("comp-ratio")
      )
    },
    cerneKoralky: {
      deductionTree: deduce(
        last(skupina4),
        to(
          colorQuota,
          commonSense("ka\u017Ed\xE1 skupina obsahuje 1 b\xEDl\xFD"),
          commonSense("zbytek obsahuje 1 b\xEDl\xFD"),
          cont("b\xEDl\xE9", lastQuantity(colorQuota) + 1, entity3)
        ),
        ctorDifference("\u010Dern\xE9")
      )
    }
  };
}
function restaurace() {
  const entity3 = "host";
  const entityBase = "st\u016Fl";
  const bigLabel = "velk\xE9 st\u016Fl";
  const mediumLabel = "standardn\xED st\u016Fl";
  const smallLabel = "mal\xE9 st\u016Fl";
  const bigRate = rate(bigLabel, 4, entity3, entityBase);
  const mediumRate = rate(mediumLabel, 3, entity3, entityBase);
  const smallRate = rate(smallLabel, 2, entity3, entityBase);
  const celkemStolu = deduce(
    ratio("restaurace", "rezervace", 1 / 4),
    cont("rezervace", 9, entityBase)
  );
  const medium = deduce(
    last(celkemStolu),
    ratio("restaurace", mediumLabel, 1 / 3)
  );
  const small = deduce(
    last(celkemStolu),
    ratio("restaurace", smallLabel, 1 / 2)
  );
  const big = deduce(
    last(celkemStolu),
    deduce(
      last(small),
      last(medium),
      sum("dohromady")
    ),
    ctorDifference(bigLabel)
  );
  return {
    celkemStolu: {
      deductionTree: celkemStolu
    },
    celkemMist: {
      deductionTree: deduce(
        deduce(small, smallRate),
        deduce(medium, mediumRate),
        deduce(big, bigRate),
        sum("celkem")
      )
    }
  };
}
function zahon() {
  const entity3 = "rostlina";
  const entityYellow = "\u017Elut\xE1 rostlina";
  const entityVelvet = "fialov\xE1 rostlina";
  const entityBase = "mal\xFD troj\xFAhlen\xEDkov\xFD z\xE1hon";
  const strany = cont("z\xE1hon", 3, "strana");
  const subZahon = cont("po obvodu ke ka\u017Ed\xE9 stran\u011B", 3, entityBase);
  const rohove = cont("rohov\xE9", 3, entity3);
  const celkem = cont("z\xE1hon celkem", 39, entity3);
  return {
    yellow: {
      deductionTree: deduce(
        to(
          deduce(
            to(
              deduce(
                deduce(
                  celkem,
                  rohove,
                  ctorDifference("z\xE1hon")
                ),
                strany,
                ctor("rate")
              ),
              commonSense("2 z t\u011Bchto rostli jsou fialov\xE9 a z\xE1rove\u0148 jsou na ka\u017Ed\xE9 stran\u011B 2 rohov\xE9"),
              cont("po obvodu ke ka\u017Ed\xE9 stran\u011B", 12, entityYellow)
            ),
            subZahon,
            ctor("rate")
          ),
          commonSense("vzor \u017Elut\xE9 -> 1 + 2 + 3 + 4 = 10"),
          cont("z\xE1hon", 10, entityYellow)
        ),
        ctorOption("C", 10)
      )
    },
    velvet: {
      deductionTree: deduce(
        deduce(
          to(
            commonSense("vzor \u017Elut\xE9 -> 1 + 2 + 3 + 4 = 10"),
            commonSense("vzor fialov\xE9 -> 1 + 2 + 3 + 4 + 5 = 15"),
            rate("z\xE1hon", 15, entityVelvet, entityBase)
          ),
          cont("z\xE1hon", 3, entityBase)
        ),
        ctorOption("B", 45)
      )
    }
  };
}
function grafPocetMinci() {
  const veraLabel = "V\u011Bra";
  const pavelLabel = "Pavel";
  const tomasLabel = "Tom\xE1\u0161";
  const celkemLabel = "v\u0161ichni d\u011Bti";
  const vera = Object.entries({
    "leden": 7,
    "\xFAnor": 3,
    "b\u0159ezen": 2,
    "duben": 3
  }).map(([key, value], i) => counter(`${veraLabel} za ${key}`, value));
  const pavel = Object.entries({
    "leden": 2,
    "\xFAnor": 5,
    "b\u0159ezen": 7,
    "duben": 2
  }).map(([key, value], i) => counter(`${pavelLabel} za ${key}`, value));
  const tomas = Object.entries({
    "leden": 4,
    "\xFAnor": 3,
    "b\u0159ezen": 3,
    "duben": 5
  }).map(([key, value], i) => counter(`${tomasLabel} za ${key}`, value));
  const celkem = Object.entries({
    "leden": 13,
    "\xFAnor": 11,
    "b\u0159ezen": 12,
    "duben": 10
  }).map(([key, value], i) => counter(`${celkemLabel} za ${key}`, value));
  return {
    vera: {
      deductionTree: deduce(
        deduce(
          vera[0],
          deduce(
            vera[1],
            vera[2],
            vera[3],
            sum("t\u0159i m\u011Bs\xEDce")
          )
        ),
        ctorBooleanOption(0)
      )
    },
    pavelAVeraVsTomas: {
      deductionTree: deduce(
        deduce(
          deduce(
            vera[1],
            pavel[1],
            sum("Pavel a V\u011Bra")
          ),
          tomas[1],
          ctor("comp-ratio")
        ),
        ctorBooleanOption(3, "closeTo", { asFraction: true })
      )
    },
    vsechnyDeti: {
      deductionTree: deduce(
        deduce(
          tomas[3],
          deduce(
            celkem[0],
            celkem[1],
            celkem[2],
            celkem[3],
            sum("celkem za 4 m\u011Bs\xEDce")
          ),
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1 / 9, "closeTo", { asFraction: true })
      )
    }
  };
}
function cislaNaTabuly() {
  const entity3 = "hodnota";
  const rozdil = deduce(
    deduce(
      cont("desitky", 10, entity3),
      counter("po\u010Det", 3),
      product("Karel v\u011Bt\u0161\xED ne\u017E Mirka o")
    ),
    deduce(
      cont("jednotky", 1, entity3),
      counter("po\u010Det", 2),
      product("Karel men\u0161\xED ne\u017E Mirka o")
    ),
    ctorDifference("rozd\xEDl mezi Karel a Mirka")
  );
  return {
    rozdil: {
      deductionTree: rozdil
    },
    cislo: {
      deductionTree: deduce(
        deduce(
          last(rozdil),
          ratio("Karel", "rozd\xEDl mezi Karel a Mirka", 1 / 3)
        ),
        last(rozdil),
        ctorDifference("Mirka")
      )
    }
  };
}
function ctverce() {
  const entityBase = "strana";
  const entitySquare = "\u010Dtverec";
  const obrazec1 = "1. obrazec";
  const obrazec2 = "2. obrazec";
  const obrazec3 = "3. obrazec";
  const skupinaTmaveSedeV1 = "tmav\u011B \u0161ed\xFD \u010Dtverec";
  const skupinaTmaveSedeV4 = "tmav\u011B \u0161ed\xE9 p\xE1smo (4 \u010Dtverce)";
  const skupinaTmaveSedeV5 = "tmav\u011B \u0161ed\xE9 p\xE1smo (5 \u010Dtverce)";
  const skupinaSvetleSedaV5 = "sv\u011Btle \u0161ed\xE9 p\xE1smo (5 \u010Dtverc\u016F)";
  const skupinaSedaV5 = "\u0161ed\xE9 p\xE1smo (5 \u010Dtverc\u016F)";
  const skupinaSedaV6 = "\u0161ed\xE9 p\xE1smo (6 \u010Dtverc\u016F)";
  const skupinaBilaV4 = "b\xEDl\xE9 p\xE1smo (4 \u010Dtverc\u016F)";
  const skupinaBilaV5 = "b\xEDl\xE9 p\xE1smo (5 \u010Dtverc\u016F)";
  const obvod1 = contLength(obrazec1, 80);
  const ctverec1PocetStran = cont(obrazec1, 4, entityBase);
  const ctverec2PocetStran = cont(obrazec2, 4, entityBase);
  const tmaveSede = toCont(deduce(
    obvod1,
    ctverec1PocetStran,
    ctor("rate")
  ), { agent: skupinaTmaveSedeV4 });
  const tmaveSedyRate = deduce(
    last(tmaveSede),
    cont(skupinaTmaveSedeV4, 4, entitySquare),
    ctor("rate")
  );
  const sedyRate = deduceAs("4 tmav\u011B \u0161ed\xE9 \u010Dtverce = 5 \u0161ed\xFDch \u010Dtverc\u016F")(
    to(
      tmaveSede,
      contLength(skupinaSedaV5, lastQuantity(tmaveSede))
    ),
    cont(skupinaSedaV5, 5, entitySquare),
    ctor("rate")
  );
  const bilyRate = deduce(
    toCont(deduceAs("6 \u0161ed\xFDch \u010Dtverc\u016F = 4 b\xEDl\xFDm \u010Dtverc\u016Fm")(
      sedyRate,
      cont(skupinaSedaV6, 6, entitySquare)
    ), { agent: skupinaBilaV4 }),
    cont(skupinaBilaV4, 4, entitySquare),
    ctor("rate")
  );
  const bileV5 = deduce(
    bilyRate,
    cont(skupinaBilaV5, 5, entitySquare)
  );
  const horniStrana = deduce(
    bileV5,
    deduce(
      tmaveSedyRate,
      cont(skupinaTmaveSedeV1, 1, entitySquare)
    ),
    sum("horn\xED strana u 3. obrazce")
  );
  return {
    obvodObrazec2: {
      deductionTree: deduce(
        deduce(
          bilyRate,
          cont(skupinaBilaV5, 5, entitySquare)
        ),
        ctverec2PocetStran,
        product(obrazec2)
      )
    },
    obrazecWidthToLength: {
      deductionTree: deduce(
        deduce(
          last(bileV5),
          deduceAs("horn\xED strana u 3. obrazce = 5 sv\u011Btle \u0161ed\xFDch \u010Dtverc\u016F")(
            toCont(horniStrana, { agent: skupinaSvetleSedaV5 }),
            cont(skupinaSvetleSedaV5, 5, entitySquare),
            ctor("rate")
          ),
          sum("bo\u010Dn\xED stran")
        ),
        last(horniStrana)
      )
    }
  };
}

// src/math/M9A-2023/index.ts
var M9A_2023_default = createLazyMap({
  1: () => dobaFilmu({ input: { celkovaDobaFilmuVHodina: 1 } }),
  2.1: () => sud(),
  2.2: () => rezaniKvadru(),
  6.1: () => triangleExample().obsahABD,
  6.2: () => triangleExample().obsahABCD,
  7.1: () => krouzkyATridy().procent,
  7.2: () => krouzkyATridy().pocet,
  7.3: () => krouzkyATridy().pomer,
  8.2: () => pozemekObdelnik().delkaStrany,
  8.3: () => pozemekObdelnik().obsah,
  11.1: () => rovinataOblast().skutecnost,
  11.2: () => rovinataOblast().vychazkovaTrasa,
  11.3: () => rovinataOblast().meritko,
  12: () => lomanaCaraACFHA(),
  13: () => povrchValce(),
  14: () => angleBeta(),
  15.1: () => vyrobenoVyrobku(),
  15.2: () => dovolenaNaKole(),
  15.3: () => propousteniVeFirme(),
  16.1: () => trojuhelnik().patyObrazec,
  16.2: () => trojuhelnik().sestyObrazec,
  16.3: () => trojuhelnik().posledniObrazec
});
function trojuhelnik() {
  const agent = "obrazec";
  const entity3 = "troj\xFAheln\xEDk";
  const whiteEntity = `b\xEDl\xFD ${entity3}`;
  const grayEntity = `\u0161ed\xFD ${entity3}`;
  const nthLabel = "pozice";
  const vzor = pattern({
    nthTerm: `3^(n-1)`,
    nthPosition: "ln(x)/ln(3)",
    nthTermFormat: (n) => n == 1 ? "1" : `${range(n, 1).map((d) => 3).join(" * ")}`
  }, {
    entity: whiteEntity
  });
  return {
    patyObrazec: {
      deductionTree: deduce(
        vzor,
        cont(`${agent} 5`, 5, nthLabel)
      )
    },
    sestyObrazec: {
      deductionTree: deduce(
        deduce(
          vzor,
          cont(`${agent} 6`, 6, nthLabel)
        ),
        cont(`${agent} 6`, 121, grayEntity),
        sum("celkem", { entity: grayEntity })
      )
    },
    posledniObrazec: {
      deductionTree: deduce(
        to(
          comp("posledn\xED", "p\u0159edposledn\xED", 6561, grayEntity),
          commonSense("Po\u010Det \u0161ed\xFDch troj\xFAheln\xEDk\u016F v n\xE1sleduj\xEDc\xEDm obrazci se zv\xFD\u0161\xED o po\u010Det b\xEDl\xFDch troj\xFAheln\xEDk\u016F v p\u0159edchoz\xEDm obrazci."),
          cont("p\u0159edposledn\xED", 6561, whiteEntity)
        ),
        counter("trojn\xE1sobek", 3),
        product("posledn\xED obrazec")
      )
    }
  };
}
function dobaFilmu({ input }) {
  const entity3 = "hodin";
  return {
    title: "Zb\xFDvaj\xEDc\xED \u010Das filmu",
    deductionTree: deduce(
      deduce(
        axiomInput(cont("film", input.celkovaDobaFilmuVHodina, entity3, "h"), 1),
        ctorUnit("min")
      ),
      deduce(
        compRatio("zbytek do konce filmu", "uplynulo od za\u010D\xE1tku filmu", 1 / 2),
        ctorRatios("film")
      ),
      nthPart("zbytek do konce filmu")
    )
  };
}
function sud() {
  const entity3 = "litr";
  return {
    title: "Objem konvi\u010Dky",
    deductionTree: deduce(
      deduce(
        deduce(
          cont("zbylo", 60, entity3),
          deduce(ratio("sud", "odebr\xE1no", 1 / 3), ctorComplement("zbylo"))
        ),
        compRatio("sud", "kbel\xEDk", 15)
      ),
      compRatio("kbel\xEDk", "konvi\u010Dka", 5)
    )
  };
}
function rezaniKvadru() {
  const dim2 = dimensionEntity("dm");
  const entity3 = "krychle";
  return {
    title: "Roz\u0159ez\xE1n\xED kv\xE1dru na krychli\u010Dky",
    deductionTree: deduce(
      deduce(
        cont("kv\xE1dr", 200, entity3),
        rate("kv\xE1dr", 8, dim2.volume, entity3)
      ),
      ctorUnit("cm3")
    )
  };
}
function vyrobenoVyrobku() {
  const entity3 = "v\xFDrobk\u016F";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          cont("vyrobeno 2020", 250, entity3),
          compPercent("vyrobeno 2021", "vyrobeno 2020", 120)
        ),
        compPercent("vyrobeno 2022", "vyrobeno 2021", 120)
      ),
      ctorOption("E", 360)
    )
  };
}
function dovolenaNaKole() {
  const entity3 = "vzd\xE1lenost";
  const unit = "km";
  return {
    deductionTree: deduce(
      deduce(
        cont("Roman", 400, entity3, unit),
        compRatio("Roman", "Jana", 5 / 4)
      ),
      ctorOption("C", 320)
    )
  };
}
function propousteniVeFirme() {
  const entity3 = "zam\u011Bstnanec";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          comp("nov\u011B p\u0159ijato", "konec krize", 42, entity3),
          compPercent("nov\u011B p\u0159ijato", "konec krize", 125)
        ),
        compPercent("konec krize", "po\u010D\xE1tek krize", 60)
      ),
      ctorOption("A", 280)
    )
  };
}
function povrchValce() {
  const polomer = contLength("polom\u011Br podstavy", 10);
  const podstava = deduce(
    polomer,
    circleArea("podstava")
  );
  return {
    title: "Povrch v\xE1lce",
    deductionTree: deduce(
      deduce(
        podstava,
        last(podstava),
        deduce(last(podstava), compRatio("pl\xE1\u0161\u0165", "podstava", 3)),
        sum("v\xE1lec")
      ),
      ctorOption("D", 1570)
    )
  };
}
function krouzkyATridy() {
  const entity3 = "\u017E\xE1k";
  const entityBase = "jednotka grafu";
  const hudebniLabel = "hudebn\xED";
  const sachovyLabel = "\u0161achov\xFD";
  const robotickyLabel = "robotick\xFD";
  const hudebni8 = cont(`${hudebniLabel} 8.`, 5, entityBase);
  const hudebni9 = cont(`${hudebniLabel} 9.`, 4, entityBase);
  const sachovy8 = cont(`${sachovyLabel} 8.`, 4, entityBase);
  const sachovy9 = cont(`${sachovyLabel} 9.`, 7, entityBase);
  const roboticky8 = cont(`${robotickyLabel} 8.`, 3, entityBase);
  return {
    procent: {
      title: "Procentu\xE1ln\xED rozd\xEDl \u017E\xE1k\u016F v hudebn\xEDm krou\u017Eku",
      deductionTree: deduce(
        hudebni8,
        hudebni9,
        ctorComparePercent()
      )
    },
    pocet: {
      title: "Po\u010Det \u017E\xE1k\u016F 9. t\u0159\xEDd v \u0161achov\xE9m krou\u017Eku",
      deductionTree: deduce(
        deduce(
          comp(hudebniLabel, sachovyLabel, -6, entity3),
          comp(hudebniLabel, sachovyLabel, -2, entityBase)
        ),
        sachovy9
      )
    },
    pomer: {
      title: "Pom\u011Br \u017E\xE1k\u016F 8. a 9. t\u0159\xEDd v robotick\xE9m krou\u017Eku",
      deductionTree: deduce(
        roboticky8,
        deduce(
          deduce(
            deduce(hudebni8, sachovy8, roboticky8, sum("8.")),
            ratios("celkem", ["8.", "9."], [2, 3]),
            nthPart("9.")
          ),
          deduce(hudebni9, sachovy9, sum("9.")),
          ctorDifference(`${robotickyLabel} 9.`)
        ),
        ctorRatios(robotickyLabel)
      )
    }
  };
}
function pozemekObdelnik() {
  const dim2 = dimensionEntity("m");
  const delsiStranaComp = comp("obdeln\xEDk del\u0161\xED strana", "\u010Dtverec", 10, dim2.length);
  const kratsiStranaComp = comp("obdeln\xEDk krat\u0161\xED strana", "\u010Dtverec", -10, dim2.length);
  const stranaCtverce = deduce(
    compPercent("obdeln\xEDk krat\u0161\xED strana", "\u010Dtverec", 75),
    to(
      delsiStranaComp,
      commonSense("pokud je jedna strana del\u0161\xED, mus\xED b\xFDt druh\xE1 strana krat\u0161\xED o stejnou vzd\xE1lenost, aby byl zachov\xE1n stejn\xFD obvod"),
      kratsiStranaComp
    )
  );
  return {
    delkaStrany: {
      title: "D\xE9lka strany \u010Dtvercov\xE9ho pozemku",
      deductionTree: stranaCtverce
    },
    obsah: {
      title: "Rozd\xEDl obsah\u016F pozemk\u016F",
      deductionTree: deduce(
        deduce(
          last(stranaCtverce),
          squareArea("\u010Dtverec", "m2")
        ),
        deduce(
          deduce(last(stranaCtverce), kratsiStranaComp),
          deduce(last(stranaCtverce), delsiStranaComp),
          rectangleArea("obdeln\xEDk", "m2")
        )
      )
    }
  };
}
function angleBeta() {
  const alfaEntity = anglesNames.alpha;
  const triangleSum = contTringleAngleSum();
  const triangle = "troj\xFAheln\xEDku";
  const alfaA = cont(`vnit\u0159n\xED ${triangle}`, 4, alfaEntity);
  const vedleKBetaLabel = `vrchol vedle k ${anglesNames.beta} u vnit\u0159n\xEDho ${triangle}`;
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          triangleSum,
          deduce(
            deduce(
              cont(`zadan\xFD u vn\u011Bj\u0161\xEDho ${triangle}`, 4, alfaEntity),
              compAngle(`zadan\xFD u vn\u011Bj\u0161\xEDho ${triangle}`, vedleKBetaLabel, "corresponding")
            ),
            cont(`zadan\xFD u vnit\u0159n\xEDho ${triangle}`, 4, alfaEntity),
            deduce(
              cont(`zadan\xFD`, 2, alfaEntity),
              compAngle(`zadan\xFD`, `vrchol u vnit\u0159n\xEDho ${triangle}`, "opposite")
            ),
            ctorRatios(triangleSum.agent)
          ),
          alfaA,
          nthPart(vedleKBetaLabel)
        ),
        compAngle(vedleKBetaLabel, anglesNames.beta, "supplementary")
      ),
      ctorOption("B", 108)
    )
  };
}
function rovinataOblast() {
  const agent = "m\u011B\u0159\xEDtko";
  const plan = "pl\xE1n";
  const skutecnost = "skute\u010Dnost";
  const meritko = deduce(
    deduce(
      cont(agent, 700, skutecnost, "m"),
      ctorUnit("cm")
    ),
    cont(agent, 3.5, plan, "cm"),
    ctor("rate")
  );
  const vychazkovaTrasaLabel = "vych\xE1zkov\xE1 trasa";
  const vychazkovaTrasa = cont(vychazkovaTrasaLabel, 6, skutecnost, "km");
  return {
    skutecnost: {
      title: "D\xE9lka trasy na map\u011B a ve skute\u010Dnosti",
      deductionTree: deduce(
        deduce(
          deduce(
            meritko,
            deduce(
              cont("trasa", 49, plan, "mm"),
              ctorUnit("cm")
            )
          ),
          ctorUnit("km")
        ),
        ctorBooleanOption(1, "greater")
      )
    },
    vychazkovaTrasa: {
      title: "Rozd\xEDl d\xE9lek tras na map\u011B",
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              vychazkovaTrasa,
              deduce(
                vychazkovaTrasa,
                compRatio(vychazkovaTrasaLabel, "p\u0159\xEDm\xE1 trasa", 3)
              ),
              ctorDifference("rozd\xEDl")
            ),
            ctorUnit("cm")
          ),
          last(meritko),
          nthPart(plan)
        ),
        ctorBooleanOption(20)
      )
    },
    meritko: {
      title: "M\u011B\u0159\xEDtko turistick\xE9 mapy",
      deductionTree: deduce(
        meritko,
        ctorBooleanOption(2e5)
      )
    }
  };
}
function lomanaCaraACFHA() {
  const entity3 = "d\xE9lka";
  const unit = "cm";
  const ac = cont("AC", 17, entity3, unit);
  const bc = deduce(
    ac,
    cont("AB", 15, entity3, unit),
    pythagoras("AC", ["AB", "BC"])
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            bc,
            cont("BF", 6, entity3, unit),
            pythagoras("CF", ["BF", "BC"])
          ),
          ac,
          sum("\xFAhlop\u0159\xED\u010Dka na podlaze (AC) + \xFAhlop\u0159\xED\u010Dka na st\u011Bn\u011B (CF)")
        ),
        counter("stejn\u011B dlouh\xE1 \xFAhlop\u0159\xED\u010Dka na strop\u011B (FH) i stejn\u011B dlouh\xE1 \xFAhlop\u0159\xED\u010Dka na druh\xE9 st\u011Bn\u011B (HA)", 2),
        product("lomen\xE9 \u010D\xE1ry ACFHA")
      ),
      ctorOption("C", 54)
    )
  };
}
function triangleExample() {
  const height = contLength("v\xFD\u0161ka CB", 8);
  const abd = deduce(
    contLength("z\xE1kladna AB", 6),
    height,
    triangleArea("troj\xFAheln\xEDk ABD")
  );
  return {
    obsahABD: {
      deductionTree: abd
    },
    obsahABCD: {
      deductionTree: deduce(
        last(abd),
        deduce(
          contLength("z\xE1kladna CD", 10),
          height,
          triangleArea("troj\xFAheln\xEDk BCD")
        ),
        sum("obsah ABCD")
      )
    }
  };
}

// src/math/M9B-2023/index.ts
var M9B_2023_default = createLazyMap({
  2.1: () => lyzarskaPermice().porovnani,
  2.2: () => lyzarskaPermice().triJednodenni,
  6.1: () => expedice().spotreba,
  6.2: () => expedice().velikostExpedice,
  6.3: () => expedice().zasoby,
  7.1: () => cestaDoPrace().rychlik,
  7.2: () => cestaDoPrace().vlak,
  7.3: () => cestaDoPrace().autobus,
  8.1: () => dort().prumerTacu,
  8.2: () => dort().objemDortu,
  11.1: () => kosoctverec().obsah,
  11.2: () => kosoctverec().strana,
  11.3: () => kosoctverec().vyska,
  12: () => uhly2(),
  13: () => hranol3(),
  14: () => kosikar(),
  15.1: () => procenta().skauti,
  15.2: () => procenta().kapesne,
  15.3: () => procenta().vstupenky,
  16.1: () => vzorCtverce().pridano,
  16.2: () => vzorCtverce().rozdil,
  16.3: () => vzorCtverce().pocet
});
function expedice() {
  const newState = "nov\u011B";
  const currentState = "p\u016Fvodn\u011B";
  const entity3 = "dny";
  const dny = cont("dny", 30, entity3);
  const osoby = cont("osoby", 12, "osob");
  const osoboDnyEntity = { entity: "spot\u0159eba", unit: "osobodenni" };
  const prvniExpedice = cont("prvn\xED expedice", "x", "osob");
  return {
    spotreba: {
      deductionTree: deduce(
        deduce(
          compRatio("nov\u011B", "p\u016Fvodn\u011B", 5 / 6),
          proportion(false, ["z\xE1soby masa", "po\u010Det dn\xED"])
        ),
        cont("p\u016Fvodn\u011B", 30, entity3)
      )
    },
    velikostExpedice: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(newState, 45, entity3),
            cont(currentState, 30, entity3),
            ctor("comp-ratio")
          ),
          proportion(true, ["velikost expedice", "po\u010Det dn\xED"])
        ),
        cont(currentState, 12, "osob")
      )
    },
    zasoby: {
      deductionTree: deduce(
        deduce(
          dny,
          osoby,
          productCombine("spotreba", osoboDnyEntity)
        ),
        deduce(
          deduce(
            prvniExpedice,
            cont("prvn\xED expedice", 4, entity3),
            productCombine("prvn\xED expedice", osoboDnyEntity)
          ),
          deduce(
            deduce(
              compRatio("druh\xE1 expedice", "prvn\xED expedice", 2),
              prvniExpedice
            ),
            cont("druh\xE1 expedice", 8, entity3),
            productCombine("druh\xE1 expedice", osoboDnyEntity)
          ),
          sum("ob\u011B expedice")
        ),
        ctorLinearEquation("prvn\xED expedice", { entity: "osob" }, "x")
      )
    }
  };
}
function lyzarskaPermice() {
  const entity3 = "korun";
  const jednodenni = cont("jednodenn\xED", 600, entity3);
  const porovnani4 = compRelativePercent("t\u0159\xEDdenn\xED", "jednodenn\xED", 150);
  return {
    porovnani: {
      deductionTree: deduce(
        compRelativePercent("t\u0159\xEDdenn\xED", "jednodenn\xED", 150),
        ctor("convert-percent")
      )
    },
    triJednodenni: {
      deductionTree: deduce(
        deduce(
          jednodenni,
          counter("t\u0159ikr\xE1t", 3),
          product("t\u0159i jednodenn\xED")
        ),
        deduce(
          porovnani4,
          jednodenni
        )
      )
    }
  };
}
function cestaDoPrace() {
  const entity3 = "doba";
  const unit = "minut";
  const bus = cont("autobus", "x", entity3);
  const busVsRychlik = compRatio("autobus", "rychl\xEDk", 2);
  const vlakVsBus = compRelative("osobn\xED vlak", "autobus", 1 / 4);
  return {
    rychlik: {
      deductionTree: deduce(
        busVsRychlik,
        bus
      )
    },
    vlak: {
      deductionTree: deduce(
        vlakVsBus,
        bus
      )
    },
    autobus: {
      deductionTree: deduce(
        deduce(
          deduce(
            vlakVsBus,
            busVsRychlik
          ),
          comp("rychl\xEDk", "osobn\xED vlak", -15, { entity: entity3, unit })
        ),
        busVsRychlik
      )
    }
  };
}
function dort() {
  const dim2 = dimensionEntity();
  const stranaCtverce = deduce(
    deduce(
      contArea("plocha \u0159ezu dortu", 200),
      ...halfProduct("\u010Dtverec")
    ),
    evalFormulaAsCont(formulaRegistry.surfaceArea.square, (x) => x.a, "strana \u010Dtverce", dim2.length)
  );
  return {
    prumerTacu: {
      deductionTree: deduce(
        deduce(
          contArea("\u03C0 * obsah", 144),
          evalFormulaAsCont(formulaRegistry.squareRoot, (d) => d.x, "polom\u011Br (r)", dim2.length)
        ),
        double(),
        product("pr\u016Fm\u011Br")
      )
    },
    objemDortu: {
      deductionTree: deduce(
        deduce(
          to(
            stranaCtverce,
            commonSense("strana \u010Dtverce = polom\u011Br dortu"),
            contLength("polom\u011Br dortu", lastQuantity(stranaCtverce))
          ),
          circleArea("podstava dortu")
        ),
        to(
          last(stranaCtverce),
          commonSense("strana \u010Dtverce = v\xFD\u0161ka dortu"),
          contLength("v\xFD\u0161ka dortu", lastQuantity(stranaCtverce))
        ),
        baseAreaVolume("dort")
      )
    }
  };
}
function kosikar() {
  const entity3 = "poml\xE1zka";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            ratio("prod\xE1no celkem za dva dny", "prod\xE1no 1.den", 1 / 5),
            ctorComplement("prod\xE1no 2.den")
          ),
          ctorComplementCompRatio("prod\xE1no 1.den")
        ),
        comp("prod\xE1no 2.den", "prod\xE1no 1.den", 180, entity3)
      ),
      ctorOption("A", 60)
    )
  };
}
function procenta() {
  const entity3 = "\u010Dleni";
  const letos = cont("letos", 60, entity3);
  const vstupenkyEntity = "vstupenky";
  const den2 = cont("2.den", 3, entity3);
  const den3 = deduce(
    den2,
    compRelative("3.den", "2.den", 1 / 3)
  );
  return {
    skauti: {
      deductionTree: deduce(
        deduce(
          letos,
          deduce(
            letos,
            comp("letos", "loni", 20, entity3)
          ),
          ctorComparePercent()
        ),
        ctorOption("D", 50, { asPercent: true })
      )
    },
    kapesne: {
      deductionTree: deduce(
        deduce(
          deduce(
            ratio("kapesn\xE9", "utraceno celkem", 3 / 5),
            ratio("utraceno celkem", "n\xE1kup turistick\xE9 zn\xE1mky", 3 / 4)
          ),
          ctor("convert-percent")
        ),
        ctorOption("C", 45, { asPercent: true })
      )
    },
    vstupenky: {
      deductionTree: deduce(
        deduceAs("zvol\xEDme vhodn\xE9 \u010D\xEDslo pro po\u010Det \u010Dlen\u016F 1.den, nap\u0159. 1.den = 3 \u010Dleni")(
          den3,
          deduce(
            cont("1.den", 3, entity3),
            den2,
            last(den3),
            sum("celkem")
          ),
          ctorPercent()
        ),
        ctorOption("B", 40, { asPercent: true })
      )
    }
  };
}
function kosoctverec() {
  const dim2 = dimensionEntity();
  const stranaKosoctverec = deduce(
    contLength("troj\xFAheln\xEDk krat\u0161\xED strana", 3),
    contLength("troj\xFAheln\xEDk del\u0161\xED strana", 4),
    pythagoras("p\u0159epona", ["krat\u0161\xED strana", "del\u0161\xED strana"])
  );
  return {
    obsah: {
      deductionTree: deduce(
        deduceAs("samotn\xE9 p\u0159em\xEDst\u011Bn\xEDm 4 troj\xFAheln\xEDk\u016F sekl\xE1dan\xFDch jako obdeln\xEDk, resp. koso\u010Dtverec nem\xE1 vliv na obsah, pouze se zm\u011Bnil tvar obrazce nikoliv v\u0161ak jeho celkov\xE1 plocha")(
          contLength("obdeln\xEDk krat\u0161\xED strana", 3),
          contLength("obdeln\xEDk del\u0161\xED strana", 8),
          rectangleArea("obdeln\xEDk = koso\u010Dtverec")
        ),
        ctorBooleanOption(24, "greater")
      )
    },
    strana: {
      deductionTree: deduceAs("strana koso\u010Dtverce je rovna p\u0159epon\u011B v troj\xFAhln\xEDku")(
        stranaKosoctverec,
        ctorBooleanOption(5)
      )
    },
    vyska: {
      deductionTree: deduce(
        deduce(
          deduceAs("vztah pro obsah koso\u010Dtverce (obsah = strana x v\xFD\u0161ka => v\xFD\u0161ka = obsah / strana)")(
            contLength("obdeln\xEDk krat\u0161\xED strana", 3),
            contLength("obdeln\xEDk del\u0161\xED strana", 8),
            rectangleArea("obdeln\xEDk = koso\u010Dtverec")
          ),
          last(stranaKosoctverec),
          evalFormulaAsCont(formulaRegistry.surfaceArea.rectangle, (x) => x.b, "v\xFD\u0161ka", dim2.length)
        ),
        ctorBooleanOption(4.8)
      )
    }
  };
}
function uhly2() {
  const zadanyVrcholB = contAngle("zadan\xFD vrchol B", 80);
  const uhelC = deduce(
    zadanyVrcholB,
    deduce(
      zadanyVrcholB,
      compAngle("vrchol A", "zadan\xFD vrchol B", "isosceles-triangle-at-the-base")
    ),
    triangleAngle("vrchol C")
  );
  return {
    deductionTree: deduce(
      deduceAs("rovnoramenn\xFD troj\xFAheln\xEDk ABC")(
        deduce(
          deduce(
            uhelC,
            compAngle("vedle u vrcholu C", "vrchol C", "supplementary")
          ),
          compAngle(anglesNames.omega, "vedle u vrcholu C", "corresponding")
        ),
        deduce(
          deduce(
            last(uhelC),
            half(),
            ctorScale("polovina")
          ),
          compAngle(anglesNames.phi, "polovina", "alternate-interior")
        ),
        sum([anglesNames.omega, anglesNames.phi].join(" a "))
      ),
      ctorOption("E", 170)
    )
  };
}
function hranol3() {
  const dim2 = dimensionEntity();
  const stranaZakladna = contLength("z\xE1kladna", 24);
  const vyska = toCont(
    deduce(
      deduceAs("dopln\u011Bn\xED troj\xFAhlen\xEDk na obdeln\xEDk, tak \u017Ee ho slo\u017E\xEDm ze dvou stejn\xFDch troj\xFAhlen\xEDku")(
        contArea("z\xE1kladna", 60),
        ...doubleProduct("obdeln\xEDk")
      ),
      stranaZakladna,
      ctor("quota")
    ),
    { agent: "v\xFD\u0161ka", entity: dim2.length }
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          vyska,
          stranaZakladna,
          last(vyska),
          cuboidVolume("kv\xE1dr")
        ),
        half(),
        ctorScale("hranol")
      ),
      ctorOption("C", 300)
    )
  };
}
function vzorCtverce() {
  const entity3 = "pole";
  const position = "pozice";
  const pattern2 = squareNumbersPattern({ entity: entity3 });
  const currentPosition = deduce(
    cont("obrazec", 400, entity3),
    pattern2,
    nth(position)
  );
  return {
    pridano: {
      deductionTree: deduceAs("vzor opakov\xE1n\xED, resp. po\u010Det p\u0159\xEDdan\xFDch pol\xED je z\xE1visl\xFD na pozici = (4 x spodn\xED, horn\xED, lev\xE9 a prav\xE1 okraje) - 4 za rohov\xE9 prvky")(
        cont("9. obrazec", 9, position),
        evalExprAsCont("(4 * n) - 4", "p\u0159idan\xE1 pole na 9. obrazec", { entity: entity3 })
      )
    },
    rozdil: {
      deductionTree: deduce(
        deduceAs("u sud\xFDch obrazc\u016F tmav\xE1")(
          cont("10. obrazec", 10, position),
          pattern2
        ),
        deduceAs("u sud\xFDch obrazc\u016F sv\u011Btl\xE1")(
          cont("9. obrazec", 9, position),
          pattern2
        ),
        ctorDifference("rozd\xEDl")
      )
    },
    pocet: {
      deductionTree: deduce(
        deduce(
          deduce(
            currentPosition,
            cont("posun na dal\u0161\xED obrazec", 1, position),
            ctorSlide("n\xE1sleduj\xEDc\xED obrazec")
          ),
          pattern2
        ),
        deduce(
          deduce(
            last(currentPosition),
            cont("posun na p\u0159edchoz\xED obrazec", 1, position),
            ctorSlideInvert("p\u0159edchoz\xED obrazec")
          ),
          pattern2
        ),
        ctor("tuple")
      )
    }
  };
}

// src/math/M9C-2023/index.ts
var M9C_2023_default = createLazyMap({
  6.1: () => trasaCesta().vyraz,
  6.2: () => trasaCesta().delka,
  7.1: () => valec().polomerPodstavy,
  7.2: () => valec().objemValce,
  8.1: () => obchod().cena,
  8.2: () => obchod().hmotnost,
  11.1: () => tabor().oddilC,
  11.2: () => tabor().oddilB,
  11.3: () => tabor().pocet,
  12: () => vagony(),
  13: () => uhly3(),
  14: () => hranol4(),
  15.1: () => procenta2().encyklopediePocetStran,
  15.2: () => procenta2().rozaPocetStran,
  15.3: () => procenta2().pocetKnih,
  16.1: () => obrazce2().bileCtverce,
  16.2: () => obrazce2().sedeCtverce,
  16.3: () => obrazce2().sedeCtverecPosledniObrazec
});
function uhly3() {
  const zadanyVrcholA = contAngle("zadan\xFD vrchol A", 55);
  const uhelE = deduce(
    zadanyVrcholA,
    deduce(
      zadanyVrcholA,
      compAngle("vrchol B", zadanyVrcholA.agent, "isosceles-triangle-at-the-base")
    ),
    triangleAngle("vrchol E")
  );
  const uhelB = to(
    commonSense("v\u0161echny \xFAhly v rovnostrann\xE9m troj\xFAheln\xEDku jsou stejn\xE9"),
    contAngle("EBD", 60)
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            uhelE,
            compAngle("EBC", "vrchol E", "alternate-interior")
          ),
          uhelB,
          ctorDifference("DBC")
        ),
        contRightAngle(),
        triangleAngle(anglesNames.omega)
      ),
      ctorOption("D", 80)
    )
  };
}
function trasaCesta() {
  const entity3 = "d\xE9lka";
  const unit = "km";
  const trasaL = "trasa";
  const vitekL = "V\xEDtek";
  const ondraL = "Ondra";
  const rudolfL = "Rudolf";
  const rudolfToVitek = comp("Rudolf", "V\xEDtek", -60, entity3);
  const vitekPart = ratio(trasaL, vitekL, 1 / 3);
  const ondraPart = ratio(trasaL, ondraL, 2 / 5);
  const trasaX = cont(trasaL, "x", entity3, unit);
  const rudolfPart = deduce(
    deduce(vitekPart, ondraPart, sum(`${vitekL} + ${ondraL}`)),
    ctorComplement(rudolfL)
  );
  return {
    vyraz: {
      deductionTree: deduce(
        deduce(
          vitekPart,
          trasaX
        ),
        rudolfToVitek
      )
    },
    delka: {
      deductionTree: deduce(
        deduce(
          deduce(rudolfPart, vitekPart, ctor("comp-ratio")),
          rudolfToVitek
        ),
        vitekPart
      )
    }
  };
}
function valec() {
  const dim2 = dimensionEntity();
  const polomer = deduce(
    deduceAs("podstava kv\xE1dr")(
      contLength("strana a", 8),
      contLength("strana b", 6),
      pythagoras("uhlop\u0159\xED\u010Dka", ["strana a", "strana b"])
    ),
    ...halfProduct("polom\u011Br")
  );
  return {
    polomerPodstavy: {
      deductionTree: polomer
    },
    objemValce: {
      deductionTree: deduce(
        deduce(
          deduce(
            polomer,
            circleArea("podstava")
          ),
          contLength("v\xFD\u0161ka", 12),
          baseAreaVolume("v\xE1lec")
        ),
        ctorRound(10)
      )
    }
  };
}
function obchod() {
  const entity3 = "korun";
  const entityBase = "hmotnost";
  const unitBase = "g";
  const arasidyL = "ara\u0161\xEDdy";
  const madleL = "mandle";
  const kesuL = "ke\u0161u";
  const prumerL = "pr\u016Fm\u011Br";
  const prumerCena = rate(prumerL, 20, { entity: entity3 }, { entity: entityBase, unit: unitBase }, 100);
  const arasidyCena = rate(arasidyL, 8, { entity: entity3 }, { entity: entityBase, unit: unitBase }, 100);
  const mandleCena = rate(madleL, 20, { entity: entity3 }, { entity: entityBase, unit: unitBase }, 100);
  const kesuCena = rate(kesuL, 28, { entity: entity3 }, { entity: entityBase, unit: unitBase }, 100);
  const arasidy = cont(arasidyL, 500, entityBase, unitBase);
  const kesuX = cont(kesuL, "x", entityBase, unitBase);
  return {
    cena: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(arasidyL, 800, entityBase, unitBase),
            arasidyCena
          ),
          deduce(
            cont(madleL, 1200, entityBase, unitBase),
            mandleCena
          ),
          sum("celkem")
        ),
        counter("polovina sm\u011Bsi", 1 / 2),
        product("celkem")
      )
    },
    hmotnost: {
      deductionTree: deduce(
        deduce(
          deduce(
            prumerCena,
            arasidyCena,
            kesuCena,
            alligation("pom\u011Br cen ve sm\u011Bsi")
          ),
          ctorRatiosInvert("pom\u011Br hmotnost\xED ve sm\u011Bsi")
        ),
        arasidy,
        nthPart(kesuL)
      )
    }
  };
}
function tabor() {
  const entity3 = "d\xEDt\u011B";
  const oddilAChlapci = cont("odd\xEDl A - chlapci", 9, entity3);
  const oddilADivky = cont("odd\xEDl A - d\xEDvky", 7, entity3);
  const oddilBDivky = cont("odd\xEDl B - d\xEDvky", 4, entity3);
  const oddilA = deduce(
    oddilAChlapci,
    oddilADivky,
    sum("odd\xEDl A", { entity: entity3 })
  );
  const oddilCChlapci = cont("odd\xEDl C - chlapci", 3, entity3);
  const oddilCDivky = deduce(
    deduce(
      oddilA,
      compRatio("odd\xEDl A", "odd\xEDl C", 2)
    ),
    oddilCChlapci,
    ctorDifference("odd\xEDl C - d\xEDvky")
  );
  const oddilBChlapci = deduce(
    deduce(
      last(oddilA),
      ratios("po\u010Det d\u011Bt\xED", ["odd\xEDl A", "odd\xEDl B"], [4, 3]),
      nthPart("odd\xEDl B")
    ),
    oddilBDivky,
    ctorDifference("odd\xEDl B - chlapci")
  );
  return {
    oddilC: {
      deductionTree: deduce(
        oddilCDivky,
        ctorBooleanOption(5)
      )
    },
    oddilB: {
      deductionTree: deduce(
        deduce(
          oddilBChlapci,
          oddilBDivky,
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1 / 2, "closeTo", { asFraction: true })
      )
    },
    pocet: {
      deductionTree: deduce(
        deduce(
          deduce(oddilADivky, oddilBDivky, last(oddilCDivky), sum("d\xEDvky")),
          deduce(oddilAChlapci, last(oddilBChlapci), oddilCChlapci, sum("chlapci")),
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1 / 5, "closeTo", { asFraction: true })
      )
    }
  };
}
function hranol4() {
  const dim2 = dimensionEntity();
  const plastL = "pl\xE1\u0161t";
  const podstavaL = "podstava";
  const podstavaArea = deduce(
    contArea("hranol", 144),
    ratios("hranol", [plastL, podstavaL, podstavaL], [2, 1, 1])
  );
  return {
    deductionTree: deduce(
      deduce(
        podstavaArea,
        deduce(
          deduceAs("pl\xE1\u0161t hranolu (4 schodn\xE9 bo\u010Dn\xED st\u011Bny) je dvakr\xE1t v\u011Bt\u0161\xED ne\u017E obsah podstavy, resp. bocni stena = podstava * 2 / 4 = podstava * 1/2")(
            last(podstavaArea),
            ...halfProduct("bo\u010Dn\xED st\u011Bna")
          ),
          deduce(
            last(podstavaArea),
            evalFormulaAsCont(formulaRegistry.surfaceArea.square, (x) => x.a, "strana podstavy", dim2.length)
          ),
          evalFormulaAsCont(formulaRegistry.surfaceArea.rectangle, (x) => x.b, "v\xFD\u0161ka", dim2.length)
        ),
        baseAreaVolume("hranol")
      ),
      ctorOption("B", 108)
    )
  };
}
function procenta2() {
  const entity3 = "knih";
  const nemecky = cont("n\u011Bmecky psan\xFDch", 30, entity3);
  const celkemKnih = deduce(
    nemecky,
    percent("knihovna", "n\u011Bmecky psan\xFDch", 10)
  );
  return {
    encyklopediePocetStran: {
      deductionTree: deduce(
        deduce(
          compRelativePercent("encyklopedie", "atlas", 25),
          cont("atlas", 200, "stran")
        ),
        ctorOption("E", 250)
      )
    },
    rozaPocetStran: {
      deductionTree: deduce(
        deduce(
          cont("kniha", 500, "stran"),
          compRelativePercent("p\u0159e\u010Detla", "nep\u0159e\u010Detla", 50)
        ),
        ctorExpressionOption("A", "x < 210")
      )
    },
    pocetKnih: {
      deductionTree: deduce(
        deduce(
          celkemKnih,
          deduce(
            nemecky,
            deduce(
              last(celkemKnih),
              ratio("knihovna", "anglicky psan\xFDch", 1 / 5)
            ),
            sum("n\u011Bmecky a anglicky psan\xFDch")
          ),
          ctorDifference("\u010Desky psan\xFDch")
        ),
        ctorOption("B", 210)
      )
    }
  };
}
function vagony() {
  const vagonL = "vag\xF3n";
  const entity3 = "lokomotivn\xEDch d\xE9lek";
  return {
    deductionTree: deduce(
      deduce(
        to(
          ratio("souprava", "lokomotiva", 1 / 17),
          cont("v\u0161echny vag\xF3ny", 16, entity3)
        ),
        toRate(
          compRelative("lokomotiva", vagonL, -1 / 4),
          {
            agent: "souprava",
            entity: { entity: vagonL },
            entityBase: { entity: entity3 }
          }
        )
      ),
      ctorOption("C", 12)
    )
  };
}
function obrazce2() {
  const obrazec2 = "obrazec";
  const sedyEntity = "\u0161ed\xFD \u010Dtverec";
  const bilyEntity = "b\xEDl\xFD \u010Dtverec";
  const sousedniCtverceRate = rate(obrazec2, 2, sedyEntity, bilyEntity);
  const pattern2 = oblongNumbers({ entity: bilyEntity }, -1);
  const pocetSedychFunc = (container) => {
    const pocetSloupcu = toCont(deduce(
      container,
      pattern2,
      nth(bilyEntity)
    ), { agent: "spodn\xED \u0159ada" });
    return deduce(
      deduce(
        pocetSloupcu,
        sousedniCtverceRate
      ),
      deduce(
        deduce(
          last(pocetSloupcu),
          evalExprAsCont("pocetRadku - 1", "lev\xFD sloupec", { entity: bilyEntity })
        ),
        sousedniCtverceRate
      ),
      cont("rohov\xFD", 1, sedyEntity),
      sum("celkem")
    );
  };
  const nPlusRule = comp("spodn\xED \u0159ada", "lev\xE1 \u0159ada", 1, bilyEntity);
  const bilyRoh = cont("rohov\xFD", 1, bilyEntity);
  const levaRada = deduce(
    deduce(
      deduce(
        to(
          commonSense("106 = p\u0159idan\xE9 b\xEDl\xE9 + \u0161ed\xFD dole (2) + \u0161ed\xFD vpravo (2)"),
          cont("p\u0159idan\xE9 v posledn\xEDm obrazci", 106 - 4, bilyEntity)
        ),
        bilyRoh,
        ctor("slide-invert")
      ),
      nPlusRule,
      ctor("comp-part-eq")
    ),
    bilyRoh,
    ctor("slide")
  );
  return {
    bileCtverce: {
      deductionTree: toCont(deduce(
        deduce(
          deduce(
            cont("spodn\xED \u0159ada obrazce", 41, sedyEntity),
            cont("rohov\xFD \u010Dtverec", 1, sedyEntity),
            ctorDifference("spodn\xED \u0159ada")
          ),
          sousedniCtverceRate
        ),
        pattern2
      ), { agent: obrazec2 })
    },
    sedeCtverce: {
      deductionTree: pocetSedychFunc(cont(obrazec2, 90, bilyEntity))
    },
    sedeCtverecPosledniObrazec: {
      deductionTree: deduce(
        deduce(
          deduce(
            levaRada,
            deduce(
              last(levaRada),
              nPlusRule
            ),
            sum("celkem")
          ),
          sousedniCtverceRate
        ),
        cont("rohov\xFD", 1, sedyEntity),
        sum("celkem")
      )
    }
  };
}

// src/math/M9D-2023/index.ts
var M9D_2023_default = createLazyMap({
  1: () => zavazi(),
  2.1: () => ciselnaOsa().bodC,
  2.2: () => ciselnaOsa().bodB,
  6.1: () => vysazovaniStromu().sobota,
  6.2: () => vysazovaniStromu().nedele,
  6.3: () => vysazovaniStromu().patek,
  7.1: () => parkoviste().osobnichAut,
  7.2: () => parkoviste().autobus,
  11.1: () => park()[1],
  11.2: () => park()[2],
  11.3: () => park()[3],
  12: () => obdelnik(),
  14: () => kvadr(),
  15.1: () => procenta3().loni,
  15.2: () => procenta3().zaci,
  15.3: () => procenta3().muzi,
  16.1: () => obrazce3().pocetUsecek,
  16.2: () => obrazce3().rozdilPuntiku,
  16.3: () => obrazce3().pocetUsecekPro300Puntiku
});
function zavazi() {
  const small = "leh\u010D\xED";
  const big = "t\u011B\u017E\u0161\xED";
  return {
    deductionTree: deduce(
      ratios("z\xE1va\u017E\xED", [small, big], [3, 5]),
      comp(small, big, -600, { entity: "hmotnost", unit: "g" }),
      nthPart(small)
    )
  };
}
function ciselnaOsa() {
  const entity3 = "\xFAsek";
  const znamaHodnota = counter("zn\xE1m\xE9 \u010D\xEDslo", 20);
  return {
    bodC: {
      deductionTree: to(
        commonSense("A je zmen\u0161en\xE9 o 2 d\xEDlky a B je naopak zv\u011Bt\u0161en\xE9 o 2 d\xEDlky, tj. p\u0159i sou\u010Dtu A+B se zm\u011Bny vyru\u0161\xED"),
        counter("C = sou\u010Det A+B", 40)
      )
    },
    bodB: {
      deductionTree: deduce(
        znamaHodnota,
        deduce(
          deduce(
            deduce(
              counter("C", 40),
              znamaHodnota,
              ctorDifference("rozd\xEDl")
            ),
            cont("rozd\xEDl", 5, entity3),
            ctor("rate")
          ),
          cont("posun B", 2, entity3)
        ),
        ctorSlide("B")
      )
    }
  };
}
function vysazovaniStromu() {
  const entity3 = "stromy";
  const pocetStromu = cont("p\xE1tek", "p", entity3);
  const sobotaToPatek = compRelative("sobota", "p\xE1tek", 1 / 3);
  const nedeleToPatek = compRelativePercent("ned\u011Ble", "p\xE1tek", 60);
  return {
    sobota: {
      deductionTree: deduce(
        sobotaToPatek,
        pocetStromu
      )
    },
    nedele: {
      deductionTree: deduce(
        nedeleToPatek,
        pocetStromu
      )
    },
    patek: {
      deductionTree: deduce(
        deduce(
          sobotaToPatek,
          nedeleToPatek,
          sum("sobota a ned\u011Ble")
        ),
        comp("p\xE1tek", "sobota a ned\u011Ble", -290, entity3)
      )
    }
  };
}
function parkoviste() {
  const entity3 = "m\xEDst";
  const parkoviste2 = cont("parkovi\u0161t\u011B", 105, entity3);
  return {
    osobnichAut: {
      deductionTree: deduce(
        deduce(
          compRatio("autobus", "auto", 4),
          parkoviste2
        ),
        rate("parkovi\u0161t\u011B", 1, entity3, "auto")
      )
    },
    autobus: {
      deductionTree: deduce(
        deduce(
          deduce(
            compRelative("auto", "autobus", 1 / 4),
            ctorRatios("parkovi\u0161t\u011B")
          ),
          rate("parkovi\u0161t\u011B", 4, entity3, "autobus"),
          nthPartFactor("autobus")
        ),
        parkoviste2,
        nthPart("autobus")
      )
    }
  };
}
function obdelnik() {
  const delsiStrana = deduce(
    ratios("obvod men\u0161\xED obdeln\xEDk", ["prav\xE1 strana", "horn\xED strana", "lev\xE1 strana", "doln\xED strana"], [1, 4, 1, 4]),
    contLength("obvod men\u0161\xED obdeln\xEDk", 30)
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            delsiStrana,
            ...halfProduct("strana \u010Dtverce")
          ),
          ...doubleProduct("velk\xFD obdeln\xEDk - lev\xE1 a prav\xE1 strana")
        ),
        deduce(
          last(delsiStrana),
          ...doubleProduct("velk\xFD obdeln\xEDk - horn\xED a doln\xED strana")
        ),
        sum("obvod velk\xFD obdeln\xEDk")
      ),
      ctorOption("B", 36)
    )
  };
}
function procenta3() {
  const entity3 = "uchaze\u010D\u016F";
  const zaci = "\u017E\xE1ci";
  const dospely = "dosp\u011Bl\xFD";
  return {
    loni: {
      deductionTree: deduce(
        deduce(
          cont("letos", 420, entity3),
          compRelativePercent("letos", "loni", 40)
        ),
        ctorOption("E", 300)
      )
    },
    zaci: {
      deductionTree: deduce(
        deduce(
          cont("\u010De\u0161tina", 180, zaci),
          compRelativePercent("\u010De\u0161tina", "matika", -25)
        ),
        ctorOption("B", 240)
      )
    },
    muzi: {
      deductionTree: deduce(
        deduce(
          cont("baz\xE9n", 680, dospely),
          compRelativePercent("mu\u017Ei", "\u017Eeny", -30),
          nthPart("mu\u017Ei")
        ),
        ctorOption("D", 280)
      )
    }
  };
}
function obrazce3() {
  const entity3 = "pater";
  const trojUhelnik = "troj\xFAhlen\xEDk";
  const usecky = "\xFAse\u010Dka";
  const puntiky = "puntiky";
  const useckaVsTrojuhelnik = compRatio(usecky, trojUhelnik, 3);
  const posledniObrazec = deduce(
    comp("posledn\xED obrazec", "p\u0159edposledn\xED obrazec", 96, usecky),
    useckaVsTrojuhelnik,
    ctor("comp")
  );
  return {
    pocetUsecek: {
      deductionTree: deduce(
        deduce(
          cont("obrazec \u010D.5", 5, entity3),
          triangularNumbersPattern({ entity: trojUhelnik })
        ),
        useckaVsTrojuhelnik
      )
    },
    rozdilPuntiku: {
      deductionTree: to(
        commonSense("po\u010Det punt\xEDk\u016F = po\u010Det troj\xFAhlen\xEDk\u016F v n\xE1sleduj\xEDc\xEDm obrazci"),
        posledniObrazec,
        cont("p\u0159id\xE1no v posledn\xEDm obrazci + 1", lastQuantity(posledniObrazec) + 1, "punt\xEDky")
      )
    },
    pocetUsecekPro300Puntiku: {
      deductionTree: deduce(
        to(
          commonSense("po\u010Det punt\xEDk\u016F = po\u010Det troj\xFAhlen\xEDk\u016F v n\xE1sleduj\xEDc\xEDm obrazci"),
          cont("obrazec", 300, puntiky),
          cont("n\xE1sleduj\xEDc\xED obrazec", 300, trojUhelnik)
        ),
        useckaVsTrojuhelnik
      )
    }
  };
}
function park() {
  const currentLabel = "pracovalo";
  const addedLabel = "nov\u011B p\u0159ijato";
  const removedLabel = "ode\u0161lo";
  const current2019 = deduce(
    deduce(
      counter(`${currentLabel} 2018`, 14),
      counter(`${addedLabel} 2018`, 10),
      sum("celkem")
    ),
    counter(`${removedLabel} 2018`, 8),
    ctorDifference(`${currentLabel} 2019`)
  );
  return {
    "1": {
      deductionTree: deduce(
        current2019,
        ctorBooleanOption(16)
      )
    },
    "2": {
      deductionTree: deduce(
        deduce(
          counter(`${currentLabel} 2021`, 16),
          deduce(
            counter(`${currentLabel} 2020`, 13),
            counter(`${removedLabel} 2020`, 3),
            ctorDifference("zbytek")
          ),
          ctorDifference(`${addedLabel} 2020`)
        ),
        ctorBooleanOption(7, "smaller")
      )
    },
    "3": {
      deductionTree: deduce(
        deduce(
          deduce(
            counter(`${currentLabel} 2021`, 16),
            counter(`${addedLabel} 2021`, 5),
            sum("celkem")
          ),
          counter(`${currentLabel} 2022`, 9),
          ctorDifference(`${removedLabel} 2021`)
        ),
        ctorBooleanOption(12, "greater")
      )
    }
  };
}
function kvadr() {
  const delkaL = "d\xE9lka";
  const sirkaL = "\u0161\xED\u0159ka";
  const delka = contLength(delkaL, 8);
  const sirka = contLength(sirkaL, 6);
  const vyska = contLength("v\xFD\u0161ka", 10);
  const uhloprickaL = "\xFAhlop\u0159\xED\u010Dka";
  const uhlopricka = deduce(
    delka,
    sirka,
    pythagoras(uhloprickaL, [delkaL, sirkaL])
  );
  const puvodniKvard = deduce(
    deduce(
      deduce(
        delka,
        vyska,
        rectangleArea("p\u0159edn\xED, zadn\xED plocha")
      ),
      ...doubleProduct("p\u0159edn\xED a zadn\xED plocha")
    ),
    deduce(
      deduce(
        sirka,
        vyska,
        rectangleArea("prav\xE1 a lev\xE1 bo\u010Dn\xED plocha")
      ),
      ...doubleProduct("prav\xE1 a lev\xE1 bo\u010Dn\xED plocha")
    ),
    deduce(
      deduce(
        delka,
        sirka,
        rectangleArea("spodn\xED, horn\xED plocha")
      ),
      ...doubleProduct("spodn\xED a horn\xED plocha")
    ),
    sum("p\u016Fvodn\xED kv\xE1dr")
  );
  return {
    deductionTree: deduce(
      deduce(
        puvodniKvard,
        deduce(
          deduce(
            last(puvodniKvard),
            deduce(
              deduce(
                delka,
                vyska,
                rectangleArea("chyb\u011Bj\xEDc\xED p\u016Fvodn\xED p\u0159edn\xED plocha")
              ),
              deduce(
                deduce(
                  delka,
                  sirka,
                  rectangleArea("p\u016Fvodn\xED horn\xED, spodn\xED plocha v\xFD\u0159ezu")
                ),
                ...halfProduct("chyb\u011Bj\xEDc\xED p\u016Fvodn\xED horn\xED a spodn\xED plocha v\xFD\u0159ezu = polovina plochy podstavy")
              ),
              sum("chyb\u011Bj\xEDc\xED plochy")
            ),
            ctorDifference("nov\xFD p\u011Btibok\xFD kv\xE1dr")
          ),
          deduce(
            deduce(
              deduce(
                uhlopricka,
                ...halfProduct("polovina \xFAhlop\u0159\xED\u010Dky obdeln\xEDku v podstav\u011B")
              ),
              vyska,
              rectangleArea("obdeln\xEDkov\xE9 plochy v \u0159ezu")
            ),
            ...doubleProduct("2 obdeln\xEDkov\xE9 plochy v \u0159ezu")
          ),
          sum("nov\xFD p\u011Btibok\xFD kv\xE1dr")
        )
      ),
      ctorOption("A", 4)
    )
  };
}

// src/math/M9A-2024/angle.ts
function rozdilUhlu({ input }) {
  const beta = contAngle(anglesNames.beta, input.beta);
  const delta2 = contAngle(anglesNames.delta, input.delta);
  const alfa = deduce(delta2, compAngle(anglesNames.delta, anglesNames.alpha, "supplementary"));
  const deductionTree = deduce(
    deduce(
      deduce(
        beta,
        alfa,
        triangleAngle(anglesNames.gamma)
      ),
      last(alfa),
      ctor("comp-diff")
    ),
    ctorOption("B", 11)
  );
  return { deductionTree };
}

// src/math/M9A-2024/dum-meritko.ts
function build6({ input }) {
  const skutecnost = "skute\u010Dnost";
  const plan = "pl\xE1n";
  const widthLabel = "\u0161\xED\u0159ka";
  const lengthLabel = "d\xE9lka";
  const unit = "cm";
  const unit2D = "cm2";
  const width = axiomInput(cont(widthLabel, input.sirkaM, skutecnost, "m"), 1);
  const widthOnPlan = axiomInput(cont(widthLabel, input.planSirkaCM, plan, unit), 2);
  const lengthOnPlan = axiomInput(cont(lengthLabel, input.planDelkaDM, plan, "dm"), 3);
  const dWidth = deduce(width, ctorUnit(unit));
  const meritko = deduce(
    dWidth,
    widthOnPlan,
    ctor("rate")
  );
  const lastMeritko = last(meritko);
  const dTree2 = deduce(
    deduce(lengthOnPlan, ctorUnit(unit)),
    lastMeritko
  );
  const ddSkutecnost = deduce(
    dTree2,
    dWidth,
    productCombine(`obsah`, { entity: skutecnost, unit: unit2D }, [lengthLabel, widthLabel])
  );
  const ddPlan = deduce(
    deduce(lengthOnPlan, ctorUnit(unit)),
    widthOnPlan,
    productCombine(`obsah`, { entity: plan, unit: unit2D }, [lengthLabel, widthLabel])
  );
  const dTree3 = deduce(
    ddSkutecnost,
    ddPlan,
    ctor("rate")
  );
  const templateBase = (highlight) => highlight`Půdorys domu má tvar obdélníku. 
    Šířka domu je ${input.sirkaM} metrů. 
    V plánu je tato šířka vyznačena úsečkou o délce ${input.planSirkaCM} cm. 
    Délka domu je v plánu zakreslena jako úsečka o délce ${input.planDelkaDM} dm.`;
  const template1 = (html) => html`<br/>
    <strong>Měřítko plánu je 1:1 000.</strong>`;
  const template2 = (html) => html`<br/>
    <strong>Skutečná délka domu je 20m.</strong>`;
  const template3 = (html) => html`<br/>
    <strong>Obsah obdélníku na plánu a obsah půdorysu domu jsou v poměru 1:100.</strong>`;
  return [
    { deductionTree: deduce(meritko, ctorBooleanOption(1e3)), template: (highlight) => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: deduce(deduce(dTree2, ctorUnit("m")), ctorBooleanOption(20)), template: (highlight) => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: deduce(dTree3, ctorBooleanOption(100)), template: (highlight) => highlight`${() => templateBase(highlight)}${template3}` }
  ];
}

// src/math/M9A-2024/dva-ctverce.ts
function example({ input }) {
  const dim2 = dimensionEntity();
  const ALabel = "strana obdeln\xEDk A";
  const BLabel = "strana obdeln\xEDk B";
  const bocniStrana = commonSense("bo\u010Dn\xED strany obou \u010Dtverc\u016F jsou schodn\xE9, horn\xED a spodn\xED strana obdeln\xEDku maj\xED rozd\xEDl 3");
  const rozdilObvod = axiomInput(contLength("obvod rozd\xEDl", 6), 1);
  const diffAbsolute = comp(ALabel, BLabel, input.rozdilObvod / 2, dim2.length.entity);
  const compRel = axiomInput(compRelative(ALabel, BLabel, 3 / 2), 2);
  const kratsiStran = deduce(
    to(rozdilObvod, bocniStrana, diffAbsolute),
    compRel
  );
  const delsiStrana = deduce(
    deduce(
      kratsiStran,
      compRel
    ),
    compRatio("del\u0161\xED strana obdeln\xEDk A", ALabel, 2)
  );
  const deductionTree = deduce(
    deduce(
      delsiStrana,
      counter("po\u010Det stran \u010Dtverce", 4),
      product("obvod \u010Dtverce")
    ),
    ctorOption("A", 40)
  );
  return { deductionTree };
}

// src/math/M9A-2024/kolo.ts
var entity = "K\u010D";
function example3({ input }) {
  const agentPercentBase = "cena";
  const agentPercentPart = "sleva";
  const entity3 = "K\u010D";
  const zlevneniPercent = axiomInput(percent(agentPercentBase, agentPercentPart, input.percentageDown), 2);
  const puvodniCena = axiomInput(cont(agentPercentBase, input.base, entity3), 1);
  const zdrazeniPercent = axiomInput(percent("cena po slev\u011B", "zdra\u017Eeno", input.percentageNewUp), 3);
  const cenaPoSleve = deduce(
    puvodniCena,
    deduce(puvodniCena, zlevneniPercent),
    ctorDifference("cena po slev\u011B")
  );
  const deductionTree = deduce(
    deduce(
      cenaPoSleve,
      deduce(
        last(cenaPoSleve),
        zdrazeniPercent
      ),
      sum("kone\u010Dn\xE1 cena")
    ),
    ctorOption("E", 19800)
  );
  const template = (highlightLabel) => highlightLabel`Kolo v obchodě stálo ${input.base.toLocaleString("cs-CZ")} Kč.
    Nejdříve bylo zlevněno o ${input.percentageDown} % z původní ceny.
    Po měsíci bylo zdraženo o ${input.percentageNewUp} % z nové ceny.
    ${(html) => html`<br/><strong>Jaká byla výsledná cena kola po zlevnění i zdražení?</strong>`}`;
  return { deductionTree, template };
}
function example1({ input }) {
  const template = (highlightLabel) => highlightLabel`
  Pan Novák si vypůjčil ${input.base.toLocaleString("cs-CZ")} Kč na jeden rok.
  Po roce vrátí věřiteli vypůjčenou částku, a navíc mu zaplatí úrok ve výši ${input.percentage} % z vypůjčené částky.
  Kolik korun celkem věřiteli vrátí?`;
  const vypujceno = axiomInput(cont("vyp\u016Fj\u010Deno", 2e4, entity), 1);
  const urok = axiomInput(percent("vyp\u016Fj\u010Deno", "\xFArok", 13.5), 2);
  const deductionTree = deduce(
    deduce(
      deduce(
        urok,
        vypujceno
      ),
      vypujceno,
      sum("vr\xE1ceno")
    ),
    ctorOption("A", 22700)
  );
  return { deductionTree, template };
}
function example2({ input }) {
  const template = (highlightLabel) => highlightLabel`
  Paní Dlouhá na začátku roku vložila do banky ${input.vlozeno.toLocaleString("cs-CZ")} Kč s roční úrokovou sazbou ${input.urokPercentage} %.
  Výnosy z úroků jsou zdaněny srážkovou daní.
  Kolik korun získá paní Dlouhá navíc ke svému vkladu za jeden rok, bude-li jí odečtena daň z úroků ${input.urokPercentage} %?`;
  const vlozeno = axiomInput(cont("vklad", input.vlozeno, entity), 1);
  const vynosPercent = axiomInput(percent("vklad", "v\xFDnos", input.urokPercentage), 2);
  const danPercent = axiomInput(percent("v\xFDnos", "da\u0148", input.danPercentage), 3);
  const vynos = deduce(vynosPercent, vlozeno);
  const deductionTree = deduce(
    deduce(
      vynos,
      deduce(danPercent, last(vynos))
    ),
    ctorOption("C", 21250)
  );
  return { deductionTree, template };
}

// src/math/M9A-2024/obrazec.ts
function example4({ input }) {
  const ramenoLabel = "rameno";
  const zakladnaLabel = "z\xE1kladna";
  const obvodLabel = "obvod troj\xFAheln\xEDku";
  const obvod = axiomInput(contLength(obvodLabel, 30), 1);
  const ramenoCount = axiomInput(counter("po\u010Det ramen", 4), 2);
  const zakladnaCount = axiomInput(counter("po\u010Det z\xE1kladen", 3), 3);
  const rameno = deduce(
    to(
      commonSense("rameno troj\xFAheln\xEDku je p\u016Fleno vrcholem jin\xE9ho troj\xFAheln\xEDku"),
      ratios(obvodLabel, [zakladnaLabel, ramenoLabel, ramenoLabel], [1, 2, 2])
    ),
    obvod
  );
  const zakladna = deduce(
    last(rameno),
    compRatio(ramenoLabel, zakladnaLabel, 2)
  );
  const deductionTree = deduce(
    deduce(
      deduce(
        rameno,
        ramenoCount,
        product("obvod obrazce (ramena)", ["d\xE9lka ramena", "po\u010Det stran"])
      ),
      deduce(
        zakladna,
        zakladnaCount,
        product("obvod obrazce (zakladny)", ["d\xE9lka z\xE1kladny", "po\u010Det stran"])
      ),
      sum("obvod obrazce")
    ),
    ctorOption("C", 66)
  );
  return { deductionTree };
}

// src/math/M9A-2024/svadleny.ts
function build7({ input }) {
  const agentPrevious = "p\u016Fvodn\xED zak\xE1zka";
  const agentCurrent = "nov\xE1 zak\xE1zka";
  const agentNew = "roz\u0161\xED\u0159en\xE1 nov\xE1 zak\xE1zka";
  const entityA = "\u0161vadlen";
  const entityB = "hodin";
  const aPrevious = axiomInput(cont(agentPrevious, input.previousWorker, entityA), 1);
  const aCurrent = axiomInput(cont(agentCurrent, input.currentWorker, entityA), 3);
  const bPrevious = axiomInput(cont(agentPrevious, input.previousHours, entityB), 2);
  const comp2 = compRatio(agentNew, agentCurrent, 3 / 2);
  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(
          aCurrent,
          aPrevious,
          ctor("comp-ratio")
        ),
        proportion(true, [`\u0161vadleny`, `hodiny`])
      ),
      bPrevious
    ),
    deduce(
      comp2,
      proportion(false, [`mno\u017Estv\xED`, `hodin`])
    )
  );
  const template = (highlight) => highlight`${input.previousWorker} švadlen, které šijí oblečení, pracují stejným tempem.
    Tyto švadleny splní danou zakázku za ${input.previousHours} hodin.
    Za jakou dobu splní o polovinu větší zakázku ${input.currentWorker} švadleny?`;
  return { deductionTree, template };
}

// src/math/M9A-2024/tanga.ts
function build8({ input }) {
  const radiusLabel = "polom\u011Br";
  const areaCircleLabel = "obsah kruhu";
  const baseCircleLabel = "obvod kruhu";
  const circelPartLabel = "b\xEDl\xE1 \u010Dtvrtkru\u017Enice";
  const rectangleLabel = "cel\xFD obdeln\xEDk";
  const reactangleHeight = `${rectangleLabel} v\xFD\u0161ka`;
  const width = axiomInput(contLength(`\u0161ed\xE1 tanga \u0161\xED\u0159ka`, input.tangaWidth), 1);
  const widthRectangle = axiomInput(contLength(`${rectangleLabel} \u0161\xED\u0159ka`, input.tangaWidth), 1);
  const ratio2 = compRatio(`\u0161ed\xE1 tanga \u0161\xED\u0159ka`, `${circelPartLabel} ${radiusLabel}`, 2);
  const dRadius = deduce(width, ratio2);
  const obsah = deduce(last(dRadius), circleArea(areaCircleLabel));
  const dd1 = deduce(
    deduce(
      widthRectangle,
      //commonSense(`${radiusLabel} = ${reactangleHeight}`),
      toCont(dRadius, { agent: reactangleHeight }),
      rectangleArea(`${rectangleLabel} obsah`)
    ),
    deduce(
      counter(circelPartLabel, 2),
      deduce(
        obsah,
        compRatio(areaCircleLabel, circelPartLabel, 4)
      ),
      product(`dvojice ${circelPartLabel}`)
    )
  );
  const obvod = deduce(last(dRadius), circleLength(baseCircleLabel));
  const obvodCvrtkruh = deduce(obvod, compRatio(baseCircleLabel, circelPartLabel, 4));
  const dd2 = deduce(
    deduce(
      obvodCvrtkruh,
      last(obvodCvrtkruh),
      width,
      sum(`obvod \u0161ed\xE9ho obrazce`)
    ),
    ctorRound()
  );
  return [{ deductionTree: dd1 }, { deductionTree: dd2 }];
}

// src/math/M9A-2024/tezitko.ts
function build9({ input }) {
  const agentOut = "\u010Dir\xE9 sklo";
  const agentIn = "modr\xE9 sklo";
  const outRadius = axiomInput(contLength(`${agentOut} podstava polom\u011Br`, input.out.radius), 1);
  const outHeight = axiomInput(contLength(`${agentOut} v\xE1lec v\xFD\u0161ka`, input.out.height), 2);
  const inRadius = axiomInput(contLength(`${agentIn} podstava polom\u011Br`, input.in.radius), 3);
  const inHeight = axiomInput(contLength(`${agentIn} v\xE1lec v\xFD\u0161ka`, input.in.height), 4);
  const outCylinder = deduce(outRadius, outHeight, cylinderVolume(`${agentOut} objem`));
  const inCylinder = deduce(inRadius, inHeight, cylinderVolume(`${agentIn} objem`));
  const deductionTree = deduce(
    outCylinder,
    inCylinder
  );
  const template = (highlight) => highlight`
  Skleněné těžítko má tvar rotačního válce s plolměrem podstavy ${input.out.radius} cm a výškou ${input.out.height} cm.
  Vnější část těžítka je z čirého skla, uvnitř je část z modrého skla,
  která má také tavr rotačního válce, a to s poloměrem podstavy ${input.in.radius} cm a výškou ${input.in.height} cm.
  ${(html) => html`
    <br /> 
    Vypočítejte objem čirého skla v těžítku. Výsledek zaokrouhlete na desítky cm <sup>3</sup>.`}`;
  return { deductionTree, template };
}

// src/math/M9A-2024/trida-skupiny.ts
function build10({ input }) {
  const skupinaEN = "angli\u010Dtina celkem";
  const skupinaDE = "n\u011Bm\u010Dina";
  const celkemAgent = "chlapc\u016F celkem";
  const entityChlapci = "chlapci";
  const entityDivky = "d\xEDvky";
  const entity3 = "";
  const chlapci = axiomInput(cont(celkemAgent, input.chlapci, entityChlapci), 1);
  const chlapciDiff = axiomInput(compDiff(celkemAgent, skupinaDE, input.anglictinaChlapci, entityChlapci), 2);
  const de = axiomInput(cont(skupinaDE, input.nemcinaDivky, entityDivky), 3);
  const dBase = deduce(
    deduce(
      chlapci,
      chlapciDiff
    ),
    de,
    sum(skupinaDE, { entity: entity3 })
  );
  const dTree1 = deduce(
    to(
      dBase,
      commonSense("angli\u010Dtina a n\u011Bm\u010Dina - stejn\xFD po\u010Det \u017E\xE1k\u016F"),
      cont(skupinaEN, input.chlapci - input.anglictinaChlapci + input.nemcinaDivky, entity3)
    ),
    compDiff(skupinaEN, entityDivky, input.anglictinaChlapci, entity3)
  );
  const dTree2 = to(
    dBase,
    commonSense("angli\u010Dtina a n\u011Bm\u010Dina - stejn\xFD po\u010Det \u017E\xE1k\u016F"),
    cont("t\u0159\xEDda", (input.chlapci - input.anglictinaChlapci + input.nemcinaDivky) * 2, entity3)
  );
  const templateBase = (highlight) => highlight`Žáci třídy 8.B se dělí na dvě skupiny podle toho, zda chodí na němčinu nebo angličtinu.
     V obou skupinách je stejný počet žáků. Ve třídě je ${input.chlapci} chlapců a ${input.anglictinaChlapci} z nich chodí na angličtinu.
    Na němčinu chodí ${input.nemcinaDivky} dívky.`;
  const template1 = (html) => html`<br/>
    <strong>Kolik dívek celkem chodí na angličtinu?</strong>`;
  const template2 = (html) => html`<br/>
    <strong>Kolik má třída 8.B celkem žáků?</strong>`;
  return [
    { deductionTree: dTree1, template: (highlight) => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: (highlight) => highlight`${() => templateBase(highlight)}${template2}` }
  ];
}

// src/math/M9A-2024/index.ts
var tridaSkupinyParams = {
  input: {
    chlapci: 14,
    anglictinaChlapci: 5,
    nemcinaDivky: 4
  }
};
var dumMeritkoParams = {
  input: {
    sirkaM: 10,
    planSirkaCM: 10,
    planDelkaDM: 2
  }
};
var M9A_2024_default = createLazyMap({
  1: () => build7({ input: { currentWorker: 4, previousWorker: 5, previousHours: 24 } }),
  2: () => build9({
    input: {
      out: {
        radius: 10,
        height: 12
      },
      in: {
        radius: 5,
        height: 8
      }
    }
  }),
  6.1: () => lichobeznik().obsah,
  6.2: () => lichobeznik().rameno,
  7.1: () => build10(tridaSkupinyParams)[0],
  7.2: () => build10(tridaSkupinyParams)[1],
  8.1: () => build8({ input: { tangaWidth: 20 } })[0],
  8.2: () => build8({ input: { tangaWidth: 20 } })[1],
  11: () => rozdilUhlu({ input: { delta: 107, beta: 23 } }),
  12: () => example4({ input: { obvod: 30 } }),
  13: () => example({ input: { rozdilObvod: 6, obdelnikCtvAStrana: 1 / 2, obdelnikCtvBStrana: 1 / 5 } }),
  14: () => neznama().alternative1,
  15.1: () => build6(dumMeritkoParams)[0],
  15.2: () => build6(dumMeritkoParams)[1],
  15.3: () => build6(dumMeritkoParams)[2],
  16.1: () => example1({ input: { base: 2e4, percentage: 13.5 } }),
  16.2: () => example2({ input: { vlozeno: 1e6, urokPercentage: 2.5, danPercentage: 15 } }),
  16.3: () => example3({ input: { base: 2e4, percentageDown: 10, percentageNewUp: 10 } })
});
function neznama() {
  const polovina = compRatio("polovina", "nezn\xE1m\xE9 \u010D\xEDslo", 1 / 2);
  return {
    alternative1: {
      deductionTree: deduce(
        deduce(
          deduce(
            compRatio("dvojn\xE1sobek", "nezn\xE1m\xE9 \u010D\xEDslo", 2),
            polovina,
            ctorDifference("rozd\xEDl")
          ),
          counter("rozd\xEDl", 135)
        ),
        ctorOption("D", 90)
      )
    },
    alternative2: {
      deductionTree: deduce(
        deduce(
          deduce(
            compRatio("dvojn\xE1sobek", "nezn\xE1m\xE9 \u010D\xEDslo", 2),
            polovina
          ),
          comp("dvojn\xE1sobek", "polovina", 135, "")
        ),
        polovina
      )
    }
  };
}
function lichobeznik() {
  const dim2 = dimensionEntity();
  const zakladna1 = contLength("spodn\xED z\xE1kladna - AB", 40);
  const zakladna2 = contLength("horn\xED z\xE1kladna - DC", 28);
  const vyska = deduce(
    zakladna1,
    contLength("AC", 41),
    pythagoras("AC", ["AB", "strana BC = v\xFD\u0161ka"])
  );
  const rozdilZakladen = deduce(
    zakladna1,
    zakladna2,
    ctorDifference("rozd\xEDl z\xE1kladen")
  );
  return {
    obsah: {
      deductionTree: deduce(
        deduce(
          vyska,
          zakladna2,
          rectangleArea("obdeln\xEDk")
        ),
        deduce(
          rozdilZakladen,
          vyska,
          triangleArea("troj\xFAheln\xEDk")
        ),
        sum("lichob\u011B\u017En\xEDk")
      )
    },
    rameno: {
      deductionTree: deduce(
        vyska,
        rozdilZakladen,
        pythagoras("AD", ["strana BC = v\xFD\u0161ka", "rozd\xEDl z\xE1kladen"])
      )
    }
  };
}

// src/math/M9B-2024/index.ts
var M9B_2024_default = createLazyMap({
  1: () => delkaKroku(),
  2: () => AdamAOta(),
  6.1: () => ctyruhelnik().obsah,
  6.2: () => ctyruhelnik().obvod,
  7.1: () => modely().druhyRok,
  7.2: () => modely().tretiRok,
  8.1: () => kruhy().osmyObrazec,
  8.2: () => kruhy().tmaveKruhy,
  11: () => hracka(),
  12: () => pekar(),
  13: () => uhlyTrojuhelniku(),
  14: () => pulkruh(),
  15.1: () => graf().stejnyPocet,
  15.2: () => graf().ceskyJazyk,
  15.3: () => graf().matika,
  16.1: () => procenta4().lyzarskyPobyt,
  16.2: () => procenta4().cenaUcebnice,
  16.3: () => procenta4().darek
});
function delkaKroku() {
  const entityBase = "krok";
  const dim2 = dimensionEntity();
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          rate("Josef", 75, dim2.length, entityBase),
          cont("Josef", 1e4, entityBase)
        ),
        deduce(
          rate("Na\u010Fa", 60, dim2.length, entityBase),
          cont("Na\u010Fa", 1e4, entityBase)
        )
      ),
      ctorUnit("km")
    )
  };
}
function AdamAOta() {
  const entity3 = "d\xE9lka";
  const unit = "m";
  const adam1 = cont("Adam 1.\u010D\xE1st", 40, entity3, unit);
  const adam2 = cont("Adam 2.\u010D\xE1st", 30, entity3, unit);
  return {
    deductionTree: deduce(
      deduce(
        adam1,
        adam2,
        ctorSlide("Adam")
      ),
      deduce(
        adam1,
        adam2,
        pythagoras("Ota", ["Adam 1.\u010D\xE1st", "Adam 2.\u010D\xE1st"])
      ),
      ctorComparePercent()
    )
  };
}
function ctyruhelnik() {
  const dim2 = dimensionEntity();
  const AD = contLength("AD", 17);
  const BD = contLength("BD", 8);
  const AB = deduce(
    AD,
    BD,
    pythagoras("AD", ["BD", "AB"])
  );
  const CD = toCont(
    deduce(
      deduce(
        contArea("troj\xFAheln\xEDk BCD", 24),
        ...doubleProduct("obdeln\xEDk")
      ),
      BD,
      ctor("quota")
    ),
    { agent: "CD", entity: dim2.length }
  );
  return {
    obsah: {
      deductionTree: deduce(
        deduce(
          AB,
          BD,
          triangleArea("ABD")
        ),
        contArea("troj\xFAheln\xEDk BCD", 24),
        sum("lichob\u011B\u017En\xEDku ABCD")
      )
    },
    obvod: {
      deductionTree: deduce(
        AB,
        CD,
        deduce(last(CD), BD, pythagoras("BC", ["BD", "CD"])),
        AD,
        sum("obvod lichob\u011B\u017En\xEDku ABCD")
      )
    }
  };
}
function modely() {
  const prvniRokLabel = "Petr 1. rok";
  const druhyRokLabel = "Petr 2. rok";
  const tretiRokLabel = "Petr 3. rok";
  const prvniDvaRokyLabel = "Petr dohromady za dva roky";
  const entity3 = "model";
  const prvniRok = cont(prvniRokLabel, "x", "model");
  const prvniDruhyComp = compRatio(druhyRokLabel, prvniRokLabel, 3 / 2);
  return {
    druhyRok: {
      deductionTree: deduce(prvniRok, prvniDruhyComp)
    },
    tretiRok: {
      deductionTree: deduce(
        deduce(
          cont("Petr celkem za 3 roky", 217, entity3),
          cont(tretiRokLabel, 72, entity3),
          ctorDifference(prvniDvaRokyLabel)
        ),
        prvniDruhyComp
      )
    }
  };
}
function hracka() {
  const entity3 = "korun";
  const hrackaPuvodniCenaLabel = "hra\u010Dka p\u016Fvodn\xED cena";
  const hrackaPoZdrazeniLabel = "hra\u010Dka cena po zdra\u017Een\xED";
  const hracka2 = cont(hrackaPuvodniCenaLabel, 250, entity3);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          hracka2,
          compRelativePercent(hrackaPoZdrazeniLabel, hrackaPuvodniCenaLabel, 40)
        ),
        compRelativePercent("kone\u010Dn\xE1 cena", hrackaPoZdrazeniLabel, -40)
      ),
      ctorOption("B", 210)
    )
  };
}
function pekar() {
  const labelSmall = "mal\xE9";
  const labelBig = "velk\xE9";
  const entityBase = "kol\xE1\u010Dky";
  const entity3 = "korun";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          toPredicate(deduce(
            cont(labelBig, 30, entity3),
            compRelative(labelBig, labelSmall, 1 / 2)
          ), (node) => ({ kind: "rate", agent: "prod\xE1no", quantity: node.quantity, entity: { entity: entity3 }, entityBase: { entity: entityBase }, baseQuantity: 1 })),
          cont("prod\xE1no", 3600, entity3)
        ),
        deduce(
          ratio("p\u0159ivezeno", "neprod\xE1no", 1 / 10),
          ctorComplement("prod\xE1no")
        )
      ),
      ctorOption("C", 200)
    )
  };
}
function pulkruh() {
  const dim2 = dimensionEntity();
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          to(
            commonSense("\u010Dtvercov\xE1 s\xED\u0165 4x4 s \u010Dtvercem o velikost\xED 2 cm"),
            commonSense("vepsan\xFD kruh ve \u010Dtvercov\xE9 s\xEDti"),
            contLength("polom\u011Br (r)", 4)
          ),
          circleArea("vepsan\xFD kruh")
        ),
        half(),
        ctorScale("\u0161ed\xFD p\u016Flkruh")
      ),
      ctorOption("D", 25.12)
    )
  };
}
function graf() {
  const entityGirls = "d\xEDvky";
  const entityBoys = "chlapci";
  const entity3 = "d\u011Bti";
  const matika = "M";
  const cestina = "\u010Cj";
  const ang = "Aj";
  const telak = "Tv";
  const vytvarka = "Vv";
  const matikaChlapci = cont(matika, 7, entityBoys);
  const matikaDivky = cont(matika, 4, entityGirls);
  const cestinaChlapci = cont(cestina, 2, entityBoys);
  const cestinaDivky = cont(cestina, 6, entityGirls);
  const chlapci = deduce(
    matikaChlapci,
    cestinaChlapci,
    cont(ang, 5, entityBoys),
    cont(telak, 7, entityBoys),
    cont(vytvarka, 4, entityBoys),
    sum("celkem chlapci", { entity: entity3 })
  );
  const divky = deduce(
    matikaDivky,
    cestinaDivky,
    cont(ang, 8, entityGirls),
    cont(telak, 5, entityGirls),
    cont(vytvarka, 2, entityGirls),
    sum("celkem d\xEDvky", { entity: entity3 })
  );
  return {
    stejnyPocet: {
      deductionTree: deduce(
        deduce(
          chlapci,
          divky
        ),
        ctorBooleanOption(0)
      )
    },
    ceskyJazyk: {
      deductionTree: deduce(
        deduce(
          deduce(
            cestinaChlapci,
            cestinaDivky,
            sum(`celkem ${cestina}`)
          ),
          deduce(
            last(chlapci),
            last(divky),
            sum("celkem")
          ),
          ctorPercent()
        ),
        ctorBooleanOption(16, "greater", { asPercent: true })
      )
    },
    matika: {
      deductionTree: deduce(
        deduce(
          matikaChlapci,
          matikaDivky,
          ctorComparePercent()
        ),
        ctorBooleanOption(75, "closeTo", { asPercent: true })
      )
    }
  };
}
function uhlyTrojuhelniku() {
  const uhelUVrcholu = (vrchol, typUhel) => `vrchol ${vrchol} - ${typUhel}`;
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            contAngle(uhelUVrcholu("A", "zn\xE1m\xFD vn\u011Bj\u0161\xED"), 105),
            compAngle(uhelUVrcholu("A", "dopo\u010Dten\xFD"), uhelUVrcholu("A", "zn\xE1m\xFD"), "supplementary")
          ),
          deduce(
            contAngle(uhelUVrcholu("C", "zn\xE1m\xFD vn\u011Bj\u0161\xED"), 125),
            compAngle(uhelUVrcholu("C", "dopo\u010Dten\xFD vnit\u0159n\xED"), uhelUVrcholu("C", "zn\xE1m\xFD"), "supplementary")
          ),
          triangleAngle(uhelUVrcholu("B", "dopo\u010Dten\xFD vnit\u0159n\xED"))
        ),
        compAngle(uhelUVrcholu("B", "dopo\u010Dten\xFD vnit\u0159n\xED"), uhelUVrcholu("C", anglesNames.alpha), "complementary")
      ),
      ctorOption("D", 40)
    )
  };
}
function kruhy() {
  const entity3 = "b\xEDl\xFD kruh";
  const position = "pozice";
  return {
    osmyObrazec: {
      deductionTree: deduceAs("vzor opakov\xE1n\xED, resp. po\u010Det b\xEDl\xFDch kruh\u016F je z\xE1visl\xFD na pozici = n * n, kde n je pozice")(
        cont("8. obrazec", 8, position),
        evalExprAsCont("n * n", "8. obrazec", { entity: entity3 })
      )
    },
    tmaveKruhy: {
      deductionTree: deduceAs("po\u010Det tmav\xFDch kruh\u016F je roven po\u010Dtu b\xEDl\xFDch kruh\u016F v p\u0159edch\xE1zej\xEDc\xEDm obrazci")(
        to(
          cont("obrazec", 361, entity3),
          commonSense("vzor opakov\xE1n\xED, resp. po\u010Det b\xEDl\xFDch kruh\u016F je z\xE1visl\xFD na pozici = n * n, kde n je pozice"),
          cont("obrazec", 19, position)
        ),
        cont("n\xE1sleduj\xEDc\xED obrazec", 1, position),
        ctorSlide("hledan\xFD obrazec")
      )
    }
  };
}
function procenta4() {
  const entity3 = "korun";
  const entityEUR = "euro";
  const entityPercent2 = "%";
  const doprava = cont("doprava", 10, entityPercent2);
  const ubytko = cont("ubytov\xE1n\xED", 60, entityPercent2);
  return {
    lyzarskyPobyt: {
      deductionTree: deduce(
        deduceAs("zbytek do celku")(
          cont("celek", 100, entityPercent2),
          deduce(
            doprava,
            ubytko,
            sum("doprava + ubytov\xE1n\xED")
          ),
          ctorDifference("l\xEDstek")
        ),
        ctorOption("D", 30)
      )
    },
    cenaUcebnice: {
      deductionTree: deduce(
        deduce(
          cont("nov\u011B", 1500, entity3),
          cont("p\u016Fvodn\u011B", 2e3, entity3),
          ctorComparePercent()
        ),
        ctorOption("C", 25, { asPercent: true })
      )
    },
    darek: {
      deductionTree: deduce(
        deduce(
          cont("d\xE1rek", 40, entityEUR),
          cont("vym\u011Bn\u011Bno", 200, entityEUR),
          ctorPercent()
        ),
        ctorOption("B", 20, { asPercent: true })
      )
    }
  };
}

// src/math/M9C-2024/pocet-obyvatel.ts
function build11({ input }) {
  const rozdil = input.celkem - input.jihlavaPlus;
  const halfTotal = Math.round(rozdil / 2);
  const jihlava = "Jihlava";
  const trebic = "T\u0159eb\xED\u010D";
  const data = [{ value: halfTotal, agent: jihlava }, { value: halfTotal, agent: trebic }, { value: input.jihlavaPlus, agent: jihlava, opacity: 0.6 }];
  const celkem = "Jihlava a T\u0159eb\xED\u010D";
  const entity3 = "obyvatel";
  const total = axiomInput(cont(celkem, input.celkem, entity3), 1);
  const diffComp = axiomInput(comp(jihlava, trebic, input.jihlavaPlus, entity3), 2);
  const deductionTree = deduce(
    total,
    diffComp,
    ctor("comp-part-eq")
  );
  const template = (highlight) => highlight`Města Jihlava a Třebíč mají dohromady ${input.celkem.toLocaleString("cs-CZ")} obyvatel.
    Jihlava má o ${input.jihlavaPlus.toLocaleString("cs-CZ")} více.
  ${(html) => html`<br/>
    <strong> Kolik obyvatel má Třebíč?</strong>`}`;
  return { deductionTree, data, template };
}

// src/math/M9C-2024/sourozenci.ts
function build12({ input }) {
  const percentValue = (input.zbyvaNasporit + input.michalPlus) / (100 - input.evaPodil * 2);
  const data = [
    { agent: "Eva", value: input.evaPodil * percentValue },
    { agent: "Michal", value: input.evaPodil * percentValue },
    { agent: "Michal", opacity: 0.5, value: input.michalPlus },
    { agent: "zbyva", value: input.zbyvaNasporit }
  ];
  const entity3 = "K\u010D";
  const zbyva = cont("zb\xFDv\xE1", input.zbyvaNasporit, entity3);
  const michalPlus = cont("Michal+", input.michalPlus, entity3);
  const penize2 = sum("Michal+zb\xFDv\xE1");
  const eva = cont("Eva", input.evaPodil, "%");
  const michal = cont("Michal", input.evaPodil, "%");
  const spolecne = sum("Eva + Michal");
  const celek = cont("celek", 100, "%");
  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(
          deduce(eva, michal, spolecne),
          celek,
          ctor("ratio")
        ),
        ctorComplement("Michal+zb\xFDv\xE1")
      ),
      deduce(michalPlus, zbyva, penize2)
    ),
    ctorOption("C", 480)
  );
  const template = (highlight) => highlight`
  Dva sourozenci Eva a Michal šetří ${"spole\u010Dn\u011B"} na dárek pro rodiče.
  Eva našetřila ${input.evaPodil} % potřebné částky, Michal o ${input.michalPlus} korun více než Eva.
  Sourozencům zbývá našetřit ${input.zbyvaNasporit} korun.
  ${(html) => html`<br/><strong> Kolik korun stojí dárek?</strong>`}`;
  return { deductionTree, data, template };
}

// src/math/M9C-2024/index.ts
var M9C_2024_default = createLazyMap({
  1: () => build11({ input: { celkem: 86200, jihlavaPlus: 16e3 } }),
  2: () => nadoby(),
  6.1: () => lichobeznik2().vyska,
  6.2: () => lichobeznik2().obsah,
  8.1: () => uhly4().a,
  8.2: () => uhly4().b,
  7.1: () => zahon2().obvodKruhoveho,
  7.2: () => zahon2().polomerCtvrtkruhovy,
  11: () => krychle(),
  12: () => build12({ input: { evaPodil: 40, michalPlus: 24, zbyvaNasporit: 72 } }),
  13: () => divadlo(),
  14: () => triKamaradi(),
  15.1: () => pruzkum().umelecka,
  15.2: () => pruzkum().devataTrida,
  15.3: () => pruzkum().rovnost,
  16.1: () => zednici().pocetDnu,
  16.2: () => zednici().pocetZedniku,
  16.3: () => zednici().pocetDnuPolovinaStavby
});
function uhly4() {
  const dvojiceUhlu = [anglesNames.alpha, anglesNames.gamma];
  const beta = deduce(
    contAngle("zadan\xFD u vrcholu B", 130),
    compAngle("zadan\xFD u vrcholu B", anglesNames.beta, "supplementary")
  );
  const sumDvojiceUhlu = deduce(
    contTringleAngleSum(),
    beta,
    ctorDifference(dvojiceUhlu.join(" a "))
  );
  const gamma2 = deduce(
    sumDvojiceUhlu,
    ratios(dvojiceUhlu.join(" a "), dvojiceUhlu, [2, 3]),
    nthPart(anglesNames.gamma)
  );
  return {
    a: {
      deductionTree: gamma2
    },
    b: {
      deductionTree: deduce(
        deduce(
          last(sumDvojiceUhlu),
          last(gamma2),
          ctorDifference(anglesNames.alpha)
        ),
        last(beta)
      )
    }
  };
}
function nadoby() {
  const dim2 = dimensionEntity();
  const vyskaA = cont("n\xE1doba A", 20, "v\xFD\u0161ka", dim2.length.unit);
  const vyskaB = cont("n\xE1doba B", 20, "v\xFD\u0161ka", dim2.length.unit);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            deduce(
              contLength("pr\u016Fm\u011Br n\xE1doba B", 20),
              ...halfProduct("polom\u011Br n\xE1doba B")
            ),
            vyskaB,
            cylinderVolume("n\xE1doba B")
          ),
          deduce(
            deduce(
              contLength("pr\u016Fm\u011Br n\xE1doba A", 10),
              ...halfProduct("polom\u011Br n\xE1doba A")
            ),
            vyskaA,
            cylinderVolume("n\xE1doba A")
          ),
          ctor("comp-ratio")
        ),
        proportion(true, ["zapln\u011Bn\xED objemu n\xE1doby", "dosa\u017Een\xE1 v\xFD\u0161ka v n\xE1dob\u011B"])
      ),
      vyskaA
    )
  };
}
function lichobeznik2() {
  const dim2 = dimensionEntity();
  const triangleABC = "troj\xFAhlen\xEDk ABC";
  const triangleACD = "troj\xFAhlen\xEDk ACD";
  const lichobeznik3 = "lichob\u011B\u017En\xEDk ABCD";
  const obsahABC = contArea(triangleABC, 64);
  const vyska = deduce(
    obsahABC,
    contLength(`stran AB ${triangleABC}`, 16),
    evalFormulaAsCont(formulaRegistry.surfaceArea.triangle, (x) => x.h, `v\xFD\u0161ka ${lichobeznik3}`, dim2.length)
  );
  return {
    vyska: {
      deductionTree: vyska
    },
    obsah: {
      deductionTree: deduce(
        deduce(
          contLength(`strana CD ${triangleACD}`, 6),
          last(vyska),
          triangleArea(triangleACD)
        ),
        obsahABC,
        sum(`celkem ${lichobeznik3}`)
      )
    }
  };
}
function zahon2() {
  const dim2 = dimensionEntity();
  return {
    obvodKruhoveho: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              contArea("kruhov\xFD z\xE1hon", 314, "dm2"),
              evalFormulaAsCont(formulaRegistry.surfaceArea.circle, (x) => x.r, "polom\u011Br", { entity: dim2.length.entity, unit: "dm" })
            ),
            circleLength("obvod", "dm")
          ),
          ctorUnit("m")
        ),
        ctorRound()
      )
    },
    polomerCtvrtkruhovy: {
      deductionTree: deduce(
        deduce(
          deduce(
            contArea("\u010Dtvrtkruh", 314, "dm2"),
            ratio("cel\xFD kruh", "\u010Dtvrtkruh", 1 / 4)
          ),
          evalFormulaAsCont(formulaRegistry.surfaceArea.circle, (x) => x.r, "polom\u011Br", { entity: dim2.length.entity, unit: "dm" })
        ),
        ctorUnit("m")
      )
    }
  };
}
function divadlo() {
  const pocetMista = "m\xEDst";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          percent("divadlo", "obsazenost nov\u011B", 75),
          percent("divadlo", "obsazenost p\u016Fvodn\u011B", 70),
          ctorDifference("zm\u011Bna obsazenosti")
        ),
        cont("zm\u011Bna obsazenosti", 11, pocetMista)
      ),
      ctorOption("D", 220)
    )
  };
}
function triKamaradi() {
  const entity3 = "komiks";
  const petrVsCyril = comp("Petr", "Cyril", 3, entity3);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          petrVsCyril,
          deduce(
            compRatio("Petr", "Honza", 1),
            compRelative("Honza", "Cyril", 1 / 8)
          )
        ),
        petrVsCyril
      ),
      ctorOption("E", 27)
    )
  };
}
function zednici() {
  const dnyEntity = "dny";
  const pocetZednikuEntity = "zedn\xEDci";
  const pocetZednikuPuvodne = cont("pr\xE1ce p\u016Fvodn\u011B", 10, pocetZednikuEntity);
  const pocetZednikuNove = cont("pr\xE1ce nov\u011B", 4, pocetZednikuEntity);
  const dnyPuvodne = cont("pr\xE1ce p\u016Fvodn\u011B", 20, dnyEntity);
  const dnyNove = cont("pr\xE1ce nov\u011B", 5, dnyEntity);
  const indirect = proportion(true, [pocetZednikuEntity, dnyEntity]);
  return {
    pocetDnu: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              pocetZednikuNove,
              pocetZednikuPuvodne,
              ctor("comp-ratio")
            ),
            indirect
          ),
          dnyPuvodne
        ),
        ctorOption("E", 50)
      )
    },
    pocetZedniku: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              dnyNove,
              dnyPuvodne,
              ctor("comp-ratio")
            ),
            indirect
          ),
          pocetZednikuPuvodne
        ),
        ctorOption("D", 40)
      )
    },
    pocetDnuPolovinaStavby: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              cont("pr\xE1ce nov\u011B", 8, pocetZednikuEntity),
              pocetZednikuPuvodne,
              ctor("comp-ratio")
            ),
            indirect
          ),
          deduceAs("polovina stavby odpov\xEDd\xE1 polovin\u011B pr\xE1ce p\u016Fvodn\u011B")(
            dnyPuvodne,
            ...halfProduct("pr\xE1ce p\u016Fvodn\u011B")
          )
        ),
        ctorOption("B", 12.5)
      )
    }
  };
}
function krychle() {
  const dim2 = dimensionEntity();
  const celaStrana = contLength("strana krychle", 3, "dm");
  const unit = "dm2";
  const entity3 = { entity: dim2.area.entity, unit };
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            celaStrana,
            evalExprAsCont("1/2*a^2 + a^2", "horn\xED plochy", entity3)
          ),
          deduce(
            celaStrana,
            evalExprAsCont("1/2*a^2 + a^2", "doln\xED plochy", entity3)
          ),
          deduce(
            celaStrana,
            evalExprAsCont("a^2 + 1/2*a^2 +  1/2*a^2", "bo\u010Dn\xED plochy", entity3)
          ),
          deduce(
            celaStrana,
            evalExprAsCont("1/2*a^2 +  1/2*a^2", "p\u0159edn\xED plochy", entity3)
          ),
          deduce(
            celaStrana,
            evalExprAsCont("1/2*a^2 +  1/2*a^2", "zadn\xED plochy", entity3)
          ),
          sum("nov\xE9 t\u011Bleso")
        ),
        deduce(
          celaStrana,
          cubeArea("krychle", unit)
        )
      ),
      ctorOption("B", 9)
    )
  };
}
function pruzkum() {
  const entityPercent2 = "%";
  const entity3 = "\u017E\xE1k";
  const whole = "v\u0161ichni \u017E\xE1ci";
  const umeleckeZaci = cont("um\u011Bleck\xE9", 3, entity3);
  const gymZaci = cont("GYM", 12, entity3);
  const vsichniZaci = deduce(
    deduce(
      toPredicate(deduce(
        cont("SO\u0160", 60, entityPercent2),
        cont("SOU", 16, entityPercent2),
        sum("dohromady SO\u0160 a SOU")
      ), (d) => percent(whole, "dohromady SO\u0160 a SOU", d.quantity)),
      ctorComplement("GYM")
    ),
    gymZaci
  );
  return {
    umelecka: {
      deductionTree: deduce(
        deduce(
          umeleckeZaci,
          vsichniZaci,
          ctorPercent()
        ),
        ctorBooleanOption(6, "closeTo", { asPercent: true })
      )
    },
    devataTrida: {
      deductionTree: deduce(
        last(vsichniZaci),
        ctorBooleanOption(50, "greater")
      )
    },
    rovnost: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              last(vsichniZaci),
              percent(whole, "SO\u0160", 60)
            ),
            deduce(
              umeleckeZaci,
              cont("technick\xE9", 15, entity3),
              sum("dohromady um\u011Bleck\xE9 a technick\xE9")
            ),
            ctorDifference("humanitn\xED")
          ),
          gymZaci
        ),
        ctorBooleanOption(0, "closeTo")
      )
    }
  };
}

// src/math/M9D-2024/index.ts
var M9D_2024_default = createLazyMap({
  1: () => trasa(),
  2: () => reproduktory(),
  6.1: () => rychlik().vagon,
  6.2: () => rychlik().mista,
  7.1: () => obedy().cenaB,
  7.2: () => obedy().cenaC,
  8.1: () => kratochvilova().zamestnani,
  8.2: () => kratochvilova().sport,
  11: () => obchod2(),
  12: () => knizniSerie(),
  13: () => brambory(),
  // 14: () => uhly(),
  15.1: () => jablka().stejnaMnozstvi,
  15.2: () => jablka().jenLevnejsi,
  15.3: () => jablka().nejviceKilogramu,
  16.1: () => procenta5().neznameCislo,
  16.2: () => procenta5().zlomky,
  16.3: () => procenta5().cerpadla
});
function trasa() {
  const dim2 = dimensionEntity();
  const baseEntity = "krok";
  const adam = "Adam";
  const nada = "Na\u010Fa";
  const trasaKm = contLength("trasa", 2.7, "km");
  const trasa2 = deduce(
    trasaKm,
    ctorUnit("cm")
  );
  return {
    deductionTree: deduce(
      toCont(deduce(
        trasa2,
        rate(nada, 60, dim2.length, baseEntity)
      ), { agent: nada }),
      toCont(deduce(
        rate(adam, 75, dim2.length, baseEntity),
        last(trasa2)
      ), { agent: adam }),
      ctor("comp")
    )
  };
}
function reproduktory() {
  const puvodne = "p\u016Fvodn\u011B";
  const novePoSleve1 = "p\u0159ed V\xE1noci";
  const novePoSleve2 = "po V\xE1noc\xEDch";
  const entity3 = "korun";
  const zlevneni1 = comp(novePoSleve1, puvodne, -150, entity3);
  const zlevneni2 = comp(novePoSleve2, novePoSleve1, -200, entity3);
  const puvodniCena = deduce(
    compRelativePercent(novePoSleve1, puvodne, -15),
    zlevneni1
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          puvodniCena,
          zlevneni1
        ),
        zlevneni2
      ),
      puvodniCena,
      ctorComparePercent()
    )
  };
}
function rychlik() {
  const trida1 = "1.t\u0159\xEDda";
  const trida2 = "2.t\u0159\xEDda";
  const entityBase = "vag\xF3n";
  const kupeEntity = "kup\xE9";
  const mistaEntity = "m\xEDsta k sezen\xED";
  const kupeRate = rate("vlak", 10, kupeEntity, entityBase);
  const trida1Mista = rate(trida1, 6, mistaEntity, kupeEntity);
  const trida2Mista = rate(trida2, 8, mistaEntity, kupeEntity);
  const celkem = cont("vlak", 440, mistaEntity);
  const vagonTrida1 = deduce(
    kupeRate,
    trida1Mista,
    ctorRate(trida1)
  );
  const vagonTrida2 = deduce(
    kupeRate,
    trida2Mista,
    ctorRate(trida1)
  );
  const vlakTrida2 = deduce(
    deduce(
      deduce(
        deduce(
          compRatio(trida2, trida1, 2),
          ctorRatios("vlak")
        ),
        vagonTrida1,
        nthPartScale(trida1)
      ),
      vagonTrida2,
      nthPartScale(trida2)
    ),
    celkem,
    nthPart(trida2)
  );
  return {
    vagon: {
      deductionTree: deduce(
        vlakTrida2,
        vagonTrida2
      )
    },
    mista: {
      deductionTree: deduce(
        celkem,
        last(vlakTrida2),
        ctorDifference(`vlak ${trida1}`)
      )
    }
  };
}
function kratochvilova() {
  const den = cont("v\u0161echny denn\xED \u010D\xEDnnosti", 24, "\u010Das", "h");
  return {
    zamestnani: {
      deductionTree: deduce(
        percent("v\u0161echny denn\xED \u010D\xEDnnosti", "zam\u011Bstn\xE1n\xED", 25),
        den
      )
    },
    sport: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              percent("v\u0161echny denn\xED \u010D\xEDnnosti", "voln\xFD \u010Das", 10),
              den
            ),
            percent("voln\xFD \u010Das", "sport", 40)
          ),
          ctorUnit("min")
        ),
        ctorRound()
      )
    }
  };
}
function obchod2() {
  const entity3 = "tri\u010Dka";
  const damska = "d\xE1msk\xE1";
  const panska = "p\xE1nsk\xE1";
  const damskaZCelkem = percent("celkem naskladn\u011Bno", `${damska} naskladn\u011Bno`, 60);
  const damskaProdano = cont(`${damska} prod\xE1no`, 45, entity3);
  const damskaNaskladneno = deduce(
    ratio(`${damska} naskladn\u011Bno`, `${damska} prod\xE1no`, 1 / 4),
    damskaProdano
  );
  const celkem = deduce(
    damskaNaskladneno,
    damskaZCelkem
  );
  return {
    deductionTree: deduce(
      deduce(
        celkem,
        deduce(
          deduce(
            deduce(
              last(celkem),
              deduce(
                damskaZCelkem,
                ctorComplement(`${panska} naskladn\u011Bno`)
              )
            ),
            ratio(`${panska} naskladn\u011Bno`, `${panska} prod\xE1no`, 1 / 2)
          ),
          damskaProdano,
          sum("celkem prod\xE1no")
        ),
        ctorDifference("neprod\xE1no")
      ),
      ctorExpressionOption("A", "x < 200")
    )
  };
}
function obedy() {
  const entity3 = "cena";
  const entityBase = "ob\u011Bd";
  const rateA = deduce(
    cont("A", 4e3, entity3),
    cont("A", 20, entityBase),
    ctor("rate")
  );
  const rateB = deduce(
    deduce(
      cont("B", 4800, entity3),
      deduce(
        cont("A", 10, entityBase),
        rateA
      ),
      ctorDifference("B")
    ),
    cont("B", 10, entityBase),
    ctor("rate")
  );
  return {
    cenaB: {
      deductionTree: rateB
    },
    cenaC: {
      deductionTree: deduce(
        deduce(
          cont("C", 5400, entity3),
          deduce(
            deduce(
              cont("A", 5, entityBase),
              last(rateA)
            ),
            deduce(
              cont("B", 5, entityBase),
              last(rateB)
            ),
            sum("A a B")
          ),
          ctorDifference("C")
        ),
        cont("C", 10, entityBase),
        ctor("rate")
      )
    }
  };
}
function brambory() {
  const agent = "\u0161krab\xE1n\xED brambor";
  const entityCas = "\u010Das";
  const hmotnost = { entity: "hmotnost", unit: "kg" };
  const maminkaCas = deduce(
    deduce(
      cont(agent, 2, entityCas, "h"),
      ctorUnit("min")
    ),
    cont(agent, 24, entityCas, "min"),
    sum(agent)
  );
  const babickaCas = deduce(
    deduce(
      cont(agent, 1, entityCas, "h"),
      ctorUnit("min")
    ),
    cont(agent, 20, entityCas, "min"),
    sum(agent)
  );
  const maminka = cont(agent, 6, hmotnost.entity, hmotnost.unit);
  const babicka = cont(agent, 2, hmotnost.entity, hmotnost.unit);
  const maminkaRate = deduce(
    maminkaCas,
    maminka,
    ctorRate("maminka")
  );
  const babickaRate = deduce(
    babickaCas,
    babicka,
    ctorRate("babi\u010Dka")
  );
  const nsn = deduceAs("spole\u010Dn\xFD n\xE1sobek jejich \u010Dasu")(
    maminkaRate,
    babickaRate,
    lcd("dohromady", entityCas, "min")
  );
  return {
    deductionTree: deduce(
      deduce(
        nsn,
        deduce(
          deduce(
            last(maminkaRate),
            toCont(last(nsn), { agent: "maminka" })
          ),
          deduce(
            last(babickaRate),
            toCont(last(nsn), { agent: "babi\u010Dka" })
          ),
          sum("dohromady")
        ),
        ctorRate("dohromady")
      ),
      ctorOption("C", 15)
    )
  };
}
function knizniSerie() {
  const entity3 = "stran";
  const zbyva = cont("zb\xFDv\xE1 k p\u0159e\u010Dten\xED", 450, entity3);
  return {
    deductionTree: deduce(
      deduce(
        zbyva,
        deduce(
          cont("p\u0159e\u010Detl", 1050, entity3),
          zbyva,
          sum("celkem")
        ),
        ctorPercent()
      ),
      ctorOption("B", 30, { asPercent: true })
    )
  };
}
function jablka() {
  const levnejsiJablka = "levn\u011Bj\u0161\xED jablka";
  const drazsiJablka = "dra\u017E\u0161\xED jablka";
  const entity3 = "korun";
  const entityBase = { entity: "hmotnost", unit: "kg" };
  const nakup1Rozlozeni = ratios("n\xE1kup", [levnejsiJablka, drazsiJablka], [1, 1]);
  const nakup1 = cont("n\xE1kup", 12, entityBase.entity, entityBase.unit);
  const zaplatila = cont("zaplaceno", 330, entity3);
  return {
    stejnaMnozstvi: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              nakup1,
              nakup1Rozlozeni,
              nthPart(levnejsiJablka)
            ),
            rate(levnejsiJablka, 25, entity3, entityBase)
          ),
          deduce(
            deduce(
              nakup1,
              nakup1Rozlozeni,
              nthPart(drazsiJablka)
            ),
            rate(drazsiJablka, 30, entity3, entityBase)
          ),
          sum("celkem")
        ),
        ctorBooleanOption(330)
      )
    },
    jenLevnejsi: {
      deductionTree: deduce(
        deduce(
          zaplatila,
          cont(`skupina po 1 kg ${levnejsiJablka}`, 25, entity3),
          //rate(levnejsiJablka, 25, entity, entityBase),
          ctor("quota")
        ),
        ctorHasNoRemainder()
      )
    },
    nejviceKilogramu: {
      deductionTree: deduce(
        deduce(
          deduce(
            zaplatila,
            deduce(
              rate(drazsiJablka, 30, entity3, entityBase),
              cont(drazsiJablka, 1, entityBase.entity, entityBase.unit)
            ),
            ctorDifference(`zbytek na ${levnejsiJablka}`)
          ),
          cont(`skupina po 1 kg ${levnejsiJablka}`, 25, entity3),
          //rate(levnejsiJablka, 25, entity, entityBase),
          ctor("quota")
        ),
        ctorHasNoRemainder()
      )
    }
  };
}
function procenta5() {
  const entity3 = { entity: "voda", unit: "litr" };
  const entityBase = { entity: "\u010Das", unit: "h" };
  const cerpadloMensiVykon = "m\xE9n\u011B v\xFDkonn\xE9 \u010Derpadlo";
  const cerpadloVetsiVykon = "v\xEDce v\xFDkonn\xE9 \u010Derpadlo";
  return {
    neznameCislo: {
      deductionTree: deduce(
        deduce(
          compRelativePercent("zv\u011Bt\u0161en\xE9 nezn\xE1m\xE9 \u010D\xEDslo", "nezn\xE1m\xE9 \u010D\xEDslo", 4),
          counter("zv\u011Bt\u0161en\xE9 nezn\xE1m\xE9 \u010D\xEDslo", 780)
        ),
        ctorOption("D", 750)
      )
    },
    zlomky: {
      deductionTree: deduce(
        deduce(
          counter("polovina", 1 / 2),
          counter("osmina", 1 / 8),
          ctorComparePercent()
        ),
        ctorOption("A", 300, { asPercent: true, asRelative: true })
      )
    },
    cerpadla: {
      deductionTree: deduce(
        deduce(
          deduce(
            ratios("v\xFDkon", [cerpadloMensiVykon, cerpadloVetsiVykon], [3, 7]),
            rate(cerpadloMensiVykon, 150, entity3, entityBase, 2),
            nthPart(cerpadloVetsiVykon)
          ),
          cont(cerpadloVetsiVykon, 5, entityBase.entity, entityBase.unit)
        ),
        ctorOption("E", 875)
      )
    }
  };
}

// src/math/M9I-2025/angle.ts
function desetiuhelnik({ input }) {
  const pocetUhlu = "\xFAhl\u016F";
  const rovnoramennyTrojLabel = "rovnoramenn\xFD troj\xFAheln\xEDk";
  const vrcholovyUhelLabel = "vrcholov\xFD \xFAhel";
  const celkem = contAngle("desiti\xFAheln\xEDk", 360);
  const pocet = cont("desiti\xFAheln\xEDk", input.pocetUhlu, pocetUhlu);
  const minUhel = deduce(celkem, pocet, ctor("rate"));
  const alfa = deduce(minUhel, cont("alfa", 2, pocetUhlu));
  const triangleSum = contTringleAngleSum(rovnoramennyTrojLabel);
  const uhelRamenaRovnoramennehoTrojuhelniku = ({ vrcholovyUhel: vrcholovyUhel2 }, { uhelRamenoLabel }) => toCont(
    deduce(
      deduce(
        triangleSum,
        vrcholovyUhel2,
        ctorDifference("ob\u011B ramena")
      ),
      cont("ob\u011B ramena", 2, pocetUhlu),
      ctor("rate")
    ),
    { agent: uhelRamenoLabel ?? "\xFAhel ramena" }
  );
  const vrcholovyUhel = toCont(
    deduce(last(minUhel), cont(vrcholovyUhelLabel, 3, pocetUhlu)),
    { agent: vrcholovyUhelLabel }
  );
  const beta = connectTo(uhelRamenaRovnoramennehoTrojuhelniku(
    {
      vrcholovyUhel: last(vrcholovyUhel)
    },
    { uhelRamenoLabel: anglesNames.beta }
  ), vrcholovyUhel);
  const gama = deduce(
    last(alfa),
    uhelRamenaRovnoramennehoTrojuhelniku(
      {
        vrcholovyUhel: contAngle(vrcholovyUhelLabel, lastQuantity(minUhel))
      },
      { uhelRamenoLabel: anglesNames.gamma }
    )
  );
  return [
    { deductionTree: deduce(alfa, ctorBooleanOption(72)) },
    { deductionTree: deduce(beta, ctorBooleanOption(36, "smaller")) },
    { deductionTree: deduce(gama, ctorBooleanOption(0)) }
  ];
}

// src/math/M9I-2025/domecek.ts
function domecek3() {
  const dim2 = dimensionEntity();
  const dumLabel = "dome\u010Dek";
  const area = contArea(`plocha ${dumLabel}`, 16, EmptyUnit);
  const pasmo = quota(`plocha ${dumLabel}`, "\u010Dtverec", 4);
  const ctverec2 = toCont(
    deduce(
      area,
      pasmo
    ),
    { agent: "\u010Dtverec", entity: { entity: dim2.area.entity, unit: EmptyUnit } }
  );
  const rectangleVolume = deduce(
    deduce(
      ctverec2,
      evalFormulaAsCont(formulaRegistry.surfaceArea.square, (x) => x.a, "\u0161\xED\u0159ka", { entity: dim2.length.entity, unit: EmptyUnit })
    ),
    contLength("d\xE9lka", 8),
    contLength("v\xFD\u0161ka", 2),
    cuboidVolume("objem p\u0159\xEDzem\xED")
  );
  const deductionTree = deduce(
    deduce(
      rectangleVolume,
      deduce(
        last(rectangleVolume),
        ratio("objem p\u0159\xEDzem\xED", "objem st\u0159echa", 1 / 2)
      ),
      sum("objem dome\u010Dek")
    ),
    ctorOption("B", 48)
  );
  return { deductionTree };
}

// src/math/M9I-2025/krabice.ts
function plnaKrabice({ input }) {
  const triKrabiceABezPetiLabel = "3 krabice bez chyb\u011Bj\xEDc\xED v\xFDrobk\u016F";
  const missingVyrobkyLabel = "chyb\u011Bj\xEDc\xED v\xFDrobky";
  const plnaKrabiceLabel = "pln\xE1 krabice";
  const plnaKrabiceVyrobkyLabel = "v\u0161echny v\xFDrobky v pln\xE9 krabici";
  const vyrobekEntity = "kus";
  const entity3 = "gram";
  const plnaKrabiceVyrobkuPocet = axiomInput(cont(plnaKrabiceVyrobkyLabel, input.pocetKusuVKrabice, vyrobekEntity), 1);
  const missingVyrobkyPocet = axiomInput(cont(missingVyrobkyLabel, input.missingVyrobku, vyrobekEntity), 2);
  const triKrabice = axiomInput(cont(triKrabiceABezPetiLabel, 2e3, entity3), 3);
  const rozdil = axiomInput(compDiff(triKrabiceABezPetiLabel, `2 ${plnaKrabiceLabel}`, 480, entity3), 4);
  const deductionTree1 = deduce(
    deduce(triKrabice, rozdil),
    cont(`2 ${plnaKrabiceLabel}`, 2, vyrobekEntity),
    ctor("rate")
  );
  const rozdilGram = deduce(
    deduce(
      last(deductionTree1),
      cont(`3 ${plnaKrabiceLabel}`, 3, vyrobekEntity)
    ),
    triKrabice
  );
  const deductionTree2 = deduce(
    toCont(
      rozdilGram,
      { agent: missingVyrobkyLabel }
    ),
    missingVyrobkyPocet,
    ctor("rate")
  );
  const deductionTree3 = deduce(
    toCont(
      deductionTree1,
      { agent: plnaKrabiceLabel }
    ),
    deduce(
      last(deductionTree2),
      plnaKrabiceVyrobkuPocet
    )
  );
  return [
    { deductionTree: deductionTree1 },
    { deductionTree: deductionTree2 },
    { deductionTree: deductionTree3 }
  ];
}

// src/math/M9I-2025/kytice.ts
function kytice({ input }) {
  const kyticeAgent = "kytice";
  const chryzatemaAgent = "chryzant\xE9ma";
  const ruzeAgent = "r\u016F\u017Ee";
  const staticAgent = "statice";
  const kusEntity = "kus";
  const entity3 = "cena";
  const rozdilRuze = axiomInput(comp(ruzeAgent, staticAgent, 2, kusEntity), 1);
  const RtoS = axiomInput(compRatio(ruzeAgent, staticAgent, 5 / 4), 2);
  const CHxS = axiomInput(ratios(kyticeAgent, [chryzatemaAgent, staticAgent], [3, 2]), 3);
  const ruzeRate = axiomInput(rate(ruzeAgent, input.cenaZaKus.ruze, entity3, kusEntity), 4);
  const chryzantemaRate = axiomInput(rate(chryzatemaAgent, input.cenaZaKus.chryzantema, entity3, kusEntity), 5);
  const staticeRate = axiomInput(rate(staticAgent, input.cenaZaKus.statice, entity3, kusEntity), 6);
  const statice = deduce(
    rozdilRuze,
    RtoS
  );
  const chryzantem = deduce(
    last(statice),
    CHxS,
    nthPart(chryzatemaAgent)
  );
  const ruze = deduce(
    statice,
    rozdilRuze
  );
  const empty = " ";
  return {
    template: (highlight) => highlight`Kytice byla svázána ze tří druhů květin: růží, chryzantém a static.

Růží a chryzantém dohromady je v kytici o ${empty} 2 více než chryzantém a static dohromady. Počet růží ku počtu static je v poměru ${empty} 5 : 4, počet static ku počtu chryzantémm v poměru ${empty} 2 : 3.

V tabulce je u každého druhu květin uvedena cena za jeden kus. Cena celé kytice se získá jako součet cen jednotlivých květin, z nichž byla kytice svázána.

Druh květiny	Cena za kus	Počet kusů v kytici
Růže ${input.cenaZaKus.ruze} korun	
Chryzantéma	${input.cenaZaKus.chryzantema} korun	
Statice	${input.cenaZaKus.statice} korun	

Kolik korun bude stát celá kytice?`,
    deductionTree: deduce(
      deduce(
        deduce(ruze, ruzeRate),
        deduce(last(statice), staticeRate),
        deduce(chryzantem, chryzantemaRate),
        sum(kyticeAgent)
      ),
      ctorOption("D", 1300)
    )
  };
}

// src/math/M9I-2025/letajiciCtverecky.ts
function letajiciCtverecky({ input }) {
  const entity3 = "\u010Dtverec";
  const rowLabel = "\u0159ad";
  const columnLabel = "sloupec";
  const lowerRectLabel = "ni\u017E\u0161\xED obdeln\xEDk";
  const hiherRectLabel = "vy\u0161\u0161\xED obdeln\xEDk";
  const rows = axiomInput(cont(lowerRectLabel, input.pocetRad, rowLabel), 1);
  const columns = axiomInput(cont(hiherRectLabel, input.pocetSloupcu, columnLabel), 1);
  const rule = axiomInput(commonSense("po\u010Det \u0159ad je v\u017Edy o 1 vy\u0161\u0161\xED ne\u017E po\u010Det sloupc\u016F"), 2);
  const dd1 = deduce(
    to(
      rows,
      rule,
      cont(lowerRectLabel, input.pocetRad - 1, columnLabel)
    ),
    rows,
    productCombine(hiherRectLabel, columnLabel, [rowLabel, columnLabel])
  );
  const dd2 = to(
    columns,
    primeFactors([input.pocetSloupcu]),
    commonSense(`seskup je do dvojic (5x22), (10x11), (2x55)`),
    commonSense(`najdi dvojici, kter\xE1 m\xE1 \u010D\xEDsla za sebou = (10x11)`),
    rule,
    cont(lowerRectLabel, 11, rowLabel)
  );
  return [
    { deductionTree: dd1 },
    { deductionTree: dd2 }
  ];
}

// src/math/M9I-2025/nadoba.ts
var entity2 = "litr\u016F";
var entityPercent = "%";
function objemNadoby1({ input }) {
  const percentage = axiomInput(ratio("celkem", "zapln\u011Bno", input.zaplnenoPomer), 1);
  const part = axiomInput(cont("zbytek", input.zbyva, entity2), 2);
  const deductionTree = deduce(
    deduce(
      deduce(percentage, ctorComplement("zbytek")),
      part
    ),
    ctorOption("C", 35)
  );
  const template = (highlight) => highlight`
     ${input.zaplnenoPomer} objemu nádoby jsou zaplněny vodou. Celou nádobu zaplníme po dolití dalších ${input.zbyva} litrů vody. (Nádoba nepřeteče.)
    Jaký je objem nádoby?`;
  return { deductionTree, template };
}
function objemNadoby2({ input }) {
  const percentage = axiomInput(cont("p\u016Fvodn\u011B zapln\u011Bno", input.zaplnenoProcento, entityPercent), 1);
  const odebrano = axiomInput(comp("p\u016Fvodn\u011B zapln\u011Bno", "nov\u011B zapln\u011Bno", input.odebrano, entity2), 2);
  const zaplnenoPoOddebrani = axiomInput(ratio("celek", "nov\u011B zapln\u011Bno", input.zaplnenoPoOdebraniRatio), 3);
  const celek = cont("celek", 100, entityPercent);
  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(
          percentage,
          deduce(zaplnenoPoOddebrani, celek)
        ),
        odebrano
      ),
      celek
    ),
    ctorOption("E", 40)
  );
  return { deductionTree };
}
function objemNadoby3({ input }) {
  const nadoba1 = axiomInput(cont("n\xE1doba 1", input.nadoba1Procent, entityPercent), 1);
  const nadoba2 = axiomInput(cont("n\xE1doba 2", input.nadoba2Procent, entityPercent), 2);
  const nadoba3 = axiomInput(cont("n\xE1doba 3", input.nadoba3, entity2), 3);
  const prumer = axiomInput(ratio("n\xE1doba celkem", "napln\u011Bno pr\u016Fm\u011Br", input.prumerNadobaRatio), 4);
  return {
    deductionTree: deduce(
      deduce(
        to(
          nadoba1,
          commonSense(""),
          nadoba2,
          deduce(prumer, ctor("convert-percent")),
          transfer("n\xE1doba 3", "n\xE1doba 1", 10, entityPercent),
          percent("n\xE1doba celkem", "n\xE1doba 3", 50)
        ),
        nadoba3
      ),
      ctorOption("D", 38)
    )
  };
}

// src/math/M9I-2025/okurky.ts
function okurkyASalaty({ input }) {
  const entity3 = "sazenice";
  const okurkaLabel = "zasazeno okurek";
  const salatLabel = "zasazeno sal\xE1t\u016F";
  const ujaloOkurekLabel = "ujalo okurek";
  const ujaloSalatLabel = "ujalo sal\xE1t\u016F";
  const variableName = "okurky";
  const salatyAndOkurkyCompare = axiomInput(comp(salatLabel, okurkaLabel, input.salatyNavic, entity3), 1);
  const ujaloSalataRatio = axiomInput(ratio(salatLabel, ujaloSalatLabel, 3 / 4), 2);
  const ujaloOkurekRatio = axiomInput(ratio(okurkaLabel, ujaloOkurekLabel, 5 / 6), 3);
  const okurka = cont(okurkaLabel, variableName, entity3);
  const sazenicSalatu = deduce(
    okurka,
    salatyAndOkurkyCompare
  );
  const ujaloSalatu = deduce(
    sazenicSalatu,
    ujaloSalataRatio
  );
  const ujaloOkurek = deduce(
    okurka,
    ujaloOkurekRatio
  );
  const sazenicOkurek = deduce(ujaloSalatu, ujaloOkurek, ctorLinearEquation(okurkaLabel, { entity: entity3 }, variableName));
  const mark = " ";
  return [
    { deductionTree: deduce(sazenicOkurek, salatyAndOkurkyCompare), template: (highlight) => highlight`Zahradník sázel na záhon sazenice. Sazenice salátů zasadil o ${mark} 4 více než sazenic okurek.
Na záhoně ${mark} čtvrtinu sazenic salátů zlikvidovali slimáci a ${mark} šestina sazenic okurek uschla.\ Všechny ostatní sazenice se ujaly. Na záhoně se tak ujal stejný počet sazenic salátů a okurek.
Kolik sazenic salátů zahradník zasadil?` },
    { deductionTree: deduce(last(sazenicOkurek), ujaloOkurekRatio), template: (highlight) => "" }
  ];
}

// src/math/M9I-2025/papirACary.ts
function caryNaPapire({ input }) {
  const entity3 = "\u010D\xE1st";
  const usekLabel = "po\u010Det p\xE1sem";
  const separatorLabel = "po\u010Det \u010Dar";
  const pocetCasti = axiomInput(cont("po\u010Det \u010D\xE1st\xED", input.pocetCasti, entity3), 1);
  const emptyEntity = "";
  const diff = compDiff(usekLabel, separatorLabel, 1, emptyEntity);
  const dvojice = to(
    pocetCasti,
    primeFactors([input.pocetCasti]),
    commonSense(`seskup je do dvojic (2x20), (4x10), (8x5)`),
    commonSense(`najdi dvojici, kter\xE1 m\xE1 nejmen\u0161\xED sou\u010Det = (8x5)`),
    cont(usekLabel, 8, emptyEntity)
  );
  const deductionTree = deduce(
    deduce(
      deduce(dvojice, diff),
      deduce({ ...cont(usekLabel, 5, emptyEntity), ...deduceLbl(1) }, diff),
      sum(`sou\u010Det \u010Dar`)
    ),
    ctorOption("A", 11)
  );
  return { deductionTree };
}

// src/math/M9I-2025/plocha.ts
function porovnani2Ploch({}) {
  const dim2 = dimensionEntity();
  const { entity: entity3, unit } = dim2.area;
  return {
    deductionTree: deduce(
      deduce(
        axiomInput(cont("1. plocha", 0.2, entity3, "m2"), 1),
        ctorUnit(unit)
      ),
      axiomInput(cont("2. plocha", 20, entity3, unit), 2)
    )
  };
}

// src/math/M9I-2025/index.ts
var krabiceParams = { pocetKusuVKrabice: 12, missingVyrobku: 5 };
var M9I_2025_default = createLazyMap({
  1: () => porovnani2Ploch({ input: {} }),
  6.1: () => okurkyASalaty({ input: { salatyNavic: 4 } })[0],
  6.2: () => okurkyASalaty({ input: { salatyNavic: 4 } })[1],
  7.1: () => plnaKrabice({ input: krabiceParams })[0],
  7.2: () => plnaKrabice({ input: krabiceParams })[1],
  7.3: () => plnaKrabice({ input: krabiceParams })[2],
  11.1: () => desetiuhelnik({ input: { pocetUhlu: 10 } })[0],
  11.2: () => desetiuhelnik({ input: { pocetUhlu: 10 } })[1],
  11.3: () => desetiuhelnik({ input: { pocetUhlu: 10 } })[2],
  12: () => kytice({ input: { cenaZaKus: { ruze: 54, chryzantema: 40, statice: 35 } } }),
  13: () => caryNaPapire({ input: { pocetCasti: 40 } }),
  14: () => domecek3(),
  15.1: () => objemNadoby1({ input: { zbyva: 14, zaplnenoPomer: 3 / 5 } }),
  15.2: () => objemNadoby2({ input: { zaplnenoProcento: 55, odebrano: 12, zaplnenoPoOdebraniRatio: 1 / 4 } }),
  15.3: () => objemNadoby3({ input: { nadoba1Procent: 30, nadoba2Procent: 40, nadoba3: 19, prumerNadobaRatio: 2 / 5 } }),
  16.1: () => letajiciCtverecky({ input: { pocetRad: 21, pocetSloupcu: 110 } })[0],
  16.2: () => letajiciCtverecky({ input: { pocetRad: 21, pocetSloupcu: 110 } })[1]
});

// src/math/M9A-2025/index.ts
var M9A_2025_default = createLazyMap({
  //1:() => porovnani(),
  5.1: () => pozemek2().sirkaDum,
  5.2: () => pozemek2().rozlohaVolnyPozemek,
  6.1: () => sud2().vzestupObjem,
  6.2: () => sud2().vzestupVyska,
  7.1: () => uhly5().alfa,
  7.2: () => uhly5().beta,
  7.3: () => uhly5().gamma,
  8.1: () => zahon3().obvod,
  8.2: () => zahon3().rozdilPocetRostlin,
  8.3: () => zahon3().nejmensiPocetCerveneKvetoucich,
  12: () => bazen(),
  13: () => pelhrimov(),
  14: () => znamkyPrumer(),
  15.1: () => organizatoriPercent(),
  15.2: () => soutez(),
  15.3: () => atletika()
  //16.1:() =>  obrazce().pocetTmavyObrazec,
});
function pozemek2() {
  const pozemek3 = contLength("c", 30, "m");
  const obsahPozemek = deduce(
    pozemek3,
    squareArea("pozemek", "m2")
  );
  const obsahDum = deduce(
    obsahPozemek,
    compRatio("d\u016Fm", "pozemek", 1 / 5)
  );
  return {
    sirkaDum: {
      deductionTree: deduce(
        obsahDum,
        deduce(
          compRatio("a", "c", 1 / 2),
          pozemek3
        ),
        ctor("quota")
      )
    },
    rozlohaVolnyPozemek: {
      deductionTree: deduce(
        last(obsahPozemek),
        deduce(
          last(obsahDum),
          deduce(
            percent("pozemek", "rybn\xEDk", 18),
            last(obsahPozemek)
          ),
          sum("dum a rybnik")
        ),
        ctorDifference("voln\xFD pozemkek")
      )
    }
  };
}
function sud2() {
  const dim2 = dimensionEntity();
  const dnoSudu = contArea("dno sudu", 1500);
  const vzestupHladiny = deduce(
    deduce(cont("p\u0159ibylo vody", 3, dim2.volume.entity, "l"), ctorUnit(dim2.volume.unit)),
    dnoSudu,
    evalFormulaAsCont(formulaRegistry.volume.baseArea, (x) => x.h, "vzestup hladiny", dim2.length)
  );
  return {
    vzestupObjem: {
      deductionTree: deduce(
        deduce(
          dnoSudu,
          deduce(cont("vzestup hladiny", 10, dim2.length.entity, "mm"), ctorUnit("cm")),
          baseAreaVolume("p\u0159ibylo vody")
        ),
        ctorUnit("l")
      )
    },
    vzestupVyska: {
      deductionTree: deduce(
        vzestupHladiny,
        ctorUnit("mm")
      )
    }
  };
}
function uhly5() {
  const angleLabel = "zadan\xFD";
  const angle1 = contAngle(angleLabel, 30);
  const angle2 = contAngle(angleLabel, 130);
  return {
    alfa: {
      deductionTree: deduce(
        angle1,
        compAngle(angleLabel, anglesNames.alpha, "alternate-interior")
      )
    },
    beta: {
      deductionTree: deduce(
        deduce(angle2, compAngle(angleLabel, "vedle k zadan\xE9mu", "supplementary")),
        compAngle("vedle k zadan\xE9mu", anglesNames.beta, "corresponding")
      )
    },
    gamma: {
      deductionTree: deduceAs("pravo\xFAhl\xFD troj\xFAheln\xEDk, vytvo\u0159en\xFD mezi p\u0159\xEDmkami r,t,q, kde r a t jsou kolm\xE9")(
        deduce(
          deduce(angle2, compAngle(angleLabel, "bod R", "supplementary")),
          contRightAngle(),
          triangleAngle("zb\xFDvaj\xEDc\xED vrchol")
        ),
        compAngle("zb\xFDvaj\xEDc\xED vrchol", anglesNames.gamma, "supplementary")
      )
    }
  };
}
function zahon3() {
  const dim2 = dimensionEntity();
  const entity3 = "po\u010Det";
  const pocetRostlinQuantity = 65;
  const pocetRostlin = cont("rostliny", pocetRostlinQuantity, entity3);
  const rozestup = rate("rostliny", 40, dim2.length, entity3);
  const obvod = deduce(
    pocetRostlin,
    rozestup
  );
  const kratsiStranaLabel = "krat\u0161\xED strana";
  const delsiStranaLabel = "del\u0161\xED strana";
  const delsiStrana = deduce(
    ratios("rostliny", [kratsiStranaLabel, kratsiStranaLabel, kratsiStranaLabel, delsiStranaLabel], [3 / 4, 3 / 4, 3 / 4, 1]),
    obvod
  );
  return {
    obvod: {
      deductionTree: deduce(obvod, ctorUnit("m"))
    },
    rozdilPocetRostlin: {
      deductionTree: deduce(
        deduce(
          delsiStrana,
          rozestup
        ),
        deduce(
          deduce(
            compRelative(kratsiStranaLabel, delsiStranaLabel, -1 / 4),
            last(delsiStrana)
          ),
          rozestup
        )
      )
    },
    nejmensiPocetCerveneKvetoucich: {
      deductionTree: deduce(
        deduce(
          deduce(
            to(
              pocetRostlin,
              primeFactors([pocetRostlinQuantity]),
              commonSense(`kombinace 5x13 nebo 13x5, vybereme v\u011Bt\u0161\xED po\u010Det opakov\xE1n\xED, aby jsme doc\xEDlili men\u0161\xEDho po\u010Dtu \u010Derven\xFDch r\u016F\u017E\xED`),
              quota("rostliny", "skupina dohromady b\xEDl\xE9 a \u010Derven\xE9 rostliny", 13)
            ),
            pocetRostlin
          ),
          cont("b\xEDl\xFDch rostlin", 2, entity3),
          ctorDifference("\u010Derven\xFDch rostlin")
        ),
        counter("po\u010Det opakov\xE1n\xED", 13),
        product("\u010Derven\xFDch rostlin")
      )
    }
  };
}
function bazen() {
  const unit = "m";
  const agentLabel = "baz\xE9n";
  const dnoLabel = "\u0161ikm\xE9 dno";
  const zonaLabel = "prohlouben\xED z\xF3na pro plavce";
  const delka = contLength(agentLabel, 40, unit);
  const sirka = cont(agentLabel, 10, unit);
  const vyska = cont(agentLabel, 1, unit);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          delka,
          sirka,
          vyska,
          cuboidVolume(agentLabel, "m3")
        ),
        deduce(
          deduce(
            cont(zonaLabel, 20, "d\xE9lka", unit),
            cont(zonaLabel, 1, "v\xFD\u0161ka", unit),
            sirka,
            cuboidVolume(zonaLabel, "m3")
          ),
          ratio(zonaLabel, dnoLabel, 1 / 2)
        ),
        sum("baz\xE9n celkem")
      ),
      ctorOption("A", 500)
    )
  };
}
function pelhrimov() {
  const entity3 = "osob";
  const entityBase = "term\xEDn";
  const prihlasek = cont("t\xE1bor p\u0159ihl\xE1\u0161eno", 375, entity3);
  const pocet = cont("t\xE1bor nab\xEDzeno", 2, entityBase);
  return {
    deductionTree: deduce(
      deduce(
        prihlasek,
        deduce(
          deduce(
            deduce(
              deduce(
                ratio("t\xE1bor nab\xEDzeno", "p\u0159ihl\xE1\u0161eno 1. term\xEDn", 6 / 5),
                percent("t\xE1bor nab\xEDzeno", "p\u0159ihl\xE1\u0161eno 2. term\xEDn", 130),
                sum("t\xE1bor p\u0159ihl\xE1\u0161eno")
              ),
              prihlasek
            ),
            cont("t\xE1bor nab\xEDzeno", 1, entityBase),
            ctor("rate")
          ),
          pocet
        ),
        ctorDifference("odm\xEDtnuto")
      ),
      ctorOption("B", 75)
    )
  };
}
function organizatoriPercent() {
  const entity3 = "osoby";
  const entityBase = "dru\u017Estvo";
  const celkem = cont("nastoupilo", 200, entity3);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          celkem,
          deduce(
            cont("hr\xE1\u010Di", 10, entityBase),
            rate("hr\xE1\u010Di", 11, entity3, entityBase)
          ),
          ctorDifference("organiz\xE1to\u0159i")
        ),
        celkem,
        ctorPercent()
      ),
      ctorOption("B", 45, { asPercent: true })
    )
  };
}
function znamkyPrumer() {
  const entity3 = "hodnota";
  const entityPocet = "zn\xE1mka";
  const pocetJednicek = cont("jedni\u010Dky", "x", entityPocet);
  const pocetDvojek = cont("dvojky", "x", entityPocet);
  const pocetCelkem = cont("celkem", 20, entityPocet);
  const pocetTrojek = deduce(
    pocetCelkem,
    deduce(
      pocetJednicek,
      pocetDvojek,
      sum("celkem")
    ),
    ctorDifference("")
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            pocetJednicek,
            deduce(pocetDvojek, cont("dvojka", 2, entity3), product("dvojka")),
            deduce(pocetTrojek, cont("trojka", 3, entity3), product("trojka")),
            sum("celkem", { entity: entity3 })
          ),
          pocetCelkem,
          ctor("rate")
        ),
        rate("aritmetick\xFD pr\u016Fm\u011Br", 1.8, entity3, entityPocet),
        ctorLinearEquation("jedni\u010Dka", { entity: entityPocet }, "x")
      ),
      ctorOption("D", 8)
    )
  };
}
function soutez() {
  const entity3 = "osoby";
  const entityBase = "dru\u017Estvo";
  const druzstva = cont("celkem", 20, entityBase);
  const viceMuzuLabel = "dru\u017Estvo s jednou \u017Eenou";
  const viceZenLabel = "dru\u017Estvo s jedn\xEDm mu\u017Eem";
  const women = "\u017Eena";
  const ratiosDruzstva = deduce(
    compRatio(viceZenLabel, viceMuzuLabel, 4),
    ctorRatios("celkem")
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            ratiosDruzstva,
            druzstva,
            nthPart(viceMuzuLabel)
          ),
          deduce(
            deduce(
              last(ratiosDruzstva),
              druzstva,
              nthPart(viceZenLabel)
            ),
            rate(viceZenLabel, 2, entity3, entityBase)
          ),
          sum(women, { entity: entity3 })
        ),
        deduce(druzstva, rate("celkem", 3, entity3, entityBase)),
        ctorPercent()
      ),
      ctorOption("E", 60, { asPercent: true })
    )
  };
}
function atletika() {
  const entity3 = "atlet";
  const ostep = cont("o\u0161t\u011Bp", 12, entity3);
  const skok = deduce(
    ostep,
    compRelative("skok", "o\u0161t\u011Bp", 1 / 2)
  );
  const beh = deduce(
    skok,
    compRelative("skok", "b\u011Bh", -2 / 5)
  );
  return {
    deductionTree: deduce(
      deduce(
        beh,
        deduce(
          ostep,
          last(skok),
          last(beh),
          sum("celkem")
        ),
        ctorPercent()
      ),
      ctorOption("C", 50, { asPercent: true })
    )
  };
}

// src/math/M9B-2025/index.ts
var M9B_2025_default = createLazyMap({
  1: () => porovnani(),
  7.1: () => salaty().druhyDenTrzba,
  7.2: () => salaty().druhyDenVyrazSPromenou,
  7.3: () => salaty().pocetSalatu,
  8.1: () => pravouhlyLichobeznik().obsah,
  8.2: () => pravouhlyLichobeznik().obvod,
  8.3: () => pravouhlyLichobeznik().obvodRovnobeznik,
  11.1: () => zahrada().jabloneVsMagnolie,
  11.2: () => zahrada().levanduleABazalkaVsHortenzie,
  11.3: () => zahrada().ruzePlocha,
  12: () => uhelAlfa(),
  14: () => dort2(),
  15.1: () => tabor2().percentPerVedouci,
  15.2: () => tabor2().mladsiPercent,
  15.3: () => tabor2().pocetDivek
});
function porovnani() {
  const entity3 = "kusy";
  const vstupenkaDestskaLabel = "vstupenka d\u011Btsk\xE1";
  const vstupenkaDospelyLabel = "vstupenka dosp\u011Bl\xFD";
  const porovnat = compRatio(vstupenkaDestskaLabel, vstupenkaDospelyLabel, 2 / 5);
  const celkem = cont("celkem", 330, "K\u010D");
  const pocetDeti = cont(vstupenkaDestskaLabel, 3, entity3);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          porovnat,
          ctorRatios("celkem")
        ),
        pocetDeti,
        nthPartFactor(vstupenkaDestskaLabel)
      ),
      celkem,
      nthPart(vstupenkaDestskaLabel)
    )
  };
}
function salaty() {
  const entity3 = "sal\xE1t";
  const den1Ratio = ratio("celkem", "prod\xE1no 1.den", 1 / 3);
  const den2vsDen1 = compRelative("prod\xE1no 2.den", "prod\xE1no 1.den", -1 / 3);
  const celkem = cont("celkem", 5400, "K\u010D");
  const den2 = deduce(
    den1Ratio,
    den2vsDen1
  );
  const den2Trzba = deduce(
    den2,
    celkem
  );
  return {
    druhyDenTrzba: {
      deductionTree: den2Trzba
    },
    druhyDenVyrazSPromenou: {
      deductionTree: deduce(
        last(den2),
        cont("celkem", "x", entity3)
      )
    },
    pocetSalatu: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              deduce(
                den1Ratio,
                last(den2),
                sum("prodano za dva dny")
              ),
              ctorComplement("prod\xE1no 3.den")
            ),
            celkem
          ),
          cont("prod\xE1no 3.den", 120, "sal\xE1t"),
          ctor("rate")
        ),
        celkem
      )
    }
  };
}
function dort2() {
  const vetsiKorpus = contLength("v\u011Bt\u0161\xED korpus", 8);
  const mensiKorpus = deduce(
    vetsiKorpus,
    compRelative("men\u0161\xED korpus", "v\u011Bt\u0161\xED korpus", -1 / 4)
  );
  const height = contLength("korpus", 5);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          vetsiKorpus,
          vetsiKorpus,
          height,
          cuboidVolume("v\u011Bt\u0161\xED korpus")
        ),
        deduce(
          mensiKorpus,
          last(mensiKorpus),
          height,
          cuboidVolume("men\u0161\xED korpus")
        ),
        sum("celkem")
      ),
      ctorOption("D", 500)
    )
  };
}
function uhelAlfa() {
  const soucetUhluVTrojuhelniku = contTringleAngleSum();
  const praveRameho = deduce(
    ratios(soucetUhluVTrojuhelniku.agent, ["vrcholov\xFD \xFAhel", "lev\xE9 rameno", "prav\xE9 rameno"], [40, 70, 70]),
    soucetUhluVTrojuhelniku
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            deduce(
              praveRameho,
              compAngle("prav\xE9 rameno", "p\u0159\xEDmka p", "corresponding")
            ),
            compAngle("p\u0159\xEDmka p", "vrchol A", "alternate-exterior")
          ),
          last(praveRameho),
          triangleAngle("vrchol C")
        ),
        compAngle("vrchol C", anglesNames.alpha, "supplementary")
      ),
      ctorOption("B", 140)
    )
  };
}
function pravouhlyLichobeznik() {
  const agentLabel = "lichob\u011B\u017En\xEDk";
  const spodniZakladna = contLength("spodn\xED z\xE1kladna", 140);
  const horniZakladna = contLength("horn\xED z\xE1kladna", 100);
  const height = contLength(`${agentLabel} v\xFD\u0161ka`, 30);
  const prepona = deduce(
    deduce(
      spodniZakladna,
      horniZakladna,
      ctorDifference("z\xE1kladna")
    ),
    height,
    pythagoras("p\u0159epona", ["v\xFD\u0161ka", "z\xE1kladna"])
  );
  const obvod = deduce(
    prepona,
    horniZakladna,
    spodniZakladna,
    height,
    sum(`${agentLabel} obvod`)
  );
  return {
    obsah: {
      deductionTree: deduce(
        deduce(
          spodniZakladna,
          height,
          triangleArea(agentLabel)
        ),
        deduce(
          horniZakladna,
          height,
          triangleArea(agentLabel)
        ),
        sum(agentLabel)
      )
    },
    obvod: {
      deductionTree: obvod
    },
    obvodRovnobeznik: {
      deductionTree: deduce(
        deduce(
          last(obvod),
          ratios(`${agentLabel} obvod`, ["men\u0161\xED lichob\u011B\u017En\xEDk", "rovnob\u011B\u017En\xEDk"], [1, 1])
        ),
        prepona,
        sum("rovnob\u011B\u017En\xEDk obvod")
      )
    }
  };
}
function zahrada() {
  const magnolieL = "magnolie";
  const jablonL = "jablo\u0148";
  const ruzeL = "r\u016F\u017Ee";
  const hortenzieL = "hortenzie";
  const levanduleL = "levandule";
  const bazalkaL = "bazalka";
  const entity3 = "stupe\u0148";
  const magnoliePlocha = contArea(magnolieL, 20);
  const jablon = cont(jablonL, 105, entity3);
  const magnolie = cont(magnolieL, 60, entity3);
  const hortenzie = cont(hortenzieL, 30, entity3);
  const levandule = cont(levanduleL, 60, entity3);
  const bazalka = cont(bazalkaL, 15, entity3);
  const celkem = cont("celkem", 360, entity3);
  const ruze = deduce(
    celkem,
    deduce(
      jablon,
      magnolie,
      hortenzie,
      levandule,
      bazalka,
      sum("celkem")
    ),
    ctorDifference(ruzeL)
  );
  const plochaCelkem = deduce(
    deduce(
      magnolie,
      celkem,
      ctor("ratio")
    ),
    magnoliePlocha
  );
  return {
    jabloneVsMagnolie: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              jablon,
              celkem,
              ctor("ratio")
            ),
            plochaCelkem
          ),
          magnoliePlocha
        ),
        ctorBooleanOption(15)
      )
    },
    levanduleABazalkaVsHortenzie: {
      deductionTree: deduce(
        deduce(
          deduce(
            levandule,
            bazalka,
            sum("dohromady")
          ),
          hortenzie,
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1.5)
      )
    },
    ruzePlocha: {
      deductionTree: deduce(
        deduce(
          deduce(
            ruze,
            celkem,
            ctor("ratio")
          ),
          plochaCelkem
        ),
        ctorBooleanOption(30, "smaller")
      )
    }
  };
}
function tabor2() {
  const entity3 = "d\u011Bti";
  const entityBase = "vedouc\xED";
  const deti = cont("t\xE1bor", 80, entity3);
  const vedouci = cont("t\xE1bor", 5, entityBase);
  const mladsiLabel = "mlad\u0161\xED d\u011Bti";
  const starsiLabel = "star\u0161\xED d\u011Bti";
  const divkyL = "v\u0161echny d\xEDvky";
  const chlapciL = "v\u0161ichni chlapci";
  const divky = cont(divkyL, "x", entity3);
  const chlapci = deduce(
    deti,
    divky,
    ctorDifference(chlapciL)
  );
  return {
    percentPerVedouci: {
      deductionTree: deduce(
        deduce(
          toCont(deduce(
            deti,
            vedouci,
            ctor("rate")
          ), { agent: "d\u011Bti na starost jeden vedouc\xED" }),
          deti,
          ctorPercent()
        ),
        ctorOption("A", 20, { asPercent: true })
      )
    },
    mladsiPercent: {
      deductionTree: deduce(
        deduce(
          deduce(
            compRelative(mladsiLabel, starsiLabel, -1 / 3),
            ctor("invert-comp-ratio")
          ),
          ctor("convert-percent")
        ),
        ctorOption("F", 50, { asPercent: true })
      )
    },
    pocetDivek: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              deduce(
                divky,
                ratio(divkyL, "d\xEDvky na v\xFDlet", 1 / 2)
              ),
              deduce(
                chlapci,
                ratio(chlapciL, "chlapci na v\xFDlet", 1 / 4)
              ),
              ctorDifference("rozdil")
            ),
            cont("rozdil", 4, entity3),
            ctorLinearEquation("po\u010Det d\xEDvek", { entity: entity3 }, "x")
          ),
          deti,
          ctorPercent()
        ),
        ctorOption("D", 40, { asPercent: true })
      )
    }
  };
}

// src/math/M9C-2025/index.ts
var M9C_2025_default = createLazyMap({
  1: () => porovnani2(),
  6.1: () => nabytek().cenaSkrine,
  6.2: () => nabytek().cenaPostele,
  6.3: () => nabytek().nocniStolek,
  7.1: () => cyklista().klesaniPrumer,
  7.2: () => cyklista().trasa,
  7.3: () => cyklista().dobaStoupani,
  8.1: () => dlazdice().obsah,
  8.2: () => dlazdice().pokoj,
  11.1: () => rodinnyDum().a,
  11.2: () => rodinnyDum().b,
  11.3: () => rodinnyDum().c,
  12: () => hriste(),
  13: () => krychle2(),
  14: () => uhly6(),
  15.1: () => kbelik(),
  15.2: () => hrnciri(),
  15.3: () => rybiz()
});
function uhly6() {
  const asExpression = false;
  const zadanyUhel = contAngle("XAo~1~", 22, "deg", { asExpression });
  const zadanyUhelStred = contAngle("ASo~2~", 62, "deg", { asExpression });
  const osoveSymetrnyUhel = deduce(
    zadanyUhel,
    compAngle("BAo~1~", "XAo~1~", "axially-symmetric")
  );
  return {
    deductionTree: deduceAs({
      depth: 1,
      colors: {
        "red": ["BXC", "o~2~X"],
        "blue": ["ASX", "o~2~XB", "AXo~2~"],
        "green": ["BAo~1~", "Ao~2~X", "o~2~XC"]
      }
    })(
      deduce(
        deduce(
          deduce(
            deduce(
              osoveSymetrnyUhel,
              zadanyUhelStred,
              triangleAngle("Ao~2~X")
            ),
            compAngle("o~2~XC", "Ao~2~X", "alternate-interior")
          ),
          deduce(
            deduce(
              deduce(
                zadanyUhelStred,
                compAngle("ASX", "ASo~2~", "supplementary")
              ),
              zadanyUhel,
              triangleAngle("AXo~2~")
            ),
            compAngle("o~2~XB", "AXo~2~", "axially-symmetric")
          ),
          ctorDifference("BXC")
        ),
        contRightAngle(),
        triangleAngle(anglesNames.alpha)
      ),
      ctorOption("C", 34)
    )
  };
}
function porovnani2() {
  const entity3 = "hmotnost";
  const zadane1 = cont("zadan\xE9 mno\u017Estv\xED", 5, entity3, "kg");
  const zadane2 = cont("zadan\xE9 mno\u017Estv\xED", 0.25, entity3, "g");
  return {
    deductionTree: deduce(
      deduce(
        zadane1,
        ctorUnit("g")
      ),
      zadane2,
      ctor("comp-ratio")
    )
  };
}
function kbelik() {
  const kbelikLabel = "kbel\xEDk";
  const entity3 = "bor\u016Fvky";
  const unit = "hrnek";
  const celkem = cont(kbelikLabel, 50, entity3, unit);
  return {
    deductionTree: deduce(
      deduce(
        celkem,
        deduce(
          cont(kbelikLabel, 50, entity3, unit),
          percent(kbelikLabel, "odsyp\xE1no", 46)
        ),
        ctorDifference("zb\xFDv\xE1")
      ),
      ctorExpressionOption("F", "x>25")
    )
  };
}
function nabytek() {
  const postelLabel = "postel";
  const nocniStolekLabel = "no\u010Dn\xED stolek";
  const skrinLabel = "sk\u0159\xED\u0148";
  const entity3 = "cena";
  const nocniStolek = cont(nocniStolekLabel, "n", entity3);
  const skrinVsNocniStolek = deduce(
    compRelative(nocniStolekLabel, skrinLabel, -1 / 2),
    ctor("invert-comp-ratio")
  );
  const postelVsNocniStolek = deduce(
    compRelative(nocniStolekLabel, postelLabel, 1 / 3),
    ctor("invert-comp-ratio")
  );
  return {
    cenaSkrine: {
      deductionTree: deduce(
        nocniStolek,
        skrinVsNocniStolek
      )
    },
    cenaPostele: {
      deductionTree: deduce(
        nocniStolek,
        postelVsNocniStolek
      )
    },
    nocniStolek: {
      deductionTree: deduce(
        deduce(
          last(skrinVsNocniStolek),
          last(postelVsNocniStolek),
          ctorRatios("celkem")
        ),
        cont("celkem", 9e3, entity3)
      )
    }
  };
}
function cyklista() {
  const dim2 = dimensionEntity("km");
  const celaTrasaLabel = "cel\xE1 trasa";
  const rovinaLabel = "rovina";
  const stoupaniLabel = "stoup\xE1n\xED";
  const klesaniLabel = "kles\xE1n\xED";
  const entity3 = "rychlost";
  const unit = "km/h";
  const stoupani = cont(stoupaniLabel, 14, ...dim2.lengths);
  const klesaniRychlost = deduce(
    cont(rovinaLabel, 30, entity3, unit),
    compRelativePercent(klesaniLabel, rovinaLabel, 40)
  );
  return {
    klesaniPrumer: {
      deductionTree: klesaniRychlost
    },
    trasa: {
      deductionTree: deduce(
        deduce(
          deduce(
            ratio(celaTrasaLabel, rovinaLabel, 1 / 3),
            deduce(
              compRatio(klesaniLabel, celaTrasaLabel, -5),
              ctor("ratio")
            ),
            sum("rovina a kles\xE1n\xED")
          ),
          ctorComplement(stoupaniLabel)
        ),
        stoupani
      )
    },
    dobaStoupani: {
      deductionTree: deduce(
        deduce(
          stoupani,
          deduce(
            compRelative(stoupaniLabel, klesaniLabel, -1 / 2),
            last(klesaniRychlost)
          ),
          evalFormulaAsCont(formulaRegistry.speed, (x) => x.t, `doba ${klesaniLabel}`, { entity: "\u010Das", unit: "h" }, { asRatio: true })
        ),
        ctorUnit("min")
      )
    }
  };
}
function dlazdice() {
  const dim2 = dimensionEntity();
  const polomer = contLength("polom\u011Br", 5);
  const entity3 = "kruh";
  const vzorLabel = "dla\u017Edice (\u010Dtvercov\xFD vzor)";
  const ctverec2 = contLength(vzorLabel, 40);
  const malyKruh = rate("pokoj", 4, "kruh", vzorLabel);
  const velkyKruh = rate("pokoj", 1, "kruh", vzorLabel);
  const pocetDlazdic = deduce(
    deduce(
      deduce(
        contLength("\u0161\xED\u0159ka pokoje", 2, "m"),
        ctorUnit("cm")
      ),
      ctverec2,
      ctor("quota")
    ),
    deduce(
      deduce(
        contLength("d\xE9lka pokoje", 3.2, "m"),
        ctorUnit("cm")
      ),
      ctverec2,
      ctor("quota")
    ),
    productCombine("pokoj", { entity: vzorLabel })
  );
  return {
    obsah: {
      deductionTree: deduce(
        deduce(
          polomer,
          circleArea("obsah kruhu")
        ),
        ctorRound()
      )
    },
    pokoj: {
      deductionTree: deduce(
        toCont(deduce(
          pocetDlazdic,
          malyKruh
        ), { agent: "mal\xFD kruh" }),
        toCont(deduce(
          last(pocetDlazdic),
          velkyKruh
        ), { agent: "velk\xFD kruh" }),
        ctorDifference("rozd\xEDl")
      )
    }
  };
}
function rodinnyDum() {
  const entity3 = "n\xE1v\u0161t\u011Bvn\xEDk";
  const dospelyCelkem = cont("dosp\u011Bl\xFD", 80 + 60 + 70 + 90 + 100, "n\xE1v\u0161t\u011Bvn\xEDk");
  const detiCelkem = cont("d\u011Bti", 30 + 10 + 30 + 50 + 40, "n\xE1v\u0161t\u011Bvn\xEDk");
  return {
    a: {
      deductionTree: deduce(
        deduceAs("prvn\xED 3 m\u011Bs\xEDce")(
          cont("dosp\u011Bl\xFD", 80 + 60 + 70, "n\xE1v\u0161t\u011Bvn\xEDk"),
          cont("d\u011Bti", 30 + 10 + 30, "n\xE1v\u0161t\u011Bvn\xEDk"),
          ctor("comp-ratio")
        ),
        ctorBooleanOption(3)
      )
    },
    b: {
      deductionTree: deduce(
        deduceAs("cel\xE1 sez\xF3na")(
          dospelyCelkem,
          cont("dosp\u011Bl\xFD", 5, "m\u011Bs\xEDc"),
          ctor("rate")
        ),
        ctorBooleanOption(80)
      )
    },
    c: {
      deductionTree: deduce(
        deduceAs("cel\xE1 sez\xF3na")(
          detiCelkem,
          deduce(
            dospelyCelkem,
            detiCelkem,
            sum("celkem")
          ),
          ctorPercent()
        ),
        ctorBooleanOption(40, "closeTo", { asPercent: true })
      )
    }
  };
}
function hriste() {
  const entity3 = "kroky";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            cont("3.\xFAsek", 50, entity3),
            cont("1.\xFAsek", 30, entity3),
            sum("del\u0161\xED odv\u011Bsna")
          ),
          cont("p\u0159epona", 100, entity3),
          pythagoras("p\u0159epona", ["krat\u0161\xED odv\u011Bsna", "del\u0161\xED odv\u011Bsna"])
        ),
        cont("2.\xFAsek", 35, entity3),
        sum("posledn\xED \xFAsek")
      ),
      ctorOption("D", 95)
    )
  };
}
function krychle2() {
  const dim2 = dimensionEntity();
  const agent = "krychle";
  const entity3 = "b\xEDl\xFD \u010Dtvere\u010Dek";
  const agentStena = "st\u011Bna";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          toCont(
            deduce(
              toCont(
                deduce(
                  contArea(agent, 480),
                  counter(agent, 6),
                  ctor("rate")
                ),
                { agent: agentStena }
              ),
              cont(agentStena, 20, entity3),
              ctor("rate")
            ),
            { agent: entity3 }
          ),
          evalFormulaAsCont(formulaRegistry.surfaceArea.square, (x) => x.a, "\u010Dtvere\u010Dek", dim2.length)
        ),
        counter("\u010Dtvere\u010Dek", 5),
        product("strana krychle")
      ),
      ctorOption("B", 10)
    )
  };
}
function hrnciri() {
  const P2 = "Petr";
  const R = "Radim";
  const S = "Sl\xE1vek";
  const T = "Tom\xE1\u0161";
  const entity3 = "hrnek";
  const celkem = cont("celkem", 240, entity3);
  const PvsR = compRelative(P2, R, -1 / 2);
  const SvsR = compRelativePercent(S, R, -25);
  const TvsR = compRelativePercent(T, R, -25);
  const radim = deduce(
    deduce(
      PvsR,
      SvsR,
      TvsR,
      ctorRatios("celkem")
    ),
    celkem
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(radim, TvsR),
        deduce(last(radim), PvsR)
      ),
      ctorOption("B", 20)
    )
  };
}
function rybiz() {
  const entity3 = "hrnek";
  const babickaVsJitka = compRelative("babi\u010Dka", "Jitka", 1 / 2);
  const maminkaVsBabicka = deduce(
    compRatio("maminka", "Jitka", 2),
    babickaVsJitka
  );
  const babicka = deduce(
    maminkaVsBabicka,
    comp("babi\u010Dka", "maminka", -2, entity3)
  );
  return {
    deductionTree: deduce(
      deduce(
        babicka,
        deduce(last(babicka), maminkaVsBabicka),
        deduce(last(babicka), babickaVsJitka),
        sum("dohromady")
      ),
      ctorOption("A", 18)
    )
  };
}

// src/math/M9D-2025/index.ts
var M9D_2025_default = createLazyMap({
  1: () => stuha(),
  2: () => porovnani3(),
  6.1: () => roboti().pomerBeden,
  6.2: () => roboti().pomerJizd,
  6.3: () => roboti().doba,
  8.1: () => ctverec().porovnani,
  8.2: () => ctverec().obvod,
  7.1: () => soutez2().prvniKolo,
  7.2: () => soutez2().druheKolo,
  11.1: () => uhly7().a,
  11.2: () => uhly7().b,
  11.3: () => uhly7().c,
  12: () => krychle3(),
  13: () => vlak(),
  14: () => brhlikLesni(),
  15.1: () => procenta6().a,
  15.2: () => procenta6().b,
  15.3: () => procenta6().c
});
function uhly7() {
  const pravyUhel = contRightAngle();
  const zadany = contAngle("zadan\xFD", 64);
  const alpha = deduceAs("troj\xFAheln\xEDk KAS je rovnoramenn\xFD")(
    zadany,
    compAngle("zadan\xFD", anglesNames.alpha, "isosceles-triangle-at-the-base")
  );
  const alfaABetaLabel = [anglesNames.alpha, anglesNames.beta].join(" a ");
  const SKB = deduce(
    zadany,
    compAngle("zadan\xFD", "SKB", "complementary")
  );
  const gamma2 = deduce(
    SKB,
    deduceAs(`troj\xFAheln\xEDk SBK je rovnoramenn\xFD`)(
      last(SKB),
      compAngle(anglesNames.beta, "SKB", "isosceles-triangle-at-the-base")
    ),
    triangleAngle(anglesNames.gamma)
  );
  return {
    a: {
      deductionTree: deduce(
        alpha,
        ctorBooleanOption(64, "greater")
      )
    },
    b: {
      deductionTree: deduce(
        deduceAs(`thaletovo pravidlo -> troj\xFAheln\xEDk ABK je pravo\xFAhl\xFD -> ${alfaABetaLabel} = 90`)(
          last(alpha),
          deduce(
            last(alpha),
            pravyUhel,
            triangleAngle(anglesNames.beta)
          ),
          sum(alfaABetaLabel)
        ),
        ctorBooleanOption(90, "greater")
      )
    },
    c: {
      deductionTree: deduce(
        deduce(
          deduce(
            gamma2,
            last(alpha),
            ctorDifference(`${anglesNames.gamma} - ${anglesNames.alpha}`)
          ),
          deduce(
            last(gamma2),
            compAngle(anglesNames.delta, anglesNames.gamma, "supplementary")
          )
        ),
        ctorBooleanOption(0, "greater")
      )
    }
  };
}
function porovnani3() {
  const vetsiLabel = "v\u011Bt\u0161\xED \u010D\xEDslo";
  const mensiLabel = "men\u0161\xED \u010D\xEDslo";
  return {
    deductionTree: deduce(
      to(
        commonSense("dvojn\xE1sobky dvou \u010D\xEDsel se li\u0161\xED o 6, tak samotn\xE1 \u010D\xEDsla se mus\xED li\u0161it o 3."),
        comp(vetsiLabel, mensiLabel, 3, "")
      ),
      ratios("pom\u011Br", [mensiLabel, vetsiLabel], [4, 5]),
      nthPart(mensiLabel)
    )
  };
}
function stuha() {
  const celkem = contLength("stuha celkem", 3, "m");
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          celkem,
          deduce(
            ratio("stuha celkem", "1. d\xE1rek", 1 / 4),
            ctorComplement("zbytek")
          )
        ),
        deduce(
          ratio("zbytek", "2. d\xE1rek", 2 / 5),
          ctorComplement("3. d\xE1rek")
        )
      ),
      ctorUnit("cm")
    )
  };
}
function roboti() {
  const entityTime = "doba";
  const unitTime = "hodina";
  const entity3 = "bedna";
  const entityBase = "po\u010Det j\xEDzd";
  const rateA = rate("robot A", 5, entity3, entityBase);
  const rateB = rate("robot A", 3, entity3, entityBase);
  const odvezenoA = deduce(
    cont("robot A", 50, entity3),
    cont("robot A", 2, entityTime, unitTime),
    ctor("rate")
  );
  const odvezenoB = deduce(
    cont("robot B", 45, entity3),
    cont("robot B", 1.5, entityTime, unitTime),
    ctor("rate")
  );
  const dobaPrace = deduce(
    cont("robot A", 36, entityTime, "min", { asFraction: true }),
    ctorUnit("h")
  );
  return {
    pomerBeden: {
      deductionTree: deduce(
        odvezenoA,
        odvezenoB,
        ctorRatios("pom\u011Br odvezen\xE9ho mno\u017Estv\xED beden", { useBase: true })
      )
    },
    pomerJizd: {
      deductionTree: deduce(
        deduce(last(odvezenoA), rateA),
        deduce(last(odvezenoB), rateB),
        ctorRatios("pom\u011Br po\u010Dtu j\xEDzd", { useBase: true })
      )
    },
    doba: {
      deductionTree: deduce(
        deduce(
          dobaPrace,
          last(odvezenoA)
        ),
        deduce(
          last(dobaPrace),
          last(odvezenoB)
        ),
        sum("dohromady")
      )
    }
  };
}
function soutez2() {
  const entityBase = { entity: "body" };
  const entity3 = "sout\u011B\u017E\xEDc\xED";
  const agent = "sout\u011B\u017E";
  const celkem = cont(agent, 10, entity3);
  const _8vs10 = comp("8-bodov\xFDch", "10-bodov\xFDch", -1, entity3);
  const _9 = cont("9-bodov\xFDch", 5, entity3);
  const _8 = deduce(
    deduce(
      celkem,
      _9,
      ctorDifference("8-bodov\xFDch a 10-bodov\xFDch dohromady")
    ),
    _8vs10,
    ctor("comp-part-eq")
  );
  const _10 = deduce(
    last(_8),
    _8vs10
  );
  return {
    prvniKolo: {
      deductionTree: deduce(
        deduce(
          toFrequency(_8, { agent, entityBase, baseQuantity: 8 }),
          toFrequency(_9, { agent, entityBase, baseQuantity: 9 }),
          toFrequency(_10, { agent, entityBase, baseQuantity: 10 }),
          sum("celkem")
        ),
        deduce(
          last(_8),
          _9,
          last(_10),
          sum("celkem")
        ),
        ctorRate(agent)
      )
    },
    druheKolo: {
      deductionTree: to(
        commonSense("nejmen\u0161\xED po\u010Det 10-bodov\xFDch plat\xED pro po\u010Dty (0,5,5) v po\u0159ad\xED (8-bodov\xFDch, 9-bodov\xFDch, 10-bodov\xFDch)"),
        commonSense("ostatn\xED \u0159e\u0161en\xED z\xEDsk\xE1me zvy\u0161ov\xE1n\xEDm po\u010Dtu 10-bodov\xFDch a p\u0159esunem po\u010Dtu z 9-bodov\xFDch k 8-bodov\xFDm"),
        commonSense("(0,5,5)"),
        commonSense("(1,3,6)"),
        commonSense("(2,1,7)"),
        tuple("po\u010Dty 9-bodov\xFDch", [5, 3, 1].map((d) => cont("9-bodov\xFDch", d, entity3)))
      )
    }
  };
}
function ctverec() {
  const dim2 = dimensionEntity();
  const ctverecLabel = "strana \u010Dtverce";
  const stranaTrojuhelnikLabel = "nejkrat\u0161\xED strana pravo\xFAhl\xE9ho troj\u016Fheln\xEDku";
  const stranaCtverec = contLength(ctverecLabel, 12);
  const zakladnaLichobeznik = contLength("krat\u0161\xED z\xE1kladna lichob\u011B\u017En\xEDku", 2);
  const stranaTrojuhelnik = deduce(
    stranaCtverec,
    zakladnaLichobeznik,
    evalExprAsCont("(stranaCtverce - kratsiZakladna)/2", stranaTrojuhelnikLabel, dim2.length)
  );
  const stranaLichobeznik = deduce(
    last(stranaTrojuhelnik),
    stranaCtverec,
    pythagoras("nejdel\u0161\xED stran lichob\u011B\u017En\xEDk", [ctverecLabel, stranaTrojuhelnikLabel])
  );
  return {
    porovnani: {
      deductionTree: deduce(
        deduce(
          stranaTrojuhelnik,
          stranaCtverec,
          triangleArea("odst\u0159i\u017Een\xE9 \u010D\xE1sti - pravo\xFAhl\xFD troj\u016Fheln\xEDk")
        ),
        ...doubleProduct("odst\u0159i\u017Een\xE9 \u010D\xE1sti (2 pravo\xFAhl\xE9 troj\u016Fheln\xEDky)")
      )
    },
    obvod: {
      deductionTree: deduce(
        stranaLichobeznik,
        last(stranaLichobeznik),
        zakladnaLichobeznik,
        stranaCtverec,
        sum("lichob\u011B\u017En\xEDk")
      )
    }
  };
}
function krychle3() {
  const dim2 = dimensionEntity();
  const malaLabel = "mal\xE1 krychle";
  const velkaLabel = "velk\xE1 krychle";
  const obsah = comp(velkaLabel, malaLabel, 42, dim2.area);
  const stranaMala = toCont(deduce(
    cont(malaLabel, 36, dim2.length.entity, dim2.length.unit),
    cont(malaLabel, 12, "hran"),
    ctor("rate")
  ), { agent: malaLabel });
  const stranaVelka = deduce(
    deduce(
      deduce(
        last(stranaMala),
        cubeArea(malaLabel)
      ),
      obsah
    ),
    evalFormulaAsCont(formulaRegistry.surfaceArea.cube, (x) => x.a, velkaLabel, dim2.length)
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(stranaVelka, cubeVolume(velkaLabel)),
        deduce(stranaMala, cubeVolume(malaLabel))
      ),
      ctorOption("C", 37)
    )
  };
}
function vlak() {
  const entity3 = "vag\xF3n";
  const prvniKolej = cont("1.kolej", "x", entity3);
  const prvniVsDruha = comp("2.kolej", "1.kolej", 3, entity3);
  const druhaVsTreti = compRatio("2.kolej", "3.kolej", -2);
  const druhaKolej = deduce(
    prvniKolej,
    prvniVsDruha
  );
  const prvniKolejVysledek = deduce(
    deduce(
      prvniKolej,
      druhaKolej,
      deduce(
        last(druhaKolej),
        druhaVsTreti
      ),
      sum("celkem")
    ),
    cont("celkem", 41, entity3),
    ctorLinearEquation("1.kolej", { entity: entity3 }, "x")
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            prvniKolejVysledek,
            prvniVsDruha
          ),
          druhaVsTreti
        ),
        last(prvniKolejVysledek)
      ),
      ctorOption("E", 14)
    )
  };
}
function brhlikLesni() {
  const entity3 = "pt\xE1ci";
  const entityBase = "d\xEDlek";
  const jednotkaGrafu = deduce(
    deduce(
      cont("p\u011Bnkavy", 5, entityBase),
      cont("s\xFDkory", 8, entityBase)
    ),
    comp("p\u011Bnkavy", "s\xFDkory", -6, entity3),
    ctorRate("jednotka grafu")
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            jednotkaGrafu,
            cont("Jon\xE1\u0161", 3 + 2 + 4 + 1 + 2, entityBase)
          ),
          compRelative("Jon\xE1\u0161", "Beata", 1 / 5)
        ),
        deduce(
          cont("Beata", 2 + 4 + 3, entityBase),
          last(jednotkaGrafu)
        ),
        ctorDifference("brhl\xEDk lesn\xED")
      ),
      ctorOption("A", 2)
    )
  };
}
function procenta6() {
  const entity3 = "let";
  const zivotPredPrestehovanim = cont("\u017Eivot p\u0159ed p\u0159est\u011Bhov\xE1n\xEDm do Plzn\u011B", 27, entity3);
  const compareDvojceVsBratr = compRelativePercent("dvoj\u010De", "star\u0161\xED bratr", -40);
  return {
    a: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              ratio("cel\xFD \u017Eivot", "\u017Eivot v Plzni", 5 / 8),
              ctorComplement("\u017Eivot p\u0159ed p\u0159est\u011Bhov\xE1n\xEDm do Plzn\u011B")
            ),
            zivotPredPrestehovanim
          ),
          zivotPredPrestehovanim,
          ctorDifference("\u017Eivot v Plzni")
        ),
        ctorOption("D", 45)
      )
    },
    b: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont("z\xE1kladn\xED \u0161kola", 84, entity3),
            compRelativePercent("z\xE1kladn\xED \u0161kola", "gymn\xE1zium", 75)
          ),
          ratios("pom\u011Br doby fungov\xE1n\xED", ["lyceum", "gymn\xE1zium"], [2, 3]),
          nthPart("lyceum")
        ),
        ctorOption("C", 32)
      )
    },
    c: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              compareDvojceVsBratr,
              compareDvojceVsBratr,
              ctorRatios("v\u011Bk bratr\u016F")
            ),
            cont("v\u011Bk bratr\u016F", 99, entity3)
          ),
          compareDvojceVsBratr
        ),
        ctorOption("B", 27)
      )
    }
  };
}

// src/math/MMA-2023/index.ts
var MMA_2023_default = createLazyMap({
  1: () => trzby()
});
function trzby() {
  return {
    deductionTree: deduce(
      deduce(
        compRatio("\xFAnor", "leden", 4 / 5),
        ctor("invert-comp-ratio")
      ),
      ctor("convert-percent")
    )
  };
}

// src/math/MMA-2025/index.ts
var MMA_2025_default = createLazyMap({
  1: () => boruvky({
    input: {
      quantityEntity: {
        entity: "hmotnost",
        unit: "g",
        groupSize: 50
      },
      priceEntity: {
        entity: "korun"
      },
      agentA: {
        label: "prodejce 1",
        quantity: 650,
        price: 150
      },
      agentB: {
        label: "prodejce 2",
        quantity: 0.5,
        price: 120,
        unit: "kg"
      },
      finalPrice: 600
    }
  }),
  //3:()=> delitelnost(),
  5.1: () => spotrebaPaliva().beznePalivo,
  5.2: () => spotrebaPaliva().powerPalivo,
  6: () => spotrebaPaliva().cenaPowerPalivo,
  8: () => prumernyPlat(),
  18: () => rovnoramennySatek(),
  19: () => kruhovaVysec(),
  20: () => vzestupHladinyVody(),
  21: () => vyrezKrychle()
});
function boruvky(inputs) {
  const { quantityEntity, priceEntity, agentA, agentB, finalPrice } = inputs.input;
  const skupinaAgent = `skupina po ${quantityEntity.groupSize}${quantityEntity.unit}`;
  const skupina = cont(skupinaAgent, quantityEntity.groupSize, quantityEntity.entity, quantityEntity.unit);
  const pocetSkupin = deduce(
    cont(agentA.label, agentA.quantity, quantityEntity.entity, quantityEntity.unit),
    skupina,
    ctor("quota")
  );
  const pocetSkupinAgent = `${last(pocetSkupin).quantity} ${skupinaAgent}`;
  const morePriceEntity = deduceAs(`za dra\u017E\u0161\xED cenu ${agentB.label}`)(
    toCont(
      pocetSkupin,
      { agent: pocetSkupinAgent }
    ),
    deduce(
      cont(agentB.label, agentB.price, priceEntity.entity),
      deduce(
        deduce(
          cont(agentB.label, agentB.quantity, quantityEntity.entity, agentB.unit),
          ctorUnit(quantityEntity.unit)
        ),
        skupina,
        ctor("quota")
      ),
      ctor("rate")
    )
    //asCont({ agent: `13 dávek` })
  );
  return {
    template: () => `Na trhu prod\xE1vaj\xED bor\u016Fvky dva prodejci.
Prvn\xED prodejce prod\xE1v\xE1 1 litr za 150 korun. P\u0159itom 1 litr bor\u016Fvek m\xE1 hmotnost 650 g.
Druh\xFD prodejce bor\u016Fvky v\xE1\u017E\xED a za 0,5 kg se zaplat\xED 120 korun.
Z\xE1kazn\xEDk koupil levn\u011Bj\u0161\xED bor\u016Fvky celkem za 600 korun.

Vypo\u010Dt\u011Bte, za kolik korun by z\xE1kazn\xEDk koupil dra\u017E\u0161\xED bor\u016Fvky
o stejn\xE9 hmotnosti.`,
    deductionTree: deduce(
      morePriceEntity,
      deduceAs(`za levn\u011Bj\u0161\xED cenu ${agentA.label}`)(
        cont("celkem", finalPrice, priceEntity.entity),
        cont(pocetSkupinAgent, agentA.price, priceEntity.entity),
        ctor("comp-ratio")
      )
    )
  };
}
function spotrebaPaliva() {
  const standard = "b\u011B\u017En\xE9 palivo";
  const power = "power";
  const entityPrice = "korun";
  const entity3 = "objem";
  const entityLength = "vzd\xE1lenost";
  const unitLength = "km";
  const unit = "l";
  const standardRate = rate(standard, 6.5, { entity: entity3, unit }, { entity: entityLength, unit: unitLength }, 100);
  const powerRate = rate(power, 5.8, { entity: entity3, unit }, { entity: entityLength, unit: unitLength }, 100);
  const standardPriceRate = rate(standard, 34.8, entityPrice, { entity: entity3, unit });
  const standardPrice = cont(standard, 34.8, entityPrice);
  const powerCompare = comp(power, standard, "x", entityPrice);
  const powerPrice = deduce(
    standardPrice,
    powerCompare
  );
  return {
    beznePalivo: {
      template: () => "",
      deductionTree: deduce(
        deduce(
          cont(standard, "d", entityLength, unitLength),
          standardRate
        ),
        standardPriceRate
      )
    },
    powerPalivo: {
      template: () => "",
      deductionTree: deduce(
        deduce(
          cont(power, "d", entityLength, unitLength),
          powerRate
        ),
        toPredicate(powerPrice, (d) => ({
          kind: "rate",
          agent: power,
          entity: { entity: entityPrice },
          entityBase: { entity: entity3, unit },
          quantity: d.quantity,
          baseQuantity: 1
        }))
      )
    },
    cenaPowerPalivo: {
      template: () => "",
      deductionTree: deduce(
        deduce(
          deduce(
            cont(power, 1, entityLength, unitLength),
            powerRate
          ),
          toPredicate(powerPrice, (d) => ({
            kind: "rate",
            agent: power,
            entity: { entity: entityPrice },
            entityBase: { entity: entity3, unit },
            quantity: d.quantity,
            baseQuantity: 1
          }))
        ),
        deduce(
          deduce(
            cont(standard, 1, entityLength, unitLength),
            standardRate
          ),
          standardPriceRate
        ),
        ctorLinearEquation("o kolik dra\u017E\u0161\xED power ne\u017E b\u011B\u017En\xE9 palivo", { entity: entityPrice }, "x")
      )
    }
  };
}
function prumernyPlat() {
  const entity3 = "zam\u011Bstnanci";
  const entityPrice = "korun";
  const zamLabel = "celkem";
  const seniorLabel = "senior";
  const ostatniLabel = "ostatn\xED";
  const prumerLabel = "pr\u016Fm\u011Br";
  const platJunior = cont(ostatniLabel, "x", entityPrice);
  const platCompare = comp(seniorLabel, ostatniLabel, 6e3, entityPrice);
  const platSenior = deduce(
    platJunior,
    platCompare
  );
  const seniorPocet = ratio(seniorLabel, `pod\xEDl dle po\u010Dtu v pr\u016Fm\u011Bru ${seniorLabel}`, 1 / 3);
  const juniorPocet = ratio(ostatniLabel, `pod\xEDl dle po\u010Dtu v pr\u016Fm\u011Bru ${ostatniLabel}`, 2 / 3);
  const prumernyPlat2 = cont(prumerLabel, 46200, entityPrice);
  const senioryCelkem = deduce(
    platSenior,
    seniorPocet
  );
  const juniorCelkem = deduce(
    platJunior,
    juniorPocet
  );
  return {
    template: () => "",
    deductionTree: deduce(
      deduce(
        prumernyPlat2,
        deduce(
          senioryCelkem,
          juniorCelkem,
          sum("celkem vyplaceno")
        ),
        ctorLinearEquation(ostatniLabel, { entity: entityPrice }, "x")
      ),
      platCompare
    )
  };
}
function vzestupHladinyVody() {
  const dim2 = dimensionEntity();
  const objemKulicky = deduceAs("kuli\u010Dka")(
    contLength("kuli\u010Dka polom\u011Br", 3),
    evalExprAsCont("4/3*r^3*Pi", "voda", dim2.volume)
  );
  const objemValce = deduceAs("v\xE1lec")(
    deduce(
      contLength("v\xE1lec pr\u016Fm\u011Br", 12),
      half(),
      ctorScale("v\xE1lec polom\u011Br")
    ),
    evalExprAsRate("r^2*Pi", { kind: "rate", agent: "voda", entity: dim2.volume, entityBase: dim2.length, baseQuantity: 1 })
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          objemValce,
          objemKulicky
        ),
        simplifyExpr({ "Pi": 3.14 })
      ),
      ctorOption("D", 1)
    )
  };
}
function rovnoramennySatek() {
  const dim2 = dimensionEntity();
  const delsiStranaSatku = "del\u0161\xED strana \u0161\xE1tku";
  const mensiSatekLabel = "men\u0161\xED \u0161\xE1tek";
  const vetsiSatekLabel = "v\u011Bt\u0161\xED \u0161\xE1tek";
  const mensiSatekOdvesna = contLength(mensiSatekLabel, 50);
  const mensiSatek = deduce(
    mensiSatekOdvesna,
    mensiSatekOdvesna,
    triangleArea(mensiSatekLabel)
  );
  const vetsiStatekOdvesna = deduce(
    deduce(
      mensiSatek,
      compRelativePercent(vetsiSatekLabel, mensiSatekLabel, 125)
    ),
    evalExprAsCont("sqrt(2*obsah)", vetsiSatekLabel, dim2.length)
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          vetsiStatekOdvesna,
          last(vetsiStatekOdvesna),
          pythagoras(delsiStranaSatku, [mensiSatekLabel, mensiSatekLabel])
        ),
        ctorRound()
      ),
      ctorOption("D", 106)
    )
  };
}
function vyrezKrychle() {
  const telesoLabel = "nov\xE9 t\u011Bleso";
  const krychleLabel = "krychle";
  const stranaLabel = "strana krychle";
  const odvesna = "odv\u011Bsna troj\xFAheln\xEDku";
  const kratsiOdvesnaLabel = `krat\u0161\xED ${odvesna}`;
  const delsiOdvesnaLabel = `del\u0161\xED ${odvesna}`;
  const preponaLabel = "p\u0159epona troj\xFAheln\xEDku";
  const stranaKrychle = to(
    commonSense("v\xFD\u0159ez se skl\xE1d\xE1 ze dvou pravo\xFAhl\xFDch troj\xFAhleln\xEDk\u016F, nap\u0159. zvol\xEDm pom\u011Bru d\xE9lek pravo\xFAhl\xE9ho troj\u016Fheln\xEDku odv\u011Bsna:odv\u011Bsna:p\u0159epona (3:4:5)"),
    commonSense("vede na v\xFDpo\u010Det d\xE9lky strany krychle a = 6"),
    contLength(stranaLabel, 6, EmptyUnit)
  );
  const lastStranaKrychle = last(stranaKrychle);
  const kratsiOdvesna = deduce(lastStranaKrychle, ratio(stranaLabel, kratsiOdvesnaLabel, 1 / 2));
  const delsiOdvesna = deduce(lastStranaKrychle, ratio(stranaLabel, delsiOdvesnaLabel, 2 / 3));
  const prepona = deduce(
    kratsiOdvesna,
    delsiOdvesna,
    pythagoras(preponaLabel, [kratsiOdvesnaLabel, delsiOdvesnaLabel])
  );
  return {
    template: () => "",
    deductionTree: deduce(
      deduce(
        deduce(
          stranaKrychle,
          squareArea(`st\u011Bna ${krychleLabel}`, EmptyUnit)
        ),
        counter(`po\u010Det st\u011Bn ${krychleLabel}`, 6),
        product(`${krychleLabel}`)
      ),
      deduce(
        deduce(
          deduce(
            lastStranaKrychle,
            squareArea("st\u011Bna krychle", EmptyUnit)
          ),
          counter("po\u010Det \u010Dtvercov\xFDch st\u011Bn", 3),
          product(`lev\xE1, prav\xE1 a spodn\xED st\u011Bna - ${telesoLabel}`)
        ),
        deduce(
          deduce(
            deduce(
              lastStranaKrychle,
              squareArea(`p\u0159edn\xED st\u011Bna - ${telesoLabel}`, EmptyUnit)
            ),
            deduce(
              lastStranaKrychle,
              squareArea(`zadn\xED st\u011Bna - ${telesoLabel}`, EmptyUnit)
            ),
            sum(`p\u0159edn\xED a zadn\xED st\u011Bna - ${telesoLabel}`)
          ),
          deduce(
            delsiOdvesna,
            lastStranaKrychle,
            rectangleArea("p\u0159edn\xED a zadn\xED troj\xFAheln\xEDkov\xFD v\xFD\u0159ez", EmptyUnit)
          ),
          ctorDifference(`p\u0159edn\xED a zadn\xED st\u011Bna bez v\xFD\u0159ezu - ${telesoLabel}`)
        ),
        deduce(
          deduce(
            lastStranaKrychle,
            last(prepona),
            rectangleArea(`obdeln\xEDkov\xE1 \u0161ikm\xE1 st\u011Bna - ${telesoLabel}`, EmptyUnit)
          ),
          counter(`po\u010Det obdeln\xEDkov\xFDch \u0161ikm\xFDch st\u011Bn - ${telesoLabel}`, 2),
          product(`ob\u011B obdeln\xEDkov\xE9 \u0161ikm\xE9 st\u011Bny - ${telesoLabel}`)
        ),
        sum(`${telesoLabel}`)
      ),
      ctorRatios("pom\u011Br t\u011Bles", { useBase: true })
    )
  };
}
function kruhovaVysec() {
  const vetsiLabel = "celkov\xFD \xFAhel kruhu";
  const mensiLabel = "uhel \u03C6 odpov\xEDdaj\xEDc\xED v\xFDse\u010Di kruhu";
  const entity3 = "stup\u0148\u016F";
  return {
    deductionTree: deduce(
      deduce(
        to(
          commonSense(`obsah cel\xE9ho kruhu (r): \u03C0*r^2`),
          commonSense(`obsah cel\xE9ho kruhu s v\u011Bt\u0161\xEDm polom\u011Brem(3/2r): \u03C0*3/2r^2 = 9/4*\u03C0*r^2`),
          commonSense(`v\u011Bt\u0161\xED kruh je 9/4 kr\xE1t v\u011Bt\u0161\xED ne\u017E men\u0161\xED kruh, co\u017E mus\xED odpov\xEDdat tomu, \u017Ee obsah v\xFDse\u010De  v\xFDse\u010De kruhu  jeho celkov\xE9mu obsahu`),
          commonSense(`v\xFDse\u010D je \u010D\xE1st z cel\xE9ho kruhu s v\u011Bt\u0161\xEDm polom\u011Brem`),
          compRatio(vetsiLabel, mensiLabel, 9 / 4)
        ),
        cont(vetsiLabel, 360, entity3)
      ),
      ctorOption("B", 160)
    )
  };
}

// src/math/word-problems.ts
var word_problems_default = createLazyMap({
  "M5A-2023": () => M5A_2023_default,
  "M5A-2024": () => M5A_2024_default,
  "M5A-2025": () => M5A_2025_default,
  "M5B-2025": () => M5B_2025_default,
  "M7A-2023": () => M7A_2023_default,
  "M7A-2024": () => M7A_2024_default,
  "M7A-2025": () => M7A_2025_default,
  "M7B-2025": () => M7B_2025_default,
  // "M9I-2017": () => M9I_2017,
  "M9A-2023": () => M9A_2023_default,
  "M9B-2023": () => M9B_2023_default,
  "M9C-2023": () => M9C_2023_default,
  "M9D-2023": () => M9D_2023_default,
  "M9A-2024": () => M9A_2024_default,
  "M9B-2024": () => M9B_2024_default,
  "M9C-2024": () => M9C_2024_default,
  "M9D-2024": () => M9D_2024_default,
  "M9I-2025": () => M9I_2025_default,
  "M9A-2025": () => M9A_2025_default,
  "M9B-2025": () => M9B_2025_default,
  "M9C-2025": () => M9C_2025_default,
  "M9D-2025": () => M9D_2025_default,
  "MMA-2023": () => MMA_2023_default,
  "MMA-2025": () => MMA_2025_default
});
export {
  word_problems_default as default,
  formatPredicate,
  formatSequencePattern,
  inferenceRuleWithQuestion2 as inferenceRuleWithQuestion
};
/*!
 Based on ndef.parser, by Raphael Graf(r@undefined.ch)
 http://www.undefined.ch/mparser/index.html

 Ported to JavaScript and modified by Matthew Crumley (email@matthewcrumley.com, http://silentmatt.com/)

 You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
 to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
 but don't feel like you have to let me know or ask permission.
*/

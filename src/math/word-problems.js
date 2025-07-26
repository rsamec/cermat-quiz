// src/components/math.ts
var defaultHelpers = {
  convertToFraction: (d) => d,
  convertToUnit: (d) => d,
  unitAnchor: () => 1,
  solveLinearEquation: (fist, second, variable) => NaN,
  evalExpression: (expression, context) => NaN
};
var helpers = defaultHelpers;
function configure(config) {
  helpers = { ...defaultHelpers, ...config };
}
function isNumber(quantity) {
  return typeof quantity === "number";
}
function areNumbers(ratios4) {
  return ratios4.every((d) => isNumber(d));
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
function ctor(kind) {
  return { kind };
}
function ctorUnit(unit) {
  return { kind: "unit", unit };
}
function ctorRound(fractionDigits = 0) {
  return { kind: "round", fractionDigits };
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
function ctorComparePercent(agentB) {
  return { kind: "comp-ratio", agentB, asPercent: true };
}
function ctorRatios(agent) {
  return { kind: "ratios", whole: agent };
}
function ctorComplement(part) {
  return { kind: "complement", part };
}
function ctorDifference(differenceAgent) {
  return { kind: "diff", differenceAgent };
}
function cont(agent, quantity, entity3, unit) {
  return { kind: "cont", agent, quantity, entity: entity3, unit };
}
function evalExprAsCont(expression, predicate) {
  return { kind: "eval-expr", expression, predicate };
}
function ctorOption(optionValue, expectedValue, { asPercent } = { asPercent: false }) {
  return { kind: "eval-option", expression: `closeTo(x, ${asPercent ? expectedValue / 100 : expectedValue})`, expectedValue, optionValue };
}
function ctorExpressionOption(optionValue, expression) {
  return { kind: "eval-option", expression, optionValue };
}
function ctorBooleanOption(expectedValue, compareTo = "closeTo") {
  return { kind: "eval-option", expression: convertToExpression(expectedValue, compareTo), expectedValue };
}
function convertToExpression(expectedValue, compareTo) {
  const toCompare = (comp3) => `x ${comp3} ${helpers.convertToFraction(expectedValue)}`;
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
      return `closeTo(x, ${helpers.convertToFraction(expectedValue)})`;
  }
}
function pi() {
  return { kind: "cont", agent: "PI", quantity: 3.14, entity: "" };
}
function piNumber() {
  return pi().quantity;
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
function transfer(agentSender, agentReceiver, quantity, entity3) {
  return { kind: "transfer", agentReceiver: toAgentNames(agentReceiver), agentSender: toAgentNames(agentSender), quantity, entity: entity3 };
}
function toAgentNames(agent) {
  return typeof agent === "string" ? { name: agent } : agent;
}
function compRelative(agentA, agentB, ratio3, asPercent) {
  if (ratio3 <= -1 && ratio3 >= 1) {
    throw "Relative compare should be between (-1,1).";
  }
  return { kind: "comp-ratio", agentA, agentB, ratio: 1 + ratio3, asPercent };
}
function compRelativePercent(agentA, agentB, percent3) {
  return compRelative(agentA, agentB, percent3 / 100, true);
}
function compRatio(agentA, agentB, ratio3) {
  return { kind: "comp-ratio", agentA, agentB, ratio: ratio3 };
}
function compPercent(agentA, agentB, percent3) {
  return { kind: "comp-ratio", agentA, agentB, ratio: percent3 / 100, asPercent: true };
}
function compDiff(agentMinuend, agentSubtrahend, quantity, entity3) {
  return { kind: "comp-diff", agentMinuend, agentSubtrahend, quantity, entity: entity3 };
}
function ratio(whole, part, ratio3) {
  return { kind: "ratio", whole, part, ratio: ratio3 };
}
function percent(whole, part, percent3) {
  return { kind: "ratio", whole, part, ratio: percent3 / 100, asPercent: true };
}
function ratios(whole, parts, ratios4) {
  return { kind: "ratios", parts, whole, ratios: ratios4 };
}
function combine(wholeAgent, partAgents, wholeEntity, partEntity) {
  return {
    kind: "sum",
    wholeAgent,
    partAgents,
    wholeEntity: toEntity(wholeEntity),
    partEntity: toEntity(partEntity)
  };
}
function product(wholeAgent, partAgents, wholeEntity, partEntity) {
  return { kind: "product", wholeAgent, partAgents, wholeEntity: toEntity(wholeEntity), partEntity: toEntity(partEntity) };
}
function gcd(agent, entity3) {
  return { kind: "gcd", agent, entity: entity3 };
}
function lcd(agent, entity3) {
  return { kind: "lcd", agent, entity: entity3 };
}
function nthPart(agent) {
  return { kind: "nth-part", agent };
}
function nthPartFactor(agent) {
  return { kind: "nth-factor", agent };
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
function commonSense(description) {
  return { kind: "common-sense", description };
}
function toEntity(entity3) {
  return isEntityBase(entity3) ? entity3 : { entity: entity3 };
}
function compareRuleEx(a, b) {
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
function compareRule(a, b) {
  const result = compareRuleEx(a, b);
  return {
    question: `${computeQuestion(result.quantity)} ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? " + " : " - "} ${formatNumber(abs(b.quantity))} `, result: formatNumber(result.quantity), ok: a.agent == b.agentB },
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? " - " : " + "} ${formatNumber(abs(b.quantity))} `, result: formatNumber(result.quantity), ok: a.agent == b.agentA }
    ] : []
  };
}
function compareAngleRuleEx(a, b) {
  return { kind: "cont", agent: a.agent == b.agentB ? b.agentA : b.agentB, quantity: computeOtherAngle(a.quantity, b.relationship), entity: a.entity, unit: a.unit };
}
function compareAngleRule(a, b) {
  const result = compareAngleRuleEx(a, b);
  return {
    question: `Vypo\u010Dti ${a.agent == b.agentB ? b.agentA : b.agentB}? \xDAhel ${b.agentA} je ${formatAngle(b.relationship)} \xFAhel k ${b.agentB}.`,
    result,
    options: isNumber(result.quantity) ? [
      { tex: `90 - ${a.quantity} `, result: formatNumber(result.quantity), ok: b.relationship == "complementary" },
      { tex: `180 - ${a.quantity} `, result: formatNumber(result.quantity), ok: b.relationship == "supplementary" || b.relationship == "sameSide" },
      { tex: `${a.quantity} `, result: formatNumber(result.quantity), ok: b.relationship != "supplementary" && b.relationship != "complementary" && b.relationship != "sameSide" }
    ] : []
  };
}
function toComparisonAsRatioEx(a, b) {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole} `;
  }
  return {
    kind: "comp-ratio",
    agentB: b.part,
    agentA: a.part,
    ratio: isNumber(a.ratio) && isNumber(b.ratio) ? 1 + (a.ratio - b.ratio) : wrapToRatio(`1 + (a.ratio - b.ratio)`, { a, b })
  };
}
function toComparisonAsRatio(a, b) {
  const result = toComparisonAsRatioEx(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik ? `,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `1 + (${formatRatio(a.ratio)} - ${formatRatio(b.ratio)})`, result: formatRatio(result.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} - ${formatRatio(a.ratio)} `, result: formatRatio(result.ratio), ok: false }
    ] : []
  };
}
function toComparisonRatioEx(a, b) {
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
function toComparisonRatio(a, b) {
  const result = toComparisonRatioEx(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}.Kolikr\xE1t ? `,
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
function comparisonRatioRuleEx(b, a) {
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
function comparisonRatioRule(b, a) {
  const result = comparisonRatioRuleEx(b, a);
  return {
    question: `${computeQuestion(result.ratio)}} ${a.part == b.agentB ? b.agentA : b.agentB}?`,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) ? [
      { tex: `${formatRatio(a.ratio)} * ${formatRatio(abs(b.ratio))}`, result: formatRatio(a.ratio * b.ratio), ok: a.part == b.agentB && b.ratio >= 0 || a.part == b.agentA && b.ratio < 0 },
      { tex: `${formatRatio(a.ratio)} / ${formatRatio(abs(b.ratio))}`, result: formatRatio(a.ratio / b.ratio), ok: a.part == b.agentA && b.ratio >= 0 || a.part == b.agentB && b.ratio < 0 }
    ] : []
  };
}
function comparisonRatioTransitiveRuleEx(a, b) {
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
function comparisonRatioTransitiveRule(b, a) {
  const result = comparisonRatioTransitiveRuleEx(b, a);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}?`,
    result,
    options: []
  };
}
function convertToPartToPartRatiosEx(b, a) {
  if (!isNumber(b.ratio)) {
    throw "convertToPartToPartRatios does not non quantity";
  }
  return { kind: "ratios", whole: a.whole, parts: [b.agentA, b.agentB], ratios: [abs(b.ratio), 1] };
}
function convertToPartToPartRatios(b, a) {
  const result = convertToPartToPartRatiosEx(b, a);
  if (!isNumber(b.ratio)) {
    throw "convertToPartToPartRatios does not support expressions";
  }
  return {
    question: `Vyj\xE1d\u0159i pom\u011Brem \u010D\xE1st\xED ${[b.agentA, b.agentB].join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `(${formatRatio(abs(b.ratio))}) ku 1`, result: result.ratios.map((d) => formatRatio(d)).join(":"), ok: true },
      { tex: `(1 / ${formatRatio(abs(b.ratio))}) ku 1`, result: result.ratios.map((d) => formatRatio(d)).join(":"), ok: false }
    ] : []
  };
}
function convertToUnitEx(a, b) {
  if (a.unit == null) {
    throw `Missing unit ${a.kind === "cont" ? a.agent : `${a.agentA} to ${a.agentB}`} a ${a.entity}`;
  }
  if (!isNumber(a.quantity)) {
    throw "convertToUnit does not support expressions";
  }
  return { ...a, quantity: helpers.convertToUnit(a.quantity, a.unit, b.unit), unit: b.unit };
}
function convertToUnit(a, b) {
  const result = convertToUnitEx(a, b);
  if (!isNumber(a.quantity) || !isNumber(result.quantity)) {
    throw "convertToUnit does not support expressions";
  }
  const destination = helpers.unitAnchor(a.unit);
  const origin = helpers.unitAnchor(b.unit);
  return {
    question: `P\u0159eve\u010F ${formatNumber(a.quantity)} ${formatEntity(a)} na ${b.unit}.`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(destination / origin)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(destination / origin)}`, result: formatNumber(result.quantity), ok: false }
    ]
  };
}
function roundTo(a, b) {
  const result = {
    ...a,
    quantity: isNumber(a.quantity) ? Math.round(a.quantity) : wrapToQuantity(`round ${a.quantity}`, { a })
  };
  return {
    question: isNumber(a.quantity) ? `Zaokrouhli ${formatNumber(a.quantity)} ${formatEntity(a)} na cel\xE9 \u010D\xEDslo.` : `Zaokrouhli na cel\xE9 \u010D\xEDslo.`,
    result,
    options: isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)}`, result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function ratioCompareRuleEx(a, b) {
  if (!(a.agent == b.agentA || a.agent == b.agentB)) {
    throw `Mismatch agent ${a.agent} any of ${b.agentA}, ${b.agentB}`;
  }
  if (a.agent == b.agentB) {
    return {
      kind: "cont",
      agent: b.agentA,
      quantity: isNumber(a.quantity) && isNumber(b.ratio) ? b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / abs(b.ratio) : isNumber(b.ratio) ? b.ratio >= 0 ? wrapToQuantity(`a.quantity * b.ratio`, { a, b }) : wrapToQuantity(`a.quantity / abs(b.ratio)`, { a, b }) : wrapToQuantity(`b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / abs(b.ratio)`, { a, b }),
      entity: a.entity,
      unit: a.unit
    };
  } else if (a.agent == b.agentA) {
    return {
      kind: "cont",
      agent: b.agentB,
      quantity: isNumber(a.quantity) && isNumber(b.ratio) ? b.ratio > 0 ? a.quantity / b.ratio : a.quantity * abs(b.ratio) : isNumber(b.ratio) ? b.ratio > 0 ? wrapToQuantity(`a.quantity / b.ratio`, { a, b }) : wrapToQuantity(`a.quantity * abs(b.ratio)`, { a, b }) : wrapToQuantity(`b.ratio > 0 ? a.quantity / b.ratio : a.quantity * abs(b.ratio)`, { a, b }),
      entity: a.entity,
      unit: a.unit
    };
  }
}
function ratioCompareRule(a, b) {
  const result = ratioCompareRuleEx(a, b);
  return {
    question: `${computeQuestion(result.quantity)} ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.ratio) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity * b.ratio), ok: a.agent == b.agentB && b.ratio >= 0 || a.agent == b.agentA && b.ratio < 0 },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity / b.ratio), ok: a.agent == b.agentA && b.ratio >= 0 || a.agent == b.agentB && b.ratio < 0 }
    ] : []
  };
}
function transferRuleEx(a, b, transferOrder) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const plus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b });
  const minus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b });
  const quantity = transferOrder === "before" ? a.agent == b.agentSender.name ? plus : minus : a.agent == b.agentSender.name ? minus : plus;
  const newAgent = a.agent === b.agentReceiver.name ? getAgentName(b.agentReceiver, transferOrder) : a.agent == b.agentSender.name ? getAgentName(b.agentSender, transferOrder) : a.agent;
  return { kind: "cont", agent: newAgent, quantity, entity: a.entity };
}
function getAgentName(agent, transferOrder) {
  const name = transferOrder === "before" ? agent.nameBefore : agent.nameAfter;
  return name ?? agent.name;
}
function transferRule(a, b, transferOrder) {
  const result = transferRuleEx(a, b, transferOrder);
  return {
    question: `${computeQuestion(result.quantity)} ${a.agent}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${transferOrder === "before" && a.agent == b.agentSender.name ? " + " : " - "} ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentSender.name },
      { tex: `${formatNumber(a.quantity)} ${transferOrder !== "before" && a.agent == b.agentSender.name ? " - " : " + "} ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentReceiver.name }
    ] : []
  };
}
function deltaRuleEx(a, b, transferOrder) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const plus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b });
  const minus = isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b });
  const quantity = transferOrder === "before" ? minus : plus;
  const agent = b.agent.name;
  return { kind: "cont", agent, quantity, entity: a.entity };
}
function deltaRule(a, b, transferOrder) {
  const result = deltaRuleEx(a, b, transferOrder);
  return {
    question: `${computeQuestion(result.quantity)} ${result.agent}${formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${transferOrder === "before" ? " - " : " + "} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(a.quantity)} ${transferOrder == "before" ? " + " : " - "} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: false }
    ] : []
  };
}
function ratioComplementRuleEx(a, b) {
  return {
    kind: "ratio",
    whole: b.whole,
    ratio: isNumber(b.ratio) ? 1 - b.ratio : wrapToRatio(`1 - b.ratio`, { a, b }),
    part: a.part,
    asPercent: b.asPercent
  };
}
function ratioComplementRule(a, b) {
  const result = ratioComplementRuleEx(a, b);
  return {
    question: `Vyj\xE1d\u0159i ${b.asPercent ? "procentem" : "pom\u011Brem"} ${result.part} z ${result.whole}?`,
    result,
    options: isNumber(b.ratio) ? [
      { tex: `${formatRatio(1, b.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(1 - b.ratio, b.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false }
    ] : []
  };
}
function convertToCompRatioEx(b, { agentB, asPercent }) {
  if (!areNumbers(b.ratios)) {
    throw "ratios does not support non quantity type";
  }
  const bRatios = b.ratios;
  if (!(b.ratios.length === 2 && b.parts.length === 2)) {
    throw `Part to part ratio has to have exactly two parts.`;
  }
  const agentBIndex = agentB != null ? b.parts.indexOf(agentB) : 1;
  if (agentBIndex === -1) {
    throw `Part not found ${agentB}, expecting ${b.parts.join()}.`;
  }
  const agentAIndex = agentBIndex === 0 ? 1 : 0;
  return {
    kind: "comp-ratio",
    agentA: b.parts[agentAIndex],
    agentB: b.parts[agentBIndex],
    ratio: bRatios[agentAIndex] / bRatios[agentBIndex],
    asPercent
  };
}
function convertToCompRatio(b, { agentB, asPercent }) {
  const result = convertToCompRatioEx(b, { agentB, asPercent });
  return {
    question: `Porovnej ${asPercent ? "procentem" : "pom\u011Brem"} ${result.agentA} a ${result.agentB}?`,
    result,
    options: [
      // { tex: `${formatRatio(1, b.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(1 - b.ratio, b.asPercent), ok: true },
      // { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false },
    ]
  };
}
function toRatioEx(b, asPercent) {
  return {
    ...b,
    asPercent
  };
}
function toRatio(b, asPercent) {
  const result = toRatioEx(b, asPercent);
  return {
    question: `Vyj\xE1d\u0159i ${asPercent ? "procentem" : "pom\u011Brem"}?`,
    result,
    options: isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `1 / ${formatRatio(b.ratio, b.asPercent)}${asPercent ? " * 100" : ""}`, result: formatRatio(result.ratio, result.asPercent), ok: asPercent }
    ] : []
  };
}
function reverseCompRatioEx(b, asPercent) {
  return {
    kind: "comp-ratio",
    agentA: b.agentB,
    agentB: b.agentA,
    ratio: isNumber(b.ratio) ? 1 / b.ratio : wrapToRatio(`1 / b.ratio`, { b }),
    asPercent: asPercent ?? b.asPercent
  };
}
function reverseCompRatio(b, asPercent) {
  const result = reverseCompRatioEx(b, asPercent);
  return {
    question: `Obra\u0165 porovn\xE1n\xED ${asPercent ?? b.asPercent ? "procentem" : "pom\u011Brem"} ${result.agentA} a ${result.agentB}?`,
    result,
    options: isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `1 / ${formatRatio(b.ratio, b.asPercent)}${result.asPercent ? " * 100" : ""}`, result: formatRatio(result.ratio, result.asPercent), ok: true }
      // { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false },
    ] : []
  };
}
function ratiosConvertRuleEx(a, b, asPercent) {
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
function ratiosConvertRule(a, b, last5) {
  const result = ratiosConvertRuleEx(a, b, last5.asPercent);
  if (!areNumbers(b.ratios) || !isNumber(result.ratio)) {
    throw "ratios does not support non quantity type";
  }
  const index = b.parts.indexOf(a.agent);
  const value = b.ratios[index];
  return {
    question: `Vyj\xE1d\u0159i ${last5.asPercent ? "procentem" : "pom\u011Brem"} ${result.part} z ${result.whole}?`,
    result,
    options: [
      { tex: `${formatNumber(value)} / (${b.ratios.map((d) => formatNumber(d)).join(" + ")})`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatNumber(value)} * (${b.ratios.map((d) => formatNumber(d)).join(" + ")})`, result: formatRatio(result.ratio, result.asPercent), ok: false }
    ]
  };
}
function compRatioToCompRuleEx(a, b) {
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
function compRatioToCompRule(a, b) {
  const result = compRatioToCompRuleEx(a, b);
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.ratio) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(abs(b.quantity))} / ${formatRatio(abs(a.ratio - 1))}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(abs(b.quantity))} / ${formatRatio(abs(1 - a.ratio))}`, result: formatNumber(abs(b.quantity / (1 - a.ratio))), ok: false }
    ] : []
  };
}
function compRatiosToCompRuleEx(a, b) {
  if (!areNumbers(a.ratios) || !isNumber(b.quantity)) {
    throw "ratios does not support non quantity type";
  }
  const aIndex = a.parts.indexOf(b.agentA);
  const bIndex = a.parts.indexOf(b.agentB);
  if (aIndex === -1 || bIndex === -1) {
    throw `Missing parts to compare ${a.parts.join(",")}, required parts ${b.agentA, b.agentB}`;
  }
  const aAgent = a.parts[aIndex];
  const bAgent = a.parts[bIndex];
  const diff = a.ratios[aIndex] - a.ratios[bIndex];
  if (!(diff > 0 && b.quantity > 0 || (diff < 0 && b.quantity < 0 || diff == 0 && b.quantity == 0))) {
    throw `Uncompatible compare rules. Absolute compare ${b.quantity} between ${b.agentA} a ${b.agentB} does not match relative compare.`;
  }
  const lastIndex = aIndex > bIndex ? aIndex : bIndex;
  const nthPartAgent = a.parts[lastIndex];
  return {
    kind: "cont",
    agent: nthPartAgent,
    entity: b.entity,
    unit: b.unit,
    quantity: abs(b.quantity / diff) * a.ratios[lastIndex]
  };
}
function compRatiosToCompRule(a, b) {
  const result = compRatiosToCompRuleEx(a, b);
  const aIndex = a.parts.indexOf(b.agentA);
  const bIndex = a.parts.indexOf(b.agentB);
  const lastIndex = aIndex > bIndex ? aIndex : bIndex;
  return {
    question: containerQuestion(result),
    result,
    options: areNumbers(a.ratios) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(abs(b.quantity))} / (${formatNumber(a.ratios[aIndex])} - ${formatNumber(a.ratios[bIndex])}) * ${formatNumber(a.ratios[lastIndex])}`, result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function proportionRuleEx(a, b) {
  return {
    ...a,
    ...b.inverse && { ratio: isNumber(a.ratio) ? 1 / a.ratio : wrapToRatio(`1 / a.ratio`, { a }) }
  };
}
function proportionRule(a, b) {
  const result = proportionRuleEx(a, b);
  return {
    question: `Jak\xFD je vztah mezi veli\u010Dinami? ${b.entities?.join(" a ")}`,
    result,
    options: isNumber(a.ratio) ? [
      { tex: `zachovat pom\u011Br`, result: formatRatio(a.ratio), ok: !b.inverse },
      { tex: `obr\xE1tit pom\u011Br - 1 / ${formatRatio(a.ratio)}`, result: formatRatio(1 / a.ratio), ok: b.inverse }
    ] : []
  };
}
function proportionRatiosRuleEx(a, b) {
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
function proportionRatiosRule(a, b) {
  const result = proportionRatiosRuleEx(a, b);
  return {
    question: `Jak\xFD je vztah mezi veli\u010Dinami? ${b.entities?.join(" a ")}`,
    result,
    options: [
      { tex: `zachovat pom\u011Br`, result: result.ratios.join(":"), ok: !b.inverse },
      { tex: `obr\xE1tit pom\u011Br`, result: result.ratios.join(":"), ok: b.inverse }
    ]
  };
}
function partToWholeRuleEx(a, b) {
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
function partToWholeRule(a, b) {
  const result = partToWholeRuleEx(a, b);
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(b.ratio) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(b.ratio)}`, result: formatNumber(a.quantity * b.ratio), ok: matchAgent(b.whole, a) },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(b.ratio)}`, result: formatNumber(a.quantity / b.ratio), ok: !matchAgent(b.whole, a) }
    ] : []
  };
}
function rateRuleEx(a, rate3) {
  const aEntity = a.kind == "cont" ? a.entity : a.agentQuota;
  if (!(aEntity === rate3.entity.entity || aEntity === rate3.entityBase.entity)) {
    throw `Mismatch entity ${aEntity} any of ${rate3.entity.entity}, ${rate3.entityBase.entity}`;
  }
  const isEntityBase2 = aEntity == rate3.entity.entity;
  const isUnitRate = rate3.baseQuantity === 1;
  return {
    kind: "cont",
    agent: a.agent,
    entity: isEntityBase2 ? rate3.entityBase.entity : rate3.entity.entity,
    unit: isEntityBase2 ? rate3.entityBase.unit : rate3.entity.unit,
    quantity: aEntity == rate3.entity.entity ? isNumber(a.quantity) && isNumber(rate3.quantity) && isNumber(rate3.baseQuantity) ? a.quantity / (!isUnitRate ? rate3.quantity / rate3.baseQuantity : rate3.quantity) : !isUnitRate ? wrapToQuantity(`a.quantity / (rate.quantity/rate.baseQuantity)`, { a, rate: rate3 }) : wrapToQuantity(`a.quantity / rate.quantity`, { a, rate: rate3 }) : isNumber(a.quantity) && isNumber(rate3.quantity) && isNumber(rate3.baseQuantity) ? a.quantity * (!isUnitRate ? rate3.quantity / rate3.baseQuantity : rate3.quantity) : !isUnitRate ? wrapToQuantity(`a.quantity * (rate.quantity/rate.baseQuantity)`, { a, rate: rate3 }) : wrapToQuantity(`a.quantity * rate.quantity`, { a, rate: rate3 })
  };
}
function rateRule(a, rate3) {
  const result = rateRuleEx(a, rate3);
  const aEntity = a.kind == "cont" ? a.entity : a.agentQuota;
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(rate3.quantity) && isNumber(result.quantity) && isNumber(rate3.baseQuantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(rate3.quantity)}`, result: formatNumber(result.quantity), ok: aEntity !== rate3.entity.entity },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(rate3.quantity)}`, result: formatNumber(result.quantity), ok: aEntity === rate3.entity.entity }
    ] : []
  };
}
function quotaRuleEx(a, quota3) {
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
function quotaRule(a, quota3) {
  const result = quotaRuleEx(a, quota3);
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(quota3.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(quota3.quantity)}`, result: formatNumber(a.quantity * quota3.quantity), ok: a.agent === quota3.agentQuota },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota3.quantity)}`, result: formatNumber(a.quantity / quota3.quantity), ok: a.agent !== quota3.agentQuota }
    ] : []
  };
}
function toPartWholeRatioEx(part, whole, asPercent) {
  return {
    kind: "ratio",
    part: part.agent,
    whole: whole.agent,
    ratio: isNumber(part.quantity) && isNumber(whole.quantity) ? part.quantity / whole.quantity : wrapToRatio(`part.quantity / whole.quantity`, { part, whole }),
    asPercent
  };
}
function toPartWholeRatio(part, whole, last5) {
  const result = toPartWholeRatioEx(part, whole, last5.asPercent);
  return {
    question: `Vyj\xE1d\u0159i ${last5.asPercent ? "procentem" : "pom\u011Brem"} ${part.agent} z ${whole.agent}?`,
    result,
    options: isNumber(part.quantity) && isNumber(whole.quantity) && isNumber(result.ratio) ? [
      { tex: `${formatNumber(whole.quantity)} / ${formatNumber(part.quantity)} ${last5.asPercent ? " * 100" : ""}`, result: last5.asPercent ? formatNumber(result.ratio * 100) : formatRatio(result.ratio), ok: false },
      { tex: `${formatNumber(part.quantity)} / ${formatNumber(whole.quantity)} ${last5.asPercent ? " * 100" : ""}`, result: last5.asPercent ? formatNumber(result.ratio * 100) : formatRatio(result.ratio), ok: true }
    ] : []
  };
}
function diffRuleEx(a, b) {
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
function diffRule(a, b) {
  const result = diffRuleEx(a, b);
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: a.agent === b.agentMinuend },
      { tex: `${formatNumber(a.quantity)} + ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity + b.quantity), ok: a.agent !== b.agentMinuend }
    ] : []
  };
}
function sumRuleEx(items, b) {
  if (items.every((d) => isRatioPredicate(d))) {
    const wholes = items.map((d) => d.whole);
    if (wholes.filter(unique).length == wholes.length) {
      throw `Combine only part to whole ratio with the same whole ${wholes}`;
    }
    ;
    const ratios4 = items.map((d) => d.ratio);
    const ratio3 = areNumbers(ratios4) ? ratios4.reduce((out, d) => out += d, 0) : wrapToRatio(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
    return { kind: "ratio", whole: wholes[0], ratio: ratio3, part: b.wholeAgent };
  } else if (items.every((d) => isQuantityPredicate(d))) {
    const values = items.map((d) => d.quantity);
    const quantity = areNumbers(values) ? values.reduce((out, d) => out += d, 0) : wrapToQuantity(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
    if (items.every((d) => isRatePredicate(d))) {
      const { entity: entity3, entityBase } = items[0];
      return { kind: "rate", agent: b.wholeAgent, quantity, entity: entity3, entityBase, baseQuantity: 1 };
    } else {
      if (b.kind !== "sum") {
        const itemsEntities = items.map((d) => d.entity);
        if (itemsEntities.filter(unique).length !== 1) {
          throw `All predicates should have the same entity ${itemsEntities.join("")}.`;
        }
      }
      return { kind: "cont", agent: b.wholeAgent, quantity, entity: b.kind == "sum" ? b.wholeEntity.entity : items[0].entity, unit: b.kind == "sum" ? b.wholeEntity.unit : items[0].unit };
    }
  }
}
function sumRule(items, b) {
  const result = sumRuleEx(items, b);
  const isQuantity = isQuantityPredicate(result);
  return {
    question: result.kind === "cont" ? containerQuestion(result) : result.kind === "rate" ? `${computeQuestion(result.quantity)} ${result.agent}` : `${computeQuestion(result.ratio)} ${result.part}`,
    result,
    options: isQuantity && isNumber(result.quantity) || isRatioPredicate(result) && isNumber(result.ratio) ? [
      {
        tex: items.map((d) => isQuantity ? formatNumber(d.quantity) : formatRatio(d.ratio)).join(" + "),
        result: isQuantity ? isNumber(result.quantity) ? formatNumber(result.quantity) : "N/A" : isNumber(result.ratio) ? formatRatio(result.ratio) : "N/A",
        ok: true
      },
      {
        tex: items.map((d) => isQuantity ? formatNumber(d.quantity) : formatRatio(d.ratio)).join(" * "),
        result: isQuantity ? isNumber(result.quantity) ? formatNumber(result.quantity) : "N/A" : isNumber(result.ratio) ? formatRatio(result.ratio) : "N/A",
        ok: false
      }
    ] : []
  };
}
function productRuleEx(items, b) {
  const values = items.map((d) => d.quantity);
  return {
    kind: "cont",
    agent: b.wholeAgent,
    quantity: areNumbers(values) ? values.reduce((out, d) => out *= d, 1) : wrapToQuantity(items.map((d, i) => `y${i + 1}.quantity`).join(" * "), Object.fromEntries(items.map((d, i) => [`y${i + 1}`, d]))),
    entity: b.wholeEntity.entity,
    unit: b.wholeEntity.unit
  };
}
function productRule(items, b) {
  const result = productRuleEx(items, b);
  const values = items.map((d) => d.quantity);
  return {
    question: containerQuestion(result),
    result,
    options: areNumbers(values) ? [
      { tex: values.map((d) => formatNumber(d)).join(" * "), result: formatNumber(values.reduce((out, d) => out *= d, 1)), ok: true },
      { tex: values.map((d) => formatNumber(d)).join(" + "), result: formatNumber(values.reduce((out, d) => out += d, 0)), ok: false }
    ] : []
  };
}
function gcdRuleEx(values, b) {
  return {
    kind: "cont",
    agent: b.agent,
    quantity: areNumbers(values) ? gcdCalc(values) : wrapToQuantity(`gcd(${values.join(",")})`),
    entity: b.entity
  };
}
function gcdRule(items, b) {
  const values = items.map((d) => d.quantity);
  const result = gcdRuleEx(values, b);
  return {
    question: containerQuestion(result),
    result,
    options: areNumbers(values) && isNumber(result.quantity) ? [
      { tex: gcdFromPrimeFactors(primeFactorization(values)).join(" * "), result: formatNumber(result.quantity), ok: true }
      //{ tex: lcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ] : []
  };
}
function lcdRuleEx(values, b) {
  return {
    kind: "cont",
    agent: b.agent,
    quantity: areNumbers(values) ? lcdCalc(values) : wrapToQuantity(`gcd(${values.join(",")})`),
    entity: b.entity
  };
}
function lcdRule(items, b) {
  const values = items.map((d) => d.quantity);
  const result = lcdRuleEx(values, b);
  return {
    question: containerQuestion(result),
    result,
    options: areNumbers(values) && isNumber(result.quantity) ? [
      { tex: lcdFromPrimeFactors(primeFactorization(values)).join(" * "), result: formatNumber(result.quantity), ok: true }
      //{ tex: gcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ] : []
  };
}
function sequenceRuleEx(items) {
  const values = items.map((d) => d.quantity);
  if (!areNumbers(values)) {
    throw "quota does not support non quantity type";
  }
  if (new Set(items.map((d) => d.entity)).size > 1) {
    throw `Mismatch entity ${items.map((d) => d.entity).join()}`;
  }
  const type = sequencer(values);
  return { kind: "sequence", type, entity: items[0].entity };
}
function sequenceRule(items) {
  const result = sequenceRuleEx(items);
  return {
    question: `Hledej vzor opakov\xE1n\xED. Jak\xFD je vztah mezi sousedn\xEDmi \u010Dleny?`,
    result,
    options: sequenceOptions(result.type)
  };
}
function toComparisonEx(a, b) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return {
    kind: "comp",
    agentB: b.agent,
    agentA: a.agent,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }),
    entity: a.entity,
    unit: a.unit
  };
}
function toComparison(a, b) {
  const result = toComparisonEx(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ] : []
  };
}
function toDeltaEx(a, b, last5) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return {
    kind: "delta",
    agent: { name: last5.agent?.name ?? b.agent, nameBefore: a.agent, nameAfter: b.agent },
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? b.quantity - a.quantity : wrapToQuantity(`b.quantity - a.quantity`, { a, b }),
    entity: a.entity,
    unit: a.unit
  };
}
function toDelta(a, b, last5) {
  const result = toDeltaEx(a, b, last5);
  return {
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
function convertDeltaToCompareEx(a, b) {
  const { agentA, agentB, entity: entity3, unit } = b;
  return { kind: "comp", agentA, agentB, quantity: a.quantity, entity: entity3, unit };
}
function pythagorasRuleEx(a, b, last5) {
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
  if (a.agent === last5.longest || b.agent === last5.longest) {
    const longest = a.agent === last5.longest ? a : b;
    const otherSite = a.agent === last5.longest ? b : a;
    return {
      ...temp,
      quantity: isNumber(longest.quantity) && isNumber(otherSite.quantity) ? Math.sqrt(Math.pow(longest.quantity, 2) - Math.pow(otherSite.quantity, 2)) : wrapToQuantity(`sqrt(longest.quantity^2 - otherSite.quantity^2)`, { longest, otherSite }),
      agent: last5.sites[1] === otherSite.agent ? last5.sites[0] : last5.sites[1]
    };
  } else {
    return {
      ...temp,
      quantity: isNumber(a.quantity) && isNumber(b.quantity) ? Math.sqrt(Math.pow(a.quantity, 2) + Math.pow(b.quantity, 2)) : wrapToQuantity(`sqrt(a.quantity^2 + b.quantity^2)`, { a, b }),
      agent: last5.longest
    };
  }
}
function pythagorasRule(a, b, last5) {
  const result = pythagorasRuleEx(a, b, last5);
  const longest = a.agent === last5.longest ? a : b;
  const otherSite = a.agent === last5.longest ? b : a;
  return {
    question: `Vypo\u010D\xEDtej stranu ${result.agent} dle Pythagorovi v\u011Bty?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(longest.quantity) && isNumber(otherSite.quantity) && isNumber(result.quantity) ? [
      { tex: `odmocnina z (${formatNumber(longest.quantity)}^2^ - ${formatNumber(otherSite.quantity)}^2^)`, result: formatNumber(result.quantity), ok: a.agent === last5.longest },
      { tex: `odmocnina z (${formatNumber(a.quantity)}^2^ + ${formatNumber(b.quantity)}^2^)`, result: formatNumber(result.quantity), ok: a.agent !== last5.longest }
    ] : []
  };
}
function toRatioComparisonEx(a, b, ctor3) {
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
    ...ctor3.asPercent && { asPercent: true }
  };
}
function toRatioComparison(a, b, ctor3) {
  const result = toRatioComparisonEx(a, b, ctor3);
  if (isNumber(result.ratio) && isNumber(a.quantity) && isNumber(b.quantity)) {
    const between = result.ratio > 1 / 2 && result.ratio < 2;
    return {
      question: `Porovnej ${result.agentA} a ${result.agentB}.${between ? `O kolik z ${result.agentB}?` : `Kolikr\xE1t ${result.ratio < 1 ? "men\u0161\xED" : "v\u011Bt\u0161\xED"}?`}`,
      result,
      options: between ? [
        { tex: `(${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}) / ${b.quantity}`, result: formatRatio((a.quantity - b.quantity) / b.quantity), ok: result.ratio > 1 },
        { tex: `(${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}) / ${b.quantity}`, result: formatRatio((b.quantity - a.quantity) / b.quantity), ok: result.ratio <= 1 }
      ] : [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatRatio(a.quantity / b.quantity), ok: result.ratio >= 1 },
        { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatRatio(b.quantity / a.quantity), ok: result.ratio < 1 }
      ]
    };
  } else {
    return resultAsQuestion(result);
  }
}
function compareToCompareRuleEx(a, b) {
  return {
    kind: "rate",
    agent: a.agentA,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) ? abs(a.quantity) / abs(b.quantity) : wrapToQuantity(`abs(a.quantity) / abs(b.quantity)`, { a, b }),
    entity: { entity: a.entity },
    entityBase: { entity: b.entity },
    baseQuantity: 1
  };
}
function compareToCompareRule(a, b) {
  const result = compareToCompareRuleEx(a, b);
  return {
    question: `Rozd\u011Bl ${formatEntity({ entity: a.entity })} rovnom\u011Brn\u011B na ${formatEntity({ entity: b.entity })}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(abs(a.quantity))} / ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(abs(b.quantity))} / ${formatNumber(abs(a.quantity))}`, result: formatNumber(abs(b.quantity) / abs(a.quantity)), ok: false }
    ] : []
  };
}
function toComparisonDiffEx(a, b) {
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
function toComparisonDiff(a, b) {
  const result = toComparisonDiffEx(a, b);
  return {
    question: `${computeQuestion(result.quantity)} rozd\xEDl mezi ${a.quantity} a ${b.quantity}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ] : []
  };
}
function toDifferenceEx(a, b, diff) {
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
function toDifference(a, b, diff) {
  const result = toDifferenceEx(a, b, diff);
  return {
    question: `${computeQuestion(result.quantity)} rozd\xEDl mezi ${a.agent} a ${b.agent}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ] : []
  };
}
function toDifferenceAsRatioEx(a, b, diff) {
  if (a.whole !== b.whole) {
    throw `Mismatch whole agents ${a.whole}, ${b.whole}`;
  }
  return {
    kind: "ratio",
    whole: a.whole,
    part: diff.differenceAgent,
    ratio: isNumber(a.ratio) && isNumber(b.ratio) ? a.ratio - b.ratio : wrapToRatio(`a.ratio - b.ratio`, { a, b })
  };
}
function toDifferenceAsRatio(a, b, diff) {
  const result = toDifferenceAsRatioEx(a, b, diff);
  return {
    question: `${computeQuestion(result.ratio)} rozd\xEDl mezi ${a.part} a ${b.part}`,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio)} - ${formatRatio(b.ratio)}`, result: formatRatio(result.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} - ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio - a.ratio), ok: false }
    ] : []
  };
}
function toRateEx(a, b) {
  if (a.agent !== b.agent) {
    throw `Mismatch angent ${a.agent}, ${b.agent}`;
  }
  return {
    kind: "rate",
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
  };
}
function toRate(a, b) {
  const result = toRateEx(a, b);
  if (isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity)) {
    return {
      question: `Rozd\u011Bl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity })} rovnom\u011Brn\u011B na ${formatNumber(b.quantity)} ${formatEntity({ entity: b.kind === "cont" ? b.entity : b.agentQuota })}`,
      result,
      options: [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
        { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity / a.quantity), ok: false }
      ]
    };
  } else {
    return resultAsQuestion(result);
  }
}
function solveEquationEx(a, b, last5) {
  return {
    kind: "cont",
    agent: last5.agent,
    quantity: helpers.solveLinearEquation(a.quantity, b.quantity, last5.variable),
    ...last5.entity
  };
}
function solveEquation(a, b, last5) {
  const result = solveEquationEx(a, b, last5);
  return {
    question: `Vy\u0159e\u0161 line\xE1rn\xED rovnici ${a.agent} = ${b.agent} pro nezn\xE1mou ${last5.variable}.`,
    result,
    options: []
  };
}
function toQuotaEx(a, quota3) {
  if (!isNumber(a.quantity) || !isNumber(quota3.quantity)) {
    throw "quota does not support non quantity type";
  }
  const { groupCount, remainder } = divide(a.quantity, quota3.quantity);
  return {
    kind: "quota",
    agentQuota: quota3.agent,
    agent: a.agent,
    quantity: groupCount,
    restQuantity: remainder
  };
}
function toQuota(a, quota3) {
  const result = toQuotaEx(a, quota3);
  if (isNumber(a.quantity) && isNumber(quota3.quantity) && isNumber(result.quantity)) {
    return {
      question: `Rozd\u011Bl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity, unit: a.unit })} postupn\u011B na skupiny velikosti ${formatNumber(quota3.quantity)} ${formatEntity({ entity: quota3.entity, unit: quota3.unit })}`,
      result,
      options: [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota3.quantity)}`, result: formatNumber(result.quantity), ok: true },
        { tex: `${formatNumber(quota3.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(result.quantity), ok: false }
      ]
    };
  } else {
    return resultAsQuestion(result);
  }
}
function divide(total, divisor, isPartitative = false) {
  const rawQuotient = total / divisor;
  const rawRemainder = rawQuotient % 1;
  const quotient = rawQuotient - rawRemainder;
  const remainder = isPartitative ? (divisor - Math.floor(divisor)) * rawQuotient : rawRemainder * divisor;
  const groupCount = isPartitative ? divisor : quotient;
  const groupSize = isPartitative ? rawQuotient : divisor;
  return {
    groupCount,
    groupSize,
    remainder
  };
}
function toRatiosEx(parts, whole) {
  return {
    kind: "ratios",
    parts: parts.map((d) => d.agent),
    ratios: parts.map((d) => d.quantity),
    whole
  };
}
function toRatios(parts, last5) {
  const result = toRatiosEx(parts, last5.whole);
  return {
    question: `Vyj\xE1d\u0159i pom\u011Brem mezi ${result.parts.join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `${result.ratios.map((d) => formatNumber(d)).join(":")}`, result: result.ratios.map((d) => formatNumber(d)).join(":"), ok: true },
      { tex: `${result.ratios.map((d) => formatNumber(d)).join(":")}`, result: result.ratios.map((d) => formatNumber(d)).join(":"), ok: false }
    ] : []
  };
}
function evalToQuantityEx(a, b) {
  if (!isNumber(a.quantity)) {
    throw `evalToQuantity does not support non quantity types`;
  }
  return {
    ...b.predicate,
    quantity: helpers.evalExpression(b.expression, a.quantity)
  };
}
function evalToQuantity(a, b) {
  const result = evalToQuantityEx(a, b);
  return {
    question: `Vypo\u010Dti v\xFDraz ${b.expression}?`,
    result,
    options: []
  };
}
function evalToOptionEx(a, b) {
  let valueToEval = a.quantity ?? a.ratio;
  if (!isNumber(valueToEval)) {
    throw `evalToQuantity does not support non quantity types`;
  }
  if (a.kind == "comp-ratio" && valueToEval > 1 / 2 && valueToEval < 2) {
    valueToEval = valueToEval > 1 ? valueToEval - 1 : 1 - valueToEval;
  }
  const matched = helpers.evalExpression(b.expression, valueToEval);
  return {
    kind: "eval-option",
    expression: b.expression,
    value: b.optionValue != null ? matched ? b.optionValue : null : matched
  };
}
function evalToOption(a, b) {
  const result = evalToOptionEx(a, b);
  return {
    question: b.optionValue != null ? `Vyhodno\u0165 volbu [${b.optionValue}]?` : `Vyhodno\u0165 v\xFDraz ${b.expression}?`,
    result,
    options: []
  };
}
function partToPartRuleEx(a, partToPartRatio, nth2) {
  if (!(partToPartRatio.whole != null && matchAgent(partToPartRatio.whole, a) || partToPartRatio.parts.some((d) => matchAgent(d, a)))) {
    throw `Mismatch agent ${[a.agent, a.entity].join()} any of ${[partToPartRatio.whole].concat(partToPartRatio.parts).join()}`;
  }
  const sourcePartIndex = partToPartRatio.parts.findIndex((d) => matchAgent(d, a));
  const targetPartIndex = nth2 != null ? partToPartRatio.parts.findIndex((d) => d === nth2.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;
  const partsSum = areNumbers(partToPartRatio.ratios) ? partToPartRatio.ratios.reduce((out, d) => out += d, 0) : partToPartRatio.ratios.join(" + ");
  const matchedWhole = matchAgent(partToPartRatio.whole, a);
  return {
    kind: "cont",
    agent: (matchedWhole || nth2 != null) && targetPartIndex != -1 ? partToPartRatio.parts[targetPartIndex] : partToPartRatio.whole,
    entity: a.entity,
    quantity: matchedWhole ? areNumbers(partToPartRatio.ratios) && isNumber(a.quantity) ? a.quantity / partToPartRatio.ratios.reduce((out, d) => out += d, 0) * partToPartRatio.ratios[targetPartIndex] : wrapToQuantity(`a.quantity / (${partToPartRatio.ratios.map((d, i) => `b.ratios[${i}]`).join(" + ")}) * b.ratios[${targetPartIndex}]`, { a, b: partToPartRatio }) : areNumbers(partToPartRatio.ratios) && isNumber(a.quantity) ? a.quantity / partToPartRatio.ratios[sourcePartIndex] * (nth2 != null ? partToPartRatio.ratios[targetPartIndex] : partToPartRatio.ratios.reduce((out, d) => out += d, 0)) : nth2 != null ? wrapToQuantity(`a.quantity / b.ratios[${sourcePartIndex}] * b.ratios[${targetPartIndex}]`, { a, b: partToPartRatio }) : wrapToQuantity(`a.quantity / b.ratios[${sourcePartIndex}] * (${partToPartRatio.ratios.map((d, i) => `b.ratios[${i}]`).join(" + ")})`, { a, b: partToPartRatio }),
    unit: a.unit
  };
}
function partToPartRule(a, partToPartRatio, nth2) {
  const result = partToPartRuleEx(a, partToPartRatio, nth2);
  const matchedWhole = matchAgent(partToPartRatio.whole, a);
  let sourcePartIndex = partToPartRatio.parts.findIndex((d) => matchAgent(d, a));
  const targetPartIndex = nth2 != null ? partToPartRatio.parts.findIndex((d) => d === nth2.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;
  if (sourcePartIndex == -1)
    sourcePartIndex = 0;
  const partsSum = `(${partToPartRatio.ratios.join(" + ")})`;
  return {
    question: containerQuestion(result),
    result,
    options: areNumbers(partToPartRatio.ratios) && isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} / ${partsSum} * ${formatNumber(partToPartRatio.ratios[targetPartIndex])}`, result: formatNumber(result.quantity), ok: matchedWhole },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(partToPartRatio.ratios[sourcePartIndex])} * ${nth2 != null ? partToPartRatio.ratios[targetPartIndex] : partsSum}`, result: formatNumber(result.quantity), ok: !matchedWhole }
    ] : []
  };
}
function mapRatiosByFactorEx(multi, quantity) {
  if (!areNumbers(multi.ratios)) {
    throw "ratios are not supported by non quantity types";
  }
  return { ...multi, ratios: multi.ratios.map((d) => d * quantity) };
}
function mapRatiosByFactor(multi, factor, inverse) {
  if (!areNumbers(multi.ratios) || !isNumber(factor.quantity)) {
    throw "ratios are not supported by non quantity types";
  }
  const quantity = inverse ? factor.quantity : 1 / factor.quantity;
  const result = mapRatiosByFactorEx(multi, quantity);
  return {
    question: `${quantity > 1 ? "Rozn\xE1sob " : "Zkra\u0165 "} pom\u011Br \u010D\xEDslem ${quantity > 1 ? formatNumber(quantity) : formatNumber(1 / quantity)}`,
    result,
    options: []
  };
}
function nthPartFactorByEx(multi, factor, nthPart3) {
  if (!areNumbers(multi.ratios) || !isNumber(factor)) {
    throw "ratios are not supported by non quantity types";
  }
  if (factor < 1) {
    throw `Ratios can be only extended by positive quantity ${factor}.`;
  }
  const partIndex = multi.parts.indexOf(nthPart3.agent);
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
function nthPartFactorBy(multi, factor, nthPart3) {
  if (!areNumbers(multi.ratios) || !isNumber(factor.quantity)) {
    throw "ratios are not supported by non quantity types";
  }
  const result = nthPartFactorByEx(multi, factor.quantity, nthPart3);
  return {
    question: `Vyj\xE1d\u0159i pom\u011Brem ${nthPart3.agent} ${formatNumber(factor.quantity)} ${formatEntity(factor)}`,
    result,
    options: []
  };
}
function matchAgent(d, a) {
  return d === a.agent;
}
function partEqualEx(a, b) {
  if (!isNumber(a.quantity)) {
    throw "partEqual are not supported by non quantity types";
  }
  const diff = compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, abs(a.quantity), a.entity);
  const rest = diffRuleEx(b, diff);
  if (!isNumber(rest.quantity)) {
    throw "partEqual are not supported by non quantity types";
  }
  return {
    ...rest,
    quantity: rest.quantity / 2
  };
}
function partEqual(a, b) {
  if (!isNumber(a.quantity)) {
    throw "partEqual are not supported by non quantity types";
  }
  const diff = compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, abs(a.quantity), a.entity);
  const result = partEqualEx(a, b);
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(b.quantity) && isNumber(a.quantity) && isNumber(diff.quantity) ? [
      { tex: `(${formatNumber(b.quantity)} - ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity - diff.quantity) / 2), ok: b.agent === diff.agentMinuend },
      { tex: `(${formatNumber(b.quantity)} + ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity + diff.quantity) / 2), ok: b.agent !== diff.agentMinuend }
    ] : []
  };
}
function nthTermRuleEx(a, b) {
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
function nthTermRule(a, b) {
  const result = nthTermRuleEx(a, b);
  return {
    question: `Vypo\u010Dti ${result.agent} na pozici ${a.quantity}?`,
    result,
    options: isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: formatSequence(b.type, a.quantity), result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function nthPositionRuleEx(a, b, newEntity = "nth") {
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
function nthPositionRule(a, b, newEntity = "nth") {
  const result = nthPositionRuleEx(a, b, newEntity);
  return {
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
function isQuantityPredicate(value) {
  return value.quantity != null;
}
function isRatioPredicate(value) {
  return value.ratio != null;
}
function isRatePredicate(value) {
  return value.kind === "rate";
}
function isEntityBase(value) {
  return value.entity != null;
}
function inferenceRule(...args) {
  const value = inferenceRuleEx(...args);
  return isQuestion(value) ? value.result : value;
}
function inferenceRuleWithQuestion(...args) {
  return inferenceRuleEx(...args);
}
function inferenceRuleEx(...args) {
  const [a, b, ...rest] = args;
  const last5 = rest?.length > 0 ? rest[rest.length - 1] : null;
  if (["sum", "accumulate", "slide", "product", "gcd", "lcd", "sequence"].includes(last5?.kind) || last5?.kind === "ratios" && args.length > 3) {
    const arr = [a, b].concat(rest.slice(0, -1));
    return last5.kind === "sequence" ? sequenceRule(arr) : last5.kind === "gcd" ? gcdRule(arr, last5) : last5.kind === "lcd" ? lcdRule(arr, last5) : last5.kind === "product" ? productRule(arr, last5) : ["sum", "accumulate", "slide"].includes(last5.kind) ? sumRule(arr, last5) : last5.kind === "ratios" ? toRatios(arr, last5) : null;
  } else if (a.kind === "eval-option" || b.kind === "eval-option") {
    return a.kind === "eval-option" ? evalToOption(b, a) : b.kind === "eval-option" ? evalToOption(a, b) : null;
  } else if (a.kind === "cont" && b.kind == "cont") {
    const kind = last5?.kind;
    return kind === "comp-diff" ? toComparisonDiff(a, b) : kind === "diff" ? toDifference(a, b, last5) : kind === "quota" ? toQuota(a, b) : kind === "delta" ? toDelta(a, b, last5) : kind === "pythagoras" ? pythagorasRule(a, b, last5) : kind === "rate" ? toRate(a, b) : kind === "ratios" ? toRatios([a, b], last5) : kind === "comp-ratio" ? toRatioComparison(a, b, last5) : kind === "ratio" ? toPartWholeRatio(a, b, last5) : kind === "linear-equation" ? solveEquation(a, b, last5) : toComparison(a, b);
  } else if (a.kind === "cont" && b.kind === "eval-expr") {
    return evalToQuantity(a, b);
  } else if (a.kind === "eval-expr" && b.kind === "cont") {
    return evalToQuantity(b, a);
  } else if (a.kind === "rate" && b.kind === "rate" && last5.kind === "ratios") {
    return toRatios([a, b], last5);
  } else if (a.kind === "rate" && b.kind === "rate" && last5.kind === "linear-equation") {
    return solveEquation(a, b, last5);
  } else if ((a.kind === "cont" || a.kind === "comp") && b.kind === "unit") {
    return convertToUnit(a, b);
  } else if (a.kind === "unit" && (b.kind === "cont" || b.kind === "comp")) {
    return convertToUnit(b, a);
  } else if (a.kind === "cont" && b.kind === "round") {
    return roundTo(a, b);
  } else if (a.kind === "round" && b.kind === "cont") {
    return roundTo(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-angle") {
    return compareAngleRule(a, b);
  } else if (a.kind === "comp-angle" && b.kind === "cont") {
    return compareAngleRule(b, a);
  } else if (a.kind === "ratio" && b.kind === "ratio" && a.ratio == null) {
    return toRatio(b, a.asPercent);
  } else if (a.kind === "ratio" && b.kind === "ratio" && b.ratio == null) {
    return toRatio(a, b.asPercent);
  } else if (a.kind === "ratio" && b.kind === "ratio") {
    const kind = last5?.kind;
    return kind === "diff" ? toDifferenceAsRatio(a, b, last5) : kind === "comp-ratio" ? toComparisonRatio(a, b) : toComparisonAsRatio(a, b);
  } else if (a.kind === "comp" && b.kind === "cont") {
    const kind = last5?.kind;
    return kind === "comp-part-eq" ? partEqual(a, b) : compareRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp") {
    const kind = last5?.kind;
    return kind === "comp-part-eq" ? partEqual(b, a) : compareRule(a, b);
  } else if ((a.kind === "cont" || a.kind === "quota") && b.kind == "rate") {
    return rateRule(a, b);
  } else if (a.kind === "rate" && (b.kind == "cont" || b.kind === "quota")) {
    return rateRule(b, a);
  } else if (a.kind === "comp" && b.kind == "comp-ratio") {
    return compRatioToCompRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind == "comp") {
    return compRatioToCompRule(a, b);
  } else if (a.kind === "comp" && b.kind == "ratios") {
    return compRatiosToCompRule(b, a);
  } else if (a.kind === "ratios" && b.kind == "comp") {
    return compRatiosToCompRule(a, b);
  } else if (a.kind === "proportion" && b.kind == "ratios") {
    return proportionRatiosRule(b, a);
  } else if (a.kind === "ratios" && b.kind == "proportion") {
    return proportionRatiosRule(a, b);
  } else if (a.kind === "proportion" && b.kind == "comp-ratio") {
    return proportionRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind == "proportion") {
    return proportionRule(a, b);
  } else if (a.kind === "cont" && b.kind == "quota") {
    const kind = last5?.kind;
    return kind === "rate" ? toRate(a, b) : quotaRule(a, b);
  } else if (a.kind === "quota" && b.kind == "cont") {
    const kind = last5?.kind;
    return kind === "rate" ? toRate(b, a) : quotaRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "cont") {
    return ratioCompareRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-ratio") {
    return ratioCompareRule(a, b);
  } else if (a.kind === "comp-ratio" && b.kind === "ratio") {
    return comparisonRatioRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "comp-ratio") {
    return comparisonRatioRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "ratios") {
    return a.ratio == null ? convertToCompRatio(b, a) : convertToPartToPartRatios(a, b);
  } else if (a.kind === "ratios" && b.kind === "comp-ratio") {
    return b.ratio == null ? convertToCompRatio(a, b) : convertToPartToPartRatios(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "comp-ratio" && b.ratio == null) {
    return reverseCompRatio(a, b.asPercent);
  } else if (a.kind === "comp-ratio" && b.kind === "comp-ratio" && a.ratio == null) {
    return reverseCompRatio(b, a.asPercent);
  } else if (a.kind === "comp-ratio" && b.kind === "comp-ratio") {
    return comparisonRatioTransitiveRule(a, b);
  } else if (a.kind === "cont" && b.kind === "ratio") {
    return partToWholeRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "cont") {
    return partToWholeRule(b, a);
  } else if (a.kind === "complement" && b.kind === "ratio") {
    return ratioComplementRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "complement") {
    return ratioComplementRule(b, a);
  } else if (a.kind === "nth-part" && b.kind === "ratios") {
    const kind = last5?.kind;
    return kind === "ratio" ? ratiosConvertRule(a, b, last5) : null;
  } else if (a.kind === "ratios" && b.kind === "nth-part") {
    const kind = last5?.kind;
    return kind === "ratio" ? ratiosConvertRule(b, a, last5) : null;
  } else if (a.kind === "cont" && b.kind == "ratios") {
    const kind = last5?.kind;
    return kind === "scale" ? mapRatiosByFactor(b, a) : kind === "invert-scale" ? mapRatiosByFactor(b, a, true) : kind === "nth-factor" ? nthPartFactorBy(b, a, last5) : kind === "nth-part" ? partToPartRule(a, b, last5) : partToPartRule(a, b);
  } else if (a.kind === "ratios" && b.kind == "cont") {
    const kind = last5?.kind;
    return kind === "scale" ? mapRatiosByFactor(a, b) : kind === "invert-scale" ? mapRatiosByFactor(a, b, true) : kind === "nth-factor" ? nthPartFactorBy(a, b, last5) : kind === "nth-part" ? partToPartRule(b, a, last5) : partToPartRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-diff") {
    return diffRule(a, b);
  } else if (a.kind === "comp-diff" && b.kind === "cont") {
    return diffRule(b, a);
  } else if (a.kind === "sequence" && b.kind === "cont") {
    const kind = last5?.kind;
    return kind === "nth" ? nthPositionRule(b, a, last5.entity) : nthTermRule(b, a);
  } else if (a.kind === "cont" && b.kind === "sequence") {
    const kind = last5?.kind;
    return kind === "nth" ? nthPositionRule(a, b, last5.entity) : nthTermRule(a, b);
  } else if (a.kind === "cont" && b.kind === "transfer") {
    return transferRule(a, b, "after");
  } else if (a.kind === "transfer" && b.kind === "cont") {
    return transferRule(b, a, "before");
  } else if (a.kind === "cont" && b.kind === "delta") {
    return deltaRule(a, b, "after");
  } else if (a.kind === "delta" && b.kind === "cont") {
    return deltaRule(b, a, "before");
  } else if (a.kind === "comp" && b.kind === "delta") {
    return convertCompareToDeltaEx(a, b);
  } else if (a.kind === "delta" && b.kind === "comp") {
    return convertDeltaToCompareEx(a, b);
  } else if (a.kind === "comp" && b.kind === "delta") {
    return convertCompareToDeltaEx(a, b);
  } else if (a.kind === "comp" && b.kind === "comp") {
    return compareToCompareRule(b, a);
  } else {
    return null;
  }
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
  const delta = B ** 2 - 4 * A * (C - nthTermValue);
  if (delta < 0) {
    throw new Error("No valid position exists for the given values.");
  }
  const n1 = (-B + Math.sqrt(delta)) / (2 * A);
  const n2 = (-B - Math.sqrt(delta)) / (2 * A);
  if (Number.isInteger(n1) && n1 > 0)
    return n1;
  if (Number.isInteger(n2) && n2 > 0)
    return n2;
  throw new Error("The given values do not correspond to a valid position in the sequence.");
}
function formatNumber(d) {
  return d.toLocaleString("cs-CZ", { maximumFractionDigits: 6, minimumFractionDigits: 0 });
}
function formatRatio(d, asPercent) {
  if (asPercent)
    return `${formatNumber(d * 100)} %`;
  return d > -2 && d < 2 ? helpers.convertToFraction(d) : formatNumber(d);
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
function gcdFromPrimeFactors(primeFactors) {
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
  return primeFactors.reduce((acc, curr) => intersection(acc, curr), primeFactors[0] || []);
}
function lcdFromPrimeFactors(primeFactors) {
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
  return primeFactors.reduce((acc, curr) => union(acc, curr), []);
}
function formatEntity(d) {
  return d.entity || d.unit ? `(${[d.unit, d.entity].filter((d2) => d2 != null && d2 != "").join(" ")})` : "";
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
    default:
      throw "Nezn\xE1m\xFD vztah";
  }
}
function formatSequence(type, n) {
  const simplify3 = (d, op = "") => d !== 1 ? `${d}${op}` : "";
  if (type.kind === "arithmetic")
    return `${type.sequence[0]} + ${type.commonDifference}(${formatNumber(n)}-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements(first, second, type.secondDifference);
    let parts = [`${simplify3(A, "*")}${formatNumber(n)}^2^`];
    if (B !== 0) {
      parts = parts.concat(`${simplify3(B, "*")}${formatNumber(n)}`);
    }
    if (C !== 0) {
      parts = parts.concat(`${simplify3(C, "*")}${formatNumber(n)}`);
    }
    return `${parts.map((d, i) => `${i !== 0 ? " + " : ""}${d}`).join(" ")}`;
  }
  if (type.kind === "geometric") {
    return `${simplify3(type.sequence[0], "*")}${type.commonRatio}^(${formatNumber(n)}-1)^`;
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
var unique = (value, index, array) => array.indexOf(value) === index;
function abs(v) {
  return Math.abs(v);
}
function resultAsQuestion(result) {
  return {
    question: "",
    result,
    options: []
  };
}

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
  const a = gcd2(n, d);
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
function gcd2(a, b) {
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
    a = gcd2(P["d"], P["n"]);
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
    return newFraction(gcd2(P["n"], this["n"]) * gcd2(P["d"], this["d"]), P["d"] * this["d"]);
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
    return newFraction(P["n"] * this["n"], gcd2(P["n"], this["n"]) * gcd2(P["d"], this["d"]));
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
      const gcdValue = gcd2(curN, curD);
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
  "simplify": function(eps3) {
    const ieps = BigInt(1 / (eps3 || 1e-3) | 0);
    const thisABS = this["abs"]();
    const cont2 = thisABS["toContinued"]();
    for (let i = 1; i < cont2.length; i++) {
      let s = newFraction(cont2[i - 1], C_ONE);
      for (let k = i - 2; k >= 0; k--) {
        s = s["inverse"]()["add"](cont2[k]);
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
  to(to3) {
    var _a, _b;
    if (this.origin == null)
      throw new Error(".to must be called after .from");
    this.destination = this.getUnit(to3);
    if (this.destination == null) {
      this.throwUnsupportedUnitError(to3);
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
      const ratio3 = (_b = anchor[destination.system]) === null || _b === void 0 ? void 0 : _b.ratio;
      if (typeof transform === "function") {
        result = transform(result);
      } else if (typeof ratio3 === "number") {
        result *= ratio3;
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
function Expression(tokens, parser22) {
  this.tokens = tokens;
  this.parser = parser22;
  this.unaryOps = parser22.unaryOps;
  this.binaryOps = parser22.binaryOps;
  this.ternaryOps = parser22.ternaryOps;
  this.functions = parser22.functions;
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
function TokenStream(parser22, expression) {
  this.pos = 0;
  this.current = null;
  this.unaryOps = parser22.unaryOps;
  this.binaryOps = parser22.binaryOps;
  this.ternaryOps = parser22.ternaryOps;
  this.consts = parser22.consts;
  this.expression = expression;
  this.savedPosition = 0;
  this.savedCurrent = null;
  this.options = parser22.options;
  this.parser = parser22;
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
function ParserState(parser22, tokenStream, options) {
  this.parser = parser22;
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
  var sum = 0;
  var larg = 0;
  for (var i = 0; i < arguments.length; i++) {
    var arg = Math.abs(arguments[i]);
    var div22;
    if (larg < arg) {
      div22 = larg / arg;
      sum = sum * div22 * div22 + 1;
      larg = arg;
    } else if (arg > 0) {
      div22 = arg / larg;
      sum += div22 * div22;
    } else {
      sum += arg;
    }
  }
  return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
}
function condition(cond, yep, nope) {
  return cond ? yep : nope;
}
function roundTo2(value, exp) {
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
    roundTo: roundTo2,
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
function evalExpression(expression, quantity) {
  const expr = parser.parse(expression);
  const variables = expr.variables();
  if (variables.length === 1) {
    return expr.evaluate({ [variables]: quantity });
  }
  const res = expr.simplify({ [variables[0]]: quantity });
  return res.toString();
}
function recurExpr(node) {
  const quantity = node.quantity ?? node.ratio ?? {};
  const { context, expression } = quantity;
  if (expression) {
    let expr = parser.parse(expression);
    const variables = expr.variables();
    for (let variable of variables) {
      const res = recurExpr(context[variable]);
      if (res.substitute != null) {
        expr = expr.substitute(variable, res);
      } else {
        const q = res.quantity ?? res.ratio;
        if (typeof q == "number") {
          expr = expr.simplify({ [variable]: res });
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
function toEquationExpr(lastExpr) {
  const final = recurExpr({ quantity: lastExpr });
  return parser.parse(cleanUpExpression(final));
}
function cleanUpExpression(exp) {
  const replaced = exp.toString().replaceAll(".quantity", "").replaceAll(".ratio", "").replaceAll(".baseQuantity", "");
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

// src/math/math-configure.ts
var convert = configureMeasurements({
  length: length_default,
  area: area_default,
  volume: volume_default,
  mass: mass_default,
  time: time_default
});
configure({
  convertToFraction: (d) => new Fraction(d).toFraction(),
  convertToUnit: (d, from, to3) => convert(d).from(from).to(to3),
  unitAnchor: (unit) => convert().getUnit(unit)?.unit?.to_anchor,
  solveLinearEquation: (first, second, variable) => solveLinearEquation(first, second, variable),
  evalExpression: (expression, quantity) => evalExpression(expression, quantity)
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
  const node = isPredicate(child) ? child : last(child);
  if (!(node.kind == "cont" || node.kind === "transfer" || node.kind == "comp" || node.kind === "comp-diff" || node.kind === "rate" || node.kind === "quota" || node.kind === "delta")) {
    throw `Non convertable node type: ${node.kind}`;
  }
  const typeNode = node;
  return to(child, {
    kind: "cont",
    agent,
    quantity: typeNode.quantity,
    entity: entity3 != null ? entity3.entity : typeNode.kind == "quota" ? typeNode.agentQuota : typeNode.kind == "rate" ? typeNode.entity.entity : typeNode.entity,
    unit: entity3 != null ? entity3.unit : typeNode.kind == "rate" ? typeNode.entity.unit : typeNode.unit
  });
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
var mdFormatting = {
  compose: (strings, ...args) => concatString(strings, ...args),
  formatKind: (d) => `[${d.kind.toUpperCase()}]`,
  formatQuantity: (d) => {
    if (typeof d === "number") {
      return d.toLocaleString("cs-CZ");
    } else if (typeof d === "string") {
      return d;
    } else {
      return toEquationExpr(d);
    }
  },
  formatRatio: (d, asPercent) => asPercent ? `${(d * 100).toLocaleString("cs-CZ")}%` : d.toLocaleString("cs-CZ"),
  formatEntity: (d, unit) => {
    const res = [unit, d].filter((d2) => d2 != null).join(" ");
    return isEmptyOrWhiteSpace(res) ? "" : `__${res.trim()}__`;
  },
  formatAgent: (d) => `**${d}**`,
  formatSequence: (d) => `${formatSequence2(d)}`
};
var mermaidFormatting = {
  ...mdFormatting,
  formatKind: (d) => ``
};
function formatSequence2(type) {
  const simplify3 = (d, op = "") => d !== 1 ? `${d}${op}` : "";
  if (type.kind === "arithmetic")
    return `${type.sequence.join()} => a^n^ = ${type.sequence[0]} + ${type.commonDifference}(n-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements(first, second, type.secondDifference);
    const parts = [`${simplify3(A)}n^2^`];
    if (B !== 0) {
      parts.concat(`${simplify3(B)}n`);
    }
    if (C !== 0) {
      parts.concat(`${simplify3(C)}n`);
    }
    return `${type.sequence.join()} => a^n^ = ${parts.map((d, i) => `${i !== 0 ? " + " : ""}${d}`)}`;
  }
  if (type.kind === "geometric") {
    return `${type.sequence.join()} => a^n^ = ${simplify3(type.sequence[0], "*")}${type.commonRatio}^(n-1)^`;
  }
}
function formatPredicate(d, formatting) {
  const { formatKind, formatAgent, formatEntity: formatEntity3, formatQuantity, formatRatio: formatRatio3, formatSequence: formatSequence4, compose } = { ...mdFormatting, ...formatting };
  if ((d.kind == "transfer" || d.kind === "rate" || d.kind === "quota" || d.kind === "comp-diff" || d.kind === "delta") && d.quantity == null || (d.kind == "ratio" || d.kind === "comp-ratio") && d.ratio == null || d.kind === "comp-part-eq") {
    return formatKind(d);
  }
  let result = "";
  switch (d.kind) {
    case "cont":
      result = compose`${formatAgent(d.agent)}=${formatQuantity(d.quantity)} ${formatEntity3(d.entity, d.unit)}`;
      break;
    case "comp":
      if (isNumber(d.quantity)) {
        result = d.quantity === 0 ? compose`${formatAgent(d.agentA)} je rovno ${formatAgent(d.agentB)}` : compose`${formatAgent(d.agentA)} ${d.quantity > 0 ? "v\xEDce" : "m\xE9n\u011B"} než ${formatAgent(d.agentB)} o ${formatQuantity(Math.abs(d.quantity))} ${formatEntity3(d.entity, d.unit)}`;
      } else {
        result = compose`rozdíl o ${formatQuantity(d.quantity)} ${formatEntity3(d.entity, d.unit)} mezi ${formatAgent(d.agentA)} a ${formatAgent(d.agentB)}`;
      }
      break;
    case "transfer":
      if (isNumber(d.quantity)) {
        result = d.quantity === 0 ? compose`${formatAgent(d.agentReceiver.name)} je rovno ${formatAgent(d.agentSender.name)}` : d.agentReceiver === d.agentSender ? compose`změna o ${formatQuantity(d.quantity)} ${formatEntity3(d.entity, d.unit)} mezi ${formatAgent(d.agentSender.nameBefore)} a ${formatAgent(d.agentSender.nameAfter)}` : compose`${formatQuantity(Math.abs(d.quantity))} ${formatEntity3(d.entity, d.unit)}, ${formatAgent(d.quantity > 0 ? d.agentSender.name : d.agentReceiver.name)} => ${formatAgent(d.quantity > 0 ? d.agentReceiver.name : d.agentSender.name)}`;
      } else {
        result = d.agentReceiver === d.agentSender ? compose`změna o ${formatQuantity(d.quantity)} ${formatEntity3(d.entity, d.unit)} mezi ${formatAgent(d.agentSender.nameBefore)} a ${formatAgent(d.agentSender.nameAfter)}` : compose`transfer o ${formatQuantity(d.quantity)} ${formatEntity3(d.entity, d.unit)} mezi ${formatAgent(d.agentSender.name)} a ${formatAgent(d.agentReceiver.name)}`;
      }
      break;
    case "delta":
      result = d.quantity === 0 ? compose`${formatAgent(d.agent.nameBefore ?? d.agent.name)} je rovno ${formatAgent(d.agent.nameAfter ?? d.agent.name)}` : compose`změna o ${formatQuantity(d.quantity)} ${formatEntity3(d.entity, d.unit)} mezi ${formatAgent(d.agent.nameBefore ?? d.agent.name)} a ${formatAgent(d.agent.nameAfter ?? d.agent.name)}`;
      break;
    case "comp-ratio":
      if (isNumber(d.ratio)) {
        const between = d.ratio > 1 / 2 && d.ratio < 2;
        result = between ? compose`${formatAgent(d.agentA)} ${d.ratio < 1 ? "m\xE9n\u011B" : "v\xEDce"} o ${formatRatio3(d.ratio > 1 ? d.ratio - 1 : 1 - d.ratio, d.asPercent)} než ${formatAgent(d.agentB)} ` : compose`${formatAgent(d.agentA)} ${formatRatio3(d.ratio > 1 ? Math.abs(d.ratio) : 1 / Math.abs(d.ratio), false)} krát ${d.ratio > 1 ? "v\xEDce" : "m\xE9n\u011B"} než ${formatAgent(d.agentB)} `;
      } else {
        result = compose`poměr ${formatQuantity(d.ratio)} mezi ${formatAgent(d.agentA)} a ${formatAgent(d.agentB)}`;
      }
      break;
    case "comp-diff":
      result = compose`${formatAgent(d.agentMinuend)} - ${formatAgent(d.agentSubtrahend)}=${formatQuantity(d.quantity)} ${formatEntity3(d.entity, d.unit)}`;
      break;
    case "ratio":
      result = compose`${formatAgent(d.part)} z ${formatAgent(d.whole)}=${formatRatio3(d.ratio, d.asPercent)}`;
      break;
    case "ratios":
      result = compose`${formatAgent(d.whole)} ${joinArray(d.parts?.map((d2) => formatAgent(d2)), ":")} v poměru ${joinArray(d.ratios?.map((d2) => formatQuantity(d2)), ":")}`;
      break;
    case "sum":
      result = compose`${joinArray(d.partAgents?.map((d2) => formatAgent(d2)), " + ")}`;
      break;
    case "product":
      result = compose`${joinArray(d.partAgents?.map((d2) => formatAgent(d2)), " * ")}`;
      break;
    case "rate":
      result = compose`${formatAgent(d.agent)} ${formatQuantity(d.quantity)} ${formatEntity3(d.entity.entity, d.entity.unit)} per ${isNumber(d.baseQuantity) && d.baseQuantity == 1 ? "" : formatQuantity(d.baseQuantity)} ${formatEntity3(d.entityBase.entity, d.entityBase.unit)}`;
      break;
    case "quota":
      result = compose`${formatAgent(d.agent)} rozděleno na ${formatQuantity(d.quantity)} ${formatAgent(d.agentQuota)} ${d.restQuantity !== 0 ? ` se zbytkem ${formatQuantity(d.restQuantity)}` : ""}`;
      break;
    case "sequence":
      result = compose`${d.type != null ? formatSequence4(d.type) : ""}`;
      break;
    case "nth-part":
      result = compose`${formatAgent(d.agent)}`;
      break;
    case "nth":
      result = compose`${formatEntity3(d.entity)}`;
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
      result = compose`${d.expression}`;
      break;
    case "eval-option":
      result = d.value === void 0 ? compose`${d.optionValue != null ? `Volba [${d.optionValue}]: ${d.expectedValue != null ? formatRatio3(d.expectedValue) : d.expression}` : d.expression}` : compose`${d.value === true ? "Pravda" : d.value === false ? "Nepravda" : d.value != null ? `Volba [${d.value}]` : "N/A"}`;
      break;
    default:
      break;
  }
  return compose`${formatKind(d)} ${result}`;
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
          combine(agent, [], entityPrice, entityPrice)
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
      combine("oba krajn\xED sloupce", [], entityTmave, entityTmave)
    ),
    ctor("comp-diff")
  );
  return [
    {
      deductionTree: to(
        dd1,
        commonSense("horn\xED \u0159ada tmav\xFDch \u010Dtver\u010Dk\u016F bez krajn\xEDch sloupc\u016F roz\u0161\xED\u0159en\xE9ho obrazce odpov\xEDd\xE1 po\u010Dtu sloupc\u016F z\xE1kladn\xEDho obrazce"),
        cont(base, lastQuantity(dd1), entityColumn)
      )
    },
    {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(`lev\xFD sloupec`, 3, entity3),
            cont(`prav\xFD sloupec`, 3, entity3),
            combine("oba krajn\xED sloupce", [], entity3, entity3)
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
      combine(`1. a 3. ${souteziciLabel}`, [], "", "")
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
  const pocetLabel = "cena se\u0161it\u016F v\xFDj\xE1d\u0159en\xFDch po\u010Dtem";
  const cenaLabel = "n\xE1kupu stejn\xE9ho po\u010Dtu se\u0161it\u016F";
  const ctvereckovanyPocet = axiomInput(cont(ctvereckovaniSesitLabel, 2, entity3), 1);
  return [
    {
      deductionTree: deduce(
        cont(pocetLabel, 36, entity3),
        ratios(pocetLabel, [linkovanySesitLabel, ctvereckovaniSesitLabel], [3, 1]),
        nthPart(linkovanySesitLabel)
      )
    },
    {
      deductionTree: deduce(
        deduce(
          deduce(
            axiomInput(ratios(pocetLabel, [ctvereckovaniSesitLabel, linkovanySesitLabel], [2, 3]), 2),
            proportion(true, [pocetLabel, cenaLabel])
          ),
          axiomInput(cont(cenaLabel, 180, entityPrice), 3),
          nthPart(ctvereckovaniSesitLabel)
        ),
        ctvereckovanyPocet,
        ctor("rate")
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
  const entityVaha = "kg";
  const kovyCelkem = deduce(
    cont(oddilR, 3, entityKovy),
    cont(oddilS, 3, entityKovy),
    cont(oddilT, 4, entityKovy),
    combine(`kovy v\u0161echny odd\xEDly`, [], entityVaha, entityPlast)
  );
  const papirCelkem = deduce(
    cont(oddilR, 6, entityPapir),
    cont(oddilS, 8, entityPapir),
    cont(oddilT, 1, entityPapir),
    combine(`pap\xEDr v\u0161echny odd\xEDly`, [], entityVaha, entityPlast)
  );
  const plast = deduce(
    deduce(
      cont(oddilT, 9, entityPlast),
      cont(oddilS, 11, entityPlast),
      combine(`odd\xEDl S a T`, [], entityPlast, entityPlast)
    ),
    cont(oddilR, 15, entityPlast),
    ctor("comp-ratio")
  );
  return {
    papirStoR: {
      deductionTree: deduce(
        deduce(
          cont(oddilS, 8, entityPapir),
          cont(oddilR, 6, entityPapir),
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1 / 4)
      )
    },
    papirRtoS: {
      deductionTree: deduce(
        deduce(
          cont(oddilR, 6, entityPapir),
          cont(oddilS, 8, entityPapir),
          ctor("comp-ratio")
        ),
        ctorOption("C", 1 / 4)
      )
    },
    plast1: {
      deductionTree: deduce(
        plast,
        ctorOption("D", 1 / 3)
      )
    },
    plast2: {
      deductionTree: deduce(
        plast,
        ctorBooleanOption(1 / 3)
      )
    },
    kovyToPapir: {
      deductionTree: deduce(
        deduce(
          kovyCelkem,
          papirCelkem,
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1 / 2)
      )
    },
    papirToKovy: {
      deductionTree: deduce(
        deduce(
          papirCelkem,
          kovyCelkem,
          ctor("comp-ratio")
        ),
        ctorOption("E", 1 / 2)
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
  const entity3 = "osob";
  const kapitan = axiomInput(cont(agent, input.kapitan, kapitanLabel), 1);
  const porucik = axiomInput(cont(agent, input.porucik, porucikLabel), 2);
  const cetarPerPorucik = axiomInput(rate(agent, input.cetarPerPorucik, cetarLabel, porucikLabel), 3);
  const vojinPerCetar = axiomInput(rate(agent, input.vojinPerCetar, vojinLabel, cetarLabel), 4);
  const vydaneRozkazy = combine("vydan\xE9 rozkazy", [kapitanLabel, porucikLabel, cetarLabel], entity3, entity3);
  const dostaneRozkazy = combine("p\u0159ijat\xE9 rozkazy", [porucikLabel, cetarLabel, vojinLabel], entity3, entity3);
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
    vydaneRozkazy
  );
  const dTree3 = deduce(
    porucik,
    last(pocetCetaru),
    last(pocetVojinu),
    dostaneRozkazy
  );
  const template1 = (html) => html`<br/><strong>Kolik osob v rotě dostalo rozkaz k nástupu?</strong>`;
  const template = (highlight2) => highlight2`V rotě je ${input.kapitan} kapitán a má pod sebou ${input.porucik} poručíky.Každý poručík má pod sebou ${input.cetarPerPorucik} své četaře
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
  const soucet = combine(partTotalPrice, [], "K\u010D", "K\u010D");
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
  const template = (highlight2) => highlight2`
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
var M7A_2023_default = {
  1: comparingValues({
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
  3.1: build(cetarParams)[0],
  3.2: build(cetarParams)[1],
  3.3: build(cetarParams)[2],
  4.1: example_4_1(),
  4.2: example_4_2(),
  5.1: sesity()[1],
  5.2: compass(),
  6.1: odmenySoutezici()[0],
  6.2: odmenySoutezici()[1],
  10.1: trideni_odpadu().papirStoR,
  10.2: trideni_odpadu().plast2,
  10.3: trideni_odpadu().kovyToPapir,
  11: example_11(),
  12: example_12(),
  // 13: example_13(),
  14: build2({
    input: {
      cena: 72
    }
  }),
  15.1: example_15_1(),
  15.2: example_15_2(),
  15.3: example_15_3(),
  16.1: obrazce()[0],
  16.2: obrazce()[1],
  16.3: obrazce()[2]
};
function example_4_1() {
  const entity3 = "\u017E\xE1ci";
  return {
    deductionTree: toCont(
      deduce(
        deduce(
          axiomInput(cont("pr\u016Fm\u011B\u0159", 21, entity3), 2),
          cont("po\u010Det m\xED\u010Dov\xFDch sport\u016F", 3, ""),
          product("po\u010Det v\u0161ech \u017E\xE1k\u016F m\xED\u010Dov\xE9 sporty", [], entity3, entity3)
        ),
        deduce(
          cont("volejbal", 28, entity3),
          cont("fotbal", 16, entity3),
          combine("fotbal a volejbal", [], entity3, entity3)
        ),
        ctor("comp-diff")
      ),
      { agent: "vyb\xEDjen\xE1" }
    )
  };
}
function example_4_2() {
  return {
    deductionTree: to(
      compRatio("chlapci", "d\xEDvky", 3 / 2),
      ratios("plav\xE1n\xED", ["d\xEDvky", "chlapci"], [2, 3])
    )
  };
}
function example_11() {
  const entity3 = "stup\u0148\u016F";
  const inputAngleLabel = `zadan\xFD \xFAhel`;
  const triangleSum = cont("sou\u010Det \xFAhl\u016F v troj\xFAheln\xEDku", 180, entity3);
  const triangle = "\xFAhel troj\xFAheln\xEDku ABD";
  return {
    deductionTree: deduce(
      deduce(
        toCont(
          deduce(
            triangleSum,
            deduce(
              deduce(axiomInput(cont(inputAngleLabel, 40, entity3), 2), compAngle(inputAngleLabel, `${triangle} u vrcholu B`, "alternate")),
              deduce(
                axiomInput(cont(inputAngleLabel, 70, entity3), 1),
                compAngle(inputAngleLabel, `${triangle} u vrcholu A`, "supplementary")
              ),
              combine("dvojice \xFAhl\u016F v troj\xFAheln\xEDku", [], entity3, entity3)
            ),
            ctor("comp-diff")
          ),
          { agent: `${triangle} u vrcholu D` }
        ),
        compAngle(`${triangle} u vrcholu D`, "\u03C6", "supplementary")
      ),
      ctorOption("D", 150)
    )
  };
}
function example_12() {
  const ctverecDelkaLabel = "strana \u010Dtverce";
  const entity3 = "cm";
  const entity2d = "cm2";
  const rectangleWidthLabel = "\u0161\xED\u0159ka obdeln\xEDka";
  const rectangleWidth = to(
    axiomInput(cont("nejdel\u0161\xED strana sedmi\xFAheln\xEDku", 5, entity3), 2),
    commonSense("tato d\xE9lka odpov\xEDd\xE1 \u0161\xED\u0159ce obd\xE9ln\xEDku"),
    cont(rectangleWidthLabel, 5, entity3)
  );
  const triangleHeight = to(
    commonSense("t\u0159i \u010Dtverce tvo\u0159\xED v\xFD\u0161ku troj\u016Fheln\xEDku"),
    cont("v\xFD\u0161ka \u0161ed\xE9ho troj\xFAheln\xEDku", 3, entity3)
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(cont(ctverecDelkaLabel, 1, entity3), 1),
          cont("po\u010Det \u010Dtverc\u016F", 3, ""),
          product("obsah t\u0159i shodn\xE9 \u010Dtverce", [], entity2d, entity3)
        ),
        deduce(
          rectangleWidth,
          deduce(
            last(rectangleWidth),
            compDiff(rectangleWidthLabel, "v\xFD\u0161ka obdeln\xEDku", 3, entity3)
          ),
          product("obsah obdeln\xEDku", [], entity2d, entity3)
        ),
        deduce(
          deduce(
            triangleHeight,
            deduce(
              last(rectangleWidth),
              compDiff(rectangleWidthLabel, "z\xE1kladna \u0161ed\xE9ho troj\xFAheln\xEDku", 1, entity3)
            ),
            cont("polovina", 1 / 2, ""),
            product("obsah \u0161ed\xE9ho troj\xFAheln\xEDku", [], entity2d, entity3)
          ),
          cont("po\u010Det \u0161ed\xFDch troj\xFAhlen\xEDk\u016F", 3, ""),
          product("obsah t\u0159\xED \u0161ed\xFDch troj\xFAheln\xEDku", [], entity2d, entity2d)
        ),
        combine("obsah sedmi\xFAheln\xEDku", [], entity2d, entity2d)
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
          combine("p\u0159i\u0161lo celkem", [], entity3, entity3)
        ),
        ctor("comp-diff")
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
  const rozdil = deduce(
    a,
    b,
    ctor("comp-diff")
  );
  return {
    deductionTree: deduce(
      deduce(
        a,
        b,
        combine("sou\u010Det", ["a", "b"], entity3, entity3)
      ),
      to(
        rozdil,
        cont("rozd\xEDl", lastQuantity(rozdil), entity3)
      ),
      ctor("comp-ratio")
    )
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
  const entity3 = "";
  const unit2d = "cm2";
  const unit = "cm";
  const ctverec = axiomInput(cont("\u010Dtverec a", input.ctverec.a, entity3, unit), 3);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(cont("obd\xE9ln\xEDk a", input.obdelnik.a, entity3, unit), 1),
          axiomInput(cont("obd\xE9ln\xEDk b", input.obdelnik.b, entity3, unit), 2),
          product("obsah obd\xE9ln\xEDk", ["a", "b"], unit2d, entity3)
        ),
        deduce(
          ctverec,
          ctverec,
          product("obsah \u010Dtverec", ["a", "a"], unit2d, entity3)
        ),
        ctor("comp-ratio")
      ),
      ctorOption("D", 12)
    )
  };
}

// src/math/cislaNaOse.ts
function cislaNaOse({ mensi, vetsi, pocetUseku }) {
  const entityLength = "d\xE9lka";
  const entity3 = "\xFAsek";
  const rozdil = deduce(
    vetsi,
    mensi
  );
  const usekRate = deduce(
    to(
      rozdil,
      cont("vzd\xE1lenost mezi zadan\xFDmi \u010D\xEDsly", lastQuantity(rozdil), entityLength)
    ),
    pocetUseku,
    ctor("rate")
  );
  return usekRate;
}

// src/math/M7A-2024/3.ts
function triCislaNaOse({ input }) {
  const entityLength = "d\xE9lka";
  const entity3 = "\xFAsek";
  const mensi = axiomInput(cont("men\u0161\xED zadan\xE9 \u010D\xEDslo", input.mensiCislo, entityLength), 1);
  const vetsi = axiomInput(cont("v\u011Bt\u0161\xED zadnan\xE9 \u010D\xEDslo", input.vetsiCislo, entityLength), 2);
  const pocetUseku = axiomInput(cont("vzd\xE1lenost mezi zadan\xFDmi \u010D\xEDsly", input.pocetUsekuMeziCisly, "\xFAsek"), 3);
  const positionA = axiomInput(cont("posun A", input.A, entity3), 1);
  const positionB = axiomInput(cont("posun B", input.B, entity3), 1);
  const positionC = axiomInput(cont("posun C", input.C, entity3), 1);
  const usekRate = cislaNaOse({ mensi, vetsi, pocetUseku });
  const rozdilPostion = deduce(positionB, positionA, ctor("comp-diff"));
  const dd1 = deduce(deduce(positionC, usekRate), mensi, combine("pozice C", [], entityLength, entityLength));
  const dd2 = deduce(deduce(deduce(positionB, last(usekRate)), mensi, combine("pozice B", [], entityLength, entityLength)), mensi, ctor("comp-ratio"));
  const dd3 = deduce(to(rozdilPostion, cont("rozd\xEDl", lastQuantity(rozdilPostion), entity3)), last(usekRate));
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
    combine("vedouc\xEDch a instruktor\u016F", [vedouciLabel, instruktorLabel], entity3, entity3)
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
  const templateBase = (highlight2) => highlight2`Na letním táboře jsou kromě dětí také instruktoři, vedoucí, kuchařky a ${input.zdravotnik} zdravotník.
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
    pocetVedoucichAInstruktoru: { deductionTree: deduce(dTree1, ctorBooleanOption(22)), template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template1}` },
    porovnaniInstrukturuAKucharek: { deductionTree: deduce(dTree2, ctorBooleanOption(4)), template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template2}` },
    pocetDeti: { deductionTree: deduce(dTree3, ctorBooleanOption(64)), template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template3}` }
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
  const dd1 = inferenceRule(dvojice, trojice, ctverice, petice, nasobek);
  const rozdil = axiomInput(compDiff("po\u010Det sportovc\u016F", lcdLabel, 1, entity3), 5);
  const dd2 = inferenceRule(dd1, rozdil);
  const deductionTree = deduce(
    deduce(
      dvojice,
      trojice,
      ctverice,
      petice,
      nasobek
    ),
    rozdil
  );
  const template = (highlight2) => highlight2`Počet sportovců na závodech byl více než 1 a zároveň méně než 90. 
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
  const template = (highlight2) => highlight2`V ohradě pobíhali králíci a slepice.
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
var M7A_2024_default = {
  1.1: porovnatAaB({ input: { a: 1.6, b: -1.2 } }),
  1.2: najitMensiCislo({ input: { zadane: 7 / 8, mensiO: 0.093 } }),
  3.1: triCislaNaOse({ input: osaParams }).C,
  3.2: triCislaNaOse({ input: osaParams }).B,
  3.3: triCislaNaOse({ input: osaParams }).rozdil,
  5.1: krouzky().divkyAnglictina,
  5.2: krouzky().pocetZaku,
  6: build4({ input: {} }),
  10.1: build3(letniTaborInput).pocetVedoucichAInstruktoru,
  10.2: build3(letniTaborInput).porovnaniInstrukturuAKucharek,
  10.3: build3(letniTaborInput).pocetDeti,
  11: build5({
    input: {
      kralikuMene: 5,
      pocetHlav: 37
    }
  }),
  13: porovnatObsahObdelnikACtverec({
    input: {
      obdelnik: { a: 36, b: 12 },
      ctverec: { a: 6 }
    }
  }),
  14: angle(),
  15.1: koupaliste(),
  15.2: cestovni_kancelar(),
  15.3: pozemek()
};
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
      combine(`zadan\xE9 \xFAdaje`, [], entityPercent2, entityPercent2)
    ),
    ctor("comp-diff")
  );
  const celekPocet = deduce(
    to(florbalDiff, percent("celek", "florbal", lastQuantity(florbalDiff))),
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
        ctor("comp-diff")
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
function angle() {
  const entity3 = "stup\u0148\u016F";
  const betaEntity = "beta \xFAhel";
  const inputAngleLabel = `zadan\xFD \xFAhel`;
  const triangleSumLabel = "sou\u010Det \xFAhl\u016F v troj\xFAheln\xEDku";
  const triangleSum = cont(triangleSumLabel, 180, entity3);
  const triangle = "\xFAhel troj\xFAheln\xEDku ABC";
  const doubleBeta = deduce(
    cont(inputAngleLabel, 2, betaEntity),
    compAngle(inputAngleLabel, `${triangle} u vrcholu A`, "alternate")
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            toCont(
              deduce(
                triangleSum,
                deduce(
                  axiomInput(cont(inputAngleLabel, 105, entity3), 1),
                  compAngle(inputAngleLabel, `${triangle} u vrcholu C`, "supplementary")
                ),
                ctor("comp-diff")
              ),
              { agent: `beta` }
            ),
            deduce(
              doubleBeta,
              cont(`${triangle} u vrcholu B`, 1, betaEntity),
              combine("beta", [], betaEntity, betaEntity)
            ),
            ctor("rate")
          ),
          last(doubleBeta)
        ),
        compAngle(`${triangle} u vrcholu A`, "alfa", "supplementary")
      ),
      ctorOption("B", 110)
    )
  };
}

// src/math/M7A-2025/index.ts
var M7A_2025_default = {
  1.1: ceremonial().polovina,
  1.2: ceremonial().pocetMinut,
  4.1: asistencniPes().bara,
  4.2: asistencniPes().rozdilBaraACyril,
  4.3: asistencniPes().sum,
  6.1: karticky().petr,
  11: tornado(),
  12: cestaKeStudance().meritko,
  13: cestaKeStudance().delkaTrasa
};
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
      deductionTree: dobaPrvniPulka
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
          combine("konec promitani", [], { entity: entity3, unit }, { entity: entity3, unit })
        ),
        ctorDifference("rozdil")
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
  const adamEqualBaraL = `1/3 ${adamL} = 1/2 ${baraL}`;
  const baraEqualCyrilL = `1/3 ${baraL} = 1/2 ${cyrilL}`;
  const baraPolovina = ratio(baraL, adamEqualBaraL, 1 / 2);
  const baraTretina = ratio(baraL, baraEqualCyrilL, 1 / 3);
  const adamTretina = ratio(adamL, adamEqualBaraL, 1 / 3);
  const cyrilPolovina = ratio(cyrilL, baraEqualCyrilL, 1 / 2);
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
    deduce(baraDilku, baraTretina),
    cyrilPolovina
  );
  const bara = deduce(
    deduce(
      adamDilku,
      baraDilku,
      ctor("comp-ratio")
    ),
    adamToBara
  );
  const rate3 = deduce(
    cont("rozd\xEDl", 300, entity3),
    deduce(
      last(adamDilku),
      last(baraDilku),
      ctorDifference("rozd\xEDl")
    ),
    ctor("rate")
  );
  const cyril = deduce(rate3, cyrilDilku);
  const adam = deduce(rate3, last(adamDilku));
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
        combine("dohromady", [], entity3, entity3)
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
var M7B_2025_default = {
  1: hledaneCislo(),
  2: pomer(),
  4.1: vodniNadrz().pomer,
  4.2: vodniNadrz().pocetCerpadel,
  4.3: vodniNadrz().pocetHodin,
  5.1: zaciSkupiny().dvojic,
  5.2: zaciSkupiny().zaku,
  13: kapesne().utratila,
  14: kapesne().usetrila,
  15.1: cislo(),
  15.2: zahradnictvi(),
  15.3: predstaveni()
};
function hledaneCislo() {
  const entity3 = "";
  const prvniL = "prvn\xED";
  const druhyL = "druh\xFD";
  const prvniRelative = cont(prvniL, 1 / 8, entity3);
  const druhyRelative = cont(druhyL, 1 / 2, entity3);
  const prvni = cont(prvniL, 1, entity3);
  const druhy = cont(druhyL, 16, entity3);
  return {
    deductionTree: deduce(
      deduce(
        prvniRelative,
        druhyRelative,
        ctor("comp-ratio")
      ),
      deduce(
        prvni,
        druhy
      )
    )
  };
}
function pomer() {
  const entity3 = "";
  const a3 = cont("3. \u010D\xEDslo", 72, entity3);
  const a4 = cont("4. \u010D\xEDslo", 108, entity3);
  const sousedniCislaPomerLabel = "sousedn\xED \u010D\xEDsla";
  const sousedniCislaPomer = deduce(
    deduce(
      a3,
      a4,
      ctorRatios(sousedniCislaPomerLabel)
    ),
    deduce(a3, a4, gcd("nejv\u011Bt\u0161\xED spole\u010Dn\xFD n\xE1sobek", entity3)),
    ctor("invert-scale")
  );
  const createRatios = (treeNode, n1, n2) => {
    const newRatio = last(treeNode);
    return {
      ...newRatio,
      parts: [`${n1}. \u010D\xEDslo`, `${n2}. \u010D\xEDslo`]
    };
  };
  return {
    deductionTree: to(
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
      commonSense(""),
      deduce(
        deduce(
          createRatios(sousedniCislaPomer, 4, 5),
          a4,
          nthPart("5. \u010D\xEDslo")
        ),
        createRatios(sousedniCislaPomer, 5, 6),
        nthPart("6. \u010D\xEDslo")
      ),
      commonSense("hledan\xE1 \u010D\xEDsla jsou 1. \u010D\xEDslo a 6. \u010D\xEDslo")
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
  const entityDvojic = "dvojic";
  const entityTrojic = "trojic";
  const entity3 = "\u017E\xE1k\u016F";
  const pomer2 = deduce(
    deduce(
      cont("dvojice", 3, entityGroup),
      cont("trojice", 2, entityGroup),
      ctorRatios("rozlo\u017Een\xED p\u0159i rovnosti")
    ),
    deduce(
      deduce(
        cont("dvojice", 3, entityGroup),
        cont("trojice", 2, entityGroup),
        ctorDifference("jednotkov\xFD rozd\xEDl p\u0159i rovnosti")
      ),
      cont("rozd\xEDl p\u0159i rovnosti", 2, entityGroup),
      product("rozd\xEDl p\u0159i rovnosti", [], entityGroup, entityGroup)
    ),
    ctor("scale")
  );
  const dvojic = deduce(
    to(
      pomer2,
      cont("skupina dvojic", 6, entityDvojic)
    ),
    cont("zb\xFDvaj\xEDc\xED \u017E\xE1ci", 1, entityDvojic),
    combine("skupina dvojic", [], entityDvojic, entityDvojic)
  );
  return {
    dvojic: {
      deductionTree: dvojic
    },
    zaku: {
      deductionTree: deduce(
        deduce(
          last(dvojic),
          rate("skupina", 2, entity3, entityDvojic)
        ),
        deduce(
          to(
            last(pomer2),
            cont("skupina trojic", 4, entityTrojic)
          ),
          rate("skupina", 3, entity3, entityTrojic)
        ),
        combine("celkem", [entityDvojic, entityTrojic], entity3, entity3)
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
        ctorOption("B", 2 / 3)
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
            combine("dohromady", [kopretinyLabel, hvozdikyLabel], entity3, entity3)
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
          combine("celkem", [detiLabel, dospeliLabel], entity3, entity3)
        ),
        ctorPercent()
      ),
      ctorOption("C", 36, { asPercent: true })
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
var M5A_2023_default = {
  2.1: comparingValues({
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
  2.2: hledani_cisel({
    input: {
      value: 180
    }
  }),
  3.1: build(cetarParams2)[0],
  3.2: build(cetarParams2)[1],
  3.3: build(cetarParams2)[2],
  4.1: sesity()[0],
  4.2: sesity()[1],
  4.3: compass(),
  5.1: klubSEN().jedenKrouzek,
  5.2: klubSEN().klub,
  6.1: odmenySoutezici()[0],
  6.2: odmenySoutezici()[1],
  8.1: desitiuhelnik().whiteTriangle,
  8.2: desitiuhelnik().grayRectangle,
  8.3: desitiuhelnik().grayTriangle,
  9: build2({
    input: {
      cena: 72
    }
  }),
  11: stavebnice().cube,
  12: stavebnice().minimalCube,
  13.1: trideni_odpadu().papirRtoS,
  13.2: trideni_odpadu().plast1,
  13.3: trideni_odpadu().papirToKovy,
  14.1: obrazce()[0],
  14.2: obrazce()[1],
  14.3: obrazce()[2]
};
function hledani_cisel({ input }) {
  const entity3 = "";
  return {
    deductionTree: deduce(
      to(
        axiomInput(cont("zadan\xE1 hodnota", input.value, entity3), 1),
        commonSense(`rozklad na prvo\u010D\xEDsla:${primeFactorization([input.value]).join(",")}`),
        commonSense(`rozd\u011Bl\xEDm na 2 skupiny, tak aby bylo lehce d\u011Bliteln\xE9 6`),
        commonSense("prvni skupina 2 x 3 = 6, resp. \u010D\xEDslo zv\u011Bt\u0161en\xE9 = 6 x 2"),
        commonSense("druhe skupina 2 x 3 x 5 = 30, resp. \u010D\xEDslo zmen\u0161en\xE9 = 30 / 6 = 5"),
        cont("prvni zm\u011Bn\u011Bn\xE9 \u010D\xEDslo", 12, entity3)
      ),
      cont("druhe zm\u011Bn\u011Bn\xE9 \u010Dislo", 5, entity3),
      product("sou\u010Din", [], entity3, entity3)
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
      combine("celkem u\u010Dastn\xEDk\u016F", [], entity3, entity3)
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
      combine("nav\u0161t\u011Bvuje v\xEDce krou\u017Ek\u016F", [], entity3, entity3)
    ),
    ctor("comp-diff")
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
        combine("po\u010Det d\u011Bt\xED", [], entity3, entity3)
      )
    }
  };
}
function desitiuhelnik() {
  const squareSizeLabel = "strana \u010Dtverce";
  const entity3 = "cm";
  const entity2d = "cm2";
  const rectangleWidthLabel = "\u0161\xED\u0159ka obdeln\xEDka";
  const triangleWidthLabel = " nejdel\u0161\xED stran\u011B troj\xFAheln\xEDku";
  const squareSize = to(
    axiomInput(cont("nejkrat\u0161\xED strana desiti\xFAheln\xEDk", 4, entity3), 1),
    commonSense("tato d\xE9lka odpov\xEDd\xE1 stran\u011B \u010Dtverce"),
    cont(squareSizeLabel, 4, entity3)
  );
  const rectangleWidth = to(
    axiomInput(cont("nejdel\u0161\xED strana desiti\xFAheln\xEDk", 20, entity3), 2),
    commonSense("tato d\xE9lka odpov\xEDd\xE1 \u0161\xED\u0159ce obd\xE9ln\xEDku"),
    cont(rectangleWidthLabel, 20, entity3)
  );
  const whiteTriangle = to(
    commonSense("2 \u010Dtverce tvo\u0159\xED v\xFD\u0161ku b\xEDl\xE9ho rovnostrann\xE9ho troj\xFAheln\xEDku"),
    cont("v\xFD\u0161ka \u0161ed\xE9ho troj\xFAheln\xEDku", 2 * 4, entity3)
  );
  const triangleHeight = to(
    commonSense("t\u0159i \u010Dtverce tvo\u0159\xED nejkrat\u0161\xED stran\u011B troj\xFAheln\xEDku"),
    cont("v\xFD\u0161ka \u0161ed\xE9ho troj\xFAheln\xEDku", 3 * 4, entity3)
  );
  const triangleWidth = to(
    axiomInput(cont("nejdel\u0161\xED strana desiti\xFAheln\xEDk", 20, entity3), 2),
    commonSense("tato d\xE9lka odpov\xEDd\xE1 nejdel\u0161\xED stran\u011B troj\xFAheln\xEDku"),
    cont(triangleWidthLabel, 20, entity3)
  );
  const whiteTriangleSize = to(
    squareSize,
    commonSense("2 \u010Dtverce tvo\u0159\xED stranu b\xEDl\xE9ho rovnostrann\xE9ho troj\xFAheln\xEDku"),
    cont("strana b\xEDl\xFD troj\xFAheln\xEDk", 2 * 4, entity3)
  );
  return {
    whiteTriangle: {
      deductionTree: deduce(
        deduce(
          whiteTriangleSize,
          cont("po\u010Det stran troj\xFAheln\xEDku", 3, ""),
          product("obvod", [], entity3, entity3)
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
              cont("v\xFD\u0161ka \u0161ed\xE9ho obdeln\xEDku", 8, entity3)
            ),
            cont("po\u010Det", 2, ""),
            product("horn\xED a doln\xED strana", [], entity3, entity3)
          ),
          deduce(
            rectangleWidth,
            cont("po\u010Det", 2, ""),
            product("lev\xE1 a prav\xE1 strana", [], entity3, entity3)
          ),
          combine("obvod", [], entity3, entity3)
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
          combine("obvod", [], entity3, entity3)
        ),
        ctorBooleanOption(50, "greater")
      )
    }
  };
}
function stavebnice() {
  const entity3 = "cm";
  const cube = ({ length, width, height }) => ({
    length: cont("d\xE9lka", length, entity3),
    width: cont("\u0161\xED\u0159ka", width, entity3),
    height: cont("v\xFD\u0161ka", height, entity3)
  });
  const base = cube({ length: 4, width: 4, height: 6 });
  const inputCube = cube({ length: 8, width: 12, height: 16 });
  const minimalSize = deduce(
    base.length,
    base.width,
    base.height,
    lcd("nejmen\u0161\xED mo\u017En\xE1 velikost strany krychle", entity3)
  );
  return {
    cube: {
      deductionTree: deduce(
        deduce(
          deduce(
            inputCube.length,
            inputCube.width,
            inputCube.height,
            product("objem", [], "cm3", entity3)
          ),
          deduce(
            base.length,
            base.width,
            base.height,
            product("objem", [], "cm3", entity3)
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
            product("objem", [], "cm3", entity3)
          ),
          deduce(
            base.length,
            base.width,
            base.height,
            product("objem", [], "cm3", entity3)
          ),
          ctor("rate")
        ),
        ctorOption("D", 18)
      )
    }
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
var M5A_2024_default = {
  3: souctovyTrojuhelnik(),
  4.1: giftAndBox(),
  4.2: lukasAccount(),
  4.3: appleBox(),
  5.1: timeUnitSum(),
  5.2: distanceUnitCompareDiff(),
  6.1: dveCislaNaOse(dveCislaNaOseParams).XandY,
  6.2: dveCislaNaOse(dveCislaNaOseParams).posun,
  9: novorocniPrani(),
  11: sestiuhelnik(),
  12.1: vyvojObyvatel().panov,
  12.2: vyvojObyvatel().lidov,
  12.3: vyvojObyvatel().damov,
  13.1: carTrip().pocatekCesty,
  13.2: carTrip().zeleznicniPrejezd,
  13.3: carTrip().konecCesty,
  14.1: pyramida().floor8,
  14.2: pyramida().floor7,
  14.3: pyramida().stairs
};
function souctovyTrojuhelnik() {
  const entity3 = "velikost";
  const zbytekKRozdeleni = "zbytek k rozd\u011Blen\xED";
  return {
    deductionTree: deduce(
      deduce(
        cont("zadan\xE1 hodnota v poli v t\u0159et\xED \u0159ad\u011B troj\xFAheln\xEDku", 25, entity3),
        cont("zadan\xE1 hodnota v poli v prvn\xED \u0159ad\u011B", 7, entity3),
        ctorDifference(zbytekKRozdeleni)
      ),
      to(
        cont("hledan\xFDch \u010D\xEDsla v \u0161ed\xFDch pol\xEDch v prvn\xED \u0159ad\u011B", 2, "\u010D\xEDsel"),
        commonSense("sou\u010Dtov\xFD troj\xFAheln\xEDk obsahuje 3 \u0159ady, kde jsou 3 pole, pot\xE9 2 pole a 1 pole ve spodn\xED \u0159ad\u011B"),
        commonSense("Ka\u017Ed\xE9 \u010D\xEDslo je sou\u010Dtem dvou \u010D\xEDsel nad n\xEDm."),
        commonSense("hledan\xFDch \u010D\xEDslo napravo je zapo\u010D\xEDt\xE1no 2 kr\xE1t, proto\u017Ee je pou\u017Eito v lev\xE9m i prav\xE9m sou\u010Dtu v prost\u0159edn\xED \u0159ad\u011B"),
        cont(zbytekKRozdeleni, 3, "\u010D\xEDsel")
      ),
      ctor("rate")
    )
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
  const moneyIn = deduce(grandMotherIn, pocketMoneyIn, combine("p\u0159ijato", [], entity3, entity3));
  const moneyOut = deduce(bookCostOut, fatherGiftOut, combine("vyd\xE1no", [], entity3, entity3));
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
        combine("celkem", [], { entity: entity3, unit: minutes }, { entity: entity3, unit: minutes })
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
  const entityLength = "d\xE9lka";
  const entity3 = "\xFAsek";
  const mensi = axiomInput(cont("men\u0161\xED zadan\xE9 \u010D\xEDslo", input.mensiCislo, entityLength), 1);
  const vetsi = axiomInput(cont("v\u011Bt\u0161\xED zadnan\xE9 \u010D\xEDslo", input.vetsiCislo, entityLength), 2);
  const pocetUseku = axiomInput(cont("vzd\xE1lenost mezi zadan\xFDmi \u010D\xEDsly", input.pocetUsekuMeziCisly, "\xFAsek"), 3);
  const positionX = axiomInput(cont("posun X", input.X, entity3), 1);
  const positionY = axiomInput(cont("posun Y", input.Y, entity3), 1);
  const usekRate = cislaNaOse({ mensi, vetsi, pocetUseku });
  const dd1 = deduce(deduce(positionX, usekRate), mensi, combine("pozice X", [], entityLength, entityLength));
  const dd2 = deduce(deduce(positionY, last(usekRate)), mensi, combine("pozice Y", [], entityLength, entityLength));
  const zeroPositionPosun = deduce(mensi, usekRate);
  return { "XandY": { deductionTree: to(dd1, dd2) }, "posun": { deductionTree: zeroPositionPosun } };
}
function novorocniPrani() {
  const entity3 = "p\u0159\xE1n\xED";
  const entityBase = "minuty";
  const spolecne = cont("spole\u010Dn\u011B", 120, entity3);
  return {
    deductionTree: deduce(
      deduce(
        spolecne,
        deduce(
          deduce(cont("Tereza", 14, entity3), cont("Tereza", 5, entityBase), ctor("rate")),
          deduce(cont("Nikola", 10, entity3), cont("Nikola", 5, entityBase), ctor("rate")),
          combine("spole\u010Dn\u011B", [], entity3, entity3)
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
          deduce(last(pocatek), dobaCesta, combine("\u010Das odjezdu", [], entity3, entity3)),
          cont("posun odjezdu o", 6, entity3),
          combine("posunut\xFD \u010Das p\u0159\xEDjezdu", [], entity3, entity3)
        ),
        ctorOption("A", 30)
      )
    }
  };
}
function sestiuhelnik() {
  const entity3 = "troj\xFAhlen\xEDk";
  const entity2d = "cm2";
  const dark = cont("tmav\xE1 \u010D\xE1st", 2, entity3);
  const obsah = cont("tmav\xE1 \u010D\xE1st", 112, entity2d);
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
        to(
          cont("p\u0159\xEDr\u016Fstek 2021", 10, entity3)
        ),
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
          combine("zm\u011Bna obyvatel", ["2019", "2020", "2021", "2022"], entity3, entity3)
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
          commonSense(`rozklad na prvo\u010D\xEDsla:${primeFactorization([pyramida90.quantity]).join(",")}`),
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
var M5A_2025_default = {
  3.1: jizdniKolo().a,
  3.2: jizdniKolo().b,
  4.1: kulicka().pocet,
  4.2: kulicka().hmotnost,
  5.1: patrovyDum().druhePatroChlapci,
  5.2: patrovyDum().prvniPatroPocetDeti,
  5.3: patrovyDum().pocetDivek,
  6.1: domecek().obvod,
  6.2: domecek().kratsiStranaObdelni,
  9: farmar(),
  10: penize(),
  14.1: poutnik().prvniKouzlo,
  14.2: poutnik().druheKouzlo,
  14.3: poutnik().maximumKouzel
};
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
        combine("celkem", [], entityBase, entityBase)
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
          to(
            janaRatio,
            deduce(
              janaRatio,
              ivoCompare
            ),
            ratio("celkem", "Ivo + Jana", 3 / 5)
          ),
          ctorComplement("Eva")
        ),
        eva
      ),
      ctorOption("B", 600)
    )
  };
}
function domecek() {
  const entity3 = "d\xE9lka";
  const unit = "cm";
  const dumLabel = "dome\u010Dek";
  const strechaLabel = "st\u0159echa";
  const onlyStrechLabel = `${strechaLabel} bez spole\u010Den\xE9 \u010D\xE1sti`;
  const sharedLabel = "sd\xEDlen\xE1 \u010D\xE1st mezi p\u0159izem\xED a st\u0159echa";
  const prizemiLabel = "p\u0159\xEDzem\xED";
  const onlyPrizemiLabel = `${prizemiLabel} bez spole\u010Den\xE9 \u010D\xE1sti`;
  const kratsiStranaLabel = "krat\u0161\xED strana obdeln\xEDku";
  const delsiStranLabel = "del\u0161\xED strana obdeln\xEDku";
  const dum = cont(dumLabel, 24, entity3, unit);
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
            cont(farmaPuvodneLabel, 2, "doba", "den"),
            product(farmaNove, [], { entity: entity3, unit }, { entity: entity3, unit })
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
      combine("celkem", [], entity3, entity3)
    ),
    ratiosKvP
  );
  const kouzelnik2 = deduce(
    deduce(
      last(kouzelnik1),
      cont("poutn\xEDk", lastQuantity(kouzelnik1), entity3),
      combine("celkem", [], entity3, entity3)
    ),
    ratiosKvP
  );
  return {
    prvniKouzlo: {
      deductionTree: deduce(
        toCont(kouzelnik, { agent: "kouzeln\xEDk p\u016Fvodn\u011B" }),
        toCont(kouzelnik1, { agent: "kouzeln\xEDk po 1.kouzle " }),
        ctorDelta("kouzeln\xEDk")
      )
    },
    druheKouzlo: {
      deductionTree: deduce(
        deduce(
          deduce(
            last(kouzelnik1),
            cont("poutn\xEDk", lastQuantity(kouzelnik1), entity3),
            combine("celkem", [], entity3, entity3)
          ),
          last(ratiosKvP),
          nthPart("poutn\xEDk")
        ),
        cont("dvojn\xE1sobek", 2, ""),
        product("poutn\xEDk", [], entity3, entity3)
      )
    },
    maximumKouzel: {
      deductionTree: to(
        commonSense("\u010D\xE1stka mus\xED b\xFD d\u011Bliteln\xE1 3, tak aby \u0161lo rozd\u011Blit v pom\u011Bru 1:2, resp. aby \u010D\xE1sti byla cel\xE1 \u010D\xEDsla"),
        deduce(
          deduce(
            deduce(
              last(kouzelnik2),
              cont("poutn\xEDk", lastQuantity(kouzelnik2), entity3),
              combine("celkem", [], entity3, entity3)
            ),
            last(ratiosKvP),
            nthPart("poutn\xEDk")
          ),
          cont("dvojn\xE1sobek", 2, ""),
          product("poutn\xEDk", [], entity3, entity3)
        )
      )
    }
  };
}

// src/math/M5B-2025/index.ts
var M5B_2025_default = {
  1.1: hledaneCisla().cislo1,
  1.2: hledaneCisla().cislo2,
  1.3: hledaneCisla().cisla3,
  3.1: koralky().celkem,
  3.2: koralky().porovnani4To2,
  3.3: koralky().cerneKoralky,
  4.1: restaurace().celkemStolu,
  4.2: restaurace().celkemMist,
  10: zahon().yellow,
  11: zahon().velvet,
  14.1: ctverce().obvodObrazec2,
  14.2: ctverce().obrazecWidthToLength
};
function hledaneCisla() {
  const entity3 = "";
  const unknownNumberLabel = "nezn\xE1m\xE9 \u010D\xEDslo";
  const prvniL = "prvn\xED";
  const druhyL = "druh\xFD";
  const soucet = toCont(
    deduce(
      cont("sou\u010Det", 109, entity3),
      cont("sou\u010Det", 2, "nezn\xE1m\xE9 \u010D\xEDslo"),
      ctor("rate")
    ),
    { agent: "schodn\xE1 nezn\xE1m\xE1 \u010D\xEDsla" }
  );
  const rozdil = toCont(deduce(
    cont("rozd\xEDl", 13, entity3),
    cont("rozd\xEDl", 2, "druh\xE9 nezn\xE1m\xE9 \u010D\xEDslo"),
    ctor("rate")
  ), { agent: "polovina rozd\xEDlu" });
  return {
    cislo1: {
      deductionTree: deduce(
        deduce(
          toCont(deduce(
            cont("zn\xE1m\xFD v\xFDsledek", 20, entity3),
            cont("zn\xE1m\xFD v\xFDsledek", 2, "n\xE1sobek"),
            ctor("rate")
          ), { agent: "\u010D\xEDslo bez zdojn\xE1soben\xED" }),
          cont("opak p\u0159i\u010Dten\xE9 \u010D\xEDslo", 3, entity3),
          ctorDifference("\u010D\xEDslo bez p\u0159i\u010Dten\xE9ho \u010D\xEDsla 3")
        ),
        cont("opak d\u011Blen\xED", 7, entity3),
        product("nezn\xE1n\xE9 \u010D\xEDslo", [], entity3, entity3)
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
      deductionTree: to(
        soucet,
        commonSense("abychom zachovali sou\u010Det a z\xE1rove\u0148 vzniknul po\u017Eadovan\xFD rozd\xEDl"),
        rozdil,
        commonSense("prvn\xED nezn\xE1m\xE9 \u010D\xEDslo zv\xFD\u0161\xEDme o polovinu rozd\xEDlu"),
        cont("prvn\xED nezn\xE1m\xE9 \u010D\xEDslo", lastQuantity(soucet) + lastQuantity(rozdil), entity3),
        commonSense("druh\xE9 nezn\xE1m\xE9 \u010D\xEDslo sn\xED\u017E\xEDme o polovinu rozd\xEDlu"),
        cont("druh\xE9 nezn\xE1m\xE9 \u010D\xEDslo", lastQuantity(soucet) - lastQuantity(rozdil), entity3)
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
    combine("celkem", [], entity3, entity3)
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
      combine("dohromady", [smallLabel, mediumLabel], entityBase, entityBase)
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
        combine("celkem", [], entity3, entity3)
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
function ctverce() {
  const entity3 = "d\xE9lka";
  const unit = "cm";
  const entityBase = "strana";
  const entitySquare = "\u010Dtverec";
  const obrazec1 = "1. obrazec";
  const obrazec2 = "2. obrazec";
  const obrazec3 = "3. obrazec";
  const obvod1 = cont(obrazec1, 80, entity3, unit);
  const ctverec1PocetStran = cont(obrazec1, 4, entityBase);
  const ctverec2PocetStran = cont(obrazec2, 4, entityBase);
  const matchSiteLabel2 = "strana 1. obrazce = 5 sv\u011Btle \u0161ed\xE9 \u010Dtverce";
  const tempMatchSiteLabel2 = "2. obrazec - 4 tmav\u011B \u0161ed\xE9 \u010Dtverce =  6 \u0161v\u011Btle \u0161ed\xE9 \u010Dtverce";
  const matchSiteLabel3 = "strana 2. obrazce = 6 tmav\u011B \u0161ed\xE9 \u010Dtverce";
  const tempMatchSiteLabel3 = "krat\u0161\xED strany 3. obrazce  = 5 sv\u011Btle \u0161ed\xE9 \u010Dtverce";
  const strana1 = toCont(deduce(
    obvod1,
    ctverec1PocetStran,
    ctor("rate")
  ), { agent: matchSiteLabel2 });
  const strana1Add = deduce(
    last(strana1),
    cont(matchSiteLabel2, 5, entitySquare),
    ctor("rate")
  );
  const strana2 = deduce(
    deduce(
      strana1,
      strana1Add,
      combine(tempMatchSiteLabel2, [], { entity: entity3, unit }, { entity: entity3, unit })
    ),
    ratios(matchSiteLabel3, [tempMatchSiteLabel2, "b\xEDl\xFD \u010Dtverec"], [4, 1])
  );
  const widthAdd = deduce(
    last(strana2),
    cont(matchSiteLabel3, 6, entitySquare),
    ctor("rate")
  );
  const width3 = deduce(
    last(strana2),
    widthAdd,
    combine(tempMatchSiteLabel3, [], { entity: entity3, unit }, { entity: entity3, unit })
  );
  return {
    obvodObrazec2: {
      deductionTree: deduce(
        strana2,
        ctverec2PocetStran,
        product(obrazec2, [], { entity: entity3, unit }, { entity: entity3, unit })
      )
    },
    obrazecWidthToLength: {
      deductionTree: deduce(
        deduce(
          last(strana2),
          deduce(
            last(width3),
            cont(tempMatchSiteLabel3, 5, entitySquare),
            ctor("rate")
          ),
          combine("del\u0161\xED strana 3. obrazce", [], { entity: entity3, unit }, { entity: entity3, unit })
        ),
        width3
      )
    }
  };
}

// src/utils/deduce-utils.js
var defaultHelpers2 = {
  convertToFraction: (d) => d,
  convertToUnit: (d) => d,
  unitAnchor: () => 1,
  solveLinearEquation: (fist, second, variable) => NaN,
  evalExpression: (expression, context) => NaN
};
var helpers2 = defaultHelpers2;
function configure2(config) {
  helpers2 = { ...defaultHelpers2, ...config };
}
function isNumber2(quantity) {
  return typeof quantity === "number";
}
function areNumbers2(ratios4) {
  return ratios4.every((d) => isNumber2(d));
}
function wrapToQuantity2(expression, context) {
  return { expression, context: convertContext2(context) };
}
function wrapToRatio2(expression, context) {
  return { expression, context: convertContext2(context) };
}
function convertContext2(context) {
  return Object.fromEntries(Object.entries(context).map(([key, value]) => [key, convertRatioKeysToFractions2(value)]));
}
function convertRatioKeysToFractions2(obj) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, key === "ratio" ? helpers2.convertToFraction(value) : value]));
}
function compDiff2(agentMinuend, agentSubtrahend, quantity, entity3) {
  return { kind: "comp-diff", agentMinuend, agentSubtrahend, quantity, entity: entity3 };
}
function compareRuleEx2(a, b) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity} `;
  }
  if (a.agent == b.agentB) {
    return {
      kind: "cont",
      agent: b.agentA,
      quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity + b.quantity : wrapToQuantity2(`a.quantity + b.quantity`, { a, b }),
      entity: a.entity,
      unit: a.unit
    };
  } else if (a.agent == b.agentA) {
    return {
      kind: "cont",
      agent: b.agentB,
      quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity + -1 * b.quantity : wrapToQuantity2(`a.quantity + -1 * b.quantity`, { a, b }),
      entity: a.entity,
      unit: a.unit
    };
  }
}
function compareRule2(a, b) {
  const result = compareRuleEx2(a, b);
  return {
    question: `${computeQuestion2(result.quantity)} ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity2(result)}?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber2(a.quantity)} ${b.quantity > 0 ? " + " : " - "} ${formatNumber2(abs2(b.quantity))} `, result: formatNumber2(result.quantity), ok: a.agent == b.agentB },
      { tex: `${formatNumber2(a.quantity)} ${b.quantity > 0 ? " - " : " + "} ${formatNumber2(abs2(b.quantity))} `, result: formatNumber2(result.quantity), ok: a.agent == b.agentA }
    ] : []
  };
}
function compareAngleRuleEx2(a, b) {
  return { kind: "cont", agent: a.agent == b.agentB ? b.agentA : b.agentB, quantity: computeOtherAngle2(a.quantity, b.relationship), entity: a.entity, unit: a.unit };
}
function compareAngleRule2(a, b) {
  const result = compareAngleRuleEx2(a, b);
  return {
    question: `Vypo\u010Dti ${a.agent == b.agentB ? b.agentA : b.agentB}? \xDAhel ${b.agentA} je ${formatAngle2(b.relationship)} \xFAhel k ${b.agentB}.`,
    result,
    options: isNumber2(result.quantity) ? [
      { tex: `90 - ${a.quantity} `, result: formatNumber2(result.quantity), ok: b.relationship == "complementary" },
      { tex: `180 - ${a.quantity} `, result: formatNumber2(result.quantity), ok: b.relationship == "supplementary" || b.relationship == "sameSide" },
      { tex: `${a.quantity} `, result: formatNumber2(result.quantity), ok: b.relationship != "supplementary" && b.relationship != "complementary" && b.relationship != "sameSide" }
    ] : []
  };
}
function toComparisonAsRatioEx2(a, b) {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole} `;
  }
  return {
    kind: "comp-ratio",
    agentB: b.part,
    agentA: a.part,
    ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? 1 + (a.ratio - b.ratio) : wrapToRatio2(`1 + (a.ratio - b.ratio)`, { a, b })
  };
}
function toComparisonAsRatio2(a, b) {
  const result = toComparisonAsRatioEx2(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik ? `,
    result,
    options: isNumber2(a.ratio) && isNumber2(b.ratio) && isNumber2(result.ratio) ? [
      { tex: `1 + (${formatRatio2(a.ratio)} - ${formatRatio2(b.ratio)})`, result: formatRatio2(result.ratio), ok: true },
      { tex: `${formatRatio2(b.ratio)} - ${formatRatio2(a.ratio)} `, result: formatRatio2(result.ratio), ok: false }
    ] : []
  };
}
function toComparisonRatioEx2(a, b) {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole} `;
  }
  return {
    kind: "comp-ratio",
    agentB: b.part,
    agentA: a.part,
    ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? a.ratio / b.ratio : wrapToRatio2(`a.ratio / b.ratio`, { a, b })
  };
}
function toComparisonRatio2(a, b) {
  const result = toComparisonRatioEx2(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}.Kolikr\xE1t ? `,
    result,
    options: isNumber2(a.ratio) && isNumber2(b.ratio) ? [
      {
        tex: `${formatRatio2(a.ratio)} / ${formatRatio2(b.ratio)}`,
        result: formatRatio2(a.ratio / b.ratio),
        ok: true
      },
      { tex: `${formatRatio2(b.ratio)} / ${formatRatio2(a.ratio)}`, result: formatRatio2(b.ratio / a.ratio), ok: false }
    ] : []
  };
}
function comparisonRatioRuleEx2(b, a) {
  if (!(a.part == b.agentA || a.part == b.agentB)) {
    throw `Mismatch agent ${a.part} any of ${b.agentA}, ${b.agentB}`;
  }
  if (a.part == b.agentB) {
    return {
      kind: "ratio",
      whole: a.whole,
      part: b.agentA,
      ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? b.ratio >= 0 ? a.ratio * b.ratio : a.ratio / abs2(b.ratio) : wrapToRatio2(`b.ratio >= 0 ? a.ratio * b.ratio : a.ratio / abs(b.ratio)`, { a, b })
    };
  } else if (a.part == b.agentA) {
    return {
      kind: "ratio",
      whole: a.whole,
      part: b.agentB,
      ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? b.ratio > 0 ? a.ratio / b.ratio : a.ratio * abs2(b.ratio) : wrapToRatio2(`b.ratio > 0 ? a.ratio / b.ratio : a.ratio * abs(b.ratio)`, { a, b })
    };
  }
}
function comparisonRatioRule2(b, a) {
  const result = comparisonRatioRuleEx2(b, a);
  return {
    question: `${computeQuestion2(result.ratio)}} ${a.part == b.agentB ? b.agentA : b.agentB}?`,
    result,
    options: isNumber2(a.ratio) && isNumber2(b.ratio) ? [
      { tex: `${formatRatio2(a.ratio)} * ${formatRatio2(abs2(b.ratio))}`, result: formatRatio2(a.ratio * b.ratio), ok: a.part == b.agentB && b.ratio >= 0 || a.part == b.agentA && b.ratio < 0 },
      { tex: `${formatRatio2(a.ratio)} / ${formatRatio2(abs2(b.ratio))}`, result: formatRatio2(a.ratio / b.ratio), ok: a.part == b.agentA && b.ratio >= 0 || a.part == b.agentB && b.ratio < 0 }
    ] : []
  };
}
function comparisonRatioTransitiveRuleEx2(a, b) {
  if (a.agentB === b.agentA) {
    return {
      kind: "comp-ratio",
      agentA: a.agentA,
      agentB: b.agentB,
      ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? abs2(a.ratio) * abs2(b.ratio) : wrapToRatio2(`abs(a.ratio) * abs(b.ratio)`, { a, b })
    };
  } else if (a.agentB === b.agentB) {
    return {
      kind: "comp-ratio",
      agentA: a.agentA,
      agentB: b.agentA,
      ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? abs2(a.ratio) * 1 / abs2(b.ratio) : wrapToRatio2(`abs(a.ratio) * 1 / abs(b.ratio)`, { a, b })
    };
  } else if (a.agentA === b.agentA) {
    return {
      kind: "comp-ratio",
      agentA: a.agentB,
      agentB: b.agentB,
      ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? 1 / abs2(a.ratio) * abs2(b.ratio) : wrapToRatio2(`1 / abs(a.ratio) * abs(b.ratio)`, { a, b })
    };
  } else if (a.agentA === b.agentB) {
    return {
      kind: "comp-ratio",
      agentA: a.agentB,
      agentB: b.agentA,
      ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? 1 / abs2(a.ratio) * 1 / abs2(b.ratio) : wrapToRatio2(`1 / abs(a.ratio) * 1 / abs(b.ratio)`, { a, b })
    };
  } else {
    throw `Mismatch agent ${a.agentA}, ${a.agentB} any of ${b.agentA}, ${b.agentB}`;
  }
}
function comparisonRatioTransitiveRule2(b, a) {
  const result = comparisonRatioTransitiveRuleEx2(b, a);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}?`,
    result,
    options: []
  };
}
function convertToPartToPartRatiosEx2(b, a) {
  if (!isNumber2(b.ratio)) {
    throw "convertToPartToPartRatios does not non quantity";
  }
  return { kind: "ratios", whole: a.whole, parts: [b.agentA, b.agentB], ratios: [abs2(b.ratio), 1] };
}
function convertToPartToPartRatios2(b, a) {
  const result = convertToPartToPartRatiosEx2(b, a);
  if (!isNumber2(b.ratio)) {
    throw "convertToPartToPartRatios does not support expressions";
  }
  return {
    question: `Vyj\xE1d\u0159i pom\u011Brem \u010D\xE1st\xED ${[b.agentA, b.agentB].join(":")}?`,
    result,
    options: areNumbers2(result.ratios) ? [
      { tex: `(${formatRatio2(abs2(b.ratio))}) ku 1`, result: result.ratios.map((d) => formatRatio2(d)).join(":"), ok: true },
      { tex: `(1 / ${formatRatio2(abs2(b.ratio))}) ku 1`, result: result.ratios.map((d) => formatRatio2(d)).join(":"), ok: false }
    ] : []
  };
}
function convertToUnitEx2(a, b) {
  if (a.unit == null) {
    throw `Missing unit ${a.kind === "cont" ? a.agent : `${a.agentA} to ${a.agentB}`} a ${a.entity}`;
  }
  if (!isNumber2(a.quantity)) {
    throw "convertToUnit does not support expressions";
  }
  return { ...a, quantity: helpers2.convertToUnit(a.quantity, a.unit, b.unit), unit: b.unit };
}
function convertToUnit2(a, b) {
  const result = convertToUnitEx2(a, b);
  if (!isNumber2(a.quantity) || !isNumber2(result.quantity)) {
    throw "convertToUnit does not support expressions";
  }
  const destination = helpers2.unitAnchor(a.unit);
  const origin = helpers2.unitAnchor(b.unit);
  return {
    question: `P\u0159eve\u010F ${formatNumber2(a.quantity)} ${formatEntity2(a)} na ${b.unit}.`,
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} * ${formatNumber2(destination / origin)}`, result: formatNumber2(result.quantity), ok: true },
      { tex: `${formatNumber2(a.quantity)} / ${formatNumber2(destination / origin)}`, result: formatNumber2(result.quantity), ok: false }
    ]
  };
}
function roundTo3(a, b) {
  const result = {
    ...a,
    quantity: isNumber2(a.quantity) ? Math.round(a.quantity) : wrapToQuantity2(`round ${a.quantity}`, { a })
  };
  return {
    question: isNumber2(a.quantity) ? `Zaokrouhli ${formatNumber2(a.quantity)} ${formatEntity2(a)} na cel\xE9 \u010D\xEDslo.` : `Zaokrouhli na cel\xE9 \u010D\xEDslo.`,
    result,
    options: isNumber2(a.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber2(a.quantity)}`, result: formatNumber2(result.quantity), ok: true }
    ] : []
  };
}
function ratioCompareRuleEx2(a, b) {
  if (!(a.agent == b.agentA || a.agent == b.agentB)) {
    throw `Mismatch agent ${a.agent} any of ${b.agentA}, ${b.agentB}`;
  }
  if (a.agent == b.agentB) {
    return {
      kind: "cont",
      agent: b.agentA,
      quantity: isNumber2(a.quantity) && isNumber2(b.ratio) ? b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / abs2(b.ratio) : isNumber2(b.ratio) ? b.ratio >= 0 ? wrapToQuantity2(`a.quantity * b.ratio`, { a, b }) : wrapToQuantity2(`a.quantity / abs(b.ratio)`, { a, b }) : wrapToQuantity2(`b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / abs(b.ratio)`, { a, b }),
      entity: a.entity,
      unit: a.unit
    };
  } else if (a.agent == b.agentA) {
    return {
      kind: "cont",
      agent: b.agentB,
      quantity: isNumber2(a.quantity) && isNumber2(b.ratio) ? b.ratio > 0 ? a.quantity / b.ratio : a.quantity * abs2(b.ratio) : isNumber2(b.ratio) ? b.ratio > 0 ? wrapToQuantity2(`a.quantity / b.ratio`, { a, b }) : wrapToQuantity2(`a.quantity * abs(b.ratio)`, { a, b }) : wrapToQuantity2(`b.ratio > 0 ? a.quantity / b.ratio : a.quantity * abs(b.ratio)`, { a, b }),
      entity: a.entity,
      unit: a.unit
    };
  }
}
function ratioCompareRule2(a, b) {
  const result = ratioCompareRuleEx2(a, b);
  return {
    question: `${computeQuestion2(result.quantity)} ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity2(result)}?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.ratio) ? [
      { tex: `${formatNumber2(a.quantity)} * ${formatRatio2(abs2(b.ratio))}`, result: formatNumber2(a.quantity * b.ratio), ok: a.agent == b.agentB && b.ratio >= 0 || a.agent == b.agentA && b.ratio < 0 },
      { tex: `${formatNumber2(a.quantity)} / ${formatRatio2(abs2(b.ratio))}`, result: formatNumber2(a.quantity / b.ratio), ok: a.agent == b.agentA && b.ratio >= 0 || a.agent == b.agentB && b.ratio < 0 }
    ] : []
  };
}
function transferRuleEx2(a, b, transferOrder) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const plus = isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity + b.quantity : wrapToQuantity2(`a.quantity + b.quantity`, { a, b });
  const minus = isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity2(`a.quantity - b.quantity`, { a, b });
  const quantity = transferOrder === "before" ? a.agent == b.agentSender.name ? plus : minus : a.agent == b.agentSender.name ? minus : plus;
  const newAgent = a.agent === b.agentReceiver.name ? getAgentName2(b.agentReceiver, transferOrder) : a.agent == b.agentSender.name ? getAgentName2(b.agentSender, transferOrder) : a.agent;
  return { kind: "cont", agent: newAgent, quantity, entity: a.entity };
}
function getAgentName2(agent, transferOrder) {
  const name = transferOrder === "before" ? agent.nameBefore : agent.nameAfter;
  return name ?? agent.name;
}
function transferRule2(a, b, transferOrder) {
  const result = transferRuleEx2(a, b, transferOrder);
  return {
    question: `${computeQuestion2(result.quantity)} ${a.agent}${formatEntity2(result)}?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber2(a.quantity)} ${transferOrder === "before" && a.agent == b.agentSender.name ? " + " : " - "} ${formatNumber2(abs2(b.quantity))}`, result: formatNumber2(result.quantity), ok: a.agent == b.agentSender.name },
      { tex: `${formatNumber2(a.quantity)} ${transferOrder !== "before" && a.agent == b.agentSender.name ? " - " : " + "} ${formatNumber2(abs2(b.quantity))}`, result: formatNumber2(result.quantity), ok: a.agent == b.agentReceiver.name }
    ] : []
  };
}
function deltaRuleEx2(a, b, transferOrder) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const plus = isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity + b.quantity : wrapToQuantity2(`a.quantity + b.quantity`, { a, b });
  const minus = isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity2(`a.quantity - b.quantity`, { a, b });
  const quantity = transferOrder === "before" ? minus : plus;
  const agent = b.agent.name;
  return { kind: "cont", agent, quantity, entity: a.entity };
}
function deltaRule2(a, b, transferOrder) {
  const result = deltaRuleEx2(a, b, transferOrder);
  return {
    question: `${computeQuestion2(result.quantity)} ${result.agent}${formatEntity2(result)}?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber2(a.quantity)} ${transferOrder === "before" ? " - " : " + "} ${formatNumber2(b.quantity)}`, result: formatNumber2(result.quantity), ok: true },
      { tex: `${formatNumber2(a.quantity)} ${transferOrder == "before" ? " + " : " - "} ${formatNumber2(b.quantity)}`, result: formatNumber2(result.quantity), ok: false }
    ] : []
  };
}
function ratioComplementRuleEx2(a, b) {
  return {
    kind: "ratio",
    whole: b.whole,
    ratio: isNumber2(b.ratio) ? 1 - b.ratio : wrapToRatio2(`1 - b.ratio`, { a, b }),
    part: a.part,
    asPercent: b.asPercent
  };
}
function ratioComplementRule2(a, b) {
  const result = ratioComplementRuleEx2(a, b);
  return {
    question: `Vyj\xE1d\u0159i ${b.asPercent ? "procentem" : "pom\u011Brem"} ${result.part} z ${result.whole}?`,
    result,
    options: isNumber2(b.ratio) ? [
      { tex: `${formatRatio2(1, b.asPercent)} - ${formatRatio2(b.ratio, b.asPercent)}`, result: formatRatio2(1 - b.ratio, b.asPercent), ok: true },
      { tex: `${formatRatio2(b.ratio, b.asPercent)} - ${formatRatio2(1, b.asPercent)}`, result: formatRatio2(b.ratio - 1, b.asPercent), ok: false }
    ] : []
  };
}
function convertToCompRatioEx2(b, { agentB, asPercent }) {
  if (!areNumbers2(b.ratios)) {
    throw "ratios does not support non quantity type";
  }
  const bRatios = b.ratios;
  if (!(b.ratios.length === 2 && b.parts.length === 2)) {
    throw `Part to part ratio has to have exactly two parts.`;
  }
  const agentBIndex = agentB != null ? b.parts.indexOf(agentB) : 1;
  if (agentBIndex === -1) {
    throw `Part not found ${agentB}, expecting ${b.parts.join()}.`;
  }
  const agentAIndex = agentBIndex === 0 ? 1 : 0;
  return {
    kind: "comp-ratio",
    agentA: b.parts[agentAIndex],
    agentB: b.parts[agentBIndex],
    ratio: bRatios[agentAIndex] / bRatios[agentBIndex],
    asPercent
  };
}
function convertToCompRatio2(b, { agentB, asPercent }) {
  const result = convertToCompRatioEx2(b, { agentB, asPercent });
  return {
    question: `Porovnej ${asPercent ? "procentem" : "pom\u011Brem"} ${result.agentA} a ${result.agentB}?`,
    result,
    options: [
      // { tex: `${formatRatio(1, b.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(1 - b.ratio, b.asPercent), ok: true },
      // { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false },
    ]
  };
}
function toRatioEx2(b, asPercent) {
  return {
    ...b,
    asPercent
  };
}
function toRatio2(b, asPercent) {
  const result = toRatioEx2(b, asPercent);
  return {
    question: `Vyj\xE1d\u0159i ${asPercent ? "procentem" : "pom\u011Brem"}?`,
    result,
    options: isNumber2(b.ratio) && isNumber2(result.ratio) ? [
      { tex: `1 / ${formatRatio2(b.ratio, b.asPercent)}${asPercent ? " * 100" : ""}`, result: formatRatio2(result.ratio, result.asPercent), ok: asPercent }
    ] : []
  };
}
function reverseCompRatioEx2(b, asPercent) {
  return {
    kind: "comp-ratio",
    agentA: b.agentB,
    agentB: b.agentA,
    ratio: isNumber2(b.ratio) ? 1 / b.ratio : wrapToRatio2(`1 / b.ratio`, { b }),
    asPercent: asPercent ?? b.asPercent
  };
}
function reverseCompRatio2(b, asPercent) {
  const result = reverseCompRatioEx2(b, asPercent);
  return {
    question: `Obra\u0165 porovn\xE1n\xED ${asPercent ?? b.asPercent ? "procentem" : "pom\u011Brem"} ${result.agentA} a ${result.agentB}?`,
    result,
    options: isNumber2(b.ratio) && isNumber2(result.ratio) ? [
      { tex: `1 / ${formatRatio2(b.ratio, b.asPercent)}${result.asPercent ? " * 100" : ""}`, result: formatRatio2(result.ratio, result.asPercent), ok: true }
      // { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false },
    ] : []
  };
}
function ratiosConvertRuleEx2(a, b, asPercent) {
  if (!areNumbers2(b.ratios)) {
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
function ratiosConvertRule2(a, b, last22) {
  const result = ratiosConvertRuleEx2(a, b, last22.asPercent);
  if (!areNumbers2(b.ratios) || !isNumber2(result.ratio)) {
    throw "ratios does not support non quantity type";
  }
  const index = b.parts.indexOf(a.agent);
  const value = b.ratios[index];
  return {
    question: `Vyj\xE1d\u0159i ${last22.asPercent ? "procentem" : "pom\u011Brem"} ${result.part} z ${result.whole}?`,
    result,
    options: [
      { tex: `${formatNumber2(value)} / (${b.ratios.map((d) => formatNumber2(d)).join(" + ")})`, result: formatRatio2(result.ratio, result.asPercent), ok: true },
      { tex: `${formatNumber2(value)} * (${b.ratios.map((d) => formatNumber2(d)).join(" + ")})`, result: formatRatio2(result.ratio, result.asPercent), ok: false }
    ]
  };
}
function compRatioToCompRuleEx2(a, b) {
  const agent = a.agentB === b.agentA ? b.agentA : b.agentB;
  if (isNumber2(a.ratio) && isNumber2(b.quantity)) {
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
    quantity: isNumber2(a.ratio) && isNumber2(b.quantity) ? abs2(b.quantity / (a.ratio - 1)) : wrapToQuantity2(`abs(b.quantity / (a.ratio - 1))`, { a, b })
  };
}
function compRatioToCompRule2(a, b) {
  const result = compRatioToCompRuleEx2(a, b);
  return {
    question: containerQuestion2(result),
    result,
    options: isNumber2(a.ratio) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber2(abs2(b.quantity))} / ${formatRatio2(abs2(a.ratio - 1))}`, result: formatNumber2(result.quantity), ok: true },
      { tex: `${formatNumber2(abs2(b.quantity))} / ${formatRatio2(abs2(1 - a.ratio))}`, result: formatNumber2(abs2(b.quantity / (1 - a.ratio))), ok: false }
    ] : []
  };
}
function compRatiosToCompRuleEx2(a, b) {
  if (!areNumbers2(a.ratios) || !isNumber2(b.quantity)) {
    throw "ratios does not support non quantity type";
  }
  const aIndex = a.parts.indexOf(b.agentA);
  const bIndex = a.parts.indexOf(b.agentB);
  if (aIndex === -1 || bIndex === -1) {
    throw `Missing parts to compare ${a.parts.join(",")}, required parts ${b.agentA, b.agentB}`;
  }
  const aAgent = a.parts[aIndex];
  const bAgent = a.parts[bIndex];
  const diff = a.ratios[aIndex] - a.ratios[bIndex];
  if (!(diff > 0 && b.quantity > 0 || (diff < 0 && b.quantity < 0 || diff == 0 && b.quantity == 0))) {
    throw `Uncompatible compare rules. Absolute compare ${b.quantity} between ${b.agentA} a ${b.agentB} does not match relative compare.`;
  }
  const lastIndex = aIndex > bIndex ? aIndex : bIndex;
  const nthPartAgent = a.parts[lastIndex];
  return {
    kind: "cont",
    agent: nthPartAgent,
    entity: b.entity,
    unit: b.unit,
    quantity: abs2(b.quantity / diff) * a.ratios[lastIndex]
  };
}
function compRatiosToCompRule2(a, b) {
  const result = compRatiosToCompRuleEx2(a, b);
  const aIndex = a.parts.indexOf(b.agentA);
  const bIndex = a.parts.indexOf(b.agentB);
  const lastIndex = aIndex > bIndex ? aIndex : bIndex;
  return {
    question: containerQuestion2(result),
    result,
    options: areNumbers2(a.ratios) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber2(abs2(b.quantity))} / (${formatNumber2(a.ratios[aIndex])} - ${formatNumber2(a.ratios[bIndex])}) * ${formatNumber2(a.ratios[lastIndex])}`, result: formatNumber2(result.quantity), ok: true }
    ] : []
  };
}
function proportionRuleEx2(a, b) {
  return {
    ...a,
    ...b.inverse && { ratio: isNumber2(a.ratio) ? 1 / a.ratio : wrapToRatio2(`1 / a.ratio`, { a }) }
  };
}
function proportionRule2(a, b) {
  const result = proportionRuleEx2(a, b);
  return {
    question: `Jak\xFD je vztah mezi veli\u010Dinami? ${b.entities?.join(" a ")}`,
    result,
    options: isNumber2(a.ratio) ? [
      { tex: `zachovat pom\u011Br`, result: formatRatio2(a.ratio), ok: !b.inverse },
      { tex: `obr\xE1tit pom\u011Br - 1 / ${formatRatio2(a.ratio)}`, result: formatRatio2(1 / a.ratio), ok: b.inverse }
    ] : []
  };
}
function proportionRatiosRuleEx2(a, b) {
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
function proportionRatiosRule2(a, b) {
  const result = proportionRatiosRuleEx2(a, b);
  return {
    question: `Jak\xFD je vztah mezi veli\u010Dinami? ${b.entities?.join(" a ")}`,
    result,
    options: [
      { tex: `zachovat pom\u011Br`, result: result.ratios.join(":"), ok: !b.inverse },
      { tex: `obr\xE1tit pom\u011Br`, result: result.ratios.join(":"), ok: b.inverse }
    ]
  };
}
function partToWholeRuleEx2(a, b) {
  if (!(matchAgent2(b.whole, a) || matchAgent2(b.part, a))) {
    throw `Mismatch entity ${[a.agent, a.entity].join()} any of ${[b.whole, b.part].join()}`;
  }
  return matchAgent2(b.whole, a) ? {
    kind: "cont",
    agent: b.part,
    entity: a.entity,
    quantity: isNumber2(a.quantity) && isNumber2(b.ratio) ? a.quantity * b.ratio : wrapToQuantity2(`a.quantity * b.ratio`, { a, b }),
    unit: a.unit
  } : {
    kind: "cont",
    agent: b.whole,
    entity: a.entity,
    quantity: isNumber2(a.quantity) && isNumber2(b.ratio) ? a.quantity / b.ratio : wrapToQuantity2(`a.quantity / b.ratio`, { a, b }),
    unit: a.unit
  };
}
function partToWholeRule2(a, b) {
  const result = partToWholeRuleEx2(a, b);
  return {
    question: containerQuestion2(result),
    result,
    options: isNumber2(a.quantity) && isNumber2(b.ratio) ? [
      { tex: `${formatNumber2(a.quantity)} * ${formatRatio2(b.ratio)}`, result: formatNumber2(a.quantity * b.ratio), ok: matchAgent2(b.whole, a) },
      { tex: `${formatNumber2(a.quantity)} / ${formatRatio2(b.ratio)}`, result: formatNumber2(a.quantity / b.ratio), ok: !matchAgent2(b.whole, a) }
    ] : []
  };
}
function rateRuleEx2(a, rate3) {
  const aEntity = a.kind == "cont" ? a.entity : a.agentQuota;
  if (!(aEntity === rate3.entity.entity || aEntity === rate3.entityBase.entity)) {
    throw `Mismatch entity ${aEntity} any of ${rate3.entity.entity}, ${rate3.entityBase.entity}`;
  }
  const isEntityBase2 = aEntity == rate3.entity.entity;
  const isUnitRate = rate3.baseQuantity === 1;
  return {
    kind: "cont",
    agent: a.agent,
    entity: isEntityBase2 ? rate3.entityBase.entity : rate3.entity.entity,
    unit: isEntityBase2 ? rate3.entityBase.unit : rate3.entity.unit,
    quantity: aEntity == rate3.entity.entity ? isNumber2(a.quantity) && isNumber2(rate3.quantity) && isNumber2(rate3.baseQuantity) ? a.quantity / (!isUnitRate ? rate3.quantity / rate3.baseQuantity : rate3.quantity) : !isUnitRate ? wrapToQuantity2(`a.quantity / (rate.quantity/rate.baseQuantity)`, { a, rate: rate3 }) : wrapToQuantity2(`a.quantity / rate.quantity`, { a, rate: rate3 }) : isNumber2(a.quantity) && isNumber2(rate3.quantity) && isNumber2(rate3.baseQuantity) ? a.quantity * (!isUnitRate ? rate3.quantity / rate3.baseQuantity : rate3.quantity) : !isUnitRate ? wrapToQuantity2(`a.quantity * (rate.quantity/rate.baseQuantity)`, { a, rate: rate3 }) : wrapToQuantity2(`a.quantity * rate.quantity`, { a, rate: rate3 })
  };
}
function rateRule2(a, rate3) {
  const result = rateRuleEx2(a, rate3);
  const aEntity = a.kind == "cont" ? a.entity : a.agentQuota;
  return {
    question: containerQuestion2(result),
    result,
    options: isNumber2(a.quantity) && isNumber2(rate3.quantity) && isNumber2(result.quantity) && isNumber2(rate3.baseQuantity) ? [
      { tex: `${formatNumber2(a.quantity)} * ${formatNumber2(rate3.quantity)}`, result: formatNumber2(result.quantity), ok: aEntity !== rate3.entity.entity },
      { tex: `${formatNumber2(a.quantity)} / ${formatNumber2(rate3.quantity)}`, result: formatNumber2(result.quantity), ok: aEntity === rate3.entity.entity }
    ] : []
  };
}
function quotaRuleEx2(a, quota3) {
  if (!(a.agent === quota3.agent || a.agent === quota3.agentQuota)) {
    throw `Mismatch entity ${a.entity} any of ${quota3.agent}, ${quota3.agentQuota}`;
  }
  return {
    kind: "cont",
    agent: a.agent === quota3.agentQuota ? quota3.agent : quota3.agentQuota,
    entity: a.entity,
    quantity: a.agent === quota3.agentQuota ? isNumber2(a.quantity) && isNumber2(quota3.quantity) ? a.quantity * quota3.quantity : wrapToQuantity2(`a.quantity * quota.quantity`, { a, quota: quota3 }) : isNumber2(a.quantity) && isNumber2(quota3.quantity) ? a.quantity / quota3.quantity : wrapToQuantity2(`a.quantity / quota.quantity`, { a, quota: quota3 })
  };
}
function quotaRule2(a, quota3) {
  const result = quotaRuleEx2(a, quota3);
  return {
    question: containerQuestion2(result),
    result,
    options: isNumber2(a.quantity) && isNumber2(quota3.quantity) ? [
      { tex: `${formatNumber2(a.quantity)} * ${formatNumber2(quota3.quantity)}`, result: formatNumber2(a.quantity * quota3.quantity), ok: a.agent === quota3.agentQuota },
      { tex: `${formatNumber2(a.quantity)} / ${formatNumber2(quota3.quantity)}`, result: formatNumber2(a.quantity / quota3.quantity), ok: a.agent !== quota3.agentQuota }
    ] : []
  };
}
function toPartWholeRatioEx2(part, whole, asPercent) {
  return {
    kind: "ratio",
    part: part.agent,
    whole: whole.agent,
    ratio: isNumber2(part.quantity) && isNumber2(whole.quantity) ? part.quantity / whole.quantity : wrapToRatio2(`part.quantity / whole.quantity`, { part, whole }),
    asPercent
  };
}
function toPartWholeRatio2(part, whole, last22) {
  const result = toPartWholeRatioEx2(part, whole, last22.asPercent);
  return {
    question: `Vyj\xE1d\u0159i ${last22.asPercent ? "procentem" : "pom\u011Brem"} ${part.agent} z ${whole.agent}?`,
    result,
    options: isNumber2(part.quantity) && isNumber2(whole.quantity) && isNumber2(result.ratio) ? [
      { tex: `${formatNumber2(whole.quantity)} / ${formatNumber2(part.quantity)} ${last22.asPercent ? " * 100" : ""}`, result: last22.asPercent ? formatNumber2(result.ratio * 100) : formatRatio2(result.ratio), ok: false },
      { tex: `${formatNumber2(part.quantity)} / ${formatNumber2(whole.quantity)} ${last22.asPercent ? " * 100" : ""}`, result: last22.asPercent ? formatNumber2(result.ratio * 100) : formatRatio2(result.ratio), ok: true }
    ] : []
  };
}
function diffRuleEx2(a, b) {
  if (!(a.agent == b.agentMinuend || a.agent == b.agentSubtrahend)) {
    throw `Mismatch agents ${a.agent} any of ${b.agentMinuend} ${b.agentSubtrahend}`;
  }
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const plus = isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity + b.quantity : wrapToQuantity2(`a.quantity + b.quantity`, { a, b });
  const minus = isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity2(`a.quantity - b.quantity`, { a, b });
  return {
    kind: "cont",
    agent: a.agent == b.agentMinuend ? b.agentSubtrahend : b.agentMinuend,
    quantity: a.agent == b.agentMinuend ? minus : plus,
    entity: b.entity
  };
}
function diffRule2(a, b) {
  const result = diffRuleEx2(a, b);
  return {
    question: containerQuestion2(result),
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) ? [
      { tex: `${formatNumber2(a.quantity)} - ${formatNumber2(b.quantity)}`, result: formatNumber2(a.quantity - b.quantity), ok: a.agent === b.agentMinuend },
      { tex: `${formatNumber2(a.quantity)} + ${formatNumber2(b.quantity)}`, result: formatNumber2(a.quantity + b.quantity), ok: a.agent !== b.agentMinuend }
    ] : []
  };
}
function sumRuleEx2(items, b) {
  if (items.every((d) => isRatioPredicate2(d))) {
    const wholes = items.map((d) => d.whole);
    if (wholes.filter(unique2).length == wholes.length) {
      throw `Combine only part to whole ratio with the same whole ${wholes}`;
    }
    ;
    const ratios4 = items.map((d) => d.ratio);
    const ratio3 = areNumbers2(ratios4) ? ratios4.reduce((out, d) => out += d, 0) : wrapToRatio2(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
    return { kind: "ratio", whole: wholes[0], ratio: ratio3, part: b.wholeAgent };
  } else if (items.every((d) => isQuantityPredicate2(d))) {
    const values = items.map((d) => d.quantity);
    const quantity = areNumbers2(values) ? values.reduce((out, d) => out += d, 0) : wrapToQuantity2(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
    if (items.every((d) => isRatePredicate2(d))) {
      const { entity: entity3, entityBase } = items[0];
      return { kind: "rate", agent: b.wholeAgent, quantity, entity: entity3, entityBase, baseQuantity: 1 };
    } else {
      if (b.kind !== "sum") {
        const itemsEntities = items.map((d) => d.entity);
        if (itemsEntities.filter(unique2).length !== 1) {
          throw `All predicates should have the same entity ${itemsEntities.join("")}.`;
        }
      }
      return { kind: "cont", agent: b.wholeAgent, quantity, entity: b.kind == "sum" ? b.wholeEntity.entity : items[0].entity, unit: b.kind == "sum" ? b.wholeEntity.unit : items[0].unit };
    }
  }
}
function sumRule2(items, b) {
  const result = sumRuleEx2(items, b);
  const isQuantity = isQuantityPredicate2(result);
  return {
    question: result.kind === "cont" ? containerQuestion2(result) : result.kind === "rate" ? `${computeQuestion2(result.quantity)} ${result.agent}` : `${computeQuestion2(result.ratio)} ${result.part}`,
    result,
    options: isQuantity && isNumber2(result.quantity) || isRatioPredicate2(result) && isNumber2(result.ratio) ? [
      {
        tex: items.map((d) => isQuantity ? formatNumber2(d.quantity) : formatRatio2(d.ratio)).join(" + "),
        result: isQuantity ? isNumber2(result.quantity) ? formatNumber2(result.quantity) : "N/A" : isNumber2(result.ratio) ? formatRatio2(result.ratio) : "N/A",
        ok: true
      },
      {
        tex: items.map((d) => isQuantity ? formatNumber2(d.quantity) : formatRatio2(d.ratio)).join(" * "),
        result: isQuantity ? isNumber2(result.quantity) ? formatNumber2(result.quantity) : "N/A" : isNumber2(result.ratio) ? formatRatio2(result.ratio) : "N/A",
        ok: false
      }
    ] : []
  };
}
function productRuleEx2(items, b) {
  const values = items.map((d) => d.quantity);
  return {
    kind: "cont",
    agent: b.wholeAgent,
    quantity: areNumbers2(values) ? values.reduce((out, d) => out *= d, 1) : wrapToQuantity2(items.map((d, i) => `y${i + 1}.quantity`).join(" * "), Object.fromEntries(items.map((d, i) => [`y${i + 1}`, d]))),
    entity: b.wholeEntity.entity,
    unit: b.wholeEntity.unit
  };
}
function productRule2(items, b) {
  const result = productRuleEx2(items, b);
  const values = items.map((d) => d.quantity);
  return {
    question: containerQuestion2(result),
    result,
    options: areNumbers2(values) ? [
      { tex: values.map((d) => formatNumber2(d)).join(" * "), result: formatNumber2(values.reduce((out, d) => out *= d, 1)), ok: true },
      { tex: values.map((d) => formatNumber2(d)).join(" + "), result: formatNumber2(values.reduce((out, d) => out += d, 0)), ok: false }
    ] : []
  };
}
function gcdRuleEx2(values, b) {
  return {
    kind: "cont",
    agent: b.agent,
    quantity: areNumbers2(values) ? gcdCalc3(values) : wrapToQuantity2(`gcd(${values.join(",")})`),
    entity: b.entity
  };
}
function gcdRule2(items, b) {
  const values = items.map((d) => d.quantity);
  const result = gcdRuleEx2(values, b);
  return {
    question: containerQuestion2(result),
    result,
    options: areNumbers2(values) && isNumber2(result.quantity) ? [
      { tex: gcdFromPrimeFactors2(primeFactorization2(values)).join(" * "), result: formatNumber2(result.quantity), ok: true }
      //{ tex: lcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ] : []
  };
}
function lcdRuleEx2(values, b) {
  return {
    kind: "cont",
    agent: b.agent,
    quantity: areNumbers2(values) ? lcdCalc3(values) : wrapToQuantity2(`gcd(${values.join(",")})`),
    entity: b.entity
  };
}
function lcdRule2(items, b) {
  const values = items.map((d) => d.quantity);
  const result = lcdRuleEx2(values, b);
  return {
    question: containerQuestion2(result),
    result,
    options: areNumbers2(values) && isNumber2(result.quantity) ? [
      { tex: lcdFromPrimeFactors2(primeFactorization2(values)).join(" * "), result: formatNumber2(result.quantity), ok: true }
      //{ tex: gcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ] : []
  };
}
function sequenceRuleEx2(items) {
  const values = items.map((d) => d.quantity);
  if (!areNumbers2(values)) {
    throw "quota does not support non quantity type";
  }
  if (new Set(items.map((d) => d.entity)).size > 1) {
    throw `Mismatch entity ${items.map((d) => d.entity).join()}`;
  }
  const type = sequencer2(values);
  return { kind: "sequence", type, entity: items[0].entity };
}
function sequenceRule2(items) {
  const result = sequenceRuleEx2(items);
  return {
    question: `Hledej vzor opakov\xE1n\xED. Jak\xFD je vztah mezi sousedn\xEDmi \u010Dleny?`,
    result,
    options: sequenceOptions2(result.type)
  };
}
function toComparisonEx2(a, b) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return {
    kind: "comp",
    agentB: b.agent,
    agentA: a.agent,
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity2(`a.quantity - b.quantity`, { a, b }),
    entity: a.entity,
    unit: a.unit
  };
}
function toComparison2(a, b) {
  const result = toComparisonEx2(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) ? [
      { tex: `${formatNumber2(a.quantity)} - ${formatNumber2(b.quantity)}`, result: formatNumber2(a.quantity - b.quantity), ok: true },
      { tex: `${formatNumber2(b.quantity)} - ${formatNumber2(a.quantity)}`, result: formatNumber2(b.quantity - a.quantity), ok: false }
    ] : []
  };
}
function toDeltaEx2(a, b, last22) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return {
    kind: "delta",
    agent: { name: last22.agent?.name ?? b.agent, nameBefore: a.agent, nameAfter: b.agent },
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? b.quantity - a.quantity : wrapToQuantity2(`b.quantity - a.quantity`, { a, b }),
    entity: a.entity,
    unit: a.unit
  };
}
function toDelta2(a, b, last22) {
  const result = toDeltaEx2(a, b, last22);
  return {
    question: `Zm\u011Bna stavu ${a.agent} => ${b.agent}. O kolik?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) ? [
      { tex: `${formatNumber2(a.quantity)} - ${formatNumber2(b.quantity)}`, result: formatNumber2(a.quantity - b.quantity), ok: false },
      { tex: `${formatNumber2(b.quantity)} - ${formatNumber2(a.quantity)}`, result: formatNumber2(b.quantity - a.quantity), ok: true }
    ] : []
  };
}
function convertCompareToDeltaEx2(a, b) {
  const { name, nameBefore, nameAfter } = b.agent;
  return { kind: "delta", agent: { name, nameBefore: nameBefore ?? a.agentA, nameAfter: nameAfter ?? a.agentB }, quantity: a.quantity, entity: a.entity, unit: a.unit };
}
function convertDeltaToCompareEx2(a, b) {
  const { agentA, agentB, entity: entity3, unit } = b;
  return { kind: "comp", agentA, agentB, quantity: a.quantity, entity: entity3, unit };
}
function pythagorasRuleEx2(a, b, last22) {
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
  if (a.agent === last22.longest || b.agent === last22.longest) {
    const longest = a.agent === last22.longest ? a : b;
    const otherSite = a.agent === last22.longest ? b : a;
    return {
      ...temp,
      quantity: isNumber2(longest.quantity) && isNumber2(otherSite.quantity) ? Math.sqrt(Math.pow(longest.quantity, 2) - Math.pow(otherSite.quantity, 2)) : wrapToQuantity2(`sqrt(longest.quantity^2 - otherSite.quantity^2)`, { longest, otherSite }),
      agent: last22.sites[1] === otherSite.agent ? last22.sites[0] : last22.sites[1]
    };
  } else {
    return {
      ...temp,
      quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? Math.sqrt(Math.pow(a.quantity, 2) + Math.pow(b.quantity, 2)) : wrapToQuantity2(`sqrt(a.quantity^2 + b.quantity^2)`, { a, b }),
      agent: last22.longest
    };
  }
}
function pythagorasRule2(a, b, last22) {
  const result = pythagorasRuleEx2(a, b, last22);
  const longest = a.agent === last22.longest ? a : b;
  const otherSite = a.agent === last22.longest ? b : a;
  return {
    question: `Vypo\u010D\xEDtej stranu ${result.agent} dle Pythagorovi v\u011Bty?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(longest.quantity) && isNumber2(otherSite.quantity) && isNumber2(result.quantity) ? [
      { tex: `odmocnina z (${formatNumber2(longest.quantity)}^2^ - ${formatNumber2(otherSite.quantity)}^2^)`, result: formatNumber2(result.quantity), ok: a.agent === last22.longest },
      { tex: `odmocnina z (${formatNumber2(a.quantity)}^2^ + ${formatNumber2(b.quantity)}^2^)`, result: formatNumber2(result.quantity), ok: a.agent !== last22.longest }
    ] : []
  };
}
function toRatioComparisonEx2(a, b, ctor3) {
  if (b.agent === a.agent && b.entity != a.entity) {
    b = toGenerAgent2(b);
    a = toGenerAgent2(a);
  }
  if (b.entity != a.entity) {
    throw `Mismatch entity ${b.entity}, ${a.entity}`;
  }
  return {
    kind: "comp-ratio",
    agentB: b.agent,
    agentA: a.agent,
    ratio: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity / b.quantity : wrapToRatio2(`a.quantity / b.quantity`, { a, b }),
    ...ctor3.asPercent && { asPercent: true }
  };
}
function toRatioComparison2(a, b, ctor3) {
  const result = toRatioComparisonEx2(a, b, ctor3);
  if (isNumber2(result.ratio) && isNumber2(a.quantity) && isNumber2(b.quantity)) {
    const between = result.ratio > 1 / 2 && result.ratio < 2;
    return {
      question: `Porovnej ${result.agentA} a ${result.agentB}.${between ? `O kolik z ${result.agentB}?` : `Kolikr\xE1t ${result.ratio < 1 ? "men\u0161\xED" : "v\u011Bt\u0161\xED"}?`}`,
      result,
      options: between ? [
        { tex: `(${formatNumber2(a.quantity)} - ${formatNumber2(b.quantity)}) / ${b.quantity}`, result: formatRatio2((a.quantity - b.quantity) / b.quantity), ok: result.ratio > 1 },
        { tex: `(${formatNumber2(b.quantity)} - ${formatNumber2(a.quantity)}) / ${b.quantity}`, result: formatRatio2((b.quantity - a.quantity) / b.quantity), ok: result.ratio <= 1 }
      ] : [
        { tex: `${formatNumber2(a.quantity)} / ${formatNumber2(b.quantity)}`, result: formatRatio2(a.quantity / b.quantity), ok: result.ratio >= 1 },
        { tex: `${formatNumber2(b.quantity)} / ${formatNumber2(a.quantity)}`, result: formatRatio2(b.quantity / a.quantity), ok: result.ratio < 1 }
      ]
    };
  } else {
    return resultAsQuestion2(result);
  }
}
function compareToCompareRuleEx2(a, b) {
  return {
    kind: "rate",
    agent: a.agentA,
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? abs2(a.quantity) / abs2(b.quantity) : wrapToQuantity2(`abs(a.quantity) / abs(b.quantity)`, { a, b }),
    entity: { entity: a.entity },
    entityBase: { entity: b.entity },
    baseQuantity: 1
  };
}
function compareToCompareRule2(a, b) {
  const result = compareToCompareRuleEx2(a, b);
  return {
    question: `Rozd\u011Bl ${formatEntity2({ entity: a.entity })} rovnom\u011Brn\u011B na ${formatEntity2({ entity: b.entity })}`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber2(abs2(a.quantity))} / ${formatNumber2(abs2(b.quantity))}`, result: formatNumber2(result.quantity), ok: true },
      { tex: `${formatNumber2(abs2(b.quantity))} / ${formatNumber2(abs2(a.quantity))}`, result: formatNumber2(abs2(b.quantity) / abs2(a.quantity)), ok: false }
    ] : []
  };
}
function toComparisonDiffEx2(a, b) {
  if (a.entity !== b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return {
    kind: "comp-diff",
    agentMinuend: a.agent,
    agentSubtrahend: b.agent,
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity2(`a.quantity - b.quantity`, { a, b }),
    entity: a.entity
  };
}
function toComparisonDiff2(a, b) {
  const result = toComparisonDiffEx2(a, b);
  return {
    question: `${computeQuestion2(result.quantity)} rozd\xEDl mezi ${a.quantity} a ${b.quantity}`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber2(a.quantity)} - ${formatNumber2(b.quantity)}`, result: formatNumber2(result.quantity), ok: true },
      { tex: `${formatNumber2(b.quantity)} - ${formatNumber2(a.quantity)}`, result: formatNumber2(b.quantity - a.quantity), ok: false }
    ] : []
  };
}
function toDifferenceEx2(a, b, diff) {
  if (a.entity !== b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  if (a.unit !== b.unit) {
    throw `Mismatch unit ${a.unit}, ${b.unit}`;
  }
  return {
    kind: "cont",
    agent: diff.differenceAgent,
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity2(`a.quantity - b.quantity`, { a, b }),
    entity: a.entity,
    unit: a.unit
  };
}
function toDifference2(a, b, diff) {
  const result = toDifferenceEx2(a, b, diff);
  return {
    question: `${computeQuestion2(result.quantity)} rozd\xEDl mezi ${a.agent} a ${b.agent}`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber2(a.quantity)} - ${formatNumber2(b.quantity)}`, result: formatNumber2(result.quantity), ok: true },
      { tex: `${formatNumber2(b.quantity)} - ${formatNumber2(a.quantity)}`, result: formatNumber2(b.quantity - a.quantity), ok: false }
    ] : []
  };
}
function toDifferenceAsRatioEx2(a, b, diff) {
  if (a.whole !== b.whole) {
    throw `Mismatch whole agents ${a.whole}, ${b.whole}`;
  }
  return {
    kind: "ratio",
    whole: a.whole,
    part: diff.differenceAgent,
    ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? a.ratio - b.ratio : wrapToRatio2(`a.ratio - b.ratio`, { a, b })
  };
}
function toDifferenceAsRatio2(a, b, diff) {
  const result = toDifferenceAsRatioEx2(a, b, diff);
  return {
    question: `${computeQuestion2(result.ratio)} rozd\xEDl mezi ${a.part} a ${b.part}`,
    result,
    options: isNumber2(a.ratio) && isNumber2(b.ratio) && isNumber2(result.ratio) ? [
      { tex: `${formatRatio2(a.ratio)} - ${formatRatio2(b.ratio)}`, result: formatRatio2(result.ratio), ok: true },
      { tex: `${formatRatio2(b.ratio)} - ${formatRatio2(a.ratio)}`, result: formatRatio2(b.ratio - a.ratio), ok: false }
    ] : []
  };
}
function toRateEx2(a, b) {
  if (a.agent !== b.agent) {
    throw `Mismatch angent ${a.agent}, ${b.agent}`;
  }
  return {
    kind: "rate",
    agent: a.agent,
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity / b.quantity : wrapToQuantity2(`a.quantity / b.quantity`, { a, b }),
    entity: {
      entity: a.entity,
      unit: a.unit
    },
    entityBase: {
      entity: b.kind === "cont" ? b.entity : b.agentQuota,
      unit: a.unit
    },
    baseQuantity: 1
  };
}
function toRate2(a, b) {
  const result = toRateEx2(a, b);
  if (isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity)) {
    return {
      question: `Rozd\u011Bl ${formatNumber2(a.quantity)} ${formatEntity2({ entity: a.entity })} rovnom\u011Brn\u011B na ${formatNumber2(b.quantity)} ${formatEntity2({ entity: b.kind === "cont" ? b.entity : b.agentQuota })}`,
      result,
      options: [
        { tex: `${formatNumber2(a.quantity)} / ${formatNumber2(b.quantity)}`, result: formatNumber2(result.quantity), ok: true },
        { tex: `${formatNumber2(b.quantity)} / ${formatNumber2(a.quantity)}`, result: formatNumber2(b.quantity / a.quantity), ok: false }
      ]
    };
  } else {
    return resultAsQuestion2(result);
  }
}
function solveEquationEx2(a, b, last22) {
  return {
    kind: "cont",
    agent: last22.agent,
    quantity: helpers2.solveLinearEquation(a.quantity, b.quantity, last22.variable),
    ...last22.entity
  };
}
function solveEquation2(a, b, last22) {
  const result = solveEquationEx2(a, b, last22);
  return {
    question: `Vy\u0159e\u0161 line\xE1rn\xED rovnici ${a.agent} = ${b.agent} pro nezn\xE1mou ${last22.variable}.`,
    result,
    options: []
  };
}
function toQuotaEx2(a, quota3) {
  if (!isNumber2(a.quantity) || !isNumber2(quota3.quantity)) {
    throw "quota does not support non quantity type";
  }
  const { groupCount, remainder } = divide2(a.quantity, quota3.quantity);
  return {
    kind: "quota",
    agentQuota: quota3.agent,
    agent: a.agent,
    quantity: groupCount,
    restQuantity: remainder
  };
}
function toQuota2(a, quota3) {
  const result = toQuotaEx2(a, quota3);
  if (isNumber2(a.quantity) && isNumber2(quota3.quantity) && isNumber2(result.quantity)) {
    return {
      question: `Rozd\u011Bl ${formatNumber2(a.quantity)} ${formatEntity2({ entity: a.entity, unit: a.unit })} postupn\u011B na skupiny velikosti ${formatNumber2(quota3.quantity)} ${formatEntity2({ entity: quota3.entity, unit: quota3.unit })}`,
      result,
      options: [
        { tex: `${formatNumber2(a.quantity)} / ${formatNumber2(quota3.quantity)}`, result: formatNumber2(result.quantity), ok: true },
        { tex: `${formatNumber2(quota3.quantity)} / ${formatNumber2(a.quantity)}`, result: formatNumber2(result.quantity), ok: false }
      ]
    };
  } else {
    return resultAsQuestion2(result);
  }
}
function divide2(total, divisor, isPartitative = false) {
  const rawQuotient = total / divisor;
  const rawRemainder = rawQuotient % 1;
  const quotient = rawQuotient - rawRemainder;
  const remainder = isPartitative ? (divisor - Math.floor(divisor)) * rawQuotient : rawRemainder * divisor;
  const groupCount = isPartitative ? divisor : quotient;
  const groupSize = isPartitative ? rawQuotient : divisor;
  return {
    groupCount,
    groupSize,
    remainder
  };
}
function toRatiosEx2(parts, whole) {
  return {
    kind: "ratios",
    parts: parts.map((d) => d.agent),
    ratios: parts.map((d) => d.quantity),
    whole
  };
}
function toRatios2(parts, last22) {
  const result = toRatiosEx2(parts, last22.whole);
  return {
    question: `Vyj\xE1d\u0159i pom\u011Brem mezi ${result.parts.join(":")}?`,
    result,
    options: areNumbers2(result.ratios) ? [
      { tex: `${result.ratios.map((d) => formatNumber2(d)).join(":")}`, result: result.ratios.map((d) => formatNumber2(d)).join(":"), ok: true },
      { tex: `${result.ratios.map((d) => formatNumber2(d)).join(":")}`, result: result.ratios.map((d) => formatNumber2(d)).join(":"), ok: false }
    ] : []
  };
}
function evalToQuantityEx2(a, b) {
  if (!isNumber2(a.quantity)) {
    throw `evalToQuantity does not support non quantity types`;
  }
  return {
    ...b.predicate,
    quantity: helpers2.evalExpression(b.expression, a.quantity)
  };
}
function evalToQuantity2(a, b) {
  const result = evalToQuantityEx2(a, b);
  return {
    question: `Vypo\u010Dti v\xFDraz ${b.expression}?`,
    result,
    options: []
  };
}
function evalToOptionEx2(a, b) {
  let valueToEval = a.quantity ?? a.ratio;
  if (!isNumber2(valueToEval)) {
    throw `evalToQuantity does not support non quantity types`;
  }
  if (a.kind == "comp-ratio" && valueToEval > 1 / 2 && valueToEval < 2) {
    valueToEval = valueToEval > 1 ? valueToEval - 1 : 1 - valueToEval;
  }
  const matched = helpers2.evalExpression(b.expression, valueToEval);
  return {
    kind: "eval-option",
    expression: b.expression,
    value: b.optionValue != null ? matched ? b.optionValue : null : matched
  };
}
function evalToOption2(a, b) {
  const result = evalToOptionEx2(a, b);
  return {
    question: b.optionValue != null ? `Vyhodno\u0165 volbu [${b.optionValue}]?` : `Vyhodno\u0165 v\xFDraz ${b.expression}?`,
    result,
    options: []
  };
}
function partToPartRuleEx2(a, partToPartRatio, nth2) {
  if (!(partToPartRatio.whole != null && matchAgent2(partToPartRatio.whole, a) || partToPartRatio.parts.some((d) => matchAgent2(d, a)))) {
    throw `Mismatch agent ${[a.agent, a.entity].join()} any of ${[partToPartRatio.whole].concat(partToPartRatio.parts).join()}`;
  }
  const sourcePartIndex = partToPartRatio.parts.findIndex((d) => matchAgent2(d, a));
  const targetPartIndex = nth2 != null ? partToPartRatio.parts.findIndex((d) => d === nth2.agent) : matchAgent2(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;
  const partsSum = areNumbers2(partToPartRatio.ratios) ? partToPartRatio.ratios.reduce((out, d) => out += d, 0) : partToPartRatio.ratios.join(" + ");
  const matchedWhole = matchAgent2(partToPartRatio.whole, a);
  return {
    kind: "cont",
    agent: (matchedWhole || nth2 != null) && targetPartIndex != -1 ? partToPartRatio.parts[targetPartIndex] : partToPartRatio.whole,
    entity: a.entity,
    quantity: matchedWhole ? areNumbers2(partToPartRatio.ratios) && isNumber2(a.quantity) ? a.quantity / partToPartRatio.ratios.reduce((out, d) => out += d, 0) * partToPartRatio.ratios[targetPartIndex] : wrapToQuantity2(`a.quantity / (${partToPartRatio.ratios.map((d, i) => `b.ratios[${i}]`).join(" + ")}) * b.ratios[${targetPartIndex}]`, { a, b: partToPartRatio }) : areNumbers2(partToPartRatio.ratios) && isNumber2(a.quantity) ? a.quantity / partToPartRatio.ratios[sourcePartIndex] * (nth2 != null ? partToPartRatio.ratios[targetPartIndex] : partToPartRatio.ratios.reduce((out, d) => out += d, 0)) : nth2 != null ? wrapToQuantity2(`a.quantity / b.ratios[${sourcePartIndex}] * b.ratios[${targetPartIndex}]`, { a, b: partToPartRatio }) : wrapToQuantity2(`a.quantity / b.ratios[${sourcePartIndex}] * (${partToPartRatio.ratios.map((d, i) => `b.ratios[${i}]`).join(" + ")})`, { a, b: partToPartRatio }),
    unit: a.unit
  };
}
function partToPartRule2(a, partToPartRatio, nth2) {
  const result = partToPartRuleEx2(a, partToPartRatio, nth2);
  const matchedWhole = matchAgent2(partToPartRatio.whole, a);
  let sourcePartIndex = partToPartRatio.parts.findIndex((d) => matchAgent2(d, a));
  const targetPartIndex = nth2 != null ? partToPartRatio.parts.findIndex((d) => d === nth2.agent) : matchAgent2(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;
  if (sourcePartIndex == -1)
    sourcePartIndex = 0;
  const partsSum = `(${partToPartRatio.ratios.join(" + ")})`;
  return {
    question: containerQuestion2(result),
    result,
    options: areNumbers2(partToPartRatio.ratios) && isNumber2(a.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber2(a.quantity)} / ${partsSum} * ${formatNumber2(partToPartRatio.ratios[targetPartIndex])}`, result: formatNumber2(result.quantity), ok: matchedWhole },
      { tex: `${formatNumber2(a.quantity)} / ${formatNumber2(partToPartRatio.ratios[sourcePartIndex])} * ${nth2 != null ? partToPartRatio.ratios[targetPartIndex] : partsSum}`, result: formatNumber2(result.quantity), ok: !matchedWhole }
    ] : []
  };
}
function mapRatiosByFactorEx2(multi, quantity) {
  if (!areNumbers2(multi.ratios)) {
    throw "ratios are not supported by non quantity types";
  }
  return { ...multi, ratios: multi.ratios.map((d) => d * quantity) };
}
function mapRatiosByFactor2(multi, factor, inverse) {
  if (!areNumbers2(multi.ratios) || !isNumber2(factor.quantity)) {
    throw "ratios are not supported by non quantity types";
  }
  const quantity = inverse ? factor.quantity : 1 / factor.quantity;
  const result = mapRatiosByFactorEx2(multi, quantity);
  return {
    question: `${quantity > 1 ? "Rozn\xE1sob " : "Zkra\u0165 "} pom\u011Br \u010D\xEDslem ${quantity > 1 ? formatNumber2(quantity) : formatNumber2(1 / quantity)}`,
    result,
    options: []
  };
}
function nthPartFactorByEx2(multi, factor, nthPart3) {
  if (!areNumbers2(multi.ratios) || !isNumber2(factor)) {
    throw "ratios are not supported by non quantity types";
  }
  if (factor < 1) {
    throw `Ratios can be only extended by positive quantity ${factor}.`;
  }
  const partIndex = multi.parts.indexOf(nthPart3.agent);
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
function nthPartFactorBy2(multi, factor, nthPart3) {
  if (!areNumbers2(multi.ratios) || !isNumber2(factor.quantity)) {
    throw "ratios are not supported by non quantity types";
  }
  const result = nthPartFactorByEx2(multi, factor.quantity, nthPart3);
  return {
    question: `Vyj\xE1d\u0159i pom\u011Brem ${nthPart3.agent} ${formatNumber2(factor.quantity)} ${formatEntity2(factor)}`,
    result,
    options: []
  };
}
function matchAgent2(d, a) {
  return d === a.agent;
}
function partEqualEx2(a, b) {
  if (!isNumber2(a.quantity)) {
    throw "partEqual are not supported by non quantity types";
  }
  const diff = compDiff2(b.agent, a.quantity > 0 ? a.agentB : a.agentA, abs2(a.quantity), a.entity);
  const rest = diffRuleEx2(b, diff);
  if (!isNumber2(rest.quantity)) {
    throw "partEqual are not supported by non quantity types";
  }
  return {
    ...rest,
    quantity: rest.quantity / 2
  };
}
function partEqual2(a, b) {
  if (!isNumber2(a.quantity)) {
    throw "partEqual are not supported by non quantity types";
  }
  const diff = compDiff2(b.agent, a.quantity > 0 ? a.agentB : a.agentA, abs2(a.quantity), a.entity);
  const result = partEqualEx2(a, b);
  return {
    question: containerQuestion2(result),
    result,
    options: isNumber2(b.quantity) && isNumber2(a.quantity) && isNumber2(diff.quantity) ? [
      { tex: `(${formatNumber2(b.quantity)} - ${formatNumber2(diff.quantity)}) / 2`, result: formatNumber2((b.quantity - diff.quantity) / 2), ok: b.agent === diff.agentMinuend },
      { tex: `(${formatNumber2(b.quantity)} + ${formatNumber2(diff.quantity)}) / 2`, result: formatNumber2((b.quantity + diff.quantity) / 2), ok: b.agent !== diff.agentMinuend }
    ] : []
  };
}
function nthTermRuleEx2(a, b) {
  if (!isNumber2(a.quantity)) {
    throw "nthTermRule are not supported by non quantity types";
  }
  const [first, second] = b.type.sequence;
  return {
    kind: "cont",
    agent: a.agent,
    entity: b.entity,
    quantity: b.type.kind === "arithmetic" ? first + (a.quantity - 1) * b.type.commonDifference : b.type.kind === "quadratic" ? nthQuadraticElementFromDifference2(first, second, b.type.secondDifference, a.quantity) : b.type.kind === "geometric" ? first * Math.pow(b.type.commonRatio, a.quantity - 1) : NaN
  };
}
function nthTermRule2(a, b) {
  const result = nthTermRuleEx2(a, b);
  return {
    question: `Vypo\u010Dti ${result.agent} na pozici ${a.quantity}?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(result.quantity) ? [
      { tex: formatSequence3(b.type, a.quantity), result: formatNumber2(result.quantity), ok: true }
    ] : []
  };
}
function nthPositionRuleEx2(a, b, newEntity = "nth") {
  if (!isNumber2(a.quantity)) {
    throw "nthTermRule are not supported by non quantity types";
  }
  const { kind, sequence } = b.type;
  const [first, second] = sequence;
  return {
    kind: "cont",
    agent: a.agent,
    entity: newEntity,
    quantity: kind === "arithmetic" ? Math.round((a.quantity - first) / b.type.commonDifference) + 1 : kind === "quadratic" ? findPositionInQuadraticSequence2(a.quantity, first, second, b.type.secondDifference) : kind === "geometric" ? Math.round(Math.log(a.quantity / first) / Math.log(b.type.commonRatio)) + 1 : NaN
  };
}
function nthPositionRule2(a, b, newEntity = "nth") {
  const result = nthPositionRuleEx2(a, b, newEntity);
  return {
    question: `Vypo\u010Dti pozici ${result.agent} = ${formatEntity2(a)}?`,
    result,
    options: isNumber2(result.quantity) ? [
      { tex: "Dle vzorce", result: formatNumber2(result.quantity), ok: true }
    ] : []
  };
}
function isQuestion2(value) {
  return value?.result != null;
}
function isQuantityPredicate2(value) {
  return value.quantity != null;
}
function isRatioPredicate2(value) {
  return value.ratio != null;
}
function isRatePredicate2(value) {
  return value.kind === "rate";
}
function inferenceRule2(...args) {
  const value = inferenceRuleEx2(...args);
  return isQuestion2(value) ? value.result : value;
}
function inferenceRuleEx2(...args) {
  const [a, b, ...rest] = args;
  const last22 = rest?.length > 0 ? rest[rest.length - 1] : null;
  if (["sum", "accumulate", "slide", "product", "gcd", "lcd", "sequence"].includes(last22?.kind) || last22?.kind === "ratios" && args.length > 3) {
    const arr = [a, b].concat(rest.slice(0, -1));
    return last22.kind === "sequence" ? sequenceRule2(arr) : last22.kind === "gcd" ? gcdRule2(arr, last22) : last22.kind === "lcd" ? lcdRule2(arr, last22) : last22.kind === "product" ? productRule2(arr, last22) : ["sum", "accumulate", "slide"].includes(last22.kind) ? sumRule2(arr, last22) : last22.kind === "ratios" ? toRatios2(arr, last22) : null;
  } else if (a.kind === "eval-option" || b.kind === "eval-option") {
    return a.kind === "eval-option" ? evalToOption2(b, a) : b.kind === "eval-option" ? evalToOption2(a, b) : null;
  } else if (a.kind === "cont" && b.kind == "cont") {
    const kind = last22?.kind;
    return kind === "comp-diff" ? toComparisonDiff2(a, b) : kind === "diff" ? toDifference2(a, b, last22) : kind === "quota" ? toQuota2(a, b) : kind === "delta" ? toDelta2(a, b, last22) : kind === "pythagoras" ? pythagorasRule2(a, b, last22) : kind === "rate" ? toRate2(a, b) : kind === "ratios" ? toRatios2([a, b], last22) : kind === "comp-ratio" ? toRatioComparison2(a, b, last22) : kind === "ratio" ? toPartWholeRatio2(a, b, last22) : kind === "linear-equation" ? solveEquation2(a, b, last22) : toComparison2(a, b);
  } else if (a.kind === "cont" && b.kind === "eval-expr") {
    return evalToQuantity2(a, b);
  } else if (a.kind === "eval-expr" && b.kind === "cont") {
    return evalToQuantity2(b, a);
  } else if (a.kind === "rate" && b.kind === "rate" && last22.kind === "ratios") {
    return toRatios2([a, b], last22);
  } else if (a.kind === "rate" && b.kind === "rate" && last22.kind === "linear-equation") {
    return solveEquation2(a, b, last22);
  } else if ((a.kind === "cont" || a.kind === "comp") && b.kind === "unit") {
    return convertToUnit2(a, b);
  } else if (a.kind === "unit" && (b.kind === "cont" || b.kind === "comp")) {
    return convertToUnit2(b, a);
  } else if (a.kind === "cont" && b.kind === "round") {
    return roundTo3(a, b);
  } else if (a.kind === "round" && b.kind === "cont") {
    return roundTo3(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-angle") {
    return compareAngleRule2(a, b);
  } else if (a.kind === "comp-angle" && b.kind === "cont") {
    return compareAngleRule2(b, a);
  } else if (a.kind === "ratio" && b.kind === "ratio" && a.ratio == null) {
    return toRatio2(b, a.asPercent);
  } else if (a.kind === "ratio" && b.kind === "ratio" && b.ratio == null) {
    return toRatio2(a, b.asPercent);
  } else if (a.kind === "ratio" && b.kind === "ratio") {
    const kind = last22?.kind;
    return kind === "diff" ? toDifferenceAsRatio2(a, b, last22) : kind === "comp-ratio" ? toComparisonRatio2(a, b) : toComparisonAsRatio2(a, b);
  } else if (a.kind === "comp" && b.kind === "cont") {
    const kind = last22?.kind;
    return kind === "comp-part-eq" ? partEqual2(a, b) : compareRule2(b, a);
  } else if (a.kind === "cont" && b.kind === "comp") {
    const kind = last22?.kind;
    return kind === "comp-part-eq" ? partEqual2(b, a) : compareRule2(a, b);
  } else if ((a.kind === "cont" || a.kind === "quota") && b.kind == "rate") {
    return rateRule2(a, b);
  } else if (a.kind === "rate" && (b.kind == "cont" || b.kind === "quota")) {
    return rateRule2(b, a);
  } else if (a.kind === "comp" && b.kind == "comp-ratio") {
    return compRatioToCompRule2(b, a);
  } else if (a.kind === "comp-ratio" && b.kind == "comp") {
    return compRatioToCompRule2(a, b);
  } else if (a.kind === "comp" && b.kind == "ratios") {
    return compRatiosToCompRule2(b, a);
  } else if (a.kind === "ratios" && b.kind == "comp") {
    return compRatiosToCompRule2(a, b);
  } else if (a.kind === "proportion" && b.kind == "ratios") {
    return proportionRatiosRule2(b, a);
  } else if (a.kind === "ratios" && b.kind == "proportion") {
    return proportionRatiosRule2(a, b);
  } else if (a.kind === "proportion" && b.kind == "comp-ratio") {
    return proportionRule2(b, a);
  } else if (a.kind === "comp-ratio" && b.kind == "proportion") {
    return proportionRule2(a, b);
  } else if (a.kind === "cont" && b.kind == "quota") {
    const kind = last22?.kind;
    return kind === "rate" ? toRate2(a, b) : quotaRule2(a, b);
  } else if (a.kind === "quota" && b.kind == "cont") {
    const kind = last22?.kind;
    return kind === "rate" ? toRate2(b, a) : quotaRule2(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "cont") {
    return ratioCompareRule2(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-ratio") {
    return ratioCompareRule2(a, b);
  } else if (a.kind === "comp-ratio" && b.kind === "ratio") {
    return comparisonRatioRule2(a, b);
  } else if (a.kind === "ratio" && b.kind === "comp-ratio") {
    return comparisonRatioRule2(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "ratios") {
    return a.ratio == null ? convertToCompRatio2(b, a) : convertToPartToPartRatios2(a, b);
  } else if (a.kind === "ratios" && b.kind === "comp-ratio") {
    return b.ratio == null ? convertToCompRatio2(a, b) : convertToPartToPartRatios2(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "comp-ratio" && b.ratio == null) {
    return reverseCompRatio2(a, b.asPercent);
  } else if (a.kind === "comp-ratio" && b.kind === "comp-ratio" && a.ratio == null) {
    return reverseCompRatio2(b, a.asPercent);
  } else if (a.kind === "comp-ratio" && b.kind === "comp-ratio") {
    return comparisonRatioTransitiveRule2(a, b);
  } else if (a.kind === "cont" && b.kind === "ratio") {
    return partToWholeRule2(a, b);
  } else if (a.kind === "ratio" && b.kind === "cont") {
    return partToWholeRule2(b, a);
  } else if (a.kind === "complement" && b.kind === "ratio") {
    return ratioComplementRule2(a, b);
  } else if (a.kind === "ratio" && b.kind === "complement") {
    return ratioComplementRule2(b, a);
  } else if (a.kind === "nth-part" && b.kind === "ratios") {
    const kind = last22?.kind;
    return kind === "ratio" ? ratiosConvertRule2(a, b, last22) : null;
  } else if (a.kind === "ratios" && b.kind === "nth-part") {
    const kind = last22?.kind;
    return kind === "ratio" ? ratiosConvertRule2(b, a, last22) : null;
  } else if (a.kind === "cont" && b.kind == "ratios") {
    const kind = last22?.kind;
    return kind === "scale" ? mapRatiosByFactor2(b, a) : kind === "invert-scale" ? mapRatiosByFactor2(b, a, true) : kind === "nth-factor" ? nthPartFactorBy2(b, a, last22) : kind === "nth-part" ? partToPartRule2(a, b, last22) : partToPartRule2(a, b);
  } else if (a.kind === "ratios" && b.kind == "cont") {
    const kind = last22?.kind;
    return kind === "scale" ? mapRatiosByFactor2(a, b) : kind === "invert-scale" ? mapRatiosByFactor2(a, b, true) : kind === "nth-factor" ? nthPartFactorBy2(a, b, last22) : kind === "nth-part" ? partToPartRule2(b, a, last22) : partToPartRule2(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-diff") {
    return diffRule2(a, b);
  } else if (a.kind === "comp-diff" && b.kind === "cont") {
    return diffRule2(b, a);
  } else if (a.kind === "sequence" && b.kind === "cont") {
    const kind = last22?.kind;
    return kind === "nth" ? nthPositionRule2(b, a, last22.entity) : nthTermRule2(b, a);
  } else if (a.kind === "cont" && b.kind === "sequence") {
    const kind = last22?.kind;
    return kind === "nth" ? nthPositionRule2(a, b, last22.entity) : nthTermRule2(a, b);
  } else if (a.kind === "cont" && b.kind === "transfer") {
    return transferRule2(a, b, "after");
  } else if (a.kind === "transfer" && b.kind === "cont") {
    return transferRule2(b, a, "before");
  } else if (a.kind === "cont" && b.kind === "delta") {
    return deltaRule2(a, b, "after");
  } else if (a.kind === "delta" && b.kind === "cont") {
    return deltaRule2(b, a, "before");
  } else if (a.kind === "comp" && b.kind === "delta") {
    return convertCompareToDeltaEx2(a, b);
  } else if (a.kind === "delta" && b.kind === "comp") {
    return convertDeltaToCompareEx2(a, b);
  } else if (a.kind === "comp" && b.kind === "delta") {
    return convertCompareToDeltaEx2(a, b);
  } else if (a.kind === "comp" && b.kind === "comp") {
    return compareToCompareRule2(b, a);
  } else {
    return null;
  }
}
function gcdCalc3(numbers) {
  let num = 2, res = 1;
  while (num <= Math.min(...numbers)) {
    if (numbers.every((n) => n % num === 0)) {
      res = num;
    }
    num++;
  }
  return res;
}
function lcdCalcEx3(a, b) {
  return abs2(a * b) / gcdCalc3([a, b]);
}
function lcdCalc3(numbers) {
  return numbers.reduce((acc, num) => lcdCalcEx3(acc, num), 1);
}
function sequencer2(sequence) {
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
function nthQuadraticElements2(firstElement, secondElement, secondDifference) {
  const A = secondDifference / 2;
  const B = secondElement - firstElement - 3 * A;
  const C = firstElement - (A + B);
  return { A, B, C };
}
function nthQuadraticElementFromDifference2(firstElement, secondElement, secondDifference, n) {
  const { A, B, C } = nthQuadraticElements2(firstElement, secondElement, secondDifference);
  return A * n ** 2 + B * n + C;
}
function findPositionInQuadraticSequence2(nthTermValue, first, second, secondDifference) {
  const A = secondDifference / 2;
  const B = second - first - 3 * A;
  const C = first - A - B;
  const delta = B ** 2 - 4 * A * (C - nthTermValue);
  if (delta < 0) {
    throw new Error("No valid position exists for the given values.");
  }
  const n1 = (-B + Math.sqrt(delta)) / (2 * A);
  const n2 = (-B - Math.sqrt(delta)) / (2 * A);
  if (Number.isInteger(n1) && n1 > 0)
    return n1;
  if (Number.isInteger(n2) && n2 > 0)
    return n2;
  throw new Error("The given values do not correspond to a valid position in the sequence.");
}
function formatNumber2(d) {
  return d.toLocaleString("cs-CZ", { maximumFractionDigits: 6, minimumFractionDigits: 0 });
}
function formatRatio2(d, asPercent) {
  if (asPercent)
    return `${formatNumber2(d * 100)} %`;
  return d > -2 && d < 2 ? helpers2.convertToFraction(d) : formatNumber2(d);
}
function containerQuestion2(d) {
  return `${computeQuestion2(d.quantity)} ${d.agent}${formatEntity2(d)}?`;
}
function computeQuestion2(d) {
  return isNumber2(d) ? "Vypo\u010Dti" : "Vyj\xE1d\u0159i v\xFDrazem s prom\u011Bnnou";
}
function toGenerAgent2(a) {
  return {
    kind: "cont",
    agent: a.entity,
    quantity: a.quantity,
    entity: ""
  };
}
function primeFactorization2(numbers) {
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
function gcdFromPrimeFactors2(primeFactors) {
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
  return primeFactors.reduce((acc, curr) => intersection(acc, curr), primeFactors[0] || []);
}
function lcdFromPrimeFactors2(primeFactors) {
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
  return primeFactors.reduce((acc, curr) => union(acc, curr), []);
}
function formatEntity2(d) {
  return d.entity || d.unit ? `(${[d.unit, d.entity].filter((d2) => d2 != null && d2 != "").join(" ")})` : "";
}
function computeOtherAngle2(angle1, relationship) {
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
      return angle1;
    default:
      throw "Unknown Angle Relationship";
  }
}
function formatAngle2(relationship) {
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
    default:
      throw "Nezn\xE1m\xFD vztah";
  }
}
function formatSequence3(type, n) {
  const simplify22 = (d, op = "") => d !== 1 ? `${d}${op}` : "";
  if (type.kind === "arithmetic")
    return `${type.sequence[0]} + ${type.commonDifference}(${formatNumber2(n)}-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements2(first, second, type.secondDifference);
    let parts = [`${simplify22(A, "*")}${formatNumber2(n)}^2^`];
    if (B !== 0) {
      parts = parts.concat(`${simplify22(B, "*")}${formatNumber2(n)}`);
    }
    if (C !== 0) {
      parts = parts.concat(`${simplify22(C, "*")}${formatNumber2(n)}`);
    }
    return `${parts.map((d, i) => `${i !== 0 ? " + " : ""}${d}`).join(" ")}`;
  }
  if (type.kind === "geometric") {
    return `${simplify22(type.sequence[0], "*")}${type.commonRatio}^(${formatNumber2(n)}-1)^`;
  }
}
function sequenceOptions2(seqType) {
  return [
    { tex: "stejn\xFD rozd\xEDl", result: `${seqType.kind === "arithmetic" ? formatNumber2(seqType.commonDifference) : "chybn\u011B"}`, ok: seqType.kind === "arithmetic" },
    { tex: "stejn\xFD druh\xFD rozd\xEDl", result: `${seqType.kind === "quadratic" ? formatNumber2(seqType.secondDifference) : "chybn\u011B"}`, ok: seqType.kind === "quadratic" },
    { tex: "stejn\xFD pom\u011Br", result: `${seqType.kind === "geometric" ? formatNumber2(seqType.commonRatio) : "chybn\u011B"}`, ok: seqType.kind === "geometric" }
  ];
}
var unique2 = (value, index, array) => array.indexOf(value) === index;
function abs2(v) {
  return Math.abs(v);
}
function resultAsQuestion2(result) {
  return {
    question: "",
    result,
    options: []
  };
}
if (typeof BigInt === "undefined")
  BigInt = function(n) {
    if (isNaN(n))
      throw new Error("");
    return n;
  };
var C_ZERO2 = BigInt(0);
var C_ONE2 = BigInt(1);
var C_TWO2 = BigInt(2);
var C_FIVE2 = BigInt(5);
var C_TEN2 = BigInt(10);
var MAX_CYCLE_LEN2 = 2e3;
var P2 = {
  "s": C_ONE2,
  "n": C_ZERO2,
  "d": C_ONE2
};
function assign2(n, s) {
  try {
    n = BigInt(n);
  } catch (e) {
    throw InvalidParameter2();
  }
  return n * s;
}
function trunc3(x) {
  return typeof x === "bigint" ? x : Math.floor(x);
}
function newFraction2(n, d) {
  if (d === C_ZERO2) {
    throw DivisionByZero2();
  }
  const f = Object.create(Fraction2.prototype);
  f["s"] = n < C_ZERO2 ? -C_ONE2 : C_ONE2;
  n = n < C_ZERO2 ? -n : n;
  const a = gcd3(n, d);
  f["n"] = n / a;
  f["d"] = d / a;
  return f;
}
function factorize2(num) {
  const factors = {};
  let n = num;
  let i = C_TWO2;
  let s = C_FIVE2 - C_ONE2;
  while (s <= n) {
    while (n % i === C_ZERO2) {
      n /= i;
      factors[i] = (factors[i] || C_ZERO2) + C_ONE2;
    }
    s += C_ONE2 + C_TWO2 * i++;
  }
  if (n !== num) {
    if (n > 1)
      factors[n] = (factors[n] || C_ZERO2) + C_ONE2;
  } else {
    factors[num] = (factors[num] || C_ZERO2) + C_ONE2;
  }
  return factors;
}
var parse2 = function(p1, p2) {
  let n = C_ZERO2, d = C_ONE2, s = C_ONE2;
  if (p1 === void 0 || p1 === null) {
  } else if (p2 !== void 0) {
    if (typeof p1 === "bigint") {
      n = p1;
    } else if (isNaN(p1)) {
      throw InvalidParameter2();
    } else if (p1 % 1 !== 0) {
      throw NonIntegerParameter2();
    } else {
      n = BigInt(p1);
    }
    if (typeof p2 === "bigint") {
      d = p2;
    } else if (isNaN(p2)) {
      throw InvalidParameter2();
    } else if (p2 % 1 !== 0) {
      throw NonIntegerParameter2();
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
      throw InvalidParameter2();
    }
    s = n * d;
  } else if (typeof p1 === "number") {
    if (isNaN(p1)) {
      throw InvalidParameter2();
    }
    if (p1 < 0) {
      s = -C_ONE2;
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
    let v = C_ZERO2, w = C_ZERO2, x = C_ZERO2, y = C_ONE2, z = C_ONE2;
    let match = p1.replace(/_/g, "").match(/\d+|./g);
    if (match === null)
      throw InvalidParameter2();
    if (match[ndx] === "-") {
      s = -C_ONE2;
      ndx++;
    } else if (match[ndx] === "+") {
      ndx++;
    }
    if (match.length === ndx + 1) {
      w = assign2(match[ndx++], s);
    } else if (match[ndx + 1] === "." || match[ndx] === ".") {
      if (match[ndx] !== ".") {
        v = assign2(match[ndx++], s);
      }
      ndx++;
      if (ndx + 1 === match.length || match[ndx + 1] === "(" && match[ndx + 3] === ")" || match[ndx + 1] === "'" && match[ndx + 3] === "'") {
        w = assign2(match[ndx], s);
        y = C_TEN2 ** BigInt(match[ndx].length);
        ndx++;
      }
      if (match[ndx] === "(" && match[ndx + 2] === ")" || match[ndx] === "'" && match[ndx + 2] === "'") {
        x = assign2(match[ndx + 1], s);
        z = C_TEN2 ** BigInt(match[ndx + 1].length) - C_ONE2;
        ndx += 3;
      }
    } else if (match[ndx + 1] === "/" || match[ndx + 1] === ":") {
      w = assign2(match[ndx], s);
      y = assign2(match[ndx + 2], C_ONE2);
      ndx += 3;
    } else if (match[ndx + 3] === "/" && match[ndx + 1] === " ") {
      v = assign2(match[ndx], s);
      w = assign2(match[ndx + 2], s);
      y = assign2(match[ndx + 4], C_ONE2);
      ndx += 5;
    }
    if (match.length <= ndx) {
      d = y * z;
      s = /* void */
      n = x + d * v + z * w;
    } else {
      throw InvalidParameter2();
    }
  } else if (typeof p1 === "bigint") {
    n = p1;
    s = p1;
    d = C_ONE2;
  } else {
    throw InvalidParameter2();
  }
  if (d === C_ZERO2) {
    throw DivisionByZero2();
  }
  P2["s"] = s < C_ZERO2 ? -C_ONE2 : C_ONE2;
  P2["n"] = n < C_ZERO2 ? -n : n;
  P2["d"] = d < C_ZERO2 ? -d : d;
};
function modpow2(b, e, m) {
  let r = C_ONE2;
  for (; e > C_ZERO2; b = b * b % m, e >>= C_ONE2) {
    if (e & C_ONE2) {
      r = r * b % m;
    }
  }
  return r;
}
function cycleLen2(n, d) {
  for (; d % C_TWO2 === C_ZERO2; d /= C_TWO2) {
  }
  for (; d % C_FIVE2 === C_ZERO2; d /= C_FIVE2) {
  }
  if (d === C_ONE2)
    return C_ZERO2;
  let rem = C_TEN2 % d;
  let t = 1;
  for (; rem !== C_ONE2; t++) {
    rem = rem * C_TEN2 % d;
    if (t > MAX_CYCLE_LEN2)
      return C_ZERO2;
  }
  return BigInt(t);
}
function cycleStart2(n, d, len) {
  let rem1 = C_ONE2;
  let rem2 = modpow2(C_TEN2, len, d);
  for (let t = 0; t < 300; t++) {
    if (rem1 === rem2)
      return BigInt(t);
    rem1 = rem1 * C_TEN2 % d;
    rem2 = rem2 * C_TEN2 % d;
  }
  return 0;
}
function gcd3(a, b) {
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
function Fraction2(a, b) {
  parse2(a, b);
  if (this instanceof Fraction2) {
    a = gcd3(P2["d"], P2["n"]);
    this["s"] = P2["s"];
    this["n"] = P2["n"] / a;
    this["d"] = P2["d"] / a;
  } else {
    return newFraction2(P2["s"] * P2["n"], P2["d"]);
  }
}
var DivisionByZero2 = function() {
  return new Error("Division by Zero");
};
var InvalidParameter2 = function() {
  return new Error("Invalid argument");
};
var NonIntegerParameter2 = function() {
  return new Error("Parameters must be integer");
};
Fraction2.prototype = {
  "s": C_ONE2,
  "n": C_ZERO2,
  "d": C_ONE2,
  /**
   * Calculates the absolute value
   *
   * Ex: new Fraction(-4).abs() => 4
   **/
  "abs": function() {
    return newFraction2(this["n"], this["d"]);
  },
  /**
   * Inverts the sign of the current fraction
   *
   * Ex: new Fraction(-4).neg() => 4
   **/
  "neg": function() {
    return newFraction2(-this["s"] * this["n"], this["d"]);
  },
  /**
   * Adds two rational numbers
   *
   * Ex: new Fraction({n: 2, d: 3}).add("14.9") => 467 / 30
   **/
  "add": function(a, b) {
    parse2(a, b);
    return newFraction2(
      this["s"] * this["n"] * P2["d"] + P2["s"] * this["d"] * P2["n"],
      this["d"] * P2["d"]
    );
  },
  /**
   * Subtracts two rational numbers
   *
   * Ex: new Fraction({n: 2, d: 3}).add("14.9") => -427 / 30
   **/
  "sub": function(a, b) {
    parse2(a, b);
    return newFraction2(
      this["s"] * this["n"] * P2["d"] - P2["s"] * this["d"] * P2["n"],
      this["d"] * P2["d"]
    );
  },
  /**
   * Multiplies two rational numbers
   *
   * Ex: new Fraction("-17.(345)").mul(3) => 5776 / 111
   **/
  "mul": function(a, b) {
    parse2(a, b);
    return newFraction2(
      this["s"] * P2["s"] * this["n"] * P2["n"],
      this["d"] * P2["d"]
    );
  },
  /**
   * Divides two rational numbers
   *
   * Ex: new Fraction("-17.(345)").inverse().div(3)
   **/
  "div": function(a, b) {
    parse2(a, b);
    return newFraction2(
      this["s"] * P2["s"] * this["n"] * P2["d"],
      this["d"] * P2["n"]
    );
  },
  /**
   * Clones the actual object
   *
   * Ex: new Fraction("-17.(345)").clone()
   **/
  "clone": function() {
    return newFraction2(this["s"] * this["n"], this["d"]);
  },
  /**
   * Calculates the modulo of two rational numbers - a more precise fmod
   *
   * Ex: new Fraction('4.(3)').mod([7, 8]) => (13/3) % (7/8) = (5/6)
   * Ex: new Fraction(20, 10).mod().equals(0) ? "is Integer"
   **/
  "mod": function(a, b) {
    if (a === void 0) {
      return newFraction2(this["s"] * this["n"] % this["d"], C_ONE2);
    }
    parse2(a, b);
    if (C_ZERO2 === P2["n"] * this["d"]) {
      throw DivisionByZero2();
    }
    return newFraction2(
      this["s"] * (P2["d"] * this["n"]) % (P2["n"] * this["d"]),
      P2["d"] * this["d"]
    );
  },
  /**
   * Calculates the fractional gcd of two rational numbers
   *
   * Ex: new Fraction(5,8).gcd(3,7) => 1/56
   */
  "gcd": function(a, b) {
    parse2(a, b);
    return newFraction2(gcd3(P2["n"], this["n"]) * gcd3(P2["d"], this["d"]), P2["d"] * this["d"]);
  },
  /**
   * Calculates the fractional lcm of two rational numbers
   *
   * Ex: new Fraction(5,8).lcm(3,7) => 15
   */
  "lcm": function(a, b) {
    parse2(a, b);
    if (P2["n"] === C_ZERO2 && this["n"] === C_ZERO2) {
      return newFraction2(C_ZERO2, C_ONE2);
    }
    return newFraction2(P2["n"] * this["n"], gcd3(P2["n"], this["n"]) * gcd3(P2["d"], this["d"]));
  },
  /**
   * Gets the inverse of the fraction, means numerator and denominator are exchanged
   *
   * Ex: new Fraction([-3, 4]).inverse() => -4 / 3
   **/
  "inverse": function() {
    return newFraction2(this["s"] * this["d"], this["n"]);
  },
  /**
   * Calculates the fraction to some integer exponent
   *
   * Ex: new Fraction(-1,2).pow(-3) => -8
   */
  "pow": function(a, b) {
    parse2(a, b);
    if (P2["d"] === C_ONE2) {
      if (P2["s"] < C_ZERO2) {
        return newFraction2((this["s"] * this["d"]) ** P2["n"], this["n"] ** P2["n"]);
      } else {
        return newFraction2((this["s"] * this["n"]) ** P2["n"], this["d"] ** P2["n"]);
      }
    }
    if (this["s"] < C_ZERO2)
      return null;
    let N = factorize2(this["n"]);
    let D = factorize2(this["d"]);
    let n = C_ONE2;
    let d = C_ONE2;
    for (let k in N) {
      if (k === "1")
        continue;
      if (k === "0") {
        n = C_ZERO2;
        break;
      }
      N[k] *= P2["n"];
      if (N[k] % P2["d"] === C_ZERO2) {
        N[k] /= P2["d"];
      } else
        return null;
      n *= BigInt(k) ** N[k];
    }
    for (let k in D) {
      if (k === "1")
        continue;
      D[k] *= P2["n"];
      if (D[k] % P2["d"] === C_ZERO2) {
        D[k] /= P2["d"];
      } else
        return null;
      d *= BigInt(k) ** D[k];
    }
    if (P2["s"] < C_ZERO2) {
      return newFraction2(d, n);
    }
    return newFraction2(n, d);
  },
  /**
   * Calculates the logarithm of a fraction to a given rational base
   *
   * Ex: new Fraction(27, 8).log(9, 4) => 3/2
   */
  "log": function(a, b) {
    parse2(a, b);
    if (this["s"] <= C_ZERO2 || P2["s"] <= C_ZERO2)
      return null;
    const allPrimes = {};
    const baseFactors = factorize2(P2["n"]);
    const T1 = factorize2(P2["d"]);
    const numberFactors = factorize2(this["n"]);
    const T2 = factorize2(this["d"]);
    for (const prime in T1) {
      baseFactors[prime] = (baseFactors[prime] || C_ZERO2) - T1[prime];
    }
    for (const prime in T2) {
      numberFactors[prime] = (numberFactors[prime] || C_ZERO2) - T2[prime];
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
      const baseExponent = baseFactors[prime] || C_ZERO2;
      const numberExponent = numberFactors[prime] || C_ZERO2;
      if (baseExponent === C_ZERO2) {
        if (numberExponent !== C_ZERO2) {
          return null;
        }
        continue;
      }
      let curN = numberExponent;
      let curD = baseExponent;
      const gcdValue = gcd3(curN, curD);
      curN /= gcdValue;
      curD /= gcdValue;
      if (retN === null && retD === null) {
        retN = curN;
        retD = curD;
      } else if (curN * retD !== retN * curD) {
        return null;
      }
    }
    return retN !== null && retD !== null ? newFraction2(retN, retD) : null;
  },
  /**
   * Check if two rational numbers are the same
   *
   * Ex: new Fraction(19.6).equals([98, 5]);
   **/
  "equals": function(a, b) {
    parse2(a, b);
    return this["s"] * this["n"] * P2["d"] === P2["s"] * P2["n"] * this["d"];
  },
  /**
   * Check if this rational number is less than another
   *
   * Ex: new Fraction(19.6).lt([98, 5]);
   **/
  "lt": function(a, b) {
    parse2(a, b);
    return this["s"] * this["n"] * P2["d"] < P2["s"] * P2["n"] * this["d"];
  },
  /**
   * Check if this rational number is less than or equal another
   *
   * Ex: new Fraction(19.6).lt([98, 5]);
   **/
  "lte": function(a, b) {
    parse2(a, b);
    return this["s"] * this["n"] * P2["d"] <= P2["s"] * P2["n"] * this["d"];
  },
  /**
   * Check if this rational number is greater than another
   *
   * Ex: new Fraction(19.6).lt([98, 5]);
   **/
  "gt": function(a, b) {
    parse2(a, b);
    return this["s"] * this["n"] * P2["d"] > P2["s"] * P2["n"] * this["d"];
  },
  /**
   * Check if this rational number is greater than or equal another
   *
   * Ex: new Fraction(19.6).lt([98, 5]);
   **/
  "gte": function(a, b) {
    parse2(a, b);
    return this["s"] * this["n"] * P2["d"] >= P2["s"] * P2["n"] * this["d"];
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
    parse2(a, b);
    let t = this["s"] * this["n"] * P2["d"] - P2["s"] * P2["n"] * this["d"];
    return (C_ZERO2 < t) - (t < C_ZERO2);
  },
  /**
   * Calculates the ceil of a rational number
   *
   * Ex: new Fraction('4.(3)').ceil() => (5 / 1)
   **/
  "ceil": function(places) {
    places = C_TEN2 ** BigInt(places || 0);
    return newFraction2(
      trunc3(this["s"] * places * this["n"] / this["d"]) + (places * this["n"] % this["d"] > C_ZERO2 && this["s"] >= C_ZERO2 ? C_ONE2 : C_ZERO2),
      places
    );
  },
  /**
   * Calculates the floor of a rational number
   *
   * Ex: new Fraction('4.(3)').floor() => (4 / 1)
   **/
  "floor": function(places) {
    places = C_TEN2 ** BigInt(places || 0);
    return newFraction2(
      trunc3(this["s"] * places * this["n"] / this["d"]) - (places * this["n"] % this["d"] > C_ZERO2 && this["s"] < C_ZERO2 ? C_ONE2 : C_ZERO2),
      places
    );
  },
  /**
   * Rounds a rational numbers
   *
   * Ex: new Fraction('4.(3)').round() => (4 / 1)
   **/
  "round": function(places) {
    places = C_TEN2 ** BigInt(places || 0);
    return newFraction2(
      trunc3(this["s"] * places * this["n"] / this["d"]) + this["s"] * ((this["s"] >= C_ZERO2 ? C_ONE2 : C_ZERO2) + C_TWO2 * (places * this["n"] % this["d"]) > this["d"] ? C_ONE2 : C_ZERO2),
      places
    );
  },
  /**
    * Rounds a rational number to a multiple of another rational number
    *
    * Ex: new Fraction('0.9').roundTo("1/8") => 7 / 8
    **/
  "roundTo": function(a, b) {
    parse2(a, b);
    const n = this["n"] * P2["d"];
    const d = this["d"] * P2["n"];
    const r = n % d;
    let k = trunc3(n / d);
    if (r + r >= d) {
      k++;
    }
    return newFraction2(this["s"] * k * P2["n"], P2["d"]);
  },
  /**
   * Check if two rational numbers are divisible
   *
   * Ex: new Fraction(19.6).divisible(1.5);
   */
  "divisible": function(a, b) {
    parse2(a, b);
    return !(!(P2["n"] * this["d"]) || this["n"] * P2["d"] % (P2["n"] * this["d"]));
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
    let cycLen = cycleLen2(N, D);
    let cycOff = cycleStart2(N, D, cycLen);
    let str = this["s"] < C_ZERO2 ? "-" : "";
    str += trunc3(N / D);
    N %= D;
    N *= C_TEN2;
    if (N)
      str += ".";
    if (cycLen) {
      for (let i = cycOff; i--; ) {
        str += trunc3(N / D);
        N %= D;
        N *= C_TEN2;
      }
      str += "(";
      for (let i = cycLen; i--; ) {
        str += trunc3(N / D);
        N %= D;
        N *= C_TEN2;
      }
      str += ")";
    } else {
      for (let i = dec; N && i--; ) {
        str += trunc3(N / D);
        N %= D;
        N *= C_TEN2;
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
    let str = this["s"] < C_ZERO2 ? "-" : "";
    if (d === C_ONE2) {
      str += n;
    } else {
      let whole = trunc3(n / d);
      if (showMixed && whole > C_ZERO2) {
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
    let str = this["s"] < C_ZERO2 ? "-" : "";
    if (d === C_ONE2) {
      str += n;
    } else {
      let whole = trunc3(n / d);
      if (showMixed && whole > C_ZERO2) {
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
      res.push(trunc3(a / b));
      let t = a % b;
      a = b;
      b = t;
    } while (a !== C_ONE2);
    return res;
  },
  "simplify": function(eps22) {
    const ieps = BigInt(1 / (eps22 || 1e-3) | 0);
    const thisABS = this["abs"]();
    const cont2 = thisABS["toContinued"]();
    for (let i = 1; i < cont2.length; i++) {
      let s = newFraction2(cont2[i - 1], C_ONE2);
      for (let k = i - 2; k >= 0; k--) {
        s = s["inverse"]()["add"](cont2[k]);
      }
      let t = s["sub"](thisABS);
      if (t["n"] * ieps < t["d"]) {
        return s["mul"](this["s"]);
      }
    }
    return this;
  }
};
var UnknownUnitError2 = class extends Error {
};
var OperationOrderError2 = class extends Error {
};
var IncompatibleUnitError2 = class extends Error {
};
var MeasureStructureError2 = class extends Error {
};
var UnknownMeasureError2 = class extends Error {
};
var Converter2 = class {
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
      throw new OperationOrderError2(".from must be called before .to");
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
  to(to22) {
    var _a, _b;
    if (this.origin == null)
      throw new Error(".to must be called after .from");
    this.destination = this.getUnit(to22);
    if (this.destination == null) {
      this.throwUnsupportedUnitError(to22);
    }
    const destination = this.destination;
    const origin = this.origin;
    if (origin.abbr === destination.abbr) {
      return this.val;
    }
    if (destination.measure != origin.measure) {
      throw new IncompatibleUnitError2(`Cannot convert incompatible measures of ${destination.measure} and ${origin.measure}`);
    }
    let result = this.val * origin.unit.to_anchor;
    if (origin.unit.anchor_shift) {
      result -= origin.unit.anchor_shift;
    }
    if (origin.system != destination.system) {
      const measure62 = this.measureData[origin.measure];
      const anchors = measure62.anchors;
      if (anchors == null) {
        throw new MeasureStructureError2(`Unable to convert units. Anchors are missing for "${origin.measure}" and "${destination.measure}" measures.`);
      }
      const anchor = anchors[origin.system];
      if (anchor == null) {
        throw new MeasureStructureError2(`Unable to find anchor for "${origin.measure}" to "${destination.measure}". Please make sure it is defined.`);
      }
      const transform = (_a = anchor[destination.system]) === null || _a === void 0 ? void 0 : _a.transform;
      const ratio3 = (_b = anchor[destination.system]) === null || _b === void 0 ? void 0 : _b.ratio;
      if (typeof transform === "function") {
        result = transform(result);
      } else if (typeof ratio3 === "number") {
        result *= ratio3;
      } else {
        throw new MeasureStructureError2("A system anchor needs to either have a defined ratio number or a transform function.");
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
      throw new OperationOrderError2(".toBest must be called after .from");
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
      for (const [name, measure62] of Object.entries(this.measureData)) {
        for (const [systemName, units] of Object.entries(measure62.systems)) {
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
        throw new UnknownMeasureError2(`Meausure "${measureName}" not found.`);
      const measure62 = this.measureData[measureName];
      for (const [systemName, units] of Object.entries(measure62.systems)) {
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
    for (const measure62 of Object.values(this.measureData)) {
      for (const systems of Object.values(measure62.systems)) {
        validUnits = validUnits.concat(Object.keys(systems));
      }
    }
    throw new UnknownUnitError2(`Unsupported unit ${what}, use one of: ${validUnits.join(", ")}`);
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
    for (const measure62 of list_measures) {
      const systems = this.measureData[measure62].systems;
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
function buildUnitCache2(measures) {
  const unitCache = /* @__PURE__ */ new Map();
  for (const [measureName, measure62] of Object.entries(measures)) {
    for (const [systemName, system] of Object.entries(measure62.systems)) {
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
function configureMeasurements2(measures) {
  if (typeof measures !== "object") {
    throw new TypeError("The measures argument needs to be an object");
  }
  const unitCache = buildUnitCache2(measures);
  return (value) => new Converter2(measures, unitCache, value);
}
var metric5 = {
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
var imperial5 = {
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
var measure6 = {
  systems: {
    metric: metric5,
    imperial: imperial5
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
var length_default2 = measure6;
var metric22 = {
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
var imperial22 = {
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
var measure22 = {
  systems: {
    metric: metric22,
    imperial: imperial22
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
var area_default2 = measure22;
var metric32 = {
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
var imperial32 = {
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
var measure32 = {
  systems: {
    metric: metric32,
    imperial: imperial32
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
var mass_default2 = measure32;
var metric42 = {
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
var imperial42 = {
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
var measure42 = {
  systems: {
    metric: metric42,
    imperial: imperial42
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
var volume_default2 = measure42;
var daysInYear2 = 365.25;
var SI2 = {
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
    to_anchor: 60 * 60 * 24 * daysInYear2 / 12
  },
  year: {
    name: {
      singular: "Year",
      plural: "Years"
    },
    to_anchor: 60 * 60 * 24 * daysInYear2
  }
};
var measure52 = {
  systems: {
    SI: SI2
  }
};
var time_default2 = measure52;
var INUMBER2 = "INUMBER";
var IOP12 = "IOP1";
var IOP22 = "IOP2";
var IOP32 = "IOP3";
var IVAR2 = "IVAR";
var IVARNAME2 = "IVARNAME";
var IFUNCALL2 = "IFUNCALL";
var IFUNDEF2 = "IFUNDEF";
var IEXPR2 = "IEXPR";
var IEXPREVAL2 = "IEXPREVAL";
var IMEMBER2 = "IMEMBER";
var IENDSTATEMENT2 = "IENDSTATEMENT";
var IARRAY2 = "IARRAY";
function Instruction2(type, value) {
  this.type = type;
  this.value = value !== void 0 && value !== null ? value : 0;
}
Instruction2.prototype.toString = function() {
  switch (this.type) {
    case INUMBER2:
    case IOP12:
    case IOP22:
    case IOP32:
    case IVAR2:
    case IVARNAME2:
    case IENDSTATEMENT2:
      return this.value;
    case IFUNCALL2:
      return "CALL " + this.value;
    case IFUNDEF2:
      return "DEF " + this.value;
    case IARRAY2:
      return "ARRAY " + this.value;
    case IMEMBER2:
      return "." + this.value;
    default:
      return "Invalid Instruction";
  }
};
function unaryInstruction2(value) {
  return new Instruction2(IOP12, value);
}
function binaryInstruction2(value) {
  return new Instruction2(IOP22, value);
}
function ternaryInstruction2(value) {
  return new Instruction2(IOP32, value);
}
function simplify2(tokens, unaryOps, binaryOps, ternaryOps, values) {
  var nstack = [];
  var newexpression = [];
  var n1, n2, n3;
  var f;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER2 || type === IVARNAME2) {
      if (Array.isArray(item.value)) {
        nstack.push.apply(nstack, simplify2(item.value.map(function(x) {
          return new Instruction2(INUMBER2, x);
        }).concat(new Instruction2(IARRAY2, item.value.length)), unaryOps, binaryOps, ternaryOps, values));
      } else {
        nstack.push(item);
      }
    } else if (type === IVAR2 && values.hasOwnProperty(item.value)) {
      item = new Instruction2(INUMBER2, values[item.value]);
      nstack.push(item);
    } else if (type === IOP22 && nstack.length > 1) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = binaryOps[item.value];
      item = new Instruction2(INUMBER2, f(n1.value, n2.value));
      nstack.push(item);
    } else if (type === IOP32 && nstack.length > 2) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === "?") {
        nstack.push(n1.value ? n2.value : n3.value);
      } else {
        f = ternaryOps[item.value];
        item = new Instruction2(INUMBER2, f(n1.value, n2.value, n3.value));
        nstack.push(item);
      }
    } else if (type === IOP12 && nstack.length > 0) {
      n1 = nstack.pop();
      f = unaryOps[item.value];
      item = new Instruction2(INUMBER2, f(n1.value));
      nstack.push(item);
    } else if (type === IEXPR2) {
      while (nstack.length > 0) {
        newexpression.push(nstack.shift());
      }
      newexpression.push(new Instruction2(IEXPR2, simplify2(item.value, unaryOps, binaryOps, ternaryOps, values)));
    } else if (type === IMEMBER2 && nstack.length > 0) {
      n1 = nstack.pop();
      nstack.push(new Instruction2(INUMBER2, n1.value[item.value]));
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
function substitute2(tokens, variable, expr) {
  var newexpression = [];
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === IVAR2 && item.value === variable) {
      for (var j = 0; j < expr.tokens.length; j++) {
        var expritem = expr.tokens[j];
        var replitem;
        if (expritem.type === IOP12) {
          replitem = unaryInstruction2(expritem.value);
        } else if (expritem.type === IOP22) {
          replitem = binaryInstruction2(expritem.value);
        } else if (expritem.type === IOP32) {
          replitem = ternaryInstruction2(expritem.value);
        } else {
          replitem = new Instruction2(expritem.type, expritem.value);
        }
        newexpression.push(replitem);
      }
    } else if (type === IEXPR2) {
      newexpression.push(new Instruction2(IEXPR2, substitute2(item.value, variable, expr)));
    } else {
      newexpression.push(item);
    }
  }
  return newexpression;
}
function evaluate2(tokens, expr, values) {
  var nstack = [];
  var n1, n2, n3;
  var f, args, argCount;
  if (isExpressionEvaluator2(tokens)) {
    return resolveExpression2(tokens, values);
  }
  var numTokens = tokens.length;
  for (var i = 0; i < numTokens; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER2 || type === IVARNAME2) {
      nstack.push(item.value);
    } else if (type === IOP22) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === "and") {
        nstack.push(n1 ? !!evaluate2(n2, expr, values) : false);
      } else if (item.value === "or") {
        nstack.push(n1 ? true : !!evaluate2(n2, expr, values));
      } else if (item.value === "=") {
        f = expr.binaryOps[item.value];
        nstack.push(f(n1, evaluate2(n2, expr, values), values));
      } else {
        f = expr.binaryOps[item.value];
        nstack.push(f(resolveExpression2(n1, values), resolveExpression2(n2, values)));
      }
    } else if (type === IOP32) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === "?") {
        nstack.push(evaluate2(n1 ? n2 : n3, expr, values));
      } else {
        f = expr.ternaryOps[item.value];
        nstack.push(f(resolveExpression2(n1, values), resolveExpression2(n2, values), resolveExpression2(n3, values)));
      }
    } else if (type === IVAR2) {
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
    } else if (type === IOP12) {
      n1 = nstack.pop();
      f = expr.unaryOps[item.value];
      nstack.push(f(resolveExpression2(n1, values)));
    } else if (type === IFUNCALL2) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(resolveExpression2(nstack.pop(), values));
      }
      f = nstack.pop();
      if (f.apply && f.call) {
        nstack.push(f.apply(void 0, args));
      } else {
        throw new Error(f + " is not a function");
      }
    } else if (type === IFUNDEF2) {
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
          return evaluate2(n22, expr, scope);
        };
        Object.defineProperty(f2, "name", {
          value: n12,
          writable: false
        });
        values[n12] = f2;
        return f2;
      }());
    } else if (type === IEXPR2) {
      nstack.push(createExpressionEvaluator2(item, expr));
    } else if (type === IEXPREVAL2) {
      nstack.push(item);
    } else if (type === IMEMBER2) {
      n1 = nstack.pop();
      nstack.push(n1[item.value]);
    } else if (type === IENDSTATEMENT2) {
      nstack.pop();
    } else if (type === IARRAY2) {
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
  return nstack[0] === 0 ? 0 : resolveExpression2(nstack[0], values);
}
function createExpressionEvaluator2(token, expr, values) {
  if (isExpressionEvaluator2(token))
    return token;
  return {
    type: IEXPREVAL2,
    value: function(scope) {
      return evaluate2(token.value, expr, scope);
    }
  };
}
function isExpressionEvaluator2(n) {
  return n && n.type === IEXPREVAL2;
}
function resolveExpression2(n, values) {
  return isExpressionEvaluator2(n) ? n.value(values) : n;
}
function expressionToString2(tokens, toJS) {
  var nstack = [];
  var n1, n2, n3;
  var f, args, argCount;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER2) {
      if (typeof item.value === "number" && item.value < 0) {
        nstack.push("(" + item.value + ")");
      } else if (Array.isArray(item.value)) {
        nstack.push("[" + item.value.map(escapeValue2).join(", ") + "]");
      } else {
        nstack.push(escapeValue2(item.value));
      }
    } else if (type === IOP22) {
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
    } else if (type === IOP32) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = item.value;
      if (f === "?") {
        nstack.push("(" + n1 + " ? " + n2 + " : " + n3 + ")");
      } else {
        throw new Error("invalid Expression");
      }
    } else if (type === IVAR2 || type === IVARNAME2) {
      nstack.push(item.value);
    } else if (type === IOP12) {
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
    } else if (type === IFUNCALL2) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      f = nstack.pop();
      nstack.push(f + "(" + args.join(", ") + ")");
    } else if (type === IFUNDEF2) {
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
    } else if (type === IMEMBER2) {
      n1 = nstack.pop();
      nstack.push(n1 + "." + item.value);
    } else if (type === IARRAY2) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      nstack.push("[" + args.join(", ") + "]");
    } else if (type === IEXPR2) {
      nstack.push("(" + expressionToString2(item.value, toJS) + ")");
    } else if (type === IENDSTATEMENT2)
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
function escapeValue2(v) {
  if (typeof v === "string") {
    return JSON.stringify(v).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  return v;
}
function contains2(array, obj) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === obj) {
      return true;
    }
  }
  return false;
}
function getSymbols2(tokens, symbols, options) {
  options = options || {};
  var withMembers = !!options.withMembers;
  var prevVar = null;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    if (item.type === IVAR2 || item.type === IVARNAME2) {
      if (!withMembers && !contains2(symbols, item.value)) {
        symbols.push(item.value);
      } else if (prevVar !== null) {
        if (!contains2(symbols, prevVar)) {
          symbols.push(prevVar);
        }
        prevVar = item.value;
      } else {
        prevVar = item.value;
      }
    } else if (item.type === IMEMBER2 && withMembers && prevVar !== null) {
      prevVar += "." + item.value;
    } else if (item.type === IEXPR2) {
      getSymbols2(item.value, symbols, options);
    } else if (prevVar !== null) {
      if (!contains2(symbols, prevVar)) {
        symbols.push(prevVar);
      }
      prevVar = null;
    }
  }
  if (prevVar !== null && !contains2(symbols, prevVar)) {
    symbols.push(prevVar);
  }
}
function Expression2(tokens, parser22) {
  this.tokens = tokens;
  this.parser = parser22;
  this.unaryOps = parser22.unaryOps;
  this.binaryOps = parser22.binaryOps;
  this.ternaryOps = parser22.ternaryOps;
  this.functions = parser22.functions;
}
Expression2.prototype.simplify = function(values) {
  values = values || {};
  return new Expression2(simplify2(this.tokens, this.unaryOps, this.binaryOps, this.ternaryOps, values), this.parser);
};
Expression2.prototype.substitute = function(variable, expr) {
  if (!(expr instanceof Expression2)) {
    expr = this.parser.parse(String(expr));
  }
  return new Expression2(substitute2(this.tokens, variable, expr), this.parser);
};
Expression2.prototype.evaluate = function(values) {
  values = values || {};
  return evaluate2(this.tokens, this, values);
};
Expression2.prototype.toString = function() {
  return expressionToString2(this.tokens, false);
};
Expression2.prototype.symbols = function(options) {
  options = options || {};
  var vars = [];
  getSymbols2(this.tokens, vars, options);
  return vars;
};
Expression2.prototype.variables = function(options) {
  options = options || {};
  var vars = [];
  getSymbols2(this.tokens, vars, options);
  var functions = this.functions;
  return vars.filter(function(name) {
    return !(name in functions);
  });
};
Expression2.prototype.toJSFunction = function(param, variables) {
  var expr = this;
  var f = new Function(param, "with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return " + expressionToString2(this.simplify(variables).tokens, true) + "; }");
  return function() {
    return f.apply(expr, arguments);
  };
};
var TEOF2 = "TEOF";
var TOP2 = "TOP";
var TNUMBER2 = "TNUMBER";
var TSTRING2 = "TSTRING";
var TPAREN2 = "TPAREN";
var TBRACKET2 = "TBRACKET";
var TCOMMA2 = "TCOMMA";
var TNAME2 = "TNAME";
var TSEMICOLON2 = "TSEMICOLON";
function Token2(type, value, index) {
  this.type = type;
  this.value = value;
  this.index = index;
}
Token2.prototype.toString = function() {
  return this.type + ": " + this.value;
};
function TokenStream2(parser22, expression) {
  this.pos = 0;
  this.current = null;
  this.unaryOps = parser22.unaryOps;
  this.binaryOps = parser22.binaryOps;
  this.ternaryOps = parser22.ternaryOps;
  this.consts = parser22.consts;
  this.expression = expression;
  this.savedPosition = 0;
  this.savedCurrent = null;
  this.options = parser22.options;
  this.parser = parser22;
}
TokenStream2.prototype.newToken = function(type, value, pos) {
  return new Token2(type, value, pos != null ? pos : this.pos);
};
TokenStream2.prototype.save = function() {
  this.savedPosition = this.pos;
  this.savedCurrent = this.current;
};
TokenStream2.prototype.restore = function() {
  this.pos = this.savedPosition;
  this.current = this.savedCurrent;
};
TokenStream2.prototype.next = function() {
  if (this.pos >= this.expression.length) {
    return this.newToken(TEOF2, "EOF");
  }
  if (this.isWhitespace() || this.isComment()) {
    return this.next();
  } else if (this.isRadixInteger() || this.isNumber() || this.isOperator() || this.isString() || this.isParen() || this.isBracket() || this.isComma() || this.isSemicolon() || this.isNamedOp() || this.isConst() || this.isName()) {
    return this.current;
  } else {
    this.parseError('Unknown character "' + this.expression.charAt(this.pos) + '"');
  }
};
TokenStream2.prototype.isString = function() {
  var r = false;
  var startPos = this.pos;
  var quote = this.expression.charAt(startPos);
  if (quote === "'" || quote === '"') {
    var index = this.expression.indexOf(quote, startPos + 1);
    while (index >= 0 && this.pos < this.expression.length) {
      this.pos = index + 1;
      if (this.expression.charAt(index - 1) !== "\\") {
        var rawString = this.expression.substring(startPos + 1, index);
        this.current = this.newToken(TSTRING2, this.unescape(rawString), startPos);
        r = true;
        break;
      }
      index = this.expression.indexOf(quote, index + 1);
    }
  }
  return r;
};
TokenStream2.prototype.isParen = function() {
  var c = this.expression.charAt(this.pos);
  if (c === "(" || c === ")") {
    this.current = this.newToken(TPAREN2, c);
    this.pos++;
    return true;
  }
  return false;
};
TokenStream2.prototype.isBracket = function() {
  var c = this.expression.charAt(this.pos);
  if ((c === "[" || c === "]") && this.isOperatorEnabled("[")) {
    this.current = this.newToken(TBRACKET2, c);
    this.pos++;
    return true;
  }
  return false;
};
TokenStream2.prototype.isComma = function() {
  var c = this.expression.charAt(this.pos);
  if (c === ",") {
    this.current = this.newToken(TCOMMA2, ",");
    this.pos++;
    return true;
  }
  return false;
};
TokenStream2.prototype.isSemicolon = function() {
  var c = this.expression.charAt(this.pos);
  if (c === ";") {
    this.current = this.newToken(TSEMICOLON2, ";");
    this.pos++;
    return true;
  }
  return false;
};
TokenStream2.prototype.isConst = function() {
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
      this.current = this.newToken(TNUMBER2, this.consts[str]);
      this.pos += str.length;
      return true;
    }
  }
  return false;
};
TokenStream2.prototype.isNamedOp = function() {
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
      this.current = this.newToken(TOP2, str);
      this.pos += str.length;
      return true;
    }
  }
  return false;
};
TokenStream2.prototype.isName = function() {
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
    this.current = this.newToken(TNAME2, str);
    this.pos += str.length;
    return true;
  }
  return false;
};
TokenStream2.prototype.isWhitespace = function() {
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
var codePointPattern2 = /^[0-9a-f]{4}$/i;
TokenStream2.prototype.unescape = function(v) {
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
        if (!codePointPattern2.test(codePoint)) {
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
TokenStream2.prototype.isComment = function() {
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
TokenStream2.prototype.isRadixInteger = function() {
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
    this.current = this.newToken(TNUMBER2, parseInt(this.expression.substring(startPos, pos), radix));
    this.pos = pos;
  }
  return valid;
};
TokenStream2.prototype.isNumber = function() {
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
    this.current = this.newToken(TNUMBER2, parseFloat(this.expression.substring(startPos, pos)));
    this.pos = pos;
  } else {
    this.pos = resetPos;
  }
  return valid;
};
TokenStream2.prototype.isOperator = function() {
  var startPos = this.pos;
  var c = this.expression.charAt(this.pos);
  if (c === "+" || c === "-" || c === "*" || c === "/" || c === "%" || c === "^" || c === "?" || c === ":" || c === ".") {
    this.current = this.newToken(TOP2, c);
  } else if (c === "\u2219" || c === "\u2022") {
    this.current = this.newToken(TOP2, "*");
  } else if (c === ">") {
    if (this.expression.charAt(this.pos + 1) === "=") {
      this.current = this.newToken(TOP2, ">=");
      this.pos++;
    } else {
      this.current = this.newToken(TOP2, ">");
    }
  } else if (c === "<") {
    if (this.expression.charAt(this.pos + 1) === "=") {
      this.current = this.newToken(TOP2, "<=");
      this.pos++;
    } else {
      this.current = this.newToken(TOP2, "<");
    }
  } else if (c === "|") {
    if (this.expression.charAt(this.pos + 1) === "|") {
      this.current = this.newToken(TOP2, "||");
      this.pos++;
    } else {
      return false;
    }
  } else if (c === "=") {
    if (this.expression.charAt(this.pos + 1) === "=") {
      this.current = this.newToken(TOP2, "==");
      this.pos++;
    } else {
      this.current = this.newToken(TOP2, c);
    }
  } else if (c === "!") {
    if (this.expression.charAt(this.pos + 1) === "=") {
      this.current = this.newToken(TOP2, "!=");
      this.pos++;
    } else {
      this.current = this.newToken(TOP2, c);
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
TokenStream2.prototype.isOperatorEnabled = function(op) {
  return this.parser.isOperatorEnabled(op);
};
TokenStream2.prototype.getCoordinates = function() {
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
TokenStream2.prototype.parseError = function(msg) {
  var coords = this.getCoordinates();
  throw new Error("parse error [" + coords.line + ":" + coords.column + "]: " + msg);
};
function ParserState2(parser22, tokenStream, options) {
  this.parser = parser22;
  this.tokens = tokenStream;
  this.current = null;
  this.nextToken = null;
  this.next();
  this.savedCurrent = null;
  this.savedNextToken = null;
  this.allowMemberAccess = options.allowMemberAccess !== false;
}
ParserState2.prototype.next = function() {
  this.current = this.nextToken;
  return this.nextToken = this.tokens.next();
};
ParserState2.prototype.tokenMatches = function(token, value) {
  if (typeof value === "undefined") {
    return true;
  } else if (Array.isArray(value)) {
    return contains2(value, token.value);
  } else if (typeof value === "function") {
    return value(token);
  } else {
    return token.value === value;
  }
};
ParserState2.prototype.save = function() {
  this.savedCurrent = this.current;
  this.savedNextToken = this.nextToken;
  this.tokens.save();
};
ParserState2.prototype.restore = function() {
  this.tokens.restore();
  this.current = this.savedCurrent;
  this.nextToken = this.savedNextToken;
};
ParserState2.prototype.accept = function(type, value) {
  if (this.nextToken.type === type && this.tokenMatches(this.nextToken, value)) {
    this.next();
    return true;
  }
  return false;
};
ParserState2.prototype.expect = function(type, value) {
  if (!this.accept(type, value)) {
    var coords = this.tokens.getCoordinates();
    throw new Error("parse error [" + coords.line + ":" + coords.column + "]: Expected " + (value || type));
  }
};
ParserState2.prototype.parseAtom = function(instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }
  if (this.accept(TNAME2) || this.accept(TOP2, isPrefixOperator)) {
    instr.push(new Instruction2(IVAR2, this.current.value));
  } else if (this.accept(TNUMBER2)) {
    instr.push(new Instruction2(INUMBER2, this.current.value));
  } else if (this.accept(TSTRING2)) {
    instr.push(new Instruction2(INUMBER2, this.current.value));
  } else if (this.accept(TPAREN2, "(")) {
    this.parseExpression(instr);
    this.expect(TPAREN2, ")");
  } else if (this.accept(TBRACKET2, "[")) {
    if (this.accept(TBRACKET2, "]")) {
      instr.push(new Instruction2(IARRAY2, 0));
    } else {
      var argCount = this.parseArrayList(instr);
      instr.push(new Instruction2(IARRAY2, argCount));
    }
  } else {
    throw new Error("unexpected " + this.nextToken);
  }
};
ParserState2.prototype.parseExpression = function(instr) {
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
ParserState2.prototype.pushExpression = function(instr, exprInstr) {
  for (var i = 0, len = exprInstr.length; i < len; i++) {
    instr.push(exprInstr[i]);
  }
};
ParserState2.prototype.parseUntilEndStatement = function(instr, exprInstr) {
  if (!this.accept(TSEMICOLON2))
    return false;
  if (this.nextToken && this.nextToken.type !== TEOF2 && !(this.nextToken.type === TPAREN2 && this.nextToken.value === ")")) {
    exprInstr.push(new Instruction2(IENDSTATEMENT2));
  }
  if (this.nextToken.type !== TEOF2) {
    this.parseExpression(exprInstr);
  }
  instr.push(new Instruction2(IEXPR2, exprInstr));
  return true;
};
ParserState2.prototype.parseArrayList = function(instr) {
  var argCount = 0;
  while (!this.accept(TBRACKET2, "]")) {
    this.parseExpression(instr);
    ++argCount;
    while (this.accept(TCOMMA2)) {
      this.parseExpression(instr);
      ++argCount;
    }
  }
  return argCount;
};
ParserState2.prototype.parseVariableAssignmentExpression = function(instr) {
  this.parseConditionalExpression(instr);
  while (this.accept(TOP2, "=")) {
    var varName = instr.pop();
    var varValue = [];
    var lastInstrIndex = instr.length - 1;
    if (varName.type === IFUNCALL2) {
      if (!this.tokens.isOperatorEnabled("()=")) {
        throw new Error("function definition is not permitted");
      }
      for (var i = 0, len = varName.value + 1; i < len; i++) {
        var index = lastInstrIndex - i;
        if (instr[index].type === IVAR2) {
          instr[index] = new Instruction2(IVARNAME2, instr[index].value);
        }
      }
      this.parseVariableAssignmentExpression(varValue);
      instr.push(new Instruction2(IEXPR2, varValue));
      instr.push(new Instruction2(IFUNDEF2, varName.value));
      continue;
    }
    if (varName.type !== IVAR2 && varName.type !== IMEMBER2) {
      throw new Error("expected variable for assignment");
    }
    this.parseVariableAssignmentExpression(varValue);
    instr.push(new Instruction2(IVARNAME2, varName.value));
    instr.push(new Instruction2(IEXPR2, varValue));
    instr.push(binaryInstruction2("="));
  }
};
ParserState2.prototype.parseConditionalExpression = function(instr) {
  this.parseOrExpression(instr);
  while (this.accept(TOP2, "?")) {
    var trueBranch = [];
    var falseBranch = [];
    this.parseConditionalExpression(trueBranch);
    this.expect(TOP2, ":");
    this.parseConditionalExpression(falseBranch);
    instr.push(new Instruction2(IEXPR2, trueBranch));
    instr.push(new Instruction2(IEXPR2, falseBranch));
    instr.push(ternaryInstruction2("?"));
  }
};
ParserState2.prototype.parseOrExpression = function(instr) {
  this.parseAndExpression(instr);
  while (this.accept(TOP2, "or")) {
    var falseBranch = [];
    this.parseAndExpression(falseBranch);
    instr.push(new Instruction2(IEXPR2, falseBranch));
    instr.push(binaryInstruction2("or"));
  }
};
ParserState2.prototype.parseAndExpression = function(instr) {
  this.parseComparison(instr);
  while (this.accept(TOP2, "and")) {
    var trueBranch = [];
    this.parseComparison(trueBranch);
    instr.push(new Instruction2(IEXPR2, trueBranch));
    instr.push(binaryInstruction2("and"));
  }
};
var COMPARISON_OPERATORS2 = ["==", "!=", "<", "<=", ">=", ">", "in"];
ParserState2.prototype.parseComparison = function(instr) {
  this.parseAddSub(instr);
  while (this.accept(TOP2, COMPARISON_OPERATORS2)) {
    var op = this.current;
    this.parseAddSub(instr);
    instr.push(binaryInstruction2(op.value));
  }
};
var ADD_SUB_OPERATORS2 = ["+", "-", "||"];
ParserState2.prototype.parseAddSub = function(instr) {
  this.parseTerm(instr);
  while (this.accept(TOP2, ADD_SUB_OPERATORS2)) {
    var op = this.current;
    this.parseTerm(instr);
    instr.push(binaryInstruction2(op.value));
  }
};
var TERM_OPERATORS2 = ["*", "/", "%"];
ParserState2.prototype.parseTerm = function(instr) {
  this.parseFactor(instr);
  while (this.accept(TOP2, TERM_OPERATORS2)) {
    var op = this.current;
    this.parseFactor(instr);
    instr.push(binaryInstruction2(op.value));
  }
};
ParserState2.prototype.parseFactor = function(instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }
  this.save();
  if (this.accept(TOP2, isPrefixOperator)) {
    if (this.current.value !== "-" && this.current.value !== "+") {
      if (this.nextToken.type === TPAREN2 && this.nextToken.value === "(") {
        this.restore();
        this.parseExponential(instr);
        return;
      } else if (this.nextToken.type === TSEMICOLON2 || this.nextToken.type === TCOMMA2 || this.nextToken.type === TEOF2 || this.nextToken.type === TPAREN2 && this.nextToken.value === ")") {
        this.restore();
        this.parseAtom(instr);
        return;
      }
    }
    var op = this.current;
    this.parseFactor(instr);
    instr.push(unaryInstruction2(op.value));
  } else {
    this.parseExponential(instr);
  }
};
ParserState2.prototype.parseExponential = function(instr) {
  this.parsePostfixExpression(instr);
  while (this.accept(TOP2, "^")) {
    this.parseFactor(instr);
    instr.push(binaryInstruction2("^"));
  }
};
ParserState2.prototype.parsePostfixExpression = function(instr) {
  this.parseFunctionCall(instr);
  while (this.accept(TOP2, "!")) {
    instr.push(unaryInstruction2("!"));
  }
};
ParserState2.prototype.parseFunctionCall = function(instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }
  if (this.accept(TOP2, isPrefixOperator)) {
    var op = this.current;
    this.parseAtom(instr);
    instr.push(unaryInstruction2(op.value));
  } else {
    this.parseMemberExpression(instr);
    while (this.accept(TPAREN2, "(")) {
      if (this.accept(TPAREN2, ")")) {
        instr.push(new Instruction2(IFUNCALL2, 0));
      } else {
        var argCount = this.parseArgumentList(instr);
        instr.push(new Instruction2(IFUNCALL2, argCount));
      }
    }
  }
};
ParserState2.prototype.parseArgumentList = function(instr) {
  var argCount = 0;
  while (!this.accept(TPAREN2, ")")) {
    this.parseExpression(instr);
    ++argCount;
    while (this.accept(TCOMMA2)) {
      this.parseExpression(instr);
      ++argCount;
    }
  }
  return argCount;
};
ParserState2.prototype.parseMemberExpression = function(instr) {
  this.parseAtom(instr);
  while (this.accept(TOP2, ".") || this.accept(TBRACKET2, "[")) {
    var op = this.current;
    if (op.value === ".") {
      if (!this.allowMemberAccess) {
        throw new Error('unexpected ".", member access is not permitted');
      }
      this.expect(TNAME2);
      instr.push(new Instruction2(IMEMBER2, this.current.value));
    } else if (op.value === "[") {
      if (!this.tokens.isOperatorEnabled("[")) {
        throw new Error('unexpected "[]", arrays are disabled');
      }
      this.parseExpression(instr);
      this.expect(TBRACKET2, "]");
      instr.push(binaryInstruction2("["));
    } else {
      throw new Error("unexpected symbol: " + op.value);
    }
  }
};
function add2(a, b) {
  return Number(a) + Number(b);
}
function sub2(a, b) {
  return a - b;
}
function mul2(a, b) {
  return a * b;
}
function div2(a, b) {
  return a / b;
}
function mod2(a, b) {
  return a % b;
}
function concat2(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.concat(b);
  }
  return "" + a + b;
}
function equal2(a, b) {
  return a === b;
}
function notEqual2(a, b) {
  return a !== b;
}
function greaterThan2(a, b) {
  return a > b;
}
function lessThan2(a, b) {
  return a < b;
}
function greaterThanEqual2(a, b) {
  return a >= b;
}
function lessThanEqual2(a, b) {
  return a <= b;
}
function andOperator2(a, b) {
  return Boolean(a && b);
}
function orOperator2(a, b) {
  return Boolean(a || b);
}
function inOperator2(a, b) {
  return contains2(b, a);
}
function sinh2(a) {
  return (Math.exp(a) - Math.exp(-a)) / 2;
}
function cosh2(a) {
  return (Math.exp(a) + Math.exp(-a)) / 2;
}
function tanh2(a) {
  if (a === Infinity)
    return 1;
  if (a === -Infinity)
    return -1;
  return (Math.exp(a) - Math.exp(-a)) / (Math.exp(a) + Math.exp(-a));
}
function asinh2(a) {
  if (a === -Infinity)
    return a;
  return Math.log(a + Math.sqrt(a * a + 1));
}
function acosh2(a) {
  return Math.log(a + Math.sqrt(a * a - 1));
}
function atanh2(a) {
  return Math.log((1 + a) / (1 - a)) / 2;
}
function log102(a) {
  return Math.log(a) * Math.LOG10E;
}
function neg2(a) {
  return -a;
}
function not2(a) {
  return !a;
}
function trunc22(a) {
  return a < 0 ? Math.ceil(a) : Math.floor(a);
}
function random2(a) {
  return Math.random() * (a || 1);
}
function factorial2(a) {
  return gamma2(a + 1);
}
function isInteger2(value) {
  return isFinite(value) && value === Math.round(value);
}
var GAMMA_G2 = 4.7421875;
var GAMMA_P2 = [
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
function gamma2(n) {
  var t, x;
  if (isInteger2(n)) {
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
    return Math.PI / (Math.sin(Math.PI * n) * gamma2(1 - n));
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
  x = GAMMA_P2[0];
  for (var i = 1; i < GAMMA_P2.length; ++i) {
    x += GAMMA_P2[i] / (n + i);
  }
  t = n + GAMMA_G2 + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
}
function stringOrArrayLength2(s) {
  if (Array.isArray(s)) {
    return s.length;
  }
  return String(s).length;
}
function hypot2() {
  var sum = 0;
  var larg = 0;
  for (var i = 0; i < arguments.length; i++) {
    var arg = Math.abs(arguments[i]);
    var div22;
    if (larg < arg) {
      div22 = larg / arg;
      sum = sum * div22 * div22 + 1;
      larg = arg;
    } else if (arg > 0) {
      div22 = arg / larg;
      sum += div22 * div22;
    } else {
      sum += arg;
    }
  }
  return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
}
function condition2(cond, yep, nope) {
  return cond ? yep : nope;
}
function roundTo22(value, exp) {
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
function setVar2(name, value, variables) {
  if (variables)
    variables[name] = value;
  return value;
}
function arrayIndex2(array, index) {
  return array[index | 0];
}
function max2(array) {
  if (arguments.length === 1 && Array.isArray(array)) {
    return Math.max.apply(Math, array);
  } else {
    return Math.max.apply(Math, arguments);
  }
}
function min2(array) {
  if (arguments.length === 1 && Array.isArray(array)) {
    return Math.min.apply(Math, array);
  } else {
    return Math.min.apply(Math, arguments);
  }
}
function arrayMap2(f, a) {
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
function arrayFold2(f, init, a) {
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
function arrayFilter2(f, a) {
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
function stringOrArrayIndexOf2(target, s) {
  if (!(Array.isArray(s) || typeof s === "string")) {
    throw new Error("Second argument to indexOf is not a string or array");
  }
  return s.indexOf(target);
}
function arrayJoin2(sep, a) {
  if (!Array.isArray(a)) {
    throw new Error("Second argument to join is not an array");
  }
  return a.join(sep);
}
function sign2(x) {
  return (x > 0) - (x < 0) || +x;
}
var ONE_THIRD2 = 1 / 3;
function cbrt2(x) {
  return x < 0 ? -Math.pow(-x, ONE_THIRD2) : Math.pow(x, ONE_THIRD2);
}
function expm12(x) {
  return Math.exp(x) - 1;
}
function log1p2(x) {
  return Math.log(1 + x);
}
function log22(x) {
  return Math.log(x) / Math.LN2;
}
function Parser2(options) {
  this.options = options || {};
  this.unaryOps = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sinh: Math.sinh || sinh2,
    cosh: Math.cosh || cosh2,
    tanh: Math.tanh || tanh2,
    asinh: Math.asinh || asinh2,
    acosh: Math.acosh || acosh2,
    atanh: Math.atanh || atanh2,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt || cbrt2,
    log: Math.log,
    log2: Math.log2 || log22,
    ln: Math.log,
    lg: Math.log10 || log102,
    log10: Math.log10 || log102,
    expm1: Math.expm1 || expm12,
    log1p: Math.log1p || log1p2,
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    trunc: Math.trunc || trunc22,
    "-": neg2,
    "+": Number,
    exp: Math.exp,
    not: not2,
    length: stringOrArrayLength2,
    "!": factorial2,
    sign: Math.sign || sign2
  };
  this.binaryOps = {
    "+": add2,
    "-": sub2,
    "*": mul2,
    "/": div2,
    "%": mod2,
    "^": Math.pow,
    "||": concat2,
    "==": equal2,
    "!=": notEqual2,
    ">": greaterThan2,
    "<": lessThan2,
    ">=": greaterThanEqual2,
    "<=": lessThanEqual2,
    and: andOperator2,
    or: orOperator2,
    "in": inOperator2,
    "=": setVar2,
    "[": arrayIndex2
  };
  this.ternaryOps = {
    "?": condition2
  };
  this.functions = {
    random: random2,
    fac: factorial2,
    min: min2,
    max: max2,
    hypot: Math.hypot || hypot2,
    pyt: Math.hypot || hypot2,
    // backward compat
    pow: Math.pow,
    atan2: Math.atan2,
    "if": condition2,
    gamma: gamma2,
    roundTo: roundTo22,
    map: arrayMap2,
    fold: arrayFold2,
    filter: arrayFilter2,
    indexOf: stringOrArrayIndexOf2,
    join: arrayJoin2
  };
  this.consts = {
    E: Math.E,
    PI: Math.PI,
    "true": true,
    "false": false
  };
}
Parser2.prototype.parse = function(expr) {
  var instr = [];
  var parserState = new ParserState2(
    this,
    new TokenStream2(this, expr),
    { allowMemberAccess: this.options.allowMemberAccess }
  );
  parserState.parseExpression(instr);
  parserState.expect(TEOF2, "EOF");
  return new Expression2(instr, this);
};
Parser2.prototype.evaluate = function(expr, variables) {
  return this.parse(expr).evaluate(variables);
};
var sharedParser2 = new Parser2();
Parser2.parse = function(expr) {
  return sharedParser2.parse(expr);
};
Parser2.evaluate = function(expr, variables) {
  return sharedParser2.parse(expr).evaluate(variables);
};
var optionNameMap2 = {
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
function getOptionName2(op) {
  return optionNameMap2.hasOwnProperty(op) ? optionNameMap2[op] : op;
}
Parser2.prototype.isOperatorEnabled = function(op) {
  var optionName = getOptionName2(op);
  var operators = this.options.operators || {};
  return !(optionName in operators) || !!operators[optionName];
};
var parser2 = new Parser2({
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
parser2.functions.gcd = function(...args) {
  return gcdCalc22(args);
};
parser2.functions.lcd = function(...args) {
  return lcdCalc22(args);
};
var eps2 = 1e-3;
parser2.functions.closeTo = function(value, center) {
  const start = center - eps2;
  const end = center + eps2;
  return start <= value && value <= end;
};
function gcdCalc22(numbers) {
  let num = 2, res = 1;
  while (num <= Math.min(...numbers)) {
    if (numbers.every((n) => n % num === 0)) {
      res = num;
    }
    num++;
  }
  return res;
}
function lcdCalcEx22(a, b) {
  return Math.abs(a * b) / gcdCalc22([a, b]);
}
function lcdCalc22(numbers) {
  return numbers.reduce((acc, num) => lcdCalcEx22(acc, num), 1);
}
function evalExpression2(expression, quantity) {
  const expr = parser2.parse(expression);
  const variables = expr.variables();
  if (variables.length === 1) {
    return expr.evaluate({ [variables]: quantity });
  }
  const res = expr.simplify({ [variables[0]]: quantity });
  return res.toString();
}
function recurExpr2(node) {
  const quantity = node.quantity ?? node.ratio ?? {};
  const { context, expression } = quantity;
  if (expression) {
    let expr = parser2.parse(expression);
    const variables = expr.variables();
    for (let variable of variables) {
      const res = recurExpr2(context[variable]);
      if (res.substitute != null) {
        expr = expr.substitute(variable, res);
      } else {
        const q = res.quantity ?? res.ratio;
        if (typeof q == "number") {
          expr = expr.simplify({ [variable]: res });
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
function toEquationExpr2(lastExpr) {
  const final = recurExpr2({ quantity: lastExpr });
  return parser2.parse(cleanUpExpression2(final));
}
function cleanUpExpression2(exp) {
  const replaced = exp.toString().replaceAll(".quantity", "").replaceAll(".ratio", "").replaceAll(".baseQuantity", "");
  return formatNumbersInExpression2(replaced);
}
function formatNumbersInExpression2(expr) {
  return expr.replace(/(\d*\.\d+|\d+)/g, (match) => {
    const num = parseFloat(match);
    if (!isNaN(num)) {
      return num.toLocaleString("en", { maximumFractionDigits: 6, minimumFractionDigits: 0 }).replace(/,/g, "");
    }
    return match;
  });
}
function solveLinearEquation2(lhs, rhs, variable = "x") {
  const expr = `(${typeof lhs === "number" ? lhs : toEquationExpr2(lhs)}) - (${typeof rhs === "number" ? rhs : toEquationExpr2(rhs)})`;
  const terms = evaluateLinearExpression2(expr, variable);
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
function evaluateLinearExpression2(expr, variable) {
  const tokens = tokenize2(expr);
  const rpn = toRPN2(tokens);
  return evalRPN2(rpn, variable);
}
function tokenize2(str) {
  const regex = /\d+\.\d+|\d+|[a-zA-Z]+|[\+\-\*\/\(\)]/g;
  return str.match(regex);
}
function toRPN2(tokens) {
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
function evalRPN2(rpn, variable) {
  const stack = [];
  rpn.forEach((token) => {
    if (!isNaN(token)) {
      stack.push({ constant: parseFloat(token) });
    } else if (token === variable) {
      stack.push({ [variable]: 1 });
    } else if ("+-*/".includes(token)) {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(applyOp2(a, b, token, variable));
    }
  });
  return stack.pop();
}
function applyOp2(a, b, op, variable) {
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
var convert2 = configureMeasurements2({
  length: length_default2,
  area: area_default2,
  volume: volume_default2,
  mass: mass_default2,
  time: time_default2
});
configure2({
  convertToFraction: (d) => new Fraction2(d).toFraction(),
  convertToUnit: (d, from, to22) => convert2(d).from(from).to(to22),
  unitAnchor: (unit) => convert2().getUnit(unit)?.unit?.to_anchor,
  solveLinearEquation: (first, second, variable) => solveLinearEquation2(first, second, variable),
  evalExpression: (expression, quantity) => evalExpression2(expression, quantity)
});
function isPredicate2(node) {
  return node.kind != null;
}
function last3(input) {
  return input.children[input.children.length - 1];
}
function deduce2(...children) {
  return to2(...children.concat(inferenceRule2.apply(null, children.map((d) => isPredicate2(d) ? d : d.children.slice(-1)[0]))));
}
function to2(...children) {
  return { children };
}
function isEmptyOrWhiteSpace2(value) {
  return value == null || typeof value === "string" && value.trim() === "";
}
var mdFormatting2 = {
  compose: (strings, ...args) => concatString2(strings, ...args),
  formatKind: (d) => `[${d.kind.toUpperCase()}]`,
  formatQuantity: (d) => {
    if (typeof d === "number") {
      return d.toLocaleString("cs-CZ");
    } else if (typeof d === "string") {
      return d;
    } else {
      return toEquationExpr2(d);
    }
  },
  formatRatio: (d, asPercent) => asPercent ? `${(d * 100).toLocaleString("cs-CZ")}%` : d.toLocaleString("cs-CZ"),
  formatEntity: (d, unit) => {
    const res = [unit, d].filter((d2) => d2 != null).join(" ");
    return isEmptyOrWhiteSpace2(res) ? "" : `__${res.trim()}__`;
  },
  formatAgent: (d) => `**${d}**`,
  formatSequence: (d) => `${formatSequence22(d)}`
};
var mermaidFormatting2 = {
  ...mdFormatting2,
  formatKind: (d) => ``
};
function formatSequence22(type) {
  const simplify22 = (d, op = "") => d !== 1 ? `${d}${op}` : "";
  if (type.kind === "arithmetic")
    return `${type.sequence.join()} => a^n^ = ${type.sequence[0]} + ${type.commonDifference}(n-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements2(first, second, type.secondDifference);
    const parts = [`${simplify22(A)}n^2^`];
    if (B !== 0) {
      parts.concat(`${simplify22(B)}n`);
    }
    if (C !== 0) {
      parts.concat(`${simplify22(C)}n`);
    }
    return `${type.sequence.join()} => a^n^ = ${parts.map((d, i) => `${i !== 0 ? " + " : ""}${d}`)}`;
  }
  if (type.kind === "geometric") {
    return `${type.sequence.join()} => a^n^ = ${simplify22(type.sequence[0], "*")}${type.commonRatio}^(n-1)^`;
  }
}
function concatString2(strings, ...substitutions) {
  const formattedString = strings.reduce((acc, curr, i) => {
    const substitution = substitutions[i];
    const res = substitution ? `${curr}${Array.isArray(substitution) ? substitution.join("") : substitution}` : curr;
    return `${acc}${res}`;
  }, "");
  return formattedString;
}

// src/math/shapes/triangle.ts
function triangleArea({ size, height, triangle }) {
  const agent = triangle.agent;
  const unit = triangle.unit ?? "";
  const entity3 = triangle.entity ?? "obsah";
  const container = size.kind === "cont" ? size : last3(size);
  return deduce2(
    cont("polovina", 1 / 2, ""),
    size,
    height,
    product(agent, ["1/2", container.agent, height.agent], { entity: entity3, unit }, { entity: container.entity, unit: container.unit })
  );
}

// src/math/M9A-2023/trojuhelnik.ts
function build6({ input }) {
  const agent = "obrazec";
  const entity3 = "troj\xFAheln\xEDk";
  const whiteEntity = `b\xEDl\xFD ${entity3}`;
  const grayEntity = `\u0161ed\xFD ${entity3}`;
  const nthLabel = "pozice";
  const inputContainers = [1, 3, 9].map((d, i) => cont(`${agent} \u010D.${i + 1}`, d, whiteEntity));
  const soucet = combine("obrazec \u010D.7", [], entity3, grayEntity);
  const rule1 = commonSense("V ka\u017Ed\xE9m kroku se p\u0159id\xE1v\xE1 \u0161ed\xFD troj\xFAheln\xEDk do ka\u017Ed\xE9ho b\xEDl\xE9ho troj\xFAheln\xEDku.");
  const rule2 = commonSense("Po\u010Det \u0161ed\xFDch troj\xFAheln\xEDk\u016F v obrazci n je stejn\xFD jako po\u010Det b\xEDl\xFDch troj\xFAheln\xEDk\u016F v p\u0159edchoz\xEDm obrazci");
  const dBase = deduce(
    ...inputContainers,
    ctor("sequence")
  );
  const dTree1 = deduce(
    dBase,
    cont(`${agent} \u010D.5`, 5, nthLabel)
  );
  const dTree2 = deduce(
    deduce(
      last(dBase),
      cont(`${agent} \u010D.6`, 6, nthLabel)
    ),
    to(
      rule1,
      rule2,
      cont(`${agent} \u010D.6`, 121, grayEntity)
    ),
    soucet
  );
  const dTree3 = deduce(
    to(
      comp("posledn\xED obrazec", "p\u0159edposledn\xED obrazec", 6561, grayEntity),
      rule1,
      rule2,
      cont("p\u0159edposledn\xED obrazec", 6561, whiteEntity)
    ),
    to(
      last(dBase),
      cont("n\xE1sleduj\xEDc\xED obrazec (n*3)", 3, "")
    ),
    product("posledn\xED obrazec", ["p\u0159edposledn\xED obrazec", "3"], whiteEntity, whiteEntity)
  );
  const templateBase = (highlight2) => highlight2`Prvním obrazcem je bílý rovnostranný trojúhelník. Každý další obrazec vznikne z předchozího obrazce dle následujících pravidel:.
  ${(html) => html`<br/>
    Nejprve každý bílý trojúhelník v obrazci rozdělíme na 4 shodné rovnostranné trojúhelníky.
    Poté v každé takto vzniklé čtveřici bílých trojúhelníků obarvíme vnitřní trojúhelník na šedo.
  `}`;
  const template1 = (html) => html`<br/>
    <strong>Určete, kolik bílých trojúhelníků obsahuje pátý obrazec?</strong>`;
  const template2 = (html) => html`<br/>
    <strong>Šestý obrazec obsahuje 121 šedých trojúhelníků.Určete, kolik šedých trojúhelníků obsahuje sedmý obrazec.</strong>`;
  const template3 = (html) => html`<br/>
    <strong>Počet šedých trojúhelníků v posledním a v předposledním obrazci se liší o 6 561.Určete, kolik bílých trojúhelníků obsahuje poslední obrazec</strong>`;
  return [
    { title: "Po\u010Det b\xEDl\xFDch troj\xFAheln\xEDk\u016F v p\xE1t\xE9m obrazci", deductionTree: dTree1, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template1}` },
    { title: "Po\u010Det \u0161ed\xFDch troj\xFAheln\xEDk\u016F v sedm\xE9m obrazci", deductionTree: dTree2, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template2}` },
    { title: " Po\u010Det b\xEDl\xFDch troj\xFAheln\xEDk\u016F v posledn\xEDm obrazci", deductionTree: dTree3, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template3}` }
  ];
}

// src/math/M9A-2023/index.ts
var M9A_2023_default = {
  1: dobaFilmu({ input: { celkovaDobaFilmuVHodina: 1 } }),
  2.1: sud(),
  2.2: rezaniKvadru(),
  6.1: triangleExample().obsahABD,
  6.2: triangleExample().obsahABCD,
  7.1: krouzkyATridy().procent,
  7.2: krouzkyATridy().pocet,
  7.3: krouzkyATridy().pomer,
  8.2: pozemekObdelnik().delkaStrany,
  8.3: pozemekObdelnik().obsah,
  11.1: rovinataOblast().skutecnost,
  11.2: rovinataOblast().vychazkovaTrasa,
  11.3: rovinataOblast().meritko,
  12: lomanaCaraACFHA(),
  13: povrchValce(),
  14: angleBeta(),
  15.1: vyrobenoVyrobku(),
  15.2: dovolenaNaKole(),
  15.3: propousteniVeFirme(),
  16.1: build6({ input: {} })[0],
  16.2: build6({ input: {} })[1],
  16.3: build6({ input: {} })[2]
};
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
      )
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
  const entity3 = "krychle";
  return {
    title: "Roz\u0159ez\xE1n\xED kv\xE1dru na krychli\u010Dky",
    deductionTree: deduce(
      deduce(
        cont("kv\xE1dr", 200, entity3),
        rate("kv\xE1dr", 8, { entity: "objem", unit: "dm3" }, entity3)
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
  const entity3 = "d\xE9lka";
  const unit = "cm";
  const entity2d = "obsah";
  const unit2d = "cm2";
  const polomer = cont("polom\u011Br podstavy", 10, entity3, unit);
  const podstava = deduce(
    polomer,
    polomer,
    pi(),
    product("podstava", [], entity2d, entity3)
  );
  return {
    title: "Povrch v\xE1lce",
    deductionTree: deduce(
      deduce(
        podstava,
        last(podstava),
        deduce(last(podstava), compRatio("pl\xE1\u0161\u0165", "podstava", 3)),
        combine("v\xE1lec", ["doln\xED podstava", "horn\xED podstava", "pl\xE1\u0161\u0165"], entity2d, entity2d)
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
            deduce(hudebni8, sachovy8, roboticky8, combine("8.", [], entityBase, entityBase)),
            ratios("celkem", ["8.", "9."], [2, 3]),
            nthPart("9.")
          ),
          deduce(hudebni9, sachovy9, combine("9.", [], entityBase, entityBase)),
          ctorDifference(`${robotickyLabel} 9.`)
        ),
        ctorRatios(robotickyLabel)
      )
    }
  };
}
function pozemekObdelnik() {
  const entity3 = "d\xE9lka";
  const unit = "m";
  const entity2d = "obsah";
  const unit2d = "m2";
  const delsiStranaComp = comp("obdeln\xEDk del\u0161\xED strana", "\u010Dtverec", 10, { entity: entity3, unit });
  const kratsiStranaComp = comp("obdeln\xEDk krat\u0161\xED strana", "\u010Dtverec", -10, { entity: entity3, unit });
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
          last(stranaCtverce),
          product("\u010Dtverec", [], { entity: entity2d, unit: unit2d }, { entity: entity3, unit })
        ),
        deduce(
          deduce(last(stranaCtverce), kratsiStranaComp),
          deduce(last(stranaCtverce), delsiStranaComp),
          product("obdeln\xEDk", [], { entity: entity2d, unit: unit2d }, { entity: entity3, unit })
        )
      )
    }
  };
}
function angleBeta() {
  const entity3 = "stup\u0148\u016F";
  const alfaEntity = "alfa";
  const triangleSumLabel = "sou\u010Det \xFAhl\u016F v troj\xFAheln\xEDku";
  const triangleSum = cont(triangleSumLabel, 180, entity3);
  const triangle = "\xFAhel troj\xFAheln\xEDku ABC";
  const alfaA = cont(`vnit\u0159n\xED ${triangle} u vrcholu A`, 4, alfaEntity);
  return {
    title: "Velikost \xFAhlu \u03B2",
    deductionTree: deduce(
      deduce(
        deduce(
          triangleSum,
          deduce(
            to(
              cont(`zadan\xFD \xFAhel u vn\u011Bj\u0161\xEDho ${triangle} u vrcholu A`, 4, alfaEntity),
              compAngle(`zadan\xFD \xFAhel u vn\u011Bj\u0161\xEDho ${triangle} u vrcholu A`, `vnit\u0159n\xED ${triangle} u vrcholu A`, "corresponding"),
              alfaA
            ),
            cont(`zadan\xFD \xFAhel vnit\u0159n\xED ${triangle} u vrcholu B`, 4, alfaEntity),
            to(
              cont(`zadan\xFD \xFAhel u ${triangle} u vrcholu C`, 2, alfaEntity),
              compAngle(`zadan\xFD \xFAhel u ${triangle} u vrcholu C`, `vnit\u0159n\xED ${triangle} u vrcholu A`, "opposite"),
              cont(`vnit\u0159n\xED ${triangle} u vrcholu C`, 2, alfaEntity)
            ),
            ctorRatios(triangleSumLabel)
          ),
          alfaA,
          nthPart(`vnit\u0159n\xED ${triangle} u vrcholu A`)
        ),
        compAngle(`vnit\u0159n\xED ${triangle} u vrcholu A`, "beta", "supplementary")
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
          combine("\xFAhlop\u0159\xED\u010Dka na podlaze (AC) + \xFAhlop\u0159\xED\u010Dka na st\u011Bn\u011B (CF)", ["AC", "CF"], { entity: entity3, unit }, { entity: entity3, unit })
        ),
        cont("stejn\u011B dlouh\xE1 \xFAhlop\u0159\xED\u010Dka na strop\u011B (FH) i stejn\u011B dlouh\xE1 \xFAhlop\u0159\xED\u010Dka na druh\xE9 st\u011Bn\u011B (HA)", 2, ""),
        product("lomen\xE9 \u010D\xE1ry ACFHA", [], { entity: entity3, unit }, { entity: entity3, unit })
      ),
      ctorOption("C", 54)
    )
  };
}
function triangleExample() {
  const entity3 = "d\xE9lka";
  const unit = "cm";
  const unit2D = "cm2";
  const height = cont("v\xFD\u0161ka CB", 8, entity3, unit);
  const abd = triangleArea({
    size: cont("z\xE1kladna AB", 6, entity3, unit),
    height,
    triangle: {
      agent: "troj\xFAheln\xEDk ABD",
      unit: unit2D
    }
  });
  return {
    obsahABD: {
      deductionTree: abd
    },
    obsahABCD: {
      deductionTree: deduce(
        last(abd),
        triangleArea({
          size: cont("z\xE1kladna CD", 10, entity3, unit),
          height,
          triangle: {
            agent: "troj\xFAheln\xEDk BCD",
            unit: unit2D
          }
        }),
        combine("obsah ABCD", [], { entity: entity3, unit: unit2D }, { entity: entity3, unit })
      )
    }
  };
}

// src/math/M9A-2024/angle.ts
function rozdilUhlu({ input }) {
  const entity3 = "";
  const beta = axiomInput(cont("beta", input.beta, entity3), 1);
  const delta = axiomInput(cont("delta", input.delta, entity3), 2);
  const alfa = deduce(delta, compAngle("delta", "alfa", "supplementary"));
  const triangleSum = cont("troj\xFAheln\xEDk", 180, entity3);
  const deductionTree = deduce(
    deduce(
      toCont(deduce(
        triangleSum,
        deduce(
          beta,
          alfa,
          combine("dvojice \xFAhl\u016F v troj\xFAheln\xEDku", ["alfa", "beta"], entity3, entity3)
        ),
        ctor("comp-diff")
      ), { agent: "gama" }),
      last(alfa),
      ctor("comp-diff")
    ),
    ctorOption("B", 11)
  );
  return { deductionTree };
}

// src/math/M9A-2024/dum-meritko.ts
function build7({ input }) {
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
    product(`obsah`, [lengthLabel, widthLabel], { entity: skutecnost, unit: unit2D }, { entity: skutecnost, unit })
  );
  const ddPlan = deduce(
    deduce(lengthOnPlan, ctorUnit(unit)),
    widthOnPlan,
    product(`obsah`, [lengthLabel, widthLabel], { entity: plan, unit: unit2D }, { entity: plan, unit })
  );
  const dTree3 = deduce(
    ddSkutecnost,
    ddPlan,
    ctor("rate")
  );
  const templateBase = (highlight2) => highlight2`Půdorys domu má tvar obdélníku. 
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
    { deductionTree: deduce(meritko, ctorBooleanOption(1e3)), template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template1}` },
    { deductionTree: deduce(deduce(dTree2, ctorUnit("m")), ctorBooleanOption(20)), template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template2}` },
    { deductionTree: deduce(dTree3, ctorBooleanOption(100)), template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template3}` }
  ];
}

// src/math/M9A-2024/dva-ctverce.ts
function example({ input }) {
  const ALabel = "strana obdeln\xEDk A";
  const BLabel = "strana obdeln\xEDk B";
  const entity3 = "cm";
  const bocniStrana = commonSense("bo\u010Dn\xED strany obou \u010Dtverc\u016F jsou schodn\xE9, horn\xED a spodn\xED strana obdeln\xEDku maj\xED rozd\xEDl 3");
  const rozdilObvod = axiomInput(cont("obvod rozd\xEDl", 6, entity3), 1);
  const diffAbsolute = comp(ALabel, BLabel, input.rozdilObvod / 2, entity3);
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
      cont("\u010Dtverec", 4, "strany"),
      product("obvod \u010Dtverce", ["d\xE9lka strany", "po\u010Det stran"], entity3, entity3)
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
      combine("kone\u010Dn\xE1 cena", ["cena po slev\u011B", "zdra\u017Eeno"], entity3, entity3)
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
      combine("vr\xE1ceno", ["\xFArok", "vyp\u016Fj\u010Deno"], entity, entity)
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
  const entity3 = "cm";
  const obvod = axiomInput(cont(obvodLabel, 30, entity3), 1);
  const ramenoCount = axiomInput(cont("po\u010Det ramen", 4, ""), 2);
  const zakladnaCount = axiomInput(cont("po\u010Det z\xE1kladen", 3, ""), 3);
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
        product("obvod obrazce (ramena)", ["d\xE9lka ramena", "po\u010Det stran"], entity3, entity3)
      ),
      deduce(
        zakladna,
        zakladnaCount,
        product("obvod obrazce (zakladny)", ["d\xE9lka z\xE1kladny", "po\u010Det stran"], entity3, entity3)
      ),
      combine("obvod obrazce", [], entity3, entity3)
    ),
    ctorOption("C", 66)
  );
  return { deductionTree };
}

// src/math/M9A-2024/svadleny.ts
function build8({ input }) {
  const agentPrevious = "p\u016Fvodn\xED zak\xE1zka";
  const agentCurrent = "nov\xE1 zak\xE1zka";
  const agentNew = "roz\u0161\xED\u0159en\xE1 nov\xE1 zak\xE1zka";
  const entityA = "\u0161vadlen";
  const entityB = "hodin";
  const aPrevious = axiomInput(cont(agentPrevious, input.previousWorker, entityA), 1);
  const aCurrent = axiomInput(cont(agentCurrent, input.currentWorker, entityA), 3);
  const bPrevious = axiomInput(cont(agentPrevious, input.previousHours, entityB), 2);
  const comp3 = compRatio(agentNew, agentCurrent, 3 / 2);
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
      comp3,
      proportion(false, [`mno\u017Estv\xED`, `hodin`])
    )
  );
  const template = (highlight2) => highlight2`${input.previousWorker} švadlen, které šijí oblečení, pracují stejným tempem.
    Tyto švadleny splní danou zakázku za ${input.previousHours} hodin.
    Za jakou dobu splní o polovinu větší zakázku ${input.currentWorker} švadleny?`;
  return { deductionTree, template };
}

// src/math/shapes/cylinder.ts
function surfaceBaseArea({ radius }, options) {
  const { radiusLabel, entity2D, surfaceBaseAreaLabel } = {
    ...{
      radiusLabel: "polom\u011Br",
      entity2D: "\u010Dtvere\u010Dk\u016F",
      surfaceBaseAreaLabel: "obsah podstavy"
    },
    ...options ?? {}
  };
  return deduce2(
    radius,
    radius,
    pi(),
    product(surfaceBaseAreaLabel, [radiusLabel, radiusLabel, "PI"], entity2D, radius.entity)
  );
}
function baseCircumference({ radius }, options) {
  const { radiusLabel, baseCircumferenceLabel } = {
    ...{
      radiusLabel: "polom\u011Br",
      baseCircumferenceLabel: "obvod podstavy"
    },
    ...options ?? {}
  };
  return deduce2(
    cont("2 * PI", 2 * piNumber(), ""),
    radius,
    product(baseCircumferenceLabel, ["2 * PI", radiusLabel], radius.entity, radius.entity)
  );
}
function cylinder({ radius, height }, options) {
  const { radiusLabel, entity2D, entity3D, surfaceBaseAreaLabel, heightLabel, baseCircumferenceLabel, volumeLabel } = {
    ...{
      radiusLabel: "polom\u011Br",
      entity2D: "\u010Dtvere\u010Dk\u016F",
      entity3D: "krychli\u010Dek",
      surfaceBaseAreaLabel: "obsah podstavy",
      baseCircumferenceLabel: "obvod podstavy",
      volumeLabel: "objem v\xE1lce",
      heightLabel: "v\xFD\u0161ka"
    },
    ...options ?? {}
  };
  const entity3 = radius.entity;
  const surfaceBaseAreaTree = surfaceBaseArea({ radius }, { entity2D, radiusLabel, surfaceBaseAreaLabel });
  const volume2 = deduce2(
    surfaceBaseAreaTree,
    height,
    product(volumeLabel, [surfaceBaseAreaLabel, heightLabel], entity3D, entity3)
  );
  const baseCircumferenceTree = baseCircumference({ radius }, { radiusLabel, baseCircumferenceLabel });
  const protilehlaStana = cont("po\u010Det st\u011Bn", 2, "");
  const surface = deduce2(
    deduce2(
      surfaceBaseAreaTree,
      protilehlaStana,
      product("spodn\xED a horn\xED st\u011Bna", [], entity2D, entity3)
    ),
    deduce2(
      baseCircumferenceTree,
      height,
      product("obsah bo\u010Dn\xEDho pl\xE1\u0161t\u011B", ["obvod podstavy", heightLabel], entity2D, entity3)
    ),
    combine("obsah pl\xE1\u0161t\u011B", [], entity2D, entity2D)
  );
  return {
    volume: volume2,
    surface,
    baseCircumference: baseCircumferenceTree,
    surfaceBaseArea: surfaceBaseAreaTree
  };
}

// src/math/M9A-2024/tanga.ts
function build9({ input }) {
  const radiusLabel = "polom\u011Br";
  const areaCircleLabel = "obsah kruhu";
  const baseCircleLabel = "obvod kruhu";
  const circelPartLabel = "b\xEDl\xE1 \u010Dtvrtkru\u017Enice";
  const rectangleLabel = "cel\xFD obdeln\xEDk";
  const reactangleHeight = `${rectangleLabel} v\xFD\u0161ka`;
  const entity3 = "cm";
  const entity2d = "cm \u010Dtvere\u010Dn\xEDch";
  const width = axiomInput(cont(`\u0161ed\xE1 tanga \u0161\xED\u0159ka`, input.tangaWidth, entity3), 1);
  const widthRectangle = axiomInput(cont(`${rectangleLabel} \u0161\xED\u0159ka`, input.tangaWidth, entity3), 1);
  const ratio3 = compRatio(`\u0161ed\xE1 tanga \u0161\xED\u0159ka`, `${circelPartLabel} ${radiusLabel}`, 2);
  const dRadius = deduce(width, ratio3);
  const obsah = surfaceBaseArea({ radius: last(dRadius) }, {
    surfaceBaseAreaLabel: areaCircleLabel,
    entity2D: entity2d
  });
  const dd1 = deduce(
    deduce(
      widthRectangle,
      to(
        dRadius,
        commonSense(`${radiusLabel} = ${reactangleHeight}`),
        cont(reactangleHeight, lastQuantity(dRadius), entity3)
      ),
      product(`${rectangleLabel} obsah`, [], entity2d, entity3)
    ),
    deduce(
      cont(`2 kr\xE1t ${circelPartLabel}`, 2, ""),
      deduce(
        obsah,
        compRatio(areaCircleLabel, circelPartLabel, 4)
      ),
      product(`dvojice ${circelPartLabel}`, [], entity2d, entity2d)
    )
  );
  const obvod = baseCircumference(
    { radius: last(dRadius) },
    { baseCircumferenceLabel: baseCircleLabel }
  );
  const obvodCvrtkruh = deduce(obvod, compRatio(baseCircleLabel, circelPartLabel, 4));
  const dd2 = deduce(
    deduce(
      obvodCvrtkruh,
      last(obvodCvrtkruh),
      width,
      combine(`obvod \u0161ed\xE9ho obrazce`, [circelPartLabel, circelPartLabel, "\u0161\xED\u0159ka"], entity3, entity3)
    ),
    ctorRound()
  );
  return [{ deductionTree: dd1 }, { deductionTree: dd2 }];
}

// src/math/M9A-2024/tezitko.ts
function build10({ input }) {
  const agentOut = "\u010Dir\xE9 sklo";
  const agentIn = "modr\xE9 sklo";
  const entity3 = "cm";
  const outRadius = axiomInput(cont(`${agentOut} podstava polom\u011Br`, input.out.radius, entity3), 1);
  const outHeight = axiomInput(cont(`${agentOut} v\xE1lec v\xFD\u0161ka`, input.out.height, entity3), 2);
  const inRadius = axiomInput(cont(`${agentIn} podstava polom\u011Br`, input.in.radius, entity3), 3);
  const inHeight = axiomInput(cont(`${agentIn} v\xE1lec v\xFD\u0161ka`, input.in.height, entity3), 4);
  const outCylinder = cylinder({ radius: outRadius, height: outHeight }, { surfaceBaseAreaLabel: `${agentOut} obsah`, volumeLabel: `${agentOut} objem` });
  const inCylinder = cylinder({ radius: inRadius, height: inHeight }, { surfaceBaseAreaLabel: `${agentIn} obsah`, volumeLabel: `${agentIn} objem` });
  const deductionTree = deduce(
    outCylinder.volume,
    inCylinder.volume
  );
  const template = (highlight2) => highlight2`
  Skleněné těžítko má tvar rotačního válce s plolměrem podstavy ${input.out.radius} cm a výškou ${input.out.height} cm.
  Vnější část těžítka je z čirého skla, uvnitř je část z modrého skla,
  která má také tavr rotačního válce, a to s poloměrem podstavy ${input.in.radius} cm a výškou ${input.in.height} cm.
  ${(html) => html`
    <br /> 
    Vypočítejte objem čirého skla v těžítku. Výsledek zaokrouhlete na desítky cm <sup>3</sup>.`}`;
  return { deductionTree, template };
}

// src/math/M9A-2024/trida-skupiny.ts
function build11({ input }) {
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
    combine(skupinaDE, [], entity3, entity3)
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
  const templateBase = (highlight2) => highlight2`Žáci třídy 8.B se dělí na dvě skupiny podle toho, zda chodí na němčinu nebo angličtinu.
     V obou skupinách je stejný počet žáků. Ve třídě je ${input.chlapci} chlapců a ${input.anglictinaChlapci} z nich chodí na angličtinu.
    Na němčinu chodí ${input.nemcinaDivky} dívky.`;
  const template1 = (html) => html`<br/>
    <strong>Kolik dívek celkem chodí na angličtinu?</strong>`;
  const template2 = (html) => html`<br/>
    <strong>Kolik má třída 8.B celkem žáků?</strong>`;
  return [
    { deductionTree: dTree1, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template1}` },
    { deductionTree: dTree2, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template2}` }
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
var M9A_2024_default = {
  1: build8({ input: { currentWorker: 4, previousWorker: 5, previousHours: 24 } }),
  2: build10({
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
  7.1: build11(tridaSkupinyParams)[0],
  7.2: build11(tridaSkupinyParams)[1],
  8.1: build9({ input: { tangaWidth: 20 } })[0],
  8.2: build9({ input: { tangaWidth: 20 } })[1],
  11: rozdilUhlu({ input: { delta: 107, beta: 23 } }),
  12: example4({ input: { obvod: 30 } }),
  13: example({ input: { rozdilObvod: 6, obdelnikCtvAStrana: 1 / 2, obdelnikCtvBStrana: 1 / 5 } }),
  15.1: build7(dumMeritkoParams)[0],
  15.2: build7(dumMeritkoParams)[1],
  15.3: build7(dumMeritkoParams)[2],
  16.1: example1({ input: { base: 2e4, percentage: 13.5 } }),
  16.2: example2({ input: { vlozeno: 1e6, urokPercentage: 2.5, danPercentage: 15 } }),
  16.3: example3({ input: { base: 2e4, percentageDown: 10, percentageNewUp: 10 } })
};

// src/math/M9I-2025/angle.ts
function desetiuhelnik({ input }) {
  const entity3 = "stup\u0148\u016F";
  const pocetUhlu = "\xFAhl\u016F";
  const rovnoramennyTrojLabel = "rovnoramenn\xFD troj\xFAheln\xEDk";
  const vrcholovyUhelLabel = "vrcholov\xFD \xFAhel";
  const celkem = cont("desiti\xFAheln\xEDk", 360, entity3);
  const pocet = axiomInput(cont("desiti\xFAheln\xEDk", input.pocetUhlu, pocetUhlu), 1);
  const minUhel = deduce(celkem, pocet, ctor("rate"));
  const alfa = deduce(minUhel, cont("alfa", 2, pocetUhlu));
  const triangleSum = cont(rovnoramennyTrojLabel, 180, entity3);
  const uhelRamenaRovnoramennehoTrojuhelniku = ({ vrcholovyUhel: vrcholovyUhel2 }, { uhelRamenoLabel }) => toCont(
    deduce(
      toCont(deduce(
        triangleSum,
        vrcholovyUhel2,
        ctor("comp-diff")
      ), { agent: "ob\u011B ramena" }),
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
    { uhelRamenoLabel: "beta" }
  ), vrcholovyUhel);
  const gama = deduce(
    last(alfa),
    uhelRamenaRovnoramennehoTrojuhelniku(
      {
        vrcholovyUhel: cont(vrcholovyUhelLabel, lastQuantity(minUhel), entity3)
      },
      { uhelRamenoLabel: "gama" }
    )
  );
  return [
    { deductionTree: deduce(alfa, ctorBooleanOption(72)) },
    { deductionTree: deduce(beta, ctorBooleanOption(36, "smaller")) },
    { deductionTree: deduce(gama, ctorBooleanOption(0)) }
  ];
}

// src/math/shapes/rectangle.ts
function volume({ width, length, height }, options) {
  const { heightLabel, widthLabel, lengthLabel, entity3D, entity: entity3, volumeLabel } = {
    ...{
      widthLabel: "\u0161\xED\u0159ka",
      lengthLabel: "d\xE9lka",
      heightLabel: "v\xFD\u0161ka",
      entity3D: "krychli\u010Dek",
      entity: "cm",
      volumeLabel: "objem"
    },
    ...options ?? {}
  };
  return deduce2(
    length,
    width,
    height,
    product(volumeLabel, [lengthLabel, widthLabel, heightLabel], entity3D, entity3)
  );
}

// src/math/M9I-2025/domecek.ts
function domecek2({ input }) {
  const entity3 = "cm";
  const dumLabel = "dome\u010Dek";
  const entity2d = "\u010Dtvere\u010Dk\u016F";
  const entity3d = "krychli\u010Dek";
  const area = axiomInput(cont(`plocha ${dumLabel}`, input.baseSurfaceArea, entity2d), 1);
  const pasmo = axiomInput(quota(`plocha ${dumLabel}`, "\u010Dtverec", 4), 2);
  const ctverec = deduce(
    area,
    pasmo
  );
  const strana = to(
    ctverec,
    commonSense(`rozklad na prvo\u010D\xEDsla:${primeFactorization([lastQuantity(ctverec)]).join(",")}`),
    cont("\u0161\xED\u0159ka", 2, entity3)
  );
  const rectangleVolume = connectTo(volume({ width: last(strana), height: cont("v\xFD\u0161ka", 2, entity3), length: cont("d\xE9lka", 8, entity3) }, { volumeLabel: "objem p\u0159\xEDzem\xED" }), strana);
  const deductionTree = deduce(
    deduce(
      rectangleVolume,
      deduce({ ...last(rectangleVolume), ...deduceLbl(3) }, ratio("objem p\u0159\xEDzem\xED", "objem st\u0159echa", 1 / 2)),
      combine("objem dome\u010Dek", [], entity3d, entity3)
    ),
    ctorOption("B", 48)
  );
  return { deductionTree };
}

// src/math/M9I-2025/krabice.ts
function plnaKrabice({ input }) {
  const krabiceLabel = "krabice";
  const triKrabiceABezPetiLabel = "3 krabice bez chyb\u011Bj\xEDc\xED v\xFDrobk\u016F";
  const missingVyrobkyLabel = "chyb\u011Bj\xEDc\xED v\xFDrobky";
  const plnaKrabiceLabel = "pln\xE1 krabice";
  const plnaKrabiceVyrobkyLabel = "v\u0161echny v\xFDrobky v pln\xE9 krabici";
  const vyrobekEntity = "kus";
  const entity3 = "gram";
  const plnaKrabicePocet = axiomInput(cont(plnaKrabiceLabel, input.pocetKusuVKrabice, vyrobekEntity), 1);
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
      { ...last(deductionTree1), ...deduceLbl(2) },
      cont(`3 ${plnaKrabiceLabel}`, 3, vyrobekEntity)
    ),
    triKrabice
  );
  const deductionTree2 = deduce(
    to(
      rozdilGram,
      cont(missingVyrobkyLabel, lastQuantity(rozdilGram), entity3)
    ),
    missingVyrobkyPocet,
    ctor("rate")
  );
  const deductionTree3 = deduce(
    to(
      { ...last(deductionTree1), ...deduceLbl(2) },
      cont(plnaKrabiceLabel, lastQuantity(deductionTree1), entity3)
    ),
    deduce(
      { ...last(deductionTree2), ...deduceLbl(4) },
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
  const ruzeRate = axiomInput(rate(chryzatemaAgent, input.cenaZaKus.ruze, entity3, kusEntity), 4);
  const chryzantemaRate = axiomInput(rate(chryzatemaAgent, input.cenaZaKus.chryzantema, entity3, kusEntity), 5);
  const staticeRate = axiomInput(rate(chryzatemaAgent, input.cenaZaKus.statice, entity3, kusEntity), 6);
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
  return {
    audio: true,
    deductionTree: deduce(
      deduce(
        deduce(ruze, ruzeRate),
        deduce(last(statice), staticeRate),
        deduce(chryzantem, chryzantemaRate),
        combine(kyticeAgent, [ruzeAgent, chryzatemaAgent, staticAgent], entity3, entity3)
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
    product(hiherRectLabel, [rowLabel, columnLabel], columnLabel, entity3)
  );
  const dd2 = to(
    columns,
    commonSense(`rozklad na prvo\u010D\xEDsla:${primeFactorization([input.pocetSloupcu]).join(",")}`),
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
  return { deductionTree };
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
          deduce(prumer, ctorPercent()),
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
  const okurka = axiomInput(cont(okurkaLabel, variableName, entity3), 1);
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
  return [
    { deductionTree: deduce(sazenicOkurek, salatyAndOkurkyCompare), template: () => "" },
    { deductionTree: deduce(last(sazenicOkurek), ujaloOkurekRatio), template: () => "" }
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
    commonSense(`rozklad na prvo\u010D\xEDsla:${primeFactorization([input.pocetCasti]).join(",")}`),
    commonSense(`seskup je do dvojic (2x20), (4x10), (8x5)`),
    commonSense(`najdi dvojici, kter\xE1 m\xE1 nejmen\u0161\xED sou\u010Det = (8x5)`),
    cont(usekLabel, 8, emptyEntity)
  );
  const deductionTree = deduce(
    deduce(
      deduce(dvojice, diff),
      deduce({ ...cont(usekLabel, 5, emptyEntity), ...deduceLbl(1) }, diff),
      combine(`sou\u010Det \u010Dar`, [], emptyEntity, emptyEntity)
    ),
    ctorOption("A", 11)
  );
  return { deductionTree };
}

// src/math/M9I-2025/plocha.ts
function porovnani2Ploch({}) {
  const entity3 = "";
  const unit = "cm2";
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
var M9I_2025_default = {
  1: porovnani2Ploch({ input: {} }),
  6.1: okurkyASalaty({ input: { salatyNavic: 4 } })[0],
  6.2: okurkyASalaty({ input: { salatyNavic: 4 } })[1],
  7.1: plnaKrabice({ input: krabiceParams })[0],
  7.2: plnaKrabice({ input: krabiceParams })[1],
  7.3: plnaKrabice({ input: krabiceParams })[2],
  11.1: desetiuhelnik({ input: { pocetUhlu: 10 } })[0],
  11.2: desetiuhelnik({ input: { pocetUhlu: 10 } })[1],
  11.3: desetiuhelnik({ input: { pocetUhlu: 10 } })[2],
  12: kytice({ input: { cenaZaKus: { ruze: 54, chryzantema: 40, statice: 35 } } }),
  13: caryNaPapire({ input: { pocetCasti: 40 } }),
  14: domecek2({ input: { baseSurfaceArea: 16, quota: 4 } }),
  15.1: objemNadoby1({ input: { zbyva: 14, zaplnenoPomer: 3 / 5 } }),
  15.2: objemNadoby2({ input: { zaplnenoProcento: 55, odebrano: 12, zaplnenoPoOdebraniRatio: 1 / 4 } }),
  15.3: objemNadoby3({ input: { nadoba1Procent: 30, nadoba2Procent: 40, nadoba3: 19, prumerNadobaRatio: 2 / 5 } }),
  16.1: letajiciCtverecky({ input: { pocetRad: 21, pocetSloupcu: 110 } })[0],
  16.2: letajiciCtverecky({ input: { pocetRad: 21, pocetSloupcu: 110 } })[1]
};

// src/math/M9A-2025/index.ts
var M9A_2025_default = {
  //1: porovnani(),
  5.1: pozemek2().sirkaDum,
  5.2: pozemek2().rozlohaVolnyPozemek,
  6.1: sud2().vzestupObjem,
  6.2: sud2().vzestupVyska,
  7.1: uhly().alfa,
  7.2: uhly().beta,
  7.3: uhly().gamma,
  8.1: zahon2().obvod,
  8.2: zahon2().rozdilPocetRostlin,
  8.3: zahon2().nejmensiPocetCerveneKvetoucich,
  12: bazen(),
  13: pelhrimov(),
  14: znamkyPrumer(),
  15.1: organizatoriPercent(),
  15.2: soutez(),
  15.3: atletika()
  //16.1: obrazce().pocetTmavyObrazec,
};
function pozemek2() {
  const entity2d = "obsah";
  const entity3 = "d\xE9lka";
  const unit = "m";
  const unit2d = "m2";
  const pozemek3 = cont("c", 30, entity3, unit);
  const obsahPozemek = deduce(
    pozemek3,
    pozemek3,
    product("pozemek", [], { entity: entity2d, unit: unit2d }, { entity: entity3, unit })
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
          combine("dum a rybnik", [], { entity: entity2d, unit: unit2d }, { entity: entity2d, unit: unit2d })
        ),
        ctorDifference("voln\xFD pozemkek")
      )
    }
  };
}
function sud2() {
  const entity2d = "obsah";
  const entity3d = "objem";
  const entity3 = "v\xFD\u0161ka";
  const unit = "cm";
  const unit2d = "cm2";
  const unit3d = "cm3";
  const dnoSudu = cont("dno sudu", 1500, entity2d, unit2d);
  const vzestupHladiny = deduce(
    deduce(cont("p\u0159ibylo vody", 3, entity3d, "l"), ctorUnit(unit3d)),
    dnoSudu,
    ctor("quota")
  );
  return {
    vzestupObjem: {
      deductionTree: deduce(
        deduce(
          dnoSudu,
          deduce(cont("vzestup hladiny", 10, entity3, "mm"), ctorUnit("cm")),
          product("p\u0159ibylo vody", [], { entity: entity3d, unit: unit3d }, { entity: entity2d, unit: unit2d })
        ),
        ctorUnit("l")
      )
    },
    vzestupVyska: {
      deductionTree: deduce(
        to(
          vzestupHladiny,
          cont("vzestup hladiny", lastQuantity(vzestupHladiny), entity3, unit)
        ),
        ctorUnit("mm")
      )
    }
  };
}
function uhly() {
  const entity3 = "\xFAhel";
  const unit = "stup\u0148\u016F";
  const angleLabel = "zadan\xE1 hodnota";
  const angle1 = cont(angleLabel, 30, entity3, unit);
  const angle2 = cont(angleLabel, 130, entity3, unit);
  return {
    alfa: {
      deductionTree: deduce(
        angle1,
        compAngle(angleLabel, "alfa", "alternate-interior")
      )
    },
    beta: {
      deductionTree: deduce(
        deduce(angle2, compAngle(angleLabel, "vedlej\u0161\xED", "supplementary")),
        compAngle("vedlej\u0161\xED", "beta", "corresponding")
      )
    },
    gamma: {
      deductionTree: deduce(
        deduce(
          cont("sou\u010Det \xFAhl\u016F v troj\xFAheln\xEDku", 180, entity3, unit),
          deduce(
            deduce(angle2, compAngle(angleLabel, "bod R v pravo\xFAhl\xE9m troj\xFAheln\xEDku", "supplementary")),
            cont("prav\xFD \xFAhel", 90, entity3, unit),
            combine("sou\u010Det dvou \xFAhl\u016F", [], { entity: entity3, unit }, { entity: entity3, unit })
          ),
          ctorDifference("vrchol v pravo\xFAhl\xE9m troj\xFAheln\xEDku")
        ),
        compAngle("vrchol v pravo\xFAhl\xE9m troj\xFAheln\xEDku", "gamma", "supplementary")
      )
    }
  };
}
function zahon2() {
  const entity1d = "d\xE9lka";
  const unit1d = "cm";
  const entity3 = "po\u010Det";
  const pocetRostlinQuantity = 65;
  const pocetRostlin = cont("rostliny", pocetRostlinQuantity, entity3);
  const rozestup = rate("rostliny", 40, { entity: entity1d, unit: unit1d }, entity3);
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
              commonSense(`rozklad na prvo\u010D\xEDsla:${primeFactorization([pocetRostlinQuantity]).join(",")}`),
              commonSense(`kombinace 5x13 nebo 13x5, vybereme v\u011Bt\u0161\xED po\u010Det opakov\xE1n\xED, aby jsme doc\xEDlili men\u0161\xEDho po\u010Dtu \u010Derven\xFDch r\u016F\u017E\xED`),
              quota("rostliny", "skupina dohromady b\xEDl\xE9 a \u010Derven\xE9 rostliny", 13)
            ),
            pocetRostlin
          ),
          cont("b\xEDl\xFDch rostlin", 2, entity3),
          ctorDifference("\u010Derven\xFDch rostlin")
        ),
        cont("po\u010Det opakov\xE1n\xED", 13, ""),
        product("\u010Derven\xFDch rostlin", [], entity3, entity3)
      )
    }
  };
}
function bazen() {
  const entity3 = "";
  const unit = "m";
  const entity3d = "objem";
  const unit3d = "m3";
  const agentLabel = "baz\xE9n";
  const dnoLabel = "\u0161ikm\xE9 dno";
  const zonaLabel = "prohlouben\xED z\xF3na pro plavce";
  const delka = cont(agentLabel, 40, "d\xE9lka", unit);
  const sirka = cont(agentLabel, 10, "\u0161\xEDrka", unit);
  const vyska = cont(agentLabel, 1, "v\xFD\u0161ka", unit);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          delka,
          sirka,
          vyska,
          product(agentLabel, [], { entity: entity3d, unit: unit3d }, { entity: entity3, unit })
        ),
        deduce(
          deduce(
            cont(zonaLabel, 20, "d\xE9lka", unit),
            cont(zonaLabel, 1, "v\xFD\u0161ka", unit),
            sirka,
            product(zonaLabel, [], { entity: entity3d, unit: unit3d }, { entity: entity3, unit })
          ),
          ratio(zonaLabel, dnoLabel, 1 / 2)
        ),
        combine("baz\xE9n celkem", [], { entity: entity3d, unit: unit3d }, { entity: entity3d, unit: unit3d })
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
                combine("t\xE1bor p\u0159ihl\xE1\u0161eno", [], "", "")
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
        toCont(deduce(
          celkem,
          deduce(
            cont("hr\xE1\u010Di", 10, entityBase),
            rate("hr\xE1\u010Di", 11, entity3, entityBase)
          ),
          ctorDifference("organiz\xE1to\u0159i")
        ), { agent: "organiz\xE1to\u0159i" }),
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
  const pocetTrojekk = deduce(
    pocetCelkem,
    deduce(
      pocetJednicek,
      pocetDvojek,
      combine("celkem", [], entityPocet, entityPocet)
    ),
    ctorDifference("")
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            pocetJednicek,
            deduce(pocetDvojek, cont("dvojka", 2, entity3), product("dvojka", [], entity3, entity3)),
            deduce(pocetTrojekk, cont("trojka", 3, entity3), product("trojka", [], entity3, entity3)),
            combine("celkem", [], entity3, entity3)
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
          combine(women, [], entity3, entity3)
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
          combine("celkem", [], entity3, entity3)
        ),
        ctorPercent()
      ),
      ctorOption("C", 50, { asPercent: true })
    )
  };
}

// src/math/M9B-2025/index.ts
var M9B_2025_default = {
  1: porovnani(),
  7.1: salaty().druhyDenTrzba,
  7.2: salaty().druhyDenVyrazSPromenou,
  7.3: salaty().pocetSalatu,
  8.1: pravouhlyLichobeznik().obsah,
  8.2: pravouhlyLichobeznik().obvod,
  8.3: pravouhlyLichobeznik().obvodRovnobeznik,
  11.1: zahrada().jabloneVsMagnolie,
  11.2: zahrada().levanduleABazalkaVsHortenzie,
  11.3: zahrada().ruzePlocha,
  12: uhelAlfa(),
  14: dort(),
  15.1: tabor().percentPerVedouci,
  15.2: tabor().mladsiPercent,
  15.3: tabor().pocetDivek
};
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
                combine("prodano za dva dny", [], "", "")
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
function dort() {
  const entity3 = "polom\u011Br";
  const unit = "cm";
  const entity2d = "obsah";
  const unit2d = "cm2";
  const vetsiKorpus = cont("v\u011Bt\u0161\xED korpus", 8, entity3, unit);
  const mensiKorpus = deduce(
    vetsiKorpus,
    compRelative("men\u0161\xED korpus", "v\u011Bt\u0161\xED korpus", -1 / 4)
  );
  const height = cont("korpus", 5, entity3, unit);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          vetsiKorpus,
          vetsiKorpus,
          height,
          product("v\u011Bt\u0161\xED korpus", [], { entity: entity2d, unit: unit2d }, { entity: entity3, unit })
        ),
        deduce(
          mensiKorpus,
          last(mensiKorpus),
          height,
          product("men\u0161\xED korpus", [], { entity: entity2d, unit: unit2d }, { entity: entity3, unit })
        ),
        combine("celkem", [], { entity: entity2d, unit: unit2d }, { entity: entity2d, unit: unit2d })
      ),
      ctorOption("D", 500)
    )
  };
}
function uhelAlfa() {
  const entity3 = "\xFAhel";
  const unit = "stup\u0148\u016F";
  const triangleSumLabel = "sou\u010Det \xFAhl\u016F v troj\xFAheln\xEDku";
  const soucetUhluVTrojuhelniku = cont(triangleSumLabel, 180, entity3, unit);
  const praveRameho = deduce(
    ratios(triangleSumLabel, ["vrcholov\xFD \xFAhel", "lev\xE9 rameno", "prav\xE9 rameno"], [40, 70, 70]),
    soucetUhluVTrojuhelniku
  );
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          soucetUhluVTrojuhelniku,
          deduce(
            deduce(
              deduce(
                praveRameho,
                compAngle("prav\xE9 rameno", "\xFAhel p\u0159\xEDmka p", "corresponding")
              ),
              compAngle("\xFAhel p\u0159\xEDmka p", "troj\xFAheln\xEDk bod A", "alternate-exterior")
            ),
            last(praveRameho),
            combine("dvojice sou\u010Det", ["troj\xFAheln\xEDk bod A", "troh\xFAheln\xEDk bod B"], { entity: entity3, unit }, { entity: entity3, unit })
          ),
          ctorDifference("troj\xFAheln\xEDk bod C")
        ),
        compAngle("troj\xFAheln\xEDk bod C", "alfa", "supplementary")
      ),
      ctorOption("B", 140)
    )
  };
}
function pravouhlyLichobeznik() {
  const entity3 = "d\xE9lka";
  const unit = "cm";
  const entity2d = "obsah";
  const unit2d = "cm2";
  const agentLabel = "lichob\u011B\u017En\xEDk";
  const spodniZakladna = cont("spodn\xED z\xE1kladna", 140, entity3, unit);
  const horniZakladna = cont("horn\xED z\xE1kladna", 100, entity3, unit);
  const height = cont(`${agentLabel} v\xFD\u0161ka`, 30, entity3, unit);
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
    combine(`${agentLabel} obvod`, [], { entity: entity3, unit }, { entity: entity3, unit })
  );
  return {
    obsah: {
      deductionTree: deduce(
        triangleArea({
          size: spodniZakladna,
          height,
          triangle: {
            agent: agentLabel
          }
        }),
        triangleArea({
          size: horniZakladna,
          height,
          triangle: {
            agent: agentLabel
          }
        }),
        combine(agentLabel, [], { entity: entity2d, unit: unit2d }, { entity: entity2d, unit: unit2d })
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
        combine("rovnob\u011B\u017En\xEDk obvod", [], { entity: entity3, unit }, { entity: entity3, unit })
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
  const entity2d = "obsah";
  const magnoliePlocha = cont(magnolieL, 20, entity2d);
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
      combine("celkem", [], entity3, entity3)
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
            combine("dohromady", [], entity3, entity3)
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
function tabor() {
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
          compRelative(mladsiLabel, starsiLabel, -1 / 3),
          ctorComparePercent()
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

// src/math/MMA-2025/index.ts
var MMA_2025_default = {
  1: boruvky({
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
  2: boruvky({
    input: {
      quantityEntity: {
        entity: "objem",
        unit: "ml",
        groupSize: 50
      },
      priceEntity: {
        entity: "korun"
      },
      agentA: {
        label: "laborantka 1",
        quantity: 650,
        price: 195
      },
      agentB: {
        label: "laborantka 2",
        quantity: 0.5,
        price: 150,
        unit: "l"
      },
      finalPrice: 750
    }
  }),
  3: boruvky({
    input: {
      "quantityEntity": {
        "groupSize": 5,
        "entity": "g\xF3l",
        "unit": "min"
      },
      "priceEntity": {
        "entity": "body"
      },
      "agentA": {
        "label": "T\xFDm A",
        "quantity": 30,
        "price": 100
      },
      "agentB": {
        "label": "T\xFDm B",
        "quantity": 45,
        "price": 90,
        "unit": "min"
      },
      "finalPrice": 400
    }
  }),
  //3: delitelnost(),
  5.1: spotrebaPaliva().beznePalivo,
  5.2: spotrebaPaliva().powerPalivo,
  6: spotrebaPaliva().cenaPowerPalivo,
  8: prumernyPlat(),
  18: rovnoramennySatek(),
  19: kruhovaVysec(),
  20: vzestupHladinyVody(),
  21: vyrezKrychle()
};
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
  const entity3 = "";
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
        to(
          powerPrice,
          rate(power, lastQuantity(powerPrice), entityPrice, { entity: entity3, unit })
        )
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
          to(
            powerPrice,
            rate(power, lastQuantity(powerPrice), entityPrice, { entity: entity3, unit })
          )
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
          combine("celkem vyplaceno", [], entityPrice, entityPrice)
        ),
        ctorLinearEquation(ostatniLabel, { entity: entityPrice }, "x")
      ),
      platCompare
    )
  };
}
function vzestupHladinyVody() {
  const unit = "cm";
  const entity3 = "d\xE9lka";
  const unit3d = "cm3";
  const entity3d = "objem";
  const objemKulicky = deduce(
    cont("kuli\u010Dka polom\u011Br", 3, entity3, unit),
    evalExprAsCont("4/3*r^3*\u03C0", { kind: "cont", agent: "kuli\u010Dka", entity: entity3d, unit: unit3d })
  );
  const objemValce = deduce(
    deduce(
      cont("v\xE1lec pr\u016Fm\u011Br", 12, entity3, unit),
      compRatio("v\xE1lec pr\u016Fm\u011Br", "v\xE1lec polom\u011Br", 2)
    ),
    evalExprAsCont("r^2*\u03C0", { kind: "cont", agent: "v\xE1lec", entity: entity3d, unit: unit3d })
  );
  return {
    deductionTree: deduce(
      objemValce,
      objemKulicky,
      ctor("comp-ratio")
    )
  };
}
function rovnoramennySatek() {
  const odvesnaLabel = "odv\u011Bsna";
  const preponaLabel = "p\u0159epona";
  const mensiSatekLabel = "men\u0161\xED \u0161\xE1tek";
  const vetsiSatekLabel = "v\u011Bt\u0161\xED \u0161\xE1tek";
  const entity3 = "d\xE9lka";
  const unit = "cm";
  const entity2d = "obsah";
  const unit2d = "cm2";
  const mensiSatekOdvesna = cont(mensiSatekLabel, 50, entity3, unit);
  const mensiSatek = deduce(
    mensiSatekOdvesna,
    evalExprAsCont("1/2*a^2", { kind: "cont", agent: mensiSatekLabel, entity: entity2d, unit: unit2d })
  );
  const vetsiStatekOdvesna = deduce(
    deduce(
      mensiSatek,
      compRelativePercent(vetsiSatekLabel, mensiSatekLabel, 125)
    ),
    evalExprAsCont("sqrt(2*a)", { kind: "cont", agent: vetsiSatekLabel, entity: entity2d, unit: unit2d })
  );
  return {
    deductionTree: deduce(
      vetsiStatekOdvesna,
      last(vetsiStatekOdvesna),
      pythagoras(`${vetsiSatekLabel} - ${preponaLabel}`, [mensiSatekLabel, mensiSatekLabel])
    )
  };
}
function vyrezKrychle() {
  const entity3 = "d\xE9lka";
  const entity2d = "obsah";
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
    cont(stranaLabel, 6, entity3)
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
          deduce(
            stranaKrychle,
            lastStranaKrychle,
            product(`st\u011Bna ${krychleLabel}`, [], entity2d, entity3)
          ),
          cont(`po\u010Det st\u011Bn ${krychleLabel}`, 6, ""),
          product(`${krychleLabel}`, [], entity2d, entity3)
        ),
        deduce(
          deduce(
            deduce(
              lastStranaKrychle,
              lastStranaKrychle,
              product("st\u011Bna krychle", [], entity2d, entity3)
            ),
            cont("po\u010Det \u010Dtvercov\xFDch st\u011Bn", 3, ""),
            product(`lev\xE1, prav\xE1 a spodn\xED st\u011Bna - ${telesoLabel}`, [], entity2d, entity3)
          ),
          deduce(
            deduce(
              deduce(
                lastStranaKrychle,
                lastStranaKrychle,
                product(`p\u0159edn\xED st\u011Bna - ${telesoLabel}`, [], entity2d, entity3)
              ),
              deduce(
                lastStranaKrychle,
                lastStranaKrychle,
                product(`zadn\xED st\u011Bna - ${telesoLabel}`, [], entity2d, entity3)
              ),
              combine(`p\u0159edn\xED a zadn\xED st\u011Bna - ${telesoLabel}`, [], entity2d, entity3)
            ),
            deduce(
              delsiOdvesna,
              lastStranaKrychle,
              product("p\u0159edn\xED a zadn\xED troj\xFAheln\xEDkov\xFD v\xFD\u0159ez", [], entity2d, entity3)
            ),
            ctorDifference(`p\u0159edn\xED a zadn\xED st\u011Bna bez v\xFD\u0159ezu - ${telesoLabel}`)
          ),
          deduce(
            deduce(
              lastStranaKrychle,
              last(prepona),
              product(`obdeln\xEDkov\xE1 \u0161ikm\xE1 st\u011Bna - ${telesoLabel}`, [], entity2d, entity3)
            ),
            cont(`po\u010Det obdeln\xEDkov\xFDch \u0161ikm\xFDch st\u011Bn - ${telesoLabel}`, 2, ""),
            product(`ob\u011B obdeln\xEDkov\xE9 \u0161ikm\xE9 st\u011Bny - ${telesoLabel}`, [], entity2d, entity3)
          ),
          combine(`${telesoLabel}`, [], entity2d, entity3)
        ),
        ctorRatios("pom\u011Br t\u011Bles")
      ),
      cont("nejv\u011Bt\u0161\xED spole\u010Dn\xFD d\u011Blitel", 216, ""),
      ctor("scale")
    )
  };
}
function kruhovaVysec() {
  const vetsiLabel = "celkov\xFD \xFAhel kruhu";
  const mensiLabel = "uhel \u03C6 odpov\xEDdaj\xEDc\xED v\xFDse\u010Di kruhu";
  const entity3 = "stup\u0148\u016F";
  return {
    deductionTree: deduce(
      to(
        commonSense(`obsah cel\xE9ho kruhu (r): \u03C0*r^2`),
        commonSense(`obsah cel\xE9ho kruhu s v\u011Bt\u0161\xEDm polom\u011Brem(3/2r): \u03C0*3/2r^2 = 9/4*\u03C0*r^2`),
        commonSense(`v\u011Bt\u0161\xED kruh je 9/4 kr\xE1t v\u011Bt\u0161\xED ne\u017E men\u0161\xED kruh, co\u017E mus\xED odpov\xEDdat tomu, \u017Ee obsah v\xFDse\u010De  v\xFDse\u010De kruhu  jeho celkov\xE9mu obsahu`),
        commonSense(`v\xFDse\u010D je \u010D\xE1st z cel\xE9ho kruhu s v\u011Bt\u0161\xEDm polom\u011Brem`),
        compRatio(vetsiLabel, mensiLabel, 9 / 4)
      ),
      cont(vetsiLabel, 360, entity3)
    )
  };
}

// src/math/word-problems.ts
var word_problems_default = {
  "M5A-2023": M5A_2023_default,
  "M5A-2024": M5A_2024_default,
  "M5A-2025": M5A_2025_default,
  "M5B-2025": M5B_2025_default,
  "M7A-2023": M7A_2023_default,
  "M7A-2024": M7A_2024_default,
  "M7A-2025": M7A_2025_default,
  "M7B-2025": M7B_2025_default,
  "M9A-2023": M9A_2023_default,
  // "M9B-2023": {
  //   16.1: ctvercovaSit({ input: {} })[0],
  //   16.2: ctvercovaSit({ input: {} })[1],
  //   16.3: ctvercovaSit({ input: {} })[2],
  // },
  "M9A-2024": M9A_2024_default,
  // "M9C-2024": {
  //   1: pocetObyvatel({ input: { celkem: 86_200, jihlavaPlus: 16_000 } }),
  //   12: sourozenci({ input: { evaPodil: 40, michalPlus: 24, zbyvaNasporit: 72 } }),
  // },
  // "M9B-2024": M9B_2024,
  "M9I-2025": M9I_2025_default,
  "M9A-2025": M9A_2025_default,
  "M9B-2025": M9B_2025_default,
  "MMA-2025": MMA_2025_default
};
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

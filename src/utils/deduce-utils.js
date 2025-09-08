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
function isExpressionNode(quantity) {
  return quantity?.expression != null;
}
function areNumbers(ratios) {
  return ratios.every((d) => isNumber(d));
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
function isQuantityPredicate(value) {
  return ["cont", "comp", "transfer", "rate", "comp-diff", "transfer", "quota", "delta"].includes(value.kind);
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
function convertToExpression(expectedValue, compareTo, expectedValueOptions) {
  const convertedValue = expectedValueOptions.asFraction ? helpers.convertToFraction(expectedValue) : expectedValueOptions.asPercent ? expectedValue / 100 : expectedValue;
  const toCompare = (comp) => `x ${comp} ${convertedValue}`;
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
      return `closeTo(x, ${convertedValue})`;
  }
}
function compDiff(agentMinuend, agentSubtrahend, quantity, entity) {
  return { kind: "comp-diff", agentMinuend, agentSubtrahend, quantity, entity };
}
function toEntity(entity) {
  return isEntityBase(entity) ? entity : { entity };
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
    question: `Vypo\u010Dti ${a.agent == b.agentB ? b.agentA : b.agentB}? ${b.agentA} je ${formatAngle(b.relationship)} k ${b.agentB}.`,
    result,
    options: isNumber(result.quantity) ? [
      { tex: `90 - ${a.quantity} `, result: formatNumber(result.quantity), ok: b.relationship == "complementary" },
      { tex: `180 - ${a.quantity} `, result: formatNumber(result.quantity), ok: b.relationship == "supplementary" || b.relationship == "sameSide" },
      { tex: `${a.quantity} `, result: formatNumber(result.quantity), ok: b.relationship != "supplementary" && b.relationship != "complementary" && b.relationship != "sameSide" }
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
    question: `Porovnej ${result.agentA} a ${result.agentB}. Kolikr\xE1t ? `,
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
function convertToPartToPartRatios(b, a, last2) {
  const tempResult = convertToPartToPartRatiosEx(b, a);
  if (!isNumber(b.ratio) || !areNumbers(tempResult.ratios)) {
    throw "convertToPartToPartRatios does not support expressions";
  }
  const result = {
    ...tempResult,
    ratios: last2 != null ? ratiosToBaseForm(tempResult.ratios) : tempResult.ratios
  };
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
function computeRoundTo(value, order = 1) {
  if (order <= 0) {
    throw new Error("Order must be positive");
  }
  return Math.round(value / order) * order;
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
function roundTo(a, b) {
  const result = {
    ...a,
    quantity: isNumber(a.quantity) ? computeRoundTo(a.quantity, b.order) : wrapToQuantity(`round ${a.quantity}`, { a })
  };
  return {
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
function ratioCompareRuleEx(a, b, nthPart) {
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
  } else if (b.agentA == nthPart?.agent) {
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
function ratioCompareRule(a, b, nthPart) {
  const result = ratioCompareRuleEx(a, b, nthPart);
  return {
    question: `${computeQuestion(result.quantity)} ${result.agent} ${result.kind === "rate" ? formatEntity(result.entity) : formatEntity(result)}?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.ratio) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(abs(b.ratio))} `, result: formatNumber(a.quantity * b.ratio), ok: [a.agent, a.entity].includes(b.agentB) && b.ratio >= 0 || [a.agent, a.entity].includes(b.agentA) && b.ratio < 0 },
      {
        tex: `${formatNumber(a.quantity)} / ${formatRatio(abs(b.ratio))}`,
        result: formatNumber(a.quantity / b.ratio),
        ok: [a.agent, a.entity].includes(b.agentA) && b.ratio >= 0 || [a.agent, a.entity].includes(b.agentB) && b.ratio < 0
      },
      { tex: `${formatNumber(a.quantity)} / (${formatRatio(abs(b.ratio))} + 1)`, result: formatNumber(result.quantity), ok: ![a.agent, a.entity].includes(b.agentA) && ![a.agent, a.entity].includes(b.agentB) && b.agentA !== nthPart?.agent },
      { tex: `${formatNumber(a.quantity)} / (${formatRatio(abs(b.ratio))} + 1) * ${formatRatio(abs(b.ratio))}`, result: formatNumber(result.quantity), ok: b.agentA == nthPart?.agent }
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
function convertToCompRatioEx(b, { agent, asPercent }) {
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
function convertRatiosToCompRatio(b, { agent, asPercent }) {
  const result = convertToCompRatioEx(b, { agent, asPercent });
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}?`,
    result,
    options: [
      // { tex: `${formatRatio(1, b.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(1 - b.ratio, b.asPercent), ok: true },
      // { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false },
    ]
  };
}
function convertRatioToCompRatioEx(a, agent) {
  return {
    kind: "comp-ratio",
    agentA: a.part,
    agentB: agent,
    ratio: isNumber(a.ratio) ? a.ratio / (1 - a.ratio) : wrapToRatio(`a.ratio / (1 - a.ratio)`, { a }),
    asPercent: a.asPercent
  };
}
function convertRatioToCompRatio(a, b) {
  const result = convertRatioToCompRatioEx(a, b.agent);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}?`,
    result,
    options: isNumber(a.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio, a.asPercent)} / (${formatRatio(1, a.asPercent)} - ${formatRatio(a.ratio, a.asPercent)})`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(1, a.asPercent)} - ${formatRatio(a.ratio, a.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: false }
    ] : []
  };
}
function toRatioEx(b) {
  return {
    ...b,
    asPercent: !!!b.asPercent
  };
}
function toRatio(b) {
  const result = toRatioEx(b);
  return {
    question: `Vyj\xE1d\u0159i ${!b.asPercent ? "procentem" : "pom\u011Brem"}?`,
    result,
    options: isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(b.ratio, b.asPercent)} * 100`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} / 100`, result: formatRatio(result.ratio, result.asPercent), ok: false }
    ] : []
  };
}
function reverseCompRatioEx(b) {
  return {
    kind: "comp-ratio",
    agentA: b.agentB,
    agentB: b.agentA,
    ratio: isNumber(b.ratio) ? 1 / b.ratio : wrapToRatio(`1 / b.ratio`, { b }),
    asPercent: b.asPercent
  };
}
function reverseCompRatio(b) {
  const result = reverseCompRatioEx(b);
  return {
    question: `Obra\u0165 porovn\xE1n\xED ${result.agentA} a ${result.agentB}?`,
    result,
    options: isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `1 / ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} / 100`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false }
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
function ratiosConvertRule(a, b, last2) {
  const result = ratiosConvertRuleEx(a, b, last2.asPercent);
  if (!areNumbers(b.ratios) || !isNumber(result.ratio)) {
    throw "ratios does not support non quantity type";
  }
  const index = b.parts.indexOf(a.agent);
  const value = b.ratios[index];
  return {
    question: `Vyj\xE1d\u0159i ${last2.asPercent ? "procentem" : "pom\u011Brem"} ${result.part} z ${result.whole}?`,
    result,
    options: [
      { tex: `${formatNumber(value)} / (${b.ratios.map((d) => formatNumber(d)).join(" + ")})`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatNumber(value)} * (${b.ratios.map((d) => formatNumber(d)).join(" + ")})`, result: formatRatio(result.ratio, result.asPercent), ok: false }
    ]
  };
}
function compRatioToCompRuleEx(a, b) {
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
function compRatioToCompRule(a, b, last2) {
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
function toCompRuleEx(a, b) {
  if (a.entity != b.agentA && a.entity != b.agentB) {
    throw `Mismatch entity with ${a.agentA} with agents ${b.agentA}, ${b.agentB}`;
  }
  return {
    ...a,
    entity: a.entity == b.agentA ? b.agentB : b.agentA,
    quantity: a.entity == b.agentA ? computeQuantityByRatioPart(a, b) : computeQuantityByRatioBase(a, b)
  };
}
function toCompRule(a, b) {
  const result = toCompRuleEx(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik ${result.entity}?`,
    result,
    options: isNumber(b.ratio) && isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity * b.ratio), ok: [a.entity].includes(b.agentB) && b.ratio >= 0 || [a.entity].includes(b.agentA) && b.ratio < 0 },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity / b.ratio), ok: [a.entity].includes(b.agentA) && b.ratio >= 0 || [a.entity].includes(b.agentB) && b.ratio < 0 }
    ] : []
  };
}
function compRatiosToCompRuleEx(a, b, nthPart) {
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
  if (!(diff > 0 && b.quantity > 0 || diff < 0 && b.quantity < 0 || diff == 0 && b.quantity == 0)) {
    throw `Uncompatible compare rules. Absolute compare ${b.quantity} between ${b.agentA} a ${b.agentB} does not match relative compare.`;
  }
  const lastIndex = nthPart?.agent != null ? a.parts.findIndex((d) => d === nthPart.agent) : aIndex > bIndex ? aIndex : bIndex;
  const nthPartAgent = a.parts[lastIndex];
  return {
    kind: "cont",
    agent: nthPartAgent,
    entity: b.entity,
    unit: b.unit,
    quantity: abs(b.quantity / diff) * a.ratios[lastIndex]
  };
}
function compRatiosToCompRule(a, b, nthPart) {
  const result = compRatiosToCompRuleEx(a, b, nthPart);
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
function invertRatiosRuleEx(a, b) {
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
function invertRatiosRule(a, b) {
  if (!areNumbers(a.ratios)) {
    throw `invertRatisRule is not support by non quantity type`;
  }
  const result = mapRatiosByFactorEx(invertRatiosRuleEx(a, b), lcdCalc(a.ratios));
  return {
    question: `P\u0159eve\u010F pom\u011Bry na obracen\xE9 hodnoty.`,
    result,
    options: areNumbers(a.ratios) ? [
      { tex: `obr\xE1tit pom\u011Br`, result: result.ratios.join(":"), ok: true }
    ] : []
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
    options: isNumber(a.quantity) && isNumber(b.ratio) && isNumber(result.quantity) ? [
      { tex: `${formatRatio(b.ratio)} * ${formatNumber(a.quantity)}`, result: formatNumber(result.quantity), ok: matchAgent(b.whole, a) },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(b.ratio)}`, result: formatNumber(a.quantity / b.ratio), ok: !matchAgent(b.whole, a) }
    ] : []
  };
}
function rateRuleEx(a, rate) {
  const aEntity = a.kind == "cont" ? a.entity : a.agentQuota;
  if (!(aEntity === rate.entity.entity || aEntity === rate.entityBase.entity)) {
    throw `Mismatch entity ${aEntity} any of ${rate.entity.entity}, ${rate.entityBase.entity}`;
  }
  const isEntityBase2 = aEntity == rate.entity.entity;
  const isUnitRate = rate.baseQuantity === 1;
  return {
    kind: "cont",
    agent: a.agent,
    entity: isEntityBase2 ? rate.entityBase.entity : rate.entity.entity,
    unit: isEntityBase2 ? rate.entityBase.unit : rate.entity.unit,
    quantity: aEntity == rate.entity.entity ? isNumber(a.quantity) && isNumber(rate.quantity) && isNumber(rate.baseQuantity) ? a.quantity / (!isUnitRate ? rate.quantity / rate.baseQuantity : rate.quantity) : !isUnitRate ? wrapToQuantity(`a.quantity / (rate.quantity/rate.baseQuantity)`, { a, rate }) : wrapToQuantity(`a.quantity / rate.quantity`, { a, rate }) : isNumber(a.quantity) && isNumber(rate.quantity) && isNumber(rate.baseQuantity) ? a.quantity * (!isUnitRate ? rate.quantity / rate.baseQuantity : rate.quantity) : !isUnitRate ? wrapToQuantity(`a.quantity * (rate.quantity/rate.baseQuantity)`, { a, rate }) : wrapToQuantity(`a.quantity * rate.quantity`, { a, rate })
  };
}
function rateRule(a, rate) {
  const result = rateRuleEx(a, rate);
  const aEntity = a.kind == "cont" ? a.entity : a.agentQuota;
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(rate.quantity) && isNumber(result.quantity) && isNumber(rate.baseQuantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(rate.quantity)}`, result: formatNumber(result.quantity), ok: aEntity !== rate.entity.entity },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(rate.quantity)}`, result: formatNumber(result.quantity), ok: aEntity === rate.entity.entity }
    ] : []
  };
}
function quotaRuleEx(a, quota) {
  if (!(a.agent === quota.agent || a.agent === quota.agentQuota)) {
    throw `Mismatch entity ${a.entity} any of ${quota.agent}, ${quota.agentQuota}`;
  }
  return {
    kind: "cont",
    agent: a.agent === quota.agentQuota ? quota.agent : quota.agentQuota,
    entity: a.entity,
    quantity: a.agent === quota.agentQuota ? isNumber(a.quantity) && isNumber(quota.quantity) ? a.quantity * quota.quantity : wrapToQuantity(`a.quantity * quota.quantity`, { a, quota }) : isNumber(a.quantity) && isNumber(quota.quantity) ? a.quantity / quota.quantity : wrapToQuantity(`a.quantity / quota.quantity`, { a, quota })
  };
}
function quotaRule(a, quota) {
  const result = quotaRuleEx(a, quota);
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(quota.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(quota.quantity)}`, result: formatNumber(a.quantity * quota.quantity), ok: a.agent === quota.agentQuota },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota.quantity)}`, result: formatNumber(a.quantity / quota.quantity), ok: a.agent !== quota.agentQuota }
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
function toPartWholeRatio(part, whole, last2) {
  const result = toPartWholeRatioEx(part, whole, last2.asPercent);
  return {
    question: `Vyj\xE1d\u0159i ${last2.asPercent ? "procentem" : "pom\u011Brem"} ${part.agent} z ${whole.agent}?`,
    result,
    options: isNumber(part.quantity) && isNumber(whole.quantity) && isNumber(result.ratio) ? [
      { tex: `${formatNumber(whole.quantity)} / ${formatNumber(part.quantity)} ${last2.asPercent ? " * 100" : ""}`, result: last2.asPercent ? formatNumber(result.ratio * 100) : formatRatio(result.ratio), ok: false },
      { tex: `${formatNumber(part.quantity)} / ${formatNumber(whole.quantity)} ${last2.asPercent ? " * 100" : ""}`, result: last2.asPercent ? formatNumber(result.ratio * 100) : formatRatio(result.ratio), ok: true }
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
    const bases = items.every((d) => d.kind === "ratio") ? items.map((d) => d.whole) : items.map((d) => d.agentB);
    if (bases.filter(unique).length == bases.length) {
      throw `Sum only part to whole ratio with the same whole ${bases}`;
    }
    ;
    const ratios = items.map((d) => d.ratio);
    const ratio = areNumbers(ratios) ? ratios.reduce((out, d) => out += d, 0) : wrapToRatio(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
    return items.every((d) => d.kind === "ratio") ? { kind: "ratio", whole: bases[0], ratio, part: b.wholeAgent, asPercent: items[0].asPercent } : { kind: "comp-ratio", agentA: b.wholeAgent, agentB: bases[0], ratio, asPercent: items[0].asPercent };
  } else if (items.every((d) => isQuantityPredicate(d))) {
    const values = items.map((d) => d.quantity);
    const quantity = areNumbers(values) ? values.reduce((out, d) => out += d, 0) : wrapToQuantity(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
    if (items.every((d) => isRatePredicate(d))) {
      const { entity, entityBase } = items[0];
      return { kind: "rate", agent: b.wholeAgent, quantity, entity, entityBase, baseQuantity: 1 };
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
function sumRule(items, b) {
  const result = sumRuleEx(items, b);
  const isQuantity = isQuantityPredicate(result);
  return {
    question: result.kind === "cont" ? containerQuestion(result) : result.kind === "rate" ? `${computeQuestion(result.quantity)} ${result.agent}?` : result.kind === "ratio" ? `${computeQuestion(result.ratio)} ${result.part} z ${result.whole}?` : `${computeQuestion(result.ratio)} kolikr\xE1t ${result.agentA} v\xEDce nebo m\xE9n\u011B ne\u017E ${result.agentB}?`,
    result,
    options: isQuantity && isNumber(result.quantity) || isRatioPredicate(result) && isNumber(result.ratio) ? [
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
function productRuleEx(items, b) {
  const values = items.map((d) => d.quantity);
  const entity = b.wholeEntity != null ? b.wholeEntity : items.find((d) => d.entity != null && d.entity != "");
  const convertedEntity = entity != null ? toEntity(entity) : { entity: "", unit: void 0 };
  return {
    kind: "cont",
    agent: b.wholeAgent,
    quantity: areNumbers(values) ? values.reduce((out, d) => out *= d, 1) : wrapToQuantity(items.map((d, i) => `y${i + 1}.quantity`).join(" * "), Object.fromEntries(items.map((d, i) => [`y${i + 1}`, d]))),
    entity: convertedEntity.entity,
    unit: convertedEntity.unit
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
function tupleRule(items) {
  const result = { kind: "tuple", items };
  return {
    question: `Seskup v\xEDce objekt\u016F do jednoho slo\u017Een\xE9ho objektu.`,
    result,
    options: []
  };
}
function sequenceRuleEx(items) {
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
function sequenceRule(items) {
  const result = sequenceRuleEx(items);
  return {
    question: `Hledej vzor opakov\xE1n\xED. Jak\xFD je vztah mezi sousedn\xEDmi \u010Dleny?`,
    result,
    options: sequenceOptions(result.type)
  };
}
function toComparisonEx(a, b) {
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
function toDeltaEx(a, b, last2) {
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
function toDelta(a, b, last2) {
  const result = toDeltaEx(a, b, last2);
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
  const { agentA, agentB, entity, unit } = b;
  return { kind: "comp", agentA, agentB, quantity: a.quantity, entity, unit };
}
function pythagorasRuleEx(a, b, last2) {
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
function pythagorasRule(a, b, last2) {
  const result = pythagorasRuleEx(a, b, last2);
  const longest = a.agent === last2.longest ? a : b;
  const otherSite = a.agent === last2.longest ? b : a;
  return {
    question: `Vypo\u010D\xEDtej stranu ${result.agent} dle Pythagorovi v\u011Bty?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(longest.quantity) && isNumber(otherSite.quantity) && isNumber(result.quantity) ? [
      { tex: `odmocnina z (${formatNumber(longest.quantity)}^2^ - ${formatNumber(otherSite.quantity)}^2^)`, result: formatNumber(result.quantity), ok: a.agent === last2.longest },
      { tex: `odmocnina z (${formatNumber(a.quantity)}^2^ + ${formatNumber(b.quantity)}^2^)`, result: formatNumber(result.quantity), ok: a.agent !== last2.longest }
    ] : []
  };
}
function alligationRuleEx(items, last2) {
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
function alligationRule(items, last2) {
  const result = alligationRuleEx(items, last2);
  const [min2, avarage, max2] = items.map((d) => d.quantity).sort((f, s) => f - s);
  return {
    question: `Vypo\u010D\xEDtej ${result.whole} mezi ${result.parts.join(" a ")} vyv\xE1\u017Een\xEDm v\u016F\u010Di pr\u016Fm\u011Bru?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `${formatNumber(avarage)} - ${formatNumber(min2)} :: ${formatNumber(max2)} - ${formatNumber(avarage)}`, result: result.ratios.join(":"), ok: true }
    ] : []
  };
}
function triangleAngleRuleEx(a, b, last2) {
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
function triangleAngleRule(a, b, last2) {
  const result = triangleAngleRuleEx(a, b, last2);
  return {
    question: `Vypo\u010D\xEDtej ${result.agent} dle pravidla sou\u010Dtu vnit\u0159n\xEDch \xFAhl\u016F v troj\xFAheln\xEDku?`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `180 - (${formatNumber(a.quantity)} + ${formatNumber(b.quantity)})`, result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function toRatioComparisonEx(a, b, ctor) {
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
    ...ctor.asPercent && { asPercent: true }
  };
}
function convertPercentRuleEx(a) {
  return {
    ...a,
    asPercent: !!!a.asPercent
  };
}
function convertPercentRule(a) {
  const result = convertPercentRuleEx(a);
  return {
    question: a.asPercent ? `P\u0159eve\u010F procenta na n\xE1sobek` : `P\u0159eve\u010F n\xE1sobek na procenta`,
    result,
    options: isNumber(a.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio, a.asPercent)} / 100`, result: formatRatio(result.ratio, result.asPercent), ok: a.asPercent },
      { tex: `${formatRatio(a.ratio, a.asPercent)} * 100`, result: formatRatio(result.ratio, result.asPercent), ok: !a.asPercent }
    ] : []
  };
}
function toRatioComparison(a, b, ctor) {
  const result = toRatioComparisonEx(a, b, ctor);
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
function toSlideEx(a, b, last2) {
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
function toSlide(a, b, last2) {
  const result = toSlideEx(a, b, last2);
  return {
    question: `${containerQuestion(result)}`,
    result,
    options: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${last2.kind === "slide-invert" ? "-" : "+"} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
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
function toDifferenceAsRatio(a, b, diff) {
  const result = toDifferenceAsRatioEx(a, b, diff);
  const aPart = a.kind === "comp-ratio" ? a.agentA : a.part;
  const bPart = b.kind === "comp-ratio" ? b.agentA : b.part;
  return {
    question: `${computeQuestion(result.ratio)} rozd\xEDl mezi ${aPart} a ${bPart}`,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio, a.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(a.ratio, a.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: false }
    ] : []
  };
}
function transitiveRatioRuleEx(a, b) {
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
function transitiveRatioRule(a, b) {
  const result = transitiveRatioRuleEx(a, b);
  return {
    question: `${computeQuestion(result.ratio)} ${result.part} z ${result.whole}`,
    result,
    options: isNumber(a.ratio) && isNumber(b.ratio) && isNumber(result.ratio) ? [
      { tex: `${formatRatio(a.ratio)} * ${formatRatio(b.ratio)}`, result: formatRatio(result.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} / ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio / a.ratio), ok: false }
    ] : []
  };
}
function toRateEx(a, b, rate) {
  if (a.agent !== b.agent) {
    throw `Mismatch angent ${a.agent}, ${b.agent}`;
  }
  const baseQuantity = rate?.baseQuantity ?? 1;
  return {
    kind: "rate",
    agent: a.agent,
    quantity: isNumber(a.quantity) && isNumber(b.quantity) && isNumber(baseQuantity) ? baseQuantity === 1 ? a.quantity / b.quantity * baseQuantity : a.quantity / b.quantity * baseQuantity : isNumber(baseQuantity) && baseQuantity === 1 ? wrapToQuantity(`a.quantity / b.quantity`, { a, b }) : wrapToQuantity(`a.quantity / b.quantity * rate.baseQuantity`, { a, b, rate }),
    entity: {
      entity: a.entity,
      unit: a.unit
    },
    entityBase: {
      entity: b.kind === "cont" ? b.entity : b.agentQuota,
      unit: a.unit
    },
    baseQuantity: rate?.baseQuantity ?? 1
  };
}
function toRate(a, b, rate) {
  const result = toRateEx(a, b, rate);
  if (isNumber(a.quantity) && isNumber(b.quantity) && isNumber(result.baseQuantity) && isNumber(result.quantity)) {
    return {
      question: `Rozd\u011Bl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity })} rovnom\u011Brn\u011B ${formatNumber(b.quantity)} kr\xE1t${result.baseQuantity !== 1 ? ` po ${formatNumber(result.baseQuantity)} ${formatEntity({ entity: b.kind === "cont" ? b.entity : b.agentQuota })}` : ""}`,
      result,
      options: [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: rate.baseQuantity === 1 },
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)} * ${formatNumber(result.baseQuantity)}`, result: formatNumber(result.quantity), ok: rate.baseQuantity !== 1 },
        { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity / a.quantity), ok: false }
      ]
    };
  } else {
    return resultAsQuestion(result);
  }
}
function solveEquationEx(a, b, last2) {
  return {
    kind: "cont",
    agent: last2.agent,
    quantity: helpers.solveLinearEquation(a.quantity, b.quantity, last2.variable),
    ...last2.entity
  };
}
function solveEquation(a, b, last2) {
  const result = solveEquationEx(a, b, last2);
  return {
    question: `Vy\u0159e\u0161 line\xE1rn\xED rovnici ${a.agent} = ${b.agent} pro nezn\xE1mou ${last2.variable}.`,
    result,
    options: []
  };
}
function toQuotaEx(a, quota) {
  return {
    kind: "quota",
    agentQuota: quota.agent,
    agent: a.agent,
    quantity: isNumber(a.quantity) && isNumber(quota.quantity) ? Math.floor(a.quantity / quota.quantity) : wrapToQuantity(`floor(a.quantity / quota.quantity)`, { a, quota }),
    restQuantity: isNumber(a.quantity) && isNumber(quota.quantity) ? a.quantity % quota.quantity : wrapToQuantity(`a.quantity % quota.quantity`, { a, quota })
  };
}
function toQuota(a, quota) {
  const result = toQuotaEx(a, quota);
  if (isNumber(a.quantity) && isNumber(quota.quantity) && isNumber(result.quantity)) {
    return {
      question: `Rozd\u011Bl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity, unit: a.unit })} postupn\u011B na skupiny velikosti ${formatNumber(quota.quantity)} ${formatEntity({ entity: quota.entity, unit: quota.unit })}`,
      result,
      options: [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota.quantity)}`, result: formatNumber(result.quantity), ok: true },
        { tex: `${formatNumber(quota.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(result.quantity), ok: false }
      ]
    };
  } else {
    return resultAsQuestion(result);
  }
}
function toRatiosEx(parts, last2) {
  const ratios = parts.map((d) => d.quantity);
  return {
    kind: "ratios",
    parts: parts.map((d) => d.agent),
    ratios: last2.useBase ? ratiosToBaseForm(ratios) : ratios,
    whole: last2.whole
  };
}
function toRatios(parts, last2) {
  const result = toRatiosEx(parts, last2);
  return {
    question: `Vyj\xE1d\u0159i pom\u011Brem mezi ${result.parts.join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `${last2.useBase ? parts.map((d) => d.quantity).map((d) => formatNumber(d)).join(":") : ""}`, result: result.ratios.map((d) => formatNumber(d)).join(":"), ok: true }
    ] : []
  };
}
function evalToQuantityEx(a, b) {
  const quantities = a.map((d) => d.quantity);
  const variables = extractDistinctWords(b.expression);
  if (!areNumbers(quantities)) {
    throw `evalToQuantity does not support non quantity types. ${quantities}`;
  }
  const context = quantities.reduce((out, d, i) => {
    out[variables[i]] = d;
    return out;
  }, {});
  return {
    ...b.predicate,
    quantity: helpers.evalExpression(b.expression, context)
  };
}
var preservedWords = ["sqrt", "closeTo"];
function extractDistinctWords(str) {
  const matches = str.match(/[a-zA-Z]+/g) || [];
  return [...new Set(matches)].filter((d) => !preservedWords.includes(d));
}
function evalToQuantity(a, b) {
  const result = evalToQuantityEx(a, b);
  return {
    question: `Vypo\u010Dti v\xFDraz ${b.expression}?`,
    result,
    options: []
  };
}
function simplifyExprRuleAsRatioEx(a, b) {
  if (isNumber(a.ratio)) {
    throw `simplifyExpr does not support quantity types`;
  }
  return {
    ...a,
    ratio: helpers.evalExpression(a.ratio, b.context)
  };
}
function simplifyExprRuleAsQuantiyEx(a, b) {
  if (isNumber(a.quantity)) {
    throw `simplifyExpr does not support quantity types`;
  }
  return {
    ...a,
    quantity: helpers.evalExpression(a.quantity, b.context)
  };
}
function simplifyExprAsRule(a, b) {
  const result = isQuantityPredicate(a) ? simplifyExprRuleAsQuantiyEx(a, b) : simplifyExprRuleAsRatioEx(a, b);
  return {
    question: `Zjednodu\u0161 v\xFDraz dosazen\xEDm ${JSON.stringify(b.context)} ?`,
    result,
    options: []
  };
}
function evalToOptionEx(a, b) {
  let valueToEval = a.quantity ?? a.ratio;
  if (isExpressionNode(valueToEval)) {
    valueToEval = helpers.evalExpression(valueToEval.expression, valueToEval.context);
  }
  if (!isNumber(valueToEval)) {
    throw `evalToQuantity does not support non quantity types. ${JSON.stringify(valueToEval)}`;
  }
  if (a.kind == "comp-ratio" && valueToEval > 1 / 2 && valueToEval < 2) {
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
function evalToOption(a, b) {
  const result = evalToOptionEx(a, b);
  return {
    question: b.optionValue != null ? `Vyhodno\u0165 volbu [${b.optionValue}]?` : `Vyhodno\u0165 v\xFDraz ${b.expressionNice}?`,
    result,
    options: []
  };
}
function partToPartRuleEx(a, partToPartRatio, nth) {
  if (!(partToPartRatio.whole != null && matchAgent(partToPartRatio.whole, a) || partToPartRatio.parts.some((d) => matchAgent(d, a)))) {
    throw `Mismatch agent ${[a.agent, a.entity].join()} any of ${[partToPartRatio.whole].concat(partToPartRatio.parts).join()}`;
  }
  const sourcePartIndex = partToPartRatio.parts.findIndex((d) => matchAgent(d, a));
  const targetPartIndex = nth != null ? partToPartRatio.parts.findIndex((d) => d === nth.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;
  const matchedWhole = matchAgent(partToPartRatio.whole, a);
  return {
    ...a,
    agent: (matchedWhole || nth != null) && targetPartIndex != -1 ? partToPartRatio.parts[targetPartIndex] : partToPartRatio.whole,
    quantity: matchedWhole ? areNumbers(partToPartRatio.ratios) && isNumber(a.quantity) ? a.quantity / partToPartRatio.ratios.reduce((out, d) => out += d, 0) * partToPartRatio.ratios[targetPartIndex] : wrapToQuantity(`a.quantity / (${partToPartRatio.ratios.map((d, i) => `b.ratios[${i}]`).join(" + ")}) * b.ratios[${targetPartIndex}]`, { a, b: partToPartRatio }) : areNumbers(partToPartRatio.ratios) && isNumber(a.quantity) ? a.quantity / partToPartRatio.ratios[sourcePartIndex] * (nth != null ? partToPartRatio.ratios[targetPartIndex] : partToPartRatio.ratios.reduce((out, d) => out += d, 0)) : nth != null ? wrapToQuantity(`a.quantity / b.ratios[${sourcePartIndex}] * b.ratios[${targetPartIndex}]`, { a, b: partToPartRatio }) : wrapToQuantity(`a.quantity / b.ratios[${sourcePartIndex}] * (${partToPartRatio.ratios.map((d, i) => `b.ratios[${i}]`).join(" + ")})`, { a, b: partToPartRatio })
  };
}
function partToPartRule(a, partToPartRatio, nth) {
  const result = partToPartRuleEx(a, partToPartRatio, nth);
  const matchedWhole = matchAgent(partToPartRatio.whole, a);
  let sourcePartIndex = partToPartRatio.parts.findIndex((d) => matchAgent(d, a));
  const targetPartIndex = nth != null ? partToPartRatio.parts.findIndex((d) => d === nth.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;
  if (sourcePartIndex == -1)
    sourcePartIndex = 0;
  const partsSum = `(${partToPartRatio.ratios.join(" + ")})`;
  return {
    question: result.kind === "rate" ? `${computeQuestion(result.quantity)} ${result.agent}` : containerQuestion(result),
    result,
    options: areNumbers(partToPartRatio.ratios) && isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} / ${partsSum} * ${formatNumber(partToPartRatio.ratios[targetPartIndex])}`, result: formatNumber(result.quantity), ok: matchedWhole },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(partToPartRatio.ratios[sourcePartIndex])} * ${nth != null ? partToPartRatio.ratios[targetPartIndex] : partsSum}`, result: formatNumber(result.quantity), ok: !matchedWhole }
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
function balancedPartitionRuleEx(a, balanced, nth) {
  if (!isNumber(a.quantity)) {
    throw "balancedPartitionRule is not supported by non quantity types";
  }
  const index = nth?.agent != null ? balanced.parts.findIndex((d) => d === nth.agent) : balanced.parts.length - 1;
  if (index === -1) {
    throw `No part found ${nth?.agent ?? balanced.parts.length} - ${balanced.parts.join(",")}`;
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
function balancedPartitionRule(a, balanced, nth) {
  if (!isNumber(a.quantity)) {
    throw "balancedPartitionRule is not supported by non quantity types";
  }
  const result = balancedPartitionRuleEx(a, balanced, nth);
  return {
    question: containerQuestion(result),
    result,
    options: isNumber(a.quantity) && isNumber(result.quantity) ? [] : []
  };
}
function mapContByScale(target, factor, last2) {
  const inverse = last2.kind === "scale-invert";
  const quantity = isNumber(target.quantity) && isNumber(factor.quantity) ? inverse ? target.quantity * 1 / factor.quantity : target.quantity * factor.quantity : inverse ? wrapToQuantity("target.quantity * 1 / factor.quantity", { target, factor }) : wrapToQuantity("target.quantity * factor.quantity", { target, factor });
  const result = {
    ...target,
    agent: last2.agent ?? target.agent,
    quantity
  };
  return {
    question: isNumber(factor.quantity) ? `${factor.quantity > 1 ? "Zv\u011Bt\u0161i" : "Zmen\u0161i"} ${factor.quantity} kr\xE1t ${target.agent}.` : `${computeQuestion(result.quantity)}`,
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
  const quantity = inverse ? 1 / factor.quantity : factor.quantity;
  const result = mapRatiosByFactorEx(multi, quantity);
  return {
    question: `${quantity > 1 ? "Rozn\xE1sob " : "Zkra\u0165 "} pom\u011Br \u010D\xEDslem ${quantity > 1 ? formatNumber(quantity) : formatNumber(1 / quantity)}`,
    result,
    options: []
  };
}
function nthPartFactorByEx(multi, factor, nthPart) {
  if (!areNumbers(multi.ratios) || !isNumber(factor)) {
    throw "ratios are not supported by non quantity types";
  }
  if (factor < 1) {
    throw `Ratios can be only extended by positive quantity ${factor}.`;
  }
  const partIndex = multi.parts.indexOf(nthPart.agent);
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
function nthPartFactorBy(multi, factor, nthPart) {
  if (!areNumbers(multi.ratios) || !isNumber(factor.quantity)) {
    throw "ratios are not supported by non quantity types";
  }
  const result = nthPartFactorByEx(multi, factor.quantity, nthPart);
  return {
    question: `Roz\u0161\xED\u0159it pom\u011Br o ${nthPart.agent} ${formatNumber(factor.quantity)} kr\xE1t ${formatEntity(factor.kind === "rate" ? factor.entity : factor)}`,
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
function nthTermExpressionRuleEx(a, b) {
  if (!isNumber(a.quantity)) {
    throw "nthTermExpressionRule are not supported by non quantity types";
  }
  return evalToQuantityEx([a], {
    predicate: {
      kind: "cont",
      agent: a.agent,
      entity: b.entity
    },
    expression: b.nthTerm
  });
}
function nthTermRule(a, b) {
  const result = b.kind === "pattern" ? nthTermExpressionRuleEx(a, b) : nthTermRuleEx(a, b);
  return {
    question: `Vypo\u010Dti ${result.entity}?`,
    result,
    options: isNumber(a.quantity) && isNumber(result.quantity) ? [
      { tex: b.kind === "pattern" ? b.nthTerm : formatSequence(b.type, a.quantity), result: formatNumber(result.quantity), ok: true }
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
function nthPositionExpressionRuleEx(a, b, newEntity = "nth") {
  if (!isNumber(a.quantity)) {
    throw "nthPositionExpressionRuleEx are not supported by non quantity types";
  }
  return evalToQuantityEx([a], {
    predicate: {
      kind: "cont",
      agent: a.agent,
      entity: newEntity
    },
    expression: b.nthPosition
  });
}
function nthPositionRule(a, b, newEntity = "nth") {
  const result = b.kind === "pattern" ? nthPositionExpressionRuleEx(a, b, newEntity) : nthPositionRuleEx(a, b, newEntity);
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
function isEntityBase(value) {
  return value.entity != null;
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
    question: last2.kind === "cont" ? containerQuestion(last2) : last2.kind === "comp" ? `${computeQuestion(last2.quantity)} porovn\xE1n\xED ${last2.agentA} a ${last2.agentB}` : last2.kind === "ratio" ? `Vyj\xE1d\u0159i jako pom\u011Br ${last2.part} k ${last2.whole}` : "Co lze vyvodit na z\xE1klad\u011B zadan\xFDch p\u0159edpoklad\u016F?",
    result: last2,
    options: []
  } : result;
}
function inferenceRuleEx(...args) {
  const [a, b, ...rest] = args;
  const last2 = rest?.length > 0 ? rest[rest.length - 1] : null;
  const kind = last2?.kind;
  if (["sum-combine", "sum", "product-combine", "product", "gcd", "lcd", "sequence", "tuple", "eval-expr", "alligation"].includes(last2?.kind) || last2?.kind === "ratios" && args.length > 3) {
    const arr = [a, b].concat(rest.slice(0, -1));
    return last2.kind === "sequence" ? sequenceRule(arr) : last2.kind === "gcd" ? gcdRule(arr, last2) : last2.kind === "lcd" ? lcdRule(arr, last2) : last2.kind === "eval-expr" ? evalToQuantity(arr, last2) : last2.kind === "tuple" ? tupleRule(arr) : ["product-combine", "product"].includes(last2.kind) ? productRule(arr, last2) : ["sum-combine", "sum"].includes(last2.kind) ? sumRule(arr, last2) : last2.kind === "ratios" ? toRatios(arr, last2) : last2.kind === "alligation" ? alligationRule(arr, last2) : null;
  } else if (a.kind === "eval-option" || b.kind === "eval-option") {
    return a.kind === "eval-option" ? evalToOption(b, a) : b.kind === "eval-option" ? evalToOption(a, b) : null;
  } else if (a.kind === "cont" && b.kind == "cont") {
    return kind === "comp-diff" ? toComparisonDiff(a, b) : kind === "scale" || kind === "scale-invert" ? mapContByScale(a, b, last2) : kind === "slide" || kind === "slide-invert" ? toSlide(a, b, last2) : kind === "diff" ? toDifference(a, b, last2) : kind === "quota" ? toQuota(a, b) : kind === "delta" ? toDelta(a, b, last2) : kind === "pythagoras" ? pythagorasRule(a, b, last2) : kind === "triangle-angle" ? triangleAngleRule(a, b, last2) : kind === "rate" ? toRate(a, b, last2) : kind === "ratios" ? toRatios([a, b], last2) : kind === "comp-ratio" ? toRatioComparison(a, b, last2) : kind === "ratio" ? toPartWholeRatio(a, b, last2) : kind === "linear-equation" ? solveEquation(a, b, last2) : toComparison(a, b);
  } else if ((a.kind === "comp-ratio" || a.kind === "cont") && b.kind === "simplify-expr") {
    return simplifyExprAsRule(a, b);
  } else if (a.kind === "simplify-expr" && (b.kind === "comp-ratio" || b.kind === "cont")) {
    return simplifyExprAsRule(b, a);
  } else if (a.kind === "cont" && b.kind === "eval-expr") {
    return evalToQuantity([a], b);
  } else if (a.kind === "eval-expr" && b.kind === "cont") {
    return evalToQuantity([b], a);
  } else if (a.kind === "rate" && b.kind === "rate" && last2?.kind === "ratios") {
    return toRatios([a, b], last2);
  } else if (a.kind === "rate" && b.kind === "rate" && last2?.kind === "linear-equation") {
    return solveEquation(a, b, last2);
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
  } else if (a.kind === "convert-percent" && b.kind === "ratio") {
    return toRatio(b);
  } else if (a.kind === "ratio" && b.kind === "convert-percent") {
    return toRatio(a);
  } else if (a.kind === "ratio" && b.kind === "ratio") {
    return kind === "diff" ? toDifferenceAsRatio(a, b, last2) : kind === "comp-ratio" ? toComparisonRatio(a, b) : transitiveRatioRule(a, b);
  } else if (a.kind === "comp" && b.kind === "cont") {
    return kind === "comp-part-eq" ? partEqual(a, b) : compareRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp") {
    return kind === "comp-part-eq" ? partEqual(b, a) : compareRule(a, b);
  } else if ((a.kind === "cont" || a.kind === "quota") && b.kind == "rate") {
    return rateRule(a, b);
  } else if (a.kind === "rate" && (b.kind == "cont" || b.kind === "quota")) {
    return rateRule(b, a);
  } else if (a.kind === "comp" && b.kind == "comp-ratio") {
    return kind === "comp" ? toCompRule(a, b) : compRatioToCompRule(b, a, kind === "nth-part" && last2);
  } else if (a.kind === "comp-ratio" && b.kind == "comp") {
    return kind === "comp" ? toCompRule(b, a) : compRatioToCompRule(a, b, kind === "nth-part" && last2);
  } else if (a.kind === "comp" && b.kind == "ratios") {
    return compRatiosToCompRule(b, a, kind === "nth-part" && last2);
  } else if (a.kind === "ratios" && b.kind == "comp") {
    return compRatiosToCompRule(a, b, kind === "nth-part" && last2);
  } else if (a.kind === "ratios-invert" && b.kind == "ratios") {
    return invertRatiosRule(b, a);
  } else if (a.kind === "ratios" && b.kind == "ratios-invert") {
    return invertRatiosRule(a, b);
  } else if (a.kind === "proportion" && b.kind == "ratios") {
    return proportionRatiosRule(b, a);
  } else if (a.kind === "ratios" && b.kind == "proportion") {
    return proportionRatiosRule(a, b);
  } else if (a.kind === "proportion" && b.kind == "comp-ratio") {
    return proportionRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind == "proportion") {
    return proportionRule(a, b);
  } else if (a.kind === "cont" && b.kind == "quota") {
    return kind === "rate" ? toRate(a, b, last2) : quotaRule(a, b);
  } else if (a.kind === "quota" && b.kind == "cont") {
    return kind === "rate" ? toRate(b, a, last2) : quotaRule(b, a);
  } else if (a.kind === "comp-ratio" && (b.kind === "cont" || b.kind === "rate")) {
    return ratioCompareRule(b, a, kind === "nth-part" && last2);
  } else if ((a.kind === "cont" || a.kind === "rate") && b.kind === "comp-ratio") {
    return ratioCompareRule(a, b, kind === "nth-part" && last2);
  } else if (a.kind === "comp-ratio" && b.kind === "convert-percent") {
    return convertPercentRule(a);
  } else if (a.kind === "convert-percent" && b.kind === "comp-ratio") {
    return convertPercentRule(b);
  } else if (a.kind === "complement-comp-ratio" && b.kind === "ratio") {
    return convertRatioToCompRatio(b, a);
  } else if (a.kind === "ratio" && b.kind === "complement-comp-ratio") {
    return convertRatioToCompRatio(a, b);
  } else if (a.kind === "comp-ratio" && b.kind === "ratio") {
    return comparisonRatioRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "comp-ratio") {
    return comparisonRatioRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "ratios") {
    return a.ratio == null ? convertRatiosToCompRatio(b, a) : convertToPartToPartRatios(a, b, kind === "ratios-base" && last2);
  } else if (a.kind === "ratios" && b.kind === "comp-ratio") {
    return b.ratio == null ? convertRatiosToCompRatio(a, b) : convertToPartToPartRatios(b, a, kind === "ratios-base" && last2);
  } else if (a.kind === "comp-ratio" && b.kind === "reverse-comp-ratio") {
    return reverseCompRatio(a);
  } else if (a.kind === "reverse-comp-ratio" && b.kind === "comp-ratio") {
    return reverseCompRatio(b);
  } else if (a.kind === "comp-ratio" && b.kind === "comp-ratio") {
    return kind === "diff" ? toDifferenceAsRatio(a, b, last2) : comparisonRatioTransitiveRule(a, b);
  } else if (a.kind === "cont" && b.kind === "ratio") {
    return partToWholeRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "cont") {
    return partToWholeRule(b, a);
  } else if (a.kind === "complement" && b.kind === "ratio") {
    return ratioComplementRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "complement") {
    return ratioComplementRule(b, a);
  } else if (a.kind === "nth-part" && b.kind === "ratios") {
    return kind === "ratio" ? ratiosConvertRule(a, b, last2) : null;
  } else if (a.kind === "ratios" && b.kind === "nth-part") {
    return kind === "ratio" ? ratiosConvertRule(b, a, last2) : null;
  } else if (a.kind === "rate" && b.kind == "ratios") {
    return kind === "nth-factor" ? nthPartFactorBy(b, a, last2) : partToPartRule(a, b, kind === "nth-part" && last2);
  } else if (a.kind === "ratios" && b.kind == "rate") {
    return kind === "nth-factor" ? nthPartFactorBy(a, b, last2) : partToPartRule(b, a, kind === "nth-part" && last2);
  } else if (a.kind === "cont" && b.kind == "balanced-partition") {
    return balancedPartitionRule(a, b, kind === "nth-part" && last2);
  } else if (a.kind === "balanced-partition" && b.kind == "cont") {
    return balancedPartitionRule(b, a, kind === "nth-part" && last2);
  } else if (a.kind === "cont" && b.kind == "ratios") {
    return kind === "scale" ? mapRatiosByFactor(b, a) : kind === "scale-invert" ? mapRatiosByFactor(b, a, true) : kind === "nth-factor" ? nthPartFactorBy(b, a, last2) : kind === "nth-part" ? partToPartRule(a, b, last2) : partToPartRule(a, b);
  } else if (a.kind === "ratios" && b.kind == "cont") {
    return kind === "scale" ? mapRatiosByFactor(a, b) : kind === "scale-invert" ? mapRatiosByFactor(a, b, true) : kind === "nth-factor" ? nthPartFactorBy(a, b, last2) : kind === "nth-part" ? partToPartRule(b, a, last2) : partToPartRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-diff") {
    return diffRule(a, b);
  } else if (a.kind === "comp-diff" && b.kind === "cont") {
    return diffRule(b, a);
  } else if (a.kind === "sequence" && b.kind === "cont") {
    return kind === "nth" ? nthPositionRule(b, a, last2.entity) : nthTermRule(b, a);
  } else if (a.kind === "cont" && b.kind === "sequence") {
    return kind === "nth" ? nthPositionRule(a, b, last2.entity) : nthTermRule(a, b);
  } else if (a.kind === "pattern" && b.kind === "cont") {
    return kind === "nth" ? nthPositionRule(b, a, last2.entity) : nthTermRule(b, a);
  } else if (a.kind === "cont" && b.kind === "pattern") {
    return kind === "nth" ? nthPositionRule(a, b, last2.entity) : nthTermRule(a, b);
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
function ratiosToBaseForm(ratios) {
  let precision = 1e6;
  let nums = ratios.map((r) => Math.round(r * precision));
  function gcd2(a, b) {
    return b === 0 ? a : gcd2(b, a % b);
  }
  let overallGCD = nums.reduce((a, b) => gcd2(a, b));
  return nums.map((v) => v / overallGCD);
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
    const cont = thisABS["toContinued"]();
    for (let i = 1; i < cont.length; i++) {
      let s = newFraction(cont[i - 1], C_ONE);
      for (let k = i - 2; k >= 0; k--) {
        s = s["inverse"]()["add"](cont[k]);
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
      const measure6 = this.measureData[origin.measure];
      const anchors = measure6.anchors;
      if (anchors == null) {
        throw new MeasureStructureError(`Unable to convert units. Anchors are missing for "${origin.measure}" and "${destination.measure}" measures.`);
      }
      const anchor = anchors[origin.system];
      if (anchor == null) {
        throw new MeasureStructureError(`Unable to find anchor for "${origin.measure}" to "${destination.measure}". Please make sure it is defined.`);
      }
      const transform = (_a = anchor[destination.system]) === null || _a === void 0 ? void 0 : _a.transform;
      const ratio = (_b = anchor[destination.system]) === null || _b === void 0 ? void 0 : _b.ratio;
      if (typeof transform === "function") {
        result = transform(result);
      } else if (typeof ratio === "number") {
        result *= ratio;
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
      for (const [name, measure6] of Object.entries(this.measureData)) {
        for (const [systemName, units] of Object.entries(measure6.systems)) {
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
      const measure6 = this.measureData[measureName];
      for (const [systemName, units] of Object.entries(measure6.systems)) {
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
    for (const measure6 of Object.values(this.measureData)) {
      for (const systems of Object.values(measure6.systems)) {
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
    for (const measure6 of list_measures) {
      const systems = this.measureData[measure6].systems;
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
  for (const [measureName, measure6] of Object.entries(measures)) {
    for (const [systemName, system] of Object.entries(measure6.systems)) {
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
  var sum = 0;
  var larg = 0;
  for (var i = 0; i < arguments.length; i++) {
    var arg = Math.abs(arguments[i]);
    var div2;
    if (larg < arg) {
      div2 = larg / arg;
      sum = sum * div2 * div2 + 1;
      larg = arg;
    } else if (arg > 0) {
      div2 = arg / larg;
      sum += div2 * div2;
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
function recurExpr(node, level, requiredLevel = 0) {
  const quantity = node.quantity ?? node.ratio ?? {};
  const { context, expression } = quantity;
  if (expression) {
    let expr = parser.parse(expression);
    const variables = expr.variables();
    for (let variable of variables) {
      const res = recurExpr(context[variable], level + 1, requiredLevel);
      if (res.substitute != null) {
        expr = parser.parse(cleanUpExpression(expr, variable));
        expr = expr.substitute(variable, res);
        if (level >= requiredLevel) {
          expr = expr.simplify();
        }
      } else {
        const q = res.quantity ?? res.ratio;
        if (typeof q == "number" || !isNaN(parseFloat(q))) {
          if (level >= requiredLevel) {
            expr = expr.simplify({ [variable]: res });
          } else {
            expr = parser.parse(cleanUpExpression(expr, variable));
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
function toEquationExpr(lastExpr, requiredLevel = 0) {
  const final = recurExpr({ quantity: lastExpr }, 0, requiredLevel);
  return parser.parse(cleanUpExpression(final));
}
function toEquationExprAsTex(lastExpr, requiredLevel = 0) {
  return `$ ${tokensToTex(toEquationExpr(lastExpr, requiredLevel).tokens)} $`;
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
          stack.push(`${a}${sym}${b}`);
        } else {
          const texOps = { "==": "=", "!=": "\\ne", "<=": "\\le", ">=": "\\ge" };
          stack.push(`${a} ${texOps[tok.value] || tok.value} ${b}`);
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
  time: time_default
});
configure({
  convertToFraction: (d) => new Fraction(d).toFraction(),
  convertToUnit: (d, from, to2) => convert(d).from(from).to(to2),
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
function inputLbl(value) {
  return {
    labelKind: "input",
    label: value
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
function toCont(child, { agent, entity }) {
  return toPredicate(child, mapToCont({ agent, entity }));
}
function toRate2(child, { agent, entity, entityBase }) {
  return to(child, {
    kind: "rate",
    agent,
    entity,
    entityBase,
    quantity: child.ratio,
    baseQuantity: 1,
    asRatio: true
  });
}
function mapToCont({ agent, entity }) {
  return (node) => {
    const typeNode = node;
    return {
      kind: "cont",
      agent,
      quantity: typeNode.quantity,
      entity: entity != null ? entity.entity : typeNode.kind == "quota" ? typeNode.agentQuota : typeNode.kind == "rate" ? typeNode.entity.entity : typeNode.entity,
      unit: entity != null ? entity.unit : typeNode.kind == "rate" ? typeNode.entity.unit : typeNode.kind == "quota" ? void 0 : typeNode.unit
    };
  };
}
function toPredicate(node, mapFn) {
  const nodeToMap = last(node);
  const newNode = mapFn(nodeToMap);
  return { children: [...node.children.slice(0, -1), newNode] };
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
function computeTreeMetrics(node, level = 0, levels = {}, predicates = []) {
  if (isPredicate(node)) {
    levels[level] = (levels[level] || 0) + 1;
    return { depth: level + 1, width: Math.max(...Object.values(levels)), predicates: predicates.includes(node.kind) ? predicates : predicates.concat(node.kind) };
  }
  if (node.children) {
    levels[level] = (levels[level] || 0) + 1;
    let maxDepth = level + 1;
    for (const child of node.children) {
      const metrics = computeTreeMetrics(child, level + 1, levels, predicates);
      predicates = metrics.predicates;
      maxDepth = Math.max(maxDepth, metrics.depth);
    }
    return { depth: maxDepth, width: Math.max(...Object.values(levels)), predicates };
  }
  return { depth: level, width: Math.max(...Object.values(levels)), predicates };
}
function jsonToMarkdownTree(node, level = 0) {
  const indent = "  ".repeat(level);
  let markdown = [];
  if (isPredicate(node)) {
    markdown.push(`${indent}- ${formatPredicate(node, mdFormatting)}
`);
    return markdown;
  }
  if (node.children && Array.isArray(node.children)) {
    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      const isConclusion = i === node.children.length - 1;
      if (isConclusion && node.context)
        markdown.push(`${indent}- ${node.context}
`);
      markdown = markdown.concat(jsonToMarkdownTree(child, level + (isConclusion ? 0 : 1)));
    }
  }
  return markdown;
}
var nextId = 0;
function jsonToMermaidMindMap(node) {
  nextId = 0;
  const result = ["mindmap\n"].concat(...jsonToMermaidMindMapEx(node, 0));
  return result;
}
function convertKindToIcon(predicate) {
  const kind = predicate?.kind?.toUpperCase();
  switch (kind) {
    case "CONT":
      return "fa fa-vector-square";
    case "RATIO":
      return "fa fa-percentage";
    case "COMP-RATIO":
      return "fa fa-compress-alt";
    case "COMP":
      return "fa fa-terminal";
    case "QUOTA":
      return "fa fa-object-ungroup";
    case "RATE":
      return "fa fa-layer-group";
    case "UNIT":
      return "fa fa-exchange-alt";
    default:
      return "fa fa-book";
  }
}
function jsonToMermaidMindMapEx(node, isConclusion, level = 0) {
  const indent = "  ".repeat(level);
  let markdown = [];
  if (isPredicate(node)) {
    const formatedPredicat = formatPredicate(node, mermaidFormatting).trim();
    if (formatedPredicat !== "") {
      if (isConclusion) {
        markdown.push(`${indent} id${++nextId}{{"${formatedPredicat}"}}
`);
      } else {
        markdown.push(`${indent} id${++nextId}))"${formatedPredicat}"((
`);
      }
      markdown.push(`${indent} ::icon(${convertKindToIcon(node)})
`);
    }
    return markdown;
  }
  if (node.children && Array.isArray(node.children)) {
    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      const isConclusion2 = i === node.children.length - 1;
      if (isConclusion2 && node.context)
        markdown.push(`${indent} id${++nextId}["${node.context}"]
`);
      markdown = markdown.concat(jsonToMermaidMindMapEx(child, isConclusion2, level + (isConclusion2 ? 0 : 1)));
    }
  }
  return markdown;
}
function deductionTreeToHierarchy(node, convertFn) {
  if (isPredicate(node)) {
    return convertFn != null ? convertFn(node) : node;
  }
  const childrenShapes = [];
  if (node.children && Array.isArray(node.children)) {
    for (let i = 0; i != node.children.length; i++) {
      const child = node.children[i];
      const childShape = deductionTreeToHierarchy(child, convertFn);
      childrenShapes.push(childShape);
    }
  }
  const predicates = childrenShapes.slice(0, -1);
  const conclusion = childrenShapes.slice(-1)[0];
  return {
    ...conclusion,
    children: predicates
  };
}
function jsonToTLDrawEx(node, isConclusion, level = 0) {
  const indent = "  ".repeat(level);
  let markdown = [];
  if (isPredicate(node)) {
    const formatedPredicat = formatPredicate(node, mermaidFormatting).trim();
    if (formatedPredicat !== "") {
      if (isConclusion) {
        markdown.push(`${indent} id${++nextId}{{"${formatedPredicat}"}}
`);
      } else {
        markdown.push(`${indent} id${++nextId}))"${formatedPredicat}"((
`);
      }
      markdown.push(`${indent} ::icon(${convertKindToIcon(node)})
`);
    }
    return markdown;
  }
  if (node.children && Array.isArray(node.children)) {
    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      const isConclusion2 = i === node.children.length - 1;
      if (isConclusion2 && node.context)
        markdown.push(`${indent} id${++nextId}["${node.context}"]
`);
      markdown = markdown.concat(jsonToMermaidMindMapEx(child, isConclusion2, level + (isConclusion2 ? 0 : 1)));
    }
  }
  return markdown;
}
function jsonToMarkdownChat(node) {
  const flatStructure = [];
  function traverseEx(node2) {
    const args = [];
    if (isPredicate(node2)) {
      return node2;
    }
    let q = null;
    if (node2.children && Array.isArray(node2.children)) {
      for (let i = 0; i != node2.children.length; i++) {
        const child = node2.children[i];
        const isConclusion = i === node2.children.length - 1;
        if (isConclusion) {
          const result = inferenceRuleWithQuestion2(mapNodeChildrenToPredicates(node2));
          q = result;
          if (node2.context) {
            args.push(node2.context);
          }
        } else {
          q = null;
        }
        const res = traverseEx(child);
        args.push(res);
      }
      const arr = normalizeToArray(args).map((d) => {
        return Array.isArray(d) ? d[d.length - 1] : d;
      });
      const premises = arr.slice(0, -1);
      const conclusion = arr[arr.length - 1];
      const answer = q?.options?.find((d) => d.ok);
      const formattedPremises = premises.map((d) => isPredicate(d) ? formatPredicate(d, chatFormattingFunc(0)) : d).filter((d) => !isEmptyOrWhiteSpace(d)).map((d) => `- ${d}`).join("\n");
      flatStructure.push((q != null ? q.question + `
${formattedPremises}

` + (answer != null ? `V\xFDpo\u010Det: ${answer.tex} = ${answer.result}` : "") : `${formattedPremises}`) + `

Z\xE1v\u011Br:${formatPredicate(conclusion, chatFormattingFunc(1))}

`);
    }
    return args;
  }
  traverseEx(node);
  return flatStructure;
}
function isEmptyOrWhiteSpace(value) {
  return value == null || typeof value === "string" && value.trim() === "";
}
function mapNodeChildrenToPredicates(node) {
  return node.children.map((d) => isPredicate(d) ? d : d.children.slice(-1)[0]);
}
var mdFormattingFunc = (requiredLevel) => ({
  compose: (strings, ...args) => concatString(strings, ...args),
  formatKind: (d) => `[${d.kind.toUpperCase()}]`,
  formatQuantity: (d) => {
    if (typeof d === "number") {
      return d.toLocaleString("cs-CZ");
    } else if (d?.expression != null) {
      return toEquationExprAsTex(d, requiredLevel);
    } else if (typeof d === "string") {
      return d;
    } else {
      return d;
    }
  },
  formatRatio: (d, asPercent) => {
    if (typeof d === "number") {
      return asPercent ? `${(d * 100).toLocaleString("cs-CZ")}%` : d.toLocaleString("cs-CZ");
    } else if (d?.expression != null) {
      return asPercent ? toEquationExprAsTex({ ...d, expression: `(${d.expression}) * 100` }, requiredLevel) : toEquationExprAsTex(d, requiredLevel);
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
var chatFormattingFunc = (requiredLevel) => ({
  ...mdFormattingFunc(requiredLevel),
  formatKind: () => ``,
  formatTable: (d) => `vzor opakov\xE1n\xED 

${mdFormatTable(d)}`
});
function mdFormatTable(data) {
  if (!Array.isArray(data) || data.length === 0)
    return "";
  const header = data[0].map((d) => "");
  const rows = data;
  let markdown = "| " + header.join(" | ") + " |\n";
  markdown += "| " + header.map(() => "---").join(" | ") + " |\n";
  for (const row of rows) {
    markdown += "| " + row.join(" | ") + " |\n";
  }
  return markdown;
}
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
      result = compose`${formatAgent(d.agent)}=${d.asRatio ? formatRatio2(d.quantity) : formatQuantity(d.quantity)} ${formatEntity2(d.entity, d.unit)}`;
      break;
    case "comp":
      if (isNumber(d.quantity)) {
        result = d.quantity === 0 ? compose`${formatAgent(d.agentA)} je rovno ${formatAgent(d.agentB)}` : compose`${formatAgent(d.agentA)} ${d.quantity > 0 ? "v\xEDce" : "m\xE9n\u011B"} než ${formatAgent(d.agentB)} o ${formatQuantity(Math.abs(d.quantity))} ${formatEntity2(d.entity, d.unit)}`;
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
        result = between || d.asPercent ? compose`${formatAgent(d.agentA)} ${d.ratio < 1 ? "m\xE9n\u011B" : "v\xEDce"} o ${formatRatio2(d.ratio > 1 ? d.ratio - 1 : 1 - d.ratio, d.asPercent)} než ${formatAgent(d.agentB)} ` : compose`${formatAgent(d.agentA)} ${formatRatio2(d.ratio > 1 ? Math.abs(d.ratio) : 1 / Math.abs(d.ratio), false)} krát ${d.ratio > 1 ? "v\xEDce" : "m\xE9n\u011B"} než ${formatAgent(d.agentB)} `;
      } else {
        result = compose`poměr ${formatQuantity(d.ratio)} mezi ${formatAgent(d.agentA)} a ${formatAgent(d.agentB)}`;
      }
      break;
    case "comp-diff":
      result = compose`${formatAgent(d.agentMinuend)} - ${formatAgent(d.agentSubtrahend)}=${formatQuantity(d.quantity)} ${formatEntity2(d.entity, d.unit)}`;
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
      result = compose`${formatAgent(d.agent)} ${d.asRatio ? formatRatio2(d.quantity) : formatQuantity(d.quantity)} ${formatEntity2(d.entity.entity, d.entity.unit)} per ${isNumber(d.baseQuantity) && d.baseQuantity == 1 ? "" : formatQuantity(d.baseQuantity)} ${formatEntity2(d.entityBase.entity, d.entityBase.unit)}`;
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
      const { predicate, expression } = d;
      result = predicate.kind === "cont" ? compose`${formatAgent(predicate.agent)} = [${expression}] ${formatEntity2(predicate.entity, predicate.unit)}` : predicate.kind === "rate" ? compose`${formatAgent(predicate.agent)} [${expression}] ${formatEntity2(predicate.entity.entity, predicate.entity.unit)} per ${isNumber(predicate.baseQuantity) && predicate.baseQuantity == 1 ? "" : formatQuantity(predicate.baseQuantity)} ${formatEntity2(predicate.entityBase.entity, predicate.entityBase.unit)}` : compose`${expression}`;
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
function highlight(strings, ...substitutions) {
  const formattedString = strings.reduce((acc, curr, i) => {
    const substitution = substitutions[i];
    const res = substitution && typeof substitution === "function" ? `${curr}${substitution(concatString)}` : substitution ? `${curr}*${substitution}*` : `${curr}`;
    return `${acc}${res}`;
  }, "");
  return formattedString;
}
function concatString(strings, ...substitutions) {
  const formattedString = strings.reduce((acc, curr, i) => {
    const substitution = substitutions[i];
    const res = substitution ? `${curr}${Array.isArray(substitution) ? substitution.join("") : substitution}` : curr;
    return `${acc}${res}`;
  }, "");
  return formattedString;
}
function normalizeToArray(d) {
  return Array.isArray(d) ? d : [d];
}
function wordProblemGroupById(wordProblem) {
  const deductionTrees = Object.entries(wordProblem).reduce((out, [key, value], index) => {
    out.push({
      key,
      deductionTrees: [`\u0158e\u0161en\xED ${key}`, value.deductionTree]
    });
    return out;
  }, []);
  return Object.groupBy(deductionTrees, ({ key }) => parseInt(key.split(".")[0]));
}
function generateAIMessages({ template, deductionTrees }) {
  const alternateMessage = `
Zad\xE1n\xED \xFAlohy je 

${template}

\u0158e\u0161en\xED \xFAlohy je pops\xE1no heslovit\u011B po jednotliv\xFDch kroc\xEDch. Spr\xE1vn\xFD v\xFDsledek je uveden jako posledn\xED krok.
Jednotliv\xE9 kroky jsou odd\u011Bleny horizont\xE1ln\xED \u010D\xE1rou. Pod\xFAlohy jsou odd\u011Bleny dvojitou horizont\xE1ln\xED \u010D\xE1rou.


${deductionTrees.map(([title, deductionTree]) => `${title} 

 ${jsonToMarkdownChat(deductionTree).join("\n---\n")}`).join("\n---\n---\n")}`;
  const explainSolution = `${alternateMessage}
M\u016F\u017Ee\u0161 vysv\u011Btlit podrobn\xE9 \u0159e\u0161en\xED krok po kroku v \u010De\u0161tin\u011B. Vysv\u011Btluj ve stejn\xFDch kroc\xEDch jako je uvedeno v heslovit\xE9m \u0159e\u0161en\xED.`;
  const vizualizeSolution = `${alternateMessage}
M\u016F\u017Ee\u0161 vytvo\u0159it vizualizaci, kter\xE1 popisuje situaci, resp. \u0159e\u0161en\xED ve form\u011B obr\xE1zku. Nap\u0159. ve form\u011B p\u0159ehledn\xE9 infografiky.`;
  const generateMoreQuizes = `${alternateMessage}
M\u016F\u017Ee\u0161 vymyslet novou \xFAlohu v jin\xE9 dom\xE9n\u011B, kter\xE1 p\u016Fjde \u0159e\u0161it stejn\xFDm postupem \u0159e\u0161en\xED 
- zm\u011Bnit agent - identifikov\xE1ny pomoc\xED markdown bold **
- zm\u011Bna entit - identifikace pomoc\xED markdown bold __
- zm\u011Bnu parametry \xFAlohy - identifikov\xE1ny pomoc\xED italic *

Zm\u011Bn agenty, entity a parametry \xFAlohy tak aby byly z jin\xE9, pokud mo\u017Eno netradi\u010Dn\xED dom\xE9ny.
Pou\u017Eij jin\xE9 vstupn\xED parametry tak, aby v\xFDsledek byl jin\xE1 hodnota, kter\xE1 je mo\u017En\xE1 a pravd\u011Bpodobn\xE1 v re\xE1ln\xE9m sv\u011Bt\u011B.
Vygeneruj 3 r\u016Fzn\xE9 \xFAlohy v \u010De\u0161tin\u011B. Nevracej zp\u016Fsob \u0159e\u0161en\xED, kroky \u0159e\u0161en\xED.
`;
  const generalization = `${alternateMessage}
M\u016F\u017Ee\u0161 vymyslet nov\xE9 \xFAlohu v jin\xE9 dom\xE9n\u011B, kter\xE1 p\u016Fjde \u0159e\u0161it stejn\xFDm postupem \u0159e\u0161en\xED 
- zm\u011Bnit agent - identifikov\xE1ny pomoc\xED markdown bold **
- zm\u011Bna entit - identifikace pomoc\xED markdown bold __
- zm\u011Bnu parametry \xFAlohy - identifikov\xE1ny pomoc\xED italic *

Nad t\u011Bmito \xFAlohami prov\xE9st systematickou generalizaci v\u0161ech prvk\u016F (agenty, entity a \u010D\xEDseln\xE9 \xFAdaje),kter\xE9 jsou v t\u011Bchto \xFAloh\xE1ch spole\u010Dn\xE9.
Vyto\u0159it abstraktn\xED pojmenov\xE1n\xED a strukturu, kter\xE1 m\u016F\u017Ee slou\u017Eit jako univerz\xE1ln\xED r\xE1mec pro tvorbu dal\u0161\xEDch \xFAloh podobn\xE9ho typu.
Nevracej konkr\xE9tn\xED \xFAlohy, ale jen generalizovan\xFD r\xE1mec.
`;
  const generateSubQuizes = `${alternateMessage}
M\u016F\u017Ee\u0161 vytvo\u0159it pracovn\xED list, kter\xFD by obsahoval vhodn\xE9 pod\xFAlohy, kter\xE9 jsou vhodn\xE9 pro \u0159e\u0161en\xED st\xE1vaj\xEDc\xED \xFAlohy.
`;
  const generateImportantPoints = `${alternateMessage}
M\u016F\u017Ee\u0161 analyzovat \xFAlohu a \u0159e\u0161en\xED \xFAlohy a naj\xEDt hlavn\xED my\u0161lenku, kter\xE1 vede k \u0159e\u0161en\xED st\xE1vaj\xEDc\xED \xFAlohy.
Uve\u010F 1 a\u017E maxim\xE1ln\u011B 3 nejd\u016Fle\u017Eit\u011Bj\u0161\xED my\u0161lenky, triky d\u016Fle\u017Eit\xE9 k pochopen\xED \u0159e\u0161en\xED \xFAlohy.
`;
  const vizualizeImportantPoints = `${alternateMessage}
M\u016F\u017Ee\u0161 analyzovat \xFAlohu a \u0159e\u0161en\xED \xFAlohy a naj\xEDt hlavn\xED my\u0161lenku, kter\xE1 vede k \u0159e\u0161en\xED st\xE1vaj\xEDc\xED \xFAlohy.
Dle slo\u017Eitosti \xFAlohy vymysli 1 a\u017E maxim\xE1ln\u011B 3 nejd\u016Fle\u017Eit\u011Bj\u0161\xED my\u0161lenky, triky d\u016Fle\u017Eit\xE9 k pochopen\xED \u0159e\u0161en\xED \xFAlohy.
Vizualizuj vhodn\u011B tyto my\u0161lenky do obr\xE1zku pomoc\xED infografiky s vhodn\xFDmi grafick\xFDmi prvky.
`;
  return {
    explainSolution,
    vizualizeSolution,
    generateMoreQuizes,
    generateSubQuizes,
    generalization,
    generateImportantPoints,
    vizualizeImportantPoints,
    "key-points": generateImportantPoints,
    "working-sheet": generateSubQuizes,
    "more-quizes": generateMoreQuizes,
    steps: explainSolution
  };
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
export {
  axiomInput,
  computeTreeMetrics,
  concatString,
  connectTo,
  createLazyMap,
  deduce,
  deduceAs,
  deduceLbl,
  deductionTreeToHierarchy,
  formatPredicate,
  generateAIMessages,
  highlight,
  inputLbl,
  isPredicate,
  jsonToMarkdownChat,
  jsonToMarkdownTree,
  jsonToMermaidMindMap,
  jsonToMermaidMindMapEx,
  jsonToTLDrawEx,
  last,
  lastQuantity,
  mapNodeChildrenToPredicates,
  mapToCont,
  mdFormatTable,
  to,
  toAs,
  toCont,
  toPredicate,
  toRate2 as toRate,
  wordProblemGroupById
};
/*!
 Based on ndef.parser, by Raphael Graf(r@undefined.ch)
 http://www.undefined.ch/mparser/index.html

 Ported to JavaScript and modified by Matthew Crumley (email@matthewcrumley.com, http://silentmatt.com/)

 You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
 to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
 but don't feel like you have to let me know or ask permission.
*/

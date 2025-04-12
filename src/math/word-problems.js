// src/components/math.ts
var defaultHelpers = {
  convertToFraction: (d) => d,
  convertToUnit: (d) => d,
  unitAnchor: () => 1
};
var helpers = defaultHelpers;
function configure(config) {
  helpers = { ...defaultHelpers, ...config };
}
function ctor(kind) {
  return { kind };
}
function ctorUnit(unit) {
  return { kind: "unit", unit };
}
function ctorPercent() {
  return { kind: "comp-ratio", asPercent: true };
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
function pi() {
  return { kind: "cont", agent: "PI", quantity: 3.14, entity: "" };
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
function compRelative(agentA, agentB, ratio4) {
  if (ratio4 <= -1 && ratio4 >= 1) {
    throw "Relative compare should be between (-1,1).";
  }
  return compRatio(agentA, agentB, 1 + ratio4);
}
function compRatio(agentA, agentB, ratio4) {
  return { kind: "comp-ratio", agentA, agentB, ratio: ratio4 };
}
function compPercent(agentA, agentB, percent2) {
  return { kind: "comp-ratio", agentA, agentB, ratio: percent2 / 100, asPercent: true };
}
function compDiff(agentMinuend, agentSubtrahend, quantity, entity3) {
  return { kind: "comp-diff", agentMinuend, agentSubtrahend, quantity, entity: entity3 };
}
function ratio(whole, part, ratio4) {
  return { kind: "ratio", whole, part, ratio: ratio4 };
}
function percent(whole, part, percent2) {
  return { kind: "ratio", whole, part, ratio: percent2 / 100, asPercent: true };
}
function ratios(whole, parts, ratios2) {
  return { kind: "ratios", parts, whole, ratios: ratios2 };
}
function sum(wholeAgent, partAgents, wholeEntity, partEntity) {
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
function rate(agent, quantity, entity3, entityBase) {
  return { kind: "rate", agent, quantity, entity: toEntity(entity3), entityBase: toEntity(entityBase) };
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
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  if (a.agent == b.agentB) {
    return { kind: "cont", agent: b.agentA, quantity: a.quantity + b.quantity, entity: a.entity, unit: a.unit };
  } else if (a.agent == b.agentA) {
    return { kind: "cont", agent: b.agentB, quantity: a.quantity + -1 * b.quantity, entity: a.entity, unit: a.unit };
  }
}
function compareRule(a, b) {
  const result = compareRuleEx(a, b);
  return {
    question: `Vypo\u010Dti ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity(result)}?`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? " + " : " - "} ${formatNumber(Math.abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentB },
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? " - " : " + "} ${formatNumber(Math.abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentA }
    ]
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
    options: [
      { tex: `90 - ${a.quantity}`, result: formatNumber(result.quantity), ok: b.relationship == "complementary" },
      { tex: `180 - ${a.quantity}`, result: formatNumber(result.quantity), ok: b.relationship == "supplementary" || b.relationship == "sameSide" },
      { tex: `${a.quantity}`, result: formatNumber(result.quantity), ok: b.relationship != "supplementary" && b.relationship != "complementary" && b.relationship != "sameSide" }
    ]
  };
}
function toComparisonAsRatioEx(a, b) {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole}`;
  }
  return { kind: "comp-ratio", agentB: b.part, agentA: a.part, ratio: 1 + (a.ratio - b.ratio) };
}
function toComparisonAsRatio(a, b) {
  const result = toComparisonAsRatioEx(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik?`,
    result,
    options: [
      { tex: `1 + (${formatRatio(a.ratio)} - ${formatRatio(b.ratio)})`, result: formatRatio(result.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} - ${formatRatio(a.ratio)}`, result: formatRatio(result.ratio), ok: false }
    ]
  };
}
function toComparisonRatioEx(a, b) {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole}`;
  }
  return { kind: "comp-ratio", agentB: b.part, agentA: a.part, ratio: a.ratio / b.ratio };
}
function toComparisonRatio(a, b) {
  const result = toComparisonRatioEx(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. Kolikr\xE1t?`,
    result,
    options: [
      { tex: `${formatRatio(a.ratio)} / ${formatRatio(b.ratio)}`, result: formatRatio(a.ratio / b.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} / ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio / a.ratio), ok: false }
    ]
  };
}
function comparisonRatioRuleEx(b, a) {
  if (!(a.part == b.agentA || a.part == b.agentB)) {
    throw `Mismatch agent ${a.part} any of ${b.agentA}, ${b.agentB}`;
  }
  if (a.part == b.agentB) {
    return { kind: "ratio", whole: a.whole, part: b.agentA, ratio: b.ratio >= 0 ? a.ratio * b.ratio : a.ratio / Math.abs(b.ratio) };
  } else if (a.part == b.agentA) {
    return { kind: "ratio", whole: a.whole, part: b.agentB, ratio: b.ratio > 0 ? a.ratio / b.ratio : a.ratio * Math.abs(b.ratio) };
  }
}
function comparisonRatioRule(b, a) {
  const result = comparisonRatioRuleEx(b, a);
  return {
    question: `Vypo\u010Dti ${a.part == b.agentB ? b.agentA : b.agentB}?`,
    result,
    options: [
      { tex: `${formatRatio(a.ratio)} * ${formatRatio(Math.abs(b.ratio))}`, result: formatRatio(a.ratio * b.ratio), ok: a.part == b.agentB && b.ratio >= 0 || a.part == b.agentA && b.ratio < 0 },
      { tex: `${formatRatio(a.ratio)} / ${formatRatio(Math.abs(b.ratio))}`, result: formatRatio(a.ratio / b.ratio), ok: a.part == b.agentA && b.ratio >= 0 || a.part == b.agentB && b.ratio < 0 }
    ]
  };
}
function comparisonRatiosRuleEx(b, a) {
  if (b.ratio >= 0) {
    return { kind: "ratios", whole: a.whole, parts: [b.agentA, b.agentB], ratios: [1 / Math.abs(b.ratio), 1] };
  } else {
    return { kind: "ratios", whole: a.whole, parts: [b.agentA, b.agentB], ratios: [1 / Math.abs(b.ratio), 1] };
  }
}
function comparisonRatiosRule(b, a) {
  const result = comparisonRatiosRuleEx(b, a);
  return {
    question: `P\u0159eve\u010F na pom\u011Br dvojice ${[b.agentA, b.agentB].join(":")}?`,
    result,
    options: [
      { tex: `(1 / ${formatRatio(Math.abs(b.ratio))}) ":" 1`, result: result.ratios.map((d) => formatRatio(d)).join(":"), ok: b.ratio >= 0 },
      { tex: `(1 / ${formatRatio(Math.abs(b.ratio))}) ":" 1`, result: result.ratios.map((d) => formatRatio(d)).join(":"), ok: b.ratio < 0 }
    ]
  };
}
function convertToUnitEx(a, b) {
  if (a.unit == null) {
    throw `Missing unit ${a.kind === "cont" ? a.agent : `${a.agentA} to ${a.agentB}`} a ${a.entity}`;
  }
  return { ...a, quantity: helpers.convertToUnit(a.quantity, a.unit, b.unit), unit: b.unit };
}
function convertToUnit(a, b) {
  const result = convertToUnitEx(a, b);
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
function ratioCompareRuleEx(a, b) {
  if (!(a.agent == b.agentA || a.agent == b.agentB)) {
    throw `Mismatch agent ${a.agent} any of ${b.agentA}, ${b.agentB}`;
  }
  if (a.agent == b.agentB) {
    return { kind: "cont", agent: b.agentA, quantity: b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / Math.abs(b.ratio), entity: a.entity, unit: a.unit };
  } else if (a.agent == b.agentA) {
    return { kind: "cont", agent: b.agentB, quantity: b.ratio > 0 ? a.quantity / b.ratio : a.quantity * Math.abs(b.ratio), entity: a.entity, unit: a.unit };
  }
}
function ratioCompareRule(a, b) {
  const result = ratioCompareRuleEx(a, b);
  return {
    question: `Vypo\u010Dti ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity(result)}?`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(Math.abs(b.ratio))}`, result: formatNumber(a.quantity * b.ratio), ok: a.agent == b.agentB && b.ratio >= 0 || a.agent == b.agentA && b.ratio < 0 },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(Math.abs(b.ratio))}`, result: formatNumber(a.quantity / b.ratio), ok: a.agent == b.agentA && b.ratio >= 0 || a.agent == b.agentB && b.ratio < 0 }
    ]
  };
}
function transferRuleEx(a, b, transferOrder) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const quantity = transferOrder === "before" ? a.agent == b.agentSender.name ? a.quantity + b.quantity : a.quantity - b.quantity : a.agent == b.agentSender.name ? a.quantity - b.quantity : a.quantity + b.quantity;
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
    question: `Vypo\u010Dti ${a.agent}${formatEntity(result)}?`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? " + " : " - "} ${formatNumber(Math.abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentReceiver.name },
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? " - " : " + "} ${formatNumber(Math.abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentSender.name }
    ]
  };
}
function ratioComplementRuleEx(a, b) {
  return {
    kind: "ratio",
    whole: b.whole,
    ratio: 1 - b.ratio,
    part: a.part,
    asPercent: b.asPercent
  };
}
function ratioComplementRule(a, b) {
  const result = ratioComplementRuleEx(a, b);
  return {
    question: `Vyj\xE1d\u0159i ${b.asPercent ? "procentem" : "pom\u011Brem"} ${result.part} z ${result.whole}?`,
    result,
    options: [
      { tex: `${formatRatio(1, b.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(1 - b.ratio, b.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false }
    ]
  };
}
function compRatioToCompRuleEx(a, b) {
  const agent = a.agentB === b.agentA ? b.agentA : b.agentB;
  const quantity = a.agentB === b.agentA ? -1 * b.quantity : b.quantity;
  if (quantity > 0 && a.ratio < 1 || quantity < 0 && a.ratio > 1) {
    throw `Uncompatible compare rules. Absolute compare ${quantity} between ${b.agentA} a ${b.agentB} does not match relative compare ${a.ratio}. `;
  }
  return {
    kind: "cont",
    agent,
    entity: b.entity,
    unit: b.unit,
    quantity: Math.abs(b.quantity / (a.ratio - 1))
  };
}
function compRatioToCompRule(a, b) {
  const result = compRatioToCompRuleEx(a, b);
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `${formatNumber(Math.abs(b.quantity))} / ${formatRatio(Math.abs(a.ratio - 1))}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(Math.abs(b.quantity))} / ${formatRatio(Math.abs(1 - a.ratio))}`, result: formatNumber(Math.abs(b.quantity / (1 - a.ratio))), ok: false }
    ]
  };
}
function proportionRuleEx(a, b) {
  return {
    ...a,
    ...b.inverse && { ratio: 1 / a.ratio }
  };
}
function proportionRule(a, b) {
  const result = proportionRuleEx(a, b);
  return {
    question: `Jak\xFD je vztah mezi veli\u010Dinami? ${b.entities?.join(" a ")}`,
    result,
    options: [
      { tex: `zachovat pom\u011Br`, result: formatRatio(a.ratio), ok: !b.inverse },
      { tex: `obr\xE1tit pom\u011Br - 1 / ${formatRatio(a.ratio)}`, result: formatRatio(1 / a.ratio), ok: b.inverse }
    ]
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
  return matchAgent(b.whole, a) ? { kind: "cont", agent: b.part, entity: a.entity, quantity: a.quantity * b.ratio } : { kind: "cont", agent: b.whole, entity: a.entity, quantity: a.quantity / b.ratio };
}
function partToWholeRule(a, b) {
  const result = partToWholeRuleEx(a, b);
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(b.ratio)}`, result: formatNumber(a.quantity * b.ratio), ok: matchAgent(b.whole, a) },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(b.ratio)}`, result: formatNumber(a.quantity / b.ratio), ok: !matchAgent(b.whole, a) }
    ]
  };
}
function rateRuleEx(a, rate3) {
  if (!(a.entity === rate3.entity.entity || a.entity === rate3.entityBase.entity)) {
    throw `Mismatch entity ${a.entity} any of ${rate3.entity.entity}, ${rate3.entityBase.entity}`;
  }
  const isEntityBase2 = a.entity == rate3.entity.entity;
  return {
    kind: "cont",
    agent: a.agent,
    entity: isEntityBase2 ? rate3.entityBase.entity : rate3.entity.entity,
    unit: isEntityBase2 ? rate3.entityBase.unit : rate3.entity.unit,
    quantity: a.entity == rate3.entity.entity ? a.quantity / rate3.quantity : a.quantity * rate3.quantity
  };
}
function rateRule(a, rate3) {
  const result = rateRuleEx(a, rate3);
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(rate3.quantity)}`, result: formatNumber(a.quantity * rate3.quantity), ok: a.entity !== rate3.entity.entity },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(rate3.quantity)}`, result: formatNumber(a.quantity / rate3.quantity), ok: a.entity === rate3.entity.entity }
    ]
  };
}
function quotaRuleEx(a, quota2) {
  if (!(a.agent === quota2.agent || a.agent === quota2.agentQuota)) {
    throw `Mismatch entity ${a.entity} any of ${quota2.agent}, ${quota2.agentQuota}`;
  }
  return {
    kind: "cont",
    agent: a.agent === quota2.agentQuota ? quota2.agent : quota2.agentQuota,
    entity: a.entity,
    quantity: a.agent === quota2.agentQuota ? a.quantity * quota2.quantity : a.quantity / quota2.quantity
  };
}
function quotaRule(a, quota2) {
  const result = quotaRuleEx(a, quota2);
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(quota2.quantity)}`, result: formatNumber(a.quantity * quota2.quantity), ok: a.agent === quota2.agentQuota },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota2.quantity)}`, result: formatNumber(a.quantity / quota2.quantity), ok: a.agent !== quota2.agentQuota }
    ]
  };
}
function toPartWholeRatioEx(part, whole) {
  return {
    kind: "ratio",
    part: part.agent,
    whole: whole.agent,
    ratio: part.quantity / whole.quantity
  };
}
function toPartWholeRatio(part, whole) {
  const result = toPartWholeRatioEx(part, whole);
  return {
    question: `Vyj\xE1d\u0159i pom\u011Brem ${part.agent} z ${whole.agent}?`,
    result,
    options: [
      { tex: `${formatNumber(whole.quantity)} / ${formatNumber(part.quantity)}`, result: formatRatio(part.quantity * whole.quantity), ok: false },
      { tex: `${formatNumber(part.quantity)} / ${formatNumber(whole.quantity)}`, result: formatRatio(part.quantity / whole.quantity), ok: true }
    ]
  };
}
function diffRuleEx(a, b) {
  if (!(a.agent == b.agentMinuend || a.agent == b.agentSubtrahend)) {
    throw `Mismatch agents ${a.agent} any of ${b.agentMinuend} ${b.agentSubtrahend}`;
  }
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return {
    kind: "cont",
    agent: a.agent == b.agentMinuend ? b.agentSubtrahend : b.agentMinuend,
    quantity: a.agent == b.agentMinuend ? a.quantity - b.quantity : a.quantity + b.quantity,
    entity: b.entity
  };
}
function diffRule(a, diff) {
  const result = diffRuleEx(a, diff);
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(diff.quantity)}`, result: formatNumber(a.quantity - diff.quantity), ok: a.agent === diff.agentMinuend },
      { tex: `${formatNumber(a.quantity)} + ${formatNumber(diff.quantity)}`, result: formatNumber(a.quantity + diff.quantity), ok: a.agent !== diff.agentMinuend }
    ]
  };
}
function sumRuleEx(items, b) {
  if (items.every((d) => isRatioPredicate(d))) {
    const wholes = items.map((d) => d.whole);
    if (!wholes.map(unique)) {
      throw `Combine only part to whole ratio with the same whole ${wholes}`;
    }
    ;
    return { kind: "ratio", whole: wholes[0], ratio: items.reduce((out, d) => out += d.ratio, 0), part: b.wholeAgent };
  } else if (items.every((d) => isQuantityPredicate(d))) {
    if (items.every((d) => isRatePredicate(d))) {
      const { entity: entity3, entityBase } = items[0];
      return { kind: "rate", agent: b.wholeAgent, quantity: items.reduce((out, d) => out += d.quantity, 0), entity: entity3, entityBase };
    } else {
      return { kind: "cont", agent: b.wholeAgent, quantity: items.reduce((out, d) => out += d.quantity, 0), entity: b.wholeEntity.entity, unit: b.wholeEntity.unit };
    }
  }
}
function sumRule(items, b) {
  const result = sumRuleEx(items, b);
  const isQuantity = isQuantityPredicate(result);
  return {
    question: result.kind === "cont" ? combineQuestion(result) : result.kind === "rate" ? `Vypo\u010Dti ${result.agent}` : `Vypo\u010Dti ${result.part}`,
    result,
    options: [
      {
        tex: items.map((d) => isQuantity ? formatNumber(d.quantity) : formatRatio(d.ratio)).join(" + "),
        result: isQuantity ? formatNumber(result.quantity) : formatRatio(result.ratio),
        ok: true
      },
      {
        tex: items.map((d) => isQuantity ? formatNumber(d.quantity) : formatRatio(d.ratio)).join(" * "),
        result: isQuantity ? formatNumber(result.quantity) : formatRatio(result.ratio),
        ok: false
      }
    ]
  };
}
function productRuleEx(items, b) {
  return { kind: "cont", agent: b.wholeAgent, quantity: items.reduce((out, d) => out *= d.quantity, 1), entity: b.wholeEntity.entity, unit: b.wholeEntity.unit };
}
function productRule(items, b) {
  const result = productRuleEx(items, b);
  return {
    question: combineQuestion(result),
    result,
    options: [
      { tex: items.map((d) => formatNumber(d.quantity)).join(" * "), result: formatNumber(items.map((d) => d.quantity).reduce((out, d) => out *= d, 1)), ok: true },
      { tex: items.map((d) => formatNumber(d.quantity)).join(" + "), result: formatNumber(items.map((d) => d.quantity).reduce((out, d) => out += d, 0)), ok: false }
    ]
  };
}
function gcdRuleEx(items, b) {
  return { kind: "cont", agent: b.agent, quantity: gcdCalc(items.map((d) => d.quantity)), entity: b.entity };
}
function gcdRule(items, b) {
  const result = gcdRuleEx(items, b);
  const factors = primeFactorization(items.map((d) => d.quantity));
  return {
    question: combineQuestion(result),
    result,
    options: [
      { tex: gcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: true }
      //{ tex: lcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ]
  };
}
function lcdRuleEx(items, b) {
  return { kind: "cont", agent: b.agent, quantity: lcdCalc(items.map((d) => d.quantity)), entity: b.entity };
}
function lcdRule(items, b) {
  const result = lcdRuleEx(items, b);
  const factors = primeFactorization(items.map((d) => d.quantity));
  return {
    question: combineQuestion(result),
    result,
    options: [
      { tex: lcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: true }
      //{ tex: gcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ]
  };
}
function sequenceRuleEx(items) {
  if (new Set(items.map((d) => d.entity)).size > 1) {
    throw `Mismatch entity ${items.map((d) => d.entity).join()}`;
  }
  const type = sequencer(items.map((d) => d.quantity));
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
  return { kind: "comp", agentB: b.agent, agentA: a.agent, quantity: a.quantity - b.quantity, entity: a.entity, unit: a.unit };
}
function toComparison(a, b) {
  const result = toComparisonEx(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik?`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ]
  };
}
function toTransferEx(a, b, last4) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const agent = { name: last4.agent, nameBefore: a.agent, nameAfter: b.agent };
  return { kind: "transfer", agentReceiver: agent, agentSender: agent, quantity: b.quantity - a.quantity, entity: a.entity, unit: a.unit };
}
function toTransfer(a, b, last4) {
  const result = toTransferEx(a, b, last4);
  return {
    question: `Zm\u011Bna stavu ${result.agentSender} => ${result.agentReceiver}. O kolik?`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ]
  };
}
function pythagorasRuleEx(a, b, last4) {
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
  if (a.agent === last4.longest || b.agent === last4.longest) {
    const longest = a.agent === last4.longest ? a : b;
    const otherSite = a.agent === last4.longest ? b : a;
    return {
      ...temp,
      quantity: Math.sqrt(Math.pow(longest.quantity, 2) - Math.pow(otherSite.quantity, 2)),
      agent: last4.sites[1] === otherSite.agent ? last4.sites[0] : last4.sites[1]
    };
  } else {
    return {
      ...temp,
      quantity: Math.sqrt(Math.pow(a.quantity, 2) + Math.pow(b.quantity, 2)),
      agent: last4.longest
    };
  }
}
function pythagorasRule(a, b, last4) {
  const result = pythagorasRuleEx(a, b, last4);
  const longest = a.agent === last4.longest ? a : b;
  const otherSite = a.agent === last4.longest ? b : a;
  return {
    question: `Vypo\u010D\xEDtej stranu ${result.agent} dle Pythagorovi v\u011Bty?`,
    result,
    options: [
      { tex: `odmocnina z (${formatNumber(longest.quantity)}^2^ - ${formatNumber(otherSite.quantity)}^2^)`, result: formatNumber(result.quantity), ok: a.agent === last4.longest },
      { tex: `odmocnina z (${formatNumber(a.quantity)}^2^ + ${formatNumber(b.quantity)}^2^)`, result: formatNumber(result.quantity), ok: a.agent !== last4.longest }
    ]
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
  return { kind: "comp-ratio", agentB: b.agent, agentA: a.agent, ratio: a.quantity / b.quantity, ...ctor3.asPercent && { asPercent: true } };
}
function toRatioComparison(a, b, ctor3) {
  const result = toRatioComparisonEx(a, b, ctor3);
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
}
function compareToCompareRuleEx(a, b) {
  return {
    kind: "rate",
    agent: a.agentA,
    quantity: Math.abs(a.quantity) / Math.abs(b.quantity),
    entity: { entity: a.entity },
    entityBase: { entity: b.entity }
  };
}
function compareToCompareRule(a, b) {
  const result = compareToCompareRuleEx(a, b);
  const aQuantity = Math.abs(a.quantity);
  const bQuantity = Math.abs(b.quantity);
  return {
    question: `Rozd\u011Bl ${aQuantity} ${formatEntity({ entity: a.entity })} rovnom\u011Brn\u011B na ${bQuantity} ${formatEntity({ entity: b.entity })}`,
    result,
    options: [
      { tex: `${formatNumber(aQuantity)} / ${formatNumber(bQuantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(bQuantity)} / ${formatNumber(aQuantity)}`, result: formatNumber(bQuantity / aQuantity), ok: false }
    ]
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
    quantity: a.quantity - b.quantity,
    entity: a.entity
  };
}
function toComparisonDiff(a, b) {
  const result = toComparisonDiffEx(a, b);
  return {
    question: `Vypo\u010Dti rozd\xEDl mezi ${a.quantity} a ${b.quantity}`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ]
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
    quantity: a.quantity - b.quantity,
    entity: a.entity,
    unit: a.unit
  };
}
function toDifference(a, b, diff) {
  const result = toDifferenceEx(a, b, diff);
  return {
    question: `Vypo\u010Dti rozd\xEDl mezi ${a.agent} a ${b.agent}`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ]
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
    ratio: a.ratio - b.ratio
  };
}
function toDifferenceAsRatio(a, b, diff) {
  const result = toDifferenceAsRatioEx(a, b, diff);
  return {
    question: `Vypo\u010Dti rozd\xEDl mezi ${a.part} a ${b.part}`,
    result,
    options: [
      { tex: `${formatRatio(a.ratio)} - ${formatRatio(b.ratio)}`, result: formatRatio(result.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} - ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio - a.ratio), ok: false }
    ]
  };
}
function toRateEx(a, b) {
  if (a.agent !== b.agent) {
    throw `Mismatch angent ${a.agent}, ${b.agent}`;
  }
  return {
    kind: "rate",
    agent: a.agent,
    quantity: a.quantity / b.quantity,
    entity: {
      entity: a.entity
    },
    entityBase: {
      entity: b.entity
    }
  };
}
function toRate(a, b) {
  const result = toRateEx(a, b);
  return {
    question: `Rozd\u011Bl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity })} rovnom\u011Brn\u011B na ${formatNumber(b.quantity)} ${formatEntity({ entity: b.entity })}`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity / a.quantity), ok: false }
    ]
  };
}
function toQuota(a, quota2) {
  if (a.entity !== quota2.entity) {
    throw `Mismatch entity ${a.entity}, ${quota2.entity}`;
  }
  const { groupCount, remainder } = divide(a.quantity, quota2.quantity);
  return {
    kind: "quota",
    agentQuota: quota2.agent,
    agent: a.agent,
    quantity: groupCount,
    restQuantity: remainder
  };
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
function toRatios(parts, last4) {
  const result = toRatiosEx(parts, last4.whole);
  return {
    question: `Vyj\xE1d\u0159i pom\u011Brem mezi ${result.parts.join(":")}?`,
    result,
    options: [
      { tex: `${result.ratios.map((d) => formatNumber(d)).join(":")}`, result: result.ratios.map((d) => formatNumber(d)).join(":"), ok: true },
      { tex: `${result.ratios.map((d) => formatNumber(d)).join(":")}`, result: result.ratios.map((d) => formatNumber(d)).join(":"), ok: false }
    ]
  };
}
function partToPartRuleEx(a, partToPartRatio, nth2) {
  if (!(partToPartRatio.whole != null && matchAgent(partToPartRatio.whole, a) || partToPartRatio.parts.some((d) => matchAgent(d, a)))) {
    throw `Mismatch agent ${[a.agent, a.entity].join()} any of ${[partToPartRatio.whole].concat(partToPartRatio.parts).join()}`;
  }
  const sourcePartIndex = partToPartRatio.parts.findIndex((d) => matchAgent(d, a));
  const targetPartIndex = nth2 != null ? partToPartRatio.parts.findIndex((d) => d === nth2.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;
  const partsSum = partToPartRatio.ratios.reduce((out, d) => out += d, 0);
  const matchedWhole = matchAgent(partToPartRatio.whole, a);
  return {
    kind: "cont",
    agent: (matchedWhole || nth2 != null) && targetPartIndex != -1 ? partToPartRatio.parts[targetPartIndex] : partToPartRatio.whole,
    entity: a.entity,
    quantity: matchedWhole ? a.quantity / partsSum * partToPartRatio.ratios[targetPartIndex] : a.quantity / partToPartRatio.ratios[sourcePartIndex] * (nth2 != null ? partToPartRatio.ratios[targetPartIndex] : partsSum),
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
    options: [
      { tex: `${formatNumber(a.quantity)} / ${partsSum} * ${formatNumber(partToPartRatio.ratios[targetPartIndex])}`, result: formatNumber(result.quantity), ok: matchedWhole },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(partToPartRatio.ratios[sourcePartIndex])} * ${nth2 != null ? partToPartRatio.ratios[targetPartIndex] : partsSum}`, result: formatNumber(result.quantity), ok: !matchedWhole }
    ]
  };
}
function mapRatiosByFactorEx(multi, quantity) {
  return { ...multi, ratios: multi.ratios.map((d) => d * quantity) };
}
function mapRatiosByFactor(multi, quantity) {
  const result = mapRatiosByFactorEx(multi, quantity);
  return {
    question: `${quantity > 1 ? "Rozn\xE1sob " : "Zkra\u0165 "} pom\u011Br \u010D\xEDslem ${formatNumber(quantity)}`,
    result,
    options: []
  };
}
function matchAgent(d, a) {
  return d === a.agent;
}
function partEqualEx(a, b) {
  const diff = compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, Math.abs(a.quantity), a.entity);
  const rest = diffRuleEx(b, diff);
  return {
    ...rest,
    quantity: rest.quantity / 2
  };
}
function partEqual(a, b) {
  const diff = compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, Math.abs(a.quantity), a.entity);
  const result = partEqualEx(a, b);
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `(${formatNumber(b.quantity)} - ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity - diff.quantity) / 2), ok: b.agent === diff.agentMinuend },
      { tex: `(${formatNumber(b.quantity)} + ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity + diff.quantity) / 2), ok: b.agent !== diff.agentMinuend }
    ]
  };
}
function nthTermRuleEx(a, b) {
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
    options: [
      { tex: formatSequence(b.type, a.quantity), result: formatNumber(result.quantity), ok: true }
    ]
  };
}
function nthPositionRuleEx(a, b, newEntity = "nth") {
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
    options: [
      { tex: "Dle vzorce", result: formatNumber(result.quantity), ok: true }
    ]
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
  const last4 = rest?.length > 0 ? rest[rest.length - 1] : null;
  if (last4?.kind === "sum" || last4?.kind === "product" || last4?.kind === "lcd" || last4?.kind === "gcd" || (last4?.kind === "sequence" || last4?.kind === "ratios" && args.length > 3)) {
    const arr = [a, b].concat(rest.slice(0, -1));
    return last4.kind === "sequence" ? sequenceRule(arr) : last4.kind === "gcd" ? gcdRule(arr, last4) : last4.kind === "lcd" ? lcdRule(arr, last4) : last4.kind === "product" ? productRule(arr, last4) : last4.kind === "sum" ? sumRule(arr, last4) : last4.kind === "ratios" ? toRatios(arr, last4) : null;
  } else if (a.kind === "cont" && b.kind == "cont") {
    const kind = last4?.kind;
    return kind === "comp-diff" ? toComparisonDiff(a, b) : kind === "diff" ? toDifference(a, b, last4) : kind === "quota" ? toQuota(a, b) : kind === "delta" ? toTransfer(a, b, last4) : kind === "pythagoras" ? pythagorasRule(a, b, last4) : kind === "rate" ? toRate(a, b) : kind === "ratios" ? toRatios([a, b], last4) : kind === "comp-ratio" ? toRatioComparison(a, b, last4) : kind === "ratio" ? toPartWholeRatio(a, b) : toComparison(a, b);
  } else if ((a.kind === "cont" || a.kind === "comp") && b.kind === "unit") {
    return convertToUnit(a, b);
  } else if (a.kind === "unit" && (b.kind === "cont" || b.kind === "comp")) {
    return convertToUnit(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-angle") {
    return compareAngleRule(a, b);
  } else if (a.kind === "comp-angle" && b.kind === "cont") {
    return compareAngleRule(b, a);
  } else if (a.kind === "ratio" && b.kind === "ratio") {
    const kind = last4?.kind;
    return kind === "diff" ? toDifferenceAsRatio(a, b, last4) : kind === "comp-ratio" ? toComparisonRatio(a, b) : toComparisonAsRatio(a, b);
  } else if (a.kind === "comp" && b.kind === "cont") {
    const kind = last4?.kind;
    return kind === "comp-part-eq" ? partEqual(a, b) : compareRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp") {
    const kind = last4?.kind;
    return kind === "comp-part-eq" ? partEqual(b, a) : compareRule(a, b);
  } else if (a.kind === "cont" && b.kind == "rate") {
    return rateRule(a, b);
  } else if (a.kind === "rate" && b.kind == "cont") {
    return rateRule(b, a);
  } else if (a.kind === "comp" && b.kind == "comp-ratio") {
    return compRatioToCompRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind == "comp") {
    return compRatioToCompRule(a, b);
  } else if (a.kind === "proportion" && b.kind == "ratios") {
    return proportionRatiosRule(b, a);
  } else if (a.kind === "ratios" && b.kind == "proportion") {
    return proportionRatiosRule(a, b);
  } else if (a.kind === "proportion" && b.kind == "comp-ratio") {
    return proportionRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind == "proportion") {
    return proportionRule(a, b);
  } else if (a.kind === "cont" && b.kind == "quota") {
    return quotaRule(a, b);
  } else if (a.kind === "quota" && b.kind == "cont") {
    return quotaRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "cont") {
    return ratioCompareRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-ratio") {
    return ratioCompareRule(a, b);
  } else if (a.kind === "comp-ratio" && b.kind === "ratio") {
    return comparisonRatioRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "comp-ratio") {
    return comparisonRatioRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "ratios") {
    return comparisonRatiosRule(a, b);
  } else if (a.kind === "ratios" && b.kind === "comp-ratio") {
    return comparisonRatiosRule(b, a);
  } else if (a.kind === "cont" && b.kind === "ratio") {
    return partToWholeRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "cont") {
    return partToWholeRule(b, a);
  } else if (a.kind === "complement" && b.kind === "ratio") {
    return ratioComplementRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "complement") {
    return ratioComplementRule(b, a);
  } else if (a.kind === "cont" && b.kind == "ratios") {
    const kind = last4?.kind;
    return kind === "factorBy" ? mapRatiosByFactor(b, a.quantity) : kind === "simplify" ? mapRatiosByFactor(b, 1 / a.quantity) : kind === "nth-part" ? partToPartRule(a, b, last4) : partToPartRule(a, b);
  } else if (a.kind === "ratios" && b.kind == "cont") {
    const kind = last4?.kind;
    return kind === "factorBy" ? mapRatiosByFactor(a, b.quantity) : kind === "simplify" ? mapRatiosByFactor(a, 1 / b.quantity) : kind === "nth-part" ? partToPartRule(b, a, last4) : partToPartRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-diff") {
    return diffRule(a, b);
  } else if (a.kind === "comp-diff" && b.kind === "cont") {
    return diffRule(b, a);
  } else if (a.kind === "sequence" && b.kind === "cont") {
    const kind = last4?.kind;
    return kind === "nth" ? nthPositionRule(b, a, last4.entity) : nthTermRule(b, a);
  } else if (a.kind === "cont" && b.kind === "sequence") {
    const kind = last4?.kind;
    return kind === "nth" ? nthPositionRule(a, b, last4.entity) : nthTermRule(a, b);
  } else if (a.kind === "cont" && b.kind === "transfer") {
    return transferRule(a, b, "after");
  } else if (a.kind === "transfer" && b.kind === "cont") {
    return transferRule(b, a, "before");
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
  return Math.abs(a * b) / gcdCalc([a, b]);
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
  return `Vypo\u010Dti ${d.agent}${formatEntity(d)}?`;
}
function combineQuestion(d) {
  return `Vypo\u010Dti ${d.agent}${formatEntity(d)}?`;
}
function toGenerAgent(a, entity3 = "") {
  return cont(a.entity, a.quantity, entity3);
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
  const simplify = (d, op = "") => d !== 1 ? `${d}${op}` : "";
  if (type.kind === "arithmetic")
    return `${type.sequence[0]} + ${type.commonDifference}(${formatNumber(n)}-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements(first, second, type.secondDifference);
    let parts = [`${simplify(A, "*")}${formatNumber(n)}^2^`];
    if (B !== 0) {
      parts = parts.concat(`${simplify(B, "*")}${formatNumber(n)}`);
    }
    if (C !== 0) {
      parts = parts.concat(`${simplify(C, "*")}${formatNumber(n)}`);
    }
    return `${parts.map((d, i) => `${i !== 0 ? " + " : ""}${d}`).join(" ")}`;
  }
  if (type.kind === "geometric") {
    return `${simplify(type.sequence[0], "*")}${type.commonRatio}^(${formatNumber(n)}-1)^`;
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
  "simplify": function(eps) {
    const ieps = BigInt(1 / (eps || 1e-3) | 0);
    const thisABS = this["abs"]();
    const cont3 = thisABS["toContinued"]();
    for (let i = 1; i < cont3.length; i++) {
      let s = newFraction(cont3[i - 1], C_ONE);
      for (let k = i - 2; k >= 0; k--) {
        s = s["inverse"]()["add"](cont3[k]);
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
      const ratio4 = (_b = anchor[destination.system]) === null || _b === void 0 ? void 0 : _b.ratio;
      if (typeof transform === "function") {
        result = transform(result);
      } else if (typeof ratio4 === "number") {
        result *= ratio4;
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
  unitAnchor: (unit) => convert().getUnit(unit)?.unit?.to_anchor
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
function deduce(...children) {
  return to(...children.concat(inferenceRule.apply(null, children.map((d) => isPredicate(d) ? d : d.children.slice(-1)[0]))));
}
function to(...children) {
  return { children };
}
function toCont(child, { agent }) {
  const node = isPredicate(child) ? child : last(child);
  if (!(node.kind == "cont" || node.kind === "transfer" || node.kind == "comp" || node.kind === "comp-diff" || node.kind === "rate" || node.kind === "quota")) {
    throw `Non convertable node type: ${node.kind}`;
  }
  const typeNode = node;
  return to(child, cont(agent, typeNode.quantity, typeNode.kind == "rate" ? typeNode.entity.entity : typeNode.entity, typeNode.kind == "rate" ? typeNode.entity.unit : typeNode.unit));
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
          sum(agent, [], entityPrice, entityPrice)
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
      sum("oba krajn\xED sloupce", [], entityTmave, entityTmave)
    ),
    ctor("comp-diff")
  );
  return [
    {
      deductionTree: to(
        dd1,
        commonSense("horn\xED \u0159ada tmav\xFDch \u010Dtver\u010Dk\u016F bez krajn\xEDch sloupc\u016F roz\u0161\xED\u0159en\xE9ho obrazce odpov\xEDd\xE1 po\u010Dtu sloupc\u016F z\xE1kladn\xEDho obrazce"),
        cont(base, last(dd1).quantity, entityColumn)
      )
    },
    {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(`lev\xFD sloupec`, 3, entity3),
            cont(`prav\xFD sloupec`, 3, entity3),
            sum("oba krajn\xED sloupce", [], entity3, entity3)
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
      sum(`1. a 3. ${souteziciLabel}`, [], "", "")
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
  const pocetLabel = "po\u010Det se\u0161it\u016F";
  const cenaLabel = "cena se\u0161it\u016F";
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
    sum(`kovy v\u0161echny odd\xEDly`, [], entityVaha, entityPlast)
  );
  const papirCelkem = deduce(
    cont(oddilR, 6, entityPapir),
    cont(oddilS, 8, entityPapir),
    cont(oddilT, 1, entityPapir),
    sum(`pap\xEDr v\u0161echny odd\xEDly`, [], entityVaha, entityPlast)
  );
  return {
    papirStoR: {
      deductionTree: deduce(
        cont(oddilS, 8, entityPapir),
        cont(oddilR, 6, entityPapir),
        ctor("comp-ratio")
      )
    },
    papirRtoS: {
      deductionTree: deduce(
        cont(oddilR, 6, entityPapir),
        cont(oddilS, 8, entityPapir),
        ctor("comp-ratio")
      )
    },
    plast: {
      deductionTree: deduce(
        deduce(
          cont(oddilT, 9, entityPlast),
          cont(oddilS, 11, entityPlast),
          sum(`odd\xEDl S a T`, [], entityPlast, entityPlast)
        ),
        cont(oddilR, 15, entityPlast),
        ctor("comp-ratio")
      )
    },
    kovyToPapir: {
      deductionTree: deduce(
        kovyCelkem,
        papirCelkem,
        ctor("comp-ratio")
      )
    },
    papirToKovy: {
      deductionTree: deduce(
        papirCelkem,
        kovyCelkem,
        ctor("comp-ratio")
      )
    }
  };
};

// src/utils/deduce-utils.js
var defaultHelpers2 = {
  convertToFraction: (d) => d,
  convertToUnit: (d) => d,
  unitAnchor: () => 1
};
var helpers2 = defaultHelpers2;
function configure2(config) {
  helpers2 = { ...defaultHelpers2, ...config };
}
function cont2(agent, quantity, entity3, unit) {
  return { kind: "cont", agent, quantity, entity: entity3, unit };
}
function compDiff2(agentMinuend, agentSubtrahend, quantity, entity3) {
  return { kind: "comp-diff", agentMinuend, agentSubtrahend, quantity, entity: entity3 };
}
function compareRuleEx2(a, b) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  if (a.agent == b.agentB) {
    return { kind: "cont", agent: b.agentA, quantity: a.quantity + b.quantity, entity: a.entity, unit: a.unit };
  } else if (a.agent == b.agentA) {
    return { kind: "cont", agent: b.agentB, quantity: a.quantity + -1 * b.quantity, entity: a.entity, unit: a.unit };
  }
}
function compareRule2(a, b) {
  const result = compareRuleEx2(a, b);
  return {
    question: `Vypo\u010Dti ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity2(result)}?`,
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} ${b.quantity > 0 ? " + " : " - "} ${formatNumber2(Math.abs(b.quantity))}`, result: formatNumber2(result.quantity), ok: a.agent == b.agentB },
      { tex: `${formatNumber2(a.quantity)} ${b.quantity > 0 ? " - " : " + "} ${formatNumber2(Math.abs(b.quantity))}`, result: formatNumber2(result.quantity), ok: a.agent == b.agentA }
    ]
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
    options: [
      { tex: `90 - ${a.quantity}`, result: formatNumber2(result.quantity), ok: b.relationship == "complementary" },
      { tex: `180 - ${a.quantity}`, result: formatNumber2(result.quantity), ok: b.relationship == "supplementary" || b.relationship == "sameSide" },
      { tex: `${a.quantity}`, result: formatNumber2(result.quantity), ok: b.relationship != "supplementary" && b.relationship != "complementary" && b.relationship != "sameSide" }
    ]
  };
}
function toComparisonAsRatioEx2(a, b) {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole}`;
  }
  return { kind: "comp-ratio", agentB: b.part, agentA: a.part, ratio: 1 + (a.ratio - b.ratio) };
}
function toComparisonAsRatio2(a, b) {
  const result = toComparisonAsRatioEx2(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik?`,
    result,
    options: [
      { tex: `1 + (${formatRatio2(a.ratio)} - ${formatRatio2(b.ratio)})`, result: formatRatio2(result.ratio), ok: true },
      { tex: `${formatRatio2(b.ratio)} - ${formatRatio2(a.ratio)}`, result: formatRatio2(result.ratio), ok: false }
    ]
  };
}
function toComparisonRatioEx2(a, b) {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole}`;
  }
  return { kind: "comp-ratio", agentB: b.part, agentA: a.part, ratio: a.ratio / b.ratio };
}
function toComparisonRatio2(a, b) {
  const result = toComparisonRatioEx2(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. Kolikr\xE1t?`,
    result,
    options: [
      { tex: `${formatRatio2(a.ratio)} / ${formatRatio2(b.ratio)}`, result: formatRatio2(a.ratio / b.ratio), ok: true },
      { tex: `${formatRatio2(b.ratio)} / ${formatRatio2(a.ratio)}`, result: formatRatio2(b.ratio / a.ratio), ok: false }
    ]
  };
}
function comparisonRatioRuleEx2(b, a) {
  if (!(a.part == b.agentA || a.part == b.agentB)) {
    throw `Mismatch agent ${a.part} any of ${b.agentA}, ${b.agentB}`;
  }
  if (a.part == b.agentB) {
    return { kind: "ratio", whole: a.whole, part: b.agentA, ratio: b.ratio >= 0 ? a.ratio * b.ratio : a.ratio / Math.abs(b.ratio) };
  } else if (a.part == b.agentA) {
    return { kind: "ratio", whole: a.whole, part: b.agentB, ratio: b.ratio > 0 ? a.ratio / b.ratio : a.ratio * Math.abs(b.ratio) };
  }
}
function comparisonRatioRule2(b, a) {
  const result = comparisonRatioRuleEx2(b, a);
  return {
    question: `Vypo\u010Dti ${a.part == b.agentB ? b.agentA : b.agentB}?`,
    result,
    options: [
      { tex: `${formatRatio2(a.ratio)} * ${formatRatio2(Math.abs(b.ratio))}`, result: formatRatio2(a.ratio * b.ratio), ok: a.part == b.agentB && b.ratio >= 0 || a.part == b.agentA && b.ratio < 0 },
      { tex: `${formatRatio2(a.ratio)} / ${formatRatio2(Math.abs(b.ratio))}`, result: formatRatio2(a.ratio / b.ratio), ok: a.part == b.agentA && b.ratio >= 0 || a.part == b.agentB && b.ratio < 0 }
    ]
  };
}
function comparisonRatiosRuleEx2(b, a) {
  if (b.ratio >= 0) {
    return { kind: "ratios", whole: a.whole, parts: [b.agentA, b.agentB], ratios: [1 / Math.abs(b.ratio), 1] };
  } else {
    return { kind: "ratios", whole: a.whole, parts: [b.agentA, b.agentB], ratios: [1 / Math.abs(b.ratio), 1] };
  }
}
function comparisonRatiosRule2(b, a) {
  const result = comparisonRatiosRuleEx2(b, a);
  return {
    question: `P\u0159eve\u010F na pom\u011Br dvojice ${[b.agentA, b.agentB].join(":")}?`,
    result,
    options: [
      { tex: `(1 / ${formatRatio2(Math.abs(b.ratio))}) ":" 1`, result: result.ratios.map((d) => formatRatio2(d)).join(":"), ok: b.ratio >= 0 },
      { tex: `(1 / ${formatRatio2(Math.abs(b.ratio))}) ":" 1`, result: result.ratios.map((d) => formatRatio2(d)).join(":"), ok: b.ratio < 0 }
    ]
  };
}
function convertToUnitEx2(a, b) {
  if (a.unit == null) {
    throw `Missing unit ${a.kind === "cont" ? a.agent : `${a.agentA} to ${a.agentB}`} a ${a.entity}`;
  }
  return { ...a, quantity: helpers2.convertToUnit(a.quantity, a.unit, b.unit), unit: b.unit };
}
function convertToUnit2(a, b) {
  const result = convertToUnitEx2(a, b);
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
function ratioCompareRuleEx2(a, b) {
  if (!(a.agent == b.agentA || a.agent == b.agentB)) {
    throw `Mismatch agent ${a.agent} any of ${b.agentA}, ${b.agentB}`;
  }
  if (a.agent == b.agentB) {
    return { kind: "cont", agent: b.agentA, quantity: b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / Math.abs(b.ratio), entity: a.entity, unit: a.unit };
  } else if (a.agent == b.agentA) {
    return { kind: "cont", agent: b.agentB, quantity: b.ratio > 0 ? a.quantity / b.ratio : a.quantity * Math.abs(b.ratio), entity: a.entity, unit: a.unit };
  }
}
function ratioCompareRule2(a, b) {
  const result = ratioCompareRuleEx2(a, b);
  return {
    question: `Vypo\u010Dti ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity2(result)}?`,
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} * ${formatRatio2(Math.abs(b.ratio))}`, result: formatNumber2(a.quantity * b.ratio), ok: a.agent == b.agentB && b.ratio >= 0 || a.agent == b.agentA && b.ratio < 0 },
      { tex: `${formatNumber2(a.quantity)} / ${formatRatio2(Math.abs(b.ratio))}`, result: formatNumber2(a.quantity / b.ratio), ok: a.agent == b.agentA && b.ratio >= 0 || a.agent == b.agentB && b.ratio < 0 }
    ]
  };
}
function transferRuleEx2(a, b, transferOrder) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const quantity = transferOrder === "before" ? a.agent == b.agentSender.name ? a.quantity + b.quantity : a.quantity - b.quantity : a.agent == b.agentSender.name ? a.quantity - b.quantity : a.quantity + b.quantity;
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
    question: `Vypo\u010Dti ${a.agent}${formatEntity2(result)}?`,
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} ${b.quantity > 0 ? " + " : " - "} ${formatNumber2(Math.abs(b.quantity))}`, result: formatNumber2(result.quantity), ok: a.agent == b.agentReceiver.name },
      { tex: `${formatNumber2(a.quantity)} ${b.quantity > 0 ? " - " : " + "} ${formatNumber2(Math.abs(b.quantity))}`, result: formatNumber2(result.quantity), ok: a.agent == b.agentSender.name }
    ]
  };
}
function ratioComplementRuleEx2(a, b) {
  return {
    kind: "ratio",
    whole: b.whole,
    ratio: 1 - b.ratio,
    part: a.part,
    asPercent: b.asPercent
  };
}
function ratioComplementRule2(a, b) {
  const result = ratioComplementRuleEx2(a, b);
  return {
    question: `Vyj\xE1d\u0159i ${b.asPercent ? "procentem" : "pom\u011Brem"} ${result.part} z ${result.whole}?`,
    result,
    options: [
      { tex: `${formatRatio2(1, b.asPercent)} - ${formatRatio2(b.ratio, b.asPercent)}`, result: formatRatio2(1 - b.ratio, b.asPercent), ok: true },
      { tex: `${formatRatio2(b.ratio, b.asPercent)} - ${formatRatio2(1, b.asPercent)}`, result: formatRatio2(b.ratio - 1, b.asPercent), ok: false }
    ]
  };
}
function compRatioToCompRuleEx2(a, b) {
  const agent = a.agentB === b.agentA ? b.agentA : b.agentB;
  const quantity = a.agentB === b.agentA ? -1 * b.quantity : b.quantity;
  if (quantity > 0 && a.ratio < 1 || quantity < 0 && a.ratio > 1) {
    throw `Uncompatible compare rules. Absolute compare ${quantity} between ${b.agentA} a ${b.agentB} does not match relative compare ${a.ratio}. `;
  }
  return {
    kind: "cont",
    agent,
    entity: b.entity,
    unit: b.unit,
    quantity: Math.abs(b.quantity / (a.ratio - 1))
  };
}
function compRatioToCompRule2(a, b) {
  const result = compRatioToCompRuleEx2(a, b);
  return {
    question: containerQuestion2(result),
    result,
    options: [
      { tex: `${formatNumber2(Math.abs(b.quantity))} / ${formatRatio2(Math.abs(a.ratio - 1))}`, result: formatNumber2(result.quantity), ok: true },
      { tex: `${formatNumber2(Math.abs(b.quantity))} / ${formatRatio2(Math.abs(1 - a.ratio))}`, result: formatNumber2(Math.abs(b.quantity / (1 - a.ratio))), ok: false }
    ]
  };
}
function proportionRuleEx2(a, b) {
  return {
    ...a,
    ...b.inverse && { ratio: 1 / a.ratio }
  };
}
function proportionRule2(a, b) {
  const result = proportionRuleEx2(a, b);
  return {
    question: `Jak\xFD je vztah mezi veli\u010Dinami? ${b.entities?.join(" a ")}`,
    result,
    options: [
      { tex: `zachovat pom\u011Br`, result: formatRatio2(a.ratio), ok: !b.inverse },
      { tex: `obr\xE1tit pom\u011Br - 1 / ${formatRatio2(a.ratio)}`, result: formatRatio2(1 / a.ratio), ok: b.inverse }
    ]
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
  return matchAgent2(b.whole, a) ? { kind: "cont", agent: b.part, entity: a.entity, quantity: a.quantity * b.ratio } : { kind: "cont", agent: b.whole, entity: a.entity, quantity: a.quantity / b.ratio };
}
function partToWholeRule2(a, b) {
  const result = partToWholeRuleEx2(a, b);
  return {
    question: containerQuestion2(result),
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} * ${formatRatio2(b.ratio)}`, result: formatNumber2(a.quantity * b.ratio), ok: matchAgent2(b.whole, a) },
      { tex: `${formatNumber2(a.quantity)} / ${formatRatio2(b.ratio)}`, result: formatNumber2(a.quantity / b.ratio), ok: !matchAgent2(b.whole, a) }
    ]
  };
}
function rateRuleEx2(a, rate3) {
  if (!(a.entity === rate3.entity.entity || a.entity === rate3.entityBase.entity)) {
    throw `Mismatch entity ${a.entity} any of ${rate3.entity.entity}, ${rate3.entityBase.entity}`;
  }
  const isEntityBase2 = a.entity == rate3.entity.entity;
  return {
    kind: "cont",
    agent: a.agent,
    entity: isEntityBase2 ? rate3.entityBase.entity : rate3.entity.entity,
    unit: isEntityBase2 ? rate3.entityBase.unit : rate3.entity.unit,
    quantity: a.entity == rate3.entity.entity ? a.quantity / rate3.quantity : a.quantity * rate3.quantity
  };
}
function rateRule2(a, rate3) {
  const result = rateRuleEx2(a, rate3);
  return {
    question: containerQuestion2(result),
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} * ${formatNumber2(rate3.quantity)}`, result: formatNumber2(a.quantity * rate3.quantity), ok: a.entity !== rate3.entity.entity },
      { tex: `${formatNumber2(a.quantity)} / ${formatNumber2(rate3.quantity)}`, result: formatNumber2(a.quantity / rate3.quantity), ok: a.entity === rate3.entity.entity }
    ]
  };
}
function quotaRuleEx2(a, quota2) {
  if (!(a.agent === quota2.agent || a.agent === quota2.agentQuota)) {
    throw `Mismatch entity ${a.entity} any of ${quota2.agent}, ${quota2.agentQuota}`;
  }
  return {
    kind: "cont",
    agent: a.agent === quota2.agentQuota ? quota2.agent : quota2.agentQuota,
    entity: a.entity,
    quantity: a.agent === quota2.agentQuota ? a.quantity * quota2.quantity : a.quantity / quota2.quantity
  };
}
function quotaRule2(a, quota2) {
  const result = quotaRuleEx2(a, quota2);
  return {
    question: containerQuestion2(result),
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} * ${formatNumber2(quota2.quantity)}`, result: formatNumber2(a.quantity * quota2.quantity), ok: a.agent === quota2.agentQuota },
      { tex: `${formatNumber2(a.quantity)} / ${formatNumber2(quota2.quantity)}`, result: formatNumber2(a.quantity / quota2.quantity), ok: a.agent !== quota2.agentQuota }
    ]
  };
}
function toPartWholeRatioEx2(part, whole) {
  return {
    kind: "ratio",
    part: part.agent,
    whole: whole.agent,
    ratio: part.quantity / whole.quantity
  };
}
function toPartWholeRatio2(part, whole) {
  const result = toPartWholeRatioEx2(part, whole);
  return {
    question: `Vyj\xE1d\u0159i pom\u011Brem ${part.agent} z ${whole.agent}?`,
    result,
    options: [
      { tex: `${formatNumber2(whole.quantity)} / ${formatNumber2(part.quantity)}`, result: formatRatio2(part.quantity * whole.quantity), ok: false },
      { tex: `${formatNumber2(part.quantity)} / ${formatNumber2(whole.quantity)}`, result: formatRatio2(part.quantity / whole.quantity), ok: true }
    ]
  };
}
function diffRuleEx2(a, b) {
  if (!(a.agent == b.agentMinuend || a.agent == b.agentSubtrahend)) {
    throw `Mismatch agents ${a.agent} any of ${b.agentMinuend} ${b.agentSubtrahend}`;
  }
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return {
    kind: "cont",
    agent: a.agent == b.agentMinuend ? b.agentSubtrahend : b.agentMinuend,
    quantity: a.agent == b.agentMinuend ? a.quantity - b.quantity : a.quantity + b.quantity,
    entity: b.entity
  };
}
function diffRule2(a, diff) {
  const result = diffRuleEx2(a, diff);
  return {
    question: containerQuestion2(result),
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} - ${formatNumber2(diff.quantity)}`, result: formatNumber2(a.quantity - diff.quantity), ok: a.agent === diff.agentMinuend },
      { tex: `${formatNumber2(a.quantity)} + ${formatNumber2(diff.quantity)}`, result: formatNumber2(a.quantity + diff.quantity), ok: a.agent !== diff.agentMinuend }
    ]
  };
}
function sumRuleEx2(items, b) {
  if (items.every((d) => isRatioPredicate2(d))) {
    const wholes = items.map((d) => d.whole);
    if (!wholes.map(unique2)) {
      throw `Combine only part to whole ratio with the same whole ${wholes}`;
    }
    ;
    return { kind: "ratio", whole: wholes[0], ratio: items.reduce((out, d) => out += d.ratio, 0), part: b.wholeAgent };
  } else if (items.every((d) => isQuantityPredicate2(d))) {
    if (items.every((d) => isRatePredicate2(d))) {
      const { entity: entity3, entityBase } = items[0];
      return { kind: "rate", agent: b.wholeAgent, quantity: items.reduce((out, d) => out += d.quantity, 0), entity: entity3, entityBase };
    } else {
      return { kind: "cont", agent: b.wholeAgent, quantity: items.reduce((out, d) => out += d.quantity, 0), entity: b.wholeEntity.entity, unit: b.wholeEntity.unit };
    }
  }
}
function sumRule2(items, b) {
  const result = sumRuleEx2(items, b);
  const isQuantity = isQuantityPredicate2(result);
  return {
    question: result.kind === "cont" ? combineQuestion2(result) : result.kind === "rate" ? `Vypo\u010Dti ${result.agent}` : `Vypo\u010Dti ${result.part}`,
    result,
    options: [
      {
        tex: items.map((d) => isQuantity ? formatNumber2(d.quantity) : formatRatio2(d.ratio)).join(" + "),
        result: isQuantity ? formatNumber2(result.quantity) : formatRatio2(result.ratio),
        ok: true
      },
      {
        tex: items.map((d) => isQuantity ? formatNumber2(d.quantity) : formatRatio2(d.ratio)).join(" * "),
        result: isQuantity ? formatNumber2(result.quantity) : formatRatio2(result.ratio),
        ok: false
      }
    ]
  };
}
function productRuleEx2(items, b) {
  return { kind: "cont", agent: b.wholeAgent, quantity: items.reduce((out, d) => out *= d.quantity, 1), entity: b.wholeEntity.entity, unit: b.wholeEntity.unit };
}
function productRule2(items, b) {
  const result = productRuleEx2(items, b);
  return {
    question: combineQuestion2(result),
    result,
    options: [
      { tex: items.map((d) => formatNumber2(d.quantity)).join(" * "), result: formatNumber2(items.map((d) => d.quantity).reduce((out, d) => out *= d, 1)), ok: true },
      { tex: items.map((d) => formatNumber2(d.quantity)).join(" + "), result: formatNumber2(items.map((d) => d.quantity).reduce((out, d) => out += d, 0)), ok: false }
    ]
  };
}
function gcdRuleEx2(items, b) {
  return { kind: "cont", agent: b.agent, quantity: gcdCalc2(items.map((d) => d.quantity)), entity: b.entity };
}
function gcdRule2(items, b) {
  const result = gcdRuleEx2(items, b);
  const factors = primeFactorization2(items.map((d) => d.quantity));
  return {
    question: combineQuestion2(result),
    result,
    options: [
      { tex: gcdFromPrimeFactors2(factors).join(" * "), result: formatNumber2(result.quantity), ok: true }
      //{ tex: lcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ]
  };
}
function lcdRuleEx2(items, b) {
  return { kind: "cont", agent: b.agent, quantity: lcdCalc2(items.map((d) => d.quantity)), entity: b.entity };
}
function lcdRule2(items, b) {
  const result = lcdRuleEx2(items, b);
  const factors = primeFactorization2(items.map((d) => d.quantity));
  return {
    question: combineQuestion2(result),
    result,
    options: [
      { tex: lcdFromPrimeFactors2(factors).join(" * "), result: formatNumber2(result.quantity), ok: true }
      //{ tex: gcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ]
  };
}
function sequenceRuleEx2(items) {
  if (new Set(items.map((d) => d.entity)).size > 1) {
    throw `Mismatch entity ${items.map((d) => d.entity).join()}`;
  }
  const type = sequencer2(items.map((d) => d.quantity));
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
  return { kind: "comp", agentB: b.agent, agentA: a.agent, quantity: a.quantity - b.quantity, entity: a.entity, unit: a.unit };
}
function toComparison2(a, b) {
  const result = toComparisonEx2(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik?`,
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} - ${formatNumber2(b.quantity)}`, result: formatNumber2(a.quantity - b.quantity), ok: true },
      { tex: `${formatNumber2(b.quantity)} - ${formatNumber2(a.quantity)}`, result: formatNumber2(b.quantity - a.quantity), ok: false }
    ]
  };
}
function toTransferEx2(a, b, last22) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const agent = { name: last22.agent, nameBefore: a.agent, nameAfter: b.agent };
  return { kind: "transfer", agentReceiver: agent, agentSender: agent, quantity: b.quantity - a.quantity, entity: a.entity, unit: a.unit };
}
function toTransfer2(a, b, last22) {
  const result = toTransferEx2(a, b, last22);
  return {
    question: `Zm\u011Bna stavu ${result.agentSender} => ${result.agentReceiver}. O kolik?`,
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} - ${formatNumber2(b.quantity)}`, result: formatNumber2(a.quantity - b.quantity), ok: true },
      { tex: `${formatNumber2(b.quantity)} - ${formatNumber2(a.quantity)}`, result: formatNumber2(b.quantity - a.quantity), ok: false }
    ]
  };
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
      quantity: Math.sqrt(Math.pow(longest.quantity, 2) - Math.pow(otherSite.quantity, 2)),
      agent: last22.sites[1] === otherSite.agent ? last22.sites[0] : last22.sites[1]
    };
  } else {
    return {
      ...temp,
      quantity: Math.sqrt(Math.pow(a.quantity, 2) + Math.pow(b.quantity, 2)),
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
    options: [
      { tex: `odmocnina z (${formatNumber2(longest.quantity)}^2^ - ${formatNumber2(otherSite.quantity)}^2^)`, result: formatNumber2(result.quantity), ok: a.agent === last22.longest },
      { tex: `odmocnina z (${formatNumber2(a.quantity)}^2^ + ${formatNumber2(b.quantity)}^2^)`, result: formatNumber2(result.quantity), ok: a.agent !== last22.longest }
    ]
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
  return { kind: "comp-ratio", agentB: b.agent, agentA: a.agent, ratio: a.quantity / b.quantity, ...ctor3.asPercent && { asPercent: true } };
}
function toRatioComparison2(a, b, ctor3) {
  const result = toRatioComparisonEx2(a, b, ctor3);
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
}
function compareToCompareRuleEx2(a, b) {
  return {
    kind: "rate",
    agent: a.agentA,
    quantity: Math.abs(a.quantity) / Math.abs(b.quantity),
    entity: { entity: a.entity },
    entityBase: { entity: b.entity }
  };
}
function compareToCompareRule2(a, b) {
  const result = compareToCompareRuleEx2(a, b);
  const aQuantity = Math.abs(a.quantity);
  const bQuantity = Math.abs(b.quantity);
  return {
    question: `Rozd\u011Bl ${aQuantity} ${formatEntity2({ entity: a.entity })} rovnom\u011Brn\u011B na ${bQuantity} ${formatEntity2({ entity: b.entity })}`,
    result,
    options: [
      { tex: `${formatNumber2(aQuantity)} / ${formatNumber2(bQuantity)}`, result: formatNumber2(result.quantity), ok: true },
      { tex: `${formatNumber2(bQuantity)} / ${formatNumber2(aQuantity)}`, result: formatNumber2(bQuantity / aQuantity), ok: false }
    ]
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
    quantity: a.quantity - b.quantity,
    entity: a.entity
  };
}
function toComparisonDiff2(a, b) {
  const result = toComparisonDiffEx2(a, b);
  return {
    question: `Vypo\u010Dti rozd\xEDl mezi ${a.quantity} a ${b.quantity}`,
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} - ${formatNumber2(b.quantity)}`, result: formatNumber2(result.quantity), ok: true },
      { tex: `${formatNumber2(b.quantity)} - ${formatNumber2(a.quantity)}`, result: formatNumber2(b.quantity - a.quantity), ok: false }
    ]
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
    quantity: a.quantity - b.quantity,
    entity: a.entity,
    unit: a.unit
  };
}
function toDifference2(a, b, diff) {
  const result = toDifferenceEx2(a, b, diff);
  return {
    question: `Vypo\u010Dti rozd\xEDl mezi ${a.agent} a ${b.agent}`,
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} - ${formatNumber2(b.quantity)}`, result: formatNumber2(result.quantity), ok: true },
      { tex: `${formatNumber2(b.quantity)} - ${formatNumber2(a.quantity)}`, result: formatNumber2(b.quantity - a.quantity), ok: false }
    ]
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
    ratio: a.ratio - b.ratio
  };
}
function toDifferenceAsRatio2(a, b, diff) {
  const result = toDifferenceAsRatioEx2(a, b, diff);
  return {
    question: `Vypo\u010Dti rozd\xEDl mezi ${a.part} a ${b.part}`,
    result,
    options: [
      { tex: `${formatRatio2(a.ratio)} - ${formatRatio2(b.ratio)}`, result: formatRatio2(result.ratio), ok: true },
      { tex: `${formatRatio2(b.ratio)} - ${formatRatio2(a.ratio)}`, result: formatRatio2(b.ratio - a.ratio), ok: false }
    ]
  };
}
function toRateEx2(a, b) {
  if (a.agent !== b.agent) {
    throw `Mismatch angent ${a.agent}, ${b.agent}`;
  }
  return {
    kind: "rate",
    agent: a.agent,
    quantity: a.quantity / b.quantity,
    entity: {
      entity: a.entity
    },
    entityBase: {
      entity: b.entity
    }
  };
}
function toRate2(a, b) {
  const result = toRateEx2(a, b);
  return {
    question: `Rozd\u011Bl ${formatNumber2(a.quantity)} ${formatEntity2({ entity: a.entity })} rovnom\u011Brn\u011B na ${formatNumber2(b.quantity)} ${formatEntity2({ entity: b.entity })}`,
    result,
    options: [
      { tex: `${formatNumber2(a.quantity)} / ${formatNumber2(b.quantity)}`, result: formatNumber2(result.quantity), ok: true },
      { tex: `${formatNumber2(b.quantity)} / ${formatNumber2(a.quantity)}`, result: formatNumber2(b.quantity / a.quantity), ok: false }
    ]
  };
}
function toQuota2(a, quota2) {
  if (a.entity !== quota2.entity) {
    throw `Mismatch entity ${a.entity}, ${quota2.entity}`;
  }
  const { groupCount, remainder } = divide2(a.quantity, quota2.quantity);
  return {
    kind: "quota",
    agentQuota: quota2.agent,
    agent: a.agent,
    quantity: groupCount,
    restQuantity: remainder
  };
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
    options: [
      { tex: `${result.ratios.map((d) => formatNumber2(d)).join(":")}`, result: result.ratios.map((d) => formatNumber2(d)).join(":"), ok: true },
      { tex: `${result.ratios.map((d) => formatNumber2(d)).join(":")}`, result: result.ratios.map((d) => formatNumber2(d)).join(":"), ok: false }
    ]
  };
}
function partToPartRuleEx2(a, partToPartRatio, nth2) {
  if (!(partToPartRatio.whole != null && matchAgent2(partToPartRatio.whole, a) || partToPartRatio.parts.some((d) => matchAgent2(d, a)))) {
    throw `Mismatch agent ${[a.agent, a.entity].join()} any of ${[partToPartRatio.whole].concat(partToPartRatio.parts).join()}`;
  }
  const sourcePartIndex = partToPartRatio.parts.findIndex((d) => matchAgent2(d, a));
  const targetPartIndex = nth2 != null ? partToPartRatio.parts.findIndex((d) => d === nth2.agent) : matchAgent2(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;
  const partsSum = partToPartRatio.ratios.reduce((out, d) => out += d, 0);
  const matchedWhole = matchAgent2(partToPartRatio.whole, a);
  return {
    kind: "cont",
    agent: (matchedWhole || nth2 != null) && targetPartIndex != -1 ? partToPartRatio.parts[targetPartIndex] : partToPartRatio.whole,
    entity: a.entity,
    quantity: matchedWhole ? a.quantity / partsSum * partToPartRatio.ratios[targetPartIndex] : a.quantity / partToPartRatio.ratios[sourcePartIndex] * (nth2 != null ? partToPartRatio.ratios[targetPartIndex] : partsSum),
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
    options: [
      { tex: `${formatNumber2(a.quantity)} / ${partsSum} * ${formatNumber2(partToPartRatio.ratios[targetPartIndex])}`, result: formatNumber2(result.quantity), ok: matchedWhole },
      { tex: `${formatNumber2(a.quantity)} / ${formatNumber2(partToPartRatio.ratios[sourcePartIndex])} * ${nth2 != null ? partToPartRatio.ratios[targetPartIndex] : partsSum}`, result: formatNumber2(result.quantity), ok: !matchedWhole }
    ]
  };
}
function mapRatiosByFactorEx2(multi, quantity) {
  return { ...multi, ratios: multi.ratios.map((d) => d * quantity) };
}
function mapRatiosByFactor2(multi, quantity) {
  const result = mapRatiosByFactorEx2(multi, quantity);
  return {
    question: `${quantity > 1 ? "Rozn\xE1sob " : "Zkra\u0165 "} pom\u011Br \u010D\xEDslem ${formatNumber2(quantity)}`,
    result,
    options: []
  };
}
function matchAgent2(d, a) {
  return d === a.agent;
}
function partEqualEx2(a, b) {
  const diff = compDiff2(b.agent, a.quantity > 0 ? a.agentB : a.agentA, Math.abs(a.quantity), a.entity);
  const rest = diffRuleEx2(b, diff);
  return {
    ...rest,
    quantity: rest.quantity / 2
  };
}
function partEqual2(a, b) {
  const diff = compDiff2(b.agent, a.quantity > 0 ? a.agentB : a.agentA, Math.abs(a.quantity), a.entity);
  const result = partEqualEx2(a, b);
  return {
    question: containerQuestion2(result),
    result,
    options: [
      { tex: `(${formatNumber2(b.quantity)} - ${formatNumber2(diff.quantity)}) / 2`, result: formatNumber2((b.quantity - diff.quantity) / 2), ok: b.agent === diff.agentMinuend },
      { tex: `(${formatNumber2(b.quantity)} + ${formatNumber2(diff.quantity)}) / 2`, result: formatNumber2((b.quantity + diff.quantity) / 2), ok: b.agent !== diff.agentMinuend }
    ]
  };
}
function nthTermRuleEx2(a, b) {
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
    options: [
      { tex: formatSequence2(b.type, a.quantity), result: formatNumber2(result.quantity), ok: true }
    ]
  };
}
function nthPositionRuleEx2(a, b, newEntity = "nth") {
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
    options: [
      { tex: "Dle vzorce", result: formatNumber2(result.quantity), ok: true }
    ]
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
  if (last22?.kind === "sum" || last22?.kind === "product" || last22?.kind === "lcd" || last22?.kind === "gcd" || (last22?.kind === "sequence" || last22?.kind === "ratios" && args.length > 3)) {
    const arr = [a, b].concat(rest.slice(0, -1));
    return last22.kind === "sequence" ? sequenceRule2(arr) : last22.kind === "gcd" ? gcdRule2(arr, last22) : last22.kind === "lcd" ? lcdRule2(arr, last22) : last22.kind === "product" ? productRule2(arr, last22) : last22.kind === "sum" ? sumRule2(arr, last22) : last22.kind === "ratios" ? toRatios2(arr, last22) : null;
  } else if (a.kind === "cont" && b.kind == "cont") {
    const kind = last22?.kind;
    return kind === "comp-diff" ? toComparisonDiff2(a, b) : kind === "diff" ? toDifference2(a, b, last22) : kind === "quota" ? toQuota2(a, b) : kind === "delta" ? toTransfer2(a, b, last22) : kind === "pythagoras" ? pythagorasRule2(a, b, last22) : kind === "rate" ? toRate2(a, b) : kind === "ratios" ? toRatios2([a, b], last22) : kind === "comp-ratio" ? toRatioComparison2(a, b, last22) : kind === "ratio" ? toPartWholeRatio2(a, b) : toComparison2(a, b);
  } else if ((a.kind === "cont" || a.kind === "comp") && b.kind === "unit") {
    return convertToUnit2(a, b);
  } else if (a.kind === "unit" && (b.kind === "cont" || b.kind === "comp")) {
    return convertToUnit2(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-angle") {
    return compareAngleRule2(a, b);
  } else if (a.kind === "comp-angle" && b.kind === "cont") {
    return compareAngleRule2(b, a);
  } else if (a.kind === "ratio" && b.kind === "ratio") {
    const kind = last22?.kind;
    return kind === "diff" ? toDifferenceAsRatio2(a, b, last22) : kind === "comp-ratio" ? toComparisonRatio2(a, b) : toComparisonAsRatio2(a, b);
  } else if (a.kind === "comp" && b.kind === "cont") {
    const kind = last22?.kind;
    return kind === "comp-part-eq" ? partEqual2(a, b) : compareRule2(b, a);
  } else if (a.kind === "cont" && b.kind === "comp") {
    const kind = last22?.kind;
    return kind === "comp-part-eq" ? partEqual2(b, a) : compareRule2(a, b);
  } else if (a.kind === "cont" && b.kind == "rate") {
    return rateRule2(a, b);
  } else if (a.kind === "rate" && b.kind == "cont") {
    return rateRule2(b, a);
  } else if (a.kind === "comp" && b.kind == "comp-ratio") {
    return compRatioToCompRule2(b, a);
  } else if (a.kind === "comp-ratio" && b.kind == "comp") {
    return compRatioToCompRule2(a, b);
  } else if (a.kind === "proportion" && b.kind == "ratios") {
    return proportionRatiosRule2(b, a);
  } else if (a.kind === "ratios" && b.kind == "proportion") {
    return proportionRatiosRule2(a, b);
  } else if (a.kind === "proportion" && b.kind == "comp-ratio") {
    return proportionRule2(b, a);
  } else if (a.kind === "comp-ratio" && b.kind == "proportion") {
    return proportionRule2(a, b);
  } else if (a.kind === "cont" && b.kind == "quota") {
    return quotaRule2(a, b);
  } else if (a.kind === "quota" && b.kind == "cont") {
    return quotaRule2(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "cont") {
    return ratioCompareRule2(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-ratio") {
    return ratioCompareRule2(a, b);
  } else if (a.kind === "comp-ratio" && b.kind === "ratio") {
    return comparisonRatioRule2(a, b);
  } else if (a.kind === "ratio" && b.kind === "comp-ratio") {
    return comparisonRatioRule2(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "ratios") {
    return comparisonRatiosRule2(a, b);
  } else if (a.kind === "ratios" && b.kind === "comp-ratio") {
    return comparisonRatiosRule2(b, a);
  } else if (a.kind === "cont" && b.kind === "ratio") {
    return partToWholeRule2(a, b);
  } else if (a.kind === "ratio" && b.kind === "cont") {
    return partToWholeRule2(b, a);
  } else if (a.kind === "complement" && b.kind === "ratio") {
    return ratioComplementRule2(a, b);
  } else if (a.kind === "ratio" && b.kind === "complement") {
    return ratioComplementRule2(b, a);
  } else if (a.kind === "cont" && b.kind == "ratios") {
    const kind = last22?.kind;
    return kind === "factorBy" ? mapRatiosByFactor2(b, a.quantity) : kind === "simplify" ? mapRatiosByFactor2(b, 1 / a.quantity) : kind === "nth-part" ? partToPartRule2(a, b, last22) : partToPartRule2(a, b);
  } else if (a.kind === "ratios" && b.kind == "cont") {
    const kind = last22?.kind;
    return kind === "factorBy" ? mapRatiosByFactor2(a, b.quantity) : kind === "simplify" ? mapRatiosByFactor2(a, 1 / b.quantity) : kind === "nth-part" ? partToPartRule2(b, a, last22) : partToPartRule2(b, a);
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
  } else if (a.kind === "comp" && b.kind === "comp") {
    return compareToCompareRule2(b, a);
  } else {
    return null;
  }
}
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
  return `Vypo\u010Dti ${d.agent}${formatEntity2(d)}?`;
}
function combineQuestion2(d) {
  return `Vypo\u010Dti ${d.agent}${formatEntity2(d)}?`;
}
function toGenerAgent2(a, entity3 = "") {
  return cont2(a.entity, a.quantity, entity3);
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
function formatSequence2(type, n) {
  const simplify = (d, op = "") => d !== 1 ? `${d}${op}` : "";
  if (type.kind === "arithmetic")
    return `${type.sequence[0]} + ${type.commonDifference}(${formatNumber2(n)}-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements2(first, second, type.secondDifference);
    let parts = [`${simplify(A, "*")}${formatNumber2(n)}^2^`];
    if (B !== 0) {
      parts = parts.concat(`${simplify(B, "*")}${formatNumber2(n)}`);
    }
    if (C !== 0) {
      parts = parts.concat(`${simplify(C, "*")}${formatNumber2(n)}`);
    }
    return `${parts.map((d, i) => `${i !== 0 ? " + " : ""}${d}`).join(" ")}`;
  }
  if (type.kind === "geometric") {
    return `${simplify(type.sequence[0], "*")}${type.commonRatio}^(${formatNumber2(n)}-1)^`;
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
function trunc2(x) {
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
      trunc2(this["s"] * places * this["n"] / this["d"]) + (places * this["n"] % this["d"] > C_ZERO2 && this["s"] >= C_ZERO2 ? C_ONE2 : C_ZERO2),
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
      trunc2(this["s"] * places * this["n"] / this["d"]) - (places * this["n"] % this["d"] > C_ZERO2 && this["s"] < C_ZERO2 ? C_ONE2 : C_ZERO2),
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
      trunc2(this["s"] * places * this["n"] / this["d"]) + this["s"] * ((this["s"] >= C_ZERO2 ? C_ONE2 : C_ZERO2) + C_TWO2 * (places * this["n"] % this["d"]) > this["d"] ? C_ONE2 : C_ZERO2),
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
    let k = trunc2(n / d);
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
    str += trunc2(N / D);
    N %= D;
    N *= C_TEN2;
    if (N)
      str += ".";
    if (cycLen) {
      for (let i = cycOff; i--; ) {
        str += trunc2(N / D);
        N %= D;
        N *= C_TEN2;
      }
      str += "(";
      for (let i = cycLen; i--; ) {
        str += trunc2(N / D);
        N %= D;
        N *= C_TEN2;
      }
      str += ")";
    } else {
      for (let i = dec; N && i--; ) {
        str += trunc2(N / D);
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
      let whole = trunc2(n / d);
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
      let whole = trunc2(n / d);
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
      res.push(trunc2(a / b));
      let t = a % b;
      a = b;
      b = t;
    } while (a !== C_ONE2);
    return res;
  },
  "simplify": function(eps) {
    const ieps = BigInt(1 / (eps || 1e-3) | 0);
    const thisABS = this["abs"]();
    const cont22 = thisABS["toContinued"]();
    for (let i = 1; i < cont22.length; i++) {
      let s = newFraction2(cont22[i - 1], C_ONE2);
      for (let k = i - 2; k >= 0; k--) {
        s = s["inverse"]()["add"](cont22[k]);
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
      const ratio4 = (_b = anchor[destination.system]) === null || _b === void 0 ? void 0 : _b.ratio;
      if (typeof transform === "function") {
        result = transform(result);
      } else if (typeof ratio4 === "number") {
        result *= ratio4;
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
  unitAnchor: (unit) => convert2().getUnit(unit)?.unit?.to_anchor
});
function axiomInput2(predicate, label) {
  return {
    ...predicate,
    ...{
      labelKind: "input",
      label
    }
  };
}
function deduceLbl2(value) {
  return {
    labelKind: "deduce",
    label: value
  };
}
function isPredicate2(node) {
  return node.kind != null;
}
function last2(input) {
  return input.children[input.children.length - 1];
}
function deduce2(...children) {
  return to2(...children.concat(inferenceRule2.apply(null, children.map((d) => isPredicate2(d) ? d : d.children.slice(-1)[0]))));
}
function to2(...children) {
  return { children };
}
function toCont2(child, { agent }) {
  const node = isPredicate2(child) ? child : last2(child);
  if (!(node.kind == "cont" || node.kind === "transfer" || node.kind == "comp" || node.kind === "comp-diff" || node.kind === "rate" || node.kind === "quota")) {
    throw `Non convertable node type: ${node.kind}`;
  }
  const typeNode = node;
  return to2(child, cont2(agent, typeNode.quantity, typeNode.kind == "rate" ? typeNode.entity.entity : typeNode.entity, typeNode.kind == "rate" ? typeNode.entity.unit : typeNode.unit));
}
function connectTo(node, input) {
  let inputState = {
    node: { children: input.children.map((d) => ({ ...d })) },
    used: false
  };
  const connect = function(node2, input2) {
    if (isPredicate2(node2)) {
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
  formatQuantity: (d) => d.toLocaleString("cs-CZ"),
  formatRatio: (d, asPercent) => asPercent ? `${(d * 100).toLocaleString("cs-CZ")}%` : d.toLocaleString("cs-CZ"),
  formatEntity: (d, unit) => {
    const res = [unit, d].filter((d2) => d2 != null).join(" ");
    return isEmptyOrWhiteSpace(res) ? "" : `__${res.trim()}__`;
  },
  formatAgent: (d) => `**${d}**`,
  formatSequence: (d) => `${formatSequence22(d)}`
};
function formatSequence22(type) {
  const simplify = (d, op = "") => d !== 1 ? `${d}${op}` : "";
  if (type.kind === "arithmetic")
    return `${type.sequence.join()} => a^n^ = ${type.sequence[0]} + ${type.commonDifference}(n-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements2(first, second, type.secondDifference);
    const parts = [`${simplify(A)}n^2^`];
    if (B !== 0) {
      parts.concat(`${simplify(B)}n`);
    }
    if (C !== 0) {
      parts.concat(`${simplify(C)}n`);
    }
    return `${type.sequence.join()} => a^n^ = ${parts.map((d, i) => `${i !== 0 ? " + " : ""}${d}`)}`;
  }
  if (type.kind === "geometric") {
    return `${type.sequence.join()} => a^n^ = ${simplify(type.sequence[0], "*")}${type.commonRatio}^(n-1)^`;
  }
}
function formatPredicate(d, formatting) {
  const { formatKind, formatAgent, formatEntity: formatEntity22, formatQuantity, formatRatio: formatRatio22, formatSequence: formatSequence3, compose } = { ...mdFormatting, ...formatting };
  if ((d.kind == "ratio" || d.kind == "transfer" || d.kind === "comp-ratio" || d.kind === "rate" || d.kind === "quota" || d.kind === "comp-diff" || d.kind === "comp-part-eq" || d.kind === "ratio-c" || d.kind === "ratios-c") && (d.quantity == null && d.ratio == null)) {
    return formatKind(d);
  }
  let result = "";
  switch (d.kind) {
    case "cont":
      result = compose`${formatAgent(d.agent)}=${formatQuantity(d.quantity)} ${formatEntity22(d.entity, d.unit)}`;
      break;
    case "comp":
      result = d.quantity === 0 ? compose`${formatAgent(d.agentA)} je rovno ${formatAgent(d.agentB)}` : compose`${formatAgent(d.agentA)} ${d.quantity > 0 ? "v\xEDce" : "m\xE9n\u011B"} než ${formatAgent(d.agentB)} o ${formatQuantity(Math.abs(d.quantity))} ${formatEntity22(d.entity, d.unit)}`;
      break;
    case "transfer":
      result = d.quantity === 0 ? compose`${formatAgent(d.agentReceiver.name)} je rovno ${formatAgent(d.agentSender.name)}` : d.agentReceiver === d.agentSender ? compose`změna o ${formatQuantity(d.quantity)} ${formatEntity22(d.entity, d.unit)} mezi ${formatAgent(d.agentSender.nameBefore)} a ${formatAgent(d.agentSender.nameAfter)}` : compose`${formatQuantity(Math.abs(d.quantity))} ${formatEntity22(d.entity, d.unit)}, ${formatAgent(d.quantity > 0 ? d.agentSender.name : d.agentReceiver.name)} => ${formatAgent(d.quantity > 0 ? d.agentReceiver.name : d.agentSender.name)}`;
      break;
    case "comp-ratio":
      const between = d.ratio > 1 / 2 && d.ratio < 2;
      result = between ? compose`${formatAgent(d.agentA)} ${d.ratio < 1 ? "m\xE9n\u011B" : "v\xEDce"} o ${formatRatio22(d.ratio > 1 ? d.ratio - 1 : 1 - d.ratio, d.asPercent)} než ${formatAgent(d.agentB)} ` : compose`${formatAgent(d.agentA)} ${formatRatio22(d.ratio > 1 ? Math.abs(d.ratio) : 1 / Math.abs(d.ratio), false)} krát ${d.ratio > 1 ? "v\xEDce" : "m\xE9n\u011B"} než ${formatAgent(d.agentB)} `;
      break;
    case "comp-diff":
      result = compose`${formatAgent(d.agentMinuend)} - ${formatAgent(d.agentSubtrahend)}=${formatQuantity(d.quantity)} ${formatEntity22(d.entity, d.unit)}`;
      break;
    case "ratio":
      result = compose`${formatAgent(d.part)} z ${formatAgent(d.whole)}=${formatRatio22(d.ratio, d.asPercent)}`;
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
      result = compose`${formatQuantity(d.quantity)} ${formatEntity22(d.entity.entity, d.entity.unit)} per ${formatEntity22(d.entityBase.entity, d.entityBase.unit)}`;
      break;
    case "quota":
      result = compose`${formatAgent(d.agent)} rozděleno na ${formatQuantity(d.quantity)} ${formatAgent(d.agentQuota)} ${d.restQuantity !== 0 ? ` se zbytkem ${formatAgent(d.restQuantity)}` : ""}`;
      break;
    case "sequence":
      result = compose`${d.type != null ? formatSequence3(d.type) : ""}`;
      break;
    case "nth-part":
      result = compose`${formatAgent(d.agent)}`;
      break;
    case "nth":
      result = compose`${formatEntity22(d.entity)}`;
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
      result = compose`${formatAngle2(d.relationship)}`;
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

// src/math/M7A-2023/cetar.ts
function build({ input }) {
  const agent = "rota";
  const kapitanLabel = "kapit\xE1n";
  const porucikLabel = "poru\u010D\xEDk";
  const cetarLabel = "\u010Deta\u0159";
  const vojinLabel = "voj\xEDn";
  const entity3 = "osob";
  const kapitan = axiomInput2(cont(agent, input.kapitan, kapitanLabel), 1);
  const porucik = axiomInput2(cont(agent, input.porucik, porucikLabel), 2);
  const cetarPerPorucik = axiomInput2(rate(agent, input.cetarPerPorucik, cetarLabel, porucikLabel), 3);
  const vojinPerCetar = axiomInput2(rate(agent, input.vojinPerCetar, vojinLabel, cetarLabel), 4);
  const vydaneRozkazy = sum("vydan\xE9 rozkazy", [kapitanLabel, porucikLabel, cetarLabel], entity3, entity3);
  const dostaneRozkazy = sum("p\u0159ijat\xE9 rozkazy", [porucikLabel, cetarLabel, vojinLabel], entity3, entity3);
  const pocetCetaru = deduce2(
    porucik,
    cetarPerPorucik
  );
  const pocetVojinu = deduce2(
    pocetCetaru,
    vojinPerCetar
  );
  const dTree2 = deduce2(
    kapitan,
    porucik,
    last2(pocetCetaru),
    vydaneRozkazy
  );
  const dTree3 = deduce2(
    porucik,
    last2(pocetCetaru),
    last2(pocetVojinu),
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
  const p1p2 = axiomInput2(compRelative(piece2, piece1, -1 / 4), 2);
  const p1 = axiomInput2(cont(piece1, input.cena, entity3), 1);
  const p2Ratio = ratio(piece1, piece2, 3 / 4);
  const p3Ratio = ratio(totalPrice, partTotalPrice, 2 / 3);
  const oneThird = axiomInput2(ratio(totalPrice, piece3, 1 / 3), 3);
  const soucet = sum(partTotalPrice, [], "K\u010D", "K\u010D");
  const dd1 = inferenceRule(p1, p2Ratio);
  const dd2 = inferenceRule(p1, dd1, soucet);
  const dd3 = inferenceRule(dd2, p3Ratio);
  const deductionTree = deduce2(
    { ...dd1, ...deduceLbl2(2) },
    deduce2(
      deduce2(
        deduce2(
          p1,
          deduce2(
            p1,
            p1p2
          ),
          soucet
        ),
        deduce2(
          oneThird,
          ctorComplement(partTotalPrice)
        )
      ),
      oneThird
    )
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
  10.2: trideni_odpadu().plast,
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
          sum("fotbal a volejbal", [], entity3, entity3)
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
      toCont(
        deduce(
          triangleSum,
          deduce(
            deduce(axiomInput(cont(inputAngleLabel, 40, entity3), 2), compAngle(inputAngleLabel, `${triangle} u vrcholu B`, "alternate")),
            deduce(
              axiomInput(cont(inputAngleLabel, 70, entity3), 1),
              compAngle(inputAngleLabel, `${triangle} u vrcholu A`, "supplementary")
            ),
            sum("dvojice \xFAhl\u016F v troj\xFAheln\xEDku", [], entity3, entity3)
          ),
          ctor("comp-diff")
        ),
        { agent: `${triangle} u vrcholu D` }
      ),
      compAngle(`${triangle} u vrcholu D`, "\u03C6", "supplementary")
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
      sum("obsah sedmi\xFAheln\xEDku", [], entity2d, entity2d)
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
      axiomInput(cont("cel\xE1 kniha", 1200, "stran"), 1),
      deducePercent
    )
  };
}
function example_15_2() {
  const entity3 = "K\u010D";
  const compare = axiomInput(comp("dosp\u011Bl\xE9 vstupn\xE9", "d\u011Btsk\xE9 vstupn\xE9", 210, entity3), 2);
  return {
    deductionTree: deduce(deduce(
      axiomInput(compPercent("d\u011Btsk\xE9 vstupn\xE9", "dosp\u011Bl\xE9 vstupn\xE9", 70), 1),
      compare
    ), compare)
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
        sum("p\u0159i\u0161lo celkem", [], entity3, entity3)
      ),
      ctor("comp-diff")
    )
  };
}

// src/math/M7A-2024/1.ts
function porovnatAaB({ input }) {
  const entity3 = "";
  const a = axiomInput2(cont("a", input.a, entity3), 1);
  const b = axiomInput2(cont("b", input.b, entity3), 2);
  const rozdil = deduce2(
    a,
    b,
    ctor("comp-diff")
  );
  return {
    deductionTree: deduce2(
      deduce2(
        a,
        b,
        sum("sou\u010Det", ["a", "b"], entity3, entity3)
      ),
      to2(
        rozdil,
        cont("rozd\xEDl", last2(rozdil).quantity, entity3)
      ),
      ctor("comp-ratio")
    )
  };
}
function najitMensiCislo({ input }) {
  const entity3 = "";
  const a = axiomInput2(cont("zadan\xE9 \u010D\xEDslo", input.zadane, entity3), 1);
  const comparsion = axiomInput2(comp("hledan\xE9 \u010D\xEDslo", "zadan\xE9 \u010D\xEDslo", -input.mensiO, entity3), 2);
  return {
    deductionTree: deduce2(
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
  const ctverec = axiomInput2(cont("\u010Dtverec a", input.ctverec.a, entity3, unit), 3);
  return {
    deductionTree: deduce2(
      deduce2(
        axiomInput2(cont("obd\xE9ln\xEDk a", input.obdelnik.a, entity3, unit), 1),
        axiomInput2(cont("obd\xE9ln\xEDk b", input.obdelnik.b, entity3, unit), 2),
        product("obsah obd\xE9ln\xEDk", ["a", "b"], unit2d, entity3)
      ),
      deduce2(
        ctverec,
        ctverec,
        product("obsah \u010Dtverec", ["a", "a"], unit2d, entity3)
      ),
      ctor("comp-ratio")
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
      cont("vzd\xE1lenost mezi zadan\xFDmi \u010D\xEDsly", last(rozdil).quantity, entityLength)
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
  const mensi = axiomInput2(cont("men\u0161\xED zadan\xE9 \u010D\xEDslo", input.mensiCislo, entityLength), 1);
  const vetsi = axiomInput2(cont("v\u011Bt\u0161\xED zadnan\xE9 \u010D\xEDslo", input.vetsiCislo, entityLength), 2);
  const pocetUseku = axiomInput2(cont("vzd\xE1lenost mezi zadan\xFDmi \u010D\xEDsly", input.pocetUsekuMeziCisly, "\xFAsek"), 3);
  const positionA = axiomInput2(cont("posun A", input.A, entity3), 1);
  const positionB = axiomInput2(cont("posun B", input.B, entity3), 1);
  const positionC = axiomInput2(cont("posun C", input.C, entity3), 1);
  const usekRate = cislaNaOse({ mensi, vetsi, pocetUseku });
  const rozdilPostion = deduce2(positionB, positionA, ctor("comp-diff"));
  const dd1 = deduce2(deduce2(positionC, usekRate), mensi, sum("pozice C", [], entityLength, entityLength));
  const dd2 = deduce2(deduce2(deduce2(positionB, last2(usekRate)), mensi, sum("pozice B", [], entityLength, entityLength)), mensi, ctor("comp-ratio"));
  const dd3 = deduce2(to2(rozdilPostion, cont("rozd\xEDl", last2(rozdilPostion).quantity, entity3)), last2(usekRate));
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
  const zdravotnik = axiomInput2(cont(agent, input.zdravotnik, zdravotniLabel), 1);
  const kucharPerZdravotnik = axiomInput2(rate(agent, input.kucharPerZdravotnik, kucharLabel, zdravotniLabel), 2);
  const vedouciPerKuchar = axiomInput2(rate(agent, input.vedouciPerKuchar, vedouciLabel, kucharLabel), 3);
  const instruktorPerVedouci = axiomInput2(rate(agent, input.instruktorPerVedouci, instruktorLabel, vedouciLabel), 4);
  const ditePerInstruktor = axiomInput2(rate(agent, input.ditePerInstruktor, diteLabel, instruktorLabel), 5);
  const kuchari = deduce2(
    zdravotnik,
    kucharPerZdravotnik
  );
  const vedouci = deduce2(
    kuchari,
    vedouciPerKuchar
  );
  const instruktori = deduce2(
    vedouci,
    instruktorPerVedouci
  );
  const dTree1 = deduce2(
    instruktori,
    last2(vedouci),
    sum("vedouc\xEDch a instruktor\u016F", [vedouciLabel, instruktorLabel], entity3, entity3)
  );
  const dTree1Result = last2(dTree1);
  const dTree2 = deduce2(
    instruktori,
    last2(kuchari),
    ctor("comp-ratio")
  );
  const dTree2Result = last2(dTree2);
  const dTree3 = deduce2(
    instruktori,
    ditePerInstruktor
  );
  const dTree3Result = last2(dTree3);
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
    pocetVedoucichAInstruktoru: { deductionTree: dTree1, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template1}` },
    porovnaniInstrukturuAKucharek: { deductionTree: dTree2, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template2}` },
    pocetDeti: { deductionTree: dTree3, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template3}` }
  };
}

// src/math/M7A-2024/pocet-sportovcu.ts
function build4({ input }) {
  const entity3 = "sportovc\u016F";
  const dvojice = axiomInput2(cont("dvojice", 2, entity3), 1);
  const trojice = axiomInput2(cont("trojice", 3, entity3), 2);
  const ctverice = axiomInput2(cont("\u010Dtve\u0159ice", 4, entity3), 3);
  const petice = axiomInput2(cont("p\u011Btice", 5, entity3), 4);
  const lcdLabel = "nejmen\u0161\xED mo\u017En\xE1 skupina";
  const nasobek = lcd(lcdLabel, entity3);
  const dd1 = inferenceRule(dvojice, trojice, ctverice, petice, nasobek);
  const rozdil = axiomInput2(compDiff("po\u010Det sportovc\u016F", lcdLabel, 1, entity3), 5);
  const dd2 = inferenceRule(dd1, rozdil);
  const deductionTree = deduce2(
    deduce2(
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
  const total = axiomInput2(cont(celkem, input.pocetHlav, hlava), 1);
  const perHlava = rate(celkem, 1, hlava, entity3);
  const slepicePlus = axiomInput2(comp(kralik, slepice, -input.kralikuMene, entity3), 2);
  const deductionTree = deduce2(
    deduce2(
      deduce2(total, perHlava),
      slepicePlus,
      ctor("comp-part-eq")
    ),
    slepicePlus
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
    ditePerInstruktor: 2
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
    deductionTree: deduce2(
      axiomInput2(percent("koupali\u0161t\u011B loni", "koupali\u0161t\u011B letos", 80), 1),
      axiomInput2(cont("koupali\u0161t\u011B letos", 680, entity3), 2)
    )
  };
}
function cestovni_kancelar() {
  const entity3 = "klient\u016F";
  return {
    deductionTree: deduce2(
      axiomInput2(cont("\u010Derven", 330, entity3), 1),
      axiomInput2(compPercent("\u010Derven", "\u010Dervenec", 100 - 40), 2)
    )
  };
}
function pozemek() {
  const skutecnost = "skute\u010Dnost";
  const mapa = "pl\xE1n";
  const entity3 = "";
  return {
    deductionTree: deduce2(
      deduce2(
        axiomInput2(ratios("pozemek m\u011B\u0159\xEDtko", [mapa, skutecnost], [1, 3e3]), 1),
        axiomInput2(cont(mapa, 15, entity3, "cm"), 2),
        nthPart(skutecnost)
      ),
      ctorUnit("m")
    )
  };
}
function krouzky() {
  const entity3 = "d\u011Bti";
  const entityPercent3 = "%";
  const basketabal = cont("basketbal", 16, entityPercent3);
  const tanecni = cont("tane\u010Dn\xED", 15, entityPercent3);
  const lezeckaStena = cont("lezeck\xE1 st\u011Bna", 25, entityPercent3);
  const bezKrouzku = cont("\u017E\xE1dn\xFD krou\u017Eek", 6, entityPercent3);
  const celek = cont("celek", 100, entityPercent3);
  const florbalPocet = cont("florbal", 114, entity3);
  const florbalDiff = deduce2(
    celek,
    deduce2(
      bezKrouzku,
      basketabal,
      tanecni,
      lezeckaStena,
      sum(`zadan\xE9 \xFAdaje`, [], entityPercent3, entityPercent3)
    ),
    ctor("comp-diff")
  );
  const celekPocet = deduce2(
    to2(florbalDiff, percent("celek", "florbal", last2(florbalDiff).quantity)),
    florbalPocet
  );
  return {
    divkyAnglictina: {
      deductionTree: deduce2(
        celekPocet,
        deduce2(
          last2(celekPocet),
          percent("celek", "\u017E\xE1dn\xFD krou\u017Eek", 6)
        ),
        ctor("comp-diff")
      )
    },
    pocetZaku: {
      deductionTree: deduce2(
        last2(celekPocet),
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
  const doubleBeta = deduce2(
    cont(inputAngleLabel, 2, betaEntity),
    compAngle(inputAngleLabel, `${triangle} u vrcholu A`, "alternate")
  );
  return {
    deductionTree: deduce2(
      deduce2(
        deduce2(
          toCont2(
            deduce2(
              triangleSum,
              deduce2(
                axiomInput2(cont(inputAngleLabel, 105, entity3), 1),
                compAngle(inputAngleLabel, `${triangle} u vrcholu C`, "supplementary")
              ),
              ctor("comp-diff")
            ),
            { agent: `beta` }
          ),
          deduce2(
            doubleBeta,
            cont(`${triangle} u vrcholu B`, 1, betaEntity),
            sum("beta", [], betaEntity, betaEntity)
          ),
          ctor("rate")
        ),
        last2(doubleBeta)
      ),
      compAngle(`${triangle} u vrcholu A`, "alfa", "supplementary")
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
  13.2: trideni_odpadu().plast,
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
      sum("celkem u\u010Dastn\xEDk\u016F", [], entity3, entity3)
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
      sum("nav\u0161t\u011Bvuje v\xEDce krou\u017Ek\u016F", [], entity3, entity3)
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
        sum("po\u010Det d\u011Bt\xED", [], entity3, entity3)
      )
    }
  };
}
function desitiuhelnik() {
  const squareSizeLabel = "strana \u010Dtverce";
  const entity3 = "cm";
  const entity2d = "cm2";
  const rectangleWidthLabel = "\u0161\xED\u0159ka obdeln\xEDka";
  const triangleWidthLabel = " nejdel\u0161\xED stran\u011B troj\u016Fheln\xEDku";
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
    commonSense("2 \u010Dtverce tvo\u0159\xED v\xFD\u0161ku b\xEDl\xE9ho rovnostrann\xE9ho troj\u016Fheln\xEDku"),
    cont("v\xFD\u0161ka \u0161ed\xE9ho troj\xFAheln\xEDku", 2 * 4, entity3)
  );
  const triangleHeight = to(
    commonSense("t\u0159i \u010Dtverce tvo\u0159\xED nejkrat\u0161\xED stran\u011B troj\u016Fheln\xEDku"),
    cont("v\xFD\u0161ka \u0161ed\xE9ho troj\xFAheln\xEDku", 3 * 4, entity3)
  );
  const triangleWidth = to(
    axiomInput(cont("nejdel\u0161\xED strana desiti\xFAheln\xEDk", 20, entity3), 2),
    commonSense("tato d\xE9lka odpov\xEDd\xE1 nejdel\u0161\xED stran\u011B troj\u016Fheln\xEDku"),
    cont(triangleWidthLabel, 20, entity3)
  );
  const whiteTriangleSize = to(
    squareSize,
    commonSense("2 \u010Dtverce tvo\u0159\xED stranu b\xEDl\xE9ho rovnostrann\xE9ho troj\u016Fheln\xEDku"),
    cont("strana b\xEDl\xFD troj\xFAheln\xEDk", 2 * 4, entity3)
  );
  return {
    whiteTriangle: {
      deductionTree: deduce(
        whiteTriangleSize,
        cont("po\u010Det stran troj\xFAheln\xEDku", 3, ""),
        product("obvod", [], entity3, entity3)
      )
    },
    grayRectangle: {
      deductionTree: deduce(
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
        sum("obvod", [], entity3, entity3)
      )
    },
    grayTriangle: {
      deductionTree: deduce(
        triangleHeight,
        triangleWidth,
        deduce(
          last(triangleWidth),
          last(squareSize),
          ctor("comp-diff")
        ),
        sum("obvod", [], entity3, entity3)
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
      )
    },
    minimalCube: {
      deductionTree: deduce(
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
      box,
      deduce(giftToBox, last(box)),
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
  const moneyIn = deduce(grandMotherIn, pocketMoneyIn, sum("p\u0159ijato", [], entity3, entity3));
  const moneyOut = deduce(bookCostOut, fatherGiftOut, sum("vyd\xE1no", [], entity3, entity3));
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
        sum("celkem", [], { entity: entity3, unit: minutes }, { entity: entity3, unit: minutes })
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
  const dd1 = deduce(deduce(positionX, usekRate), mensi, sum("pozice X", [], entityLength, entityLength));
  const dd2 = deduce(deduce(positionY, last(usekRate)), mensi, sum("pozice Y", [], entityLength, entityLength));
  const zeroPositionPosun = deduce(mensi, usekRate);
  return { "XandY": { deductionTree: to(dd1, dd2) }, "posun": { deductionTree: zeroPositionPosun } };
}
function novorocniPrani() {
  const entity3 = "p\u0159\xE1n\xED";
  const entityBase = "minuty";
  const spolecne = cont("spole\u010Dn\u011B", 120, entity3);
  return {
    deductionTree: deduce(
      spolecne,
      deduce(
        deduce(cont("Tereza", 14, entity3), cont("Tereza", 5, entityBase), ctor("rate")),
        deduce(cont("Nikola", 10, entity3), cont("Nikola", 5, entityBase), ctor("rate")),
        sum("spole\u010Dn\u011B", [], entity3, entity3)
      )
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
      deductionTree: pocatek
    },
    zeleznicniPrejezd: {
      deductionTree: deduce(
        dobaCesta,
        ratio("cesta", "polovina cesty", 1 / 2)
      )
    },
    konecCesty: {
      deductionTree: deduce(
        deduce(last(pocatek), dobaCesta, sum("\u010Das odjezdu", [], entity3, entity3)),
        cont("posun odjezdu o", 6, entity3),
        sum("posunut\xFD \u010Das p\u0159\xEDjezdu", [], entity3, entity3)
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
          cont("pravideln\xFD \u0161esti\xFAhlen\xEDk", 6, entity3),
          dark,
          ctorDifference("sv\u011Btl\xE1 \u010D\xE1st")
        ),
        dark,
        ctor("comp-ratio")
      ),
      obsah
    )
  };
}
function vyvojObyvatel() {
  const entity3 = "obyvatel";
  const lidovLabel = "Lidov";
  return {
    panov: {
      deductionTree: to(
        cont("p\u0159\xEDr\u016Fstek 2021", 10, entity3)
      )
    },
    lidov: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(lidovLabel, 300, entity3),
            transfer(`p\u0159\xEDr\u016Fstek 2019`, lidovLabel, 10, entity3)
          ),
          transfer(`p\u0159\xEDr\u016Fstek 2020`, lidovLabel, 5, entity3)
        ),
        transfer(lidovLabel, "\xFAbytek 2021", 5, entity3)
      )
    },
    damov: {
      deductionTree: deduce(
        cont("2019", -5, entity3),
        cont("2020", -10, entity3),
        cont("2021", 10, entity3),
        cont("2022", 5, entity3),
        sum("zm\u011Bna obyvatel", ["2019", "2020", "2021", "2022"], entity3, entity3)
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

// src/math/shapes/triangle.ts
function triangleArea({ size, height, triangle }) {
  const agent = triangle.agent;
  const unit = triangle.unit ?? "";
  const entity3 = triangle.entity ?? "obsah";
  const container = size.kind === "cont" ? size : last(size);
  return deduce(
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
  const soucet = sum("obrazec \u010D.7", [], entity3, grayEntity);
  const rule1 = commonSense("V ka\u017Ed\xE9m kroku se p\u0159id\xE1v\xE1 \u0161ed\xFD troj\xFAheln\xEDk do ka\u017Ed\xE9ho b\xEDl\xE9ho troj\xFAheln\xEDku.");
  const rule2 = commonSense("Po\u010Det \u0161ed\xFDch troj\xFAheln\xEDk\u016F v obrazci n je stejn\xFD jako po\u010Det b\xEDl\xFDch troj\xFAheln\xEDk\u016F v p\u0159edchoz\xEDm obrazci");
  const dBase = deduce2(
    ...inputContainers,
    ctor("sequence")
  );
  const dTree1 = deduce2(
    dBase,
    cont(`${agent} \u010D.5`, 5, nthLabel)
  );
  const dTree2 = deduce2(
    deduce2(
      last2(dBase),
      cont(`${agent} \u010D.6`, 6, nthLabel)
    ),
    to2(
      rule1,
      rule2,
      cont(`${agent} \u010D.6`, 121, grayEntity)
    ),
    soucet
  );
  const dTree3 = deduce2(
    to2(
      comp("posledn\xED obrazec", "p\u0159edposledn\xED obrazec", 6561, grayEntity),
      rule1,
      rule2,
      cont("p\u0159edposledn\xED obrazec", 6561, whiteEntity)
    ),
    to2(
      last2(dBase),
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
        cont("vyrobeno 2020", 250, entity3),
        compPercent("vyrobeno 2021", "vyrobeno 2020", 120)
      ),
      compPercent("vyrobeno 2022", "vyrobeno 2021", 120)
    )
  };
}
function dovolenaNaKole() {
  const entity3 = "vzd\xE1lenost";
  const unit = "km";
  return {
    deductionTree: deduce(
      cont("Roman", 400, entity3, unit),
      compRatio("Roman", "Jana", 5 / 4)
    )
  };
}
function propousteniVeFirme() {
  const entity3 = "zam\u011Bstnanec";
  return {
    deductionTree: deduce(
      deduce(
        comp("nov\u011B p\u0159ijato", "konec krize", 42, entity3),
        compPercent("nov\u011B p\u0159ijato", "konec krize", 125)
      ),
      compPercent("konec krize", "po\u010D\xE1tek krize", 60)
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
      podstava,
      last(podstava),
      deduce(last(podstava), compRatio("pl\xE1\u0161\u0165", "podstava", 3)),
      sum("v\xE1lec", ["doln\xED podstava", "horn\xED podstava", "pl\xE1\u0161\u0165"], entity2d, entity2d)
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
        ctorPercent()
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
            deduce(hudebni8, sachovy8, roboticky8, sum("8.", [], entityBase, entityBase)),
            ratios("celkem", ["8.", "9."], [2, 3]),
            nthPart("9.")
          ),
          deduce(hudebni9, sachovy9, sum("9.", [], entityBase, entityBase)),
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
    )
  };
}
function rovinataOblast() {
  const entity3 = "d\xE9lka";
  const plan = "pl\xE1n";
  const skutecnost = "skute\u010Dnost";
  const meritko = deduce(
    cont(plan, 3.5, entity3, "cm"),
    deduce(
      cont(skutecnost, 700, entity3, "m"),
      ctorUnit("cm")
    ),
    ctorRatios("mapa")
  );
  const vychazkovaTrasa = cont("vych\xE1zkov\xE1 trasa", 6, entity3, "km");
  return {
    skutecnost: {
      title: "D\xE9lka trasy na map\u011B a ve skute\u010Dnosti",
      deductionTree: deduce(
        deduce(
          meritko,
          deduce(
            cont(plan, 49, entity3, "mm"),
            ctorUnit("cm")
          ),
          nthPart(skutecnost)
        ),
        ctorUnit("km")
      )
    },
    vychazkovaTrasa: {
      title: "Rozd\xEDl d\xE9lek tras na map\u011B",
      deductionTree: deduce(
        deduce(
          deduce(
            vychazkovaTrasa,
            deduce(
              vychazkovaTrasa,
              compRatio("vych\xE1zkov\xE1 trasa", "p\u0159\xEDm\xE1 trasa", 3)
            ),
            ctorDifference(skutecnost)
          ),
          ctorUnit("cm")
        ),
        last(meritko),
        nthPart(plan)
      )
    },
    meritko: {
      title: "M\u011B\u0159\xEDtko turistick\xE9 mapy",
      deductionTree: deduce(
        last(meritko),
        cont(plan, 3.5, entity3, "cm"),
        ctor("simplify")
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
          bc,
          cont("BF", 6, entity3, unit),
          pythagoras("CF", ["BF", "BC"])
        ),
        ac,
        sum("\xFAhlop\u0159\xED\u010Dka na podlaze (AC) + \xFAhlop\u0159\xED\u010Dka na st\u011Bn\u011B (CF)", ["AC", "CF"], { entity: entity3, unit }, { entity: entity3, unit })
      ),
      cont("stejn\u011B dlouh\xE1 \xFAhlop\u0159\xED\u010Dka na strop\u011B (FH) i stejn\u011B dlouh\xE1 \xFAhlop\u0159\xED\u010Dka na druh\xE9 st\u011Bn\u011B (HA)", 2, ""),
      product("lomen\xE9 \u010D\xE1ry ACFHA", [], { entity: entity3, unit }, { entity: entity3, unit })
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
        sum("obsah ABCD", [], { entity: entity3, unit: unit2D }, { entity: entity3, unit })
      )
    }
  };
}

// src/math/M9A-2024/angle.ts
function rozdilUhlu({ input }) {
  const entity3 = "";
  const beta = axiomInput2(cont("beta", input.beta, entity3), 1);
  const delta = axiomInput2(cont("delta", input.delta, entity3), 2);
  const alfa = deduce2(delta, compAngle("delta", "alfa", "supplementary"));
  const triangleSum = cont("troj\xFAheln\xEDk", 180, entity3);
  const deductionTree = deduce2(
    toCont2(deduce2(
      triangleSum,
      deduce2(
        beta,
        alfa,
        sum("dvojice \xFAhl\u016F v troj\xFAheln\xEDku", ["alfa", "beta"], entity3, entity3)
      ),
      ctor("comp-diff")
    ), { agent: "gama" }),
    last2(alfa),
    ctor("comp-diff")
  );
  return { deductionTree };
}

// src/math/M9A-2024/dum-meritko.ts
function build7({ input }) {
  const skutecnost = "skute\u010Dnost";
  const plan = "pl\xE1n";
  const widthLabel = "\u0161\xED\u0159ka";
  const lengthLabel = "d\xE9lka";
  const entity3 = "";
  const unit = "cm";
  const unit2D = "cm2";
  const width = axiomInput2(cont(`${skutecnost} ${widthLabel}`, input.sirkaM, entity3, "m"), 1);
  const widthOnPlan = axiomInput2(cont(`${plan} ${widthLabel}`, input.planSirkaCM, entity3, unit), 2);
  const lengthOnPlan = axiomInput2(cont(`${plan} ${lengthLabel}`, input.planDelkaDM, entity3, "dm"), 3);
  const dWidth = deduce2(width, ctorUnit(unit));
  const dBase = deduce2(
    widthOnPlan,
    dWidth,
    ctorRatios("m\u011B\u0159\xEDtko")
  );
  const dTree1 = deduce2(
    dBase,
    deduce2(widthOnPlan, last2(dWidth), gcd("nejmen\u0161\xED spole\u010Dn\xFD n\xE1sobek", entity3)),
    ctor("simplify")
  );
  const meritko = { ...last2(dTree1), ...deduceLbl2(3) };
  const dTree2 = deduce2(
    deduce2(lengthOnPlan, ctorUnit(unit)),
    to2(
      meritko,
      commonSense("m\u011B\u0159\xEDtko pl\xE1nu plat\xED pro cel\xFD pl\xE1n, stejn\u011B pro \u0161\xEDrku a d\xE9lku domu"),
      ratios("m\u011B\u0159\xEDtko", [`${plan} ${lengthLabel}`, `${skutecnost} ${lengthLabel}`], meritko.ratios)
    ),
    nthPart(`${skutecnost} ${lengthLabel}`)
  );
  const ddSkutecnost = deduce2(
    dTree2,
    dWidth,
    product(`${skutecnost} obsah`, [lengthLabel, widthLabel], unit2D, entity3)
  );
  const ddPlan = deduce2(
    deduce2(lengthOnPlan, ctorUnit(unit)),
    widthOnPlan,
    product(`${plan} obsah`, [lengthLabel, widthLabel], unit2D, entity3)
  );
  const dTree3 = deduce2(
    deduce2(
      ddPlan,
      ddSkutecnost,
      ctorRatios("m\u011B\u0159\xEDtko")
    ),
    deduce2(ddPlan.children[3], ddSkutecnost.children[3], gcd("nejmen\u0161\xED spole\u010Dn\xFD n\xE1sobek", entity3)),
    ctor("simplify")
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
    { deductionTree: dTree1, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template1}` },
    { deductionTree: dTree2, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template2}` },
    { deductionTree: dTree3, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template3}` }
  ];
}

// src/math/M9A-2024/dva-ctverce.ts
function example({ input }) {
  const ALabel = "strana obdeln\xEDk A";
  const BLabel = "strana obdeln\xEDk B";
  const entity3 = "cm";
  const bocniStrana = commonSense("bo\u010Dn\xED strany obou \u010Dtverc\u016F jsou schodn\xE9, horn\xED a spodn\xED strana obdeln\xEDku maj\xED rozd\xEDl 3");
  const rozdilObvod = axiomInput2(cont("obvod rozd\xEDl", 6, entity3), 1);
  const diffAbsolute = comp(ALabel, BLabel, input.rozdilObvod / 2, entity3);
  const compRel = axiomInput2(compRelative(ALabel, BLabel, 3 / 2), 2);
  const kratsiStran = deduce2(
    to2(rozdilObvod, bocniStrana, diffAbsolute),
    compRel
  );
  const delsiStrana = deduce2(
    deduce2(
      kratsiStran,
      compRel
    ),
    compRatio("del\u0161\xED strana obdeln\xEDk A", ALabel, 2)
  );
  const deductionTree = deduce2(
    delsiStrana,
    cont("\u010Dtverec", 4, "strany"),
    product("obvod \u010Dtverce", ["d\xE9lka strany", "po\u010Det stran"], entity3, entity3)
  );
  return { deductionTree };
}

// src/math/percent/part.ts
function percentPart({ base, percentage }) {
  const celek = cont(base.agent, 100, percentage.entity);
  return deduce2(
    deduce2(
      percentage,
      celek,
      ctor("ratio")
    ),
    base
  );
}

// src/math/M9A-2024/kolo.ts
var entity = "K\u010D";
var entityPercent = "%";
function example3({ input }) {
  const agentPercentBase = "cena";
  const agentPercentPart = "sleva";
  const entity3 = "K\u010D";
  const entityPercent3 = "%";
  const percent2 = cont(agentPercentPart, input.percentageDown, entityPercent3);
  const celek = cont(agentPercentBase, 100, entityPercent3);
  const dd1 = inferenceRule(percent2, celek, ctor("ratio"));
  const dd1Up = axiomInput2(ratio("cena po slev\u011B", "zdra\u017Eeno", input.percentageNewUp / 100), 3);
  const percentBase2 = cont(agentPercentBase, input.base, entity3);
  const dd2 = inferenceRule(percentBase2, dd1);
  const sleva = comp(agentPercentBase, "cena po slev\u011B", dd2.kind === "cont" && dd2.quantity, entity3);
  const dd3 = inferenceRule(sleva, percentBase2);
  const soucet = sum("kone\u010Dn\xE1 cena", ["cena po slev\u011B", "zdra\u017Eeno"], entity3, entity3);
  const percentage = axiomInput2(cont(agentPercentPart, input.percentageDown, entityPercent3), 2);
  const base = axiomInput2(cont(agentPercentBase, input.base, entity3), 1);
  const slevaPart = percentPart({ base, percentage });
  const deductionTree = deduce2(
    deduce2(
      deduce2(
        to2(
          slevaPart,
          sleva
        ),
        base
      ),
      dd1Up
    ),
    { ...dd3, ...deduceLbl2(3) },
    soucet
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
  const vypujceno = axiomInput2(cont("vyp\u016Fj\u010Deno", 2e4, entity), 1);
  const urok = axiomInput2(cont("\xFArok", 13.5, "%"), 2);
  const deductionTree = deduce2(
    percentPart({ base: vypujceno, percentage: urok }),
    vypujceno,
    sum("vr\xE1ceno", ["\xFArok", "vyp\u016Fj\u010Deno"], entity, entity)
  );
  return { deductionTree, template };
}
function example2({ input }) {
  const template = (highlightLabel) => highlightLabel`
  Paní Dlouhá na začátku roku vložila do banky ${input.vlozeno.toLocaleString("cs-CZ")} Kč s roční úrokovou sazbou ${input.urokPercentage} %.
  Výnosy z úroků jsou zdaněny srážkovou daní.
  Kolik korun získá paní Dlouhá navíc ke svému vkladu za jeden rok, bude-li jí odečtena daň z úroků ${input.urokPercentage} %?`;
  const vlozeno = axiomInput2(cont("vklad", input.vlozeno, entity), 1);
  const v\u00FDnos = axiomInput2(cont("v\xFDnos", input.urokPercentage, entityPercent), 2);
  const dan = axiomInput2(cont("da\u0148", input.danPercentage, entityPercent), 3);
  const dBase = percentPart({ base: vlozeno, percentage: v\u00FDnos });
  const deductionTree = deduce2(
    dBase,
    percentPart({ base: { ...dBase.children[dBase.children.length - 1], ...deduceLbl2(2) }, percentage: dan })
  );
  return { deductionTree, template };
}

// src/math/M9A-2024/obrazec.ts
function example4({ input }) {
  const ramenoLabel = "rameno";
  const zakladnaLabel = "z\xE1kladna";
  const obvodLabel = "obvod troj\xFAheln\xEDku";
  const entity3 = "cm";
  const obvod = axiomInput2(cont(obvodLabel, 30, entity3), 1);
  const ramenoCount = axiomInput2(cont("po\u010Det ramen", 4, ""), 2);
  const zakladnaCount = axiomInput2(cont("po\u010Det z\xE1kladen", 3, ""), 3);
  const rameno = deduce2(
    to2(
      commonSense("rameno troj\xFAheln\xEDku je p\u016Fleno vrcholem jin\xE9ho troj\xFAheln\xEDku"),
      ratios(obvodLabel, [zakladnaLabel, ramenoLabel, ramenoLabel], [1, 2, 2])
    ),
    obvod
  );
  const zakladna = deduce2(
    last2(rameno),
    compRatio(ramenoLabel, zakladnaLabel, 2)
  );
  const deductionTree = deduce2(
    deduce2(
      rameno,
      ramenoCount,
      product("obvod obrazce (ramena)", ["d\xE9lka ramena", "po\u010Det stran"], entity3, entity3)
    ),
    deduce2(
      zakladna,
      zakladnaCount,
      product("obvod obrazce (zakladny)", ["d\xE9lka z\xE1kladny", "po\u010Det stran"], entity3, entity3)
    ),
    sum("obvod obrazce", [], entity3, entity3)
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
  const aPrevious = axiomInput2(cont(agentPrevious, input.previousWorker, entityA), 1);
  const aCurrent = axiomInput2(cont(agentCurrent, input.currentWorker, entityA), 3);
  const bPrevious = axiomInput2(cont(agentPrevious, input.previousHours, entityB), 2);
  const comp2 = compRatio(agentNew, agentCurrent, 3 / 2);
  const deductionTree = deduce2(
    deduce2(
      deduce2(
        deduce2(
          aCurrent,
          aPrevious,
          ctor("comp-ratio")
        ),
        proportion(true, [`\u0161vadleny`, `hodiny`])
      ),
      bPrevious
    ),
    deduce2(
      comp2,
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
    cont("2 * PI", 2 * pi().quantity, ""),
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
    sum("obsah pl\xE1\u0161t\u011B", [], entity2D, entity2D)
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
  const width = axiomInput2(cont(`\u0161ed\xE1 tanga \u0161\xED\u0159ka`, input.tangaWidth, entity3), 1);
  const widthRectangle = axiomInput2(cont(`${rectangleLabel} \u0161\xED\u0159ka`, input.tangaWidth, entity3), 1);
  const ratio4 = compRatio(`\u0161ed\xE1 tanga \u0161\xED\u0159ka`, `${circelPartLabel} ${radiusLabel}`, 2);
  const dRadius = deduce2(width, ratio4);
  const obsah = surfaceBaseArea({ radius: last2(dRadius) }, {
    surfaceBaseAreaLabel: areaCircleLabel,
    entity2D: entity2d
  });
  const dd1 = deduce2(
    deduce2(
      widthRectangle,
      to2(
        dRadius,
        commonSense(`${radiusLabel} = ${reactangleHeight}`),
        cont(reactangleHeight, dRadius.children[2].quantity, entity3)
      ),
      product(`${rectangleLabel} obsah`, [], entity2d, entity3)
    ),
    deduce2(
      cont(`2 kr\xE1t ${circelPartLabel}`, 2, ""),
      deduce2(
        obsah,
        compRatio(areaCircleLabel, circelPartLabel, 4)
      ),
      product(`dvojice ${circelPartLabel}`, [], entity2d, entity2d)
    )
  );
  const obvod = baseCircumference(
    { radius: last2(dRadius) },
    { baseCircumferenceLabel: baseCircleLabel }
  );
  const obvodCvrtkruh = deduce2(obvod, compRatio(baseCircleLabel, circelPartLabel, 4));
  const dd2 = deduce2(
    obvodCvrtkruh,
    last2(obvodCvrtkruh),
    width,
    sum(`obvod \u0161ed\xE9ho obrazce`, [circelPartLabel, circelPartLabel, "\u0161\xED\u0159ka"], entity3, entity3)
  );
  return [{ deductionTree: dd1 }, { deductionTree: dd2 }];
}

// src/math/M9A-2024/tezitko.ts
function build10({ input }) {
  const agentOut = "\u010Dir\xE9 sklo";
  const agentIn = "modr\xE9 sklo";
  const entity3 = "cm";
  const outRadius = axiomInput2(cont(`${agentOut} podstava polom\u011Br`, input.out.radius, entity3), 1);
  const outHeight = axiomInput2(cont(`${agentOut} v\xE1lec v\xFD\u0161ka`, input.out.height, entity3), 2);
  const inRadius = axiomInput2(cont(`${agentIn} podstava polom\u011Br`, input.in.radius, entity3), 3);
  const inHeight = axiomInput2(cont(`${agentIn} v\xE1lec v\xFD\u0161ka`, input.in.height, entity3), 4);
  const outCylinder = cylinder({ radius: outRadius, height: outHeight }, { surfaceBaseAreaLabel: `${agentOut} obsah`, volumeLabel: `${agentOut} objem` });
  const inCylinder = cylinder({ radius: inRadius, height: inHeight }, { surfaceBaseAreaLabel: `${agentIn} obsah`, volumeLabel: `${agentIn} objem` });
  const deductionTree = deduce2(
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
  const chlapci = axiomInput2(cont(celkemAgent, input.chlapci, entityChlapci), 1);
  const chlapciDiff = axiomInput2(compDiff(celkemAgent, skupinaDE, input.anglictinaChlapci, entityChlapci), 2);
  const de = axiomInput2(cont(skupinaDE, input.nemcinaDivky, entityDivky), 3);
  const dBase = deduce2(
    deduce2(
      chlapci,
      chlapciDiff
    ),
    de,
    sum(skupinaDE, [], entity3, entity3)
  );
  const dTree1 = deduce2(
    to2(
      dBase,
      commonSense("angli\u010Dtina a n\u011Bm\u010Dina - stejn\xFD po\u010Det \u017E\xE1k\u016F"),
      cont(skupinaEN, input.chlapci - input.anglictinaChlapci + input.nemcinaDivky, entity3)
    ),
    compDiff(skupinaEN, entityDivky, input.anglictinaChlapci, entity3)
  );
  const dTree2 = to2(
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
  const pocet = axiomInput2(cont("desiti\xFAheln\xEDk", input.pocetUhlu, pocetUhlu), 1);
  const minUhel = deduce2(celkem, pocet, ctor("rate"));
  const alfa = deduce2(minUhel, cont("alfa", 2, pocetUhlu));
  const triangleSum = cont(rovnoramennyTrojLabel, 180, entity3);
  const uhelRamenaRovnoramennehoTrojuhelniku = ({ vrcholovyUhel: vrcholovyUhel2 }, { uhelRamenoLabel }) => toCont2(
    deduce2(
      toCont2(deduce2(
        triangleSum,
        vrcholovyUhel2,
        ctor("comp-diff")
      ), { agent: "ob\u011B ramena" }),
      cont("ob\u011B ramena", 2, pocetUhlu),
      ctor("rate")
    ),
    { agent: uhelRamenoLabel ?? "\xFAhel ramena" }
  );
  const vrcholovyUhel = toCont2(
    deduce2(last2(minUhel), cont(vrcholovyUhelLabel, 3, pocetUhlu)),
    { agent: vrcholovyUhelLabel }
  );
  const beta = connectTo(uhelRamenaRovnoramennehoTrojuhelniku(
    {
      vrcholovyUhel: last2(vrcholovyUhel)
    },
    { uhelRamenoLabel: "beta" }
  ), vrcholovyUhel);
  const gama = deduce2(
    last2(alfa),
    uhelRamenaRovnoramennehoTrojuhelniku(
      {
        vrcholovyUhel: cont(vrcholovyUhelLabel, last2(minUhel).quantity, entity3)
      },
      { uhelRamenoLabel: "gama" }
    )
  );
  return [{ deductionTree: alfa }, { deductionTree: beta }, { deductionTree: gama }];
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
function domecek({ input }) {
  const entity3 = "cm";
  const dumLabel = "dome\u010Dek";
  const entity2d = "\u010Dtvere\u010Dk\u016F";
  const entity3d = "krychli\u010Dek";
  const area = axiomInput2(cont(`plocha ${dumLabel}`, input.baseSurfaceArea, entity2d), 1);
  const pasmo = axiomInput2(quota(`plocha ${dumLabel}`, "\u010Dtverec", 4), 2);
  const ctverec = deduce2(
    area,
    pasmo
  );
  const strana = to2(
    ctverec,
    commonSense(`rozklad na prvo\u010D\xEDsla:${primeFactorization([last2(ctverec).quantity]).join(",")}`),
    cont("\u0161\xED\u0159ka", 2, entity3)
  );
  const rectangleVolume = connectTo(volume({ width: last2(strana), height: cont("v\xFD\u0161ka", 2, entity3), length: cont("d\xE9lka", 8, entity3) }, { volumeLabel: "objem p\u0159\xEDzem\xED" }), strana);
  const deductionTree = deduce2(
    rectangleVolume,
    deduce2({ ...last2(rectangleVolume), ...deduceLbl2(3) }, ratio("objem p\u0159\xEDzem\xED", "objem st\u0159echa", 1 / 2)),
    sum("objem dome\u010Dek", [], entity3d, entity3)
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
  const plnaKrabicePocet = axiomInput2(cont(plnaKrabiceLabel, input.pocetKusuVKrabice, vyrobekEntity), 1);
  const plnaKrabiceVyrobkuPocet = axiomInput2(cont(plnaKrabiceVyrobkyLabel, input.pocetKusuVKrabice, vyrobekEntity), 1);
  const missingVyrobkyPocet = axiomInput2(cont(missingVyrobkyLabel, input.missingVyrobku, vyrobekEntity), 2);
  const triKrabice = axiomInput2(cont(triKrabiceABezPetiLabel, 2e3, entity3), 3);
  const rozdil = axiomInput2(compDiff(triKrabiceABezPetiLabel, `2 ${plnaKrabiceLabel}`, 480, entity3), 4);
  const deductionTree1 = deduce2(
    deduce2(triKrabice, rozdil),
    cont(`2 ${plnaKrabiceLabel}`, 2, vyrobekEntity),
    ctor("rate")
  );
  const rozdilGram = deduce2(
    deduce2(
      { ...last2(deductionTree1), ...deduceLbl2(2) },
      cont(`3 ${plnaKrabiceLabel}`, 3, vyrobekEntity)
    ),
    triKrabice
  );
  const deductionTree2 = deduce2(
    to2(
      rozdilGram,
      cont(missingVyrobkyLabel, last2(rozdilGram).quantity, entity3)
    ),
    missingVyrobkyPocet,
    ctor("rate")
  );
  const deductionTree3 = deduce2(
    to2(
      { ...last2(deductionTree1), ...deduceLbl2(2) },
      cont(plnaKrabiceLabel, last2(deductionTree1).quantity, entity3)
    ),
    deduce2(
      { ...last2(deductionTree2), ...deduceLbl2(4) },
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
  const rozdilRuze = axiomInput2(comp(ruzeAgent, staticAgent, 2, kusEntity), 1);
  const RtoS = axiomInput2(compRatio(ruzeAgent, staticAgent, 5 / 4), 2);
  const CHxS = axiomInput2(ratios(kyticeAgent, [chryzatemaAgent, staticAgent], [3, 2]), 3);
  const ruzeRate = axiomInput2(rate(chryzatemaAgent, input.cenaZaKus.ruze, entity3, kusEntity), 4);
  const chryzantemaRate = axiomInput2(rate(chryzatemaAgent, input.cenaZaKus.chryzantema, entity3, kusEntity), 5);
  const staticeRate = axiomInput2(rate(chryzatemaAgent, input.cenaZaKus.statice, entity3, kusEntity), 6);
  const statice = deduce2(
    rozdilRuze,
    RtoS
  );
  const chryzantem = deduce2(
    last2(statice),
    CHxS,
    nthPart(chryzatemaAgent)
  );
  const ruze = deduce2(
    statice,
    rozdilRuze
  );
  return {
    audio: true,
    deductionTree: deduce2(
      deduce2(ruze, ruzeRate),
      deduce2(last2(statice), staticeRate),
      deduce2(chryzantem, chryzantemaRate),
      sum(kyticeAgent, [ruzeAgent, chryzatemaAgent, staticAgent], entity3, entity3)
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
  const rows = axiomInput2(cont(lowerRectLabel, input.pocetRad, rowLabel), 1);
  const columns = axiomInput2(cont(hiherRectLabel, input.pocetSloupcu, columnLabel), 1);
  const rule = axiomInput2(commonSense("po\u010Det \u0159ad je v\u017Edy o 1 vy\u0161\u0161\xED ne\u017E po\u010Det sloupc\u016F"), 2);
  const dd1 = deduce2(
    to2(
      rows,
      rule,
      cont(lowerRectLabel, input.pocetRad - 1, columnLabel)
    ),
    rows,
    product(hiherRectLabel, [rowLabel, columnLabel], columnLabel, entity3)
  );
  const dd2 = to2(
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

// src/math/percent/base.ts
function percentBase({ part, percentage }, labels = {}) {
  const { baseAgent } = { ...{ baseAgent: "z\xE1klad" }, ...labels };
  const celek = cont(baseAgent, 100, percentage.entity);
  return deduce2(
    deduce2(
      percentage,
      celek,
      ctor("ratio")
    ),
    part
  );
}

// src/math/M9I-2025/nadoba.ts
var entity2 = "litr\u016F";
var entityPercent2 = "%";
function objemNadoby1({ input }) {
  const percentage = axiomInput2(ratio("celkem", "zapln\u011Bno", input.zaplnenoPomer), 1);
  const part = axiomInput2(cont("zbytek", input.zbyva, entity2), 2);
  const deductionTree = deduce2(
    deduce2(percentage, ctorComplement("zbytek")),
    part
  );
  return { deductionTree };
}
function objemNadoby2({ input }) {
  const percentage = axiomInput2(cont("p\u016Fvodn\u011B zapln\u011Bno", input.zaplnenoProcento, entityPercent2), 1);
  const odebrano = axiomInput2(comp("p\u016Fvodn\u011B zapln\u011Bno", "nov\u011B zapln\u011Bno", input.odebrano, entity2), 2);
  const zaplnenoPoOddebrani = axiomInput2(ratio("celek", "nov\u011B zapln\u011Bno", input.zaplnenoPoOdebraniRatio), 3);
  const celek = cont("celek", 100, entityPercent2);
  const deductionTree = deduce2(deduce2(
    deduce2(
      percentage,
      deduce2(zaplnenoPoOddebrani, celek)
    ),
    odebrano
  ), celek);
  return { deductionTree };
}
function objemNadoby3({ input }) {
  const nadoba1 = axiomInput2(cont("n\xE1doba 1", input.nadoba1Procent, entityPercent2), 1);
  const nadoba2 = axiomInput2(cont("n\xE1doba 2", input.nadoba2Procent, entityPercent2), 2);
  const nadoba3Perc = axiomInput2(cont("n\xE1doba 3", 40, entityPercent2), 2);
  const nadoba3 = axiomInput2(cont("n\xE1doba 3", input.nadoba3, entity2), 3);
  const prumer = axiomInput2(ratio("n\xE1doba celkem", "napln\u011Bno pr\u016Fm\u011Br", input.prumerNadobaRatio), 4);
  const celek = cont("n\xE1doba celkem", 100, entityPercent2);
  const average = deduce2(prumer, celek);
  const nadoba3Percent = deduce2(
    to2(
      deduce2(nadoba1, average),
      transfer("n\xE1doba 3", "n\xE1doba 1", 10, entityPercent2)
    ),
    nadoba3Perc
  );
  return {
    deductionTree: connectTo(percentBase({ part: nadoba3, percentage: last2(nadoba3Percent) }), nadoba3Percent)
  };
}

// src/math/M9I-2025/papirACary.ts
function caryNaPapire({ input }) {
  const entity3 = "\u010D\xE1st";
  const usekLabel = "po\u010Det p\xE1sem";
  const separatorLabel = "po\u010Det \u010Dar";
  const pocetCasti = axiomInput2(cont("po\u010Det \u010D\xE1st\xED", input.pocetCasti, entity3), 1);
  const emptyEntity = "";
  const diff = compDiff(usekLabel, separatorLabel, 1, emptyEntity);
  const dvojice = to2(
    pocetCasti,
    commonSense(`rozklad na prvo\u010D\xEDsla:${primeFactorization([input.pocetCasti]).join(",")}`),
    commonSense(`seskup je do dvojic (2x20), (4x10), (8x5)`),
    commonSense(`najdi dvojici, kter\xE1 m\xE1 nejmen\u0161\xED sou\u010Det = (8x5)`),
    cont(usekLabel, 8, emptyEntity)
  );
  const deductionTree = deduce2(
    deduce2(dvojice, diff),
    deduce2({ ...cont(usekLabel, 5, emptyEntity), ...deduceLbl2(1) }, diff),
    sum(`sou\u010Det \u010Dar`, [], emptyEntity, emptyEntity)
  );
  return { deductionTree };
}

// src/math/M9I-2025/plocha.ts
function porovnani2Ploch({}) {
  const entity3 = "";
  const unit = "cm2";
  return {
    deductionTree: deduce2(
      deduce2(
        axiomInput2(cont("1. plocha", 0.2, entity3, "m2"), 1),
        ctorUnit(unit)
      ),
      axiomInput2(cont("2. plocha", 20, entity3, unit), 2)
    )
  };
}

// src/math/M9I-2025/index.ts
var krabiceParams = { pocetKusuVKrabice: 12, missingVyrobku: 5 };
var M9I_2025_default = {
  1: porovnani2Ploch({ input: {} }),
  // 6.1: okurkyASalaty({ input: { okurky: 36 } })[0],
  // 6.2: okurkyASalaty({ input: { okurky: 36 } })[1],
  7.1: plnaKrabice({ input: krabiceParams })[0],
  7.2: plnaKrabice({ input: krabiceParams })[1],
  7.3: plnaKrabice({ input: krabiceParams })[2],
  11.1: desetiuhelnik({ input: { pocetUhlu: 10 } })[0],
  11.2: desetiuhelnik({ input: { pocetUhlu: 10 } })[1],
  11.3: desetiuhelnik({ input: { pocetUhlu: 10 } })[2],
  12: kytice({ input: { cenaZaKus: { ruze: 54, chryzantema: 40, statice: 35 } } }),
  13: caryNaPapire({ input: { pocetCasti: 40 } }),
  14: domecek({ input: { baseSurfaceArea: 16, quota: 4 } }),
  15.1: objemNadoby1({ input: { zbyva: 14, zaplnenoPomer: 3 / 5 } }),
  15.2: objemNadoby2({ input: { zaplnenoProcento: 55, odebrano: 12, zaplnenoPoOdebraniRatio: 1 / 4 } }),
  15.3: objemNadoby3({ input: { nadoba1Procent: 30, nadoba2Procent: 40, nadoba3: 19, prumerNadobaRatio: 2 / 5 } }),
  16.1: letajiciCtverecky({ input: { pocetRad: 21, pocetSloupcu: 110 } })[0],
  16.2: letajiciCtverecky({ input: { pocetRad: 21, pocetSloupcu: 110 } })[1]
};

// src/math/word-problems.ts
var word_problems_default = {
  "M5A-2023": M5A_2023_default,
  "M5A-2024": M5A_2024_default,
  "M7A-2023": M7A_2023_default,
  "M7A-2024": M7A_2024_default,
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
  "M9I-2025": M9I_2025_default
};
export {
  word_problems_default as default,
  formatPredicate,
  formatSequencePattern,
  inferenceRuleWithQuestion2 as inferenceRuleWithQuestion
};

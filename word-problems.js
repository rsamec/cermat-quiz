// src/components/math.ts
var RelativeEntity = " ";
function isAgentEntity(d) {
  return d.agent != null;
}
function ctor(kind) {
  return { kind };
}
function ctorPartToWholeDiff(part) {
  return { kind: "ratio-diff", part };
}
function cont(agent, quantity, entity2) {
  return { kind: "cont", agent, quantity, entity: entity2 };
}
function pi() {
  return { kind: "cont", agent: "PI", quantity: 3.14, entity: "" };
}
function comp(agentA, agentB, quantity, entity2) {
  return { kind: "comp", agentA, agentB, quantity, entity: entity2 };
}
function compRelative(agentA, agentB, quantity) {
  if (quantity <= -1 && quantity >= 1) {
    throw "Relative compare should be between (-1,1).";
  }
  return compRatio(agentA, agentB, 1 + quantity);
}
function compRatio(agentA, agentB, quantity, entity2) {
  return { kind: "comp-ratio", agentA, agentB, quantity, entity: entity2 ?? RelativeEntity };
}
function compDiff(agentMinuend, agentSubtrahend, quantity, entity2) {
  return { kind: "comp-diff", agentMinuend, agentSubtrahend, quantity, entity: entity2 };
}
function ratio(whole, part, ratio4) {
  return { kind: "ratio", whole, part, ratio: ratio4 };
}
function sum(wholeAgent, partAgents, wholeEntity, partEntity) {
  return { kind: "sum", wholeAgent, partAgents, wholeEntity: { entity: wholeEntity }, partEntity: { entity: partEntity } };
}
function product(wholeAgent, partAgents, wholeEntity, partEntity) {
  return { kind: "product", wholeAgent, partAgents, wholeEntity: { entity: wholeEntity }, partEntity: { entity: partEntity } };
}
function gcd(agent, entity2) {
  return { kind: "gcd", agent, entity: entity2 };
}
function lcd(agent, entity2) {
  return { kind: "lcd", agent, entity: entity2 };
}
function nth(entity2) {
  return { kind: "nth", entity: entity2 };
}
function rate(agent, quantity, entity2, entityBase) {
  return { kind: "rate", agent, quantity, entity: { entity: entity2 }, entityBase: { entity: entityBase } };
}
function commonSense(description) {
  return { kind: "common-sense", agent: description };
}
function compareRule(a, b) {
  if (a.agent == b.agentB) {
    return { kind: "cont", agent: b.agentA, quantity: a.quantity + b.quantity, entity: a.entity };
  } else if (a.agent == b.agentA) {
    return { kind: "cont", agent: b.agentB, quantity: a.quantity + -1 * b.quantity, entity: a.entity };
  }
}
function ratioCompareRule(a, b) {
  if (!(a.agent == b.agentA || a.agent == b.agentB)) {
    throw `Mismatch agent ${a.agent} any of ${b.agentA}, ${b.agentB}`;
  }
  if (a.agent == b.agentB) {
    return { kind: "cont", agent: b.agentA, quantity: a.quantity * b.quantity, entity: a.entity };
  } else if (a.agent == b.agentA) {
    return { kind: "cont", agent: b.agentB, quantity: a.quantity / b.quantity, entity: a.entity };
  }
}
function transferRule(a, b) {
  if (a.entity == b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return { kind: "cont", agent: a.agent, quantity: a.quantity + b.quantity, entity: a.entity };
}
function diffPartToWholeRule(a, b) {
  return {
    kind: "ratio",
    whole: b.whole,
    ratio: 1 - b.ratio,
    part: a.part
  };
}
function diffPartToPartRule(a, b) {
  if (b.ratio > 1) {
    throw `Part to part ratio should be less than 1.`;
  }
  return {
    kind: "ratios",
    whole: b.whole,
    ratios: [b.ratio, 1 - b.ratio],
    parts: [b.part, a.part]
  };
}
function compPartToWholeRule(a, b) {
  const quantity = Math.abs(a.quantity);
  return {
    kind: "ratio",
    whole: { agent: a.agentB, entity: a.entity },
    ratio: a.quantity > 0 ? 1 + quantity : 1 - quantity,
    part: { agent: a.agentA, entity: a.entity }
  };
}
function compRatioPartToWholeRule(a, b) {
  const quantity = Math.abs(a.quantity);
  return {
    kind: "ratio",
    whole: { agent: a.agentB, entity: a.entity },
    ratio: a.quantity > 0 ? 1 * quantity : 1 / quantity,
    part: { agent: a.agentA, entity: a.entity }
  };
}
function compRatioToCompRule(a, b) {
  return {
    kind: "cont",
    agent: b.agentA,
    entity: b.entity,
    quantity: a.quantity * (b.quantity > 0 ? b.quantity - 1 : 1 + 1 / b.quantity)
  };
}
function partToWholeRule(a, b) {
  const isSame = isSameEntity(b);
  if (!(matchEntity(b.whole, a, isSame) || matchEntity(b.part, a, isSame))) {
    throw `Mismatch entity ${[a.agent, a.entity].join()} any of ${[b.whole, b.part].map((d) => formatAgentEntity(d)).join()}`;
  }
  return matchEntity(b.whole, a, isSame) ? { kind: "cont", ...toAgentEntity(b.part, a, isSame), quantity: a.quantity * b.ratio } : { kind: "cont", ...toAgentEntity(b.whole, a, isSame), quantity: a.quantity / b.ratio };
}
function rateRule(a, rate5) {
  if (!(a.entity === rate5.entity.entity || a.entity === rate5.entityBase.entity)) {
    throw `Mismatch entity ${a.entity} any of ${rate5.entity.entity}, ${rate5.entityBase.entity}`;
  }
  return {
    kind: "cont",
    agent: a.agent,
    entity: a.entity == rate5.entity.entity ? rate5.entityBase.entity : rate5.entity.entity,
    quantity: a.entity == rate5.entity.entity ? a.quantity / rate5.quantity : a.quantity * rate5.quantity
  };
}
function quotaRule(a, quota) {
  if (!(a.agent === quota.agent || a.agent === quota.agentQuota)) {
    throw `Mismatch entity ${a.entity} any of ${quota.agent}, ${quota.agentQuota}`;
  }
  return {
    kind: "cont",
    agent: a.agent === quota.agentQuota ? quota.agent : quota.agentQuota,
    entity: a.entity,
    quantity: a.agent === quota.agentQuota ? a.quantity * quota.quantity : a.quantity / quota.quantity
  };
}
function toPartWholeRatio(part, whole) {
  return {
    kind: "ratio",
    part: { agent: part.agent, entity: part.entity },
    whole: { agent: whole.agent, entity: whole.entity },
    ratio: part.quantity / whole.quantity
  };
}
function diffRule(a, b) {
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
function sumRule(items, b) {
  return { kind: "cont", agent: b.wholeAgent, quantity: items.reduce((out, d) => out += d.quantity, 0), entity: b.wholeEntity.entity };
}
function productRule(items, b) {
  return { kind: "cont", agent: b.wholeAgent, quantity: items.reduce((out, d) => out *= d.quantity, 1), entity: b.wholeEntity.entity };
}
function gcdRule(items, b) {
  return { kind: "cont", agent: b.agent, quantity: gcdCalc(items.map((d) => d.quantity)), entity: b.entity };
}
function lcdRule(items, b) {
  return { kind: "cont", agent: b.agent, quantity: lcdCalc(items.map((d) => d.quantity)), entity: b.entity };
}
function sequenceRule(items) {
  if (new Set(items.map((d) => d.entity)).size > 1) {
    throw `Mismatch entity ${items.map((d) => d.entity).join()}`;
  }
  const type = sequencer(items.map((d) => d.quantity));
  return { kind: "sequence", type, entity: items[0].entity };
}
function toComparison(a, b) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return { kind: "comp", agentB: a.agent, agentA: b.agent, quantity: b.quantity - a.quantity, entity: a.entity };
}
function toRatioComparison(a, b) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return { kind: "comp-ratio", agentB: a.agent, agentA: b.agent, quantity: b.quantity / a.quantity, entity: a.entity };
}
function compareToCompareRule(a, b) {
  return {
    kind: "rate",
    agent: a.agentA,
    quantity: Math.abs(a.quantity) / Math.abs(b.quantity),
    entity: { entity: a.entity },
    entityBase: { entity: b.entity }
  };
}
function toDiff(a, b) {
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
function toRate(a, b) {
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
function toQuota(a, quota) {
  if (a.entity !== quota.entity) {
    throw `Mismatch entity ${a.entity}, ${quota.entity}`;
  }
  const { groupCount, remainder } = divide(a.quantity, quota.quantity);
  return {
    kind: "quota",
    agentQuota: quota.agent,
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
function toRatios(a, b, whole) {
  return {
    kind: "ratios",
    parts: [
      whole != null ? toAgentEntity(whole, a, true) : a,
      whole != null ? toAgentEntity(whole, b, true) : b
    ],
    ratios: [a.quantity, b.quantity],
    whole
  };
}
function partToPartRule(a, parts) {
  const firstEntity = parts.parts[0];
  const lastEntity = parts.parts[parts.parts.length - 1];
  if (!(parts.whole != null && matchEntity(parts.whole, a) || matchEntity(lastEntity, a) || matchEntity(firstEntity, a))) {
    throw `Mismatch entity ${[a.agent, a.entity].join()} any of ${[parts.whole, lastEntity, firstEntity].map((d) => formatAgentEntity(d)).join()}`;
  }
  const partsSum = parts.ratios.reduce((out, d) => out += d, 0);
  const isFirst = matchEntity(firstEntity, a);
  const itemRatio = isFirst ? parts.ratios[0] : parts.ratios[parts.ratios.length - 1];
  const isWhole = parts.whole != null && matchEntity(parts.whole, a);
  return {
    kind: "cont",
    ...toAgentEntity(isWhole ? lastEntity : parts.whole != null ? parts.whole : isFirst ? lastEntity : firstEntity, a),
    quantity: isWhole ? a.quantity / partsSum * itemRatio : a.quantity / itemRatio * (parts.whole != null ? partsSum : isFirst ? parts.ratios[parts.ratios.length - 1] : parts.ratios[0])
  };
}
function mapRatiosByFactor(multi, quantity) {
  return { ...multi, ratios: multi.ratios.map((d) => d * quantity) };
}
function isSameEntity(d) {
  return toEntity(d.whole) === toEntity(d.part);
}
function toEntity(d) {
  return isAgentEntity(d) ? d.entity : d;
}
function matchEntity(entity2, value, isSameEntity2 = false) {
  const d = toAgentEntity(entity2, value);
  return (isSameEntity2 || value.entity === d.entity) && value.agent === d.agent;
}
function toAgentEntity(entity2, value, inheritValueEntity = false) {
  return isAgentEntity(entity2) ? inheritValueEntity ? { ...entity2, entity: value.entity } : entity2 : inheritValueEntity ? { agent: value.agent, entity: value.entity } : { agent: value.agent, entity: entity2 };
}
function formatAgentEntity(d) {
  return isAgentEntity(d) ? [d.agent, d.entity].join() : d;
}
function partEqual(a, b) {
  const rest = diffRule(b, compDiff(b.agent, a.quantity > 0 ? a.agentB : a.agentA, Math.abs(a.quantity), a.entity));
  return {
    ...rest,
    quantity: rest.quantity / 2
  };
}
function nthTermRule(a, b) {
  const [first, second] = b.type.sequence;
  return {
    kind: "cont",
    agent: a.agent,
    entity: b.entity,
    quantity: b.type.kind === "arithmetic" ? first + (a.quantity - 1) * b.type.commonDifference : b.type.kind === "quadratic" ? nthQuadraticElementFromDifference(first, second, b.type.secondDifference, a.quantity) : b.type.kind === "geometric" ? first * Math.pow(b.type.commonRatio, a.quantity - 1) : NaN
  };
}
function nthPositionRule(a, b, newEntity = "nth") {
  const { kind, sequence } = b.type;
  const [first, second] = sequence;
  return {
    kind: "cont",
    agent: a.agent,
    entity: newEntity,
    quantity: kind === "arithmetic" ? Math.round((a.quantity - first) / b.type.commonDifference) + 1 : kind === "quadratic" ? findPositionInQuadraticSequence(a.quantity, first, second, b.type.secondDifference) : kind === "geometric" ? Math.round(Math.log(a.quantity / first) / Math.log(b.type.commonRatio)) + 1 : NaN
  };
}
function inferenceRule(...args) {
  const [a, b, ...rest] = args;
  const last3 = rest?.length > 0 ? rest[rest.length - 1] : null;
  if (last3?.kind === "sum" || last3?.kind === "product" || last3?.kind === "lcd" || last3?.kind === "gcd" || last3?.kind === "sequence" && args.length > 3) {
    const arr = [a, b].concat(rest.slice(0, -1));
    return last3.kind === "sequence" ? sequenceRule(arr) : last3.kind === "gcd" ? gcdRule(arr, last3) : last3.kind === "lcd" ? lcdRule(arr, last3) : last3.kind === "product" ? productRule(arr, last3) : last3.kind === "sum" ? sumRule(arr, last3) : null;
  } else if (a.kind === "cont" && b.kind == "cont") {
    const kind = last3?.kind;
    return kind === "comp-diff" ? toDiff(a, b) : kind === "quota" ? toQuota(a, b) : kind === "rate" ? toRate(a, b) : kind === "ratios" ? toRatios(a, b, last3.whole) : kind === "comp-ratio" ? toRatioComparison(a, b) : kind === "ratio" ? toPartWholeRatio(a, b) : toComparison(a, b);
  } else if (a.kind === "comp" && b.kind === "cont") {
    const kind = last3?.kind;
    return kind === "comp-part-eq" ? partEqual(a, b) : compareRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp") {
    const kind = last3?.kind;
    return kind === "comp-part-eq" ? partEqual(b, a) : compareRule(a, b);
  } else if (a.kind === "cont" && b.kind == "rate") {
    return rateRule(a, b);
  } else if (a.kind === "rate" && b.kind == "cont") {
    return rateRule(b, a);
  } else if (a.kind === "ratio" && b.kind == "comp") {
    return compPartToWholeRule(b, a);
  } else if (a.kind === "comp" && b.kind == "ratio") {
    return compPartToWholeRule(a, b);
  } else if (a.kind === "ratio" && b.kind == "comp-ratio") {
    return compRatioPartToWholeRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind == "ratio") {
    return compRatioPartToWholeRule(a, b);
  } else if (a.kind === "comp" && b.kind == "comp-ratio") {
    return compRatioToCompRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind == "comp") {
    return compRatioToCompRule(a, b);
  } else if (a.kind === "cont" && b.kind == "quota") {
    return quotaRule(a, b);
  } else if (a.kind === "quota" && b.kind == "cont") {
    return quotaRule(b, a);
  } else if (a.kind === "comp-ratio" && b.kind === "cont") {
    return ratioCompareRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-ratio") {
    return ratioCompareRule(a, b);
  } else if (a.kind === "cont" && b.kind === "ratio") {
    return partToWholeRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "cont") {
    return partToWholeRule(b, a);
  } else if (a.kind === "ratio-diff" && b.kind === "ratio") {
    return diffPartToWholeRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "ratio-diff") {
    return diffPartToWholeRule(b, a);
  } else if (a.kind === "ratios-diff" && b.kind === "ratio") {
    return diffPartToPartRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "ratios-diff") {
    return diffPartToPartRule(b, a);
  } else if (a.kind === "cont" && b.kind == "ratios") {
    const kind = last3?.kind;
    return kind === "simplify" ? mapRatiosByFactor(b, 1 / a.quantity) : partToPartRule(a, b);
  } else if (a.kind === "ratios" && b.kind == "cont") {
    const kind = last3?.kind;
    return kind === "simplify" ? mapRatiosByFactor(a, 1 / b.quantity) : partToPartRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-diff") {
    return diffRule(a, b);
  } else if (a.kind === "comp-diff" && b.kind === "cont") {
    return diffRule(b, a);
  } else if (a.kind === "sequence" && b.kind === "cont") {
    const kind = last3?.kind;
    return kind === "nth" ? nthPositionRule(b, a, last3.entity) : nthTermRule(b, a);
  } else if (a.kind === "cont" && b.kind === "sequence") {
    const kind = last3?.kind;
    return kind === "nth" ? nthPositionRule(a, b, last3.entity) : nthTermRule(a, b);
  } else if (a.kind === "cont" && b.kind === "transfer") {
    return transferRule(a, b);
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

// src/math/M7A-2023/cetar.ts
function build({ input }) {
  const agent = "rota";
  const kapitanLabel = "kapit\xE1n";
  const porucikLabel = "poru\u010D\xEDk";
  const cetarLabel = "\u010Deta\u0159";
  const vojinLabel = "voj\xEDn";
  const entity2 = "osob";
  const kapitan = axiomInput(cont(agent, input.kapitan, kapitanLabel), 1);
  const porucik = axiomInput(cont(agent, input.porucik, porucikLabel), 2);
  const cetarPerPorucik = axiomInput(rate(agent, input.cetarPerPorucik, cetarLabel, porucikLabel), 3);
  const vojinPerCetar = axiomInput(rate(agent, input.vojinPerCetar, vojinLabel, cetarLabel), 4);
  const dd1 = inferenceRule(porucik, cetarPerPorucik);
  const vydaneRozkazy = sum("vydan\xE9 rozkazy", [kapitanLabel, porucikLabel, cetarLabel, vojinLabel], entity2, entity2);
  const dostaneRozkazy = sum("p\u0159ijat\xE9 rozkazy", [porucikLabel, cetarLabel, vojinLabel], entity2, entity2);
  const dTree1 = deduce(
    porucik,
    { ...dd1, ...deduceLbl(1) },
    deduce(
      deduce(
        porucik,
        cetarPerPorucik
      ),
      vojinPerCetar
    ),
    dostaneRozkazy
  );
  const template1 = (html) => html`<br/><strong>Kolik osob v rotě dostalo rozkaz k nástupu?</strong>`;
  const template = (highlight) => highlight`V rotě je ${input.kapitan} kapitán a má pod sebou ${input.porucik} poručíky.Každý poručík má pod sebou ${input.cetarPerPorucik} své četaře
a každý četař má pod sebou ${input.vojinPerCetar} svých vojínů. (Další osoby v rotě nejsou.)
Kapitán se rozhodl svolat celou rotu k nástupu.Rozkaz k nástupu se předával tak, že
kapitán vydal rozkaz všem poručíkům, z nichž každý vydal tento rozkaz svým četařům
a každý četař jej vydal svým vojínům.Poté celá rota nastoupila.
  ${template1}`;
  return { deductionTree: dTree1, template };
}

// src/math/M7A-2023/zakusek.ts
function build2({ input }) {
  const piece1 = "1.z\xE1kusek";
  const piece2 = "2.z\xE1kusek";
  const piece3 = "3.z\xE1kusek";
  const entity2 = "K\u010D";
  const whole = "celek";
  const totalPrice = "celkem";
  const partTotalPrice = "1.z\xE1k.+2.z\xE1k";
  const p1p2 = axiomInput(compRelative(piece2, piece1, -1 / 4), 2);
  const p1 = axiomInput(cont(piece1, input.cena, entity2), 1);
  const p2Ratio = ratio({ agent: piece1, entity: entity2 }, { agent: piece2, entity: entity2 }, 3 / 4);
  const p3Ratio = ratio({ agent: totalPrice, entity: entity2 }, { agent: partTotalPrice, entity: entity2 }, 2 / 3);
  const oneThird = axiomInput(ratio({ agent: totalPrice, entity: entity2 }, { agent: piece3, entity: entity2 }, 1 / 3), 3);
  const soucet = sum(partTotalPrice, [], "K\u010D", "K\u010D");
  const dd1 = inferenceRule(p1, p2Ratio);
  const dd2 = inferenceRule(p1, dd1, soucet);
  const dd3 = inferenceRule(dd2, p3Ratio);
  const deductionTree = deduce(
    { ...dd1, ...deduceLbl(2) },
    deduce(
      deduce(
        deduce(
          p1,
          deduce(
            p1,
            deduce(
              p1p2,
              ctor("ratio")
            )
          ),
          soucet
        ),
        deduce(
          oneThird,
          ctorPartToWholeDiff({ agent: partTotalPrice, entity: entity2 })
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
  const template = (highlight) => highlight`
  Maminka koupila v cukrárně tři různé zákusky.
  První zákusek stál ${input.cena} korun.
  Druhý zákusek byl o ${"\u010Dtvrtinu levn\u011Bj\u0161\xED ne\u017E prvn\xED"}.
  Cena třetího zákusku byla ${"t\u0159etinou celkov\xE9 ceny v\u0161ech t\u0159\xED z\xE1kusk\u016F"}.
  ${(html) => html`<br/><strong>O kolik korun byl třetí zákusek dražší než druhý?</strong>`}`;
  return { deductionTree, data, template };
}

// src/math/M7A-2024/pocet-sportovcu.ts
function build3({ input }) {
  const entity2 = "sportovc\u016F";
  const dvojice = axiomInput(cont("dvojice", 2, entity2), 1);
  const trojice = axiomInput(cont("trojice", 3, entity2), 2);
  const ctverice = axiomInput(cont("\u010Dtve\u0159ice", 4, entity2), 3);
  const petice = axiomInput(cont("p\u011Btice", 5, entity2), 4);
  const lcdLabel = "nejmen\u0161\xED mo\u017En\xE1 skupina";
  const nasobek = lcd(lcdLabel, entity2);
  const dd1 = inferenceRule(dvojice, trojice, ctverice, petice, nasobek);
  const rozdil = axiomInput(compDiff("po\u010Det sportovc\u016F", lcdLabel, 1, entity2), 5);
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
  const template = (highlight) => highlight`Počet sportovců na závodech byl více než 1 a zároveň méně než 90. 
  Pořadatel chtěl sportovce seřadit do slavnostního průvodu, ale ať je rozděloval do ${"dvojic"}, ${"trojic"}, ${"\u010Dtve\u0159ic"} nebo ${"p\u011Btic"}, vždy mu ${"jeden"} sportovec zbyl.
  ${(html) => html`<br/><strong>Kolik sportovců se sešlo na závodech?</strong>`}`;
  return { deductionTree, template };
}

// src/math/M7A-2024/letni-tabor.ts
function build4({ input }) {
  const agent = "tabor";
  const zdravotniLabel = "zdravotn\xEDk";
  const kucharLabel = "kucha\u0159ka";
  const vedouciLabel = "vedouc\xED";
  const instruktorLabel = "instruktor";
  const diteLabel = "d\xEDt\u011B";
  const stanLabel = "stanLabel";
  const entity2 = "osob";
  const zdravotnik = axiomInput(cont(agent, input.zdravotnik, zdravotniLabel), 1);
  const kucharPerZdravotnik = axiomInput(rate(agent, input.kucharPerZdravotnik, kucharLabel, zdravotniLabel), 2);
  const vedouciPerKuchar = axiomInput(rate(agent, input.vedouciPerKuchar, vedouciLabel, kucharLabel), 3);
  const instruktorPerVedouci = axiomInput(rate(agent, input.instruktorPerVedouci, instruktorLabel, vedouciLabel), 4);
  const ditePerInstruktor = axiomInput(rate(agent, input.ditePerInstruktor, diteLabel, instruktorLabel), 5);
  const dd1 = inferenceRule(zdravotnik, kucharPerZdravotnik);
  const dd2 = inferenceRule(dd1, vedouciPerKuchar);
  const dd3 = inferenceRule(dd2, instruktorPerVedouci);
  const instruktorAVedouci = sum("vedouc\xEDch a instruktor\u016F", [vedouciLabel, instruktorLabel], entity2, entity2);
  const ddBase = () => deduce(
    deduce(
      deduce(
        zdravotnik,
        kucharPerZdravotnik
      ),
      vedouciPerKuchar
    ),
    instruktorPerVedouci
  );
  const tree1dd4 = inferenceRule(dd3, dd2, instruktorAVedouci);
  const dTree1 = deduce(
    ddBase(),
    { ...dd2, ...deduceLbl(2) },
    instruktorAVedouci
  );
  const tree2dd4 = inferenceRule(
    { ...dd1, entity: "osob" },
    { ...dd3, entity: "osob" },
    ctor("comp-ratio")
  );
  const dTree2 = to(
    { ...dd1, ...deduceLbl(1) },
    ddBase(),
    tree2dd4
  );
  const tree3dd4 = inferenceRule(dd3, ditePerInstruktor);
  const dTree3 = deduce(
    ddBase(),
    ditePerInstruktor
  );
  const templateBase = (highlight) => highlight`Na letním táboře jsou kromě dětí také instruktoři, vedoucí, kuchařky a ${input.zdravotnik} zdravotník.
     Počet zdravotníků a počet kuchařek je v poměru ${`1:${input.kucharPerZdravotnik}`},
     počet kuchařek a vedoucích ${`1:${input.vedouciPerKuchar}`},
     počet vedoucích a instruktorů ${`1:${input.instruktorPerVedouci}`},
     a počet instruktorů a dětí ${`1:${input.ditePerInstruktor}`}.
     Všichni jsou ubytováni ve stanech. Zdravotník je ve stanu sám, ostatní jsou ubytováni po dvou.`;
  const template1 = (html) => html`<br/>
     <strong>Na táboře je dohromady ${tree1dd4.kind == "cont" && tree1dd4.quantity} vedoucích a instruktorů?</strong>`;
  const template2 = (html) => html`<br/>
     <strong>Instruktorů je ${tree2dd4.kind == "comp-ratio" && tree2dd4.quantity} krát více než kuchařek.?</strong>`;
  const template3 = (html) => html`<br/>
    <strong>Na táboře je celkem ${tree3dd4.kind == "cont" && tree3dd4.quantity} dětí?</strong>`;
  return [
    { deductionTree: dTree1, template: (highlight) => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: (highlight) => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: (highlight) => highlight`${() => templateBase(highlight)}${template3}` }
  ];
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
  const partCelkem = "zbytek";
  const entity2 = "zv\xED\u0159e";
  const slepice = "slepice";
  const kralik = "kr\xE1l\xEDk";
  const total = axiomInput(cont(celkem, input.pocetHlav, hlava), 1);
  const perHlava = rate(celkem, 1, hlava, entity2);
  const pomer = ratio({ agent: partCelkem, entity: entity2 }, { agent: kralik, entity: entity2 }, 1 / 2);
  const slepicePlus = axiomInput(comp(kralik, slepice, -input.kralikuMene, entity2), 2);
  const deductionTree = deduce(
    deduce(
      deduce(total, perHlava),
      slepicePlus,
      ctor("comp-part-eq")
    ),
    slepicePlus
  );
  const template = (highlight) => highlight`V ohradě pobíhali králíci a slepice.
  Králíků bylo o ${input.kralikuMene} méně.
  Králíci a slepice měli dohromady ${nohy} nohou a ${input.pocetHlav} hlav.
  ${(html) => html`<br/><strong> Kolik bylo v ohradě slepic?</strong>`}`;
  return { deductionTree, data, template };
}

// src/math/M9A-2024/svadleny.ts
function build6({ input }) {
  const agentPrevious = "p\u016Fvodn\xED zak\xE1zka";
  const agentCurrent = "nov\xE1 zak\xE1zka";
  const agentNew = "roz\u0161\xED\u0159en\xE1 nov\xE1 zak\xE1zka";
  const entityA = "\u0161vadlen";
  const entityB = "hodin";
  const aPrevious = axiomInput(cont(agentPrevious, input.previousWorker, entityA), 1);
  const aCurrent = axiomInput(cont(agentCurrent, input.currentWorker, entityA), 3);
  const dd1 = inferenceRule(aPrevious, aCurrent, ctor("comp-ratio"));
  const cc1 = commonSense("nep\u0159\xEDm\xE1 \xFAm\u011Brnost (m\xE9n\u011B \u0161vadlen - v\xEDce hodin)");
  const cc2 = commonSense("p\u0159\xEDm\xE1 \xFAm\u011Brnost (v\xEDce mno\u017Estv\xED - v\xEDce hodin)");
  const dd2 = compRatio(agentCurrent, agentPrevious, dd1.kind == "comp-ratio" ? 1 / dd1.quantity : 0, entityB);
  const bPrevious = axiomInput(cont(agentPrevious, input.previousHours, entityB), 2);
  const dd3 = inferenceRule(dd2, bPrevious);
  const comp6 = compRatio(agentNew, agentCurrent, 3 / 2, "mno\u017Estv\xED");
  const dd4 = compRatio(agentNew, agentCurrent, 3 / 2, "hodin");
  const dd5 = inferenceRule(dd4, dd3);
  const deductionTree = deduce(
    deduce(
      to(
        deduce(
          aPrevious,
          aCurrent,
          ctor("comp-ratio")
        ),
        cc1,
        dd2
      ),
      bPrevious
    ),
    to(
      comp6,
      cc2,
      dd4
    )
  );
  const template = (highlight) => highlight`${input.previousWorker} švadlen, které šijí oblečení, pracují stejným tempem.
    Tyto švadleny splní danou zakázku za ${input.previousHours} hodin.
    Za jakou dobu splní o polovinu větší zakázku ${input.currentWorker} švadleny?`;
  return { deductionTree, template };
}

// src/math/M9A-2024/trida-skupiny.ts
function build7({ input }) {
  const skupinaEN = "angli\u010Dtina celkem";
  const skupinaDE = "n\u011Bm\u010Dina";
  const celkemAgent = "chlapc\u016F celkem";
  const entityChlapci = "chlapci";
  const entityDivky = "divky";
  const entity2 = "zaci";
  const chlapci = axiomInput(cont(celkemAgent, input.chlapci, entityChlapci), 1);
  const chlapciDiff = axiomInput(compDiff(celkemAgent, skupinaDE, input.anglictinaChlapci, entityChlapci), 2);
  const de = axiomInput(cont(skupinaDE, input.nemcinaDivky, entityDivky), 3);
  const dBase = deduce(
    deduce(
      chlapci,
      chlapciDiff
    ),
    de,
    sum(skupinaDE, [], entity2, entity2)
  );
  const dTree1 = deduce(
    to(
      dBase,
      commonSense("angli\u010Dtina a n\u011Bm\u010Dina - stejn\xFD po\u010Det \u017E\xE1k\u016F"),
      cont(skupinaEN, input.chlapci - input.anglictinaChlapci + input.nemcinaDivky, entity2)
    ),
    compDiff(skupinaEN, entityDivky, input.anglictinaChlapci, entity2)
  );
  const dTree2 = to(
    dBase,
    commonSense("angli\u010Dtina a n\u011Bm\u010Dina - stejn\xFD po\u010Det \u017E\xE1k\u016F"),
    cont("t\u0159\xEDda", (input.chlapci - input.anglictinaChlapci + input.nemcinaDivky) * 2, entity2)
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

// src/math/M9A-2024/dum-meritko.ts
function build8({ input }) {
  const skutecnost = "skute\u010Dnost";
  const plan = "pl\xE1n";
  const widthLabel = "\u0161\xED\u0159ka";
  const lengthLabel = "d\xE9lka";
  const entity2 = "cm";
  const entity2D = "cm ctverecni";
  const meritkoLabel = "dum";
  const width = axiomInput(cont(skutecnost, input.sirkaM * 100, entity2), 1);
  const widthOnPlan = axiomInput(cont(plan, input.planSirkaCM, entity2), 2);
  const lengthOnPlan = axiomInput(cont(plan, input.planDelkaDM * 10, entity2), 3);
  const dBase = deduce(
    widthOnPlan,
    width,
    ctor("ratios")
  );
  const dTree1 = deduce(
    dBase,
    deduce(widthOnPlan, width, gcd("nejmen\u0161\xED spole\u010Dn\xFD n\xE1sobek", entity2)),
    ctor("simplify")
  );
  const dTree2 = deduce(
    cont(plan, 20, entity2),
    dBase
  );
  const ddSkutecnost = deduce(
    dTree2,
    width,
    product(`${skutecnost} obsah`, [lengthLabel, widthLabel], entity2D, entity2)
  );
  const ddPlan = deduce(
    lengthOnPlan,
    widthOnPlan,
    product(`${plan} obsah`, [lengthLabel, widthLabel], entity2D, entity2)
  );
  const dTree3 = deduce(
    deduce(
      ddPlan,
      ddSkutecnost,
      ctor("ratios")
    ),
    deduce(ddPlan.children[3], ddSkutecnost.children[3], gcd("nejmen\u0161\xED spole\u010Dn\xFD n\xE1sobek", entity2)),
    ctor("simplify")
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
    { deductionTree: dTree1, template: (highlight) => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: (highlight) => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: (highlight) => highlight`${() => templateBase(highlight)}${template3}` }
  ];
}

// src/math/percent/part.ts
function percentPart({ base, percentage }) {
  const celek = cont(base.agent, 100, percentage.entity);
  return deduce(
    deduce(
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
  const entity2 = "K\u010D";
  const entityPercent2 = "%";
  const percent = cont(agentPercentPart, input.percentageDown, entityPercent2);
  const celek = cont(agentPercentBase, 100, entityPercent2);
  const dd1 = inferenceRule(percent, celek, ctor("ratio"));
  const dd1Up = axiomInput(ratio({ agent: "cena po slev\u011B", entity: entity2 }, { agent: "zdra\u017Eeno", entity: entity2 }, input.percentageNewUp / 100), 3);
  const percentBase = cont(agentPercentBase, input.base, entity2);
  const dd2 = inferenceRule(percentBase, dd1);
  const sleva = comp(agentPercentBase, "cena po slev\u011B", dd2.kind === "cont" && dd2.quantity, entity2);
  const dd3 = inferenceRule(sleva, percentBase);
  const dd4 = inferenceRule(dd3, dd1Up);
  const soucet = sum("kone\u010Dn\xE1 cena", ["cena po slev\u011B", "zdra\u017Eeno"], entity2, entity2);
  const dd5 = inferenceRule(dd3, dd4, soucet);
  const percentage1 = axiomInput(cont(agentPercentPart, input.percentageDown, entityPercent2), 2);
  const base1 = axiomInput(cont(agentPercentBase, input.base, entity2), 1);
  const dBase1 = percentPart({ base: base1, percentage: percentage1 });
  const deductionTree = deduce(
    deduce(
      deduce(
        to(
          dBase1,
          sleva
        ),
        base1
      ),
      dd1Up
    ),
    { ...dd3, ...deduceLbl(3) },
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
  const vypujceno = axiomInput(cont("vyp\u016Fj\u010Deno", 2e4, entity), 1);
  const urok = axiomInput(cont("\xFArok", 13.5, "%"), 2);
  const deductionTree = deduce(
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
  const vlozeno = axiomInput(cont("vklad", input.vlozeno, entity), 1);
  const v\u00FDnos = axiomInput(cont("v\xFDnos", input.urokPercentage, entityPercent), 2);
  const dan = axiomInput(cont("da\u0148", input.danPercentage, entityPercent), 3);
  const dBase = percentPart({ base: vlozeno, percentage: v\u00FDnos });
  const deductionTree = deduce(
    dBase,
    percentPart({ base: { ...dBase.children[dBase.children.length - 1], ...deduceLbl(2) }, percentage: dan })
  );
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
  return deduce(
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
  return deduce(
    cont("2 * PI", 2 * pi().quantity, ""),
    radius,
    product(baseCircumferenceLabel, ["2 * PI", radiusLabel], radius.entity, radius.entity)
  );
}
function cylinder({ radius, height }, options) {
  const { radiusLabel, entity2D, entity3D, surfaceBaseAreaLabel, heightLabel, baseCircumferenceLabel } = {
    ...{
      radiusLabel: "polom\u011Br",
      entity2D: "\u010Dtvere\u010Dk\u016F",
      entity3D: "krychli\u010Dek",
      surfaceBaseAreaLabel: "obsah podstavy",
      baseCircumferenceLabel: "obvod podstavy",
      heightLabel: "v\xFD\u0161ka"
    },
    ...options ?? {}
  };
  const entity2 = radius.entity;
  const surfaceBaseAreaTree = surfaceBaseArea({ radius }, { entity2D, radiusLabel, surfaceBaseAreaLabel });
  const volume = deduce(
    surfaceBaseAreaTree,
    height,
    product("objem v\xE1lce", ["obsah podstavy", heightLabel], entity3D, entity2)
  );
  const baseCircumferenceTree = baseCircumference({ radius }, { radiusLabel, baseCircumferenceLabel });
  const protilehlaStana = cont("po\u010Det st\u011Bn", 2, "");
  const surface = deduce(
    deduce(
      surfaceBaseAreaTree,
      protilehlaStana,
      product("spodn\xED a horn\xED st\u011Bna", [], entity2D, entity2)
    ),
    deduce(
      baseCircumferenceTree,
      height,
      product("obsah bo\u010Dn\xEDho pl\xE1\u0161t\u011B", ["obvod podstavy", heightLabel], entity2D, entity2)
    ),
    sum("obsah pl\xE1\u0161t\u011B", [], entity2D, entity2D)
  );
  return {
    volume,
    surface,
    baseCircumference: baseCircumferenceTree,
    surfaceBaseArea: surfaceBaseAreaTree
  };
}
function surfaceBaseAreaIn({ input }, labels = {}) {
  return connectTo(surfaceBaseArea({ radius: last(input) }, labels), input);
}

// src/math/M9A-2024/tezitko.ts
function build9({ input }) {
  const agentOut = "vn\u011Bj\u0161\xED v\xE1lec";
  const agentIn = "vnit\u0159n\xED v\xE1lec";
  const entity2 = "cm";
  const outRadius = axiomInput(cont(`${agentOut} polom\u011Br`, input.out.radius, entity2), 1);
  const outHeight = axiomInput(cont(`${agentOut} v\xFD\u0161ka`, input.out.height, entity2), 2);
  const inRadius = axiomInput(cont(`${agentIn} polom\u011Br`, input.in.radius, entity2), 3);
  const inHeight = axiomInput(cont(`${agentIn} v\xFD\u0161ka`, input.in.height, entity2), 4);
  const outCylinder = cylinder({ radius: outRadius, height: outHeight });
  const inCylinder = cylinder({ radius: inRadius, height: inHeight });
  const deductionTree = deduce(
    outCylinder.volume,
    inCylinder.volume
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

// src/math/M9A-2024/tanga.ts
function build10({ input }) {
  const radiusLabel = "polom\u011Br";
  const circleLabel = "obsah kruhu";
  const circelPartLabel = "\u010Dtvrtkruh";
  const tangaHeight = "tanga v\xFD\u0161ka";
  const entity2 = "cm";
  const entity2d = "cm \u010Dtvere\u010Dn\xEDch";
  const width = axiomInput(cont(`tanga \u0161\xED\u0159ka`, input.tangaWidth, entity2), 1);
  const ratio4 = compRatio(`tanga \u0161\xED\u0159ka`, radiusLabel, 2, entity2);
  const dRadius = deduce(width, ratio4);
  const dCircle = surfaceBaseAreaIn({ input: dRadius }, {
    surfaceBaseAreaLabel: circleLabel,
    entity2D: entity2d
  });
  const deductionTree = deduce(
    deduce(
      width,
      to(
        dRadius,
        commonSense(`${radiusLabel} = ${tangaHeight}`),
        cont(tangaHeight, dRadius.children[2].quantity, entity2)
      ),
      product("obsah obd\xE9ln\xEDku", [], entity2d, entity2)
    ),
    deduce(
      cont(`2 kr\xE1t ${circelPartLabel}`, 2, ""),
      deduce(
        dCircle,
        compRatio(circleLabel, circelPartLabel, 4, entity2d)
      ),
      product(`dvojice ${circelPartLabel}`, [], entity2d, entity2d)
    )
  );
  const template = (highlight) => highlight``;
  return { deductionTree, template };
}

// src/math/M9A-2024/dva-ctverce.ts
function example({ input }) {
  const ALabel = "strana obdeln\xEDk A";
  const BLabel = "strana obdeln\xEDk B";
  const entity2 = "cm";
  const bocniStrana = commonSense("bo\u010Dn\xED strany obou \u010Dtverc\u016F jsou schodn\xE9, horn\xED a spodn\xED strana obdeln\xEDku maj\xED rozd\xEDl 3");
  const rozdilObvod = axiomInput(cont("obvod rozd\xEDl", 6, entity2), 1);
  const diffAbsolute = comp(ALabel, BLabel, input.rozdilObvod / 2, entity2);
  const compRel = axiomInput(compRelative(ALabel, BLabel, 3 / 2), 2);
  const kratsiStran = deduce(
    to(rozdilObvod, bocniStrana, diffAbsolute),
    compRel
  );
  const delsiStrana = deduce(
    kratsiStran,
    compRatio("del\u0161\xED strana obdeln\xEDk A", ALabel, 2)
  );
  const deductionTree = deduce(
    delsiStrana,
    cont("\u010Dtverec", 4, "strany"),
    product("obvod \u010Dtverce", ["d\xE9lka strany", "po\u010Det stran"], entity2, entity2)
  );
  return { deductionTree };
}

// src/math/M9C-2024/pocet-obyvatel.ts
function build11({ input }) {
  const rozdil = input.celkem - input.jihlavaPlus;
  const halfTotal = Math.round(rozdil / 2);
  const jihlava = "Jihlava";
  const trebic = "T\u0159eb\xED\u010D";
  const data = [{ value: halfTotal, agent: jihlava }, { value: halfTotal, agent: trebic }, { value: input.jihlavaPlus, agent: jihlava, opacity: 0.6 }];
  const celkem = "Jihlava a T\u0159eb\xED\u010D";
  const entity2 = "obyvatel";
  const total = axiomInput(cont(celkem, input.celkem, entity2), 1);
  const diffComp = axiomInput(comp(jihlava, trebic, input.jihlavaPlus, entity2), 2);
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
  const entity2 = "K\u010D";
  const zbyva = axiomInput(cont("zb\xFDv\xE1", input.zbyvaNasporit, entity2), 4);
  const michalPlus = axiomInput(cont("Michal+", input.michalPlus, entity2), 3);
  const penize = sum("Michal+zb\xFDv\xE1", [], entity2, entity2);
  const eva = axiomInput(cont("Eva", input.evaPodil, "%"), 2);
  const michal = cont("Michal", input.evaPodil, "%");
  const spolecne = axiomInput(sum("Eva + Michal", [], "%", "%"), 1);
  const celek = cont("celek", 100, "%");
  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(eva, michal, spolecne),
        celek,
        ctor("ratio")
      ),
      ctorPartToWholeDiff({ agent: "Michal+zb\xFDv\xE1", entity: entity2 })
    ),
    deduce(michalPlus, zbyva, penize)
  );
  const template = (highlight) => highlight`
  Dva sourozenci Eva a Michal šetří ${"spole\u010Dn\u011B"} na dárek pro rodiče.
  Eva našetřila ${input.evaPodil} % potřebné částky, Michal o ${input.michalPlus} korun více než Eva.
  Sourozencům zbývá našetřit ${input.zbyvaNasporit} korun.
  ${(html) => html`<br/><strong> Kolik korun stojí dárek?</strong>`}`;
  return { deductionTree, data, template };
}

// src/math/M9A-2023/trojuhelnik.ts
function build13({ input }) {
  const agent = "obrazec";
  const entity2 = "troj\xFAheln\xEDk";
  const whiteEntity = `b\xEDl\xFD ${entity2}`;
  const grayEntity = `\u0161ed\xFD ${entity2}`;
  const nthLabel = "pozice";
  const nthEntity = nth(nthLabel);
  const inputContainers = [1, 3, 9].map((d, i) => cont(`${agent} \u010D.${i + 1}`, d, whiteEntity));
  const dSequence = inferenceRule(...inputContainers, ctor("sequence"));
  const soucet = sum("obrazec \u010D.7", [], entity2, grayEntity);
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
      dBase,
      cont(`${agent} \u010D.6`, 6, nthLabel)
    ),
    cont(`${agent} \u010D.6`, 121, grayEntity),
    soucet
  );
  const dTree3 = deduce(
    deduce(
      deduce(
        dBase,
        cont("p\u0159edposledn\xED obrazec", 6561, entity2),
        nthEntity
      ),
      cont("posun na posledn\xED obrazec", 1, nthEntity.entity),
      sum("posledn\xED obrazec", [], nthEntity.entity, nthEntity.entity)
    ),
    { ...dSequence, ...deduceLbl(1) }
  );
  const templateBase = (highlight) => highlight`Prvním obrazcem je bílý rovnostranný trojúhelník. Každý další obrazec vznikne z předchozího obrazce dle následujících pravidel:.
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
    { deductionTree: dTree1, template: (highlight) => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: (highlight) => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: (highlight) => highlight`${() => templateBase(highlight)}${template3}` }
  ];
}

// src/math/M9B-2023/ctvercova-sit.ts
function build14({ input }) {
  const agent = "obrazec";
  const entity2 = "pole";
  const whiteEntity = `sv\u011Btl\xE1 ${entity2}`;
  const grayEntity = `tmav\xE1 ${entity2}`;
  const nthLabel = "pozice";
  const nthEntity = nth(nthLabel);
  const inputContainers = [1, 5, 13].map((d, i) => cont(`${agent} \u010D.${i + 1}`, d, entity2));
  const dSequence = inferenceRule(...inputContainers, ctor("sequence"));
  const soucetLiche = sum("liche cisla", [], entity2, entity2);
  const soucetSude = sum("suda cisla", [], entity2, entity2);
  const sude = [2, 4, 6, 8, 10].map((d) => cont("sude", d, entity2));
  const liche = [1, 3, 5, 7, 9].map((d) => cont("liche", d, entity2));
  const diffEntity = "rozdil tmav\xFDch a sv\u011Btlych";
  const diffSequence = [3, 7, 11].map((d, i) => cont(`${i + 1}.sud\xFD ${agent} \u010D.${(i + 1) * 2}`, d, diffEntity));
  const darkEntity = "tmav\xFD \u010Dtverec";
  const darkSequence = [4, 16, 36].map((d, i) => cont(`${i + 1}.sud\xFD ${agent} \u010D.${(i + 1) * 2}`, d, darkEntity));
  const dBase = deduce(
    ...inputContainers,
    ctor("sequence")
  );
  const dTree1 = deduce(
    deduce(
      dBase,
      cont(`${agent} \u010D.8`, 8, nthLabel)
    ),
    deduce(
      { ...dSequence, ...deduceLbl(1) },
      cont(`${agent} \u010D.9`, 9, nthLabel)
    )
  );
  const dTree2 = deduce(
    deduce(
      ...diffSequence,
      ctor("sequence")
    ),
    cont("5.sudy obrazec \u010D.10", 5, nthLabel)
  );
  const dTree3 = deduce(
    deduce(
      ...darkSequence,
      ctor("sequence")
    ),
    cont("hledan\xFD tmav\xFD obrazec", 400, entity2),
    nthEntity
  );
  const templateBase = (highlight) => highlight`Vybarvováním některých prázdných polí čtvercové sítě postupně vytváříme obrazce.
    Prvním obrazcem je jedno světle vybarvené pole čtvercové sítě.
    Každý další obrazec vytvoříme z předchozího obrazce tak, že vybarvíme všechna prázdná pole, která mají s předchozím obrazcem společné pouze vrcholy. Tato nově vybarvená pole jsou u sudých obrazců tmavá a u lichých obrazců světlá.


  ${(html) => html`<br/>
    Druhý obrazec jsme vytvořili z prvního obrazce vybarvením 4 dalších polí tmavou barvou. Třetí obrazec má celkem 13 polí (9 světlých a 4 tmavé) a vytvořili jsme jej z druhého obrazce vybarvením 8 dalších polí světlou barvou.
  `}`;
  const template1 = (html) => html`<br/>
    <strong>Vybarvením kolika dalších polí jsme z 8. obrazce vytvořili 9. obrazec?</strong>`;
  const template2 = (html) => html`<br/>
    <strong>O kolik se liší počet tmavých a světlých polí v 10. obrazci?</strong>`;
  const template3 = (html) => html`<br/>
    <strong>Kolik světlých polí může mít obrazec, který má 400 tmavých polí?</strong>`;
  return [
    { deductionTree: dTree1, template: (highlight) => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: (highlight) => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: (highlight) => highlight`${() => templateBase(highlight)}${template3}` }
  ];
}

// src/math/word-problems.ts
var letniTaborInput = {
  input: {
    zdravotnik: 1,
    kucharPerZdravotnik: 4,
    vedouciPerKuchar: 2,
    instruktorPerVedouci: 2,
    ditePerInstruktor: 2
  }
};
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
var word_problems_default = {
  "M7A-2023": {
    3.3: build({
      input: {
        kapitan: 1,
        porucik: 4,
        cetarPerPorucik: 3,
        vojinPerCetar: 10
      }
    }),
    14: build2({
      input: {
        cena: 72
      }
    })
  },
  "M7A-2024": {
    6: build3({ input: {} }),
    10.1: build4(letniTaborInput)[0],
    10.2: build4(letniTaborInput)[1],
    10.3: build4(letniTaborInput)[2],
    11: build5({
      input: {
        kralikuMene: 5,
        pocetHlav: 37
      }
    })
  },
  "M9A-2023": {
    16.1: build13({ input: {} })[0],
    16.2: build13({ input: {} })[1],
    16.3: build13({ input: {} })[2]
  },
  "M9B-2023": {
    16.1: build14({ input: {} })[0],
    16.2: build14({ input: {} })[1],
    16.3: build14({ input: {} })[2]
  },
  "M9A-2024": {
    1: build6({ input: { currentWorker: 4, previousWorker: 5, previousHours: 24 } }),
    2: build9({
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
    7.1: build7(tridaSkupinyParams)[0],
    7.2: build7(tridaSkupinyParams)[1],
    8.1: build10({ input: { tangaWidth: 20 } }),
    13: example({ input: { rozdilObvod: 6, obdelnikCtvAStrana: 1 / 2, obdelnikCtvBStrana: 1 / 5 } }),
    15.1: build8(dumMeritkoParams)[0],
    15.2: build8(dumMeritkoParams)[1],
    15.3: build8(dumMeritkoParams)[2],
    16.1: example1({ input: { base: 2e4, percentage: 13.5 } }),
    16.2: example2({ input: { vlozeno: 1e6, urokPercentage: 2.5, danPercentage: 15 } }),
    16.3: example3({ input: { base: 2e4, percentageDown: 10, percentageNewUp: 10 } })
  },
  "M9C-2024": {
    1: build11({ input: { celkem: 86200, jihlavaPlus: 16e3 } }),
    12: build12({ input: { evaPodil: 40, michalPlus: 24, zbyvaNasporit: 72 } })
  }
};
export {
  word_problems_default as default
};

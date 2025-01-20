import { html } from "htl";
import type { Comparison, Container, Predicate, Rate, RatioComparison } from "../components/math.js";
import { cont, ratio, comp, rate, ratios, compRatio, compDiff, sum, lcd, gcd, ctor, inferenceRule, nth, quota, product, ctorRatios } from "../components/math.js";

export default function rules() {

  const compareRule = (container: Container) => {
    const a = comp("Honzík", "Ája", 4, "sešity");

    return {
      premises: [container, a],
      inputTemplate: html`${container.agent} má ${container.quantity} ${container.entity}. ${a.agentA} má o ${Math.abs(a.quantity)} ${Math.abs(a.quantity) > 0 ? "více" : "méně"} než ${a.agentB}.`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
    }
  }
  const toCompareRule = (a: Container, b: Container) => {

    return {
      premises: [a, b],
      inputTemplate: html`${a.agent} má ${a.quantity} ${a.entity}.${b.agent} má ${b.quantity} ${b.entity}.`,
      outputTemplate: (predicate: Comparison) => html`${predicate.agentA} má o ${Math.abs(predicate.quantity)} ${Math.abs(predicate.quantity) > 0 ? "více" : "méně"} než ${predicate.agentB}.`
    }
  }

  const toDiffRule = (a: Container, b: Container) => {

    return {
      premises: [a, b, { kind: "comp-diff" }],
      inputTemplate: html`${a.agent} má ${a.quantity} ${a.entity}.${b.agent} má ${b.quantity} ${b.entity}.`,
      outputTemplate: (predicate: Comparison) => html`${predicate.agentA} má o ${Math.abs(predicate.quantity)} ${Math.abs(predicate.quantity) > 0 ? "více" : "méně"} než ${predicate.agentB}.`
    }
  }

  const ratioCompareRule = (container: Container) => {
    const a = compRatio("Honzík", "Ája", 3);

    return {
      premises: [container, a],
      inputTemplate: html`${container.agent} má ${container.quantity} ${container.entity}. ${a.agentA} má o ${Math.abs(a.ratio)} ${Math.abs(a.ratio) > 0 ? "více" : "méně"} než ${a.agentB}.`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
    }
  }

  const toRatioCompareRule = (a: Container, b: Container) => {

    return {
      premises: [a, b, { kind: 'comp-ratio' }],
      inputTemplate: html`${a.agent} má ${a.quantity} ${a.entity}.${b.agent} má ${b.quantity} ${b.entity}.`,
      outputTemplate: (predicate: RatioComparison) => html`${predicate.agentA} má o ${Math.abs(predicate.ratio)} ${Math.abs(predicate.ratio) > 0 ? "více" : "méně"} než ${predicate.agentB}.`
    }
  }

  const deduceRule = (...premises: Predicate[]) => {

    return {
      premises,
      inputTemplate: html``,
      outputTemplate: (predicate: Container) => html``
    }
  }



  const nthRule = (args, nthPosition: Container) => {
    const seq = inferenceRule(...args, ctor('sequence'));
    const nthTerm = inferenceRule(seq, nthPosition)


    return [

      {
        premises: [...args, ctor('sequence')],
        inputTemplate: html`Ája a Honzík dají sešity dohromady.`,
        outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
      },
      {
        premises: [seq, nthPosition],
        inputTemplate: html`Ája a Honzík dají sešity dohromady.`,
        outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
      },

      {
        premises: [seq, nthTerm, nth('pozice')],
        inputTemplate: html`Ája a Honzík dají sešity dohromady.`,
        outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
      },

    ]
  }


  const toFairDivision = (whole: Container, groupCount: Container) => {
    return {
      premises: [whole, groupCount, { kind: 'rate' }],
      inputTemplate: html`${whole.agent} má ${whole.quantity} ${whole.entity}. ${groupCount.agent} má ${groupCount.quantity} ${groupCount.entity}. Rozděl rovnoměrně na ${groupCount.quantity} skupiny.`,
      outputTemplate: (predicate: Rate) => html`Každá ${predicate.agent} ${predicate.entityBase.entity} je ${Math.abs(predicate.quantity)} ${predicate.entity.entity}.`
    }
  }
  const toQuotaDivision = (whole: Container, quotaContainer: Container) => {
    return {
      premises: [whole, quotaContainer, { kind: 'quota' }],
      inputTemplate: html`${whole.agent} má ${whole.quantity} ${whole.entity}. ${quotaContainer.agent} má ${quotaContainer.quantity} ${quotaContainer.entity}. Rozděl rovnoměrně na ${quotaContainer.quantity} skupiny.`,
      outputTemplate: (predicate: Rate) => html`Každá ${predicate.agent} ${predicate.entityBase.entity} je ${Math.abs(predicate.quantity)} ${predicate.entity.entity}.`
    }
  }

  const partToWholeRatioRules = (container: Container) => {
    const r = ratio("třída", "chlapci", 1 / 4);
    return {
      premises: [container, r],
      inputTemplate: html`${container.agent} má ${container.quantity} ${container.entity}. ${r.part} z ${r.whole} = ${r.ratio}`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
    }
  }

  const partToPartRatioRules = (container: Container) => {
    const r = ratios("třída", ["chlapci", "dívky"], [1, 3]);
    return {
      premises: [container, r],
      inputTemplate: html`${container.agent} má ${container.quantity} ${container.entity}. ${r.parts.join(":")} v poměru ${r.ratios.join(":")} z ${r.whole}`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
    }
  }


  const a = cont("Ája", 2, "sešity");
  const b = cont("Honzík", 6, "sešity");

  const arithmetic = [2, 4, 6, 8, 10].map((d, i) => cont(`č. ${i + 1}`, d, "čtverec"));
  const geometric = [2, 4, 8, 16, 32].map((d, i) => cont(`č. ${i + 1}`, d, "čtverec"));
  const quadratic = [1, 4, 9, 16, 25].map((d, i) => cont(`č. ${i + 1}`, d, "čtverec"));
  const tenthTerm = cont("č.10", 10, "pozice");
  return {
    compare: [toCompareRule(a, b), compareRule(a), compareRule(b)],
    ratioCompare: [toRatioCompareRule(a, b), ratioCompareRule(a), ratioCompareRule(b)],
    partToWholeRatio: [partToWholeRatioRules(cont("třída", 120, "")), partToWholeRatioRules(cont("chlapci", 30, ""))],
    partToPartRatio: [

      partToPartRatioRules(cont("třída", 120, "")), partToPartRatioRules(cont("dívky", 90, "")),
      deduceRule(cont("chlapci", 30, ""), cont("dívky", 90, ""), ctorRatios("třída"))
    ],
    rate: [
      toFairDivision(cont("Petr", 20, "Kč"), cont("Petr", 5, "rohlík")),
      deduceRule(cont("Petr", 20, "Kč"), rate("Petr", 4, "Kč", "rohlík")),
      deduceRule(cont("Petr", 5, "rohlík"), rate("Petr", 4, "Kč", "rohlík")),

      // fairDivision(cont("tyč", 10, "m"), cont("tyč", 5, "kus")),
      // simpleCompute(cont("tyč", 10, "m"), rate("tyč", 2, "m", "kus")),
      // simpleCompute(cont("tyč", 5, "kus"), rate("tyč", 2, "m", "kus")),

      toQuotaDivision(cont("tyč", 10, "m"), cont("kus", 2, "m")),
      deduceRule(cont("tyč", 10, "m"), quota("tyč", "kus", 5)),
      deduceRule(cont("kus", 2, "m"), quota("tyč", "kus", 5)),

    ],

    substract: [
      toDiffRule(cont("Ája a Honzík", 8, "sešity"), b),
      deduceRule(cont("Ája a Honzík", 8, "sešity"), compDiff("Ája a Honzík", "Honzík", 2, "sešity")),
      deduceRule(b, compDiff("Ája a Honzík", "Honzík", 2, "sešity"))
    ],
    sum: [
      deduceRule(a, b, cont("Pepa", 4, "sešity"), sum("dohromady", ["Ája", "Honzík", "Pepa"], "sešity", "sešity")),
      deduceRule(cont("šířka", 2, "metr"), cont("délka", 3, "metr"), cont("výška", 4, "metr"), product("objem", ["délka", "šířka", "výška"], "metr krychlový", "metr"))
    ],
    gcd: [deduceRule(cont("tyč", 24, "m"), cont("tyč", 16, "m"), gcd("největší možná délka tyče", "m"))],
    lcd: [deduceRule(cont("dvojice", 2, "osob"), cont("trojice", 3, "osob"), lcd("nejmenší možná skupina", "osob"))],
    aritmeticSequence: [...nthRule(arithmetic, tenthTerm)],
    quadraticSequence: [...nthRule(quadratic, tenthTerm)],
    geometricSequence: [...nthRule(geometric, tenthTerm)],   
  }



  // partToPartCompareRules(comp("letos", "loni" , 1/4, "")),
  // partToPartCompareRules(comp("letos", "loni" , -1/4, "")),
  // partToPartRatioCompareRules(ratioComp("letos", "loni" , 5/4, "")),
  // partToPartRatioCompareRules(ratioComp("letos", "loni" , 3/4, "")),

  // partToPartDiffRules(diff("letos", "loni" , 1/4, "")),
  // partToPartDiffRules(diff("letos", "loni" , -1/4, "")),


}
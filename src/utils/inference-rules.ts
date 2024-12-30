import { html } from "htl";
import type { Comparison, ComparisonDiff, Container, Rate, RatioComparison } from "../components/math.js";
import { cont, ratio, comp, rate, ratios, ratioComp, diff, sum, lcd, gcd } from "../components/math.js";

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
    const a = ratioComp("Honzík", "Ája", 3, "sešity");

    return {
      premises: [container, a],
      inputTemplate: html`${container.agent} má ${container.quantity} ${container.entity}. ${a.agentA} má o ${Math.abs(a.quantity)} ${Math.abs(a.quantity) > 0 ? "více" : "méně"} než ${a.agentB}.`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
    }
  }

  const toRatioCompareRule = (a: Container, b: Container) => {

    return {
      premises: [a, b, { kind: 'comp-ratio' }],
      inputTemplate: html`${a.agent} má ${a.quantity} ${a.entity}.${b.agent} má ${b.quantity} ${b.entity}.`,
      outputTemplate: (predicate: RatioComparison) => html`${predicate.agentA} má o ${Math.abs(predicate.quantity)} ${Math.abs(predicate.quantity) > 0 ? "více" : "méně"} než ${predicate.agentB}.`
    }
  }

  const rateCompute = (container: Container) => {
    const pricePerBox = rate("Petr", 4, "Kč", "rohlík");

    return {
      premises: [container, pricePerBox],
      inputTemplate: html`${container.agent} má ${container.quantity} ${container.entity}. Každá ${pricePerBox.agent} ${pricePerBox.entityBase.entity} je ${Math.abs(pricePerBox.quantity)} ${pricePerBox.entity.entity}.`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
    }
  }

  const substractRule = (container: Container) => {
    const diffRule = diff("Ája a Honzík", "Honzík", 2, "sešity");

    return {
      premises: [container, diffRule],
      inputTemplate: html`${container.agent} má ${container.quantity} ${container.entity}.`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
    }
  }

  const sumRule = (a, b) => {
    const sumRule = sum("dohromady", ["Ája", "Honzík"], "sešity", "sešity");

    return {
      premises: [[a, b], sumRule],
      inputTemplate: html`Ája a Honzík dají sešity dohromady.`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
    }
  }

  const lcdRule = (a, b) => {
    const sumRule = lcd("nejmenší možná skupina", "osob");

    return {
      premises: [[a, b], sumRule],
      inputTemplate: html`Ája a Honzík dají sešity dohromady.`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
    }
  }

  const gcdRule = (a, b) => {
    const sumRule = gcd("největší možná tyč", "délka (m)");

    return {
      premises: [[a, b], sumRule],
      inputTemplate: html`Ája a Honzík dají sešity dohromady.`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
    }
  }


  const fairDivision = (whole: Container, groupCount: Container) => {
    return {
      premises: [whole, groupCount, { kind: 'rate' }],
      inputTemplate: html`${whole.agent} má ${whole.quantity} ${whole.entity}. ${groupCount.agent} má ${groupCount.quantity} ${groupCount.entity}. Rozděl rovnoměrně na ${groupCount.quantity} skupiny.`,
      outputTemplate: (predicate: Rate) => html`Každá ${predicate.agent} ${predicate.entityBase.entity} je ${Math.abs(predicate.quantity)} ${predicate.entity.entity}.`
    }
  }

  const partToWholeRatioRules = (container: Container) => {
    const r = ratio("studenti", "chlapec", 1 / 4);
    return {
      premises: [container, r],
      inputTemplate: html`${container.agent} má ${container.quantity} ${container.entity}. ${r.part} z ${r.whole} = ${r.ratio}`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
    }
  }

  const partToPartRatioRules = (container: Container) => {
    const r = ratios("studenti", ["chlapec", "dívka"], [1, 3]);
    return {
      premises: [container, r],
      inputTemplate: html`${container.agent} má ${container.quantity} ${container.entity}. ${r.parts.join(":")} v poměru ${r.ratios.join(":")} z ${r.whole}`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`
    }
  }


  const partToPartCompareRules = (r: Comparison) => {
    const container = cont("loni", 1, "")
    return {
      premises: [container, r],
      inputTemplate: html`${container.agent} má ${container.quantity} ${container.entity}. ${r.agentA} má o ${Math.abs(r.quantity)} ${Math.abs(r.quantity) > 0 ? "více" : "méně"} než ${r.agentB}.`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`

    }
  }
  const partToPartRatioCompareRules = (r: RatioComparison) => {
    const container = cont("loni", 1, "")
    return {
      premises: [container, r],
      inputTemplate: html`${container.agent} má ${container.quantity} ${container.entity}. ${r.agentA} má o ${Math.abs(r.quantity)} ${Math.abs(r.quantity) > 0 ? "více" : "méně"} než ${r.agentB}.`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`

    }
  }

  const partToPartDiffRules = (r: ComparisonDiff) => {
    const container = cont("loni", 1, "")

    return {
      premises: [container, r],
      inputTemplate: html`${container.agent} má ${container.quantity} ${container.entity}.`,
      outputTemplate: (predicate: Container) => html`${predicate.agent} má ${predicate.quantity} ${predicate.entity}.`

    }
  }




  const a = cont("Ája", 2, "sešity");
  const b = cont("Honzík", 6, "sešity");
  return {
    compare: [toCompareRule(a, b), compareRule(a), compareRule(b)],
    ratioCompare: [toRatioCompareRule(a, b), ratioCompareRule(a), ratioCompareRule(b)],
    partToWholeRatio: [partToWholeRatioRules(cont("třída", 120, "studenti")), partToWholeRatioRules(cont("třída", 30, "chlapec"))],
    partToPartRatio: [partToPartRatioRules(cont("třída", 120, "studenti")), partToPartRatioRules(cont("třída", 90, "dívka"))],
    rate: [
      fairDivision(cont("Petr", 20, "Kč"), cont("Petr", 5, "rohlík")),
      rateCompute(cont("Petr", 20, "Kč")),
      rateCompute(cont("Petr", 5, "rohlík"))],
    substract: [toDiffRule(cont("Ája a Honzík", 8, "sešity"), b), substractRule(cont("Ája a Honzík", 8, "sešity")), substractRule(b)],
    sum: [sumRule(a, b)],
    gcd: [gcdRule(cont("tyč", 24, "délka (m)"), cont("tyč", 16, "délka (m)"))],
    lcd: [lcdRule(cont("dvojice", 2, "osob"), cont("trojice", 3, "osob"))]
  }



  // partToPartCompareRules(comp("letos", "loni" , 1/4, "")),
  // partToPartCompareRules(comp("letos", "loni" , -1/4, "")),
  // partToPartRatioCompareRules(ratioComp("letos", "loni" , 5/4, "")),
  // partToPartRatioCompareRules(ratioComp("letos", "loni" , 3/4, "")),

  // partToPartDiffRules(diff("letos", "loni" , 1/4, "")),
  // partToPartDiffRules(diff("letos", "loni" , -1/4, "")),


}
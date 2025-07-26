
import { type Predicate, cont, ratio, comp, rate, ratios, compRatio, compDiff, combine, lcd, gcd, ctor, inferenceRule, nth, quota, product, ctorRatios, ctorUnit, transfer, compAngle, ctorComplement, delta, evalExprAsCont } from "../components/math.js";

export default function rules() {

  const deduceRule = (...premises: Predicate[]) => {
    return premises;
  }

  const nthRule = (args, nthPosition: Predicate) => {
    const seq = inferenceRule(...args, ctor('sequence'));
    const nthTerm = inferenceRule(seq, nthPosition)

    return [
      [...args, ctor('sequence')],
      [seq, nthPosition],
      [seq, nthTerm, nth('pozice')],
    ]
  }

  const a = cont("Ája", 2, "sešity");
  const b = cont("Honzík", 6, "sešity");
  const compareAtoB = comp("Honzík", "Ája", 4, "sešity");
  const transferAtoB = transfer({ name: "Ája", nameBefore: "Ája před změnou", nameAfter: "Ája po změně" }, { name: "Honzík", nameBefore: "Honzík před změnou", nameAfter: "Honzík po změně" }, 1, "sešity");
  const compareRatioAtoB = compRatio("Honzík", "Ája", 3);

  const a1 = (quantity: number) => cont("Ája dnes", quantity, "sešity");
  const a2 = (quantity: number) => cont("Ája zítra", quantity, "sešity");

  const aja = cont("Ája", 5, "sešity")
  const ajaDelta = delta({ name: "Ája", nameBefore: "Ája dnes", nameAfter: "Ája zítra" }, 3, "sešity");

  const partToWholeRatio = ratio("třída", "chlapci", 1 / 4);
  const partToPartRatios = ratios("třída", ["chlapci", "dívky"], [1, 3]);

  const arithmetic = [2, 4, 6, 8, 10].map((d, i) => cont(`č. ${i + 1}`, d, "čtverec"));
  const geometric = [2, 4, 8, 16, 32].map((d, i) => cont(`č. ${i + 1}`, d, "čtverec"));
  const quadratic = [1, 4, 9, 16, 25].map((d, i) => cont(`č. ${i + 1}`, d, "čtverec"));
  const tenthTerm = cont("č.10", 10, "pozice");

  const alfa = cont("alfa", 50, "stupňů");

  return {
    compare: [deduceRule(a, b), deduceRule(a, compareAtoB), deduceRule(b, compareAtoB)],
    transfer: [
      deduceRule(a1(2), a2(5), ctor('delta')), deduceRule(a1(5), a2(2), ctor('delta')),
      deduceRule(aja, ajaDelta), deduceRule(ajaDelta, aja),
      deduceRule(a, transferAtoB), deduceRule(b, transferAtoB),
      deduceRule(transferAtoB, a), deduceRule(transferAtoB, b),
    ],
    ratioCompare: [deduceRule(a, b, ctor('comp-ratio')), deduceRule(a, compareRatioAtoB), deduceRule(b, compareRatioAtoB)],
    angleCompare: [deduceRule(alfa, compAngle("beta", "alfa", "supplementary")), deduceRule(alfa, compAngle("beta", "alfa", "complementary")), deduceRule(alfa, compAngle("beta", "alfa", "corresponding"))],
    partToWholeRatio: [deduceRule(cont("třída", 120, ""), partToWholeRatio), deduceRule(cont("chlapci", 30, ""), partToWholeRatio), deduceRule(partToWholeRatio, ctorComplement("dívky"))],
    partToPartRatio: [
      deduceRule(cont("třída", 120, ""), partToPartRatios), deduceRule(cont("dívky", 90, ""), partToPartRatios),
      deduceRule(cont("chlapci", 30, ""), cont("dívky", 90, ""), ctorRatios("třída")),
      deduceRule(partToPartRatios, cont("rozšíření", 3, ""), ctor("scale")),
    ],
    rate: [
      deduceRule(cont("Petr", 20, "Kč"), cont("Petr", 5, "rohlík"), ctor('rate')),
      deduceRule(cont("Petr", 20, "Kč"), rate("Petr", 4, "Kč", "rohlík")),
      deduceRule(cont("Petr", 5, "rohlík"), rate("Petr", 4, "Kč", "rohlík")),

      deduceRule(cont("tyč", 10, "m"), cont("kus", 2, "m"), ctor('quota')),
      deduceRule(cont("tyč", 10, "m"), quota("tyč", "kus", 5)),
      deduceRule(cont("kus", 2, "m"), quota("tyč", "kus", 5)),
    ],

    substract: [
      deduceRule(cont("Ája a Honzík", 8, "sešity"), b, ctor('comp-diff')),
      deduceRule(cont("Ája a Honzík", 8, "sešity"), compDiff("Ája a Honzík", "Honzík", 2, "sešity")),
      deduceRule(b, compDiff("Ája a Honzík", "Honzík", 2, "sešity"))
    ],
    sum: [
      deduceRule(a, b, cont("Pepa", 4, "sešity"), combine("dohromady", ["Ája", "Honzík", "Pepa"], "sešity", "sešity")),
      deduceRule(cont("šířka", 2, "metr"), cont("délka", 3, "metr"), cont("výška", 4, "metr"), product("objem", ["délka", "šířka", "výška"], "metr krychlový", "metr"))
    ],
    gcd: [deduceRule(cont("tyč", 24, "m"), cont("tyč", 16, "m"), gcd("největší možná délka tyče", "m"))],
    lcd: [deduceRule(cont("dvojice", 2, "osob"), cont("trojice", 3, "osob"), lcd("nejmenší možná skupina", "osob"))],
    aritmeticSequence: [...nthRule(arithmetic, tenthTerm)],
    quadraticSequence: [...nthRule(quadratic, tenthTerm)],
    geometricSequence: [...nthRule(geometric, tenthTerm)],
    unit: [deduceRule(cont("Honzík", 4, "jablek", "kg"), ctorUnit("g")), deduceRule(cont("Ája", 400, "mléka", "cm3"), ctorUnit("l"))],
    eval: [deduceRule(cont("poloměr", 4, "délka", "cm"), evalExprAsCont("PI*r^2", { kind: 'cont', agent: "kruh", entity: "obsah", unit: "cm2" }))]
  }
}
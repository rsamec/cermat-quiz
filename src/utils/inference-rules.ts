
import { type Predicate, type Pattern, cont, ratio, comp, rate, ratios, compRatio, compDiff, lcd, gcd, ctor, inferenceRule, nth, quota, ctorRatios, ctorUnit, transfer, compAngle, ctorComplement, delta, evalExprAsCont, counter, sum, product, squareNumbersPattern, triangularNumbersPattern, oblongNumbers, halfProduct, dimensionEntity, cuboidVolume, circleArea, contAngle } from "../components/math.js";
import { anglesNames } from "./deduce-utils.js";

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

  const nthPatternRule = (pattern: Pattern, nthPosition: Predicate) => {
    const nthTerm = inferenceRule(pattern, nthPosition)

    return [
      [pattern, nthPosition],
      [pattern, nthTerm, nth('pozice')],
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
  const extendedPartToPartRatios = ratios("třída", ["chlapci", "dívky"], [3, 9]);

  const arithmetic = [2, 4, 6, 8, 10].map((d, i) => cont(`č. ${i + 1}`, d, "čtverec"));
  const geometric = [2, 4, 8, 16, 32].map((d, i) => cont(`č. ${i + 1}`, d, "čtverec"));
  const quadratic = [1, 4, 9, 16, 25].map((d, i) => cont(`č. ${i + 1}`, d, "čtverec"));
  const tenthTerm = cont("č.10", 10, "pozice");

  const alfa = contAngle(anglesNames.alpha, 50);
  const dim = dimensionEntity();

  return {
    compare: [deduceRule(a, b), deduceRule(a, compareAtoB), deduceRule(b, compareAtoB)],
    transfer: [
      deduceRule(a1(2), a2(5), ctor('delta')), deduceRule(a1(5), a2(2), ctor('delta')),
      deduceRule(aja, ajaDelta), deduceRule(ajaDelta, aja),
      deduceRule(a, transferAtoB), deduceRule(b, transferAtoB),
      deduceRule(transferAtoB, a), deduceRule(transferAtoB, b),
    ],
    ratioCompare: [deduceRule(a, b, ctor('comp-ratio')), deduceRule(a, compareRatioAtoB), deduceRule(b, compareRatioAtoB)],
    angleCompare: [deduceRule(alfa, compAngle(anglesNames.beta, anglesNames.alpha, "supplementary")), deduceRule(alfa, compAngle(anglesNames.beta, anglesNames.alpha, "complementary")), deduceRule(alfa, compAngle(anglesNames.beta, anglesNames.alpha, "corresponding"))],
    partToWholeRatio: [deduceRule(cont("třída", 120, ""), partToWholeRatio), deduceRule(cont("chlapci", 30, ""), partToWholeRatio), deduceRule(partToWholeRatio, ctorComplement("dívky"))],
    partToPartRatio: [
      deduceRule(cont("třída", 120, ""), partToPartRatios), deduceRule(cont("dívky", 90, ""), partToPartRatios),
      deduceRule(cont("chlapci", 30, ""), cont("dívky", 90, ""), ctorRatios("třída")),
    ],
    sliding: [
      deduceRule(counter("číslo", 6), counter("posun o", 3), ctor("slide")),
      deduceRule(counter("číslo", 6), counter("posun zpět o", 3), ctor("slide-invert")),
    ],
    scaling: [
      deduceRule(counter("číslo", 6), counter("zvětšení", 3), ctor("scale")),
      deduceRule(counter("číslo", 6), counter("zmenšení", 3), ctor("scale-invert")),
      deduceRule(partToPartRatios, cont("rozšíření", 3, ""), ctor("scale")),
      deduceRule(extendedPartToPartRatios, cont("zkrácení", 3, ""), ctor("scale-invert")),
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
      deduceRule(cont("dohromady", 8, "sešity"), b, ctor('comp-diff')),
      deduceRule(cont("dohromady", 8, "sešity"), compDiff("dohromady", "Honzík", 2, "sešity")),
      deduceRule(b, compDiff("dohromady", "Honzík", 2, "sešity"))
    ],
    sum: [
      deduceRule(a, b, cont("Pepa", 4, "sešity"), sum("dohromady")),
      deduceRule(cont("čtverec strana", 2, "metr"), counter("počet stran", 4), product("obvod čtverce")),
      deduceRule(cont("šířka", 2, "metr"), cont("délka", 3, "metr"), cont("výška", 4, "metr"), cuboidVolume("objem", "m3"))
    ],
    gcd: [deduceRule(cont("tyč", 24, "m"), cont("tyč", 16, "m"), gcd("největší možná délka tyče", "m"))],
    lcd: [deduceRule(cont("dvojice", 2, "osob"), cont("trojice", 3, "osob"), lcd("nejmenší možná skupina", "osob"))],
    aritmeticSequence: [...nthRule(arithmetic, tenthTerm)],
    quadraticSequence: [...nthRule(quadratic, tenthTerm)],
    geometricSequence: [...nthRule(geometric, tenthTerm)],
    squareNumbers: [...nthPatternRule(squareNumbersPattern({ entity: 'čtverec' }), tenthTerm)],
    triangularNumbers: [...nthPatternRule(triangularNumbersPattern({ entity: 'čtverec' }), tenthTerm)],
    rectangularNumbers: [...nthPatternRule(oblongNumbers({ entity: 'čtverec' }), tenthTerm)],
    unit: [deduceRule(cont("Honzík", 4, "jablek", "kg"), ctorUnit("g")), deduceRule(cont("Ája", 400, "mléka", "cm3"), ctorUnit("l"))],
    eval: [
      deduceRule(cont("poloměr", 4, "délka", "cm"), circleArea("kruh")),
      deduceRule(cont("průměr", 4, "délka", "cm"), evalExprAsCont("prumer*0.5", "poloměr", { entity: "délka", unit: "cm" })),
      deduceRule(cont("průměr", "4", "délka", "cm"), ...halfProduct("poloměr"))
    ]
  }
}
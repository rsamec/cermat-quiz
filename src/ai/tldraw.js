// src/utils/deduce-utils.js
var defaultHelpers = {
  convertToFraction: (d) => d,
  convertToFractionAsLatex: (d) => d,
  convertToUnit: (d) => d,
  unitAnchor: () => 1,
  solveLinearEquation: (fist, second, variable) => NaN,
  evalExpression: (expression, context) => NaN,
  evalNodeToNumber: (expression) => NaN,
  substituteContext: (expression, context) => NaN
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
function isQuantityPredicate(value) {
  return ["cont", "comp", "transfer", "rate", "comp-diff", "transfer", "quota", "delta", "frequency"].includes(value.kind);
}
function isRatioPredicate(value) {
  return ["ratio", "comp-ratio"].includes(value.kind);
}
function isRatiosPredicate(value) {
  return ["ratios"].includes(value.kind);
}
function nthQuadraticElements(firstElement, secondElement, secondDifference) {
  const A = secondDifference / 2;
  const B = secondElement - firstElement - 3 * A;
  const C = firstElement - (A + B);
  return { A, B, C };
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
      return "shodnost \xFAhl\u016F p\u0159i z\xE1kadn\u011B rovnoramenn\xE9ho troj\xFAheln\xEDku";
    case "equilateral-triangle":
      return "shodnost v\u0161ech \xFAhl\u016F v rovnostrann\xE9m troj\xFAheln\xEDku";
    case "opposite-in-parallelogram":
      return "shodnost prot\u011Bj\u0161\xEDch \xFAhl\u016F v rovnob\u011B\u017En\xEDku";
    default:
      throw "Nezn\xE1m\xFD vztah";
  }
}
function isNumber(quantity) {
  return typeof quantity === "number";
}
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
  "simplify": function(eps22) {
    const ieps = BigInt(1 / (eps22 || 1e-3) | 0);
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
      const measure72 = this.measureData[origin.measure];
      const anchors = measure72.anchors;
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
      for (const [name, measure72] of Object.entries(this.measureData)) {
        for (const [systemName, units] of Object.entries(measure72.systems)) {
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
      const measure72 = this.measureData[measureName];
      for (const [systemName, units] of Object.entries(measure72.systems)) {
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
    for (const measure72 of Object.values(this.measureData)) {
      for (const systems of Object.values(measure72.systems)) {
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
    for (const measure72 of list_measures) {
      const systems = this.measureData[measure72].systems;
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
  for (const [measureName, measure72] of Object.entries(measures)) {
    for (const [systemName, system] of Object.entries(measure72.systems)) {
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
parser.functions.abs = function(arg) {
  return Math.abs(arg);
};
var eps = 1e-3;
parser.functions.closeTo = function(value, center) {
  const start = center - eps;
  const end = center + eps;
  return start <= value && value <= end;
};
parser.functions.color = function(color, value) {
  return value;
};
parser.functions.bgColor = function(bgColor, value) {
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
function substituteContext(expression, context) {
  let expr = parser.parse(expression);
  const variables = expr.variables();
  for (let variable of variables) {
    expr = expr.substitute(variable, context[variable]);
  }
  return expr;
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
  const bgColors = parentContext?.bgColors ?? {};
  if (expression) {
    let expr = parser.parse(expression);
    const variables = expr.variables();
    for (let variable of variables) {
      const res = recurExpr(context[variable], level + 1, requiredLevel, parentContext);
      if (res.substitute != null) {
        expr = parser.parse(cleanUpExpression(expr, variable));
        if (level < requiredLevel) {
          for (let [key, values] of Object.entries(colors2)) {
            if (values.includes(context[variable])) {
              expr = expr.substitute(variable, parser.parse(`color(${key},${variable})`));
            }
          }
          for (let [key, values] of Object.entries(bgColors)) {
            if (values.includes(context[variable])) {
              expr = expr.substitute(variable, parser.parse(`bgColor(${key},${variable})`));
            }
          }
        }
        expr = expr.substitute(variable, res);
        if (level >= requiredLevel) {
          expr = expr.simplify();
        }
      } else {
        const q = res.quantity ?? res.ratio ?? res.ratios;
        if (typeof q == "number" || !isNaN(parseFloat(q)) || Array.isArray(q)) {
          expr = parser.parse(cleanUpExpression(expr, variable));
          if (level >= requiredLevel || Array.isArray(q)) {
            expr = expr.simplify({ [variable]: q });
          } else {
            for (let [key, values] of Object.entries(colors2)) {
              if (values.includes(context[variable])) {
                expr = expr.substitute(variable, parser.parse(`color(${key},${variable})`));
              }
            }
            for (let [key, values] of Object.entries(bgColors)) {
              if (values.includes(context[variable])) {
                expr = expr.substitute(variable, parser.parse(`bgColor(${key},${variable})`));
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
  const replaced = exp.toString().replaceAll(`${variable}.quantity`, variable).replaceAll(`${variable}.ratios`, variable).replaceAll(`${variable}.ratio`, variable).replaceAll(`${variable}.baseQuantity`, variable);
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
  // red: "#ff4136",
  //lightred: "#ff725c",
  orange: "#ff6300",
  yellow: "#ffd700",
  // lightyellow: "#fbf1a9",
  purple: "#5e2ca5",
  // lightpurple: "#a463f2",
  darkpink: "#d5008f",
  // hotpink: "#ff41b4",
  pink: "#ff80cc",
  // lightpink: "#ffa3d7",
  // darkgreen: "#137752",
  green: "#19a974",
  // lightgreen: "#9eebcf",
  // navy: "#001b44",
  // darkblue: "#1b4b98",
  blue: "#266bd9",
  lightblue: "#96ccff",
  gold: "#ffb700"
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
        } else if (["abs"].includes(tok.value)) {
          stack.push(`\\left|${a}\\right|`);
        } else if (["floor"].includes(tok.value)) {
          stack.push(`\\lfloor${a}\\rfloor`);
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
        if (f != null && f != "color" && f != "bgColor") {
        }
        if (tok.value === "sqrt" && args.length === 1) {
          stack.push(`\\sqrt{${args[0]}}`);
        } else if (["sin", "cos", "tan", "log", "ln"].includes(tok.value)) {
          stack.push(`\\${tok.value}\\left(${args.join(", ")}\\right)`);
        } else if (f == "color" && args.length === 2) {
          stack.push(`\\textcolor{${colors[args[0]]}}{${args[1]}}`);
        } else if (f == "bgColor" && args.length === 2) {
          stack.push(`\\fcolorbox{${colors[args[0]]}}{none}{\\(${args[1]}\\)}`);
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
  convertToFractionAsLatex: (d) => new Fraction(d).toLatex(),
  convertToUnit: (d, from, to2) => convert(d).from(from).to(to2),
  unitAnchor: (unit) => convert().getUnit(unit)?.unit?.to_anchor,
  solveLinearEquation: (first, second, variable) => solveLinearEquation(first, second, variable),
  evalExpression: (expression, quantity) => evalExpression(expression, quantity),
  evalNodeToNumber: (expression) => evaluateNodeToNumber(expression),
  substituteContext: (expression, context) => substituteContext(expression, context)
});
function isPredicate(node) {
  return node.kind != null;
}
function isEmptyOrWhiteSpace(value) {
  return value == null || typeof value === "string" && value.trim() === "";
}
function mapNodeChildrenToPredicates(node) {
  return node.children.map((d) => isPredicate(d) ? d : d.children.slice(-1)[0]);
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
  formatAgent: (d) => `**${Array.isArray(d) ? d.join() : d}**`,
  formatSequence: (d) => `${formatSequence(d)}`,
  formatTable: (data) => `vzor opakov\xE1n\xED ${data.map((d) => d[1]).join()}`
});
var mdFormatting = mdFormattingFunc(0);
var mermaidFormatting = {
  ...mdFormatting,
  formatKind: (d) => ``
};
function formatSequence(type) {
  const simplify22 = (d, op = "") => d !== 1 ? `${d}${op}` : "";
  if (type.kind === "arithmetic")
    return `${type.sequence.join()} => a^n^ = ${type.sequence[0]} + ${type.commonDifference}(n-1)`;
  if (type.kind === "quadratic") {
    const [first, second] = type.sequence;
    const { A, B, C } = nthQuadraticElements(first, second, type.secondDifference);
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
function formatPredicate(d, formatting) {
  const { formatKind, formatAgent, formatEntity: formatEntity2, formatQuantity, formatRatio: formatRatio2, formatSequence: formatSequence2, formatTable, compose } = { ...mdFormatting, ...formatting };
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
      result = compose`${d.type != null ? formatSequence2(d.type) : ""}`;
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
function isObjectContext(context) {
  return context != null && typeof context === "object";
}

// src/utils/string-utils.ts
function isEmptyOrWhiteSpace2(value) {
  return value == null || typeof value === "string" && value.trim() === "";
}

// src/components/math.ts
var defaultHelpers2 = {
  convertToFraction: (d) => d,
  convertToFractionAsLatex: (d) => d,
  convertToUnit: (d) => d,
  unitAnchor: () => 1,
  solveLinearEquation: (fist, second, variable) => NaN,
  evalExpression: (expression, context) => NaN,
  evalNodeToNumber: (expression) => NaN,
  substituteContext: (expression, context) => NaN
};
var helpers2 = defaultHelpers2;
function configure2(config) {
  helpers2 = { ...defaultHelpers2, ...config };
}
var EmptyUnit2 = "";
function dimensionEntity2(unit = "cm") {
  return {
    length: { entity: "d\xE9lka", unit },
    area: { entity: "obsah", unit: unit === EmptyUnit2 ? EmptyUnit2 : `${unit}2` },
    volume: { entity: "objem", unit: unit === EmptyUnit2 ? EmptyUnit2 : `${unit}3` },
    lengths: ["d\xE9lka", unit],
    areas: ["obsah", unit === EmptyUnit2 ? EmptyUnit2 : `${unit}2`],
    volumes: ["objem", unit === EmptyUnit2 ? EmptyUnit2 : `${unit}3`]
  };
}
var dim2 = dimensionEntity2();
function isQuantityPredicate2(value) {
  return ["cont", "comp", "transfer", "rate", "comp-diff", "transfer", "quota", "delta", "frequency"].includes(value.kind);
}
function isRatioPredicate2(value) {
  return ["ratio", "comp-ratio"].includes(value.kind);
}
function isRatiosPredicate2(value) {
  return ["ratios"].includes(value.kind);
}
function isOperationPredicate(value) {
  return ["sum", "sum-combine", "product", "product-combine", "gcd", "lcd"].includes(value.kind) || ["scale", "scale-invert", "slide", "slide-invert", "diff", "complement", "unit", "round"].includes(value.kind);
}
function isRatePredicate(value) {
  return value.kind === "rate";
}
function isFrequencyPredicate(value) {
  return value.kind === "frequency";
}
function convertToExpression(expectedValue, compareTo, expectedValueOptions, variable = "x") {
  const convertedValue = Array.isArray(expectedValue) ? expectedValue : expectedValueOptions.asFraction ? helpers2.convertToFraction(expectedValue) : expectedValueOptions.asPercent ? expectedValue / 100 : expectedValue;
  const toCompare = (comp) => `${variable} ${comp} ${convertedValue}`;
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
function compDiff(agentMinuend, agentSubtrahend, quantity, entity) {
  return { kind: "comp-diff", agentMinuend, agentSubtrahend, quantity, entity };
}
function compareRule(a, b) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity} `;
  }
  if (equalAgent(a.agent, b.agentB)) {
    return {
      kind: "cont",
      agent: [b.agentA],
      quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b }),
      entity: a.entity,
      unit: a.unit
    };
  } else if (equalAgent(a.agent, b.agentA)) {
    return {
      kind: "cont",
      agent: [b.agentB],
      quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity + -1 * b.quantity : wrapToQuantity(`a.quantity + -1 * b.quantity`, { a, b }),
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
    question: `${computeQuestion(result.quantity)} ${equalAgent(a.agent, b.agentB) ? b.agentA : b.agentB}${formatEntity(result)}?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? " + " : " - "} ${formatNumber(abs(b.quantity))} `, result: formatNumber(result.quantity), ok: equalAgent(a.agent, b.agentB) },
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? " - " : " + "} ${formatNumber(abs(b.quantity))} `, result: formatNumber(result.quantity), ok: equalAgent(a.agent, b.agentA) }
    ] : []
  };
}
function angleCompareRule(a, b) {
  return { kind: "cont", agent: equalAgent(a.agent, b.agentB) ? [b.agentA] : [b.agentB], quantity: computeOtherAngle(a, b.relationship), entity: a.entity, unit: a.unit };
}
function inferAngleCompareRule(a, b) {
  const result = angleCompareRule(a, b);
  return {
    name: angleCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypo\u010Dti ${equalAgent(a.agent, b.agentB) ? [b.agentA] : [b.agentB]}? ${b.agentA} je ${formatAngle2(b.relationship)} k ${b.agentB}.`,
    result,
    options: isNumber2(result.quantity) ? [
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
    ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? a.ratio / b.ratio : wrapToRatio(`a.ratio / b.ratio`, { a, b })
  };
}
function inferToPartWholeCompareRule(a, b) {
  const result = toPartWholeCompareRule(a, b);
  return {
    name: toPartWholeCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${result.agentA} a ${result.agentB}. Kolikr\xE1t? `,
    result,
    options: isNumber2(a.ratio) && isNumber2(b.ratio) ? [
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
      ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? b.ratio >= 0 ? a.ratio * b.ratio : a.ratio / abs(b.ratio) : wrapToRatio(`b.ratio >= 0 ? a.ratio * b.ratio : a.ratio / abs(b.ratio)`, { a, b })
    };
  } else if (a.part == b.agentA) {
    return {
      kind: "ratio",
      whole: a.whole,
      part: b.agentB,
      ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? b.ratio > 0 ? a.ratio / b.ratio : a.ratio * abs(b.ratio) : wrapToRatio(`b.ratio > 0 ? a.ratio / b.ratio : a.ratio * abs(b.ratio)`, { a, b })
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
    options: isNumber2(a.ratio) && isNumber2(b.ratio) ? [
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
      ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? abs(a.ratio) * abs(b.ratio) : wrapToRatio(`abs(a.ratio) * abs(b.ratio)`, { a, b })
    };
  } else if (a.agentB === b.agentB) {
    return {
      kind: "comp-ratio",
      agentA: a.agentA,
      agentB: b.agentA,
      ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? abs(a.ratio) * 1 / abs(b.ratio) : wrapToRatio(`abs(a.ratio) * 1 / abs(b.ratio)`, { a, b })
    };
  } else if (a.agentA === b.agentA) {
    return {
      kind: "comp-ratio",
      agentA: a.agentB,
      agentB: b.agentB,
      ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? 1 / abs(a.ratio) * abs(b.ratio) : wrapToRatio(`1 / abs(a.ratio) * abs(b.ratio)`, { a, b })
    };
  } else if (a.agentA === b.agentB) {
    return {
      kind: "comp-ratio",
      agentA: a.agentB,
      agentB: b.agentA,
      ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? 1 / abs(a.ratio) * 1 / abs(b.ratio) : wrapToRatio(`1 / abs(a.ratio) * 1 / abs(b.ratio)`, { a, b })
    };
  } else {
    throw `Mismatch agent ${a.agentA}, ${a.agentB} any of ${b.agentA}, ${b.agentB}`;
  }
}
function inferTransitiveRatioCompareRule(a, b) {
  const result = transitiveRatioCompareRule(a, b);
  return {
    name: transitiveRatioCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${result.agentA} a ${result.agentB}?`,
    result,
    options: isNumber2(a.ratio) && isNumber2(b.ratio) && isNumber2(result.ratio) ? [
      { tex: `${formatRatio(abs(a.ratio))} * ${formatRatio(abs(b.ratio))}`, result: formatRatio(result.ratio), ok: a.agentB === b.agentA },
      { tex: `${formatRatio(abs(a.ratio))} / ${formatRatio(abs(b.ratio))}`, result: formatRatio(result.ratio), ok: a.agentB === b.agentB },
      { tex: `1/${formatRatio(abs(a.ratio))} * ${formatRatio(abs(b.ratio))}`, result: formatRatio(result.ratio), ok: a.agentA === b.agentA },
      { tex: `1/${formatRatio(abs(a.ratio))} / ${formatRatio(abs(b.ratio))}`, result: formatRatio(result.ratio), ok: a.agentA === b.agentB }
    ] : []
  };
}
function convertRatioCompareToRatioRule(b) {
  if (!isNumber2(b.ratio)) {
    throw "convertRatioCompareToRatioRule does not non quantity";
  }
  const whole = b.ratio > 1 ? b.agentA : b.agentB;
  return { kind: "ratio", whole, part: whole == b.agentB ? b.agentA : b.agentB, ratio: whole == b.agentA ? abs(b.ratio) : abs(1 / b.ratio) };
}
function inferConvertRatioCompareToRatioRule(b) {
  const result = convertRatioCompareToRatioRule(b);
  if (!isNumber2(b.ratio) || !isNumber2(result.ratio)) {
    throw "convertRatioCompareToRatioRule does not support expressions";
  }
  return {
    name: convertRatioCompareToRatioRule.name,
    inputParameters: extractKinds(b),
    question: `Vyj\xE1d\u0159i ${result.part} jako \u010D\xE1st z ${result.whole}?`,
    result,
    options: isNumber2(result.ratio) ? [
      { tex: `${formatRatio(abs(b.ratio))}`, result: formatRatio(result.ratio), ok: result.whole == b.agentA },
      { tex: `1 / ${formatRatio(abs(b.ratio))}`, result: formatRatio(result.ratio), ok: result.whole == b.agentB }
    ] : []
  };
}
function convertRatioCompareToTwoPartRatioRule(b, a) {
  if (!isNumber2(b.ratio)) {
    throw "convertToPartToPartRatios does not non quantity";
  }
  return { kind: "ratios", whole: a.whole, parts: [b.agentA, b.agentB], ratios: [abs(b.ratio), 1] };
}
function inferConvertRatioCompareToTwoPartRatioRule(b, a, last) {
  const tempResult = convertRatioCompareToTwoPartRatioRule(b, a);
  if (!isNumber2(b.ratio) || !areNumbers(tempResult.ratios)) {
    throw "convertToPartToPartRatios does not support expressions";
  }
  const result = {
    ...tempResult,
    ratios: last != null ? ratiosToBaseForm(tempResult.ratios) : tempResult.ratios
  };
  return {
    name: convertRatioCompareToTwoPartRatioRule.name,
    inputParameters: extractKinds(b),
    question: `Vyj\xE1d\u0159i pom\u011Brem \u010D\xE1st\xED ${[b.agentA, b.agentB].join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `${formatRatio(abs(b.ratio))}`, result: result.ratios.map((d) => formatRatio(d)).join(":"), ok: true },
      { tex: `1 / ${formatRatio(abs(b.ratio))}`, result: result.ratios.map((d) => formatRatio(d)).join(":"), ok: false }
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
function inferConvertRatioCompareToRatiosRule(arr, a, last) {
  const numbers = arr.map((d) => d.ratio);
  const tempResult = convertRatioCompareToRatiosRule(arr, a);
  if (!areNumbers(numbers) || !areNumbers(tempResult.ratios)) {
    throw "convertRatioCompareToRatiosRule does not support expressions";
  }
  const result = {
    ...tempResult,
    ratios: last != null ? ratiosToBaseForm(tempResult.ratios) : tempResult.ratios
  };
  return {
    name: convertRatioCompareToRatiosRule.name,
    inputParameters: [],
    question: `Vyj\xE1d\u0159i pom\u011Brem \u010D\xE1st\xED ${tempResult.parts.join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [
      { tex: `${numbers.map((d) => formatRatio(abs(d)))}`, result: result.ratios.map((d) => formatRatio(d)).join(":"), ok: true },
      { tex: `1 / ${numbers.map((d) => formatRatio(abs(d)))}`, result: result.ratios.map((d) => formatRatio(d)).join(":"), ok: false }
    ] : []
  };
}
function unitConvertFactors(a, b) {
  const destination = helpers2.unitAnchor(a.unit);
  const origin = helpers2.unitAnchor(b.unit);
  const convertFactor = destination >= origin ? destination / origin : origin / destination;
  return { destination, origin, convertFactor };
}
function convertToUnitRule(a, b) {
  if (a.unit == null) {
    throw `Missing unit ${a.kind === "cont" ? a.agent : `${a.agentA} to ${a.agentB}`} a ${a.entity}`;
  }
  const { destination, origin, convertFactor } = unitConvertFactors(a, b);
  return {
    ...a,
    quantity: isNumber2(a.quantity) ? helpers2.convertToUnit(a.quantity, a.unit, b.unit) : destination >= origin ? wrapToQuantity(`a.quantity * ${convertFactor}`, { a }) : wrapToQuantity(`a.quantity / ${convertFactor}`, { a }),
    unit: b.unit
  };
}
function inferConvertToUnitRule(a, b) {
  const result = convertToUnitRule(a, b);
  const { destination, origin, convertFactor } = unitConvertFactors(a, b);
  return {
    name: convertToUnitRule.name,
    inputParameters: extractKinds(a, b),
    question: isNumber2(a.quantity) ? `P\u0159eve\u010F ${formatNumber(a.quantity)} ${formatEntity(a)} na ${b.unit}.` : `P\u0159eve\u010F na ${b.unit}.`,
    result,
    options: isNumber2(a.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(convertFactor)}`, result: formatNumber(result.quantity), ok: destination >= origin },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(convertFactor)}`, result: formatNumber(result.quantity), ok: destination < origin }
    ] : []
  };
}
function roundToRule(a, b) {
  const order = b.order ?? 1;
  if (order <= 0) {
    throw new Error("Order must be positive");
  }
  return {
    ...a,
    quantity: isNumber2(a.quantity) ? Math.round(a.quantity / order) * order : wrapToQuantity(`round ${a.quantity}`, { a, b })
    //@TODO - fix usage of the b.order in expression
  };
}
function inferRoundToRule(a, b) {
  const result = roundToRule(a, b);
  return {
    name: roundToRule.name,
    inputParameters: extractKinds(a, b),
    question: isNumber2(a.quantity) ? `Zaokrouhli ${formatNumber(a.quantity)} ${formatEntity(a)} na ${formatOrder(b.order)}.` : `Zaokrouhli na ${formatOrder(b.order)}.`,
    result,
    options: isNumber2(a.quantity) && isNumber2(result.quantity) ? [] : []
  };
}
function computeQuantityByRatioBase(a, b) {
  return isNumber2(a.quantity) && isNumber2(b.ratio) ? b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / abs(b.ratio) : isNumber2(b.ratio) ? b.ratio >= 0 ? wrapToQuantity(`a.quantity * b.ratio`, { a, b }) : wrapToQuantity(`a.quantity / abs(b.ratio)`, { a, b }) : wrapToQuantity(`a.quantity * b.ratio`, { a, b });
}
function computeQuantityByRatioPart(a, b) {
  return isNumber2(a.quantity) && isNumber2(b.ratio) ? b.ratio > 0 ? a.quantity / b.ratio : a.quantity * abs(b.ratio) : isNumber2(b.ratio) ? b.ratio > 0 ? wrapToQuantity(`a.quantity / b.ratio`, { a, b }) : wrapToQuantity(`a.quantity * abs(b.ratio)`, { a, b }) : wrapToQuantity(`a.quantity / b.ratio`, { a, b });
}
function ratioCompareRule(a, b, nthPart) {
  let result;
  if (equalAgent(a.agent, b.agentB) || a.entity == b.agentB) {
    result = {
      agent: equalAgent(a.agent, b.agentB) ? mergeAgent(b.agentB, b.agentA, a.agent) : a.agent,
      entity: a.entity == b.agentB ? b.agentA : a.entity,
      quantity: computeQuantityByRatioBase(a, b)
    };
  } else if (equalAgent(a.agent, b.agentA) || a.entity == b.agentA) {
    result = {
      agent: equalAgent(a.agent, b.agentA) ? mergeAgent(b.agentA, b.agentB, a.agent) : a.agent,
      entity: a.entity == b.agentA ? b.agentB : a.entity,
      quantity: computeQuantityByRatioPart(a, b)
    };
  } else if (b.agentA == nthPart?.agent) {
    result = {
      agent: mergeAgent(b.agentB, b.agentA, a.agent),
      quantity: isNumber2(a.quantity) && isNumber2(b.ratio) ? a.quantity / (abs(b.ratio) + 1) * abs(b.ratio) : wrapToQuantity(`a.quantity / (abs(b.ratio) + 1) * abs(b.ratio)`, { a, b })
    };
  } else {
    result = {
      agent: mergeAgent(b.agentA, b.agentB, a.agent),
      quantity: isNumber2(a.quantity) && isNumber2(b.ratio) ? a.quantity / (Math.abs(b.ratio) + 1) : wrapToQuantity(`a.quantity / (abs(b.ratio) + 1)`, { a, b })
    };
  }
  return { ...a, ...result };
}
function inferRatioCompareRule(a, b, nthPart) {
  const result = ratioCompareRule(a, b, nthPart);
  return {
    name: ratioCompareRule.name,
    inputParameters: extractKinds(a, b, nthPart),
    question: `${computeQuestion(result.quantity)} ${result.agent} ${result.kind === "rate" ? formatEntity(result.entity) : formatEntity(result)}?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.ratio) && isNumber2(result.quantity) ? [
      {
        tex: `${formatNumber(a.quantity)} * ${formatRatio(abs(b.ratio))} `,
        result: formatNumber(a.quantity * b.ratio),
        ok: [a.agent, a.entity].flat().includes(b.agentB) && b.ratio >= 0 || [a.agent, a.entity].includes(b.agentA) && b.ratio < 0
      },
      {
        tex: `${formatNumber(a.quantity)} / ${formatRatio(abs(b.ratio))}`,
        result: formatNumber(a.quantity / b.ratio),
        ok: [a.agent, a.entity].flat().includes(b.agentA) && b.ratio >= 0 || [a.agent, a.entity].includes(b.agentB) && b.ratio < 0
      },
      {
        tex: `${formatNumber(a.quantity)} / (${formatRatio(abs(b.ratio))} + 1)`,
        result: formatNumber(result.quantity),
        ok: ![a.agent, a.entity].flat().includes(b.agentA) && ![a.agent, a.entity].includes(b.agentB) && b.agentA !== nthPart?.agent
      },
      {
        tex: `${formatNumber(a.quantity)} / (${formatRatio(abs(b.ratio))} + 1) * ${formatRatio(abs(b.ratio))}`,
        result: formatNumber(result.quantity),
        ok: b.agentA == nthPart?.agent
      }
    ] : []
  };
}
function transferRule(a, b, transferOrder) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const plus = isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b });
  const minus = isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b });
  const quantity = transferOrder === "before" ? equalAgent(a.agent, b.agentSender.name) ? plus : minus : equalAgent(a.agent, b.agentSender.name) ? minus : plus;
  const newAgent = equalAgent(a.agent, b.agentReceiver.name) ? getAgentName(b.agentReceiver, transferOrder) : equalAgent(a.agent, b.agentSender.name) ? getAgentName(b.agentSender, transferOrder) : a.agent;
  return { kind: "cont", agent: normalizeToAgent(newAgent), quantity, entity: a.entity };
}
function inferTransferRule(a, b, transferOrder) {
  const result = transferRule(a, b, transferOrder);
  return {
    name: transferRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.quantity)} ${a.agent}${formatEntity(result)}?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${transferOrder === "before" && equalAgent(a.agent, b.agentSender.name) ? " + " : " - "} ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: equalAgent(a.agent, b.agentSender.name) },
      { tex: `${formatNumber(a.quantity)} ${transferOrder !== "before" && equalAgent(a.agent, b.agentSender.name) ? " - " : " + "} ${formatNumber(abs(b.quantity))}`, result: formatNumber(result.quantity), ok: equalAgent(a.agent, b.agentReceiver.name) }
    ] : []
  };
}
function deltaRule(a, b, transferOrder) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const plus = isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b });
  const minus = isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b });
  const quantity = transferOrder === "before" ? minus : plus;
  const agent = b.agent.name;
  return { kind: "cont", agent: [agent], quantity, entity: a.entity };
}
function inferDeltaRule(a, b, transferOrder) {
  const result = deltaRule(a, b, transferOrder);
  return {
    name: deltaRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.quantity)} ${result.agent}${formatEntity(result)}?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${transferOrder === "before" ? " - " : " + "} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(a.quantity)} ${transferOrder == "before" ? " + " : " - "} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: false }
    ] : []
  };
}
function partWholeComplementRule(a, b) {
  return {
    kind: "ratio",
    whole: b.whole,
    ratio: isNumber2(b.ratio) ? 1 - b.ratio : wrapToRatio(`1 - b.ratio`, { a, b }),
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
    options: isNumber2(b.ratio) ? [
      { tex: `${formatRatio(1, b.asPercent)} - ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(1 - b.ratio, b.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} - ${formatRatio(1, b.asPercent)}`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false }
    ] : []
  };
}
function convertTwoPartRatioToRatioCompareRule(b, { agent, asPercent }) {
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
    ratio: areNumbers(b.ratios) ? b.ratios[agentAIndex] / b.ratios[agentBaseIndex] : wrapToRatio(`b.ratios[${agentAIndex}] / b.ratios[${agentBaseIndex}]`, { b }),
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
    ratio: isNumber2(a.ratio) ? a.ratio / (1 - a.ratio) : wrapToRatio(`a.ratio / (1 - a.ratio)`, { a }),
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
    options: isNumber2(a.ratio) && isNumber2(result.ratio) ? [
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
    options: isNumber2(b.ratio) && isNumber2(result.ratio) ? [
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
    ratio: isNumber2(b.ratio) ? 1 / b.ratio : wrapToRatio(`1 / b.ratio`, { b }),
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
    options: isNumber2(b.ratio) && isNumber2(result.ratio) ? [
      { tex: `1 / ${formatRatio(b.ratio, b.asPercent)}`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatRatio(b.ratio, b.asPercent)} / 100`, result: formatRatio(b.ratio - 1, b.asPercent), ok: false }
    ] : []
  };
}
function convertPartToPartToPartWholeRule(a, b, asPercent) {
  if (!b.parts.includes(a.agent)) {
    throw `Missing part ${a.agent} , ${b.parts.join()}.`;
  }
  const index = b.parts.indexOf(a.agent);
  return {
    kind: "ratio",
    whole: b.whole,
    ratio: areNumbers(b.ratios) ? b.ratios[index] / b.ratios.reduce((out, d) => out += d, 0) : wrapToRatio(`b.ratios[${index}] / (${b.ratios.map((d, i) => `x${i + 1}`).join(" + ")})`, { b, ...Object.fromEntries(b.ratios.map((d, i) => [`x${i + 1}`, d])) }),
    part: b.parts[index],
    asPercent
  };
}
function inferConvertPartToPartToPartWholeRule(a, b, last) {
  const result = convertPartToPartToPartWholeRule(a, b, last.asPercent);
  const index = b.parts.indexOf(a.agent);
  return {
    name: convertPartToPartToPartWholeRule.name,
    inputParameters: extractKinds(a, b, last),
    question: `Vyj\xE1d\u0159i ${last.asPercent ? "procentem" : "pom\u011Brem"} ${result.part} z ${result.whole}?`,
    result,
    options: areNumbers(b.ratios) && isNumber2(result.ratio) ? [
      { tex: `${formatNumber(b.ratios[index])} / (${b.ratios.map((d) => formatNumber(d)).join(" + ")})`, result: formatRatio(result.ratio, result.asPercent), ok: true },
      { tex: `${formatNumber(b.ratios[index])} * (${b.ratios.map((d) => formatNumber(d)).join(" + ")})`, result: formatRatio(result.ratio, result.asPercent), ok: false }
    ] : []
  };
}
function ratioCompareToCompareRule(a, b) {
  if (!(a.agentA == b.agentA && a.agentB == b.agentB || a.agentA == b.agentB && a.agentB == b.agentA)) {
    throw "Uncompatible compare rules. Absolute compare agent does not match relative compare agent";
  }
  const agent = a.agentB === b.agentA ? b.agentA : b.agentB;
  if (isNumber2(a.ratio) && isNumber2(b.quantity)) {
    const quantity = a.agentB === b.agentA ? -1 * b.quantity : b.quantity;
    if (quantity > 0 && a.ratio < 1 || quantity < 0 && a.ratio > 1) {
      throw `Uncompatible compare rules. Absolute compare ${quantity} between ${b.agentA} a ${b.agentB} does not match relative compare ${a.ratio}. `;
    }
  }
  return {
    kind: "cont",
    agent: [agent],
    entity: b.entity,
    unit: b.unit,
    quantity: isNumber2(a.ratio) && isNumber2(b.quantity) ? abs(b.quantity / (a.ratio - 1)) : wrapToQuantity(`abs(b.quantity / (a.ratio - 1))`, { a, b })
  };
}
function inferRatioCompareToCompareRule(a, b, last) {
  const result = ratioCompareToCompareRule(a, b);
  return {
    name: ratioCompareToCompareRule.name,
    inputParameters: extractKinds(a, b),
    question: containerQuestion(result),
    result,
    options: isNumber2(a.ratio) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
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
    options: isNumber2(b.ratio) && isNumber2(a.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity * b.ratio), ok: [a.entity].includes(b.agentB) && b.ratio >= 0 || [a.entity].includes(b.agentA) && b.ratio < 0 },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(abs(b.ratio))}`, result: formatNumber(a.quantity / b.ratio), ok: [a.entity].includes(b.agentA) && b.ratio >= 0 || [a.entity].includes(b.agentB) && b.ratio < 0 }
    ] : []
  };
}
function compRatiosToCompRule(a, b, nthPart) {
  const aIndex = a.parts.indexOf(b.agentA);
  const bIndex = a.parts.indexOf(b.agentB);
  if (aIndex === -1 || bIndex === -1) {
    throw `Missing parts to compare ${a.parts.join(",")}, required parts ${b.agentA, b.agentB}`;
  }
  if (isNumber2(b.quantity) && areNumbers(a.ratios)) {
    const diff = a.ratios[aIndex] - a.ratios[bIndex];
    if (!(diff > 0 && b.quantity > 0 || diff < 0 && b.quantity < 0 || diff == 0 && b.quantity == 0)) {
      throw `Uncompatible compare rules. Absolute compare ${b.quantity} between ${b.agentA} a ${b.agentB} does not match relative compare.`;
    }
  }
  const lastIndex = nthPart?.agent != null ? a.parts.findIndex((d) => d === nthPart.agent) : aIndex > bIndex ? aIndex : bIndex;
  const nthPartAgent = a.parts[lastIndex];
  return {
    kind: "cont",
    agent: [nthPartAgent],
    entity: b.entity,
    unit: b.unit,
    quantity: isNumber2(b.quantity) && areNumbers(a.ratios) ? abs(b.quantity / (a.ratios[aIndex] - a.ratios[bIndex])) * a.ratios[lastIndex] : wrapToQuantity(`abs(b.quantity / (a.ratios[${aIndex}] - a.ratios[${bIndex}])) * a.ratios[${lastIndex}]`, { a, b })
  };
}
function inferCompRatiosToCompRule(a, b, nthPart) {
  const result = compRatiosToCompRule(a, b, nthPart);
  const aIndex = a.parts.indexOf(b.agentA);
  const bIndex = a.parts.indexOf(b.agentB);
  const lastIndex = nthPart?.agent != null ? a.parts.findIndex((d) => d === nthPart.agent) : aIndex > bIndex ? aIndex : bIndex;
  return {
    name: compRatiosToCompRule.name,
    inputParameters: extractKinds(a, b, nthPart),
    question: containerQuestion(result),
    result,
    options: areNumbers(a.ratios) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber(abs(b.quantity))} / |${formatNumber(a.ratios[aIndex])} - ${formatNumber(a.ratios[bIndex])}| * ${formatNumber(a.ratios[lastIndex])}`, result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function proportionRule(a, b) {
  return {
    ...a,
    ...b.inverse && { ratio: isNumber2(a.ratio) ? 1 / a.ratio : wrapToRatio(`1 / a.ratio`, { a }) }
  };
}
function inferProportionRule(a, b) {
  const result = proportionRule(a, b);
  return {
    name: proportionRule.name,
    inputParameters: extractKinds(a, b),
    question: `Jak\xFD je vztah mezi veli\u010Dinami? ${b.entities?.join(" a ")}. Vyj\xE1d\u0159i jako pom\u011Br.`,
    result,
    options: isNumber2(a.ratio) ? [
      { tex: `${formatRatio(a.ratio)}`, result: formatRatio(a.ratio), ok: !b.inverse },
      { tex: `1 / ${formatRatio(a.ratio)}`, result: formatRatio(1 / a.ratio), ok: b.inverse }
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
    options: []
  };
}
function invertRatiosRule(a, b) {
  if (!areNumbers(a.ratios)) {
    throw `invertRatiosRule is not support by non quantity type`;
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
    options: areNumbers(a.ratios) ? [] : []
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
    options: areNumbers(a.ratios) ? [] : []
  };
}
function partToWholeRule(a, b) {
  if (!(matchAgent(b.whole, a) || matchAgent(b.part, a))) {
    throw `Mismatch entity ${[a.agent, a.entity].join()} any of ${[b.whole, b.part].join()}`;
  }
  return matchAgent(b.whole, a) ? {
    kind: "cont",
    agent: [b.part],
    entity: a.entity,
    quantity: isNumber2(a.quantity) && isNumber2(b.ratio) ? a.quantity * b.ratio : wrapToQuantity(`a.quantity * b.ratio`, { a, b }),
    unit: a.unit
  } : {
    kind: "cont",
    agent: [b.whole],
    entity: a.entity,
    quantity: isNumber2(a.quantity) && isNumber2(b.ratio) ? a.quantity / b.ratio : wrapToQuantity(`a.quantity / b.ratio`, { a, b }),
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
    options: isNumber2(a.quantity) && isNumber2(b.ratio) && isNumber2(result.quantity) ? [
      { tex: `${formatRatio(b.ratio)} * ${formatNumber(a.quantity)}`, result: formatNumber(result.quantity), ok: matchAgent(b.whole, a) },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(b.ratio)}`, result: formatNumber(a.quantity / b.ratio), ok: !matchAgent(b.whole, a) }
    ] : []
  };
}
function rateRule(a, rate) {
  const aEntity = a.kind == "cont" ? a.entity : a.kind === "quota" ? a.agentQuota : a.entity.entity;
  if (!(aEntity === rate.entity.entity || aEntity === rate.entityBase.entity)) {
    throw `Mismatch entity ${aEntity} any of ${rate.entity.entity}, ${rate.entityBase.entity}`;
  }
  const isEntityBase2 = aEntity == rate.entity.entity;
  const isUnitRate = rate.baseQuantity === 1;
  return {
    kind: "cont",
    agent: Array.isArray(a.agent) ? mergeAgents(a.agent, rate.agent) : normalizeToAgent(a.agent),
    entity: isEntityBase2 ? rate.entityBase.entity : rate.entity.entity,
    unit: isEntityBase2 ? rate.entityBase.unit : rate.entity.unit,
    quantity: aEntity == rate.entity.entity ? isNumber2(a.quantity) && isNumber2(rate.quantity) && isNumber2(rate.baseQuantity) ? a.quantity / (!isUnitRate ? rate.quantity / rate.baseQuantity : rate.quantity) : !isUnitRate ? wrapToQuantity(`a.quantity / (rate.quantity/rate.baseQuantity)`, { a, rate }) : wrapToQuantity(`a.quantity / rate.quantity`, { a, rate }) : isNumber2(a.quantity) && isNumber2(rate.quantity) && isNumber2(rate.baseQuantity) ? a.quantity * (!isUnitRate ? rate.quantity / rate.baseQuantity : rate.quantity) : !isUnitRate ? wrapToQuantity(`a.quantity * (rate.quantity/rate.baseQuantity)`, { a, rate }) : wrapToQuantity(`a.quantity * rate.quantity`, { a, rate })
  };
}
function inferRateRule(a, rate) {
  const result = rateRule(a, rate);
  const aEntity = a.kind == "cont" ? a.entity : a.kind === "quota" ? a.agentQuota : a.entity.entity;
  const isUnitRate = rate.baseQuantity === 1;
  return {
    name: rateRule.name,
    inputParameters: extractKinds(a, rate),
    question: containerQuestion(result),
    result,
    options: isNumber2(a.quantity) && isNumber2(rate.quantity) && isNumber2(result.quantity) && isNumber2(rate.baseQuantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(rate.quantity)}`, result: formatNumber(result.quantity), ok: isUnitRate && aEntity !== rate.entity.entity },
      ...!isUnitRate ? [{ tex: `${formatNumber(a.quantity)} * (${formatNumber(rate.quantity)}/${formatNumber(rate.baseQuantity)})`, result: formatNumber(result.quantity), ok: !isUnitRate && aEntity !== rate.entity.entity }] : [],
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(rate.quantity)}`, result: formatNumber(result.quantity), ok: isUnitRate && aEntity === rate.entity.entity },
      ...!isUnitRate ? [{ tex: `${formatNumber(a.quantity)} / (${formatNumber(rate.quantity)}/${formatNumber(rate.baseQuantity)})`, result: formatNumber(result.quantity), ok: !isUnitRate && aEntity === rate.entity.entity }] : []
    ] : []
  };
}
function quotaRule(a, quota) {
  if (!(equalAgent(a.agent, quota.agent) || equalAgent(a.agent, quota.agentQuota))) {
    throw `Mismatch entity ${a.entity} any of ${quota.agent}, ${quota.agentQuota}`;
  }
  return {
    kind: "cont",
    agent: equalAgent(a.agent, quota.agentQuota) ? [quota.agent] : [quota.agentQuota],
    entity: a.entity,
    quantity: equalAgent(a.agent, quota.agentQuota) ? isNumber2(a.quantity) && isNumber2(quota.quantity) ? a.quantity * quota.quantity : wrapToQuantity(`a.quantity * quota.quantity`, { a, quota }) : isNumber2(a.quantity) && isNumber2(quota.quantity) ? a.quantity / quota.quantity : wrapToQuantity(`a.quantity / quota.quantity`, { a, quota })
  };
}
function inferQuotaRule(a, quota) {
  const result = quotaRule(a, quota);
  return {
    name: quotaRule.name,
    inputParameters: extractKinds(a, quota),
    question: containerQuestion(result),
    result,
    options: isNumber2(a.quantity) && isNumber2(quota.quantity) ? [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(quota.quantity)}`, result: formatNumber(a.quantity * quota.quantity), ok: equalAgent(a.agent, quota.agentQuota) },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota.quantity)}`, result: formatNumber(a.quantity / quota.quantity), ok: !equalAgent(a.agent, quota.agentQuota) }
    ] : []
  };
}
function toPartWholeRatio(part, whole, asPercent) {
  return {
    kind: "ratio",
    part: joinAgent(part.agent),
    whole: joinAgent(whole.agent),
    ratio: isNumber2(part.quantity) && isNumber2(whole.quantity) ? part.quantity / whole.quantity : wrapToRatio(`part.quantity / whole.quantity`, { part, whole }),
    asPercent
  };
}
function inferToPartWholeRatio(part, whole, last) {
  const result = toPartWholeRatio(part, whole, last.asPercent);
  return {
    name: toPartWholeRatio.name,
    inputParameters: extractKinds(part, whole, last),
    question: `Vyj\xE1d\u0159i ${last.asPercent ? "procentem" : "pom\u011Brem"} ${part.agent} z ${whole.agent}?`,
    result,
    options: isNumber2(part.quantity) && isNumber2(whole.quantity) && isNumber2(result.ratio) ? [
      { tex: `${formatNumber(whole.quantity)} / ${formatNumber(part.quantity)} ${last.asPercent ? " * 100" : ""}`, result: last.asPercent ? formatNumber(result.ratio * 100) : formatRatio(result.ratio), ok: false },
      { tex: `${formatNumber(part.quantity)} / ${formatNumber(whole.quantity)} ${last.asPercent ? " * 100" : ""}`, result: last.asPercent ? formatNumber(result.ratio * 100) : formatRatio(result.ratio), ok: true }
    ] : []
  };
}
function compareDiffRule(a, b) {
  if (!(equalAgent(a.agent, b.agentMinuend) || equalAgent(a.agent, b.agentSubtrahend))) {
    throw `Mismatch agents ${a.agent} any of ${b.agentMinuend} ${b.agentSubtrahend}`;
  }
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  const plus = isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b });
  const minus = isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b });
  return {
    kind: "cont",
    agent: equalAgent(a.agent, b.agentMinuend) ? [b.agentSubtrahend] : [b.agentMinuend],
    quantity: equalAgent(a.agent, b.agentMinuend) ? minus : plus,
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
    options: isNumber2(a.quantity) && isNumber2(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: equalAgent(a.agent, b.agentMinuend) },
      { tex: `${formatNumber(a.quantity)} + ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity + b.quantity), ok: !equalAgent(a.agent, b.agentMinuend) }
    ] : []
  };
}
function sumRule(items, b) {
  if (items.every((d) => isRatioPredicate2(d))) {
    const bases = items.every((d) => d.kind === "ratio") ? items.map((d) => d.whole) : items.map((d) => d.agentB);
    if (bases.filter(unique).length == bases.length) {
      throw `Sum only part to whole ratio with the same whole ${bases}`;
    }
    ;
    const ratios = items.map((d) => d.ratio);
    const ratio = areNumbers(ratios) ? ratios.reduce((out, d) => out += d, 0) : wrapToRatio(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
    return items.every((d) => d.kind === "ratio") ? { kind: "ratio", whole: bases[0], ratio, part: b.wholeAgent, asPercent: items[0].asPercent } : { kind: "comp-ratio", agentA: b.wholeAgent, agentB: bases[0], ratio, asPercent: items[0].asPercent };
  } else if (items.every((d) => isQuantityPredicate2(d))) {
    if (items.every((d) => isFrequencyPredicate(d))) {
      const values = items.map((d) => [d.quantity, d.baseQuantity]);
      const quantity = areTupleNumbers(values) ? values.reduce((out, [q, baseQ]) => out += q * baseQ, 0) : wrapToQuantity(items.map((d, i) => `x${i + 1}.quantity * x${i + 1}.baseQuantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
      return {
        kind: "cont",
        agent: [b.wholeAgent],
        quantity,
        entity: b.wholeEntity != null ? b.wholeEntity.entity : items[0].entityBase.entity,
        unit: b.wholeEntity != null ? b.wholeEntity.unit : items[0].entityBase.unit
      };
    } else {
      const values = items.map((d) => d.quantity);
      const quantity = areNumbers(values) ? values.reduce((out, d) => out += d, 0) : wrapToQuantity(items.map((d, i) => `x${i + 1}.quantity`).join(" + "), Object.fromEntries(items.map((d, i) => [`x${i + 1}`, d])));
      if (items.every((d) => isRatePredicate(d))) {
        const { entity, entityBase } = items[0];
        return { kind: "rate", agent: [b.wholeAgent], quantity, entity, entityBase, baseQuantity: 1 };
      } else {
        if (b.kind !== "sum-combine") {
          const itemsEntities = items.map((d) => d.entity);
          if (b.wholeEntity === null && itemsEntities.filter(unique).length !== 1) {
            throw `All predicates should have the same entity ${itemsEntities.map((d) => JSON.stringify(d)).join("")}.`;
          }
        }
        return {
          kind: "cont",
          agent: [b.wholeAgent],
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
  const isQuantity = isQuantityPredicate2(result);
  return {
    name: sumRule.name,
    inputParameters: extractKinds(...items, b),
    question: result.kind === "cont" ? containerQuestion(result) : result.kind === "rate" ? `${computeQuestion(result.quantity)} ${result.agent}?` : result.kind === "ratio" ? `${computeQuestion(result.ratio)} ${result.part} z ${result.whole}?` : `${computeQuestion(result.ratio)} kolikr\xE1t ${result.agentA} v\xEDce nebo m\xE9n\u011B ne\u017E ${result.agentB}?`,
    result,
    options: items.every((d) => isFrequencyPredicate(d)) ? [] : isQuantity && isNumber2(result.quantity) || isRatioPredicate2(result) && isNumber2(result.ratio) ? [
      {
        tex: items.map((d) => isQuantity ? formatNumber(d.quantity) : formatRatio(d.ratio, d.percent)).join(" + "),
        result: isQuantity ? isNumber2(result.quantity) ? formatNumber(result.quantity) : "N/A" : isNumber2(result.ratio) ? formatRatio(result.ratio, result.asPercent) : "N/A",
        ok: true
      },
      {
        tex: items.map((d) => isQuantity ? formatNumber(d.quantity) : formatRatio(d.ratio, d.percent)).join(" * "),
        result: isQuantity ? isNumber2(result.quantity) ? formatNumber(result.quantity) : "N/A" : isNumber2(result.ratio) ? formatRatio(result.ratio, result.asPercent) : "N/A",
        ok: false
      }
    ] : []
  };
}
function productRule(items, b) {
  const values = items.map((d) => d.quantity);
  const entity = b.wholeEntity != null ? b.wholeEntity : items.find((d) => d.entity != null && d.entity != "");
  const convertedEntity = entity != null ? toEntity(entity) : { entity: "", unit: void 0 };
  return {
    kind: "cont",
    agent: [b.wholeAgent],
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
    agent: [b.agent],
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
    options: areNumbers(values) && isNumber2(result.quantity) ? [
      { tex: gcdFromPrimeFactors(primeFactorization(values)).join(" * "), result: formatNumber(result.quantity), ok: true }
      //{ tex: lcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ] : []
  };
}
function lcdRule(values, b) {
  return {
    kind: "cont",
    agent: [b.agent],
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
    inputParameters: extractKinds(...items, b),
    question: containerQuestion(result),
    result,
    options: areNumbers(values) && isNumber2(result.quantity) ? [
      { tex: lcdFromPrimeFactors(primeFactorization(values)).join(" * "), result: formatNumber(result.quantity), ok: true }
      //{ tex: gcdFromPrimeFactors(factors).join(" * "), result: formatNumber(result.quantity), ok: false },
    ] : []
  };
}
function tupleRule(items, last) {
  const result = { kind: "tuple", agent: last.agent, items };
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
  const quantity = isNumber2(a.quantity) ? b.kind === "number-decimal-part" ? splitDecimalAndFractionPartsRule(a.quantity)[0] : splitDecimalAndFractionPartsRule(a.quantity)[1] : b.kind === "number-decimal-part" ? wrapToQuantity(`floor(${a.quantity})`, { a }) : wrapToQuantity(`(${a.quantity}) - floor(${a.quantity})`, { a });
  const result = {
    ...a,
    agent: normalizeToAgent(b?.agent ?? a.agent),
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
    agentB: complementSingleAgent(b.agent, [a.agent]),
    agentA: complementSingleAgent(a.agent, [b.agent]),
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }),
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
    options: isNumber2(a.quantity) && isNumber2(b.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(a.quantity - b.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ] : []
  };
}
function toDeltaRule(a, b, last) {
  if (a.entity != b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  return {
    kind: "delta",
    agent: { name: last.agent?.name ?? singleAgent(b.agent), nameBefore: singleAgent(a.agent), nameAfter: singleAgent(b.agent) },
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? b.quantity - a.quantity : wrapToQuantity(`b.quantity - a.quantity`, { a, b }),
    entity: a.entity,
    unit: a.unit
  };
}
function inferToDeltaRule(a, b, last) {
  const result = toDeltaRule(a, b, last);
  return {
    name: toDeltaRule.name,
    inputParameters: extractKinds(a, b, last),
    question: `Zm\u011Bna stavu ${a.agent} => ${b.agent}. O kolik?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) ? [
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
    options: isNumber2(a.quantity) && isNumber2(b.quantity) ? [] : []
  };
}
function convertDeltaToCompareEx(a, b) {
  const { agentA, agentB, entity, unit } = b;
  return { kind: "comp", agentA, agentB, quantity: a.quantity, entity, unit };
}
function inferConvertDeltaToCompareRule(a, b) {
  const result = convertDeltaToCompareEx(a, b);
  return {
    name: toDeltaRule.name,
    inputParameters: extractKinds(a, b),
    question: `Porovnej ${b.agentA} => ${b.agentB}. O kolik?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) ? [] : []
  };
}
function pythagorasRule(a, b, last) {
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
  if (equalAgent(a.agent, last.longest) || equalAgent(b.agent, last.longest)) {
    const longest = equalAgent(a.agent, last.longest) ? a : b;
    const otherSite = equalAgent(a.agent, last.longest) ? b : a;
    return {
      ...temp,
      quantity: isNumber2(longest.quantity) && isNumber2(otherSite.quantity) ? Math.sqrt(Math.pow(longest.quantity, 2) - Math.pow(otherSite.quantity, 2)) : wrapToQuantity(`sqrt(longest.quantity^2 - otherSite.quantity^2)`, { longest, otherSite }),
      agent: equalAgent(last.sites[1], otherSite.agent) ? [last.sites[0]] : [last.sites[1]]
    };
  } else {
    return {
      ...temp,
      quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? Math.sqrt(Math.pow(a.quantity, 2) + Math.pow(b.quantity, 2)) : wrapToQuantity(`sqrt (a.quantity^2 + b.quantity^2)`, { a, b }),
      agent: [last.longest]
    };
  }
}
function inferPythagorasRule(a, b, last) {
  const result = pythagorasRule(a, b, last);
  const longest = equalAgent(a.agent, last.longest) ? a : b;
  const otherSite = equalAgent(a.agent, last.longest) ? b : a;
  return {
    name: pythagorasRule.name,
    inputParameters: extractKinds(a, b, last),
    question: `Vypo\u010D\xEDtej stranu ${result.agent} dle Pythagorovi v\u011Bty?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(longest.quantity) && isNumber2(otherSite.quantity) && isNumber2(result.quantity) ? [
      { tex: `\\sqrt{${formatNumber(longest.quantity)}^2 - ${formatNumber(otherSite.quantity)}^2}`, result: formatNumber(result.quantity), ok: equalAgent(a.agent, last.longest) || equalAgent(b.agent, last.longest) },
      { tex: `\\sqrt{${formatNumber(a.quantity)}^2 + ${formatNumber(b.quantity)}^2}`, result: formatNumber(result.quantity), ok: !(equalAgent(a.agent, last.longest) || equalAgent(b.agent, last.longest)) }
    ] : []
  };
}
function alligationRule(items, last) {
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
    throw `AlligationRule does not support non quantitive numbers.`;
  }
  nums.sort((x, y) => x.quantity - y.quantity);
  const small = nums[0].quantity;
  const middle = nums[1].quantity;
  const large = nums[2].quantity;
  return {
    kind: "ratios",
    whole: last.agent,
    ...aEntity,
    ratios: [Math.abs(small - middle), Math.abs(large - middle)],
    parts: [singleAgent(nums[0].agent), singleAgent(nums[2].agent)]
  };
}
function inferAlligationRule(items, last) {
  const result = alligationRule(items, last);
  const [min3, avarage, max3] = items.map((d) => d.quantity).sort((f, s) => f - s);
  return {
    name: alligationRule.name,
    inputParameters: extractKinds(...items, last),
    question: `Vypo\u010D\xEDtej ${result.whole} mezi ${result.parts.join(" a ")} vyv\xE1\u017Een\xEDm v\u016F\u010Di pr\u016Fm\u011Bru?`,
    result,
    options: areNumbers(result.ratios) ? [] : []
  };
}
function triangleAngleRule(a, b, last) {
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
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? 180 - (a.quantity + b.quantity) : wrapToQuantity(`180 - (a.quantity + b.quantity)`, { a, b }),
    agent: normalizeToAgent(last.agent)
  };
}
function inferTriangleAngleRule(a, b, last) {
  const result = triangleAngleRule(a, b, last);
  return {
    name: triangleAngleRule.name,
    inputParameters: extractKinds(a, b, last),
    question: `Vypo\u010D\xEDtej ${result.agent} dle pravidla sou\u010Dtu vnit\u0159n\xEDch \xFAhl\u016F v troj\xFAheln\xEDku?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
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
    options: isNumber2(a.ratio) && isNumber2(result.ratio) ? [
      { tex: `${formatRatio(a.ratio, a.asPercent)} / 100`, result: formatRatio(result.ratio, result.asPercent), ok: a.asPercent },
      { tex: `${formatRatio(a.ratio, a.asPercent)} * 100`, result: formatRatio(result.ratio, result.asPercent), ok: !a.asPercent }
    ] : []
  };
}
function toRatioCompareRule(a, b, ctor) {
  if (equalAgent(b.agent, a.agent) && b.entity != a.entity && a.kind === "cont" && b.kind === "cont") {
    b = toGenerAgent(b);
    a = toGenerAgent(a);
  }
  if (!isSameEntity(a.entity, b.entity)) {
    throw `Mismatch entity ${JSON.stringify(b.entity)}, ${JSON.stringify(a.entity)}`;
  }
  return {
    kind: "comp-ratio",
    agentB: singleAgent(b.agent),
    agentA: singleAgent(a.agent),
    ratio: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity / b.quantity : wrapToRatio(`a.quantity / b.quantity`, { a, b }),
    ...ctor.asPercent && { asPercent: true }
  };
}
function inferToRatioCompareRule(a, b, ctor) {
  const result = toRatioCompareRule(a, b, ctor);
  if (isNumber2(result.ratio) && isNumber2(a.quantity) && isNumber2(b.quantity)) {
    const between = result.ratio > 1 / 2 && result.ratio < 2;
    return {
      name: toRatioCompareRule.name,
      inputParameters: extractKinds(a, b, ctor),
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
    return resultAsQuestion(result, { name: toRatioCompareRule.name, inputParameters: extractKinds(a, b, ctor) });
  }
}
function compareToRateRule(a, b, last) {
  return {
    kind: "rate",
    agent: last?.agent ?? [a.agentA],
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? abs(a.quantity) / abs(b.quantity) : wrapToQuantity(`abs(a.quantity) / abs(b.quantity)`, { a, b }),
    entity: { entity: a.entity },
    entityBase: { entity: b.entity },
    baseQuantity: 1
  };
}
function inferCompareToRateRule(a, b, last) {
  const result = compareToRateRule(a, b, last);
  return {
    name: compareToRateRule.name,
    inputParameters: extractKinds(a, b),
    question: `Rozd\u011Bl ${formatEntity({ entity: a.entity })} rovnom\u011Brn\u011B na ${formatEntity({ entity: b.entity })}`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
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
    agentMinuend: singleAgent(a.agent),
    agentSubtrahend: singleAgent(b.agent),
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }),
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
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
    ] : []
  };
}
function toSlideRule(a, b, last) {
  if (a.entity !== b.entity) {
    throw `Mismatch entity ${a.entity}, ${b.entity}`;
  }
  if (a.unit !== b.unit) {
    throw `Mismatch unit ${a.unit}, ${b.unit}`;
  }
  return {
    kind: "cont",
    agent: normalizeToAgent(last.agent ?? a.agent),
    quantity: last.kind === "slide-invert" ? isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }) : isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity + b.quantity : wrapToQuantity(`a.quantity + b.quantity`, { a, b }),
    entity: a.entity,
    unit: a.unit
  };
}
function infetToSlideRule(a, b, last) {
  const result = toSlideRule(a, b, last);
  return {
    name: toSlideRule.name,
    inputParameters: extractKinds(a, b, last),
    question: `${containerQuestion(result)}`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
      { tex: `${formatNumber(a.quantity)} ${last.kind === "slide-invert" ? "-" : "+"} ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
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
    agent: [diff.differenceAgent],
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity - b.quantity : wrapToQuantity(`a.quantity - b.quantity`, { a, b }),
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
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
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
    ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? a.ratio - b.ratio : wrapToRatio(`a.ratio - b.ratio`, { a, b }),
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
    options: isNumber2(a.ratio) && isNumber2(b.ratio) && isNumber2(result.ratio) ? [
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
    ratio: isNumber2(a.ratio) && isNumber2(b.ratio) ? a.ratio * b.ratio : wrapToRatio(`a.ratio * b.ratio`, { a, b })
  };
}
function inferTransitiveRatioRule(a, b) {
  const result = transitiveRatioRule(a, b);
  return {
    name: transitiveRatioRule.name,
    inputParameters: extractKinds(a, b),
    question: `${computeQuestion(result.ratio)} ${result.part} z ${result.whole}`,
    result,
    options: isNumber2(a.ratio) && isNumber2(b.ratio) && isNumber2(result.ratio) ? [
      { tex: `${formatRatio(a.ratio)} * ${formatRatio(b.ratio)}`, result: formatRatio(result.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} / ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio / a.ratio), ok: false }
    ] : []
  };
}
function toRateRule(a, b, rate) {
  if (!equalAgent(a.agent, b.agent)) {
    throw `Mismatch angent ${a.agent}, ${b.agent}`;
  }
  const baseQuantity = rate?.baseQuantity ?? 1;
  return {
    kind: "rate",
    agent: rate.agent ?? a.agent,
    quantity: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(baseQuantity) ? baseQuantity === 1 ? a.quantity / b.quantity * baseQuantity : a.quantity / b.quantity * baseQuantity : isNumber2(baseQuantity) && baseQuantity === 1 ? wrapToQuantity(`a.quantity / b.quantity`, { a, b }) : wrapToQuantity(`a.quantity / b.quantity * rate.baseQuantity`, { a, b, rate }),
    entity: {
      entity: a.entity,
      unit: a.unit
    },
    entityBase: {
      entity: b.kind === "cont" ? b.entity : b.agentQuota,
      unit: b.kind === "cont" ? b.unit : EmptyUnit2
    },
    baseQuantity: rate?.baseQuantity ?? 1
  };
}
function inferToRateRule(a, b, rate) {
  const result = toRateRule(a, b, rate);
  if (isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.baseQuantity) && isNumber2(result.quantity)) {
    return {
      name: toRateRule.name,
      inputParameters: extractKinds(a, b, rate),
      question: `Rozd\u011Bl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity })} rovnom\u011Brn\u011B ${formatNumber(b.quantity)} kr\xE1t${result.baseQuantity !== 1 ? ` po ${formatNumber(result.baseQuantity)} ${formatEntity({ entity: b.kind === "cont" ? b.entity : b.agentQuota })}` : ""}`,
      result,
      options: [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: rate.baseQuantity === 1 },
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)} * ${formatNumber(result.baseQuantity)}`, result: formatNumber(result.quantity), ok: rate.baseQuantity !== 1 },
        { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity / a.quantity), ok: false }
      ]
    };
  } else {
    return resultAsQuestion(result, { name: toRateRule.name, inputParameters: extractKinds(a, b, rate) });
  }
}
function solveEquationRule(a, b, last) {
  return {
    kind: "cont",
    agent: [last.agent],
    quantity: helpers2.solveLinearEquation(a.quantity, b.quantity, last.variable),
    ...last.entity
  };
}
function inferSolveEquationRule(a, b, last) {
  const result = solveEquationRule(a, b, last);
  return {
    name: solveEquationRule.name,
    inputParameters: extractKinds(a, b, last),
    question: `Vy\u0159e\u0161 line\xE1rn\xED rovnici ${a.agent} = ${b.agent} pro nezn\xE1mou ${last.variable}.`,
    result,
    options: []
  };
}
function toQuotaRule(a, quota) {
  return {
    kind: "quota",
    agentQuota: singleAgent(quota.agent),
    agent: singleAgent(a.agent),
    quantity: isNumber2(a.quantity) && isNumber2(quota.quantity) ? Math.floor(a.quantity / quota.quantity) : wrapToQuantity(`floor(a.quantity / quota.quantity)`, { a, quota }),
    restQuantity: isNumber2(a.quantity) && isNumber2(quota.quantity) ? a.quantity % quota.quantity : wrapToQuantity(`a.quantity % quota.quantity`, { a, quota })
  };
}
function inferToQuotaRule(a, quota) {
  const result = toQuotaRule(a, quota);
  if (isNumber2(a.quantity) && isNumber2(quota.quantity) && isNumber2(result.quantity)) {
    return {
      name: toQuotaRule.name,
      inputParameters: extractKinds(a, quota),
      question: `Rozd\u011Bl ${formatNumber(a.quantity)} ${formatEntity({ entity: a.entity, unit: a.unit })} postupn\u011B na skupiny velikosti ${formatNumber(quota.quantity)} ${formatEntity({ entity: quota.entity, unit: quota.unit })}`,
      result,
      options: [
        { tex: `${formatNumber(a.quantity)} / ${formatNumber(quota.quantity)}`, result: formatNumber(result.quantity), ok: true },
        { tex: `${formatNumber(quota.quantity)} / ${formatNumber(a.quantity)}`, result: formatNumber(result.quantity), ok: false }
      ]
    };
  } else {
    return resultAsQuestion(result, { name: toQuotaRule.name, inputParameters: extractKinds(a, quota) });
  }
}
function toRatiosRule(parts, last) {
  const ratios = parts.map((d) => d.quantity);
  const agents = parts.map((d) => d.agent);
  return {
    kind: "ratios",
    parts: agents.map((d, i) => complementSingleAgent(d, agents)),
    ratios: last.useBase ? ratiosToBaseForm(ratios) : ratios,
    whole: last.whole
  };
}
function inferToRatiosRule(parts, last) {
  const result = toRatiosRule(parts, last);
  return {
    name: toRatiosRule.name,
    inputParameters: extractKinds(...parts, last),
    question: `Vyj\xE1d\u0159i pom\u011Brem mezi ${result.parts.join(":")}?`,
    result,
    options: areNumbers(result.ratios) ? [] : []
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
      quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity * b.quantity : wrapToQuantity(`a.quantity * b.quantity`, { a, b }),
      entity: b.entity,
      entityBase: a.entityBase,
      baseQuantity: a.baseQuantity
    };
  } else if (isSameEntity(b.entity, a.entityBase)) {
    return {
      kind: "rate",
      agent: newAgent,
      quantity: isNumber2(a.quantity) && isNumber2(b.quantity) ? a.quantity * b.quantity : wrapToQuantity(`a.quantity * b.quantity`, { a, b }),
      entity: b.entity,
      entityBase: a.entityBase,
      baseQuantity: a.baseQuantity
    };
  } else {
    throw `transitive rate uncompatible entities ${formatEntity(a.entity)} per ${formatEntity(a.entityBase)} to  ${formatEntity(b.entity)} per ${formatEntity(b.entityBase)}`;
  }
}
function inferTrasitiveRateRule(a, b, last) {
  const result = transitiveRateRule(a, b, last.agent);
  return {
    name: transitiveRateRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypo\u010Dti ${last.agent} ${formatEntity(result.entity)} per ${formatEntity(result.entityBase)}?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(b.quantity) && isNumber2(result.quantity) ? [
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
    substitutedExpr: helpers2.substituteContext(b.expression, context).toString(),
    quantity: areNumbers(quantities) ? helpers2.evalExpression(b.expression, context) : wrapToQuantity(`${b.expression}`, variables.reduce((out, d, i) => {
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
    inputParameters: extractKinds(...a, b),
    question: `Vypo\u010Dti v\xFDraz ${b.expression}?`,
    result,
    options: isNumber2(result.quantity) ? [
      { tex: replaceSqrt(result.substitutedExpr), result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function simplifyExprRuleAsRatio(a, b) {
  if (isNumber2(a.ratio)) {
    throw `simplifyExpr does not support quantity types`;
  }
  return {
    ...a,
    ratio: helpers2.evalExpression(a.ratio, b.context)
  };
}
function simplifyExprRuleAsQuantity(a, b) {
  if (isNumber2(a.quantity)) {
    throw `simplifyExpr does not support quantity types`;
  }
  return {
    ...a,
    quantity: helpers2.evalExpression(a.quantity, b.context)
  };
}
function inferSimplifyExprRule(a, b) {
  const result = isQuantityPredicate2(a) ? simplifyExprRuleAsQuantity(a, b) : simplifyExprRuleAsRatio(a, b);
  return {
    name: "simplifyExprRule",
    inputParameters: extractKinds(a, b),
    question: `Zjednodu\u0161 v\xFDraz dosazen\xEDm ${JSON.stringify(b.context)} ?`,
    result,
    options: []
  };
}
function evalQuotaRemainderExprRule(a, b) {
  if (!isNumber2(a.restQuantity)) {
    throw `evalQuotaRemainderExprRule does not support quantity types`;
  }
  const matched = helpers2.evalExpression(b.expression, a.restQuantity);
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
    name: evalQuotaRemainderExprRule.name,
    inputParameters: extractKinds(a, b),
    question: b.optionValue != null ? `Vyhodno\u0165 volbu [${b.optionValue}]?` : `Vyhodno\u0165 pravdivost ${b.expressionNice}?`,
    result,
    options: []
  };
}
function evalToOptionRule(a, b) {
  let valueToEval = a.quantity ?? a.ratio;
  if (isExpressionNode(valueToEval)) {
    valueToEval = helpers2.evalNodeToNumber(valueToEval);
  }
  if (!isNumber2(valueToEval) || isNaN(valueToEval)) {
    throw `evalToOptionRule does not support non quantity types. ${JSON.stringify(a)}`;
  }
  if (a.kind == "comp-ratio" && (b.expectedValueOptions.asRelative || valueToEval > 1 / 2 && valueToEval < 2)) {
    valueToEval = valueToEval > 1 ? valueToEval - 1 : 1 - valueToEval;
  }
  const matched = helpers2.evalExpression(b.expression, valueToEval);
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
function partToPartRule(a, partToPartRatio, nth) {
  if (!(partToPartRatio.whole != null && matchAgent(partToPartRatio.whole, a) || partToPartRatio.parts.some((d) => matchAgent(d, a)))) {
    throw `Mismatch agent ${[a.agent, a.entity].join()} any of ${[partToPartRatio.whole].concat(partToPartRatio.parts).join()} (partToPartRule)`;
  }
  const sourcePartIndex = partToPartRatio.parts.findIndex((d) => matchAgent(d, a));
  const targetPartIndex = nth != null ? partToPartRatio.parts.findIndex((d) => d === nth.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;
  const matchedWhole = matchAgent(partToPartRatio.whole, a);
  return {
    ...a,
    agent: (matchedWhole || nth != null) && targetPartIndex != -1 ? [partToPartRatio.parts[targetPartIndex]] : [partToPartRatio.whole],
    quantity: matchedWhole ? areNumbers(partToPartRatio.ratios) && isNumber2(a.quantity) ? a.quantity / partToPartRatio.ratios.reduce((out, d) => out += d, 0) * partToPartRatio.ratios[targetPartIndex] : wrapToQuantity(`a.quantity / (${partToPartRatio.ratios.map((d, i) => `b.ratios[${i}]`).join(" + ")}) * b.ratios[${targetPartIndex}]`, { a, b: partToPartRatio }) : areNumbers(partToPartRatio.ratios) && isNumber2(a.quantity) ? a.quantity / partToPartRatio.ratios[sourcePartIndex] * (nth != null ? partToPartRatio.ratios[targetPartIndex] : partToPartRatio.ratios.reduce((out, d) => out += d, 0)) : nth != null ? wrapToQuantity(`a.quantity / b.ratios[${sourcePartIndex}] * b.ratios[${targetPartIndex}]`, { a, b: partToPartRatio }) : wrapToQuantity(`a.quantity / b.ratios[${sourcePartIndex}] * (${partToPartRatio.ratios.map((d, i) => `b.ratios[${i}]`).join(" + ")})`, { a, b: partToPartRatio })
  };
}
function inferPartToPartRule(a, partToPartRatio, nth) {
  const result = partToPartRule(a, partToPartRatio, nth);
  const matchedWhole = matchAgent(partToPartRatio.whole, a);
  let sourcePartIndex = partToPartRatio.parts.findIndex((d) => matchAgent(d, a));
  const targetPartIndex = nth != null ? partToPartRatio.parts.findIndex((d) => d === nth.agent) : matchAgent(partToPartRatio[0], a) ? 0 : partToPartRatio.parts.length - 1;
  if (sourcePartIndex == -1)
    sourcePartIndex = 0;
  const partsSum = `(${partToPartRatio.ratios.join(" + ")})`;
  return {
    name: partToPartRule.name,
    inputParameters: extractKinds(a, partToPartRatio, nth),
    question: result.kind === "rate" ? `${computeQuestion(result.quantity)} ${result.agent}` : containerQuestion(result),
    result,
    options: areNumbers(partToPartRatio.ratios) && isNumber2(a.quantity) && isNumber2(result.quantity) ? [
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
function balancedPartitionRule(a, balanced, nth) {
  if (!isNumber2(a.quantity)) {
    throw "balancedPartitionRule is not supported by non quantity types";
  }
  const index = nth?.agent != null ? balanced.parts.findIndex((d) => d === nth.agent) : balanced.parts.length - 1;
  if (index === -1) {
    throw `No part found ${nth?.agent ?? balanced.parts.length} - ${balanced.parts.join(",")}`;
  }
  const agent = balanced.parts[index];
  return {
    kind: "cont",
    agent: normalizeToAgent(balanced.entity != null ? a.agent : agent),
    entity: balanced.entity != null ? balanced.entity.entity : a.entity,
    unit: balanced.entity != null ? balanced.entity.unit : a.unit,
    quantity: computeBalancedPartition(a.quantity, balanced.parts.length, index)
  };
}
function inferBalancedPartitionRule(a, balanced, nth) {
  if (!isNumber2(a.quantity)) {
    throw "balancedPartitionRule is not supported by non quantity types";
  }
  const result = balancedPartitionRule(a, balanced, nth);
  return {
    name: balancedPartitionRule.name,
    inputParameters: extractKinds(a, balanced, nth),
    question: containerQuestion(result),
    result,
    options: isNumber2(a.quantity) && isNumber2(result.quantity) ? [] : []
  };
}
function inferToScaleRule(target, factor, last) {
  const inverse = last.kind === "scale-invert";
  const quantity = isNumber2(target.quantity) && isNumber2(factor.quantity) ? inverse ? target.quantity * 1 / factor.quantity : target.quantity * factor.quantity : inverse ? wrapToQuantity("target.quantity * 1 / factor.quantity", { target, factor }) : wrapToQuantity("target.quantity * factor.quantity", { target, factor });
  const result = {
    ...target,
    agent: normalizeToAgent(last.agent ?? target.agent),
    quantity
  };
  const moreOrLess = (quantity2) => inverse ? quantity2 <= 1 : quantity2 > 1;
  return {
    name: "scaleRule",
    inputParameters: extractKinds(target, factor, last),
    question: isNumber2(factor.quantity) ? `${moreOrLess(factor.quantity) ? "Zv\u011Bt\u0161i" : "Zmen\u0161i"} ${factor.quantity} kr\xE1t ${target.agent}.` : `${computeQuestion(result.quantity)}`,
    result,
    options: isNumber2(target.quantity) && isNumber2(factor.quantity) && isNumber2(result.quantity) ? [
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
  if (!areNumbers(multi.ratios) || !isNumber2(factor.quantity)) {
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
function nthPartFactorByRule(multi, factor, nthPart) {
  if (!areNumbers(multi.ratios) || !isNumber2(factor)) {
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
function inferNthPartFactorByRule(multi, factor, nthPart) {
  if (!areNumbers(multi.ratios) || !isNumber2(factor.quantity)) {
    throw "ratios are not supported by non quantity types";
  }
  const result = nthPartFactorByRule(multi, factor.quantity, nthPart);
  return {
    name: nthPartFactorByRule.name,
    inputParameters: extractKinds(multi, factor, nthPart),
    question: `Roz\u0161\xED\u0159it pom\u011Br o ${nthPart.agent} ${formatNumber(factor.quantity)} kr\xE1t ${formatEntity(factor.kind === "rate" ? factor.entity : factor)}`,
    result,
    options: []
  };
}
function nthPartScaleByRule(multi, factor, nthPart) {
  if (!areNumbers(multi.ratios) || !isNumber2(factor)) {
    throw "ratios are not supported by non quantity types";
  }
  if (factor < 1) {
    throw `Ratios can be only extended by positive quantity ${factor}.`;
  }
  const partIndex = multi.parts.indexOf(nthPart.agent);
  const multiplePartByFactor = (arr) => arr.map((d, i) => i === partIndex ? d * factor : d);
  return {
    kind: "ratios",
    whole: multi.whole,
    parts: multi.parts,
    ratios: multiplePartByFactor(multi.ratios)
  };
}
function inferNthPartScaleByRule(multi, factor, nthPart) {
  if (!areNumbers(multi.ratios) || !isNumber2(factor.quantity)) {
    throw "ratios are not supported by non quantity types";
  }
  const result = nthPartScaleByRule(multi, factor.quantity, nthPart);
  return {
    name: nthPartScaleByRule.name,
    inputParameters: extractKinds(multi, factor, nthPart),
    question: `Roz\u0161\xED\u0159it pom\u011Br o ${nthPart.agent} ${formatNumber(factor.quantity)} kr\xE1t ${formatEntity(factor.kind === "rate" ? factor.entity : factor)}`,
    result,
    options: []
  };
}
function matchAgent(d, a) {
  return Array.isArray(a.agent) ? a.agent.includes(d) : d == a.agent;
}
function partEqualRule(a, b) {
  if (!isNumber2(a.quantity)) {
    throw "partEqual are not supported by non quantity types";
  }
  const diff = compDiff(singleAgent(b.agent), a.quantity > 0 ? a.agentB : a.agentA, abs(a.quantity), a.entity);
  const rest = compareDiffRule(b, diff);
  if (!isNumber2(rest.quantity)) {
    throw "partEqual are not supported by non quantity types";
  }
  return {
    ...rest,
    quantity: rest.quantity / 2
  };
}
function inferPartEqualRule(a, b) {
  if (!isNumber2(a.quantity)) {
    throw "partEqual are not supported by non quantity types";
  }
  const diff = compDiff(singleAgent(b.agent), a.quantity > 0 ? a.agentB : a.agentA, abs(a.quantity), a.entity);
  const result = partEqualRule(a, b);
  return {
    name: partEqualRule.name,
    inputParameters: extractKinds(a, b),
    question: containerQuestion(result),
    result,
    options: isNumber2(b.quantity) && isNumber2(a.quantity) && isNumber2(diff.quantity) ? [
      { tex: `(${formatNumber(b.quantity)} - ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity - diff.quantity) / 2), ok: equalAgent(b.agent, diff.agentMinuend) },
      { tex: `(${formatNumber(b.quantity)} + ${formatNumber(diff.quantity)}) / 2`, result: formatNumber((b.quantity + diff.quantity) / 2), ok: !equalAgent(b.agent, diff.agentMinuend) }
    ] : []
  };
}
function nthTermRule(a, b) {
  if (!isNumber2(a.quantity)) {
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
function nthTermExpressionRule(a, b) {
  if (!isNumber2(a.quantity)) {
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
  const result = b.kind === "pattern" ? nthTermExpressionRule(a, b) : nthTermRule(a, b);
  return {
    name: nthTermRule.name,
    inputParameters: extractKinds(a, b),
    question: `Vypo\u010Dti ${result.entity}?`,
    result,
    options: isNumber2(a.quantity) && isNumber2(result.quantity) && b.kind === "pattern" ? [
      { tex: b.nthTermDescription ?? b.nthTerm, result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function nthPositionRule(a, b, newEntity = "nth") {
  if (!isNumber2(a.quantity)) {
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
  if (!isNumber2(a.quantity)) {
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
    options: isNumber2(result.quantity) && b.kind === "pattern" ? [
      { tex: b.nthPosition, result: formatNumber(result.quantity), ok: true }
    ] : []
  };
}
function inferenceRuleWithQuestion(children) {
  if (children.length < 1) {
    throw "inferenceRuleWithQuestion requires at least one child";
  }
  const last = children[children.length - 1];
  const predicates = children.slice(0, -1);
  const result = predicates.length > 1 ? inferenceRuleEx(...predicates) : null;
  return result == null ? {
    name: predicates.find((d) => d.kind == "common-sense") != null ? "commonSense" : "unknownRule",
    inputParameters: predicates.map((d) => d.kind),
    question: last.kind === "cont" ? containerQuestion(last) : last.kind === "comp" ? `${computeQuestion(last.quantity)} porovn\xE1n\xED ${last.agentA} a ${last.agentB}` : last.kind === "ratio" ? `Vyj\xE1d\u0159i jako pom\u011Br ${last.part} k ${last.whole}` : "Co lze vyvodit na z\xE1klad\u011B zadan\xFDch p\u0159edpoklad\u016F?",
    result: last,
    options: []
  } : result;
}
function inferenceRuleEx(...args) {
  const [a, b, ...rest] = args;
  const last = rest?.length > 0 ? rest[rest.length - 1] : null;
  const kind = last?.kind;
  if (last == null && a.kind == "eval-expr") {
    return inferEvalToQuantityRule([], a);
  }
  if (["sum-combine", "sum", "product-combine", "product", "gcd", "lcd", "sequence", "tuple", "eval-expr", "eval-formula", "alligation"].includes(last?.kind)) {
    const arr = [a, b].concat(rest.slice(0, -1));
    if (last.kind === "sequence")
      return inferToSequenceRule(arr);
    if (last.kind === "gcd")
      return inferGcdRule(arr, last);
    if (last.kind === "lcd")
      return inferLcdRule(arr, last);
    if (last.kind === "eval-expr" || last.kind === "eval-formula")
      return inferEvalToQuantityRule(arr, last);
    if (last.kind === "tuple")
      return tupleRule(arr, last);
    if (["product-combine", "product"].includes(last.kind))
      return inferProductRule(arr, last);
    if (["sum-combine", "sum"].includes(last.kind))
      return inferSumRule(arr, last);
    if (last.kind === "alligation")
      return inferAlligationRule(arr, last);
    return null;
  } else if (last?.kind === "ratios" && args.length > 3) {
    const arr = [a, b].concat(rest.slice(0, -1));
    if (arr.every((d) => d.kind === "comp-ratio"))
      return inferConvertRatioCompareToRatiosRule(arr, last);
    if (arr.every((d) => d.kind === "cont"))
      return inferToRatiosRule(arr, last);
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
      return inferToScaleRule(a, b, last);
    if (kind === "slide" || kind === "slide-invert")
      return infetToSlideRule(a, b, last);
    if (kind === "diff")
      return inferToDifferenceRule(a, b, last);
    if (kind === "quota")
      return inferToQuotaRule(a, b);
    if (kind === "delta")
      return inferToDeltaRule(a, b, last);
    if (kind === "pythagoras")
      return inferPythagorasRule(a, b, last);
    if (kind === "triangle-angle")
      return inferTriangleAngleRule(a, b, last);
    if (kind === "rate")
      return inferToRateRule(a, b, last);
    if (kind === "ratios")
      return inferToRatiosRule([a, b], last);
    if (kind === "comp-ratio")
      return inferToRatioCompareRule(a, b, last);
    if (kind === "ratio")
      return inferToPartWholeRatio(a, b, last);
    if (kind === "linear-equation")
      return inferSolveEquationRule(a, b, last);
    return inferToCompareRule(a, b);
  } else if (a.kind === "comp-ratio" && b.kind === "comp-ratio" && kind === "ratios") {
    return inferConvertRatioCompareToRatiosRule([a, b], last);
  } else if ((a.kind === "comp-ratio" || a.kind === "cont") && b.kind === "simplify-expr") {
    return inferSimplifyExprRule(a, b);
  } else if (a.kind === "simplify-expr" && (b.kind === "comp-ratio" || b.kind === "cont")) {
    return inferSimplifyExprRule(b, a);
  } else if (a.kind === "cont" && (b.kind === "eval-expr" || b.kind === "eval-formula")) {
    return inferEvalToQuantityRule([a], b);
  } else if ((a.kind === "eval-expr" || a.kind === "eval-formula") && b.kind === "cont") {
    return inferEvalToQuantityRule([b], a);
  } else if (a.kind === "rate" && b.kind === "rate") {
    if (last?.kind === "ratios") {
      return inferToRatiosRule([a, b], last);
    }
    if (last?.kind === "linear-equation") {
      return inferSolveEquationRule(a, b, last);
    }
    if (last?.kind === "rate") {
      return inferTrasitiveRateRule(a, b, last);
    }
    if (last?.kind === "comp-ratio") {
      return inferToRatioCompareRule(a, b, last);
    }
    return inferRateRule(a, b);
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
    return kind === "diff" ? inferToDifferenceAsRatioRule(a, b, last) : kind === "comp-ratio" ? inferToPartWholeCompareRule(a, b) : inferTransitiveRatioRule(a, b);
  } else if (a.kind === "comp" && b.kind === "cont") {
    return kind === "comp-part-eq" ? inferPartEqualRule(a, b) : inferCompareRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp") {
    return kind === "comp-part-eq" ? inferPartEqualRule(b, a) : inferCompareRule(a, b);
  } else if ((a.kind === "cont" || a.kind === "quota" || a.kind === "rate") && b.kind == "rate") {
    return inferRateRule(a, b);
  } else if (a.kind === "rate" && (b.kind == "cont" || b.kind === "quota" || b.kind === "rate")) {
    return inferRateRule(b, a);
  } else if (a.kind === "comp" && b.kind == "comp-ratio") {
    return kind === "comp" ? inferTransitiveCompareRule(a, b) : inferRatioCompareToCompareRule(b, a, kind === "nth-part" && last);
  } else if (a.kind === "comp-ratio" && b.kind == "comp") {
    return kind === "comp" ? inferTransitiveCompareRule(b, a) : inferRatioCompareToCompareRule(a, b, kind === "nth-part" && last);
  } else if (a.kind === "comp" && b.kind == "ratios") {
    return inferCompRatiosToCompRule(b, a, kind === "nth-part" && last);
  } else if (a.kind === "ratios" && b.kind == "comp") {
    return inferCompRatiosToCompRule(a, b, kind === "nth-part" && last);
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
    return kind === "rate" ? inferToRateRule(a, b, last) : inferQuotaRule(a, b);
  } else if (a.kind === "quota" && b.kind == "cont") {
    return kind === "rate" ? inferToRateRule(b, a, last) : inferQuotaRule(b, a);
  } else if (a.kind === "comp-ratio" && (b.kind === "cont" || b.kind === "rate")) {
    return inferRatioCompareRule(b, a, kind === "nth-part" && last);
  } else if ((a.kind === "cont" || a.kind === "rate") && b.kind === "comp-ratio") {
    return inferRatioCompareRule(a, b, kind === "nth-part" && last);
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
    return a.ratio == null ? inferConvertTwoPartRatioToRatioCompareRule(b, a) : inferConvertRatioCompareToTwoPartRatioRule(a, b, kind === "ratios-base" && last);
  } else if (a.kind === "ratios" && b.kind === "comp-ratio") {
    return b.ratio == null ? inferConvertTwoPartRatioToRatioCompareRule(a, b) : inferConvertRatioCompareToTwoPartRatioRule(b, a, kind === "ratios-base" && last);
  } else if (a.kind === "comp-ratio" && b.kind === "invert-comp-ratio") {
    return inferInvertRatioCompareRule(a);
  } else if (a.kind === "invert-comp-ratio" && b.kind === "comp-ratio") {
    return inferInvertRatioCompareRule(b);
  } else if (a.kind === "comp-ratio" && b.kind === "comp-ratio") {
    return kind === "diff" ? inferToDifferenceAsRatioRule(a, b, last) : inferTransitiveRatioCompareRule(a, b);
  } else if (a.kind === "cont" && b.kind === "ratio") {
    return inferPartToWholeRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "cont") {
    return inferPartToWholeRule(b, a);
  } else if (a.kind === "complement" && b.kind === "ratio") {
    return inferPartWholeComplementRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "complement") {
    return inferPartWholeComplementRule(b, a);
  } else if (a.kind === "nth-part" && b.kind === "ratios") {
    return kind === "ratio" ? inferConvertPartToPartToPartWholeRule(a, b, last) : null;
  } else if (a.kind === "ratios" && b.kind === "nth-part") {
    return kind === "ratio" ? inferConvertPartToPartToPartWholeRule(b, a, last) : null;
  } else if (a.kind === "rate" && b.kind == "ratios") {
    if (kind === "nth-factor") {
      return inferNthPartFactorByRule(b, a, last);
    } else if (kind === "nth-scale") {
      return inferNthPartScaleByRule(b, a, last);
    } else {
      return inferPartToPartRule(a, b, kind === "nth-part" && last);
    }
  } else if (a.kind === "ratios" && b.kind == "rate") {
    if (kind === "nth-factor") {
      return inferNthPartFactorByRule(a, b, last);
    } else if (kind === "nth-scale") {
      return inferNthPartScaleByRule(a, b, last);
    } else {
      return inferPartToPartRule(b, a, kind === "nth-part" && last);
    }
  } else if (a.kind === "cont" && b.kind == "balanced-partition") {
    return inferBalancedPartitionRule(a, b, kind === "nth-part" && last);
  } else if (a.kind === "balanced-partition" && b.kind == "cont") {
    return inferBalancedPartitionRule(b, a, kind === "nth-part" && last);
  } else if (a.kind === "cont" && b.kind == "ratios") {
    return kind === "scale" ? inferMapRatiosByFactorRule(b, a) : kind === "scale-invert" ? inferMapRatiosByFactorRule(b, a, true) : kind === "nth-factor" ? inferNthPartFactorByRule(b, a, last) : kind === "nth-part" ? inferPartToPartRule(a, b, last) : inferPartToPartRule(a, b);
  } else if (a.kind === "ratios" && b.kind == "cont") {
    return kind === "scale" ? inferMapRatiosByFactorRule(a, b) : kind === "scale-invert" ? inferMapRatiosByFactorRule(a, b, true) : kind === "nth-factor" ? inferNthPartFactorByRule(a, b, last) : kind === "nth-part" ? inferPartToPartRule(b, a, last) : inferPartToPartRule(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-diff") {
    return inferCompareDiffRule(a, b);
  } else if (a.kind === "comp-diff" && b.kind === "cont") {
    return inferCompareDiffRule(b, a);
  } else if (a.kind === "sequence" && b.kind === "cont") {
    return kind === "nth" ? inferNthPositionRule(b, a, last.entity) : inferNthTermRule(b, a);
  } else if (a.kind === "cont" && b.kind === "sequence") {
    return kind === "nth" ? inferNthPositionRule(a, b, last.entity) : inferNthTermRule(a, b);
  } else if (a.kind === "pattern" && b.kind === "cont") {
    return kind === "nth" ? inferNthPositionRule(b, a, last.entity) : inferNthTermRule(b, a);
  } else if (a.kind === "cont" && b.kind === "pattern") {
    return kind === "nth" ? inferNthPositionRule(a, b, last.entity) : inferNthTermRule(a, b);
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
    return inferCompareToRateRule(b, a, kind === "rate" && last);
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
function nthQuadraticElements2(firstElement, secondElement, secondDifference) {
  const A = secondDifference / 2;
  const B = secondElement - firstElement - 3 * A;
  const C = firstElement - (A + B);
  return { A, B, C };
}
function nthQuadraticElementFromDifference(firstElement, secondElement, secondDifference, n) {
  const { A, B, C } = nthQuadraticElements2(firstElement, secondElement, secondDifference);
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
  const intersection2 = (arr1, arr2) => {
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
  return primeFactors.reduce((acc, curr) => intersection2(acc, curr), primeFactors[0] || []);
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
    for (const [num, count2] of countMap.entries()) {
      for (let i = 0; i < count2; i++) {
        result.push(num);
      }
    }
    return result;
  };
  return primeFactors.reduce((acc, curr) => union(acc, curr), []);
}
function ratiosToBaseForm(ratios) {
  let precision = 1e6;
  let nums = ratios.map((r) => Math.round(r * precision));
  function gcd3(a, b) {
    return b === 0 ? a : gcd3(b, a % b);
  }
  let overallGCD = nums.reduce((a, b) => gcd3(a, b));
  return nums.map((v) => v / overallGCD);
}
function computeOtherAngle(a, relationship) {
  const quantity = a.quantity;
  switch (relationship) {
    case "complementary":
      return isNumber2(quantity) ? 90 - quantity : wrapToQuantity(`90 - a.quantity`, { a });
    case "supplementary":
    case "sameSide":
      return isNumber2(quantity) ? 180 - quantity : wrapToQuantity(`180 - a.quantity`, { a });
    case "opposite":
    case "corresponding":
    case "alternate":
    case "alternate-interior":
    case "alternate-exterior":
    case "axially-symmetric":
    case "isosceles-triangle-at-the-base":
    case "equilateral-triangle":
    case "opposite-in-parallelogram":
      return isNumber2(quantity) ? quantity : wrapToQuantity(`a.quantity`, { a });
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
    case "axially-symmetric":
      return "osov\u011B soum\u011Brn\xFD";
    case "isosceles-triangle-at-the-base":
      return "shodnost \xFAhl\u016F p\u0159i z\xE1kadn\u011B rovnoramenn\xE9ho troj\xFAheln\xEDku";
    case "equilateral-triangle":
      return "shodnost v\u0161ech \xFAhl\u016F v rovnostrann\xE9m troj\xFAheln\xEDku";
    case "opposite-in-parallelogram":
      return "shodnost prot\u011Bj\u0161\xEDch \xFAhl\u016F v rovnob\u011B\u017En\xEDku";
    default:
      throw "Nezn\xE1m\xFD vztah";
  }
}
function sequenceOptions(seqType) {
  return [
    { tex: "stejn\xFD rozd\xEDl", result: `${seqType.kind === "arithmetic" ? formatNumber(seqType.commonDifference) : "chybn\u011B"}`, ok: seqType.kind === "arithmetic" },
    { tex: "stejn\xFD druh\xFD rozd\xEDl", result: `${seqType.kind === "quadratic" ? formatNumber(seqType.secondDifference) : "chybn\u011B"}`, ok: seqType.kind === "quadratic" },
    { tex: "stejn\xFD pom\u011Br", result: `${seqType.kind === "geometric" ? formatNumber(seqType.commonRatio) : "chybn\u011B"}`, ok: seqType.kind === "geometric" }
  ];
}
function normalizeToAgent(agent) {
  return Array.isArray(agent) ? agent : [agent];
}
function joinAgent(a) {
  return Array.isArray(a) ? a.join() : a;
}
function singleAgent(a) {
  if (Array.isArray(a)) {
    if (a.length > 1) {
      throw `Multiple agents found ${a.join()}.`;
    }
    return a[0];
  } else {
    a;
  }
}
function complementAgent(a, b) {
  const setB = new Set(b);
  return a.filter((x) => !setB.has(x));
}
function intersection(...arrays) {
  if (arrays.length === 0)
    return [];
  arrays.sort((a, b) => a.length - b.length);
  return arrays[0].filter(
    (item) => arrays.slice(1).every((arr) => arr.includes(item))
  );
}
function complementSingleAgent(a, arr) {
  if (a.length === 1)
    return a[0];
  const complements = complementAgent(a, arr.length > 1 ? intersection(...arr) : arr[0]);
  return singleAgent(complements);
}
function equalAgent(f, s) {
  const a = normalizeToAgent(f);
  const b = normalizeToAgent(s);
  return a.some((d) => b.includes(d));
}
function mergeAgents(f, s) {
  return [.../* @__PURE__ */ new Set([...f, ...s])];
}
function mergeAgent(agent, newAgent, arr) {
  const i = arr.indexOf(agent);
  return i !== -1 ? arr.toSpliced(i, 1, newAgent) : newAgent;
}
function isEntityBase(value) {
  return value.entity != null;
}
function toEntity(entity) {
  return isEntityBase(entity) ? entity : { entity };
}
function isSameEntity(eF, eS) {
  const f = isEntityBase(eF) ? eF : toEntity(eF);
  const s = isEntityBase(eS) ? eS : toEntity(eS);
  return f.entity == s.entity && f.unit == s.unit;
}
function extractKinds(...args) {
  return args.filter((d) => d != null && d.kind != null).map((d) => d.kind);
}
function isNumber2(quantity) {
  return typeof quantity === "number";
}
function isExpressionNode(quantity) {
  return quantity?.expression != null;
}
function areNumbers(ratios) {
  return ratios.every((d) => isNumber2(d));
}
function areTupleNumbers(ratios) {
  return ratios.every((d) => d.every((d2) => isNumber2(d2)));
}
function wrapToQuantity(expression, context) {
  return { expression, context: convertContext(context) };
}
function wrapToRatio(expression, context) {
  return { expression, context: convertContext(context) };
}
function convertContext(context) {
  return Object.entries(context).reduce((out, [key, value]) => {
    out[key] = isRatioPredicate2(value) && isNumber2(value.ratio) ? {
      ...value,
      ratio: helpers2.convertToFraction(value.ratio)
    } : value;
    return out;
  }, {});
}
function formatNumber(d) {
  return d.toLocaleString("cs-CZ", { maximumFractionDigits: 6, minimumFractionDigits: 0 });
}
function formatRatio(d, asPercent) {
  if (asPercent)
    return `${formatNumber(d * 100)} %`;
  return helpers2.convertToFractionAsLatex(d);
}
function containerQuestion(d) {
  return `${computeQuestion(d.quantity)} ${d.agent}${formatEntity(d)}?`;
}
function computeQuestion(d) {
  return isNumber2(d) ? "Vypo\u010Dti" : "Vyj\xE1d\u0159i v\xFDrazem s prom\u011Bnnou";
}
function toGenerAgent(a) {
  return {
    kind: "cont",
    agent: [a.entity],
    quantity: a.quantity,
    entity: ""
  };
}
function formatEntity(d) {
  return d.entity || d.unit ? `(${[d.unit, d.entity].filter((d2) => d2 != null && d2 != "").join(" ")})` : "";
}
function resultAsQuestion(result, { name, inputParameters }) {
  return {
    name,
    inputParameters,
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
var unique = (value, index, array) => array.indexOf(value) === index;
var regexSqrt = /sqrt\s*(?:\(([^)]+)\)|([A-Za-z0-9+\-*/\s]+))/g;
function replaceSqrt(str) {
  return str.replace(regexSqrt, "\\sqrt{$1$2}");
}

// node_modules/fraction.js/dist/fraction.mjs
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
  const a = gcd2(n, d);
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
function Fraction2(a, b) {
  parse2(a, b);
  if (this instanceof Fraction2) {
    a = gcd2(P2["d"], P2["n"]);
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
    return newFraction2(gcd2(P2["n"], this["n"]) * gcd2(P2["d"], this["d"]), P2["d"] * this["d"]);
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
    return newFraction2(P2["n"] * this["n"], gcd2(P2["n"], this["n"]) * gcd2(P2["d"], this["d"]));
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
  "simplify": function(eps3) {
    const ieps = BigInt(1 / (eps3 || 1e-3) | 0);
    const thisABS = this["abs"]();
    const cont = thisABS["toContinued"]();
    for (let i = 1; i < cont.length; i++) {
      let s = newFraction2(cont[i - 1], C_ONE2);
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
  to(to) {
    var _a, _b;
    if (this.origin == null)
      throw new Error(".to must be called after .from");
    this.destination = this.getUnit(to);
    if (this.destination == null) {
      this.throwUnsupportedUnitError(to);
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
      const measure13 = this.measureData[origin.measure];
      const anchors = measure13.anchors;
      if (anchors == null) {
        throw new MeasureStructureError2(`Unable to convert units. Anchors are missing for "${origin.measure}" and "${destination.measure}" measures.`);
      }
      const anchor = anchors[origin.system];
      if (anchor == null) {
        throw new MeasureStructureError2(`Unable to find anchor for "${origin.measure}" to "${destination.measure}". Please make sure it is defined.`);
      }
      const transform = (_a = anchor[destination.system]) === null || _a === void 0 ? void 0 : _a.transform;
      const ratio = (_b = anchor[destination.system]) === null || _b === void 0 ? void 0 : _b.ratio;
      if (typeof transform === "function") {
        result = transform(result);
      } else if (typeof ratio === "number") {
        result *= ratio;
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
      for (const [name, measure13] of Object.entries(this.measureData)) {
        for (const [systemName, units] of Object.entries(measure13.systems)) {
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
      const measure13 = this.measureData[measureName];
      for (const [systemName, units] of Object.entries(measure13.systems)) {
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
    for (const measure13 of Object.values(this.measureData)) {
      for (const systems of Object.values(measure13.systems)) {
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
    for (const measure13 of list_measures) {
      const systems = this.measureData[measure13].systems;
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
  for (const [measureName, measure13] of Object.entries(measures)) {
    for (const [systemName, system] of Object.entries(measure13.systems)) {
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

// node_modules/convert-units/lib/esm/definitions/length.js
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
var measure7 = {
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
var length_default2 = measure7;

// node_modules/convert-units/lib/esm/definitions/area.js
var metric6 = {
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
var imperial6 = {
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
var measure8 = {
  systems: {
    metric: metric6,
    imperial: imperial6
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
var area_default2 = measure8;

// node_modules/convert-units/lib/esm/definitions/mass.js
var metric7 = {
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
var imperial7 = {
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
var measure9 = {
  systems: {
    metric: metric7,
    imperial: imperial7
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
var mass_default2 = measure9;

// node_modules/convert-units/lib/esm/definitions/volume.js
var metric8 = {
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
var imperial8 = {
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
var measure10 = {
  systems: {
    metric: metric8,
    imperial: imperial8
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
var volume_default2 = measure10;

// node_modules/convert-units/lib/esm/definitions/time.js
var daysInYear2 = 365.25;
var SI3 = {
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
var measure11 = {
  systems: {
    SI: SI3
  }
};
var time_default2 = measure11;

// node_modules/convert-units/lib/esm/definitions/angle.js
var SI4 = {
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
var measure12 = {
  systems: {
    SI: SI4
  }
};
var angle_default2 = measure12;

// src/utils/math-solver.js
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
function substitute3(tokens, variable, expr) {
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
      newexpression.push(new Instruction2(IEXPR2, substitute3(item.value, variable, expr)));
    } else {
      newexpression.push(item);
    }
  }
  return newexpression;
}
function evaluate3(tokens, expr, values) {
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
        nstack.push(n1 ? !!evaluate3(n2, expr, values) : false);
      } else if (item.value === "or") {
        nstack.push(n1 ? true : !!evaluate3(n2, expr, values));
      } else if (item.value === "=") {
        f = expr.binaryOps[item.value];
        nstack.push(f(n1, evaluate3(n2, expr, values), values));
      } else {
        f = expr.binaryOps[item.value];
        nstack.push(f(resolveExpression2(n1, values), resolveExpression2(n2, values)));
      }
    } else if (type === IOP32) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === "?") {
        nstack.push(evaluate3(n1 ? n2 : n3, expr, values));
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
          return evaluate3(n22, expr, scope);
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
      return evaluate3(token.value, expr, scope);
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
  return new Expression2(substitute3(this.tokens, variable, expr), this.parser);
};
Expression2.prototype.evaluate = function(values) {
  values = values || {};
  return evaluate3(this.tokens, this, values);
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
function trunc4(a) {
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
    trunc: Math.trunc || trunc4,
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
    roundTo: roundTo2,
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
parser2.consts.\u03C0 = 3.14;
parser2.functions.gcd = function(...args) {
  return gcdCalc3(args);
};
parser2.functions.lcd = function(...args) {
  return lcdCalc3(args);
};
parser2.functions.abs = function(arg) {
  return Math.abs(arg);
};
var eps2 = 1e-3;
parser2.functions.closeTo = function(value, center) {
  const start = center - eps2;
  const end = center + eps2;
  return start <= value && value <= end;
};
parser2.functions.color = function(color, value) {
  return value;
};
parser2.functions.bgColor = function(bgColor, value) {
  return value;
};
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
  return Math.abs(a * b) / gcdCalc3([a, b]);
}
function lcdCalc3(numbers) {
  return numbers.reduce((acc, num) => lcdCalcEx3(acc, num), 1);
}
function substituteContext2(expression, context) {
  let expr = parser2.parse(expression);
  const variables = expr.variables();
  for (let variable of variables) {
    expr = expr.substitute(variable, context[variable]);
  }
  return expr;
}
function evalExpression2(expression, quantityOrContext) {
  const expr = typeof expression === "string" ? parser2.parse(expression) : toEquationExpr2(expression);
  const variables = expr.variables();
  const context = typeof quantityOrContext === "number" ? { [variables.length === 1 ? variables : variables[0]]: quantityOrContext } : quantityOrContext;
  if (variables.length <= Object.keys(context).length) {
    return expr.evaluate(context);
  }
  const res = expr.simplify(context);
  return res.toString();
}
function recurExpr2(node, level, requiredLevel = 0, parentContext = {}) {
  const quantity = node.quantity ?? node.ratio ?? {};
  const { context, expression } = quantity;
  const colors2 = parentContext?.colors ?? {};
  const bgColors = parentContext?.bgColors ?? {};
  if (expression) {
    let expr = parser2.parse(expression);
    const variables = expr.variables();
    for (let variable of variables) {
      const res = recurExpr2(context[variable], level + 1, requiredLevel, parentContext);
      if (res.substitute != null) {
        expr = parser2.parse(cleanUpExpression2(expr, variable));
        if (level < requiredLevel) {
          for (let [key, values] of Object.entries(colors2)) {
            if (values.includes(context[variable])) {
              expr = expr.substitute(variable, parser2.parse(`color(${key},${variable})`));
            }
          }
          for (let [key, values] of Object.entries(bgColors)) {
            if (values.includes(context[variable])) {
              expr = expr.substitute(variable, parser2.parse(`bgColor(${key},${variable})`));
            }
          }
        }
        expr = expr.substitute(variable, res);
        if (level >= requiredLevel) {
          expr = expr.simplify();
        }
      } else {
        const q = res.quantity ?? res.ratio ?? res.ratios;
        if (typeof q == "number" || !isNaN(parseFloat(q)) || Array.isArray(q)) {
          expr = parser2.parse(cleanUpExpression2(expr, variable));
          if (level >= requiredLevel || Array.isArray(q)) {
            expr = expr.simplify({ [variable]: q });
          } else {
            for (let [key, values] of Object.entries(colors2)) {
              if (values.includes(context[variable])) {
                expr = expr.substitute(variable, parser2.parse(`color(${key},${variable})`));
              }
            }
            for (let [key, values] of Object.entries(bgColors)) {
              if (values.includes(context[variable])) {
                expr = expr.substitute(variable, parser2.parse(`bgColor(${key},${variable})`));
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
function toEquationExpr2(lastExpr, requiredLevel = 0, context = {}) {
  const final = recurExpr2({ quantity: lastExpr }, 0, requiredLevel, context);
  return parser2.parse(cleanUpExpression2(final));
}
function evaluateNodeToNumber2(lastNode) {
  const final = toEquationExpr2(lastNode);
  return parseFloat(final.toString());
}
function toEquationExprAsText(lastExpr, requiredLevel = 0, context = {}) {
  return expressionToString22(toEquationExpr2(lastExpr, requiredLevel, context).tokens, false).replaceAll('"', "");
}
function cleanUpExpression2(exp, variable = "") {
  const replaced = exp.toString().replaceAll(`${variable}.quantity`, variable).replaceAll(`${variable}.ratios`, variable).replaceAll(`${variable}.ratio`, variable).replaceAll(`${variable}.baseQuantity`, variable);
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
var INUMBER22 = "INUMBER";
var IOP122 = "IOP1";
var IOP222 = "IOP2";
var IOP322 = "IOP3";
var IVAR22 = "IVAR";
var IVARNAME22 = "IVARNAME";
var IFUNCALL22 = "IFUNCALL";
var IFUNDEF22 = "IFUNDEF";
var IEXPR22 = "IEXPR";
var IMEMBER22 = "IMEMBER";
var IENDSTATEMENT22 = "IENDSTATEMENT";
var IARRAY22 = "IARRAY";
function expressionToString22(tokens, toJS) {
  var nstack = [];
  var n1, n2, n3;
  var f, args, argCount;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER22) {
      if (typeof item.value === "number" && item.value < 0) {
        nstack.push("(" + item.value + ")");
      } else if (Array.isArray(item.value)) {
        nstack.push("[" + item.value.map(escapeValue22).join(", ") + "]");
      } else {
        nstack.push(escapeValue22(item.value));
      }
    } else if (type === IOP222) {
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
          if (f === "+") {
            nstack.push(n1 + " " + f + " " + n2);
          } else {
            const isExprN1 = typeof n1 === "string" && n1.indexOf(" ") !== -1;
            const isExprN2 = typeof n2 === "string" && n2.indexOf(" ") !== -1;
            nstack.push(`${isExprN1 ? `(${n1})` : n1} ${f} ${isExprN2 ? `(${n2})` : n2}`);
          }
        }
      }
    } else if (type === IOP322) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = item.value;
      if (f === "?") {
        nstack.push("(" + n1 + " ? " + n2 + " : " + n3 + ")");
      } else {
        throw new Error("invalid Expression");
      }
    } else if (type === IVAR22 || type === IVARNAME22) {
      nstack.push(item.value);
    } else if (type === IOP122) {
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
        nstack.push(f + " " + n1);
      }
    } else if (type === IFUNCALL22) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      f = nstack.pop();
      nstack.push(f + "(" + args.join(", ") + ")");
    } else if (type === IFUNDEF22) {
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
    } else if (type === IMEMBER22) {
      n1 = nstack.pop();
      nstack.push(n1 + "." + item.value);
    } else if (type === IARRAY22) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      nstack.push("[" + args.join(", ") + "]");
    } else if (type === IEXPR22) {
      nstack.push("(" + expressionToString22(item.value, toJS) + ")");
    } else if (type === IENDSTATEMENT22) {
    } else {
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
function escapeValue22(v) {
  if (typeof v === "string") {
    return JSON.stringify(v).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  return v;
}

// src/math/math-configure.ts
var convert2 = configureMeasurements2({
  length: length_default2,
  area: area_default2,
  volume: volume_default2,
  mass: mass_default2,
  time: time_default2,
  angle: angle_default2
});
configure2({
  convertToFraction: (d) => new Fraction2(d).toFraction(),
  convertToFractionAsLatex: (d) => new Fraction2(d).toLatex(),
  convertToUnit: (d, from, to) => convert2(d).from(from).to(to),
  unitAnchor: (unit) => convert2().getUnit(unit)?.unit?.to_anchor,
  solveLinearEquation: (first, second, variable) => solveLinearEquation2(first, second, variable),
  evalExpression: (expression, quantity) => evalExpression2(expression, quantity),
  evalNodeToNumber: (expression) => evaluateNodeToNumber2(expression),
  substituteContext: (expression, context) => substituteContext2(expression, context)
});
var inferenceRuleWithQuestion2 = inferenceRuleWithQuestion;

// node_modules/d3-hierarchy/src/hierarchy/count.js
function count(node) {
  var sum = 0, children = node.children, i = children && children.length;
  if (!i)
    sum = 1;
  else
    while (--i >= 0)
      sum += children[i].value;
  node.value = sum;
}
function count_default() {
  return this.eachAfter(count);
}

// node_modules/d3-hierarchy/src/hierarchy/each.js
function each_default(callback, that) {
  let index = -1;
  for (const node of this) {
    callback.call(that, node, ++index, this);
  }
  return this;
}

// node_modules/d3-hierarchy/src/hierarchy/eachBefore.js
function eachBefore_default(callback, that) {
  var node = this, nodes = [node], children, i, index = -1;
  while (node = nodes.pop()) {
    callback.call(that, node, ++index, this);
    if (children = node.children) {
      for (i = children.length - 1; i >= 0; --i) {
        nodes.push(children[i]);
      }
    }
  }
  return this;
}

// node_modules/d3-hierarchy/src/hierarchy/eachAfter.js
function eachAfter_default(callback, that) {
  var node = this, nodes = [node], next = [], children, i, n, index = -1;
  while (node = nodes.pop()) {
    next.push(node);
    if (children = node.children) {
      for (i = 0, n = children.length; i < n; ++i) {
        nodes.push(children[i]);
      }
    }
  }
  while (node = next.pop()) {
    callback.call(that, node, ++index, this);
  }
  return this;
}

// node_modules/d3-hierarchy/src/hierarchy/find.js
function find_default(callback, that) {
  let index = -1;
  for (const node of this) {
    if (callback.call(that, node, ++index, this)) {
      return node;
    }
  }
}

// node_modules/d3-hierarchy/src/hierarchy/sum.js
function sum_default(value) {
  return this.eachAfter(function(node) {
    var sum = +value(node.data) || 0, children = node.children, i = children && children.length;
    while (--i >= 0)
      sum += children[i].value;
    node.value = sum;
  });
}

// node_modules/d3-hierarchy/src/hierarchy/sort.js
function sort_default(compare) {
  return this.eachBefore(function(node) {
    if (node.children) {
      node.children.sort(compare);
    }
  });
}

// node_modules/d3-hierarchy/src/hierarchy/path.js
function path_default(end) {
  var start = this, ancestor = leastCommonAncestor(start, end), nodes = [start];
  while (start !== ancestor) {
    start = start.parent;
    nodes.push(start);
  }
  var k = nodes.length;
  while (end !== ancestor) {
    nodes.splice(k, 0, end);
    end = end.parent;
  }
  return nodes;
}
function leastCommonAncestor(a, b) {
  if (a === b)
    return a;
  var aNodes = a.ancestors(), bNodes = b.ancestors(), c = null;
  a = aNodes.pop();
  b = bNodes.pop();
  while (a === b) {
    c = a;
    a = aNodes.pop();
    b = bNodes.pop();
  }
  return c;
}

// node_modules/d3-hierarchy/src/hierarchy/ancestors.js
function ancestors_default() {
  var node = this, nodes = [node];
  while (node = node.parent) {
    nodes.push(node);
  }
  return nodes;
}

// node_modules/d3-hierarchy/src/hierarchy/descendants.js
function descendants_default() {
  return Array.from(this);
}

// node_modules/d3-hierarchy/src/hierarchy/leaves.js
function leaves_default() {
  var leaves = [];
  this.eachBefore(function(node) {
    if (!node.children) {
      leaves.push(node);
    }
  });
  return leaves;
}

// node_modules/d3-hierarchy/src/hierarchy/links.js
function links_default() {
  var root = this, links = [];
  root.each(function(node) {
    if (node !== root) {
      links.push({ source: node.parent, target: node });
    }
  });
  return links;
}

// node_modules/d3-hierarchy/src/hierarchy/iterator.js
function* iterator_default() {
  var node = this, current, next = [node], children, i, n;
  do {
    current = next.reverse(), next = [];
    while (node = current.pop()) {
      yield node;
      if (children = node.children) {
        for (i = 0, n = children.length; i < n; ++i) {
          next.push(children[i]);
        }
      }
    }
  } while (next.length);
}

// node_modules/d3-hierarchy/src/hierarchy/index.js
function hierarchy(data, children) {
  if (data instanceof Map) {
    data = [void 0, data];
    if (children === void 0)
      children = mapChildren;
  } else if (children === void 0) {
    children = objectChildren;
  }
  var root = new Node(data), node, nodes = [root], child, childs, i, n;
  while (node = nodes.pop()) {
    if ((childs = children(node.data)) && (n = (childs = Array.from(childs)).length)) {
      node.children = childs;
      for (i = n - 1; i >= 0; --i) {
        nodes.push(child = childs[i] = new Node(childs[i]));
        child.parent = node;
        child.depth = node.depth + 1;
      }
    }
  }
  return root.eachBefore(computeHeight);
}
function node_copy() {
  return hierarchy(this).eachBefore(copyData);
}
function objectChildren(d) {
  return d.children;
}
function mapChildren(d) {
  return Array.isArray(d) ? d[1] : null;
}
function copyData(node) {
  if (node.data.value !== void 0)
    node.value = node.data.value;
  node.data = node.data.data;
}
function computeHeight(node) {
  var height = 0;
  do
    node.height = height;
  while ((node = node.parent) && node.height < ++height);
}
function Node(data) {
  this.data = data;
  this.depth = this.height = 0;
  this.parent = null;
}
Node.prototype = hierarchy.prototype = {
  constructor: Node,
  count: count_default,
  each: each_default,
  eachAfter: eachAfter_default,
  eachBefore: eachBefore_default,
  find: find_default,
  sum: sum_default,
  sort: sort_default,
  path: path_default,
  ancestors: ancestors_default,
  descendants: descendants_default,
  leaves: leaves_default,
  links: links_default,
  copy: node_copy,
  [Symbol.iterator]: iterator_default
};

// node_modules/d3-flextree/package.json
var package_default = {
  _from: "d3-flextree",
  _id: "d3-flextree@2.1.2",
  _inBundle: false,
  _integrity: "sha512-gJiHrx5uTTHq44bjyIb3xpbmmdZcWLYPKeO9EPVOq8EylMFOiH2+9sWqKAiQ4DcFuOZTAxPOQyv0Rnmji/g15A==",
  _location: "/d3-flextree",
  _phantomChildren: {},
  _requested: {
    type: "tag",
    registry: true,
    raw: "d3-flextree",
    name: "d3-flextree",
    escapedName: "d3-flextree",
    rawSpec: "",
    saveSpec: null,
    fetchSpec: "latest"
  },
  _requiredBy: [
    "#USER",
    "/"
  ],
  _resolved: "https://registry.npmjs.org/d3-flextree/-/d3-flextree-2.1.2.tgz",
  _shasum: "1f0419f4e6c972e096dd884627a87b6b38e7ba73",
  _spec: "d3-flextree",
  _where: "/home/rsamec/sources/rsamec/cermat-quiz",
  author: {
    name: "Chris Maloney",
    url: "http://chrismaloney.org"
  },
  bugs: {
    url: "https://github.com/klortho/d3-flextree/issues"
  },
  bundleDependencies: false,
  dependencies: {
    "d3-hierarchy": "^1.1.5"
  },
  deprecated: false,
  description: "Flexible tree layout algorithm that allows for variable node sizes.",
  devDependencies: {
    "babel-plugin-external-helpers": "^6.22.0",
    "babel-preset-es2015-rollup": "^3.0.0",
    d3: "^4.13.0",
    "d3-selection-multi": "^1.0.1",
    eslint: "^4.19.1",
    jsdom: "^11.6.2",
    "npm-run-all": "^4.1.2",
    rollup: "^0.55.3",
    "rollup-plugin-babel": "^2.7.1",
    "rollup-plugin-commonjs": "^8.0.2",
    "rollup-plugin-copy": "^0.2.3",
    "rollup-plugin-json": "^2.3.0",
    "rollup-plugin-node-resolve": "^3.0.2",
    "rollup-plugin-uglify": "^3.0.0",
    "uglify-es": "^3.3.9"
  },
  homepage: "https://github.com/klortho/d3-flextree",
  "jsnext:main": "index",
  keywords: [
    "d3",
    "d3-module",
    "layout",
    "tree",
    "hierarchy",
    "d3-hierarchy",
    "plugin",
    "d3-plugin",
    "infovis",
    "visualization",
    "2d"
  ],
  license: "WTFPL",
  main: "build/d3-flextree.js",
  module: "index",
  name: "d3-flextree",
  repository: {
    type: "git",
    url: "git+https://github.com/klortho/d3-flextree.git"
  },
  scripts: {
    build: "rollup -c",
    "build:demo": "rollup -c --environment BUILD:demo",
    "build:dev": "rollup -c --environment BUILD:dev",
    "build:prod": "rollup -c --environment BUILD:prod",
    "build:test": "rollup -c --environment BUILD:test",
    clean: "rm -rf build demo test",
    lint: "eslint index.js src",
    prepare: "npm-run-all clean build lint test",
    test: "npm-run-all test:*",
    "test:browser": "node test/browser-tests.js",
    "test:main": "node test/bundle.js"
  },
  version: "2.1.2"
};

// node_modules/d3-flextree/src/flextree.js
var { version } = package_default;
var defaults = Object.freeze({
  children: (data) => data.children,
  nodeSize: (node) => node.data.size,
  spacing: 0
});
function flextree(options) {
  const opts = Object.assign({}, defaults, options);
  function accessor(name) {
    const opt = opts[name];
    return typeof opt === "function" ? opt : () => opt;
  }
  function layout(tree) {
    const wtree = wrap(getWrapper(), tree, (node) => node.children);
    wtree.update();
    return wtree.data;
  }
  function getFlexNode() {
    const nodeSize = accessor("nodeSize");
    const spacing = accessor("spacing");
    return class FlexNode extends hierarchy.prototype.constructor {
      constructor(data) {
        super(data);
      }
      copy() {
        const c = wrap(this.constructor, this, (node) => node.children);
        c.each((node) => node.data = node.data.data);
        return c;
      }
      get size() {
        return nodeSize(this);
      }
      spacing(oNode) {
        return spacing(this, oNode);
      }
      get nodes() {
        return this.descendants();
      }
      get xSize() {
        return this.size[0];
      }
      get ySize() {
        return this.size[1];
      }
      get top() {
        return this.y;
      }
      get bottom() {
        return this.y + this.ySize;
      }
      get left() {
        return this.x - this.xSize / 2;
      }
      get right() {
        return this.x + this.xSize / 2;
      }
      get root() {
        const ancs = this.ancestors();
        return ancs[ancs.length - 1];
      }
      get numChildren() {
        return this.hasChildren ? this.children.length : 0;
      }
      get hasChildren() {
        return !this.noChildren;
      }
      get noChildren() {
        return this.children === null;
      }
      get firstChild() {
        return this.hasChildren ? this.children[0] : null;
      }
      get lastChild() {
        return this.hasChildren ? this.children[this.numChildren - 1] : null;
      }
      get extents() {
        return (this.children || []).reduce(
          (acc, kid) => FlexNode.maxExtents(acc, kid.extents),
          this.nodeExtents
        );
      }
      get nodeExtents() {
        return {
          top: this.top,
          bottom: this.bottom,
          left: this.left,
          right: this.right
        };
      }
      static maxExtents(e0, e1) {
        return {
          top: Math.min(e0.top, e1.top),
          bottom: Math.max(e0.bottom, e1.bottom),
          left: Math.min(e0.left, e1.left),
          right: Math.max(e0.right, e1.right)
        };
      }
    };
  }
  function getWrapper() {
    const FlexNode = getFlexNode();
    const nodeSize = accessor("nodeSize");
    const spacing = accessor("spacing");
    return class extends FlexNode {
      constructor(data) {
        super(data);
        Object.assign(this, {
          x: 0,
          y: 0,
          relX: 0,
          prelim: 0,
          shift: 0,
          change: 0,
          lExt: this,
          lExtRelX: 0,
          lThr: null,
          rExt: this,
          rExtRelX: 0,
          rThr: null
        });
      }
      get size() {
        return nodeSize(this.data);
      }
      spacing(oNode) {
        return spacing(this.data, oNode.data);
      }
      get x() {
        return this.data.x;
      }
      set x(v) {
        this.data.x = v;
      }
      get y() {
        return this.data.y;
      }
      set y(v) {
        this.data.y = v;
      }
      update() {
        layoutChildren(this);
        resolveX(this);
        return this;
      }
    };
  }
  function wrap(FlexClass, treeData, children) {
    const _wrap = (data, parent) => {
      const node = new FlexClass(data);
      Object.assign(node, {
        parent,
        depth: parent === null ? 0 : parent.depth + 1,
        height: 0,
        length: 1
      });
      const kidsData = children(data) || [];
      node.children = kidsData.length === 0 ? null : kidsData.map((kd) => _wrap(kd, node));
      if (node.children) {
        Object.assign(node, node.children.reduce(
          (hl, kid) => ({
            height: Math.max(hl.height, kid.height + 1),
            length: hl.length + kid.length
          }),
          node
        ));
      }
      return node;
    };
    return _wrap(treeData, null);
  }
  Object.assign(layout, {
    nodeSize(arg) {
      return arguments.length ? (opts.nodeSize = arg, layout) : opts.nodeSize;
    },
    spacing(arg) {
      return arguments.length ? (opts.spacing = arg, layout) : opts.spacing;
    },
    children(arg) {
      return arguments.length ? (opts.children = arg, layout) : opts.children;
    },
    hierarchy(treeData, children) {
      const kids = typeof children === "undefined" ? opts.children : children;
      return wrap(getFlexNode(), treeData, kids);
    },
    dump(tree) {
      const nodeSize = accessor("nodeSize");
      const _dump = (i0) => (node) => {
        const i1 = i0 + "  ";
        const i2 = i0 + "    ";
        const { x, y } = node;
        const size = nodeSize(node);
        const kids = node.children || [];
        const kdumps = kids.length === 0 ? " " : `,${i1}children: [${i2}${kids.map(_dump(i2)).join(i2)}${i1}],${i0}`;
        return `{ size: [${size.join(", ")}],${i1}x: ${x}, y: ${y}${kdumps}},`;
      };
      return _dump("\n")(tree);
    }
  });
  return layout;
}
flextree.version = version;
var layoutChildren = (w, y = 0) => {
  w.y = y;
  (w.children || []).reduce((acc, kid) => {
    const [i, lastLows] = acc;
    layoutChildren(kid, w.y + w.ySize);
    const lowY = (i === 0 ? kid.lExt : kid.rExt).bottom;
    if (i !== 0)
      separate(w, i, lastLows);
    const lows = updateLows(lowY, i, lastLows);
    return [i + 1, lows];
  }, [0, null]);
  shiftChange(w);
  positionRoot(w);
  return w;
};
var resolveX = (w, prevSum, parentX) => {
  if (typeof prevSum === "undefined") {
    prevSum = -w.relX - w.prelim;
    parentX = 0;
  }
  const sum = prevSum + w.relX;
  w.relX = sum + w.prelim - parentX;
  w.prelim = 0;
  w.x = parentX + w.relX;
  (w.children || []).forEach((k) => resolveX(k, sum, w.x));
  return w;
};
var shiftChange = (w) => {
  (w.children || []).reduce((acc, child) => {
    const [lastShiftSum, lastChangeSum] = acc;
    const shiftSum = lastShiftSum + child.shift;
    const changeSum = lastChangeSum + shiftSum + child.change;
    child.relX += changeSum;
    return [shiftSum, changeSum];
  }, [0, 0]);
};
var separate = (w, i, lows) => {
  const lSib = w.children[i - 1];
  const curSubtree = w.children[i];
  let rContour = lSib;
  let rSumMods = lSib.relX;
  let lContour = curSubtree;
  let lSumMods = curSubtree.relX;
  let isFirst = true;
  while (rContour && lContour) {
    if (rContour.bottom > lows.lowY)
      lows = lows.next;
    const dist = rSumMods + rContour.prelim - (lSumMods + lContour.prelim) + rContour.xSize / 2 + lContour.xSize / 2 + rContour.spacing(lContour);
    if (dist > 0 || dist < 0 && isFirst) {
      lSumMods += dist;
      moveSubtree(curSubtree, dist);
      distributeExtra(w, i, lows.index, dist);
    }
    isFirst = false;
    const rightBottom = rContour.bottom;
    const leftBottom = lContour.bottom;
    if (rightBottom <= leftBottom) {
      rContour = nextRContour(rContour);
      if (rContour)
        rSumMods += rContour.relX;
    }
    if (rightBottom >= leftBottom) {
      lContour = nextLContour(lContour);
      if (lContour)
        lSumMods += lContour.relX;
    }
  }
  if (!rContour && lContour)
    setLThr(w, i, lContour, lSumMods);
  else if (rContour && !lContour)
    setRThr(w, i, rContour, rSumMods);
};
var moveSubtree = (subtree, distance) => {
  subtree.relX += distance;
  subtree.lExtRelX += distance;
  subtree.rExtRelX += distance;
};
var distributeExtra = (w, curSubtreeI, leftSibI, dist) => {
  const curSubtree = w.children[curSubtreeI];
  const n = curSubtreeI - leftSibI;
  if (n > 1) {
    const delta = dist / n;
    w.children[leftSibI + 1].shift += delta;
    curSubtree.shift -= delta;
    curSubtree.change -= dist - delta;
  }
};
var nextLContour = (w) => {
  return w.hasChildren ? w.firstChild : w.lThr;
};
var nextRContour = (w) => {
  return w.hasChildren ? w.lastChild : w.rThr;
};
var setLThr = (w, i, lContour, lSumMods) => {
  const firstChild = w.firstChild;
  const lExt = firstChild.lExt;
  const curSubtree = w.children[i];
  lExt.lThr = lContour;
  const diff = lSumMods - lContour.relX - firstChild.lExtRelX;
  lExt.relX += diff;
  lExt.prelim -= diff;
  firstChild.lExt = curSubtree.lExt;
  firstChild.lExtRelX = curSubtree.lExtRelX;
};
var setRThr = (w, i, rContour, rSumMods) => {
  const curSubtree = w.children[i];
  const rExt = curSubtree.rExt;
  const lSib = w.children[i - 1];
  rExt.rThr = rContour;
  const diff = rSumMods - rContour.relX - curSubtree.rExtRelX;
  rExt.relX += diff;
  rExt.prelim -= diff;
  curSubtree.rExt = lSib.rExt;
  curSubtree.rExtRelX = lSib.rExtRelX;
};
var positionRoot = (w) => {
  if (w.hasChildren) {
    const k0 = w.firstChild;
    const kf = w.lastChild;
    const prelim = (k0.prelim + k0.relX - k0.xSize / 2 + kf.relX + kf.prelim + kf.xSize / 2) / 2;
    Object.assign(w, {
      prelim,
      lExt: k0.lExt,
      lExtRelX: k0.lExtRelX,
      rExt: kf.rExt,
      rExtRelX: kf.rExtRelX
    });
  }
};
var updateLows = (lowY, index, lastLows) => {
  while (lastLows !== null && lowY >= lastLows.lowY)
    lastLows = lastLows.next;
  return {
    lowY,
    index,
    next: lastLows
  };
};

// src/ai/tldraw-utils.ts
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
function createShapeId() {
  return `shape:${generateUniqueId()}`;
}
function createAssetId() {
  return `asset:${generateUniqueId()}`;
}
function createFrame({ id, name, h, w, color }) {
  const root = {
    type: "frame",
    id,
    props: {
      name,
      color,
      h,
      w
    },
    x: 0,
    y: 0
  };
  return root;
}
function createBookmarks(shapes) {
  return convertToShapes(shapes);
}
var FILL_MAP = {
  none: "none",
  solid: "fill",
  semi: "semi",
  tint: "solid",
  pattern: "pattern"
};
function simpleFillToShapeFill(fill) {
  return FILL_MAP[fill];
}
function toRichText(text) {
  if (typeof text !== "string") {
    if (text.content == null) {
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "NOTHING" }]
          }
        ]
      };
    }
    return text;
  }
  const lines = text.split("\n");
  const content = lines.map((text2) => {
    if (!text2) {
      return {
        type: "paragraph"
      };
    }
    return {
      type: "paragraph",
      content: [{ type: "text", text: text2 ?? "" }]
    };
  });
  return {
    type: "doc",
    content
  };
}
function convertToShapes(shapes) {
  const result = {
    shapes: [],
    bindings: [],
    assets: []
  };
  for (const shape of shapes.sort((a, b) => -a.type.localeCompare(b.type))) {
    switch (shape.type) {
      case "text": {
        result.shapes.push({
          id: shape.shapeId,
          type: "text",
          x: shape.x,
          y: shape.y,
          props: {
            richText: toRichText(shape.text ?? ""),
            color: shape.color ?? "black",
            scale: shape.scale ?? 1,
            textAlign: shape.textAlign ?? "middle"
          }
        });
        break;
      }
      case "line": {
        const minX = Math.min(shape.x1, shape.x2);
        const minY = Math.min(shape.y1, shape.y2);
        result.shapes.push({
          id: shape.shapeId,
          type: "line",
          x: minX,
          y: minY,
          props: {
            points: {
              a1: {
                id: "a1",
                index: "a2",
                x: shape.x1 - minX,
                y: shape.y1 - minY
              },
              a2: {
                id: "a2",
                index: "a2",
                x: shape.x2 - minX,
                y: shape.y2 - minY
              }
            },
            color: shape.color ?? "black"
          }
        });
        break;
      }
      case "arrow": {
        const { shapeId, fromId, toId, x1, x2, y1, y2 } = shape;
        result.shapes.push({
          id: shapeId,
          type: "arrow",
          x: 0,
          y: 0,
          props: {
            color: shape.color ?? "black",
            text: shape.text ?? "",
            start: { x: x1, y: y1 },
            end: { x: x2, y: y2 }
          }
        });
        const startShape = fromId ? result.shapes.find((s) => s.id === fromId) : null;
        if (startShape) {
          result.bindings.push({
            type: "arrow",
            //id: createBindingId(),
            fromId: shapeId,
            toId: startShape.id,
            props: {
              normalizedAnchor: { x: 0.5, y: 0.5 },
              isExact: false,
              isPrecise: true,
              terminal: "start",
              snap: "none"
            },
            meta: {},
            typeName: "binding"
          });
        }
        const endShape = toId ? result.shapes.find((s) => s.id === toId) : null;
        if (endShape) {
          result.bindings.push({
            type: "arrow",
            //id: createBindingId(),
            fromId: shapeId,
            toId: endShape.id,
            props: {
              normalizedAnchor: { x: 0.5, y: 0.5 },
              isExact: false,
              isPrecise: true,
              terminal: "end",
              snap: "none"
            },
            meta: {},
            typeName: "binding"
          });
        }
        break;
      }
      case "arrow-geo":
      case "cloud":
      case "rectangle":
      case "oval":
      case "ellipse": {
        result.shapes.push({
          id: shape.shapeId,
          type: "geo",
          x: shape.x,
          y: shape.y,
          props: {
            geo: shape.type === "arrow-geo" ? `arrow-${shape.direction}` : shape.type,
            w: shape.width,
            h: shape.height,
            color: shape.color ?? "black",
            fill: simpleFillToShapeFill(shape.fill ?? "none"),
            richText: toRichText(shape.text ?? ""),
            align: shape.align ?? "middle",
            verticalAlign: shape.align ?? "middle"
          }
        });
        break;
      }
      case "note": {
        result.shapes.push({
          id: shape.shapeId,
          type: "note",
          x: shape.x,
          y: shape.y,
          props: {
            color: shape.color ?? "black",
            richText: toRichText(shape.text ?? "")
          }
        });
        break;
      }
      case "bookmark": {
        const assetId = createAssetId();
        result.shapes.push({
          id: shape.shapeId,
          type: "bookmark",
          x: shape.x,
          y: shape.y,
          props: {
            url: shape.url,
            w: shape.width ?? 300,
            h: shape.height ?? 300,
            assetId
          }
        });
        result.assets.push({
          id: assetId,
          typeName: "asset",
          type: "bookmark",
          props: {
            src: shape.url,
            description: shape.description ?? "",
            image: shape.image ?? "",
            favicon: shape.favicon ?? "",
            title: shape.title ?? ""
          },
          meta: {}
        });
        break;
      }
    }
  }
  return result;
}

// src/ai/tldraw.ts
var defaultWidth = 250;
var defaultHeight = 200;
var defaultSpacingX = 100;
var defaultSpacingY = 50;
function createLayout(deductionTree) {
  const layout = flextree({
    nodeSize: (node) => [node.data?.width ?? 0, node.data?.height ?? 0],
    spacing: defaultSpacingX
  });
  const tree = layout.hierarchy(deductionTree);
  layout(tree);
  return tree;
}
function convertToFillColor(predicate) {
  const kind = predicate?.kind?.toUpperCase();
  switch (kind) {
    case "CONT":
      return "black";
    case "RATIO":
    case "COMPLEMENT":
      return "light-green";
    case "RATIOS":
    case "NTH-PART":
      return "light-green";
    case "COMP":
    case "COMP-DIFF":
    case "COMP-ANGLE":
      return "green";
    case "COMP-RATIO":
      return "light-green";
    case "RATE":
    case "QUOTA":
      return "orange";
    case "DELTA":
    case "TRANSFER":
      return "light-red";
    case "SUM":
    case "PRODUCT":
    case "PRODUCT-COMBINE":
    case "LCD":
    case "GCD":
      return "blue";
    case "DIFF":
    case "SCALE":
    case "SCALE-INVERT":
    case "SLIDE":
    case "SLIDE-INVERT":
      return "light-blue";
    case "UNIT":
    case "ROUND":
      return "light-blue";
    case "LINEAR-EQUATION":
    case "PYTHAGORAS":
    case "EVAL-EXPR":
    case "SIMPLIFY-EXPR":
      return "light-violet";
    case "COMMON-SENSE":
    case "PROPORTION":
    case "SEQUENCE":
      return "light-red";
    default:
      return "grey";
  }
}
function convertKindToShape(predicate, isConclusion) {
  const kind = predicate?.kind?.toUpperCase();
  const common = {
    shapeId: createShapeId(),
    x: 0,
    y: 0,
    width: defaultWidth,
    height: defaultHeight,
    color: convertToFillColor(predicate),
    text: formatPredicate(predicate, richTextFormatting),
    fill: "tint",
    note: ""
  };
  if (isConclusion) {
    return {
      ...common,
      type: "rectangle"
    };
  } else if (isOperationPredicate(predicate) || isQuantityPredicate2(predicate) && predicate.quantity == null || isRatioPredicate2(predicate) && predicate.ratio == null || isRatiosPredicate2(predicate) && predicate.ratios == null || kind === "SEQUENCE" || kind === "NTH-RULE" || kind === "NTH-PART" || kind === "NTH-PART-FACTOR" || kind === "EVAL-OPTION" || kind === "LINEAR-EQUATION" || kind === "PYTHAGORAS") {
    return {
      ...common,
      type: "arrow-geo",
      direction: "left"
    };
  } else {
    return {
      ...common,
      type: "oval"
    };
  }
}
function linearScale(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const scale = (x) => {
    const ratio = (x - d0) / (d1 - d0);
    return r0 + ratio * (r1 - r0);
  };
  scale.invert = (y) => {
    const ratio = (y - r0) / (r1 - r0);
    return d0 + ratio * (d1 - d0);
  };
  scale.domain = () => domain;
  scale.range = () => range;
  return scale;
}
function deductionTreeShapes(node, title) {
  const links = [];
  const shapesTree = deductionTreeToHierarchy(node, links, false, { counter: 0 });
  const layoutedTree = createLayout(shapesTree);
  const descendants = layoutedTree.descendants();
  const bounds = descendants.reduce(
    (out, d) => {
      if (d.x > out.x.max) {
        out.x.max = d.x;
      }
      if (d.x < out.x.min) {
        out.x.min = d.x;
      }
      if (d.y > out.y.max) {
        out.y.max = d.y;
      }
      if (d.y < out.y.min) {
        out.y.min = d.y;
      }
      if (d.numChildren > out.maxChildren) {
        out.maxChildren = d.numChildren;
      }
      if (d.depth > out.maxDepth) {
        out.maxDepth = d.depth;
      }
      return out;
    },
    { maxChildren: 0, maxDepth: 0, x: { min: 0, max: 0 }, y: { min: 0, max: 0 } }
  );
  const width = bounds.x.max - bounds.x.min + bounds.maxChildren * defaultSpacingX;
  const height = bounds.y.max - bounds.y.min + bounds.maxDepth * defaultSpacingY;
  const fullWidth = width + 2 * defaultWidth;
  const fullHeight = height + defaultHeight;
  const scaleX = linearScale([bounds.x.min, bounds.x.max], [0, width]);
  const scaleY = linearScale([bounds.y.min, bounds.y.max], [0, height]);
  const flattenShapes = descendants.map((d) => ({
    ...d.data,
    x: scaleX(d.x),
    y: scaleY(bounds.y.max - bounds.y.min - d.y),
    children: void 0
  })).concat(links);
  const final = convertToShapes(flattenShapes);
  const rootId = createShapeId();
  const root = createFrame({
    id: rootId,
    name: title,
    color: "yellow",
    h: fullHeight,
    w: fullWidth
  });
  return {
    width: fullWidth,
    height: fullHeight,
    data: {
      ...final,
      shapes: [].concat(root).concat(...final.shapes.map((d) => ({ ...d, parentId: rootId })))
    }
  };
}
var toText = (text) => {
  return text;
};
var toStrongTextMark = (text) => {
  return text;
};
var toItalictMark = (text) => {
  return text;
};
var richTextFormatting = {
  compose: (strings, ...args) => concatString(strings, ...args),
  formatKind: (d) => d.kind != null ? d.kind == "product-combine" ? toText("PRODUCT") : toText(d.kind.toUpperCase()) : "",
  formatQuantity: (d) => {
    if (typeof d === "number") {
      return toText(d.toLocaleString("cs-CZ"));
    } else if (d?.expression != null) {
      return toText(toEquationExprAsText(d));
    } else if (typeof d === "string") {
      return toText(d);
    } else {
      return toText(d);
    }
  },
  formatRatio: (d, asPercent) => {
    if (typeof d === "number") {
      return toText(asPercent ? `${(d * 100).toLocaleString("cs-CZ")}%` : toText(new Fraction2(d).toFraction()));
    } else if (d?.expression != null) {
      return toText(asPercent ? toEquationExprAsText({ ...d, expression: `(${d.expression}) * 100` }) : toEquationExprAsText(d));
    } else if (typeof d === "string") {
      return toText(d);
    } else {
      return toText(d);
    }
  },
  formatEntity: (d, unit) => {
    const res = [unit, d].filter((d2) => d2 != null).join(" ");
    return isEmptyOrWhiteSpace2(res) ? "" : toItalictMark(res.trim());
  },
  formatAgent: (d) => toStrongTextMark(d),
  formatSequence: (d) => `${d}`,
  formatTable: (d) => `${d.map((d2) => d2[1])}`
};
function deductionTreeToHierarchy(node, links, isLast, extra) {
  if (isPredicate(node)) {
    return convertKindToShape(node, isLast);
  }
  const childrenShapes = [];
  if (node.children && Array.isArray(node.children)) {
    for (let i = 0; i != node.children.length; i++) {
      const child = node.children[i];
      const isLastChild = i === node.children.length - 1;
      const childShape = deductionTreeToHierarchy(child, links, isLastChild, extra);
      childrenShapes.push(childShape);
    }
  }
  const predicates = childrenShapes.slice(0, -1);
  const conclusion = childrenShapes.slice(-1)[0];
  const contextNodes = [];
  if (node.context) {
    const contextNote = {
      type: "note",
      shapeId: createShapeId(),
      text: node.context,
      width: defaultWidth,
      height: defaultHeight,
      x: 0,
      y: 0,
      note: ""
    };
    contextNodes.push(contextNote);
  }
  for (const predicate of predicates.concat(contextNodes)) {
    const x2 = predicate.x + predicate.width / 2;
    const y2 = predicate.y + predicate.height / 2;
    links.push({
      type: "arrow",
      shapeId: createShapeId(),
      fromId: predicate.shapeId,
      toId: conclusion.shapeId,
      x2,
      y2,
      x1: conclusion.x + conclusion.width / 2,
      y1: conclusion.y + conclusion.height / 2,
      note: ""
    });
  }
  const questionRule = inferenceRuleWithQuestion2(mapNodeChildrenToPredicates(node));
  const option = questionRule?.options?.find((d) => d.ok);
  const questionShapes = [];
  const questionShape = {
    type: "cloud",
    shapeId: createShapeId(),
    text: `${++extra.counter}. ${questionRule?.question ?? ""}`,
    x: 0,
    y: 0,
    width: defaultWidth * 2,
    height: defaultHeight,
    color: "blue",
    fill: "semi",
    note: ""
  };
  questionShapes.push(questionShape);
  links.push({
    type: "arrow",
    shapeId: createShapeId(),
    fromId: questionShape.shapeId,
    toId: conclusion.shapeId,
    text: option != null ? `${option.tex} = ${option.result}` : "",
    x1: questionShape.x + questionShape.width / 2,
    y1: questionShape.y + questionShape.height / 2,
    x2: conclusion.x + conclusion.width / 2,
    y2: conclusion.y + conclusion.height / 2,
    note: ""
  });
  return {
    ...conclusion,
    children: predicates.concat(...questionShapes).concat(contextNodes)
  };
}
export {
  convertToShapes,
  createBookmarks,
  createFrame,
  createShapeId,
  deductionTreeShapes,
  deductionTreeToHierarchy
};
/*!
 Based on ndef.parser, by Raphael Graf(r@undefined.ch)
 http://www.undefined.ch/mparser/index.html

 Ported to JavaScript and modified by Matthew Crumley (email@matthewcrumley.com, http://silentmatt.com/)

 You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
 to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
 but don't feel like you have to let me know or ask permission.
*/

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
  to(to4) {
    var _a, _b;
    if (this.origin == null)
      throw new Error(".to must be called after .from");
    this.destination = this.getUnit(to4);
    if (this.destination == null) {
      this.throwUnsupportedUnitError(to4);
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
      const measure5 = this.measureData[origin.measure];
      const anchors = measure5.anchors;
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
      for (const [name, measure5] of Object.entries(this.measureData)) {
        for (const [systemName, units] of Object.entries(measure5.systems)) {
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
      const measure5 = this.measureData[measureName];
      for (const [systemName, units] of Object.entries(measure5.systems)) {
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
    for (const measure5 of Object.values(this.measureData)) {
      for (const systems of Object.values(measure5.systems)) {
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
    for (const measure5 of list_measures) {
      const systems = this.measureData[measure5].systems;
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
  for (const [measureName, measure5] of Object.entries(measures)) {
    for (const [systemName, system] of Object.entries(measure5.systems)) {
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

// src/components/math.ts
var convert = configureMeasurements({
  length: length_default,
  area: area_default,
  volume: volume_default,
  mass: mass_default
});
function ctor(kind) {
  return { kind };
}
function ctorUnit(unit) {
  return { kind: "unit", unit };
}
function ctorRatios(agent) {
  return { kind: "ratios", whole: agent };
}
function ctorComplement(part) {
  return { kind: "complement", part };
}
function cont(agent, quantity, entity3, unit) {
  return { kind: "cont", agent, quantity, entity: entity3, unit };
}
function pi() {
  return { kind: "cont", agent: "PI", quantity: 3.14, entity: "" };
}
function comp(agentA, agentB, quantity, entity3) {
  return { kind: "comp", agentA, agentB, quantity, entity: entity3 };
}
function compAngle(agentA, agentB, relationship) {
  return { kind: "comp-angle", agentA, agentB, relationship };
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
function compDiff(agentMinuend, agentSubtrahend, quantity, entity3) {
  return { kind: "comp-diff", agentMinuend, agentSubtrahend, quantity, entity: entity3 };
}
function ratio(whole, part, ratio4) {
  return { kind: "ratio", whole, part, ratio: ratio4 };
}
function ratios(whole, parts, ratios2) {
  return { kind: "ratios", parts, whole, ratios: ratios2 };
}
function sum(wholeAgent, partAgents, wholeEntity, partEntity) {
  return { kind: "sum", wholeAgent, partAgents, wholeEntity: { entity: wholeEntity }, partEntity: { entity: partEntity } };
}
function product(wholeAgent, partAgents, wholeEntity, partEntity) {
  return { kind: "product", wholeAgent, partAgents, wholeEntity: { entity: wholeEntity }, partEntity: { entity: partEntity } };
}
function gcd2(agent, entity3) {
  return { kind: "gcd", agent, entity: entity3 };
}
function lcd(agent, entity3) {
  return { kind: "lcd", agent, entity: entity3 };
}
function nth(entity3) {
  return { kind: "nth", entity: entity3 };
}
function nthPart(agent) {
  return { kind: "nth-part", agent };
}
function rate(agent, quantity, entity3, entityBase) {
  return { kind: "rate", agent, quantity, entity: { entity: entity3 }, entityBase: { entity: entityBase } };
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
      { tex: `90 - ${a.agent}`, result: formatNumber(result.quantity), ok: b.relationship == "complementary" },
      { tex: `180 - ${a.agent}`, result: formatNumber(result.quantity), ok: b.relationship == "supplementary" || b.relationship == "sameSide" },
      { tex: `${a.agent}`, result: formatNumber(result.quantity), ok: b.relationship != "supplementary" && b.relationship != "complementary" && b.relationship != "sameSide" }
    ]
  };
}
function toComparisonRatioEx(a, b) {
  if (a.whole != b.whole) {
    throw `Mismatch entity ${a.whole}, ${b.whole}`;
  }
  return { kind: "comp-ratio", agentB: b.part, agentA: a.part, ratio: 1 + (a.ratio - b.ratio) };
}
function toComparisonRatio(a, b) {
  const result = toComparisonRatioEx(a, b);
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}. O kolik?`,
    result,
    options: [
      { tex: `${formatRatio(a.ratio)} - ${formatRatio(b.ratio)}`, result: formatRatio(a.ratio - b.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} - ${formatRatio(a.ratio)}`, result: formatRatio(b.ratio - a.ratio), ok: false }
    ]
  };
}
function convertToUnitEx(a, b) {
  if (a.unit == null) {
    throw `Missing entity unit ${a.agent} a ${a.entity}`;
  }
  return { ...a, quantity: convert(a.quantity).from(a.unit).to(b.unit), unit: b.unit };
}
function convertToUnit(a, b) {
  const result = convertToUnitEx(a, b);
  const destination = convert().getUnit(a.unit)?.unit?.to_anchor;
  const origin = convert().getUnit(b.unit)?.unit?.to_anchor;
  return {
    question: `P\u0159eve\u010F ${formatNumber(a.quantity)} ${formatEntity(a)} na ${b.unit}.`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(destination / origin)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(origin / destination)}`, result: formatNumber(result.quantity), ok: false }
    ]
  };
}
function ratioCompareRuleEx(a, b) {
  if (!(a.agent == b.agentA || a.agent == b.agentB)) {
    throw `Mismatch agent ${a.agent} any of ${b.agentA}, ${b.agentB}`;
  }
  if (a.agent == b.agentB) {
    return { kind: "cont", agent: b.agentA, quantity: b.ratio >= 0 ? a.quantity * b.ratio : a.quantity / Math.abs(b.ratio), entity: a.entity };
  } else if (a.agent == b.agentA) {
    return { kind: "cont", agent: b.agentB, quantity: b.ratio > 0 ? a.quantity / b.ratio : a.quantity * Math.abs(b.ratio), entity: a.entity };
  }
}
function ratioCompareRule(a, b) {
  const result = ratioCompareRuleEx(a, b);
  return {
    question: `Vypo\u010Dti ${a.agent == b.agentB ? b.agentA : b.agentB}${formatEntity(result)}?`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatRatio(Math.abs(b.ratio))}`, result: formatNumber(a.quantity * b.ratio), ok: a.agent == b.agentB && b.ratio >= 0 || a.agent == b.agentB && b.ratio < 0 },
      { tex: `${formatNumber(a.quantity)} / ${formatRatio(Math.abs(b.ratio))}`, result: formatNumber(a.quantity / b.ratio), ok: a.agent == b.agentA && b.ratio >= 0 || a.agent == b.agentA && b.ratio < 0 }
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
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? " + " : " - "} ${formatNumber(Math.abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentReceiver },
      { tex: `${formatNumber(a.quantity)} ${b.quantity > 0 ? " - " : " + "} ${formatNumber(Math.abs(b.quantity))}`, result: formatNumber(result.quantity), ok: a.agent == b.agentSender }
    ]
  };
}
function ratioComplementRuleEx(a, b) {
  return {
    kind: "ratio",
    whole: b.whole,
    ratio: 1 - b.ratio,
    part: a.part
  };
}
function ratioComplementRule(a, b) {
  const result = ratioComplementRuleEx(a, b);
  return {
    question: `Vyj\xE1d\u0159i pom\u011Brem ${result.part} z ${result.whole}?`,
    result,
    options: [
      { tex: `1 - ${formatRatio(b.ratio)}`, result: formatRatio(1 - b.ratio), ok: true },
      { tex: `${formatRatio(b.ratio)} - 1`, result: formatRatio(b.ratio - 1), ok: false }
    ]
  };
}
function ratioConvertRule(a, b) {
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
function compRatioToCompRuleEx(a, b) {
  if (b.quantity > 0 && a.ratio < 1 || b.quantity < 0 && a.ratio > 1) {
    throw `Uncompatible compare rules. Absolute compare ${b.quantity} between ${b.agentA} a ${b.agentB} does not match relative compare ${a.ratio}. `;
  }
  return {
    kind: "cont",
    agent: b.agentB,
    entity: b.entity,
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
function rateRuleEx(a, rate5) {
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
function rateRule(a, rate5) {
  const result = rateRuleEx(a, rate5);
  return {
    question: containerQuestion(result),
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} * ${formatNumber(rate5.quantity)}`, result: formatNumber(a.quantity * rate5.quantity), ok: a.entity !== rate5.entity.entity },
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(rate5.quantity)}`, result: formatNumber(a.quantity / rate5.quantity), ok: a.entity === rate5.entity.entity }
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
  return { kind: "cont", agent: b.wholeAgent, quantity: items.reduce((out, d) => out += d.quantity, 0), entity: b.wholeEntity.entity };
}
function sumRule(items, b) {
  const result = sumRuleEx(items, b);
  return {
    question: combineQuestion(result),
    result,
    options: [
      { tex: items.map((d) => formatNumber(d.quantity)).join(" + "), result: formatNumber(items.map((d) => d.quantity).reduce((out, d) => out += d, 0)), ok: true },
      { tex: items.map((d) => formatNumber(d.quantity)).join(" * "), result: formatNumber(items.map((d) => d.quantity).reduce((out, d) => out *= d, 1)), ok: false }
    ]
  };
}
function productRuleEx(items, b) {
  return { kind: "cont", agent: b.wholeAgent, quantity: items.reduce((out, d) => out *= d.quantity, 1), entity: b.wholeEntity.entity };
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
function sequenceRule(items) {
  if (new Set(items.map((d) => d.entity)).size > 1) {
    throw `Mismatch entity ${items.map((d) => d.entity).join()}`;
  }
  const type = sequencer(items.map((d) => d.quantity));
  return { kind: "sequence", type, entity: items[0].entity };
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
function toRatioComparisonEx(a, b) {
  if (b.agent === a.agent && b.entity != a.entity) {
    b = toGenerAgent(b);
    a = toGenerAgent(a);
  }
  if (b.entity != a.entity) {
    throw `Mismatch entity ${b.entity}, ${a.entity}`;
  }
  return { kind: "comp-ratio", agentB: b.agent, agentA: a.agent, ratio: a.quantity / b.quantity };
}
function toRatioComparison(a, b) {
  const result = toRatioComparisonEx(a, b);
  const between = result.ratio > 1 / 2 && result.ratio < 2;
  return {
    question: `Porovnej ${result.agentA} a ${result.agentB}.${between ? `O kolik z ${result.agentB}?` : `Kolikr\xE1t ${result.ratio < 1 ? "men\u0161\xED" : "v\u011Bt\u0161\xED"}?`}`,
    result,
    options: between ? [
      { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)} - 1`, result: formatRatio(result.ratio - 1), ok: result.ratio > 1 },
      { tex: `1 - ${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatRatio(1 - result.ratio), ok: result.ratio <= 1 }
    ] : [
      { tex: `${formatNumber(a.quantity)} / ${formatNumber(b.quantity)}`, result: formatRatio(a.quantity / b.quantity), ok: result.ratio >= 1 },
      { tex: `${formatNumber(b.quantity)} / ${formatNumber(a.quantity)}`, result: formatRatio(b.quantity / a.quantity), ok: result.ratio < 1 }
    ]
  };
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
function toDiffEx(a, b) {
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
function toDiff(a, b) {
  const result = toDiffEx(a, b);
  return {
    question: `Vypo\u010Dti rozd\xEDl mezi ${a.quantity} a ${b.quantity}`,
    result,
    options: [
      { tex: `${formatNumber(a.quantity)} - ${formatNumber(b.quantity)}`, result: formatNumber(result.quantity), ok: true },
      { tex: `${formatNumber(b.quantity)} - ${formatNumber(a.quantity)}`, result: formatNumber(b.quantity - a.quantity), ok: false }
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
    question: `Rozd\u011Bl rovnom\u011Brn\u011B na ${b.quantity} ${b.entity}`,
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
function toRatiosEx(a, b, whole) {
  return {
    kind: "ratios",
    parts: [
      a.agent,
      b.agent
    ],
    ratios: [a.quantity, b.quantity],
    whole
  };
}
function toRatios(a, b, last4) {
  const result = toRatiosEx(a, b, last4.whole);
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
    question: "Zjednodu\u0161",
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
function isQuestion(value) {
  return value?.result != null;
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
  if (last4?.kind === "sum" || last4?.kind === "product" || last4?.kind === "lcd" || last4?.kind === "gcd" || last4?.kind === "sequence" && args.length > 3) {
    const arr = [a, b].concat(rest.slice(0, -1));
    return last4.kind === "sequence" ? sequenceRule(arr) : last4.kind === "gcd" ? gcdRule(arr, last4) : last4.kind === "lcd" ? lcdRule(arr, last4) : last4.kind === "product" ? productRule(arr, last4) : last4.kind === "sum" ? sumRule(arr, last4) : null;
  } else if (a.kind === "cont" && b.kind == "cont") {
    const kind = last4?.kind;
    return kind === "comp-diff" ? toDiff(a, b) : kind === "quota" ? toQuota(a, b) : kind === "delta" ? toTransfer(a, b, last4) : kind === "rate" ? toRate(a, b) : kind === "ratios" ? toRatios(a, b, last4) : kind === "comp-ratio" ? toRatioComparison(a, b) : kind === "ratio" ? toPartWholeRatio(a, b) : toComparison(a, b);
  } else if (a.kind === "cont" && b.kind === "unit") {
    return convertToUnit(a, b);
  } else if (a.kind === "unit" && b.kind === "cont") {
    return convertToUnit(b, a);
  } else if (a.kind === "cont" && b.kind === "comp-angle") {
    return compareAngleRule(a, b);
  } else if (a.kind === "comp-angle" && b.kind === "cont") {
    return compareAngleRule(b, a);
  } else if (a.kind === "ratio" && b.kind === "ratio") {
    return toComparisonRatio(a, b);
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
  } else if (a.kind === "cont" && b.kind === "ratio") {
    return partToWholeRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "cont") {
    return partToWholeRule(b, a);
  } else if (a.kind === "complement" && b.kind === "ratio") {
    return ratioComplementRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "complement") {
    return ratioComplementRule(b, a);
  } else if (a.kind === "complement" && b.kind === "ratio") {
    return ratioConvertRule(a, b);
  } else if (a.kind === "ratio" && b.kind === "complement") {
    return ratioConvertRule(b, a);
  } else if (a.kind === "cont" && b.kind == "ratios") {
    const kind = last4?.kind;
    return kind === "simplify" ? mapRatiosByFactor(b, 1 / a.quantity) : kind === "nth-part" ? partToPartRule(a, b, last4) : partToPartRule(a, b);
  } else if (a.kind === "ratios" && b.kind == "cont") {
    const kind = last4?.kind;
    return kind === "simplify" ? mapRatiosByFactor(a, 1 / b.quantity) : kind === "nth-part" ? partToPartRule(b, a, last4) : partToPartRule(b, a);
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
  return d.toLocaleString("cs-CZ");
}
function formatRatio(d) {
  return d > -2 && d < 2 ? new Fraction(d).toFraction() : formatNumber(d);
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
  return d.entity || d.unit ? `(${[d.unit, d.entity].filter((d2) => d2 != null).join(" ")})` : "";
}
function computeOtherAngle(angle1, relationship) {
  switch (relationship) {
    case "complementary":
      return 90 - angle1;
    case "supplementary":
    case "sameSide":
      return 180 - angle1;
    case "vertical":
    case "corresponding":
    case "alternate":
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
    case "vertical":
      return "souhlasn\xFD";
    case "corresponding":
      return "vrcholov\xFD";
    case "alternate":
      return "st\u0159\xEDdav\xFD";
    default:
      throw "Nezn\xE1m\xFD vztah";
  }
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
function toCont(child, { agent }) {
  const node = isPredicate(child) ? child : last(child);
  if (!(node.kind == "cont" || node.kind === "transfer" || node.kind == "comp" || node.kind === "comp-diff" || node.kind === "rate")) {
    throw `Non convertable node type: ${node.kind}`;
  }
  const typeNode = node;
  return to(child, cont(agent, typeNode.quantity, typeNode.kind == "rate" ? typeNode.entity.entity : typeNode.entity, typeNode.kind == "rate" ? typeNode.entity.unit : typeNode.unit));
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
var mdFormatting = {
  compose: (strings, ...args) => concatString(strings, ...args),
  formatKind: (d) => `[${d.kind.toUpperCase()}]`,
  formatQuantity: (d) => d.toLocaleString("cs-CZ"),
  formatRatio: (d) => d.toLocaleString("cs-CZ"),
  formatEntity: (d, unit) => `__${[unit, d].filter((d2) => d2 != null).join(" ")}__`,
  formatAgent: (d) => `**${d}**`,
  formatSequence: (d) => `${d.type}`
};
function formatPredicate(d, formatting) {
  const { formatKind, formatAgent, formatEntity: formatEntity2, formatQuantity, formatRatio: formatRatio2, formatSequence, compose } = { ...mdFormatting, ...formatting };
  if ((d.kind == "ratio" || d.kind == "transfer" || d.kind === "comp-ratio" || d.kind === "rate" || d.kind === "quota" || d.kind === "comp-diff" || d.kind === "comp-part-eq" || d.kind === "ratio-c" || d.kind === "ratios-c") && (d.quantity == null && d.ratio == null)) {
    return formatKind(d);
  }
  let result = "";
  switch (d.kind) {
    case "cont":
      result = compose`${formatAgent(d.agent)}=${formatQuantity(d.quantity)} ${formatEntity2(d.entity, d.unit)}`;
      break;
    case "comp":
      result = d.quantity === 0 ? compose`${formatAgent(d.agentA)} je rovno ${formatAgent(d.agentB)}` : compose`${formatAgent(d.agentA)} ${d.quantity > 0 ? "v\xEDce" : "m\xE9n\u011B"} než ${formatAgent(d.agentB)} o ${formatQuantity(Math.abs(d.quantity))} ${formatEntity2(d.entity, d.unit)}`;
      break;
    case "transfer":
      result = d.quantity === 0 ? compose`${formatAgent(d.agentReceiver.name)} je rovno ${formatAgent(d.agentSender.name)}` : d.agentReceiver === d.agentSender ? compose`změna o ${formatQuantity(d.quantity)} ${formatEntity2(d.entity, d.unit)} mezi ${formatAgent(d.agentSender.nameBefore)} a ${formatAgent(d.agentSender.nameAfter)}` : compose`${formatQuantity(Math.abs(d.quantity))} ${formatEntity2(d.entity, d.unit)}, ${formatAgent(d.quantity > 0 ? d.agentSender.name : d.agentReceiver.name)} => ${formatAgent(d.quantity > 0 ? d.agentReceiver.name : d.agentSender.name)}`;
      break;
    case "comp-ratio":
      const between = d.ratio > 1 / 2 && d.ratio < 2;
      result = between ? compose`${formatAgent(d.agentA)} ${d.ratio < 1 ? "m\xE9n\u011B" : "v\xEDce"} o ${formatRatio2(d.ratio > 1 ? d.ratio - 1 : 1 - d.ratio)} než ${formatAgent(d.agentB)} ` : compose`${formatAgent(d.agentA)} ${formatRatio2(d.ratio > 1 ? Math.abs(d.ratio) : 1 / Math.abs(d.ratio))} krát ${d.ratio > 1 ? "v\xEDce" : "m\xE9n\u011B"} než ${formatAgent(d.agentB)} `;
      break;
    case "comp-diff":
      result = compose`${formatAgent(d.agentMinuend)} - ${formatAgent(d.agentSubtrahend)}=${formatQuantity(d.quantity)} ${formatEntity2(d.entity, d.unit)}`;
      break;
    case "ratio":
      result = compose`${formatAgent(d.part)} z ${formatAgent(d.whole)}=${formatRatio2(d.ratio)}`;
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
      result = compose`${formatQuantity(d.quantity)} ${formatEntity2(d.entity.entity, d.entity.unit)} per ${formatEntity2(d.entityBase.entity, d.entityBase.unit)}`;
      break;
    case "quota":
      result = compose`${formatAgent(d.agent)} rozděleno na ${formatQuantity(d.quantity)} ${formatAgent(d.agentQuota)} ${d.restQuantity !== 0 ? ` se zbytkem ${formatAgent(d.restQuantity)}` : ""}`;
      break;
    case "sequence":
      result = compose`${d.type != null ? formatSequence(d.type) : ""}`;
      break;
    case "nth":
      result = compose`${formatEntity2(d.entity)}`;
      break;
    case "unit":
      result = compose`${d.unit}`;
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
    const res = substitution ? `${curr}${substitution}` : curr;
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
  const kapitan = axiomInput(cont(agent, input.kapitan, kapitanLabel), 1);
  const porucik = axiomInput(cont(agent, input.porucik, porucikLabel), 2);
  const cetarPerPorucik = axiomInput(rate(agent, input.cetarPerPorucik, cetarLabel, porucikLabel), 3);
  const vojinPerCetar = axiomInput(rate(agent, input.vojinPerCetar, vojinLabel, cetarLabel), 4);
  const dd1 = inferenceRule(porucik, cetarPerPorucik);
  const vydaneRozkazy = sum("vydan\xE9 rozkazy", [kapitanLabel, porucikLabel, cetarLabel, vojinLabel], entity3, entity3);
  const dostaneRozkazy = sum("p\u0159ijat\xE9 rozkazy", [porucikLabel, cetarLabel, vojinLabel], entity3, entity3);
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
  const template = (highlight2) => highlight2`V rotě je ${input.kapitan} kapitán a má pod sebou ${input.porucik} poručíky.Každý poručík má pod sebou ${input.cetarPerPorucik} své četaře
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
  const entity3 = "K\u010D";
  const totalPrice = "celkem";
  const partTotalPrice = "1.z\xE1k.+2.z\xE1k";
  const p1p2 = axiomInput(compRelative(piece2, piece1, -1 / 4), 2);
  const p1 = axiomInput(cont(piece1, input.cena, entity3), 1);
  const p2Ratio = ratio(piece1, piece2, 3 / 4);
  const p3Ratio = ratio(totalPrice, partTotalPrice, 2 / 3);
  const oneThird = axiomInput(ratio(totalPrice, piece3, 1 / 3), 3);
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

// src/math/M7A-2024/pocet-sportovcu.ts
function build3({ input }) {
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

// src/math/M7A-2024/letni-tabor.ts
function build4({ input }) {
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
    sum("vedouc\xEDch a instruktor\u016F", [vedouciLabel, instruktorLabel], entity3, entity3)
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
  return [
    { deductionTree: dTree1, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template1}` },
    { deductionTree: dTree2, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template2}` },
    { deductionTree: dTree3, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template3}` }
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
  const entity3 = "zv\xED\u0159e";
  const slepice = "slepice";
  const kralik = "kr\xE1l\xEDk";
  const total = axiomInput(cont(celkem, input.pocetHlav, hlava), 1);
  const perHlava = rate(celkem, 1, hlava, entity3);
  const slepicePlus = axiomInput(comp(kralik, slepice, -input.kralikuMene, entity3), 2);
  const deductionTree = deduce(
    deduce(
      deduce(total, perHlava),
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

// src/math/M9A-2024/svadleny.ts
function build6({ input }) {
  const agentPrevious = "p\u016Fvodn\xED zak\xE1zka";
  const agentCurrent = "nov\xE1 zak\xE1zka";
  const agentNew = "roz\u0161\xED\u0159en\xE1 nov\xE1 zak\xE1zka";
  const entityA = "\u0161vadlen";
  const entityB = "hodin";
  const aPrevious = axiomInput(cont(agentPrevious, input.previousWorker, entityA), 1);
  const aCurrent = axiomInput(cont(agentCurrent, input.currentWorker, entityA), 3);
  const bPrevious = axiomInput(cont(agentPrevious, input.previousHours, entityB), 2);
  const comp6 = compRatio(agentNew, agentCurrent, 3 / 2);
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
      comp6,
      proportion(false, [`mno\u017Estv\xED`, `hodin`])
    )
  );
  const template = (highlight2) => highlight2`${input.previousWorker} švadlen, které šijí oblečení, pracují stejným tempem.
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
  const entity3 = "zaci";
  const chlapci = axiomInput(cont(celkemAgent, input.chlapci, entityChlapci), 1);
  const chlapciDiff = axiomInput(compDiff(celkemAgent, skupinaDE, input.anglictinaChlapci, entityChlapci), 2);
  const de = axiomInput(cont(skupinaDE, input.nemcinaDivky, entityDivky), 3);
  const dBase = deduce(
    deduce(
      chlapci,
      chlapciDiff
    ),
    de,
    sum(skupinaDE, [], entity3, entity3)
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

// src/math/M9A-2024/dum-meritko.ts
function build8({ input }) {
  const skutecnost = "skute\u010Dnost";
  const plan = "pl\xE1n";
  const widthLabel = "\u0161\xED\u0159ka";
  const lengthLabel = "d\xE9lka";
  const entity3 = "";
  const unit = "cm";
  const unit2D = "cm2";
  const width = axiomInput(cont(`${skutecnost} ${widthLabel}`, input.sirkaM, entity3, "m"), 1);
  const widthOnPlan = axiomInput(cont(`${plan} ${widthLabel}`, input.planSirkaCM, entity3, unit), 2);
  const lengthOnPlan = axiomInput(cont(`${plan} ${lengthLabel}`, input.planDelkaDM, entity3, "dm"), 3);
  const dWidth = deduce(width, ctorUnit(unit));
  const dBase = deduce(
    widthOnPlan,
    dWidth,
    ctorRatios("m\u011B\u0159\xEDtko")
  );
  const dTree1 = deduce(
    dBase,
    deduce(widthOnPlan, width, gcd2("nejmen\u0161\xED spole\u010Dn\xFD n\xE1sobek", entity3)),
    ctor("simplify")
  );
  const meritko = { ...last(dTree1), ...deduceLbl(3) };
  const dTree2 = deduce(
    deduce(lengthOnPlan, ctorUnit(unit)),
    to(
      meritko,
      commonSense("m\u011B\u0159\xEDtko pl\xE1nu plat\xED pro cel\xFD pl\xE1n, stejn\u011B pro \u0161\xEDrku a d\xE9lku domu"),
      ratios("m\u011B\u0159\xEDtko", [`${plan} ${lengthLabel}`, `${skutecnost} ${lengthLabel}`], meritko.ratios)
    ),
    nthPart(`${skutecnost} ${lengthLabel}`)
  );
  const ddSkutecnost = deduce(
    dTree2,
    dWidth,
    product(`${skutecnost} obsah`, [lengthLabel, widthLabel], unit2D, entity3)
  );
  const ddPlan = deduce(
    deduce(lengthOnPlan, ctorUnit(unit)),
    widthOnPlan,
    product(`${plan} obsah`, [lengthLabel, widthLabel], unit2D, entity3)
  );
  const dTree3 = deduce(
    deduce(
      ddPlan,
      ddSkutecnost,
      ctorRatios("m\u011B\u0159\xEDtko")
    ),
    deduce(ddPlan.children[3], ddSkutecnost.children[3], gcd2("nejmen\u0161\xED spole\u010Dn\xFD n\xE1sobek", entity3)),
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
  const entity3 = "K\u010D";
  const entityPercent3 = "%";
  const percent = cont(agentPercentPart, input.percentageDown, entityPercent3);
  const celek = cont(agentPercentBase, 100, entityPercent3);
  const dd1 = inferenceRule(percent, celek, ctor("ratio"));
  const dd1Up = axiomInput(ratio("cena po slev\u011B", "zdra\u017Eeno", input.percentageNewUp / 100), 3);
  const percentBase2 = cont(agentPercentBase, input.base, entity3);
  const dd2 = inferenceRule(percentBase2, dd1);
  const sleva = comp(agentPercentBase, "cena po slev\u011B", dd2.kind === "cont" && dd2.quantity, entity3);
  const dd3 = inferenceRule(sleva, percentBase2);
  const soucet = sum("kone\u010Dn\xE1 cena", ["cena po slev\u011B", "zdra\u017Eeno"], entity3, entity3);
  const percentage = axiomInput(cont(agentPercentPart, input.percentageDown, entityPercent3), 2);
  const base = axiomInput(cont(agentPercentBase, input.base, entity3), 1);
  const slevaPart = percentPart({ base, percentage });
  const deductionTree = deduce(
    deduce(
      deduce(
        to(
          slevaPart,
          sleva
        ),
        base
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
  const volume2 = deduce(
    surfaceBaseAreaTree,
    height,
    product(volumeLabel, [surfaceBaseAreaLabel, heightLabel], entity3D, entity3)
  );
  const baseCircumferenceTree = baseCircumference({ radius }, { radiusLabel, baseCircumferenceLabel });
  const protilehlaStana = cont("po\u010Det st\u011Bn", 2, "");
  const surface = deduce(
    deduce(
      surfaceBaseAreaTree,
      protilehlaStana,
      product("spodn\xED a horn\xED st\u011Bna", [], entity2D, entity3)
    ),
    deduce(
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

// src/math/M9A-2024/tezitko.ts
function build9({ input }) {
  const agentOut = "vn\u011Bj\u0161\xED v\xE1lec";
  const agentIn = "vnit\u0159n\xED v\xE1lec";
  const entity3 = "cm";
  const outRadius = axiomInput(cont(`${agentOut} polom\u011Br`, input.out.radius, entity3), 1);
  const outHeight = axiomInput(cont(`${agentOut} v\xFD\u0161ka`, input.out.height, entity3), 2);
  const inRadius = axiomInput(cont(`${agentIn} polom\u011Br`, input.in.radius, entity3), 3);
  const inHeight = axiomInput(cont(`${agentIn} v\xFD\u0161ka`, input.in.height, entity3), 4);
  const outCylinder = cylinder({ radius: outRadius, height: outHeight }, { volumeLabel: "objem vn\u011Bj\u0161\xEDho v\xE1lce" });
  const inCylinder = cylinder({ radius: inRadius, height: inHeight }, { volumeLabel: "objem vnit\u0159n\xEDho v\xE1lce" });
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

// src/math/M9A-2024/tanga.ts
function build10({ input }) {
  const radiusLabel = "polom\u011Br";
  const areaCircleLabel = "obsah kruhu";
  const baseCircleLabel = "obvod kruhu";
  const circelPartLabel = "\u010Dtvrtkruh";
  const tangaHeight = "tanga v\xFD\u0161ka";
  const entity3 = "cm";
  const entity2d = "cm \u010Dtvere\u010Dn\xEDch";
  const width = axiomInput(cont(`tanga \u0161\xED\u0159ka`, input.tangaWidth, entity3), 1);
  const ratio4 = compRatio(`tanga \u0161\xED\u0159ka`, radiusLabel, 2);
  const dRadius = deduce(width, ratio4);
  const obsah = surfaceBaseArea({ radius: last(dRadius) }, {
    surfaceBaseAreaLabel: areaCircleLabel,
    entity2D: entity2d
  });
  const dd1 = deduce(
    deduce(
      width,
      to(
        dRadius,
        commonSense(`${radiusLabel} = ${tangaHeight}`),
        cont(tangaHeight, dRadius.children[2].quantity, entity3)
      ),
      product("obsah obd\xE9ln\xEDku", [], entity2d, entity3)
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
    obvodCvrtkruh,
    last(obvodCvrtkruh),
    width,
    sum(`obvod \u0161ed\xE9ho obrazce`, [circelPartLabel, circelPartLabel, "\u0161\xED\u0159ka"], entity3, entity3)
  );
  return [{ deductionTree: dd1 }, { deductionTree: dd2 }];
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
    delsiStrana,
    cont("\u010Dtverec", 4, "strany"),
    product("obvod \u010Dtverce", ["d\xE9lka strany", "po\u010Det stran"], entity3, entity3)
  );
  return { deductionTree };
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
      rameno,
      ramenoCount,
      product("obvod obrazce (ramena)", ["d\xE9lka ramena", "po\u010Det stran"], entity3, entity3)
    ),
    deduce(
      zakladna,
      zakladnaCount,
      product("obvod obrazce (zakladny)", ["d\xE9lka z\xE1kladny", "po\u010Det stran"], entity3, entity3)
    ),
    sum("obvod obrazce", [], entity3, entity3)
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
  const entity3 = "obyvatel";
  const total = axiomInput(cont(celkem, input.celkem, entity3), 1);
  const diffComp = axiomInput(comp(jihlava, trebic, input.jihlavaPlus, entity3), 2);
  const deductionTree = deduce(
    total,
    diffComp,
    ctor("comp-part-eq")
  );
  const template = (highlight2) => highlight2`Města Jihlava a Třebíč mají dohromady ${input.celkem.toLocaleString("cs-CZ")} obyvatel.
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
  const zbyva = axiomInput(cont("zb\xFDv\xE1", input.zbyvaNasporit, entity3), 4);
  const michalPlus = axiomInput(cont("Michal+", input.michalPlus, entity3), 3);
  const penize = sum("Michal+zb\xFDv\xE1", [], entity3, entity3);
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
      ctorComplement("Michal+zb\xFDv\xE1")
    ),
    deduce(michalPlus, zbyva, penize)
  );
  const template = (highlight2) => highlight2`
  Dva sourozenci Eva a Michal šetří ${"spole\u010Dn\u011B"} na dárek pro rodiče.
  Eva našetřila ${input.evaPodil} % potřebné částky, Michal o ${input.michalPlus} korun více než Eva.
  Sourozencům zbývá našetřit ${input.zbyvaNasporit} korun.
  ${(html) => html`<br/><strong> Kolik korun stojí dárek?</strong>`}`;
  return { deductionTree, data, template };
}

// src/math/M9A-2023/trojuhelnik.ts
function build13({ input }) {
  const agent = "obrazec";
  const entity3 = "troj\xFAheln\xEDk";
  const whiteEntity = `b\xEDl\xFD ${entity3}`;
  const grayEntity = `\u0161ed\xFD ${entity3}`;
  const nthLabel = "pozice";
  const nthEntity = nth(nthLabel);
  const inputContainers = [1, 3, 9].map((d, i) => cont(`${agent} \u010D.${i + 1}`, d, whiteEntity));
  const dSequence = inferenceRule(...inputContainers, ctor("sequence"));
  const soucet = sum("obrazec \u010D.7", [], entity3, grayEntity);
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
        cont("p\u0159edposledn\xED obrazec", 6561, entity3),
        nthEntity
      ),
      cont("posun na posledn\xED obrazec", 1, nthEntity.entity),
      sum("posledn\xED obrazec", [], nthEntity.entity, nthEntity.entity)
    ),
    { ...dSequence, ...deduceLbl(1) }
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
    { deductionTree: dTree1, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template1}` },
    { deductionTree: dTree2, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template2}` },
    { deductionTree: dTree3, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template3}` }
  ];
}

// src/math/M9B-2023/ctvercova-sit.ts
function build14({ input }) {
  const agent = "obrazec";
  const entity3 = "pole";
  const whiteEntity = `sv\u011Btl\xE1 ${entity3}`;
  const grayEntity = `tmav\xE1 ${entity3}`;
  const nthLabel = "pozice";
  const nthEntity = nth(nthLabel);
  const inputContainers = [1, 5, 13].map((d, i) => cont(`${agent} \u010D.${i + 1}`, d, entity3));
  const dSequence = inferenceRule(...inputContainers, ctor("sequence"));
  const soucetLiche = sum("liche cisla", [], entity3, entity3);
  const soucetSude = sum("suda cisla", [], entity3, entity3);
  const sude = [2, 4, 6, 8, 10].map((d) => cont("sude", d, entity3));
  const liche = [1, 3, 5, 7, 9].map((d) => cont("liche", d, entity3));
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
    cont("hledan\xFD tmav\xFD obrazec", 400, entity3),
    nthEntity
  );
  const templateBase = (highlight2) => highlight2`Vybarvováním některých prázdných polí čtvercové sítě postupně vytváříme obrazce.
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
    { deductionTree: dTree1, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template1}` },
    { deductionTree: dTree2, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template2}` },
    { deductionTree: dTree3, template: (highlight2) => highlight2`${() => templateBase(highlight2)}${template3}` }
  ];
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
      cont(missingVyrobkyLabel, last(rozdilGram).quantity, entity3)
    ),
    missingVyrobkyPocet,
    ctor("rate")
  );
  const deductionTree3 = deduce(
    to(
      { ...last(deductionTree1), ...deduceLbl(2) },
      cont(plnaKrabiceLabel, last(deductionTree1).quantity, entity3)
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
  const kyticeLabel = "kytice";
  const chryzatemaLabel = "chryzant\xE9ma";
  const ruzeLabel = "r\u016F\u017Ee";
  const staticLabel = "statice";
  const kusEntity = "kus";
  const entity3 = "cena";
  const rozdilRuze = axiomInput(comp(ruzeLabel, staticLabel, 2, kusEntity), 1);
  const RtoS = axiomInput(compRatio(ruzeLabel, staticLabel, 5 / 4), 2);
  const CHxS = axiomInput(ratios(kyticeLabel, [chryzatemaLabel, staticLabel], [3, 2]), 3);
  const ruzeRate = axiomInput(rate(chryzatemaLabel, 54, entity3, kusEntity), 4);
  const chryzantemaRate = axiomInput(rate(chryzatemaLabel, 40, entity3, kusEntity), 5);
  const staticeRate = axiomInput(rate(chryzatemaLabel, 35, entity3, kusEntity), 6);
  const statice = deduce(
    rozdilRuze,
    RtoS
  );
  const chryzantem = deduce(
    last(statice),
    CHxS,
    nthPart(chryzatemaLabel)
  );
  const ruze = deduce(
    statice,
    rozdilRuze
  );
  const deductionTree = deduce(
    deduce(ruze, ruzeRate),
    deduce(last(statice), staticeRate),
    deduce(chryzantem, chryzantemaRate),
    sum(kyticeLabel, [ruzeLabel, chryzatemaLabel, staticLabel], entity3, entity3)
  );
  return { deductionTree };
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
    deduce(dvojice, diff),
    deduce({ ...cont(usekLabel, 5, emptyEntity), ...deduceLbl(1) }, diff),
    sum(`sou\u010Det \u010Dar`, [], emptyEntity, emptyEntity)
  );
  return { deductionTree };
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
  return deduce(
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
  const area = axiomInput(cont(`plocha ${dumLabel}`, input.baseSurfaceArea, entity2d), 1);
  const pasmo = axiomInput(quota(`plocha ${dumLabel}`, "\u010Dtverec", 4), 2);
  const ctverec = deduce(
    area,
    pasmo
  );
  const strana = to(
    ctverec,
    commonSense(`rozklad na prvo\u010D\xEDsla:${primeFactorization([last(ctverec).quantity]).join(",")}`),
    cont("\u0161\xED\u0159ka", 2, entity3)
  );
  const rectangleVolume = connectTo(volume({ width: last(strana), height: cont("v\xFD\u0161ka", 2, entity3), length: cont("d\xE9lka", 8, entity3) }, { volumeLabel: "objem p\u0159\xEDzem\xED" }), strana);
  const deductionTree = deduce(
    rectangleVolume,
    deduce({ ...last(rectangleVolume), ...deduceLbl(3) }, ratio("objem p\u0159\xEDzem\xED", "objem st\u0159echa", 1 / 2)),
    sum("objem dome\u010Dek", [], entity3d, entity3)
  );
  return { deductionTree };
}

// src/math/percent/base.ts
function percentBase({ part, percentage }, labels = {}) {
  const { baseAgent } = { ...{ baseAgent: "z\xE1klad" }, ...labels };
  const celek = cont(baseAgent, 100, percentage.entity);
  return deduce(
    deduce(
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
  const percentage = axiomInput(ratio("celkem", "zapln\u011Bno", input.zaplnenoPomer), 1);
  const part = axiomInput(cont("zbytek", input.zbyva, entity2), 2);
  const deductionTree = deduce(
    deduce(percentage, ctorComplement("zbytek")),
    part
  );
  return { deductionTree };
}
function objemNadoby2({ input }) {
  const percentage = axiomInput(cont("p\u016Fvodn\u011B zapln\u011Bno", input.zaplnenoProcento, entityPercent2), 1);
  const odebrano = axiomInput(comp("p\u016Fvodn\u011B zapln\u011Bno", "nov\u011B zapln\u011Bno", input.odebrano, entity2), 2);
  const zaplnenoPoOddebrani = axiomInput(ratio("celek", "nov\u011B zapln\u011Bno", input.zaplnenoPoOdebraniRatio), 3);
  const celek = cont("celek", 100, entityPercent2);
  const deductionTree = deduce(deduce(
    deduce(
      percentage,
      deduce(zaplnenoPoOddebrani, celek)
    ),
    odebrano
  ), celek);
  return { deductionTree };
}
function objemNadoby3({ input }) {
  const nadoba1 = axiomInput(cont("n\xE1doba 1", input.nadoba1Procent, entityPercent2), 1);
  const nadoba2 = axiomInput(cont("n\xE1doba 2", input.nadoba2Procent, entityPercent2), 2);
  const nadoba3Perc = axiomInput(cont("n\xE1doba 3", 40, entityPercent2), 2);
  const nadoba3 = axiomInput(cont("n\xE1doba 3", input.nadoba3, entity2), 3);
  const prumer = axiomInput(ratio("n\xE1doba celkem", "napln\u011Bno pr\u016Fm\u011Br", input.prumerNadobaRatio), 4);
  const celek = cont("n\xE1doba celkem", 100, entityPercent2);
  const average = deduce(prumer, celek);
  const nadoba3Percent = deduce(
    to(
      deduce(nadoba1, average),
      transfer("n\xE1doba 3", "n\xE1doba 1", 10, entityPercent2)
    ),
    nadoba3Perc
  );
  return {
    deductionTree: connectTo(percentBase({ part: nadoba3, percentage: last(nadoba3Percent) }), nadoba3Percent)
  };
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

// src/math/M7A-2024/13.ts
function porovnatObsahObdelnikACtverec({ input }) {
  const entity3 = "";
  const unit2d = "cm2";
  const unit = "cm";
  const ctverec = axiomInput(cont("\u010Dtverec a", input.ctverec.a, entity3, unit), 3);
  return {
    deductionTree: deduce(
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
        sum("sou\u010Det", ["a", "b"], entity3, entity3)
      ),
      to(
        rozdil,
        cont("rozd\xEDl", last(rozdil).quantity, entity3)
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

// src/math/M9I-2025/okurky.ts
function okurkyASalaty({ input }) {
  const entity3 = "sazenic";
  const okurkaLabel = "zasazeno okurek";
  const salatLabel = "zasazeno sal\xE1t\u016F";
  const ujaloOkurekLabel = "ujalo okurek";
  const ujaloSalatLabel = "ujalo sal\xE1t\u016F";
  const okurka = axiomInput(cont(okurkaLabel, input.okurky, entity3), 1);
  const salat = deduce(
    okurka,
    comp(salatLabel, okurkaLabel, 4, entity3)
  );
  const dd1 = deduce(
    salat,
    ratio(salatLabel, ujaloSalatLabel, 3 / 4)
  );
  const dd2 = deduce(
    okurka,
    ratio(okurkaLabel, ujaloOkurekLabel, 5 / 6)
  );
  return [{ deductionTree: deduce(dd1, dd2) }, { deductionTree: dd2 }];
}

// src/math/M7A-2024/3.ts
function cislaNaOse({ input }) {
  const entityLength = "d\xE9lka";
  const entity3 = "\xFAsek";
  const mensi = axiomInput(cont("men\u0161\xED zadan\xE9 \u010D\xEDslo", input.mensiCislo, entityLength), 1);
  const vetsi = axiomInput(cont("v\u011Bt\u0161\xED zadnan\xE9 \u010D\xEDslo", input.vetsiCislo, entityLength), 2);
  const pocetUseku = axiomInput(cont("vzd\xE1lenost mezi zadan\xFDmi \u010D\xEDsly", input.pocetUsekuMeziCisly, "\xFAsek"), 3);
  const positionA = axiomInput(cont("posun A", input.A, entity3), 1);
  const positionB = axiomInput(cont("posun B", input.B, entity3), 1);
  const positionC = axiomInput(cont("posun C", input.C, entity3), 1);
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
  const rozdilPostion = deduce(positionB, positionA, ctor("comp-diff"));
  const dd1 = deduce(deduce(positionC, usekRate), mensi, sum("pozice C", [], entityLength, entityLength));
  const dd2 = deduce(deduce(deduce(positionB, last(usekRate)), mensi, sum("pozice B", [], entityLength, entityLength)), mensi, ctor("comp-ratio"));
  const dd3 = deduce(to(rozdilPostion, cont("rozd\xEDl", last(rozdilPostion).quantity, entity3)), last(usekRate));
  return [{ deductionTree: dd1 }, { deductionTree: dd2 }, { deductionTree: dd3 }];
}

// src/math/M9A-2024/angle.ts
function rozdilUhlu({ input }) {
  const entity3 = "";
  const beta = axiomInput(cont("beta", input.beta, entity3), 1);
  const delta = axiomInput(cont("delta", input.delta, entity3), 2);
  const alfa = deduce(delta, compAngle("delta", "alfa", "supplementary"));
  const triangleSum = cont("troj\xFAheln\xEDk", 180, entity3);
  const deductionTree = deduce(
    toCont(deduce(
      triangleSum,
      deduce(
        beta,
        alfa,
        sum("dvojice \xFAhl\u016F v troj\xFAheln\xEDku", ["alfa", "beta"], entity3, entity3)
      ),
      ctor("comp-diff")
    ), { agent: "gama" }),
    last(alfa),
    ctor("comp-diff")
  );
  return { deductionTree };
}

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
        vrcholovyUhel: cont(vrcholovyUhelLabel, last(minUhel).quantity, entity3)
      },
      { uhelRamenoLabel: "gama" }
    )
  );
  return [{ deductionTree: alfa }, { deductionTree: beta }, { deductionTree: gama }];
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
var krabiceParams = { pocetKusuVKrabice: 12, missingVyrobku: 5 };
var osaParams = { mensiCislo: 1.4, vetsiCislo: 5.6, pocetUsekuMeziCisly: 6, A: 4, B: 7, C: -2 };
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
    1.1: porovnatAaB({ input: { a: 1.6, b: -1.2 } }),
    1.2: najitMensiCislo({ input: { zadane: 7 / 8, mensiO: 0.093 } }),
    3.1: cislaNaOse({ input: osaParams })[0],
    3.2: cislaNaOse({ input: osaParams })[1],
    3.3: cislaNaOse({ input: osaParams })[2],
    6: build3({ input: {} }),
    10.1: build4(letniTaborInput)[0],
    10.2: build4(letniTaborInput)[1],
    10.3: build4(letniTaborInput)[2],
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
    8.1: build10({ input: { tangaWidth: 20 } })[0],
    8.2: build10({ input: { tangaWidth: 20 } })[1],
    11: rozdilUhlu({ input: { delta: 107, beta: 23 } }),
    12: example4({ input: { obvod: 30 } }),
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
  },
  "M9I-2025": {
    1: porovnani2Ploch({ input: {} }),
    6.1: okurkyASalaty({ input: { okurky: 36 } })[0],
    6.2: okurkyASalaty({ input: { okurky: 36 } })[1],
    7.1: plnaKrabice({ input: krabiceParams })[0],
    7.2: plnaKrabice({ input: krabiceParams })[1],
    7.3: plnaKrabice({ input: krabiceParams })[2],
    11.1: desetiuhelnik({ input: { pocetUhlu: 10 } })[0],
    11.2: desetiuhelnik({ input: { pocetUhlu: 10 } })[1],
    11.3: desetiuhelnik({ input: { pocetUhlu: 10 } })[2],
    12: kytice({ input: {} }),
    13: caryNaPapire({ input: { pocetCasti: 40 } }),
    14: domecek({ input: { baseSurfaceArea: 16, quota: 4 } }),
    15.1: objemNadoby1({ input: { zbyva: 14, zaplnenoPomer: 3 / 5 } }),
    15.2: objemNadoby2({ input: { zaplnenoProcento: 55, odebrano: 12, zaplnenoPoOdebraniRatio: 1 / 4 } }),
    15.3: objemNadoby3({ input: { nadoba1Procent: 30, nadoba2Procent: 40, nadoba3: 19, prumerNadobaRatio: 2 / 5 } }),
    16.1: letajiciCtverecky({ input: { pocetRad: 21, pocetSloupcu: 110 } })[0],
    16.2: letajiciCtverecky({ input: { pocetRad: 21, pocetSloupcu: 110 } })[1]
  }
};
export {
  word_problems_default as default,
  formatPredicate,
  inferenceRuleWithQuestion
};

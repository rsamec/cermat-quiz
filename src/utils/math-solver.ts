import { Parser } from '../assets/lib/expr-eval/index.js';

const parser = new Parser({
  operators: {
    add: true,
    substract: true,
    divide: true,
    multiply: true,
    power: true,
    remainder: true,

    conditional: true,
    logical: true,
    comparison: true,
  }
});

parser.consts.π = 3.14

parser.functions.gcd = function (...args: number[]) {
  return gcdCalc(args)
}
parser.functions.lcd = function (...args: number[]) {
  return lcdCalc(args)
}
const eps = 0.001;
parser.functions.closeTo = function (value: number, center: number) {
  const start = center - eps;
  const end = center + eps;
  return start <= value && value <= end;
}

function gcdCalc(numbers: number[]) {
  let num = 2, res = 1;
  while (num <= Math.min(...numbers)) {
    if (numbers.every(n => n % num === 0)) {
      res = num;
    }
    num++;
  }
  return res;
}
function lcdCalcEx(a, b) {
  return Math.abs(a * b) / gcdCalc([a, b]);
}
function lcdCalc(numbers: number[]) {
  return numbers.reduce((acc, num) => lcdCalcEx(acc, num), 1);
}

export function evaluate(expression: string, context?: Record<string, any>) {
  return parser.parse(expression).evaluate(context)
}

export function evalExpression(expression: any, quantityOrContext: number | Record<string, any>): string {
  const expr = typeof expression === "string" ? parser.parse(expression) : toEquationExpr(expression);
  const variables = expr.variables();
  const context = typeof quantityOrContext === "number" ? { [variables.length === 1 ? variables : variables[0]]: quantityOrContext } : quantityOrContext;
  
  if (variables.length <= Object.keys(context).length) {
    //throw `Eval only expression with exactly one variable. Variables ${variables.join(",")}`  
    return expr.evaluate(context);
  }
  const res = expr.simplify(context);
  return res.toString();
}

function recurExpr(node) {
  const quantity = node.quantity ?? node.ratio ?? {};
  const { context, expression } = quantity;

  if (expression) {
    let expr = parser.parse(expression);
    const variables = expr.variables();
    // console.log(variables, context)
    for (let variable of variables) {
      const res = recurExpr(context[variable]);

      if (res.substitute != null) {
        // console.log(".....", variable, res.toString())
        expr = expr.substitute(variable, res)
      }
      else {
        const q = res.quantity ?? res.ratio;


        if (typeof q == 'number' || !isNaN(parseFloat(q))) {
          expr = expr.simplify({ [variable]: res })
        }
        else {
          expr = expr.substitute(variable, q)

        }
      }
    }
    return expr;
  }
  else {
    return node;
  }
}
export function toEquation(lastNode) {
  const final = recurExpr(lastNode);
  return parser.parse(cleanUpExpression(final))
}
export function toEquationExpr(lastExpr) {
  const final = recurExpr({ quantity: lastExpr });
  return parser.parse(cleanUpExpression(final))
}


function cleanUpExpression(exp) {
  const replaced = exp.toString()
  .replaceAll(".quantity", "")
  .replaceAll(".ratio", "")
  .replaceAll(".baseQuantity", "")
  return formatNumbersInExpression(replaced)  
}
function formatNumbersInExpression(expr) {
  return expr.replace(/(\d*\.\d+|\d+)/g, (match) => {
    const num = parseFloat(match);
    if (!isNaN(num)) {
      return num.toLocaleString("en", { maximumFractionDigits: 6, minimumFractionDigits: 0 }).replace(/,/g, '')
    }
    return match;
  });
}

export function solveLinearEquation(lhs, rhs, variable = 'x'): number {  
  const expr = `(${typeof lhs === "number" ? lhs : toEquationExpr(lhs)}) - (${typeof rhs === "number" ? rhs : toEquationExpr(rhs)})`;
  const terms = evaluateLinearExpression(expr, variable);

  const a = terms[variable] || 0;
  const b = terms.constant || 0;

  if (a === 0) {
    if (b === 0) throw 'Infinite solutions (identity)';
    else throw 'No solution';
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
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const associativity = { '+': 'L', '-': 'L', '*': 'L', '/': 'L' };

  tokens.forEach(token => {
    if (!isNaN(token) || /^[a-zA-Z]+$/.test(token)) {
      output.push(token);
    } else if ('+-*/'.includes(token)) {
      while (ops.length > 0 && '*/+-'.includes(ops[ops.length - 1])) {
        const top = ops[ops.length - 1];
        if ((associativity[token] === 'L' && precedence[token] <= precedence[top]) ||
          (associativity[token] === 'R' && precedence[token] < precedence[top])) {
          output.push(ops.pop());
        } else break;
      }
      ops.push(token);
    } else if (token === '(') {
      ops.push(token);
    } else if (token === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') {
        output.push(ops.pop());
      }
      ops.pop();
    }
  });

  while (ops.length) output.push(ops.pop());
  return output;
}

function evalRPN(rpn, variable) {
  const stack = [];

  rpn.forEach(token => {
    if (!isNaN(token)) {
      stack.push({ constant: parseFloat(token) });
    } else if (token === variable) {
      stack.push({ [variable]: 1 });
    } else if ('+-*/'.includes(token)) {
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

  if (op === '+') {
    return {
      [variable]: aCoeff + bCoeff,
      constant: aConst + bConst
    };
  }

  if (op === '-') {
    return {
      [variable]: aCoeff - bCoeff,
      constant: aConst - bConst
    };
  }

  if (op === '*') {
    // Multiply (ax + a0) * (bx + b0)
    if (aCoeff !== 0 && bCoeff !== 0) {
      throw new Error('Non-linear term produced — equation must remain linear.');
    }

    return {
      [variable]: aCoeff * bConst + bCoeff * aConst,
      constant: aConst * bConst
    };
  }

  if (op === '/') {
    if (bCoeff !== 0) {
      throw new Error('Division by a variable not supported.');
    }

    return {
      [variable]: aCoeff / bConst,
      constant: aConst / bConst
    };
  }
}
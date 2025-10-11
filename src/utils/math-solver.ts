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
parser.functions.red = function (value: number) {
  return value;
}
parser.functions.blue = function (value: number) {
  return value;
}

parser.functions.color = function (color: 'blue' | 'red', value: number) {
  return value;
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

export function substitute(expression: string, source: string, replace: string) {
  return parser.parse(expression).substitute(source, replace)
}

export function simplify(expression: string, context?: Record<string, any>) {
  return parser.parse(expression).simplify(expression, context)
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

function recurExpr(node, level, requiredLevel = 0) {
  const quantity = node.quantity ?? node.ratio ?? {};
  const { context, expression } = quantity;

  if (expression) {
    let expr = parser.parse(expression);
    const variables = expr.variables();
    //console.log(level, node, quantity, expression.toString(), expr.toString(), variables, context)    
    for (let variable of variables) {
      const res = recurExpr(context[variable], level + 1, requiredLevel);

      //console.log(variable, expr.toString(), level)
      if (res.substitute != null) {
        expr = parser.parse(cleanUpExpression(expr, variable))
        expr = expr.substitute(variable, res)

        if (level >= requiredLevel) {
          expr = expr.simplify()
        }
      }
      else {
        const q = res.quantity ?? res.ratio;
        
        if (typeof q == 'number' || !isNaN(parseFloat(q))) {
          expr = parser.parse(cleanUpExpression(expr, variable))
          if (level >= requiredLevel) {
            expr = expr.simplify({ [variable]: q })
            // console.log(":", variable, q, expr.toString())
          }
          else {
            
            expr = expr.substitute(variable, q);
            // console.log("::", variable, q, expr.toString())
          }
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
  const final = recurExpr(lastNode, 0);
  return parser.parse(cleanUpExpression(final))
}
function toEquationExpr(lastExpr, requiredLevel = 0){
  const final = recurExpr({ quantity: lastExpr }, 0, requiredLevel);
  //console.log("FINAL",final.toString(), lastExpr.toString());
  return parser.parse(cleanUpExpression(final));  
}
export function toEquationExprAsText(lastExpr, requiredLevel = 0) {  
  return expressionToString(toEquationExpr(lastExpr, requiredLevel).tokens, false)
        .replaceAll('"', '');  
}
export function toEquationExprAsTex(lastExpr, requiredLevel = 0) {
  return `$ ${tokensToTex(toEquationExpr(lastExpr, requiredLevel).tokens)} $`
}

function cleanUpExpression(exp, variable = '') {

  const replaced = exp.toString()
    .replaceAll(`${variable}.quantity`, variable)
    .replaceAll(`${variable}.ratio`, variable)
    .replaceAll(`${variable}.baseQuantity`, variable)

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
const colors = ({
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
})

function tokensToTex(tokens, opts = {}) {
  const options = {
    mulSymbol: "\\cdot",   // "\\cdot", " ", "\\times", ""
    divMode: "frac",       // "frac" | "slash"
    stretchyParens: true,
    implicitMul: false,
    ...opts,
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

      case "IOP1": { // unary operator
        const a = stack.pop();
        if (tok.value === "sqrt") {
          stack.push(`\\sqrt{${a}}`);
        }
        else {
          stack.push(`${tok.value}${parens(a)}`);
        }
        break;
      }

      case "IOP2": { // binary operator
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
          stack.push(`${a} ${(texOps[tok.value] || tok.value)} ${b}`);
        }
        break;
      }

      case "IOP3": { // ternary operator ?:
        const c = stack.pop();
        const b = stack.pop();
        const a = stack.pop();
        stack.push(`${a}\\ ?\\ ${b}\\ :\\ ${c}`);
        break;
      }      
      case "FUNCALL":
      case "IFUNCALL": {
        const argCount = tok.value || 0
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
const INUMBER = 'INUMBER';
const IOP1 = 'IOP1';
const IOP2 = 'IOP2';
const IOP3 = 'IOP3';
const IVAR = 'IVAR';
const IVARNAME = 'IVARNAME';
const IFUNCALL = 'IFUNCALL';
const IFUNDEF = 'IFUNDEF';
const IEXPR = 'IEXPR';
const IEXPREVAL = 'IEXPREVAL';
const IMEMBER = 'IMEMBER';
const IENDSTATEMENT = 'IENDSTATEMENT';
const IARRAY = 'IARRAY';
function expressionToString(tokens, toJS) {
  var nstack = [];
  var n1, n2, n3;
  var f, args, argCount;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER) {
      if (typeof item.value === 'number' && item.value < 0) {
        nstack.push('(' + item.value + ')');
      } else if (Array.isArray(item.value)) {
        nstack.push('[' + item.value.map(escapeValue).join(', ') + ']');
      } else {
        nstack.push(escapeValue(item.value));
      }
    } else if (type === IOP2) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = item.value;
      if (toJS) {
        if (f === '^') {
          nstack.push('Math.pow(' + n1 + ', ' + n2 + ')');
        } else if (f === 'and') {
          nstack.push('(!!' + n1 + ' && !!' + n2 + ')');
        } else if (f === 'or') {
          nstack.push('(!!' + n1 + ' || !!' + n2 + ')');
        } else if (f === '||') {
          nstack.push('(function(a,b){ return Array.isArray(a) && Array.isArray(b) ? a.concat(b) : String(a) + String(b); }((' + n1 + '),(' + n2 + ')))');
        } else if (f === '==') {
          nstack.push('(' + n1 + ' === ' + n2 + ')');
        } else if (f === '!=') {
          nstack.push('(' + n1 + ' !== ' + n2 + ')');
        } else if (f === '[') {
          nstack.push(n1 + '[(' + n2 + ') | 0]');
        } else {
          nstack.push('(' + n1 + ' ' + f + ' ' + n2 + ')');
        }
      } else {
        if (f === '[') {
          nstack.push(n1 + '[' + n2 + ']');
        } else {
          nstack.push(n1 + ' ' + f + ' ' + n2);
        }
      }
    } else if (type === IOP3) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = item.value;
      if (f === '?') {
        nstack.push('(' + n1 + ' ? ' + n2 + ' : ' + n3 + ')');
      } else {
        throw new Error('invalid Expression');
      }
    } else if (type === IVAR || type === IVARNAME) {
      nstack.push(item.value);
    } else if (type === IOP1) {
      n1 = nstack.pop();
      f = item.value;
      if (f === '-' || f === '+') {
        nstack.push('(' + f + n1 + ')');
      } else if (toJS) {
        if (f === 'not') {
          nstack.push('(' + '!' + n1 + ')');
        } else if (f === '!') {
          nstack.push('fac(' + n1 + ')');
        } else {
          nstack.push(f + '(' + n1 + ')');
        }
      } else if (f === '!') {
        nstack.push('(' + n1 + '!)');
      } else {
        nstack.push(f + ' ' + n1);
      }
    } else if (type === IFUNCALL) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      f = nstack.pop();
      nstack.push(f + '(' + args.join(', ') + ')');
    } else if (type === IFUNDEF) {
      n2 = nstack.pop();
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      n1 = nstack.pop();
      if (toJS) {
        nstack.push('(' + n1 + ' = function(' + args.join(', ') + ') { return ' + n2 + ' })');
      } else {
        nstack.push('(' + n1 + '(' + args.join(', ') + ') = ' + n2 + ')');
      }
    } else if (type === IMEMBER) {
      n1 = nstack.pop();
      nstack.push(n1 + '.' + item.value);
    } else if (type === IARRAY) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      nstack.push('[' + args.join(', ') + ']');
    } else if (type === IEXPR) {
      nstack.push('(' + expressionToString(item.value, toJS) + ')');
    } else if (type === IENDSTATEMENT) {
      // eslint-disable no-empty
    } else {
      throw new Error('invalid Expression');
    }
  }
  if (nstack.length > 1) {
    if (toJS) {
      nstack = [nstack.join(',')];
    } else {
      nstack = [nstack.join(';')];
    }
  }
  return String(nstack[0]);
}

function escapeValue(v) {
  if (typeof v === 'string') {
    return JSON.stringify(v).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  }
  return v;
}
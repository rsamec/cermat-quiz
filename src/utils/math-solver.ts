import { Parser } from 'expr-eval';

export const parser = new Parser({
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

parser.functions.gcd = function (...args: number[]) {
  return gcdCalc(args)
}
parser.functions.lcd = function (...args: number[]) {
  return lcdCalc(args)
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

export function evaluate(expression: string, context?: Record<string, any>){
  return parser.parse(expression).evaluate(context)
}

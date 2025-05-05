import { parser } from "./math-solver.js";

export function toEquation(lastNode) {
  function recurExpr(node) {
    const quantity = node.quantity ?? node.ratio ?? {};
    const { context, expression } = quantity;

    if (expression) {
      let expr = parser.parse(expression);
      const variables = expr.variables();

      for (let variable of variables) {
        const res = recurExpr(context[variable]);

        if (res.substitute != null) {
          expr = expr.substitute(variable, res)
        }
        else {
          const q = res.quantity ?? res.ratio;

          if (typeof q == 'number') {
            expr = expr.simplify({ [variable]: res })
          }
          else {
            expr = expr.substitute(variable, q)
          }
        }
      }
      console.log(`${node.agent}: ${expr.toString().replaceAll(".quantity","")}`)
      return expr;
    }
    else {
      return node;
    }
  }
  const final = recurExpr(lastNode);
  return parser.parse(formatNumbersInExpression(final.toString().replaceAll(".quantity", "")))
}
function formatNumbersInExpression(expression) {
  // Regex to match all numbers (including decimals)
  const numberPattern = /[-+]?\d*\.\d+|\d+/g;
  
  // Replace each number in the expression, formatted to 2 decimal places
  return expression.replace(numberPattern, (match) => {
      return parseFloat(match).toFixed(2); // Convert and format to two decimal places
  });
}
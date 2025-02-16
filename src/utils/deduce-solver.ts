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
/**
export function jsonToEquations(node, level = 0) {

  const flatStructure = [];
  let counter = 1;
  const deduceMap = new Map()
  function traverseEx(node) {
    const args = []
    // Add node details if they exist
    if (isPredicate(node)) {
      return node;
    }

    // Process children recursively
    if (node.children && Array.isArray(node.children)) {

      for (let i = 0; i != node.children.length; i++) {
        const child = node.children[i];
        const isConclusion = i === node.children.length - 1;

        if (isConclusion && isPredicate(child) && !deduceMap.has(child)) {
          const valueToEval = child.quantity ?? child.ratio;
          const unknown = `${(child.agent ?? 'x').replace(" ", "_")}_${counter++}`;
          deduceMap.set(child, unknown)
        }
        if (isConclusion) {
        }
        const res = traverseEx(child);
        args.push(res)

      }
      // Add a group containing the parent and its children
      const arr = normalizeToArray(args).map(d => {
        return Array.isArray(d) ? d[d.length - 1] : d
      });
      const premises = arr.slice(0, -1);
      //const questions = premises.filter(d => d?.result != null)
      const conclusion = arr[arr.length - 1];

      const valueToEval = conclusion.quantity ?? conclusion.ratio;


      //console.log(newExpression.toString())

      //substitution 
      const newValue = Object.entries(valueToEval.context).reduce((out, [key, value]) => {

        if (deduceMap.has(value)) {
          const quantity = deduceMap.get(value)
          //console.log(quantity);
          //console.log(newExpression.toString(), `${key}.quantity`, quantity.expression)
          out.expression = out.expression.substitute(key, quantity);

        }
        else {
          const quantity = value.quantity ?? value.ratio;
          if (!isQuantity(quantity)) {
            out.expression = out.expression.substitute(key, quantity)
          }
        }


        return out;
      }, {
        ...valueToEval,
        expression: parser.parse(valueToEval.expression),
      })

      flatStructure.push({ ...newValue, ...(deduceMap.has(conclusion) && { result: deduceMap.get(conclusion) }) });
    }

    return args
  }
  traverseEx(node)
  const lastUnknown = deduceMap.values().toArray().findLast(d => true)
  //flatStructure.push({expression: `${lastUnknown}`, context: {last: 0}})

  const results = new Map()
  for (let node of flatStructure) {
    const { expression, context, result } = node;

    //simplify
    const newContextToSimplify = Object.entries(context).reduce((out, [key, value]) => {
      const quantity = value.quantity ?? value.ratio;
      if (isQuantity(quantity)) {
        out[key] = value
      }
      return out;
    }, {})

    results.set(result, expression.simplify(newContextToSimplify).toString().replaceAll(".quantity", ""))
  }


  // const arr = [...results.values()];
  // const res = arr[0];
  // for (let i = 1; i != arr.length - 1; i++) {
  //   res[i] = 
  // }
  //results.set(lastUnknown, `0`)
  console.log(deduceMap)
  console.log(results)
  console.log(`${recursiveReplace(results.get(lastUnknown), results)} = 0`)

  // const final = solve("okurky", results);
  // console.log(final)

  return results;
}

function recursiveReplace(expression, replacementMap) {
  function replace(expr) {
    let prevExpr;
    do {
      prevExpr = expr;
      for (const [key, value] of replacementMap) {
        expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), `${value}`);
      }
    } while (expr !== prevExpr); // Continue until no more changes
    return expr;
  }
  return replace(expression);
}
type Expression = {
  evaluate: (context: any) => number,
  variables: () => string[],
  simplify: (context: any) => Expression
}

function solve(targetVar, equations: Expression[]) {


  function recursiveSolver(targetVar: string, visited: string[]) {
    // Get all equations containing targetVar and not already visited
    let eqs = equations.filter(eq => !visited.includes(eq.toString()) && eq.toString().includes(targetVar.toString()));

    // Sort in increasing order according to number of free symbols
    eqs = eqs.sort((a, b) => a.variables().length - b.variables().length);

    for (let eq of eqs) {
      const freeSymbols = new Set(eq.variables());

      // Can solve for targetVar
      if (freeSymbols.size === 1) {
        const res = eq.evaluate({});
        return res;
      }

      // Cannot solve for targetVar yet
      const otherVars = [...freeSymbols].filter(v => v != targetVar.toString());
      console.log(otherVars, targetVar)
      for (const otherVar of otherVars) {
        const otherVal = recursiveSolver(otherVar, [...visited, eq.toString()]);
        const context = { [otherVar]: otherVal };
        console.log(eq.toString(), context)
        eq = eq.simplify(context);
        console.log(eq.toString())

      }

      // Now check if we can solve for targetVar
      if (new Set(eq.variables()).size === 1) {
        const res = eq.evaluate({});
        return res;
      }
    }

    // Could not solve for targetVar
    return targetVar;
  }
  return recursiveSolver(targetVar, [])
}
 */
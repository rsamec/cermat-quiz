import Fraction from 'fraction.js';
import configureMeasurements from 'convert-units';
import length from 'convert-units/definitions/length';
import area from 'convert-units/definitions/area';
import mass from 'convert-units/definitions/mass'
import volume from 'convert-units/definitions/volume'
import time from 'convert-units/definitions/time'
import { configure, inferenceRuleWithQuestion as IRWQ } from '../components/math.js';

import { solveLinearEquation, evalExpression } from "../utils/math-solver.js";

const convert = configureMeasurements<any, any, any>({
  length,
  area,
  volume,
  mass,
  time,
});

configure({
  convertToFraction: (d: number) => new Fraction(d).toFraction(),
  convertToUnit: (d, from, to) => convert(d).from(from).to(to),
  unitAnchor: (unit) => convert().getUnit(unit)?.unit?.to_anchor,
  solveLinearEquation: (first, second, variable) => solveLinearEquation(first, second, variable),
  evalExpression: (expression, quantity: number) => evalExpression(expression,quantity)
})

//re export
export const inferenceRuleWithQuestion = IRWQ;


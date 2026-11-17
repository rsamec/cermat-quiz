import path from 'path';
import {readJsonFromFile} from '../utils/file.utils.js';

const merge = (f,s) => {
  return Object.keys(s).reduce((merged, key) => {
    merged[key] = {...f[key], ...s[key]}
    return merged;
  }, {...f})
}
const expressions = await readJsonFromFile(path.resolve('./src/cermat/math-answers.json'))
const geometry = await readJsonFromFile(path.resolve('./src/cermat/math-geometry.json'))

const result = Object.keys(geometry).reduce((merged, key) => {
  merged[key] = merge(expressions[key] ?? {},geometry[key])
  return merged;
}, {...expressions})

process.stdout.write(JSON.stringify(result, null, 2));

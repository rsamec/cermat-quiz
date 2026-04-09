import { parseArgs } from "node:util";
import { readJsonFromFile} from '../utils/file.utils.js'
import path from "node:path";
import {merge} from './utils.js'

const {
  values: { code }
} = parseArgs({
  options: {
    code: { type: "string" },
  }
});

const expressionArtifacts = await readJsonFromFile(path.resolve('./src/data/math-answers.json'))
const videoExlusions = await readJsonFromFile(path.resolve('./src/data/math-answers-video-exclude.json'))
const geometryArtifacts = await readJsonFromFile(path.resolve('./src/data/math-geometry.json'))

const allArtifacts = Object.keys(geometryArtifacts).reduce((merged, key) => {
  merged[key] = merge(expressionArtifacts[key] ?? {}, geometryArtifacts[key])
  return merged;
}, { ...expressionArtifacts })

const artifacts = allArtifacts[code] ?? {}
const excludedKeys = Object.keys(videoExlusions[code] ?? {});

const groupedArtifacts = Object.groupBy(Object.entries(artifacts).filter(([key]) => !excludedKeys.includes(key)), ([key,value]) => parseInt(key.split(".")[0]));

process.stdout.write(JSON.stringify(groupedArtifacts));




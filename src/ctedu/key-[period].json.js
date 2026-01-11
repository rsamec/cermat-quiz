import { parseArgs } from "node:util";
import path from 'path';
import vm from 'node:vm';
import { readTextFromFile } from "../utils/file.utils.js";
import * as esbuild from 'esbuild';

const {
  values: { period }
} = parseArgs({
  options: { period: { type: "string" } }
});

const ctEduPath = path.resolve(`./src/ctedu`);

async function buildTS(tsSource) {
  const result = await esbuild.build({
    stdin: {
      contents: tsSource,
      // loader: 'ts',
      // sourcefile: 'virtual.ts',
      resolveDir:`${ctEduPath}/${period}`
    },
    bundle: true,
    // format: 'esm',
    platform: 'neutral',
    // target: 'node18',
    write: false,        // 🔑 in memory
  });
  const jsCode = result.outputFiles[0].text;
  return jsCode;
}
async function executeESM(jsCode) {
  const context = vm.createContext({
    console,
  });

  const module = new vm.SourceTextModule(jsCode, {
    context,
    initializeImportMeta(meta) {
      meta.url = 'file:///virtual.ts';
    },
  });

  const allowed = new Set([
    '../../utils/quiz-builder',
    'node:path',
  ]);

  await module.link(async (specifier) => {
    if (allowed.has(specifier)) {
      return await import(specifier);
    }
    throw new Error(`Blocked import: ${specifier}`);
  });

  await module.evaluate();

  return module.namespace.default;
}

const content = await readTextFromFile(path.resolve(ctEduPath, `${period}/key.ts`));
const compiled = await buildTS(content);
const result = await executeESM(compiled);
process.stdout.write(JSON.stringify(result))


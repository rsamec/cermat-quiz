import vm from 'node:vm';
import * as esbuild from 'esbuild';

export async function buildTS(tsSource, resolveDir) {
  const result = await esbuild.build({
    stdin: {
      contents: tsSource,
      // loader: 'ts',
      // sourcefile: 'virtual.ts',
      resolveDir
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
export async function executeESM(jsCode) {
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
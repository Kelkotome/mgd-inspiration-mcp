// Node ESM hook: lets tests import src/*.js files that do `import X from "./file.json"` (wrangler bundles those natively).
export async function load(url, context, next) {
  if (url.endsWith(".json")) {
    const { readFile } = await import("node:fs/promises");
    const src = await readFile(new URL(url), "utf8");
    return { format: "module", source: `export default ${src};`, shortCircuit: true };
  }
  return next(url, context);
}

export async function load(url, context, next) {
  if (url.endsWith(".json") || url.endsWith(".html")) {
    const { readFile } = await import("node:fs/promises");
    const src = await readFile(new URL(url), "utf8");
    return { format: "module", source: url.endsWith(".json") ? `export default ${src};` : `export default ${JSON.stringify(src)};`, shortCircuit: true };
  }
  return next(url, context);
}

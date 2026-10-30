// Build a Worker-safe ES module of the official @google/design.md@0.4.0 linter (no node: built-ins, no fs, no child_process).
import fs from "fs"; import path from "path"; import { build } from "esbuild";
const D = "node_modules/@google/design.md";
let src = fs.readFileSync(`${D}/dist/linter/index.js`, "utf8");
const yaml = fs.readFileSync(`${D}/dist/linter/spec-config.yaml`, "utf8");
const subs = [
  ['import { createRequire } from "node:module";', 'import __shimRequire from "./shims/require.js";'],
  ['var __require = /* @__PURE__ */ createRequire(import.meta.url);', 'var __require = __shimRequire;'],
  ['const currentDir = dirname(fileURLToPath2(import.meta.url));', 'const currentDir = "/";'],
  ['const raw = import_yaml2.parse(readFileSync(yamlPath, "utf-8"));', 'const raw = import_yaml2.parse(__SPEC_CONFIG_YAML__); void yamlPath; // spec-config.yaml inlined at build time'],
];
for (const [a, b] of subs) { if (src.split(a).length !== 2) throw new Error("patch anchor not found exactly once: " + a); src = src.replace(a, b); }
src = `const __SPEC_CONFIG_YAML__ = ${JSON.stringify(yaml)};\n` + src;
fs.writeFileSync("patched-linter.mjs", src);
fs.writeFileSync("entry.mjs", `import { lint as _lint, contrastRatio } from "./patched-linter.mjs";
/** lint(markdownText) → { findings, summary, sections } — the official DESIGN.md linter (spec ${"${"}version}). */
export function lint(markdownText) { const r = _lint(String(markdownText)); return { findings: r.findings, summary: r.summary, sections: r.sections }; }
export function lintReport(markdownText) { return _lint(String(markdownText)); }
export { contrastRatio };
`);
const alias = { "node:path": "./shims/path.js", "node:process": "./shims/process.js", "node:url": "./shims/url.js", "node:fs": "./shims/fs.js" };
const r = await build({ entryPoints: ["entry.mjs"], bundle: true, format: "esm", platform: "neutral", target: "es2022", outfile: "build/designmd-lint-bundle.mjs",
  alias, minify: false, legalComments: "inline", treeShaking: true, metafile: true, logLevel: "warning", mainFields: ["module", "main"] });
const out = fs.readFileSync("build/designmd-lint-bundle.mjs", "utf8");
const bad = (out.match(/from\s*["']node:[^"']+["']|import\(["']node:|require\(["'](fs|child_process|node:[^"']+)["']\)|\bchild_process\b|\breadFileSync\s*\(\s*yamlPath/g) || []);
console.log("bytes", out.length, "node/fs/child_process hits:", bad);

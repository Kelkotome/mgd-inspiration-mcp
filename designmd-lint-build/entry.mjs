import { lint as _lint, contrastRatio } from "./patched-linter.mjs";
/** lint(markdownText) → { findings, summary, sections } — the official DESIGN.md linter (spec ${version}). */
export function lint(markdownText) { const r = _lint(String(markdownText)); return { findings: r.findings, summary: r.summary, sections: r.sections }; }
export function lintReport(markdownText) { return _lint(String(markdownText)); }
export { contrastRatio };

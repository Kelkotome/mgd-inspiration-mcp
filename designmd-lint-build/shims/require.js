import process from "./process.js";
const mods = { process, buffer: { Buffer: undefined }, tty: { isatty: () => false },
  util: { inspect: v => { try { return JSON.stringify(v); } catch (e) { return String(v); } }, formatWithOptions: (o, ...a) => a.map(String).join(" "), format: (...a) => a.map(String).join(" "), deprecate: f => f } };
export default function shimRequire(id) { const k = String(id).replace(/^node:/, ""); if (k in mods) return mods[k]; throw new Error("module not available in this bundle: " + id); }

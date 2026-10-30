const p = { env: {}, argv: [], platform: "neutral", version: "", versions: {}, stderr: { fd: 2 }, stdout: { fd: 1 }, cwd: () => "/", emitWarning: () => {}, nextTick: (f, ...a) => Promise.resolve().then(() => f(...a)) };
export default p; export const env = p.env, cwd = p.cwd, emitWarning = p.emitWarning;

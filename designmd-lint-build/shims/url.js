export function fileURLToPath(u) { return decodeURIComponent(String(u && u.href || u).replace(/^file:\/\//, "")); }
export default { fileURLToPath };

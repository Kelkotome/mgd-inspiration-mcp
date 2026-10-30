function norm(s) { const abs = s.startsWith("/"), out = []; for (const seg of s.split("/")) { if (!seg || seg === ".") continue; if (seg === "..") out.pop(); else out.push(seg); } return (abs ? "/" : "") + out.join("/") || (abs ? "/" : "."); }
const path = { sep: "/", join: (...a) => norm(a.filter(Boolean).join("/")), resolve: (...a) => norm("/" + a.filter(Boolean).join("/")),
  dirname: s => { const i = String(s).lastIndexOf("/"); return i <= 0 ? (i === 0 ? "/" : ".") : s.slice(0, i); },
  basename: (s, ext) => { let b = String(s).split("/").pop(); if (ext && b.endsWith(ext)) b = b.slice(0, -ext.length); return b; },
  extname: s => { const b = String(s).split("/").pop(), i = b.lastIndexOf("."); return i > 0 ? b.slice(i) : ""; } };
export default path; export const sep = path.sep, join = path.join, resolve = path.resolve, dirname = path.dirname, basename = path.basename, extname = path.extname;

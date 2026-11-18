// MCP r7 (18-Nov-2026): accent folding for every text search. "Hammershoi" found nothing while "Hammershøi" found 8 works (a user
// retried 10 times). Two parts:
//   fold(s)            → the plain-letter spelling: é ü ç ñ ř å (NFD marks) are stripped, and the letters NFD cannot split are mapped
//                        (ø→o, æ→ae, œ→oe, ß→ss, ł→l, đ/ð→d, þ→th, ı→i). Used on BOTH the query and the matched text when ranking in JS.
//   accentVariants(w)  → for one folded word, the accented spellings the FTS index keeps as separate tokens. The index tokenizer
//                        (unicode61 remove_diacritics 2) already folds the NFD marks, so "muller" matches "Müller" and "dvorak" matches
//                        "Dvořák"; it keeps ø æ œ ß ł đ ð þ ı as they are ("hammershøi", "straß", "łodz" are index terms). The FTS
//                        query ORs these few variants per word, so it stays ONE D1 statement per tier: no extra round trip, no
//                        per-row work in D1 (each variant is one index lookup, almost always empty).
// Pure functions (no D1, no Worker APIs) so tests/test_r7.mjs can test them directly.
const SPECIAL = { "ø": "o", "Ø": "O", "æ": "ae", "Æ": "AE", "œ": "oe", "Œ": "OE", "ß": "ss", "ẞ": "SS", "ł": "l", "Ł": "L",
  "đ": "d", "Đ": "D", "ð": "d", "Ð": "D", "þ": "th", "Þ": "TH", "ı": "i", "ħ": "h", "Ħ": "H", "ŧ": "t", "Ŧ": "T" };
const SPECIAL_RE = /[øØæÆœŒßẞłŁđĐðÐþÞıħĦŧŦ]/g;
const NON_ASCII = /[^\x00-\x7f]/;
export function fold(s) {
  const t = String(s == null ? "" : s);
  if (!NON_ASCII.test(t)) return t;   // plain ASCII (almost every query and row): nothing to do
  return t.replace(SPECIAL_RE, (c) => SPECIAL[c]).normalize("NFKD").replace(/[̀-ͯ]/g, "");
}
export const foldLower = (s) => fold(s).toLowerCase();
export const hasSpecial = (s) => { SPECIAL_RE.lastIndex = 0; const r = SPECIAL_RE.test(String(s || "")); SPECIAL_RE.lastIndex = 0; return r; };

// Plain spelling → accented letter, in priority order (the cap keeps the most likely ones). Single substitutions first, then pairs
// ("aero" → "ærø"). Only words of 4+ letters: short words would pick up unrelated index terms.
const EXP = [["oe", "ø"], ["ae", "æ"], ["ss", "ß"], ["o", "ø"], ["oe", "œ"], ["th", "þ"], ["l", "ł"], ["d", "đ"], ["i", "ı"], ["d", "ð"]];
export const VARIANT_MAX = 12;
export function accentVariants(word, max = VARIANT_MAX) {
  const w = foldLower(word);
  if (w.length < 4 || !/^[a-z0-9]+$/.test(w)) return [];
  const subs = [];
  EXP.forEach(([from, to], pri) => { for (let i = w.indexOf(from); i >= 0; i = w.indexOf(from, i + 1)) subs.push({ i, len: from.length, to, pri }); });
  if (!subs.length) return [];
  subs.sort((a, b) => a.pri - b.pri || a.i - b.i);
  const apply = (list) => { let s = w; for (const x of [...list].sort((a, b) => b.i - a.i)) s = s.slice(0, x.i) + x.to + s.slice(x.i + x.len); return s; };
  const out = new Set();
  for (const x of subs) { if (out.size >= max) break; out.add(apply([x])); }
  for (let a = 0; a < subs.length && out.size < max; a++)
    for (let b = a + 1; b < subs.length && out.size < max; b++) {
      const x = subs[a], y = subs[b];
      if (x.i < y.i + y.len && y.i < x.i + x.len) continue;   // overlapping ("oe" and "o" at the same place)
      out.add(apply([x, y]));
    }
  out.delete(w);
  return [...out];
}
// Every spelling to look up for one query word: as typed, folded, and the accented variants of the folded form.
export function wordForms(word, max = VARIANT_MAX) {
  const w = String(word || "").toLowerCase(), f = foldLower(w);
  return [...new Set([w, f, ...accentVariants(f, max)])].filter(Boolean);
}

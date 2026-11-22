// App boards Phase 1 (23-Nov-2026): pure parts of src/app_boards.js — validation (every cap, types, filter), Markdown brief, id parsing.
// The HTTP/D1 side is covered by tests/app_boards_rpc.py on wrangler dev (tests/app_boards_local_e2e.sh).
// Run: node --experimental-default-type=module tests/test_app_boards.mjs  (exit 0 = pass)
import { validateBoard, validationError, boardMarkdown, appBoardIdFrom, APP_BOARD_LIMITS as L, APP_BOARD_EXPIRY_DAYS, APP_BOARD_TOOL } from "../src/app_boards.js";
let n = 0, fail = 0;
const t = (name, cond, info) => { n++; if (!cond) { fail++; console.log("FAIL", name, info === undefined ? "" : JSON.stringify(info).slice(0, 300)); } else console.log("PASS", name); };
const v = (b) => { try { return { ok: validateBoard(b) }; } catch (e) { return { err: validationError(e) || { thrown: String(e) } }; } };
const field = (b) => (v(b).err || {}).field;
const x = (k) => "a".repeat(k);  // not "x": a run of x is an adult term since 23-Nov (xxx)
const base = { title: "T", notes: "", items: [] };

// ---- happy path + normalisation
const good = v({ title: "  Wine   bar  ", notes: "line 1\r\nline 2\n\n\n\nline 3", items: [
  { kind: "library", id: "AAAAAAAAAAA1", note: "love it" },
  { kind: "palette", hexes: ["#ff0000", "#00Ff00"], source: "wheel", mode: "Complementary", note: "warm" },
  { kind: "colour", hex: "#abcdef" }, { kind: "font", family: "Playfair Display", weight: 700, licence: "SIL Open Font License 1.1", sample: "Hello" },
  { kind: "note", text: "Card\ntext" }, { kind: "library", id: "aaaaaaaaaaa2", extra: "ignored" }] });
t("valid board accepted", good.ok, good.err);
const g = good.ok || { items: [] };
t("title spaces collapsed, notes keep max 2 newlines", g.title === "Wine bar" && g.notes === "line 1\nline 2\n\nline 3", [g.title, g.notes]);
t("library id lower-cased, unknown keys dropped", g.items[0] && g.items[0].id === "aaaaaaaaaaa1" && !("extra" in g.items[5]), g.items);
t("hexes stored upper-case; mode lower-case", g.items[1] && g.items[1].hexes.join() === "#FF0000,#00FF00" && g.items[1].mode === "complementary" && g.items[2].hex === "#ABCDEF");
t("font licence full name kept as free text", g.items[3] && g.items[3].licence === "SIL Open Font License 1.1");
t("empty title → 'Untitled board'", (v({ items: [] }).ok || {}).title === "Untitled board");
t("control + bidi-override characters removed", (v({ title: "a\u0000b‮c" }).ok || {}).title === "a b c");

// ---- every cap: limit passes, limit+1 fails with the right field and the limit in the message
const cap = (name, mk, lim, f) => {
  const a = v(mk(lim)), b = v(mk(lim + 1));
  t(`cap ${name}: ${lim} ok, ${lim + 1} → 400 field ${f}`, a.ok && b.err && b.err.field === f && String(b.err.error).includes(String(lim)), [a.err, b.err]);
};
cap("title", (k) => ({ ...base, title: x(k) }), L.title, "title");
cap("notes", (k) => ({ ...base, notes: x(k) }), L.notes, "notes");
cap("item note", (k) => ({ ...base, items: [{ kind: "colour", hex: "#000000", note: x(k) }] }), L.itemNote, "items[0].note");
cap("note card", (k) => ({ ...base, items: [{ kind: "note", text: x(k) }] }), L.noteText, "items[0].text");
cap("sample", (k) => ({ ...base, items: [{ kind: "font", family: "Inter", sample: x(k) }] }), L.sample, "items[0].sample");
cap("family", (k) => ({ ...base, items: [{ kind: "font", family: x(k) }] }), L.family, "items[0].family");
cap("licence", (k) => ({ ...base, items: [{ kind: "font", family: "Inter", licence: x(k) }] }), L.licence, "items[0].licence");
cap("items", (k) => ({ ...base, items: Array.from({ length: k }, () => ({ kind: "colour", hex: "#123456" })) }), L.items, "items");
t("notes 2000 chars (the app's own cap) → 400 notes, says 500", field({ ...base, notes: x(2000) }) === "notes" && /500/.test(v({ ...base, notes: x(2000) }).err.error));
t("length counts characters, not bytes (80 × 'é' ok)", v({ ...base, title: "é".repeat(80) }).ok);
const hx = (k) => ({ ...base, items: [{ kind: "palette", hexes: Array.from({ length: k }, () => "#112233") }] });
t("hexes: 1 → 400, 2 ok, 12 ok, 13 → 400", field(hx(1)) === "items[0].hexes" && v(hx(2)).ok && v(hx(12)).ok && field(hx(13)) === "items[0].hexes");
t("item note on a note card is ignored, text required", v({ ...base, items: [{ kind: "note", text: "a", note: x(999) }] }).ok && field({ ...base, items: [{ kind: "note", text: "  " }] }) === "items[0].text");

// ---- types / formats
const F = [
  [{ ...base, items: [{ kind: "library", id: "xyz" }] }, "items[0].id"], [{ ...base, items: [{ kind: "library", id: "https://example.com/a.jpg" }] }, "items[0].id"],
  [{ ...base, items: [{ kind: "image", url: "https://evil.example/x.jpg" }] }, "items[0].kind"], [{ ...base, items: [{ kind: "upload" }] }, "items[0].kind"],
  [{ ...base, items: [{ kind: "palette", hexes: ["#112233", "red"] }] }, "items[0].hexes[1]"], [{ ...base, items: [{ kind: "palette", hexes: ["#112233", "#11223"] }] }, "items[0].hexes[1]"],
  [{ ...base, items: [{ kind: "palette", hexes: "#112233" }] }, "items[0].hexes"], [{ ...base, items: [{ kind: "palette", hexes: ["#112233", "#445566"], source: "camera" }] }, "items[0].source"],
  [{ ...base, items: [{ kind: "palette", hexes: ["#112233", "#445566"], mode: "<b>" }] }, "items[0].mode"],
  [{ ...base, items: [{ kind: "colour", hex: "#GGGGGG" }] }, "items[0].hex"], [{ ...base, items: [{ kind: "font" }] }, "items[0].family"],
  [{ ...base, items: [{ kind: "font", family: "Inter", weight: 450.5 }] }, "items[0].weight"], [{ ...base, items: [{ kind: "font", family: "Inter", weight: 5000 }] }, "items[0].weight"],
  [{ ...base, items: ["#112233"] }, "items[0]"], [{ ...base, items: {} }, "items"], [{ ...base, title: 5 }, "title"], [{ ...base, notes: ["x"] }, "notes"], [[], "body"], [null, "body"],
];
F.forEach(([b, f], i) => t(`format ${i}: → field ${f}`, field(b) === f, v(b).err));

// ---- text filter on every free-text field → text_not_allowed + field
const bad = "cheap viagra";
const TF = [
  [{ ...base, title: bad }, "title"], [{ ...base, notes: bad }, "notes"], [{ ...base, items: [{ kind: "library", id: "aaaaaaaaaaa1", note: bad }] }, "items[0].note"],
  [{ ...base, items: [{ kind: "note", text: bad }] }, "items[0].text"], [{ ...base, items: [{ kind: "font", family: "Inter", sample: bad }] }, "items[0].sample"],
  [{ ...base, items: [{ kind: "font", family: bad }] }, "items[0].family"], [{ ...base, items: [{ kind: "colour", hex: "#000000" }, { kind: "palette", hexes: ["#000000", "#FFFFFF"], note: bad }] }, "items[1].note"],
];
TF.forEach(([b, f]) => { const e = v(b).err || {}; t(`filter rejects ${f}`, e.error === "text_not_allowed" && e.field === f, e); });
t("filter accepts design words (nude palette, Sex Pistols)", v({ ...base, title: "Nude palette", notes: "Sex Pistols poster vibes" }).ok);

// ---- Markdown brief
const h = { escHtml: (s) => s, rowToItem: (r) => ({ id: r.id, title: r.title, source: r.src, collection: r.collection }), itemPage: (r) => `https://madegooddesigns.com/inspiration/#i/${r.id}` };
const rb = { b: { title: "## Fake\nheading", notes: "# not a heading\nSee https://a.example" }, byId: { aaaaaaaaaaa1: { id: "aaaaaaaaaaa1", title: "Retro poster", src: "example.com", collection: "design" } },
  items: [...g.items, { kind: "palette", hexes: ["#FF0000", "#123456"], source: "photo" }, { kind: "library", id: "bbbbbbbbbbbb" }] };
const md = boardMarkdown(rb, "https://madegooddesigns.com/inspiration/app-board/abcdefghijklmn", h);
t("md: contextPack headings in order", /^# Moodboard: /.test(md) && md.indexOf("## Notes") < md.indexOf("## Palette") && md.indexOf("## Palette") < md.indexOf("## Fonts") && md.indexOf("## Fonts") < md.indexOf("## Images"), md);
t("md: palette deduped, upper-case, css vars", md.includes("- #FF0000\n- #00FF00\n- #ABCDEF\n- #123456") && md.includes("--color-4: #123456;") && md.includes("Source: complementary harmony from the colour wheel; colours picked from a photo."), md);
t("md: font line with weight, licence (full name → free Google Font), specimen link, sample", md.includes("- **Playfair Display** (Bold 700). SIL Open Font License 1.1, free Google Font. https://fonts.google.com/specimen/Playfair+Display") && md.includes('Sample text: "Hello"'), md);
t("md: images with credit + page link + note; unknown library id skipped", md.includes("- Retro poster (example.com): https://madegooddesigns.com/inspiration/#i/aaaaaaaaaaa1\n  Note: love it") && !md.includes("bbbbbbbbbbbb"), md);
t("md: creator text cannot fake headings", !/^## Fake/m.test(md) && md.includes("\\# not a heading") && md.includes("# Moodboard: ## Fake heading") === false && md.includes("# Moodboard: \\## Fake heading"), md.slice(0, 200));
t("md: board link + note card bullets", md.includes("Board link: https://madegooddesigns.com/inspiration/app-board/abcdefghijklmn") && md.includes("- Card\n  text"), md);
t("md: other licence text shown as Licence: …", boardMarkdown({ b: { title: "E" }, items: [{ kind: "font", family: "Futura", licence: "Commercial (Adobe Fonts)" }], byId: {} }, "u", h).includes("**Futura**. Licence: Commercial (Adobe Fonts). https://fonts.google.com/specimen/Futura"));
t("md: empty board", boardMarkdown({ b: { title: "E", notes: "" }, items: [], byId: {} }, "u", h).includes("_This board is empty so far._"));
t("md: O/A/U code maps to the licence name + free Google Font", boardMarkdown({ b: { title: "E" }, items: [{ kind: "font", family: "Inter", licence: "O" }], byId: {} }, "u", h).includes("SIL Open Font License 1.1, free Google Font."));

// ---- ids, constants, tool
t("board id from URL / bare id / junk", appBoardIdFrom("https://madegooddesigns.com/inspiration/app-board/abcdefghijklmn?x=1") === "abcdefghijklmn" && appBoardIdFrom("ABCDEFGHIJKLMN") === "abcdefghijklmn" && appBoardIdFrom("abc") === null && appBoardIdFrom("https://madegooddesigns.com/inspiration/board/abcdefghijklmn") === null);
t("expiry window is a 12-month constant", APP_BOARD_EXPIRY_DAYS === 365);
t("get_shared_board schema: board_id required, read-only", APP_BOARD_TOOL.inputSchema.required[0] === "board_id" && APP_BOARD_TOOL.annotations.readOnlyHint === true && APP_BOARD_TOOL.description.length < 1024);
t("caps match the contract", L.items === 60 && L.bodyBytes === 32768 && L.title === 80 && L.notes === 500 && L.itemNote === 200 && L.noteText === 500 && L.sample === 120 && L.hexMin === 2 && L.hexMax === 12 && L.family === 80 && L.newPerDay === 20 && L.updatesPerDay === 200);

console.log(`${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);

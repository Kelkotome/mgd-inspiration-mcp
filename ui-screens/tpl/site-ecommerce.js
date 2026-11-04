/* E-commerce store website template (commerce family: Juniper Supply, an online store for home and kitchen goods).
   Full responsive store home page: announcement bar, nav with search + cart count, campaign hero, shop-by-category tiles,
   best-sellers grid (price, rating, swatches, add to cart), bundle band, store facts (shipping/returns), reviews,
   newsletter, footer. Product "photos" are inline SVG still lifes in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.ec-bar{background:var(--text);color:var(--bg);font-size:13px}
.ec-bar .sk-wrap{display:flex;justify-content:space-between;align-items:center;gap:16px;height:40px}
.ec-bar b{font-weight:600}
.ec-bar span:last-child{opacity:.8}
.ec-search{display:flex;align-items:center;gap:8px;height:42px;width:260px;padding:0 14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--muted);font-size:14px}
.ec-cart{display:inline-flex;align-items:center;gap:8px}
.ec-count{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:var(--on-primary);color:var(--primary);font:700 12px var(--font-b)}
.ec-mcart{display:none}
.ec-hero{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:20px;padding-top:28px;padding-bottom:72px}
.ec-hero-main{position:relative;min-height:560px;display:flex;align-items:flex-end;padding:28px}
.ec-hero-main>svg{position:absolute;inset:0;width:100%;height:100%}
.ec-hero-copy{position:relative;max-width:460px;padding:30px;display:grid;gap:14px;justify-items:start;background:var(--bg);border-radius:var(--radius-lg);box-shadow:var(--shadow)}
.ec-hero-side{display:grid;grid-template-rows:minmax(0,1fr) minmax(0,1fr);gap:20px}
.ec-hero-tile{position:relative;min-height:0}
.ec-hero-tile>svg{position:absolute;inset:0;width:100%;height:100%}
.ec-hero-tile .ec-tile-copy{position:absolute;left:20px;bottom:20px;right:20px;display:flex;justify-content:space-between;align-items:flex-end;gap:12px;padding:16px 18px;border-radius:var(--radius);background:color-mix(in oklab,var(--bg) 92%,transparent)}
.ec-cats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:16px}
.ec-cat{display:grid;gap:10px;justify-items:center;text-align:center}
.ec-cat .sk-photo{width:100%;aspect-ratio:1;border-radius:50%}
.ec-cat b{font-weight:600}
.ec-cat span{font-size:13px;color:var(--muted)}
.ec-filters{display:flex;gap:8px;flex-wrap:wrap}
.ec-chip{height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--border);display:inline-flex;align-items:center;font-weight:600;font-size:13px;background:var(--bg)}
.ec-chip.on{background:var(--text);color:var(--bg);border-color:var(--text)}
.ec-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px 24px}
.ec-prod{display:grid;gap:10px;align-content:start}
.ec-prod .sk-photo{aspect-ratio:4/5;border-radius:var(--radius)}
.ec-prod h3{font:600 15px/1.35 var(--font-b)}
.ec-badge{position:absolute;left:12px;top:12px}
.ec-fav{position:absolute;right:12px;top:12px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--bg);color:var(--text)}
.ec-meta{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13px;color:var(--muted)}
.ec-stars{display:inline-flex;align-items:center;gap:4px;color:var(--text)}
.ec-sw{display:flex;gap:6px}
.ec-sw i{width:16px;height:16px;border-radius:50%;border:1px solid color-mix(in oklab,var(--text) 25%,transparent);display:block}
.ec-sw i.on{outline:2px solid var(--text);outline-offset:2px}
.ec-price{display:flex;align-items:baseline;gap:8px}
.ec-price s{color:var(--muted);font-size:13px}
.ec-bundle{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:0;overflow:hidden;padding:0;border-radius:var(--radius-lg)}
.ec-bundle .sk-photo{border-radius:0;min-height:100%}
.ec-bundle-copy{padding:56px;display:grid;gap:18px;align-content:center;justify-items:start}
.ec-bundle-list{list-style:none;display:grid;gap:10px;width:100%}
.ec-bundle-list li{display:flex;justify-content:space-between;gap:16px;padding-bottom:10px;border-bottom:1px solid color-mix(in oklab,var(--bg) 22%,transparent)}
.ec-bundle-list li span:last-child{opacity:.75}
.ec-facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--bg)}
.ec-fact{padding:28px;display:grid;gap:8px;align-content:start}
.ec-fact+.ec-fact{border-left:1px solid var(--border)}
.ec-fact .ec-ico{width:40px;height:40px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--surface));color:var(--text)}
.ec-fact p{font-size:14px;color:var(--muted)}
.ec-revs{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,2fr);gap:48px;align-items:start}
.ec-score{display:grid;gap:14px;align-content:start}
.ec-hist{display:grid;gap:6px;font-size:13px;color:var(--muted)}
.ec-hist div{display:grid;grid-template-columns:28px minmax(0,1fr) 40px;gap:10px;align-items:center}
.ec-hist i{display:block;height:8px;border-radius:999px;background:color-mix(in oklab,var(--text) 10%,transparent);overflow:hidden}
.ec-hist i b{display:block;height:100%;background:var(--text)}
.ec-rev{padding:24px;display:grid;gap:12px;align-content:start}
.ec-rev q{quotes:"\\201C" "\\201D";font-size:15px}
.ec-rev .ec-item{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--muted);padding-top:12px;border-top:1px solid var(--border)}
.ec-rev .ec-item .sk-photo{width:36px;height:36px;border-radius:var(--radius-sm);flex:none}
.ec-news{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px;align-items:center;padding:48px}
.ec-news form{display:grid;gap:12px}
.ec-news .sk-row{flex-wrap:nowrap}
.ec-news .sk-row .sk-input{flex:1}
@media (max-width:1024px){
  .ec-search{width:180px}
  .ec-cats{grid-template-columns:repeat(3,minmax(0,1fr))}
  .ec-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ec-facts{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ec-fact:nth-child(3){border-left:0}
  .ec-fact:nth-child(n+3){border-top:1px solid var(--border)}
}
@media (max-width:760px){
  .ec-bar .sk-wrap{justify-content:center;height:36px;font-size:12px}
  .ec-bar span:last-child{display:none}
  .ec-mcart{display:inline-flex;align-items:center;gap:6px;margin-left:auto;height:42px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius);font-weight:600;font-size:14px}
  .ec-mcart+.sk-menu{margin-left:0}
  .ec-mcart .ec-count{background:var(--primary);color:var(--on-primary)}
  .ec-hero{grid-template-columns:minmax(0,1fr);gap:14px;padding-top:16px;padding-bottom:44px}
  .ec-hero-main{min-height:0;display:grid;padding:0;background:transparent;overflow:visible}
  .ec-hero-main>svg{position:static;aspect-ratio:4/3;height:auto}
  .ec-hero-copy{position:static;max-width:none;padding:22px 2px 6px;box-shadow:none;background:transparent}
  .ec-hero-side{grid-template-rows:none;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}
  .ec-hero-tile{aspect-ratio:1}
  .ec-hero-tile .ec-tile-copy{left:8px;right:8px;bottom:8px;padding:10px;display:grid;gap:2px}
  .ec-hero-tile .ec-tile-copy .btn{display:none}
  .ec-cats{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 10px}
  .ec-cat>span:last-child{display:none}
  .ec-filters{flex-wrap:nowrap;overflow-x:auto;max-width:100%;scrollbar-width:none}
  .ec-chip{flex:none}
  .ec-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 12px}
  .ec-prod:nth-child(n+5){display:none}
  .ec-prod .ec-sw,.ec-prod .ec-add{display:none}
  .ec-meta{flex-direction:column;align-items:flex-start;gap:2px}
  .ec-bundle{grid-template-columns:minmax(0,1fr)}
  .ec-bundle .sk-photo{aspect-ratio:16/10}
  .ec-bundle-copy{padding:26px 22px}
  .ec-facts{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .ec-fact{padding:18px}
  .ec-fact p{font-size:13px}
  .ec-revs{grid-template-columns:minmax(0,1fr);gap:24px}
  .ec-news{grid-template-columns:minmax(0,1fr);gap:20px;padding:24px}
  .ec-news .sk-row{flex-direction:column;align-items:stretch}
  .ec-news .sk-row .sk-input{flex:none}
}
</style>`;

// ---- illustrative product "photos" (fixed natural tones) -----------------------------------------------------------
const BG = { sand: "#e9dfcf", sage: "#cfd8c4", clay: "#e3c6b0", fog: "#dcdfe0", oat: "#efe7d8", wheat: "#e8d6b0", slate: "#c9ced3" };
const item = (kind, id, bg = "oat") => {
  const g = `ec-g-${id}`;
  const art = {
    pot: `<ellipse cx="100" cy="150" rx="70" ry="12" fill="#000" opacity=".12"/><path d="M38 92h124v38c0 18-18 26-62 26s-62-8-62-26z" fill="#2f5d62"/><rect x="30" y="92" width="140" height="10" rx="5" fill="#3a7177"/><path d="M42 82c0-10 26-16 58-16s58 6 58 16z" fill="#3a7177"/><rect x="90" y="56" width="20" height="12" rx="4" fill="#c9a24a"/><rect x="20" y="100" width="18" height="10" rx="5" fill="#2f5d62"/><rect x="162" y="100" width="18" height="10" rx="5" fill="#2f5d62"/>`,
    mug: `<ellipse cx="98" cy="150" rx="46" ry="9" fill="#000" opacity=".12"/><path d="M62 70h72v62c0 12-14 18-36 18s-36-6-36-18z" fill="#d7c3a6"/><path d="M62 70h72v18H62z" fill="#8d6e55"/><path d="M134 88c22 0 22 34 0 34" stroke="#d7c3a6" stroke-width="9" fill="none"/><ellipse cx="98" cy="70" rx="36" ry="7" fill="#6b4f3a"/>`,
    bowls: `<ellipse cx="100" cy="152" rx="70" ry="10" fill="#000" opacity=".12"/><path d="M34 112h132c-4 26-30 40-66 40s-62-14-66-40z" fill="#e8e2d6"/><path d="M48 90h104c-4 20-24 30-52 30s-48-10-52-30z" fill="#b9845f"/><path d="M62 70h76c-3 15-17 22-38 22s-35-7-38-22z" fill="#6f8a73"/>`,
    linen: `<rect x="44" y="52" width="112" height="100" rx="4" fill="#c8b9a2"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M44 ${64 + i * 20}h112" stroke="#a5917a" stroke-width="3"/>`).join("")}<path d="M44 52h112v14H44z" fill="#d9cbb5"/><path d="M60 152v14M80 152v10M100 152v14M120 152v10M140 152v14" stroke="#c8b9a2" stroke-width="3"/>`,
    jar: `<ellipse cx="100" cy="156" rx="48" ry="8" fill="#000" opacity=".12"/><rect x="62" y="62" width="76" height="92" rx="14" fill="#f2ead9" opacity=".9"/><rect x="66" y="96" width="68" height="54" rx="10" fill="#d9a441"/><rect x="66" y="50" width="68" height="16" rx="4" fill="#7a5a3a"/><rect x="74" y="104" width="52" height="22" rx="3" fill="#f7f1e3"/>`,
    board: `<ellipse cx="100" cy="156" rx="76" ry="9" fill="#000" opacity=".12"/><rect x="34" y="70" width="132" height="80" rx="16" fill="#b5834f"/><circle cx="150" cy="86" r="6" fill="#7d5732"/><path d="M48 96c30-8 70-8 104 0" stroke="#9b6c3e" stroke-width="2" fill="none"/><path d="M60 118h70l14 6-14 6H60z" fill="#d5d8db"/><rect x="40" y="118" width="22" height="12" rx="3" fill="#3b2b20"/>`,
    pan: `<ellipse cx="96" cy="150" rx="66" ry="10" fill="#000" opacity=".12"/><ellipse cx="88" cy="112" rx="58" ry="34" fill="#2b2b2b"/><ellipse cx="88" cy="108" rx="48" ry="26" fill="#3d3d3d"/><rect x="140" y="100" width="54" height="12" rx="6" fill="#2b2b2b" transform="rotate(-12 140 106)"/>`,
    oil: `<ellipse cx="100" cy="158" rx="40" ry="7" fill="#000" opacity=".12"/><path d="M80 82h40v68c0 4-4 6-20 6s-20-2-20-6z" fill="#5f7a3a"/><rect x="90" y="54" width="20" height="30" fill="#5f7a3a"/><rect x="88" y="44" width="24" height="12" rx="3" fill="#2d2d2d"/><rect x="84" y="104" width="32" height="30" rx="2" fill="#efe4c7"/>`,
    knife: `<ellipse cx="100" cy="150" rx="60" ry="7" fill="#000" opacity=".1"/><g transform="translate(26 20) scale(.74)"><path d="M28 118c40-26 92-38 124-34l-4 18c-40 6-82 14-120 16z" fill="#cfd4d8"/><rect x="146" y="86" width="40" height="16" rx="6" fill="#4a3426" transform="rotate(-8 146 94)"/></g>`,
    candle: `<ellipse cx="100" cy="156" rx="42" ry="8" fill="#000" opacity=".12"/><rect x="66" y="84" width="68" height="70" rx="8" fill="#b9a48c"/><rect x="72" y="76" width="56" height="12" rx="4" fill="#f1e7d6"/><path d="M100 76v-12" stroke="#333" stroke-width="2"/><path d="M100 46c8 8 6 16 0 18-6-2-8-10 0-18z" fill="#f2b84b"/>`,
  }[kind];
  return `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(kind)} product photo"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG[bg]}"/><stop offset="1" stop-color="${BG[bg]}" stop-opacity=".78"/></linearGradient></defs><rect width="200" height="200" fill="url(#${g})"/><rect y="146" width="200" height="54" fill="#000" opacity=".04"/>${art}</svg>`;
};
const heroScene = () => `<svg viewBox="0 0 700 540" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Kitchen counter with a teal cast-iron pot, stoneware bowls and linen by a window"><defs>
<linearGradient id="ec-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe6d6"/><stop offset="1" stop-color="#e2d5bf"/></linearGradient>
<linearGradient id="ec-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff8e8" stop-opacity=".9"/><stop offset="1" stop-color="#fff8e8" stop-opacity="0"/></linearGradient></defs>
<rect width="700" height="540" fill="url(#ec-wall)"/><rect x="420" y="40" width="220" height="230" rx="4" fill="#cfdcd8"/><path d="M530 40v230M420 155h220" stroke="#e9e1d1" stroke-width="10"/><path d="M420 40l280 420H180z" fill="url(#ec-light)" opacity=".6"/>
<rect x="60" y="120" width="160" height="10" fill="#b38a5e"/><rect x="80" y="84" width="34" height="36" rx="5" fill="#9fb59a"/><rect x="128" y="74" width="26" height="46" rx="5" fill="#d9a441"/><rect x="166" y="92" width="38" height="28" rx="5" fill="#e8e2d6"/>
<rect y="360" width="700" height="180" fill="#b5834f"/><rect y="360" width="700" height="14" fill="#9b6c3e"/>${[0, 1, 2, 3].map((i) => `<path d="M0 ${400 + i * 36}h700" stroke="#9b6c3e" stroke-width="2" opacity=".45"/>`).join("")}
<ellipse cx="250" cy="372" rx="150" ry="18" fill="#000" opacity=".15"/><path d="M120 250h260v80c0 34-40 48-130 48s-130-14-130-48z" fill="#2f5d62"/><rect x="106" y="250" width="288" height="18" rx="9" fill="#3a7177"/><path d="M128 232c0-18 54-30 122-30s122 12 122 30z" fill="#3a7177"/><rect x="228" y="186" width="44" height="22" rx="7" fill="#c9a24a"/><rect x="76" y="268" width="40" height="18" rx="9" fill="#2f5d62"/><rect x="384" y="268" width="40" height="18" rx="9" fill="#2f5d62"/>
<path d="M440 320h170c-6 34-38 52-85 52s-79-18-85-52z" fill="#e8e2d6"/><path d="M458 292h134c-5 26-30 40-67 40s-62-14-67-40z" fill="#b9845f"/>
<path d="M30 380h120l20 120H10z" fill="#c8b9a2"/>${[0, 1, 2].map((i) => `<path d="M${22 - i * 4} ${410 + i * 30}h${136 + i * 8}" stroke="#a5917a" stroke-width="4"/>`).join("")}</svg>`;
const tileScene = (kind) => kind === "ceramics"
  ? `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Stack of glazed stoneware plates"><rect width="400" height="260" fill="#d7c6b2"/><rect y="180" width="400" height="80" fill="#c2ab92"/>${[0, 1, 2, 3].map((i) => `<ellipse cx="200" cy="${176 - i * 14}" rx="${120 - i * 4}" ry="20" fill="${["#e8e2d6", "#6f8a73", "#e8e2d6", "#b9845f"][i]}"/>`).join("")}<path d="M300 120h50v58c0 8-10 12-25 12s-25-4-25-12z" fill="#8d6e55"/></svg>`
  : `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Pantry shelf with jars of grains and olive oil"><rect width="400" height="260" fill="#cfd8c4"/>${[110, 220].map((y) => `<rect x="0" y="${y}" width="400" height="10" fill="#9b7b55"/>`).join("")}${[[40, 60, "#d9a441"], [110, 50, "#f2ead9"], [180, 64, "#7a5a3a"], [260, 56, "#e3c6b0"], [330, 48, "#5f7a3a"]].map(([x, h, c]) => `<rect x="${x}" y="${110 - h}" width="44" height="${h}" rx="8" fill="${c}"/>`).join("")}${[[60, 70, "#efe4c7"], [140, 54, "#b9845f"], [230, 66, "#f2ead9"], [310, 58, "#d9a441"]].map(([x, h, c]) => `<rect x="${x}" y="${220 - h}" width="50" height="${h}" rx="8" fill="${c}"/>`).join("")}</svg>`;

const CATS = [["pot", "Cookware", "84 items", "sage"], ["bowls", "Ceramics", "112 items", "clay"], ["linen", "Linen", "46 items", "sand"], ["jar", "Pantry", "63 items", "wheat"], ["knife", "Knives & tools", "38 items", "fog"], ["candle", "Home", "57 items", "oat"]];
const PRODUCTS = [
  ["pot", "sage", "Enamelled cast-iron casserole, 4.7 L", "189", "", "4.9", "412", ["#2f5d62", "#b5452f", "#e8e2d6"], "Best-seller"],
  ["mug", "clay", "Speckled stoneware mug, set of 2", "34", "", "4.8", "268", ["#d7c3a6", "#6f8a73", "#3b3b3b"], ""],
  ["linen", "sand", "Washed linen tea towels, set of 3", "28", "36", "4.7", "190", ["#c8b9a2", "#9aa8a0", "#d7b8a6"], "Sale"],
  ["board", "wheat", "End-grain walnut cutting board", "96", "", "4.9", "143", ["#b5834f", "#7d5732"], ""],
  ["pan", "fog", "Carbon-steel frying pan, 28 cm", "64", "", "4.6", "221", ["#2b2b2b"], "Restocked"],
  ["bowls", "oat", "Nesting prep bowls, set of 3", "42", "", "4.8", "87", ["#6f8a73", "#b9845f", "#e8e2d6"], ""],
  ["oil", "sage", "Early-harvest olive oil, 500 ml", "22", "", "4.9", "356", ["#5f7a3a"], "New"],
  ["knife", "slate", "Santoku knife, 18 cm", "78", "", "4.7", "164", ["#4a3426", "#2d2d2d"], ""],
];

const web = (p, st) => {
  const nav = K.nav(p, ["Shop all", "Cookware", "Ceramics", "Linen", "Pantry", "Gifts"], "Cart")
    .replace('<a class="btn primary" href="#cart">Cart</a>', `<a class="btn primary ec-cart" href="#cart">${ic("cart", 16)}Cart <span class="ec-count">3</span></a>`)
    .replace('<div class="sk-navend">', `<div class="sk-navend"><label class="ec-search">${ic("search", 16)}<span>Search pans, mugs, oil…</span></label>`)
    .replace('<details class="sk-menu">', `<a class="ec-mcart" href="#cart" aria-label="Cart, 3 items">${ic("cart", 18)}<span class="ec-count">3</span></a><details class="sk-menu">`);
  return K.page(st, `<div class="ec-bar"><div class="sk-wrap"><span><b>Free delivery</b> on orders over $75 · Order by 2 PM for next-day dispatch</span><span>Track an order · Help</span></div></div>
${nav}
<main>
<section class="sk-wrap ec-hero" id="top">
  <div class="sk-photo ec-hero-main">${heroScene()}
    <div class="ec-hero-copy"><span class="sk-eyebrow">The autumn kitchen edit</span>
      <h1 class="sk-h1" style="font-size:calc(42px * var(--hs))">Pots and bowls for slow Sunday cooking</h1>
      <p class="muted">Cast iron, stoneware and washed linen chosen for kitchens that get used every day. ${esc(p.name)} tests every piece at home for a month before it goes on sale.</p>
      <div class="sk-row"><a class="btn primary sk-btn-lg" href="#best-sellers">Shop the edit</a><a class="btn sk-btn-lg" href="#cookware">Browse cookware</a></div>
    </div>
  </div>
  <div class="ec-hero-side">
    <a class="sk-photo ec-hero-tile" href="#ceramics">${tileScene("ceramics")}<span class="ec-tile-copy"><span><b>New stoneware glazes</b><br><span class="muted" style="font-size:13px">Moss, rust and oat, from $18</span></span><span class="btn">Shop ceramics</span></span></a>
    <a class="sk-photo ec-hero-tile" href="#pantry">${tileScene("pantry")}<span class="ec-tile-copy"><span><b>Pantry restock</b><br><span class="muted" style="font-size:13px">Oils, grains and salts, from $9</span></span><span class="btn">Shop pantry</span></span></a>
  </div>
</section>

<section class="sk-sec sk-tight sk-alt" id="cookware"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Shop by category</span><h2 class="sk-h2">Everything for the kitchen and table</h2></div><a class="btn" href="#">All 400 products ${ic("arrow", 16)}</a></div>
  <div class="ec-cats">${CATS.map(([k, n, c, bg], i) => `<a class="ec-cat" href="#"><span class="sk-photo">${item(k, `c${i}`, bg)}</span><b>${n}</b><span>${c}</span></a>`).join("")}</div>
</div></section>

<section class="sk-sec" id="best-sellers"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Best-sellers</span><h2 class="sk-h2">What people reorder</h2></div>
    <div class="ec-filters" role="tablist"><span class="ec-chip on" role="tab" aria-selected="true">All</span><span class="ec-chip" role="tab">Cookware</span><span class="ec-chip" role="tab">Ceramics</span><span class="ec-chip" role="tab">Under $40</span></div></div>
  <div class="ec-grid">${PRODUCTS.map(([k, bg, n, pr, was, r, cnt, sw, badge], i) => `<article class="ec-prod"><div class="sk-photo">${item(k, `p${i}`, bg)}${badge ? `<span class="badge ec-badge">${badge}</span>` : ""}<span class="ec-fav" aria-label="Save">${ic("heart", 16)}</span></div>
    <div class="ec-meta"><span class="ec-stars">${ic("star", 14)}<b>${r}</b> <span class="muted">(${cnt})</span></span><span class="ec-sw">${sw.map((c, j) => `<i class="${j ? "" : "on"}" style="background:${c}"></i>`).join("")}</span></div>
    <h3>${esc(n)}</h3>
    <div class="ec-price"><span class="num" style="font-size:17px">$${pr}</span>${was ? `<s>$${was}</s>` : ""}</div>
    <button class="btn block ec-add" type="button">${ic("plus", 14)} Add to cart</button></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight"><div class="sk-wrap">
  <div class="ec-bundle feat" style="background:var(--text);color:var(--bg)">
    <div class="sk-photo">${item("pot", "b1", "sage")}</div>
    <div class="ec-bundle-copy"><span class="badge">Bundle · save $41</span>
      <h2 class="sk-h2">The first-kitchen set</h2>
      <p style="opacity:.8;max-width:460px">Four pieces that cover most weeknight cooking. Bought together, they ship in one plastic-free box with a care card for each.</p>
      <ul class="ec-bundle-list">${[["Cast-iron casserole, 4.7 L", "$189"], ["Carbon-steel pan, 28 cm", "$64"], ["Santoku knife, 18 cm", "$78"], ["Walnut cutting board", "$96"]].map(([a, b]) => `<li><span>${a}</span><span>${b}</span></li>`).join("")}</ul>
      <div class="sk-row"><span class="num" style="font-size:30px">$386</span><s style="opacity:.6">$427</s><a class="btn primary sk-btn-lg" href="#">Add the set to cart</a></div>
    </div>
  </div>
</div></section>

<section class="sk-sec sk-tight sk-alt"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Ordering from us</span><h2 class="sk-h2">Shipping, returns and care</h2></div></div>
  <div class="ec-facts">${[["send", "Delivery", "Free over $75, otherwise $6.50. Most orders arrive in 2–4 working days."], ["refresh", "Returns", "30 days to return unused items. We email a prepaid label."], ["shield", "Cookware warranty", "Cast iron and carbon steel are covered for 10 years against defects."], ["chat", "Real help", "Questions about seasoning or sizes? A person replies within one working day."]].map(([icn, t, d]) => `<div class="ec-fact"><span class="ec-ico">${ic(icn, 18)}</span><b>${t}</b><p>${d}</p></div>`).join("")}</div>
</div></section>

<section class="sk-sec"><div class="sk-wrap ec-revs">
  <div class="ec-score"><span class="sk-eyebrow">Customer reviews</span><h2 class="sk-h2">4.8 out of 5</h2><p class="muted">From 6,214 verified orders in the last 12 months.</p>
    <div class="ec-hist">${[[5, 82], [4, 13], [3, 3], [2, 1], [1, 1]].map(([s, v]) => `<div><span>${s} ★</span><i><b style="width:${v}%"></b></i><span>${v}%</span></div>`).join("")}</div></div>
  <div class="sk-g3 sk-rail">${[["Heavier than I expected, in a good way. Braised short ribs on day one and the enamel cleaned up with just warm water.", "Ruth A.", "pot", "sage", "Cast-iron casserole"], ["The mugs hold a proper 350 ml and the glaze is lovely in person. Arrived double-boxed, nothing chipped.", "Kofi B.", "mug", "clay", "Stoneware mug set"], ["Asked about sharpening before I ordered and got a two-paragraph answer. The knife is great too.", "Elin S.", "knife", "slate", "Santoku knife"]].map(([q, n, k, bg, it], i) => `<figure class="card ec-rev"><span class="ec-stars">${ic("star", 14).repeat(5)}</span><q>${esc(q)}</q><figcaption><b>${n}</b> <span class="muted" style="font-size:13px">· Verified buyer</span></figcaption><div class="ec-item"><span class="sk-photo">${item(k, `r${i}`, bg)}</span>${it}</div></figure>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight"><div class="sk-wrap"><div class="card ec-news">
  <div class="sk-stack" style="gap:10px"><span class="sk-eyebrow">The Sunday letter</span><h2 class="sk-h2" style="font-size:calc(32px * var(--hs))">One recipe, one restock, every other Sunday</h2><p class="muted">Early access to small-batch ceramics and 10% off your first order.</p></div>
  <form aria-label="Newsletter sign-up"><div class="sk-field"><label for="ec-email">Email address</label><div class="sk-row"><input class="sk-input" id="ec-email" placeholder="you@example.com"><button class="btn primary sk-btn-lg" type="button">Sign up</button></div></div>
  <p class="muted" style="font-size:13px">Unsubscribe in one click. We never share your address.</p></form>
</div></div></section>
</main>
${K.footer(p, "Home and kitchen goods, tested at home before they go on sale.", [["Shop", ["Cookware", "Ceramics", "Linen", "Pantry", "Gift cards"]], ["Help", ["Delivery & returns", "Track an order", "Care guides", "Warranty"]], ["Company", ["Our makers", "Trade accounts", "hello@juniper.example", "(555) 018-4471"]]])}`, CSS);
};

module.exports = {
  "ecommerce-website": K.def("commerce", "E-commerce website",
    "a full online store home page: an announcement bar with delivery threshold, navigation with category links, a search field and a cart count, a campaign hero with two category promo tiles, shop-by-category tiles with item counts, a best-sellers product grid with ratings, colour swatches, sale prices and add-to-cart buttons, a bundle offer band with itemised savings, shipping/returns/warranty facts, customer reviews with a rating breakdown, a newsletter sign-up form and a footer with shop and help columns",
    ["announcement-bar", "navigation-header", "search", "cart", "hero", "category-tiles", "product-grid", "product-card", "rating", "swatches", "add-to-cart", "bundle", "shipping-info", "testimonials", "rating-breakdown", "newsletter", "footer", "ecommerce"], web),
};

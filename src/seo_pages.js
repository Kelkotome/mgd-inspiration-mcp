// SEO r1 (12-Nov-2026, audit seo-audit-2026-11-12 §8): head tags every public /inspiration HTML page should carry, filled in from what
// the page already says. No new wording: every value is copied from the page's own <title>, meta description, canonical, first item
// image and visible breadcrumb. Runs on the finished HTML string (themeify calls it), so it needs no data and no D1 query.
//   - og:title / og:description / og:type / og:url when the page has no og:title (the museum + annual-report listing pages)
//   - og:image from the first item image in the body when the page has none
//   - twitter:card: summary_large_image when there is an og:image, else summary (X reads og:title/description/image itself)
//   - BreadcrumbList JSON-LD from the visible <nav class="crumb"> when the page has no BreadcrumbList yet
// Only pages with a <link rel="canonical"> are touched (the indexable pages); a page that already has a tag keeps its own.

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };
const decode = (s) => String(s).replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z0-9]+);/gi, (m, e) => {
  const k = e.toLowerCase();
  if (k[0] === "#") { const n = k[1] === "x" ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
  return ENT[k] != null ? ENT[k] : m;
});
const text = (s) => decode(String(s).replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
const attrEsc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hasMeta = (head, key) => new RegExp(`<meta\\s+(?:property|name)="${key.replace(/[.:]/g, "\\$&")}"`, "i").test(head);
const metaContent = (head, key) => { const m = head.match(new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="([^"]*)"`, "i")); return m ? m[1] : null; };

// Visible breadcrumb → schema.org BreadcrumbList. Segments are joined by " › "; every segment but the last must be a link
// (otherwise no JSON-LD: Google needs an item URL for each crumb above the current page). The last one is the page itself.
export function crumbList(body, canonical, origin) {
  const m = body.match(/<nav class="crumb"[^>]*>([\s\S]*?)<\/nav>/);
  if (!m) return null;
  const segs = m[1].split(" › ");
  if (segs.length < 2) return null;
  const items = [];
  for (let i = 0; i < segs.length; i++) {
    const a = segs[i].match(/^\s*<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*$/);
    const last = i === segs.length - 1;
    if (!a && !last) return null;
    const name = text(a ? a[2] : segs[i]);
    if (!name) return null;
    const href = a ? decode(a[1]) : canonical;
    if (!href) return null;
    const item = /^https?:\/\//.test(href) ? href : origin + (href.startsWith("/") ? href : "/" + href);
    items.push({ "@type": "ListItem", position: i + 1, name, item });
  }
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
}

export function seoTags(body) {
  if (typeof body !== "string") return body;
  const he = body.indexOf("</head>");
  if (he < 0) return body;
  const head = body.slice(0, he);
  const cm = head.match(/<link rel="canonical" href="([^"]+)"/);
  if (!cm) return body;
  const canonical = decode(cm[1]);
  let origin; try { origin = new URL(canonical).origin; } catch (_) { return body; }
  const add = [];
  if (!hasMeta(head, "og:title")) {
    const t = head.match(/<title>([\s\S]*?)<\/title>/);
    if (t && t[1].trim()) {
      if (!hasMeta(head, "og:type")) add.push(`<meta property="og:type" content="website"/>`);
      add.push(`<meta property="og:title" content="${attrEsc(text(t[1]))}"/>`);
    }
  }
  if (!hasMeta(head, "og:description")) {
    const d = metaContent(head, "description");
    if (d) add.push(`<meta property="og:description" content="${d}"/>`);
  }
  if (!hasMeta(head, "og:url")) add.push(`<meta property="og:url" content="${attrEsc(canonical)}"/>`);
  let image = hasMeta(head, "og:image");
  if (!image) {
    const im = body.slice(he).match(/<img\b[^>]*?\ssrc="([^"]+)"/);
    const src = im && decode(im[1]);
    if (src && /^(\/|https?:\/\/)/.test(src)) { add.push(`<meta property="og:image" content="${attrEsc(/^https?:/.test(src) ? src : origin + src)}"/>`); image = true; }
  }
  if (!hasMeta(head, "twitter:card")) add.push(`<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}"/>`);
  if (!/"@type":\s*"BreadcrumbList"/.test(body)) {
    const ld = crumbList(body, canonical, origin);
    if (ld) add.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`);
  }
  return add.length ? body.slice(0, he) + add.join("") + body.slice(he) : body;
}

// <img> width/height from the D1 row (rowToItem's width/height), so the browser reserves the space before the image loads.
export const imgDims = (it) => (it && +it.width > 0 && +it.height > 0 ? ` width="${+it.width}" height="${+it.height}"` : "");

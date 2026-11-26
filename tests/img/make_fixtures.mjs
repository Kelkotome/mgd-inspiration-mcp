// mcp-img-r1: deterministic sample images for the local e2e (big museum JPEG > 60 KB, small annual JPEG, PNG design items).
import sharp from "sharp";
import { mkdirSync } from "node:fs";
const out = process.argv[2]; mkdirSync(out, { recursive: true });
let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
async function noisy(w, h, hue, file, fmt, amp = 60) {
  const px = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3, n = rnd() * amp;
    px[i] = (hue[0] + n + x / w * 80) & 255; px[i + 1] = (hue[1] + n + y / h * 80) & 255; px[i + 2] = (hue[2] + n) & 255;
  }
  let s = sharp(px, { raw: { width: w, height: h, channels: 3 } });
  s = fmt === "png" ? s.png() : s.jpeg({ quality: 90 });
  const info = await s.toFile(`${out}/${file}`);
  console.log(file, w + "x" + h, info.size);
}
await noisy(900, 1200, [150, 90, 40], "museum_big.jpg", "jpg");     // > 60 KB: needs resizing
await noisy(300, 400, [40, 60, 120], "annual_small.jpg", "jpg");    // small: used as-is
await noisy(800, 1000, [200, 40, 60], "design_a.png", "png");       // big PNG
await noisy(240, 300, [30, 140, 90], "design_b.png", "png", 0);     // small smooth PNG: used as-is

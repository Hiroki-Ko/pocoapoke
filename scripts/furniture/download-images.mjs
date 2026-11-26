// 家具の画像を取得する（ユーザーの PC で手動実行）
//   node scripts/furniture/download-images.mjs
// scripts/furniture/image-urls.json の URL から画像を取り、周りの透明な余白を切って
// public/items/<slug>.png に保存する（既にあればスキップ）。
// 取れなかったものは scripts/furniture/missing-images.json に書き、src/data/furniture.json の image を null にする。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, "../..");
const OUT = path.join(ROOT, "public/items");
const DATA = path.join(ROOT, "src/data/furniture.json");
const urls = JSON.parse(fs.readFileSync(path.join(DIR, "image-urls.json"), "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(OUT, { recursive: true });

async function download(slug, url) {
  const file = path.join(OUT, `${slug}.png`);
  if (fs.existsSync(file)) return true;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "pocoapoke-personal" } });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).trim().png({ palette: true }).toFile(file);
    return true;
  } catch {
    return false;
  } finally {
    await sleep(200);
  }
}

const entries = Object.entries(urls);
const missing = [];
let done = 0;
// 4 件ずつ並べて取得する
for (let i = 0; i < entries.length; i += 4) {
  const batch = entries.slice(i, i + 4);
  const ok = await Promise.all(batch.map(([slug, url]) => download(slug, url)));
  batch.forEach(([slug], j) => !ok[j] && missing.push(slug));
  done += batch.length;
  process.stdout.write(`\r${done}/${entries.length}`);
}
console.log();

fs.writeFileSync(path.join(DIR, "missing-images.json"), JSON.stringify(missing, null, 1) + "\n");
const items = JSON.parse(fs.readFileSync(DATA, "utf8"));
for (const item of items) item.image = fs.existsSync(path.join(OUT, `${item.slug}.png`)) ? `${item.slug}.png` : null;
fs.writeFileSync(DATA, JSON.stringify(items, null, 2) + "\n");

console.log(`画像: ${entries.length - missing.length} 件 / 取れなかった: ${missing.length} 件`);
if (missing.length) console.log(missing.join(", "));

// 家具データを組み立てる（手動実行）
//   node scripts/furniture/parse-serebii.mjs   … raw/serebii/*.txt → raw/serebii-favorites.json
//   node scripts/furniture/build-data.mjs      … src/data/furniture.json、確認用の review.csv、画像の URL 一覧を作る
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeFurniture } from "./merge.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, "../..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(DIR, p), "utf8"));

const serebii = read("raw/serebii-favorites.json");
const names = read("raw/opgg-names.json");
const favMap = read("favorite-map.json");
const allow = read("allow-untagged.json");
const overridesPath = path.join(DIR, "overrides.json");
const overrides = fs.existsSync(overridesPath) ? JSON.parse(fs.readFileSync(overridesPath, "utf8")) : {};

// 画像は download-images.mjs で public/items/ に保存する。まだ一度も取得していなければ全件ファイル名を入れておく
const IMG = path.join(ROOT, "public/items");
const hasImage = fs.existsSync(IMG) ? (slug) => fs.existsSync(path.join(IMG, `${slug}.png`)) : () => true;
const { items, missing, kanji } = mergeFurniture(serebii, { ...names, ...overrides.names }, favMap, allow, hasImage);

// 好きなものの日本語名（seeds/master_code.sql の favorite）
const labelByCode = {};
for (const m of fs.readFileSync(path.join(ROOT, "seeds/master_code.sql"), "utf8").matchAll(/\('favorite',\s*(\d+),\s*'([^']+)'/g)) {
  labelByCode[Number(m[1])] = m[2];
}

fs.writeFileSync(path.join(ROOT, "src/data/furniture.json"), JSON.stringify(items, null, 2) + "\n");

const csv = (v) => `"${String(v).replace(/"/g, '""')}"`;
const rows = [["日本語名", "英語名", "分類", "属性", "slug"], ...items.filter((i) => !i.noJa).map((i) => [i.name, i.en, i.tag, i.favorites.map((c) => labelByCode[c]).join(" "), i.slug])];
fs.writeFileSync(path.join(DIR, "review.csv"), "﻿" + rows.map((r) => r.map(csv).join(",")).join("\r\n") + "\r\n");

const bySlug = new Map(serebii.map((s) => [s.slug, s]));
fs.writeFileSync(
  path.join(DIR, "image-urls.json"),
  JSON.stringify(Object.fromEntries(items.map((i) => [i.slug, bySlug.get(i.slug).image])), null, 1) + "\n",
);

const missRows = [["英語名", "slug", "理由", "属性"], ...missing.map((m) => [bySlug.get(m.slug).en, m.slug, m.reason, bySlug.get(m.slug).favorites.map((f) => labelByCode[favMap[f]]).join(" ")])];
fs.writeFileSync(path.join(DIR, "missing-names.csv"), "﻿" + missRows.map((r) => r.map(csv).join(",")).join("\r\n") + "\r\n");

console.log(`家具: ${items.length} 件（うち日本語名なし: ${missing.length} 件）`);
// 日本語名はかな・カナにそろえる。漢字が残っていたら overrides.json の names で直す
if (kanji.length) console.log(`漢字をふくむ名前: ${kanji.map((k) => `${k.slug}=${k.name}`).join(", ")}`);

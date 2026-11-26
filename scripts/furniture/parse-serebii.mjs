// raw/serebii/<カテゴリ>.txt（Serebii の Favorites ページから集めた「名前|分類」）を
// raw/serebii-favorites.json（アイテム単位）にまとめる
//   node scripts/furniture/parse-serebii.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(DIR, "raw/serebii");
const TAGS = { D: "decoration", R: "relaxation", T: "toy", F: "food", W: "road", Decoration: "decoration", Relaxation: "relaxation", Toy: "toy", Food: "food", Road: "road", "-": null };

// Serebii のページ名（ファイル名）→ 英語カテゴリ名
const PAGE_TO_CATEGORY = Object.fromEntries(
  Object.keys(JSON.parse(fs.readFileSync(path.join(DIR, "favorite-map.json"), "utf8"))).map((c) => [
    c.toLowerCase().replace(/[^a-z]/g, ""),
    c,
  ]),
);

export function toSlug(en) {
  return en
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const items = new Map();
for (const file of fs.readdirSync(RAW).filter((f) => f.endsWith(".txt") && f !== "NOTES.txt")) {
  const category = PAGE_TO_CATEGORY[file.replace(".txt", "")];
  if (!category) throw new Error(`カテゴリが分かりません: ${file}`);
  for (const line of fs.readFileSync(path.join(RAW, file), "utf8").split("\n")) {
    if (!line.trim()) continue;
    const [en, t] = line.split("|").map((s) => s.trim());
    const slug = toSlug(en);
    const cur = items.get(slug) ?? { en, slug, tag: TAGS[t] ?? null, image: `https://www.serebii.net/pokemonpokopia/items/${en.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9()'-]/g, "")}.png`, favorites: [] };
    if (!cur.favorites.includes(category)) cur.favorites.push(category);
    items.set(slug, cur);
  }
}
const out = [...items.values()].sort((a, b) => a.slug.localeCompare(b.slug));
fs.writeFileSync(path.join(DIR, "raw/serebii-favorites.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`items: ${out.length}`);

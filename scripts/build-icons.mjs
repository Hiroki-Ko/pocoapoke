/**
 * ポケモンアイコンの生成スクリプト（手動実行）
 *
 *   node scripts/build-icons.mjs
 *
 * 1. PokeAPI の日本語名データから src/data/speciesJa.json（名前 → 全国図鑑番号）を作る
 * 2. PokeAPI のスプライト（全国図鑑 1〜1025 と姿別の画像）をダウンロードし、
 *    周りの透明な余白を切り取って public/icons/<key>.png に保存する（既にあればスキップ）
 * 3. public/icons/custom/<pokemon_ms.id>.png（ゲーム内アイコンなど手動で置いた画像）を調べ、
 *    src/data/customIcons.json（id の配列）を作る
 * 4. メタモンのアイコンから public/favicon.png を作る
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ICON_DIR = path.join(ROOT, "public/icons");
const CUSTOM_DIR = path.join(ICON_DIR, "custom");
const DATA_DIR = path.join(ROOT, "src/data");
const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const NAMES_CSV = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv";
const MAX_SPECIES = 1025;
// 姿別のスプライト（src/lib/icons.ts の FORM_KEYS と揃える）
const FORM_SPRITES = ["422-east", "423-east", "10253", "10258", "10259", "10184"];

fs.mkdirSync(CUSTOM_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });

async function buildSpeciesNames() {
  const csv = await (await fetch(NAMES_CSV)).text();
  const map = {};
  for (const line of csv.split("\n").slice(1)) {
    const [id, lang, name] = line.split(",");
    if (lang === "1" && name && Number(id) <= MAX_SPECIES) map[name] = Number(id);
  }
  fs.writeFileSync(path.join(DATA_DIR, "speciesJa.json"), JSON.stringify(map, null, 0) + "\n");
  console.log(`speciesJa.json: ${Object.keys(map).length} 件`);
}

async function trimmed(buf) {
  return sharp(buf).trim().png({ compressionLevel: 9, palette: true }).toBuffer();
}

async function downloadSprite(key) {
  const out = path.join(ICON_DIR, `${key}.png`);
  if (fs.existsSync(out)) return "skip";
  const res = await fetch(`${SPRITE_BASE}/${key}.png`);
  if (!res.ok) return `missing(${res.status})`;
  fs.writeFileSync(out, await trimmed(Buffer.from(await res.arrayBuffer())));
  return "ok";
}

async function buildSprites() {
  const keys = [...Array.from({ length: MAX_SPECIES }, (_, i) => String(i + 1)), ...FORM_SPRITES];
  const result = {};
  for (let i = 0; i < keys.length; i += 16) {
    const batch = keys.slice(i, i + 16);
    const rs = await Promise.all(batch.map((k) => downloadSprite(k).catch((e) => `error(${e.message})`)));
    batch.forEach((k, j) => (result[k] = rs[j]));
  }
  const bad = Object.entries(result).filter(([, r]) => r !== "ok" && r !== "skip");
  console.log(`sprites: ${keys.length} 件中 取得失敗 ${bad.length} 件`, bad.slice(0, 10));
}

function buildCustomList() {
  const ids = fs
    .readdirSync(CUSTOM_DIR)
    .map((f) => /^(\d+)\.png$/.exec(f)?.[1])
    .filter(Boolean)
    .map(Number)
    .sort((a, b) => a - b);
  fs.writeFileSync(path.join(DATA_DIR, "customIcons.json"), JSON.stringify(ids) + "\n");
  console.log(`customIcons.json: ${ids.length} 件`);
}

async function buildFavicon() {
  const src = path.join(ICON_DIR, "132.png");
  await sharp(src)
    .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: "nearest" })
    .png()
    .toFile(path.join(ROOT, "public/favicon.png"));
  console.log("favicon.png: ok");
}

await buildSpeciesNames();
await buildSprites();
buildCustomList();
await buildFavicon();

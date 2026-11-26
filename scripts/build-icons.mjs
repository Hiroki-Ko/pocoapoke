/**
 * ポケモンアイコンの生成スクリプト（手動実行）
 *
 *   node scripts/build-icons.mjs
 *
 * 1. PokeAPI の日本語名データから src/data/speciesJa.json（名前 → 全国図鑑番号）を作る
 * 2. PokeAPI のスプライト（全国図鑑 1〜1025 と姿別の画像）をダウンロードし、
 *    周りの透明な余白を切り取って public/icons/<key>.png に保存する（既にあればスキップ）
 * 3. public/icons/custom/<pokemon_ms.id>.png（ポケモンごとのゲーム内アイコン）と
 *    public/icons/custom/key-<画像キー>.png（名前で決まるゲーム内アイコン。登録前にも出る）を調べ、
 *    src/data/customIcons.json（id の配列）と src/data/customKeyIcons.json（キーの配列）を作る
 * 4. public/favicon.png（ドット絵のメタモン）と、アプリのアイコン（public/icon-*.png）を作る
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
// "female/592" は public/icons/female-592.png として保存する
const FORM_SPRITES = ["422-east", "423-east", "10253", "10258", "10259", "10184", "female/592", "female/593"];

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
  const out = path.join(ICON_DIR, `${key.replace("/", "-")}.png`);
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
  const keys = fs
    .readdirSync(CUSTOM_DIR)
    .map((f) => /^key-(.+)\.png$/.exec(f)?.[1])
    .filter(Boolean)
    .sort();
  fs.writeFileSync(path.join(DATA_DIR, "customKeyIcons.json"), JSON.stringify(keys) + "\n");
  console.log(`customIcons.json: ${ids.length} 件 / customKeyIcons.json: ${keys.length} 件`);
}

// ファビコン（ブラウザのタブ用）: PokeAPI のメタモンのドット絵から作る
async function buildFavicon() {
  const src = path.join(ICON_DIR, "132.png");
  await sharp(src)
    .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: "nearest" })
    .png()
    .toFile(path.join(ROOT, "public/favicon.png"));
  console.log("favicon.png: ok");
}

// インストールしたアプリのアイコン（public/manifest.webmanifest で指定）
// - icon-maskable-512.png: ホーム画面のアイコン。ゲーム内のメタモン（custom/48.png）を黄色の上に置く
// - icon-192.png / icon-512.png: 起動画面（スプラッシュ）用。公式の配布画像から切り抜いたフワンテ＆メタモン
//   （scripts/assets/drifloon-ditto.png）を背景透明で置く。起動画面の背景色は manifest の background_color
async function buildAppIcons() {
  const clear = { r: 0, g: 0, b: 0, alpha: 0 };

  const yellow = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd84d"/><stop offset="1" stop-color="#ffb800"/></linearGradient></defs>` +
      `<rect width="100%" height="100%" fill="url(#g)"/></svg>`,
  );
  const ditto = await sharp(path.join(CUSTOM_DIR, "48.png"))
    .trim()
    .resize(256, 256, { fit: "contain", background: clear, kernel: "nearest" })
    .png()
    .toBuffer();
  await sharp(yellow)
    .composite([{ input: ditto, gravity: "center" }])
    .png()
    .toFile(path.join(ROOT, "public/icon-maskable-512.png"));

  const splash = path.join(ROOT, "scripts/assets/drifloon-ditto.png");
  for (const size of [192, 512]) {
    const body = Math.round(size * 0.94);
    const fg = await sharp(splash).resize(body, body, { fit: "contain", background: clear }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: clear } })
      .composite([{ input: fg, gravity: "center" }])
      .png()
      .toFile(path.join(ROOT, `public/icon-${size}.png`));
  }
  console.log("icon-maskable-512.png / icon-192.png / icon-512.png: ok");
}

await buildSpeciesNames();
await buildSprites();
buildCustomList();
await buildFavicon();
await buildAppIcons();

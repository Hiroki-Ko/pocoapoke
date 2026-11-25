// ポケモン名からアイコン画像のパスを決める。
// 優先順位:
//   1. ポケモンごとのゲーム内アイコン public/icons/custom/<pokemon_ms.id>.png
//      （ブルンゲル・プルリルは色を名前で判定するため、IDごとの画像は置かない）
//   2. 名前（画像キー）で決まるゲーム内アイコン public/icons/custom/key-<key>.png（登録前のポケモンにも出る）
//   3. トリム済みPokeAPI画像 public/icons/<key>.png
//   4. なし(null)
import speciesJa from "../data/speciesJa.json";
import customIcons from "../data/customIcons.json";
import customKeyIcons from "../data/customKeyIcons.json";

// 全角英数字（ポリゴン２ など）を半角にそろえて引けるようにする
const SPECIES: Record<string, number> = Object.fromEntries(
  Object.entries(speciesJa as Record<string, number>).map(([k, v]) => [k.normalize("NFKC"), v]),
);

// 登録データの表記が正式名と違うもの
const ALIASES: Record<string, string> = {
  デンジムシ: "デンヂムシ",
};

// 公式に姿別の画像があるもの（scripts/build-icons.mjs の FORM_SPRITES と揃える）
const FORM_KEYS: Record<string, string> = {
  "カラナクシ(にしのうみ)": "422",
  "カラナクシ(ひがしのうみ)": "422-east",
  "トリトドン(にしのうみ)": "423",
  "トリトドン(ひがしのうみ)": "423-east",
  "ウパー(パルデア)": "10253",
  "シャリタツ(そったすがた)": "978",
  "シャリタツ(たれたすがた)": "10258",
  "シャリタツ(のびたすがた)": "10259",
  "ストリンダー(ハイ)": "849",
  "ストリンダー(ロー)": "10184",
  // 図鑑に合わせた名前（〜なすがた・オス/メスのすがた）
  "ストリンダー(ハイなすがた)": "849",
  "ストリンダー(ローなすがた)": "10184",
  "プルリル(オスのすがた)": "592",
  "プルリル(メスのすがた)": "female-592",
  "ブルンゲル(オスのすがた)": "593",
  "ブルンゲル(メスのすがた)": "female-593",
  // 以前の名前（水色＝オス、ピンク＝メス）
  "プルリル(ピンク)": "female-592",
  "ブルンゲル(ピンク)": "female-593",
};

export function spriteKey(name: string): string | null {
  if (FORM_KEYS[name]) return FORM_KEYS[name];
  // ぽこあポケモン独自の姿「(はかせ)」などは、元のポケモンの画像で代用
  const base = name.replace(/[(（].*[)）]$/, "").normalize("NFKC");
  const id = SPECIES[ALIASES[base] ?? base];
  return id ? String(id) : null;
}

export function iconSrc(p: { id: number; name: string }): string | null {
  if ((customIcons as number[]).includes(p.id)) return `/icons/custom/${p.id}.png`;
  const key = spriteKey(p.name);
  if (!key) return null;
  if ((customKeyIcons as string[]).includes(key)) return `/icons/custom/key-${key}.png`;
  return `/icons/${key}.png`;
}

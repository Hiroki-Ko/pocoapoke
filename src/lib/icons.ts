// ポケモン名からアイコン画像のパスを決める。
// 優先順位: ユーザーが置いた画像(public/icons/custom/<id>.png) → トリム済みPokeAPI画像 → なし(null)
import speciesJa from "../data/speciesJa.json";
import customIcons from "../data/customIcons.json";

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
  return key ? `/icons/${key}.png` : null;
}

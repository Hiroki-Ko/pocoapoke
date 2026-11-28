// 家具さがし: 名前・属性での絞り込み、ポケモンの好きなものに当てはまる家具の順位づけ
import type { FurnitureItem, MasterItem, Pokemon } from "../types";
import { defaultPokemonCompare } from "./pokemonOrder";

// 好きなもの（味以外の favorite1〜5）を master_code の code にする
export function favoriteCodes(p: Pokemon, favById: Map<number, MasterItem>): number[] {
  return p.favorite_ids
    .slice(0, 5)
    .map((id) => (id != null ? favById.get(id)?.code : undefined))
    .filter((c): c is number => c != null);
}

// 検索用: 全角→半角、ひらがな→カタカナ、小文字
export function normalizeKana(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/[ぁ-ゖ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60))
    .toLowerCase();
}

// 家具の種類（Serebii の分類）→ 画面の表示名。分類なし（空文字）は「そのほか」
export const TAG_LABEL: Record<string, string> = {
  decoration: "かざりつけ",
  toy: "おもちゃ",
  relaxation: "きゅうけい",
  food: "たべもの",
  road: "どうろ",
  "": "そのほか",
};

// 家具がある種類だけ（絞り込みの選択肢に、結果が必ず0件になる種類を出さない）
export function usedTags(items: FurnitureItem[]): string[] {
  const used = new Set(items.map((i) => i.tag));
  return Object.keys(TAG_LABEL).filter((t) => used.has(t));
}

export function tagLabel(tag: string): string {
  return TAG_LABEL[tag] ?? "そのほか";
}

// 名前はかな・カナにそろえる（漢字が入っていたら入力させない）。ゲームの表記どおり「うえ木」だけは許す
export function hasKanji(s: string): boolean {
  return /[\u4e00-\u9fff々]/.test(s.replaceAll("うえ木", ""));
}

// 日本語名がない家具に、ブラウザで入力した名前を当てる（正式な日本語名がある家具には使わない）
export function applyLocalNames(items: FurnitureItem[], names: Record<string, string>): FurnitureItem[] {
  return items
    .map((i) => (i.noJa && names[i.slug] ? { ...i, name: names[i.slug], noJa: false, localName: true } : i))
    .sort(compareFurniture);
}

// 日本語名がある家具は名前順、ない家具（英語名）はアイテムの番号順で後ろへ（scripts/furniture/merge.mjs と同じ）
export function compareFurniture(a: FurnitureItem, b: FurnitureItem): number {
  if (!!a.noJa !== !!b.noJa) return a.noJa ? 1 : -1;
  if (!a.noJa) return a.name.localeCompare(b.name, "ja");
  return (a.order ?? Infinity) - (b.order ?? Infinity) || a.name.localeCompare(b.name, "en");
}

export function filterFurniture(items: FurnitureItem[], opts: { query: string; code: number | null; tag: string | null }): FurnitureItem[] {
  const q = normalizeKana(opts.query.trim());
  return items.filter(
    (i) =>
      (opts.code == null || i.favorites.includes(opts.code)) &&
      (opts.tag == null || i.tag === opts.tag) &&
      (q === "" || normalizeKana(i.name).includes(q) || normalizeKana(i.en).includes(q)),
  );
}

export type Pick = { pokemon: Pokemon; codes: number[] };
export type RankedFurniture = {
  item: FurnitureItem;
  total: number; // 当てはまった数（ポケモンごとに数えた合計）
  kinds: number[]; // 当てはまった属性 code（重複なし・昇順）
  perPokemon: { pokemon: Pokemon; codes: number[] }[];
};

export function rankFurniture(items: FurnitureItem[], picks: Pick[]): RankedFurniture[] {
  return items
    .map((item) => {
      const perPokemon = picks
        .map(({ pokemon, codes }) => ({ pokemon, codes: item.favorites.filter((c) => codes.includes(c)) }))
        .filter((r) => r.codes.length > 0);
      const total = perPokemon.reduce((n, r) => n + r.codes.length, 0);
      const kinds = [...new Set(perPokemon.flatMap((r) => r.codes))].sort((a, b) => a - b);
      return { item, total, kinds, perPokemon };
    })
    .filter((r) => r.total > 0)
    .sort((x, y) => y.total - x.total || y.kinds.length - x.kinds.length || x.item.name.localeCompare(y.item.name, "ja"));
}

export function pokemonWhoLike(code: number, all: Pokemon[], favById: Map<number, MasterItem>): Pokemon[] {
  return all.filter((p) => favoriteCodes(p, favById).includes(code)).sort(defaultPokemonCompare);
}

// 50音の行（ア行・カ行…）。家具一覧のジャンプ用。かなで始まらない名前は「英数」
const ROWS: [string, string][] = [
  ["ア", "ぁあぃいぅうぇえぉおゔ"],
  ["カ", "かきくけこ"],
  ["サ", "さしすせそ"],
  ["タ", "たちっつてと"],
  ["ナ", "なにぬねの"],
  ["ハ", "はひふへほ"],
  ["マ", "まみむめも"],
  ["ヤ", "ゃやゅゆょよ"],
  ["ラ", "らりるれろ"],
  ["ワ", "ゎわをん"],
];

export function kanaRow(name: string): string {
  // カタカナ→ひらがな、濁点・半濁点を外す
  const ch = (name.normalize("NFKC")[0] ?? "")
    .replace(/[ァ-ヶ]/, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .normalize("NFD")[0];
  return ROWS.find(([, chars]) => chars.includes(ch))?.[0] ?? "英数";
}

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

export function filterFurniture(items: FurnitureItem[], opts: { query: string; code: number | null }): FurnitureItem[] {
  const q = normalizeKana(opts.query.trim());
  return items.filter(
    (i) =>
      (opts.code == null || i.favorites.includes(opts.code)) &&
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

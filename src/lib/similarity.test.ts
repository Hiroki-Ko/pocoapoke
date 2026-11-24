import { describe, it, expect } from "vitest";
import { sharedFavorites, findSimilar, townAffinity } from "./similarity";
import type { Pokemon } from "../types";

function poke(id: number, number: number, favs: (number | null)[], town = 1): Pokemon {
  return {
    id, category: "main", number, local_number: null, name: `P${id}`, specialty1: null, specialty2: null, environment: null,
    favorites: [], favorite_ids: favs, show_in_progress: 1,
    status: {
      status_code: null, today_wish: null, status_code_id: null, place_code_id: town, cared_on: null, wish_favorite: null, wish_on: null,
      place_code: { id: 200 + town, code: town, label: `T${town}`, class: "place" },
    },
  };
}

describe("similarity", () => {
  const target = poke(1, 1, [10, 11, 12, null, null, 3]);
  it("味（6番目）が同じでも数えない", () => {
    expect(sharedFavorites(target, poke(2, 2, [20, 21, 22, 23, 24, 3]))).toEqual([]);
  });
  it("共通の好きなものを target の並び順で返す", () => {
    expect(sharedFavorites(target, poke(2, 2, [12, 10, 30, 31, 32, 4]))).toEqual([10, 12]);
  });
  it("findSimilar は自分と共通0件を除き、共通数の降順・同数は番号順", () => {
    const all = [
      target,
      poke(2, 9, [10, 40, 41, 42, 43, 1]),       // 1件
      poke(3, 5, [10, 11, 12, 44, 45, 1]),       // 3件
      poke(4, 3, [11, 46, 47, 48, 49, 1]),       // 1件
      poke(5, 4, [50, 51, 52, 53, 54, 3]),       // 0件
    ];
    const r = findSimilar(target, all);
    expect(r.map((x) => x.pokemon.id)).toEqual([3, 4, 2]);
    expect(r[0].shared).toEqual([10, 11, 12]);
  });
  it("townAffinity は未登録(0)を除き件数の降順", () => {
    const r = findSimilar(target, [target, poke(2, 2, [10], 2), poke(3, 3, [11], 2), poke(4, 4, [12], 3), poke(5, 5, [10], 0)]);
    expect(townAffinity(r)).toEqual([{ town: 2, count: 2 }, { town: 3, count: 1 }]);
  });
});

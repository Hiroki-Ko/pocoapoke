import { describe, it, expect } from "vitest";
import { townCode, evalCode, isCared, todayWish, wishOptions, groupByEval } from "./progress";
import type { MasterItem, Pokemon, PokemonStatus } from "../types";

const NOW = new Date("2026-11-26T01:00:00Z"); // JST 10:00 → ゲーム日付 2026-11-26
const m = (id: number, code: number, cls: string, label = `${cls}${code}`): MasterItem => ({ id, code, label, class: cls });

function poke(id: number, number: number, evCode: number | null, extra: Partial<PokemonStatus> = {}, favIds: (number | null)[] = [10, 11, 12, 13, 14, 3]): Pokemon {
  return {
    id, category: "main", number, local_number: null, name: `P${id}`,
    specialty1: null, specialty2: null, environment: null, favorites: [], favorite_ids: favIds, show_in_progress: 1,
    status: evCode === null ? null : {
      status_code: m(100 + evCode, evCode, "evaluation"), place_code: m(200, 2, "place"),
      status_code_id: 100 + evCode, place_code_id: 200, cared_on: null, wish_favorite: null, wish_on: null, ...extra,
    },
  };
}

describe("progress", () => {
  it("groupByEval は低い順で空グループを除き、グループ内は番号順", () => {
    const list = [poke(1, 5, 1), poke(2, 3, 5), poke(3, 1, 5), poke(4, 2, 0)];
    const g = groupByEval(list);
    expect(g.map((x) => x.code)).toEqual([0, 5, 1]);
    expect(g[1].items.map((p) => p.id)).toEqual([3, 2]);
  });
  it("status が無いポケモンは未登録扱い", () => {
    const p = poke(1, 1, null);
    expect(townCode(p)).toBe(0);
    expect(evalCode(p)).toBe(0);
    expect(isCared(p, NOW)).toBe(false);
    expect(todayWish(p, NOW)).toBeNull();
  });
  it("お世話チェックは今日のゲーム日付のときだけ", () => {
    expect(isCared(poke(1, 1, 3, { cared_on: "2026-11-26" }), NOW)).toBe(true);
    expect(isCared(poke(1, 1, 3, { cared_on: "2026-11-25" }), NOW)).toBe(false);
  });
  it("欲しいものは今日入力したものだけ", () => {
    const wish = m(12, 9, "favorite", "せいけつ");
    expect(todayWish(poke(1, 1, 3, { wish_favorite: wish, wish_on: "2026-11-25" }), NOW)).toBeNull();
    expect(todayWish(poke(1, 1, 3, { wish_favorite: wish, wish_on: "2026-11-26" }), NOW)).toEqual(wish);
  });
  it("wishOptions は favorite1〜5 の登録済みのみ（味は含まない）", () => {
    const favs = [m(10, 7, "favorite"), m(12, 9, "favorite"), m(3, 3, "favorite")];
    const p = poke(1, 1, 3, {}, [10, null, 12, null, null, 3]);
    expect(wishOptions(p, favs).map((x) => x.id)).toEqual([10, 12]);
  });
});

describe("wishOptions（今日の欲しいものが好きなものから外れた場合）", () => {
  it("今日の欲しいものが好きなもの以外でも、選択肢の最後に残す", () => {
    const favs = [m(10, 7, "favorite"), m(12, 9, "favorite"), m(99, 30, "favorite", "外れた")];
    const p = poke(1, 1, 3, { wish_favorite: m(99, 30, "favorite", "外れた"), wish_on: "2026-11-26" }, [10, null, 12, null, null, 3]);
    expect(wishOptions(p, favs, NOW).map((x) => x.id)).toEqual([10, 12, 99]);
  });
  it("昨日の欲しいものは残さない", () => {
    const favs = [m(10, 7, "favorite"), m(99, 30, "favorite")];
    const p = poke(1, 1, 3, { wish_favorite: m(99, 30, "favorite"), wish_on: "2026-11-25" }, [10, null, null, null, null, 3]);
    expect(wishOptions(p, favs, NOW).map((x) => x.id)).toEqual([10]);
  });
});

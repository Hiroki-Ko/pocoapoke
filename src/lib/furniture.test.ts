import { describe, it, expect } from "vitest";
import { favoriteCodes, normalizeKana, filterFurniture, rankFurniture, pokemonWhoLike, tagLabel, hasKanji, applyLocalNames, usedTags } from "./furniture";
import type { FurnitureItem, MasterItem, Pokemon } from "../types";

// master_code favorite: id = 100 + code（味は code 1〜5）
const fav = (code: number): MasterItem => ({ id: 100 + code, code, label: `f${code}`, class: "favorite" });
const favById = new Map([1, 3, 17, 39, 45, 47].map((c) => [100 + c, fav(c)]));
const WOOD = 45, SOFT = 47, CUTE = 17, ROUND = 39;

function poke(id: number, number: number, codes: (number | null)[], taste: number | null = 103): Pokemon {
  const ids = codes.map((c) => (c == null ? null : 100 + c));
  while (ids.length < 5) ids.push(null);
  return {
    id, category: "main", number, local_number: null, name: `P${id}`,
    specialty1: null, specialty2: null, environment: null, favorites: [],
    favorite_ids: [...ids, taste], show_in_progress: 1, status: null,
  };
}
const item = (slug: string, name: string, favorites: number[], en = slug): FurnitureItem => ({ slug, name, en, tag: "relaxation", favorites, image: null });

describe("favoriteCodes", () => {
  it("先頭 5 つを code にし、null・不明 id・味の位置は除く", () => {
    const p = poke(1, 1, [WOOD, SOFT, null]);
    p.favorite_ids = [145, 147, null, 999, 117, 101];
    expect(favoriteCodes(p, favById)).toEqual([WOOD, SOFT, CUTE]);
  });
});

describe("normalizeKana", () => {
  it("ひらがなとカタカナを同じにする", () => {
    expect(normalizeKana("いす")).toBe(normalizeKana("イス"));
  });
  it("全角英字を半角小文字にする", () => {
    expect(normalizeKana("ＡＢｃ")).toBe("abc");
  });
});

describe("filterFurniture", () => {
  const items = [item("log-chair", "まるたのイス", [WOOD]), item("soft-seat", "ふかふかイス", [SOFT], "Soft seat"), item("bell", "かね", [ROUND])];
  it("ひらがなで検索してもカタカナの名前に当たる", () => {
    expect(filterFurniture(items, { query: "いす", code: null, tag: null }).map((i) => i.slug)).toEqual(["log-chair", "soft-seat"]);
  });
  it("英語名でも当たる", () => {
    expect(filterFurniture(items, { query: "SOFT", code: null, tag: null }).map((i) => i.slug)).toEqual(["soft-seat"]);
  });
  it("属性を指定するとその属性を持つものだけ", () => {
    expect(filterFurniture(items, { query: "", code: WOOD, tag: null }).map((i) => i.slug)).toEqual(["log-chair"]);
  });
  it("空の検索・属性なしなら全件", () => {
    expect(filterFurniture(items, { query: " ", code: null, tag: null })).toHaveLength(3);
  });
});

describe("rankFurniture", () => {
  const a = poke(1, 1, [WOOD, SOFT]);
  const b = poke(2, 2, [WOOD]);
  const picks = [a, b].map((p) => ({ pokemon: p, codes: favoriteCodes(p, favById) }));

  it("当てはまりの合計が多い順。当てはまり 0 は出さない", () => {
    const x = item("x", "エックス", [WOOD, SOFT]);
    const y = item("y", "ワイ", [WOOD]);
    const z = item("z", "ゼット", [CUTE]);
    const r = rankFurniture([y, z, x], picks);
    expect(r.map((v) => v.item.slug)).toEqual(["x", "y"]);
    expect(r[0].total).toBe(3);
    expect(r[0].kinds).toEqual([WOOD, SOFT]);
    expect(r[0].perPokemon).toEqual([{ pokemon: a, codes: [WOOD, SOFT] }, { pokemon: b, codes: [WOOD] }]);
    expect(r[1].total).toBe(2);
    expect(r[1].kinds).toEqual([WOOD]);
  });

  it("合計が同じなら種類が多い方、さらに同じなら名前順", () => {
    const single = [{ pokemon: poke(3, 3, [WOOD, SOFT, CUTE]), codes: [WOOD, SOFT, CUTE] }];
    const p = item("p", "いいい", [WOOD, SOFT]);
    const q = item("q", "ああ", [WOOD, CUTE]);
    const s = item("s", "うう", [CUTE]);
    expect(rankFurniture([s, p, q], single).map((v) => v.item.slug)).toEqual(["q", "p", "s"]);
  });

  it("好きなものが空のポケモンだけなら結果は空", () => {
    expect(rankFurniture([item("x", "x", [WOOD])], [{ pokemon: poke(4, 4, []), codes: [] }])).toEqual([]);
  });
});

describe("pokemonWhoLike", () => {
  it("その属性が好きなポケモンを番号順で返し、味の位置は対象外", () => {
    const p1 = poke(1, 30, [WOOD]);
    const p2 = poke(2, 10, [SOFT, WOOD]);
    const p3 = poke(3, 5, [SOFT], 145); // 味の位置に木製（対象外）
    expect(pokemonWhoLike(WOOD, [p1, p2, p3], favById).map((p) => p.id)).toEqual([2, 1]);
  });
});

describe("種類（tag）", () => {
  it("tagLabel は英語の分類を日本語にし、空はそのほか", () => {
    expect(["decoration", "toy", "relaxation", "food", "road", ""].map(tagLabel)).toEqual(["かざりつけ", "おもちゃ", "きゅうけい", "たべもの", "どうろ", "そのほか"]);
  });
  it("filterFurniture は tag で絞り込み、空文字はそのほか", () => {
    const items = [{ ...item("a", "あ", [WOOD]), tag: "toy" }, { ...item("b", "い", [WOOD]), tag: "" }];
    expect(filterFurniture(items, { query: "", code: null, tag: "toy" }).map((i) => i.slug)).toEqual(["a"]);
    expect(filterFurniture(items, { query: "", code: null, tag: "" }).map((i) => i.slug)).toEqual(["b"]);
    expect(filterFurniture(items, { query: "", code: null, tag: null })).toHaveLength(2);
  });
});

describe("hasKanji", () => {
  it("漢字・々を見つけ、かな・カナ・英数字は false", () => {
    expect(hasKanji("木のベッド")).toBe(true);
    expect(hasKanji("ひとびと々")).toBe(true);
    expect(hasKanji("きのベッド ABC 1")).toBe(false);
  });
});

describe("applyLocalNames", () => {
  const items = [item("a", "かね", [WOOD]), { ...item("z", "Zebra rug", [WOOD]), noJa: true }, { ...item("y", "Yarn", [WOOD]), noJa: true }];
  it("日本語名がない家具だけ入力名にし、入力済みの印を付けて日本語名順に並べ直す", () => {
    const r = applyLocalNames(items, { z: "あみもの", a: "ちがうなまえ" });
    // 英語名の家具（noJa）は画面で別枠に出すので、日本語名どうしの順番だけ確かめる
    expect(r.filter((i) => !i.noJa).map((i) => [i.slug, i.name, !!i.localName])).toEqual([
      ["z", "あみもの", true],
      ["a", "かね", false],
    ]);
    expect(r.find((i) => i.slug === "y")).toMatchObject({ name: "Yarn", noJa: true });
  });
});

describe("usedTags", () => {
  it("家具がある種類だけを TAG_LABEL の順で返す", () => {
    const items = [{ ...item("a", "あ", [WOOD]), tag: "toy" }, { ...item("b", "い", [WOOD]), tag: "" }, { ...item("c", "う", [WOOD]), tag: "toy" }];
    expect(usedTags(items)).toEqual(["toy", ""]);
  });
});

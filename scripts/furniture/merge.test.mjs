import { describe, it, expect } from "vitest";
import { mergeFurniture } from "./merge.mjs";

const favMap = { "Wooden stuff": 45, "Soft stuff": 47, "Cute stuff": 17 };
const item = (en, tag, favorites) => ({ en, slug: en.toLowerCase().replace(/[^a-z0-9]+/g, "-"), tag, image: `https://example.com/${en}.png`, favorites });

describe("mergeFurniture", () => {
  it("分類なし（素材など）は除外する", () => {
    const { items, missing } = mergeFurniture([item("Lumber", null, ["Wooden stuff"])], { lumber: "ざいもく" }, favMap);
    expect(items).toEqual([]);
    expect(missing).toEqual([]);
  });

  it("分類なしでも allow に入っている家具は残す", () => {
    const { items } = mergeFurniture([item("Plain table", null, ["Wooden stuff"])], { "plain-table": "ナチュラルなテーブル" }, favMap, ["Plain table"]);
    expect(items.map((i) => i.name)).toEqual(["ナチュラルなテーブル"]);
    expect(items[0].tag).toBe("");
  });

  it("favorites を code に変換し昇順にする", () => {
    const { items } = mergeFurniture([item("Soft seat", "relaxation", ["Soft stuff", "Wooden stuff"])], { "soft-seat": "ふかふかイス" }, favMap);
    expect(items[0]).toEqual({ slug: "soft-seat", name: "ふかふかイス", en: "Soft seat", tag: "relaxation", favorites: [45, 47], image: "soft-seat.png" });
  });

  it("日本語名が無いものは英語名で noJa を付けて items に入れ、missing にも no-name で出す", () => {
    const { items, missing } = mergeFurniture([item("Wiggly mirror", "toy", ["Cute stuff"])], {}, favMap);
    expect(items).toEqual([{ slug: "wiggly-mirror", name: "Wiggly mirror", en: "Wiggly mirror", tag: "toy", favorites: [17], image: "wiggly-mirror.png", noJa: true }]);
    expect(missing).toEqual([{ slug: "wiggly-mirror", reason: "no-name" }]);
  });

  it("漢字をふくむ日本語名は kanji に出す（かな・カナにそろえるため）", () => {
    const { kanji } = mergeFurniture([item("Wooden bed", "relaxation", ["Wooden stuff"])], { "wooden-bed": "木のベッド" }, favMap);
    expect(kanji).toEqual([{ slug: "wooden-bed", name: "木のベッド" }]);
  });

  it("op.gg のスラッグの表記ゆれ（記号の有無）でも日本語名を見つける", () => {
    const { items } = mergeFurniture([item("Ship's Wheel", "toy", ["Cute stuff"])].map((i) => ({ ...i, slug: "ships-wheel" })), { "ship-s-wheel": "船の舵" }, favMap);
    expect(items[0].name).toBe("船の舵");
  });

  it("日本語名の順に並ぶ", () => {
    const { items } = mergeFurniture(
      [item("Barrel", "decoration", ["Wooden stuff"]), item("Bell", "toy", ["Cute stuff"])],
      { barrel: "タル", bell: "かね" },
      favMap,
    );
    expect(items.map((i) => i.name)).toEqual(["かね", "タル"]);
  });

  it("hasImage が false の家具は image を null にする（作り直しても画像なしのまま）", () => {
    const { items } = mergeFurniture([item("Bell", "toy", ["Cute stuff"])], { bell: "かね" }, favMap, [], () => false);
    expect(items[0].image).toBeNull();
  });
});

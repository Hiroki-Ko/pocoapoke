import { describe, it, expect } from "vitest";
import { spriteKey, iconSrc } from "./icons";
import customIcons from "../data/customIcons.json";

describe("spriteKey", () => {
  it.each([
    ["フシギダネ", "1"],
    ["ナゾノクサ", "43"],
    ["カラナクシ(にしのうみ)", "422"],
    ["カラナクシ(ひがしのうみ)", "422-east"],
    ["トリトドン(にしのうみ)", "423"],
    ["トリトドン(ひがしのうみ)", "423-east"],
    ["ウパー(パルデア)", "10253"],
    ["シャリタツ(そったすがた)", "978"],
    ["シャリタツ(たれたすがた)", "10258"],
    ["シャリタツ(のびたすがた)", "10259"],
    ["ストリンダー(ハイ)", "849"],
    ["ストリンダー(ロー)", "10184"],
    ["モジャンボ(はかせ)", "465"], // 独自の姿は元のポケモン
    ["カビゴン(こけむし)", "143"],
    ["ポリゴン2", "233"], // 全角/半角の違いを吸収
    ["ポリゴンZ", "474"],
    ["デンジムシ", "737"], // 登録データの表記（正式名はデンヂムシ）
    ["プルリル(ピンク)", "female-592"], // ピンクはメスの画像
    ["ブルンゲル(ピンク)", "female-593"],
    ["ブルンゲル(水色)", "593"],
    ["存在しないポケモン", null],
  ])("%s → %s", (name, key) => expect(spriteKey(name)).toBe(key));
});

describe("iconSrc", () => {
  it("通常はトリム済みスプライト", () => {
    expect(iconSrc({ id: 9999, name: "フシギダネ" })).toBe("/icons/1.png");
  });
  it("名前が解決できなければ null", () => {
    expect(iconSrc({ id: 9999, name: "存在しないポケモン" })).toBeNull();
  });
  it("customIcons にある id はユーザー提供画像を優先", () => {
    (customIcons as number[]).push(77);
    expect(iconSrc({ id: 77, name: "フシギダネ" })).toBe("/icons/custom/77.png");
    (customIcons as number[]).pop();
  });
});

describe("iconSrc（名前で決まるゲーム内アイコン）", () => {
  it("未登録のカジッチュでもゲーム内アイコンが出る", () => {
    expect(iconSrc({ id: 9999, name: "カジッチュ" })).toBe("/icons/custom/key-840.png");
  });
  it("ブルンゲル(水色)・ブルンゲルはゲーム内アイコン、ピンクはメスの画像", () => {
    expect(iconSrc({ id: 9999, name: "ブルンゲル(水色)" })).toBe("/icons/custom/key-593.png");
    expect(iconSrc({ id: 9999, name: "ブルンゲル" })).toBe("/icons/custom/key-593.png");
    expect(iconSrc({ id: 9999, name: "ブルンゲル(ピンク)" })).toBe("/icons/custom/key-female-593.png");
  });
});

describe("iconSrc（ブルンゲル・プルリルは登録済みでも名前で色を判定）", () => {
  it("ID 359 でも名前がピンクならピンクの画像", () => {
    expect(iconSrc({ id: 359, name: "ブルンゲル(ピンク)" })).toBe("/icons/custom/key-female-593.png");
    expect(iconSrc({ id: 359, name: "ブルンゲル(水色)" })).toBe("/icons/custom/key-593.png");
  });
  it("ID 348 でも名前がピンクならピンクの画像", () => {
    expect(iconSrc({ id: 348, name: "プルリル(ピンク)" })).toBe("/icons/custom/key-female-592.png");
  });
});

describe("iconSrc（図鑑に合わせた名前・すがた違いのゲーム内アイコン）", () => {
  it.each([
    ["ブルンゲル(オスのすがた)", "/icons/custom/key-593.png"],
    ["ブルンゲル(メスのすがた)", "/icons/custom/key-female-593.png"],
    ["プルリル(オスのすがた)", "/icons/custom/key-592.png"],
    ["プルリル(メスのすがた)", "/icons/custom/key-female-592.png"],
    ["ストリンダー(ローなすがた)", "/icons/custom/key-10184.png"],
    ["シャリタツ(たれたすがた)", "/icons/custom/key-10258.png"],
    ["シャリタツ(のびたすがた)", "/icons/custom/key-10259.png"],
    ["カラナクシ(ひがしのうみ)", "/icons/custom/key-422-east.png"],
    ["トリトドン(ひがしのうみ)", "/icons/custom/key-423-east.png"],
    ["モジャンボ", "/icons/custom/key-465.png"],
    ["ピカチュウ", "/icons/custom/key-25.png"],
    ["カビゴン", "/icons/custom/key-143.png"],
  ])("%s → %s", (name, src) => expect(iconSrc({ id: 9999, name })).toBe(src));
  it("ストリンダー(ハイなすがた) は通常のハイ", () => expect(spriteKey("ストリンダー(ハイなすがた)")).toBe("849"));
});

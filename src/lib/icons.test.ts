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
    ["存在しないポケモン", null],
  ])("%s → %s", (name, key) => expect(spriteKey(name)).toBe(key));
});

describe("iconSrc", () => {
  it("通常はトリム済みスプライト", () => {
    expect(iconSrc({ id: 1, name: "フシギダネ" })).toBe("/icons/1.png");
  });
  it("名前が解決できなければ null", () => {
    expect(iconSrc({ id: 1, name: "存在しないポケモン" })).toBeNull();
  });
  it("customIcons にある id はユーザー提供画像を優先", () => {
    (customIcons as number[]).push(77);
    expect(iconSrc({ id: 77, name: "フシギダネ" })).toBe("/icons/custom/77.png");
    (customIcons as number[]).pop();
  });
});

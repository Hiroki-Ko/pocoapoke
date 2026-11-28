import { describe, it, expect, beforeEach } from "vitest";
import { loadNames, saveName, exportNames } from "./localNames";

const KEY = "pocoapoke.furniture.names";
const store: Record<string, string> = {};
beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  globalThis.localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => void (store[k] = v),
    removeItem: (k: string) => void delete store[k],
  } as unknown as Storage;
});

describe("localNames", () => {
  it("壊れた JSON なら空として読む", () => {
    store[KEY] = "{broken";
    expect(loadNames()).toEqual({});
  });
  it("localStorage が使えなくても落ちない", () => {
    globalThis.localStorage = { getItem: () => { throw new Error("x"); }, setItem: () => { throw new Error("x"); } } as unknown as Storage;
    expect(loadNames()).toEqual({});
    expect(saveName("a", "あ")).toEqual({ a: "あ" });
  });
  it("前後の空白を削って保存し、空なら削除する", () => {
    expect(saveName("a", "  あみもの ")).toEqual({ a: "あみもの" });
    expect(JSON.parse(store[KEY])).toEqual({ a: "あみもの" });
    expect(saveName("a", "  ")).toEqual({});
  });
  it("exportNames は slug 順に slug=名前 を改行区切り", () => {
    expect(exportNames({ b: "い", a: "あ" })).toBe("a=あ\nb=い");
  });
});

describe("localNames の中身の確認", () => {
  it("文字列でない値は捨て、文字列は前後の空白を削って読む", () => {
    store[KEY] = JSON.stringify({ a: 123, b: " い ", c: "" });
    expect(loadNames()).toEqual({ b: "い" });
  });
});

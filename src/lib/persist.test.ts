import { describe, it, expect, beforeEach } from "vitest";
import { loadState, saveState, isNumOrNull } from "./persist";

const store: Record<string, string> = {};
beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  globalThis.localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => void (store[k] = v),
  } as unknown as Storage;
});

describe("画面ごとの絞り込みを残す", () => {
  it("保存した値を読み戻す", () => {
    saveState("k", { town: 3 });
    expect(loadState("k", { town: null }, (v): v is { town: number | null } => isNumOrNull((v as { town: unknown }).town))).toEqual({ town: 3 });
  });
  it("無い・壊れている・形がちがうときは最初の値", () => {
    const ok = (v: unknown): v is string => typeof v === "string";
    expect(loadState("none", "あ", ok)).toBe("あ");
    store.bad = "{broken";
    expect(loadState("bad", "あ", ok)).toBe("あ");
    store.wrong = JSON.stringify(123);
    expect(loadState("wrong", "あ", ok)).toBe("あ");
  });
  it("localStorage が使えなくても落ちない", () => {
    globalThis.localStorage = { getItem: () => { throw new Error("x"); }, setItem: () => { throw new Error("x"); } } as unknown as Storage;
    expect(loadState("k", 1, (v): v is number => typeof v === "number")).toBe(1);
    expect(() => saveState("k", 2)).not.toThrow();
  });
  it("isNumOrNull は整数か null だけ", () => {
    expect([1, null, 0, 1.5, "1", undefined].map(isNumOrNull)).toEqual([true, true, true, false, false, false]);
  });
});

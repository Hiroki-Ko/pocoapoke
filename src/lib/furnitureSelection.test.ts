import { describe, it, expect, beforeEach } from "vitest";
import { loadSelection, saveSelection, withPoke } from "./furnitureSelection";

const KEY = "pocoapoke.furniture.selection";
const store: Record<string, string> = {};
beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  globalThis.localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => void (store[k] = v),
  } as unknown as Storage;
});

describe("家具さがしの選択（ほかの画面に移っても残す）", () => {
  it("保存したモードとポケモンを読み戻す", () => {
    saveSelection({ mode: "pokemon", ids: [3, 1] });
    expect(loadSelection()).toEqual({ mode: "pokemon", ids: [3, 1] });
  });
  it("何も無い・壊れている・数でない id は、家具から・選択なしにする", () => {
    expect(loadSelection()).toEqual({ mode: "items", ids: [] });
    store[KEY] = "{broken";
    expect(loadSelection()).toEqual({ mode: "items", ids: [] });
    store[KEY] = JSON.stringify({ mode: "x", ids: [1, "2", 1.5, -1, 4] });
    expect(loadSelection()).toEqual({ mode: "items", ids: [1, 4] });
  });
  it("localStorage が使えなくても落ちない", () => {
    globalThis.localStorage = { getItem: () => { throw new Error("x"); }, setItem: () => { throw new Error("x"); } } as unknown as Storage;
    expect(loadSelection()).toEqual({ mode: "items", ids: [] });
    expect(() => saveSelection({ mode: "pokemon", ids: [1] })).not.toThrow();
  });
  it("住みごこちから来たポケモンは今の選択に足し、ポケモンからを開く（重ねて足さない）", () => {
    expect(withPoke({ mode: "items", ids: [1, 2] }, 5)).toEqual({ mode: "pokemon", ids: [1, 2, 5] });
    expect(withPoke({ mode: "items", ids: [1, 2] }, 2)).toEqual({ mode: "pokemon", ids: [1, 2] });
  });
});

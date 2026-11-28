// 家具さがしの「家具から／ポケモンから」と選んだポケモン。ほかの画面に移っても残し、住みごこち画面で目立たせる
export type Selection = { mode: "items" | "pokemon"; ids: number[] };

const KEY = "pocoapoke.furniture.selection";
const EMPTY: Selection = { mode: "items", ids: [] };

export function loadSelection(): Selection {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (!v || typeof v !== "object") return EMPTY;
    const ids = Array.isArray(v.ids) ? v.ids.filter((x: unknown): x is number => typeof x === "number" && Number.isInteger(x) && x > 0) : [];
    return { mode: v.mode === "pokemon" ? "pokemon" : "items", ids };
  } catch {
    return EMPTY;
  }
}

export function saveSelection(s: Selection): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 保存できなくても画面は動かす */
  }
}

// 住みごこち画面の「家具をさがす」から来たポケモンを、今の選択に足す
export function withPoke(s: Selection, id: number): Selection {
  return { mode: "pokemon", ids: s.ids.includes(id) ? s.ids : [...s.ids, id] };
}

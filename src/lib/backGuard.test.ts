import { describe, it, expect } from "vitest";
import { installBackGuard, registerBackHandler } from "./backGuard";

// pushState / back / popstate だけを持つ簡易ブラウザ
function fakeWindow(url = "/") {
  const entries: { state: unknown; url: string }[] = [{ state: { idx: 0 }, url }];
  let i = 0;
  const listeners: Record<string, ((e: unknown) => void)[]> = {};
  const win = {
    document: { activeElement: null as null | { tagName: string; isContentEditable?: boolean; blur: () => void } },
    history: {
      get state() {
        return entries[i].state;
      },
      pushState(state: unknown, _t: string, u?: string) {
        entries.splice(i + 1);
        entries.push({ state, url: u ?? entries[i].url });
        i++;
      },
    },
    location: {
      get href() {
        return entries[i].url;
      },
    },
    addEventListener: (t: string, f: (e: unknown) => void) => (listeners[t] ??= []).push(f),
    removeEventListener: (t: string, f: (e: unknown) => void) => (listeners[t] = (listeners[t] ?? []).filter((x) => x !== f)),
    back() {
      if (i > 0) i--;
      (listeners.popstate ?? []).forEach((f) => f({}));
    },
    navigate(u: string) {
      this.history.pushState({ idx: i + 1 }, "", u);
    },
    get url() {
      return entries[i].url;
    },
    get depth() {
      return i;
    },
  };
  return win;
}

describe("installBackGuard", () => {
  it("戻るを押しても同じ画面のまま（アプリから出ない）", () => {
    const w = fakeWindow("/furniture");
    const guard = installBackGuard(w as unknown as Window);
    w.back();
    w.back();
    expect(w.url).toBe("/furniture");
    expect(w.depth).toBeGreaterThan(0);
    guard.cleanup();
  });

  it("アプリ内で画面を移ったあとも、戻るで前の画面に戻らない", () => {
    const w = fakeWindow("/");
    const guard = installBackGuard(w as unknown as Window);
    w.navigate("/progress");
    guard.onNavigate();
    w.back();
    expect(w.url).toBe("/progress");
    guard.cleanup();
  });

  it("元の履歴の state（画面の状態）を守る", () => {
    const w = fakeWindow("/");
    installBackGuard(w as unknown as Window);
    expect(w.history.state).toMatchObject({ idx: 0 });
  });
});

describe("戻るで閉じるもの", () => {
  it("パネルが開いているときは、戻るでパネルを閉じるだけ（画面はそのまま）", () => {
    const w = fakeWindow("/furniture");
    const guard = installBackGuard(w as unknown as Window);
    let closed = 0;
    const off = registerBackHandler(() => closed++);
    w.back();
    expect(closed).toBe(1);
    expect(w.url).toBe("/furniture");
    off();
    w.back();
    expect(closed).toBe(1);
    guard.cleanup();
  });

  it("後から開いたパネルから閉じる", () => {
    const w = fakeWindow("/");
    const guard = installBackGuard(w as unknown as Window);
    const log: string[] = [];
    const offA = registerBackHandler(() => log.push("A"));
    const offB = registerBackHandler(() => log.push("B"));
    w.back();
    expect(log).toEqual(["B"]);
    offA();
    offB();
    guard.cleanup();
  });

  it("入力中（キーボードが出ている）は、戻るで入力を終えるだけでパネルは閉じない", () => {
    const w = fakeWindow("/");
    const guard = installBackGuard(w as unknown as Window);
    let closed = 0;
    let blurred = 0;
    const off = registerBackHandler(() => closed++);
    w.document.activeElement = { tagName: "INPUT", blur: () => { blurred++; w.document.activeElement = null; } };
    w.back();
    expect(blurred).toBe(1);
    expect(closed).toBe(0);
    w.back();
    expect(closed).toBe(1);
    off();
    guard.cleanup();
  });
});

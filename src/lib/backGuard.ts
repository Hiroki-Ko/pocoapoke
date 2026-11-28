// スマホの戻るボタン（ジェスチャー）を効かなくする。
// 今の画面と同じ URL の「見張り」の履歴を1つ上に積んでおき、戻るで見張りが外れたらまた積み直す。
// 戻った先は同じ画面なので、表示は変わらず、アプリからも出ない。
// 戻るで先に閉じたいもの（パネルなど）。後から開いたものから閉じる
type Guard = { onNavigate: () => void; cleanup: () => void };

const KEY = "pocoGuard";
const handlers: (() => void)[] = [];

export function registerBackHandler(fn: () => void): () => void {
  handlers.push(fn);
  return () => {
    const i = handlers.lastIndexOf(fn);
    if (i >= 0) handlers.splice(i, 1);
  };
}

type Focusable = { tagName: string; isContentEditable?: boolean; blur: () => void };
const isEditing = (el: Focusable | null) => !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || !!el.isContentEditable);

export function installBackGuard(win: Window): Guard {
  const isGuard = () => {
    const s = win.history.state as Record<string, unknown> | null;
    return !!s && s[KEY] === true;
  };
  // 元の state（画面の状態）はそのまま写して、見張りの印だけ足す
  const push = () => win.history.pushState({ ...(win.history.state ?? {}), [KEY]: true }, "", win.location.href);
  const ensure = () => {
    if (!isGuard()) push();
  };

  const onPop = () => {
    ensure();
    // 1. 入力中（キーボードが出ている）なら、入力を終えるだけ
    const active = win.document?.activeElement as Focusable | null;
    if (isEditing(active)) return active!.blur();
    // 2. パネルなどが開いていれば、それを閉じるだけ
    handlers[handlers.length - 1]?.();
  };
  // Chrome は操作の前に積んだ履歴を戻るで飛ばすことがあるので、最初に触ったときにもう1つ積む
  let touched = false;
  const onFirstTouch = () => {
    if (touched) return;
    touched = true;
    push();
  };

  ensure();
  win.addEventListener("popstate", onPop);
  win.addEventListener("pointerdown", onFirstTouch);
  win.addEventListener("keydown", onFirstTouch);

  return {
    onNavigate: ensure, // アプリ内で画面を移ったら（新しい履歴ができたら）見張りを積み直す
    cleanup: () => {
      win.removeEventListener("popstate", onPop);
      win.removeEventListener("pointerdown", onFirstTouch);
      win.removeEventListener("keydown", onFirstTouch);
    },
  };
}

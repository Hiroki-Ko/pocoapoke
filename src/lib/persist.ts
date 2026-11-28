// 画面ごとの絞り込み（住んでる街など）をブラウザに残す。ほかの画面に移っても、アプリを開き直しても同じ状態で開く
import { useEffect, useState } from "react";

export function loadState<T>(key: string, fallback: T, isValid: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const v: unknown = JSON.parse(raw);
    return isValid(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

export function saveState(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 保存できなくても画面は動かす */
  }
}

export const isNumOrNull = (v: unknown): v is number | null => v === null || (typeof v === "number" && Number.isInteger(v));

// useState と同じ使い方で、値が変わるたびに保存する
export function usePersistentState<T>(key: string, fallback: T, isValid: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(() => loadState(key, fallback, isValid));
  useEffect(() => saveState(key, value), [key, value]);
  return [value, setValue] as const;
}

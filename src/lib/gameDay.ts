// ゲーム内の「1日」は日本時間の午前4時に切り替わる。
// 端末のタイムゾーンに関係なく、UTC+9 固定で計算する。
const OFFSET_MS = (9 - 4) * 60 * 60 * 1000;

export function gameDay(now: Date = new Date()): string {
  return new Date(now.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

export function isToday(date: string | null | undefined, now: Date = new Date()): boolean {
  return !!date && date === gameDay(now);
}

const DAY_MS = 24 * 60 * 60 * 1000;

// 次のゲーム日付の切り替え（JST 4:00）までのミリ秒
export function msUntilNextGameDay(now: Date = new Date()): number {
  const shifted = now.getTime() + OFFSET_MS;
  return DAY_MS - (((shifted % DAY_MS) + DAY_MS) % DAY_MS);
}

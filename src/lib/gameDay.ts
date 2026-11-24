// ゲーム内の「1日」は日本時間の午前4時に切り替わる。
// 端末のタイムゾーンに関係なく、UTC+9 固定で計算する。
const OFFSET_MS = (9 - 4) * 60 * 60 * 1000;

export function gameDay(now: Date = new Date()): string {
  return new Date(now.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

export function isToday(date: string | null | undefined, now: Date = new Date()): boolean {
  return !!date && date === gameDay(now);
}

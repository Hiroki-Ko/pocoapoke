import { describe, it, expect } from "vitest";
import { gameDay, isToday } from "./gameDay";

describe("gameDay", () => {
  it("JST 4:00 で日付が切り替わる", () => {
    expect(gameDay(new Date("2026-11-25T18:59:59Z"))).toBe("2026-11-25"); // JST 11/26 03:59:59
    expect(gameDay(new Date("2026-11-25T19:00:00Z"))).toBe("2026-11-26"); // JST 11/26 04:00
  });
  it("端末のタイムゾーンに依存しない", () => {
    expect(gameDay(new Date("2026-11-25T23:00:00-08:00"))).toBe("2026-11-26"); // JST 11/26 16:00
  });
  it("isToday", () => {
    const now = new Date("2026-11-26T01:00:00Z"); // JST 10:00
    expect(isToday("2026-11-26", now)).toBe(true);
    expect(isToday("2026-11-25", now)).toBe(false);
    expect(isToday(null, now)).toBe(false);
  });
});

import { msUntilNextGameDay } from "./gameDay";
describe("msUntilNextGameDay", () => {
  it("JST 3:59:00 なら 60秒後", () => {
    expect(msUntilNextGameDay(new Date("2026-11-25T18:59:00Z"))).toBe(60_000);
  });
  it("JST 4:00 ちょうどなら 24時間後", () => {
    expect(msUntilNextGameDay(new Date("2026-11-25T19:00:00Z"))).toBe(24 * 3600_000);
  });
});

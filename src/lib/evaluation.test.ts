import { describe, it, expect } from "vitest";
import { evalStyle, EVAL_ORDER_LOW_FIRST } from "./evaluation";

describe("evaluation", () => {
  it("最高は赤・白文字", () => expect(evalStyle(1)).toEqual({ bg: "#FF4D4D", fg: "#fff" }));
  it("ちょっといいは黒文字", () => expect(evalStyle(3).fg).toBe("#333"));
  it("未知のコードは未登録の色", () => expect(evalStyle(99)).toEqual(evalStyle(0)));
  it("低い順", () => expect(EVAL_ORDER_LOW_FIRST).toEqual([0, 6, 5, 4, 3, 2, 1]));
});

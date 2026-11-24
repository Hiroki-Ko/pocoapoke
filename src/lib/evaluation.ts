// 住みごこち（master_code class=evaluation の code）の色と並び順
const STYLES: Record<number, { bg: string; fg: string }> = {
  0: { bg: "#E0E0E0", fg: "#333" }, // 未登録
  1: { bg: "#FF4D4D", fg: "#fff" }, // 最高
  2: { bg: "#FF8C42", fg: "#fff" }, // めちゃイイ
  3: { bg: "#FFD93D", fg: "#333" }, // ちょっといい
  4: { bg: "#6BCB77", fg: "#fff" }, // ふつう
  5: { bg: "#4D96FF", fg: "#fff" }, // びみょう
  6: { bg: "#BFBFBF", fg: "#333" }, // すみかなし
};

export function evalStyle(code: number): { bg: string; fg: string } {
  return STYLES[code] ?? STYLES[0];
}

// 住みごこちが低い順（未登録 → すみかなし → びみょう → … → 最高）
export const EVAL_ORDER_LOW_FIRST = [0, 6, 5, 4, 3, 2, 1];

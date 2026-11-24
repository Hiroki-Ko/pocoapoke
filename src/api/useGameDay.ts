// /pocoapoke/src/api/useGameDay.ts
// 今日のゲーム日付。JST 4:00 を過ぎたとき・画面に戻ってきたときに更新して再描画させる
import { useEffect, useState } from "react";
import { gameDay, msUntilNextGameDay } from "../lib/gameDay";

export function useGameDay(): string {
  const [day, setDay] = useState(gameDay);
  useEffect(() => {
    const refresh = () => setDay(gameDay());
    let timer = window.setTimeout(function tick() {
      refresh();
      timer = window.setTimeout(tick, msUntilNextGameDay() + 1000);
    }, msUntilNextGameDay() + 1000);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return day;
}

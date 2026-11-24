// 住みごこち画面のための派生値（status が無いポケモンは「未登録」として扱う）
import type { MasterItem, Pokemon } from "../types";
import { isToday } from "./gameDay";
import { EVAL_ORDER_LOW_FIRST } from "./evaluation";
import { defaultPokemonCompare } from "./pokemonOrder";

export function townCode(p: Pokemon): number {
  return p.status?.place_code?.code ?? 0;
}

export function evalCode(p: Pokemon): number {
  return p.status?.status_code?.code ?? 0;
}

export function isCared(p: Pokemon, now: Date = new Date()): boolean {
  return isToday(p.status?.cared_on, now);
}

export function todayWish(p: Pokemon, now: Date = new Date()): MasterItem | null {
  return isToday(p.status?.wish_on, now) ? (p.status?.wish_favorite ?? null) : null;
}

// 欲しいものの選択肢: そのポケモンの好きなもの（favorite1〜5、味は除く）。
// 今日すでに入力した欲しいものが好きなものから外れていても、消えないよう最後に残す。
export function wishOptions(p: Pokemon, favorites: MasterItem[], now: Date = new Date()): MasterItem[] {
  const options = p.favorite_ids
    .slice(0, 5)
    .filter((id): id is number => id != null)
    .map((id) => favorites.find((f) => f.id === id))
    .filter((f): f is MasterItem => !!f);
  const current = todayWish(p, now);
  return current && !options.some((o) => o.id === current.id) ? [...options, current] : options;
}

export function groupByEval(list: Pokemon[]): { code: number; items: Pokemon[] }[] {
  return EVAL_ORDER_LOW_FIRST.map((code) => ({
    code,
    items: list.filter((p) => evalCode(p) === code).sort(defaultPokemonCompare),
  })).filter((g) => g.items.length > 0);
}

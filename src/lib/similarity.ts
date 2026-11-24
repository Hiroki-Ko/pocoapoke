// 「似た好みを探す」: 好きなもの（味以外の favorite1〜5）がいくつ重なるか
import type { Pokemon } from "../types";
import { defaultPokemonCompare } from "./pokemonOrder";
import { townCode } from "./progress";

function favs(p: Pokemon): number[] {
  return p.favorite_ids.slice(0, 5).filter((id): id is number => id != null);
}

export function sharedFavorites(a: Pokemon, b: Pokemon): number[] {
  const other = new Set(favs(b));
  return favs(a).filter((id) => other.has(id));
}

export function findSimilar(target: Pokemon, all: Pokemon[]): { pokemon: Pokemon; shared: number[] }[] {
  return all
    .filter((p) => p.id !== target.id)
    .map((p) => ({ pokemon: p, shared: sharedFavorites(target, p) }))
    .filter((r) => r.shared.length > 0)
    .sort((x, y) => y.shared.length - x.shared.length || defaultPokemonCompare(x.pokemon, y.pokemon));
}

export function townAffinity(results: { pokemon: Pokemon }[]): { town: number; count: number }[] {
  const counts = new Map<number, number>();
  for (const r of results) {
    const t = townCode(r.pokemon);
    if (t !== 0) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts].map(([town, count]) => ({ town, count })).sort((a, b) => b.count - a.count || a.town - b.town);
}

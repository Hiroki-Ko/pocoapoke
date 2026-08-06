// /pocoapoke/src/lib/pokemonOrder.ts
// 一覧の「通常」表示順: 本編(番号昇順) → EX(ローカル番号昇順) → DLC(ローカル番号昇順)
const CATEGORY_ORDER: Record<string, number> = { main: 0, ex: 1, dlc: 2 };

export function defaultPokemonCompare(
  a: { category: string; number: number | null; local_number: number | null },
  b: { category: string; number: number | null; local_number: number | null },
) {
  const catDiff = (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99);
  if (catDiff !== 0) return catDiff;
  const aNum = a.number ?? a.local_number ?? 0;
  const bNum = b.number ?? b.local_number ?? 0;
  return aNum - bNum;
}

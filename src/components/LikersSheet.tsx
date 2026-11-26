// /pocoapoke/src/components/LikersSheet.tsx
// 「〇〇が好きなポケモン」: 家具の属性チップから開く
import type { Pokemon } from "../types";
import { BottomSheet } from "./BottomSheet";
import { PokemonIcon } from "./PokemonIcon";
import { townCode } from "../lib/progress";
import { TOWN_SHORT } from "../lib/towns";

type Props = { code: number | null; label: string; pokemon: Pokemon[]; onClose: () => void };

export function LikersSheet({ code, label, pokemon, onClose }: Props) {
  return (
    <BottomSheet open={code !== null} onClose={onClose} title={<span>「{label}」が好きなポケモン（{pokemon.length}匹）</span>}>
      {pokemon.length === 0 && <p className="py-4 text-center text-sm text-sub">この属性が好きなポケモンはいません</p>}
      {pokemon.map((p) => (
        <div key={p.id} className="flex items-center gap-2.5 border-b border-line py-2">
          <PokemonIcon id={p.id} name={p.name} size={36} />
          <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{p.name}</span>
          <span className={`shrink-0 rounded px-1.5 text-[10px] font-bold text-white ${townCode(p) === 0 ? "bg-slate-300" : "bg-slate-500"}`}>
            {TOWN_SHORT[townCode(p)] ?? "未登録"}
          </span>
        </div>
      ))}
    </BottomSheet>
  );
}

// /pocoapoke/src/components/FurnitureCard.tsx
// 家具のカード: 画像・名前・属性チップ。ポケモンから探したときは、誰のどの好きなものに当てはまったかも出す
import type { FurnitureItem } from "../types";
import type { RankedFurniture } from "../lib/furniture";
import { FurnitureIcon } from "./FurnitureIcon";
import { PokemonIcon } from "./PokemonIcon";

type Props = {
  item: FurnitureItem;
  labelByCode: Map<number, string>;
  highlight: Set<number>;
  perPokemon?: RankedFurniture["perPokemon"];
  total?: number;
  onTapFavorite: (code: number) => void;
};

const tag = "rounded-md px-1.5 py-px text-[11px]";

export function FurnitureCard({ item, labelByCode, highlight, perPokemon, total, onTapFavorite }: Props) {
  return (
    <div className="mx-2.5 my-2 rounded-2xl bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
      <div className="flex items-center gap-2.5">
        <FurnitureIcon item={item} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-extrabold">{item.name}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {item.favorites.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onTapFavorite(c)}
                className={`${tag} ${highlight.has(c) ? "bg-brand font-bold text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {labelByCode.get(c) ?? c}
              </button>
            ))}
          </div>
        </div>
        {total !== undefined && <span className="shrink-0 self-start text-sm font-black text-amber-500">★{total}</span>}
      </div>
      {perPokemon && perPokemon.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-line pt-2">
          {perPokemon.map(({ pokemon, codes }) => (
            <span key={pokemon.id} className="flex items-center gap-1 text-[11px] text-sub">
              <PokemonIcon id={pokemon.id} name={pokemon.name} size={22} className="!rounded-md" />
              {codes.map((c) => labelByCode.get(c)).join("・")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

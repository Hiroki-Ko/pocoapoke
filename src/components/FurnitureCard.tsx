// /pocoapoke/src/components/FurnitureCard.tsx
// 家具のカード: 画像・名前・属性チップ。ポケモンから探したときは、誰のどの好きなものに当てはまったかも出す
import type { FurnitureItem } from "../types";
import { tagLabel, type RankedFurniture } from "../lib/furniture";
import { FurnitureIcon } from "./FurnitureIcon";
import { PokemonIcon } from "./PokemonIcon";

type Props = {
  item: FurnitureItem;
  labelByCode: Map<number, string>;
  highlight: Set<number>;
  perPokemon?: RankedFurniture["perPokemon"];
  total?: number;
  onTapFavorite: (code: number) => void;
  onEditName?: () => void; // 日本語名がない・入力済みの家具だけ名前をタップして入力できる
};

const tag = "rounded-md px-1.5 py-px text-[11px]";

// 種類ごとのバッジの色
const TAG_STYLE: Record<string, string> = {
  decoration: "bg-green-50 text-green-700",
  toy: "bg-amber-50 text-amber-700",
  relaxation: "bg-white text-slate-600 ring-1 ring-slate-300",
  food: "bg-orange-50 text-orange-700",
  road: "bg-stone-100 text-stone-600",
};

export function FurnitureCard({ item, labelByCode, highlight, perPokemon, total, onTapFavorite, onEditName }: Props) {
  const editable = !!onEditName && (item.noJa || item.localName);
  return (
    <div className="mx-2.5 my-2 rounded-2xl bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
      <div className="flex items-center gap-2.5">
        <FurnitureIcon item={item} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            {editable ? (
              <button type="button" onClick={onEditName} className="min-w-0 truncate text-left text-[15px] font-extrabold underline decoration-dotted underline-offset-4">
                {item.name}
              </button>
            ) : (
              <span className="min-w-0 truncate text-[15px] font-extrabold">{item.name}</span>
            )}
            <span className={`shrink-0 rounded px-1.5 py-px text-[10px] font-bold ${TAG_STYLE[item.tag] ?? "bg-slate-100 text-slate-500"}`}>{tagLabel(item.tag)}</span>
            {item.localName && <span className="shrink-0 text-[10px] font-bold text-emerald-600">入力済み</span>}
          </div>
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

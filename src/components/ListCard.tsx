// /pocoapoke/src/components/ListCard.tsx
import type { MasterItem, Pokemon } from "../types";
import { PokemonIcon } from "./PokemonIcon";
import { TOWN_SHORT } from "../lib/towns";
import { townCode } from "../lib/progress";

type Props = {
  pokemon: Pokemon;
  index: number; // 一覧での並び順（50匹送り用）
  favById: Map<number, MasterItem>;
  highlight: { env: number | null; fav: number | null; sp: number | null };
  onOpen: () => void;
  onSimilar: () => void;
};

const tag = "rounded-md px-1.5 py-px text-[11px]";
const hit = "bg-brand text-white font-bold";

export function displayNo(p: Pokemon) {
  return p.number ?? `${p.category.toUpperCase()}${p.local_number ?? ""}`;
}

export function ListCard({ pokemon: p, index, favById, highlight, onOpen, onSimilar }: Props) {
  const town = townCode(p);
  const specialties = [p.specialty1, p.specialty2].filter((s): s is MasterItem => !!s && s.code !== 0);
  const favorites = p.favorite_ids.slice(0, 5).map((id) => (id != null ? favById.get(id) : undefined)).filter((m): m is MasterItem => !!m);
  const taste = p.favorite_ids[5] != null ? favById.get(p.favorite_ids[5]!) : undefined;

  return (
    <div data-index={index} className="mx-2.5 my-2 rounded-2xl bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="flex items-center gap-2.5">
          <PokemonIcon id={p.id} name={p.name} size={48} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-extrabold">
              <span className="mr-1.5 text-[11px] font-semibold text-sub">No.{displayNo(p)}</span>
              {p.name}
            </div>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {p.environment && p.environment.code !== 0 && (
                <span className={`${tag} ${highlight.env === p.environment.id ? hit : "bg-green-50 text-green-800"}`}>{p.environment.label}</span>
              )}
              {specialties.map((s) => (
                <span key={s.id} className={`${tag} ${highlight.sp === s.id ? hit : "bg-yellow-100 text-yellow-800"}`}>{s.label}</span>
              ))}
            </div>
          </div>
          <span className={`shrink-0 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white ${town === 0 ? "bg-slate-300" : "bg-slate-500"}`}>
            {TOWN_SHORT[town] ?? "未登録"}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {favorites.map((f) => (
            <span key={f.id} className={`${tag} ${highlight.fav === f.id ? hit : "bg-slate-100 text-slate-700"}`}>{f.label}</span>
          ))}
          {taste && <span className={`${tag} bg-orange-50 text-orange-800`}>{taste.label}</span>}
        </div>
      </button>
      <div className="mt-2 flex justify-end">
        <button type="button" onClick={onSimilar} className="rounded-full border border-brand/40 px-3 py-1 text-xs font-bold text-brand">
          似た好みを探す
        </button>
      </div>
    </div>
  );
}

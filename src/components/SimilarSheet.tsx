// /pocoapoke/src/components/SimilarSheet.tsx
// 好きなもの（味以外）が重なるポケモンを多い順に表示し、街ごとの相性も出す
import type { MasterItem, Pokemon } from "../types";
import { BottomSheet } from "./BottomSheet";
import { PokemonIcon } from "./PokemonIcon";
import { findSimilar, townAffinity } from "../lib/similarity";
import { townCode } from "../lib/progress";
import { TOWN_SHORT } from "../lib/towns";

type Props = {
  target: Pokemon | null;
  all: Pokemon[];
  favById: Map<number, MasterItem>;
  onOpen: (id: number) => void;
  onClose: () => void;
};

export function SimilarSheet({ target, all, favById, onOpen, onClose }: Props) {
  const results = target ? findSimilar(target, all) : [];
  const affinity = townAffinity(results);
  return (
    <BottomSheet
      open={!!target}
      onClose={onClose}
      title={target && (<><PokemonIcon id={target.id} name={target.name} size={36} /><span>{target.name} と好みが近いポケモン</span></>)}
    >
      <div className="mb-2 rounded-xl bg-slate-50 p-2.5">
        <div className="mb-1 text-xs font-extrabold text-sub">街ごとの相性</div>
        {affinity.length === 0 ? (
          <div className="text-xs text-sub">好みが重なるポケモンが住んでいる街はありません</div>
        ) : (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
            {affinity.map((a) => (
              <span key={a.town}>
                <b>{TOWN_SHORT[a.town]}</b> {"●".repeat(Math.min(a.count, 5))} {a.count}匹
              </span>
            ))}
          </div>
        )}
      </div>
      {results.length === 0 && <p className="py-4 text-center text-sm text-sub">好きなものが重なるポケモンはいません</p>}
      {results.map(({ pokemon: p, shared }) => (
        <button key={p.id} type="button" onClick={() => onOpen(p.id)} className="flex w-full items-center gap-2.5 border-b border-line py-2 text-left">
          <PokemonIcon id={p.id} name={p.name} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-extrabold">{p.name}</span>
              <span className="shrink-0 rounded bg-slate-500 px-1 text-[10px] font-bold text-white">{TOWN_SHORT[townCode(p)]}</span>
            </div>
            <div className="truncate text-[11px] text-sub">{shared.map((id) => favById.get(id)?.label).join("・")}</div>
          </div>
          <span className="shrink-0 text-sm font-black text-amber-500">★{shared.length}</span>
        </button>
      ))}
    </BottomSheet>
  );
}

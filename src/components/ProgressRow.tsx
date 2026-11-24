// /pocoapoke/src/components/ProgressRow.tsx
import type { MasterItem, Pokemon } from "../types";
import { PokemonIcon } from "./PokemonIcon";
import { EvalBadge } from "./EvalBadge";
import { evalCode, isCared, todayWish } from "../lib/progress";

type Props = {
  pokemon: Pokemon;
  taste: MasterItem | null;
  showNumber: boolean;
  onOpen: () => void;
  onToggleCare: (cared: boolean) => void;
};

function displayNo(p: Pokemon) {
  return p.number ?? `${p.category.toUpperCase()}${p.local_number ?? ""}`;
}

export function ProgressRow({ pokemon: p, taste, showNumber, onOpen, onToggleCare }: Props) {
  const cared = isCared(p);
  const wish = todayWish(p);
  return (
    <div className="flex items-center border-b border-line bg-white">
      <button type="button" onClick={onOpen} className={`flex min-w-0 flex-1 items-center gap-2.5 py-2 pl-3 text-left ${cared ? "opacity-45" : ""}`}>
        <PokemonIcon id={p.id} name={p.name} size={48} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-extrabold">
            {showNumber && <span className="mr-1.5 text-[11px] font-semibold text-sub">No.{displayNo(p)}</span>}
            {p.name}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {taste && <span className="rounded-md bg-orange-50 px-1.5 text-[11px] text-orange-800">{taste.label}</span>}
            <span className="rounded-md bg-indigo-50 px-1.5 text-[11px] text-indigo-800">欲しい：{wish?.label ?? "—"}</span>
          </div>
        </div>
        {showNumber && p.status?.status_code && <EvalBadge code={evalCode(p)} label={p.status.status_code.label} />}
      </button>
      {/* お世話チェック: 誤タップしにくいよう 56px の押せる範囲を確保 */}
      <button
        type="button"
        role="checkbox"
        aria-checked={cared}
        aria-label={`${p.name} のお世話済み`}
        onClick={() => onToggleCare(!cared)}
        className="flex h-16 w-14 shrink-0 items-center justify-center"
      >
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 text-lg font-black text-white ${cared ? "border-brand bg-brand" : "border-slate-300 bg-white"}`}>
          {cared ? "✓" : ""}
        </span>
      </button>
    </div>
  );
}

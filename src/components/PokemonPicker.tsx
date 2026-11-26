// /pocoapoke/src/components/PokemonPicker.tsx
// 家具さがし「ポケモンから」: 街で絞ってポケモンにチェックを付ける。選んだポケモンは上に並び、タップで外せる
import { useState } from "react";
import type { MasterItem, Pokemon } from "../types";
import { PokemonIcon } from "./PokemonIcon";
import { townCode } from "../lib/progress";
import { defaultPokemonCompare } from "../lib/pokemonOrder";

type Props = { all: Pokemon[]; towns: MasterItem[]; selected: number[]; onChange: (ids: number[]) => void };

const TOWN_KEY = "pocoapoke.progress.town"; // 住みごこち画面で最後に選んだ街

function initialTown(): number {
  try {
    const raw = localStorage.getItem(TOWN_KEY);
    const v = Number(raw);
    return raw !== null && Number.isInteger(v) ? v : 1;
  } catch {
    return 1;
  }
}

export function PokemonPicker({ all, towns, selected, onChange }: Props) {
  const [town, setTown] = useState<number>(initialTown);
  const list = all.filter((p) => townCode(p) === town).sort(defaultPokemonCompare);
  const chosen = selected.map((id) => all.find((p) => p.id === id)).filter((p): p is Pokemon => !!p);
  const toggle = (id: number) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="border-b border-line bg-white px-3 pb-2">
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 py-1.5">
        {chosen.length === 0 && <span className="text-xs text-sub">ポケモンを選んでください</span>}
        {chosen.map((p) => (
          <button key={p.id} type="button" onClick={() => toggle(p.id)} aria-label={`${p.name}を外す`} className="relative">
            <PokemonIcon id={p.id} name={p.name} size={34} />
            <span className="absolute -top-1 -right-1 rounded-full bg-slate-500 px-1 text-[9px] leading-tight text-white">✕</span>
          </button>
        ))}
        {chosen.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="ml-auto text-xs font-bold text-sub">
            すべて外す
          </button>
        )}
      </div>
      <div className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1.5">
        {towns.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTown(t.code)}
            className={`shrink-0 rounded-full border px-3 py-1 text-[12px] ${town === t.code ? "border-brand bg-brand font-bold text-white" : "border-black/10 bg-white"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="no-scrollbar flex max-h-40 flex-wrap gap-1 overflow-y-auto">
        {list.length === 0 && <span className="py-2 text-xs text-sub">この街にはポケモンがいません</span>}
        {list.map((p) => {
          const on = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(p.id)}
              className={`flex items-center gap-1 rounded-full border py-0.5 pr-2.5 pl-0.5 text-[12px] ${on ? "border-brand bg-sky-50 font-bold text-brand" : "border-line bg-white"}`}
            >
              <PokemonIcon id={p.id} name={p.name} size={24} className="!rounded-full" />
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

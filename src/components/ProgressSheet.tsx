// /pocoapoke/src/components/ProgressSheet.tsx
// 住みごこち・今日の欲しいもの・住んでる街をまとめて変更するパネル（お世話チェックは変えない）
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Master, Pokemon } from "../types";
import { BottomSheet } from "./BottomSheet";
import { PokemonIcon } from "./PokemonIcon";
import { Chip } from "./Chip";
import { evalStyle } from "../lib/evaluation";
import { todayWish, wishOptions } from "../lib/progress";
import type { ProgressInput } from "../api/mutations";

type Props = { pokemon: Pokemon | null; master: Master; onClose: () => void; onSave: (v: ProgressInput) => void };

export function ProgressSheet({ pokemon, master, onClose, onSave }: Props) {
  return (
    <BottomSheet
      open={!!pokemon}
      onClose={onClose}
      title={pokemon && (<><PokemonIcon id={pokemon.id} name={pokemon.name} size={40} />{pokemon.name}</>)}
    >
      {pokemon && <SheetBody key={pokemon.id} pokemon={pokemon} master={master} onSave={onSave} />}
    </BottomSheet>
  );
}

function SheetBody({ pokemon, master, onSave }: { pokemon: Pokemon; master: Master; onSave: (v: ProgressInput) => void }) {
  const evals = (master.evaluation ?? []).filter((m) => m.code !== 0);
  const places = [...(master.place ?? [])].sort((a, b) => a.code - b.code);
  const [ev, setEv] = useState<number | null>(pokemon.status?.status_code_id ?? null);
  const [wish, setWish] = useState<number | null>(todayWish(pokemon)?.id ?? null);
  const [place, setPlace] = useState<number | null>(pokemon.status?.place_code_id ?? places[0]?.id ?? null);
  const unregisteredEval = (master.evaluation ?? []).find((m) => m.code === 0)?.id ?? null;
  const options = wishOptions(pokemon, master.favorite ?? []);
  const label = "mt-3 mb-1.5 text-xs font-extrabold text-sub";
  const navigate = useNavigate();
  const save = () => onSave({ poke_id: pokemon.id, status_code: ev ?? unregisteredEval!, place_code: place!, wish_favorite: wish });

  return (
    <>
      <div className={label}>住みごこち</div>
      <div className="grid grid-cols-2 gap-2">
        {evals.map((m) => {
          const s = evalStyle(m.code);
          const on = ev === m.id;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={on}
              onClick={() => setEv(m.id)}
              className={`rounded-xl py-3 text-sm font-extrabold ${on ? "outline-3 outline-ink" : "opacity-50"}`}
              style={{ background: s.bg, color: s.fg }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className={label}>欲しいもの（今日）</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((m) => (
          <Chip key={m.id} tone="indigo" selected={wish === m.id} onClick={() => setWish(m.id)}>{m.label}</Chip>
        ))}
        <Chip tone="indigo" selected={wish === null} onClick={() => setWish(null)}>なし</Chip>
      </div>

      <div className={label}>住んでる街</div>
      <div className="flex flex-wrap gap-1.5">
        {places.map((m) => (
          <Chip key={m.id} selected={place === m.id} onClick={() => setPlace(m.id)}>{m.label}</Chip>
        ))}
      </div>

      <button
        type="button"
        onClick={save}
        className="mt-4 w-full rounded-xl bg-brand py-3 text-[15px] font-extrabold text-white"
      >
        保存
      </button>
      <button
        type="button"
        // パネルで変えた内容を失わないよう、保存してから家具さがしへ
        onClick={() => {
          save();
          navigate(`/furniture?poke=${pokemon.id}`);
        }}
        className="mt-2 w-full rounded-xl border border-brand/40 py-2.5 text-sm font-bold text-brand"
      >
        🪑 保存して、好きな家具をさがす
      </button>
    </>
  );
}

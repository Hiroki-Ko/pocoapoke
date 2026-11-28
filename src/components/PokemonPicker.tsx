// /pocoapoke/src/components/PokemonPicker.tsx
// 家具さがし「ポケモンから」: 街で絞ってポケモンにチェックを付ける。選んだポケモンは上に並び、タップで外せる
import { useEffect, useRef, useState } from "react";
import type { MasterItem, Pokemon } from "../types";
import { PokemonIcon } from "./PokemonIcon";
import { townCode } from "../lib/progress";
import { defaultPokemonCompare } from "../lib/pokemonOrder";

type Props = {
  all: Pokemon[];
  towns: MasterItem[];
  selected: number[];
  onChange: (ids: number[]) => void;
  onVisibleChange?: (visible: boolean) => void; // 選択部分が画面に見えているか（見えなければ上にたたんだバーを出す）
};

const TOWN_KEY = "pocoapoke.furniture.town"; // この画面で最後に選んだ街
const PROGRESS_TOWN_KEY = "pocoapoke.progress.town"; // 初回は住みごこち画面の街

function readTown(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    const v = Number(raw);
    return raw !== null && Number.isInteger(v) ? v : null;
  } catch {
    return null;
  }
}

function initialTown(): number {
  return readTown(TOWN_KEY) ?? readTown(PROGRESS_TOWN_KEY) ?? 1;
}

export const PICKER_ID = "pokemon-picker";

export function PokemonPicker({ all, towns, selected, onChange, onVisibleChange }: Props) {
  const [town, setTownState] = useState<number>(initialTown);
  const setTown = (code: number) => {
    setTownState(code);
    try {
      localStorage.setItem(TOWN_KEY, String(code));
    } catch {
      /* 保存できなくても動作は続ける */
    }
  };
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !onVisibleChange || typeof IntersectionObserver === "undefined") return;
    // 上の固定バーに隠れる分を引いて判定する
    const io = new IntersectionObserver(([e]) => onVisibleChange(e.isIntersecting), { rootMargin: "-100px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [onVisibleChange]);
  const list = all.filter((p) => townCode(p) === town).sort(defaultPokemonCompare);
  const chosen = selected.map((id) => all.find((p) => p.id === id)).filter((p): p is Pokemon => !!p);
  const toggle = (id: number) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div ref={ref} id={PICKER_ID} className="scroll-mt-28 border-b border-line bg-white px-3 pb-2">
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
      {/* 街は下線のタブ（ポケモンの丸いチップと見分けやすくする） */}
      <div className="no-scrollbar -mx-3 mb-2 flex overflow-x-auto border-b border-line px-1">
        {towns.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTown(t.code)}
            className={`-mb-px shrink-0 border-b-[3px] px-2.5 py-1.5 text-[13px] ${town === t.code ? "border-brand font-extrabold text-brand" : "border-transparent text-sub"}`}
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

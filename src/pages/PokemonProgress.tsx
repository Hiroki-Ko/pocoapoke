// /pocoapoke/src/pages/PokemonProgress.tsx
// 住みごこちチェック: 街で絞り込み → 住みごこちの低い順に回る → 住みごこち・欲しいものを直す
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { usePokemonData } from "../api/usePokemonData";
import { useUpdateCare, useUpdateProgress } from "../api/mutations";
import { useGameDay } from "../api/useGameDay";
import { AppHeader } from "../components/AppHeader";
import { ProgressRow } from "../components/ProgressRow";
import { ProgressSheet } from "../components/ProgressSheet";
import { evalStyle } from "../lib/evaluation";
import { evalCode, groupByEval, isCared, townCode } from "../lib/progress";
import { defaultPokemonCompare } from "../lib/pokemonOrder";
import type { Pokemon } from "../types";

const TOWN_KEY = "pocoapoke.progress.town";
const DEFAULT_TOWN = 1; // パサパサこうや
const BEST_EVAL = 1; // 住みごこち「最高」はお世話しなくてよいので、お世話の数から外す

function loadTown(): number {
  try {
    const v = Number(localStorage.getItem(TOWN_KEY));
    return Number.isInteger(v) && localStorage.getItem(TOWN_KEY) !== null ? v : DEFAULT_TOWN;
  } catch {
    return DEFAULT_TOWN;
  }
}

export default function PokemonProgress() {
  const { data, isLoading, isError } = usePokemonData();
  // 4:00 をまたいだら再描画して、昨日のチェック・欲しいものを外して見せる
  const today = useGameDay();
  const care = useUpdateCare();
  const progress = useUpdateProgress();
  const [town, setTown] = useState<number>(loadTown);
  const [mode, setMode] = useState<"eval" | "number">("eval");
  const [closed, setClosed] = useState<Set<number>>(() => new Set([1])); // 「最高」は最初から閉じる
  const [openId, setOpenId] = useState<number | null>(null);

  const master = data?.master ?? {};
  const towns = useMemo(() => [...(master.place ?? [])].sort((a, b) => a.code - b.code), [master.place]);
  const evalLabel = (code: number) => (master.evaluation ?? []).find((m) => m.code === code)?.label ?? "";
  const favById = useMemo(() => new Map((master.favorite ?? []).map((m) => [m.id, m])), [master.favorite]);

  const list = useMemo(
    () => (data?.pokemon ?? []).filter((p) => p.show_in_progress === 1 && townCode(p) === town),
    [data, town],
  );
  // お世話の対象は「最高」以外。「最高」の匹数は横に別で出す
  const careTargets = list.filter((p) => evalCode(p) !== BEST_EVAL);
  const caredCount = careTargets.filter((p) => isCared(p)).length;
  const bestCount = list.length - careTargets.length;
  const remaining = careTargets.length - caredCount;
  const careRate = careTargets.length === 0 ? 100 : (caredCount / careTargets.length) * 100;
  const opened = list.find((p) => p.id === openId) ?? (data?.pokemon ?? []).find((p) => p.id === openId) ?? null;

  const selectTown = (code: number) => {
    setTown(code);
    try {
      localStorage.setItem(TOWN_KEY, String(code));
    } catch {
      /* 保存できなくても動作は続ける */
    }
  };
  const toggleGroup = (code: number) =>
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const row = (p: Pokemon) => (
    <ProgressRow
      key={`${p.id}-${today}`}
      pokemon={p}
      taste={favById.get(p.favorite_ids[5] ?? -1) ?? null}
      showNumber={mode === "number"}
      onOpen={() => setOpenId(p.id)}
      onToggleCare={(cared) => care.mutate({ poke_id: p.id, cared })}
    />
  );

  return (
    <div>
      <Helmet>
        <title>住みごこちチェック | pocoapoke</title>
      </Helmet>
      <AppHeader title="住みごこちチェック" subtitle="街ごとのお世話と住みごこち" count={list.length}>
        <div className="no-scrollbar -mx-3 mt-2 flex gap-1.5 overflow-x-auto px-3 pb-0.5">
          {towns.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTown(t.code)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] ${town === t.code ? "border-brand bg-brand font-bold text-white" : "border-black/10 bg-white"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </AppHeader>

      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-3 py-2">
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          {(["eval", "number"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md px-2.5 py-1 text-xs font-bold ${mode === m ? "bg-white text-ink shadow-sm" : "text-sub"}`}
            >
              {m === "eval" ? "住みごこち順" : "番号順"}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-sub">
            今日のお世話 <b className="text-[15px] text-brand">{caredCount}</b>/{careTargets.length}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-sub">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4f9de0] to-brand transition-[width] duration-300"
                style={{ width: `${careRate}%` }}
              />
            </div>
            {remaining > 0 ? (
              <span>あと{remaining}</span>
            ) : (
              <span className="font-bold text-[#1b7a3a]">✓ 完了</span>
            )}
            {bestCount > 0 && <span>・最高{bestCount}匹</span>}
          </div>
        </div>
      </div>

      {isLoading && <p className="p-6 text-center text-sub">読み込み中…</p>}
      {isError && <p className="p-6 text-center text-red-600">データを読み込めませんでした</p>}
      {data && list.length === 0 && <p className="p-6 text-center text-sub">この街に住んでいるポケモンはいません</p>}

      {mode === "eval"
        ? groupByEval(list).map((g) => {
            const s = evalStyle(g.code);
            const isClosed = closed.has(g.code);
            return (
              <section key={g.code}>
                <button
                  type="button"
                  onClick={() => toggleGroup(g.code)}
                  aria-expanded={!isClosed}
                  className="sticky top-[45px] z-10 flex w-full justify-between px-3 py-2 text-[13px] font-extrabold"
                  style={{ background: s.bg, color: s.fg }}
                >
                  <span>{isClosed ? "▶" : "▼"} {evalLabel(g.code)}</span>
                  <span>お世話 {g.items.filter((p) => isCared(p)).length}/{g.items.length}</span>
                </button>
                {!isClosed && g.items.map(row)}
              </section>
            );
          })
        : [...list].sort(defaultPokemonCompare).map(row)}

      <ProgressSheet
        pokemon={opened}
        master={master}
        onClose={() => setOpenId(null)}
        onSave={(v) => {
          progress.mutate(v);
          setOpenId(null);
        }}
      />
    </div>
  );
}

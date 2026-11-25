// /pocoapoke/src/pages/PokemonList.tsx
// ポケモン一覧（見る専用）: 街ごとの住民数、好きな環境・好きなもの・得意なことで絞り込み、似た好みを探す、50匹ずつ送る
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { usePokemonData } from "../api/usePokemonData";
import { AppHeader } from "../components/AppHeader";
import { ListCard } from "../components/ListCard";
import { FilterSheet } from "../components/FilterSheet";
import { SimilarSheet } from "../components/SimilarSheet";
import { defaultPokemonCompare } from "../lib/pokemonOrder";
import { townCode } from "../lib/progress";
import type { MasterItem, Pokemon } from "../types";

type FilterKey = "env" | "fav" | "sp";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "env", label: "好きな環境" },
  { key: "fav", label: "好きなもの" },
  { key: "sp", label: "得意なこと" },
];

export default function PokemonList() {
  const { data, isLoading, isError } = usePokemonData();
  const navigate = useNavigate();
  const [town, setTown] = useState<number | null>(null);
  const [filter, setFilter] = useState<Record<FilterKey, number | null>>({ env: null, fav: null, sp: null });
  const [sheet, setSheet] = useState<FilterKey | null>(null);
  const [similarId, setSimilarId] = useState<number | null>(null);

  const all = data?.pokemon ?? [];
  const master = data?.master ?? {};
  // 「未登録」も絞り込めるよう、街は code 0〜6 すべて（未登録は最後）
  const towns = [...(master.place ?? [])].sort((a, b) => (a.code === 0 ? 99 : a.code) - (b.code === 0 ? 99 : b.code));
  const favById = useMemo(() => new Map((master.favorite ?? []).map((m) => [m.id, m])), [master.favorite]);
  const options: Record<FilterKey, MasterItem[]> = {
    env: (master.environment ?? []).filter((m) => m.code !== 0),
    fav: (master.favorite ?? []).filter((m) => m.code > 5), // 味(1〜5)と「なし」以外
    sp: (master.specialty ?? []).filter((m) => m.code !== 0),
  };
  const labelOf = (k: FilterKey, id: number) => options[k].find((m) => m.id === id)?.label ?? "";

  const matches = (p: Pokemon) =>
    (town === null || townCode(p) === town) &&
    (filter.env === null || p.environment?.id === filter.env) &&
    (filter.fav === null || p.favorite_ids.slice(0, 5).includes(filter.fav)) &&
    (filter.sp === null || p.specialty1?.id === filter.sp || p.specialty2?.id === filter.sp);
  const list = all.filter(matches).sort(defaultPokemonCompare);
  const similarTarget = all.find((p) => p.id === similarId) ?? null;

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-[13px] ${active ? "border-brand bg-brand font-bold text-white" : "border-black/10 bg-white"}`;

  return (
    <div>
      <Helmet>
        <title>ポケモン一覧 | pocoapoke</title>
      </Helmet>
      <AppHeader title="ポケモン一覧" subtitle="好きなもの・住んでる街をチェック" count={list.length}>
        <div className="no-scrollbar -mx-3 mt-2 flex gap-1.5 overflow-x-auto px-3 pb-0.5">
          <button type="button" className={chip(town === null)} onClick={() => setTown(null)}>
            すべて<small className="ml-1 font-extrabold opacity-75">{all.length}</small>
          </button>
          {towns.map((t) => (
            <button key={t.id} type="button" className={chip(town === t.code)} onClick={() => setTown(t.code)}>
              {t.label}
              <small className="ml-1 font-extrabold opacity-75">{all.filter((p) => townCode(p) === t.code).length}</small>
            </button>
          ))}
        </div>
      </AppHeader>

      <div data-list-top className="no-scrollbar sticky top-0 z-20 flex gap-1.5 overflow-x-auto border-b border-line bg-white px-3 py-2">
        {FILTERS.map(({ key, label }) => {
          const v = filter[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => (v === null ? setSheet(key) : setFilter({ ...filter, [key]: null }))}
              className={`shrink-0 rounded-full border px-2.5 py-1.5 text-xs font-bold ${v === null ? "border-line bg-white" : "border-brand bg-sky-50 text-brand"}`}
            >
              {v === null ? `${label} ▾` : `${label}：${labelOf(key, v)} ✕`}
            </button>
          );
        })}
      </div>

      {isLoading && <p className="p-6 text-center text-sub">読み込み中…</p>}
      {isError && <p className="p-6 text-center text-red-600">データを読み込めませんでした</p>}
      {data && list.length === 0 && <p className="p-6 text-center text-sub">条件に合うポケモンはいません</p>}

      {list.map((p, i) => (
        <ListCard
          key={p.id}
          index={i}
          pokemon={p}
          favById={favById}
          highlight={filter}
          onOpen={() => navigate(`/edit/${p.id}`)}
          onSimilar={() => setSimilarId(p.id)}
        />
      ))}

      {list.length > JUMP && <JumpButtons count={list.length} />}

      <FilterSheet
        open={sheet !== null}
        title={FILTERS.find((f) => f.key === sheet)?.label ?? ""}
        items={sheet ? options[sheet] : []}
        selected={sheet ? filter[sheet] : null}
        onSelect={(id) => {
          if (sheet) setFilter({ ...filter, [sheet]: id });
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
      <SimilarSheet
        target={similarTarget}
        all={all}
        favById={favById}
        onOpen={(id) => navigate(`/edit/${id}`)}
        onClose={() => setSimilarId(null)}
      />
    </div>
  );
}

const JUMP = 50;

// 50匹ずつ前後に送るボタン（タブバーの上に固定）
function JumpButtons({ count }: { count: number }) {
  const jump = (dir: 1 | -1) => {
    const barEl = document.querySelector<HTMLElement>("[data-list-top]");
    const bar = barEl?.getBoundingClientRect().bottom ?? 0; // 今の絞り込みバーの下端
    const stuck = barEl?.offsetHeight ?? 0; // スクロール後は最上部に貼りつくので、その高さ
    const cards = [...document.querySelectorAll<HTMLElement>("[data-index]")];
    const current = cards.find((e) => e.getBoundingClientRect().bottom > bar + 4);
    const now = Number(current?.dataset.index ?? 0);
    const target = Math.max(0, Math.min(count - 1, Math.floor(now / JUMP) * JUMP + (dir === 1 ? JUMP : now % JUMP === 0 ? -JUMP : 0)));
    if (target === 0) return window.scrollTo({ top: 0 });
    const el = cards[target];
    if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - stuck - 4 });
  };
  const btn = "flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[11px] font-extrabold leading-tight text-brand shadow-md border border-brand/30";
  return (
    <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 flex flex-col gap-2 right-[max(0.75rem,calc(50vw-14rem+0.75rem))]">
      <button type="button" aria-label="50匹前へ" onClick={() => jump(-1)} className={btn}>▲<br />50</button>
      <button type="button" aria-label="50匹先へ" onClick={() => jump(1)} className={btn}>▼<br />50</button>
    </div>
  );
}

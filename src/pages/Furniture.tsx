// /pocoapoke/src/pages/Furniture.tsx
// 家具さがし: 家具から（名前・属性で絞り込み）／ポケモンから（好きなものに当てはまる家具を多い順に）
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { usePokemonData } from "../api/usePokemonData";
import { AppHeader } from "../components/AppHeader";
import { FilterSheet } from "../components/FilterSheet";
import { FurnitureCard } from "../components/FurnitureCard";
import { LikersSheet } from "../components/LikersSheet";
import { PICKER_ID, PokemonPicker } from "../components/PokemonPicker";
import { PokemonIcon } from "../components/PokemonIcon";
import { applyLocalNames, pendingNames, favoriteCodes, filterFurniture, pokemonWhoLike, rankFurniture, TAG_LABEL, usedTags, kanaRow } from "../lib/furniture";
import { exportNames, loadNames, saveName } from "../lib/localNames";
import { registerBackHandler } from "../lib/backGuard";
import { loadSelection, saveSelection, withPoke } from "../lib/furnitureSelection";
import { isNumOrNull, usePersistentState } from "../lib/persist";
import { NameSheet } from "../components/NameSheet";
import { useToast } from "../components/Toast";
import type { FurnitureItem } from "../types";
import furnitureData from "../data/furniture.json";

const FURNITURE = furnitureData as FurnitureItem[];
// 種類の絞り込みの選択肢（FilterSheet は id で選ぶので、並び順の番号を id にする）
const TAGS = usedTags(FURNITURE).map((tag, i) => ({ id: i + 1, code: i + 1, label: TAG_LABEL[tag], class: "tag", tag }));
const NO_HIGHLIGHT = new Set<number>();

export default function Furniture() {
  const { data } = usePokemonData();
  // /furniture?poke=<id> で開くと「ポケモンから」でそのポケモンを選んだ状態にする（数でない値は無視）
  const [params] = useSearchParams();
  const pokeParam = Number(params.get("poke"));
  // 前に開いたときの「家具から／ポケモンから」と選んだポケモンを引き継ぐ（住みごこちから来たらそのポケモンを足す）
  const [initial] = useState(() => {
    const saved = loadSelection();
    return params.get("poke") && Number.isInteger(pokeParam) && pokeParam > 0 ? withPoke(saved, pokeParam) : saved;
  });
  const [mode, setMode] = useState<"items" | "pokemon">(initial.mode);
  const [selected, setSelected] = useState<number[]>(initial.ids);
  useEffect(() => saveSelection({ mode, ids: selected }), [mode, selected]);
  // 名前の検索・属性・種類の絞り込みも、ほかの画面に移っても残す
  const [query, setQuery] = usePersistentState("pocoapoke.furniture.query", "", (v): v is string => typeof v === "string");
  const [favId, setFavId] = usePersistentState<number | null>("pocoapoke.furniture.fav", null, isNumOrNull); // 絞り込み中の属性（master id）
  const [sheet, setSheet] = useState(false);
  const [likerCode, setLikerCode] = useState<number | null>(null);
  const [pickerVisible, setPickerVisible] = useState(true);
  const [tagId, setTagId] = usePersistentState<number | null>("pocoapoke.furniture.tag", null, (v): v is number | null => v === null || TAGS.some((t) => t.id === v));
  const [tagSheet, setTagSheet] = useState(false);
  const [names, setNames] = useState<Record<string, string>>(loadNames);
  const [editing, setEditing] = useState<FurnitureItem | null>(null);
  const [copyText, setCopyText] = useState<string | null>(null); // コピーできなかったときに選べるよう表示する
  const toast = useToast();
  const furniture = useMemo(() => applyLocalNames(FURNITURE, names), [names]);
  // コピーできなかったときの画面も、スマホの戻るで閉じる
  useEffect(() => (copyText === null ? undefined : registerBackHandler(() => setCopyText(null))), [copyText]);
  const tag = TAGS.find((t) => t.id === tagId)?.tag ?? null;
  // 正式な日本語名がまだない家具に入力した名前だけを数える・送る
  // まだ正式に反映していない入力（新しい日本語名・名前の修正）だけを数える・送る
  const pending = useMemo(() => pendingNames(FURNITURE, names), [names]);
  const pendingCount = Object.keys(pending).length;
  const copyNames = async () => {
    const text = exportNames(pending);
    try {
      await navigator.clipboard.writeText(text);
      toast.show(`${pendingCount}件の名前をコピーしました`, "success");
    } catch {
      setCopyText(text);
    }
  };

  const all = data?.pokemon ?? [];
  const favorites = useMemo(() => (data?.master.favorite ?? []).filter((m) => m.code > 5), [data]);
  const favById = useMemo(() => new Map((data?.master.favorite ?? []).map((m) => [m.id, m])), [data]);
  const labelByCode = useMemo(() => new Map(favorites.map((m) => [m.code, m.label])), [favorites]);
  const favCode = favorites.find((m) => m.id === favId)?.code ?? null;

  const items = filterFurniture(furniture, { query, code: favCode, tag });
  const likers = likerCode === null ? [] : pokemonWhoLike(likerCode, all, favById);
  const towns = useMemo(() => [...(data?.master.place ?? [])].sort((a, b) => (a.code === 0 ? 99 : a.code) - (b.code === 0 ? 99 : b.code)), [data]);
  // 存在しない id は選ばれていないものとして扱う
  const picks = selected
    .map((id) => all.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({ pokemon: p, codes: favoriteCodes(p, favById) }));
  const ranked = mode === "pokemon" ? rankFurniture(filterFurniture(furniture, { query: "", code: null, tag }), picks) : [];

  return (
    <div>
      <Helmet>
        <title>家具さがし | pocoapoke</title>
      </Helmet>
      <AppHeader title="家具さがし" subtitle="好きなものに合う家具をさがす" unit="件" count={mode === "items" ? items.length : picks.length ? ranked.length : undefined} />

      <div data-furniture-top className="sticky top-0 z-20 border-b border-line bg-white px-3 py-2">
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          {(["items", "pokemon"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-md py-1 text-xs font-bold ${mode === m ? "bg-white text-ink shadow-sm" : "text-sub"}`}
            >
              {m === "items" ? "家具から" : "ポケモンから"}
            </button>
          ))}
        </div>
        {mode === "pokemon" && (
          <div className="mt-2 flex items-center gap-1.5">
            {/* 選択部分が見えないときだけ、選んだポケモンを1行にたたんで出す。タップで選択部分へ戻る */}
            {!pickerVisible && picks.length > 0 ? (
              <>
                <button
                  type="button"
                  aria-label="ポケモンの選択を開く"
                  onClick={() => document.getElementById(PICKER_ID)?.scrollIntoView({ behavior: "smooth" })}
                  className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
                >
                  {picks.map(({ pokemon: p }) => (
                    <PokemonIcon key={p.id} id={p.id} name={p.name} size={28} />
                  ))}
                  <span className="ml-1 shrink-0 text-sm text-sub">▾</span>
                </button>
                <button type="button" onClick={() => setSelected([])} className="shrink-0 text-xs font-bold text-sub">
                  すべて外す
                </button>
              </>
            ) : (
              <span className="flex-1" />
            )}
            <TagButton tagId={tagId} onOpen={() => setTagSheet(true)} onClear={() => setTagId(null)} />
          </div>
        )}
        {mode === "items" && (
          <div className="mt-2 flex gap-1.5">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="名前でさがす"
              className="min-w-0 flex-1 rounded-full border border-line bg-white px-3 py-1.5 text-sm outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={() => (favId === null ? setSheet(true) : setFavId(null))}
              className={`shrink-0 rounded-full border px-2.5 py-1.5 text-xs font-bold ${favId === null ? "border-line bg-white" : "border-brand bg-sky-50 text-brand"}`}
            >
              {favId === null ? "属性 ▾" : `${favById.get(favId)?.label} ✕`}
            </button>
            <TagButton tagId={tagId} onOpen={() => setTagSheet(true)} onClear={() => setTagId(null)} />
          </div>
        )}
      </div>

      {mode === "items" && items.length > 0 && <RowJump deps={items} />}
      {mode === "items" && (
        <>
          {items.length === 0 && <p className="p-6 text-center text-sub">条件に合う家具はありません</p>}
          <WithNoJaSection
            jump
            pendingCount={pendingCount}
            onCopy={copyNames}
            list={items}
            render={(item) => (
              <FurnitureCard
                key={item.slug}
                item={item}
                labelByCode={labelByCode}
                highlight={favCode === null ? NO_HIGHLIGHT : new Set([favCode])}
                onTapFavorite={setLikerCode}
                onEditName={() => setEditing(item)}
              />
            )}
          />
        </>
      )}

      {mode === "pokemon" && (
        <>
          <PokemonPicker all={all} towns={towns} selected={selected} onChange={setSelected} onVisibleChange={setPickerVisible} />
          {picks.length > 0 && ranked.length === 0 && <p className="p-6 text-center text-sub">好きなものに当てはまる家具はありません</p>}
          <WithNoJaSection
            pendingCount={pendingCount}
            onCopy={copyNames}
            list={ranked.map((r) => ({ ...r, noJa: r.item.noJa }))}
            render={(r) => (
              <FurnitureCard
                key={r.item.slug}
                item={r.item}
                labelByCode={labelByCode}
                highlight={new Set(r.kinds)}
                perPokemon={r.perPokemon}
                total={r.total}
                onTapFavorite={setLikerCode}
                onEditName={() => setEditing(r.item)}
              />
            )}
          />
        </>
      )}

      <p className="px-4 pt-4 pb-2 text-[10px] leading-relaxed text-sub">
        家具データ: Serebii.net、op.gg、Bulbapedia（CC BY-NC-SA）を参考に作成。画像 ©Pokémon / Nintendo / Creatures / GAME FREAK / KOEI TECMO GAMES
      </p>

      <FilterSheet
        open={sheet}
        title="属性"
        items={favorites}
        selected={favId}
        onSelect={(id) => {
          setFavId(id);
          setSheet(false);
        }}
        onClose={() => setSheet(false)}
      />
      <FilterSheet
        open={tagSheet}
        title="種類"
        items={TAGS}
        selected={tagId}
        onSelect={(id) => {
          setTagId(id);
          setTagSheet(false);
        }}
        onClose={() => setTagSheet(false)}
      />
      <NameSheet
        item={editing}
        current={editing ? (names[editing.slug] ?? "") : ""}
        official={editing ? (FURNITURE.find((f) => f.slug === editing.slug) ?? null) : null}
        onSave={(name) => {
          if (editing) setNames(saveName(editing.slug, name));
          setEditing(null);
        }}
        onClose={() => setEditing(null)}
      />
      {copyText !== null && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/30 p-4" onClick={() => setCopyText(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 text-sm font-extrabold">コピーできなかったので、長押しで選んでコピーしてください</div>
            <textarea readOnly value={copyText} className="h-40 w-full rounded-lg border border-line p-2 text-xs" onFocus={(e) => e.currentTarget.select()} />
            <button type="button" onClick={() => setCopyText(null)} className="mt-2 w-full rounded-xl border border-line py-2 text-sm font-bold">閉じる</button>
          </div>
        </div>
      )}
      <LikersSheet code={likerCode} label={likerCode === null ? "" : labelByCode.get(likerCode) ?? ""} pokemon={likers} onClose={() => setLikerCode(null)} />
    </div>
  );
}

// 日本語名がまだない家具（英語名）は、一覧の下に別枠でまとめて出す
type SectionProps<T> = { list: T[]; render: (v: T) => ReactNode; pendingCount: number; onCopy: () => void; jump?: boolean };
function WithNoJaSection<T extends { noJa?: boolean; name?: string; item?: FurnitureItem }>({ list, render, pendingCount, onCopy, jump }: SectionProps<T>) {
  const known = list.filter((v) => !v.noJa);
  const unknown = list.filter((v) => v.noJa);
  // ジャンプ用: 各行（ア行・カ行…）の最初の家具に印を付ける
  const rowOf = (v: T) => kanaRow(v.name ?? v.item?.name ?? "");
  return (
    <>
      {known.map((v, i) =>
        jump && (i === 0 || rowOf(known[i - 1]) !== rowOf(v)) ? (
          <div key={`row-${i}`} data-jump={rowOf(v) === "英数" ? "英数" : `${rowOf(v)}行`}>
            {render(v)}
          </div>
        ) : (
          render(v)
        ),
      )}
      {(unknown.length > 0 || pendingCount > 0) && (
        <>
          <div data-jump={jump ? "英語名" : undefined} className="mx-2.5 mt-5 mb-1 rounded-lg bg-slate-200/70 px-3 py-1.5 text-xs font-extrabold text-sub">
            <div className="flex items-center justify-between gap-2">
              <span>日本語名がまだない家具（英語名） {unknown.length}件</span>
              {pendingCount > 0 && (
                <button type="button" onClick={onCopy} className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-brand">
                  入力した名前をコピー（{pendingCount}件）
                </button>
              )}
            </div>
            <div className="mt-0.5 text-[10px] font-semibold">家具の名前をタップすると、ゲームでの名前を入力・修正できます</div>
          </div>
          {unknown.map(render)}
        </>
      )}
    </>
  );
}

function TagButton({ tagId, onOpen, onClear }: { tagId: number | null; onOpen: () => void; onClear: () => void }) {
  const label = TAGS.find((t) => t.id === tagId)?.label;
  return (
    <button
      type="button"
      onClick={() => (tagId === null ? onOpen() : onClear())}
      className={`shrink-0 rounded-full border px-2.5 py-1.5 text-xs font-bold ${tagId === null ? "border-line bg-white" : "border-brand bg-sky-50 text-brand"}`}
    >
      {tagId === null ? "種類 ▾" : `${label} ✕`}
    </button>
  );
}

// 家具一覧の行ジャンプ（ア行→カ行→…）。ポケモン一覧の50匹送りと同じ見た目。一番下では▼を押せず、一番上の▲は一番下へ移動
function RowJump({ deps }: { deps: unknown }) {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const [labels, setLabels] = useState<{ prev: string; next: string }>({ prev: "", next: "" });

  useEffect(() => {
    const stops = () => [...document.querySelectorAll<HTMLElement>("[data-jump]")];
    const barBottom = () => document.querySelector<HTMLElement>("[data-furniture-top]")?.getBoundingClientRect().bottom ?? 0;
    const update = () => {
      setAtTop(window.scrollY <= 2);
      setAtBottom(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2);
      const s = stops();
      const bar = barBottom();
      const nextEl = s.find((e) => e.getBoundingClientRect().top > bar + 8);
      const prevEl = [...s].reverse().find((e) => e.getBoundingClientRect().top < bar - 8);
      setLabels({ prev: prevEl?.dataset.jump ?? "", next: nextEl?.dataset.jump ?? "" });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [deps]);

  const jump = (dir: 1 | -1) => {
    const top = document.querySelector<HTMLElement>("[data-furniture-top]");
    const bar = top?.getBoundingClientRect().bottom ?? 0;
    const stuck = top?.offsetHeight ?? 0;
    const s = [...document.querySelectorAll<HTMLElement>("[data-jump]")];
    const el = dir === 1 ? s.find((e) => e.getBoundingClientRect().top > bar + 8) : [...s].reverse().find((e) => e.getBoundingClientRect().top < bar - 8);
    if (!el) return window.scrollTo({ top: dir === 1 ? document.documentElement.scrollHeight : 0, behavior: "smooth" });
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - stuck - 4, behavior: "smooth" });
  };
  const btn =
    "flex h-11 w-11 flex-col items-center justify-center rounded-full border border-brand/30 bg-white/95 text-[10px] font-extrabold leading-tight text-brand shadow-md transition-opacity disabled:opacity-35 disabled:shadow-none";
  return (
    <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 flex flex-col gap-2 right-[max(0.75rem,calc(50vw-14rem+0.75rem))]">
      {/* 一番上では押せなくする代わりに、一番下へ移動する */}
      <button
        type="button"
        aria-label={atTop ? "一番下へ" : "前の行へ"}
        onClick={() => (atTop ? window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" }) : jump(-1))}
        className={btn}
      >
        ▲<span>{atTop ? "最後へ" : labels.prev || "上"}</span>
      </button>
      <button type="button" aria-label="次の行へ" disabled={atBottom} onClick={() => jump(1)} className={btn}>
        ▼<span>{labels.next || "下"}</span>
      </button>
    </div>
  );
}

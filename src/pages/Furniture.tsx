// /pocoapoke/src/pages/Furniture.tsx
// 家具さがし: 家具から（名前・属性で絞り込み）／ポケモンから（好きなものに当てはまる家具を多い順に）
import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { usePokemonData } from "../api/usePokemonData";
import { AppHeader } from "../components/AppHeader";
import { FilterSheet } from "../components/FilterSheet";
import { FurnitureCard } from "../components/FurnitureCard";
import { LikersSheet } from "../components/LikersSheet";
import { PokemonPicker } from "../components/PokemonPicker";
import { favoriteCodes, filterFurniture, pokemonWhoLike, rankFurniture } from "../lib/furniture";
import type { FurnitureItem } from "../types";
import furnitureData from "../data/furniture.json";

const FURNITURE = furnitureData as FurnitureItem[];
const NO_HIGHLIGHT = new Set<number>();

export default function Furniture() {
  const { data } = usePokemonData();
  // /furniture?poke=<id> で開くと「ポケモンから」でそのポケモンを選んだ状態にする（数でない値は無視）
  const [params] = useSearchParams();
  const pokeParam = Number(params.get("poke"));
  const initialPoke = params.get("poke") && Number.isInteger(pokeParam) && pokeParam > 0 ? [pokeParam] : [];
  const [mode, setMode] = useState<"items" | "pokemon">(initialPoke.length ? "pokemon" : "items");
  const [selected, setSelected] = useState<number[]>(initialPoke);
  const [query, setQuery] = useState("");
  const [favId, setFavId] = useState<number | null>(null); // 絞り込み中の属性（master id）
  const [sheet, setSheet] = useState(false);
  const [likerCode, setLikerCode] = useState<number | null>(null);

  const all = data?.pokemon ?? [];
  const favorites = useMemo(() => (data?.master.favorite ?? []).filter((m) => m.code > 5), [data]);
  const favById = useMemo(() => new Map((data?.master.favorite ?? []).map((m) => [m.id, m])), [data]);
  const labelByCode = useMemo(() => new Map(favorites.map((m) => [m.code, m.label])), [favorites]);
  const favCode = favorites.find((m) => m.id === favId)?.code ?? null;

  const items = filterFurniture(FURNITURE, { query, code: favCode });
  const likers = likerCode === null ? [] : pokemonWhoLike(likerCode, all, favById);
  const towns = useMemo(() => [...(data?.master.place ?? [])].sort((a, b) => (a.code === 0 ? 99 : a.code) - (b.code === 0 ? 99 : b.code)), [data]);
  // 存在しない id は選ばれていないものとして扱う
  const picks = selected
    .map((id) => all.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({ pokemon: p, codes: favoriteCodes(p, favById) }));
  const ranked = mode === "pokemon" ? rankFurniture(FURNITURE, picks) : [];

  return (
    <div>
      <Helmet>
        <title>家具さがし | pocoapoke</title>
      </Helmet>
      <AppHeader title="家具さがし" subtitle="好きなものに合う家具をさがす" unit="件" count={mode === "items" ? items.length : picks.length ? ranked.length : undefined} />

      <div className="sticky top-0 z-20 border-b border-line bg-white px-3 py-2">
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
          </div>
        )}
      </div>

      {mode === "items" && (
        <>
          {items.length === 0 && <p className="p-6 text-center text-sub">条件に合う家具はありません</p>}
          <WithNoJaSection
            list={items}
            render={(item) => (
              <FurnitureCard
                key={item.slug}
                item={item}
                labelByCode={labelByCode}
                highlight={favCode === null ? NO_HIGHLIGHT : new Set([favCode])}
                onTapFavorite={setLikerCode}
              />
            )}
          />
        </>
      )}

      {mode === "pokemon" && (
        <>
          <PokemonPicker all={all} towns={towns} selected={selected} onChange={setSelected} />
          {picks.length > 0 && ranked.length === 0 && <p className="p-6 text-center text-sub">好きなものに当てはまる家具はありません</p>}
          <WithNoJaSection
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
      <LikersSheet code={likerCode} label={likerCode === null ? "" : labelByCode.get(likerCode) ?? ""} pokemon={likers} onClose={() => setLikerCode(null)} />
    </div>
  );
}

// 日本語名がまだない家具（英語名）は、一覧の下に別枠でまとめて出す
function WithNoJaSection<T extends { noJa?: boolean }>({ list, render }: { list: T[]; render: (v: T) => ReactNode }) {
  const known = list.filter((v) => !v.noJa);
  const unknown = list.filter((v) => v.noJa);
  return (
    <>
      {known.map(render)}
      {unknown.length > 0 && (
        <>
          <div className="mx-2.5 mt-5 mb-1 rounded-lg bg-slate-200/70 px-3 py-1.5 text-xs font-extrabold text-sub">
            日本語名がまだない家具（英語名） {unknown.length}件
          </div>
          {unknown.map(render)}
        </>
      )}
    </>
  );
}

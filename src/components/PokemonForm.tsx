// /pocoapoke/src/components/PokemonForm.tsx
// 登録・編集で共通のフォーム（見た目のみ。状態はページ側が持つ）
import type { ReactNode } from "react";
import type { MasterItem } from "../types";
import type { Master } from "../api/useMasterCodes";
import { MASTER_CLASS, POKEMON_CATEGORY, type PokemonCategory } from "../constants";
import { PokemonIcon } from "./PokemonIcon";
import { Chip } from "./Chip";
import { Switch } from "./Switch";

export type FormState = {
  category: PokemonCategory;
  number: number | null; // 本編は図鑑番号、EX/DLC はローカル番号
  name: string;
  specialty1: number | null;
  specialty2: number | null;
  environment: number | null;
  favorites: number[]; // 味以外（最大5）
  taste: number | null; // 味（favorite6）
  place: number | null;
  showInProgress: boolean;
};

const CATEGORY_OPTIONS: { value: PokemonCategory; label: string }[] = [
  { value: POKEMON_CATEGORY.DLC, label: "DLC" },
  { value: POKEMON_CATEGORY.EX, label: "EX" },
  { value: POKEMON_CATEGORY.MAIN, label: "本編" },
];
const TASTE_CODE_MAX = 5; // 好きなもの code 1〜5 は味

type Props = {
  isEdit: boolean;
  iconId: number;
  master: Master;
  state: FormState;
  onChange: (patch: Partial<FormState>) => void;
  onCategory: (c: PokemonCategory) => void;
};

function Card({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="mx-2.5 my-2.5 rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
      <div className="mb-2 flex justify-between text-sm font-extrabold">
        <span>{title}</span>
        {note && <span className="text-xs font-semibold text-sub">{note}</span>}
      </div>
      {children}
    </section>
  );
}

const sub = "mt-2 mb-1 text-[11px] font-bold text-sub";

export function PokemonForm({ isEdit, iconId, master, state, onChange, onCategory }: Props) {
  const specialty = master[MASTER_CLASS.SPECIALTY] ?? [];
  const environments = (master[MASTER_CLASS.ENVIRONMENT] ?? []).filter((m) => m.code !== 0);
  const favorites = master[MASTER_CLASS.FAVORITE] ?? [];
  const otherFavs = favorites.filter((m) => m.code > TASTE_CODE_MAX);
  const tastes = favorites.filter((m) => m.code >= 1 && m.code <= TASTE_CODE_MAX);
  const places = [...(master[MASTER_CLASS.PLACE] ?? [])].sort((a, b) => a.code - b.code);
  const toggle = (id: number | null, v: number) => (id === v ? null : v);
  const chips = (items: MasterItem[], selected: (id: number) => boolean, onClick: (id: number) => void, disabled?: (id: number) => boolean) => (
    <div className="flex flex-wrap gap-1.5">
      {items.map((m) => (
        <Chip key={m.id} selected={selected(m.id)} disabled={disabled?.(m.id)} onClick={() => onClick(m.id)}>{m.label}</Chip>
      ))}
    </div>
  );

  return (
    <>
      <Card title="基本情報">
        <div className="flex items-center gap-2.5">
          {state.name.trim() ? <PokemonIcon id={iconId} name={state.name.trim()} size={56} /> : <PokemonIcon id={-1} name="" size={56} />}
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex rounded-lg bg-slate-100 p-0.5">
              {CATEGORY_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onCategory(o.value)}
                  className={`flex-1 rounded-md py-1.5 text-xs font-bold ${state.category === o.value ? "bg-white text-ink shadow-sm" : "text-sub"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                aria-label="番号"
                inputMode="numeric"
                value={state.number ?? ""}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  onChange({ number: v === "" || Number.isNaN(Number(v)) ? null : Number(v) });
                }}
                className="w-16 rounded-lg border border-slate-300 px-2 py-2 text-center text-sm"
              />
              <input
                aria-label="なまえ"
                placeholder="なまえ"
                value={state.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
          </div>
        </div>
        <div className={sub}>住んでる街</div>
        {chips(places, (id) => state.place === id, (id) => onChange({ place: id }))}
        {isEdit && (
          <label className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[13px] font-bold">
            住みごこち画面に表示
            <Switch checked={state.showInProgress} onChange={(v) => onChange({ showInProgress: v })} label="住みごこち画面に表示" />
          </label>
        )}
      </Card>

      <Card title="得意なこと" note="1つ目は必須">
        <div className={sub}>1つ目</div>
        {chips(specialty.filter((m) => m.code !== 0), (id) => state.specialty1 === id, (id) => onChange({ specialty1: toggle(state.specialty1, id) }))}
        <div className={sub}>2つ目</div>
        {chips(specialty, (id) => state.specialty2 === id, (id) => onChange({ specialty2: toggle(state.specialty2, id) }))}
      </Card>

      <Card title="好きな環境">
        {chips(environments, (id) => state.environment === id, (id) => onChange({ environment: toggle(state.environment, id) }))}
      </Card>

      <Card title="好きなもの" note={`${state.favorites.length}/5`}>
        {chips(
          otherFavs,
          (id) => state.favorites.includes(id),
          (id) =>
            onChange({
              favorites: state.favorites.includes(id) ? state.favorites.filter((x) => x !== id) : [...state.favorites, id],
            }),
          (id) => !state.favorites.includes(id) && state.favorites.length >= 5,
        )}
        <div className={sub}>好きな味</div>
        {chips(tastes, (id) => state.taste === id, (id) => onChange({ taste: toggle(state.taste, id) }))}
      </Card>
    </>
  );
}

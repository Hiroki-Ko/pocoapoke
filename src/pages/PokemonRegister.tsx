// /pocoapoke/src/pages/PokemonRegister.tsx
// ポケモン登録（/register）と編集（/edit/:id）。見た目は PokemonForm、ここはデータの読み込みと送信。
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { POKEMON_CATEGORY, type PokemonCategory } from "../constants";
import { useMasterCodes } from "../api/useMasterCodes";
import { useNextNumber } from "../api/useNextNumber";
import { useNextLocalNumber } from "../api/useNextLocalNumber";
import { POKEMON_DATA_KEY } from "../api/usePokemonData";
import { AppHeader } from "../components/AppHeader";
import { PokemonForm, type FormState } from "../components/PokemonForm";
import { useToast } from "../components/Toast";

type LoadedPokemon = {
  id: number;
  category: PokemonCategory;
  number: number | null;
  local_number: number | null;
  name: string;
  specialty1: number;
  specialty2: number | null;
  environment: number;
  favorite1: number | null;
  favorite2: number | null;
  favorite3: number | null;
  favorite4: number | null;
  favorite5: number | null;
  favorite6: number | null;
  place_code: number | null;
  show_in_progress: 0 | 1;
};

const EMPTY: FormState = {
  category: POKEMON_CATEGORY.DLC, // 今後は本編を選ぶことはほぼ無いため初期値は DLC
  number: null,
  name: "",
  specialty1: null,
  specialty2: null,
  environment: null,
  favorites: [],
  taste: null,
  place: null,
  showInProgress: true,
};

function fromLoaded(p: LoadedPokemon): FormState {
  return {
    category: p.category,
    number: p.category === POKEMON_CATEGORY.MAIN ? p.number : p.local_number,
    name: p.name,
    specialty1: p.specialty1,
    specialty2: p.specialty2,
    environment: p.environment,
    favorites: [p.favorite1, p.favorite2, p.favorite3, p.favorite4, p.favorite5].filter((v): v is number => v != null),
    taste: p.favorite6,
    place: p.place_code,
    showInProgress: p.show_in_progress === 1,
  };
}

export default function PokemonRegister() {
  const { id: idParam } = useParams();
  const editId = idParam ? Number(idParam) : null;
  const isEdit = editId !== null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: master, isLoading } = useMasterCodes();

  const [state, setState] = useState<FormState>(EMPTY);
  const [autoNumber, setAutoNumber] = useState(!isEdit); // true の間は次の空き番号を自動で入れる
  const [original, setOriginal] = useState<LoadedPokemon | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isMain = state.category === POKEMON_CATEGORY.MAIN;
  const { data: nextNumberData, refetch: refetchNextNumber } = useNextNumber();
  const { data: nextLocalData, refetch: refetchNextLocal } = useNextLocalNumber(state.category);
  const nextNumber: number | null = (isMain ? nextNumberData?.next : nextLocalData?.next) ?? null;

  useEffect(() => {
    if (autoNumber && nextNumber !== null) setState((s) => ({ ...s, number: nextNumber }));
  }, [autoNumber, nextNumber]);

  // 登録時の「住んでる街」の既定は未登録
  useEffect(() => {
    if (!isEdit && master && state.place === null) {
      const none = (master.place ?? []).find((m) => m.code === 0);
      if (none) setState((s) => ({ ...s, place: none.id }));
    }
  }, [isEdit, master, state.place]);

  useEffect(() => {
    if (!isEdit) return;
    if (!Number.isInteger(editId) || editId! <= 0) {
      setLoadError("IDが不正です");
      return;
    }
    let cancelled = false;
    fetch(`/api/getPokemon?id=${editId}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setOriginal(json.pokemon);
          setState(fromLoaded(json.pokemon));
          setAutoNumber(false);
        } else setLoadError(json.error ?? "読み込みに失敗しました");
      })
      .catch(() => !cancelled && setLoadError("読み込みに失敗しました"));
    return () => {
      cancelled = true;
    };
  }, [editId, isEdit]);

  const patch = (p: Partial<FormState>) => setState((s) => ({ ...s, ...p }));
  // 次の空き番号ボタンをタップ → 手入力（空欄から）
  const manualNumber = () => {
    setAutoNumber(false);
    setState((s) => ({ ...s, number: null }));
  };
  const autoNumberAgain = () => setAutoNumber(true);

  const changeCategory = (c: PokemonCategory) => {
    // 編集中に元のカテゴリへ戻したら元の番号を復元
    if (isEdit && original && c === original.category) {
      setAutoNumber(false);
      setState((s) => ({ ...s, category: c, number: fromLoaded(original).number }));
      return;
    }
    setAutoNumber(true);
    setState((s) => ({ ...s, category: c, number: null }));
  };

  const reset = () => {
    if (isEdit && original) {
      setState(fromLoaded(original));
      setAutoNumber(false);
      return;
    }
    setState((s) => ({ ...EMPTY, category: s.category, place: (master?.place ?? []).find((m) => m.code === 0)?.id ?? null }));
    setAutoNumber(true);
  };

  const submit = async () => {
    if (typeof state.number !== "number" || Number.isNaN(state.number)) return toast.show(isMain ? "番号は数値で入力してください" : "番号(ローカル)は数値で入力してください", "error");
    if (!state.name.trim()) return toast.show("名前は必須です", "error");
    if (!state.specialty1) return toast.show("得意なこと1は必須です", "error");
    if (!state.environment) return toast.show("好きな環境は必須です", "error");

    // favorite1-5: 味以外（不足分は null） / favorite6: 味
    const slots: (number | null)[] = [...state.favorites];
    while (slots.length < 5) slots.push(null);
    slots.push(state.taste);

    const payload = {
      ...(isEdit ? { id: editId, showInProgress: state.showInProgress } : {}),
      category: state.category,
      number: isMain ? state.number : null,
      localNumber: isMain ? null : state.number,
      name: state.name.trim(),
      specialty1: state.specialty1,
      specialty2: state.specialty2,
      environment: state.environment,
      favorites: slots,
      ...(state.place !== null ? { placeCode: state.place } : {}),
    };

    const res = await fetch(isEdit ? "/api/updatePokemon" : "/api/registerPokemon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!json.success) return toast.show(json.error ?? (isEdit ? "更新に失敗しました" : "登録に失敗しました"), "error");

    queryClient.invalidateQueries({ queryKey: POKEMON_DATA_KEY });
    queryClient.invalidateQueries({ queryKey: ["nextNumber"] });
    queryClient.invalidateQueries({ queryKey: ["nextLocalNumber"] });
    if (isEdit) {
      toast.show("更新しました！", "success");
      setOriginal((o) =>
        o && {
          ...o,
          category: state.category,
          number: isMain ? state.number : null,
          local_number: isMain ? null : state.number,
          name: state.name.trim(),
          specialty1: state.specialty1!,
          specialty2: state.specialty2,
          environment: state.environment!,
          favorite1: slots[0], favorite2: slots[1], favorite3: slots[2], favorite4: slots[3], favorite5: slots[4], favorite6: slots[5],
          place_code: state.place,
          show_in_progress: state.showInProgress ? 1 : 0,
        },
      );
    } else {
      toast.show("登録しました！", "success");
      await (isMain ? refetchNextNumber() : refetchNextLocal());
      reset();
    }
  };

  const title = isEdit ? "ポケモン編集" : "ポケモン登録";
  if (loadError) {
    return (
      <div>
        <AppHeader title={title} subtitle="登録内容を修正" />
        <p className="p-6 text-center text-red-600">{loadError}</p>
        <div className="text-center">
          <button type="button" onClick={() => navigate("/")} className="rounded-xl bg-slate-100 px-4 py-2.5 font-bold">一覧に戻る</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <Helmet>
        <title>{title} | pocoapoke</title>
      </Helmet>
      <AppHeader title={title} subtitle={isEdit ? "登録内容を修正" : "新しいポケモンを追加"} />
      {isLoading || !master || (isEdit && !original) ? (
        <p className="p-6 text-center text-sub">読み込み中…</p>
      ) : (
        <PokemonForm
          isEdit={isEdit}
          iconId={editId ?? -1}
          master={master}
          state={state}
          autoNumber={autoNumber}
          onChange={patch}
          onCategory={changeCategory}
          onManualNumber={manualNumber}
          onAutoNumber={autoNumberAgain}
        />
      )}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 mx-auto flex max-w-md gap-2 border-t border-line bg-white px-2.5 py-2">
        {isEdit ? (
          <button type="button" onClick={() => navigate("/")} className="w-28 rounded-xl bg-slate-100 py-3 text-sm font-extrabold">一覧に戻る</button>
        ) : (
          <button type="button" onClick={reset} className="w-28 rounded-xl bg-slate-100 py-3 text-sm font-extrabold">リセット</button>
        )}
        <button type="button" onClick={submit} className="flex-1 rounded-xl bg-brand py-3 text-sm font-extrabold text-white">
          {isEdit ? "更新する" : "登録する"}
        </button>
      </div>
    </div>
  );
}

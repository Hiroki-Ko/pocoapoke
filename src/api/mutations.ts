// /pocoapoke/src/api/mutations.ts
// 住みごこち画面の更新。画面を先に書き換え（オプティミスティック更新）、失敗したらサーバーの状態を取り直して通知する。
// 同じ種類の更新は scope で直列に送るので、連打してもサーバーに届く順番が入れ替わらない。
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MasterItem, Pokemon, PokemonData, PokemonStatus } from "../types";
import { POKEMON_DATA_KEY } from "./usePokemonData";
import { gameDay } from "../lib/gameDay";
import { useToast } from "../components/Toast";

async function post(path: string, body: unknown) {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error ?? "保存に失敗しました");
  return json;
}

const EMPTY_STATUS: PokemonStatus = {
  status_code: null, place_code: null, status_code_id: null, place_code_id: null,
  cared_on: null, wish_favorite: null, wish_on: null,
};

function useOptimistic<V>(
  key: string,
  mutationFn: (v: V) => Promise<unknown>,
  apply: (p: Pokemon, v: V, data: PokemonData) => Pokemon,
  pokeId: (v: V) => number,
  success?: string,
) {
  const qc = useQueryClient();
  const toast = useToast();
  const mutationKey = [key];
  return useMutation({
    mutationKey,
    scope: { id: key },
    mutationFn,
    onMutate: async (v: V) => {
      await qc.cancelQueries({ queryKey: POKEMON_DATA_KEY });
      const prev = qc.getQueryData<PokemonData>(POKEMON_DATA_KEY);
      if (prev) {
        qc.setQueryData<PokemonData>(POKEMON_DATA_KEY, {
          ...prev,
          pokemon: prev.pokemon.map((p) => (p.id === pokeId(v) ? apply(p, v, prev) : p)),
        });
      }
    },
    onError: (e: Error) => {
      // スナップショットに戻すと、後から押した操作の表示まで消えてしまうため、サーバーの状態を取り直す
      toast.show(e.message || "保存に失敗しました", "error");
    },
    onSuccess: () => {
      if (success) toast.show(success, "success");
    },
    onSettled: () => {
      // 続けて送る操作が残っている間は取り直さない（途中の状態で画面がちらつくのを防ぐ）
      if (qc.isMutating({ mutationKey }) <= 1) qc.invalidateQueries({ queryKey: POKEMON_DATA_KEY });
    },
  });
}

export function useUpdateCare() {
  return useOptimistic(
    "updateCare",
    (v: { poke_id: number; cared: boolean }) => post("/api/updateCare", v),
    (p, v) => ({ ...p, status: { ...(p.status ?? EMPTY_STATUS), cared_on: v.cared ? gameDay() : null } }),
    (v) => v.poke_id,
  );
}

export type ProgressInput = { poke_id: number; status_code: number; place_code: number; wish_favorite: number | null };

export function useUpdateProgress() {
  const find = (data: PokemonData, cls: string, id: number | null): MasterItem | null =>
    id == null ? null : (data.master[cls] ?? []).find((m) => m.id === id) ?? null;
  return useOptimistic(
    "updateProgress",
    (v: ProgressInput) => post("/api/updateProgress", v),
    (p, v, data) => ({
      ...p,
      status: {
        ...(p.status ?? EMPTY_STATUS),
        status_code: find(data, "evaluation", v.status_code),
        status_code_id: v.status_code,
        place_code: find(data, "place", v.place_code),
        place_code_id: v.place_code,
        wish_favorite: find(data, "favorite", v.wish_favorite),
        wish_on: v.wish_favorite == null ? null : gameDay(),
      },
    }),
    (v) => v.poke_id,
    "保存しました",
  );
}

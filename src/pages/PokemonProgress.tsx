// /pocoapoke/src/pages/PokemonProgress.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { usePokemonData } from '../api/usePokemonData';
import { MasterSelect } from "../components/MasterSelect";
import { MASTER_CLASS } from "../constants";

export default function PokemonProgress() {
    type Pokemon = {
      id: number;
      number: number;
      name: string;
      specialty1: { id: number; label: string } | null;
      specialty2: { id: number; label: string } | null;
      environment: { id: number; label: string } | null;
      favorites: { id: number; label: string }[] | null;
      status: { status_code: number; place_code: nubmer; today_wish: number; } | null;
      created_at: string;
      updated_at: string | null;
    };
    const [wish, setWish] = useState<boolean>(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = usePokemonData();
    const [finished, setFinished] = useState<number[]>([]);
    const [view, setView] = useState<boolean>(false);
    const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
    const [dispPokemonData, setDispPokemonData] = useState<Pokemon[]>([]);

    if (isLoading) return <div>読み込み中...</div>;
    if (isError) return <div>データ取得に失敗しました</div>;
    if (!data) return <div>読み込み中...</div>;
    const pokemonData: Pokemon = data.pokemon;
    const master = data.master;
    const wishList = [
      ...(master.wish ?? []),
      ...(master.environment ?? []),
      ...(master.category ?? [])
    ];


    const changePokemonStatus = async (
      pokemonId: Number,
      masterId: Number,
      field: String
    ) => {
        console.log(`${field} change ${pokemonId} ${masterId}`);
        // 対象のステータスを更新
        await fetch("/api/updateStatus", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            poke_id: pokemonId,
            field,
            master_id: masterId
          })
        });

        queryClient.invalidateQueries(["pokemonData"]);
        console.log("saved:", field, masterId);
    }

    const wishFinished = (pokemonId: Number) => {
        // 対象の行をグレーアウト
        setFinished((prev) =>
          prev.includes(pokemonId)
            ? prev.filter((id) => id !== pokemonId) // 解除
            : [...prev, pokemonId] // 完了
        );
    }

    const allClear = async () => {
        // 全てのチェックボックスをクリア(false)
        setFinished([]);
        // 全ての「欲しいもの」(today_wish)を None に変更
        await fetch("/api/clearAllWish", { method: "POST" });
        queryClient.invalidateQueries(["pokemonData"]);
        console.log('checkbox all clear!!');
    }

    // view=true の場合、全て表示
    const invisibleCol = view ? 6 : 1;

    useEffect(() => {
      // 初期状態に戻す（全件表示）
      if (selectedPlace === null) {
        setDispPokemonData(pokemonData);
        return;
      }
      // フィルタリング
      setDispPokemonData(
        pokemonData.filter((p) =>
          (p.status?.place_code?.id ?? null) === selectedPlace
        )
      );
    }, [selectedPlace, pokemonData]);

    return (
        <div>
            <Helmet>
              <title>Pokemon Progress</title>
            </Helmet>
            <h2>Pokemon Progress</h2>
            <MasterSelect
              className={MASTER_CLASS.PLACE}
              label="好きなもの"
              masterCodes={master}
              value={selectedPlace}
              onChange={setSelectedPlace}
            />
            <div className="table-wrapper">
                <table border={1} className={view ? "table-wide" : ""}>
                    <thead>
                    <tr>
                        <th className="checkbox-cell">
                          <button onClick={() => allClear()}></button>
                        </th>
                        <th>なまえ</th>
                        <th>住んでる街</th>
                        <th>住みごこち</th>
                        <th>欲しいもの</th>
                        <th
                          colSpan={invisibleCol}
                          onClick={() => setView(!view)}
                        >
                            好きなもの
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {dispPokemonData.map((p) => (
                        <tr key={p.id} className={finished.includes(p.id) ? "finished-row" : ""}>
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={finished.includes(p.id)}
                            onChange={() => wishFinished(p.id)}
                          />
                        </td>
                        {/* 名前 */}
                        <td>{p.name}</td>
                        {/* 住んでる街 */}
                        <td>
                            <select
                                value={p.status?.place_code?.id}
                                onChange={(e) => changePokemonStatus(p.id, Number(e.target.value), 'place_code')}
                            >
                            <option value="">未設定</option>
                            {master.place?.map((m) => (
                                <option key={m.id} value={m.id}>
                                {m.label}
                                </option>
                            ))}
                            </select>
                        </td>
                        {/* 住みごこち */}
                        <td>
                            <select
                              value={p.status?.status_code?.id}
                              onChange={(e) => changePokemonStatus(p.id, Number(e.target.value), 'status_code')}
                            >
                            {master.evaluation?.map((m) => (
                                <option key={m.id} value={m.id}>
                                {m.label}
                                </option>
                            ))}
                            </select>
                        </td>
                        {/* 欲しいもの */}
                        <td>
                            <select
                              value={p.status?.today_wish?.id}
                              onChange={(e) => changePokemonStatus(p.id, Number(e.target.value), 'today_wish')}
                            >
                              <optgroup label="欲しいもの">
                                {master.wish?.map((m) => (
                                  <option key={m.id} value={m.id}>{m.label}</option>
                                ))}
                              </optgroup>

                              <optgroup label="環境">
                                {master.environment?.map((m) => (
                                  <option key={m.id} value={m.id}>{m.label}</option>
                                ))}
                              </optgroup>

                              <optgroup label="カテゴリ">
                                {master.category?.map((m) => (
                                  <option key={m.id} value={m.id}>{m.label}</option>
                                ))}
                              </optgroup>
                            </select>
                        </td>
                        {/* 好きなもの */}
                        {p.favorites.map((fav, i) => {
                            // view=falseのときは五味(index=5)のみ表示
                            if (!view && i != 5) return;
                            return (
                              <td key={i}>{fav?.label}</td>
                            )
                          })
                        }
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="scroll-buttons">
                  <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    ▲
                  </button>
                  <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
                    ▼
                  </button>
                </div>
            </div>
        </div>
    )
}
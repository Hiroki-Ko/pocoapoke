// /pocoapoke/src/pages/PokemonProgress.tsx
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { usePokemonData } from '../api/usePokemonData';

export default function PokemonProgress() {
    const [wish, setWish] = useState<boolean>(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = usePokemonData();
    const [finished, setFinished] = useState<number[]>([]);

    if (isLoading) return <div>読み込み中...</div>;
    if (isError) return <div>データ取得に失敗しました</div>;
    if (!data) return <div>読み込み中...</div>;
    const pokemonData = data.pokemon;
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

    return (
        <div>
            <h2>Pokemon Progress</h2>
            <div className="table-wrapper">
                <table border={1}>
                    <thead>
                    <tr>
                        <th><button onClick={() => allClear()}></button></th>
                        <th>なまえ</th>
                        <th>住んでる街</th>
                        <th>住みごこち</th>
                        <th>欲しいもの</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pokemonData.map((p) => (
                        <tr key={p.id} className={finished.includes(p.id) ? "finished-row" : ""}>
                        <td>
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
                                value={p.status.place_code?.id}
                                onChange={(e) => changePokemonStatus(p.id, Number(e.target.value), 'place_code')}
                            >
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
                              value={p.status.status_code?.id}
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
                              value={p.status.today_wish?.id}
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

                        {p.favorites.map((fav, i) => (
                            <td key={i}>{fav?.label}</td>
                        ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
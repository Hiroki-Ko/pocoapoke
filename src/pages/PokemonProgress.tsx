// /pocoapoke/src/pages/PokemonProgress.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { usePokemonData } from '../api/usePokemonData';
import type { Master } from "../api/useMasterCodes";
import { MasterSelect } from "../components/MasterSelect";
import { MASTER_CLASS } from "../constants";

type Pokemon = {
  id: number;
  number: number;
  name: string;
  specialty1: Master | null;
  specialty2: Master | null;
  environment: Master | null;
  favorites: Master[] | null;
  status: {
    status_code: Master | null;
    place_code: Master | null;
    today_wish: Master | null;
  } | null;
  created_at: string;
  updated_at: string | null;
};

export default function PokemonProgress() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [wish, setWish] = useState<boolean>(false);
    const [view, setView] = useState<boolean>(false);
    const [sortAsc, setSortAsc] = useState<boolean>(true);
    const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
    const [activePokemonId, setActivePokemonId] = useState<number | null>(null);
    const [finished, setFinished] = useState<number[]>([]);
    const [dispPokemonData, setDispPokemonData] = useState<Pokemon[]>([]);
    const { data, isLoading, isError } = usePokemonData();
    

    // data が未取得の場合は空配列/空オブジェクトで初期化
    const pokemonData: Pokemon[] = data?.pokemon ?? [];
    const master: Master = data?.master ?? {};

    // view=true の場合、全て表示
    const invisibleCol = view ? 6 : 1;

    useEffect(() => {
      console.log(selectedPlace)
      if (selectedPlace === null) {
        setDispPokemonData(pokemonData);
      } else {
        setDispPokemonData(
          pokemonData.filter((p) => 
            (p.status?.place_code?.id ?? null) === selectedPlace
          )
        );
      }
    }, [selectedPlace, pokemonData]);

    if (isLoading) return <div>読み込み中...</div>;
    if (isError) return <div>データ取得に失敗しました</div>;
    if (!data) return <div>読み込み中...</div>;

    const changePokemonStatus = async (
      pokemonId: Number,
      masterId: Number,
      field: String
    ) => {
        console.log(`${field} change ${pokemonId} ${masterId}`);
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
    };

    const sortStatus = () => {
        setDispPokemonData((prev) =>
          [...prev].sort((a, b) => {
            const aCode = a.status?.status_code?.id ?? 0;
            const bCode = b.status?.status_code?.id ?? 0;
            return sortAsc ? aCode - bCode : bCode - aCode;
          })
        );
        setSortAsc(!sortAsc);
    };

    const wishFinished = (pokemonId: Number) => {
        setFinished((prev) =>
          prev.includes(pokemonId)
            ? prev.filter((id) => id !== pokemonId)
            : [...prev, pokemonId]
        );
    };

    const allClear = async () => {
        setFinished([]);
        await fetch("/api/clearAllWish", { method: "POST" });
        queryClient.invalidateQueries(["pokemonData"]);
        console.log('checkbox all clear!!');
    };

    return (
        <div>
            <Helmet>
              <title>Pokemon Progress</title>
            </Helmet>
            <h2>Pokemon Progress</h2>
            <h3>住ポケ数 : {dispPokemonData.length}</h3>
            <MasterSelect
              className={MASTER_CLASS.PLACE}
              label="住んでる街"
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
                        <th onClick={() => sortStatus()}>住みごこち</th>
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
                                value={p.status?.place_code?.id ?? ""}
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
                            {activePokemonId === p.id && (
                              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                                {p.name}
                              </div>
                            )}
                            <select
                              onFocus={() => setActivePokemonId(p.id)}
                              onBlur={() => setActivePokemonId(null)}
                              value={p.status?.status_code?.id ?? ""}
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
                        {p.favorites
                          ?.filter((_, i) => view || i === 5)
                          .map((fav, i) => (
                            <td key={i}>{fav?.label}</td>
                          ))
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
    );
}

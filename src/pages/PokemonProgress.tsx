// /pocoapoke/src/pages/PokemonProgress.tsx
import { useEffect, useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { usePokemonData } from '../api/usePokemonData';
import type { Master } from "../api/useMasterCodes";
import { MasterSelect } from "../components/MasterSelect";
import { MASTER_CLASS } from "../constants";
import ClearIcon from "@mui/icons-material/Clear";
import { Chip, Box } from "@mui/material";

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
    const queryClient = useQueryClient();
    const [view, setView] = useState<boolean>(false);
    const [sortMode, setSortMode] = useState<"none" | "asc" | "desc">("none");
    const [nameSortMode, setNameSortMode] = useState<"none" | "reverse" | "asc" | "desc">("none");
    const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
    const [selectedEvalution, setSelectedEvalution] = useState<number[]>([]);
    const [finished, setFinished] = useState<number[]>([]);
    const [dispPokemonData, setDispPokemonData] = useState<Pokemon[]>([]);
    const { data, isLoading, isError } = usePokemonData();
    

    // data が未取得の場合は空配列/空オブジェクトで初期化
    const pokemonData: Pokemon[] = data?.pokemon ?? [];
    const master: Master = data?.master ?? {};

    // view=true の場合、全て表示
    const invisibleCol = view ? 6 : 1;
    const isFiltering = selectedPlace !== null || (selectedEvalution && selectedEvalution.length > 0);
    const evalColors: Record<number, string> = {
      0: "#E0E0E0",   // 未登録
      1: "#FF4D4D",   // 最高
      2: "#FF8C42",   // めちゃイイ
      3: "#FFD93D",   // ちょっといい
      4: "#6BCB77",   // ふつう
      5: "#4D96FF",   // びみょう
      6: "#BFBFBF",   // すみかなし
    };


    useEffect(() => {
      // 1. フィルタ
      let list = pokemonData.filter((p) => {
        const placeId = p.status?.place_code?.id;
        const evalId = p.status?.status_code?.id ?? -1;

        const matchPlace = !selectedPlace || placeId === selectedPlace;
        const matchEval = selectedEvalution.length === 0 || selectedEvalution.includes(evalId);

        return matchPlace && matchEval;
      });

      // 2. ソート（住みごこち）
      if (sortMode === "asc") {
        list.sort((a, b) => (a.status?.status_code?.id ?? 0) - (b.status?.status_code?.id ?? 0));
      } else if (sortMode === "desc") {
        list.sort((a, b) => (b.status?.status_code?.id ?? 0) - (a.status?.status_code?.id ?? 0));
      }

      // 2b. ソート（なまえ）
      if (nameSortMode === "reverse") {
        list = [...list].reverse();
      } else if (nameSortMode === "asc") {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ja"));
      } else if (nameSortMode === "desc") {
        list = [...list].sort((a, b) => b.name.localeCompare(a.name, "ja"));
      }

      // 3. 反映
      setDispPokemonData(list);
    }, [pokemonData, selectedPlace, selectedEvalution, sortMode, nameSortMode]);


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
        queryClient.invalidateQueries({ queryKey: ["pokemonData"] });
        console.log("saved:", field, masterId);
    };

    // ソート（住みごこち）
    const sortStatus = () => {
        setNameSortMode("none");
        setSortMode((prev) => {
          if (prev === "none") return "asc";
          if (prev === "asc") return "desc";
          return "none";
        });
    };

    // ソート（なまえ）
    const cycleNameSort = () => {
        setSortMode("none");
        setNameSortMode((prev) => {
          if (prev === "none") return "reverse";
          if (prev === "reverse") return "asc";
          if (prev === "asc") return "desc";
          return "none";
        });
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
        queryClient.invalidateQueries({ queryKey: ["pokemonData"] });
        console.log('checkbox all clear!!');
    };

    const filterClear = () => {
      setSelectedPlace(null);
      setSelectedEvalution([]);
    }

    return (
        <div>
            <Helmet>
              <title>Pokemon Progress</title>
            </Helmet>
            <h2>Pokemon Progress</h2>
            <h3>住ポケ数 : {dispPokemonData.length}</h3>
            <Box sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              py: 1,
              mb: 1,
              "&::-webkit-scrollbar": { height: "6px" },
            }}>
                {master.evaluation.map((m) => {
                  const count = dispPokemonData.filter(
                    (p) => p.status?.status_code?.id === m.id
                  ).length;
                  if (count == 0) return;

                  return (
                    <Box
                      key={m.id}
                      sx={{
                        px: 1.2,
                        py: 0.3,
                        borderRadius: "12px",
                        bgcolor: evalColors[m.code],
                        color: m.code === 0 ? "#000" : "#fff",
                        whiteSpace: "nowrap",
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      {m.label}{" "}
                      <span style={{
                          background: "rgba(255,255,255,0.85)",
                          color: "#000",
                          padding: "0 6px",
                          borderRadius: "8px",
                          fontWeight: 900,
                        }}
                      >
                        {count}
                      </span> 匹
                    </Box>
                  );
                })}
            </Box>
            <Box sx={{ mb: 1 }}>
                <MasterSelect
                  className={MASTER_CLASS.PLACE}
                  label="住んでる街"
                  masterCodes={master}
                  value={selectedPlace}
                  onChange={setSelectedPlace}
                />
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <MasterSelect
                      className={MASTER_CLASS.EVALUATION}
                      label="住みごこち"
                      masterCodes={master}
                      value={selectedEvalution}
                      onChange={setSelectedEvalution}
                    />
                    {isFiltering && 
                        (<Chip
                          label="解除"
                          onClick={filterClear}
                          color="secondary"
                          variant="outlined"
                          icon={<ClearIcon />}
                          sx={{
                              ml: 1,
                              fontWeight: "bold",
                              cursor: "pointer",
                              height: 28,
                              flexShrink: 0,
                              marginRight: "15px"
                          }}
                        />)
                    }
                </Box>
            </Box>
            <div className="table-wrapper">
                <table border={1} className={view ? "table-wide" : ""}>
                    <thead>
                    <tr>
                        <th className="checkbox-cell">
                          <button onClick={() => allClear()}></button>
                        </th>
                        <th onClick={() => cycleNameSort()} style={{ cursor: "pointer" }}>
                            なまえ
                            {nameSortMode === "asc" && " ▲"}
                            {nameSortMode === "desc" && " ▼"}
                        </th>
                        <th>住んでる街</th>
                        <th onClick={() => sortStatus()}>
                            住みごこち
                            {sortMode === "asc" && " ▲"}
                            {sortMode === "desc" && " ▼"}
                        </th>
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
                            <select
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

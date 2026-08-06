// /pocoapoke/src/pages/PokemonList.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { MasterSelect } from "../components/MasterSelect";
import { MASTER_CLASS } from "../constants";
import { useMasterCodes } from "../api/useMasterCodes";

export default function PokemonList() {
    type Pokemon = {
      id: number;
      category: string;
      number: number | null;
      local_number: number | null;
      name: string;
      specialty1: Master | null;
      specialty2: Master | null;
      environment: Master | null;
      favorites: Master[] | null;
      created_at: string;
      updated_at: string | null;
    };

    type NameSortMode = "none" | "reverse" | "asc" | "desc";

    const { data: masterCodes, isLoading } = useMasterCodes();
    const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
    const [dispPokemonData, setDispPokemonData] = useState<Pokemon[]>([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
    const [selectedEnvironment, setSelectedEnvironment] = useState<number | null>(null);
    const [selectedFavorite, setSelectedFavorite] = useState<number | null>(null);
    const [nameSortMode, setNameSortMode] = useState<NameSortMode>("none");

    const cycleNameSort = () => {
      setNameSortMode((prev) => {
        if (prev === "none") return "reverse";
        if (prev === "reverse") return "asc";
        if (prev === "asc") return "desc";
        return "none";
      });
    };

    const navigate = useNavigate();

    const matchSpecialty = (pokemon: Pokemon) =>
      selectedSpecialty == null ||
      [pokemon.specialty1, pokemon.specialty2]
        .filter(Boolean)
        .some((s) => s!.id === selectedSpecialty);

    const matchEnvironment = (pokemon: Pokemon) =>
      selectedEnvironment == null ||
      pokemon.environment?.id === selectedEnvironment;

    const matchFavorite = (pokemon: Pokemon) =>
      selectedFavorite == null ||
      pokemon.favorites.some((f) => f.id === selectedFavorite);

    useEffect(() => {
      api.get('/api/getPokemonData')
        .then((json) => {
            console.log(json);
            setPokemonData(json.pokemon);
            setDispPokemonData(json.pokemon);
          })
        .catch(console.error);
    }, []);

    // フィルタリング・ソート
    useEffect(() => {
      let list = pokemonData.filter((p) =>
        matchSpecialty(p) &&
        matchEnvironment(p) &&
        matchFavorite(p)
      );

      if (nameSortMode === "reverse") {
        list = [...list].reverse();
      } else if (nameSortMode === "asc") {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ja"));
      } else if (nameSortMode === "desc") {
        list = [...list].sort((a, b) => b.name.localeCompare(a.name, "ja"));
      }

      setDispPokemonData(list);
    }, [selectedSpecialty, selectedEnvironment, selectedFavorite, pokemonData, nameSortMode]);

    if (isLoading || !masterCodes) return <div>Loading...</div>;

    return (
      <div>
        <Helmet>
          <title>Pokemon List</title>
        </Helmet>
        <h2>Pokemon List</h2>
          <div className="table-wrapper">
            <table border={1} className="table-wide">
              <thead>
                <tr>
                  <th>No.</th>
                  <th onClick={cycleNameSort} style={{ cursor: "pointer" }}>
                    なまえ
                    {nameSortMode === "asc" && " ▲"}
                    {nameSortMode === "desc" && " ▼"}
                  </th>
                  <th>得意なこと1</th>
                  <th>得意なこと2</th>
                  <th>好きな環境</th>
                  <th colSpan={6}>好きなもの</th>
                </tr>
              </thead>
              <tbody>
                {dispPokemonData.map((p) => (
                  <tr key={p.id}>
                    <td>{p.number ?? `${p.category.toUpperCase()}${p.local_number ?? ""}`}</td>
                    <td>{p.name}</td>
                    <td>{p.specialty1?.label}</td>
                    <td>{p.specialty2?.label}</td>
                    <td>{p.environment?.label}</td>
                    {p.favorites.map((fav, i) => (
                      <td key={i}>{fav?.label}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
        
        <MasterSelect
          className={MASTER_CLASS.SPECIALTY}
          label="得意なこと"
          masterCodes={masterCodes}
          value={selectedSpecialty}
          onChange={setSelectedSpecialty}
        />
        <MasterSelect
          className={MASTER_CLASS.ENVIRONMENT}
          label="好きな環境"
          masterCodes={masterCodes}
          value={selectedEnvironment}
          onChange={setSelectedEnvironment}
        />
        <MasterSelect
          className={MASTER_CLASS.FAVORITE}
          label="好きなもの"
          masterCodes={masterCodes}
          value={selectedFavorite}
          onChange={setSelectedFavorite}
        />
        {/* スクロールボタン */}
        <div className="scroll-buttons">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            ▲
          </button>
          <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
            ▼
          </button>
        </div>
      </div>
    );
}
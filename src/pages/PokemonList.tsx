// /pocoapoke/src/pages/PokemonList.tsx
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { MasterSelect } from "../components/MasterSelect";
import { MASTER_CLASS } from "../constants";
import { useMasterCodes } from "../api/useMasterCodes";

export default function PokemonList() {
    type Pokemon = {
      id: number;
      number: number;
      name: string;
      specialty1: { id: number; label: string } | null;
      specialty2: { id: number; label: string } | null;
      environment: { id: number; label: string } | null;
      favorites: { id: number; label: string }[];
      created_at: string;
      updated_at: string | null;
    };

    // type MasterItem = {
    //   id: number;
    //   code: number;
    //   label: string;
    // }
    // type Master = Record<string, MasterItem[]>;

    const { data: masterCodes, isLoading } = useMasterCodes();

    const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
    const [dispPokemonData, setDispPokemonData] = useState<Pokemon[]>([]);
    // const [masterCodes, setMasterCodes] = useState<Master>({});
    const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
    const [selectedEnvironment, setSelectedEnvironment] = useState<number | null>(null);
    const [selectedFavorite, setSelectedFavorite] = useState<number | null>(null);

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

    // フィルタリング
    useEffect(() => {
      setDispPokemonData(
        pokemonData.filter((p) =>
          matchSpecialty(p) &&
          matchEnvironment(p) &&
          matchFavorite(p)
        )
      );
    }, [selectedSpecialty, selectedEnvironment, selectedFavorite, pokemonData]);

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
                  <th>なまえ</th>
                  <th>得意なこと1</th>
                  <th>得意なこと2</th>
                  <th>好きな環境</th>
                  <th colSpan={6}>好きなもの</th>
                </tr>
              </thead>
              <tbody>
                {dispPokemonData.map((p) => (
                  <tr key={p.id}>
                    <td>{p.number}</td>
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
        
        <Box
          sx={{
              mb: 2,
              maxHeight: 140,          // ← 少し余裕を持たせる
              overflowY: "auto",
              borderRadius: 1,
              border: "1px solid #ddd",
              p: 1,
              bgcolor: "#ffffff",
              display: "flex",
              alignItems: "flex-start", // ← スクロールバーが上に寄らない
          }}
        >
          <MasterSelect
            className={MASTER_CLASS.SPECIALTY}
            label="得意なこと"
            masterCodes={masterCodes}
            value={selectedSpecialty}
            onChange={setSelectedSpecialty}
          />
        </Box>
        <Box
          sx={{
              mb: 2,
              maxHeight: 140,          // ← 少し余裕を持たせる
              overflowY: "auto",
              borderRadius: 1,
              border: "1px solid #ddd",
              p: 1,
              bgcolor: "#ffffff",
              display: "flex",
              alignItems: "flex-start", // ← スクロールバーが上に寄らない
          }}
        >
          <MasterSelect
            className={MASTER_CLASS.ENVIRONMENT}
            label="好きな環境"
            masterCodes={masterCodes}
            value={selectedEnvironment}
            onChange={setSelectedEnvironment}
          />
        </Box>
        <MasterSelect
          className={MASTER_CLASS.FAVORITE}
          label="好きなもの"
          masterCodes={masterCodes}
          value={selectedFavorite}
          onChange={setSelectedFavorite}
        />
        <div className="scroll-buttons">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            ↑
          </button>
          <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
            ↓
          </button>
        </div>
      </div>
    );
}
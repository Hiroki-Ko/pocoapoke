// /pocoapoke/src/pages/PokemonRegister.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Chip, Stack, Typography } from "@mui/material";
import { MASTER_CLASS } from "../constants";
import { MasterSelect } from "../components/MasterSelect";
import { useMasterCodes } from "../api/useMasterCodes";
import { useNextNumber } from "../api/useNextNumber";

// type Props = {
//     masterCodes: Record<string, { id: number; code: number; label: string }[]>;
//     value: number | null;
//     onChange: (value: number | null) => void;
// }

export default function PokemonRegister () {
  const { data: masterCodes, isLoading } = useMasterCodes();
  const { data: nextNumberData } = useNextNumber();
  const nextNumber = nextNumberData?.next ?? null;

  const [number, setNumber] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [specialty1, setSpecialty1] = useState<number | null>(null);
  const [specialty2, setSpecialty2] = useState<number | null>(null);
  const [environment, setEnvironment] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const navigate = useNavigate();

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (isLoading || !masterCodes) return <div>Loading...</div>;

  const specialtyItems = masterCodes[MASTER_CLASS.SPECIALTY] ?? [];
  const environmentItems = masterCodes[MASTER_CLASS.ENVIRONMENT] ?? [];
  const favoriteItems = masterCodes[MASTER_CLASS.FAVORITE] ?? [];

  const handleSubmit = async () => {
    const payload = {
      number: 1, // TODO: 本当は入力 or 自動採番
      name,
      specialty1,
      specialty2,
      environment,
      favorites, // [1, 5, 7] のような id 配列
    };
    const res = await fetch("/registerPokemon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    console.log("register result:", json);
  };

  return (
    <div>
      <h2>Register Pokemon</h2>
      <Typography variant="subtitle1">番号</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {nextNumber && (
          <Chip
            label={nextNumber}
            color={number === nextNumber ? "primary" : "default"}
            onClick={() => setNumber(nextNumber)}
          />
        )}
      </Stack>

      <TextField
        label="なまえ"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Typography variant="subtitle1">得意なこと1</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {specialtyItems.map((m) => (
          <Chip
            key={m.id}
            label={m.label}
            color={specialty1 === m.id ? "primary" : "default"}
            variant={specialty1 === m.id ? "filled" : "outlined"}
            onClick={() => setSpecialty1(specialty1 === m.id ? null : m.id)}
          />
        ))}
      </Stack>

      <Typography variant="subtitle1">得意なこと2</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {specialtyItems.map((m) => (
          <Chip
            key={m.id}
            label={m.label}
            color={specialty2 === m.id ? "primary" : "default"}
            variant={specialty2 === m.id ? "filled" : "outlined"}
            onClick={() => setSpecialty2(specialty2 === m.id ? null : m.id)}
          />
        ))}
      </Stack>

      <Typography variant="subtitle1">好きな環境</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {environmentItems.map((m) => (
          <Chip
            key={m.id}
            label={m.label}
            color={environment === m.id ? "primary" : "default"}
            variant={environment === m.id ? "filled" : "outlined"}
            onClick={() => setEnvironment(environment === m.id ? null : m.id)}
          />
        ))}
      </Stack>

      <Typography variant="subtitle1">好きなもの</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {favoriteItems.map((m) => (
          <Chip
            key={m.id}
            label={m.label}
            color={favorites.includes(m.id) ? "primary" : "default"}
            variant={favorites.includes(m.id) ? "filled" : "outlined"}
            onClick={() => toggleFavorite(m.id)}
          />
        ))}
      </Stack>

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
        登録
      </Button>
      <button onClick={() => navigate("/")}>list</button>
    </div>
  );
}
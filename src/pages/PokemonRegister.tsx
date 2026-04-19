// /pocoapoke/src/pages/PokemonRegister.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Chip, Stack, Typography } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import { MASTER_CLASS } from "../constants";
import { useMasterCodes } from "../api/useMasterCodes";
import { useNextNumber } from "../api/useNextNumber";

export default function PokemonRegister () {
  const { data: masterCodes, isLoading } = useMasterCodes();
  const { data: nextNumberData, refetch: refetchNextNumber } = useNextNumber();
  const nextNumber = nextNumberData?.next ?? null;

  const [number, setNumber] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [specialty1, setSpecialty1] = useState<number | null>(null);
  const [specialty2, setSpecialty2] = useState<number | null>(null);
  const [environment, setEnvironment] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isManual, setIsManual] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
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

  // resetボタン押下
  const resetChoices = () => {
    console.log(nextNumber);
    setNumber(nextNumber);
    setName("");
    setSpecialty1(null);
    setSpecialty2(null);
    setEnvironment(null);
    setFavorites([]);
  };
  // Chip をクリックしたとき
  const handleChipClick = () => {
    // Chip を選択 → 手入力モード OFF
    setIsManual(false);
    setNumber(nextNumber);
  };

  // Chip の選択解除（＝手入力モードへ）
  const handleChipUnselect = () => {
    setIsManual(true);
    setNumber(null);
  };

  const handleSubmit = async () => {
    // バリデーション
    if (typeof number !== "number" || isNaN(number)) {
      alert("番号は数値で入力してください");
      
      // manual_number を空にする
      const input = document.getElementById("manual_number") as HTMLInputElement;
      if (input) input.value = "";

      // Chip の値に戻す
      setNumber(nextNumber);

      return;
    }
    const payload = {
      number: number,
      name,
      specialty1,
      specialty2,
      environment,
      favorites, // [1, 5, 7] のような id 配列
    };
    const res = await fetch("/api/registerPokemon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    // console.log("register result:", json);
    if (json.success) {
      await refetchNextNumber();  // numberの更新
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    console.log(nextNumber);
    if (nextNumber && number === null) {
      setNumber(nextNumber)
    }
    if (openSnackbar) {
      resetChoices();
    }
  }, [nextNumber]);

  return (
    <div>
      <h2>Register Pokemon</h2>
      <Typography variant="subtitle1">番号</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {nextNumber && (
          <Chip
            label={nextNumber}
            color={number === nextNumber ? "primary" : "default"}
            onClick={() => {
              if (isManual) {
                // 手入力モード → Chip を選択し直す
                handleChipClick();
              } else {
                // Chip モード → Chip を解除して手入力へ
                handleChipUnselect();
              }
            }}
          />
        )}
        {/* 手入力モードのときだけ表示 */}
        {isManual && (
            <TextField
              id="manual_number"
              label="番号"
              value={number ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setNumber(null);
                  return;
                }
                // 数値に変換
                const num = Number(value);
                setNumber(isNaN(num) ? null : num);
              }}>
            </TextField>
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
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, width: "100%" }}>
        {specialtyItems.map((m) => (
          <Chip
            key={m.id}
            label={m.label}
            color={specialty1 === m.id ? "primary" : "default"}
            variant={specialty1 === m.id ? "filled" : "outlined"}
            onClick={() => setSpecialty1(specialty1 === m.id ? null : m.id)}
            sx={{
              backgroundColor: specialty1 === m.id ? "#1976d2" : "#fff",
              color: specialty1 === m.id ? "#fff" : "#000",
              borderColor: "#ccc",
              "&:hover": {
                backgroundColor: specialty1 === m.id ? "#115293" : "#f0f0f0",
              }
            }}
          />
        ))}
      </Stack>

      <Typography variant="subtitle1">得意なこと2</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, width: "100%" }}>
        {specialtyItems.map((m) => (
          <Chip
            key={m.id}
            label={m.label}
            color={specialty2 === m.id ? "primary" : "default"}
            variant={specialty2 === m.id ? "filled" : "outlined"}
            onClick={() => setSpecialty2(specialty2 === m.id ? null : m.id)}
            sx={{
              backgroundColor: specialty1 === m.id ? "#1976d2" : "#fff",
              color: specialty1 === m.id ? "#fff" : "#000",
              borderColor: "#ccc",
              "&:hover": {
                backgroundColor: specialty1 === m.id ? "#115293" : "#f0f0f0",
              }
            }}
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
            sx={{
              backgroundColor: specialty1 === m.id ? "#1976d2" : "#fff",
              color: specialty1 === m.id ? "#fff" : "#000",
              borderColor: "#ccc",
              "&:hover": {
                backgroundColor: specialty1 === m.id ? "#115293" : "#f0f0f0",
              }
            }}
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
            sx={{
              backgroundColor: specialty1 === m.id ? "#1976d2" : "#fff",
              color: specialty1 === m.id ? "#fff" : "#000",
              borderColor: "#ccc",
              "&:hover": {
                backgroundColor: specialty1 === m.id ? "#115293" : "#f0f0f0",
              }
            }}
          />
        ))}
      </Stack>

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
        登録
      </Button>
      <button onClick={() => resetChoices()}>reset</button>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled">
          登録しました！
        </Alert>
      </Snackbar>
    </div>
  );
}

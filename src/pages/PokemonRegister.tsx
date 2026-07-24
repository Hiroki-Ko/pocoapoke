// /pocoapoke/src/pages/PokemonRegister.tsx

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { TextField, Button, Chip, Stack, Typography, Box } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import { MASTER_CLASS } from "../constants";
import { useMasterCodes } from "../api/useMasterCodes";
import { useNextNumber } from "../api/useNextNumber";

export default function PokemonRegister() {
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
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // nextNumber が取得できたら初期値としてセット
  useEffect(() => {
    if (nextNumber !== null && number === null) {
      setNumber(nextNumber);
    }
  }, [nextNumber]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const resetChoices = () => {
    setNumber(nextNumber);
    setName("");
    setSpecialty1(null);
    setSpecialty2(null);
    setEnvironment(null);
    setFavorites([]);
    setIsManual(false);
  };

  const handleChipClick = () => {
    setIsManual(false);
    setNumber(nextNumber);
  };

  const handleChipUnselect = () => {
    setIsManual(true);
    setNumber(null);
  };

  const handleSubmit = async () => {
    // クライアントサイドバリデーション
    if (typeof number !== "number" || isNaN(number)) {
      setErrorMessage("番号は数値で入力してください");
      setNumber(nextNumber);
      setIsManual(false);
      return;
    }
    if (!name.trim()) {
      setErrorMessage("名前は必須です");
      return;
    }
    if (!specialty1) {
      setErrorMessage("得意なこと1は必須です");
      return;
    }
    if (!environment) {
      setErrorMessage("好きな環境は必須です");
      return;
    }

    const payload = {
      category: "main",
      number,
      localNumber: null,
      name,
      specialty1,
      specialty2,
      environment,
      favorites,
    };

    const res = await fetch("/api/registerPokemon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.success) {
      await refetchNextNumber();
      setSuccessMessage(true);
      resetChoices();
    } else {
      setErrorMessage(json.error ?? "登録に失敗しました");
    }
  };

  if (isLoading || !masterCodes) return <div>Loading...</div>;

  const specialtyItems = masterCodes[MASTER_CLASS.SPECIALTY] ?? [];
  const environmentItems = masterCodes[MASTER_CLASS.ENVIRONMENT] ?? [];
  const favoriteItems = masterCodes[MASTER_CLASS.FAVORITE] ?? [];

  return (
    <div>
      <Helmet>
        <title>Register Pokemon</title>
      </Helmet>
      <h2>Register Pokemon</h2>

      {/* 番号 */}
      <div>
        <Typography variant="subtitle1">番号</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
          {nextNumber && (
            <Chip
              label={nextNumber}
              color={number === nextNumber ? "primary" : "default"}
              onClick={() => {
                if (isManual) {
                  handleChipClick();
                } else {
                  handleChipUnselect();
                }
              }}
            />
          )}
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
                const num = Number(value);
                setNumber(isNaN(num) ? null : num);
              }}
            />
          )}
        </Stack>
      </div>

      {/* なまえ */}
      <TextField
        label="なまえ"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* 得意なこと1 */}
      <Typography variant="subtitle1">得意なこと1</Typography>
      <Box sx={{ mb: 2, maxHeight: 140, overflowY: "auto", borderRadius: 1, border: "1px solid #ddd", p: 1, bgcolor: "#ffffff", display: "flex", alignItems: "flex-start" }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ width: "100%" }}>
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
                "&:hover": { backgroundColor: specialty1 === m.id ? "#115293" : "#f0f0f0" },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* 得意なこと2 */}
      <Typography variant="subtitle1">得意なこと2</Typography>
      <Box sx={{ mb: 2, maxHeight: 140, overflowY: "auto", borderRadius: 1, border: "1px solid #ddd", p: 1, bgcolor: "#ffffff", display: "flex", alignItems: "flex-start" }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ width: "100%" }}>
          {specialtyItems.map((m) => (
            <Chip
              key={m.id}
              label={m.label}
              color={specialty2 === m.id ? "primary" : "default"}
              variant={specialty2 === m.id ? "filled" : "outlined"}
              onClick={() => setSpecialty2(specialty2 === m.id ? null : m.id)}
              sx={{
                backgroundColor: specialty2 === m.id ? "#1976d2" : "#fff",
                color: specialty2 === m.id ? "#fff" : "#000",
                borderColor: "#ccc",
                "&:hover": { backgroundColor: specialty2 === m.id ? "#115293" : "#f0f0f0" },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* 好きな環境 */}
      <Typography variant="subtitle1">好きな環境</Typography>
      <Box sx={{ mb: 2, maxHeight: 140, overflowY: "auto", borderRadius: 1, border: "1px solid #ddd", p: 1, bgcolor: "#ffffff", display: "flex", alignItems: "flex-start" }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ width: "100%" }}>
          {environmentItems.map((m) => (
            <Chip
              key={m.id}
              label={m.label}
              color={environment === m.id ? "primary" : "default"}
              variant={environment === m.id ? "filled" : "outlined"}
              onClick={() => setEnvironment(environment === m.id ? null : m.id)}
              sx={{
                backgroundColor: environment === m.id ? "#1976d2" : "#fff",
                color: environment === m.id ? "#fff" : "#000",
                borderColor: "#ccc",
                "&:hover": { backgroundColor: environment === m.id ? "#115293" : "#f0f0f0" },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* 好きなもの */}
      <Typography variant="subtitle1">好きなもの</Typography>
      <Box sx={{ mb: 2, maxHeight: 140, overflowY: "auto", borderRadius: 1, border: "1px solid #ddd", p: 1, bgcolor: "#ffffff", display: "flex", alignItems: "flex-start" }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
          {favoriteItems.map((m) => (
            <Chip
              key={m.id}
              label={m.label}
              color={favorites.includes(m.id) ? "primary" : "default"}
              variant={favorites.includes(m.id) ? "filled" : "outlined"}
              onClick={() => toggleFavorite(m.id)}
              sx={{
                backgroundColor: favorites.includes(m.id) ? "#1976d2" : "#fff",
                color: favorites.includes(m.id) ? "#fff" : "#000",
                borderColor: "#ccc",
                "&:hover": { backgroundColor: favorites.includes(m.id) ? "#115293" : "#f0f0f0" },
              }}
            />
          ))}
        </Stack>
      </Box>

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
        登録
      </Button>
      <Button sx={{ mt: 2, ml: 1 }} onClick={resetChoices}>
        リセット
      </Button>

      {/* 成功メッセージ */}
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled">
          登録しました！
        </Alert>
      </Snackbar>

      {/* エラーメッセージ */}
      <Snackbar
        open={errorMessage !== null}
        autoHideDuration={4000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

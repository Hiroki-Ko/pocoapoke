// /pocoapoke/src/pages/PokemonRegister.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { TextField, Button, Chip, Stack, Typography, Box } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import { MASTER_CLASS, POKEMON_CATEGORY, type PokemonCategory } from "../constants";
import { useMasterCodes } from "../api/useMasterCodes";
import { useNextNumber } from "../api/useNextNumber";
import { useNextLocalNumber } from "../api/useNextLocalNumber";

const CATEGORY_OPTIONS: { value: PokemonCategory; label: string }[] = [
  { value: POKEMON_CATEGORY.DLC, label: "DLC" },
  { value: POKEMON_CATEGORY.EX, label: "EX" },
  { value: POKEMON_CATEGORY.MAIN, label: "本編" },
];

// 好きなもの: 五味(あまい〜にがい, code1-5)は favorite6 専用、それ以外(code6+)は favorite1-5
const TASTE_CODE_MIN = 1;
const TASTE_CODE_MAX = 5;

// フィールドの区切りはタイトル行全体への薄い色付けで表現する（枠線は使わない）
const sectionTitleSx = {
  display: "block",
  width: "100%",
  bgcolor: "#eef2f7",
  px: 1.5,
  py: 1,
  borderRadius: 1,
  mb: 1,
};

// 編集時に読み込んだ元データ（リセット・カテゴリ戻し用）
type LoadedPokemon = {
  id: number;
  category: PokemonCategory;
  number: number | null;
  local_number: number | null;
  name: string;
  specialty1: number;
  specialty2: number | null;
  environment: number;
  favorite1: number | null;
  favorite2: number | null;
  favorite3: number | null;
  favorite4: number | null;
  favorite5: number | null;
  favorite6: number | null;
};

export default function PokemonRegister() {
  const { data: masterCodes, isLoading } = useMasterCodes();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // /edit/:id で開かれた場合は編集モード
  const { id: idParam } = useParams();
  const editId = idParam ? Number(idParam) : null;
  const isEdit = editId !== null;
  const [original, setOriginal] = useState<LoadedPokemon | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 今後基本的に main を選ぶことは想定していないため初期値は dlc
  const [category, setCategory] = useState<PokemonCategory>(POKEMON_CATEGORY.DLC);

  const { data: nextNumberData, refetch: refetchNextNumber } = useNextNumber();
  const nextNumber = nextNumberData?.next ?? null;
  const { data: nextLocalNumberData, refetch: refetchNextLocalNumber } = useNextLocalNumber(category);
  const nextLocalNumber = nextLocalNumberData?.next ?? null;

  const [number, setNumber] = useState<number | null>(null);
  const [localNumber, setLocalNumber] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [specialty1, setSpecialty1] = useState<number | null>(null);
  const [specialty2, setSpecialty2] = useState<number | null>(null);
  const [environment, setEnvironment] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]); // 五味以外の好きなもの（最大5件、favorite1-5）
  const [taste, setTaste] = useState<number | null>(null); // 五味（favorite6）
  const [isManual, setIsManual] = useState(false);
  const [isManualLocal, setIsManualLocal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMain = category === POKEMON_CATEGORY.MAIN;

  // nextNumber が取得できたら初期値としてセット（本編のみ）
  useEffect(() => {
    if (isMain && !isManual && nextNumber !== null && number === null) {
      setNumber(nextNumber);
    }
  }, [nextNumber, isMain]);

  // nextLocalNumber が取得できたら初期値としてセット（EX/DLCのみ）
  useEffect(() => {
    if (!isMain && !isManualLocal && nextLocalNumber !== null && localNumber === null) {
      setLocalNumber(nextLocalNumber);
    }
  }, [nextLocalNumber, isMain]);

  // 読み込んだデータをフォームに反映する
  const applyOriginal = (p: LoadedPokemon) => {
    setCategory(p.category);
    // 編集時は番号をテキストボックスで表示（既存の番号を保持するため）
    setIsManual(p.category === POKEMON_CATEGORY.MAIN);
    setIsManualLocal(p.category !== POKEMON_CATEGORY.MAIN);
    setNumber(p.number);
    setLocalNumber(p.local_number);
    setName(p.name);
    setSpecialty1(p.specialty1);
    setSpecialty2(p.specialty2);
    setEnvironment(p.environment);
    setFavorites(
      [p.favorite1, p.favorite2, p.favorite3, p.favorite4, p.favorite5].filter(
        (v): v is number => v != null
      )
    );
    setTaste(p.favorite6);
  };

  // 編集モード: 対象ポケモンを取得
  useEffect(() => {
    if (!isEdit) return;
    if (!Number.isInteger(editId) || editId! <= 0) {
      setLoadError("IDが不正です");
      return;
    }
    let cancelled = false;
    fetch(`/api/getPokemon?id=${editId}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setOriginal(json.pokemon);
          applyOriginal(json.pokemon);
        } else {
          setLoadError(json.error ?? "読み込みに失敗しました");
        }
      })
      .catch(() => !cancelled && setLoadError("読み込みに失敗しました"));
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev; // favorite1-5 の5枠まで
      return [...prev, id];
    });
  };

  const toggleTaste = (id: number) => {
    setTaste((prev) => (prev === id ? null : id));
  };

  const handleCategoryChange = (next: PokemonCategory) => {
    // 編集中に元のカテゴリへ戻した場合は元の番号を復元する
    if (isEdit && original && next === original.category) {
      setCategory(next);
      setIsManual(next === POKEMON_CATEGORY.MAIN);
      setIsManualLocal(next !== POKEMON_CATEGORY.MAIN);
      setNumber(original.number);
      setLocalNumber(original.local_number);
      return;
    }
    setCategory(next);
    setIsManual(false);
    setIsManualLocal(false);
    setNumber(null);
    setLocalNumber(null);
  };

  const resetChoices = () => {
    // 編集モードでは読み込んだ値に戻す
    if (isEdit) {
      if (original) applyOriginal(original);
      return;
    }
    setName("");
    setSpecialty1(null);
    setSpecialty2(null);
    setEnvironment(null);
    setFavorites([]);
    setTaste(null);
    setIsManual(false);
    setIsManualLocal(false);
    setNumber(isMain ? nextNumber : null);
    setLocalNumber(isMain ? null : nextLocalNumber);
  };

  const handleChipUnselect = () => {
    setIsManual(true);
    setNumber(null);
  };

  const handleLocalChipUnselect = () => {
    setIsManualLocal(true);
    setLocalNumber(null);
  };

  // 番号タイトルクリックでテキストボックス→ボタンに戻す
  const handleNumberTitleClick = () => {
    if (isMain) {
      if (isManual) {
        setIsManual(false);
        setNumber(nextNumber);
      }
    } else if (isManualLocal) {
      setIsManualLocal(false);
      setLocalNumber(nextLocalNumber);
    }
  };

  const handleSubmit = async () => {
    // クライアントサイドバリデーション
    if (isMain) {
      if (typeof number !== "number" || isNaN(number)) {
        setErrorMessage("番号は数値で入力してください");
        setNumber(nextNumber);
        setIsManual(false);
        return;
      }
    } else {
      if (typeof localNumber !== "number" || isNaN(localNumber)) {
        setErrorMessage("番号(ローカル)は数値で入力してください");
        setLocalNumber(nextLocalNumber);
        setIsManualLocal(false);
        return;
      }
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

    // favorite1-5: 五味以外の好きなもの（不足分はnullで埋める） / favorite6: 五味
    const favoritesSlots: (number | null)[] = [...favorites];
    while (favoritesSlots.length < 5) favoritesSlots.push(null);
    favoritesSlots.push(taste);

    const payload = {
      ...(isEdit ? { id: editId } : {}),
      category,
      number: isMain ? number : null,
      localNumber: isMain ? null : localNumber,
      name,
      specialty1,
      specialty2,
      environment,
      favorites: favoritesSlots,
    };

    const res = await fetch(isEdit ? "/api/updatePokemon" : "/api/registerPokemon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.success && isEdit) {
      // 一覧・採番のキャッシュを破棄して最新を取り直させる
      queryClient.invalidateQueries({ queryKey: ["pokemonData"] });
      queryClient.invalidateQueries({ queryKey: ["nextNumber"] });
      queryClient.invalidateQueries({ queryKey: ["nextLocalNumber"] });
      setOriginal({
        ...(original as LoadedPokemon),
        category,
        number: isMain ? number : null,
        local_number: isMain ? null : localNumber,
        name: name.trim(),
        specialty1: specialty1!,
        specialty2,
        environment: environment!,
        favorite1: favoritesSlots[0],
        favorite2: favoritesSlots[1],
        favorite3: favoritesSlots[2],
        favorite4: favoritesSlots[3],
        favorite5: favoritesSlots[4],
        favorite6: favoritesSlots[5],
      });
      setSuccessMessage(true);
    } else if (json.success) {
      if (isMain) {
        await refetchNextNumber();
      } else {
        await refetchNextLocalNumber();
      }
      setSuccessMessage(true);
      resetChoices();
    } else {
      setErrorMessage(json.error ?? (isEdit ? "更新に失敗しました" : "登録に失敗しました"));
    }
  };

  if (loadError) {
    return (
      <div>
        <p>{loadError}</p>
        <Button onClick={() => navigate("/")}>一覧に戻る</Button>
      </div>
    );
  }
  if (isLoading || !masterCodes || (isEdit && !original)) return <div>Loading...</div>;

  const specialtyItems = masterCodes[MASTER_CLASS.SPECIALTY] ?? [];
  const specialty1Items = specialtyItems.filter((m) => m.code !== 0); // 得意なこと1に「なし」は不要
  const environmentItems = masterCodes[MASTER_CLASS.ENVIRONMENT] ?? [];
  const allFavoriteItems = masterCodes[MASTER_CLASS.FAVORITE] ?? [];
  const tasteItems = allFavoriteItems.filter((m) => m.code >= TASTE_CODE_MIN && m.code <= TASTE_CODE_MAX);
  const otherFavoriteItems = allFavoriteItems.filter((m) => m.code > TASTE_CODE_MAX);

  return (
    <div>
      <Helmet>
        <title>{isEdit ? "Edit Pokemon" : "Register Pokemon"}</title>
      </Helmet>
      <h2>{isEdit ? `Edit Pokemon（${original?.name}）` : "Register Pokemon"}</h2>

      {/* カテゴリ / 番号 / なまえ */}
      <Box sx={{ mb: 3 }}>
        <Box sx={sectionTitleSx}>
          <Box sx={{ display: "grid", gridTemplateColumns: "190px 120px 220px", columnGap: "32px" }}>
            <Typography variant="subtitle1">カテゴリ</Typography>
            <Typography
              variant="subtitle1"
              onClick={handleNumberTitleClick}
              sx={{ textAlign: "center", cursor: (isManual || isManualLocal) ? "pointer" : "default" }}
            >
              番号
            </Typography>
            <Typography variant="subtitle1" sx={{ textAlign: "center" }}>なまえ</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "190px 120px 220px", columnGap: "32px", alignItems: "center", px: 1.5 }}>
          {/* カテゴリ */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            {CATEGORY_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                color={category === opt.value ? "primary" : "default"}
                variant={category === opt.value ? "filled" : "outlined"}
                onClick={() => handleCategoryChange(opt.value)}
              />
            ))}
          </Stack>

          {/* 番号 */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "center" }}>
            {isMain ? (
              !isManual ? (
                nextNumber && (
                  <Chip
                    label={nextNumber}
                    color={number === nextNumber ? "primary" : "default"}
                    onClick={handleChipUnselect}
                  />
                )
              ) : (
                <TextField
                  id="manual_number"
                  size="small"
                  sx={{ width: 100 }}
                  slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }}
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
              )
            ) : !isManualLocal ? (
              nextLocalNumber && (
                <Chip
                  label={nextLocalNumber}
                  color={localNumber === nextLocalNumber ? "primary" : "default"}
                  onClick={handleLocalChipUnselect}
                />
              )
            ) : (
              <TextField
                id="manual_local_number"
                size="small"
                sx={{ width: 100 }}
                slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }}
                value={localNumber ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setLocalNumber(null);
                    return;
                  }
                  const num = Number(value);
                  setLocalNumber(isNaN(num) ? null : num);
                }}
              />
            )}
          </Stack>

          {/* なまえ */}
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "center" }}>
            <TextField
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Stack>
        </Box>
      </Box>

      {/* 得意なこと1 */}
      <Typography variant="subtitle1" sx={sectionTitleSx}>得意なこと1</Typography>
      <Box sx={{ mb: 2, px: 1.5 }}>
        <Stack direction="row" sx={{ width: "100%", flexWrap: "wrap", gap: 1 }}>
          {specialty1Items.map((m) => (
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
      <Typography variant="subtitle1" sx={sectionTitleSx}>得意なこと2</Typography>
      <Box sx={{ mb: 2, px: 1.5 }}>
        <Stack direction="row" sx={{ width: "100%", flexWrap: "wrap", gap: 1 }}>
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
      <Typography variant="subtitle1" sx={sectionTitleSx}>好きな環境</Typography>
      <Box sx={{ mb: 2, px: 1.5 }}>
        <Stack direction="row" sx={{ width: "100%", flexWrap: "wrap", gap: 1 }}>
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

      {/* 好きなもの（五味は favorite6 用に同フィールド内で分けて表示） */}
      <Typography variant="subtitle1" sx={sectionTitleSx}>好きなもの</Typography>
      <Box sx={{ mb: 2, px: 1.5 }}>
        <Stack direction="row" sx={{ width: "100%", flexWrap: "wrap", gap: 1 }}>
          {otherFavoriteItems.map((m) => {
            const selected = favorites.includes(m.id);
            const disabled = !selected && favorites.length >= 5;
            return (
              <Chip
                key={m.id}
                label={m.label}
                color={selected ? "primary" : "default"}
                variant={selected ? "filled" : "outlined"}
                disabled={disabled}
                onClick={() => toggleFavorite(m.id)}
                sx={{
                  backgroundColor: selected ? "#1976d2" : "#fff",
                  color: selected ? "#fff" : "#000",
                  borderColor: "#ccc",
                  "&:hover": { backgroundColor: selected ? "#115293" : "#f0f0f0" },
                }}
              />
            );
          })}
        </Stack>
        <Stack direction="row" sx={{ width: "100%", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {tasteItems.map((m) => (
            <Chip
              key={m.id}
              label={m.label}
              color={taste === m.id ? "primary" : "default"}
              variant={taste === m.id ? "filled" : "outlined"}
              onClick={() => toggleTaste(m.id)}
              sx={{
                backgroundColor: taste === m.id ? "#1976d2" : "#fff",
                color: taste === m.id ? "#fff" : "#000",
                borderColor: "#ccc",
                "&:hover": { backgroundColor: taste === m.id ? "#115293" : "#f0f0f0" },
              }}
            />
          ))}
        </Stack>
      </Box>

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
        {isEdit ? "更新" : "登録"}
      </Button>
      <Button sx={{ mt: 2, ml: 1 }} onClick={resetChoices}>
        リセット
      </Button>
      {isEdit && (
        <Button sx={{ mt: 2, ml: 1 }} onClick={() => navigate("/")}>
          一覧に戻る
        </Button>
      )}

      {/* 成功メッセージ */}
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled">
          {isEdit ? "更新しました！" : "登録しました！"}
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

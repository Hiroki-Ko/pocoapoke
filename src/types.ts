// /pocoapoke/src/types.ts
// /api/getPokemonData が返す形

export type MasterItem = { id: number; code: number; label: string; class: string };
export type Master = Record<string, MasterItem[]>;

export type PokemonStatus = {
  status_code: MasterItem | null;
  place_code: MasterItem | null;
  status_code_id: number | null;
  place_code_id: number | null;
  cared_on: string | null; // ゲーム日付 YYYY-MM-DD
  wish_favorite: MasterItem | null;
  wish_on: string | null; // ゲーム日付 YYYY-MM-DD
};

export type Pokemon = {
  id: number;
  category: string;
  number: number | null;
  local_number: number | null;
  name: string;
  specialty1: MasterItem | null;
  specialty2: MasterItem | null;
  environment: MasterItem | null;
  favorites: MasterItem[];
  favorite_ids: (number | null)[]; // favorite1〜6（6番目が味）
  show_in_progress: 0 | 1;
  status: PokemonStatus | null;
};

export type PokemonData = { pokemon: Pokemon[]; master: Master };

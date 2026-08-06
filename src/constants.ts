// /pocoapoke/src/constants.ts
export const MASTER_CLASS = {
  SPECIALTY: "specialty",
  ENVIRONMENT: "environment",
  FAVORITE: "favorite",
  PLACE: "place",
  EVALUATION: "evaluation",
} as const;

export type MasterClass = (typeof MASTER_CLASS)[keyof typeof MASTER_CLASS];

export const POKEMON_CATEGORY = {
  DLC: "dlc",
  EX: "ex",
  MAIN: "main",
} as const;

export type PokemonCategory = (typeof POKEMON_CATEGORY)[keyof typeof POKEMON_CATEGORY];
